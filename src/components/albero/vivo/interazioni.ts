import { DISCRETI, NOMI_CANALI, verso, type Canali, type Lato } from "./canali";
import { Copione, type Clip, type Regia } from "./copione";
import type { Palco } from "./scenette";

// Le reazioni alle persone: saluto, solletico, finta rabbia, «ti ho visto»,
// atterraggio dopo il volo, cambio di posa. Ognuna parte dalla posa del momento
// (la fotografia `s`) e alla fine sfuma in quello che l'albero stava facendo.

/** Smette quello che sta facendo. */
const FERMO: Partial<Canali> = {
  passo: 0,
  braccioPasso: 0,
  sxAnim: 0,
  dxAnim: 0,
  corpoAnim: 0.3,
  parla: 0,
  sxAnca: 0,
  dxAnca: 0,
  sxGinocchio: 0,
  dxGinocchio: 0,
  sxAllunga: 1,
  dxAllunga: 1,
};
const SORRISO = { boccaL: 8, boccaY: 0, boccaSu: 8, boccaGiu: 8, boccaStorta: 0 };
const RISATA = { boccaL: 9, boccaY: -1, boccaSu: 0, boccaGiu: 14, boccaStorta: 0 };
const BOCCA_O = { boccaL: 3.4, boccaY: 3, boccaSu: -7, boccaGiu: 7, boccaStorta: 0 };
const BRACCIA_GIU = { sxSpalla: -50, sxGomito: -8, sxMano: 0, dxSpalla: -50, dxGomito: -8, dxMano: 0 };

function salto(c: Copione, p: Palco, altezza: number) {
  if (p.ridotto) return;
  const t0 = c.ora;
  c.vai(0.1, { sy: 0.92, sx: 1.06 }, "out")
    .vai(0.18, { y: -altezza, sy: 1.05, sx: 0.97 }, "out")
    .vai(0.16, { y: 0, sy: 1, sx: 1 }, "in")
    .vai(0.07, { sy: 0.94, sx: 1.04 }, "out")
    .vai(0.25, { sy: 1, sx: 1 }, "molla");
  c.a(t0);
}

function foglieCadono(r: Regia, p: Palco, n: number) {
  for (let i = 0; i < n; i++) {
    r.emetti("foglia", 70 + p.rnd() * 100, 40 + p.rnd() * 80, { vx: (p.rnd() - 0.5) * 40, vy: 10 + p.rnd() * 20, gravita: 40, vita: 2.4 + p.rnd(), giro: (p.rnd() - 0.5) * 200 });
  }
}

export interface OpzioniSaluto {
  /** Toccata la chioma: fruscio e qualche foglia che cade. */
  chioma?: boolean;
  /** Toccato un oggetto: lo muove e ne parla. */
  oggetto?: { nome: string; dove: Lato | "davanti" | "terra" };
}

/** Clic, tocco o Invio: si ferma, si gira verso di te, saluta e dice una frase. */
export function saluto(s: Canali, p: Palco, lato: Lato, o: OpzioniSaluto = {}): Clip {
  const c = new Copione(s);
  c.vai(0.25, { ...FERMO, verso: 0, fy: 0, pupX: 0, pupY: 0.4, palpebra: 0, palpebraInc: 0, felice: 0, sbarra: 0.5, cigliaY: -3, cigliaRot: 0, stella: 0, occhiolino: 0 }, "out");
  salto(c, p, 9);
  const xMano = lato === "dx" ? 166 : 74;
  c.evento((r) => r.fumetto(o.oggetto ? r.frase(`oggetto:${o.oggetto.nome}`) : r.frase("saluto"), 3.4));
  c.vai(0.35, { ...verso(lato, xMano, 140), ...RISATA, boccaGiu: 12, sbarra: 0, guance: 1.3 }, "back");
  c.oscilla(`${lato}Gomito`, p.ridotto ? 10 : 22, 3, 1.3).oscilla(`${lato}Mano`, 14, 3, 1.3);
  if (o.chioma) {
    c.oscilla("chiomaRot", p.ridotto ? 2 : 7, 4, 1.2, true);
    c.evento((r) => foglieCadono(r, p, p.ridotto ? 2 : 5));
    if (p.rnd() < 0.3) c.evento((r) => r.emetti("ghianda", 100 + p.rnd() * 40, 100, { vy: 20, gravita: 600, vita: 1.6 }), 0.2);
  }
  if (o.oggetto) {
    const d = o.oggetto.dove;
    if (d === "sx" || d === "dx") c.oscilla(`${d}Ogg`, 14, 3, 1.2, true);
    else if (d === "davanti") c.oscilla("davantiRot", 6, 3, 1.2, true);
  }
  c.pausa(1.3).vai(0.35, { boccaGiu: 10, guance: 1.1 }).pausa(0.3);
  return c.chiudi(0.45);
}

/** Tanti clic di fila: il solletico. */
export function solletico(s: Canali, p: Palco): Clip {
  const c = new Copione(s);
  c.vai(0.15, { ...FERMO, verso: 0, felice: 1, palpebra: 0, ...RISATA, guance: 1.8, cigliaY: -2, sbarra: 0, ...verso("sx", 113, 204), ...verso("dx", 127, 204) }, "out");
  c.evento((r) => r.fumetto(r.frase("solletico"), 2.2));
  if (p.ridotto) c.oscilla("rot", 0.8, 3, 1.6);
  else c.oscilla("rot", 4, 7, 1.6).oscilla("sx", 0.04, 7, 1.6).oscilla("chiomaRot", 6, 7, 1.6).oscilla("x", 2.5, 7, 1.6);
  for (let i = 0; i < 4; i++) c.evento((r) => r.emetti("risata", i % 2 ? 66 : 168, 150, { vx: i % 2 ? -20 : 20, vy: -18, vita: 0.9 }), i * 0.35);
  c.pausa(1.7).vai(0.3, { boccaGiu: 10, guance: 1.3 });
  return c.chiudi(0.4);
}

/** Ancora più clic: finge di arrabbiarsi, poi fa pace. */
export function arrabbiato(s: Canali, p: Palco): Clip {
  const c = new Copione(s);
  c.vai(0.25, {
    ...FERMO,
    verso: 0,
    felice: 0,
    palpebra: 0.35,
    palpebraInc: 4,
    cigliaY: 2,
    cigliaRot: 20,
    pupY: 0.5,
    pupX: 0,
    boccaL: 7,
    boccaY: 3,
    boccaSu: -4,
    boccaGiu: -4,
    boccaStorta: 0,
    guance: 1.9,
    ...verso("sx", 128, 200),
    ...verso("dx", 112, 197),
  }, "out");
  c.evento((r) => r.fumetto(r.frase("arrabbiato"), 2));
  c.evento((r) => {
    r.emetti("vapore", 92, 4, { vy: -40, vita: 1, scala: 0.7, cresce: 1.6 });
    r.emetti("vapore", 148, 4, { vy: -40, vita: 1, scala: 0.7, cresce: 1.6 });
  }, 0.3);
  if (!p.ridotto) {
    c.vai(0.15, { dxGinocchio: 26 }, "out").vai(0.1, { dxGinocchio: 0, sy: 0.95 }, "in");
    c.evento((r) => r.emetti("polvere", 140, 258, { vx: 20, vy: -12, vita: 0.6, scala: 0.5 }));
    c.vai(0.2, { sy: 1 }, "molla");
  }
  c.pausa(1.5);
  c.vai(0.3, { cigliaRot: 0, cigliaY: 0, palpebraInc: 0, palpebra: 0, ...SORRISO, guance: 1.2 });
  c.evento((r) => r.fumetto(r.frase("pace"), 1.8));
  c.vai(0.15, { occhiolino: 1, boccaStorta: -3 }).pausa(0.4).vai(0.2, { occhiolino: 0, boccaStorta: 0 });
  c.vai(0.45, BRACCIA_GIU).pausa(0.5);
  return c.chiudi(0.45);
}

/** Il puntatore arriva vicino: si accorge di te. */
export function accorto(s: Canali, p: Palco, dir: number): Clip {
  const c = new Copione(s);
  c.vai(0.15, { passo: 0, braccioPasso: 0, sbarra: 1, cigliaY: -3.5, palpebra: 0, felice: 0, pupX: 2.2 * dir, pupY: 0.4, verso: 0.25 * dir }, "out");
  salto(c, p, 5);
  c.pausa(0.4).vai(0.3, { sbarra: 0, cigliaY: -1, boccaGiu: s.boccaGiu + 3 }).pausa(0.3);
  return c.chiudi(0.4);
}

export interface Atterraggio {
  /** Posizione rispetto al suo posto (0 = a casa). */
  da: number;
  torna: boolean;
  protesta: boolean;
}

/** Dopo il volo: si schiaccia, gira la testa, si scuote la polvere, magari protesta, poi resta o torna a piedi. */
export function atterraggio(s: Canali, p: Palco, a: Atterraggio): Clip {
  const c = new Copione({ ...s, x: a.da, y: 0 });
  if (p.ridotto) {
    c.vai(0.35, { sy: 1, sx: 1, rot: 0, palpebra: 0.4, radici: 0 });
  } else {
    c.vai(0.08, { sy: 0.78, sx: 1.18, chiomaSy: 0.9, rot: 0, palpebra: 1, cigliaY: 2, ...BOCCA_O }, "out");
    c.evento((r) => {
      for (const d of [-1, 1]) for (let i = 0; i < 3; i++) r.emetti("polvere", 120 + d * 30, 258, { vx: d * (30 + i * 30), vy: -14 - i * 8, vita: 0.8, scala: 0.6 });
    });
    c.vai(0.5, { sy: 1, sx: 1, chiomaSy: 1 }, "molla");
  }
  c.vai(0.25, { ...FERMO, radici: 0, palpebra: 0, sbarra: 0, cigliaY: 0, cigliaRot: 0, felice: 0, ...BRACCIA_GIU, boccaL: 6, boccaY: 2, boccaSu: 0, boccaGiu: 2 });

  // Gira la testa: dove sono finito?
  c.vai(0.3, { verso: -0.7, pupX: -2.4 }).pausa(0.3).vai(0.35, { verso: 0.7, pupX: 2.4 }).pausa(0.25).vai(0.3, { verso: 0, pupX: 0, pupY: 1 });

  // Si scuote la polvere di dosso
  c.vai(0.3, { ...verso("sx", 108, 210), ...verso("dx", 132, 212) });
  if (!p.ridotto) c.oscilla("rot", 4, 4, 0.7);
  c.oscilla("sxGomito", 14, 4, 0.7).oscilla("dxGomito", -14, 4, 0.7);
  for (let i = 0; i < 3; i++) c.evento((r) => r.emetti("polvere", 100 + p.rnd() * 40, 200 + p.rnd() * 30, { vx: (p.rnd() - 0.5) * 50, vy: -10, vita: 0.7, scala: 0.4 }), i * 0.22);
  c.pausa(0.7);

  if (a.protesta) {
    c.vai(0.25, { cigliaRot: 16, cigliaY: 1, palpebraInc: 3, boccaL: 7, boccaY: 3, boccaSu: -3, boccaGiu: -3, ...verso("sx", 101, 208), ...verso("dx", 139, 208) });
    c.evento((r) => r.fumetto(r.frase("atterraggio"), 2.2));
    c.pausa(1.5).vai(0.3, { cigliaRot: 0, cigliaY: 0, palpebraInc: 0, ...SORRISO, ...BRACCIA_GIU });
  } else {
    c.vai(0.3, { ...SORRISO, ...BRACCIA_GIU });
  }

  if (a.torna && Math.abs(a.da) > 2) camminaFinoA(c, p, 0, a.da);
  c.pausa(0.2);
  return c.chiudi(0.45);
}

function camminaFinoA(c: Copione, p: Palco, a: number, da: number) {
  const dir = a > da ? 1 : -1;
  c.vai(0.3, { verso: dir, passo: p.ridotto ? 0.6 : 1, cadenza: 2, braccioPasso: 1, ...SORRISO });
  const t = Math.max(0.6, Math.abs(a - da) / (p.ridotto ? 50 : 75));
  c.con(t, { x: a }, "lin").pausa(t);
  c.vai(0.3, { verso: 0, passo: 0, braccioPasso: 0 });
}

/** Al caricamento della pagina: torna a piedi dove l'avevi lasciato. */
export function vaiAlPosto(s: Canali, p: Palco, da: number): Clip {
  const c = new Copione({ ...s, x: da });
  camminaFinoA(c, p, 0, da);
  return c.chiudi(0.4);
}

/** Cambia l'azione o il meteo: saltello e nuova posa, con qualche foglia. */
export function cambio(s: Canali, b: Canali, p: Palco): Clip {
  const c = new Copione(s);
  const bersagli: Partial<Canali> = {};
  const scatti: Partial<Canali> = {};
  for (const k of NOMI_CANALI) {
    if (Math.abs(s[k] - b[k]) <= 1e-3) continue;
    if (DISCRETI.has(k)) scatti[k] = b[k];
    else if (!(["y", "sx", "sy"] as string[]).includes(k)) bersagli[k] = b[k];
  }
  c.vai(0.01, scatti, "scatto");
  c.a(0);
  if (p.ridotto) {
    c.vai(0.6, { ...bersagli, y: b.y, sx: b.sx, sy: b.sy });
    return c.chiudi();
  }
  c.evento((r) => foglieCadono(r, p, 3));
  c.vai(0.12, { sy: 0.88, sx: 1.08 }, "out");
  const t0 = c.ora;
  c.vai(0.22, { y: -16, sy: 1.08, sx: 0.95 }, "out").vai(0.2, { y: 0, sy: 0.92, sx: 1.06 }, "in").vai(0.35, { sy: 1, sx: 1 }, "molla");
  c.a(t0).vai(0.6, bersagli, "back");
  return c.chiudi();
}
