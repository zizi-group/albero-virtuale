// Linfa in 3D: il personaggio-albero costruito in codice, con le proporzioni del
// disegno 2D (src/components/albero/vivo/figura.tsx e disegni.tsx).
// Coordinate del disegno: x 0..240 (centro 120), terreno a y = 262, chioma in alto.
import * as THREE from "three";

const K = 0.0125; // metri di scena per unità del disegno
const X = (x) => (x - 120) * K;
const Y = (y) => (262 - y) * K;

// Colori del disegno (disegni.tsx), estate
const CORTECCIA = "#7a5236";
const CORTECCIA_SCURA = "#5b3b25";
const INCHIOSTRO = "#23261d";
const CARTA = "#fbf7ec";
const CHIOMA_SCURO = new THREE.Color("#2c5520");
const CHIOMA_MEDIO = new THREE.Color("#4f7f2e");
const CHIOMA_CHIARO = new THREE.Color("#86b04a");
const CHIOMA = [
  [120, 74, 52], [76, 94, 34], [164, 94, 34], [90, 54, 30],
  [150, 54, 30], [120, 34, 28], [100, 112, 24], [140, 112, 24],
];

/** Rumore liscio e deterministico, abbastanza per sfaccettare la chioma. */
function rumore(x, y, z) {
  return (
    Math.sin(x * 3.1 + y * 1.7) * 0.5 +
    Math.sin(y * 4.3 + z * 2.9) * 0.3 +
    Math.sin(z * 5.7 + x * 3.7) * 0.2
  );
}

/** Corteccia dipinta: striature verticali su un canvas. */
function texCorteccia() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = CORTECCIA; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 256, w = 2 + Math.random() * 7;
    g.strokeStyle = Math.random() < 0.7 ? "rgba(60,36,20,.45)" : "rgba(170,120,80,.35)";
    g.lineWidth = w;
    g.beginPath(); g.moveTo(x, 0);
    for (let y = 0; y <= 512; y += 32) g.lineTo(x + Math.sin(y * 0.02 + i) * 6, y);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const mat = (colore, extra = {}) => new THREE.MeshStandardMaterial({ color: colore, roughness: 0.85, ...extra });

/** Un tubo lungo una curva, con le estremità arrotondate. */
function ramo(punti, raggio, materiale) {
  const curva = new THREE.CatmullRomCurve3(punti.map((p) => new THREE.Vector3(...p)));
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 16, raggio, 8, false), materiale));
  for (const t of [0, 1]) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(raggio, 8, 6), materiale);
    s.position.copy(curva.getPoint(t));
    g.add(s);
  }
  return g;
}

/** Il tronco: un profilo ruotato, più largo in mezzo come nel disegno, ellittico in pianta. */
function tronco(corteccia) {
  // [mezza larghezza nel disegno, y del disegno]
  const profilo = [[0, 228], [22, 226], [25, 220], [30, 206], [31.5, 190], [31, 170], [29, 145], [27, 125], [25, 104], [0, 98]];
  const pts = profilo.map(([r, y]) => new THREE.Vector2(r * K, Y(y)));
  const geo = new THREE.LatheGeometry(pts, 20);
  geo.scale(1, 1, 0.82);
  return new THREE.Mesh(geo, corteccia);
}

/** Raggio del tronco (lungo x e z) all'altezza y del disegno: serve a posare la faccia. */
function superficie(xMondo, yDisegno) {
  const r = (yDisegno > 190 ? 31 : 30) * K;
  const a = r, b = r * 0.82;
  const t = Math.min(Math.abs(xMondo) / a, 0.98);
  const z = b * Math.sqrt(1 - t * t);
  const normale = new THREE.Vector3(xMondo / (a * a), 0, z / (b * b)).normalize();
  return { z, normale };
}

/** La chioma: palle sfaccettate e bitorzolute, unite in una sola geometria colorata ai vertici. */
function chioma(sole) {
  const parti = [];
  const blob = (x, y, z, r, seme) => {
    const g = new THREE.IcosahedronGeometry(r, 2);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = v.clone().normalize();
      const d = 1 + 0.13 * rumore(n.x * 2 + seme, n.y * 2, n.z * 2 - seme);
      v.multiplyScalar(d);
      p.setXYZ(i, v.x + x, v.y + y, v.z + z);
    }
    parti.push(g.index ? g.toNonIndexed() : g);
  };
  // Le palle del disegno, distribuite anche in profondità
  CHIOMA.forEach(([cx, cy, r], i) => {
    const z = i === 0 ? 0 : (i % 2 ? 0.12 : -0.1) * (r / 34);
    blob(X(cx), Y(cy), z, r * K * 1.08, i * 1.3);
  });
  // Volume dietro e sopra, visto che la camera guarda dall'alto
  blob(X(120), Y(70), -0.42, 44 * K, 9);
  blob(X(92), Y(80), -0.36, 30 * K, 11);
  blob(X(150), Y(80), -0.34, 30 * K, 13);
  blob(X(120), Y(96), 0.34, 30 * K, 15);

  // Unione manuale (BufferGeometryUtils non serve per geometrie non indicizzate)
  let n = 0; parti.forEach((g) => (n += g.attributes.position.count));
  const pos = new Float32Array(n * 3);
  let o = 0;
  parti.forEach((g) => { pos.set(g.attributes.position.array, o); o += g.attributes.position.array.length; });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.computeVertexNormals();

  // Colori dipinti: scuro sotto, chiaro dove batte il sole radente
  const nrm = geo.attributes.normal;
  const col = new Float32Array(n * 3);
  const c = new THREE.Color(), v = new THREE.Vector3(), nv = new THREE.Vector3();
  const basso = Y(140), alto = Y(6);
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(geo.attributes.position, i);
    nv.fromBufferAttribute(nrm, i);
    const h = THREE.MathUtils.clamp((v.y - basso) / (alto - basso), 0, 1);
    const luce = THREE.MathUtils.clamp(nv.dot(sole) * 0.5 + 0.5, 0, 1);
    c.copy(CHIOMA_SCURO).lerp(CHIOMA_MEDIO, Math.min(1, h * 1.6));
    c.lerp(CHIOMA_CHIARO, Math.max(0, luce - 0.45) * 1.1 * (0.4 + h * 0.6));
    const macchia = 0.92 + 0.08 * rumore(v.x * 9, v.y * 9, v.z * 9);
    col.set([c.r * macchia, c.g * macchia, c.b * macchia], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 }));
}

/** Occhio grande con pupilla, luce e ciglia; la palpebra si chiude scalando in altezza. */
function occhio(x, inchiostro) {
  const g = new THREE.Group();
  const { z, normale } = superficie(x, 164);
  g.position.set(x, Y(164), z - 0.02);
  g.lookAt(g.position.clone().add(normale));
  const palla = new THREE.Group(); // quella che si chiude
  const bianco = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 14), mat(CARTA, { roughness: 0.4 }));
  bianco.scale.set(0.1, 0.12, 0.06);
  const pupilla = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), mat(INCHIOSTRO, { roughness: 0.3 }));
  pupilla.scale.set(0.058, 0.068, 0.03);
  pupilla.position.set(0, -0.008, 0.045);
  const luce = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
  luce.scale.setScalar(0.018);
  luce.position.set(0.018, 0.022, 0.072);
  palla.add(bianco, pupilla, luce);
  g.add(palla);
  // Ciglia: arco sopra l'occhio con due ciuffetti verso l'esterno
  const esterno = Math.sign(x);
  const ciglia = new THREE.Group();
  const arco = [];
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI * (0.15 + 0.7 * (i / 8));
    arco.push([Math.cos(a) * 0.105, Math.sin(a) * 0.1 + 0.03, 0.05]);
  }
  ciglia.add(ramo(arco, 0.011, inchiostro));
  ciglia.add(ramo([[esterno * 0.085, 0.075, 0.05], [esterno * 0.13, 0.11, 0.045]], 0.009, inchiostro));
  ciglia.add(ramo([[esterno * 0.055, 0.11, 0.05], [esterno * 0.08, 0.155, 0.045]], 0.009, inchiostro));
  g.add(ciglia);
  return { gruppo: g, palla, ciglia };
}

/** Braccio-ramo: gruppo con il perno sulla spalla, rametto e mano di foglie. */
function braccio(lato, corteccia, foglia) {
  const s = lato; // -1 sinistra, +1 destra (per chi guarda)
  const perno = new THREE.Group();
  perno.position.set(s * 0.33, Y(150), 0.02);
  perno.add(ramo([[0, 0, 0], [s * 0.3, -0.12, 0.06], [s * 0.56, -0.02, 0.12], [s * 0.7, 0.2, 0.14]], 0.058, corteccia));
  // Rametto dal gomito, con una foglia
  perno.add(ramo([[s * 0.36, -0.1, 0.08], [s * 0.42, 0.06, 0.04], [s * 0.38, 0.16, 0.02]], 0.025, corteccia));
  const f = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), foglia);
  f.scale.set(0.07, 0.035, 0.05);
  f.position.set(s * 0.37, 0.2, 0.02);
  f.rotation.z = s * 0.6;
  perno.add(f);
  // Mano: due foglie
  const mano = new THREE.Group();
  mano.position.set(s * 0.72, 0.24, 0.14);
  const m1 = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), foglia);
  m1.scale.set(0.1, 0.065, 0.06); m1.rotation.z = s * 0.35;
  const m2 = m1.clone(); m2.scale.set(0.08, 0.05, 0.05);
  m2.position.set(s * 0.03, 0.07, 0.02); m2.rotation.z = s * 1.1;
  mano.add(m1, m2);
  perno.add(mano);
  return perno;
}

function piede(lato, scura) {
  const g = new THREE.Group();
  const x = lato * 0.17;
  g.add(ramo([[x * 0.8, Y(222), 0], [x, Y(238), 0.02], [x, 0.09, 0.04]], 0.065, scura));
  const p = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), scura);
  p.scale.set(0.15, 0.075, 0.2);
  p.position.set(x, 0.06, 0.08);
  g.add(p);
  // Dita-radici
  for (const d of [-1, 0, 1]) {
    g.add(ramo([[x + d * 0.06, 0.04, 0.2], [x + d * 0.09, 0.02, 0.3]], 0.022, scura));
  }
  return g;
}

/**
 * Costruisce Linfa. `sole` è la direzione della luce (verso la sorgente).
 * Restituisce il gruppo e una funzione `aggiorna(t, dt)` per l'animazione.
 */
export function creaLinfa(sole) {
  const radice = new THREE.Group();
  const corpo = new THREE.Group(); // respira
  radice.add(corpo);

  const texture = texCorteccia();
  const corteccia = mat("#ffffff", { map: texture });
  const scura = mat(CORTECCIA_SCURA, { roughness: 0.9 });
  const foglia = mat(CHIOMA_MEDIO, { flatShading: true });
  const inchiostro = mat(INCHIOSTRO, { roughness: 0.5 });

  radice.add(piede(-1, scura), piede(1, scura));
  const busto = tronco(corteccia);
  corpo.add(busto);

  const fronda = new THREE.Group();
  const verde = chioma(sole);
  // La chioma respira intorno a dove poggia sul tronco (come nel 2D: perno 120,132)
  fronda.position.set(0, Y(132), 0);
  verde.position.set(0, -Y(132), 0);
  fronda.add(verde);
  corpo.add(fronda);

  // Faccia
  const faccia = new THREE.Group();
  const occhi = [occhio(X(110) * 1.12, inchiostro), occhio(X(130) * 1.12, inchiostro)];
  occhi.forEach((o) => faccia.add(o.gruppo));
  for (const x of [X(103) * 1.1, X(137) * 1.1]) {
    const { z, normale } = superficie(x, 177);
    const guancia = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat("#e8806a", { roughness: 0.6 }));
    guancia.scale.set(0.085, 0.06, 0.02);
    guancia.position.set(x, Y(178), z - 0.004);
    guancia.lookAt(guancia.position.clone().add(normale));
    faccia.add(guancia);
  }
  // Bocca: un sorriso a mezzo anello
  const { z: zb } = superficie(0, 186);
  const bocca = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 8, 16, Math.PI), mat("#4a1f1a", { roughness: 0.5 }));
  bocca.rotation.z = Math.PI;
  bocca.position.set(0, Y(184), zb + 0.002);
  faccia.add(bocca);
  // Sopracciglia
  for (const s of [-1, 1]) {
    const x = s * 0.15;
    const { z } = superficie(x, 150);
    faccia.add(ramo([[x - s * 0.07, Y(149), z], [x, Y(146.5), z + 0.01], [x + s * 0.06, Y(148), z - 0.005]], 0.013, scura));
  }
  corpo.add(faccia);

  const bracci = [braccio(-1, corteccia, foglia), braccio(1, corteccia, foglia)];
  bracci.forEach((b) => corpo.add(b));

  radice.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = true; } });

  // --- Animazione ---
  let prossimoBattito = 1.5;
  let battito = -1; // tempo dall'inizio del battito di ciglia
  let saluto = -1; // tempo dall'inizio del saluto
  const DURATA_SALUTO = 2.2;

  function saluta() {
    if (saluto < 0) saluto = 0;
  }

  function aggiorna(t, dt) {
    // Respiro: la chioma si gonfia, il tronco si allunga appena
    const r = Math.sin(t * 1.6);
    fronda.scale.setScalar(1 + 0.03 * r);
    busto.scale.set(1 - 0.008 * r, 1 + 0.014 * r, 1 - 0.008 * r);
    fronda.position.y = Y(132) + 0.012 * r;
    faccia.position.y = 0.006 * r;

    // Ciglia
    prossimoBattito -= dt;
    if (prossimoBattito <= 0 && battito < 0) { battito = 0; prossimoBattito = 2.2 + Math.random() * 3.5; }
    let apertura = 1;
    if (battito >= 0) {
      battito += dt;
      const f = battito / 0.16;
      apertura = f < 1 ? 1 - Math.sin(f * Math.PI) * 0.92 : 1;
      if (f >= 1) battito = -1;
    }

    // Braccia: dondolio lieve; durante il saluto il destro si alza e sventola
    let saltello = 0;
    let avanti = 0;
    let destro = 0.06 * Math.sin(t * 1.6 + 0.5);
    const sinistro = -0.06 * Math.sin(t * 1.6 + 0.5);
    if (saluto >= 0) {
      saluto += dt;
      const s = saluto / DURATA_SALUTO;
      const su = Math.min(1, saluto / 0.25) * Math.min(1, (DURATA_SALUTO - saluto) / 0.35);
      destro += su * (0.5 + 0.32 * Math.sin(saluto * 14));
      avanti = -0.75 * su; // la mano viene in avanti, verso chi guarda
      saltello = saluto < 0.45 ? Math.sin((saluto / 0.45) * Math.PI) * 0.18 : 0;
      apertura = Math.min(apertura, saluto > 0.2 && saluto < 1.6 ? 0.55 : 1); // occhi sorridenti
      if (s >= 1) saluto = -1;
    }
    bracci[1].rotation.z = destro;
    bracci[1].rotation.y = avanti;
    bracci[0].rotation.z = sinistro;
    radice.position.y = radice.userData.terra + saltello;
    corpo.rotation.z = saluto >= 0 ? -0.05 * Math.sin(Math.min(1, saluto / 0.3) * Math.PI * 0.5) : 0;

    for (const o of occhi) {
      o.palla.scale.y = Math.max(0.08, apertura);
      o.ciglia.position.y = (apertura - 1) * 0.1;
    }
  }

  radice.userData.terra = 0;
  return { gruppo: radice, aggiorna, saluta };
}
