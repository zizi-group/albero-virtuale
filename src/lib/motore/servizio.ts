import { createAdminClient } from "../supabase/admin";
import type { Database, Json } from "../supabase/database.types";
import { INFO_STRADE, isStrada, trattiCasuali, type PunteggiStrade, type Tratti } from "../albero/strade";
import { azione } from "../albero/azioni";
import { regalo } from "../albero/regali";
import { meteoAttuale, oggiNelFuso, previsioni, type Luogo } from "../meteo";
import { inviaLettera } from "./email";
import { scriviRisposta, scriviTestoLettera, type TipoLettera } from "./scritture";
import {
  applicaEsiti,
  pianificaGiorni,
  preparaGiorni,
  type ContestoVita,
  type FattoBiografia,
  type RegaloRicevuto,
  type StatoAlbero,
} from "./vita";

// Il motore collegato al database: lo usano le azioni del sito e gli script.
// Scrive sempre con la chiave segreta; chi chiama deve aver già verificato
// che l'albero appartiene alla persona collegata.

export type RigaAlbero = Database["public"]["Tables"]["trees"]["Row"];
export const MAX_GIORNI_PER_VOLTA = 7;

export const db = () => createAdminClient();
export const json = (v: unknown) => v as NonNullable<Json>;

export function statoDaRiga(r: RigaAlbero, regali: RegaloRicevuto[] = []): StatoAlbero {
  return {
    nome: r.name,
    nomePersona: r.owner_name,
    citta: r.city,
    giorni: r.day_count,
    dataSemina: oggiNelFuso(r.timezone, new Date(r.planted_at)),
    tratti: r.traits as Tratti,
    punteggi: (r.path_scores ?? {}) as PunteggiStrade,
    strada: isStrada(r.path) ? r.path : null,
    umore: r.mood,
    biografia: (r.biography ?? []) as unknown as FattoBiografia[],
    regali,
  };
}

export async function caricaAlbero(alberoId: string): Promise<RigaAlbero> {
  const { data, error } = await db().from("trees").select("*").eq("id", alberoId).single();
  if (error || !data) throw new Error(`Albero non trovato: ${error?.message ?? alberoId}`);
  return data;
}

/** I regali ricevuti, come li ricorda l'albero nei prompt. */
export async function regaliRicevuti(alberoId: string): Promise<RegaloRicevuto[]> {
  const { data } = await db()
    .from("gifts")
    .select("month_number, gift, how")
    .eq("tree_id", alberoId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((g) => ({ mese: g.month_number, cosa: regalo(g.gift)?.articolo ?? g.gift, come: g.how }));
}

/** La riga dell'albero e il suo stato per il motore, con i regali. */
export async function caricaStato(alberoId: string): Promise<{ riga: RigaAlbero; stato: StatoAlbero }> {
  const [riga, regali] = await Promise.all([caricaAlbero(alberoId), regaliRicevuti(alberoId)]);
  return { riga, stato: statoDaRiga(riga, regali) };
}

export async function contesto(alberoId: string, pagine = 6): Promise<ContestoVita> {
  const [diario, messaggi] = await Promise.all([
    db()
      .from("diary_entries")
      .select("day_number, action, body, weather")
      .eq("tree_id", alberoId)
      .order("day_number", { ascending: false })
      .limit(pagine),
    db()
      .from("messages")
      .select("body")
      .eq("tree_id", alberoId)
      .eq("author", "persona")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);
  return {
    diarioRecente: (diario.data ?? []).reverse().map((d) => ({
      giorno: d.day_number,
      azione: azione(d.action).etichetta,
      testo: d.body,
      meteo: (d.weather as { descrizione?: string } | null)?.descrizione ?? null,
    })),
    messaggiPersona: (messaggi.data ?? []).reverse().map((m) => m.body),
  };
}

export async function emailDelProprietario(ownerId: string): Promise<string | null> {
  const { data } = await db().auth.admin.getUserById(ownerId);
  return data.user?.email ?? null;
}

/** Pianta un albero nuovo: tratti a caso, prima pagina di diario, lettera di benvenuto. */
export async function piantaAlbero({
  ownerId,
  nome,
  nomePersona,
  luogo,
  piano,
}: {
  ownerId: string;
  nome: string;
  nomePersona: string | null;
  luogo: Luogo;
  piano: "albero" | "premium-annuale" | "premium-mensile";
}): Promise<{ id: string; erroreLettera: string | null }> {
  const meteo = await meteoAttuale(luogo.latitudine, luogo.longitudine);
  const tratti = trattiCasuali();
  const { data: albero, error } = await db()
    .from("trees")
    .insert({
      owner_id: ownerId,
      owner_name: nomePersona,
      name: nome,
      city: luogo.citta,
      latitude: luogo.latitudine,
      longitude: luogo.longitudine,
      timezone: luogo.fusoOrario,
      plan: piano,
      traits: json(tratti),
      today_action: "guardare-cielo",
      today_caption: `${nome} è appena spuntato e guarda il cielo di ${luogo.citta} per la prima volta.`,
      last_weather: json(meteo),
    })
    .select("*")
    .single();
  if (error || !albero) throw new Error(`Non riesco a piantare l'albero: ${error?.message}`);

  await db().from("diary_entries").insert({
    tree_id: albero.id,
    day_number: 0,
    lived_on: oggiNelFuso(luogo.fusoOrario),
    weather: json(meteo),
    action: "guardare-cielo",
    mood: "curioso",
    body: `Sono spuntato oggi a ${luogo.citta}${meteo ? `, con ${meteo.descrizione}` : ""}. Non so ancora chi sono, ma ho delle radici e mi sembra un buon inizio.`,
    milestone: true,
  });
  // Il mese 1 parte alla semina: serve agli extra del Premium (regalo, riepilogo, cartolina).
  await db().from("tree_months").insert({ tree_id: albero.id, number: 1, first_day: 0 });

  try {
    await scriviEInviaLettera(albero.id, "benvenuto", meteo?.descrizione);
    return { id: albero.id, erroreLettera: null };
  } catch (e) {
    console.error("[linfa] lettera di benvenuto non scritta:", e);
    return { id: albero.id, erroreLettera: e instanceof Error ? e.message : String(e) };
  }
}

/** Fa passare da 1 a 7 giorni: una chiamata all'AI, diario, strada, lettere. */
export async function faiPassareGiorni(alberoId: string, n: number) {
  const giorniDaVivere = Math.max(1, Math.min(MAX_GIORNI_PER_VOLTA, Math.round(n)));
  const { riga, stato } = await caricaStato(alberoId);
  const [prev, ctx] = await Promise.all([previsioni(riga.latitude, riga.longitude), contesto(alberoId)]);

  const giorni = preparaGiorni(stato, giorniDaVivere, prev);
  const esiti = await pianificaGiorni(stato, giorni, ctx);
  const { stato: nuovo, pagine, rivelata, momento } = applicaEsiti(stato, giorni, esiti);
  const ultima = pagine[pagine.length - 1];

  const { error: errDiario } = await db()
    .from("diary_entries")
    .upsert(
      pagine.map((p) => ({
        tree_id: alberoId,
        day_number: p.giorno,
        lived_on: p.data,
        weather: json(p.meteo),
        action: p.azione,
        mood: p.umore,
        body: p.testo,
        milestone: p.momento,
      })),
      { onConflict: "tree_id,day_number" },
    );
  if (errDiario) throw new Error(`Diario non salvato: ${errDiario.message}`);

  const { error: errAlbero } = await db()
    .from("trees")
    .update({
      day_count: nuovo.giorni,
      traits: json(nuovo.tratti),
      path_scores: json(nuovo.punteggi),
      path: nuovo.strada,
      mood: nuovo.umore,
      biography: json(nuovo.biografia),
      today_action: ultima.azione,
      today_caption: ultima.didascalia,
      last_weather: json(ultima.meteo),
      updated_at: new Date().toISOString(),
    })
    .eq("id", alberoId);
  if (errAlbero) throw new Error(`Albero non aggiornato: ${errAlbero.message}`);

  // Una lettera "momento" al massimo per volta: prima la strada rivelata.
  let lettera: string | null = null;
  if (rivelata) {
    lettera = await scriviEInviaLettera(
      alberoId,
      "momento",
      `ha capito chi è: da oggi è ${INFO_STRADE[rivelata].nome.toLowerCase()}`,
    ).then((l) => l.id);
  } else if (momento && (await giorniDallUltimaLettera(alberoId, "momento", nuovo.giorni)) >= 7) {
    lettera = await scriviEInviaLettera(alberoId, "momento", momento.fatto_da_ricordare ?? momento.diario).then(
      (l) => l.id,
    );
  }

  return { giorni: nuovo.giorni, vissuti: pagine.length, rivelata, lettera };
}

async function giorniDallUltimaLettera(alberoId: string, tipo: TipoLettera, oggi: number) {
  const { data } = await db()
    .from("letters")
    .select("day_number")
    .eq("tree_id", alberoId)
    .eq("kind", tipo)
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0] ? oggi - data[0].day_number : Infinity;
}

/** L'albero scrive una lettera, la salva e la spedisce per email. */
export async function scriviEInviaLettera(alberoId: string, tipo: TipoLettera, motivo?: string) {
  const { riga, stato } = await caricaStato(alberoId);
  const ctx = await contesto(alberoId, tipo === "mensile" ? 30 : 6);
  const { oggetto, testo } = await scriviTestoLettera(stato, tipo, ctx, motivo);
  return salvaEInviaLettera(riga, tipo, oggetto, testo);
}

/** Salva una lettera già scritta e la spedisce per email (se l'email non parte, la lettera resta). */
export async function salvaEInviaLettera(
  riga: RigaAlbero,
  tipo: TipoLettera | "regalo",
  oggetto: string,
  testo: string,
) {
  const { data: lettera, error } = await db()
    .from("letters")
    .insert({ tree_id: riga.id, kind: tipo, day_number: riga.day_count, subject: oggetto, body: testo })
    .select("*")
    .single();
  if (error || !lettera) throw new Error(`Lettera non salvata: ${error?.message}`);

  const email = await emailDelProprietario(riga.owner_id);
  if (email) {
    try {
      await inviaLettera({ a: email, nomeAlbero: riga.name, oggetto, testo, letteraId: lettera.id });
      await db().from("letters").update({ emailed_at: new Date().toISOString() }).eq("id", lettera.id);
    } catch (e) {
      console.error("[linfa] email non spedita:", e);
    }
  }
  return lettera;
}

/** La persona scrive, l'albero risponde a modo suo. */
export async function rispondiAllaPersona(alberoId: string, testo: string) {
  const pulito = testo.trim().slice(0, 1000);
  if (!pulito) throw new Error("Messaggio vuoto.");

  await db().from("messages").insert({ tree_id: alberoId, author: "persona", body: pulito });

  const { stato } = await caricaStato(alberoId);
  const [{ data: storia }, ctx] = await Promise.all([
    db()
      .from("messages")
      .select("author, body")
      .eq("tree_id", alberoId)
      .order("created_at", { ascending: false })
      .limit(12),
    contesto(alberoId, 4),
  ]);
  const conversazione = (storia ?? []).reverse().map((m) => ({
    autore: m.author as "persona" | "albero",
    testo: m.body,
  }));

  const esito = await scriviRisposta(stato, conversazione, ctx);
  await db().from("messages").insert({ tree_id: alberoId, author: "albero", body: esito.risposta.slice(0, 2000) });

  if (esito.fatto_da_ricordare) {
    const biografia = [...stato.biografia, { giorno: stato.giorni, testo: esito.fatto_da_ricordare }].slice(-40);
    await db().from("trees").update({ biography: json(biografia) }).eq("id", alberoId);
  }
  return esito;
}
