// La radura di Linfa: prototipo di stile 3D (Three.js, modelli Kenney Nature Kit CC0).
// Ombre calcolate una sola volta (la scena è ferma), elementi ripetuti in istanze,
// vento e occlusione finta nello shader dei materiali.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { creaLinfa, tempo as tempoLinfa } from "./linfa.js";

// Configurazione della pagina (window.RADURA, scritta nell'HTML prima di questo modulo):
// alberi [{ seme, x, z, scala, ...opzioni }], raggio della radura, camera.
const CFG = window.RADURA ?? {};
const PARAMETRI = new URLSearchParams(location.search);

// ---------- Impostazioni ----------
const SOLE = new THREE.Vector3(-1, 0.5, 0.32).normalize(); // verso la sorgente: basso, da sinistra
const COLORE_NEBBIA = new THREE.Color("#2a4232");
const RAGGIO_RADURA = CFG.raggio ?? 6.2;

// Numeri casuali ripetibili: la scena è sempre la stessa
let semeRng = 7;
const rng = () => {
  semeRng |= 0; semeRng = (semeRng + 0x6d2b79f5) | 0;
  let t = Math.imul(semeRng ^ (semeRng >>> 15), 1 | semeRng);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const tra = (a, b) => a + rng() * (b - a);

/** Altezza del terreno: lievi ondulazioni e il bosco che sale ai bordi. */
function quota(x, z) {
  const r = Math.hypot(x, z);
  const conca = THREE.MathUtils.smoothstep(r, 9, 24) * 2.6;
  return Math.sin(x * 0.35) * Math.cos(z * 0.3) * 0.25 + Math.sin(x * 0.9 + z * 0.7) * 0.08 + conca;
}

// ---------- Renderer, scena, camera ----------
// ?foto tiene l'ultimo fotogramma nel canvas: serve solo per le catture dello schermo
const FOTO = PARAMETRI.has("foto");
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: FOTO });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = false; // ombre precalcolate: si rifanno solo quando serve
document.body.prepend(renderer.domElement);

const scena = new THREE.Scene();
scena.background = COLORE_NEBBIA;
scena.fog = new THREE.Fog(COLORE_NEBBIA, 20, 46);

const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.5, 120);
// Dall'alto, inclinata come nel riferimento; con ?vicino la camera va da Linfa
const VICINO = PARAMETRI.has("vicino");
const cam = (VICINO ? CFG.cameraVicina : CFG.camera) ?? (VICINO ? { da: [0.9, 3.4, 7.6], a: [0, 2.0, 0] } : { da: [1.2, 11.5, 12.8], a: [0, 1.6, 0.4] });
const BERSAGLIO = new THREE.Vector3(...cam.a);
const POSIZIONE = new THREE.Vector3(...cam.da);
camera.position.copy(POSIZIONE);
camera.lookAt(BERSAGLIO);

// ---------- Luci ----------
const cielo = new THREE.HemisphereLight("#a9c7b0", "#2a3a1c", 0.95);
scena.add(cielo);
const sole = new THREE.DirectionalLight("#ffc58a", 3.4);
sole.position.copy(SOLE).multiplyScalar(40);
sole.castShadow = true;
sole.shadow.mapSize.set(4096, 4096);
Object.assign(sole.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 5, far: 90 });
sole.shadow.bias = -0.0004;
sole.shadow.normalBias = 0.03;
sole.shadow.radius = 4;
scena.add(sole, sole.target);
// Controluce caldo da dietro: accende il bordo delle chiome e dei tronchi
const controluce = new THREE.DirectionalLight("#ffd08a", 1.5);
controluce.position.set(8, 9, -18);
scena.add(controluce);
// e un riempimento fresco dal davanti, per non perdere i visi in ombra
const riempimento = new THREE.DirectionalLight("#bcd4e6", 0.45);
riempimento.position.set(4, 6, 16);
scena.add(riempimento);

// ---------- Terreno dipinto ----------
const LATO = 80;
function texTerreno() {
  const N = 2048, c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext("2d");
  const px = (w) => ((w + LATO / 2) / LATO) * N; // metri → pixel
  g.fillStyle = "#24431a"; g.fillRect(0, 0, N, N);
  const macchia = (x, y, r, colore, a) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, colore.replace(")", `,${a})`).replace("rgb", "rgba"));
    gr.addColorStop(1, colore.replace(")", ",0)").replace("rgb", "rgba"));
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  const verdi = ["rgb(46,84,30)", "rgb(30,58,20)", "rgb(62,100,34)", "rgb(38,70,24)", "rgb(74,96,36)"];
  for (let i = 0; i < 2600; i++) macchia(rng() * N, rng() * N, tra(14, 70), verdi[(rng() * verdi.length) | 0], tra(0.25, 0.5));
  // La radura: prato più caldo e chiaro al centro
  const cx = px(0), cy = px(0), R = (RAGGIO_RADURA / LATO) * N;
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
  gr.addColorStop(0, "rgba(112,140,48,.85)"); gr.addColorStop(0.6, "rgba(90,122,40,.55)"); gr.addColorStop(1, "rgba(60,96,30,0)");
  g.fillStyle = gr; g.fillRect(0, 0, N, N);
  // Terra battuta: un sentiero che entra nella radura dal basso a destra
  for (let i = 0; i < 90; i++) {
    const t = i / 90;
    const x = px(1.5 + t * 14 + Math.sin(t * 6) * 1.2), y = px(1.2 + t * 12);
    macchia(x, y, tra(18, 34), "rgb(104,78,46)", tra(0.25, 0.45));
  }
  for (let i = 0; i < 40; i++) macchia(px(tra(-3, 3)), px(tra(-2, 3)), tra(8, 22), "rgb(110,84,50)", tra(0.15, 0.3));
  // Fili d'erba: tratti brevi chiari e scuri, il «pennello» della texture
  for (let i = 0; i < 45000; i++) {
    const x = rng() * N, y = rng() * N;
    const d = Math.hypot(x - cx, y - cy) / R;
    const chiaro = rng() < (d < 1.3 ? 0.6 : 0.3);
    g.strokeStyle = chiaro ? `rgba(${120 + rng() * 40},${150 + rng() * 30},${60 + rng() * 20},.35)` : "rgba(18,40,14,.35)";
    g.lineWidth = tra(1, 2.2);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + tra(-2, 2), y - tra(4, 9)); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}
{
  const geo = new THREE.PlaneGeometry(LATO, LATO, 160, 160);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, quota(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const terreno = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: texTerreno(), roughness: 1 }));
  terreno.receiveShadow = true;
  scena.add(terreno);
}

// ---------- Materiali dipinti per i modelli ----------
// Ogni materiale Kenney (per nome) diventa un colore profondo e saturo.
const tempo = { value: 0 };
const PALETTE = {
  leafsDark: ["#24461a", "#3a6a24"],
  leafsGreen: ["#2a5a1e", "#3f7a28"],
  grass: ["#2e5c1e", "#467e2a"],
  woodBarkDark: ["#4a2f1d", "#6a4429"],
  woodBark: ["#5b3b25", "#7a5236"],
  woodInner: ["#b88a55", "#d0a56c"],
  dirt: ["#4f544c", "#666a5c"], // nelle rocce Kenney è il corpo della roccia
  colorRed: ["#b8301f", "#d4452a"],
  colorTan: ["#c08b55", "#d8a46b"],
  colorYellow: ["#e0a526", "#f0c040"],
  _defaultMat: ["#ece2c8", "#f4ead2"],
};
const VENTO = new Set(["leafsDark", "leafsGreen", "grass"]);

function materialeDipinto(nome, altezza, muschio) {
  const [a] = PALETTE[nome] ?? ["#888", "#888"];
  const colore = muschio && nome === "grass" ? "#4c7a26" : a;
  const m = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: nome === "dirt" ? 0.8 : 0.92, flatShading: true });
  m.userData.base = new THREE.Color(colore);
  const vento = VENTO.has(nome) && !muschio;
  m.onBeforeCompile = (s) => {
    s.uniforms.uTempo = tempo;
    s.uniforms.uAltezza = { value: altezza };
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec2 aBase;\nuniform float uTempo;\nuniform float uAltezza;\nvarying float vAlt;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vec4 wp = instanceMatrix * vec4(transformed, 1.0);
        float alt = clamp((wp.y - aBase.x) / uAltezza, 0.0, 1.4);
        vAlt = alt;
        ${vento ? "float sv = sin(uTempo * 1.1 + aBase.y) * 0.6 + sin(uTempo * 2.6 + aBase.y * 1.7) * 0.25;\n        transformed.x += sv * 0.035 * alt * alt;\n        transformed.z += sv * 0.02 * alt * alt;" : ""}`,
      );
    // Occlusione finta: più scuro alla base, come nelle texture dipinte a mano
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vAlt;")
      .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb *= mix(0.42, 1.08, smoothstep(0.0, 0.7, vAlt));");
  };
  m.customProgramCacheKey = () => `dip-${vento}`;
  return m;
}

// ---------- Caricamento e istanze ----------
const loader = new GLTFLoader();
const CARTELLA = "./modelli/kenney-nature-kit/";
const modelli = {};
async function carica(nome) {
  const g = await loader.loadAsync(CARTELLA + nome + ".glb");
  g.scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(g.scene);
  const parti = [];
  g.scene.traverse((o) => { if (o.isMesh) parti.push(o); });
  modelli[nome] = { box, parti };
}

/**
 * Mette N copie di un modello con un'unica InstancedMesh per parte.
 * posti: [{ x, z, h (altezza in metri), rot, tinta (0..1), muschio }]
 */
function istanze(nome, posti, { ombra = true, muschio = false } = {}) {
  if (!posti.length) return;
  const { box, parti } = modelli[nome];
  const size = box.getSize(new THREE.Vector3());
  const centro = box.getCenter(new THREE.Vector3());
  const norm = new THREE.Matrix4().makeTranslation(-centro.x, -box.min.y, -centro.z);
  const hMedia = posti.reduce((s, p) => s + p.h, 0) / posti.length;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), su = new THREE.Vector3(0, 1, 0);
  for (const parte of parti) {
    const nomeMat = parte.material.name;
    const materiale = materialeDipinto(nomeMat, hMedia, muschio);
    const geo = parte.geometry.clone();
    const base = new Float32Array(posti.length * 2);
    const mesh = new THREE.InstancedMesh(geo, materiale, posti.length);
    const [c1, c2] = PALETTE[nomeMat] ?? ["#888", "#888"];
    const ca = new THREE.Color(muschio && nomeMat === "grass" ? "#3f6a20" : c1);
    const cb = new THREE.Color(muschio && nomeMat === "grass" ? "#5a8a2c" : c2);
    posti.forEach((p, i) => {
      const s = p.h / size.y;
      const y = quota(p.x, p.z) - 0.05;
      q.setFromAxisAngle(su, p.rot);
      m.compose(new THREE.Vector3(p.x, y, p.z), q, new THREE.Vector3(s * (p.sx ?? 1), s, s * (p.sx ?? 1)));
      m.multiply(norm).multiply(parte.matrixWorld);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, ca.clone().lerp(cb, p.tinta ?? rng()));
      base[i * 2] = y; base[i * 2 + 1] = rng() * 6.28;
    });
    geo.setAttribute("aBase", new THREE.InstancedBufferAttribute(base, 2));
    mesh.castShadow = ombra;
    mesh.receiveShadow = true;
    mesh.instanceMatrix.needsUpdate = true;
    scena.add(mesh);
  }
}

// ---------- Disposizione ----------
const occupati = [];
function libero(x, z, d) {
  return occupati.every(([ox, oz, od]) => Math.hypot(x - ox, z - oz) > Math.max(d, od));
}
/** n punti in un anello, escludendo il cono davanti alla camera dove servono. */
function sparpaglia(n, rMin, rMax, distanza, filtro = () => true, tentativi = 4000) {
  const out = [];
  for (let k = 0; k < tentativi && out.length < n; k++) {
    const a = rng() * Math.PI * 2, r = Math.sqrt(tra(rMin * rMin, rMax * rMax));
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (!filtro(x, z) || !libero(x, z, distanza)) continue;
    occupati.push([x, z, distanza]);
    out.push({ x, z, rot: rng() * Math.PI * 2, tinta: rng() });
  }
  return out;
}
// Davanti alla camera (z grande, x vicino al centro) niente alberi alti: coprirebbero Linfa.
const nonDavanti = (x, z) => !(z > 3 && Math.abs(x) < 9 + (z - 3) * 0.4);
// Dal lato del sole un varco, così la luce radente entra nella radura.
const varcoSole = (x, z) => {
  const a = Math.atan2(z, x);
  const dSole = Math.atan2(SOLE.z, SOLE.x);
  return Math.abs(Math.atan2(Math.sin(a - dSole), Math.cos(a - dSole))) > 0.38;
};

const NOMI = [
  "tree_detailed_dark", "tree_oak_dark", "tree_fat_darkh", "tree_pineTallA_detailed", "tree_pineRoundC",
  "stump_oldTall", "stump_roundDetailed", "log_large", "rock_largeA", "rock_largeC", "rock_tallB",
  "rock_smallC", "rock_smallFlatA", "plant_bushDetailed", "plant_bushLarge", "grass_large",
  "grass_leafsLarge", "plant_flatTall", "mushroom_redGroup", "mushroom_tanTall", "mushroom_red", "flower_yellowA",
];

async function costruisci() {
  await Promise.all(NOMI.map(carica));

  // Gli alberi-personaggio, prima di tutto, per riservare il loro posto
  for (const a of ALBERI) occupati.push([a.x, a.z, 2.0]);

  // Alberi alti intorno alla radura
  const alberi = sparpaglia(70, RAGGIO_RADURA + 1.5, 30, 2.6, (x, z) => nonDavanti(x, z) && varcoSole(x, z));
  const tipi = ["tree_detailed_dark", "tree_oak_dark", "tree_fat_darkh", "tree_pineTallA_detailed", "tree_pineRoundC"];
  const altezze = { tree_detailed_dark: [7, 10], tree_oak_dark: [6.5, 9], tree_fat_darkh: [6, 8.5], tree_pineTallA_detailed: [9, 13], tree_pineRoundC: [7, 10] };
  const gruppi = Object.fromEntries(tipi.map((t) => [t, []]));
  alberi.forEach((p, i) => {
    const t = tipi[i % tipi.length];
    const [a, b] = altezze[t];
    gruppi[t].push({ ...p, h: tra(a, b) });
  });
  tipi.forEach((t) => gruppi[t].length && istanze(t, gruppi[t]));

  // Oggetti messi a mano: si allargano con la radura e lasciano liberi i piedi degli alberi
  const k = RAGGIO_RADURA / 6.2;
  const fisso = (lista) => lista.map((p) => ({ ...p, x: p.x * k, z: p.z * k })).filter((p) => ALBERI.every((a) => Math.hypot(p.x - a.x, p.z - a.z) > 1.8));

  // Ceppi e tronco caduto vicino al bordo della radura
  istanze("stump_oldTall", fisso([{ x: -4.6, z: -2.4, h: 1.0, rot: 0.6 }, { x: 5.4, z: -3.8, h: 0.85, rot: 2.1 }]));
  istanze("stump_roundDetailed", fisso([{ x: 3.6, z: 2.6, h: 0.55, rot: 1.2, sx: 1.2 }, { x: -6.6, z: 3.8, h: 0.5, rot: 0.3 }]));
  istanze("log_large", fisso([{ x: -2.8, z: -5.4, h: 0.65, rot: 0.35 }]));
  [[-4.6, -2.4], [5.4, -3.8], [3.6, 2.6], [-6.6, 3.8], [-2.8, -5.4]].forEach(([x, z]) => occupati.push([x * k, z * k, 1.2]));

  // Rocce sfaccettate con il muschio
  istanze("rock_largeA", [...fisso([{ x: 6.8, z: 0.8, h: 1.3, rot: 0.4 }, { x: -7.5, z: -5.5, h: 1.6, rot: 2 }]), ...sparpaglia(5, 9, 22, 2)].map((p) => ({ h: tra(1.1, 1.8), ...p })), { muschio: true });
  istanze("rock_largeC", [...fisso([{ x: -5.6, z: 1.0, h: 0.9, rot: 1.1 }]), ...sparpaglia(5, 8, 22, 2)].map((p) => ({ h: tra(0.9, 1.6), ...p })), { muschio: true });
  istanze("rock_tallB", sparpaglia(4, 9, 20, 2.5, varcoSole).map((p) => ({ ...p, h: tra(1.8, 2.6) })), { muschio: true });
  istanze("rock_smallC", sparpaglia(22, 2.5, 18, 0.6).map((p) => ({ ...p, h: tra(0.25, 0.5) })), { muschio: true });
  istanze("rock_smallFlatA", sparpaglia(12, 2.2, 10, 0.6).map((p) => ({ ...p, h: tra(0.12, 0.22) })), { ombra: false });

  const basso = (x, z) => z < 4.5 || Math.abs(x) > 10;
  // Cespugli e felci sul bordo, più fitti dove il bosco comincia
  istanze("plant_bushLarge", sparpaglia(30, RAGGIO_RADURA, 22, 1.4, (x, z) => z < 6 || Math.abs(x) > 9).map((p) => ({ ...p, h: tra(1.1, 1.8) })));
  istanze("plant_bushDetailed", sparpaglia(34, RAGGIO_RADURA - 0.5, 20, 1.1, basso).map((p) => ({ ...p, h: tra(0.8, 1.3) })));
  istanze("grass_leafsLarge", sparpaglia(80, RAGGIO_RADURA - 1, 20, 0.7, basso).map((p) => ({ ...p, h: tra(0.6, 1.1) })));
  istanze("plant_flatTall", sparpaglia(40, RAGGIO_RADURA - 1.5, 16, 0.7, basso).map((p) => ({ ...p, h: tra(0.7, 1.1) })));
  // Ciuffi d'erba: tanti, piccoli, senza ombra (non si vedrebbe)
  const ciuffi = [];
  for (let i = 0; i < 520; i++) {
    const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * 22;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x, z) < 1.4) continue;
    ciuffi.push({ x, z, rot: rng() * 6.28, h: tra(0.25, 0.5), tinta: rng() });
  }
  istanze("grass_large", ciuffi, { ombra: false });

  // Funghi ai piedi dei ceppi e qualche fiore nella radura
  istanze("mushroom_redGroup", fisso([{ x: -4.0, z: -1.7, h: 0.32, rot: 0.2 }, { x: 4.2, z: 3.2, h: 0.28, rot: 2.4 }, { x: -2.0, z: -4.6, h: 0.3, rot: 1 }]));
  istanze("mushroom_tanTall", fisso([{ x: 6.0, z: -3.1, h: 0.4, rot: 0.8 }, { x: -6.0, z: 4.5, h: 0.36, rot: 2 }, { x: 2.6, z: -2.2, h: 0.3, rot: 1.6 }]));
  istanze("mushroom_red", fisso([{ x: 1.8, z: 1.9, h: 0.22, rot: 0.5 }, { x: -1.6, z: 2.4, h: 0.2, rot: 2.6 }, { x: 3.0, z: 0.4, h: 0.18, rot: 1.1 }]));
  istanze("flower_yellowA", sparpaglia(16, 1.8, RAGGIO_RADURA, 0.5).map((p) => ({ ...p, h: tra(0.25, 0.4) })), { ombra: false });
}

// ---------- Pulviscolo nella luce ----------
function pulviscolo() {
  const N = 260, pos = new Float32Array(N * 3), fase = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos.set([tra(-9, 9), tra(0.3, 5), tra(-7, 7)], i * 3);
    fase[i] = rng() * 6.28;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("fase", new THREE.BufferAttribute(fase, 1));
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,230,170,1)"); gr.addColorStop(1, "rgba(255,230,170,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const m = new THREE.PointsMaterial({ size: 0.09, map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTempo = tempo;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float fase;\nuniform float uTempo;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed += vec3(sin(uTempo*0.3+fase)*0.6, sin(uTempo*0.5+fase*2.0)*0.4, cos(uTempo*0.25+fase)*0.6);");
  };
  scena.add(new THREE.Points(geo, m));
}

// ---------- Raggi di luce (piani additivi inclinati come il sole) ----------
function raggi() {
  const c = document.createElement("canvas"); c.width = 64; c.height = 256;
  const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "rgba(255,214,150,0)"); gr.addColorStop(0.35, "rgba(255,214,150,.9)"); gr.addColorStop(1, "rgba(255,214,150,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const g2 = g.createLinearGradient(0, 0, 64, 0);
  g.globalCompositeOperation = "destination-in";
  g2.addColorStop(0, "rgba(0,0,0,0)"); g2.addColorStop(0.5, "rgba(0,0,0,1)"); g2.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = g2; g.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  for (const [x, z, w] of [[-5, -1, 2.2], [-4, 2.5, 1.4], [-6.5, -3.5, 1.6]]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, 16), mat);
    p.position.set(x, 4, z);
    p.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), SOLE);
    p.rotateY(rng() * 0.6);
    scena.add(p);
  }
}

// ---------- Avvio ----------
const ALBERI = CFG.alberi ?? [{ seme: "linfa", x: 0, z: 0, scala: 1.3, specie: "quercia", strada: "nessuna", occhi: "tondi", sopracciglia: "arco", bocca: "sorriso", lentiggini: false, tono: 0.55, altezza: 1, larghezza: 1 }];
const linfe = ALBERI.map(({ x, z, scala = 1.3, giro = 0, ...opzioni }) => {
  const l = creaLinfa(opzioni);
  l.gruppo.userData.terra = quota(x, z) - 0.02;
  l.gruppo.position.set(x, l.gruppo.userData.terra, z);
  l.gruppo.rotation.y = giro;
  l.gruppo.scale.setScalar(scala);
  scena.add(l.gruppo);
  return l;
});
window.__alberi = linfe.map((l) => l.opzioni);
window.__prove = { scena, linfe, renderer, camera }; // solo per le prove dalla console

// Ombra di contatto sotto i piedi (le ombre lunghe sono quelle vere, precalcolate)
{
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(0,0,0,.5)"); gr.addColorStop(0.6, "rgba(0,0,0,.22)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  for (const l of linfe) {
    const o = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    o.rotation.x = -Math.PI / 2;
    const s = l.gruppo.scale.x;
    o.scale.set(1.0 * s, 0.75 * s, 1);
    o.position.set(l.gruppo.position.x, l.gruppo.userData.terra + 0.04, l.gruppo.position.z + 0.08 * s);
    scena.add(o);
  }
}

// Etichette sotto gli alberi (pagina delle varianti)
const etichette = CFG.etichette
  ? linfe.map((l) => {
      const d = document.createElement("div");
      d.className = "targhetta";
      const o = l.opzioni;
      d.innerHTML = `<b>${o.specie}</b> · ${o.strada === "nessuna" ? "senza strada" : o.strada.replace("-", " ")}<br><span>seme ${o.seme}</span>`;
      document.body.append(d);
      return d;
    })
  : [];
function posizionaEtichette() {
  const v = new THREE.Vector3();
  etichette.forEach((d, i) => {
    v.copy(linfe[i].gruppo.position).project(camera);
    d.style.left = `${((v.x + 1) / 2) * innerWidth}px`;
    d.style.top = `${((1 - v.y) / 2) * innerHeight + 8}px`;
  });
}

// Clic: l'albero toccato saluta
const raggio = new THREE.Raycaster();
const puntatore = new THREE.Vector2();
function colpita(e) {
  puntatore.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raggio.setFromCamera(puntatore, camera);
  const hit = raggio.intersectObjects(linfe.map((l) => l.gruppo), true)[0];
  if (!hit) return null;
  return linfe.find((l) => { let o = hit.object; while (o) { if (o === l.gruppo) return true; o = o.parent; } return false; });
}
renderer.domElement.addEventListener("click", (e) => { const l = colpita(e); if (l) { l.saluta(); window.__saluti = (window.__saluti ?? 0) + 1; } });
renderer.domElement.addEventListener("pointermove", (e) => {
  renderer.domElement.style.cursor = colpita(e) ? "pointer" : "default";
  mira.set((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2);
});
const mira = new THREE.Vector2();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

await costruisci();
pulviscolo();
raggi();
renderer.shadowMap.needsUpdate = true; // le ombre si calcolano una volta sola
document.getElementById("carico").remove();

const aggiornaTutti = (t, dt) => { tempo.value = t; tempoLinfa.value = t; for (const l of linfe) l.aggiorna(t, dt); };

// Ciclo: respiro, ciglia, vento; la camera segue appena il mouse
const orologio = new THREE.Timer();
const fpsEl = document.getElementById("fps");
let fotogrammi = 0, finestra = 0, tFinto = 0;
window.__fps = 0;
// Per le prove: porta l'animazione a un istante preciso e disegna
window.__vai = (secondi, saluta = -1) => {
  if (saluta >= 0) linfe[saluta].saluta();
  for (let i = 0; i < Math.round(secondi * 60); i++) { tFinto += 1 / 60; aggiornaTutti(tFinto, 1 / 60); }
  posizionaEtichette();
  renderer.render(scena, camera);
};
// Misura senza il limite del monitor (anche a pannello nascosto): ms per fotogramma
window.__misura = (n = 120) => {
  const gl = renderer.getContext(), px = new Uint8Array(4);
  const t0 = performance.now();
  for (let i = 0; i < n; i++) { tFinto += 0.016; aggiornaTutti(tFinto, 0.016); renderer.render(scena, camera); }
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
  return { msPerFotogramma: +((performance.now() - t0) / n).toFixed(2), chiamate: renderer.info.render.calls, triangoli: renderer.info.render.triangles, pixel: [renderer.domElement.width, renderer.domElement.height] };
};
// Salva il fotogramma in screenshot/ (solo con il server di prova, che accetta /salva)
window.__salva = async (nome, tipo = "image/jpeg") => {
  renderer.render(scena, camera);
  const r = await fetch(`/salva?nome=${encodeURIComponent(nome)}`, { method: "POST", body: renderer.domElement.toDataURL(tipo, 0.9) });
  return r.status;
};
renderer.setAnimationLoop((ms) => {
  orologio.update(ms);
  const dt = Math.min(orologio.getDelta(), 0.05);
  tFinto += dt;
  aggiornaTutti(tFinto, dt);
  camera.position.x += (POSIZIONE.x + mira.x * 1.2 - camera.position.x) * 0.03;
  camera.position.y += (POSIZIONE.y - mira.y * 0.6 - camera.position.y) * 0.03;
  camera.lookAt(BERSAGLIO);
  posizionaEtichette();
  renderer.render(scena, camera);
  fotogrammi++; finestra += dt;
  if (finestra >= 0.5) {
    window.__fps = Math.round(fotogrammi / finestra);
    fpsEl.textContent = `${window.__fps} fps · ${renderer.info.render.calls} chiamate`;
    fotogrammi = 0; finestra = 0;
  }
});
