import { AZIONI } from "@/lib/albero/azioni";
import type { Posa } from "@/lib/albero/tipi";
import { braccioLibero, verso, type Canali, type Figura, type Lato } from "./canali";
import { Copione, type Clip, type Regia } from "./copione";

// Le scenette: ogni azione è una piccola storia di 8-15 secondi, con un inizio
// e una fine, che riparte da capo con varianti casuali. Tutte partono dalla posa
// del catalogo e ci tornano (c.fine), così il ciclo non ha scatti.
// Coordinate del busto: spalle a y 178, occhi a y 164, bocca a y 181,
// chioma da y -18 a y 136, piedi a y 262.

export interface Palco {
  rnd: () => number;
  /** Movimento ridotto: niente salti, scosse né corse da un lato all'altro. */
  ridotto: boolean;
  /** Quanto può spostarsi a sinistra e a destra dal suo posto. */
  spazioSx: number;
  spazioDx: number;
  figura: Figura;
}

export type NomeScenetta = "sole" | "pioggia" | "freddo" | "passeggiata" | "notte" | "leggere" | "correre" | "generica";

type Scenetta = (base: Canali, p: Palco) => Clip;

const tra = (p: Palco, a: number, b: number) => a + p.rnd() * (b - a);
const forse = (p: Palco, prob: number) => p.rnd() < prob;
function mescola<T>(p: Palco, v: T[]): T[] {
  const a = [...v];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(p.rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SORRISO = { boccaL: 8, boccaY: 0, boccaSu: 8, boccaGiu: 8, boccaStorta: 0 };
const BOCCA_O = { boccaL: 3.4, boccaY: 3, boccaSu: -7, boccaGiu: 7, boccaStorta: 0 };
const RISATA = { boccaL: 9, boccaY: -1, boccaSu: 0, boccaGiu: 14, boccaStorta: 0 };
const BRACCIA_GIU = { sxSpalla: -50, sxGomito: -8, sxMano: 0, dxSpalla: -50, dxGomito: -8, dxMano: 0 };

/** Sbuffo di fiato dalla bocca (si vede col freddo). */
function fiato(r: Regia, dir = 0) {
  r.emetti("sbuffo", 120 + dir * 8, 184, { vx: dir * 22, vy: -16, vita: 1.3, scala: 0.6, cresce: 1.4 });
}

function saltello(c: Copione, p: Palco, altezza = 14) {
  if (p.ridotto) return;
  c.vai(0.12, { sy: 0.9, sx: 1.08 }, "out")
    .vai(0.22, { y: -altezza, sy: 1.07, sx: 0.95 }, "out")
    .vai(0.2, { y: 0, sy: 1, sx: 1 }, "in")
    .vai(0.08, { sy: 0.9, sx: 1.08 }, "out")
    .vai(0.3, { sy: 1, sx: 1 }, "molla");
}

function guardaIntorno(c: Copione, p: Palco) {
  const s = forse(p, 0.5) ? 1 : -1;
  c.vai(0.45, { verso: 0.55 * s, pupX: 2.4 * s, pupY: 0.5 })
    .pausa(tra(p, 0.4, 0.9))
    .vai(0.55, { verso: -0.55 * s, pupX: -2.4 * s })
    .pausa(tra(p, 0.4, 0.8))
    .vai(0.4, { verso: 0, pupX: 0, pupY: c.base.pupY });
}

function sospiro(c: Copione) {
  c.vai(0.8, { sy: 1.04, sx: 0.985, palpebra: Math.max(c.valoreA("palpebra"), 0.3), chiomaSy: 1.02 })
    .vai(0.9, { sy: 0.975, sx: 1.01, chiomaSy: 0.99 })
    .vai(0.5, { sy: 1, sx: 1, chiomaSy: 1, palpebra: c.base.palpebra });
}

function spostaPeso(c: Copione, p: Palco) {
  const s = forse(p, 0.5) ? 1 : -1;
  c.vai(0.9, { rot: 2.6 * s, x: c.valoreA("x") + s * 2 }).pausa(tra(p, 0.6, 1.4)).vai(0.9, { rot: 0, x: 0 });
}

function grattaChioma(c: Copione, p: Palco, lato: Lato) {
  const x = lato === "sx" ? 84 : 156;
  c.vai(0.45, { ...verso(lato, x, 136), pupY: -2.2, pupX: lato === "sx" ? -1.5 : 1.5, boccaStorta: -2 });
  c.oscilla(`${lato}Gomito`, 9, 4, 0.9).oscilla("chiomaRot", 1.5, 4, 0.9).pausa(0.9);
  c.vai(0.5, { [`${lato}Spalla`]: c.base[`${lato}Spalla`], [`${lato}Gomito`]: c.base[`${lato}Gomito`], [`${lato}Mano`]: c.base[`${lato}Mano`], pupY: c.base.pupY, pupX: 0, boccaStorta: c.base.boccaStorta });
}

function occhiolino(c: Copione) {
  c.vai(0.3, { verso: 0, pupX: 0, pupY: 0.5 })
    .vai(0.12, { occhiolino: 1, boccaStorta: -3 })
    .pausa(0.35)
    .vai(0.2, { occhiolino: 0, boccaStorta: c.base.boccaStorta, pupY: c.base.pupY });
}

function canticchia(c: Copione, p: Palco) {
  c.vai(0.3, { parla: 0.55, boccaL: 5, boccaSu: -2, boccaGiu: 4, boccaY: 2, palpebra: 0.5 });
  const t0 = c.ora;
  for (let i = 0; i < 4; i++) c.a(t0 + i * 0.6).evento((r) => r.emetti("nota", 140, 170, { vx: 18, vy: -26, vita: 1.6, giro: 30 }));
  c.a(t0).oscilla("rot", 2, 3, 2.4).pausa(2.4);
  c.vai(0.3, { parla: c.base.parla, boccaL: c.base.boccaL, boccaSu: c.base.boccaSu, boccaGiu: c.base.boccaGiu, boccaY: c.base.boccaY, palpebra: c.base.palpebra });
  void p;
}

function battePiede(c: Copione, p: Palco) {
  const lato: Lato = forse(p, 0.5) ? "sx" : "dx";
  const t0 = c.ora;
  for (let i = 0; i < 3; i++) {
    c.a(t0 + i * 0.36).vai(0.16, { [`${lato}Ginocchio`]: 16 }, "out").vai(0.14, { [`${lato}Ginocchio`]: 0 }, "in");
    c.evento((r) => r.emetti("polvere", lato === "sx" ? 98 : 142, 258, { vx: lato === "sx" ? -10 : 10, vy: -6, vita: 0.6, scala: 0.35 }));
  }
}

// ——— Le sei scenette ———

/** Sole: occhiali, stiracchiata, si gode il sole, si fa aria. */
const sole: Scenetta = (b, p) => {
  const c = new Copione(b);
  const conOcchiali = p.figura.indossa.includes("occhiali-sole");
  c.vai(0.6, { palpebra: 0, ...BRACCIA_GIU, corpoAnim: 0.4 }).pausa(0.3);

  if (conOcchiali && forse(p, 0.8)) {
    // Alza gli occhiali, la luce lo acceca, li rimette giù: così va meglio.
    c.vai(0.45, verso("dx", 133, 162));
    c.vai(0.35, { occhiali: 1, ...verso("dx", 133, 150) }, "out");
    c.vai(0.2, { palpebra: 0.75, cigliaY: 2, boccaL: 6, boccaSu: 3, boccaGiu: 3, pupY: -1 });
    c.oscilla("rot", 1.2, 2, 0.5).pausa(0.7);
    if (forse(p, 0.3)) c.evento((r) => r.fumetto(r.frase("sole"), 1.6));
    c.vai(0.3, { occhiali: 0, ...verso("dx", 133, 162) }, "back");
    c.vai(0.25, { palpebra: 0, cigliaY: 0, boccaL: 9, boccaSu: 5, boccaGiu: 9, boccaStorta: -3, pupY: 1 });
    c.evento((r) => r.emetti("stella", 137, 160, { vita: 0.7, scala: 1.1 }));
    c.vai(0.4, { dxSpalla: -50, dxGomito: -8, dxMano: 0 }).pausa(0.4);
  }

  // Stiracchiata con sbadiglio, sulle punte.
  c.vai(0.9, { sxSpalla: 96, dxSpalla: 96, sxGomito: -6, dxGomito: -6, sy: 1.08, sx: 0.96, y: p.ridotto ? 0 : -4, palpebra: 1, ...BOCCA_O, boccaSu: -9, boccaGiu: 9, boccaL: 4.5, cigliaY: -2, chiomaSy: 1.04 });
  if (!p.ridotto) c.oscilla("rot", 2.2, 1.5, 0.9);
  c.pausa(0.6);
  c.vai(0.3, { sy: 0.95, sx: 1.04, y: 0, sxSpalla: 62, dxSpalla: 62, chiomaSy: 0.97 }, "out");
  c.vai(0.45, { sy: 1, sx: 1, chiomaSy: 1, palpebra: 0, cigliaY: 0, ...SORRISO }, "molla");

  // Si gode il sole: braccia aperte e faccia al cielo, oppure mani sui fianchi.
  if (forse(p, 0.6)) {
    c.vai(0.8, { sxSpalla: 62, dxSpalla: 62, fy: -2, pupY: -2, palpebra: 1, boccaGiu: 11, corpoAnim: 1 });
  } else {
    c.vai(0.7, { ...verso("sx", 101, 208), ...verso("dx", 139, 208), palpebra: 1, boccaGiu: 10, corpoAnim: 1 });
  }
  c.evento((r) => r.emetti("stella", 70, 70, { vita: 1.2 }), 0.4);
  c.evento((r) => r.emetti("stella", 176, 96, { vita: 1.2 }), 1.2);
  sospiro(c);
  c.pausa(tra(p, 0.8, 1.8));

  // Si fa aria con la mano: che caldo.
  const sventola = 3 + Math.floor(p.rnd() * 3);
  c.vai(0.45, { ...verso("dx", 152, 160, -20), palpebra: 0.35, fy: 0, pupY: 1, ...BOCCA_O, sxSpalla: -50 });
  c.oscilla("dxGomito", 16, sventola, sventola * 0.24).oscilla("dxMano", 18, sventola, sventola * 0.24);
  c.evento((r) => r.emetti("sudore", 104, 150, { vy: 20, vita: 0.9 }), 0.2);
  if (forse(p, 0.35)) c.evento((r) => r.fumetto(r.frase("sbuffo"), 1.8), 0.3);
  c.pausa(sventola * 0.24 + 0.2);
  return c.fine(0.8);
};

/** Pioggia: risciacquo, scrollata come un cane, si insapona la chioma. */
const pioggia: Scenetta = (b, p) => {
  const c = new Copione(b);
  const bolle = (n: number, r: Regia) => {
    for (let i = 0; i < n; i++) r.emetti("bolla", 80 + p.rnd() * 80, 60 + p.rnd() * 60, { vx: tra(p, -12, 12), vy: tra(p, -30, -18), vita: tra(p, 1.4, 2.2), scala: tra(p, 0.6, 1.1) });
  };
  c.evento((r) => bolle(3, r)).pausa(tra(p, 1.2, 2));

  // Risciacquo: braccia aperte, faccia alla pioggia, la schiuma se ne va.
  c.vai(0.5, { sxAnim: 0, dxAnim: 0, sxSpalla: 24, dxSpalla: 24, sxGomito: 22, dxGomito: 22, felice: 0, palpebra: 1, fy: -2, boccaL: 6, boccaSu: 2, boccaGiu: 9 });
  c.con(1.5, { schiuma: 0 }, "io");
  c.evento((r) => bolle(4, r)).evento((r) => bolle(3, r), 0.7).pausa(1.5);

  // Si scrolla l'acqua di dosso come un cane.
  c.vai(0.25, { sy: 0.93, sx: 1.05, cigliaY: 2, boccaL: 7, boccaSu: 3, boccaGiu: 3, fy: 0, ...BRACCIA_GIU });
  if (p.ridotto) {
    c.oscilla("rot", 1.5, 2, 1.2);
    c.evento((r) => {
      for (let i = 0; i < 4; i++) r.emetti("goccia", 70 + i * 34, 120, { vy: 30, gravita: 200, vita: 0.9 });
    });
    c.pausa(1.2);
  } else {
    c.oscilla("rot", 9, 5, 1.15, true).oscilla("verso", 0.8, 5, 1.15, true).oscilla("chiomaRot", 12, 5, 1.15, true);
    for (let k = 0; k < 4; k++) {
      c.evento((r) => {
        for (let i = 0; i < 5; i++) {
          const ang = p.rnd() * Math.PI * 2;
          r.emetti("goccia", 120 + Math.cos(ang) * 50, 70 + Math.sin(ang) * 40, { vx: Math.cos(ang) * tra(p, 120, 220), vy: Math.sin(ang) * 120 - tra(p, 80, 160), gravita: 520, vita: 1.1, giro: 0 });
        }
      }, k * 0.25);
    }
    c.pausa(1.15);
  }
  c.vai(0.35, { sy: 1, sx: 1, rot: 0, verso: 0, cigliaY: 0 }, "molla");
  c.vai(0.3, { palpebra: 0, felice: 1, ...SORRISO });
  if (forse(p, 0.5)) guardaIntorno(c, p);
  else c.pausa(0.8);

  // Si insapona la chioma: la schiuma cresce, si strofina, magari canta.
  c.vai(0.55, { sxSpalla: b.sxSpalla, dxSpalla: b.dxSpalla, sxGomito: b.sxGomito, dxGomito: b.dxGomito, sxAnim: 1, dxAnim: 1, felice: 1, ...RISATA });
  const canta = forse(p, 0.5);
  if (canta) {
    c.con(0.3, { parla: 0.6 });
    c.evento((r) => r.fumetto(r.frase("doccia"), 1.8), 0.4);
    for (let i = 0; i < 4; i++) c.evento((r) => r.emetti("nota", 160, 120, { vx: 20, vy: -28, vita: 1.6, giro: 25 }), 0.3 + i * 0.7);
  }
  c.con(3, { schiuma: 1 }, "out");
  for (let i = 0; i < 5; i++) c.evento((r) => bolle(1, r), 0.4 + i * 0.55);
  c.pausa(3);
  if (canta) c.vai(0.3, { parla: 0 });
  return c.fine(0.6);
};

/** Freddo: passeggiata svelta, si stringe la sciarpa, soffia nelle mani. Senza freddo: passeggiata. */
function passeggiata(conFreddo: boolean): Scenetta {
  return (b, p) => {
    const c = new Copione(b);
    const dir = forse(p, 0.5) ? 1 : -1;
    const lontano = Math.max(0, dir > 0 ? p.spazioDx : p.spazioSx);
    const dist = p.ridotto ? 0 : Math.min(lontano, tra(p, 70, 130));
    const andatura = p.ridotto ? 0.6 : 1.15;
    const sbuffi = (dur: number, d: number) => {
      if (!conFreddo) return;
      for (let t = 0.3; t < dur; t += 0.75) c.evento((r) => fiato(r, d), t);
    };

    // Andata
    c.vai(0.35, { verso: dir, passo: andatura, cadenza: p.ridotto ? 1.4 : 2.3, braccioPasso: 1 });
    const tAndata = Math.max(1.4, dist / 55);
    sbuffi(tAndata, dir);
    c.con(tAndata, { x: dir * dist }, "io").pausa(tAndata);
    c.vai(0.35, { passo: 0, verso: 0, braccioPasso: 0 });

    if (conFreddo) {
      // Brividi
      if (!p.ridotto) c.oscilla("rot", 1.2, 6, 0.7).oscilla("sx", 0.018, 6, 0.7);
      c.con(0.2, { boccaL: 5, boccaSu: 0, boccaGiu: 0, boccaY: 3, palpebra: 0.3 }).oscilla("boccaGiu", 1.5, 6, 0.7).pausa(0.7);
      if (forse(p, 0.25)) c.evento((r) => r.fumetto(r.frase("freddo"), 1.6));

      // Si stringe la sciarpa
      if (forse(p, 0.8)) {
        c.vai(0.4, { ...verso("sx", 110, 146), ...verso("dx", 130, 146) });
        c.vai(0.25, { ...verso("sx", 100, 152), ...verso("dx", 140, 152), sciarpa: 1, sy: 0.97, palpebra: 0.7, boccaSu: 2, boccaGiu: 2 }, "back");
        c.pausa(0.35).vai(0.35, { palpebra: 0, sy: 1, ...SORRISO });
      }

      // Soffia nelle mani e se le strofina
      c.vai(0.45, { ...verso("sx", 113, 192, 50), ...verso("dx", 127, 192, 50), ...BOCCA_O, palpebra: 0.4 });
      const soffi = 2 + Math.floor(p.rnd() * 2);
      for (let i = 0; i < soffi; i++) {
        c.vai(0.35, { sy: 1.03, palpebra: 0.15 });
        c.evento((r) => {
          r.emetti("sbuffo", 116, 192, { vx: -14, vy: -12, vita: 1, scala: 0.5, cresce: 1.3 });
          r.emetti("sbuffo", 124, 192, { vx: 14, vy: -12, vita: 1, scala: 0.5, cresce: 1.3 });
        });
        c.vai(0.5, { sy: 0.985, palpebra: 0.5 });
      }
      c.oscilla("sxGomito", 8, 4, 0.8).oscilla("dxGomito", -8, 4, 0.8).pausa(0.8);
      c.vai(0.4, { ...BRACCIA_GIU, palpebra: 0, ...SORRISO });
    } else {
      guardaIntorno(c, p);
      if (forse(p, 0.5)) sospiro(c);
      else saltello(c, p, 8);
    }

    // Ritorno al suo posto
    c.vai(0.3, { verso: -dir, passo: andatura, cadenza: p.ridotto ? 1.4 : 2.3, braccioPasso: 1 });
    const tRitorno = Math.max(1.4, dist / 55);
    sbuffi(tRitorno, -dir);
    c.con(tRitorno, { x: 0 }, "io").pausa(tRitorno);
    c.vai(0.3, { verso: 0 });
    return c.fine(0.5);
  };
}

/** Notte: respiro lento, russa, si gira, si sistema il berretto. */
const notte: Scenetta = (b, p) => {
  const c = new Copione(b);
  const zeta = (r: Regia, grande = false) =>
    r.emetti("zeta", 140, 168, { vx: 16, vy: -24, vita: 2.4, scala: grande ? 1.2 : 0.8, cresce: grande ? 1.8 : 1.4, giro: -8 });

  c.vai(0.4, { corpoAnim: 0 });
  const respiro = () => {
    c.vai(1.4, { sy: 1.03, sx: 0.99, boccaSu: -5, boccaGiu: 5, chiomaSy: 1.015 });
    c.evento((r) => zeta(r));
    c.vai(1.6, { sy: 0.99, sx: 1.005, boccaSu: -8, boccaGiu: 8, chiomaSy: 1 });
  };
  // Russa (1 o 2 volte; se russa una volta sola, a volte prima un altro respiro)
  const russate = 1 + Math.floor(p.rnd() * 2);
  respiro();
  if (russate === 1 && forse(p, 0.5)) respiro();
  for (let i = 0; i < russate; i++) {
    c.vai(1.2, { sy: 1.06, sx: 0.985, chiomaSy: 1.04, cigliaY: -1.5, boccaL: 4.6, boccaSu: -9, boccaGiu: 9 });
    c.pausa(0.2);
    c.evento((r) => zeta(r, true));
    if (!p.ridotto) c.oscilla("chiomaRot", 2.5, 6, 0.9, true);
    c.oscilla("boccaGiu", 1.5, 6, 0.9).con(1, { sy: 0.98, sx: 1.01, chiomaSy: 0.99, cigliaY: 0 }).pausa(1);
  }
  if (forse(p, 0.2)) c.evento((r) => r.fumetto(r.frase("notte"), 2));

  // Si gira nel sonno
  const s = forse(p, 0.5) ? 1 : -1;
  c.vai(1.1, { rot: (p.ridotto ? 2 : 5) * s, verso: 0.7 * s, ...verso(s > 0 ? "sx" : "dx", 120 - s * 4, 204), boccaL: 4, boccaSu: -2, boccaGiu: 3, sy: 1 });
  c.oscilla("boccaStorta", 2, 3, 0.8).pausa(0.8);

  // Il berretto scivola: mezzo sveglio, lo rimette a posto con un braccio elastico.
  if (forse(p, 0.55)) {
    c.vai(0.5, { berretto: 16 * s }, "in");
    c.vai(0.25, { palpebra: 0.55, cigliaY: -2 }).pausa(0.4);
    const lato: Lato = s > 0 ? "dx" : "sx";
    c.vai(0.6, verso(lato, s > 0 ? 166 : 74, 40, 0, 3), "out");
    c.vai(0.4, { berretto: 0 }, "back");
    c.oscilla(`${lato}Mano`, 15, 2, 0.5).pausa(0.5);
    c.vai(0.5, { [`${lato}Spalla`]: b[`${lato}Spalla`], [`${lato}Gomito`]: b[`${lato}Gomito`], [`${lato}Mano`]: b[`${lato}Mano`], [`${lato}Allunga`]: 1, palpebra: 1, cigliaY: 0 }, "molla");
  }
  c.vai(1, { rot: 0, verso: 0, ...BRACCIA_GIU, sxSpalla: b.sxSpalla, dxSpalla: b.dxSpalla });
  return c.fine(0.8);
};

/** Leggere: gli occhi scorrono, gira pagina, ride, alza lo sguardo, chiude e riapre il libro. */
const leggere: Scenetta = (b, p) => {
  const c = new Copione(b);
  const righe = (n: number) => {
    for (let i = 0; i < n; i++) {
      c.vai(0.12, { pupX: -2.2, pupY: 1.8 + i * 0.25, verso: -0.08 }, "out");
      c.vai(tra(p, 0.8, 1.1), { pupX: 2.2, verso: 0.08 }, "lin");
    }
    c.vai(0.2, { pupX: 0, pupY: b.pupY, verso: 0 });
  };
  const giraPagina = () => {
    c.vai(0.25, verso("dx", 141, 196), "out");
    c.con(0.5, { pagina: 1 }, "io").vai(0.5, verso("dx", 104, 199), "io");
    c.vai(0.01, { pagina: 0 }, "scatto");
    c.vai(0.3, { dxSpalla: b.dxSpalla, dxGomito: b.dxGomito, dxMano: b.dxMano }, "out");
  };

  righe(2 + Math.floor(p.rnd() * 2));
  giraPagina();
  righe(1 + Math.floor(p.rnd() * 2));

  if (forse(p, 0.6)) {
    // Ride
    c.vai(0.25, { felice: 1, palpebra: 0, ...RISATA, guance: 1.6 });
    c.oscilla("sy", 0.03, 5, 1.3).oscilla("rot", p.ridotto ? 0.6 : 2, 4, 1.3).oscilla("davantiRot", 4, 4, 1.3);
    for (let i = 0; i < 3; i++) c.evento((r) => r.emetti("risata", 152, 168, { vx: 20, vy: -18, vita: 0.9 }), i * 0.4);
    if (forse(p, 0.35)) c.evento((r) => r.fumetto(r.frase("lettura"), 1.8), 0.3);
    c.pausa(1.3).vai(0.4, { felice: 0, palpebra: b.palpebra, boccaL: b.boccaL, boccaY: b.boccaY, boccaSu: b.boccaSu, boccaGiu: b.boccaGiu, guance: 1 });
  } else {
    // Sorpresa
    c.vai(0.2, { sbarra: 1, palpebra: 0, cigliaY: -3, ...BOCCA_O }, "out").pausa(0.8);
    c.vai(0.4, { sbarra: 0, cigliaY: 0, palpebra: b.palpebra, boccaL: b.boccaL, boccaY: b.boccaY, boccaSu: b.boccaSu, boccaGiu: b.boccaGiu });
  }
  if (forse(p, 0.3)) giraPagina();
  else righe(1);

  // Chiude il libro, alza lo sguardo e pensa, poi lo riapre.
  c.vai(0.35, { libro: 0, davantiY: 2 }, "in");
  c.evento((r) => r.emetti("polvere", 120, 206, { vy: -10, vita: 0.6, scala: 0.4 }));
  c.vai(0.15, { sy: 0.985 }).vai(0.2, { sy: 1 });
  c.vai(0.5, { pupY: -2.5, palpebra: 0, cigliaY: -2, fy: -1.5, stella: forse(p, 0.5) ? 1 : 0, boccaStorta: 2, boccaL: 6, boccaSu: 3, boccaGiu: 4 });
  c.pausa(tra(p, 0.9, 1.6));
  if (forse(p, 0.4)) {
    c.vai(0.3, { pupY: 0.5, fy: 0, stella: 0, ...SORRISO });
    c.pausa(0.6);
  }
  c.vai(0.4, { pupY: b.pupY, cigliaY: 0, fy: 0, stella: 0, boccaStorta: 0, boccaL: b.boccaL, boccaY: b.boccaY, boccaSu: b.boccaSu, boccaGiu: b.boccaGiu, palpebra: b.palpebra });
  c.vai(0.5, { libro: 1, davantiY: 0 }, "out");
  return c.fine(0.4);
};

/** Correre: corsa vera da un lato all'altro, frenata, fiatone, si asciuga la fronte. */
const correre: Scenetta = (b, p) => {
  const c = new Copione(b);
  if (p.ridotto) {
    c.vai(0.6, { passo: 0.5, cadenza: 1.5 }).pausa(3);
    c.vai(0.6, { passo: 0, ...RISATA, boccaGiu: 10, palpebra: 0.4 }).pausa(1.2);
    c.vai(0.5, verso("dx", 112, 152)).vai(0.5, verso("dx", 136, 150)).vai(0.5, { dxSpalla: b.dxSpalla, dxGomito: b.dxGomito, dxMano: b.dxMano });
    return c.fine(0.8);
  }
  const dir = forse(p, 0.5) ? 1 : -1;
  const andata = Math.max(0, (dir > 0 ? p.spazioDx : p.spazioSx) * 0.9);
  const ritorno = Math.max(0, (dir > 0 ? p.spazioSx : p.spazioDx) * 0.9);
  const polvere = (dur: number, d: number) => {
    for (let t = 0.1; t < dur; t += 0.28) c.evento((r) => r.emetti("polvere", 120 - d * 14, 258, { vx: -d * 30, vy: -14, vita: 0.6, scala: 0.45 }), t);
  };
  const scatta = (d: number, x: number, dist: number) => {
    c.vai(0.3, { verso: d, passo: 2.2, cadenza: 3.2, braccioPasso: 1, ...BOCCA_O, boccaL: 4 });
    const t = Math.max(0.9, dist / 150);
    polvere(t, d);
    c.con(t, { x }, "io").pausa(t);
  };
  const frena = (d: number) => {
    c.vai(0.18, { passo: 0, rot: -8 * d, sy: 0.92, sx: 1.06, braccioPasso: 0 }, "out");
    c.evento((r) => {
      for (let i = 0; i < 3; i++) r.emetti("polvere", 120 + d * 10, 258, { vx: d * (20 + i * 25), vy: -20 - i * 6, vita: 0.8, scala: 0.6 });
    });
    c.vai(0.35, { rot: 0, sy: 1, sx: 1 }, "molla");
  };

  scatta(dir, dir * andata, andata);
  frena(dir);
  c.vai(0.25, { verso: -dir });
  scatta(-dir, -dir * ritorno, andata + ritorno);
  frena(-dir);

  // Fiatone: mani sulle ginocchia
  c.vai(0.45, { verso: 0, sy: 0.93, ...verso("sx", 104, 226), ...verso("dx", 136, 226), ...RISATA, boccaGiu: 11, palpebra: 0.45 });
  c.oscilla("sy", 0.022, 8, 2).oscilla("chiomaSy", 0.02, 8, 2);
  for (let i = 0; i < 3; i++) c.evento((r) => r.emetti("sudore", i % 2 ? 160 : 82, 112, { vy: 30, vita: 0.9 }), i * 0.6);
  if (forse(p, 0.35)) c.evento((r) => r.fumetto(r.frase("corsa"), 1.8), 0.6);
  c.pausa(2);

  // Si asciuga la fronte e scrolla la goccia
  c.vai(0.4, { sy: 1, ...BRACCIA_GIU, ...verso("dx", 140, 150) });
  c.vai(0.45, verso("dx", 108, 151), "io");
  c.evento((r) => r.emetti("sudore", 98, 150, { vx: -70, vy: -50, gravita: 380, vita: 0.9, mondo: false }));
  c.vai(0.3, { dxSpalla: -30, dxGomito: -8, dxMano: 0, boccaL: 6, boccaSu: 2, boccaGiu: 2, palpebra: 0.6 }, "out");
  c.pausa(0.3);

  // Torna al centro trotterellando
  const verso0 = ritorno > 0 ? dir : 0;
  c.vai(0.3, { verso: verso0, passo: 1.4, cadenza: 2.4, braccioPasso: 1, palpebra: 0, ...BOCCA_O, boccaL: 4 });
  const t = Math.max(0.8, ritorno / 90);
  c.con(t, { x: 0 }, "io").pausa(t);
  return c.fine(0.5);
};

/** Le altre azioni: la posa del catalogo, viva, con piccoli gesti a sorpresa. */
const generica: Scenetta = (b, p) => {
  const c = new Copione(b);
  const f = p.figura;
  const seduto = b.seduto > 0.5;
  const fermo = b.passo < 0.1;
  const allegro = b.felice > 0.5 || b.boccaGiu - b.boccaSu > 8;
  const gesti: ((c: Copione) => void)[] = [(c) => guardaIntorno(c, p), (c) => sospiro(c), (c) => occhiolino(c)];
  if (!seduto && fermo) gesti.push((c) => spostaPeso(c, p), (c) => battePiede(c, p));
  if (allegro && !seduto && fermo) gesti.push((c) => saltello(c, p));
  for (const lato of ["sx", "dx"] as const) if (braccioLibero(f, lato) && b[`${lato}Spalla`] < 20) gesti.push((c) => grattaChioma(c, p, lato));
  if (b.parla < 0.1 && !f.effetti.includes("zzz")) gesti.push((c) => canticchia(c, p));

  c.pausa(tra(p, 1.5, 3));
  const scelti = mescola(p, gesti).slice(0, 2 + (forse(p, 0.4) ? 1 : 0));
  for (const g of scelti) {
    g(c);
    c.pausa(tra(p, 1.2, 2.6));
  }
  return c.fine(0.5);
};

export const SCENETTE: Record<NomeScenetta, Scenetta> = {
  sole,
  pioggia,
  freddo: passeggiata(true),
  passeggiata: passeggiata(false),
  notte,
  leggere,
  correre,
  generica,
};

const uguali = (a: Posa, b: Posa) =>
  a.occhi === b.occhi &&
  a.bocca === b.bocca &&
  a.gambe === b.gambe &&
  a.corpo === b.corpo &&
  JSON.stringify([a.sx, a.dx, a.oggetti, a.effetti]) === JSON.stringify([b.sx, b.dx, b.oggetti, b.effetti]);

/** Riconosce l'azione dalla posa (le pagine passano solo la posa). */
export function azioneDaPosa(posa: Posa): string | null {
  return AZIONI.find((a) => uguali(a.posa, posa))?.id ?? null;
}

export function scegliScenetta(posa: Posa): NomeScenetta {
  switch (azioneDaPosa(posa)) {
    case "prendere-sole":
      return "sole";
    case "doccia":
      return "pioggia";
    case "passeggiata":
      return posa.indossa.includes("sciarpa") || posa.indossa.includes("cappello") ? "freddo" : "passeggiata";
    case "dormire":
      return "notte";
    case "leggere":
      return "leggere";
    case "corsa":
      return "correre";
    default:
      return "generica";
  }
}
