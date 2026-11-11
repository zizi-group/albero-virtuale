// L'albero-personaggio in 3D: tronco tondo con venature, chioma di foglie vere
// (istanze), viso, braccia-rami, gambe con i piedini e l'accessorio della strada.
// Espone le «ossa» (gruppi) che il comportamento muove: radice, corpo, busto,
// chioma, bracci, mani, gambe.
import * as THREE from "three";
import { generatore, hash } from "./casuale.js";
import { mat, ovale, tubo, v3 } from "./forme.js";
import { SPECIE } from "./modelli.js";
import { texCorteccia, texCuore, texFoglia, texSimbolo, texStoffa } from "./texture.js";
import { creaViso } from "./viso.js";

/** Uniformi condivise da tutte le foglie: tempo (fruscio) e neve. */
export const UNIFORMI = { uTempo: { value: 0 }, uNeve: { value: 0 }, uVento: { value: 1 } };

const SCHIACCIA = 0.88; // il tronco è un po' ellittico in pianta

// ------------------------------------------------------------------ Tronco
/** @param {number} larg @param {number} alt */
function profiloTronco(larg, alt) {
  const base = 0.3;
  const h = 1.28 * alt;
  const punti = [
    [0, 0], [0.22, 0.01], [0.35, 0.06], [0.42, 0.16], [0.45, 0.33], [0.455, 0.5],
    [0.445, 0.68], [0.42, 0.84], [0.37, 0.94], [0.27, 0.99], [0.0, 1.0],
  ].map(([r, f]) => v3(r * 1.1 * larg, base + f * h, 0));
  const curva = new THREE.CatmullRomCurve3(punti, false, "centripetal");
  const campioni = curva.getPoints(40).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  campioni[0].x = 0;
  campioni[campioni.length - 1].x = 0;
  /** @param {number} f */
  const Y = (f) => base + f * h;
  /** @param {number} y */
  const raggio = (y) => {
    for (let i = 1; i < campioni.length; i++) {
      const a = campioni[i - 1], b = campioni[i];
      if ((y - a.y) * (y - b.y) <= 0 && a.y !== b.y) return a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x);
    }
    return 0.3;
  };
  /** Punto e normale sulla superficie anteriore. @param {number} x @param {number} y */
  const superficie = (x, y) => {
    const r = raggio(y);
    const a = r, b = r * SCHIACCIA;
    const t = Math.min(Math.abs(x) / a, 0.97);
    const z = b * Math.sqrt(1 - t * t);
    return { punto: v3(x, y, z), normale: v3(x / (a * a), 0, z / (b * b)).normalize(), r };
  };
  /** Mette un oggetto sulla superficie, girato verso fuori. @param {THREE.Object3D} o @param {number} x @param {number} y */
  const posa = (o, x, y, fuori = 0) => {
    const { punto, normale } = superficie(x, y);
    o.position.copy(punto).addScaledVector(normale, fuori);
    o.lookAt(o.position.clone().add(normale));
    return o;
  };
  return { campioni, Y, raggio, superficie, posa };
}

/** Fascia che abbraccia il tronco fra due altezze (frazioni). */
function fascia(/** @type {ReturnType<typeof profiloTronco>} */ tr, /** @type {number} */ y0, /** @type {number} */ y1, /** @type {THREE.Material} */ materiale, gonfia = 0.022) {
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const y = tr.Y(y0 + ((y1 - y0) * i) / 8);
    pts.push(new THREE.Vector2(tr.raggio(y) + gonfia + Math.sin((i / 8) * Math.PI) * 0.012, y));
  }
  const geo = new THREE.LatheGeometry(pts, 40);
  geo.scale(1, 1, SCHIACCIA);
  return new THREE.Mesh(geo, materiale);
}

// ------------------------------------------------------------------ Foglie
const geoFoglia = (() => {
  const g = new THREE.PlaneGeometry(1, 1, 2, 5);
  g.translate(0, 0.5, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, -0.22 * y * y + 0.12 * x * x);
  }
  g.computeVertexNormals();
  return g;
})();
const geoFrutto = new THREE.SphereGeometry(1, 10, 8);

/** Materiale delle foglie: luce morbida «a palla», fruscio e neve sopra. @param {THREE.Texture} texture @param {THREE.Vector3} centro */
function materialeFoglie(texture, centro) {
  const m = new THREE.MeshLambertMaterial({ map: texture, alphaTest: 0.45, side: THREE.DoubleSide });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTempo = UNIFORMI.uTempo;
    s.uniforms.uNeve = UNIFORMI.uNeve;
    s.uniforms.uVento = UNIFORMI.uVento;
    s.uniforms.uCentro = { value: centro };
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTempo;\nuniform float uVento;\nuniform vec3 uCentro;\nvarying float vSu;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float fase = dot(instanceMatrix[3].xyz, vec3(7.1, 5.3, 3.7));
          transformed.z += sin(uTempo * 2.4 * uVento + fase) * 0.06 * uVento * position.y;
          transformed.x += sin(uTempo * 1.7 * uVento + fase * 1.3) * 0.04 * uVento * position.y;
        #endif`,
      )
      .replace(
        "#include <defaultnormal_vertex>",
        `#include <defaultnormal_vertex>
        #ifdef USE_INSTANCING
          vec3 radiale = normalize(instanceMatrix[3].xyz - uCentro + vec3(0.0, 0.25, 0.0));
          vSu = radiale.y;
          transformedNormal = normalize(normalMatrix * normalize(mix(radiale, normalize(mat3(instanceMatrix) * objectNormal), 0.25)));
        #else
          vSu = 0.0;
        #endif`,
      );
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uNeve;\nvarying float vSu;")
      .replace("#include <normal_fragment_begin>", "#include <normal_fragment_begin>\nnormal = normalize(vNormal);")
      .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.96, 0.97, 1.0), uNeve * smoothstep(0.15, 0.6, vSu));");
  };
  m.customProgramCacheKey = () => "foglie-giardino3d";
  return m;
}

/**
 * Ciuffi della chioma secondo la forma: [x, y, z, raggio] rispetto al centro.
 * @param {string} forma @param {() => number} r
 */
function ciuffi(forma, r) {
  /** @type {number[][]} */
  const out = [];
  /** @param {number} n @param {number[]} R @param {number} rc */
  const sfera = (n, R, rc) => {
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n;
      const raggio = Math.sqrt(1 - y * y);
      const a = i * 2.39996 + r() * 0.4;
      out.push([Math.cos(a) * raggio * R[0] * 0.78, y * R[1] * 0.78, Math.sin(a) * raggio * R[2] * 0.78, rc * (0.85 + r() * 0.3)]);
    }
    for (let i = 0; i < 6; i++) out.push([(r() - 0.5) * R[0], (r() - 0.5) * R[1], (r() - 0.5) * R[2], rc]);
  };
  /** @type {number[]} */
  let R = [1, 0.8, 0.9];
  if (forma === "tonda") sfera(26, R, 0.36);
  if (forma === "larga") {
    R = [1.22, 0.56, 0.95]; sfera(28, R, 0.3);
    for (let i = out.length - 1; i >= 0; i--) if (r() < 0.18) out.splice(i, 1);
  }
  if (forma === "ovale") { R = [0.72, 1.08, 0.68]; sfera(26, R, 0.3); }
  if (forma === "stretta") { R = [0.56, 1.35, 0.52]; sfera(28, R, 0.26); }
  if (forma === "colonna") { R = [0.42, 1.7, 0.42]; sfera(30, R, 0.24); }
  if (forma === "ombrello") { R = [1.35, 0.42, 1.15]; sfera(30, R, 0.28); }
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
  if (forma === "piangente") {
    R = [0.95, 0.62, 0.9]; sfera(22, R, 0.3);
    // rami che ricadono: fili di ciuffi sui fianchi e dietro, mai davanti al viso
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2 + r() * 0.2;
      if (Math.sin(a) > 0.45) continue;
      for (let j = 0; j < 5; j++) {
        const rr = 0.85 + j * 0.06;
        out.push([Math.cos(a) * rr, -0.1 - j * 0.24, Math.sin(a) * rr * 0.92, 0.17]);
      }
    }
  }
  const K = 0.8;
  return { lista: out.map(([x, y, z, rc]) => [x * K, y * K, z * K, rc * K]), R: R.map((v) => v * K) };
}

/**
 * La chioma: istanze di foglie (più fiori e frutti), ricolorabili per stagione.
 * @param {import("./modelli.js").Modello} mod @param {ReturnType<typeof profiloTronco>} tr @param {() => number} r @param {boolean} fronteLibera
 */
function chioma(mod, tr, r, fronteLibera) {
  const sp = SPECIE[mod.specie];
  const { lista, R } = ciuffi(sp.forma, r);
  const yCima = tr.Y(1);
  const sc = mod.chioma;
  const altoCentro = sp.forma === "cono" ? 0.6 : sp.forma === "colonna" ? R[1] * 0.62 : sp.forma === "ombrello" ? 0.62 : R[1] * 0.42;
  const centro = v3(0, altoCentro, -0.04);
  const tutti = lista.map(([x, y, z, rc]) => [x * sc, y * sc, z * sc, rc * sc]);
  const nPrincipali = tutti.length;
  // frangia sulla fronte e corona intorno alla cima del tronco
  if (sp.forma !== "ombrello") {
    const fronte = tr.superficie(0, yCima - 0.14);
    for (let i = 0; i < 6; i++) {
      const x = (i / 5 - 0.5) * 0.7;
      tutti.push([x, -0.06 - Math.abs(x) * 0.2 - centro.y, fronte.punto.z * 0.95 - centro.z, 0.22]);
    }
    const rCima = tr.raggio(yCima - 0.12);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3;
      if (Math.sin(a) > 0.6) continue;
      tutti.push([Math.cos(a) * rCima * 0.95, -0.1 - centro.y, Math.sin(a) * rCima * 0.85 - centro.z, 0.24]);
    }
  }
  const peso = tutti.map((c) => c[3] ** 2);
  const somma = peso.reduce((a, b) => a + b, 0);
  const Rm = ((R[0] + R[1] + R[2]) / 3) * sc;

  const gruppo = new THREE.Group();
  gruppo.position.y = yCima;
  const yOcchi = tr.Y(0.47) - yCima;
  const limiteFronte = fronteLibera ? tr.Y(0.95) - yCima : -99;

  /** Sceglie un punto dove mettere una foglia: { p, n, fuori } o null. */
  const punto = (/** @type {boolean} */ esterno) => {
    let x = r() * somma, k = 0;
    while ((x -= peso[k]) > 0 && k < tutti.length - 1) k++;
    const [cx, cy, cz, rc] = tutti[k];
    const dir = v3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    const p = v3(cx, cy, cz).add(centro).addScaledVector(dir, rc * (0.35 + 0.65 * Math.cbrt(r())));
    if (p.y < yOcchi + 0.3 && p.z > 0.05 && Math.abs(p.x) < 0.45) return null;
    if (p.y < limiteFronte && p.z > 0) return null;
    const daCentro = p.clone().sub(centro);
    const fuori = daCentro.length() / Rm;
    if (fuori < 0.42 && k < nPrincipali) return null;
    if (esterno && fuori < 0.68) return null;
    return { p, dir, daCentro, fuori };
  };

  const m4 = new THREE.Matrix4();
  /** Crea un'istanza di foglie/fiori. */
  const strato = (/** @type {string} */ tipo, /** @type {number} */ n, /** @type {[number, number]} */ dim, /** @type {boolean} */ esterno) => {
    const materiale = materialeFoglie(texFoglia(tipo), centro);
    const mesh = new THREE.InstancedMesh(geoFoglia, materiale, n);
    mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: materiale.map, alphaTest: 0.45 });
    const dati = { luce: new Float32Array(n), t: new Float32Array(n), punti: /** @type {THREE.Vector3[]} */ ([]) };
    let i = 0;
    for (let tent = 0; i < n && tent < n * 5; tent++) {
      const q = punto(esterno);
      if (!q) continue;
      const nrm = q.dir.clone().multiplyScalar(0.5).add(q.daCentro.clone().normalize().multiplyScalar(0.7)).add(v3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.6)).normalize();
      const giu = sp.forma === "piangente" && q.p.y < 0 ? -1.2 : 0.35;
      const punta = nrm.clone().add(v3((r() - 0.5) * 1.2, giu + (r() - 0.5) * 0.8, (r() - 0.5) * 1.2)).normalize();
      const yA = punta.sub(nrm.clone().multiplyScalar(punta.dot(nrm))).normalize();
      const xA = new THREE.Vector3().crossVectors(yA, nrm);
      const s = 0.8 + r() * 0.45;
      m4.makeBasis(xA.multiplyScalar(dim[0] * s), yA.multiplyScalar(dim[1] * s), nrm.clone().multiplyScalar(dim[0] * s));
      m4.setPosition(q.p);
      mesh.setMatrixAt(i, m4);
      dati.luce[i] = THREE.MathUtils.smoothstep(q.fuori, 0.25, 1.0) * 0.55 + THREE.MathUtils.smoothstep(q.p.y - centro.y, -R[1], R[1]) * 0.45;
      dati.t[i] = r();
      dati.punti.push(q.p);
      i++;
    }
    mesh.count = i;
    mesh.userData.totale = i;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
    gruppo.add(mesh);
    return { mesh, dati };
  };

  const foglie = strato(sp.foglia, Math.round(sp.foglie * sc), sp.dim, false);
  const fiori = sp.fiori ? strato(sp.fiori.tipo, sp.fiori.n, [0.15, 0.15], true) : null;

  // frutti sulle foglie più esterne
  /** @type {THREE.InstancedMesh | null} */
  let frutti = null;
  if (sp.frutti) {
    const fr = sp.frutti;
    frutti = new THREE.InstancedMesh(geoFrutto, mat(fr.colore, { roughness: 0.45 }), fr.n);
    let j = 0;
    for (let i = 0; i < foglie.dati.punti.length && j < fr.n; i += 7) {
      const p = foglie.dati.punti[i];
      if (p.clone().sub(centro).length() / Rm < 0.7) continue;
      m4.compose(p.clone().add(v3(0, -0.03, 0)), new THREE.Quaternion(), v3(fr.r, fr.r * (mod.specie === "limone" ? 1.25 : 1), fr.r));
      frutti.setMatrixAt(j++, m4);
    }
    frutti.count = j;
    gruppo.add(frutti);
  }

  // rami nudi: si vedono quando la chioma è spoglia (o rada)
  const rami = new THREE.Group();
  const cort = texCorteccia(sp.corteccia).colori;
  const legno = mat(cort.base, { roughness: 0.85 });
  // rami che si aprono a ventaglio, con una biforcazione ciascuno
  const stretto = sp.forma === "colonna" || sp.forma === "stretta" || sp.forma === "cono";
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.4 + r() * 0.3;
    const out = (stretto ? 0.3 : 0.6) + r() * 0.3;
    const alto = (stretto ? 0.9 : 0.42) + r() * 0.2;
    const mx = Math.cos(a) * out * 0.55, mz = Math.sin(a) * out * 0.55, my = alto * 0.55;
    rami.add(tubo([[0, -0.12, 0], [mx * 0.5, my * 0.45, mz * 0.5], [mx, my, mz], [Math.cos(a) * out, alto, Math.sin(a) * out]], 0.065, 0.012, legno, 10, 6));
    const b = a + (r() < 0.5 ? 0.6 : -0.6);
    rami.add(tubo([[mx, my, mz], [mx + Math.cos(b) * 0.18, my + 0.2, mz + Math.sin(b) * 0.18], [mx + Math.cos(b) * 0.3, my + 0.38, mz + Math.sin(b) * 0.3]], 0.03, 0.008, legno, 6, 5));
  }
  rami.visible = sp.forma === "ombrello"; // il pino marittimo ha il collo sempre a vista
  gruppo.add(rami);

  /** Colori e presenze di stagione. @param {string} stagione */
  function stagione(stagione) {
    const spoglio = !sp.sempreverde && stagione === "inverno";
    /** @type {[string, string]} */
    const pal = /** @type {any} */ (sp)[stagione] ?? (stagione === "primavera" ? [sp.estate[0], sp.estate[1]] : sp.estate);
    const a = new THREE.Color(pal[0]), b = new THREE.Color(pal[1]);
    if (stagione === "primavera" && !sp.primavera) { a.lerp(new THREE.Color("#8fd24e"), 0.25); b.lerp(new THREE.Color("#b8e86a"), 0.25); }
    if (stagione === "inverno" && sp.sempreverde) { a.multiplyScalar(0.85); b.multiplyScalar(0.85); }
    // il tono del modello sposta un poco verso il chiaro o lo scuro
    const tono = 0.85 + mod.tono * 0.3;
    const c = new THREE.Color();
    const fm = foglie.mesh;
    for (let i = 0; i < fm.userData.totale; i++) {
      const t = foglie.dati.t[i];
      c.copy(a).lerp(b, t);
      if (stagione === "autunno" && !sp.sempreverde && sp.autunno && t > 0.8) c.lerp(new THREE.Color("#c03a1c"), 0.5);
      c.multiplyScalar((0.55 + 0.6 * foglie.dati.luce[i]) * tono);
      fm.setColorAt(i, c);
    }
    if (fm.instanceColor) fm.instanceColor.needsUpdate = true;
    const conFiori = fiori && stagione === "primavera";
    fm.count = spoglio ? 0 : stagione === "autunno" && !sp.sempreverde ? Math.round(fm.userData.totale * 0.82) : conFiori ? Math.round(fm.userData.totale * 0.6) : fm.userData.totale;
    if (fiori) {
      fiori.mesh.count = conFiori ? fiori.mesh.userData.totale : 0;
      const w = new THREE.Color();
      for (let i = 0; i < fiori.mesh.userData.totale; i++) { w.setScalar(0.85 + 0.15 * fiori.dati.t[i]); fiori.mesh.setColorAt(i, w); }
      if (fiori.mesh.instanceColor) fiori.mesh.instanceColor.needsUpdate = true;
    }
    if (frutti && sp.frutti) frutti.visible = sp.frutti.stagioni.includes(stagione);
    rami.visible = spoglio || sp.forma === "ombrello";
  }

  return { gruppo, centro, R, yMax: yCima + centro.y + R[1] * sc, zFronte: tr.superficie(0, yCima - 0.1).punto.z, stagione };
}

// ------------------------------------------------------------------ Corpo
/** @param {number} lato @param {ReturnType<typeof profiloTronco>} tr @param {THREE.Material} corteccia @param {THREE.Texture} foglia @param {THREE.Color} tinta */
function braccio(lato, tr, corteccia, foglia, tinta) {
  const y = tr.Y(0.42);
  const perno = new THREE.Group();
  perno.position.set(lato * tr.raggio(y) * 0.9, y, 0.02);
  perno.add(tubo([[0, 0, 0], [lato * 0.28, -0.1, 0.05], [lato * 0.5, -0.03, 0.1], [lato * 0.62, 0.13, 0.12]], 0.075, 0.045, corteccia));
  perno.add(tubo([[lato * 0.36, -0.08, 0.08], [lato * 0.42, 0.06, 0.05], [lato * 0.38, 0.16, 0.03]], 0.028, 0.014, corteccia, 8, 6));
  const mf = new THREE.MeshLambertMaterial({ map: foglia, alphaTest: 0.45, side: THREE.DoubleSide, color: tinta });
  const fogliolina = (/** @type {number} */ x, /** @type {number} */ y2, /** @type {number} */ z, /** @type {number} */ ang, s = 1) => {
    const f = new THREE.Mesh(geoFoglia, mf);
    f.scale.set(0.13 * s, 0.17 * s, 0.13 * s);
    f.position.set(x, y2, z);
    f.rotation.set(-0.3, 0, ang);
    return f;
  };
  perno.add(fogliolina(lato * 0.38, 0.15, 0.03, -lato * 0.4, 0.9));
  const mano = new THREE.Group();
  mano.position.set(lato * 0.64, 0.16, 0.13);
  mano.add(ovale(0.06, 0.055, 0.055, corteccia));
  mano.add(fogliolina(0, 0.03, 0.02, -lato * 0.5), fogliolina(lato * 0.02, 0.04, 0.0, -lato * 1.2, 0.85), fogliolina(-lato * 0.01, 0.04, 0.02, lato * 0.2, 0.8));
  perno.add(mano);
  return { perno, mano, foglieMano: mf };
}

/** Gamba con il perno all'anca: ruota in avanti/indietro per camminare, sedersi, scalciare. @param {number} lato @param {number} larg @param {THREE.Material} scura */
function gamba(lato, larg, scura) {
  const anca = new THREE.Group();
  const x = lato * 0.19 * larg;
  anca.position.set(x * 0.85, 0.4, 0);
  anca.add(tubo([[0, 0, 0], [x * 0.15, -0.18, 0.02], [x * 0.2, -0.3, 0.05]], 0.075, 0.07, scura, 10, 8));
  const piede = new THREE.Group();
  piede.position.set(x * 0.2, -0.325, 0.09);
  piede.add(ovale(0.15, 0.085, 0.2, scura));
  for (const d of [-1, 0, 1]) {
    const dito = ovale(0.04, 0.035, 0.05, scura, true);
    dito.position.set(d * 0.075, -0.035, 0.17);
    piede.add(dito);
  }
  anca.add(piede);
  return { anca, piede };
}

// ------------------------------------------------------------------ Accessori
/** Gli accessori della strada. @param {string} strada */
function accessori(strada, /** @type {any} */ ctx) {
  const { tr, ancore, ch, mani } = ctx;
  const sulTronco = new THREE.Group();
  const inTesta = new THREE.Group();
  inTesta.position.y = -ch.gruppo.position.y;
  ch.gruppo.add(inTesta);
  if (strada === "filosofo") {
    const tartaruga = mat("#4a2c1a", { roughness: 0.35 });
    const vetro = new THREE.MeshPhysicalMaterial({ color: "#cfe6f0", transparent: true, opacity: 0.28, roughness: 0.05, clearcoat: 1 });
    const R = 0.105;
    /** @type {THREE.Vector3[]} */
    const centri = [];
    for (const a of ancore) {
      const q = new THREE.Group();
      q.position.copy(a.position).addScaledVector(a.getWorldDirection(v3(0, 0, 0)), 0.075);
      q.quaternion.copy(a.quaternion);
      q.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.014, 8, 28), tartaruga), new THREE.Mesh(new THREE.CircleGeometry(R, 28), vetro));
      sulTronco.add(q);
      centri.push(q.position.clone());
    }
    const [a, b] = centri;
    sulTronco.add(tubo([[a.x + R * 0.9, a.y + 0.01, a.z], [0, a.y + 0.035, a.z + 0.02], [b.x - R * 0.9, b.y + 0.01, b.z]], 0.011, 0.011, tartaruga, 8, 6));
    for (const [c, s] of /** @type {[THREE.Vector3, number][]} */ ([[a, -1], [b, 1]])) {
      const l = tr.superficie(s * 0.42, c.y);
      sulTronco.add(tubo([[c.x + s * R, c.y, c.z - 0.02], [l.punto.x + s * 0.03, c.y + 0.01, l.punto.z * 0.6], [l.punto.x + s * 0.02, c.y - 0.02, -0.15]], 0.01, 0.01, tartaruga, 8, 6));
    }
  }
  if (strada === "viaggiatore") {
    const yG = tr.Y(0.77);
    const ottone = mat("#b98a3a", { metalness: 0.75, roughness: 0.28 });
    const lente = new THREE.MeshPhysicalMaterial({ color: "#a9c9d4", metalness: 0.7, roughness: 0.08, clearcoat: 1 });
    /** @type {THREE.Vector3[]} */
    const centri = [];
    for (const s of [-1, 1]) {
      const q = tr.posa(new THREE.Group(), s * 0.12, yG, 0.012);
      q.rotateX(-0.3);
      const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.05, 20), ottone);
      corpo.rotation.x = Math.PI / 2;
      corpo.position.z = 0.02;
      const bordo = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 8, 20), ottone);
      bordo.position.z = 0.046;
      const vetroL = new THREE.Mesh(new THREE.CircleGeometry(0.058, 20), lente);
      vetroL.position.z = 0.047;
      const riflesso = ovale(0.04, 0.012, 0.003, new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.75 }), true);
      riflesso.rotation.z = 0.6;
      riflesso.position.set(0.012, 0.018, 0.05);
      q.add(corpo, bordo, vetroL, riflesso);
      sulTronco.add(q);
      centri.push(q.position.clone());
    }
    const [a, b] = centri;
    sulTronco.add(tubo([[a.x + 0.07, a.y, a.z + 0.02], [0, a.y + 0.01, a.z + 0.04], [b.x - 0.07, b.y, b.z + 0.02]], 0.014, 0.014, mat("#5a3a22"), 8, 6));
    sulTronco.add(fascia(tr, 0.755, 0.785, mat("#5a3a22", { roughness: 0.6 }), 0.012));
    // zaino
    const tela = mat("#8a5a2a", { roughness: 0.8 });
    const scuro = mat("#5e3c1c", { roughness: 0.8 });
    const yZ = tr.Y(0.5);
    const dietro = tr.raggio(yZ) * SCHIACCIA;
    const z1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.22, 6, 16), tela);
    z1.scale.set(1.15, 1, 0.6);
    z1.position.set(0, yZ, -dietro - 0.1);
    const rotolo = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.56, 16), mat("#c9b48a", { roughness: 0.9 }));
    rotolo.rotation.z = Math.PI / 2;
    rotolo.position.set(0, yZ + 0.34, -dietro - 0.1);
    sulTronco.add(z1, rotolo);
    for (const s of [-1, 1]) {
      const y2 = tr.Y(0.78), r2 = tr.raggio(y2);
      sulTronco.add(tubo([[s * 0.2, y2, -r2 * 0.7], [s * r2 * 1.02, tr.Y(0.7), 0], [s * tr.raggio(tr.Y(0.38)) * 0.96, tr.Y(0.38), 0.2]], 0.026, 0.026, scuro, 14, 6));
    }
  }
  if (strada === "artista") {
    const basco = ovale(0.4, 0.13, 0.4, mat("#8e2a3a", { roughness: 0.85 }));
    basco.position.set(0.06, ch.yMax - 0.04, -0.04);
    basco.rotation.z = -0.25;
    const picciolo = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.07, 8), mat("#6e1f2c"));
    picciolo.position.set(0.03, ch.yMax + 0.1, -0.04);
    inTesta.add(basco, picciolo);
    const p = new THREE.Group();
    p.add(tubo([[0, -0.08, 0], [0, 0.22, 0]], 0.018, 0.014, mat("#c99a5a", { roughness: 0.5 }), 4, 8));
    const ghiera = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.06, 12), mat("#cfd3d6", { metalness: 0.8, roughness: 0.25 }));
    ghiera.position.y = 0.25;
    p.add(ghiera);
    p.add(tubo([[0, 0.28, 0], [0, 0.34, 0], [0.01, 0.4, 0]], 0.02, 0.004, mat("#3a7bd5", { roughness: 0.4 }), 8, 8));
    p.rotation.z = 0.35;
    p.position.set(0, 0, 0.05);
    p.name = "pennello-strada";
    mani[0].add(p);
  }
  if (strada === "sportivo") {
    sulTronco.add(fascia(tr, 0.8, 0.92, mat("#c8382a", { roughness: 0.75 })));
    sulTronco.add(fascia(tr, 0.845, 0.875, mat("#f4ead6", { roughness: 0.75 }), 0.03));
  }
  if (strada === "furfante") {
    const t = texStoffa("pallini", "#b8322a", "#f4ead6").clone();
    t.repeat.set(5, 1);
    t.needsUpdate = true;
    const stoffa = mat("#ffffff", { map: t, roughness: 0.8 });
    sulTronco.add(fascia(tr, 0.78, 0.94, stoffa, 0.024));
    const y = tr.Y(0.86), r = tr.raggio(y);
    const nodo = ovale(0.07, 0.06, 0.06, stoffa);
    nodo.position.set(r * 0.86, y, -r * 0.42);
    sulTronco.add(nodo);
    sulTronco.add(tubo([[r * 0.9, y, -r * 0.45], [r * 1.05, y - 0.12, -r * 0.5], [r * 1.0, y - 0.26, -r * 0.62]], 0.045, 0.012, stoffa, 10, 6));
    sulTronco.add(tubo([[r * 0.9, y, -r * 0.45], [r * 1.1, y - 0.06, -r * 0.3], [r * 1.16, y - 0.2, -r * 0.24]], 0.04, 0.012, stoffa, 10, 6));
  }
  if (strada === "imprenditore") {
    const tt = texStoffa("righe", "#24427a", "#d9b44a").clone();
    tt.repeat.set(1, 3); tt.rotation = 0.7; tt.needsUpdate = true;
    const blu = mat("#ffffff", { map: tt, roughness: 0.6 });
    const nodo = tr.posa(ovale(0.075, 0.068, 0.045, blu), 0, tr.Y(0.25), 0.01);
    const forma = new THREE.Shape();
    forma.moveTo(-0.03, 0); forma.lineTo(0.03, 0); forma.lineTo(0.065, -0.24); forma.lineTo(0, -0.3); forma.lineTo(-0.065, -0.24); forma.closePath();
    const lama = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: 0.018, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2 }), blu);
    const s = tr.superficie(0, tr.Y(0.16));
    lama.position.set(0, tr.Y(0.25), s.punto.z + 0.012);
    lama.rotation.x = -0.12;
    lama.scale.setScalar(1.5);
    sulTronco.add(nodo, lama);
  }
  if (strada === "poeta") {
    const t = texStoffa("righe", "#3a5aa8", "#f2eee2").clone();
    t.repeat.set(1, 6); t.rotation = Math.PI / 2; t.needsUpdate = true;
    const stoffa = mat("#ffffff", { map: t, roughness: 0.9 });
    const base = v3(-0.05, ch.yMax - 0.22, -0.06);
    const pts = [[0, 0, 0], [0.02, 0.32, 0], [0.16, 0.52, 0.02], [0.4, 0.48, 0.06], [0.54, 0.28, 0.1]].map(([x, y, z]) => [x + base.x, y + base.y, z + base.z]);
    inTesta.add(tubo(pts, 0.36, 0.035, stoffa, 28, 16));
    const pon = ovale(0.085, 0.085, 0.085, mat("#f7f4ec", { roughness: 1 }), true);
    pon.position.set(pts[4][0], pts[4][1] - 0.06, pts[4][2]);
    const risvolto = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.06, 10, 36), mat("#f2eee2", { roughness: 1 }));
    risvolto.rotation.x = Math.PI / 2;
    risvolto.position.copy(base).add(v3(0, 0.02, 0));
    inTesta.add(pon, risvolto);
  }
  return sulTronco;
}

// ------------------------------------------------------------------ Effetti
/** Piccoli simboli che salgono sopra la testa: cuori, zzz, note, punti esclamativi. */
function creaEffetti(/** @type {number} */ altezza) {
  const gruppo = new THREE.Group();
  /** @type {{ s: THREE.Sprite, t: number, durata: number, dx: number }[]} */
  const vivi = [];
  /** @type {Record<string, () => THREE.Texture>} */
  const TEX = {
    cuore: texCuore,
    zzz: () => texSimbolo("z", "#5a6fb8"),
    nota: () => texSimbolo("♪", "#2f8a3a"),
    "!": () => texSimbolo("!", "#e09a10"),
    "?": () => texSimbolo("?", "#3a7ad0"),
    goccia: () => texSimbolo("•", "#6ab4f0"),
    stella: () => texSimbolo("★", "#f0b820"),
  };
  return {
    gruppo,
    /** @param {string} tipo @param {number} [quanti] */
    emetti(tipo, quanti = 1) {
      for (let i = 0; i < quanti; i++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: (TEX[tipo] ?? TEX["!"])(), transparent: true, depthWrite: false }));
        s.position.set((Math.random() - 0.5) * 0.5 + 0.25, altezza * 0.8 + Math.random() * 0.2, 0.3);
        s.scale.setScalar(0.01);
        gruppo.add(s);
        vivi.push({ s, t: -i * 0.25, durata: tipo === "zzz" ? 2.4 : 1.6, dx: (Math.random() - 0.3) * 0.4 });
      }
    },
    /** @param {number} dt */
    aggiorna(dt) {
      for (let i = vivi.length - 1; i >= 0; i--) {
        const v = vivi[i];
        v.t += dt;
        if (v.t < 0) continue;
        const f = v.t / v.durata;
        v.s.position.y += dt * 0.45;
        v.s.position.x += dt * v.dx;
        v.s.scale.setScalar(0.22 * Math.min(1, f * 4) * (1 + f * 0.4));
        /** @type {THREE.SpriteMaterial} */ (v.s.material).opacity = Math.min(1, (1 - f) * 2.5);
        if (f >= 1) { gruppo.remove(v.s); v.s.material.dispose(); vivi.splice(i, 1); }
      }
    },
  };
}

// ------------------------------------------------------------------ L'albero
/**
 * @typedef {Object} OpzioniAlbero
 * @property {string} [seme]
 * @property {string} [strada] filosofo, imprenditore, artista, sportivo, furfante, viaggiatore, poeta
 * @property {number} [giorni] età: da germoglio ad adulto in 90 giorni
 */

/**
 * Costruisce un albero-personaggio.
 * @param {import("./modelli.js").Modello} mod
 * @param {OpzioniAlbero} [op]
 */
export function creaAlbero(mod, op = {}) {
  const sp = SPECIE[mod.specie];
  const r = generatore(hash(`foglie:${op.seme ?? mod.id}:${mod.id}`));
  const tr = profiloTronco(mod.larghezza, mod.altezza);

  const radice = new THREE.Group(); // posizione nella radura, giro
  const scala = new THREE.Group(); // crescita
  const corpo = new THREE.Group(); // si piega, saltella
  radice.add(scala);
  scala.add(corpo);

  const { map, bump, colori } = texCorteccia(sp.corteccia);
  const ripeti = (/** @type {THREE.Texture} */ t, /** @type {number} */ x, /** @type {number} */ y) => { const c = t.clone(); c.repeat.set(x, y); c.needsUpdate = true; return c; };
  const corteccia = new THREE.MeshStandardMaterial({ map: ripeti(map, 2, 1.4), bumpMap: ripeti(bump, 2, 1.4), bumpScale: 3, roughness: 0.82 });
  const corteccia2 = new THREE.MeshStandardMaterial({ map: ripeti(map, 0.5, 2), bumpMap: ripeti(bump, 0.5, 2), bumpScale: 1.5, roughness: 0.85 });
  const scura = mat(sp.corteccia === "betulla" ? "#6e6458" : colori.scuro, { roughness: 0.85 });

  const geoT = new THREE.LatheGeometry(tr.campioni, 40);
  geoT.scale(1, 1, SCHIACCIA);
  const busto = new THREE.Mesh(geoT, corteccia);
  corpo.add(busto);

  const gambe = [gamba(-1, mod.larghezza, scura), gamba(1, mod.larghezza, scura)];
  gambe.forEach((g) => scala.add(g.anca));

  const fronteLibera = ["sportivo", "furfante", "viaggiatore"].includes(op.strada ?? "");
  const ch = chioma(mod, tr, r, fronteLibera);
  corpo.add(ch.gruppo);
  ch.gruppo.userData.y0 = ch.gruppo.position.y;

  const viso = creaViso(tr, { larghezza: mod.larghezza, occhi: mod.occhi, distanza: mod.distanza, lentiggini: mod.lentiggini, sopracciglia: mod.sopracciglia, scuro: sp.corteccia === "betulla" ? "#4a3a2c" : colori.scuro });
  corpo.add(viso.gruppo);

  const tinta = new THREE.Color(sp.estate[1]);
  const bracci = [braccio(-1, tr, corteccia2, texFoglia(sp.foglia), tinta), braccio(1, tr, corteccia2, texFoglia(sp.foglia), tinta)];
  bracci.forEach((b) => corpo.add(b.perno));

  corpo.updateMatrixWorld(true);
  corpo.add(accessori(op.strada ?? "", { tr, ancore: viso.ancore, ch, mani: bracci.map((b) => b.mano) }));

  const effetti = creaEffetti(ch.yMax);
  corpo.add(effetti.gruppo);

  // bersaglio invisibile per i clic (più leggero delle foglie)
  const alto = ch.yMax;
  const bersaglio = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.55, alto, 12), new THREE.MeshBasicMaterial({ visible: false }));
  bersaglio.position.y = alto / 2;
  corpo.add(bersaglio);

  radice.traverse((o) => {
    // niente ombra proiettata: l'albero si muove e le ombre del bosco sono precalcolate;
    // sotto i piedi c'è un'ombra di contatto che lo segue
    if (/** @type {THREE.Mesh} */ (o).isMesh && o !== bersaglio) { o.castShadow = false; o.receiveShadow = true; }
  });

  /** @param {number} [giorni] */
  const cresci = (giorni) => {
    const c = giorni === undefined ? 1 : THREE.MathUtils.clamp(giorni / 90, 0, 1);
    scala.scale.setScalar(0.62 + 0.38 * c);
  };
  cresci(op.giorni);

  return {
    modello: mod,
    radice, scala, corpo, busto,
    chioma: ch.gruppo,
    bracci: bracci.map((b) => b.perno),
    mani: bracci.map((b) => b.mano),
    gambe: gambe.map((g) => g.anca),
    viso, effetti, bersaglio,
    altezza: alto,
    /** @param {string} s */
    stagione: (s) => {
      ch.stagione(s);
      const spoglio = !sp.sempreverde && s === "inverno";
      // d'inverno le mani-foglia diventano secche
      const c = new THREE.Color(spoglio ? "#a07a4a" : /** @type {any} */ (sp)[s]?.[1] ?? sp.estate[1]);
      bracci.forEach((b) => b.foglieMano.color.copy(c));
    },
    cresci,
  };
}
