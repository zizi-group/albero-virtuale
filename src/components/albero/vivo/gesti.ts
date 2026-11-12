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

// ——— Gesti della 0.2 (docs/stanze-e-vita.md, sezione 8) ———
// Mattoncini per le attività quotidiane (vivo/attivita.ts) e gli intermezzi.
// Tutti partono e finiscono in una posizione «pulita» (braccia lungo i fianchi
// o la postura dell'attività) e, col movimento ridotto, evitano salti e scosse.

export const BRACCIA_GIU = { sxSpalla: -50, sxGomito: -8, sxMano: 0, sxAllunga: 1, dxSpalla: -50, dxGomito: -8, dxMano: 0, dxAllunga: 1 };
export const FELICE = { felice: 1, ...SORRISO };

type TipoEffetto = Parameters<Regia["emetti"]>[0];

/** Si china in avanti (le ginocchia cedono, il corpo si schiaccia). */
export function chinati(c: Copione, p: Palco, quanto = 1, d = 0.35) {
  c.vai(d, { sy: 1 - (p.ridotto ? 0.06 : 0.11) * quanto, sx: 1 + 0.04 * quanto, fy: 2 * quanto, pupY: 2.5 }, "out");
}

/** Si rialza dopo essersi chinato. */
export function rialzati(c: Copione, d = 0.35) {
  c.vai(d, { sy: 1, sx: 1, fy: 0, pupY: 1 }, "out");
}

/** Si china, prende qualcosa da terra (l'attrezzo compare in mano) e torna su con la mano davanti. */
export function raccogli(c: Copione, p: Palco, l: Luogo, lato: Lato, x: number, a: Attrezzo | null) {
  chinati(c, p);
  c.vai(0.35, mano(l, lato, x, 244, 0, 1.6), "out");
  if (a) prendi(c, lato, a);
  c.evento((r) => r.emetti("polvere", x, 254, { vy: -8, vita: 0.5, scala: 0.3, mondo: true }));
  rialzati(c, 0.3);
  c.vai(0.35, mano(l, lato, l.centro + (lato === "dx" ? 16 : -16), 200), "out");
}

/** Si china e posa a terra quello che ha in mano. */
export function posaGiu(c: Copione, p: Palco, l: Luogo, lato: Lato, x: number, alPosare?: (r: Regia) => void) {
  chinati(c, p, 0.9);
  c.vai(0.35, mano(l, lato, x, 244, 0, 1.6), "in");
  prendi(c, lato, null);
  if (alPosare) c.evento(alPosare);
  rialzati(c, 0.3);
  c.vai(0.3, { [`${lato}Spalla`]: -50, [`${lato}Gomito`]: -8, [`${lato}Mano`]: 0, [`${lato}Allunga`]: 1 } as Partial<Canali>);
}

/** Porta qualcosa con tutte e due le mani davanti, camminando fino al centro `a` (mondo). */
export function porta(c: Copione, p: Palco, l: Luogo, a: number) {
  c.vai(0.3, { ...mano(l, "sx", l.centro - 10, 204), ...mano(l, "dx", l.centro + 10, 204), braccioPasso: 0 });
  const da = c.valoreA("x");
  const xa = a - 120 - (p.casa ?? 0);
  const d = xa - da;
  if (Math.abs(d) < 2) return;
  c.vai(0.2, { verso: Math.sign(d), passo: p.ridotto ? 0.5 : 0.9, cadenza: 2.2 });
  const t = Math.max(0.5, Math.abs(d) / (p.ridotto ? 45 : 70));
  c.con(t, { x: xa }, "io").pausa(t);
  c.vai(0.2, { passo: 0 });
}

/** Inclina la mano e versa (gocce, semi, succo) su un punto del mondo. */
export function versa(c: Copione, l: Luogo, lato: Lato, x: number, y: number, durata: number, tipo: "goccia" | "polvere" | "succo" = "goccia") {
  c.vai(0.35, mano(l, lato, x + (lato === "dx" ? -14 : 14), y - 22, 0, 1.3));
  c.vai(0.3, { [`${lato}Ogg`]: lato === "dx" ? 60 : -60 } as Partial<Canali>);
  for (let t = 0.1; t < durata; t += 0.22) {
    const dx = ((t * 37) % 8) - 4;
    c.evento((r) => r.emetti(tipo, x + dx, y - 8, { vy: 30, gravita: 320, vita: 0.6, scala: 0.7, mondo: true }), t);
  }
  c.pausa(durata);
  c.vai(0.3, { [`${lato}Ogg`]: 0 } as Partial<Canali>);
}

/** Mescola in tondo (pentola, ciotola). */
export function mescola(c: Copione, l: Luogo, lato: Lato, cx: number, cy: number, giri: number, raggio = 7) {
  c.vai(0.3, mano(l, lato, cx + raggio, cy, 0, 1.3));
  for (let g = 0; g < giri; g++) {
    for (let k = 1; k <= 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      c.vai(0.13, mano(l, lato, cx + Math.cos(a) * raggio, cy + Math.sin(a) * raggio * 0.45, 0, 1.3), "lin");
    }
  }
}

/** Colpi con un attrezzo a due mani (zappa, pestello): la destra guida, la sinistra segue più in basso. */
export function scava(c: Copione, p: Palco, l: Luogo, x: number, volte: number, alColpo?: (r: Regia, i: number) => void, y = 236) {
  for (let i = 0; i < volte; i++) {
    c.vai(0.35, { ...mano(l, "dx", l.centro + 18, y - 76), ...mano(l, "sx", l.centro + 4, y - 54), sy: 1.03 }, "out");
    c.vai(0.2, { ...mano(l, "dx", x, y, 0, 1.55), ...mano(l, "sx", (x + l.centro) / 2, y - 16, 0, 1.3), sy: p.ridotto ? 0.97 : 0.92 }, "in");
    c.evento((r) => {
      r.emetti("polvere", x, y + 20, { vx: -20, vy: -30, gravita: 120, vita: 0.6, scala: 0.45, mondo: true });
      alColpo?.(r, i);
    });
    c.pausa(0.15);
  }
  c.vai(0.3, { sy: 1 });
}

/** Rastrella: tira verso di sé, a colpi lunghi, da `da` ad `a` (mondo). */
export function rastrella(c: Copione, p: Palco, l: Luogo, da: number, a: number, volte: number, alColpo?: (r: Regia, i: number) => void) {
  for (let i = 0; i < volte; i++) {
    c.vai(0.35, { ...mano(l, "dx", da, 222, 0, 1.4), ...mano(l, "sx", (da + l.centro) / 2, 206, 0, 1.2), rot: (da < l.centro ? -1 : 1) * (p.ridotto ? 1 : 3) }, "out");
    c.vai(0.55, { ...mano(l, "dx", a, 226, 0, 1.2), ...mano(l, "sx", (a + l.centro) / 2, 208, 0, 1.1), rot: 0 }, "io");
    c.evento((r) => {
      r.emetti("foglia", a, 252, { vx: (a - da) * 0.6, vy: -20, gravita: 60, vita: 1, scala: 0.7, mondo: true });
      alColpo?.(r, i);
    });
  }
}

/** Spazza: colpi corti e svelti, a destra e a sinistra, con la polvere. */
export function spazza(c: Copione, p: Palco, l: Luogo, x: number, volte: number) {
  for (let i = 0; i < volte; i++) {
    const s = i % 2 ? 1 : -1;
    c.vai(0.22, { ...mano(l, "dx", x + s * 14, 236, 0, 1.45), ...mano(l, "sx", l.centro + s * 4, 196), rot: s * (p.ridotto ? 0.5 : 1.5) }, "io");
    c.evento((r) => r.emetti("polvere", x + s * 18, 256, { vx: s * 40, vy: -10, vita: 0.5, scala: 0.4, mondo: true }));
  }
  c.vai(0.25, { rot: 0 });
}

/** Strofina con tutte e due le mani su un punto (bucato). */
export function strofina(c: Copione, l: Luogo, x: number, y: number, volte: number) {
  for (let i = 0; i < volte; i++) {
    c.vai(0.16, { ...mano(l, "sx", x - 8, y - 4, 0, 1.3), ...mano(l, "dx", x + 8, y + 4, 0, 1.3) }, "io");
    c.vai(0.16, { ...mano(l, "sx", x - 8, y + 4, 0, 1.3), ...mano(l, "dx", x + 8, y - 4, 0, 1.3) }, "io");
    if (i % 2) c.evento((r) => r.emetti("bolla", x, y - 6, { vx: 10, vy: -20, vita: 1, scala: 0.5, mondo: true }));
  }
}

/** Strizza: le mani girano in versi opposti, cadono gocce. */
export function strizza(c: Copione, l: Luogo) {
  c.vai(0.3, { ...mano(l, "sx", l.centro - 9, 196), ...mano(l, "dx", l.centro + 9, 196), boccaStorta: 3, palpebra: 0.4 });
  c.vai(0.5, { sxMano: 45, dxMano: -45, sy: 0.98 }, "io");
  for (let i = 0; i < 3; i++) c.evento((r) => r.emetti("goccia", 120 + (i - 1) * 5, 204, { vy: 20, vita: 0.8 }), i * 0.15);
  c.vai(0.4, { sxMano: 0, dxMano: 0, sy: 1, boccaStorta: 0, palpebra: 0 }, "io");
}

/** Intreccia: le mani si incrociano a turno davanti. */
export function intreccia(c: Copione, l: Luogo, volte: number, y = 200) {
  for (let i = 0; i < volte; i++) {
    const s = i % 2 ? 1 : -1;
    c.vai(0.28, { ...mano(l, "sx", l.centro + s * 6, y - 3), ...mano(l, "dx", l.centro - s * 6, y + 3) }, "io");
  }
  c.vai(0.25, { ...mano(l, "sx", l.centro - 9, y), ...mano(l, "dx", l.centro + 9, y) });
}

/** Tira: le mani si allontanano di scatto, come per tendere una corda. */
export function tira(c: Copione, p: Palco, l: Luogo, y = 198) {
  c.vai(0.2, { ...mano(l, "sx", l.centro - 6, y), ...mano(l, "dx", l.centro + 6, y) });
  c.vai(0.25, { ...mano(l, "sx", l.centro - 30, y - 4), ...mano(l, "dx", l.centro + 30, y - 4), sy: p.ridotto ? 1 : 1.03, cigliaY: -2 }, "back");
  c.pausa(0.3).vai(0.3, { sy: 1, cigliaY: 0 });
}

/** Mette una cosa sopra l'altra: a ogni giro la mano posa un po' più in alto. */
export function impila(c: Copione, l: Luogo, lato: Lato, x: number, base: number, n: number, alPosare?: (r: Regia, i: number) => void) {
  for (let i = 0; i < n; i++) {
    c.vai(0.3, mano(l, lato, x, base - 12 - i * 7, 0, 1.4), "out");
    c.vai(0.2, mano(l, lato, x, base - i * 7, 0, 1.4), "in");
    if (alPosare) c.evento((r) => alPosare(r, i));
    c.pausa(0.15);
  }
}

/** Lancia: carica indietro e lancia; la particella parte dalla mano. */
export function lancia(c: Copione, p: Palco, l: Luogo, lato: Lato, dir: number, tipo: TipoEffetto = "ghianda") {
  const s = lato === "dx" ? 1 : -1;
  c.vai(0.3, { ...mano(l, lato, l.centro + s * 34, 150), rot: -dir * (p.ridotto ? 0.5 : 3) }, "out");
  c.vai(0.15, { ...mano(l, lato, l.centro + dir * 40, 176, 0, 1.3), rot: dir * (p.ridotto ? 0.5 : 4) }, "in");
  c.evento((r) => r.emetti(tipo, ...l.qui(l.centro + dir * 44, 172), { vx: dir * 160, vy: -140, gravita: 420, vita: 1.3, giro: 300 }));
  prendi(c, lato, null);
  c.vai(0.3, { rot: 0 });
}

/** Indica un punto. */
export function indica(c: Copione, l: Luogo, lato: Lato, x: number, y: number, d = 0.4) {
  c.vai(d, { ...mano(l, lato, x, y, 0, 1.2), pupX: x < l.centro ? -2.2 : 2.2, pupY: y < 170 ? -2.4 : 1 });
}

/** Conta sulle dita, borbottando. */
export function contaDita(c: Copione, l: Luogo, volte: number) {
  c.vai(0.3, { ...mano(l, "sx", l.centro - 14, 190), ...mano(l, "dx", l.centro + 6, 188), parla: 0.6, pupY: 2.2 });
  for (let i = 0; i < volte; i++) {
    c.vai(0.14, { dxMano: 25, fy: 0.8 }, "out").vai(0.18, { dxMano: -5, fy: 0 }, "in");
  }
  c.vai(0.2, { parla: 0, pupY: 1, dxMano: 0 });
}

/** Soffia: guance gonfie, poi lo sbuffo (o le bolle, o le scintille) verso un punto del busto. */
export function soffia(c: Copione, x: number, y: number, dir: number, tipo: "sbuffo" | "bolla" | "scintilla" | "fumo" = "sbuffo", volte = 1) {
  for (let i = 0; i < volte; i++) {
    c.vai(0.3, { guance: 1.8, boccaL: 3, boccaSu: -4, boccaGiu: 4, boccaY: 3, sy: 1.02 });
    c.vai(0.25, { guance: 1, sy: 0.99 }, "out");
    c.evento((r) => {
      for (let k = 0; k < (tipo === "bolla" ? 3 : 2); k++) {
        r.emetti(tipo, x, y, { vx: dir * (40 + k * 18), vy: -12 - k * 8, vita: tipo === "bolla" ? 2.2 : 0.9, scala: tipo === "bolla" ? 0.9 + k * 0.3 : 0.6, cresce: tipo === "sbuffo" ? 1.6 : 1 });
      }
    });
  }
  c.vai(0.25, { ...SORRISO, sy: 1 });
}

/** Beve dalla tazza (o dal secchio): la mano alla bocca, gli occhi chiusi, il sorso. */
export function beve(c: Copione, l: Luogo, lato: Lato, sorsi = 1) {
  const s = lato === "dx" ? 1 : -1;
  c.vai(0.4, mano(l, lato, l.centro + s * 10, l.seduto ? 208 : 186, s * -40));
  for (let i = 0; i < sorsi; i++) {
    c.vai(0.35, { palpebra: 1, ...BOCCA_O, boccaL: 3, [`${lato}Mano`]: s * -70 } as Partial<Canali>);
    c.vai(0.12, { sy: 0.985 }).vai(0.15, { sy: 1 });
    c.vai(0.3, { palpebra: 0.3, [`${lato}Mano`]: s * -40, ...SORRISO } as Partial<Canali>);
  }
  c.vai(0.3, { palpebra: 0, felice: 1 }).pausa(0.3).vai(0.2, { felice: 0 });
}

/** Assaggia: un dito alla bocca, ci pensa, poi «mmm» (o una smorfia). */
export function assaggia(c: Copione, l: Luogo, lato: Lato, buono = true) {
  const s = lato === "dx" ? 1 : -1;
  c.vai(0.35, mano(l, lato, l.centro + s * 4, l.seduto ? 204 : 182));
  c.vai(0.2, { ...BOCCA_O, boccaL: 2.5, pupY: -1.5 }).pausa(0.3);
  c.vai(0.3, { [`${lato}Spalla`]: -50, [`${lato}Gomito`]: -8, [`${lato}Allunga`]: 1, pupX: s * 2, pupY: -2, boccaStorta: 2 } as Partial<Canali>);
  c.oscilla("boccaL", 1.2, 3, 0.6).pausa(0.6);
  if (buono) {
    c.vai(0.25, { felice: 1, ...SORRISO, boccaStorta: 0, pupX: 0, guance: 1.5 });
    c.evento((r) => r.emetti("cuore", 140, 160, { vx: 14, vy: -26, vita: 1.2, scala: 0.8 }));
    c.pausa(0.6).vai(0.25, { felice: 0, guance: 1, pupY: 1 });
  } else {
    c.vai(0.2, { cigliaY: 3, boccaL: 7, boccaSu: 3, boccaGiu: 3, boccaStorta: -3, palpebra: 0.5, pupX: 0 });
    c.oscilla("verso", 0.3, 3, 0.5).pausa(0.6);
    c.vai(0.3, { cigliaY: 0, ...SORRISO, palpebra: 0, pupY: 1 });
  }
}

/** Annusa l'aria: la faccia si sposta a scatti, il naso (la bocca) si muove. */
export function annusa(c: Copione, p: Palco, volte = 3) {
  for (let i = 0; i < volte; i++) {
    const s = i % 2 ? 1 : -1;
    c.vai(0.2, { verso: s * 0.35, fy: -0.6, pupX: s * 1.5, palpebra: 0.35, boccaL: 3, boccaSu: 0, boccaGiu: 1 }, "out");
    c.oscilla("boccaY", 0.6, 2, 0.3).pausa(0.3);
    if (!p.ridotto) c.oscilla("chiomaRot", 1, 2, 0.3);
  }
  c.vai(0.3, { verso: 0, fy: 0, pupX: 0, palpebra: 0, ...SORRISO });
}

/** Sbadiglia: bocca grande, occhi chiusi, braccia mezze in alto. */
export function sbadiglia(c: Copione, p: Palco) {
  c.vai(0.7, { palpebra: 1, ...BOCCA_O, boccaL: 4.5, boccaSu: -9, boccaGiu: 10, cigliaY: -2, sy: 1.04, sxSpalla: 30, dxSpalla: 30, sxGomito: 40, dxGomito: 40 });
  if (!p.ridotto) c.oscilla("rot", 1.5, 1, 0.6);
  c.pausa(0.7);
  c.vai(0.5, { palpebra: 0.3, ...SORRISO, cigliaY: 0, sy: 1, ...BRACCIA_GIU }).vai(0.3, { palpebra: 0 });
}

/** Si stiracchia sulle punte, braccia al cielo. */
export function stiracchia(c: Copione, p: Palco) {
  c.vai(0.8, { sxSpalla: 98, dxSpalla: 98, sxGomito: -4, dxGomito: -4, sy: 1.08, sx: 0.96, y: p.ridotto ? 0 : -4, palpebra: 1, chiomaSy: 1.04, boccaL: 6, boccaSu: 0, boccaGiu: 6 });
  if (!p.ridotto) c.oscilla("rot", 2.5, 1.5, 0.8);
  c.pausa(0.5);
  c.vai(0.3, { sy: 0.96, y: 0, sxSpalla: 60, dxSpalla: 60, chiomaSy: 0.98 }, "out");
  c.vai(0.45, { sy: 1, sx: 1, chiomaSy: 1, palpebra: 0, ...SORRISO, ...BRACCIA_GIU }, "molla");
}

/** Starnutisce: «ah… ah…» con la testa indietro, poi «ciù!» con lo sbuffo. */
export function starnutisce(c: Copione, p: Palco) {
  c.vai(0.35, { fy: -2, palpebra: 0.6, cigliaY: -3, ...BOCCA_O, sy: 1.04 });
  c.oscilla("palpebra", 0.2, 2, 0.5).pausa(0.5);
  c.vai(0.12, { fy: 2, palpebra: 1, boccaL: 7, boccaSu: 2, boccaGiu: 2, sy: 0.94, rot: p.ridotto ? 0 : 2 }, "in");
  c.evento((r) => {
    r.emetti("sbuffo", 128, 186, { vx: 60, vy: -6, vita: 0.8, scala: 0.7, cresce: 1.8 });
    r.emetti("foglia", 120, 60, { vx: 30, vy: -20, gravita: 40, vita: 1.6 });
  });
  if (!p.ridotto) c.oscilla("chiomaRot", 5, 2, 0.4, true);
  c.pausa(0.3).vai(0.4, { fy: 0, palpebra: 0, cigliaY: 0, sy: 1, rot: 0, ...SORRISO }, "molla");
}

/** Fischia una melodia: labbra a «o», note, la testa che dondola. */
export function fischia(c: Copione, durata = 1.8) {
  c.vai(0.25, { boccaL: 2.4, boccaY: 3, boccaSu: -3, boccaGiu: 3, guance: 1.3, palpebra: 0.3 });
  for (let t = 0; t < durata; t += 0.45) c.evento((r) => r.emetti("nota", 132, 178, { vx: 22, vy: -30, vita: 1.4, giro: 30, scala: 0.8 }), t);
  c.oscilla("rot", 1.5, durata / 0.9, durata).oscilla("fy", 0.6, durata / 0.45, durata).pausa(durata);
  c.vai(0.25, { ...SORRISO, guance: 1, palpebra: 0 });
}

/** Ride di gusto. */
export function ride(c: Copione, p: Palco, durata = 1.2) {
  c.vai(0.2, { felice: 1, ...RISATA, guance: 1.5 });
  c.oscilla("sy", 0.03, durata * 4, durata).oscilla("rot", p.ridotto ? 0.5 : 2, durata * 3, durata);
  for (let t = 0; t < durata; t += 0.4) c.evento((r) => r.emetti("risata", 152, 168, { vx: 20, vy: -18, vita: 0.9 }), t);
  c.pausa(durata).vai(0.3, { felice: 0, ...SORRISO, guance: 1 });
}

/** Si scrolla (acqua, foglie) come un cane; col movimento ridotto appena. */
export function scrollati(c: Copione, p: Palco, tipo: "goccia" | "foglia" = "foglia") {
  c.vai(0.2, { sy: 0.95, cigliaY: 2, palpebra: 0.6 });
  if (p.ridotto) c.oscilla("rot", 1.2, 2, 0.8);
  else c.oscilla("rot", 8, 5, 1, true).oscilla("chiomaRot", 10, 5, 1, true).oscilla("verso", 0.6, 5, 1, true);
  c.evento((r) => {
    for (let i = 0; i < 5; i++) r.emetti(tipo, 70 + i * 25, 70 + (i % 2) * 30, { vx: (i - 2) * 60, vy: -60, gravita: tipo === "goccia" ? 400 : 60, vita: 1.2 });
  });
  c.pausa(1).vai(0.35, { sy: 1, rot: 0, cigliaY: 0, palpebra: 0, verso: 0 }, "molla");
}

/** Trema (freddo, paura): piccole scosse, denti che battono, braccia strette. */
export function trema(c: Copione, p: Palco, l: Luogo, durata = 1) {
  c.vai(0.25, { boccaL: 5, boccaSu: 0, boccaGiu: 0, boccaY: 3, palpebra: 0.4, ...mano(l, "sx", l.centro + 8, 196), ...mano(l, "dx", l.centro - 8, 196) });
  if (!p.ridotto) c.oscilla("x", 1.2, durata * 8, durata).oscilla("sx", 0.015, durata * 6, durata);
  c.oscilla("boccaGiu", 1.5, durata * 6, durata).pausa(durata);
  c.vai(0.3, { palpebra: 0, ...SORRISO, ...BRACCIA_GIU });
}

/** Un inchino garbato. */
export function inchino(c: Copione, p: Palco, l: Luogo) {
  c.vai(0.4, { ...mano(l, "dx", l.centro + 2, 204), ...mano(l, "sx", l.centro - 30, 226), sy: p.ridotto ? 0.97 : 0.9, fy: 3, palpebra: 1, chiomaRot: p.ridotto ? 0 : 4 }, "io");
  c.pausa(0.5).vai(0.4, { sy: 1, fy: 0, palpebra: 0, chiomaRot: 0, ...BRACCIA_GIU }, "out");
}

/** Applaude: le mani si battono davanti, qualche stellina. */
export function applaude(c: Copione, l: Luogo, volte = 4) {
  c.vai(0.25, { ...mano(l, "sx", l.centro - 14, 186), ...mano(l, "dx", l.centro + 14, 186), ...FELICE });
  for (let i = 0; i < volte; i++) {
    c.vai(0.1, { ...mano(l, "sx", l.centro - 3, 186), ...mano(l, "dx", l.centro + 3, 186) }, "in");
    c.evento((r) => r.emetti("stella", 120, 176, { vy: -30, vita: 0.5, scala: 0.6 }));
    c.vai(0.14, { ...mano(l, "sx", l.centro - 14, 186), ...mano(l, "dx", l.centro + 14, 186) }, "out");
  }
  c.vai(0.25, { felice: 0 });
}

/** Saluta con la mano alta. */
export function saluta(c: Copione, l: Luogo, lato: Lato, volte = 3) {
  const s = lato === "dx" ? 1 : -1;
  c.vai(0.3, mano(l, lato, l.centro + s * 40, 140, 0, 1.1));
  c.oscilla(`${lato}Mano`, 22, volte, volte * 0.3).oscilla(`${lato}Gomito`, 10, volte, volte * 0.3).pausa(volte * 0.3);
}

/** Guarda lontano con la mano sulla fronte, a visiera. */
export function guardaLontano(c: Copione, l: Luogo, lato: Lato, dir: number) {
  const s = lato === "dx" ? 1 : -1;
  c.vai(0.4, { ...mano(l, lato, l.centro + s * 4, l.seduto ? 168 : 152, s * -80), verso: dir * 0.5, pupX: dir * 2.4, palpebra: 0.35 });
  c.pausa(0.8).vai(0.5, { verso: -dir * 0.3, pupX: -dir * 1.5 }).pausa(0.5).vai(0.3, { verso: 0, pupX: 0, palpebra: 0 });
}

/** Sfrega due bastoncini, sempre più svelto (per accendere il fuoco). */
export function sfrega(c: Copione, p: Palco, l: Luogo, x: number, y: number, durata: number) {
  c.vai(0.3, { ...mano(l, "sx", x - 4, y, 0, 1.4), ...mano(l, "dx", x + 4, y - 6, 0, 1.4), palpebra: 0.3, boccaStorta: 3, pupY: 2.5 });
  const volte = Math.round(durata / (p.ridotto ? 0.3 : 0.16));
  c.oscilla("dxMano", 30, volte, durata).oscilla("sxMano", -20, volte, durata).oscilla("sy", 0.01, volte / 2, durata).pausa(durata);
  c.vai(0.2, { boccaStorta: 0, palpebra: 0 });
}

/** Un salto sul posto (col movimento ridotto: si alza sulle punte). */
export function salta(c: Copione, p: Palco, altezza = 16) {
  if (p.ridotto) {
    c.vai(0.25, { sy: 1.04 }).vai(0.25, { sy: 1 });
    return;
  }
  c.vai(0.12, { sy: 0.9, sx: 1.07 }, "out")
    .vai(0.22, { y: -altezza, sy: 1.07, sx: 0.95 }, "out")
    .vai(0.2, { y: 0, sy: 1, sx: 1 }, "in")
    .vai(0.08, { sy: 0.92, sx: 1.06 }, "out")
    .vai(0.25, { sy: 1, sx: 1 }, "molla");
}

/** Annuisce, convinto. */
export function annuisce(c: Copione, volte = 2) {
  for (let i = 0; i < volte; i++) c.vai(0.15, { fy: 2, palpebra: 0.3 }, "out").vai(0.18, { fy: -0.5, palpebra: 0 }, "in");
  c.vai(0.15, { fy: 0 });
}

/** Scuote la testa: no, no. */
export function scuoteTesta(c: Copione, volte = 2) {
  c.oscilla("verso", 0.35, volte, volte * 0.35).oscilla("pupX", 1.8, volte, volte * 0.35).pausa(volte * 0.35);
}

/** Mano al mento: ci pensa. */
export function manoAlMento(c: Copione, l: Luogo, durata = 1.2) {
  c.vai(0.4, { ...mano(l, "dx", l.centro + 3, l.seduto ? 214 : 192, 60), ...SERIO, pupY: -2.2, pupX: 1.5, boccaStorta: 2 });
  c.pausa(durata);
  c.vai(0.3, { dxSpalla: -50, dxGomito: -8, dxMano: 0, dxAllunga: 1, pupY: 1, pupX: 0, ...SORRISO });
}

/** Si gratta la corteccia (la schiena), con gusto. */
export function grattaCorteccia(c: Copione, p: Palco, l: Luogo) {
  c.vai(0.4, { ...mano(l, "sx", l.centro + 14, 214, 0, 1.2), palpebra: 0.6, boccaStorta: -3, rot: p.ridotto ? 0 : -3 });
  c.oscilla("sxGomito", 12, 5, 1).oscilla("sy", 0.015, 5, 1).pausa(1);
  c.vai(0.35, { sxSpalla: -50, sxGomito: -8, sxMano: 0, sxAllunga: 1, palpebra: 0, rot: 0, ...SORRISO });
}
