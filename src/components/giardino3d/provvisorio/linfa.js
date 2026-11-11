// Linfa in 3D, versione morbida: tronco con venature e rilievo, chioma fatta di
// tante foglie vere (istanze con texture dipinta), occhi grandi lucidi, guance,
// sorriso, braccia-rami e piedini. Stessa identità del disegno 2D
// (src/components/albero/vivo/figura.tsx), proporzioni più tonde.
//
// creaLinfa(opzioni) costruisce un albero; generaOpzioni(seme) sceglie le
// opzioni in modo deterministico: stesso seme, stesso albero.
import * as THREE from "three";
import { generatore, hash, texCorteccia, texFoglia, texGuancia, texStoffa } from "./texture.js";

/** Tempo condiviso dalle foglie di tutti gli alberi (lo aggiorna la scena). */
export const tempo = { value: 0 };

// ------------------------------------------------------------------ Catalogo
export const SPECIE = {
  quercia: { foglia: "quercia", dim: [0.21, 0.27], toni: [["#2c6a1c", "#4c8f28"], ["#3f7f22", "#73ad38"]], forma: "tonda", foglie: 1150 },
  pino: { foglia: "aghi", dim: [0.19, 0.32], toni: [["#1c4a2a", "#2e6a3a"], ["#285a24", "#447f34"]], forma: "cono", foglie: 1150 },
  ulivo: { foglia: "ulivo", dim: [0.13, 0.27], toni: [["#3f5f32", "#6f8f5a"], ["#4f7040", "#86a070"]], forma: "larga", foglie: 1400 },
  betulla: { foglia: "betulla", dim: [0.16, 0.18], toni: [["#4a8a28", "#79b23a"], ["#5c9c2e", "#9ccb4c"]], forma: "ovale", foglie: 1100 },
  ciliegio: { foglia: "ciliegio", dim: [0.17, 0.23], toni: [["#3a7424", "#5c9832"], ["#467f26", "#6eaa3a"]], forma: "tonda", foglie: 800, fiori: 500 },
};

/** Le strade del personaggio e i loro accessori (niente persone o marchi reali). */
export const STRADE = {
  filosofo: ["occhiali-tondi"],
  artista: ["basco", "pennello"],
  sportivo: ["fascia"],
  viaggiatore: ["zaino", "occhialoni"],
  imprenditore: ["cravatta"],
  furfante: ["bandana"],
  "poeta-pigro": ["berretto-notte"],
};
/** Tipi di viso. Alcune strade hanno il loro: il poeta pigro è assonnato, il furfante furbetto. */
export const VISI = ["puntini", "felice", "ridente", "assonnato", "furbetto"];
export const VISO_DELLA_STRADA = { "poeta-pigro": "assonnato", furfante: "furbetto" };
export const SOPRACCIGLIA = ["piccole", "nessuna"];
export const BOCCHE = ["sorriso", "aperta", "storto"];
/** La bocca che va d'accordo con il viso. */
const BOCCA_DEL_VISO = { ridente: "aperta", furbetto: "storto", assonnato: "sorriso" };

/** Opzioni deterministiche dal seme dell'albero. */
export function generaOpzioni(seme) {
  const r = generatore(hash(`linfa:${seme}`));
  const scegli = (lista) => lista[Math.floor(r() * lista.length)];
  return {
    seme: String(seme),
    specie: scegli(Object.keys(SPECIE)),
    altezza: 0.9 + r() * 0.24,
    larghezza: 0.88 + r() * 0.24,
    viso: scegli(["puntini", "puntini", "felice", "ridente"]),
    sopracciglia: scegli(SOPRACCIGLIA),
    lentiggini: r() < 0.35,
    bocca: scegli(["sorriso", "sorriso", "aperta", "storto"]),
    tono: r(),
    strada: scegli([...Object.keys(STRADE), "nessuna"]),
  };
}

// ------------------------------------------------------------------ Utilità
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mat = (colore, extra = {}) => new THREE.MeshStandardMaterial({ color: colore, roughness: 0.75, ...extra });

/** Tubo affusolato lungo una curva (da r0 a r1), con le punte arrotondate. */
function tubo(punti, r0, r1, materiale, segmenti = 24, giro = 12) {
  const curva = new THREE.CatmullRomCurve3(punti.map((p) => v3(...p)));
  const geo = new THREE.TubeGeometry(curva, segmenti, 1, giro, false);
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  const c = new THREE.Vector3();
  for (let i = 0; i <= segmenti; i++) {
    const t = i / segmenti;
    curva.getPointAt(t, c);
    const r = r0 + (r1 - r0) * t;
    for (let j = 0; j <= giro; j++) {
      const k = i * (giro + 1) + j;
      pos.setXYZ(k, c.x + nor.getX(k) * r, c.y + nor.getY(k) * r, c.z + nor.getZ(k) * r);
    }
  }
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, materiale));
  for (const [t, r] of [[0, r0], [1, r1]]) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), materiale);
    s.position.copy(curva.getPointAt(t));
    g.add(s);
  }
  return g;
}

function ovale(rx, ry, rz, materiale, seg = 20) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)), materiale);
  m.scale.set(rx, ry, rz);
  return m;
}

// ------------------------------------------------------------------ Il tronco
/** Profilo del tronco: [raggio, altezza], tondo come un personaggio da cartone. */
function profiloTronco(larg, alt) {
  const base = 0.3;
  const h = 1.28 * alt;
  const punti = [
    [0, 0], [0.22, 0.01], [0.35, 0.06], [0.42, 0.16], [0.45, 0.33], [0.455, 0.5],
    [0.445, 0.68], [0.42, 0.84], [0.37, 0.94], [0.27, 0.99], [0.0, 1.0],
  ].map(([r, f]) => v3(r * 1.1 * larg, base + f * h, 0));
  const curva = new THREE.CatmullRomCurve3(punti, false, "centripetal");
  const campioni = curva.getPoints(40).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  campioni[0].x = 0; campioni[campioni.length - 1].x = 0;
  return { campioni, Y: (f) => base + f * h };
}

/** Raggio del tronco all'altezza y (interpolando il profilo). */
function raggioA(campioni, y) {
  for (let i = 1; i < campioni.length; i++) {
    const a = campioni[i - 1], b = campioni[i];
    if ((y - a.y) * (y - b.y) <= 0 && a.y !== b.y) return a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x);
  }
  return 0.3;
}

const SCHIACCIA = 0.88; // il tronco è un po' ellittico in pianta

/** Punto e normale sulla superficie anteriore del tronco. */
function superficie(campioni, x, y) {
  const r = raggioA(campioni, y);
  const a = r, b = r * SCHIACCIA;
  const t = Math.min(Math.abs(x) / a, 0.97);
  const z = b * Math.sqrt(1 - t * t);
  const normale = v3(x / (a * a), 0, z / (b * b)).normalize();
  return { punto: v3(x, y, z), normale, r };
}

/** Mette un oggetto sulla superficie, girato verso fuori, staccato di `fuori`. */
function posa(oggetto, campioni, x, y, fuori = 0) {
  const { punto, normale } = superficie(campioni, x, y);
  oggetto.position.copy(punto).addScaledVector(normale, fuori);
  oggetto.lookAt(oggetto.position.clone().add(normale));
  return oggetto;
}

// ------------------------------------------------------------------ Foglie
const geoFoglia = (() => {
  const g = new THREE.PlaneGeometry(1, 1, 2, 5);
  g.translate(0, 0.5, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, -0.22 * y * y + 0.12 * x * x); // si piega all'indietro e a barchetta
  }
  g.computeVertexNormals();
  return g;
})();

/** Materiale delle foglie: normali «a palla» (luce morbida) e un fruscio leggero. */
function materialeFoglie(texture, centro) {
  // Lambert: molto più leggero dello Standard, e le foglie sono tante e sovrapposte
  const m = new THREE.MeshLambertMaterial({ map: texture, alphaTest: 0.45, side: THREE.DoubleSide });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTempo = tempo;
    s.uniforms.uCentro = { value: centro };
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTempo;\nuniform vec3 uCentro;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float fase = dot(instanceMatrix[3].xyz, vec3(7.1, 5.3, 3.7));
          transformed.z += sin(uTempo * 2.4 + fase) * 0.06 * position.y;
          transformed.x += sin(uTempo * 1.7 + fase * 1.3) * 0.04 * position.y;
        #endif`,
      )
      .replace(
        "#include <defaultnormal_vertex>",
        `#include <defaultnormal_vertex>
        #ifdef USE_INSTANCING
          vec3 radiale = normalize(instanceMatrix[3].xyz - uCentro + vec3(0.0, 0.25, 0.0));
          transformedNormal = normalize(normalMatrix * normalize(mix(radiale, normalize(mat3(instanceMatrix) * objectNormal), 0.25)));
        #endif`,
      );
    // Stessa luce sulle due facce della foglia
    s.fragmentShader = s.fragmentShader.replace(
      "#include <normal_fragment_begin>",
      "#include <normal_fragment_begin>\nnormal = normalize(vNormal);",
    );
  };
  m.customProgramCacheKey = () => "foglie-linfa";
  return m;
}

/** Ciuffi della chioma secondo la forma della specie: [x, y, z, raggio] rispetto al centro. */
function ciuffi(forma, r) {
  const out = [];
  const sfera = (n, R, rc) => {
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n;
      const raggio = Math.sqrt(1 - y * y);
      const a = i * 2.39996 + r() * 0.4;
      out.push([Math.cos(a) * raggio * R[0] * 0.78, y * R[1] * 0.78, Math.sin(a) * raggio * R[2] * 0.78, rc * (0.85 + r() * 0.3)]);
    }
    for (let i = 0; i < 6; i++) out.push([(r() - 0.5) * R[0], (r() - 0.5) * R[1], (r() - 0.5) * R[2], rc]);
  };
  let R;
  if (forma === "tonda") { R = [1.0, 0.8, 0.9]; sfera(26, R, 0.36); }
  if (forma === "larga") {
    R = [1.22, 0.56, 0.95]; sfera(28, R, 0.3);
    for (let i = out.length - 1; i >= 0; i--) if (r() < 0.18) out.splice(i, 1); // l'ulivo è rado
  }
  if (forma === "ovale") { R = [0.72, 1.08, 0.68]; sfera(26, R, 0.3); }
  if (forma === "cono") {
    R = [0.95, 1.2, 0.95];
    const piani = 5;
    for (let p = 0; p < piani; p++) {
      const f = p / (piani - 1);
      const y = -0.85 + f * 1.75;
      const rr = 0.95 * (1 - f * 0.82);
      const n = Math.max(1, Math.round(10 * (1 - f * 0.7)));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + p * 0.5;
        out.push([Math.cos(a) * rr, y + (r() - 0.5) * 0.08, Math.sin(a) * rr * 0.92, 0.3 * (1 - f * 0.35)]);
      }
    }
    out.push([0, 1.05, 0, 0.2]);
  }
  // La chioma è una capigliatura: più piccola del tronco-testa, come nel riferimento
  const K = 0.8;
  return { lista: out.map(([x, y, z, rc]) => [x * K, y * K, z * K, rc * K]), R: R.map((v) => v * K) };
}

/** La chioma: InstancedMesh di foglie (e di fiori per il ciliegio). */
function chioma(o, campioni, Y, r) {
  const sp = SPECIE[o.specie];
  const { lista, R } = ciuffi(sp.forma, r);
  const yCima = Y(1);
  // Il centro della chioma sta sopra il tronco; la frangia ricade sulla fronte
  const centro = v3(0, sp.forma === "cono" ? 0.6 : R[1] * 0.42, -0.04);
  const fronte = superficie(campioni, 0, yCima - 0.14);
  const frangia = [];
  for (let i = 0; i < 6; i++) {
    const x = (i / 5 - 0.5) * 0.7;
    frangia.push([x, -0.06 - Math.abs(x) * 0.2 - centro.y, fronte.punto.z * 0.95 - centro.z, 0.22]);
  }
  // una corona di ciuffi intorno alla cima del tronco, che la nasconde
  const rCima = raggioA(campioni, yCima - 0.12);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    if (Math.sin(a) > 0.6) continue; // davanti c'è già la frangia
    frangia.push([Math.cos(a) * rCima * 0.95 - centro.x, -0.1 - centro.y, Math.sin(a) * rCima * 0.85 - centro.z, 0.24]);
  }
  const tutti = [...lista, ...frangia];
  const peso = tutti.map((c) => c[3] ** 2);
  const somma = peso.reduce((a, b) => a + b, 0);

  const gruppo = new THREE.Group(); // perno della chioma: in cima al tronco
  const toni = [0, 1].map((k) => new THREE.Color(sp.toni[0][k]).lerp(new THREE.Color(sp.toni[sp.toni.length - 1][k]), o.tono));

  const strati = [{ tipo: sp.foglia, n: sp.foglie, dim: sp.dim, colori: toni }];
  if (sp.fiori) strati.push({ tipo: "fiore", n: sp.fiori, dim: [0.15, 0.15], colori: [new THREE.Color("#ffffff"), new THREE.Color("#ffe6ec")], fiore: true });

  const yOcchi = Y(0.47) - yCima;
  const fronteLibera = ["sportivo", "furfante", "viaggiatore"].includes(o.strada) ? Y(0.95) - yCima : 0;
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  let yMax = 0, zFronte = 0;
  for (const strato of strati) {
    const materiale = materialeFoglie(texFoglia(strato.tipo), centro);
    const mesh = new THREE.InstancedMesh(geoFoglia, materiale, strato.n);
    mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: materiale.map, alphaTest: 0.45 });
    let n = 0;
    for (let tentativi = 0; n < strato.n && tentativi < strato.n * 4; tentativi++) {
      // un ciuffo a caso, i grandi più spesso
      let x = r() * somma, k = 0;
      while ((x -= peso[k]) > 0 && k < tutti.length - 1) k++;
      const [cx, cy, cz, rc] = tutti[k];
      const dir = v3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
      const dist = rc * (0.35 + 0.65 * Math.cbrt(r()));
      const p = v3(cx, cy, cz).add(centro).addScaledVector(dir, dist);
      // niente foglie davanti agli occhi
      if (p.y < yOcchi + 0.3 && p.z > 0.05 && Math.abs(p.x) < 0.45) continue;
      // con fascia o bandana la fronte resta scoperta, così si vedono
      if (fronteLibera && p.y < fronteLibera) continue;
      // i fiori stanno fuori, dove si vedono
      const daCentro = p.clone().sub(centro);
      const fuori = daCentro.length() / ((R[0] + R[1] + R[2]) / 3);
      if (strato.fiore && fuori < 0.65) continue;
      // quelle dentro la chioma non si vedono: costano e basta
      if (fuori < 0.42 && k < lista.length) continue;
      const nrm = dir.clone().multiplyScalar(0.5).add(daCentro.clone().normalize().multiplyScalar(0.7))
        .add(v3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.6)).normalize();
      const punta = nrm.clone().add(v3((r() - 0.5) * 1.2, 0.35 + (r() - 0.5) * 0.8, (r() - 0.5) * 1.2)).normalize();
      const zAsse = nrm;
      const yAsse = punta.sub(zAsse.clone().multiplyScalar(punta.dot(zAsse))).normalize();
      const xAsse = new THREE.Vector3().crossVectors(yAsse, zAsse);
      const s = 0.8 + r() * 0.45;
      m4.makeBasis(xAsse.multiplyScalar(strato.dim[0] * s), yAsse.multiplyScalar(strato.dim[1] * s), zAsse.multiplyScalar(strato.dim[0] * s));
      m4.setPosition(p);
      mesh.setMatrixAt(n, m4);
      // più scure dentro e sotto, più chiare fuori e in alto
      const luce = THREE.MathUtils.smoothstep(fuori, 0.25, 1.0) * 0.55 + THREE.MathUtils.smoothstep(p.y - centro.y, -R[1], R[1]) * 0.45;
      col.copy(strato.colori[0]).lerp(strato.colori[1], r());
      if (!strato.fiore) col.multiplyScalar(0.55 + 0.6 * luce);
      mesh.setColorAt(n, col);
      yMax = Math.max(yMax, p.y);
      if (Math.abs(p.y - 0.15) < 0.15 && Math.abs(p.x) < 0.2) zFronte = Math.max(zFronte, p.z);
      n++;
    }
    mesh.count = n;
    gruppo.add(mesh);
  }
  gruppo.position.y = yCima;
  return { gruppo, centro, R, yMax: yCima + yMax, zFronte };
}

// ------------------------------------------------------------------ Il viso
// Schema «cucciolo»: occhi piccoli, neri e lucidi, bassi e distanti sul tronco,
// fronte alta, guance grandi, bocca piccola. Niente bianco intorno agli occhi,
// niente ciglia lunghe: uno sguardo tenero, non fisso.
const OCCHIO = { rx: 0.064, ry: 0.082 };
const INCHIOSTRO = "#22160e";

const nero = () => new THREE.MeshPhysicalMaterial({ color: "#1a110b", roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04 });
const bianco = () => new THREE.MeshBasicMaterial({ color: "#ffffff" });

/** Linea sul tronco (arco, sopracciglio, bocca): punti [x, y] del viso proiettati sulla superficie. */
function lineaSulTronco(campioni, punti, r0, r1, materiale) {
  const pts = punti.map(([x, y]) => {
    const s = superficie(campioni, x, y);
    return [s.punto.x, s.punto.y, s.punto.z + 0.006];
  });
  return tubo(pts, r0, r1, materiale, 16, 8);
}

/** Occhio nero ovale e lucido, con un velo di marrone, un riflesso grande e uno piccolo. */
function occhioPuntino(campioni, x, y, schiaccia = 1) {
  const g = posa(new THREE.Group(), campioni, x, y, -0.012);
  const palpebra = new THREE.Group(); // si chiude scalando in altezza
  const { rx, ry } = OCCHIO;
  palpebra.add(ovale(rx, ry * schiaccia, 0.04, nero()));
  const velo = ovale(rx * 0.62, ry * 0.32 * schiaccia, 0.02, new THREE.MeshPhysicalMaterial({ color: "#4a2a18", roughness: 0.3, clearcoat: 1 }));
  velo.position.set(0, -ry * 0.5 * schiaccia, 0.028);
  const grande = ovale(0.021, 0.024, 0.01, bianco(), 10);
  grande.position.set(rx * 0.3, ry * 0.32 * schiaccia, 0.04);
  const piccolo = ovale(0.009, 0.009, 0.006, bianco(), 8);
  piccolo.position.set(-rx * 0.34, -ry * 0.3 * schiaccia, 0.04);
  palpebra.add(velo, grande, piccolo);
  g.add(palpebra);
  return { gruppo: g, palpebra, rx, ry, ancora: g };
}

/** Occhio chiuso ad arco felice (^): `apertura` 1 = arco pieno, 0.5 = più piatto (occhiolino). */
function occhioArco(campioni, x, y, materiale, alto = 0.034) {
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 4 - 1;
    pts.push([x + t * 0.07, y - alto * t * t + alto * 0.4]);
  }
  const gruppo = lineaSulTronco(campioni, pts, 0.02, 0.02, materiale);
  return { gruppo, palpebra: null, rx: OCCHIO.rx, ry: OCCHIO.ry, ancora: posa(new THREE.Group(), campioni, x, y, -0.012) };
}

/** Occhio assonnato: mezzo puntino sotto una palpebra pesante e calante. */
function occhioAssonnato(campioni, x, y, lato, materiale) {
  const o = occhioPuntino(campioni, x, y - 0.018, 0.55);
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 4 - 1;
    pts.push([x + t * 0.068, y + 0.008 - 0.01 * t * t - lato * t * 0.008]);
  }
  const gruppo = new THREE.Group();
  gruppo.add(o.gruppo, lineaSulTronco(campioni, pts, 0.016, 0.016, materiale));
  return { gruppo, palpebra: o.palpebra, rx: OCCHIO.rx, ry: OCCHIO.ry, ancora: o.gruppo };
}

/**
 * Sopracciglio corto e arrotondato, alto sopra l'occhio. L'estremità interna
 * (verso il naso) è un po' più alta: aria dolce o sorpresa, mai arrabbiata.
 */
function sopracciglioPiccolo(campioni, x, y, materiale, lato) {
  const pts = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 3 - 1; // -1 .. 1 da sinistra a destra
    pts.push([x + t * 0.032, y + (1 - t * t) * 0.011 - lato * t * 0.006]);
  }
  return lineaSulTronco(campioni, pts, 0.012, 0.012, materiale);
}

function bocca(campioni, y, tipo) {
  const g = new THREE.Group();
  const scuro = mat("#4a1f1a", { roughness: 0.5 });
  if (tipo === "aperta") {
    // bocca aperta piccola, con la lingua
    const forma = new THREE.Shape();
    forma.moveTo(-0.058, 0.012);
    forma.quadraticCurveTo(0, 0.0, 0.058, 0.012);
    forma.quadraticCurveTo(0.054, -0.062, 0, -0.064);
    forma.quadraticCurveTo(-0.054, -0.062, -0.058, 0.012);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(forma, 12), mat("#5a1c16", { roughness: 0.6 }));
    const lingua = ovale(0.034, 0.02, 0.008, mat("#e8807c", { roughness: 0.5 }));
    lingua.position.set(0, -0.046, 0.004);
    const piano = posa(new THREE.Group(), campioni, 0, y + 0.012, 0.005);
    piano.add(m, lingua);
    g.add(piano);
    return g;
  }
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 4 - 1;
    if (tipo === "storto") pts.push([0.018 + t * 0.052, y + 0.024 * t * t + 0.014 * t]); // un angolo più su
    else pts.push([t * 0.05, y + 0.026 * t * t]);
  }
  g.add(lineaSulTronco(campioni, pts, 0.014, 0.014, scuro));
  return g;
}

function guancia(campioni, x, y, lentiggini) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(0.27, 0.2),
    new THREE.MeshStandardMaterial({ map: texGuancia(lentiggini), transparent: true, depthWrite: false, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -4 }),
  );
  return posa(m, campioni, x, y, 0.012);
}

/**
 * Il viso intero secondo il tipo: puntini, felice (^ ^), ridente (^ ^ e bocca
 * aperta), assonnato, furbetto (occhiolino e sorriso storto).
 */
function viso(o, campioni, Y, colori) {
  const g = new THREE.Group();
  const linea = mat(INCHIOSTRO, { roughness: 0.5 });
  const sop = mat(o.specie === "betulla" ? "#4a3a2c" : colori.scuro, { roughness: 0.7 });
  const y = Y(0.47); // bassi sul tronco: la fronte resta alta
  const x = 0.215 * o.larghezza; // e ben distanti
  let occhi;
  if (o.viso === "felice" || o.viso === "ridente") occhi = [occhioArco(campioni, -x, y, linea), occhioArco(campioni, x, y, linea)];
  else if (o.viso === "assonnato") occhi = [occhioAssonnato(campioni, -x, y, -1, linea), occhioAssonnato(campioni, x, y, 1, linea)];
  else if (o.viso === "furbetto") occhi = [occhioPuntino(campioni, -x, y), occhioArco(campioni, x, y - 0.01, linea, 0.022)];
  else occhi = [occhioPuntino(campioni, -x, y), occhioPuntino(campioni, x, y)];
  occhi.forEach((oc) => g.add(oc.gruppo));

  // Sopracciglia solo dove servono: sui visi a puntini, se il seme le vuole.
  // Archi, assonnato e furbetto si leggono già bene senza.
  if (o.sopracciglia === "piccole" && o.viso === "puntini") {
    const yS = y + 0.17;
    g.add(sopracciglioPiccolo(campioni, -x, yS, sop, -1), sopracciglioPiccolo(campioni, x, yS, sop, 1));
  }
  const yG = y - 0.085;
  g.add(guancia(campioni, -(x + 0.075), yG, o.lentiggini), guancia(campioni, x + 0.075, yG, o.lentiggini));
  g.add(bocca(campioni, y - 0.135, o.bocca));
  return { gruppo: g, occhi };
}

// ------------------------------------------------------------------ Corpo
function braccio(lato, campioni, Y, corteccia, foglia, tinta) {
  const y = Y(0.42);
  const r = raggioA(campioni, y);
  const perno = new THREE.Group();
  perno.position.set(lato * r * 0.9, y, 0.02);
  perno.add(tubo([[0, 0, 0], [lato * 0.28, -0.1, 0.05], [lato * 0.5, -0.03, 0.1], [lato * 0.62, 0.13, 0.12]], 0.075, 0.045, corteccia));
  perno.add(tubo([[lato * 0.36, -0.08, 0.08], [lato * 0.42, 0.06, 0.05], [lato * 0.38, 0.16, 0.03]], 0.028, 0.014, corteccia, 10, 8));
  const materialeFoglia = new THREE.MeshStandardMaterial({ map: foglia, alphaTest: 0.45, side: THREE.DoubleSide, color: tinta, roughness: 0.7 });
  const fogliolina = (x, y2, z, ang, s = 1) => {
    const f = new THREE.Mesh(geoFoglia, materialeFoglia);
    f.scale.set(0.13 * s, 0.17 * s, 0.13 * s);
    f.position.set(x, y2, z);
    f.rotation.set(-0.3, 0, ang);
    return f;
  };
  perno.add(fogliolina(lato * 0.38, 0.15, 0.03, -lato * 0.4, 0.9));
  // Mano: un pugnetto di legno con tre foglie, come le mani-foglia del disegno
  const mano = new THREE.Group();
  mano.position.set(lato * 0.64, 0.16, 0.13);
  mano.add(ovale(0.06, 0.055, 0.055, corteccia));
  mano.add(fogliolina(0, 0.03, 0.02, -lato * 0.5), fogliolina(lato * 0.02, 0.04, 0.0, -lato * 1.2, 0.85), fogliolina(-lato * 0.01, 0.04, 0.02, lato * 0.2, 0.8));
  perno.add(mano);
  perno.userData.mano = mano;
  return perno;
}

function piede(lato, larg, scura) {
  const g = new THREE.Group();
  const x = lato * 0.19 * larg;
  g.add(tubo([[x * 0.85, 0.4, 0], [x, 0.22, 0.02], [x * 1.05, 0.1, 0.05]], 0.075, 0.07, scura, 10, 10));
  const p = ovale(0.15, 0.085, 0.2, scura);
  p.position.set(x * 1.05, 0.075, 0.09);
  g.add(p);
  for (const d of [-1, 0, 1]) {
    const dito = ovale(0.04, 0.035, 0.05, scura, 10);
    dito.position.set(x * 1.05 + d * 0.075, 0.04, 0.26);
    g.add(dito);
  }
  return g;
}

// ------------------------------------------------------------------ Accessori
/** Una fascia che abbraccia il tronco fra due altezze (frazioni del tronco). */
function fascia(campioni, Y, y0, y1, materiale, gonfia = 0.022) {
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const y = Y(y0 + ((y1 - y0) * i) / 8);
    pts.push(new THREE.Vector2(raggioA(campioni, y) + gonfia + Math.sin((i / 8) * Math.PI) * 0.012, y));
  }
  const geo = new THREE.LatheGeometry(pts, 40);
  geo.scale(1, 1, SCHIACCIA);
  return new THREE.Mesh(geo, materiale);
}

function accessori(nomi, ctx) {
  const { campioni, Y, occhi, chioma: ch, bracci } = ctx;
  const g = new THREE.Group();
  const vetro = new THREE.MeshPhysicalMaterial({ color: "#cfe6f0", transparent: true, opacity: 0.28, roughness: 0.05, clearcoat: 1 });
  for (const nome of nomi) {
    if (nome === "occhiali-tondi") {
      const tartaruga = mat("#4a2c1a", { roughness: 0.35 });
      const R = 0.105;
      const centri = [];
      for (const o of occhi) {
        const q = new THREE.Group();
        q.position.copy(o.ancora.position).addScaledVector(o.ancora.getWorldDirection(v3()), 0.075);
        q.quaternion.copy(o.ancora.quaternion);
        q.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.014, 10, 32), tartaruga), new THREE.Mesh(new THREE.CircleGeometry(R, 32), vetro));
        g.add(q);
        centri.push(q.position.clone());
      }
      const [a, b] = centri;
      g.add(tubo([[a.x + R * 0.9, a.y + 0.01, a.z], [0, a.y + 0.035, a.z + 0.02], [b.x - R * 0.9, b.y + 0.01, b.z]], 0.011, 0.011, tartaruga, 10, 6));
      for (const [c, s] of [[a, -1], [b, 1]]) {
        const lato = superficie(campioni, s * 0.42, c.y);
        g.add(tubo([[c.x + s * R, c.y, c.z - 0.02], [lato.punto.x + s * 0.03, c.y + 0.01, lato.punto.z * 0.6], [lato.punto.x + s * 0.02, c.y - 0.02, -0.15]], 0.01, 0.01, tartaruga, 10, 6));
      }
    }
    if (nome === "occhialoni") {
      // Occhialoni tirati su sulla fronte: sul tronco, sotto la chioma e sopra
      // gli occhi. Lenti piccole e a specchio, così non sembrano pupille.
      const yG = Y(0.77);
      const ottone = mat("#b98a3a", { metalness: 0.75, roughness: 0.28 });
      const lente = new THREE.MeshPhysicalMaterial({ color: "#a9c9d4", metalness: 0.7, roughness: 0.08, clearcoat: 1 });
      const centri = [];
      for (const s of [-1, 1]) {
        const q = posa(new THREE.Group(), campioni, s * 0.12, yG, 0.012);
        q.rotateX(-0.3); // un po' girati verso l'alto, come appoggiati
        const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.05, 24), ottone);
        corpo.rotation.x = Math.PI / 2;
        corpo.position.z = 0.02;
        const bordo = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 8, 24), ottone);
        bordo.position.z = 0.046;
        const vetroL = new THREE.Mesh(new THREE.CircleGeometry(0.058, 24), lente);
        vetroL.position.z = 0.047;
        const riflesso = ovale(0.04, 0.012, 0.003, new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.75 }), 8);
        riflesso.rotation.z = 0.6;
        riflesso.position.set(0.012, 0.018, 0.05);
        q.add(corpo, bordo, vetroL, riflesso);
        g.add(q);
        centri.push(q.position.clone());
      }
      const [a, b] = centri;
      g.add(tubo([[a.x + 0.07, a.y, a.z + 0.02], [0, a.y + 0.01, a.z + 0.04], [b.x - 0.07, b.y, b.z + 0.02]], 0.014, 0.014, mat("#5a3a22"), 8, 6));
      // cinghia intorno al tronco, alla stessa altezza
      g.add(fascia(campioni, Y, 0.755, 0.785, mat("#5a3a22", { roughness: 0.6 }), 0.012));
    }
    if (nome === "zaino") {
      const tela = mat("#8a5a2a", { roughness: 0.8 });
      const scuro = mat("#5e3c1c", { roughness: 0.8 });
      const yZ = Y(0.5);
      const dietro = raggioA(campioni, yZ) * SCHIACCIA;
      const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.22, 8, 20), tela);
      corpo.scale.set(1.15, 1, 0.6);
      corpo.position.set(0, yZ, -dietro - 0.1);
      const tasca = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.06, 6, 16), scuro);
      tasca.scale.set(1.2, 1, 0.5);
      tasca.position.set(0, yZ - 0.08, -dietro - 0.24);
      const rotolo = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.56, 20), mat("#c9b48a", { roughness: 0.9 }));
      rotolo.rotation.z = Math.PI / 2;
      rotolo.position.set(0, yZ + 0.34, -dietro - 0.1);
      g.add(corpo, tasca, rotolo);
      for (const s of [-1, 1]) {
        const y2 = Y(0.78);
        const r2 = raggioA(campioni, y2);
        g.add(tubo([[s * 0.2, y2, -r2 * 0.7], [s * r2 * 1.02, Y(0.7), 0], [s * raggioA(campioni, Y(0.38)) * 0.96, Y(0.38), 0.2]], 0.026, 0.026, scuro, 16, 6));
      }
    }
    if (nome === "basco") {
      const basco = ovale(0.4, 0.13, 0.4, mat("#8e2a3a", { roughness: 0.85 }), 28);
      basco.position.set(0.06, ch.yMax - 0.04, -0.04);
      basco.rotation.z = -0.25;
      const picciolo = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.07, 8), mat("#6e1f2c"));
      picciolo.position.set(0.03, ch.yMax + 0.1, -0.04);
      g.add(basco, picciolo);
    }
    if (nome === "pennello") {
      const p = new THREE.Group();
      p.add(tubo([[0, -0.08, 0], [0, 0.22, 0]], 0.018, 0.014, mat("#c99a5a", { roughness: 0.5 }), 4, 8));
      const ghiera = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.06, 12), mat("#cfd3d6", { metalness: 0.8, roughness: 0.25 }));
      ghiera.position.y = 0.25;
      p.add(ghiera);
      p.add(tubo([[0, 0.28, 0], [0, 0.34, 0], [0.01, 0.4, 0]], 0.02, 0.004, mat("#3a7bd5", { roughness: 0.4 }), 8, 8));
      p.rotation.z = 0.35;
      p.position.set(0, 0, 0.05);
      bracci[0].userData.mano.add(p);
    }
    if (nome === "fascia") {
      g.add(fascia(campioni, Y, 0.8, 0.92, mat("#c8382a", { roughness: 0.75 })));
      g.add(fascia(campioni, Y, 0.845, 0.875, mat("#f4ead6", { roughness: 0.75 }), 0.03));
    }
    if (nome === "bandana") {
      const t = texStoffa("pallini", "#b8322a", "#f4ead6");
      t.repeat.set(5, 1);
      const stoffa = mat("#ffffff", { map: t, roughness: 0.8 });
      g.add(fascia(campioni, Y, 0.78, 0.94, stoffa, 0.024));
      // nodo e code sul lato destro (per chi guarda), un po' indietro
      const y = Y(0.86);
      const r = raggioA(campioni, y);
      const nodo = ovale(0.07, 0.06, 0.06, stoffa);
      nodo.position.set(r * 0.86, y, -r * 0.42);
      g.add(nodo);
      g.add(tubo([[r * 0.9, y, -r * 0.45], [r * 1.05, y - 0.12, -r * 0.5], [r * 1.0, y - 0.26, -r * 0.62]], 0.045, 0.012, stoffa, 12, 8));
      g.add(tubo([[r * 0.9, y, -r * 0.45], [r * 1.1, y - 0.06, -r * 0.3], [r * 1.16, y - 0.2, -r * 0.24]], 0.04, 0.012, stoffa, 12, 8));
    }
    if (nome === "cravatta") {
      const tt = texStoffa("righe", "#24427a", "#d9b44a");
      tt.repeat.set(1, 3); tt.rotation = 0.7;
      const blu = mat("#ffffff", { map: tt, roughness: 0.6 });
      const nodo = posa(ovale(0.05, 0.045, 0.03, blu), campioni, 0, Y(0.25), 0.01);
      const forma = new THREE.Shape();
      forma.moveTo(-0.03, 0); forma.lineTo(0.03, 0); forma.lineTo(0.065, -0.24); forma.lineTo(0, -0.3); forma.lineTo(-0.065, -0.24); forma.closePath();
      nodo.scale.multiplyScalar(1.5);
      const lama = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: 0.018, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2 }), blu);
      const s = superficie(campioni, 0, Y(0.16));
      lama.position.set(0, Y(0.25) - 0.02, s.punto.z + 0.012);
      lama.rotation.x = -0.12;
      lama.scale.setScalar(1.5);
      lama.position.y += 0.02;
      g.add(nodo, lama);
      for (const k of [-1, 1]) {
        const c = new THREE.Shape();
        c.moveTo(0, 0); c.lineTo(k * 0.11, 0.03); c.lineTo(k * 0.07, -0.07); c.closePath();
        g.add(posa(new THREE.Mesh(new THREE.ShapeGeometry(c), mat("#f4f1ea", { side: THREE.DoubleSide })), campioni, k * 0.03, Y(0.26), 0.014));
      }
    }
    if (nome === "berretto-notte") {
      const t = texStoffa("righe", "#3a5aa8", "#f2eee2");
      t.repeat.set(1, 6);
      t.rotation = Math.PI / 2;
      const stoffa = mat("#ffffff", { map: t, roughness: 0.9 });
      const base = v3(-0.05, ch.yMax - 0.22, -0.06);
      const pts = [[0, 0, 0], [0.02, 0.32, 0], [0.16, 0.52, 0.02], [0.4, 0.48, 0.06], [0.54, 0.28, 0.1]].map(([x, y, z]) => [x + base.x, y + base.y, z + base.z]);
      g.add(tubo(pts, 0.36, 0.035, stoffa, 32, 20));
      const pon = ovale(0.085, 0.085, 0.085, mat("#f7f4ec", { roughness: 1 }), 14);
      pon.position.set(pts[4][0], pts[4][1] - 0.06, pts[4][2]);
      const risvolto = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.06, 12, 40), mat("#f2eee2", { roughness: 1 }));
      risvolto.rotation.x = Math.PI / 2;
      risvolto.position.copy(base).add(v3(0, 0.02, 0));
      g.add(pon, risvolto);
    }
  }
  return g;
}

// ------------------------------------------------------------------ Linfa
/**
 * Costruisce un albero. `opzioni` sovrascrive quelle generate dal seme.
 * Restituisce { gruppo, aggiorna(t, dt), saluta(), opzioni }.
 */
export function creaLinfa(opzioni = {}) {
  const o = { ...generaOpzioni(opzioni.seme ?? "linfa"), ...opzioni };
  if (!opzioni.viso && VISO_DELLA_STRADA[o.strada]) o.viso = VISO_DELLA_STRADA[o.strada];
  if (!opzioni.bocca && BOCCA_DEL_VISO[o.viso]) o.bocca = BOCCA_DEL_VISO[o.viso];
  const r = generatore(hash(`foglie:${o.seme}:${o.specie}`));
  const { campioni, Y } = profiloTronco(o.larghezza, o.altezza);

  const radice = new THREE.Group();
  const corpo = new THREE.Group(); // respira
  radice.add(corpo);

  const { map, bump, colori } = texCorteccia(o.specie);
  const ripeti = (t, x, y) => { const c = t.clone(); c.repeat.set(x, y); c.needsUpdate = true; return c; };
  const corteccia = new THREE.MeshStandardMaterial({ map: ripeti(map, 2, 1.4), bumpMap: ripeti(bump, 2, 1.4), bumpScale: 3, roughness: 0.82 });
  const corteccia2 = new THREE.MeshStandardMaterial({ map: ripeti(map, 0.5, 2), bumpMap: ripeti(bump, 0.5, 2), bumpScale: 1.5, roughness: 0.85 });
  const scura = mat(o.specie === "betulla" ? "#6e6458" : colori.scuro, { roughness: 0.85 });

  // Tronco tondo e morbido
  const geoT = new THREE.LatheGeometry(campioni, 48);
  geoT.scale(1, 1, SCHIACCIA);
  const busto = new THREE.Mesh(geoT, corteccia);
  corpo.add(busto);
  radice.add(piede(-1, o.larghezza, scura), piede(1, o.larghezza, scura));

  // Chioma
  const ch = chioma(o, campioni, Y, r);
  corpo.add(ch.gruppo);

  // Viso
  const { gruppo: faccia, occhi } = viso(o, campioni, Y, colori);
  corpo.add(faccia);

  // Braccia, con le foglie della specie
  const sp = SPECIE[o.specie];
  const tinta = new THREE.Color(sp.toni[0][1]).lerp(new THREE.Color(sp.toni[sp.toni.length - 1][1]), o.tono);
  const bracci = [-1, 1].map((l) => braccio(l, campioni, Y, corteccia2, texFoglia(sp.foglia), tinta));
  bracci.forEach((b) => corpo.add(b));

  // Accessori della strada; quelli in testa seguono la chioma quando respira
  const nomi = STRADE[o.strada] ?? [];
  corpo.updateMatrixWorld(true);
  const inTesta = new Set(["basco", "berretto-notte"]);
  const testa = accessori(nomi.filter((n) => inTesta.has(n)), { campioni, Y, occhi, chioma: ch, bracci });
  testa.position.y = -ch.gruppo.position.y;
  ch.gruppo.add(testa);
  corpo.add(accessori(nomi.filter((n) => !inTesta.has(n)), { campioni, Y, occhi, chioma: ch, bracci }));

  radice.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });

  // ---------------------------------------------------------------- Animazione
  const fase = (hash(o.seme) % 1000) / 160;
  let prossimoBattito = 1 + (hash(o.seme) % 300) / 100;
  let battito = -1, saluto = -1;
  const DURATA = 2.2;
  const casuale = generatore(hash(`ciglia:${o.seme}`));

  function saluta() { if (saluto < 0) saluto = 0; }

  function aggiorna(t, dt) {
    const s = Math.sin(t * 1.6 + fase);
    ch.gruppo.scale.setScalar(1 + 0.025 * s);
    busto.scale.set(1 - 0.006 * s, 1 + 0.012 * s, 1 - 0.006 * s);
    faccia.position.y = 0.006 * s;

    prossimoBattito -= dt;
    if (prossimoBattito <= 0 && battito < 0) { battito = 0; prossimoBattito = 2.2 + casuale() * 3.5; }
    let apertura = 1;
    if (battito >= 0) {
      battito += dt;
      const f = battito / 0.16;
      apertura = f < 1 ? 1 - Math.sin(f * Math.PI) * 0.92 : 1;
      if (f >= 1) battito = -1;
    }

    let saltello = 0, avanti = 0;
    let destro = 0.06 * Math.sin(t * 1.6 + fase + 0.5);
    const sinistro = -0.06 * Math.sin(t * 1.6 + fase + 0.5);
    if (saluto >= 0) {
      saluto += dt;
      const su = Math.min(1, saluto / 0.25) * Math.min(1, Math.max(0, (DURATA - saluto) / 0.35));
      // la mano resta all'altezza del viso e viene avanti, fuori dalla chioma
      destro += su * (0.28 + 0.3 * Math.sin(saluto * 14));
      avanti = -1.05 * su;
      saltello = saluto < 0.45 ? Math.sin((saluto / 0.45) * Math.PI) * 0.16 : 0;
      apertura = Math.min(apertura, saluto > 0.2 && saluto < 1.6 ? 0.5 : 1);
      if (saluto >= DURATA) saluto = -1;
    }
    bracci[1].rotation.z = destro;
    bracci[1].rotation.y = avanti;
    bracci[0].rotation.z = sinistro;
    radice.position.y = radice.userData.terra + saltello;
    for (const oc of occhi) if (oc.palpebra) oc.palpebra.scale.y = Math.max(0.08, apertura);
  }

  radice.userData.terra = 0;
  radice.userData.altezza = ch.yMax;
  return { gruppo: radice, aggiorna, saluta, opzioni: o };
}
