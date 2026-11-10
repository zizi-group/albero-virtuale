import type { SupabaseClient } from "@supabase/supabase-js";
import { azione } from "../albero/azioni";
import { regalo as regaloDa, vestiConRegali, type RegaloInUso } from "../albero/regali";
import { posaDelGiorno } from "../albero/scena";
import { stadioDa, stagioneDa, type Cielo, type Meteo } from "../albero/tipi";
import type { MeteoGiorno } from "../meteo";
import { isPacchetto, isPremium, type IdPacchetto } from "../piani";
import type { Database } from "../supabase/database.types";
import { caricaStato, contesto, db, json, salvaEInviaLettera } from "./servizio";
import { scegliIlMeglioDelMese, scriviLetteraRegalo } from "./scritture";

// Gli extra mensili del Premium: il mese dell'albero, il regalo incluso,
// il riepilogo illustrato (e da lì la cartolina). Scrive con la chiave segreta:
// chi chiama deve aver già verificato che l'albero è della persona collegata.
// Le letture per le pagine passano dal client della persona (RLS).

export const GIORNI_DEL_MESE = 30;

export type RigaMese = Database["public"]["Tables"]["tree_months"]["Row"];
type RigaDiario = Database["public"]["Tables"]["diary_entries"]["Row"];
type Client = SupabaseClient<Database>;

export interface RecapMese {
  titolo: string;
  giornoMomento: number;
  didascalia: string;
  frase: string;
  giornoFrase: number;
  /** "ai": scelto dall'albero alla chiusura del mese; "automatico": calcolato dal diario. */
  scelto: "ai" | "automatico";
}

// ——— I mesi ———

/** Il mese in corso: l'ultimo aperto. Gli alberi senza mesi partono dal mese 1. */
export async function meseCorrente(alberoId: string): Promise<RigaMese> {
  const { data } = await db()
    .from("tree_months")
    .select("*")
    .eq("tree_id", alberoId)
    .order("number", { ascending: false })
    .limit(1);
  if (data?.[0]) return data[0];
  const { data: primo, error } = await db()
    .from("tree_months")
    .upsert({ tree_id: alberoId, number: 1, first_day: 0 }, { onConflict: "tree_id,number" })
    .select("*")
    .single();
  if (error || !primo) throw new Error(`Mese non creato: ${error?.message}`);
  return primo;
}

/** Il motore notturno chiude il mese dopo 30 giorni vissuti. */
export function meseFinito(mese: Pick<RigaMese, "first_day">, giorni: number) {
  return giorni - mese.first_day + 1 >= GIORNI_DEL_MESE;
}

/**
 * Chiude il mese in corso e apre il successivo. Per il Premium l'albero sceglie
 * titolo, momento più bello e frase migliore (una chiamata all'AI); per l'Albero
 * il riepilogo si calcola dal diario, senza AI.
 */
export async function apriNuovoMese(alberoId: string) {
  const { riga, stato } = await caricaStato(alberoId);
  const mese = await meseCorrente(alberoId);
  const { data: righe } = await db()
    .from("diary_entries")
    .select("*")
    .eq("tree_id", alberoId)
    .gte("day_number", mese.first_day)
    .lte("day_number", riga.day_count)
    .order("day_number", { ascending: true });
  const pagine = righe ?? [];
  if (pagine.length === 0) {
    throw new Error("Il mese è appena cominciato: fai passare almeno un giorno prima di chiuderlo.");
  }

  // Prima si apre il mese nuovo: se due richieste arrivano insieme, la seconda si ferma qui.
  const { error: errNuovo } = await db()
    .from("tree_months")
    .insert({ tree_id: alberoId, number: mese.number + 1, first_day: riga.day_count + 1 });
  if (errNuovo) throw new Error("Il mese nuovo è già cominciato.");

  let recap = riepilogoAutomatico(mese.number, pagine, riga.name);
  if (isPremium(riga.plan)) {
    try {
      const s = await scegliIlMeglioDelMese(
        stato,
        mese.number,
        pagine.map((p) => ({
          giorno: p.day_number,
          azione: azione(p.action).etichetta,
          testo: p.body,
          meteo: (p.weather as { descrizione?: string } | null)?.descrizione ?? null,
          traguardo: p.milestone,
        })),
      );
      recap = convalida(s, pagine, recap);
    } catch (e) {
      console.error("[linfa] riepilogo del mese scelto in automatico:", e);
    }
  }

  await db()
    .from("tree_months")
    .update({ closed_at: new Date().toISOString(), recap: json(recap) })
    .eq("id", mese.id);

  return { chiuso: mese.number, nuovo: mese.number + 1, titolo: recap.titolo, giorni: pagine.length };
}

/** L'AI sceglie dal diario: si tiene solo quello che esiste davvero nelle pagine. */
function convalida(
  s: Awaited<ReturnType<typeof scegliIlMeglioDelMese>>,
  pagine: RigaDiario[],
  riserva: RecapMese,
): RecapMese {
  const momento = pagine.find((p) => p.day_number === s.giorno_momento);
  const frase = s.frase.trim().replace(/^[«"]|[»"]$/g, "");
  const conLaFrase = pagine.find((p) => normalizza(p.body).includes(normalizza(frase)));
  return {
    titolo: s.titolo.trim().slice(0, 60) || riserva.titolo,
    giornoMomento: momento ? momento.day_number : riserva.giornoMomento,
    didascalia: momento ? s.didascalia_momento.trim().slice(0, 140) : riserva.didascalia,
    frase: conLaFrase && frase.length >= 8 ? frase : riserva.frase,
    giornoFrase: conLaFrase && frase.length >= 8 ? conLaFrase.day_number : riserva.giornoFrase,
    scelto: "ai",
  };
}

const normalizza = (t: string) => t.toLowerCase().replace(/[«»"'’.,;:!?…\s]+/g, " ").trim();

/** Senza AI: il giorno importante più recente (o la pagina più lunga) e la sua prima frase. */
export function riepilogoAutomatico(numero: number, pagine: RigaDiario[], nome: string): RecapMese {
  const traguardi = pagine.filter((p) => p.milestone && p.day_number > 0);
  const lunga = [...pagine].sort((a, b) => b.body.length - a.body.length)[0];
  const momento = traguardi[traguardi.length - 1] ?? lunga;
  const frase = primaFrase(momento.body);
  return {
    titolo: `Il mese ${numero}`,
    giornoMomento: momento.day_number,
    didascalia: `${nome} ${azione(momento.action).etichetta}.`,
    frase,
    giornoFrase: momento.day_number,
    scelto: "automatico",
  };
}

function primaFrase(testo: string) {
  const m = testo.match(/^.+?[.!?…](?=\s|$)/);
  return (m ? m[0] : testo).trim().slice(0, 180);
}

// ——— Il riepilogo del mese, per la pagina e la cartolina ———

export interface ConteggioAzione {
  id: string;
  etichetta: string;
  volte: number;
}

export interface DatiMese {
  mese: RigaMese;
  inCorso: boolean;
  primoGiorno: number;
  ultimoGiorno: number;
  pagine: RigaDiario[];
  recap: RecapMese | null;
  momento: RigaDiario | null;
  azioni: ConteggioAzione[];
  meteo: { cielo: Cielo; giorni: number }[];
  minima: number | null;
  massima: number | null;
  mesi: Pick<RigaMese, "number" | "first_day" | "closed_at">[];
}

/** Tutto quello che serve al riepilogo di un mese, letto con il client della persona. */
export async function datiMese(supabase: Client, alberoId: string, numero: number, nome: string): Promise<DatiMese | null> {
  const { data: mesi } = await supabase
    .from("tree_months")
    .select("*")
    .eq("tree_id", alberoId)
    .order("number", { ascending: true });
  const elenco = mesi ?? [];
  const mese = elenco.find((m) => m.number === numero);
  if (!mese) return null;
  const successivo = elenco.find((m) => m.number === numero + 1);

  let q = supabase.from("diary_entries").select("*").eq("tree_id", alberoId).gte("day_number", mese.first_day);
  if (successivo) q = q.lt("day_number", successivo.first_day);
  const { data } = await q.order("day_number", { ascending: true });
  const pagine = data ?? [];

  const salvato = (mese.recap as RecapMese | null) ?? null;
  const recap = salvato ?? (pagine.length ? riepilogoAutomatico(mese.number, pagine, nome) : null);
  const momento = recap ? (pagine.find((p) => p.day_number === recap.giornoMomento) ?? null) : null;

  const perAzione = new Map<string, number>();
  const perCielo = new Map<Cielo, number>();
  let minima: number | null = null;
  let massima: number | null = null;
  for (const p of pagine) {
    perAzione.set(p.action, (perAzione.get(p.action) ?? 0) + 1);
    const m = p.weather as Partial<MeteoGiorno> | null;
    if (m?.cielo) perCielo.set(m.cielo, (perCielo.get(m.cielo) ?? 0) + 1);
    const basso = m?.minima ?? m?.temperatura;
    const alto = m?.massima ?? m?.temperatura;
    if (typeof basso === "number") minima = minima === null ? basso : Math.min(minima, basso);
    if (typeof alto === "number") massima = massima === null ? alto : Math.max(massima, alto);
  }

  return {
    mese,
    inCorso: !successivo,
    primoGiorno: mese.first_day,
    ultimoGiorno: pagine.length ? pagine[pagine.length - 1].day_number : mese.first_day,
    pagine,
    recap,
    momento,
    azioni: [...perAzione.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, volte]) => ({ id, etichetta: azione(id).etichetta, volte })),
    meteo: [...perCielo.entries()].sort((a, b) => b[1] - a[1]).map(([cielo, giorni]) => ({ cielo, giorni })),
    minima,
    massima,
    mesi: elenco.map((m) => ({ number: m.number, first_day: m.first_day, closed_at: m.closed_at })),
  };
}

/** I regali ricevuti fino a un certo mese (compreso), per vestire l'albero nella scena. */
export async function regaliInUso(supabase: Client, alberoId: string, finoAlMese?: number): Promise<RegaloInUso[]> {
  let q = supabase.from("gifts").select("gift, use, month_number").eq("tree_id", alberoId);
  if (finoAlMese) q = q.lte("month_number", finoAlMese);
  const { data } = await q.order("created_at", { ascending: true });
  return (data ?? []).map((g) => ({ gift: g.gift, use: g.use }));
}

// ——— Il regalo del mese ———

/** La persona fa il regalo del mese: l'albero decide che cosa farne e scrive per ringraziare. */
export async function faiRegaloDelMese(alberoId: string, idRegalo: string) {
  const r = regaloDa(idRegalo);
  if (!r) throw new Error("Questo regalo non è nel catalogo.");
  const { riga, stato } = await caricaStato(alberoId);
  if (!isPremium(riga.plan)) throw new Error("Il regalo del mese è un extra del Premium.");

  const mese = await meseCorrente(alberoId);
  const { data: gia } = await db()
    .from("gifts")
    .select("id")
    .eq("tree_id", alberoId)
    .eq("month_number", mese.number)
    .eq("included", true)
    .maybeSingle();
  if (gia) throw new Error("Il regalo di questo mese l'hai già fatto: il prossimo arriva con il mese nuovo.");

  const ctx = await contesto(alberoId, 6);
  const esito = await scriviLetteraRegalo(stato, r, ctx);

  const { data: dono, error } = await db()
    .from("gifts")
    .insert({
      tree_id: alberoId,
      month_number: mese.number,
      gift: r.id,
      use: esito.uso,
      how: esito.come.trim().slice(0, 140),
    })
    .select("id")
    .single();
  if (error || !dono) throw new Error("Il regalo di questo mese l'hai già fatto.");

  const lettera = await salvaEInviaLettera(riga, "regalo", esito.oggetto, esito.testo);
  await db().from("gifts").update({ letter_id: lettera.id }).eq("id", dono.id);

  const biografia = [...stato.biografia, { giorno: riga.day_count, testo: esito.fatto_da_ricordare }].slice(-40);
  await db().from("trees").update({ biography: json(biografia) }).eq("id", alberoId);

  return { lettera, uso: esito.uso, come: esito.come, regalo: r };
}

// ——— Strumenti della demo ———

/** Cambia pacchetto (demo: nessun pagamento). */
export async function cambiaPacchetto(alberoId: string, piano: string): Promise<IdPacchetto> {
  if (!isPacchetto(piano)) throw new Error("Pacchetto sconosciuto.");
  const { error } = await db().from("trees").update({ plan: piano }).eq("id", alberoId);
  if (error) throw new Error(`Pacchetto non cambiato: ${error.message}`);
  return piano;
}

// ——— Il momento del mese, disegnato ———

/** La strada si vede solo dal giorno in cui l'ha capita (lo dice la biografia). */
export function stradaAlGiorno(path: string | null, biografia: unknown, giorno: number): string | null {
  if (!path) return null;
  const fatti = Array.isArray(biografia) ? (biografia as { giorno: number; testo: string }[]) : [];
  const rivelata = fatti.find((f) => typeof f.testo === "string" && f.testo.startsWith("Ha capito chi è"));
  return !rivelata || rivelata.giorno <= giorno ? path : null;
}

/** Meteo, posa, stadio e stagione di un giorno del diario: per il riepilogo e per la cartolina. */
export function scenaDelGiorno(pagina: RigaDiario, strada: string | null, regali: RegaloInUso[]) {
  const w = pagina.weather as Partial<MeteoGiorno> | null;
  const meteo: Meteo = {
    cielo: w?.cielo ?? "nuvole",
    temperatura: w?.temperatura ?? 15,
    giorno: true,
    descrizione: w?.descrizione ?? "",
  };
  const posa = vestiConRegali(posaDelGiorno(pagina.action, meteo, strada), regali, meteo);
  return {
    meteo,
    posa,
    stadio: stadioDa(pagina.day_number),
    giorni: pagina.day_number,
    stagione: stagioneDa(new Date(`${pagina.lived_on}T12:00:00`)),
  };
}
