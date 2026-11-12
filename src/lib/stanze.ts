// Le stanze (docs/stanze-e-vita.md, sezione 2): regole pure, senza database.
// I numeri marcati «proposta» aspettano la conferma di Federico (sezione 16).
// Il pacchetto qui è quello nuovo (Albero, Famiglia, Foresta, docs/modello-di-business.md);
// gli extra del Premium restano su `trees.plan` (src/lib/piani.ts).

/** Il cookie con l'albero che la persona sta guardando (src/lib/alberi.ts). */
export const COOKIE_ALBERO = "linfa-albero";

export const ID_PACCHETTI_CONTO = ["albero", "famiglia", "foresta"] as const;
export type PacchettoConto = (typeof ID_PACCHETTI_CONTO)[number];

export function isPacchettoConto(v: unknown): v is PacchettoConto {
  return typeof v === "string" && (ID_PACCHETTI_CONTO as readonly string[]).includes(v);
}

export const NOMI_PACCHETTO_CONTO: Record<PacchettoConto, string> = {
  albero: "Albero",
  famiglia: "Famiglia",
  foresta: "Foresta",
};

/** Massimo di stanze per persona (Federico, 12/11/2026). */
export const STANZE_MASSIME = 10;
/** Una stanza in più ogni tanti alberi piantati (Federico, 12/11/2026). */
export const ALBERI_PER_STANZA_IN_PIU = 5;
/** Stanze regalate a ogni rinnovo annuale (Federico, 12/11/2026). */
export const STANZE_PER_RINNOVO = 1;
/** Stanze di partenza per pacchetto. Proposta, da decidere (sezione 16, punto 3). */
export const STANZE_DI_BASE: Record<PacchettoConto, number> = { albero: 1, famiglia: 2, foresta: 3 };
/** Alberi in una stanza. Proposta (sezione 16, punto 8): oltre, sul telefono non si legge. */
export const CAPIENZA_STANZA = 4;
/** Alberi digitali del pacchetto (docs/modello-di-business.md, «I pacchetti nuovi»). */
export const ALBERI_DEL_PACCHETTO: Record<PacchettoConto, number> = { albero: 1, famiglia: 3, foresta: 7 };

export interface Conto {
  pacchetto: PacchettoConto;
  /** Alberi digitali avuti in tutto (sezione 2.1; i semi regalati: sezione 16, punto 5). */
  alberiPiantati: number;
  rinnovi: number;
}

/** `stanze = min(10, base del piano + floor(alberi piantati / 5) + rinnovi)`. */
export function stanzeSbloccate({ pacchetto, alberiPiantati, rinnovi }: Conto): number {
  const totale =
    STANZE_DI_BASE[pacchetto] + Math.floor(Math.max(0, alberiPiantati) / ALBERI_PER_STANZA_IN_PIU) + Math.max(0, rinnovi) * STANZE_PER_RINNOVO;
  return Math.max(1, Math.min(STANZE_MASSIME, totale));
}

/**
 * Quanti alberi si possono avere insieme: quelli del pacchetto, più un seme per
 * albero a ogni rinnovo («Ogni anno che rinnovi: un seme per un nuovo albero
 * digitale», uguale per ogni albero del pacchetto). Mai più di quanti ne stanno
 * nelle stanze.
 */
export function alberiMassimi(c: Conto): number {
  const dalPacchetto = ALBERI_DEL_PACCHETTO[c.pacchetto] * (1 + Math.max(0, c.rinnovi));
  return Math.min(dalPacchetto, STANZE_MASSIME * CAPIENZA_STANZA);
}

/** Che cosa apre la prossima stanza, per il cartello della stanza chiusa. Null se sono già tutte aperte. */
export function regolaProssimaStanza(c: Conto): { alberiMancanti: number; testo: string } | null {
  const aperte = stanzeSbloccate(c);
  if (aperte >= STANZE_MASSIME) return null;
  const mancanti = ALBERI_PER_STANZA_IN_PIU - (Math.max(0, c.alberiPiantati) % ALBERI_PER_STANZA_IN_PIU);
  return {
    alberiMancanti: mancanti,
    testo: `${mancanti === 1 ? "Pianta un altro albero" : `Pianta altri ${mancanti} alberi`} o rinnova l'anno`,
  };
}

/** Il nome di una stanza appena aperta. La prima è il giardino di sempre. */
export function nomeStanza(numero: number): string {
  return numero === 1 ? "Il giardino" : `Stanza ${numero}`;
}

// ——— I posti della stanza 2D (sezione 2.3) ———

export const POSTI_STANZA = [
  { id: "sfondo", nome: "Sfondo", quanti: 2, per: "edifici" },
  { id: "prato-sinistro", nome: "Prato sinistro", quanti: 2, per: "arredi grandi" },
  { id: "prato-destro", nome: "Prato destro", quanti: 2, per: "arredi grandi" },
  { id: "davanti", nome: "Davanti", quanti: 2, per: "arredi piccoli" },
  { id: "rami", nome: "Rami", quanti: 2, per: "cose appese" },
  { id: "armadio", nome: "Armadio", quanti: 1, per: "vestiti (si vedono addosso)" },
  { id: "attrezzi", nome: "Cassetta degli attrezzi", quanti: 1, per: "attrezzi (si vedono in mano)" },
] as const;
export type PostoStanza = (typeof POSTI_STANZA)[number]["id"];

/**
 * Un oggetto sistemato in un posto della stanza. È l'aggancio per `room_items`
 * (fase 3): `posto` e `indice` dicono dove, `id` e `nome` che cosa.
 */
export interface ArredoInStanza {
  posto: PostoStanza;
  indice: number;
  id: string;
  nome: string;
}

/**
 * Dove si vede ciascun posto nella scena: `x` in percentuale della larghezza,
 * `alto` sopra il prato (in proporzione all'albero). Armadio e attrezzi non si
 * disegnano: si vedono addosso o in mano.
 */
export const DOVE_POSTO: Record<Exclude<PostoStanza, "armadio" | "attrezzi">, { x: [number, number]; alto: number; scala: number }> = {
  sfondo: { x: [24, 76], alto: 0.12, scala: 0.6 },
  "prato-sinistro": { x: [8, 20], alto: 0, scala: 0.5 },
  "prato-destro": { x: [80, 92], alto: 0, scala: 0.5 },
  davanti: { x: [34, 66], alto: -0.06, scala: 0.32 },
  rami: { x: [44, 56], alto: 0.55, scala: 0.25 },
};

/** Gli arredi nei posti che si vedono, ognuno con la sua posizione. Quelli in un posto pieno restano fuori. */
export function arrediInScena(arredi: ArredoInStanza[]) {
  return arredi.flatMap((a) => {
    if (a.posto === "armadio" || a.posto === "attrezzi") return [];
    const posto = POSTI_STANZA.find((p) => p.id === a.posto);
    if (!posto || a.indice < 0 || a.indice >= posto.quanti) return [];
    const d = DOVE_POSTO[a.posto];
    return [{ ...a, x: d.x[Math.min(a.indice, d.x.length - 1)], alto: d.alto, scala: d.scala }];
  });
}

// ——— Più alberi nella stessa stanza ———

/**
 * Dove stanno gli alberi della stanza: il protagonista (quello scelto) davanti,
 * gli altri un passo indietro e più piccoli. `x` in percentuale della larghezza.
 */
export function disposizione(quanti: number): { protagonista: number; compagni: number[] } {
  switch (Math.max(1, Math.min(CAPIENZA_STANZA, quanti))) {
    case 1:
      return { protagonista: 50, compagni: [] };
    case 2:
      return { protagonista: 40, compagni: [84] };
    case 3:
      return { protagonista: 50, compagni: [12, 88] };
    default:
      return { protagonista: 50, compagni: [10, 90, 29] };
  }
}
