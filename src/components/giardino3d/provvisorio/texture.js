// Texture dipinte su canvas per Linfa: foglie (in grigio, il colore lo dà ogni
// copia) e cortecce con venature (colore + rilievo). Deterministiche e in cache.
import * as THREE from "three";

/** Generatore deterministico (mulberry32) da un numero. */
export function generatore(seme) {
  let s = seme >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Da una stringa (il seme dell'albero) a un numero. */
export function hash(testo) {
  let h = 2166136261;
  for (const c of String(testo)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

const cache = new Map();
const tela = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
};
function tex(canvas, srgb = true) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ---------------------------------------------------------------- Foglie
// Ogni forma: un contorno (raggio in funzione dell'altezza lungo la foglia).
const FORME = {
  // quercia: lobi arrotondati
  quercia: (y) => Math.sin(Math.PI * y) ** 0.8 * (0.62 + 0.38 * Math.abs(Math.sin(y * Math.PI * 4.5))),
  // ulivo: lunga e stretta
  ulivo: (y) => Math.sin(Math.PI * y) ** 1.1 * 0.36,
  // betulla: ovale a punta, dentellata
  betulla: (y) => Math.sin(Math.PI * Math.pow(y, 0.8)) * (0.92 + 0.08 * Math.sin(y * 60)),
  // ciliegio: ovale allungata
  ciliegio: (y) => Math.sin(Math.PI * Math.pow(y, 0.9)) ** 0.9 * 0.7,
};

function disegnaFoglia(forma) {
  const W = 128, H = 256;
  const [c, g] = tela(W, H);
  const f = FORME[forma];
  g.beginPath();
  for (let i = 0; i <= 60; i++) { const y = i / 60; g.lineTo(W / 2 + f(y) * W * 0.46, H - y * H); }
  for (let i = 60; i >= 0; i--) { const y = i / 60; g.lineTo(W / 2 - f(y) * W * 0.46, H - y * H); }
  g.closePath();
  const gr = g.createLinearGradient(0, 0, W, 0);
  gr.addColorStop(0, "#a8a8a8"); gr.addColorStop(0.45, "#f2f2f2"); gr.addColorStop(0.55, "#e6e6e6"); gr.addColorStop(1, "#9a9a9a");
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  // bordo più scuro
  g.lineWidth = 10; g.strokeStyle = "rgba(60,60,60,.35)"; g.stroke();
  // nervatura centrale e laterali
  g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 3.5;
  g.beginPath(); g.moveTo(W / 2, H); g.lineTo(W / 2, H * 0.06); g.stroke();
  g.lineWidth = 1.6; g.strokeStyle = "rgba(255,255,255,.45)";
  for (let k = 1; k < 7; k++) {
    const y = H - (k / 7.5) * H;
    g.beginPath(); g.moveTo(W / 2, y); g.quadraticCurveTo(W * 0.3, y - 14, W * 0.12, y - 30); g.stroke();
    g.beginPath(); g.moveTo(W / 2, y); g.quadraticCurveTo(W * 0.7, y - 14, W * 0.88, y - 30); g.stroke();
  }
  g.restore();
  return c;
}

function disegnaAghi() {
  const W = 128, H = 256;
  const [c, g] = tela(W, H);
  const r = generatore(5);
  g.lineCap = "round";
  for (let i = 0; i < 42; i++) {
    const a = (r() - 0.5) * 0.9;
    const l = H * (0.65 + r() * 0.33);
    const x0 = W / 2 + (r() - 0.5) * 10;
    g.strokeStyle = r() < 0.5 ? "#e8e8e8" : "#b4b4b4";
    g.lineWidth = 3 + r() * 2;
    g.beginPath(); g.moveTo(x0, H); g.lineTo(x0 + Math.sin(a) * l, H - Math.cos(a) * l); g.stroke();
  }
  g.strokeStyle = "#8a8a8a"; g.lineWidth = 6;
  g.beginPath(); g.moveTo(W / 2, H); g.lineTo(W / 2, H * 0.55); g.stroke();
  return c;
}

function disegnaFiore() {
  const S = 128;
  const [c, g] = tela(S, S);
  g.translate(S / 2, S / 2);
  for (let i = 0; i < 5; i++) {
    g.save(); g.rotate((i / 5) * Math.PI * 2);
    const gr = g.createRadialGradient(0, -30, 4, 0, -30, 32);
    gr.addColorStop(0, "#fff4f6"); gr.addColorStop(0.7, "#f6b3c4"); gr.addColorStop(1, "#e88aa4");
    g.fillStyle = gr;
    g.beginPath(); g.ellipse(0, -30, 22, 30, 0, 0, Math.PI * 2); g.fill();
    // tacca sul petalo
    g.globalCompositeOperation = "destination-out";
    g.beginPath(); g.arc(0, -62, 6, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  g.fillStyle = "#f4c44a"; g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#c46a2a";
  for (let i = 0; i < 8; i++) { const a = i * 0.785; g.beginPath(); g.arc(Math.cos(a) * 13, Math.sin(a) * 13, 2.4, 0, 7); g.fill(); }
  return c;
}

/** Texture della foglia: forma in grigio (quercia, ulivo, betulla, ciliegio, aghi) o fiore a colori. */
export function texFoglia(tipo) {
  const k = `foglia-${tipo}`;
  if (!cache.has(k)) {
    const canvas = tipo === "aghi" ? disegnaAghi() : tipo === "fiore" ? disegnaFiore() : disegnaFoglia(tipo);
    cache.set(k, tex(canvas));
  }
  return cache.get(k);
}

// ---------------------------------------------------------------- Cortecce
// u = giro intorno al tronco (u = 0 e 1 sono il davanti, dove c'è il viso), v = altezza.
const CORTECCE = {
  quercia: { base: "#8a5a36", scuro: "#4e2f1b", chiaro: "#b07e52", stile: "fessure" },
  pino: { base: "#8e4f30", scuro: "#4a2414", chiaro: "#b8714a", stile: "placche" },
  ulivo: { base: "#857762", scuro: "#4a4034", chiaro: "#ab9e86", stile: "torto" },
  betulla: { base: "#ece6d8", scuro: "#2d2a26", chiaro: "#fbf8f0", stile: "betulla" },
  ciliegio: { base: "#7a4334", scuro: "#3e1f18", chiaro: "#a8685a", stile: "anelli" },
};

/** Colore e rilievo della corteccia di una specie: { map, bump }. */
export function texCorteccia(specie) {
  const k = `corteccia-${specie}`;
  if (cache.has(k)) return cache.get(k);
  const p = CORTECCE[specie];
  const W = 512, H = 512;
  const r = generatore(hash(specie));
  const [c, g] = tela(W, H); // colore
  const [b, gb] = tela(W, H); // rilievo (chiaro = in fuori)
  g.fillStyle = p.base; g.fillRect(0, 0, W, H);
  gb.fillStyle = "#909090"; gb.fillRect(0, 0, W, H);
  // Velatura morbida di colore
  for (let i = 0; i < 160; i++) {
    const x = r() * W, y = r() * H, rr = 20 + r() * 70;
    const gr = g.createRadialGradient(x, y, 0, x, y, rr);
    const col = r() < 0.5 ? p.chiaro : p.scuro;
    gr.addColorStop(0, col + "33"); gr.addColorStop(1, col + "00");
    g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  const linea = (punti, larg, colore, rilievo) => {
    for (const [ctx, col] of [[g, colore], [gb, rilievo]]) {
      ctx.strokeStyle = col; ctx.lineWidth = larg; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); punti.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    }
  };
  const venaVerticale = (x0, inclinazione, larg) => {
    const pts = [];
    for (let y = -20; y <= H + 20; y += 16) pts.push([x0 + Math.sin(y * 0.018 + x0) * 9 + y * inclinazione, y]);
    return pts;
  };
  if (p.stile === "fessure" || p.stile === "torto" || p.stile === "placche") {
    const incl = p.stile === "torto" ? 0.35 : 0;
    const n = p.stile === "placche" ? 14 : 26;
    for (let i = 0; i < n; i++) {
      const x = (i / n) * W + r() * 12;
      const larg = p.stile === "placche" ? 7 : 3 + r() * 6;
      // le venature si ripetono ai bordi per non lasciare la cucitura
      for (const dx of [0, -W, W]) linea(venaVerticale(x + dx, incl, larg), larg, p.scuro + "cc", "#303030");
      // filo chiaro accanto alla fessura: il legno in rilievo
      for (const dx of [0, -W, W]) linea(venaVerticale(x + dx + larg + 3, incl, 2), 2, p.chiaro + "88", "#d0d0d0");
    }
    if (p.stile === "placche") {
      // fessure orizzontali che spezzano le placche
      for (let i = 0; i < 70; i++) {
        const x = r() * W, y = r() * H, l = 18 + r() * 26;
        linea([[x, y], [x + l, y + (r() - 0.5) * 6]], 5, p.scuro + "cc", "#303030");
      }
    }
  }
  if (p.stile === "betulla") {
    for (let i = 0; i < 55; i++) {
      const x = r() * W, y = r() * H, l = 14 + r() * 60;
      const t = 3 + r() * 7;
      linea([[x, y], [x + l * 0.5, y + (r() - 0.5) * 3], [x + l, y + (r() - 0.5) * 4]], t, p.scuro + "dd", "#505050");
    }
    for (let i = 0; i < 40; i++) { const y = r() * H; linea([[0, y], [W, y + (r() - 0.5) * 6]], 1, "#c9c0ae88", "#a0a0a0"); }
  }
  if (p.stile === "anelli") {
    for (let i = 0; i < 46; i++) {
      const y = r() * H, x = r() * W, l = 30 + r() * 90;
      linea([[x, y], [x + l, y + (r() - 0.5) * 3]], 3 + r() * 2, p.chiaro + "bb", "#c8c8c8");
    }
    for (let i = 0; i < 14; i++) { const x = (i / 14) * W; linea(venaVerticale(x, 0, 2), 2, p.scuro + "66", "#707070"); }
  }
  // Nodi del legno solo ai fianchi (u fra 0,42 e 0,58 della texture), lontano dal viso
  for (let i = 0; i < 3; i++) {
    const x = W * (0.42 + r() * 0.16), y = H * (0.2 + r() * 0.6);
    for (let k = 4; k >= 0; k--) {
      const rx = 6 + k * 5, ry = 9 + k * 7;
      for (const [ctx, col] of [[g, k % 2 ? p.scuro + "aa" : p.chiaro + "66"], [gb, k % 2 ? "#404040" : "#c0c0c0"]]) {
        ctx.strokeStyle = col; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
    g.fillStyle = p.scuro; g.beginPath(); g.ellipse(x, y, 5, 7, 0, 0, 7); g.fill();
  }
  const map = tex(c), bump = tex(b, false);
  for (const t of [map, bump]) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const out = { map, bump, colori: p };
  cache.set(k, out);
  return out;
}

/** Guancia rosa sfumata, con o senza lentiggini. */
export function texGuancia(lentiggini) {
  const k = `guancia-${lentiggini}`;
  if (cache.has(k)) return cache.get(k);
  const S = 128;
  const [c, g] = tela(S, S);
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, "rgba(242,112,118,.9)"); gr.addColorStop(0.55, "rgba(242,120,120,.5)"); gr.addColorStop(1, "rgba(240,128,120,0)");
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  if (lentiggini) {
    g.fillStyle = "rgba(110,60,35,.75)";
    for (const [x, y, rr] of [[44, 50, 4], [62, 42, 3.5], [80, 52, 4], [54, 66, 3], [74, 70, 3.5]]) { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
  }
  const t = tex(c);
  cache.set(k, t);
  return t;
}

/** Stoffa: righe o pallini, per berretto e bandana. */
export function texStoffa(tipo, a, b) {
  const k = `stoffa-${tipo}-${a}-${b}`;
  if (cache.has(k)) return cache.get(k);
  const S = 256;
  const [c, g] = tela(S, S);
  g.fillStyle = a; g.fillRect(0, 0, S, S);
  g.fillStyle = b;
  if (tipo === "righe") for (let i = 0; i < 8; i += 2) g.fillRect(0, (i * S) / 8, S, S / 8);
  else for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.beginPath(); g.arc((x + (y % 2) * 0.5) * 32 + 8, y * 32 + 16, 6, 0, 7); g.fill(); }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  cache.set(k, t);
  return t;
}
