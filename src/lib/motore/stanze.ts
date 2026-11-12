import type { Database } from "../supabase/database.types";
import {
  alberiMassimi,
  CAPIENZA_STANZA,
  isPacchettoConto,
  nomeStanza,
  stanzeSbloccate,
  type Conto,
  type PacchettoConto,
} from "../stanze";
import { db } from "./servizio";

// Stanze e conto della persona, collegati al database (docs/stanze-e-vita.md, sezione 2).
// Le regole sono in src/lib/stanze.ts. Come servizio.ts: scrive con la chiave
// segreta, e chi chiama ha già verificato che la persona è quella collegata.

export type RigaStanza = Database["public"]["Tables"]["rooms"]["Row"];
type RigaConto = Database["public"]["Tables"]["accounts"]["Row"];

export function contoDaRiga(r: RigaConto): Conto {
  return {
    pacchetto: isPacchettoConto(r.package) ? r.package : "albero",
    alberiPiantati: r.trees_planted,
    rinnovi: r.renewals,
  };
}

/** Il conto della persona; se manca (chi c'era prima delle stanze) lo crea con gli alberi che ha. */
export async function caricaConto(ownerId: string): Promise<RigaConto> {
  const { data } = await db().from("accounts").select("*").eq("owner_id", ownerId).maybeSingle();
  if (data) return data;
  const { count } = await db().from("trees").select("id", { count: "exact", head: true }).eq("owner_id", ownerId);
  const { data: nuovo, error } = await db()
    .from("accounts")
    .upsert({ owner_id: ownerId, trees_planted: count ?? 0 }, { onConflict: "owner_id", ignoreDuplicates: false })
    .select("*")
    .single();
  if (error || !nuovo) throw new Error(`Conto non creato: ${error?.message}`);
  return nuovo;
}

/**
 * Apre le stanze che la regola concede e non ci sono ancora. Restituisce le nuove
 * (da festeggiare). Le stanze aperte restano aperte anche se la regola dà meno.
 * `festeggiata`: la stanza 1 di chi pianta il primo albero non ha bisogno di festa.
 */
export async function aggiornaStanze(ownerId: string): Promise<RigaStanza[]> {
  const conto = contoDaRiga(await caricaConto(ownerId));
  const quante = stanzeSbloccate(conto);
  const { data: esistenti } = await db().from("rooms").select("number").eq("owner_id", ownerId);
  const ci = new Set((esistenti ?? []).map((r) => r.number));
  const adesso = new Date().toISOString();
  const mancanti = Array.from({ length: quante }, (_, i) => i + 1)
    .filter((n) => !ci.has(n))
    .map((n) => ({
      owner_id: ownerId,
      number: n,
      name: nomeStanza(n),
      unlocked_at: adesso,
      // Le stanze che c'erano dall'inizio non si festeggiano: solo quelle sbloccate dopo.
      celebrated_at: ci.size === 0 ? adesso : null,
    }));
  if (!mancanti.length) return [];
  const { data, error } = await db()
    .from("rooms")
    .upsert(mancanti, { onConflict: "owner_id,number", ignoreDuplicates: true })
    .select("*");
  if (error) throw new Error(`Stanze non aperte: ${error.message}`);
  return (data ?? []).filter((r) => !r.celebrated_at);
}

async function stanzeConAlberi(ownerId: string) {
  const [{ data: stanze }, { data: alberi }] = await Promise.all([
    db().from("rooms").select("*").eq("owner_id", ownerId).order("number"),
    db().from("trees").select("id, room_id").eq("owner_id", ownerId),
  ]);
  return (stanze ?? []).map((s) => ({ ...s, alberi: (alberi ?? []).filter((a) => a.room_id === s.id).length }));
}

/**
 * Prima della semina: c'è posto per un altro albero? Restituisce la stanza dove
 * andrà (la prima con posto, o quella chiesta se ha posto).
 */
export async function preparaSemina(ownerId: string, stanzaChiesta?: string | null): Promise<{ stanzaId: string }> {
  const conto = contoDaRiga(await caricaConto(ownerId));
  await aggiornaStanze(ownerId);
  const { count } = await db().from("trees").select("id", { count: "exact", head: true }).eq("owner_id", ownerId);
  const massimo = alberiMassimi(conto);
  if ((count ?? 0) >= massimo) {
    throw new Error(
      massimo === 1
        ? "Con il pacchetto Albero c'è posto per un albero solo. Con Famiglia o Foresta ne pianti di più."
        : `Hai già ${count} alberi: il tuo pacchetto ne tiene ${massimo}.`,
    );
  }
  const stanze = await stanzeConAlberi(ownerId);
  const chiesta = stanze.find((s) => s.id === stanzaChiesta && s.alberi < CAPIENZA_STANZA);
  const libera = chiesta ?? stanze.find((s) => s.alberi < CAPIENZA_STANZA);
  if (!libera) throw new Error(`Le stanze sono piene (${CAPIENZA_STANZA} alberi ciascuna): ne serve una nuova.`);
  return { stanzaId: libera.id };
}

/** Dopo la semina: un albero in più nel conto, e le stanze che si aprono di conseguenza. */
export async function dopoLaSemina(ownerId: string): Promise<RigaStanza[]> {
  const conto = await caricaConto(ownerId);
  const { count } = await db().from("trees").select("id", { count: "exact", head: true }).eq("owner_id", ownerId);
  // Chi c'era prima delle stanze ha già il conto con i suoi alberi: non si conta due volte.
  const piantati = Math.max(conto.trees_planted + 1, count ?? 0);
  await db().from("accounts").update({ trees_planted: piantati, updated_at: new Date().toISOString() }).eq("owner_id", ownerId);
  return aggiornaStanze(ownerId);
}

/** Sposta un albero in un'altra stanza della stessa persona, se c'è posto. */
export async function traslocaAlbero(ownerId: string, alberoId: string, stanzaId: string) {
  const [{ data: albero }, stanze] = await Promise.all([
    db().from("trees").select("id, name, room_id").eq("id", alberoId).eq("owner_id", ownerId).maybeSingle(),
    stanzeConAlberi(ownerId),
  ]);
  if (!albero) throw new Error("Questo albero non è tuo.");
  const meta = stanze.find((s) => s.id === stanzaId);
  if (!meta) throw new Error("Questa stanza non è tua, o non è ancora aperta.");
  if (albero.room_id === meta.id) return { albero: albero.name, stanza: meta.name };
  if (meta.alberi >= CAPIENZA_STANZA) throw new Error(`«${meta.name}» è piena: ci stanno ${CAPIENZA_STANZA} alberi.`);
  const { error } = await db().from("trees").update({ room_id: meta.id }).eq("id", albero.id);
  if (error) throw new Error(`Trasloco non riuscito: ${error.message}`);
  return { albero: albero.name, stanza: meta.name };
}

/** Il nome sul cartello della stanza. */
export async function rinominaStanza(ownerId: string, stanzaId: string, nome: string) {
  const pulito = nome.trim().slice(0, 40);
  if (!pulito) throw new Error("Dai un nome alla stanza.");
  const { data, error } = await db().from("rooms").update({ name: pulito }).eq("id", stanzaId).eq("owner_id", ownerId).select("name").maybeSingle();
  if (error || !data) throw new Error("Stanza non trovata.");
  return data.name;
}

/** La festa è stata vista. */
export async function festeggiaStanze(ownerId: string) {
  await db().from("rooms").update({ celebrated_at: new Date().toISOString() }).eq("owner_id", ownerId).is("celebrated_at", null);
}

// ——— Strumenti della demo ———

/** Cambia il pacchetto nuovo (demo, nessun pagamento): può aprire stanze. */
export async function cambiaPacchettoConto(ownerId: string, pacchetto: string): Promise<{ pacchetto: PacchettoConto; nuove: RigaStanza[] }> {
  if (!isPacchettoConto(pacchetto)) throw new Error("Pacchetto sconosciuto.");
  await caricaConto(ownerId);
  const { error } = await db().from("accounts").update({ package: pacchetto, updated_at: new Date().toISOString() }).eq("owner_id", ownerId);
  if (error) throw new Error(`Pacchetto non cambiato: ${error.message}`);
  return { pacchetto, nuove: await aggiornaStanze(ownerId) };
}

/** Simula un rinnovo annuale: una stanza in più (fino a 10) e i semi per nuovi alberi. */
export async function simulaRinnovo(ownerId: string): Promise<{ rinnovi: number; nuove: RigaStanza[] }> {
  const conto = await caricaConto(ownerId);
  const rinnovi = conto.renewals + 1;
  const { error } = await db().from("accounts").update({ renewals: rinnovi, updated_at: new Date().toISOString() }).eq("owner_id", ownerId);
  if (error) throw new Error(`Rinnovo non registrato: ${error.message}`);
  return { rinnovi, nuove: await aggiornaStanze(ownerId) };
}
