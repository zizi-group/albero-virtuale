// La radura: terreno dipinto, bosco di contorno (modelli Kenney CC0 in istanze),
// luce dell'ora del giorno, meteo (pioggia, neve, nebbia, temporale, nuvole),
// stagioni, lucciole e luna, cassetta delle lettere e taccuino.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { generatore, verso } from "./casuale.js";
import { mat, tubo } from "./forme.js";
import { UNIFORMI } from "./albero.js";
import { texAlone, texFoglia, texNuvole } from "./texture.js";

const CARTELLA = "/giardino3d/modelli/";
export const RAGGIO_RADURA = 7;
/**
 * Dove stanno cassetta e taccuino (x, z), secondo quanti alberi ci sono: con un
 * albero ai suoi lati; con la famiglia e la foresta più ai lati e in avanti,
 * così non coprono mai i compagni.
 * @param {number} n
 */
export function postiArredi(n) {
  if (n <= 1) return { cassetta: [2.05, 0.95], taccuino: [-2.0, 1.1] };
  if (n <= 3) return { cassetta: [3.15, 2.3], taccuino: [-3.05, 2.4] };
  return { cassetta: [5.0, 3.2], taccuino: [-4.9, 3.3] };
}

/** Altezza del terreno: lievi ondulazioni e il bosco che sale ai bordi. @param {number} x @param {number} z */
export function quota(x, z) {
  const r = Math.hypot(x, z);
  const conca = THREE.MathUtils.smoothstep(r, 10, 26) * 2.6;
  return Math.sin(x * 0.35) * Math.cos(z * 0.3) * 0.2 + Math.sin(x * 0.9 + z * 0.7) * 0.06 + conca;
}

// ------------------------------------------------------------------ Ora del giorno
/** @typedef {{ sole: number[], coloreSole: string, forzaSole: number, cielo: string, terra: string, forzaCielo: number, nebbia: string, vicino: number, lontano: number, esposizione: number, contro: string, forzaContro: number }} Luce */
/** @type {Record<string, Luce>} */
const ORE = {
  alba: { sole: [-1, 0.34, 0.25], coloreSole: "#ffc49c", forzaSole: 2.4, cielo: "#ffe0cc", terra: "#5a6a3a", forzaCielo: 1.0, nebbia: "#f6dccb", vicino: 20, lontano: 58, esposizione: 1.12, contro: "#ffd9a8", forzaContro: 0.8 },
  giorno: { sole: [-0.9, 0.8, 0.5], coloreSole: "#fff2cc", forzaSole: 3.0, cielo: "#d8f2ff", terra: "#5c8a3c", forzaCielo: 1.35, nebbia: "#d6efe2", vicino: 26, lontano: 64, esposizione: 1.12, contro: "#ffe7aa", forzaContro: 0.9 },
  tramonto: { sole: [1, 0.3, 0.3], coloreSole: "#ffa262", forzaSole: 2.5, cielo: "#ffd0aa", terra: "#4c4a2c", forzaCielo: 0.9, nebbia: "#f2c09a", vicino: 20, lontano: 56, esposizione: 1.1, contro: "#ffb070", forzaContro: 1.1 },
  notte: { sole: [-0.5, 0.8, 0.6], coloreSole: "#b8ccff", forzaSole: 1.15, cielo: "#5674b0", terra: "#1c2a24", forzaCielo: 0.8, nebbia: "#1d3048", vicino: 16, lontano: 48, esposizione: 1.15, contro: "#ffd28a", forzaContro: 0.45 },
};

/** Come il meteo cambia la luce. @type {Record<string, { sole: number, cielo: number, nebbia: string, peso: number, vicino: number, lontano: number, vento: number }>} */
const METEO = {
  sole: { sole: 1, cielo: 1, nebbia: "", peso: 0, vicino: 1, lontano: 1, vento: 1 },
  nuvole: { sole: 0.45, cielo: 0.95, nebbia: "#c8d6d2", peso: 0.35, vicino: 0.9, lontano: 0.9, vento: 1.5 },
  pioggia: { sole: 0.28, cielo: 0.85, nebbia: "#a9b9c2", peso: 0.6, vicino: 0.5, lontano: 0.7, vento: 2.2 },
  temporale: { sole: 0.15, cielo: 0.7, nebbia: "#7d8c9c", peso: 0.7, vicino: 0.45, lontano: 0.6, vento: 3.2 },
  neve: { sole: 0.55, cielo: 1.05, nebbia: "#e6edf3", peso: 0.55, vicino: 0.6, lontano: 0.75, vento: 0.8 },
  nebbia: { sole: 0.4, cielo: 1, nebbia: "#e2ebe6", peso: 0.85, vicino: 0.1, lontano: 0.3, vento: 0.6 },
};

/** Tinta del prato per stagione. @type {Record<string, string>} */
const PRATO = { primavera: "#ffffff", estate: "#f2f6e2", autunno: "#e8cc94", inverno: "#c4c6b4" };

// ------------------------------------------------------------------ Bosco (Kenney)
/** Colori dipinti per i materiali Kenney, per stagione: [scuro, chiaro]. */
const PALETTE = {
  leafsDark: { primavera: ["#3a9a32", "#6cc244"], estate: ["#2f8a2e", "#58b03c"], autunno: ["#c0601a", "#e8b030"], inverno: ["#4a6a3a", "#5e7e4a"] },
  leafsGreen: { primavera: ["#3aa236", "#74ca4a"], estate: ["#329032", "#5cb440"], autunno: ["#c8541c", "#e6a02c"], inverno: ["#4e6e3c", "#62824c"] },
  grass: { primavera: ["#3aa83a", "#7ed04a"], estate: ["#36983a", "#66bc44"], autunno: ["#8a9a34", "#c0a640"], inverno: ["#6a7a50", "#8a9468"] },
  woodBarkDark: { tutte: ["#5a3a24", "#7a5236"] },
  woodBark: { tutte: ["#6b4429", "#8a6040"] },
  woodInner: { tutte: ["#c89a63", "#e0b47c"] },
  dirt: { tutte: ["#6e756c", "#8e9488"] },
  colorRed: { tutte: ["#c8301f", "#e4452a"] },
  colorTan: { tutte: ["#c08b55", "#d8a46b"] },
  colorYellow: { tutte: ["#f0b828", "#ffd448"] },
  colorPurple: { tutte: ["#8a4ac0", "#b070e0"] },
  _defaultMat: { tutte: ["#f2ead4", "#fbf3dc"] },
};
const VENTO = new Set(["leafsDark", "leafsGreen", "grass"]);
/** Alberi Kenney che d'inverno perdono le foglie. */
const CADUCHI = new Set(["tree_detailed_dark", "tree_oak_dark", "tree_fat_darkh"]);

/** Materiale dipinto: occlusione finta alla base, vento sulle foglie, neve sopra. @param {string} nome @param {number} altezza @param {boolean} vento */
function materialeDipinto(nome, altezza, vento) {
  const m = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: nome === "dirt" ? 0.8 : 0.9, flatShading: true });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTempo = UNIFORMI.uTempo;
    s.uniforms.uNeve = UNIFORMI.uNeve;
    s.uniforms.uVento = UNIFORMI.uVento;
    s.uniforms.uAltezza = { value: altezza };
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec2 aBase;\nuniform float uTempo;\nuniform float uVento;\nuniform float uAltezza;\nvarying float vAlt;\nvarying float vSu;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vec4 wp = instanceMatrix * vec4(transformed, 1.0);
        float alt = clamp((wp.y - aBase.x) / uAltezza, 0.0, 1.4);
        vAlt = alt;
        vSu = normalize(mat3(instanceMatrix) * objectNormal).y;
        ${vento ? "float sv = sin(uTempo * 1.1 * uVento + aBase.y) * 0.6 + sin(uTempo * 2.6 * uVento + aBase.y * 1.7) * 0.25;\n        transformed.x += sv * 0.03 * uVento * alt * alt;\n        transformed.z += sv * 0.018 * uVento * alt * alt;" : ""}`,
      );
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uNeve;\nvarying float vAlt;\nvarying float vSu;")
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\ndiffuseColor.rgb *= mix(0.5, 1.08, smoothstep(0.0, 0.7, vAlt));\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.97, 1.0), uNeve * smoothstep(0.35, 0.8, vSu));",
      );
  };
  m.customProgramCacheKey = () => `dip-${vento}`;
  return m;
}

/** Cache dei modelli GLB per tutta la pagina. @type {Map<string, Promise<{ box: THREE.Box3, parti: THREE.Mesh[] }>>} */
const modelliCaricati = new Map();
const loader = new GLTFLoader();
/** @param {string} nome */
function carica(nome) {
  if (!modelliCaricati.has(nome)) {
    modelliCaricati.set(nome, loader.loadAsync(CARTELLA + nome + ".glb").then((g) => {
      g.scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(g.scene);
      /** @type {THREE.Mesh[]} */
      const parti = [];
      g.scene.traverse((o) => { if (/** @type {THREE.Mesh} */ (o).isMesh) parti.push(/** @type {THREE.Mesh} */ (o)); });
      return { box, parti };
    }));
  }
  return /** @type {Promise<{ box: THREE.Box3, parti: THREE.Mesh[] }>} */ (modelliCaricati.get(nome));
}

// ------------------------------------------------------------------ Terreno
const LATO = 90;
/** @param {() => number} rng @param {THREE.WebGLRenderer} renderer */
function texTerreno(rng, renderer) {
  const N = 2048, c = document.createElement("canvas");
  c.width = c.height = N;
  const g = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
  const px = (/** @type {number} */ w) => ((w + LATO / 2) / LATO) * N;
  const tra = (/** @type {number} */ a, /** @type {number} */ b) => a + rng() * (b - a);
  g.fillStyle = "#3f8a2c"; g.fillRect(0, 0, N, N);
  /** @param {number} x @param {number} y @param {number} r @param {number[]} col @param {number} a */
  const macchia = (x, y, r, col, a) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  // verdi brillanti con qualche sfumatura d'acqua
  const verdi = [[60, 132, 44], [44, 112, 40], [86, 160, 52], [52, 130, 74], [104, 168, 60], [46, 120, 88]];
  for (let i = 0; i < 2600; i++) macchia(rng() * N, rng() * N, tra(14, 70), verdi[(rng() * verdi.length) | 0], tra(0.25, 0.5));
  const cx = px(0), R = (RAGGIO_RADURA / LATO) * N;
  const gr = g.createRadialGradient(cx, cx, 0, cx, cx, R * 1.4);
  gr.addColorStop(0, "rgba(150,196,70,.85)"); gr.addColorStop(0.6, "rgba(118,176,58,.5)"); gr.addColorStop(1, "rgba(80,140,44,0)");
  g.fillStyle = gr; g.fillRect(0, 0, N, N);
  // sentiero di terra battuta verso il basso a destra
  for (let i = 0; i < 90; i++) {
    const t = i / 90;
    macchia(px(1.8 + t * 14 + Math.sin(t * 6) * 1.2), px(1.6 + t * 12), tra(16, 30), [150, 116, 72], tra(0.25, 0.42));
  }
  for (let i = 0; i < 40000; i++) {
    const x = rng() * N, y = rng() * N;
    const d = Math.hypot(x - cx, y - cx) / R;
    const chiaro = rng() < (d < 1.3 ? 0.6 : 0.35);
    g.strokeStyle = chiaro ? `rgba(${150 + rng() * 50},${190 + rng() * 30},${80 + rng() * 30},.35)` : "rgba(24,70,24,.3)";
    g.lineWidth = tra(1, 2.2);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + tra(-2, 2), y - tra(4, 9)); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}

// ------------------------------------------------------------------ Particelle meteo
/** Pioggia: segmenti che cadono, mossi nello shader (nessun lavoro della CPU). */
function creaPioggia(/** @type {number} */ n) {
  const pos = new Float32Array(n * 2 * 3);
  const r = generatore(9);
  for (let i = 0; i < n; i++) {
    const x = (r() - 0.5) * 26, y = r() * 12, z = (r() - 0.5) * 22;
    pos.set([x, y, z, x - 0.04, y + 0.32, z], i * 6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const m = new THREE.LineBasicMaterial({ color: "#d8ecff", transparent: true, opacity: 0.55, depthWrite: false });
  const u = { uT: { value: 0 }, uVel: { value: 11 } };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uT;\nuniform float uVel;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed.y = mod(transformed.y - uT * uVel, 12.0);\ntransformed.x -= (12.0 - transformed.y) * 0.05;");
  };
  const linee = new THREE.LineSegments(geo, m);
  linee.frustumCulled = false;
  return { oggetto: linee, u, materiale: m };
}

/** Neve o lucciole: punti morbidi, mossi nello shader. @param {number} n @param {"neve"|"lucciole"} tipo */
function creaPunti(n, tipo) {
  const pos = new Float32Array(n * 3), fase = new Float32Array(n);
  const r = generatore(tipo === "neve" ? 13 : 17);
  for (let i = 0; i < n; i++) {
    if (tipo === "neve") pos.set([(r() - 0.5) * 26, r() * 12, (r() - 0.5) * 22], i * 3);
    else pos.set([(r() - 0.5) * 18, 0.3 + r() * 2.4, (r() - 0.5) * 14], i * 3);
    fase[i] = r() * 6.28;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("fase", new THREE.BufferAttribute(fase, 1));
  const lucciola = tipo === "lucciole";
  const m = new THREE.PointsMaterial({
    size: lucciola ? 0.26 : 0.09,
    map: texAlone(lucciola ? "255,220,120" : "255,255,255", 1),
    transparent: true, depthWrite: false,
    blending: lucciola ? THREE.AdditiveBlending : THREE.NormalBlending,
    color: lucciola ? "#ffe08a" : "#ffffff",
  });
  const u = { uT: { value: 0 } };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float fase;\nuniform float uT;\nvarying float vLuce;")
      .replace(
        "#include <begin_vertex>",
        lucciola
          ? "#include <begin_vertex>\ntransformed += vec3(sin(uT*0.4+fase)*0.9, sin(uT*0.7+fase*2.0)*0.35, cos(uT*0.33+fase)*0.9);\nvLuce = 0.5 + 0.5 * sin(uT * 2.2 + fase * 3.0);"
          : "#include <begin_vertex>\ntransformed.y = mod(transformed.y - uT * 0.9, 12.0);\ntransformed.x += sin(uT * 0.8 + fase) * 0.35;\nvLuce = 1.0;",
      );
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vLuce;")
      .replace("#include <premultiplied_alpha_fragment>", "gl_FragColor.a *= vLuce;\n#include <premultiplied_alpha_fragment>");
  };
  const punti = new THREE.Points(geo, m);
  punti.frustumCulled = false;
  return { oggetto: punti, u };
}

// ------------------------------------------------------------------ Cassetta e taccuino
function creaCassetta() {
  const g = new THREE.Group();
  const legno = mat("#8a5a34", { roughness: 0.8 });
  const palo = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.1), legno);
  palo.position.y = 0.45;
  const scatola = new THREE.Group();
  const verde = mat("#3f8a5a", { roughness: 0.55 });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.5), verde);
  corpo.position.y = 0.13;
  // mezzo cilindro con l'asse lungo z: la parte tonda sta sopra
  const tetto = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.5, 20, 1, false, Math.PI / 2, Math.PI), verde);
  tetto.rotation.x = Math.PI / 2;
  tetto.position.y = 0.26;
  const sportello = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), mat("#2f6e46"));
  sportello.position.set(0, 0.2, 0.252);
  scatola.add(corpo, tetto, sportello);
  scatola.position.y = 0.9;
  // bandierina rossa: si alza quando arriva una lettera
  const bandiera = new THREE.Group();
  const asta = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.3, 0.025), mat("#d8d0c0"));
  asta.position.y = 0.15;
  const drappo = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.14), mat("#e0402a", { roughness: 0.5 }));
  drappo.position.set(0, 0.25, 0.07);
  bandiera.add(asta, drappo);
  bandiera.position.set(0.18, 1.0, 0.0);
  bandiera.rotation.x = Math.PI / 2; // giù
  // busta che spunta
  const busta = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.13, 0.015), mat("#fbf3dc", { roughness: 0.6 }));
  busta.position.set(0, 1.12, 0.26);
  busta.visible = false;
  g.add(palo, scatola, bandiera, busta);
  const bersaglio = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 0.7), new THREE.MeshBasicMaterial({ visible: false }));
  bersaglio.position.y = 0.7;
  g.add(bersaglio);
  g.traverse((o) => { if (/** @type {THREE.Mesh} */ (o).isMesh && o !== bersaglio) { o.castShadow = true; o.receiveShadow = true; } });
  let lettera = 0, t = 0;
  return {
    gruppo: g, bersaglio,
    arriva() { lettera = 1; t = 0; busta.visible = true; },
    letta() { lettera = 0; busta.visible = false; },
    /** @param {number} dt */
    aggiorna(dt) {
      t += dt;
      bandiera.rotation.x = verso(bandiera.rotation.x, lettera ? 0 : Math.PI / 2, 6, dt);
      const salto = lettera && t < 1.2 ? Math.abs(Math.sin(t * 9)) * 0.06 * (1 - t / 1.2) : 0;
      scatola.position.y = 0.9 + salto;
      busta.position.y = 1.12 + salto + (lettera ? Math.sin(t * 2) * 0.01 : 0);
    },
  };
}

function creaTaccuino() {
  const g = new THREE.Group();
  const ceppo = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.42, 18), mat("#8a6040", { roughness: 0.9 }));
  ceppo.position.y = 0.21;
  const taglio = new THREE.Mesh(new THREE.CircleGeometry(0.32, 18), mat("#d8b47c", { roughness: 0.9 }));
  taglio.rotation.x = -Math.PI / 2;
  taglio.position.y = 0.425;
  const libro = new THREE.Group();
  const copertina = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.26), mat("#2f7a5a", { roughness: 0.6 }));
  const pagine = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.24), mat("#fbf6e8"));
  pagine.position.y = 0.012;
  const elastico = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.04, 0.27), mat("#e0402a"));
  elastico.position.x = 0.12;
  const matita = tubo([[-0.16, 0.04, 0.16], [0.12, 0.04, 0.2]], 0.012, 0.008, mat("#f0b828"), 4, 6);
  libro.add(copertina, pagine, elastico, matita);
  libro.position.y = 0.45;
  libro.rotation.y = 0.4;
  g.add(ceppo, taglio, libro);
  const bersaglio = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.7, 10), new THREE.MeshBasicMaterial({ visible: false }));
  bersaglio.position.y = 0.35;
  g.add(bersaglio);
  g.traverse((o) => { if (/** @type {THREE.Mesh} */ (o).isMesh && o !== bersaglio) { o.castShadow = true; o.receiveShadow = true; } });
  return { gruppo: g, bersaglio, libro };
}

// ------------------------------------------------------------------ L'ambiente
/**
 * @param {THREE.Scene} scena
 * @param {THREE.WebGLRenderer} renderer
 * @param {{ ridotto: boolean, alberi: { x: number, z: number }[] }} op
 */
export function creaAmbiente(scena, renderer, op) {
  const rng = generatore(7);
  const tra = (/** @type {number} */ a, /** @type {number} */ b) => a + rng() * (b - a);

  scena.background = new THREE.Color(ORE.giorno.nebbia);
  scena.fog = new THREE.Fog(ORE.giorno.nebbia, 26, 64);

  // Luci
  const cielo = new THREE.HemisphereLight(ORE.giorno.cielo, ORE.giorno.terra, ORE.giorno.forzaCielo);
  const sole = new THREE.DirectionalLight(ORE.giorno.coloreSole, ORE.giorno.forzaSole);
  sole.castShadow = true;
  sole.shadow.mapSize.set(2048, 2048);
  Object.assign(sole.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 5, far: 90 });
  sole.shadow.bias = -0.0005;
  sole.shadow.normalBias = 0.03;
  const contro = new THREE.DirectionalLight(ORE.giorno.contro, ORE.giorno.forzaContro);
  contro.position.set(6, 9, -18);
  const riempi = new THREE.DirectionalLight("#cfe4ff", 0.4);
  riempi.position.set(3, 6, 16);
  scena.add(cielo, sole, sole.target, contro, riempi);

  // Terreno
  const geoT = new THREE.PlaneGeometry(LATO, LATO, 150, 150);
  geoT.rotateX(-Math.PI / 2);
  const pT = geoT.attributes.position;
  for (let i = 0; i < pT.count; i++) pT.setY(i, quota(pT.getX(i), pT.getZ(i)));
  geoT.computeVertexNormals();
  const matTerreno = new THREE.MeshStandardMaterial({ map: texTerreno(rng, renderer), roughness: 1 });
  matTerreno.onBeforeCompile = (s) => {
    s.uniforms.uNeve = UNIFORMI.uNeve;
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uNeve;")
      .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.95, 0.98), uNeve * 0.92);");
  };
  const terreno = new THREE.Mesh(geoT, matTerreno);
  terreno.receiveShadow = true;
  scena.add(terreno);

  // Ombre delle nuvole che scorrono
  const texN = texNuvole();
  texN.repeat.set(3, 3);
  const nuvole = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: texN, transparent: true, opacity: 0.0, depthWrite: false, color: "#000000", alphaMap: texN }));
  nuvole.rotation.x = -Math.PI / 2;
  nuvole.position.y = 0.6;
  nuvole.renderOrder = 2;
  scena.add(nuvole);

  // Pozzanghere
  const pozze = new THREE.Group();
  const matPozza = new THREE.MeshStandardMaterial({ color: "#9fb8c8", roughness: 0.04, metalness: 0.35, transparent: true, opacity: 0, depthWrite: false });
  for (const [x, z, s] of [[-1.0, 2.6, 0.8], [3.4, -1.6, 0.8], [1.2, 2.8, 0.6], [-4.2, -0.8, 0.9], [4.2, 2.6, 0.6]]) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), matPozza);
    p.rotation.x = -Math.PI / 2;
    p.scale.set(s * 1.4, s, 1);
    p.position.set(x, quota(x, z) + 0.03, z);
    pozze.add(p);
  }
  scena.add(pozze);

  // Foglie cadute d'autunno
  const caduteN = 380;
  const cadute = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.16, 0.2), new THREE.MeshLambertMaterial({ map: texFoglia("quercia"), alphaTest: 0.45, side: THREE.DoubleSide }), caduteN);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    const col = ["#d8701e", "#e8a82a", "#c0401c", "#b8802a"];
    for (let i = 0; i < caduteN; i++) {
      const a = rng() * Math.PI * 2, rr = Math.sqrt(rng()) * 11;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      q.setFromEuler(new THREE.Euler(-Math.PI / 2 + tra(-0.2, 0.2), 0, rng() * 6.28));
      m4.compose(new THREE.Vector3(x, quota(x, z) + 0.02, z), q, new THREE.Vector3(1, 1, 1).multiplyScalar(tra(0.8, 1.3)));
      cadute.setMatrixAt(i, m4);
      cadute.setColorAt(i, c.set(col[i % 4]));
    }
  }
  cadute.visible = false;
  scena.add(cadute);

  // Bosco: modelli Kenney in istanze, ricolorabili per stagione
  /** @type {{ mesh: THREE.InstancedMesh, nomeMat: string, modello: string, t: Float32Array }[]} */
  const ricolorabili = [];
  const occupati = op.alberi.map((a) => [a.x, a.z, 2.2]);
  // anche cassetta e taccuino occupano il loro posto
  const { cassetta: CASSETTA, taccuino: TACCUINO } = postiArredi(op.alberi.length);
  occupati.push([CASSETTA[0], CASSETTA[1], 1.2], [TACCUINO[0], TACCUINO[1], 1.2]);
  const libero = (/** @type {number} */ x, /** @type {number} */ z, /** @type {number} */ d) => occupati.every(([ox, oz, od]) => Math.hypot(x - ox, z - oz) > Math.max(d, od));
  /** @param {number} n @param {number} rMin @param {number} rMax @param {number} d @param {(x: number, z: number) => boolean} [filtro] */
  const sparpaglia = (n, rMin, rMax, d, filtro = () => true) => {
    /** @type {{ x: number, z: number, rot: number }[]} */
    const out = [];
    for (let k = 0; k < 4000 && out.length < n; k++) {
      const a = rng() * Math.PI * 2, r = Math.sqrt(tra(rMin * rMin, rMax * rMax));
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!filtro(x, z) || !libero(x, z, d)) continue;
      occupati.push([x, z, d]);
      out.push({ x, z, rot: rng() * Math.PI * 2 });
    }
    return out;
  };
  const nonDavanti = (/** @type {number} */ x, /** @type {number} */ z) => !(z > 3 && Math.abs(x) < 10 + (z - 3) * 0.4);
  const basso = (/** @type {number} */ x, /** @type {number} */ z) => z < 4.5 || Math.abs(x) > 10;
  // le rocce grandi mai davanti alla camera (con la foresta la camera è più lontana)
  const lontaneDalDavanti = (/** @type {number} */ x, /** @type {number} */ z) => z < 2.5 || Math.abs(x) > 12;

  /** @param {string} nome @param {{ x: number, z: number, rot: number, h: number }[]} posti @param {boolean} [ombra] */
  async function istanze(nome, posti, ombra = true) {
    if (!posti.length) return;
    const { box, parti } = await carica(nome);
    const size = box.getSize(new THREE.Vector3()), centro = box.getCenter(new THREE.Vector3());
    const norm = new THREE.Matrix4().makeTranslation(-centro.x, -box.min.y, -centro.z);
    const hMedia = posti.reduce((s, p) => s + p.h, 0) / posti.length;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), su = new THREE.Vector3(0, 1, 0);
    for (const parte of parti) {
      const nomeMat = /** @type {THREE.Material} */ (parte.material).name;
      const geo = parte.geometry.clone();
      const base = new Float32Array(posti.length * 2);
      const mesh = new THREE.InstancedMesh(geo, materialeDipinto(nomeMat, hMedia, VENTO.has(nomeMat)), posti.length);
      const t = new Float32Array(posti.length);
      posti.forEach((p, i) => {
        const s = p.h / size.y, y = quota(p.x, p.z) - 0.05;
        q.setFromAxisAngle(su, p.rot);
        m.compose(new THREE.Vector3(p.x, y, p.z), q, new THREE.Vector3(s, s, s));
        m.multiply(norm).multiply(parte.matrixWorld);
        mesh.setMatrixAt(i, m);
        t[i] = rng();
        base[i * 2] = y; base[i * 2 + 1] = rng() * 6.28;
      });
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(posti.length * 3), 3);
      geo.setAttribute("aBase", new THREE.InstancedBufferAttribute(base, 2));
      mesh.castShadow = ombra;
      mesh.receiveShadow = true;
      scena.add(mesh);
      ricolorabili.push({ mesh, nomeMat, modello: nome, t });
    }
  }

  let caricato = false;
  const ALBERI_K = ["tree_detailed_dark", "tree_oak_dark", "tree_fat_darkh", "tree_pineTallA_detailed", "tree_pineRoundC"];
  const ALTEZZE = /** @type {Record<string, [number, number]>} */ ({ tree_detailed_dark: [7, 10], tree_oak_dark: [6.5, 9], tree_fat_darkh: [6, 8.5], tree_pineTallA_detailed: [9, 13], tree_pineRoundC: [7, 10] });
  const pronto = (async () => {
    const alberi = sparpaglia(64, RAGGIO_RADURA + 2, 30, 2.6, nonDavanti);
    const gruppi = Object.fromEntries(ALBERI_K.map((t) => [t, /** @type {any[]} */ ([])]));
    alberi.forEach((p, i) => { const t = ALBERI_K[i % ALBERI_K.length]; gruppi[t].push({ ...p, h: tra(...ALTEZZE[t]) }); });
    const lavori = ALBERI_K.map((t) => istanze(t, gruppi[t]));
    const fisso = (/** @type {any[]} */ l) => l.filter((p) => libero(p.x, p.z, 1.6) && (occupati.push([p.x, p.z, 1.2]), true));
    lavori.push(
      istanze("stump_oldTall", fisso([{ x: -5.6, z: -3.2, h: 1.0, rot: 0.6 }, { x: 6.2, z: -4.4, h: 0.85, rot: 2.1 }])),
      istanze("stump_roundDetailed", fisso([{ x: -7.4, z: 4.2, h: 0.5, rot: 0.3 }])),
      istanze("log_large", fisso([{ x: -3.2, z: -6.0, h: 0.65, rot: 0.35 }])),
      istanze("rock_largeA", [...fisso([{ x: 7.6, z: 0.8, h: 1.3, rot: 0.4 }]), ...sparpaglia(5, 10, 22, 2, lontaneDalDavanti).map((p) => ({ ...p, h: tra(1.1, 1.8) }))]),
      istanze("rock_largeC", sparpaglia(5, 9, 22, 2, lontaneDalDavanti).map((p) => ({ ...p, h: tra(0.9, 1.6) }))),
      istanze("rock_smallC", sparpaglia(18, 3, 18, 0.6).map((p) => ({ ...p, h: tra(0.25, 0.5) }))),
      istanze("plant_bushLarge", sparpaglia(28, RAGGIO_RADURA, 22, 1.4, (x, z) => z < 6 || Math.abs(x) > 10).map((p) => ({ ...p, h: tra(1.1, 1.8) }))),
      istanze("plant_bushDetailed", sparpaglia(30, RAGGIO_RADURA - 0.5, 20, 1.1, basso).map((p) => ({ ...p, h: tra(0.8, 1.3) }))),
      istanze("grass_leafsLarge", sparpaglia(42, RAGGIO_RADURA - 1, 20, 0.8, basso).map((p) => ({ ...p, h: tra(0.5, 0.9) }))),
      istanze("plant_flatTall", sparpaglia(34, RAGGIO_RADURA - 1.5, 16, 0.7, basso).map((p) => ({ ...p, h: tra(0.7, 1.1) }))),
      istanze("mushroom_redGroup", fisso([{ x: -4.9, z: -2.4, h: 0.32, rot: 0.2 }, { x: 5.4, z: -3.6, h: 0.28, rot: 2.4 }])),
      istanze("mushroom_tanTall", fisso([{ x: 6.6, z: -3.2, h: 0.4, rot: 0.8 }, { x: -6.6, z: 4.8, h: 0.36, rot: 2 }])),
      istanze("flower_yellowA", sparpaglia(18, 2.0, RAGGIO_RADURA + 1, 0.5).map((p) => ({ ...p, h: tra(0.25, 0.4) })), false),
      istanze("flower_redA", sparpaglia(10, 2.5, RAGGIO_RADURA + 1, 0.5).map((p) => ({ ...p, h: tra(0.25, 0.38) })), false),
      istanze("flower_purpleA", sparpaglia(10, 2.5, RAGGIO_RADURA + 1, 0.5).map((p) => ({ ...p, h: tra(0.25, 0.38) })), false),
    );
    const ciuffi = [];
    for (let i = 0; i < 420; i++) {
      const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * 22;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (op.alberi.some((p) => Math.hypot(x - p.x, z - p.z) < 1.2)) continue;
      ciuffi.push({ x, z, rot: rng() * 6.28, h: tra(0.25, 0.5) });
    }
    lavori.push(istanze("grass_large", ciuffi, false));
    await Promise.all(lavori);
    ricolora(stato.stagione);
    caricato = true;
  })();

  // Cassetta e taccuino, ai lati del primo albero
  const cassetta = creaCassetta();
  cassetta.gruppo.position.set(CASSETTA[0], quota(CASSETTA[0], CASSETTA[1]), CASSETTA[1]);
  cassetta.gruppo.rotation.y = -0.5;
  const taccuino = creaTaccuino();
  taccuino.gruppo.position.set(TACCUINO[0], quota(TACCUINO[0], TACCUINO[1]), TACCUINO[1]);
  scena.add(cassetta.gruppo, taccuino.gruppo);

  // Meteo e notte
  const pioggia = creaPioggia(op.ridotto ? 0 : 1400);
  const neve = creaPunti(op.ridotto ? 0 : 1200, "neve");
  const lucciole = creaPunti(op.ridotto ? 0 : 90, "lucciole");
  scena.add(pioggia.oggetto, neve.oggetto, lucciole.oggetto);
  const luna = new THREE.Group();
  const disco = new THREE.Sprite(new THREE.SpriteMaterial({ map: texAlone("245,248,255", 1), transparent: true, depthWrite: false, fog: false }));
  disco.scale.setScalar(3.2);
  const alone = new THREE.Sprite(new THREE.SpriteMaterial({ map: texAlone("170,200,255", 0.5), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  alone.scale.setScalar(12);
  luna.add(alone, disco);
  luna.position.set(-9, 15, -30);
  scena.add(luna);
  // stelle
  const stelle = (() => {
    const n = 220, pos = new Float32Array(n * 3);
    const r = generatore(21);
    for (let i = 0; i < n; i++) pos.set([(r() - 0.5) * 120, 10 + r() * 30, -32 - r() * 20], i * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.25, map: texAlone("255,255,255", 1), transparent: true, depthWrite: false, fog: false }));
  })();
  scena.add(stelle);

  // ---------------------------------------------------------------- Stato e transizioni
  const stato = { ora: "giorno", cielo: "sole", stagione: "estate", temperatura: 18 };
  const valori = { sole: 1, nebbia: 0, pioggia: 0, neve: 0, notte: 0, nuvole: 0, pozze: 0, neveTerra: 0, lampo: 0 };
  const bersaglio = { ...valori };
  const luce = {
    dir: new THREE.Vector3(...ORE.giorno.sole).normalize(), coloreSole: new THREE.Color(ORE.giorno.coloreSole), forzaSole: ORE.giorno.forzaSole,
    cielo: new THREE.Color(ORE.giorno.cielo), terra: new THREE.Color(ORE.giorno.terra), forzaCielo: ORE.giorno.forzaCielo,
    nebbia: new THREE.Color(ORE.giorno.nebbia), vicino: 26, lontano: 64, esposizione: 1.12, contro: new THREE.Color(ORE.giorno.contro), forzaContro: 0.9,
  };
  let ombreDaRifare = 1.0; // secondi in cui ricalcolare le ombre (il sole si sposta)
  let prossimoLampo = 3;
  /** @type {((forza: number) => void) | null} */
  let suLampo = null;

  /** Colori del bosco per stagione. @param {string} s */
  function ricolora(s) {
    const c = new THREE.Color(), a = new THREE.Color(), b = new THREE.Color();
    for (const { mesh, nomeMat, modello, t } of ricolorabili) {
      /** @type {any} */
      const pal = /** @type {any} */ (PALETTE)[nomeMat] ?? { tutte: ["#888888", "#888888"] };
      const coppia = pal.tutte ?? pal[s] ?? pal.estate;
      a.set(coppia[0]); b.set(coppia[1]);
      const pino = modello.includes("pine");
      for (let i = 0; i < t.length; i++) {
        c.copy(a).lerp(b, t[i]);
        if (pino && (nomeMat === "leafsDark" || nomeMat === "leafsGreen")) c.set(t[i] < 0.5 ? "#21683a" : "#2f8046"); // i pini restano verdi
        if (s === "autunno" && nomeMat.startsWith("leafs") && !pino && t[i] > 0.7) c.lerp(new THREE.Color("#c8301c"), 0.6);
        mesh.setColorAt(i, c);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.visible = !(s === "inverno" && CADUCHI.has(modello) && nomeMat.startsWith("leafs"));
      if (modello.startsWith("flower_")) mesh.visible = s === "primavera" || s === "estate";
    }
    matTerreno.color.set(PRATO[s] ?? "#ffffff");
    cadute.visible = s === "autunno";
  }

  /** Applica ora, meteo e stagione (con transizione morbida). @param {{ ora?: string, cielo?: string, stagione?: string, temperatura?: number }} p */
  function imposta(p) {
    if (p.ora && p.ora !== stato.ora) { stato.ora = p.ora; ombreDaRifare = 2.5; }
    if (p.cielo) stato.cielo = p.cielo;
    if (p.temperatura !== undefined) stato.temperatura = p.temperatura;
    if (p.stagione && p.stagione !== stato.stagione) { stato.stagione = p.stagione; if (caricato) ricolora(stato.stagione); ombreDaRifare = Math.max(ombreDaRifare, 0.2); }
    const m = METEO[stato.cielo] ?? METEO.sole;
    bersaglio.sole = m.sole;
    bersaglio.nebbia = m.peso;
    bersaglio.pioggia = stato.cielo === "pioggia" ? 0.7 : stato.cielo === "temporale" ? 1 : 0;
    bersaglio.neve = stato.cielo === "neve" ? 1 : 0;
    bersaglio.notte = stato.ora === "notte" ? 1 : 0;
    bersaglio.nuvole = stato.cielo === "sole" ? 0.12 : stato.cielo === "nuvole" ? 0.5 : stato.cielo === "nebbia" ? 0 : 0.35;
    bersaglio.pozze = bersaglio.pioggia > 0 ? 1 : stato.cielo === "neve" ? 0 : bersaglio.pozze;
    UNIFORMI.uVento.value = op.ridotto ? 0.3 : m.vento;
  }

  const tmp = new THREE.Color();
  /** @param {number} dt @param {number} t */
  function aggiorna(dt, t) {
    // valori che si muovono piano verso il bersaglio
    for (const k of /** @type {(keyof typeof valori)[]} */ (Object.keys(valori))) {
      if (k === "neveTerra" || k === "lampo" || k === "pozze") continue;
      valori[k] = verso(valori[k], bersaglio[k], 1.4, dt);
    }
    // la neve si posa piano e si scioglie piano; le pozzanghere crescono con la pioggia
    valori.neveTerra = verso(valori.neveTerra, stato.cielo === "neve" ? 1 : stato.temperatura < 1 ? valori.neveTerra : 0, stato.cielo === "neve" ? 0.12 : 0.25, dt);
    valori.pozze = verso(valori.pozze, bersaglio.pioggia > 0 ? 1 : 0, bersaglio.pioggia > 0 ? 0.15 : 0.08, dt);
    UNIFORMI.uNeve.value = valori.neveTerra;

    const o = ORE[stato.ora] ?? ORE.giorno;
    const m = METEO[stato.cielo] ?? METEO.sole;
    const k = 1 - Math.exp(-1.6 * dt);
    luce.dir.lerp(new THREE.Vector3(...o.sole).normalize(), k).normalize();
    luce.coloreSole.lerp(tmp.set(o.coloreSole), k);
    luce.forzaSole += (o.forzaSole * m.sole - luce.forzaSole) * k;
    luce.cielo.lerp(tmp.set(o.cielo), k);
    luce.terra.lerp(tmp.set(o.terra), k);
    luce.forzaCielo += (o.forzaCielo * m.cielo - luce.forzaCielo) * k;
    const nebbia = tmp.set(o.nebbia);
    if (m.nebbia) nebbia.lerp(new THREE.Color(m.nebbia).multiplyScalar(stato.ora === "notte" ? 0.25 : 1), m.peso);
    luce.nebbia.lerp(nebbia, k);
    luce.vicino += (o.vicino * m.vicino - luce.vicino) * k;
    luce.lontano += (o.lontano * m.lontano - luce.lontano) * k;
    luce.esposizione += (o.esposizione - luce.esposizione) * k;
    luce.contro.lerp(tmp.set(o.contro), k);
    luce.forzaContro += (o.forzaContro * m.sole - luce.forzaContro) * k;

    // lampi del temporale
    let flash = 0;
    if (stato.cielo === "temporale" && !op.ridotto) {
      prossimoLampo -= dt;
      if (prossimoLampo <= 0) { valori.lampo = 1; prossimoLampo = 4 + Math.random() * 6; suLampo?.(1); }
    }
    if (valori.lampo > 0) {
      valori.lampo = Math.max(0, valori.lampo - dt * 3.2);
      flash = valori.lampo > 0.55 ? 1 : valori.lampo > 0.35 ? 0.2 : valori.lampo > 0.15 ? 0.8 : 0;
    }

    sole.position.copy(luce.dir).multiplyScalar(40);
    sole.color.copy(luce.coloreSole);
    sole.intensity = luce.forzaSole;
    cielo.color.copy(luce.cielo);
    cielo.groundColor.copy(luce.terra);
    cielo.intensity = luce.forzaCielo + flash * 3;
    contro.color.copy(luce.contro);
    contro.intensity = luce.forzaContro;
    /** @type {THREE.Color} */ (scena.background).copy(luce.nebbia).lerp(tmp.set("#ffffff"), flash * 0.5);
    /** @type {THREE.Fog} */ (scena.fog).color.copy(luce.nebbia);
    /** @type {THREE.Fog} */ (scena.fog).near = luce.vicino;
    /** @type {THREE.Fog} */ (scena.fog).far = luce.lontano;
    renderer.toneMappingExposure = luce.esposizione;

    // particelle
    pioggia.oggetto.visible = valori.pioggia > 0.02;
    pioggia.u.uT.value = t;
    pioggia.materiale.opacity = 0.55 * valori.pioggia;
    neve.oggetto.visible = valori.neve > 0.02;
    neve.u.uT.value = t;
    /** @type {THREE.PointsMaterial} */ (neve.oggetto.material).opacity = valori.neve;
    lucciole.oggetto.visible = valori.notte > 0.3 && stato.cielo !== "pioggia" && stato.cielo !== "temporale" && stato.cielo !== "neve";
    lucciole.u.uT.value = t;
    luna.visible = valori.notte > 0.05;
    /** @type {THREE.SpriteMaterial} */ (disco.material).opacity = valori.notte * (1 - valori.nebbia * 0.7);
    /** @type {THREE.SpriteMaterial} */ (alone.material).opacity = valori.notte * 0.6;
    stelle.visible = valori.notte > 0.05;
    /** @type {THREE.PointsMaterial} */ (stelle.material).opacity = valori.notte * (1 - valori.nebbia);
    nuvole.visible = valori.nuvole > 0.02;
    /** @type {THREE.MeshBasicMaterial} */ (nuvole.material).opacity = valori.nuvole * (1 - valori.notte);
    texN.offset.set(t * 0.006 * UNIFORMI.uVento.value, t * 0.003 * UNIFORMI.uVento.value);
    pozze.visible = valori.pozze > 0.02;
    matPozza.opacity = valori.pozze * 0.7;
    matPozza.color.copy(luce.cielo).lerp(tmp.set("#8ea8b8"), 0.5);

    cassetta.aggiorna(dt);

    if (ombreDaRifare > 0) { ombreDaRifare -= dt; renderer.shadowMap.needsUpdate = true; }
  }

  return {
    pronto,
    imposta,
    aggiorna,
    cassetta,
    taccuino,
    stato,
    valori,
    /** Dove stanno cassetta e taccuino. */
    arredi: { cassetta: CASSETTA, taccuino: TACCUINO },
    /** Ricalcola le ombre (per esempio dopo aver spostato gli alberi). */
    rifaiOmbre() { ombreDaRifare = Math.max(ombreDaRifare, 0.05); },
    /** @param {(forza: number) => void} cb */
    suLampo(cb) { suLampo = cb; },
  };
}
