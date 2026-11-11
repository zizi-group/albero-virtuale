// Numeri casuali deterministici: stesso seme, stesso risultato.

/**
 * Generatore (mulberry32) da un numero intero.
 * @param {number} seme
 * @returns {() => number} numeri in [0, 1)
 */
export function generatore(seme) {
  let s = seme >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Da una stringa a un intero (FNV-1a).
 * @param {string | number} testo
 */
export function hash(testo) {
  let h = 2166136261;
  for (const c of String(testo)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** @param {() => number} r @param {number} a @param {number} b */
export const tra = (r, a, b) => a + r() * (b - a);

/** @template T @param {() => number} r @param {T[]} lista @returns {T} */
export const scegli = (r, lista) => lista[Math.floor(r() * lista.length)];

/** Avvicina `a` a `b` in modo morbido, indipendente dai fotogrammi. */
export const verso = (/** @type {number} */ a, /** @type {number} */ b, /** @type {number} */ velocita, /** @type {number} */ dt) =>
  a + (b - a) * (1 - Math.exp(-velocita * dt));

/** Una curva che sale, resta e scende dentro un'attività di durata d. */
export const busta = (/** @type {number} */ t, /** @type {number} */ d, su = 0.4, giu = 0.5) => Math.min(1, t / su) * Math.min(1, Math.max(0, (d - t) / giu));
