import { AZIONI, azione, type Azione } from "./azioni";
import { chiudiGiornata, faiAttivita, haRequisiti, inizioGiorno, pesoCatena, possibile, prossimiPassi, type StatoCatene } from "./catene";
import { FASCE, fasciaDa, type Fascia } from "./mestieri";
import { INFO_QUOTIDIANE, type InfoAttivita } from "./quotidiane";
import { FREDDO_SOTTO } from "./scena";
import type { Meteo } from "./tipi";

// La giornata dell'albero divisa per fasce (docs/stanze-e-vita.md, sezione 3).
// Ogni fascia ha 3 attività in ordine: chi entra a orari diversi, o due giorni
// di fila alla stessa ora, lo trova a fare cose diverse. Tutto è deterministico
// (seme = id dell'albero + giorno): server e browser vedono la stessa giornata.
// Con la memoria (catene.ts) i pesi tengono conto delle catene aperte (×5 per
// il passo dopo), delle risorse che mancano (×3 per chi le raccoglie), di
// quello che ha fatto nei tre giorni prima e di quello che non ha mai fatto.
// La prima attività di ogni fascia è la principale: è quella che lascia le
// tracce e manda avanti le catene; le altre sono attività libere, senza requisiti.

export type FasciaDiGiorno = Exclude<Fascia, "notte">;
export const FASCE_DI_GIORNO = FASCE.filter((f): f is FasciaDiGiorno => f !== "notte");

/** Quante attività per fascia (la prima è la principale). */
export const PER_FASCIA = 3;

const TUTTE: FasciaDiGiorno[] = ["mattina", "giorno", "pomeriggio", "sera"];

// Solo le azioni di giorno: dormire è la notte, il resto lo decide il meteo.
const INFO: Record<string, InfoAttivita> = {
  "guardare-cielo": { fasce: TUTTE, ferma: true, umori: ["sognante", "pensieroso", "curioso"], voglia: "che nuvole oggi…" },
  leggere: { fasce: ["giorno", "pomeriggio", "sera"], ferma: true, umori: ["pensieroso", "curioso", "assonnato"], voglia: "quel libro mi chiama" },
  "giornale-ombrello": { fasce: ["mattina", "giorno"], ferma: true, umori: ["fiero", "furbo"], voglia: "le notizie della Borsa…" },
  doccia: { fasce: TUTTE, movimento: true, umori: ["allegro", "energico"], voglia: "una bella doccia!" },
  "prendere-sole": { fasce: ["giorno", "pomeriggio"], noFreddo: true, umori: ["assonnato", "allegro", "sognante"], voglia: "un po' di sole…" },
  passeggiata: { fasce: TUTTE, movimento: true, umori: ["curioso", "energico", "malinconico"], voglia: "due passi?" },
  sonnellino: { fasce: ["giorno", "pomeriggio"], ferma: true, noFreddo: true, umori: ["assonnato", "malinconico"], voglia: "un pisolino…" },
  telefonata: { fasce: ["mattina", "giorno", "pomeriggio"], umori: ["fiero", "furbo", "energico"], voglia: "devo fare una telefonata" },
  corsa: { fasce: ["mattina", "pomeriggio"], movimento: true, umori: ["energico", "allegro", "fiero"], voglia: "voglia di correre!" },
  allenarsi: { fasce: ["mattina", "pomeriggio"], movimento: true, umori: ["energico", "fiero"], voglia: "dieci sollevamenti…" },
  dipingere: { fasce: ["mattina", "giorno", "pomeriggio"], umori: ["sognante", "allegro", "malinconico"], voglia: "un quadro nuovo!" },
  "scrivere-poesia": { fasce: ["giorno", "pomeriggio", "sera"], ferma: true, umori: ["sognante", "malinconico", "pensieroso"], voglia: "una rima… quale?" },
  meditare: { fasce: ["mattina", "sera"], ferma: true, umori: ["pensieroso", "assonnato"], voglia: "ommm…" },
  pensare: { fasce: TUTTE, ferma: true, umori: ["pensieroso", "curioso"], voglia: "perché le foglie…?" },
  "contare-ghiande": { fasce: ["giorno", "sera"], umori: ["furbo", "fiero"], voglia: "le mie ghiande!" },
  "vendere-ombra": { fasce: ["giorno", "pomeriggio"], umori: ["furbo", "fiero", "energico"], voglia: "ombra in saldo!" },
  "chiacchierare-scoiattolo": { fasce: ["mattina", "giorno", "pomeriggio"], movimento: true, umori: ["allegro", "curioso", "furbo"], voglia: "dov'è lo scoiattolo?" },
  "fare-valigia": { fasce: ["mattina", "sera"], movimento: true, umori: ["curioso", "sognante", "energico"], voglia: "e se partissi?" },
  "studiare-mappa": { fasce: ["giorno", "sera"], umori: ["curioso", "sognante"], voglia: "dove andrei…?" },
  ballare: { fasce: ["pomeriggio", "sera"], movimento: true, umori: ["allegro", "energico"], voglia: "che voglia di ballare!" },
  annaffiarsi: { fasce: ["mattina", "pomeriggio"], movimento: true, noFreddo: true, umori: ["allegro", "assonnato"], voglia: "un po' d'acqua…" },
  "bere-tisana": { fasce: ["mattina", "sera"], umori: ["assonnato", "malinconico", "pensieroso"], voglia: "una tisana calda" },
  ...INFO_QUOTIDIANE,
};

export interface ContestoGiornata {
  /** Seme: l'id dell'albero. */
  seme: string;
  giorno: number;
  strada: string | null;
  umore: string;
  /** L'azione del giorno scelta dall'AI (solo senza memoria: alberi di prima della 0.2). */
  azioneDelGiorno: string | null;
  /** Le azioni scelte dall'AI nei giorni prima (dal diario): se si ripete, non è la principale. */
  azioniRecenti?: string[];
  meteo: Pick<Meteo, "cielo" | "temperatura">;
  /**
   * Memoria e risorse all'inizio del giorno (catene.ts, dopo inizioGiorno).
   * Senza, la giornata si costruisce come nella 0.1, ricostruendo i due giorni prima.
   */
  catene?: StatoCatene;
}

export type Palinsesto = Record<FasciaDiGiorno, string[]>;

const QUOTIDIANA = new Set(Object.keys(INFO_QUOTIDIANE));

/** Un numero da un testo, sempre lo stesso (FNV-1a). */
function hash(t: string): number {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Numeri casuali riproducibili (mulberry32). */
function casuale(seme: number): () => number {
  let a = seme;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Le azioni possibili con questo tempo. */
export function ammessaColMeteo(a: Azione, meteo: ContestoGiornata["meteo"]): boolean {
  const info = INFO[a.id];
  if (!info) return false;
  const bagnato = meteo.cielo === "pioggia" || meteo.cielo === "temporale";
  if (bagnato) return a.meteo === "pioggia" || a.meteo === "qualsiasi";
  if (a.meteo !== "asciutto" && a.meteo !== "qualsiasi") return false;
  const freddo = meteo.temperatura < FREDDO_SOTTO || meteo.cielo === "neve";
  if (freddo && info.noFreddo) return false;
  if (a.id === "prendere-sole" && meteo.cielo !== "sole") return false;
  return true;
}

/** Le regole contro la noia (sezione 3.3): quello che ha fatto nei giorni prima pesa meno. */
function novita(id: string, f: FasciaDiGiorno, recenti: Palinsesto[], fatte: Set<string> | null, passo: boolean): number {
  let p = 1;
  recenti.forEach((r, i) => {
    // La stessa principale nella stessa fascia al massimo una volta ogni 3 giorni.
    if (r[f][0] === id) p *= i < 2 ? 0.002 : 0.4;
    // In un'altra fascia pesa meno, salvo che sia il passo dopo di una catena (annaffiare l'orto per giorni).
    else if (!passo && FASCE_DI_GIORNO.some((g) => r[g][0] === id)) p *= i === 0 ? 0.3 : 0.6;
    else if (r[f].includes(id)) p *= 0.7;
  });
  if (fatte && !fatte.has(id)) p *= 2;
  return p;
}

function peso(a: Azione, f: FasciaDiGiorno, c: ContestoGiornata, recenti: Palinsesto[], fatte: Set<string> | null, passo = false): number {
  const info = INFO[a.id];
  // Base (3.3): quotidiana 10, di strada 4. Sono di strada le azioni della 0.1 legate a una strada.
  let p = (QUOTIDIANA.has(a.id) || !a.strade.length ? 1 : 0.4) * (info.fasce.includes(f) ? 1 : 0.15);
  if (c.strada) p *= a.strade.includes(c.strada as never) ? 3 : a.strade.length ? 0.7 : 1;
  if (info.umori.includes(c.umore)) p *= 1.8;
  if (a.meteo === "pioggia") p *= 1.6; // con la pioggia le cose da pioggia vengono prima
  return p * novita(a.id, f, recenti, fatte, passo);
}

/** Estrae senza ripetere, in base ai pesi. */
function estrai(pesi: [string, number][], quanti: number, rnd: () => number): string[] {
  const resto = pesi.filter(([, p]) => p > 0);
  const presi: string[] = [];
  while (presi.length < quanti && resto.length) {
    const tot = resto.reduce((s, [, p]) => s + p, 0);
    let r = rnd() * tot;
    let i = 0;
    for (; i < resto.length - 1; i++) {
      r -= resto[i][1];
      if (r <= 0) break;
    }
    presi.push(resto[i][0]);
    resto.splice(i, 1);
  }
  return presi;
}

function costruisci(c: ContestoGiornata, recenti: Palinsesto[], inizio: StatoCatene | null): Palinsesto {
  const possibili = AZIONI.filter((a) => ammessaColMeteo(a, c.meteo));
  const rnd = casuale(hash(`${c.seme}|${c.giorno}`));
  const fatte = inizio ? new Set(inizio.memoria.fatte) : null;
  const usate = new Set<string>();
  let st = inizio;
  let ferme = 0;
  let mosse = 0;
  const out = {} as Palinsesto;

  // Senza memoria (0.1): l'azione dell'AI va in una delle sue fasce.
  const scelta =
    !inizio && c.azioneDelGiorno && INFO[c.azioneDelGiorno] && possibili.some((a) => a.id === c.azioneDelGiorno) && !haRequisiti(c.azioneDelGiorno)
      ? c.azioneDelGiorno
      : null;
  const fasciaAI = scelta ? INFO[scelta].fasce[Math.floor(rnd() * INFO[scelta].fasce.length)] : null;

  for (const f of FASCE_DI_GIORNO) {
    const passi = new Set(st ? prossimiPassi(st) : []);
    const pesi = (alternativa: boolean): [string, number][] =>
      possibili
        .filter((a) => !usate.has(a.id))
        .map((a) => {
          if (alternativa && haRequisiti(a.id)) return [a.id, 0];
          let p = peso(a, f, c, recenti, fatte, passi.has(a.id));
          p *= st ? pesoCatena(a.id, st) : haRequisiti(a.id) ? 0 : 1;
          if (ferme >= 1 && INFO[a.id].ferma) p *= 0.08;
          // Almeno un'attività di movimento al giorno: se manca, nel pomeriggio diventa molto probabile.
          if (f === "pomeriggio" && mosse === 0 && INFO[a.id].movimento) p *= 20;
          return [a.id, p];
        });
    const principale = estrai(pesi(false), 1, rnd);
    const altre = estrai(
      pesi(true).filter(([id]) => id !== principale[0]),
      PER_FASCIA - principale.length,
      rnd,
    );
    let lista = [...principale, ...altre];
    if (f === fasciaAI && scelta) {
      // Se l'AI ripete quello che ha già scelto di recente, resta un'alternativa e non la principale.
      const ripete = c.azioniRecenti?.slice(0, 2).includes(scelta);
      const resto = lista.filter((x) => x !== scelta);
      lista = (ripete ? [resto[0], scelta, ...resto.slice(1)] : [scelta, ...resto]).filter(Boolean).slice(0, PER_FASCIA);
    }
    out[f] = lista;
    for (const id of lista) usate.add(id);
    const p0 = lista[0];
    if (INFO[p0]?.ferma) ferme += 1;
    if (INFO[p0]?.movimento) mosse += 1;
    if (st && p0) st = faiAttivita(st, p0, c.giorno);
  }
  return out;
}

/**
 * Il palinsesto del giorno: per ogni fascia, 3 attività (la prima è la principale).
 * Con la memoria usa la storia vera dei tre giorni prima; senza, la ricostruisce
 * con lo stesso seme per i due giorni prima.
 */
export function giornataDi(c: ContestoGiornata): Palinsesto {
  if (c.catene) return costruisci(c, c.catene.memoria.storia.map((s) => s.p), c.catene);
  const ieri2 = costruisci({ ...c, giorno: c.giorno - 2, azioneDelGiorno: null }, [], null);
  const ieri = costruisci({ ...c, giorno: c.giorno - 1, azioneDelGiorno: null }, [ieri2], null);
  return costruisci(c, [ieri, ieri2], null);
}

/** Le attività di una giornata, una volta sola (per l'AI che sceglie l'azione del giorno). */
export function attivitaDelGiorno(p: Palinsesto): string[] {
  return [...new Set(FASCE_DI_GIORNO.flatMap((f) => p[f]))];
}

/**
 * L'AI ha scelto l'azione del giorno tra le attività della giornata: se è
 * un'alternativa diventa la principale della sua fascia. Poi controlla che ogni
 * principale si possa ancora fare (le risorse cambiano): se no, la scambia con
 * un'alternativa.
 */
export function conLaScelta(p: Palinsesto, scelta: string | null, inizio: StatoCatene, giorno: number): Palinsesto {
  const out = Object.fromEntries(FASCE_DI_GIORNO.map((f) => [f, [...p[f]]])) as Palinsesto;
  if (scelta) {
    const f = FASCE_DI_GIORNO.find((x) => out[x].includes(scelta));
    if (f) out[f] = [scelta, ...out[f].filter((x) => x !== scelta)];
  }
  let st = inizio;
  for (const f of FASCE_DI_GIORNO) {
    const i = out[f].findIndex((id) => possibile(id, st));
    if (i > 0) out[f] = [out[f][i], ...out[f].filter((_, k) => k !== i)];
    if (out[f][0] && possibile(out[f][0], st)) st = faiAttivita(st, out[f][0], giorno);
  }
  return out;
}

/**
 * Il giardino col meteo di adesso (o di prova): toglie quello che con questo
 * tempo non si fa; se una fascia resta vuota, la riempie come farebbe il motore.
 */
export function adattaAlMeteo(p: Palinsesto, c: ContestoGiornata): Palinsesto {
  const ok = (id: string) => azione(id).id === id && ammessaColMeteo(azione(id), c.meteo);
  if (FASCE_DI_GIORNO.every((f) => p[f].every(ok))) return p;
  const ricambio = giornataDi({ ...c, catene: undefined, azioneDelGiorno: null });
  const out = {} as Palinsesto;
  for (const f of FASCE_DI_GIORNO) {
    const tenute = p[f].filter(ok);
    out[f] = [...tenute, ...ricambio[f].filter((x) => !tenute.includes(x))].slice(0, PER_FASCIA);
  }
  return out;
}

/** La fascia di adesso: di notte (col buio vero) dorme. */
export function fasciaAdesso(ora: number, eGiorno: boolean): Fascia {
  if (!eGiorno) return "notte";
  const f = fasciaDa(ora);
  return f === "notte" ? (ora < 12 ? "mattina" : "sera") : f;
}

/**
 * Quale delle attività della fascia si vede adesso: cambia ogni 45 minuti,
 * così due visite nella stessa fascia trovano spesso cose diverse.
 */
export function indiceAdesso(minutiDalGiorno: number, quante: number): number {
  return quante ? Math.floor(minutiDalGiorno / 45) % quante : 0;
}

/** Che cosa pensa quando gli viene voglia di fare questa attività. */
export function voglia(id: string): string {
  return INFO[id]?.voglia ?? "chissà…";
}

export const NOMI_FASCE_FRASE: Record<Fascia, string> = {
  mattina: "Stamattina",
  giorno: "A mezzogiorno",
  pomeriggio: "Nel pomeriggio",
  sera: "Stasera",
  notte: "Di notte",
};

/** Per i controlli: l'etichetta di un'attività del palinsesto. */
export function etichetta(id: string): string {
  return azione(id).etichetta;
}

// ——— Più giorni di fila (motore notturno e simulazione) ———

export interface GiornoAFasce {
  giorno: number;
  meteo: Pick<Meteo, "cielo" | "temperatura">;
  /** L'umore del giorno (di solito quello della sera prima). */
  umore: string;
}

export interface GiornateAFasce {
  palinsesti: Palinsesto[];
  /** Lo stato all'inizio di ogni giorno (dopo le braci che si spengono e la pioggia). */
  inizi: StatoCatene[];
  /** Da salvare: lo stato all'inizio dell'ultimo giorno, con la sua giornata in memoria.oggi. */
  fine: StatoCatene;
}

/**
 * Vive in fila i giorni: per ognuno la giornata dalla memoria, poi la chiude
 * (tracce, risorse, catene) prima di passare al giorno dopo. `scelte`: le
 * azioni del giorno scelte dall'AI, una per giorno (o null).
 * `stato` è quello salvato: se contiene la giornata di ieri, la chiude prima.
 */
export function pianificaGiornate(
  seme: string,
  strada: string | null,
  stato: StatoCatene,
  giorni: GiornoAFasce[],
  scelte?: (string | null)[],
): GiornateAFasce {
  let st = chiudiGiornata(stato);
  const palinsesti: Palinsesto[] = [];
  const inizi: StatoCatene[] = [];
  giorni.forEach((g, i) => {
    st = inizioGiorno(st, g.giorno, g.meteo.cielo);
    let p = giornataDi({ seme, giorno: g.giorno, strada, umore: g.umore, azioneDelGiorno: null, meteo: g.meteo, catene: st });
    if (scelte) p = conLaScelta(p, scelte[i] ?? null, st, g.giorno);
    palinsesti.push(p);
    inizi.push(st);
    st = { memoria: { ...st.memoria, oggi: { giorno: g.giorno, p } }, risorse: st.risorse };
    if (i < giorni.length - 1) st = chiudiGiornata(st);
  });
  return { palinsesti, inizi, fine: st };
}
