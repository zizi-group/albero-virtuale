// Piccoli attrezzi di geometria condivisi: tubi affusolati, ovali, materiali.
import * as THREE from "three";

/** @param {number} x @param {number} y @param {number} z */
export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

/**
 * Materiale standard opaco.
 * @param {THREE.ColorRepresentation} colore
 * @param {THREE.MeshStandardMaterialParameters} [extra]
 */
export const mat = (colore, extra = {}) => new THREE.MeshStandardMaterial({ color: colore, roughness: 0.75, ...extra });

/** Geometrie condivise (si creano una volta). */
const SFERA = new THREE.SphereGeometry(1, 20, 15);
const SFERA_PICCOLA = new THREE.SphereGeometry(1, 10, 8);

/**
 * Ovale (sfera scalata).
 * @param {number} rx @param {number} ry @param {number} rz
 * @param {THREE.Material} materiale
 * @param {boolean} [piccola] geometria leggera, per i dettagli
 */
export function ovale(rx, ry, rz, materiale, piccola = false) {
  const m = new THREE.Mesh(piccola ? SFERA_PICCOLA : SFERA, materiale);
  m.scale.set(rx, ry, rz);
  return m;
}

/**
 * Tubo affusolato lungo una curva (da r0 a r1), con le punte arrotondate.
 * @param {number[][]} punti
 * @param {number} r0 @param {number} r1
 * @param {THREE.Material} materiale
 * @param {number} [segmenti] @param {number} [giro]
 */
export function tubo(punti, r0, r1, materiale, segmenti = 20, giro = 10) {
  const curva = new THREE.CatmullRomCurve3(punti.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
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
    const s = new THREE.Mesh(SFERA_PICCOLA, materiale);
    s.scale.setScalar(r);
    s.position.copy(curva.getPointAt(t));
    g.add(s);
  }
  return g;
}

/** Geometrie condivise da non liberare con distruggi (sono di modulo). */
export const CONDIVISE = new Set([SFERA, SFERA_PICCOLA]);
