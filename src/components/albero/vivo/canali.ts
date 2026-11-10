import type { AnimBraccio, AnimCorpo, Braccio, Effetto, Indumento, Oggetto, Posa } from "@/lib/albero/tipi";

// I «canali» del pupazzo: ogni articolazione e ogni espressione è un numero.
// Le scenette e le interazioni muovono questi numeri; il motore li trasforma
// in coordinate SVG a ogni fotogramma. Coordinate del personaggio: 240 x 280,
// terreno a y = 262, come nel disegno di partenza.

export const TERRA = 262;

/** Lunghezze delle ossa: braccio (spalla-gomito, gomito-mano) e gamba (anca-ginocchio, ginocchio-caviglia). */
export const OSSA = { braccio: [24, 23], gamba: [20, 20] } as const;

export const SPALLA = { sx: { x: 96, y: 178 }, dx: { x: 144, y: 178 } } as const;
export const ANCA = { sx: { x: 108, y: 214 }, dx: { x: 132, y: 214 } } as const;
export const OCCHIO = { sx: { x: 110, y: 164 }, dx: { x: 130, y: 164 } } as const;
export const BOCCA_Y = 181;

export type Lato = "sx" | "dx";

export const BASE_CANALI = {
  // Corpo intero: spostamento, rotazione e schiacciamento attorno ai piedi (120, 262).
  x: 0,
  y: 0,
  rot: 0,
  sx: 1,
  sy: 1,
  seduto: 0,
  /** -1 guarda a sinistra, 0 di fronte, 1 a destra: sposta la faccia e orienta il passo. */
  verso: 0,
  // Faccia
  fy: 0,
  palpebra: 0,
  palpebraInc: 0,
  occhiolino: 0,
  pupX: 0,
  pupY: 1,
  sbarra: 0,
  felice: 0,
  stella: 0,
  cigliaY: 0,
  cigliaRot: 0,
  boccaL: 8,
  boccaY: 0,
  boccaSu: 8,
  boccaGiu: 8,
  boccaStorta: 0,
  parla: 0,
  guance: 1,
  // Braccia: angoli in gradi (spalla positiva = in alto, verso l'esterno).
  sxSpalla: -46,
  sxGomito: -8,
  sxMano: 0,
  sxAnim: 0,
  sxOgg: 0,
  sxAllunga: 1,
  dxSpalla: -46,
  dxGomito: -8,
  dxMano: 0,
  dxAnim: 0,
  dxOgg: 0,
  dxAllunga: 1,
  braccioPasso: 0,
  // Gambe: passo 0 fermo, 1 camminata, 2 corsa; cadenza in passi al secondo.
  passo: 0,
  cadenza: 1.8,
  sxAnca: 0,
  sxGinocchio: 0,
  dxAnca: 0,
  dxGinocchio: 0,
  radici: 0,
  // Chioma e movimento del corpo previsto dalla posa
  chiomaRot: 0,
  chiomaSx: 1,
  chiomaSy: 1,
  corpoAnim: 1,
  // Accessori e oggetti
  occhiali: 0,
  berretto: 0,
  sciarpa: 0,
  cappello: 0,
  libro: 1,
  pagina: 0,
  schiuma: 0,
  davantiY: 0,
  davantiRot: 0,
};

export type Canale = keyof typeof BASE_CANALI;
export type Canali = Record<Canale, number>;
export const NOMI_CANALI = Object.keys(BASE_CANALI) as Canale[];

/** Quello che della posa non è un numero: tipo di gesto, oggetti, effetti. */
export interface Figura {
  anim: Record<Lato, AnimBraccio | undefined>;
  corpo: AnimCorpo;
  oggetti: Oggetto[];
  effetti: Effetto[];
  indossa: Indumento[];
}

const BOCCHE: Record<Posa["bocca"], Partial<Canali>> = {
  sorriso: { boccaL: 8, boccaY: 0, boccaSu: 8, boccaGiu: 8, boccaStorta: 0, parla: 0 },
  grande: { boccaL: 9, boccaY: -1, boccaSu: 0, boccaGiu: 15, boccaStorta: 0, parla: 0 },
  o: { boccaL: 3.4, boccaY: 3, boccaSu: -7.5, boccaGiu: 7.5, boccaStorta: 0, parla: 0 },
  parla: { boccaL: 5, boccaY: 2.5, boccaSu: -3, boccaGiu: 4, boccaStorta: 0, parla: 1 },
  neutro: { boccaL: 5, boccaY: 3, boccaSu: 0, boccaGiu: 0, boccaStorta: 0, parla: 0 },
  ghigno: { boccaL: 9, boccaY: 1, boccaSu: 6, boccaGiu: 6, boccaStorta: -3, parla: 0 },
};

const OCCHI: Record<Posa["occhi"], Partial<Canali>> = {
  aperti: { palpebra: 0, palpebraInc: 0, pupX: 0, pupY: 1, felice: 0, stella: 0 },
  chiusi: { palpebra: 1, palpebraInc: 0, pupX: 0, pupY: 1, felice: 0, stella: 0 },
  su: { palpebra: 0, palpebraInc: 0, pupX: 0, pupY: -2.5, felice: 0, stella: 0 },
  giu: { palpebra: 0.28, palpebraInc: 0, pupX: 0, pupY: 2.5, felice: 0, stella: 0 },
  furbi: { palpebra: 0.45, palpebraInc: -3, pupX: 2, pupY: 1.5, felice: 0, stella: 0 },
  felici: { palpebra: 0, palpebraInc: 0, pupX: 0, pupY: 1, felice: 1, stella: 0 },
  sognanti: { palpebra: 0.1, palpebraInc: 0, pupX: 0, pupY: -2, felice: 0, stella: 1 },
};

export const BOCCA = BOCCHE;
export const SGUARDI = OCCHI;

/** Angoli di spalla, gomito e mano per le due forme del braccio di partenza. */
export function articolazioni(b: Braccio): { spalla: number; gomito: number; mano: number } {
  return b.forma === "dritto"
    ? { spalla: b.angolo + 4, gomito: -8, mano: 0 }
    : { spalla: b.angolo - 60, gomito: -104, mano: 0 };
}

/** Dalla posa del catalogo ai canali del pupazzo. */
export function canaliDaPosa(p: Posa): Canali {
  const c: Canali = { ...BASE_CANALI, ...OCCHI[p.occhi], ...BOCCHE[p.bocca] };
  for (const lato of ["sx", "dx"] as const) {
    const b = p[lato];
    const a = articolazioni(b);
    c[`${lato}Spalla`] = a.spalla;
    c[`${lato}Gomito`] = a.gomito;
    c[`${lato}Mano`] = a.mano;
    c[`${lato}Anim`] = b.anim && b.anim !== "oscilla" ? 1 : 0;
    if (b.anim === "oscilla") c.braccioPasso = 1;
  }
  if (p.gambe === "cammina") {
    c.passo = 1;
    c.cadenza = 1.8;
  } else if (p.gambe === "corsa") {
    c.passo = 2;
    c.cadenza = 2.9;
  } else if (p.gambe === "incrociate") {
    c.seduto = 1;
  }
  if (p.effetti.includes("schiuma")) c.schiuma = 1;
  return c;
}

export function figuraDaPosa(p: Posa): Figura {
  return {
    anim: { sx: p.sx.anim, dx: p.dx.anim },
    corpo: p.corpo,
    oggetti: p.oggetti,
    effetti: p.effetti,
    indossa: p.indossa,
  };
}

const gradi = (r: number) => (r * 180) / Math.PI;

/** Dove si tiene ogni oggetto: in una mano, davanti con due mani, o per terra. */
export const DOVE: Record<Oggetto, Lato | "davanti" | "terra"> = {
  libro: "davanti",
  giornale: "dx",
  ombrello: "sx",
  telefono: "dx",
  pennello: "dx",
  cavalletto: "terra",
  quaderno: "davanti",
  penna: "dx",
  manubrio: "dx",
  ghiande: "terra",
  cartello: "terra",
  scoiattolo: "terra",
  valigia: "terra",
  mappa: "davanti",
  annaffiatoio: "dx",
  tazza: "dx",
};

/** Un braccio è libero se non tiene niente e non ha un gesto suo. */
export function braccioLibero(f: Figura, lato: Lato): boolean {
  if (f.anim[lato]) return false;
  return !f.oggetti.some((o) => DOVE[o] === lato || DOVE[o] === "davanti");
}

/**
 * Cinematica inversa a due ossa: dove deve stare la mano (coordinate del busto),
 * quali angoli servono a spalla e gomito. Il gomito resta in fuori.
 * `mano` è l'angolo della mano rispetto al braccio (0 = prosegue l'avambraccio).
 * `allunga` stira le ossa come un elastico, da cartone animato.
 */
export function verso(lato: Lato, x: number, y: number, mano = 0, allunga = 1): Partial<Canali> {
  const l1 = OSSA.braccio[0] * allunga;
  const l2 = OSSA.braccio[1] * allunga;
  const s = SPALLA[lato];
  const sigma = lato === "sx" ? -1 : 1;
  const dx = x - s.x;
  const dy = y - s.y;
  const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.5), l1 + l2 - 0.05);
  const theta = gradi(Math.atan2(-dy, sigma * dx));
  const alfa = gradi(Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const beta = gradi(Math.acos((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2)));
  // Il gomito va sempre dalla parte dell'esterno (angolo 0): sotto la linea
  // spalla-mano se la mano è in alto, sopra se la mano è in basso.
  const sopra = theta >= 0;
  const spalla = sopra ? theta - alfa : theta + alfa;
  const gomito = sopra ? 180 - beta : -(180 - beta);
  return {
    [`${lato}Spalla`]: spalla,
    [`${lato}Gomito`]: gomito,
    [`${lato}Mano`]: mano,
    [`${lato}Allunga`]: allunga,
  } as Partial<Canali>;
}
