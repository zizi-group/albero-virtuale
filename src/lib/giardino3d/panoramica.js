// La tua foresta vista dall'alto (docs/stanze-e-vita.md, 1.1 e 13): il modo
// «panoramica» del motore. Le stanze sono radure con un recinto basso e un
// cartello; gli alberi-personaggio (gli stessi del giardino, scelti dal seme)
// respirano e ondeggiano col vento, niente routine. Le stanze chiuse sono
// radure incolte con un lucchetto di rami e la regola per aprirle.
//
//   const p = creaPanoramica(canvas, { stanze, bloccate, ora, stagione, cielo, movimentoRidotto });
//   p.su("tocca-stanza", ({ stanza, albero }) => …);  p.entra(idStanza, idAlbero);  // la camera scende
//   p.su("entrata", ({ stanza, albero }) => …);       p.distruggi();
//
// File a parte rispetto al giardino (index.js): riusa creaAlbero, il bosco morbido
// e le texture, senza toccarli.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { creaAlbero, UNIFORMI } from "./albero.js";
import { creaBoscoMorbido } from "./boscoMorbido.js";
import { generatore, hash } from "./casuale.js";
import { tubo } from "./forme.js";
import { MODELLI_PER_ID, modelloDalSeme } from "./modelli.js";
import { texAlone } from "./texture.js";

/**
 * @typedef {{ id: string, nome: string, seme: string, strada?: string | null, giorni?: number, umore?: string, modello?: string }} AlberoPanoramica
 * @typedef {{ id: string, numero: number, nome: string, alberi: AlberoPanoramica[], esempio?: boolean }} StanzaPanoramica
 * @typedef {{ numero: number, regola: string }} BloccataPanoramica
 * @typedef {{ sopra: number, sotto: number, sinistra: number, destra: number }} Margini
 * @typedef {Object} OpzioniPanoramica
 * @property {StanzaPanoramica[]} stanze fino a 10, fino a 4 alberi ciascuna
 * @property {BloccataPanoramica[]} [bloccate]
 * @property {"alba"|"giorno"|"tramonto"|"notte"} [ora]
 * @property {"primavera"|"estate"|"autunno"|"inverno"} [stagione]
 * @property {"sole"|"nuvole"|"pioggia"|"temporale"|"neve"|"nebbia"} [cielo]
 * @property {boolean} [movimentoRidotto]
 * @property {Partial<Margini>} [margini] parti dello schermo coperte dai riquadri (frazioni)
 */

const RAGGIO = 3.4; // raggio di una radura
const PASSO = 9.2; // distanza fra i centri delle radure
const SCALA_ALBERI = 1.45; // dall'alto gli alberi si ingrandiscono un po', o sparirebbero
const LUCCHETTO_Y = 0.7;
/** Oltre questi alberi i personaggi si «congelano» (pezzi fermi uniti): meno disegni, niente battito di ciglia. */
const ALBERI_VIVI = 12;

/** Luce dell'ora (versione leggera di quella del giardino). */
const ORE = {
  alba: { sole: [-1, 0.5, 0.4], coloreSole: "#ffc49c", forzaSole: 2.2, cielo: "#ffe0cc", terra: "#5a6a3a", forzaCielo: 1.1, nebbia: "#f3dccb", esposizione: 1.1 },
  giorno: { sole: [-0.7, 1, 0.55], coloreSole: "#fff2cc", forzaSole: 2.7, cielo: "#d8f2ff", terra: "#5c8a3c", forzaCielo: 1.4, nebbia: "#d6efe2", esposizione: 1.1 },
  tramonto: { sole: [1, 0.45, 0.35], coloreSole: "#ffa262", forzaSole: 2.3, cielo: "#ffd0aa", terra: "#4c4a2c", forzaCielo: 1.0, nebbia: "#f0c4a0", esposizione: 1.1 },
  notte: { sole: [-0.5, 0.9, 0.6], coloreSole: "#b8ccff", forzaSole: 1.1, cielo: "#5674b0", terra: "#1c2a24", forzaCielo: 0.85, nebbia: "#1d3048", esposizione: 1.15 },
};
/** Il cielo smorza il sole e muove il vento. */
const CIELI = { sole: [1, 1], nuvole: [0.55, 1.4], pioggia: [0.35, 2], temporale: [0.25, 2.8], neve: [0.6, 0.8], nebbia: [0.45, 0.6] };
const PRATO = { primavera: ["#7ec850", "#9ad864"], estate: ["#6cb648", "#8ccc5a"], autunno: ["#a8a84a", "#c8b860"], inverno: ["#a8b4a0", "#c8d0c4"] };

/** Dove stanno le radure: una griglia sciolta, più stretta sul telefono in verticale. @param {number} n @param {boolean} stretto */
export function postiRadure(n, stretto) {
  const colonne = stretto ? Math.min(n, 2) : n <= 3 ? n : n <= 8 ? Math.ceil(n / 2) : Math.ceil(n / 3);
  const righe = Math.ceil(n / colonne);
  const r = generatore(hash(`radure:${n}:${stretto}`));
  /** @type {{ x: number, z: number }[]} */
  const out = [];
  for (let i = 0; i < n; i++) {
    const c = i % colonne, f = Math.floor(i / colonne);
    const sfasa = f % 2 ? PASSO * 0.22 : -PASSO * 0.08;
    out.push({
      x: (c - (colonne - 1) / 2) * PASSO + (righe > 1 ? sfasa : 0) + (r() - 0.5) * 1.2,
      z: (f - (righe - 1) / 2) * PASSO * 0.92 + (r() - 0.5) * 1.0,
    });
  }
  return out;
}

/** Dove stanno gli alberi dentro una radura (fino a 4). @param {number} n */
function postiAlberi(n) {
  if (n <= 1) return [[0, -0.2]];
  if (n === 2) return [[-1.3, -0.2], [1.3, 0]];
  if (n === 3) return [[-1.4, 0.45], [1.4, 0.45], [0, -1.25]];
  return [[-1.3, 0.85], [1.3, 0.85], [-1.3, -1.15], [1.3, -1.15]];
}

/** Il cartello: testo dipinto su una tela. @param {string} titolo @param {string} [riga] @param {boolean} [chiuso] */
function texCartello(titolo, riga = "", chiuso = false) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 240;
  const g = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
  // legno
  const grad = g.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, chiuso ? "#8a6a4a" : "#c99a62");
  grad.addColorStop(1, chiuso ? "#6e523a" : "#a8784a");
  g.fillStyle = grad;
  g.beginPath();
  g.roundRect(6, 6, c.width - 12, c.height - 12, 26);
  g.fill();
  g.strokeStyle = "rgba(60,36,18,0.55)";
  g.lineWidth = 8;
  g.stroke();
  g.globalAlpha = 0.12;
  for (let y = 26; y < c.height; y += 22) {
    g.beginPath();
    g.moveTo(24, y + Math.sin(y) * 3);
    g.bezierCurveTo(180, y - 6, 330, y + 6, c.width - 24, y);
    g.stroke();
  }
  g.globalAlpha = 1;
  g.fillStyle = chiuso ? "#f3e6d0" : "#3a2412";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const font = (/** @type {number} */ px, grassetto = true) => `${grassetto ? "bold " : ""}${px}px Georgia, "Times New Roman", serif`;
  const largo = c.width - 56;
  // il titolo va a capo (al massimo due righe) prima di rimpicciolirsi
  let corpo = 64;
  /** @type {string[]} */
  let righe = [titolo];
  g.font = font(corpo);
  if (g.measureText(titolo).width > largo) {
    const parole = titolo.split(" ");
    let meglio = [titolo], peggio = Infinity;
    for (let i = 1; i < parole.length; i++) {
      const due = [parole.slice(0, i).join(" "), parole.slice(i).join(" ")];
      const m = Math.max(...due.map((x) => g.measureText(x).width));
      if (m < peggio) { peggio = m; meglio = due; }
    }
    righe = meglio;
    corpo = 54;
  }
  g.font = font(corpo);
  while (Math.max(...righe.map((x) => g.measureText(x).width)) > largo && corpo > 28) g.font = font((corpo -= 2));
  const alto = corpo * 1.05;
  const yTitolo = (riga ? 98 : c.height / 2) - ((righe.length - 1) * alto) / 2;
  righe.forEach((x, i) => g.fillText(x, c.width / 2, yTitolo + i * alto));
  if (riga) {
    let piccolo = 34;
    g.font = font(piccolo, false);
    while (g.measureText(riga).width > largo && piccolo > 20) g.font = font((piccolo -= 2), false);
    g.fillText(riga, c.width / 2, 200);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Il prato dipinto: radure falciate, sentieri, erba alta attorno. */
function texPrato(/** @type {number} */ lato, /** @type {{ x: number, z: number, chiusa: boolean }[]} */ radure, /** @type {[number, number][]} */ sentieri, /** @type {string[]} */ colori) {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
  const px = (/** @type {number} */ v) => (v / lato + 0.5) * S;
  const k = S / lato;
  const r = generatore(17);
  g.fillStyle = colori[0];
  g.fillRect(0, 0, S, S);
  // macchie d'erba
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? "30,70,20" : "190,220,120"},${0.05 + r() * 0.08})`;
    g.beginPath();
    g.ellipse(r() * S, r() * S, 3 + r() * 14, 2 + r() * 8, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  // sentieri
  g.lineCap = "round";
  for (const [a, b] of sentieri) {
    g.strokeStyle = "rgba(196,170,120,0.85)";
    g.lineWidth = 1.1 * k;
    g.beginPath();
    g.moveTo(px(radure[a].x), px(radure[a].z));
    const mx = (radure[a].x + radure[b].x) / 2 + (r() - 0.5) * 1.5, mz = (radure[a].z + radure[b].z) / 2 + (r() - 0.5) * 1.5;
    g.quadraticCurveTo(px(mx), px(mz), px(radure[b].x), px(radure[b].z));
    g.stroke();
  }
  // radure: le aperte falciate e chiare, le chiuse scure e incolte
  for (const rd of radure) {
    const cx = px(rd.x), cz = px(rd.z), R = (RAGGIO + 0.4) * k;
    const gr = g.createRadialGradient(cx, cz, R * 0.2, cx, cz, R);
    if (rd.chiusa) {
      gr.addColorStop(0, "rgba(70,90,40,0.55)");
      gr.addColorStop(1, "rgba(70,90,40,0)");
    } else {
      gr.addColorStop(0, colori[1]);
      gr.addColorStop(0.82, colori[1]);
      gr.addColorStop(1, "rgba(0,0,0,0)");
    }
    g.fillStyle = gr;
    g.beginPath();
    g.arc(cx, cz, R, 0, Math.PI * 2);
    g.fill();
    if (!rd.chiusa) {
      // righe del prato falciato
      g.save();
      g.beginPath();
      g.arc(cx, cz, R * 0.85, 0, Math.PI * 2);
      g.clip();
      g.fillStyle = "rgba(255,255,255,0.07)";
      for (let y = -R; y < R; y += 0.9 * k) g.fillRect(cx - R, cz + y, 2 * R, 0.45 * k);
      g.restore();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Il lucchetto di rami: un fascio di legnetti con l'arco sopra. */
function creaLucchetto(/** @type {THREE.Material} */ legno, /** @type {THREE.Material} */ foglia) {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const y = 0.12 + i * 0.16;
    const t = tubo([[-0.42, y, 0.02 * i], [0, y + 0.03 * (i % 2 ? 1 : -1), 0.05], [0.42, y, 0.02 * i]], 0.085, 0.07, legno, 10, 7);
    g.add(t);
  }
  // le legature
  for (const x of [-0.24, 0.24]) g.add(tubo([[x, 0.02, 0.12], [x, 0.4, 0.14], [x, 0.7, 0.12]], 0.03, 0.03, foglia, 6, 5));
  // l'arco
  const arco = [];
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * Math.PI;
    arco.push([Math.cos(a) * 0.27, 0.72 + Math.sin(a) * 0.36, 0]);
  }
  g.add(tubo(arco, 0.05, 0.05, legno, 16, 7));
  // una foglia sull'arco
  const f = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), foglia);
  f.scale.set(1, 0.45, 1.6);
  f.position.set(0.12, 1.07, 0.04);
  f.rotation.z = 0.5;
  g.add(f);
  g.traverse((o) => { o.castShadow = true; });
  return g;
}

/**
 * Unisce in una sola geometria per materiale i pezzi fermi di un gruppo che si
 * muove tutto insieme (il corpo, la chioma, un braccio): da ~140 disegni per
 * albero a una ventina. Le istanze (foglie) e il bersaglio dei clic restano.
 * @param {THREE.Object3D} ancora @param {Set<THREE.Object3D>} ancore i gruppi che si muovono per conto loro
 */
function congela(ancora, ancore) {
  ancora.updateWorldMatrix(true, true);
  const inversa = new THREE.Matrix4().copy(ancora.matrixWorld).invert();
  /** @type {Map<THREE.Material, THREE.BufferGeometry[]>} */
  const perMateriale = new Map();
  /** @type {THREE.Mesh[]} */
  const via = [];
  /** @param {THREE.Object3D} o @param {boolean} visibile */
  const visita = (o, visibile) => {
    for (const f of [...o.children]) {
      if (ancore.has(f)) continue;
      const vis = visibile && f.visible;
      const m = /** @type {THREE.Mesh} */ (f);
      if (m.isMesh && !(/** @type {any} */ (m).isInstancedMesh) && vis && !Array.isArray(m.material) && /** @type {any} */ (m.material).visible !== false) {
        let geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
        for (const k of Object.keys(geo.attributes)) if (!["position", "normal", "uv"].includes(k)) geo.deleteAttribute(k);
        if (!geo.attributes.normal) geo.computeVertexNormals();
        if (!geo.attributes.uv) geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
        geo.morphAttributes = {};
        geo.clearGroups();
        geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inversa, m.matrixWorld));
        const lista = perMateriale.get(m.material) ?? [];
        lista.push(geo);
        perMateriale.set(m.material, lista);
        via.push(m);
      }
      if (vis) visita(f, vis);
    }
  };
  visita(ancora, true);
  for (const m of via) m.removeFromParent();
  for (const [materiale, geos] of perMateriale) {
    const unita = mergeGeometries(geos, false);
    for (const g of geos) g.dispose();
    if (!unita) continue;
    const mesh = new THREE.Mesh(unita, materiale);
    mesh.receiveShadow = true;
    ancora.add(mesh);
  }
}

/**
 * Crea la panoramica nel canvas dato.
 * @param {HTMLCanvasElement} canvas
 * @param {OpzioniPanoramica} opzioni
 */
export function creaPanoramica(canvas, opzioni) {
  const ridotto = !!opzioni.movimentoRidotto;
  const stanze = (opzioni.stanze ?? []).slice(0, 10);
  const bloccate = (opzioni.bloccate ?? []).slice(0, Math.max(0, 10 - stanze.length));
  const ora = opzioni.ora ?? "giorno";
  const stagione = opzioni.stagione ?? "estate";
  const cielo = opzioni.cielo ?? "sole";

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: !!(/** @type {any} */ (opzioni)._conservaFotogramma) });
  let rapporto = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(rapporto);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false; // si calcolano una volta: è una vista ferma

  const scena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 260);

  // ---------------------------------------------------------------- Radure
  const stretto = (canvas.clientWidth || canvas.width) / Math.max(1, canvas.clientHeight || canvas.height) < 0.8;
  const tutte = [...stanze.map((s) => ({ tipo: "aperta", s })), ...bloccate.map((b) => ({ tipo: "chiusa", b }))];
  const centri = postiRadure(Math.max(1, tutte.length), stretto);
  // sentieri: ogni radura con la precedente, e con quella sopra nella griglia
  /** @type {[number, number][]} */
  const sentieri = [];
  for (let i = 1; i < centri.length; i++) {
    let j = 0, d = Infinity;
    for (let k = 0; k < i; k++) { const dd = Math.hypot(centri[i].x - centri[k].x, centri[i].z - centri[k].z); if (dd < d) { d = dd; j = k; } }
    sentieri.push([j, i]);
  }

  // estensione e prato
  const xs = centri.map((c) => c.x), zs = centri.map((c) => c.z);
  const box = { x0: Math.min(...xs) - RAGGIO - 1, x1: Math.max(...xs) + RAGGIO + 1, z0: Math.min(...zs) - RAGGIO - 1, z1: Math.max(...zs) + RAGGIO + 1.6 };
  const lato = Math.max(box.x1 - box.x0, box.z1 - box.z0) + 70;
  const cx = (box.x0 + box.x1) / 2, cz = (box.z0 + box.z1) / 2;

  const luce = ORE[ora] ?? ORE.giorno;
  const [smorza, vento] = CIELI[cielo] ?? CIELI.sole;
  scena.background = new THREE.Color(luce.nebbia);
  renderer.toneMappingExposure = luce.esposizione;
  UNIFORMI.uVento.value = vento;
  UNIFORMI.uNeve.value = cielo === "neve" || stagione === "inverno" ? (cielo === "neve" ? 0.8 : 0.25) : 0;

  const emisfero = new THREE.HemisphereLight(luce.cielo, luce.terra, luce.forzaCielo);
  const sole = new THREE.DirectionalLight(luce.coloreSole, luce.forzaSole * smorza);
  const dirSole = new THREE.Vector3(...luce.sole).normalize();
  sole.position.copy(dirSole).multiplyScalar(50).add(new THREE.Vector3(cx, 0, cz));
  sole.target.position.set(cx, 0, cz);
  sole.castShadow = true;
  const ombraLato = Math.max(box.x1 - box.x0, box.z1 - box.z0) / 2 + 8;
  sole.shadow.mapSize.set(2048, 2048);
  Object.assign(sole.shadow.camera, { left: -ombraLato, right: ombraLato, top: ombraLato, bottom: -ombraLato, near: 5, far: 120 });
  sole.shadow.bias = -0.0006;
  sole.shadow.normalBias = 0.04;
  const riempi = new THREE.DirectionalLight("#cfe4ff", 0.35);
  riempi.position.set(cx + 3, 20, cz + 30);
  scena.add(emisfero, sole, sole.target, riempi);

  const prato = new THREE.Mesh(
    new THREE.PlaneGeometry(lato, lato).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({
      map: texPrato(lato, centri.map((c, i) => ({ x: c.x - cx, z: c.z - cz, chiusa: tutte[i].tipo === "chiusa" })), sentieri, PRATO[stagione] ?? PRATO.estate),
      roughness: 1,
    }),
  );
  prato.position.set(cx, 0, cz);
  prato.receiveShadow = true;
  scena.add(prato);
  scena.fog = new THREE.Fog(luce.nebbia, 60, 160);

  // ---------------------------------------------------------------- Recinti, cartelli, lucchetti
  const legno = new THREE.MeshStandardMaterial({ color: "#9a6a3e", roughness: 0.85 });
  const legnoScuro = new THREE.MeshStandardMaterial({ color: "#6a4a30", roughness: 0.9 });
  const fogliaLegature = new THREE.MeshStandardMaterial({ color: "#5a8a34", roughness: 0.8 });
  const PALI = 22;
  const paliAperti = stanze.length * PALI;
  const pali = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.07, 0.62, 6).translate(0, 0.31, 0), legno, Math.max(1, paliAperti));
  const assi = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.06, 0.05), legno, Math.max(1, paliAperti * 2));
  pali.castShadow = assi.castShadow = true;
  pali.count = assi.count = 0;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), su = new THREE.Vector3(0, 1, 0);
  /** @type {{ s?: StanzaPanoramica, b?: BloccataPanoramica, centro: THREE.Vector3, cartello: THREE.Group, bersaglio: THREE.Mesh, lucchetto?: THREE.Group, alberi: any[] }[]} */
  const radure = [];
  const geoBersaglio = new THREE.CylinderGeometry(RAGGIO + 0.3, RAGGIO + 0.3, 0.5, 24).translate(0, 0.25, 0);
  const invisibile = new THREE.MeshBasicMaterial({ visible: false });
  /** @type {THREE.Texture[]} */
  const texCartelli = [];

  // cespugli e felci per le radure chiuse e per il bordo
  /** @type {{ x: number, z: number, h: number, rot: number }[]} */
  const cespugli = [], felci = [], rocce = [];
  const rr = generatore(hash(`panoramica:${stanze.map((s) => s.id).join(",")}`));

  tutte.forEach((voce, i) => {
    const c = centri[i];
    const centro = new THREE.Vector3(c.x, 0, c.z);
    const chiusa = voce.tipo === "chiusa";
    // recinto: pali in cerchio con l'apertura davanti (verso la camera)
    if (!chiusa) {
      const angoli = [];
      for (let k = 0; k < PALI; k++) {
        const a = Math.PI / 2 + ((k + 1.5) / (PALI + 2)) * Math.PI * 2; // lascia un varco intorno a +z
        angoli.push(a);
        m4.compose(new THREE.Vector3(c.x + Math.cos(a) * RAGGIO, 0, c.z + Math.sin(a) * RAGGIO), q.identity(), new THREE.Vector3(1, 0.9 + rr() * 0.2, 1));
        pali.setMatrixAt(pali.count++, m4);
      }
      for (let k = 0; k < angoli.length - 1; k++) {
        const a = angoli[k], b = angoli[k + 1];
        const pa = new THREE.Vector3(c.x + Math.cos(a) * RAGGIO, 0, c.z + Math.sin(a) * RAGGIO);
        const pb = new THREE.Vector3(c.x + Math.cos(b) * RAGGIO, 0, c.z + Math.sin(b) * RAGGIO);
        const mezzo = pa.clone().add(pb).multiplyScalar(0.5);
        const lung = pa.distanceTo(pb);
        q.setFromAxisAngle(su, -Math.atan2(pb.z - pa.z, pb.x - pa.x));
        for (const y of [0.24, 0.46]) {
          m4.compose(mezzo.clone().setY(y), q, new THREE.Vector3(lung, 1, 1));
          assi.setMatrixAt(assi.count++, m4);
        }
      }
    } else {
      // incolta: cespugli, felci e qualche sasso dentro la radura
      for (let k = 0; k < 7; k++) {
        const a = rr() * Math.PI * 2, d = Math.sqrt(rr()) * (RAGGIO - 0.6);
        if (d < 1.9) continue; // il centro resta al lucchetto
        cespugli.push({ x: c.x + Math.cos(a) * d, z: c.z + Math.sin(a) * d, h: 0.9 + rr() * 0.7, rot: rr() * 6.28 });
      }
      for (let k = 0; k < 10; k++) {
        const a = rr() * Math.PI * 2, d = 0.9 + rr() * (RAGGIO - 0.9);
        felci.push({ x: c.x + Math.cos(a) * d, z: c.z + Math.sin(a) * d, h: 0.6 + rr() * 0.5, rot: rr() * 6.28 });
      }
      rocce.push({ x: c.x + (rr() - 0.5) * 3, z: c.z - 1.6 - rr(), h: 0.4 + rr() * 0.3, rot: rr() * 6.28 });
    }

    // cartello all'ingresso, un po' di lato
    const cartello = new THREE.Group();
    const palo = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.35, 6).translate(0, 0.675, 0), chiusa ? legnoScuro : legno);
    palo.castShadow = true;
    const titolo = voce.tipo === "aperta" ? voce.s.nome : `Stanza ${voce.b.numero}`;
    const riga = voce.tipo === "aperta"
      ? voce.s.esempio ? "esempio della demo" : voce.s.alberi.map((a) => a.nome).join(" · ")
      : voce.b.regola;
    const tex = texCartello(titolo, riga, chiusa);
    texCartelli.push(tex);
    const asse = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 1.875), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, side: THREE.DoubleSide, transparent: true, alphaTest: 0.1 }));
    asse.position.y = 1.85;
    asse.rotation.x = -0.85; // inclinato verso la camera alta
    asse.castShadow = true;
    cartello.add(palo, asse);
    cartello.position.set(c.x, 0, c.z + RAGGIO + (chiusa ? 0.3 : 0.75));
    scena.add(cartello);

    const bersaglio = new THREE.Mesh(geoBersaglio, invisibile);
    bersaglio.position.copy(centro);
    scena.add(bersaglio);

    /** @type {(typeof radure)[number]} */
    const rd = { centro, cartello, bersaglio, alberi: [] };
    if (voce.tipo === "aperta") rd.s = voce.s;
    else {
      rd.b = voce.b;
      const l = creaLucchetto(legnoScuro, fogliaLegature);
      l.position.set(c.x, LUCCHETTO_Y, c.z);
      l.scale.setScalar(2.3);
      scena.add(l);
      rd.lucchetto = l;
    }
    radure.push(rd);
  });
  pali.instanceMatrix.needsUpdate = assi.instanceMatrix.needsUpdate = true;
  scena.add(pali, assi);

  // ---------------------------------------------------------------- Alberi-personaggio
  const alone = new THREE.MeshBasicMaterial({ map: texAlone("0,0,0", 0.45), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const geoOmbra = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  /** @type {{ dati: AlberoPanoramica, stanza: StanzaPanoramica, albero: ReturnType<typeof creaAlbero>, fase: number }[]} */
  const personaggi = [];
  for (const rd of radure) {
    if (!rd.s) continue;
    const lista = rd.s.alberi.slice(0, 4);
    const dove = postiAlberi(lista.length);
    lista.forEach((a, i) => {
      const mod = (a.modello && MODELLI_PER_ID[a.modello]) || modelloDalSeme(a.seme);
      const albero = creaAlbero(mod, { seme: a.seme, strada: a.strada ?? undefined, giorni: a.giorni });
      albero.scala.scale.multiplyScalar(SCALA_ALBERI);
      albero.stagione(stagione);
      albero.viso.umore(a.umore ?? "curioso");
      albero.radice.position.set(rd.centro.x + dove[i][0], 0, rd.centro.z + dove[i][1]);
      albero.radice.rotation.y = (rd.centro.x + dove[i][0] - cx) * -0.015; // tutti verso chi guarda
      scena.add(albero.radice);
      const s = albero.scala.scale.x;
      const ombra = new THREE.Mesh(geoOmbra, alone);
      ombra.position.set(albero.radice.position.x, 0.03, albero.radice.position.z + 0.1);
      ombra.scale.set(1.3 * s, 1, 1.0 * s);
      scena.add(ombra);
      const p = { dati: a, stanza: /** @type {StanzaPanoramica} */ (rd.s), albero, fase: hash(a.seme) % 1000 / 159 };
      personaggi.push(p);
      rd.alberi.push(p);
    });
  }

  const congelati = personaggi.length > ALBERI_VIVI;
  if (congelati) {
    for (const p of personaggi) {
      const a = p.albero;
      // il viso si ferma com'è dopo il primo fotogramma: occhi aperti, sguardo in su
      a.viso.guarda(0, 0.35);
      for (let i = 0; i < 10; i++) a.viso.aggiorna(0.05, 0.3 + i * 0.05, true);
      const ancore = new Set([a.corpo, a.chioma, ...a.bracci, ...a.gambe]);
      for (const x of ancore) congela(x, ancore);
      congela(a.scala, ancore);
    }
  }

  // ---------------------------------------------------------------- Bosco intorno
  /** @type {{ x: number, z: number, h: number, rot: number }[]} */
  const alberiBosco = [];
  const lontanoDaRadure = (/** @type {number} */ x, /** @type {number} */ z, /** @type {number} */ m) => centri.every((c) => Math.hypot(x - c.x, z - c.z) > RAGGIO + m);
  const lontanoDaSentieri = (/** @type {number} */ x, /** @type {number} */ z) => sentieri.every(([a, b]) => {
    const A = centri[a], B = centri[b];
    const dx = B.x - A.x, dz = B.z - A.z, L = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - A.x) * dx + (z - A.z) * dz) / L));
    return Math.hypot(x - (A.x + t * dx), z - (A.z + t * dz)) > 1.6;
  });
  const largo = 16;
  for (let k = 0; k < 6000 && alberiBosco.length < 150; k++) {
    const x = box.x0 - largo + rr() * (box.x1 - box.x0 + 2 * largo);
    const z = box.z0 - largo + rr() * (box.z1 - box.z0 + largo + 4);
    // davanti alle radure (verso la camera) niente alberi alti: coprirebbero i cartelli
    if (z > box.z1 - 1) continue;
    if (!lontanoDaRadure(x, z, 1.9) || !lontanoDaSentieri(x, z)) continue;
    if (alberiBosco.some((a) => Math.hypot(a.x - x, a.z - z) < 2.3)) continue;
    // tra le radure alberi più bassi, fuori più alti
    const dentro = x > box.x0 && x < box.x1 && z > box.z0;
    alberiBosco.push({ x, z, h: dentro ? 2.6 + rr() * 1.4 : 3.8 + rr() * 2.6, rot: rr() * 6.28 });
  }
  // davanti: solo cespugli e felci
  for (let k = 0; k < 400 && cespugli.length < 22; k++) {
    const x = box.x0 - 6 + rr() * (box.x1 - box.x0 + 12), z = box.z1 + rr() * 6;
    if (!lontanoDaRadure(x, z, 1.2) || !lontanoDaSentieri(x, z)) continue;
    cespugli.push({ x, z, h: 0.7 + rr() * 0.6, rot: rr() * 6.28 });
  }
  for (const c of centri) {
    for (let k = 0; k < 3; k++) {
      const a = rr() * Math.PI * 2;
      felci.push({ x: c.x + Math.cos(a) * (RAGGIO + 0.7), z: c.z + Math.sin(a) * (RAGGIO + 0.7), h: 0.5 + rr() * 0.4, rot: rr() * 6.28 });
    }
  }
  const bosco = creaBoscoMorbido(scena, { rng: rr, quota: () => 0, alberi: alberiBosco, cespugli, felci, rocce });
  bosco.stagione(stagione);

  // ---------------------------------------------------------------- Eventi
  /** @type {Record<string, ((dati?: any) => void)[]>} */
  const ascoltatori = {};
  /** @param {string} ev @param {any} [dati] */
  const emetti = (ev, dati) => { for (const cb of ascoltatori[ev] ?? []) cb(dati); };

  // ---------------------------------------------------------------- Camera
  /** @type {Margini} */
  let margini = { sopra: 0, sotto: 0, sinistra: 0, destra: 0, ...opzioni.margini };
  const ALZO = THREE.MathUtils.degToRad(54); // quanto guarda in giù
  const BERSAGLIO = new THREE.Vector3(cx, 0, cz + 0.4);
  const POSIZIONE = new THREE.Vector3();
  const angoli = [
    [box.x0, 0, box.z0], [box.x1, 0, box.z0], [box.x0, 0, box.z1 + 1], [box.x1, 0, box.z1 + 1],
    [box.x0, 4.5, box.z0], [box.x1, 4.5, box.z0],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const prova = new THREE.Vector3();
  function inquadra() {
    const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
    renderer.setPixelRatio(rapporto);
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    const fx = Math.max(0.3, 1 - margini.sinistra - margini.destra), fy = Math.max(0.3, 1 - margini.sopra - margini.sotto);
    const dir = new THREE.Vector3(0, Math.sin(ALZO), Math.cos(ALZO));
    // quanto occupano le radure sullo schermo (in coordinate -1..1) a distanza d
    const ingombro = (/** @type {number} */ d) => {
      camera.position.copy(BERSAGLIO).addScaledVector(dir, d);
      camera.lookAt(BERSAGLIO);
      camera.updateMatrixWorld(true);
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const p of angoli) {
        prova.copy(p).project(camera);
        x0 = Math.min(x0, prova.x); x1 = Math.max(x1, prova.x); y0 = Math.min(y0, prova.y); y1 = Math.max(y1, prova.y);
      }
      return { x0, x1, y0, y1 };
    };
    // la distanza più piccola che fa stare tutte le radure nella fascia libera
    let lo = 8, hi = 260;
    for (let it = 0; it < 24; it++) {
      const d = (lo + hi) / 2;
      const g = ingombro(d);
      if ((g.x1 - g.x0) / 2 < 0.95 * fx && (g.y1 - g.y0) / 2 < 0.93 * fy) hi = d; else lo = d;
    }
    const g = ingombro(hi);
    POSIZIONE.copy(BERSAGLIO).addScaledVector(dir, hi);
    if (!volo) { camera.position.copy(POSIZIONE); camera.lookAt(BERSAGLIO); }
    // le radure al centro della fascia libera fra i riquadri (la prospettiva le sposta in alto)
    const ox = margini.sinistra + fx / 2 - 0.5, oy = margini.sopra + fy / 2 - 0.5;
    camera.setViewOffset(w, h, -ox * w + ((g.x0 + g.x1) / 2) * (w / 2), -oy * h - ((g.y0 + g.y1) / 2) * (h / 2), w, h);
    camera.updateProjectionMatrix();
  }
  /** @type {{ t: number, durata: number, da: THREE.Vector3, a: THREE.Vector3, guardaDa: THREE.Vector3, guardaA: THREE.Vector3, dati: any, fatto: boolean } | null} */
  let volo = null;
  inquadra();
  const osservatore = new ResizeObserver(inquadra);
  osservatore.observe(canvas);

  // ---------------------------------------------------------------- Puntatore
  const raggio = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  /** @type {(typeof radure)[number] | null} */
  let sopra = null;
  /** @type {{ x: number, y: number } | null} */
  let premuto = null;
  /** @param {PointerEvent} e */
  const aNdc = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raggio.setFromCamera(ndc, camera);
  };
  /** Che cosa c'è sotto il puntatore: un albero (con la sua radura) o una radura. */
  const colpito = () => {
    const bersagli = [...personaggi.map((p) => p.albero.bersaglio), ...radure.map((r) => r.bersaglio), ...radure.map((r) => /** @type {THREE.Object3D} */ (r.cartello.children[1]))];
    const hit = raggio.intersectObjects(bersagli, false)[0];
    if (!hit) return null;
    const p = personaggi.find((x) => x.albero.bersaglio === hit.object);
    if (p) return { radura: /** @type {(typeof radure)[number]} */ (radure.find((r) => r.s === p.stanza)), albero: p };
    const rd = radure.find((r) => r.bersaglio === hit.object || r.cartello.children[1] === hit.object);
    return rd ? { radura: rd, albero: null } : null;
  };
  /** @param {PointerEvent} e */
  const giu = (e) => { premuto = { x: e.clientX, y: e.clientY }; };
  /** @param {PointerEvent} e */
  const muovi = (e) => {
    if (volo) return;
    aNdc(e);
    const c = colpito();
    sopra = c?.radura ?? null;
    canvas.style.cursor = c ? "pointer" : "";
  };
  /** @param {PointerEvent} e */
  const lascia = (e) => {
    if (!premuto || volo) return;
    const fermo = Math.hypot(e.clientX - premuto.x, e.clientY - premuto.y) < 12;
    premuto = null;
    if (!fermo) return;
    aNdc(e);
    const c = colpito();
    if (!c) return;
    if (c.radura.b) emetti("tocca-bloccata", { numero: c.radura.b.numero, regola: c.radura.b.regola });
    else if (c.radura.s) {
      if (c.albero) c.albero.albero.viso.breve("ride", 1.2);
      emetti("tocca-stanza", { stanza: c.radura.s.id, albero: c.albero?.dati.id ?? null });
    }
  };
  const fuori = () => { sopra = null; canvas.style.cursor = ""; };
  canvas.addEventListener("pointerdown", giu);
  canvas.addEventListener("pointermove", muovi);
  canvas.addEventListener("pointerup", lascia);
  canvas.addEventListener("pointerleave", fuori);

  // ---------------------------------------------------------------- Ciclo
  const orologio = new THREE.Timer();
  let t = 0;
  let pronto = false;
  let fermo = false;
  const guarda = new THREE.Vector3();
  const vicino = new THREE.Vector3();
  /** @param {number} x */
  const morbido = (x) => x * x * (3 - 2 * x);
  /** @param {number} dt */
  function passo(dt) {
    t += dt;
    UNIFORMI.uTempo.value = ridotto ? 0 : t;
    for (const p of personaggi) {
      const a = p.albero, f = p.fase;
      // respiro e vento: piccoli, è una vista
      const resp = ridotto ? 0 : Math.sin(t * 1.5 + f);
      a.corpo.scale.set(1 - resp * 0.008, 1 + resp * 0.016, 1 - resp * 0.008);
      a.corpo.rotation.z = ridotto ? 0 : Math.sin(t * 0.6 + f) * 0.022 * vento;
      a.chioma.rotation.z = ridotto ? 0 : Math.sin(t * 0.9 + f * 1.3) * 0.02 * vento;
      const alza = -0.32 + (ridotto ? 0 : Math.sin(t * 1.5 + f + 0.6) * 0.05);
      a.bracci[1].rotation.set(0, -0.18, alza);
      a.bracci[0].rotation.set(0, 0.18, -alza);
      if (!congelati) {
        a.viso.guarda(0, 0.35);
        a.viso.aggiorna(dt, t, ridotto);
      }
    }
    for (const rd of radure) {
      // il cartello della radura sotto il puntatore si alza un poco
      const su = rd === sopra ? 0.18 : 0;
      rd.cartello.position.y += (su - rd.cartello.position.y) * Math.min(1, dt * 10);
      if (rd.lucchetto) rd.lucchetto.position.y = LUCCHETTO_Y + (ridotto ? 0 : Math.sin(t * 1.2 + rd.centro.x) * 0.08);
    }
    // la camera: un respiro lentissimo, oppure il volo verso la radura scelta
    if (volo) {
      volo.t = Math.min(volo.durata, volo.t + dt);
      const k = morbido(volo.t / volo.durata);
      camera.position.lerpVectors(volo.da, volo.a, k);
      guarda.lerpVectors(volo.guardaDa, volo.guardaA, k);
      camera.lookAt(guarda);
      if (volo.t >= volo.durata && !volo.fatto) { volo.fatto = true; emetti("entrata", volo.dati); }
    } else if (!ridotto) {
      camera.position.copy(POSIZIONE).add(vicino.set(Math.sin(t * 0.07) * 0.6, Math.sin(t * 0.05) * 0.25, 0));
      camera.lookAt(BERSAGLIO);
    }
  }

  // qualità adattiva come nel giardino: sotto i 45 fps la risoluzione scende fino a 1
  let media = 1 / 60, finestra = 0;
  function disegna() {
    orologio.update(performance.now());
    const dt = orologio.getDelta();
    passo(Math.min(dt, 0.05));
    renderer.render(scena, camera);
    media += (Math.min(dt, 0.2) - media) * 0.05;
    finestra += dt;
    if (finestra > 3 && media > 1 / 45 && rapporto > 1) {
      rapporto = Math.max(1, rapporto - 0.25);
      renderer.setPixelRatio(rapporto);
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      finestra = 0;
    }
  }
  const avvia = () => { if (!fermo) renderer.setAnimationLoop(disegna); };
  const visibilita = () => {
    if (document.hidden) renderer.setAnimationLoop(null);
    else { orologio.update(performance.now()); avvia(); }
  };
  document.addEventListener("visibilitychange", visibilita);

  // tutto è costruito subito (niente modelli da scaricare): si parte al prossimo fotogramma
  const partenza = requestAnimationFrame(() => {
    if (fermo) return;
    renderer.shadowMap.needsUpdate = true;
    pronto = true;
    avvia();
    emetti("pronto");
  });

  return {
    /** @param {Partial<Margini>} m */
    margini(m) { margini = { ...margini, ...m }; inquadra(); },
    /**
     * La camera scende sulla radura (e sull'albero, se c'è) e poi emette «entrata».
     * @param {string} idStanza @param {string | null} [idAlbero]
     */
    entra(idStanza, idAlbero = null) {
      const rd = radure.find((r) => r.s?.id === idStanza);
      if (!rd || volo) return;
      const p = idAlbero ? rd.alberi.find((x) => x.dati.id === idAlbero) : null;
      const fuoco = p ? p.albero.radice.position.clone() : rd.centro.clone();
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
      volo = {
        t: 0,
        durata: ridotto ? 0.05 : 1.25,
        da: camera.position.clone(),
        a: fuoco.clone().add(new THREE.Vector3(0, p ? 2.2 : 3.2, p ? 4.2 : 6.4)),
        guardaDa: BERSAGLIO.clone(),
        guardaA: fuoco.clone().add(new THREE.Vector3(0, p ? 1.4 : 1.0, 0)),
        dati: { stanza: idStanza, albero: idAlbero },
        fatto: false,
      };
    },
    /** @param {string} evento "pronto" | "tocca-stanza" | "tocca-bloccata" | "entrata" @param {(dati?: any) => void} cb */
    su(evento, cb) {
      (ascoltatori[evento] ??= []).push(cb);
      if (evento === "pronto" && pronto) cb();
      return () => { ascoltatori[evento] = (ascoltatori[evento] ?? []).filter((x) => x !== cb); };
    },
    distruggi() {
      fermo = true;
      cancelAnimationFrame(partenza);
      renderer.setAnimationLoop(null);
      document.removeEventListener("visibilitychange", visibilita);
      canvas.removeEventListener("pointerdown", giu);
      canvas.removeEventListener("pointermove", muovi);
      canvas.removeEventListener("pointerup", lascia);
      canvas.removeEventListener("pointerleave", fuori);
      osservatore.disconnect();
      scena.traverse((o) => {
        const m = /** @type {THREE.Mesh} */ (o);
        if (m.geometry) m.geometry.dispose();
        const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
        for (const x of mats) {
          for (const v of Object.values(x)) if (v && /** @type {THREE.Texture} */ (v).isTexture) /** @type {THREE.Texture} */ (v).dispose();
          x.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      for (const k of Object.keys(ascoltatori)) delete ascoltatori[k];
    },
    /** Solo per le prove: misura i ms per fotogramma senza il limite dello schermo. */
    _prove: {
      scena, camera, renderer,
      misura(n = 120) {
        const gl = renderer.getContext(), px = new Uint8Array(4);
        const t0 = performance.now();
        for (let i = 0; i < n; i++) { passo(1 / 60); renderer.render(scena, camera); }
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        return { msPerFotogramma: +((performance.now() - t0) / n).toFixed(2), chiamate: renderer.info.render.calls, triangoli: renderer.info.render.triangles, pixel: [renderer.domElement.width, renderer.domElement.height], alberi: personaggi.length, radure: radure.length };
      },
    },
  };
}
