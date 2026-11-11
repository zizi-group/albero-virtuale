// Texture dipinte su canvas: foglie (in grigio, il colore lo dà ogni copia),
// cortecce con venature e rilievo, guance, stoffe, terreno e piccoli sprite.
// Tutto deterministico e in cache: si dipinge una volta sola per pagina.
import * as THREE from "three";
import { generatore, hash } from "./casuale.js";

/** @type {Map<string, any>} */
const cache = new Map();

/** @param {number} w @param {number} h @returns {[HTMLCanvasElement, CanvasRenderingContext2D]} */
function tela(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"))];
}

/** @param {HTMLCanvasElement} canvas @param {boolean} [srgb] */
function tex(canvas, srgb = true) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** @template T @param {string} chiave @param {() => T} crea @returns {T} */
function inCache(chiave, crea) {
  if (!cache.has(chiave)) cache.set(chiave, crea());
  return cache.get(chiave);
}

// ---------------------------------------------------------------- Foglie
// Contorno della foglia: mezza larghezza (0..1) in funzione dell'altezza y (0 = picciolo, 1 = punta).
/** @type {Record<string, (y: number) => number>} */
const FORME = {
  quercia: (y) => Math.sin(Math.PI * y) ** 0.8 * (0.62 + 0.38 * Math.abs(Math.sin(y * Math.PI * 4.5))),
  ulivo: (y) => Math.sin(Math.PI * y) ** 1.1 * 0.36,
  salice: (y) => Math.sin(Math.PI * y) ** 1.2 * 0.26,
  betulla: (y) => Math.sin(Math.PI * Math.pow(y, 0.8)) * (0.92 + 0.08 * Math.sin(y * 60)),
  ovale: (y) => Math.sin(Math.PI * Math.pow(y, 0.9)) ** 0.9 * 0.7,
  castagno: (y) => Math.sin(Math.PI * y) ** 0.9 * 0.5 * (0.9 + 0.1 * Math.sin(y * 70)),
  cuore: (y) => Math.sin(Math.PI * Math.pow(y, 0.6)) * 0.95,
  limone: (y) => Math.sin(Math.PI * Math.pow(y, 0.85)) ** 0.8 * 0.6,
};

/** @param {string} forma */
function disegnaFoglia(forma) {
  const W = 128, H = 256;
  const [c, g] = tela(W, H);
  const f = FORME[forma] ?? FORME.ovale;
  g.beginPath();
  for (let i = 0; i <= 60; i++) { const y = i / 60; g.lineTo(W / 2 + f(y) * W * 0.46, H - y * H); }
  for (let i = 60; i >= 0; i--) { const y = i / 60; g.lineTo(W / 2 - f(y) * W * 0.46, H - y * H); }
  g.closePath();
  riempiFoglia(g, W, H);
  return c;
}

/** Riempie il tracciato corrente come una foglia: sfumatura, bordo, nervature. */
function riempiFoglia(/** @type {CanvasRenderingContext2D} */ g, /** @type {number} */ W, /** @type {number} */ H) {
  const gr = g.createLinearGradient(0, 0, W, 0);
  gr.addColorStop(0, "#b0b0b0"); gr.addColorStop(0.45, "#f6f6f6"); gr.addColorStop(0.55, "#ebebeb"); gr.addColorStop(1, "#a2a2a2");
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  g.lineWidth = 9; g.strokeStyle = "rgba(60,60,60,.3)"; g.stroke();
  g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 3.5;
  g.beginPath(); g.moveTo(W / 2, H); g.lineTo(W / 2, H * 0.06); g.stroke();
  g.lineWidth = 1.6; g.strokeStyle = "rgba(255,255,255,.45)";
  for (let k = 1; k < 7; k++) {
    const y = H - (k / 7.5) * H;
    g.beginPath(); g.moveTo(W / 2, y); g.quadraticCurveTo(W * 0.3, y - 14, W * 0.12, y - 30); g.stroke();
    g.beginPath(); g.moveTo(W / 2, y); g.quadraticCurveTo(W * 0.7, y - 14, W * 0.88, y - 30); g.stroke();
  }
  g.restore();
}

/** Foglia palmata (acero) o a tre lobi (fico). @param {number} lobi */
function disegnaPalmata(lobi) {
  const S = 256;
  const [c, g] = tela(S, S);
  g.beginPath();
  const cx = S / 2, cy = S * 0.82;
  const n = 120;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * (i / n); // da destra a sinistra, sopra
    const lob = Math.abs(Math.sin(a * lobi));
    const punta = lobi === 5 ? Math.pow(lob, 0.5) : Math.pow(lob, 0.8);
    const r = S * (0.18 + 0.52 * punta) * (0.75 + 0.25 * Math.sin(a));
    g.lineTo(cx + Math.cos(a) * r, cy - Math.sin(a) * r * 1.05);
  }
  g.lineTo(cx, cy + 10);
  g.closePath();
  riempiFoglia(g, S, S);
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
    g.strokeStyle = r() < 0.5 ? "#ececec" : "#b8b8b8";
    g.lineWidth = 3 + r() * 2;
    g.beginPath(); g.moveTo(x0, H); g.lineTo(x0 + Math.sin(a) * l, H - Math.cos(a) * l); g.stroke();
  }
  g.strokeStyle = "#8a8a8a"; g.lineWidth = 6;
  g.beginPath(); g.moveTo(W / 2, H); g.lineTo(W / 2, H * 0.55); g.stroke();
  return c;
}

/** Fiore a cinque petali, rosa (ciliegio) o bianco (melo). @param {boolean} rosa */
function disegnaFiore(rosa) {
  const S = 128;
  const [c, g] = tela(S, S);
  g.translate(S / 2, S / 2);
  for (let i = 0; i < 5; i++) {
    g.save(); g.rotate((i / 5) * Math.PI * 2);
    const gr = g.createRadialGradient(0, -30, 4, 0, -30, 32);
    if (rosa) { gr.addColorStop(0, "#fff4f6"); gr.addColorStop(0.7, "#f6b3c4"); gr.addColorStop(1, "#e88aa4"); }
    else { gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.7, "#fbf3f4"); gr.addColorStop(1, "#f0c8d0"); }
    g.fillStyle = gr;
    g.beginPath(); g.ellipse(0, -30, 22, 30, 0, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = "destination-out";
    g.beginPath(); g.arc(0, -62, 6, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  g.fillStyle = "#f4c44a"; g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); g.fill();
  return c;
}

/**
 * Texture di una foglia: forme in grigio (il colore lo dà ogni copia) o fiori a colori.
 * @param {string} tipo quercia, ulivo, salice, betulla, ovale, castagno, cuore, limone, acero, fico, aghi, fiore-rosa, fiore-bianco
 */
export function texFoglia(tipo) {
  return inCache(`foglia-${tipo}`, () => {
    if (tipo === "aghi") return tex(disegnaAghi());
    if (tipo === "fiore-rosa") return tex(disegnaFiore(true));
    if (tipo === "fiore-bianco") return tex(disegnaFiore(false));
    if (tipo === "acero") return tex(disegnaPalmata(5));
    if (tipo === "fico") return tex(disegnaPalmata(3));
    return tex(disegnaFoglia(tipo));
  });
}

// ---------------------------------------------------------------- Cortecce
/** @typedef {{ base: string, scuro: string, chiaro: string, stile: string }} Corteccia */
/** @type {Record<string, Corteccia>} */
export const CORTECCE = {
  quercia: { base: "#8a5a36", scuro: "#4e2f1b", chiaro: "#b07e52", stile: "fessure" },
  pino: { base: "#8e4f30", scuro: "#4a2414", chiaro: "#b8714a", stile: "placche" },
  ulivo: { base: "#857762", scuro: "#4a4034", chiaro: "#ab9e86", stile: "torto" },
  betulla: { base: "#ece6d8", scuro: "#2d2a26", chiaro: "#fbf8f0", stile: "betulla" },
  ciliegio: { base: "#7a4334", scuro: "#3e1f18", chiaro: "#a8685a", stile: "anelli" },
  liscia: { base: "#9a8a78", scuro: "#5e5244", chiaro: "#c2b4a0", stile: "liscia" },
  rossa: { base: "#8a4a2a", scuro: "#4a2010", chiaro: "#b06a40", stile: "fessure" },
  chiara: { base: "#a89a86", scuro: "#6a5c4c", chiaro: "#cfc2ae", stile: "fessure" },
  scura: { base: "#6a4a32", scuro: "#3a2416", chiaro: "#8e6a4c", stile: "fessure" },
};

/** Colore e rilievo della corteccia: { map, bump, colori }. @param {string} tipo */
export function texCorteccia(tipo) {
  return inCache(`corteccia-${tipo}`, () => {
    const p = CORTECCE[tipo] ?? CORTECCE.quercia;
    const W = 512, H = 512;
    const r = generatore(hash(tipo));
    const [c, g] = tela(W, H);
    const [b, gb] = tela(W, H);
    g.fillStyle = p.base; g.fillRect(0, 0, W, H);
    gb.fillStyle = "#909090"; gb.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) {
      const x = r() * W, y = r() * H, rr = 20 + r() * 70;
      const gr = g.createRadialGradient(x, y, 0, x, y, rr);
      const col = r() < 0.5 ? p.chiaro : p.scuro;
      gr.addColorStop(0, col + "33"); gr.addColorStop(1, col + "00");
      g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    /** @param {number[][]} punti @param {number} larg @param {string} colore @param {string} rilievo */
    const linea = (punti, larg, colore, rilievo) => {
      for (const [ctx, col] of /** @type {[CanvasRenderingContext2D, string][]} */ ([[g, colore], [gb, rilievo]])) {
        ctx.strokeStyle = col; ctx.lineWidth = larg; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); punti.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      }
    };
    /** @param {number} x0 @param {number} incl */
    const vena = (x0, incl) => {
      const pts = [];
      for (let y = -20; y <= H + 20; y += 16) pts.push([x0 + Math.sin(y * 0.018 + x0) * 9 + y * incl, y]);
      return pts;
    };
    if (p.stile === "fessure" || p.stile === "torto" || p.stile === "placche") {
      const incl = p.stile === "torto" ? 0.35 : 0;
      const n = p.stile === "placche" ? 14 : 26;
      for (let i = 0; i < n; i++) {
        const x = (i / n) * W + r() * 12;
        const larg = p.stile === "placche" ? 7 : 3 + r() * 6;
        for (const dx of [0, -W, W]) linea(vena(x + dx, incl), larg, p.scuro + "cc", "#303030");
        for (const dx of [0, -W, W]) linea(vena(x + dx + larg + 3, incl), 2, p.chiaro + "88", "#d0d0d0");
      }
      if (p.stile === "placche") {
        for (let i = 0; i < 70; i++) {
          const x = r() * W, y = r() * H, l = 18 + r() * 26;
          linea([[x, y], [x + l, y + (r() - 0.5) * 6]], 5, p.scuro + "cc", "#303030");
        }
      }
    }
    if (p.stile === "betulla") {
      for (let i = 0; i < 55; i++) {
        const x = r() * W, y = r() * H, l = 14 + r() * 60;
        linea([[x, y], [x + l * 0.5, y + (r() - 0.5) * 3], [x + l, y + (r() - 0.5) * 4]], 3 + r() * 7, p.scuro + "dd", "#505050");
      }
    }
    if (p.stile === "anelli") {
      for (let i = 0; i < 46; i++) {
        const y = r() * H, x = r() * W, l = 30 + r() * 90;
        linea([[x, y], [x + l, y + (r() - 0.5) * 3]], 3 + r() * 2, p.chiaro + "bb", "#c8c8c8");
      }
      for (let i = 0; i < 14; i++) linea(vena((i / 14) * W, 0), 2, p.scuro + "66", "#707070");
    }
    if (p.stile === "liscia") {
      for (let i = 0; i < 30; i++) linea(vena((i / 30) * W + r() * 8, 0), 1.5, p.scuro + "44", "#808080");
      for (let i = 0; i < 25; i++) { const y = r() * H; linea([[r() * W, y], [r() * W, y + 2]], 2, p.scuro + "55", "#707070"); }
    }
    // Nodi solo ai fianchi, lontano dal viso
    for (let i = 0; i < 3; i++) {
      const x = W * (0.42 + r() * 0.16), y = H * (0.2 + r() * 0.6);
      for (let k = 4; k >= 0; k--) {
        for (const [ctx, col] of /** @type {[CanvasRenderingContext2D, string][]} */ ([[g, k % 2 ? p.scuro + "aa" : p.chiaro + "66"], [gb, k % 2 ? "#404040" : "#c0c0c0"]])) {
          ctx.strokeStyle = col; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.ellipse(x, y, 6 + k * 5, 9 + k * 7, 0, 0, Math.PI * 2); ctx.stroke();
        }
      }
    }
    const map = tex(c), bump = tex(b, false);
    for (const t of [map, bump]) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return { map, bump, colori: p };
  });
}

/** Guancia rosa sfumata, con o senza lentiggini. @param {boolean} lentiggini */
export function texGuancia(lentiggini) {
  return inCache(`guancia-${lentiggini}`, () => {
    const S = 128;
    const [c, g] = tela(S, S);
    const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, "rgba(242,112,118,.95)"); gr.addColorStop(0.55, "rgba(242,120,120,.5)"); gr.addColorStop(1, "rgba(242,120,120,0)");
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    if (lentiggini) {
      g.fillStyle = "rgba(110,60,35,.75)";
      for (const [x, y, rr] of [[44, 50, 4], [62, 42, 3.5], [80, 52, 4], [54, 66, 3], [74, 70, 3.5]]) { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
    }
    return tex(c);
  });
}

/** Stoffa a righe o a pallini. @param {"righe"|"pallini"} tipo @param {string} a @param {string} b */
export function texStoffa(tipo, a, b) {
  return inCache(`stoffa-${tipo}-${a}-${b}`, () => {
    const S = 256;
    const [c, g] = tela(S, S);
    g.fillStyle = a; g.fillRect(0, 0, S, S);
    g.fillStyle = b;
    if (tipo === "righe") for (let i = 0; i < 8; i += 2) g.fillRect(0, (i * S) / 8, S, S / 8);
    else for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.beginPath(); g.arc((x + (y % 2) * 0.5) * 32 + 8, y * 32 + 16, 6, 0, 7); g.fill(); }
    const t = tex(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** Macchia morbida radiale (ombre, aloni, lucciole). @param {string} colore rgba senza alfa finale, es. "0,0,0" */
export function texAlone(colore = "0,0,0", forza = 0.55) {
  return inCache(`alone-${colore}-${forza}`, () => {
    const [c, g] = tela(128, 128);
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, `rgba(${colore},${forza})`); gr.addColorStop(0.6, `rgba(${colore},${forza * 0.45})`); gr.addColorStop(1, `rgba(${colore},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return tex(c);
  });
}

/** Testo o simbolo su sprite (zzz, cuori, note, punto esclamativo). @param {string} testo @param {string} colore */
export function texSimbolo(testo, colore) {
  return inCache(`simbolo-${testo}-${colore}`, () => {
    const [c, g] = tela(128, 128);
    g.font = "bold 92px system-ui, sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 10; g.strokeStyle = "rgba(255,255,255,.9)";
    g.strokeText(testo, 64, 70);
    g.fillStyle = colore; g.fillText(testo, 64, 70);
    return tex(c);
  });
}

/** Cuore pieno per lo sprite dei cuoricini. */
export function texCuore() {
  return inCache("cuore", () => {
    const [c, g] = tela(128, 128);
    g.fillStyle = "#ff5a7a";
    g.strokeStyle = "#ffffff"; g.lineWidth = 8;
    g.beginPath();
    g.moveTo(64, 108);
    g.bezierCurveTo(10, 70, 14, 22, 50, 26);
    g.bezierCurveTo(60, 28, 64, 38, 64, 42);
    g.bezierCurveTo(64, 38, 68, 28, 78, 26);
    g.bezierCurveTo(114, 22, 118, 70, 64, 108);
    g.closePath(); g.stroke(); g.fill();
    return tex(c);
  });
}

/** Ombre delle nuvole che scorrono sul prato: macchie scure morbide, ripetibili. */
export function texNuvole() {
  return inCache("nuvole", () => {
    const S = 512;
    const [c, g] = tela(S, S);
    const r = generatore(77);
    for (let i = 0; i < 26; i++) {
      const x = r() * S, y = r() * S, rr = 50 + r() * 110;
      for (const dx of [0, -S, S]) for (const dy of [0, -S, S]) {
        const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rr);
        gr.addColorStop(0, "rgba(0,0,0,.5)"); gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr; g.fillRect(x + dx - rr, y + dy - rr, rr * 2, rr * 2);
      }
    }
    const t = tex(c, false);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}
