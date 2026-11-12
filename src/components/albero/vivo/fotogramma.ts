import { ANCA, BOCCA_Y, OCCHIO, OSSA, SPALLA, TERRA, type Canali, type Figura, type Lato } from "./canali";
import { fotogrammaArredi, fotogrammaAttrezzi, type StatoLavoro } from "./arredi";
import { fotogrammaScena, type StatoScena } from "./tracce";
import { SCHIUMA } from "./disegni";

// Da canali a attributi SVG. La stessa funzione disegna la posa ferma sul server
// (stato iniziale, t = 0) e ogni fotogramma nel browser: così all'avvio non c'è scatto.

/** Lo stato "fisico" che il motore aggiorna nel tempo: molle, fase del passo, sguardo. */
export interface StatoVivo {
  t: number;
  /** Fase del passo, in radianti. */
  fase: number;
  /** Posizione finale del corpo (il suo posto più lo spostamento). */
  X: number;
  Y: number;
  /** Perno della rotazione: i piedi, o il punto dove lo tieni quando lo sollevi. */
  pernoX: number;
  pernoY: number;
  chiomaA: number;
  chiomaDy: number;
  codaA: number;
  /** Battito di ciglia in corso, 0-1. */
  ciglio: number;
  sguardoX: number;
  sguardoY: number;
  /** Il puntatore: dove guardare (spostamento delle pupille) e quanto. */
  guardaX: number;
  guardaY: number;
  guardaW: number;
  ridotto: boolean;
  /** Il mestiere: arredi nel prato e attrezzi in mano (null = niente mestiere). */
  lavoro: StatoLavoro | null;
  /** Le tracce nella scena e gli oggetti delle attività quotidiane (null = niente). */
  scena: StatoScena | null;
  /** Quanto è stretto il prato delle tracce (1 sul computer, meno sul telefono: vivo/tracce.tsx). */
  stringi: number;
}

export function statoIniziale(): StatoVivo {
  return {
    t: 0,
    fase: 0,
    X: 0,
    Y: 0,
    pernoX: 120,
    pernoY: TERRA,
    chiomaA: 0,
    chiomaDy: 0,
    codaA: 0,
    ciglio: 0,
    sguardoX: 0,
    sguardoY: 0,
    guardaX: 0,
    guardaY: 0,
    guardaW: 0,
    ridotto: false,
    lavoro: null,
    scena: null,
    stringi: 1,
  };
}

export type Attributi = Record<string, Record<string, string>>;

const TAU = Math.PI * 2;
const rad = (g: number) => (g * Math.PI) / 180;
const n = (v: number) => Math.round(v * 100) / 100;
const lim = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const liscio = (a: number, b: number, v: number) => {
  const u = lim((v - a) / (b - a), 0, 1);
  return u * u * (3 - 2 * u);
};

const [G1, G2] = [18.5, 18.5];

/** Cosa aggiunge il gesto della posa (saluta, strofina…) agli angoli del braccio. */
function gesto(f: Figura, lato: Lato, k: number, t: number, a: { sp: number; go: number; ma: number }) {
  const g = f.anim[lato];
  if (!g || k < 0.001) return;
  const off = lato === "dx" ? 0.5 : 0;
  switch (g) {
    case "saluta":
      a.go += 18 * k * Math.sin(TAU * (t / 0.8 + off * 0.3));
      a.sp += 4 * k * Math.sin(TAU * (t / 0.8 + off * 0.3));
      break;
    case "strofina":
      a.go += 18 * k * Math.sin(TAU * (t / 0.34 + off));
      a.sp += 6 * k * Math.sin(TAU * (t / 0.34 + off) + 1);
      break;
    case "pennella":
      a.sp += 16 * k * Math.sin(TAU * (t / 1.1));
      a.ma += 12 * k * Math.sin(TAU * (t / 1.1) - 0.8);
      break;
    case "solleva":
      a.sp += k * (-6 + 50 * (0.5 - 0.5 * Math.cos(TAU * (t / 1.3))));
      a.go += k * 20 * (0.5 - 0.5 * Math.cos(TAU * (t / 1.3)));
      break;
    case "scrive":
      a.ma += 7 * k * Math.sin(TAU * (t / 0.28));
      a.go += 3 * k * Math.sin(TAU * (t / 0.56));
      break;
    case "oscilla":
      a.sp += 22 * k * Math.sin(TAU * (t / 0.55 + off));
      break;
    case "conta":
      a.sp += 7 * k * Math.sin(TAU * (t / 0.6));
      a.ma += 10 * k * Math.sin(TAU * (t / 0.3));
      break;
  }
}

function boccaPath(L: number, yl: number, yr: number, su: number, giu: number) {
  const ym = (yl + yr) / 2;
  return `M${n(120 - L)},${n(yl)} Q120,${n(ym + su)} ${n(120 + L)},${n(yr)} Q120,${n(ym + giu)} ${n(120 - L)},${n(yl)} Z`;
}

export function fotogramma(v: Canali, f: Figura, s: StatoVivo): Attributi {
  const A: Attributi = {};
  const t = s.t;
  const rid = s.ridotto;

  // ——— Corpo ———
  let rot = v.rot;
  let sx = v.sx;
  let sy = v.sy;
  let dy = 0;
  const k = v.corpoAnim * (rid ? 0.4 : 1);
  switch (f.corpo) {
    case "ondeggia":
      rot += 1.4 * k * Math.sin((TAU * t) / 5);
      break;
    case "respira": {
      const r = Math.sin((TAU * t) / 3.6);
      sy *= 1 + 0.016 * k * r;
      sx *= 1 - 0.008 * k * r;
      break;
    }
    case "saltella":
      if (!rid) dy -= 7 * k * Math.abs(Math.sin((Math.PI * t) / 0.55));
      break;
    case "galleggia":
      dy -= 9 * k * (0.5 - 0.5 * Math.cos((TAU * t) / 3.2));
      break;
    case "balla":
      rot += 5 * k * Math.sin((TAU * t) / 0.9);
      if (!rid) dy -= 6 * k * Math.abs(Math.sin((TAU * t) / 0.9));
      break;
    default:
      break;
  }
  // Respiro di fondo, sempre.
  const resp = Math.sin((TAU * t) / 3.8);
  sy *= 1 + 0.01 * resp;
  sx *= 1 - 0.004 * resp;

  // Passo: camminata (fino a 1) e corsa (da 1 a 2).
  const passo = Math.max(0, v.passo) * (rid ? 0.6 : 1);
  const cam = Math.min(passo, 1);
  const cor = lim(passo - 1, 0, 1);
  const fronte = v.verso >= 0 ? 1 : -1;
  const fase = s.fase;
  const bob = -(2.5 * cam + 4 * cor) * (1 - Math.abs(Math.sin(fase)));
  rot += v.verso * (1.5 * cam + 6 * cor);

  const X = s.X;
  const Y = s.Y + dy;
  A.corpo = {
    transform: `translate(${n(X)} ${n(Y)}) rotate(${n(rot)} ${n(s.pernoX)} ${n(s.pernoY)}) translate(120 ${TERRA}) scale(${n(sx)} ${n(sy)}) translate(-120 -${TERRA})`,
  };
  const alto = Math.max(0, -Y);
  const so = 1 / (1 + alto / 140);
  A.ombra = { transform: `translate(${n(X + 120)} ${TERRA + 2}) scale(${n(so)})`, opacity: `${n(0.13 * so)}` };
  A.anello = { transform: `translate(${n(X)} ${n(Y)})` };

  // ——— Gambe ———
  const seduto = lim(v.seduto, 0, 1);
  A.gambe = { opacity: `${n(1 - seduto)}` };
  A.incrociate = { opacity: `${n(seduto)}`, display: seduto < 0.01 ? "none" : "inline" };
  for (const lato of ["sx", "dx"] as const) {
    const sigma = lato === "sx" ? -1 : 1;
    const h = ANCA[lato];
    const fi = fase + (lato === "sx" ? 0 : Math.PI);
    const th = (14 * cam + 18 * cor) * Math.sin(fi) + v[`${lato}Anca`];
    const ka = (16 * cam + 52 * cor) * Math.max(0, Math.cos(fi)) + v[`${lato}Ginocchio`];
    const apertura = sigma * 6.3;
    const a1 = rad(apertura + fronte * th);
    const gx = h.x + G1 * Math.sin(a1);
    const gy = h.y + G1 * Math.cos(a1);
    const a2 = rad(apertura + fronte * (th - ka));
    const cx = gx + G2 * Math.sin(a2);
    const cy = gy + G2 * Math.cos(a2);
    const qx = 2 * gx - (h.x + cx) / 2;
    const qy = 2 * gy - (h.y + cy) / 2;
    const L = lato === "sx" ? "Sx" : "Dx";
    A[`gamba${L}`] = { d: `M${h.x},${h.y} Q${n(qx)},${n(qy)} ${n(cx)},${n(cy)}` };
    const giro = Math.abs(v.verso);
    const piedeX = sigma * 6 * (1 - giro) + fronte * 6 * giro;
    A[`piede${L}`] = { transform: `translate(${n(cx + piedeX)} ${n(cy + 4)}) rotate(${n(-fronte * (th - ka) * 0.4)})` };
    const r = lim(v.radici, 0, 1);
    A[`radici${L}`] =
      r < 0.01
        ? { display: "none", transform: "scale(0)" }
        : { display: "inline", transform: `rotate(${n(Math.sin(t * 7 + sigma) * 12 * r)}) scale(${n(r)})` };
  }

  // ——— Busto ———
  A.busto = { transform: `translate(0 ${n(seduto * 22 + bob)})` };

  // Chioma con la sua molla
  const ca = v.chiomaRot + s.chiomaA;
  const cdy = s.chiomaDy;
  A.chioma = {
    transform: `translate(0 ${n(cdy)}) rotate(${n(ca)} 120 132) translate(120 132) scale(${n(v.chiomaSx)} ${n(v.chiomaSy * (1 - cdy * 0.006))}) translate(-120 -132)`,
  };
  SCHIUMA.forEach(([x, y], i) => {
    const sc = lim(v.schiuma * 1.7 - i * 0.1, 0, 1);
    A[`schiuma${i}`] =
      sc < 0.01
        ? { display: "none", transform: "scale(0)" }
        : { display: "inline", transform: `translate(${x} ${y}) scale(${n(sc * (1 + 0.05 * Math.sin(t * 3 + i)))}) translate(-${x} -${y})` };
  });
  A.berretto = { transform: `rotate(${n(v.berretto)} 124 30)` };
  A.cappello = { transform: `translate(0 ${n(-8 * v.cappello)})` };

  // ——— Faccia ———
  const fx = 7 * v.verso + s.guardaW * lim(s.guardaX * 0.7, -2.5, 2.5);
  A.faccia = { transform: `translate(${n(fx)} ${n(v.fy)})` };
  A.guance = { opacity: `${n(lim(0.45 * v.guance, 0, 0.95))}` };
  const felice = lim(v.felice, 0, 1);
  A.occhiAperti = { opacity: `${n(1 - felice)}`, display: felice > 0.99 ? "none" : "inline" };
  A.felici = { opacity: `${n(felice)}`, display: felice < 0.01 ? "none" : "inline" };

  let px = v.pupX + s.sguardoX;
  let py = v.pupY + s.sguardoY;
  px += (s.guardaX - px) * s.guardaW;
  py += (s.guardaY - py) * s.guardaW;
  px = lim(px, -3, 3);
  py = lim(py, -3.2, 3.2);
  const sb = lim(v.sbarra, 0, 1.2);

  for (const lato of ["sx", "dx"] as const) {
    const L = lato === "sx" ? "Sx" : "Dx";
    const { x: ex, y: ey } = OCCHIO[lato];
    const lid = lim(Math.max(v.palpebra + (lato === "dx" ? v.occhiolino : 0), s.ciglio), -0.2, 1);
    A[`occhio${L}`] = { transform: `translate(${ex} ${ey}) scale(${n(1 + 0.12 * sb)}) translate(-${ex} -${ey})` };
    A[`pupilla${L}`] = { transform: `translate(${n(ex + px)} ${n(ey + py)}) scale(${n(1 - 0.22 * sb)}) translate(-${ex} -${ey})` };
    const yb = ey - 6.5 + 13 * Math.max(0, lid);
    const inc = v.palpebraInc / 2;
    const interno = lato === "sx" ? 1 : -1;
    const yL = yb - inc * interno;
    const yR = yb + inc * interno;
    A[`palpebra${L}`] = { d: lid <= 0.01 ? "M0,0" : `M${ex - 7},${ey - 9} L${ex + 7},${ey - 9} L${ex + 7},${n(yR)} L${ex - 7},${n(yL)} Z` };
    const chiuso = liscio(0.6, 1, lid);
    const yc = yb + (ey + 1 - yb) * chiuso;
    const curva = 4 * Math.max(0, lid);
    A[`ciglia${L}`] = {
      d: `M${ex - 6},${n(yc - inc * interno * (1 - chiuso))} Q${ex},${n(yc + curva)} ${ex + 6},${n(yc + inc * interno * (1 - chiuso))}`,
      opacity: lid > 0.08 ? "1" : "0",
    };
    const segno = lato === "sx" ? 1 : -1;
    const cy = v.cigliaY + Math.min(0, py) * 0.5 - sb * 1.5;
    A[`sopra${L}`] = { transform: `translate(0 ${n(cy)}) rotate(${n(segno * v.cigliaRot)} ${ex} ${ey - 11})` };
  }
  const st = lim(v.stella, 0, 1);
  A.stella = st < 0.01 ? { display: "none", opacity: "0" } : { display: "inline", opacity: `${n(st)}`, transform: `translate(137 152) scale(${n(0.8 + 0.25 * Math.sin(t * 4))}) translate(-137 -152)` };

  // Bocca
  const parla = lim(v.parla, 0, 1.5);
  const apri = parla * (0.5 + 0.5 * Math.sin((TAU * t) / 0.32));
  const y0 = BOCCA_Y + v.boccaY;
  const yl = y0 - v.boccaStorta / 2;
  const yr = y0 + v.boccaStorta;
  const su = v.boccaSu - 1.5 * apri;
  const giu = v.boccaGiu + 4 * apri;
  const bp = boccaPath(Math.max(1.5, v.boccaL), yl, yr, su, giu);
  A.bocca = { d: bp };
  A.boccaClip = { d: bp };
  const lingua = lim((giu - su - 7) / 5, 0, 1);
  A.lingua = { opacity: `${n(lingua)}`, transform: `translate(120 ${n((yl + yr) / 2 + giu * 0.42)}) scale(${n(Math.max(0.3, v.boccaL / 9))} 1)` };

  // Accessori della faccia e del collo
  A.occhialiSole = { transform: `translate(0 ${n(-12 * v.occhiali)}) rotate(${n(-5 * v.occhiali)} 120 158)` };
  A.sciarpaNodo = { transform: `translate(120 146) scale(${n(1 - 0.07 * v.sciarpa)} ${n(1 + 0.05 * v.sciarpa)}) translate(-120 -146)` };
  A.sciarpaCoda = { transform: `rotate(${n(s.codaA)} 106 150)` };

  // Oggetti davanti, libro, pensiero
  A.davanti = { transform: `translate(0 ${n(v.davantiY)}) rotate(${n(v.davantiRot)} 120 205)` };
  const libro = lim(v.libro, 0, 1);
  A.libroSx = { transform: `translate(120 0) scale(${n(Math.max(0.001, libro))} 1) translate(-120 0)` };
  A.copertina = { opacity: `${n(1 - libro)}` };
  const pg = v.pagina;
  A.pagina = pg <= 0.001 || pg >= 0.999 ? { display: "none", transform: "scale(0)" } : { display: "inline", transform: `translate(120 0) scale(${n(1 - 2 * pg)} 1) translate(-120 0)` };
  A.pensiero = { transform: `translate(0 ${n(2 * Math.sin(t * 1.5))})` };

  // ——— Braccia ———
  const bpasso = v.braccioPasso * (cam + cor);
  for (const lato of ["sx", "dx"] as const) {
    const L = lato === "sx" ? "Sx" : "Dx";
    const sigma = lato === "sx" ? -1 : 1;
    const sp0 = SPALLA[lato];
    const a = { sp: v[`${lato}Spalla`], go: v[`${lato}Gomito`], ma: v[`${lato}Mano`] };
    gesto(f, lato, v[`${lato}Anim`] * (rid ? 0.5 : 1), t, a);
    if (bpasso > 0.001) {
      const opposta = fase + (lato === "sx" ? Math.PI : 0);
      a.sp += sigma * fronte * (20 * cam + 26 * cor) * Math.sin(opposta) * v.braccioPasso * (0.4 + 0.6 * Math.abs(v.verso));
      a.go -= 60 * cor * v.braccioPasso;
    }
    const allunga = Math.max(0.3, v[`${lato}Allunga`]);
    const l1 = OSSA.braccio[0] * allunga;
    const l2 = OSSA.braccio[1] * allunga;
    const t1 = rad(a.sp);
    const ex = sp0.x + sigma * l1 * Math.cos(t1);
    const ey = sp0.y - l1 * Math.sin(t1);
    const t2 = rad(a.sp + a.go);
    const hx = ex + sigma * l2 * Math.cos(t2);
    const hy = ey - l2 * Math.sin(t2);
    const qx = 2 * ex - (sp0.x + hx) / 2;
    const qy = 2 * ey - (sp0.y + hy) / 2;
    const braccio = `M${sp0.x},${sp0.y} Q${n(qx)},${n(qy)} ${n(hx)},${n(hy)}`;
    A[`braccio${L}C`] = { d: braccio };
    A[`braccio${L}F`] = { d: braccio };
    const tr = rad(a.sp + a.go + 60);
    const rx = ex + sigma * 11 * Math.cos(tr);
    const ry = ey - 11 * Math.sin(tr);
    const rametto = `M${n(ex)},${n(ey)} L${n(rx)},${n(ry)}`;
    A[`rametto${L}C`] = { d: rametto };
    A[`rametto${L}F`] = { d: rametto };
    const angRametto = (Math.atan2(ry - ey, rx - ex) * 180) / Math.PI;
    A[`foglia${L}`] = { transform: `translate(${n(rx)} ${n(ry)}) rotate(${n(angRametto + 8 * Math.sin(t * 3 + sigma))})` };
    const t3 = a.sp + a.go + a.ma;
    A[`mano${L}`] = { transform: `translate(${n(hx)} ${n(hy)})${lato === "dx" ? " scale(-1 1)" : ""} rotate(${n(t3)})` };
    A[`ogg${L}`] = { transform: `translate(${n(hx)} ${n(hy)}) rotate(${n(v[`${lato}Ogg`])})` };
    // Non è un nodo: la posizione della mano, per far partire vapore e gocce dagli oggetti.
    A[`_mano${L}`] = { x: `${hx}`, y: `${hy}` };
    // Gli attrezzi del mestiere stanno fuori dal corpo (sopra gli arredi): stessa mano, trasformazioni composte.
    if (s.lavoro || s.scena) A[`attr${L}`] = { transform: `${A.corpo.transform} ${A.busto.transform} translate(${n(hx)} ${n(hy)}) rotate(${n(v[`${lato}Ogg`])})` };
  }

  if (s.lavoro) fotogrammaArredi(v, s.lavoro, A, t);
  if (s.scena) fotogrammaScena(v, s.scena, A, t, s.stringi);
  if (s.lavoro || s.scena) fotogrammaAttrezzi(v, A);

  return A;
}

/** Punto del busto → coordinate del personaggio (per far partire gocce e foglie dal punto giusto). */
export function aMondo(v: Canali, s: StatoVivo, bx: number, by: number): [number, number] {
  const y = by + lim(v.seduto, 0, 1) * 22;
  // scala attorno ai piedi
  let x1 = 120 + (bx - 120) * v.sx;
  let y1 = TERRA + (y - TERRA) * v.sy;
  // rotazione attorno al perno
  const a = rad(v.rot);
  const dx = x1 - s.pernoX;
  const dy = y1 - s.pernoY;
  x1 = s.pernoX + dx * Math.cos(a) - dy * Math.sin(a);
  y1 = s.pernoY + dx * Math.sin(a) + dy * Math.cos(a);
  return [x1 + s.X, y1 + s.Y];
}
