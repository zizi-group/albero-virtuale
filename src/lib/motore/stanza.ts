import { CATALOGO, inScena, POSTI_STANZA, postoPerNuovo, voce, type Provenienza } from "../albero/oggetti";
import { db } from "./servizio";

// La stanza dell'albero e il momento dello sblocco (docs/stanze-e-vita.md, 2.3 e 9.3).
// - Ogni sblocco è un pacco che aspetta nella stanza (unlocks.opened_at null).
// - Aperto il pacco, Pino sistema da solo la cosa nuova nel primo posto libero
//   del suo tipo; se è tutto pieno mette via la più vecchia (room_items.place null).
// - La persona può spostarla in un altro posto dello stesso tipo o metterla via.
// Scritture solo dal server, dopo che l'azione ha controllato di chi è l'albero.

/** Al massimo tre pacchi nella stanza: oltre, il terzo li raccoglie tutti («tante novità»). */
export const PACCHI_MASSIMI = 3;

export interface PaccoInAttesa {
  /** Gli oggetti dentro: uno, o più di uno nel pacco delle tante novità. */
  oggetti: string[];
}

export interface OggettoArrivato {
  item: string;
  /** Il posto della stanza, o null se non si vede nella scena (vestiti, attrezzi, trofei). */
  place: string | null;
  /** La cosa che Pino ha messo via per fargli posto. */
  toglie: string | null;
}

/** I pacchi da mostrare, dai sblocchi non ancora aperti (in ordine di arrivo). */
export function pacchiDa(daAprire: string[]): PaccoInAttesa[] {
  if (daAprire.length <= PACCHI_MASSIMI) return daAprire.map((id) => ({ oggetti: [id] }));
  const singoli = daAprire.slice(0, PACCHI_MASSIMI - 1).map((id) => ({ oggetti: [id] }));
  return [...singoli, { oggetti: daAprire.slice(PACCHI_MASSIMI - 1) }];
}

/** Apre i pacchi: segna gli sblocchi come aperti e sistema gli oggetti nella stanza. */
export async function apriPacchi(alberoId: string, items: string[]): Promise<OggettoArrivato[]> {
  const [{ data: daAprire }, { data: stanza }, { data: doni }] = await Promise.all([
    db().from("unlocks").select("item").eq("tree_id", alberoId).is("opened_at", null).in("item", items).order("unlocked_at"),
    db().from("room_items").select("item, place").eq("tree_id", alberoId).order("moved_at"),
    db().from("gifts").select("gift").eq("tree_id", alberoId),
  ]);
  const regalati = new Set((doni ?? []).map((g) => g.gift));
  const occupati = (stanza ?? []).map((o) => ({ ...o }));
  const arrivati: OggettoArrivato[] = [];

  for (const { item } of daAprire ?? []) {
    const v = voce(item);
    if (!v) continue;
    if (!inScena(v)) {
      arrivati.push({ item, place: null, toglie: null });
      continue;
    }
    const gia = occupati.find((o) => o.item === item);
    if (gia) {
      arrivati.push({ item, place: gia.place, toglie: null });
      continue;
    }
    const { posto, toglie } = postoPerNuovo(v, occupati);
    if (toglie) {
      const { error } = await db().from("room_items").update({ place: null, moved_at: new Date().toISOString() }).eq("tree_id", alberoId).eq("item", toglie);
      if (error) throw new Error(`Stanza non aggiornata: ${error.message}`);
      occupati.find((o) => o.item === toglie)!.place = null;
    }
    const provenienza: Provenienza = v.regalo && regalati.has(v.regalo) ? "regalo" : v.provenienza;
    const { error } = await db()
      .from("room_items")
      .upsert({ tree_id: alberoId, item, place: posto, source: provenienza, is_new: true, placed_by: "albero" }, { onConflict: "tree_id,item" });
    if (error) throw new Error(`Oggetto non sistemato: ${error.message}`);
    occupati.push({ item, place: posto });
    arrivati.push({ item, place: posto, toglie });
  }

  if (arrivati.length) {
    const { error } = await db()
      .from("unlocks")
      .update({ opened_at: new Date().toISOString() })
      .eq("tree_id", alberoId)
      .in(
        "item",
        arrivati.map((a) => a.item),
      );
    if (error) throw new Error(`Pacchi non aperti: ${error.message}`);
  }
  return arrivati;
}

/**
 * La persona sposta un oggetto in un altro posto dello stesso tipo (se è
 * occupato, i due si scambiano) o lo mette via (posto null). Un oggetto in
 * deposito torna nella stanza allo stesso modo.
 */
export async function spostaOggetto(alberoId: string, item: string, posto: string | null) {
  const v = voce(item);
  if (!v || !inScena(v)) throw new Error("Questo oggetto non sta nella stanza.");
  if (posto !== null && !POSTI_STANZA[v.posto].includes(posto)) throw new Error("Lì non ci sta.");
  const { data: stanza } = await db().from("room_items").select("item, place").eq("tree_id", alberoId);
  let mio = (stanza ?? []).find((o) => o.item === item);
  if (!mio) {
    // Sbloccato prima che ci fossero le stanze: entra adesso, dal deposito.
    const { data: sbloccato } = await db().from("unlocks").select("item").eq("tree_id", alberoId).eq("item", item).not("opened_at", "is", null).maybeSingle();
    if (!sbloccato) throw new Error("Questo oggetto non è ancora suo.");
    const { error } = await db().from("room_items").insert({ tree_id: alberoId, item, place: null, source: v.regalo ? "regalo" : v.provenienza, is_new: false });
    if (error) throw new Error(error.message);
    mio = { item, place: null };
  }
  const adesso = new Date().toISOString();
  const altro = posto ? (stanza ?? []).find((o) => o.place === posto && o.item !== item) : undefined;
  // Prima si libera il posto (l'indice permette una cosa per posto), poi si scambia.
  if (altro) {
    const { error } = await db().from("room_items").update({ place: null }).eq("tree_id", alberoId).eq("item", altro.item);
    if (error) throw new Error(error.message);
  }
  const { error } = await db().from("room_items").update({ place: posto, placed_by: "persona", moved_at: adesso }).eq("tree_id", alberoId).eq("item", item);
  if (error) throw new Error(error.message);
  if (altro) {
    const { error: e2 } = await db().from("room_items").update({ place: mio.place, placed_by: "persona", moved_at: adesso }).eq("tree_id", alberoId).eq("item", altro.item);
    if (e2) throw new Error(e2.message);
  }
}

/** La persona ha guardato il catalogo: via l'etichetta «Nuovo». */
export async function segnaVisti(alberoId: string) {
  const adesso = new Date().toISOString();
  await Promise.all([
    db().from("unlocks").update({ seen_at: adesso }).eq("tree_id", alberoId).is("seen_at", null).not("opened_at", "is", null),
    db().from("room_items").update({ is_new: false }).eq("tree_id", alberoId).eq("is_new", true),
  ]);
}

/**
 * Strumento della demo: sblocca subito n voci disegnate che non ha ancora, a
 * caso ma preferendo quelle che si vedono nella stanza. Nel prodotto vero non
 * esiste: gli oggetti arrivano solo vivendo.
 */
export async function sbloccaPerProva(alberoId: string, n: number): Promise<string[]> {
  const [{ data: albero }, { data: gia }] = await Promise.all([
    db().from("trees").select("day_count").eq("id", alberoId).single(),
    db().from("unlocks").select("item").eq("tree_id", alberoId),
  ]);
  const presi = new Set((gia ?? []).map((u) => u.item));
  const liberi = CATALOGO.filter((v) => v.stato === "disegnato" && !presi.has(v.id) && v.posto !== "bacheca");
  const mescolati = liberi
    .map((v) => ({ v, peso: Math.random() + (inScena(v) ? 0.6 : 0) }))
    .sort((a, b) => b.peso - a.peso)
    .slice(0, n)
    .map((x) => x.v.id);
  if (!mescolati.length) return [];
  const { error } = await db()
    .from("unlocks")
    .insert(mescolati.map((item) => ({ tree_id: alberoId, item, day_number: albero?.day_count ?? 0 })));
  if (error) throw new Error(`Sblocco di prova non riuscito: ${error.message}`);
  return mescolati;
}
