import { attrezzo, verso, type Attrezzo, type Canali, type Lato } from "./canali";
import type { Copione, Regia } from "./copione";
import type { Palco } from "./scenette";

// I gesti: mattoncini da cui si montano le attività dei mestieri.
// Le coordinate sono quelle del mondo del personaggio (terreno a y = 262,
// albero a casa con il centro a x = 120); `luogo` le traduce per il busto.

export interface Luogo {
  /** Valore del canale x per stare con il centro a `centro`. */
  x: number;
  centro: number;
  seduto: boolean;
  /** Punto del mondo → coordinate del busto (per la cinematica inversa). */
  qui: (ax: number, ay: number) => [number, number];
}

export function luogo(p: Palco, centro: number, seduto = false): Luogo {
  return {
    x: centro - 120 - (p.casa ?? 0),
    centro,
    seduto,
    qui: (ax, ay) => [ax - centro + 120, ay - (seduto ? 22 : 0)],
  };
}

/** La mano va a un punto del mondo. */
export function mano(l: Luogo, lato: Lato, ax: number, ay: number, angolo = 0, allunga = 1): Partial<Canali> {
  const [x, y] = l.qui(ax, ay);
  return verso(lato, x, y, angolo, allunga);
}

const canale = (lato: Lato) => (lato === "sx" ? "attrSx" : "attrDx");

/** Prende o lascia un attrezzo (scatto: non passa da uno all'altro). */
export function prendi(c: Copione, lato: Lato, a: Attrezzo | null) {
  c.vai(0.01, { [canale(lato)]: attrezzo(a) } as Partial<Canali>, "scatto");
}

/** Cammina fino a un luogo (solo in orizzontale), poi si rimette di fronte o guarda da una parte. */
export function cammina(c: Copione, p: Palco, a: number, guarda = 0) {
  const da = c.valoreA("x");
  const d = a - da;
  if (Math.abs(d) < 2) {
    c.vai(0.3, { verso: guarda });
    return;
  }
  const dir = Math.sign(d);
  c.vai(0.25, { verso: dir, passo: p.ridotto ? 0.6 : 1, cadenza: 2, braccioPasso: 1 });
  const t = Math.max(0.5, Math.abs(d) / (p.ridotto ? 50 : 80));
  c.con(t, { x: a }, "io").pausa(t);
  c.vai(0.25, { verso: guarda, passo: 0, braccioPasso: 0 });
}

export function siediti(c: Copione, p: Palco) {
  c.vai(0.35, { seduto: 1, sy: p.ridotto ? 1 : 0.94 }, "in").vai(0.3, { sy: 1 }, "molla");
}

export function alzati(c: Copione, p: Palco) {
  c.vai(0.3, { seduto: 0, sy: p.ridotto ? 1 : 1.04 }, "out").vai(0.25, { sy: 1 }, "molla");
}

/** Colpi ripetuti (martello, timbro, sega): la mano va da `su` a `giu` e torna. */
export function colpi(
  c: Copione,
  l: Luogo,
  lato: Lato,
  su: [number, number],
  giu: [number, number],
  volte: number,
  durata: number,
  alColpo?: (r: Regia, i: number) => void,
  extra: Partial<Canali> = {},
  allunga = 1,
) {
  const meta = durata / 2;
  for (let i = 0; i < volte; i++) {
    c.vai(meta * 0.9, { ...mano(l, lato, su[0], su[1], 0, allunga), ...extra }, "out");
    c.vai(meta * 0.6, mano(l, lato, giu[0], giu[1], 0, allunga), "in");
    if (alColpo) c.evento((r) => alColpo(r, i));
    c.pausa(meta * 0.5);
  }
}

export function sospira(c: Copione) {
  c.vai(0.6, { sy: 1.04, chiomaSy: 1.02 }).vai(0.7, { sy: 0.98, chiomaSy: 0.99 }).vai(0.4, { sy: 1, chiomaSy: 1 });
}

/** Si asciuga la fronte col dorso della mano destra. */
export function asciugaFronte(c: Copione, l: Luogo) {
  c.vai(0.35, mano(l, "dx", l.centro + 22, l.seduto ? 172 : 150));
  c.vai(0.4, mano(l, "dx", l.centro - 12, l.seduto ? 173 : 151));
  c.evento((r) => r.emetti("sudore", 96, 150, { vx: -60, vy: -40, gravita: 380, vita: 0.8 }));
}

/** Mani sui fianchi, soddisfatto. */
export function manoSuiFianchi(c: Copione, l: Luogo, d = 0.4) {
  c.vai(d, { ...mano(l, "sx", l.centro - 19, 208 + (l.seduto ? 22 : 0)), ...mano(l, "dx", l.centro + 19, 208 + (l.seduto ? 22 : 0)) });
}

export function saltelloContento(c: Copione, p: Palco) {
  if (p.ridotto) return;
  const t0 = c.ora;
  c.vai(0.1, { sy: 0.92, sx: 1.05 }, "out").vai(0.18, { y: -10, sy: 1.05, sx: 0.97 }, "out").vai(0.16, { y: 0, sy: 1, sx: 1 }, "in").vai(0.25, { sy: 1 }, "molla");
  c.a(t0);
}

export const SORRISO = { boccaL: 8, boccaY: 0, boccaSu: 8, boccaGiu: 8, boccaStorta: 0 };
export const RISATA = { boccaL: 9, boccaY: -1, boccaSu: 0, boccaGiu: 14, boccaStorta: 0 };
export const BOCCA_O = { boccaL: 3.4, boccaY: 3, boccaSu: -7, boccaGiu: 7, boccaStorta: 0 };
export const SERIO = { boccaL: 6, boccaY: 3, boccaSu: 0, boccaGiu: 0, boccaStorta: 0 };
