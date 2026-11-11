// Il viso di Linfa: occhi piccoli, neri e lucidi, bassi e distanti sul tronco;
// guance grandi; bocca piccola. Mai sopracciglia arrabbiate.
// Il viso è guidato da pochi parametri (Espressione) che si fondono in modo
// morbido: l'umore dà la base, le espressioni brevi si sommano per un attimo.
import * as THREE from "three";
import { mat, ovale, tubo } from "./forme.js";
import { verso } from "./casuale.js";
import { texGuancia } from "./texture.js";

/**
 * @typedef {Object} Espressione
 * @property {number} felice occhi chiusi ad arco (^ ^), 0-1
 * @property {number} dorme occhi chiusi all'ingiù (dormire), 0-1
 * @property {number} palpebra palpebre pesanti (assonnato, sognante), 0-1
 * @property {number} occhiolino occhio destro chiuso, 0-1
 * @property {number} sorpresa occhi più grandi, 0-1
 * @property {number} sorriso curvatura del sorriso, 0-1.3
 * @property {number} aperta bocca aperta con la lingua, 0-1
 * @property {number} o bocca a «o» (sorpreso, sbadiglio, canticchia), 0-1
 * @property {number} storta sorriso storto, -1..1
 * @property {number} guance rossore, 0-1.6
 * @property {number} sguardoX -1..1
 * @property {number} sguardoY -1..1
 */

/** @returns {Espressione} */
export const neutra = () => ({ felice: 0, dorme: 0, palpebra: 0, occhiolino: 0, sorpresa: 0, sorriso: 0.6, aperta: 0, o: 0, storta: 0, guance: 0.6, sguardoX: 0, sguardoY: 0 });

/** L'espressione di base di ogni umore. @type {Record<string, Partial<Espressione>>} */
export const UMORI = {
  curioso: { sorriso: 0.6, sorpresa: 0.25, guance: 0.6, sguardoY: 0.2 },
  allegro: { sorriso: 1.1, aperta: 0.35, guance: 0.9 },
  pensieroso: { sorriso: 0.3, storta: 0.35, palpebra: 0.2, sguardoX: 0.6, sguardoY: 0.6, guance: 0.5 },
  assonnato: { palpebra: 0.8, sorriso: 0.4, guance: 0.55 },
  furbo: { palpebra: 0.3, sorriso: 0.85, storta: 0.75, guance: 0.7 },
  fiero: { felice: 0.75, sorriso: 1.0, guance: 0.75 },
  sognante: { palpebra: 0.45, sorriso: 0.7, sguardoY: 0.8, guance: 0.85 },
  energico: { sorpresa: 0.25, aperta: 0.5, sorriso: 1.2, guance: 0.9 },
  malinconico: { sorriso: 0.12, palpebra: 0.4, sguardoY: -0.6, guance: 0.35 },
};

/** Espressioni brevi: si sommano alla base per qualche istante. @type {Record<string, Partial<Espressione>>} */
export const BREVI = {
  sorpreso: { sorpresa: 1, o: 0.8, sorriso: 0, aperta: 0, felice: 0, palpebra: 0 },
  ride: { felice: 1, aperta: 0.85, sorriso: 1.25, guance: 1.2, palpebra: 0, o: 0 },
  sbadiglia: { o: 1.25, dorme: 0.8, sorriso: 0, aperta: 0 },
  occhiolino: { occhiolino: 1, storta: 0.6, sorriso: 0.9 },
  imbarazzato: { guance: 1.6, sguardoY: -0.7, sguardoX: 0.5, sorriso: 0.5, palpebra: 0.25 },
  cuoricini: { felice: 1, sorriso: 1.1, guance: 1.3, aperta: 0.2 },
  spaventato: { sorpresa: 1, o: 0.6, sorriso: 0, aperta: 0, felice: 0, guance: 0.3 },
  dorme: { dorme: 1, sorriso: 0.25, aperta: 0, o: 0, palpebra: 0, felice: 0, guance: 0.5 },
  trema: { sorpresa: 0.3, sorriso: 0.15, storta: -0.3, guance: 0.9 },
};

const OCCHIO = { rx: 0.064, ry: 0.082 };
const INCHIOSTRO = "#22160e";

/**
 * Linea in coordinate locali del viso: x, y sul piano, z che segue la curva del tronco.
 * @param {number[][]} punti [x, y]
 * @param {number} curva raggio del tronco (per piegare la linea)
 * @param {number} r spessore
 * @param {THREE.Material} materiale
 */
function linea(punti, curva, r, materiale) {
  return tubo(punti.map(([x, y]) => [x, y, -(x * x) / (2 * curva) + 0.004]), r, r, materiale, 12, 6);
}

/**
 * Costruisce il viso sul tronco.
 * @param {{ posa: (o: THREE.Object3D, x: number, y: number, fuori?: number) => THREE.Object3D, raggio: (y: number) => number, Y: (f: number) => number }} tronco
 * @param {{ larghezza: number, occhi: string, distanza: number, lentiggini: boolean, sopracciglia: boolean, scuro: string }} m
 */
export function creaViso(tronco, m) {
  const gruppo = new THREE.Group();
  const nero = new THREE.MeshPhysicalMaterial({ color: "#1a110b", roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04 });
  const velo = new THREE.MeshPhysicalMaterial({ color: "#4a2a18", roughness: 0.3, clearcoat: 1 });
  const bianco = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const tratto = mat(INCHIOSTRO, { roughness: 0.5 });
  const forma = m.occhi === "ovali" ? [0.9, 1.12] : m.occhi === "piccoli" ? [0.85, 0.85] : [1, 1];
  const rx = OCCHIO.rx * forma[0], ry = OCCHIO.ry * forma[1];

  const yO = tronco.Y(0.47);
  const xO = 0.215 * m.larghezza * m.distanza;
  const rT = tronco.raggio(yO);

  /** @param {number} lato */
  const occhio = (lato) => {
    const g = /** @type {THREE.Group} */ (tronco.posa(new THREE.Group(), lato * xO, yO, -0.012));
    const sguardo = new THREE.Group(); // si sposta un poco dove guarda
    const punto = new THREE.Group(); // l'occhio aperto, si chiude scalando in altezza
    punto.add(ovale(rx, ry, 0.04, nero));
    const v = ovale(rx * 0.62, ry * 0.32, 0.02, velo, true);
    v.position.set(0, -ry * 0.5, 0.028);
    const l1 = ovale(0.021, 0.024, 0.01, bianco, true);
    l1.position.set(rx * 0.3, ry * 0.32, 0.04);
    const l2 = ovale(0.009, 0.009, 0.006, bianco, true);
    l2.position.set(-rx * 0.34, -ry * 0.3, 0.04);
    punto.add(v, l1, l2);
    sguardo.add(punto);
    g.add(sguardo);
    // archi: felice (^) e addormentato (u)
    const archi = (/** @type {(t: number) => number} */ f, /** @type {number} */ larg) => {
      const pts = [];
      for (let i = 0; i <= 8; i++) { const t = i / 4 - 1; pts.push([t * larg, f(t)]); }
      const a = linea(pts, rT, 0.019, tratto);
      a.visible = false;
      g.add(a);
      return a;
    };
    const felice = archi((t) => -0.034 * t * t + 0.014, 0.07);
    const dorme = archi((t) => 0.026 * t * t - 0.012, 0.066);
    // palpebra pesante: una linea dritta e un po' calante verso l'esterno
    const palpebra = archi((t) => 0.03 - 0.008 * t * t - lato * t * 0.008, 0.07);
    return { g, sguardo, punto, felice, dorme, palpebra };
  };
  const occhi = [occhio(-1), occhio(1)];
  occhi.forEach((o) => gruppo.add(o.g));

  // Sopracciglia: corte, arrotondate, alte, con l'estremità interna più alta. Solo se il modello le ha.
  if (m.sopracciglia) {
    const sop = mat(m.scuro, { roughness: 0.7 });
    for (const lato of [-1, 1]) {
      const g = tronco.posa(new THREE.Group(), lato * xO, yO + 0.17, 0);
      const pts = [];
      for (let i = 0; i <= 6; i++) { const t = i / 3 - 1; pts.push([t * 0.032, (1 - t * t) * 0.011 - lato * t * 0.006]); }
      g.add(linea(pts, rT, 0.012, sop));
      gruppo.add(g);
    }
  }

  // Guance
  const guance = [-1, 1].map((lato) => {
    const materiale = new THREE.MeshStandardMaterial({ map: texGuancia(m.lentiggini), transparent: true, depthWrite: false, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -4 });
    const g = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.2), materiale);
    tronco.posa(g, lato * (xO + 0.075), yO - 0.085, 0.012);
    gruppo.add(g);
    return g;
  });

  // Bocca: sorriso (curvatura variabile), bocca aperta con lingua, bocca a «o»
  const bocca = /** @type {THREE.Group} */ (tronco.posa(new THREE.Group(), 0, yO - 0.135, 0.004));
  const scuro = mat("#4a1f1a", { roughness: 0.5 });
  const pts = [];
  for (let i = 0; i <= 8; i++) { const t = i / 4 - 1; pts.push([t * 0.05, 0.026 * t * t]); }
  const sorriso = linea(pts, rT, 0.014, scuro);
  const forma2 = new THREE.Shape();
  forma2.moveTo(-0.058, 0.012);
  forma2.quadraticCurveTo(0, 0.0, 0.058, 0.012);
  forma2.quadraticCurveTo(0.054, -0.062, 0, -0.064);
  forma2.quadraticCurveTo(-0.054, -0.062, -0.058, 0.012);
  const aperta = new THREE.Group();
  aperta.add(new THREE.Mesh(new THREE.ShapeGeometry(forma2, 12), mat("#5a1c16", { roughness: 0.6 })));
  const lingua = ovale(0.034, 0.02, 0.008, mat("#e8807c", { roughness: 0.5 }), true);
  lingua.position.set(0, -0.046, 0.004);
  aperta.add(lingua);
  aperta.position.y = 0.012;
  const o = new THREE.Group();
  const cerchio = new THREE.Mesh(new THREE.CircleGeometry(1, 24), mat("#5a1c16", { roughness: 0.6 }));
  o.add(cerchio);
  o.position.y = -0.01;
  bocca.add(sorriso, aperta, o);
  gruppo.add(bocca);

  // ---------------------------------------------------------------- Stato
  const ora = neutra();
  /** @type {Espressione} */
  let base = neutra();
  /** @type {{ e: Partial<Espressione>, fine: number, inizio: number }[]} */
  const brevi = [];
  let battito = -1, prossimoBattito = 1 + Math.random() * 2;
  let parla = 0, canticchia = 0;
  const guarda = new THREE.Vector2();
  let guardaAttivo = 0;

  return {
    gruppo,
    /** Punti degli occhi (per gli occhiali). */
    ancore: occhi.map((x) => x.g),
    occhio: { rx, ry },
    /** Imposta l'umore di base. @param {string} umore */
    umore(umore) {
      base = { ...neutra(), ...(UMORI[umore] ?? {}) };
    },
    /**
     * Espressione breve che si somma alla base per `durata` secondi.
     * @param {string | Partial<Espressione>} e @param {number} [durata]
     */
    breve(e, durata = 1.4) {
      const ex = typeof e === "string" ? BREVI[e] : e;
      if (!ex) return;
      brevi.push({ e: ex, inizio: 0, fine: durata });
    },
    /** La bocca si muove come se parlasse (o canticchiasse) per qualche secondo. @param {number} s @param {boolean} [canta] */
    parla(s, canta = false) {
      if (canta) canticchia = s; else parla = s;
    },
    /** Lo sguardo segue un punto (coordinate -1..1 rispetto al viso), per qualche istante. @param {number} x @param {number} y */
    guarda(x, y) {
      guarda.set(THREE.MathUtils.clamp(x, -1, 1), THREE.MathUtils.clamp(y, -1, 1));
      guardaAttivo = 1.5;
    },
    /** Battito di ciglia subito. */
    batti() { if (battito < 0) battito = 0; },
    /** @param {number} dt @param {number} t @param {boolean} ridotto */
    aggiorna(dt, t, ridotto) {
      // bersaglio = base + espressioni brevi (con dissolvenza in entrata e in uscita)
      /** @type {Record<string, number>} */
      const b = { ...base };
      for (let i = brevi.length - 1; i >= 0; i--) {
        const x = brevi[i];
        x.inizio += dt;
        const peso = Math.min(1, x.inizio / 0.2) * Math.min(1, Math.max(0, (x.fine - x.inizio) / 0.3));
        for (const [k, v] of Object.entries(x.e)) b[k] = b[k] + (/** @type {number} */ (v) - b[k]) * peso;
        if (x.inizio >= x.fine) brevi.splice(i, 1);
      }
      // sguardo: segue il puntatore, altrimenti ogni tanto si guarda intorno
      if (guardaAttivo > 0) { guardaAttivo -= dt; b.sguardoX = guarda.x; b.sguardoY = guarda.y; }
      else if (!ridotto) {
        b.sguardoX += Math.sin(t * 0.37) * Math.sin(t * 0.21) * 0.6;
        b.sguardoY += Math.sin(t * 0.29 + 1) * 0.25;
      }
      const vel = 9;
      for (const k of /** @type {(keyof Espressione)[]} */ (Object.keys(ora))) ora[k] = verso(ora[k], b[k], vel, dt);

      // battito di ciglia naturale (a volte doppio)
      prossimoBattito -= dt;
      if (prossimoBattito <= 0 && battito < 0) { battito = 0; prossimoBattito = Math.random() < 0.2 ? 0.25 : 2 + Math.random() * 4; }
      let ciglia = 1;
      if (battito >= 0) {
        battito += dt;
        const f = battito / 0.15;
        ciglia = f < 1 ? 1 - Math.sin(f * Math.PI) * 0.95 : 1;
        if (f >= 1) battito = -1;
      }

      // occhi
      const chiuso = Math.max(ora.felice, ora.dorme);
      occhi.forEach((oc, i) => {
        const wink = i === 1 ? ora.occhiolino : 0;
        const fel = Math.max(ora.felice, wink);
        const ap = Math.max(0.04, (1 - Math.max(chiuso, wink)) * ciglia * (1 - ora.palpebra * 0.45));
        const s = 1 + ora.sorpresa * 0.28;
        oc.punto.scale.set(s, ap * s, 1);
        oc.punto.position.y = -ora.palpebra * ry * 0.35;
        oc.punto.visible = ap > 0.05;
        oc.sguardo.position.set(ora.sguardoX * 0.012, ora.sguardoY * 0.01, 0);
        oc.felice.visible = fel > 0.08;
        oc.felice.scale.set(1, fel, 1);
        oc.dorme.visible = ora.dorme > 0.08 && wink < 0.5;
        oc.dorme.scale.set(1, ora.dorme, 1);
        oc.palpebra.visible = ora.palpebra > 0.15 && chiuso < 0.5 && wink < 0.5;
        oc.palpebra.position.y = -ora.palpebra * 0.012;
      });

      // bocca
      let ap = ora.aperta, oo = ora.o;
      if (parla > 0) { parla -= dt; ap = Math.max(ap, 0.25 + 0.35 * Math.abs(Math.sin(t * 13)) * Math.abs(Math.sin(t * 5.3))); }
      if (canticchia > 0) { canticchia -= dt; oo = Math.max(oo, 0.35 + 0.25 * Math.sin(t * 6)); }
      sorriso.visible = ap < 0.22 && oo < 0.22;
      sorriso.scale.set(1, Math.max(0.08, ora.sorriso), 1);
      sorriso.rotation.z = ora.storta * 0.28;
      sorriso.position.x = ora.storta * 0.012;
      aperta.visible = ap >= 0.22 && oo < 0.3;
      aperta.scale.set(0.85 + 0.25 * ora.sorriso, Math.max(0.2, ap), 1);
      aperta.rotation.z = ora.storta * 0.2;
      o.visible = oo >= 0.3;
      cerchio.scale.set(0.03 + 0.012 * oo, 0.032 + 0.03 * oo, 1);

      // guance
      for (const g of guance) {
        /** @type {THREE.MeshStandardMaterial} */ (g.material).opacity = Math.min(1, 0.35 + 0.5 * ora.guance);
        g.scale.setScalar(0.85 + 0.25 * Math.min(ora.guance, 1.6));
      }
    },
  };
}
