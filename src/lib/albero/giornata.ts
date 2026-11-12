import { AZIONI, azione, type Azione } from "./azioni";
import { FREDDO_SOTTO } from "./scena";
import { FASCE, fasciaDa, type Fascia } from "./mestieri";
import type { Meteo } from "./tipi";

// La giornata dell'albero divisa per fasce (docs/stanze-e-vita.md, sezione 3).
// Ogni fascia ha 3 attività in ordine: chi entra a orari diversi, o due giorni
// di fila alla stessa ora, lo trova a fare cose diverse. Tutto è deterministico
// (seme = id dell'albero + giorno): server e browser vedono la stessa giornata.
// L'azione scelta dall'AI per il giorno resta l'attività principale di una fascia.

export type FasciaDiGiorno = Exclude<Fascia, "notte">;
export const FASCE_DI_GIORNO = FASCE.filter((f): f is FasciaDiGiorno => f !== "notte");

/** Quante attività per fascia (la prima è la principale). */
export const PER_FASCIA = 3;

interface Info {
  fasce: FasciaDiGiorno[];
  /** Ferma: scrive, legge, medita. Al massimo una al giorno come principale. */
  ferma?: boolean;
  /** Si muove: almeno una al giorno come principale. */
  movimento?: boolean;
  umori: string[];
  /** Che cosa gli passa per la testa quando gli viene voglia di farla (nuvoletta). */
  voglia: string;
}

const TUTTE: FasciaDiGiorno[] = ["mattina", "giorno", "pomeriggio", "sera"];

// Solo le azioni di giorno: dormire è la notte, il resto lo decide il meteo.
const INFO: Record<string, Info> = {
  "guardare-cielo": { fasce: TUTTE, ferma: true, umori: ["sognante", "pensieroso", "curioso"], voglia: "che nuvole oggi…" },
  leggere: { fasce: ["giorno", "pomeriggio", "sera"], ferma: true, umori: ["pensieroso", "curioso", "assonnato"], voglia: "quel libro mi chiama" },
  "giornale-ombrello": { fasce: ["mattina", "giorno"], ferma: true, umori: ["fiero", "furbo"], voglia: "le notizie della Borsa…" },
  doccia: { fasce: TUTTE, movimento: true, umori: ["allegro", "energico"], voglia: "una bella doccia!" },
  "prendere-sole": { fasce: ["giorno", "pomeriggio"], umori: ["assonnato", "allegro", "sognante"], voglia: "un po' di sole…" },
  passeggiata: { fasce: TUTTE, movimento: true, umori: ["curioso", "energico", "malinconico"], voglia: "due passi?" },
  sonnellino: { fasce: ["giorno", "pomeriggio"], ferma: true, umori: ["assonnato", "malinconico"], voglia: "un pisolino…" },
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
  annaffiarsi: { fasce: ["mattina", "pomeriggio"], movimento: true, umori: ["allegro", "assonnato"], voglia: "un po' d'acqua…" },
  "bere-tisana": { fasce: ["mattina", "sera"], umori: ["assonnato", "malinconico", "pensieroso"], voglia: "una tisana calda" },
};

export interface ContestoGiornata {
  /** Seme: l'id dell'albero. */
  seme: string;
  giorno: number;
  strada: string | null;
  umore: string;
  /** L'azione del giorno scelta dall'AI. */
  azioneDelGiorno: string | null;
  /** Le azioni scelte dall'AI nei giorni prima (dal diario): se si ripete, non è la principale. */
  azioniRecenti?: string[];
  meteo: Pick<Meteo, "cielo" | "temperatura">;
}

export type Palinsesto = Record<FasciaDiGiorno, string[]>;

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
function ammessa(a: Azione, c: ContestoGiornata): boolean {
  if (!INFO[a.id]) return false;
  const bagnato = c.meteo.cielo === "pioggia" || c.meteo.cielo === "temporale";
  if (bagnato) return a.meteo === "pioggia" || a.meteo === "qualsiasi";
  if (a.meteo !== "asciutto" && a.meteo !== "qualsiasi") return false;
  const freddo = c.meteo.temperatura < FREDDO_SOTTO || c.meteo.cielo === "neve";
  if (freddo && ["prendere-sole", "sonnellino", "annaffiarsi"].includes(a.id)) return false;
  if (a.id === "prendere-sole" && c.meteo.cielo !== "sole") return false;
  return true;
}

function peso(a: Azione, f: FasciaDiGiorno, c: ContestoGiornata, recenti: Palinsesto[]): number {
  const info = INFO[a.id];
  let p = info.fasce.includes(f) ? 1 : 0.15;
  if (c.strada) p *= a.strade.includes(c.strada as never) ? 3 : a.strade.length ? 0.7 : 1;
  if (info.umori.includes(c.umore)) p *= 1.8;
  if (a.meteo === "pioggia") p *= 1.6; // con la pioggia le cose da pioggia vengono prima
  // Novità: quello che ha fatto ieri o l'altro ieri nella stessa fascia pesa molto meno.
  recenti.forEach((r, i) => {
    if (r[f][0] === a.id) p *= i === 0 ? 0.05 : 0.3;
    else if (r[f].includes(a.id)) p *= 0.7;
  });
  return p;
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

function costruisci(c: ContestoGiornata, recenti: Palinsesto[]): Palinsesto {
  const possibili = AZIONI.filter((a) => ammessa(a, c));
  const rnd = casuale(hash(`${c.seme}|${c.giorno}`));
  const usate = new Set<string>();
  let ferme = 0;
  const out = {} as Palinsesto;

  // L'azione dell'AI va nella fascia che le si addice di più (la prima tra le sue).
  const scelta = c.azioneDelGiorno && INFO[c.azioneDelGiorno] && possibili.some((a) => a.id === c.azioneDelGiorno) ? c.azioneDelGiorno : null;
  const fasciaAI = scelta ? INFO[scelta].fasce[Math.floor(rnd() * INFO[scelta].fasce.length)] : null;

  for (const f of FASCE_DI_GIORNO) {
    const pesi: [string, number][] = possibili
      .filter((a) => !usate.has(a.id))
      .map((a) => {
        let p = peso(a, f, c, recenti);
        if (ferme >= 1 && INFO[a.id].ferma) p *= 0.08;
        return [a.id, p];
      });
    let lista = estrai(pesi, PER_FASCIA, rnd);
    if (f === fasciaAI && scelta) {
      // Se l'AI ripete quello che ha già scelto di recente, resta un'alternativa e non la principale.
      const ripete = c.azioniRecenti?.slice(0, 2).includes(scelta);
      const altre = lista.filter((x) => x !== scelta);
      lista = (ripete ? [altre[0], scelta, ...altre.slice(1)] : [scelta, ...altre]).filter(Boolean).slice(0, PER_FASCIA);
    }
    out[f] = lista;
    usate.add(lista[0]);
    if (INFO[lista[0]]?.ferma) ferme += 1;
  }

  // Almeno una attività di movimento al giorno come principale.
  if (!FASCE_DI_GIORNO.some((f) => INFO[out[f][0]]?.movimento)) {
    const f: FasciaDiGiorno = "pomeriggio";
    const mov = estrai(
      possibili.filter((a) => INFO[a.id].movimento && !usate.has(a.id)).map((a) => [a.id, peso(a, f, c, recenti)]),
      1,
      rnd,
    )[0];
    if (mov) out[f] = [mov, ...out[f].filter((x) => x !== mov)].slice(0, PER_FASCIA);
  }
  return out;
}

/**
 * Il palinsesto del giorno: per ogni fascia, 3 attività (la prima è la principale).
 * Tiene conto dei due giorni prima, ricostruiti con lo stesso seme, per non ripetersi.
 */
export function giornataDi(c: ContestoGiornata): Palinsesto {
  const ieri2 = costruisci({ ...c, giorno: c.giorno - 2, azioneDelGiorno: null }, []);
  const ieri = costruisci({ ...c, giorno: c.giorno - 1, azioneDelGiorno: null }, [ieri2]);
  return costruisci(c, [ieri, ieri2]);
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
