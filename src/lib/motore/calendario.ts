import { azione } from "../albero/azioni";
import { fattiDellaSettimana, leggiMemoria } from "../albero/catene";
import type { PaginaCollezione } from "../albero/collezione";
import { nuoviDalCatalogo, voce, type DatiOggetti } from "../albero/oggetti";
import type { Cielo } from "../albero/tipi";
import { pngSettimana } from "../cartolina/settimana";
import type { MeteoGiorno } from "../meteo";
import type { Database } from "../supabase/database.types";
import { inviaNotaSettimana } from "./email";
import { apriNuovoMese, meseCorrente, meseFinito, regaliInUso, scenaDelGiorno, stradaAlGiorno } from "./extra";
import { caricaStato, db, emailDelProprietario, faiPassareGiorni, scriviEInviaLettera } from "./servizio";
import { scriviNotaSettimana } from "./scritture";

// Il calendario dell'albero: quello che succede dopo le giornate vissute.
// - Collezione: il catalogo degli oggetti (regole in albero/oggetti.ts, che
//   comprende quelle di albero/collezione.ts); i regali diventano oggetti.
// - Settimana: ogni 7 giorni vissuti, per tutti i piani, una sola email con la
//   cartolina del momento migliore (nota e momento sul modello piccolo) e la
//   lettera della settimana (Opus). La lettera settimanale (Federico,
//   12/11/2026) prende il posto di quella di fine mese e di metà mese.
// - Fine del mese: il mese si chiude (extra del Premium), senza lettera.
// Lo usano il motore notturno e gli strumenti della demo.

type RigaDiario = Database["public"]["Tables"]["diary_entries"]["Row"];

export const GIORNI_DELLA_SETTIMANA = 7;

/** Fa passare i giorni e poi fa scattare quello che il calendario prevede. */
export async function viviGiorni(alberoId: string, n: number) {
  const prima = (await caricaStato(alberoId)).riga.day_count;
  const r = await faiPassareGiorni(alberoId, n);
  const eventi = await eventiDelCalendario(alberoId, prima + 1, r.giorni);
  return { ...r, eventi };
}

export interface EventiDelCalendario {
  sbloccati: string[];
  settimana: { numero: number; oggetto: string; lettera: string | null } | null;
  mese: { chiuso: number; titolo: string } | null;
}

/** Quello che succede dopo aver vissuto i giorni da `da` ad `a` (compresi). */
export async function eventiDelCalendario(alberoId: string, da: number, a: number): Promise<EventiDelCalendario> {
  void da;
  const eventi: EventiDelCalendario = { sbloccati: [], settimana: null, mese: null };
  eventi.sbloccati = await controllaSblocchi(alberoId);

  const mese = await meseCorrente(alberoId);

  const inizioSettimana = await primoGiornoDellaSettimana(alberoId);
  if (a - inizioSettimana + 1 >= GIORNI_DELLA_SETTIMANA) {
    try {
      eventi.settimana = await chiudiSettimana(alberoId);
    } catch (e) {
      console.error("[linfa] settimana non chiusa:", e);
    }
  }

  if (meseFinito(mese, a)) {
    const m = await apriNuovoMese(alberoId);
    eventi.mese = { chiuso: m.chiuso, titolo: m.titolo };
  }
  return eventi;
}

// ——— La collezione ———

/** Controlla le regole della collezione e registra quello che è appena scattato. */
export async function controllaSblocchi(alberoId: string): Promise<string[]> {
  const [{ riga }, { data: righe }, { data: gia }, { data: regali }, { count: messaggi }] = await Promise.all([
    caricaStato(alberoId),
    db().from("diary_entries").select("day_number, lived_on, action, weather").eq("tree_id", alberoId).order("day_number"),
    db().from("unlocks").select("item").eq("tree_id", alberoId),
    db().from("letters").select("id, day_number").eq("tree_id", alberoId).eq("kind", "regalo").order("day_number"),
    db().from("messages").select("id", { count: "exact", head: true }).eq("tree_id", alberoId).eq("author", "persona"),
  ]);
  const { data: doni } = await db().from("gifts").select("gift, letter_id").eq("tree_id", alberoId);
  const giornoLettera = new Map((regali ?? []).map((l) => [l.id, l.day_number]));

  const biografia = Array.isArray(riga.biography) ? (riga.biography as { giorno: number; testo: string }[]) : [];
  const dati: DatiOggetti = {
    pagine: (righe ?? []).map((p): PaginaCollezione => {
      const m = p.weather as Partial<MeteoGiorno> | null;
      return {
        giorno: p.day_number,
        data: p.lived_on,
        azione: p.action,
        cielo: (m?.cielo as Cielo | undefined) ?? null,
        temperatura: m?.temperatura ?? null,
        minima: m?.minima ?? null,
        massima: m?.massima ?? null,
      };
    }),
    giornoStrada: riga.path ? (biografia.find((f) => f.testo?.startsWith("Ha capito chi è"))?.giorno ?? riga.day_count) : null,
    giornoPrimoRegalo: regali?.[0]?.day_number ?? null,
    haScritto: (messaggi ?? 0) > 0,
    oggi: riga.day_count,
    // I regali diventano oggetti dal giorno della lettera di ringraziamento.
    regali: (doni ?? []).map((g) => ({ id: g.gift, giorno: (g.letter_id && giornoLettera.get(g.letter_id)) || riga.day_count })),
    strada: riga.path,
  };

  const nuovi = nuoviDalCatalogo(dati, new Set((gia ?? []).map((u) => u.item)));
  if (!nuovi.length) return [];
  await db()
    .from("unlocks")
    .upsert(
      nuovi.map((s) => ({ tree_id: alberoId, item: s.id, day_number: s.giorno })),
      { onConflict: "tree_id,item", ignoreDuplicates: true },
    );
  return nuovi.map((s) => s.id);
}

// ——— La settimana ———

/** Il primo giorno della settimana in corso: il giorno dopo l'ultima settimana chiusa (0 per la prima). */
export async function primoGiornoDellaSettimana(alberoId: string): Promise<number> {
  const { data } = await db()
    .from("tree_weeks")
    .select("last_day")
    .eq("tree_id", alberoId)
    .order("number", { ascending: false })
    .limit(1);
  return data?.[0] ? data[0].last_day + 1 : 0;
}

/**
 * Chiude la settimana: l'albero sceglie il momento migliore e scrive due-tre
 * righe (modello piccolo), la cartolina si disegna, l'albero scrive la lettera
 * della settimana (Opus) e tutto parte nella stessa email.
 */
export async function chiudiSettimana(alberoId: string) {
  const { riga, stato } = await caricaStato(alberoId);
  const primo = await primoGiornoDellaSettimana(alberoId);
  const { data: righe } = await db()
    .from("diary_entries")
    .select("*")
    .eq("tree_id", alberoId)
    .gte("day_number", primo)
    .lte("day_number", riga.day_count)
    .order("day_number");
  const pagine = righe ?? [];
  if (!pagine.length) throw new Error("La settimana è appena cominciata: fai passare almeno un giorno.");

  const { data: ultime } = await db()
    .from("tree_weeks")
    .select("number")
    .eq("tree_id", alberoId)
    .order("number", { ascending: false })
    .limit(1);
  const numero = (ultime?.[0]?.number ?? 0) + 1;

  const s = await scriviNotaSettimana(
    stato,
    pagine.map((p) => ({
      giorno: p.day_number,
      azione: azione(p.action).etichetta,
      testo: p.body,
      meteo: (p.weather as { descrizione?: string } | null)?.descrizione ?? null,
      traguardo: p.milestone,
    })),
  );
  const migliore = pagine.find((p) => p.day_number === s.giorno_migliore) ?? momentoAutomatico(pagine);
  const didascalia = (migliore.day_number === s.giorno_migliore ? s.didascalia : `${riga.name} ${azione(migliore.action).etichetta}.`)
    .trim()
    .slice(0, 110);
  const nota = s.nota.trim().slice(0, 400);
  const oggetto = s.oggetto.trim().slice(0, 60) || `La settimana ${numero}`;

  const { data: settimana, error } = await db()
    .from("tree_weeks")
    .insert({
      tree_id: alberoId,
      number: numero,
      first_day: primo,
      last_day: riga.day_count,
      best_day: migliore.day_number,
      subject: oggetto,
      note: nota,
      caption: didascalia,
    })
    .select("id")
    .single();
  if (error || !settimana) throw new Error("Questa settimana è già stata chiusa.");

  // La cartolina: se il disegno non riesce, la nota parte lo stesso.
  let immagine: Buffer | null = null;
  try {
    // Solo i regali arrivati fino al mese di quel momento.
    const { data: meseDelMomento } = await db()
      .from("tree_months")
      .select("number")
      .eq("tree_id", alberoId)
      .lte("first_day", migliore.day_number)
      .order("number", { ascending: false })
      .limit(1);
    const regali = await regaliInUso(db(), alberoId, meseDelMomento?.[0]?.number ?? 1);
    const scena = scenaDelGiorno(migliore, stradaAlGiorno(riga.path, riga.biography, migliore.day_number), regali);
    immagine = await pngSettimana({ nome: riga.name, numero, primo, ultimo: riga.day_count, didascalia, scena });
  } catch (e) {
    console.error("[linfa] cartolina della settimana non disegnata:", e);
  }

  // La lettera della settimana (Opus): se non si riesce a scriverla, la cartolina parte lo stesso.
  let lettera: { id: string; subject: string; body: string } | null = null;
  try {
    const { data: sblocchi } = await db()
      .from("unlocks")
      .select("item")
      .eq("tree_id", alberoId)
      .gte("day_number", primo)
      .lte("day_number", riga.day_count);
    const fatti = [
      ...fattiDellaSettimana(leggiMemoria(riga.memoria), primo, riga.day_count),
      ...(sblocchi ?? []).map((u) => voce(u.item)?.nome).filter((n): n is string => !!n).map((n) => `nella collezione è entrato «${n}»`),
    ];
    lettera = await scriviEInviaLettera(alberoId, "settimanale", fatti.join("; ") || undefined, false);
    await db().from("tree_weeks").update({ letter_id: lettera.id }).eq("id", settimana.id);
  } catch (e) {
    console.error("[linfa] lettera della settimana non scritta:", e);
  }

  const email = await emailDelProprietario(riga.owner_id);
  if (email) {
    const ora = new Date().toISOString();
    await inviaNotaSettimana({
      a: email,
      nomeAlbero: riga.name,
      oggetto: lettera?.subject ?? oggetto,
      nota,
      numero,
      immagine,
      lettera: lettera ? { testo: lettera.body, id: lettera.id } : null,
    });
    await db().from("tree_weeks").update({ emailed_at: ora }).eq("id", settimana.id);
    if (lettera) await db().from("letters").update({ emailed_at: ora }).eq("id", lettera.id);
  }
  return { numero, oggetto, primo, ultimo: riga.day_count, giorni: pagine.length, immagine: !!immagine, lettera: lettera?.id ?? null };
}

/** Senza l'AI: il giorno importante più recente, o la pagina più lunga. */
function momentoAutomatico(pagine: RigaDiario[]): RigaDiario {
  const traguardi = pagine.filter((p) => p.milestone && p.day_number > 0);
  return traguardi[traguardi.length - 1] ?? [...pagine].sort((a, b) => b.body.length - a.body.length)[0];
}
