// Dove stanno gli alberi della foresta del club. Senza three: lo usano sia il
// 3D (club.js) sia la mappa 2D di ripiego.
import { MODELLI } from "./modelli.js";

/** Metri quadrati per albero: decide quanto è grande la foresta. */
export const AREA_PER_ALBERO = 24;
/** Distanza minima fra due tronchi, in metri. */
export const DISTANZA_MINIMA = 2.7;

/**
 * Il modello dal numero in [0, 1) della vista club_forest: lo stesso di
 * modelloDalSeme(id) (vedi la migrazione della foresta del club).
 * @param {number} r
 */
export const modelloDaNumero = (r) => MODELLI[Math.min(MODELLI.length - 1, Math.max(0, Math.floor(r * MODELLI.length)))];

/**
 * Dal cerchio di raggio 1 ai metri, poi allarga un po' gli alberi troppo vicini
 * (griglia, pochi giri, sempre nello stesso ordine: risultato stabile).
 * Il raggio cresce con la radice del numero di alberi: la densità resta uguale.
 * @param {{ x: number, z: number }[]} alberi
 * @returns {{ R: number, pos: { x: number, z: number }[] }}
 */
export function sistemaPosti(alberi) {
  const R = Math.sqrt((Math.max(alberi.length, 1) * AREA_PER_ALBERO) / Math.PI);
  const pos = alberi.map((a) => ({ x: a.x * R, z: a.z * R }));
  const cella = DISTANZA_MINIMA;
  for (let giro = 0; giro < 4; giro++) {
    /** @type {Map<string, number[]>} */
    const griglia = new Map();
    pos.forEach((p, i) => {
      const k = `${Math.floor(p.x / cella)},${Math.floor(p.z / cella)}`;
      const l = griglia.get(k);
      if (l) l.push(i);
      else griglia.set(k, [i]);
    });
    pos.forEach((p, i) => {
      const cx = Math.floor(p.x / cella), cz = Math.floor(p.z / cella);
      for (let dx = -1; dx <= 1; dx++)
        for (let dz = -1; dz <= 1; dz++)
          for (const j of griglia.get(`${cx + dx},${cz + dz}`) ?? []) {
            if (j <= i) continue;
            const q = pos[j];
            let vx = q.x - p.x, vz = q.z - p.z;
            const d = Math.hypot(vx, vz);
            if (d >= DISTANZA_MINIMA) continue;
            if (d < 1e-4) {
              vx = 1;
              vz = 0;
            } else {
              vx /= d;
              vz /= d;
            }
            const spinta = (DISTANZA_MINIMA - d) / 2;
            p.x -= vx * spinta;
            p.z -= vz * spinta;
            q.x += vx * spinta;
            q.z += vz * spinta;
          }
    });
  }
  return { R: R + DISTANZA_MINIMA, pos };
}
