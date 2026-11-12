// Il bosco di contorno nello stile dei personaggi (senza visi): alberi con il
// tronco tondo di corteccia e la chioma fatta di un nucleo morbido più un guscio
// di foglie vere in istanze; cespugli e felci di foglie; rocce arrotondate con il
// muschio sopra. Pochi oggetti da disegnare: ogni tipo è una sola InstancedMesh.
// I colori seguono le stagioni come per i personaggi; la neve si posa sopra.
import * as THREE from "three";
import { UNIFORMI } from "./albero.js";
import { SPECIE } from "./modelli.js";
import { texCorteccia, texFoglia } from "./texture.js";

/** Le specie degli alberi di sfondo, con la forma della chioma. */
const SFONDO = [
  { specie: "quercia", forma: "tonda", peso: 3 },
  { specie: "faggio", forma: "tonda", peso: 2 },
  { specie: "betulla", forma: "ovale", peso: 2 },
  { specie: "acero", forma: "tonda", peso: 2 },
  { specie: "abete", forma: "cono", peso: 3 },
  { specie: "pino-marittimo", forma: "cono", peso: 1 },
];
/** Tinta del tronco per specie (moltiplica la corteccia chiara). */
const TRONCO = { quercia: "#7a5236", faggio: "#8a7a68", betulla: "#ece6d8", acero: "#7a6a58", abete: "#5a3a26", "pino-marittimo": "#7a4a2e" };

/** Foglia piegata, con il picciolo all'origine (come quella dei personaggi). */
const geoFoglia = (() => {
  const g = new THREE.PlaneGeometry(1, 1, 1, 3);
  g.translate(0, 0.5, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, -0.2 * y * y + 0.1 * x * x); }
  g.computeVertexNormals();
  return g;
})();

/**
 * Materiale delle foglie del bosco: luce morbida «a palla» intorno al centro della
 * sua chioma (attributo per istanza), fruscio del vento, neve sopra.
 * @param {THREE.Texture} map
 */
function materialeFoglie(map) {
  const m = new THREE.MeshLambertMaterial({ map, alphaTest: 0.45, side: THREE.DoubleSide });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTempo = UNIFORMI.uTempo;
    s.uniforms.uNeve = UNIFORMI.uNeve;
    s.uniforms.uVento = UNIFORMI.uVento;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec3 aCentro;\nuniform float uTempo;\nuniform float uVento;\nvarying float vSu;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float fase = dot(instanceMatrix[3].xyz, vec3(0.7, 0.5, 0.3));
        transformed.z += sin(uTempo * 1.8 * uVento + fase) * 0.08 * uVento * position.y;`,
      )
      .replace(
        "#include <defaultnormal_vertex>",
        `#include <defaultnormal_vertex>
        vec3 radiale = normalize(instanceMatrix[3].xyz - aCentro + vec3(0.0, 0.3, 0.0));
        vSu = radiale.y;
        transformedNormal = normalize(normalMatrix * radiale);`,
      );
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uNeve;\nvarying float vSu;")
      .replace("#include <normal_fragment_begin>", "#include <normal_fragment_begin>\nnormal = normalize(vNormal);")
      .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.97, 1.0), uNeve * smoothstep(0.2, 0.7, vSu));");
  };
  m.customProgramCacheKey = () => "foglie-bosco";
  return m;
}

/** Materiale morbido e opaco (nuclei delle chiome, rocce): neve sopra, muschio facoltativo. @param {boolean} muschio */
function materialeMorbido(muschio) {
  const m = new THREE.MeshLambertMaterial({ color: "#ffffff" });
  m.onBeforeCompile = (s) => {
    s.uniforms.uNeve = UNIFORMI.uNeve;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vSu;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSu = normalize(mat3(instanceMatrix) * objectNormal).y;");
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uNeve;\nvarying float vSu;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        ${muschio ? "diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.30, 0.52, 0.18), smoothstep(0.45, 0.85, vSu) * (1.0 - uNeve));" : ""}
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.97, 1.0), uNeve * smoothstep(0.35, 0.8, vSu));`,
      );
  };
  m.customProgramCacheKey = () => `morbido-${muschio}`;
  return m;
}

/** Sfera bitorzoluta e liscia (rocce, nuclei): un po' di rumore, normali morbide. @param {number} seme */
function sferaMorbida(seme, segmenti = 14) {
  const g = new THREE.SphereGeometry(1, segmenti, Math.round(segmenti * 0.7));
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const d = 1 + 0.08 * Math.sin(v.x * 3.1 + seme) * Math.sin(v.y * 2.7 + seme * 2) + 0.06 * Math.sin(v.z * 4.3 - seme);
    p.setXYZ(i, v.x * d, v.y * d, v.z * d);
  }
  g.computeVertexNormals();
  return g;
}

/**
 * @typedef {{ x: number, z: number, h: number, rot: number }} Posto
 * @param {THREE.Scene} scena
 * @param {{ rng: () => number, quota: (x: number, z: number) => number, alberi: Posto[], cespugli: Posto[], felci: Posto[], rocce: Posto[] }} op
 */
export function creaBoscoMorbido(scena, op) {
  const { rng, quota } = op;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), su = new THREE.Vector3(0, 1, 0);
  const sceglie = () => {
    let x = rng() * SFONDO.reduce((s, t) => s + t.peso, 0);
    for (const t of SFONDO) { x -= t.peso; if (x <= 0) return t; }
    return SFONDO[0];
  };

  // ---------------------------------------------------------------- Alberi
  const alberi = op.alberi.map((p) => ({ ...p, tipo: sceglie(), y: quota(p.x, p.z) - 0.05, t: rng() }));
  const corteccia = texCorteccia("chiara");
  const tronchi = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.62, 1, 1, 12, 1, true).translate(0, 0.5, 0),
    new THREE.MeshLambertMaterial({ map: corteccia.map }),
    alberi.length,
  );
  const sfera = sferaMorbida(1, 16);
  const cono = new THREE.ConeGeometry(1, 1, 24, 4).translate(0, 0.5, 0);
  const nucleiTondi = new THREE.InstancedMesh(sfera, materialeMorbido(false), alberi.length);
  const nucleiConi = new THREE.InstancedMesh(cono, materialeMorbido(false), alberi.length);
  /** Foglie raggruppate per texture. @type {Map<string, { posti: { m: THREE.Matrix4, c: THREE.Vector3, albero: number, t: number }[] }>} */
  const perFoglia = new Map();
  let nT = 0, nC = 0;
  /** @type {{ i: number, mesh: THREE.InstancedMesh, tipo: typeof SFONDO[number], t: number, m: THREE.Matrix4 }[]} */
  const nuclei = [];

  alberi.forEach((a, i) => {
    const h = a.h;
    const conico = a.tipo.forma === "cono";
    const fusto = conico ? h * 0.22 : h * 0.42; // la chioma dei pini parte presto
    const rT = h * 0.045;
    m4.compose(v.set(a.x, a.y, a.z), q.setFromAxisAngle(su, a.rot), new THREE.Vector3(rT, fusto + h * 0.15, rT));
    tronchi.setMatrixAt(i, m4);
    tronchi.setColorAt(i, new THREE.Color(TRONCO[/** @type {keyof typeof TRONCO} */ (a.tipo.specie)] ?? "#8a6040"));
    // nucleo della chioma
    const R = conico ? h * 0.24 : a.tipo.forma === "ovale" ? h * 0.22 : h * 0.3;
    const altoC = conico ? h - fusto : a.tipo.forma === "ovale" ? R * 1.5 : R * 0.95;
    const centro = new THREE.Vector3(a.x, a.y + fusto + (conico ? 0 : altoC), a.z);
    if (conico) {
      m4.compose(centro, q, new THREE.Vector3(R, altoC, R));
      nucleiConi.setMatrixAt(nC, m4);
      nuclei.push({ i: nC++, mesh: nucleiConi, tipo: a.tipo, t: a.t, m: m4.clone() });
    } else {
      m4.compose(centro, q.setFromAxisAngle(su, a.rot), new THREE.Vector3(R, altoC, R * 0.95));
      nucleiTondi.setMatrixAt(nT, m4);
      nuclei.push({ i: nT++, mesh: nucleiTondi, tipo: a.tipo, t: a.t, m: m4.clone() });
    }
    // guscio di foglie sulla superficie del nucleo
    const sp = SPECIE[a.tipo.specie];
    const lista = perFoglia.get(sp.foglia) ?? { posti: [] };
    perFoglia.set(sp.foglia, lista);
    // meno foglie (e più grandi) sugli alberi lontani: la nebbia e gli altri alberi li coprono
    const lontano = Math.hypot(a.x, a.z) > 17;
    const n = lontano ? 70 : conico ? 140 : 130;
    const misura = (conico ? h * 0.075 : h * 0.09) * (lontano ? 1.35 : 1);
    const centroLuce = conico ? centro.clone().add(new THREE.Vector3(0, altoC * 0.4, 0)) : centro;
    for (let k = 0; k < n; k++) {
      // un punto sulla superficie (sfera schiacciata o cono)
      let p;
      if (conico) {
        const f = Math.pow(rng(), 0.8), ang = rng() * Math.PI * 2;
        const r = R * (1 - f) * 1.04;
        p = new THREE.Vector3(Math.cos(ang) * r, altoC * f, Math.sin(ang) * r).add(centro);
      } else {
        const d = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize();
        p = new THREE.Vector3(d.x * R, d.y * altoC, d.z * R * 0.95).multiplyScalar(1.02 + rng() * 0.08).add(centro);
      }
      const nrm = p.clone().sub(centroLuce).normalize().add(new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(0.7)).normalize();
      const punta = nrm.clone().add(new THREE.Vector3((rng() - 0.5) * 1.2, conico ? -0.6 : 0.3, (rng() - 0.5) * 1.2)).normalize();
      const yA = punta.sub(nrm.clone().multiplyScalar(punta.dot(nrm))).normalize();
      const xA = new THREE.Vector3().crossVectors(yA, nrm);
      const s = misura * (0.8 + rng() * 0.5);
      const m = new THREE.Matrix4().makeBasis(xA.multiplyScalar(s * (sp.dim[0] / sp.dim[1]) * 1.3), yA.multiplyScalar(s * 1.3), nrm.clone().multiplyScalar(s));
      m.setPosition(p);
      lista.posti.push({ m, c: centroLuce, albero: i, t: rng() });
    }
  });
  nucleiTondi.count = nT;
  nucleiConi.count = nC;

  /** @type {{ mesh: THREE.InstancedMesh, posti: { m: THREE.Matrix4, c: THREE.Vector3, albero: number, t: number }[] }[]} */
  const foglie = [];
  for (const [tipo, { posti }] of perFoglia) {
    const geo = geoFoglia.clone();
    const centri = new Float32Array(posti.length * 3);
    posti.forEach((p, k) => centri.set([p.c.x, p.c.y, p.c.z], k * 3));
    geo.setAttribute("aCentro", new THREE.InstancedBufferAttribute(centri, 3));
    const mat = materialeFoglie(texFoglia(tipo));
    const mesh = new THREE.InstancedMesh(geo, mat, posti.length);
    mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: mat.map, alphaTest: 0.45 });
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(posti.length * 3), 3);
    posti.forEach((p, k) => mesh.setMatrixAt(k, p.m));
    foglie.push({ mesh, posti });
  }

  // ---------------------------------------------------------------- Cespugli, felci, rocce
  const geoCesp = sferaMorbida(3, 12);
  const cespugli = new THREE.InstancedMesh(geoCesp, materialeMorbido(false), op.cespugli.length * 2);
  const foglieCesp = { posti: /** @type {{ m: THREE.Matrix4, c: THREE.Vector3, albero: number, t: number }[]} */ ([]) };
  let nb = 0;
  for (const c of op.cespugli) {
    const y = quota(c.x, c.z);
    for (let k = 0; k < 2; k++) {
      const off = k ? new THREE.Vector3((rng() - 0.5) * c.h, 0, (rng() - 0.5) * c.h * 0.6) : new THREE.Vector3();
      const r = c.h * (k ? 0.45 : 0.6);
      const centro = new THREE.Vector3(c.x, y + r * 0.6, c.z).add(off);
      m4.compose(centro, q.setFromAxisAngle(su, rng() * 6.28), new THREE.Vector3(r, r * 0.8, r));
      cespugli.setMatrixAt(nb++, m4);
      for (let j = 0; j < 12; j++) {
        const d = new THREE.Vector3(rng() - 0.5, rng() * 0.8, rng() - 0.5).normalize();
        const p = d.clone().multiply(new THREE.Vector3(r, r * 0.8, r)).multiplyScalar(1.03).add(centro);
        const nrm = d.clone().add(new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(0.6)).normalize();
        const punta = nrm.clone().add(new THREE.Vector3(rng() - 0.5, 0.4, rng() - 0.5)).normalize();
        const yA = punta.sub(nrm.clone().multiplyScalar(punta.dot(nrm))).normalize();
        const xA = new THREE.Vector3().crossVectors(yA, nrm);
        const s = r * 0.42;
        const m = new THREE.Matrix4().makeBasis(xA.multiplyScalar(s * 0.85), yA.multiplyScalar(s * 1.1), nrm.clone().multiplyScalar(s));
        m.setPosition(p);
        foglieCesp.posti.push({ m, c: centro, albero: -1, t: rng() });
      }
    }
  }
  cespugli.count = nb;
  // le foglie dei cespugli usano la foglia della quercia
  {
    const geo = geoFoglia.clone();
    const centri = new Float32Array(foglieCesp.posti.length * 3);
    foglieCesp.posti.forEach((p, k) => centri.set([p.c.x, p.c.y, p.c.z], k * 3));
    geo.setAttribute("aCentro", new THREE.InstancedBufferAttribute(centri, 3));
    const mat = materialeFoglie(texFoglia("ovale"));
    const mesh = new THREE.InstancedMesh(geo, mat, foglieCesp.posti.length);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(foglieCesp.posti.length * 3), 3);
    foglieCesp.posti.forEach((p, k) => mesh.setMatrixAt(k, p.m));
    foglie.push({ mesh, posti: foglieCesp.posti });
  }

  // felci: fronde lunghe che si aprono a raggiera e ricadono
  const fronde = [];
  for (const f of op.felci) {
    const y = quota(f.x, f.z);
    const n = 7;
    for (let k = 0; k < n; k++) {
      const ang = (k / n) * Math.PI * 2 + rng() * 0.4;
      const fuori = new THREE.Vector3(Math.cos(ang), 0.9 + rng() * 0.4, Math.sin(ang)).normalize();
      const nrm = new THREE.Vector3(-Math.cos(ang) * 0.4, 1, -Math.sin(ang) * 0.4).normalize();
      const yA = fuori.sub(nrm.clone().multiplyScalar(fuori.dot(nrm))).normalize();
      const xA = new THREE.Vector3().crossVectors(yA, nrm);
      const s = f.h * (0.85 + rng() * 0.3);
      const m = new THREE.Matrix4().makeBasis(xA.multiplyScalar(s * 0.3), yA.multiplyScalar(s * 1.1), nrm.clone().multiplyScalar(s * 0.5));
      m.setPosition(f.x, y + 0.02, f.z);
      fronde.push({ m, c: new THREE.Vector3(f.x, y - 0.5, f.z), albero: -1, t: rng() });
    }
  }
  {
    const geo = geoFoglia.clone();
    const centri = new Float32Array(fronde.length * 3);
    fronde.forEach((p, k) => centri.set([p.c.x, p.c.y, p.c.z], k * 3));
    geo.setAttribute("aCentro", new THREE.InstancedBufferAttribute(centri, 3));
    const mat = materialeFoglie(texFoglia("castagno"));
    const mesh = new THREE.InstancedMesh(geo, mat, fronde.length);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(fronde.length * 3), 3);
    fronde.forEach((p, k) => mesh.setMatrixAt(k, p.m));
    foglie.push({ mesh, posti: fronde });
  }

  // rocce arrotondate, con il muschio sopra
  const rocce = new THREE.InstancedMesh(sferaMorbida(7, 12), materialeMorbido(true), op.rocce.length);
  op.rocce.forEach((r, k) => {
    const y = quota(r.x, r.z);
    m4.compose(new THREE.Vector3(r.x, y + r.h * 0.25, r.z), q.setFromEuler(new THREE.Euler(rng() * 0.3, r.rot, rng() * 0.3)), new THREE.Vector3(r.h * (1.1 + rng() * 0.4), r.h * 0.7, r.h * (0.9 + rng() * 0.3)));
    rocce.setMatrixAt(k, m4);
    rocce.setColorAt(k, new THREE.Color("#8a908a").multiplyScalar(0.85 + rng() * 0.25));
  });

  const tutti = [tronchi, nucleiTondi, nucleiConi, cespugli, rocce, ...foglie.map((f) => f.mesh)];
  for (const m of tutti) { m.castShadow = true; m.receiveShadow = true; scena.add(m); }
  // le foglie e i nuclei del bosco non ricevono ombre: costerebbe molto e non si vedrebbe
  for (const m of [nucleiTondi, nucleiConi, ...foglie.map((f) => f.mesh)]) m.receiveShadow = false;
  for (const f of foglie.slice(-2)) f.mesh.castShadow = false; // felci e foglie dei cespugli: ombra inutile

  /** Colori di stagione, come per i personaggi. @param {string} stagione */
  function stagione(stagione) {
    const c = new THREE.Color(), a = new THREE.Color(), b = new THREE.Color();
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    /** @param {string} specie */
    const palette = (specie) => {
      const sp = SPECIE[specie];
      const pal = /** @type {any} */ (sp)[stagione] ?? sp.estate;
      a.set(pal[0]); b.set(pal[1]);
      if (stagione === "primavera" && !sp.primavera) { a.lerp(new THREE.Color("#8fd24e"), 0.25); b.lerp(new THREE.Color("#b8e86a"), 0.25); }
      return sp;
    };
    // foglie degli alberi (le ultime due liste sono cespugli e felci)
    foglie.forEach((f, idx) => {
      const sottobosco = idx >= foglie.length - 2;
      f.posti.forEach((p, k) => {
        const tipo = sottobosco ? null : alberi[p.albero].tipo;
        const sp = palette(tipo ? tipo.specie : "quercia");
        const spoglio = stagione === "inverno" && !sp.sempreverde;
        if (sottobosco) {
          a.set(stagione === "autunno" ? "#7a9a34" : stagione === "inverno" ? "#5e7a4a" : "#3f9a34");
          b.set(stagione === "autunno" ? "#c8a040" : stagione === "inverno" ? "#7a9068" : "#7ec84a");
        }
        c.copy(a).lerp(b, p.t);
        if (stagione === "autunno" && !sp.sempreverde && p.t > 0.8) c.lerp(new THREE.Color("#c8401c"), 0.5);
        // d'inverno le caduche tengono solo qualche foglia secca
        if (spoglio && !sottobosco) c.set(p.t < 0.5 ? "#8a6a48" : "#a8885c");
        f.mesh.setColorAt(k, c);
        if (spoglio && !sottobosco) {
          // le poche foglie rimaste stanno sul nucleo più piccolo (non restano sospese)
          if (p.t > 0.3) f.mesh.setMatrixAt(k, zero);
          else {
            const pos = new THREE.Vector3().setFromMatrixPosition(p.m).sub(p.c).multiplyScalar(0.62).add(p.c);
            f.mesh.setMatrixAt(k, p.m.clone().multiply(new THREE.Matrix4().makeScale(0.8, 0.8, 0.8)).setPosition(pos));
          }
        } else f.mesh.setMatrixAt(k, p.m);
      });
      if (f.mesh.instanceColor) f.mesh.instanceColor.needsUpdate = true;
      f.mesh.instanceMatrix.needsUpdate = true;
    });
    // nuclei: il colore scuro della specie (d'inverno, per le caduche, il grigio dei rami)
    for (const n of nuclei) {
      const sp = palette(n.tipo.specie);
      const spoglio = stagione === "inverno" && !sp.sempreverde;
      c.copy(a).lerp(b, 0.25).multiplyScalar(0.62);
      if (spoglio) c.set("#5e4c3e");
      n.mesh.setColorAt(n.i, c);
      // d'inverno la chioma spoglia è un intrico di rami più piccolo
      n.mesh.setMatrixAt(n.i, spoglio ? n.m.clone().multiply(new THREE.Matrix4().makeScale(0.6, 0.6, 0.6)) : n.m);
    }
    for (const m of [nucleiTondi, nucleiConi]) { if (m.instanceColor) m.instanceColor.needsUpdate = true; m.instanceMatrix.needsUpdate = true; }
    // cespugli
    c.set(stagione === "autunno" ? "#8a8a30" : stagione === "inverno" ? "#4e6a40" : "#2f7a2c");
    for (let k = 0; k < cespugli.count; k++) cespugli.setColorAt(k, c);
    if (cespugli.instanceColor) cespugli.instanceColor.needsUpdate = true;
  }

  return { stagione, oggetti: tutti };
}
