import type { Indumento } from "./tipi";

// Carattere e strade possibili. Tutti partono da un seme uguale:
// i tratti sono casuali alla nascita e la strada la sceglie l'albero.

export const TRATTI = [
  "curiosita",
  "ambizione",
  "pigrizia",
  "furbizia",
  "creativita",
  "socievolezza",
  "energia",
] as const;
export type Tratto = (typeof TRATTI)[number];
export type Tratti = Record<Tratto, number>;

export const NOMI_TRATTI: Record<Tratto, string> = {
  curiosita: "Curiosità",
  ambizione: "Ambizione",
  pigrizia: "Pigrizia",
  furbizia: "Furbizia",
  creativita: "Creatività",
  socievolezza: "Socievolezza",
  energia: "Energia",
};

export const STRADE = [
  "filosofo",
  "imprenditore",
  "artista",
  "sportivo",
  "furfante",
  "viaggiatore",
  "poeta",
] as const;
export type Strada = (typeof STRADE)[number];
export type PunteggiStrade = Partial<Record<Strada, number>>;

export const INFO_STRADE: Record<
  Strada,
  { nome: string; indizio: string; accessorio: Indumento; descrizione: string }
> = {
  filosofo: {
    nome: "Il filosofo",
    indizio: "fa domande strane al vento",
    accessorio: "occhiali-tondi",
    descrizione: "Si chiede perché le foglie cadono sempre verso il basso.",
  },
  imprenditore: {
    nome: "L'imprenditore",
    indizio: "conta tutto, anche le formiche",
    accessorio: "cravatta",
    descrizione: "Ha un piano d'impresa per ogni metro quadro d'ombra.",
  },
  artista: {
    nome: "L'artista",
    indizio: "si sporca di colore senza motivo",
    accessorio: "basco",
    descrizione: "Dipinge tramonti, soprattutto quando è mezzogiorno.",
  },
  sportivo: {
    nome: "Lo sportivo",
    indizio: "non riesce a stare fermo",
    accessorio: "fascia",
    descrizione: "Si allena tutti i giorni, radici comprese.",
  },
  furfante: {
    nome: "Il furfante del bosco",
    indizio: "ha un'aria un po' troppo furba",
    accessorio: "bandana",
    descrizione:
      "Ruba le ghiande allo scoiattolo e le rivende al mercato nero del bosco.",
  },
  viaggiatore: {
    nome: "Il viaggiatore",
    indizio: "guarda sempre lontano",
    accessorio: "zaino",
    descrizione: "Non può muoversi, ma colleziona cartoline da tutto il mondo.",
  },
  poeta: {
    nome: "Il poeta pigro",
    indizio: "sbadiglia in rima",
    accessorio: "piuma",
    descrizione: "Scrive un verso al giorno, poi si riposa per sei.",
  },
};

/** Tratti casuali alla nascita: ogni albero parte diverso. */
export function trattiCasuali(rnd: () => number = Math.random): Tratti {
  const t = {} as Tratti;
  for (const k of TRATTI) {
    // Somma di due casuali: valori più spesso nel mezzo, qualche estremo.
    t[k] = Math.round(((rnd() + rnd()) / 2) * 90 + 5);
  }
  return t;
}

/** Inclinazioni naturali verso ogni strada, 0-100, dai tratti. */
export function inclinazioni(t: Tratti): Record<Strada, number> {
  const m = (...v: number[]) => Math.round(v.reduce((a, b) => a + b, 0) / v.length);
  return {
    filosofo: m(t.curiosita, t.curiosita, 100 - t.energia),
    imprenditore: m(t.ambizione, t.ambizione, t.furbizia),
    artista: m(t.creativita, t.creativita, t.curiosita),
    sportivo: m(t.energia, t.energia, t.ambizione),
    furfante: m(t.furbizia, t.furbizia, 100 - t.ambizione / 2),
    viaggiatore: m(t.curiosita, t.energia, t.socievolezza),
    poeta: m(t.pigrizia, t.pigrizia, t.creativita),
  };
}

/** Le strade ordinate dal punteggio più alto. */
export function classifica(p: PunteggiStrade): [Strada, number][] {
  return STRADE.map((s) => [s, p[s] ?? 0] as [Strada, number]).sort(
    (a, b) => b[1] - a[1],
  );
}

export const SOGLIA_STRADA = 25;
export const VANTAGGIO_STRADA = 6;

/** La strada si rivela quando la prima arriva a 25 con 6 punti di vantaggio. */
export function stradaRivelata(p: PunteggiStrade): Strada | null {
  const [[prima, a], [, b]] = classifica(p);
  return a >= SOGLIA_STRADA && a - b >= VANTAGGIO_STRADA ? prima : null;
}

export function isStrada(s: string | null | undefined): s is Strada {
  return !!s && (STRADE as readonly string[]).includes(s);
}
