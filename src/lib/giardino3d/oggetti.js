// Oggetti 3D delle routine e delle azioni: tutti fatti in codice, piccoli e leggeri.
// Ogni funzione restituisce un THREE.Group con l'origine nel punto di presa
// (per gli oggetti in mano) o alla base (per quelli a terra).
import * as THREE from "three";
import { mat, ovale, tubo } from "./forme.js";
import { texFoglia, texStoffa } from "./texture.js";

const box = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ z, /** @type {THREE.Material} */ m) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m);
const cil = (/** @type {number} */ r0, /** @type {number} */ r1, /** @type {number} */ h, /** @type {THREE.Material} */ m, seg = 16) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m);

/** Foglia piatta con la texture (in mano o come ombrello). @param {string} tipo @param {string} colore @param {number} s */
export function foglia(tipo = "quercia", colore = "#5ea82c", s = 1) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(1, 1.3, 2, 4);
  geo.translate(0, 0.65, 0);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, 0.18 * p.getX(i) ** 2 - 0.1 * (p.getY(i) / 1.3) ** 2);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: texFoglia(tipo), alphaTest: 0.45, side: THREE.DoubleSide, color: colore }));
  m.scale.setScalar(s);
  g.add(m);
  return g;
}

/** Ombrello di foglia: una foglia grande tenuta per il gambo sopra la chioma. @param {number} [alto] lunghezza del gambo */
export function ombrelloFoglia(alto = 0.9) {
  const g = new THREE.Group();
  g.add(tubo([[0, 0, 0], [0, alto * 0.6, 0], [0.02, alto, 0]], 0.024, 0.016, mat("#6a8a2a"), 6, 6));
  const f = foglia("quercia", "#4caa38", 1.5);
  f.rotation.set(-Math.PI / 2 + 0.15, 0, 0);
  f.position.set(-0.5, alto + 0.02, 0.95); // centrata sopra la chioma, non sopra la mano
  g.add(f);
  return g;
}

/** Uccellino tondo, con le ali che sbattono (userData.ali). */
export function uccellino() {
  const g = new THREE.Group();
  const piume = mat("#f0a830", { roughness: 0.6 });
  const pancia = mat("#fff0c8", { roughness: 0.6 });
  g.add(ovale(0.07, 0.06, 0.08, piume));
  const p = ovale(0.05, 0.04, 0.05, pancia, true);
  p.position.set(0, -0.015, 0.035);
  const testa = ovale(0.045, 0.045, 0.045, piume, true);
  testa.position.set(0, 0.055, 0.05);
  const becco = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.03, 6), mat("#e06a1a"));
  becco.rotation.x = Math.PI / 2;
  becco.position.set(0, 0.055, 0.1);
  const occhi = mat("#1a1008");
  for (const s of [-1, 1]) { const o = ovale(0.008, 0.008, 0.008, occhi, true); o.position.set(s * 0.025, 0.066, 0.085); g.add(o); }
  const ali = [-1, 1].map((s) => {
    const a = new THREE.Group();
    const piuma = ovale(0.02, 0.05, 0.06, mat("#d8862a"), true);
    piuma.position.set(s * 0.02, 0, 0);
    a.add(piuma);
    a.position.set(s * 0.06, 0.01, 0);
    g.add(a);
    return a;
  });
  const coda = ovale(0.02, 0.012, 0.05, mat("#d8862a"), true);
  coda.position.set(0, 0.01, -0.09);
  coda.rotation.x = -0.4;
  g.add(p, testa, becco, coda);
  g.userData.ali = ali;
  return g;
}

/** Ventaglio di foglia per farsi vento. */
export function ventaglio() {
  const g = foglia("acero", "#6cc244", 0.3);
  g.rotation.z = Math.PI;
  return g;
}

// ------------------------------------------------------------------ Oggetti delle azioni
export function libro(/** @type {string} */ colore = "#8b3a3a") {
  const g = new THREE.Group();
  const cop = mat(colore, { roughness: 0.6 });
  const carta = mat("#fbf6e8");
  for (const s of [-1, 1]) {
    const meta = new THREE.Group();
    const c = box(0.17, 0.012, 0.24, cop); c.position.x = s * 0.085;
    const pg = box(0.16, 0.012, 0.22, carta); pg.position.set(s * 0.082, 0.01, 0);
    meta.add(c, pg);
    meta.rotation.z = -s * 0.25;
    g.add(meta);
  }
  return g;
}

export function giornale() {
  const g = new THREE.Group();
  const carta = mat("#ece6d6", { roughness: 0.9 });
  const fogli = box(0.42, 0.3, 0.008, carta);
  g.add(fogli);
  const righe = mat("#8a8478");
  for (let i = 0; i < 6; i++) { const r = box(0.16, 0.012, 0.002, righe); r.position.set(i < 3 ? -0.1 : 0.1, 0.1 - (i % 3) * 0.06, 0.006); g.add(r); }
  const titolo = box(0.34, 0.03, 0.002, mat("#3a3a3a")); titolo.position.set(0, 0.12, 0.006); g.add(titolo);
  return g;
}

export function ombrello(/** @type {string} */ colore = "#e04a3a", alto = 0.85) {
  const g = new THREE.Group();
  g.add(tubo([[0, -0.1, 0], [0, alto, 0]], 0.014, 0.014, mat("#3a2a1a"), 4, 6));
  const manico = tubo([[0, -0.1, 0], [0, -0.16, 0], [0.05, -0.18, 0], [0.07, -0.12, 0]], 0.014, 0.014, mat("#3a2a1a"), 8, 6);
  const tela = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.28, 16, 1, true), new THREE.MeshStandardMaterial({ color: colore, roughness: 0.6, side: THREE.DoubleSide }));
  tela.position.y = alto - 0.07;
  g.add(manico, tela);
  return g;
}

export function telefono() {
  const g = new THREE.Group();
  const corpo = box(0.06, 0.12, 0.012, mat("#2a2e36", { roughness: 0.3 }));
  const schermo = box(0.05, 0.1, 0.002, new THREE.MeshBasicMaterial({ color: "#7ac8f0" }));
  schermo.position.z = 0.007;
  g.add(corpo, schermo);
  return g;
}

export function pennello() {
  const g = new THREE.Group();
  g.add(tubo([[0, -0.08, 0], [0, 0.22, 0]], 0.016, 0.013, mat("#c99a5a", { roughness: 0.5 }), 4, 6));
  g.add(tubo([[0, 0.25, 0], [0, 0.32, 0], [0.01, 0.38, 0]], 0.019, 0.004, mat("#e0402a", { roughness: 0.4 }), 6, 6));
  return g;
}

/** Cavalletto con la tela: il quadro si «riempie» (userData.colori). */
export function cavalletto() {
  const g = new THREE.Group();
  const legno = mat("#b07a44", { roughness: 0.7 });
  for (const [x, z, rz, rx] of [[-0.22, 0.05, 0.12, 0], [0.22, 0.05, -0.12, 0], [0, -0.22, 0, 0.3]]) {
    const gamba = box(0.04, 1.3, 0.04, legno);
    gamba.position.set(x, 0.64, z);
    gamba.rotation.set(rx, 0, rz);
    g.add(gamba);
  }
  const tela = box(0.56, 0.44, 0.03, mat("#fbf8ef", { roughness: 0.9 }));
  tela.position.set(0, 0.98, 0.1);
  tela.rotation.x = -0.1;
  g.add(tela);
  const ripiano = box(0.6, 0.03, 0.08, legno);
  ripiano.position.set(0, 0.74, 0.12);
  g.add(ripiano);
  // pennellate che compaiono una alla volta
  const colori = ["#e0402a", "#3a7bd5", "#f0b828", "#3aa04a", "#a050c0"].map((c, i) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.06 + (i % 2) * 0.03, 12), mat(c, { roughness: 0.8 }));
    m.position.set(-0.17 + i * 0.085, 0.9 + ((i * 37) % 5) * 0.035, 0.118);
    m.rotation.x = -0.1;
    m.scale.setScalar(0.001);
    g.add(m);
    return m;
  });
  g.userData.colori = colori;
  return g;
}

export function quaderno() {
  const g = new THREE.Group();
  const c = box(0.2, 0.012, 0.26, mat("#2f7a5a", { roughness: 0.6 }));
  const p = box(0.19, 0.012, 0.25, mat("#fbf6e8"));
  p.position.y = 0.01;
  g.add(c, p);
  const righe = mat("#9ab0c8");
  for (let i = 0; i < 5; i++) { const r = box(0.15, 0.002, 0.004, righe); r.position.set(0, 0.017, -0.08 + i * 0.04); g.add(r); }
  return g;
}

export function penna() {
  const g = new THREE.Group();
  g.add(tubo([[0, -0.02, 0], [0, 0.16, 0]], 0.011, 0.009, mat("#3a5aa8", { roughness: 0.4 }), 4, 6));
  const punta = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.03, 8), mat("#d8c070", { metalness: 0.7, roughness: 0.3 }));
  punta.rotation.x = Math.PI;
  punta.position.y = -0.035;
  g.add(punta);
  return g;
}

export function manubrio() {
  const g = new THREE.Group();
  const ferro = mat("#4a4e58", { metalness: 0.6, roughness: 0.35 });
  g.add(tubo([[-0.1, 0, 0], [0.1, 0, 0]], 0.015, 0.015, ferro, 4, 6));
  for (const s of [-1, 1]) { const peso = cil(0.055, 0.055, 0.05, mat("#c8382a", { roughness: 0.5 })); peso.rotation.z = Math.PI / 2; peso.position.x = s * 0.1; g.add(peso); }
  return g;
}

export function ghianda() {
  const g = new THREE.Group();
  g.add(ovale(0.035, 0.045, 0.035, mat("#b8862a", { roughness: 0.5 }), true));
  const cappello = ovale(0.04, 0.022, 0.04, mat("#6a4a2a", { roughness: 0.9 }), true);
  cappello.position.y = 0.03;
  const picciolo = cil(0.005, 0.005, 0.025, mat("#5a3a1a"), 5);
  picciolo.position.y = 0.055;
  g.add(cappello, picciolo);
  return g;
}

/** Cartello «Vendo ombra» con il prezzo in ghiande. */
export function cartello() {
  const g = new THREE.Group();
  const legno = mat("#c09060", { roughness: 0.8 });
  const palo = box(0.05, 0.9, 0.05, mat("#8a6040"));
  palo.position.y = 0.45;
  const tavola = box(0.7, 0.3, 0.04, legno);
  tavola.position.set(0, 0.85, 0.03);
  const c = document.createElement("canvas");
  c.width = 512; c.height = 220;
  const x = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
  x.fillStyle = "#c09060"; x.fillRect(0, 0, 512, 220);
  x.fillStyle = "#3a2a1a"; x.font = "bold 92px system-ui, sans-serif"; x.textAlign = "center";
  x.fillText("VENDO", 256, 95); x.fillText("OMBRA", 256, 190);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const scritta = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.28), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 }));
  scritta.position.set(0, 0.85, 0.052);
  g.add(palo, tavola, scritta);
  return g;
}

/** Scoiattolo seduto, con la coda a ricciolo (userData.coda per muoverla). */
export function scoiattolo() {
  const g = new THREE.Group();
  const pelo = mat("#c0662a", { roughness: 0.8 });
  const chiaro = mat("#f2d8b0", { roughness: 0.8 });
  const corpo = ovale(0.09, 0.12, 0.08, pelo);
  corpo.position.y = 0.12;
  const pancia = ovale(0.06, 0.09, 0.04, chiaro, true);
  pancia.position.set(0, 0.11, 0.05);
  const testa = ovale(0.07, 0.065, 0.07, pelo, true);
  testa.position.set(0, 0.27, 0.03);
  const muso = ovale(0.035, 0.03, 0.035, chiaro, true);
  muso.position.set(0, 0.255, 0.085);
  const naso = ovale(0.012, 0.01, 0.01, mat("#2a1a10"), true);
  naso.position.set(0, 0.265, 0.12);
  for (const s of [-1, 1]) {
    const o = ovale(0.012, 0.014, 0.01, mat("#1a1008"), true); o.position.set(s * 0.03, 0.29, 0.085); g.add(o);
    const orecchio = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 6), pelo); orecchio.position.set(s * 0.04, 0.34, 0.01); g.add(orecchio);
  }
  const coda = new THREE.Group();
  coda.add(tubo([[0, 0.05, -0.06], [0, 0.18, -0.2], [0, 0.38, -0.16], [0, 0.42, -0.06]], 0.06, 0.035, pelo, 14, 8));
  g.add(corpo, pancia, testa, muso, naso, coda);
  g.userData.coda = coda;
  return g;
}

export function valigia() {
  const g = new THREE.Group();
  const pelle = mat("#a0602a", { roughness: 0.6 });
  const corpo = box(0.5, 0.36, 0.18, pelle);
  corpo.position.y = 0.18;
  const cinghie = mat("#5a3a1a");
  for (const x of [-0.14, 0.14]) { const c = box(0.04, 0.37, 0.19, cinghie); c.position.set(x, 0.18, 0); g.add(c); }
  const maniglia = tubo([[-0.07, 0.36, 0], [-0.06, 0.42, 0], [0.06, 0.42, 0], [0.07, 0.36, 0]], 0.014, 0.014, cinghie, 8, 6);
  const etichetta = box(0.08, 0.05, 0.005, mat("#fbf3dc"));
  etichetta.position.set(0.18, 0.26, 0.095);
  g.add(corpo, maniglia, etichetta);
  return g;
}

export function mappa() {
  const g = new THREE.Group();
  const c = document.createElement("canvas");
  c.width = 256; c.height = 192;
  const x = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
  x.fillStyle = "#f2e2b8"; x.fillRect(0, 0, 256, 192);
  x.fillStyle = "#9cc87a"; x.beginPath(); x.ellipse(90, 90, 70, 50, 0.3, 0, 7); x.fill();
  x.fillStyle = "#7ab0d8"; x.beginPath(); x.ellipse(200, 140, 50, 30, 0, 0, 7); x.fill();
  x.strokeStyle = "#c0402a"; x.lineWidth = 4; x.setLineDash([8, 8]);
  x.beginPath(); x.moveTo(40, 160); x.bezierCurveTo(90, 120, 140, 160, 190, 60); x.stroke();
  x.setLineDash([]); x.fillStyle = "#c0402a"; x.font = "bold 40px sans-serif"; x.fillText("✕", 176, 72);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(0.5, 0.37, 6, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 12) * 0.015);
  geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: 0.9 })));
  return g;
}

export function annaffiatoio() {
  const g = new THREE.Group();
  const latta = mat("#4aa0c8", { roughness: 0.4, metalness: 0.3 });
  const corpo = cil(0.1, 0.11, 0.2, latta);
  corpo.position.y = 0.1;
  const becco = tubo([[0.08, 0.06, 0], [0.2, 0.16, 0], [0.28, 0.24, 0]], 0.022, 0.016, latta, 6, 6);
  const doccetta = cil(0.035, 0.02, 0.03, latta, 10);
  doccetta.position.set(0.29, 0.25, 0);
  doccetta.rotation.z = -0.9;
  const manico = tubo([[-0.1, 0.18, 0], [-0.16, 0.24, 0], [-0.1, 0.3, 0], [0.02, 0.22, 0]], 0.012, 0.012, latta, 10, 6);
  g.add(corpo, becco, doccetta, manico);
  g.userData.becco = doccetta;
  return g;
}

/** Tazza fumante (userData.fumo: sprite del vapore). */
export function tazza() {
  const g = new THREE.Group();
  const ceramica = mat("#f4f0e6", { roughness: 0.4 });
  const corpo = cil(0.05, 0.04, 0.09, ceramica);
  const te = new THREE.Mesh(new THREE.CircleGeometry(0.045, 16), mat("#b8762a"));
  te.rotation.x = -Math.PI / 2;
  te.position.y = 0.04;
  const manico = tubo([[0.045, 0.025, 0], [0.075, 0.01, 0], [0.045, -0.02, 0]], 0.009, 0.009, ceramica, 8, 6);
  g.add(corpo, te, manico);
  return g;
}

export function cappelloSole() {
  const g = new THREE.Group();
  const paglia = mat("#f0d070", { roughness: 0.9 });
  const tesa = cil(0.48, 0.48, 0.02, paglia, 28);
  const cupola = ovale(0.24, 0.14, 0.24, paglia);
  cupola.position.y = 0.04;
  const nastro = cil(0.245, 0.245, 0.04, mat("#e04a6a"), 28);
  nastro.position.y = 0.04;
  g.add(tesa, cupola, nastro);
  return g;
}

export function occhialiSole() {
  const g = new THREE.Group();
  const nero = mat("#1a1a22", { roughness: 0.2, metalness: 0.3 });
  for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), nero); l.position.x = s * 0.2; g.add(l); }
  g.add(tubo([[-0.13, 0.01, 0.005], [0, 0.03, 0.01], [0.13, 0.01, 0.005]], 0.01, 0.01, nero, 6, 6));
  return g;
}

export function telo() {
  const t = texStoffa("righe", "#e0503a", "#fbf3dc");
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.02;
  const g = new THREE.Group();
  g.add(m);
  return g;
}

export function cuscino() {
  const g = new THREE.Group();
  g.add(ovale(0.32, 0.08, 0.32, mat("#8a6ac8", { roughness: 0.8 })));
  return g;
}
