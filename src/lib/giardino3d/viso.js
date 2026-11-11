// Il viso di Linfa: occhi piccoli, neri e lucidi, bassi e distanti sul tronco;
// guance grandi; bocca mobile; sopracciglia piccole che si alzano e si
// inclinano (con l'estremità interna più alta: mai arrabbiate).
// Il viso è guidato da pochi parametri (Espressione) che si fondono in modo
// morbido: l'umore dà la base, le espressioni brevi si sommano per un attimo.
// Tutto è dimensionato per leggersi dalla camera del gioco, anche sul telefono.
import * as THREE from "three";
import { mat, ovale, tubo } from "./forme.js";
import { verso } from "./casuale.js";
import { texGuancia } from "./texture.js";

/**
 * @typedef {Object} Espressione
 * @property {number} felice occhi chiusi ad arco (^ ^), 0-1
 * @property {number} dorme occhi chiusi all'ingiù (dormire), 0-1
 * @property {number} palpebra palpebre pesanti (assonnato), 0-1
 * @property {number} occhiolino occhio destro chiuso, 0-1
 * @property {number} sorpresa occhi più grandi, 0-1
 * @property {number} lucido occhi lucidi con riflessi grandi (sognante), 0-1
 * @property {number} sorriso curvatura della bocca: -0.5 broncio tenero … 1.3 sorriso pieno
 * @property {number} larga larghezza della bocca, 0.6-1.6
 * @property {number} aperta bocca aperta con la lingua, 0-1
 * @property {number} o bocca a «o» (sorpreso, sbadiglio, canticchia), 0-1.6
 * @property {number} storta sorriso storto, -1..1
 * @property {number} guance rossore, 0-1.8
 * @property {number} cigliaAlza sopracciglia alzate, 0-1
 * @property {number} cigliaInclina estremità interne più alte (dolce, sorpreso, malinconico), 0-1
 * @property {number} cigliaUno alza solo il sopracciglio destro (furbo, pensieroso), 0-1
 * @property {number} sguardoX -1..1
 * @property {number} sguardoY -1..1
 */

/** @returns {Espressione} */
export const neutra = () => ({
  felice: 0, dorme: 0, palpebra: 0, occhiolino: 0, sorpresa: 0, lucido: 0,
  sorriso: 0.7, larga: 1, aperta: 0, o: 0, storta: 0, guance: 0.6,
  cigliaAlza: 0, cigliaInclina: 0.15, cigliaUno: 0, sguardoX: 0, sguardoY: 0,
});

/** L'espressione di base di ogni umore. @type {Record<string, Partial<Espressione>>} */
export const UMORI = {
  curioso: { sorriso: 0.75, larga: 1, sorpresa: 0.35, cigliaAlza: 0.55, sguardoY: 0.2, guance: 0.7 },
  allegro: { sorriso: 1.25, larga: 1.45, aperta: 0.6, felice: 0.3, guance: 1.15, cigliaAlza: 0.35 },
  pensieroso: { sorriso: 0.35, larga: 0.8, storta: 0.55, palpebra: 0.25, sguardoX: 0.6, sguardoY: 0.65, cigliaAlza: 0.15, cigliaUno: 0.9, guance: 0.5 },
  assonnato: { palpebra: 0.85, sorriso: 0.35, larga: 0.8, guance: 0.65, cigliaInclina: 0.35 },
  furbo: { palpebra: 0.35, sorriso: 0.95, larga: 1.15, storta: 0.95, cigliaUno: 1, guance: 0.85 },
  fiero: { felice: 0.8, sorriso: 1.15, larga: 1.3, guance: 0.95, cigliaAlza: 0.45 },
  sognante: { sorpresa: 0.35, lucido: 1, palpebra: 0.2, sorriso: 0.85, sguardoY: 0.8, guance: 1.15, cigliaInclina: 0.55, cigliaAlza: 0.3 },
  energico: { sorpresa: 0.35, aperta: 0.75, sorriso: 1.3, larga: 1.55, guance: 1.15, cigliaAlza: 0.75 },
  malinconico: { sorriso: -0.45, larga: 0.65, palpebra: 0.35, sguardoY: -0.6, guance: 0.55, cigliaInclina: 1, lucido: 0.6 },
};

/** Espressioni brevi: si sommano alla base per qualche istante. @type {Record<string, Partial<Espressione>>} */
export const BREVI = {
  sorpreso: { sorpresa: 1, o: 1.05, sorriso: 0, aperta: 0, felice: 0, palpebra: 0, cigliaAlza: 1, cigliaInclina: 0.4 },
  ride: { felice: 1, aperta: 1, larga: 1.55, sorriso: 1.3, guance: 1.5, palpebra: 0, o: 0, cigliaAlza: 0.5 },
  sbadiglia: { o: 1.6, dorme: 0.9, sorriso: 0, aperta: 0, cigliaAlza: 0.8, cigliaInclina: 0.3 },
  occhiolino: { occhiolino: 1, storta: 0.85, sorriso: 1.05, larga: 1.2, cigliaUno: 1 },
  imbarazzato: { guance: 1.8, sguardoY: -0.7, sguardoX: 0.5, sorriso: 0.55, larga: 0.75, palpebra: 0.25, cigliaInclina: 0.75 },
  cuoricini: { felice: 1, sorriso: 1.25, larga: 1.35, guance: 1.6, aperta: 0.35, cigliaAlza: 0.4 },
  spaventato: { sorpresa: 1, o: 0.85, sorriso: 0, aperta: 0, felice: 0, guance: 0.4, cigliaAlza: 1, cigliaInclina: 0.7 },
  sospira: { palpebra: 0.6, o: 0.4, sorriso: 0, cigliaInclina: 0.55, sguardoY: 0.4 },
  canticchia: { felice: 0.6, o: 0.5, guance: 1, cigliaAlza: 0.4 },
  dorme: { dorme: 1, sorriso: 0.3, aperta: 0, o: 0, palpebra: 0, felice: 0, guance: 0.6, cigliaAlza: 0, cigliaInclina: 0.2 },
  trema: { sorpresa: 0.3, sorriso: 0.15, larga: 0.8, storta: -0.3, guance: 1, cigliaInclina: 0.6 },
};

const OCCHIO = { rx: 0.086, ry: 0.108 };
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
  const forma = m.occhi === "ovali" ? [0.9, 1.12] : m.occhi === "piccoli" ? [0.88, 0.88] : [1, 1];
  const rx = OCCHIO.rx * forma[0], ry = OCCHIO.ry * forma[1];

  const yO = tronco.Y(0.47);
  const xO = 0.23 * m.larghezza * m.distanza;
  const rT = tronco.raggio(yO);

  /** @param {number} lato */
  const occhio = (lato) => {
    const g = /** @type {THREE.Group} */ (tronco.posa(new THREE.Group(), lato * xO, yO, -0.012));
    const sguardo = new THREE.Group();
    const punto = new THREE.Group(); // l'occhio aperto: si chiude scalando in altezza
    punto.add(ovale(rx, ry, 0.04, nero));
    const v = ovale(rx * 0.62, ry * 0.32, 0.02, velo, true);
    v.position.set(0, -ry * 0.5, 0.028);
    const l1 = ovale(0.023, 0.026, 0.01, bianco, true);
    l1.position.set(rx * 0.3, ry * 0.32, 0.04);
    const l2 = ovale(0.01, 0.01, 0.006, bianco, true);
    l2.position.set(-rx * 0.34, -ry * 0.3, 0.04);
    // riflesso in più quando gli occhi sono lucidi (sognante, commosso)
    const l3 = ovale(0.014, 0.014, 0.006, bianco, true);
    l3.position.set(rx * 0.05, -ry * 0.05, 0.042);
    punto.add(v, l1, l2, l3);
    sguardo.add(punto);
    g.add(sguardo);
    const archi = (/** @type {(t: number) => number} */ f, /** @type {number} */ larg) => {
      const pts = [];
      for (let i = 0; i <= 8; i++) { const t = i / 4 - 1; pts.push([t * larg, f(t)]); }
      const a = linea(pts, rT, 0.026, tratto);
      a.visible = false;
      g.add(a);
      return a;
    };
    const felice = archi((t) => -0.044 * t * t + 0.018, 0.088); // ^
    const dorme = archi((t) => 0.032 * t * t - 0.014, 0.084); // u
    const palpebra = archi((t) => 0.038 - 0.009 * t * t - lato * t * 0.009, 0.088); // palpebra pesante
    return { g, sguardo, punto, felice, dorme, palpebra, l1, l3 };
  };
  const occhi = [occhio(-1), occhio(1)];
  occhi.forEach((o) => gruppo.add(o.g));

  // Sopracciglia: corte e arrotondate, mobili. Ruotano solo verso «interno più alto».
  const sop = mat(m.scuro, { roughness: 0.7 });
  const cigli = [-1, 1].map((lato) => {
    const base = /** @type {THREE.Group} */ (tronco.posa(new THREE.Group(), lato * xO, yO + 0.18, 0));
    const perno = new THREE.Group();
    const pts = [];
    for (let i = 0; i <= 6; i++) { const t = i / 3 - 1; pts.push([t * 0.048, (1 - t * t) * 0.014]); }
    perno.add(linea(pts, rT, m.sopracciglia ? 0.02 : 0.017, sop));
    base.add(perno);
    gruppo.add(base);
    return { perno, lato };
  });

  // Guance
  const guance = [-1, 1].map((lato) => {
    const materiale = new THREE.MeshStandardMaterial({ map: texGuancia(m.lentiggini), transparent: true, depthWrite: false, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -4 });
    const g = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.22), materiale);
    tronco.posa(g, lato * (xO + 0.075), yO - 0.09, 0.012);
    gruppo.add(g);
    return g;
  });

  // Bocca: sorriso (curvatura e larghezza variabili, anche un piccolo broncio),
  // bocca aperta con la lingua, bocca a «o».
  const bocca = /** @type {THREE.Group} */ (tronco.posa(new THREE.Group(), 0, yO - 0.16, 0.004));
  const scuro = mat("#4a1f1a", { roughness: 0.5 });
  const pts = [];
  for (let i = 0; i <= 8; i++) { const t = i / 4 - 1; pts.push([t * 0.085, 0.038 * t * t]); }
  const sorriso = linea(pts, rT, 0.02, scuro);
  const forma2 = new THREE.Shape();
  forma2.moveTo(-0.075, 0.014);
  forma2.quadraticCurveTo(0, 0.0, 0.075, 0.014);
  forma2.quadraticCurveTo(0.07, -0.08, 0, -0.082);
  forma2.quadraticCurveTo(-0.07, -0.08, -0.075, 0.014);
  const aperta = new THREE.Group();
  aperta.add(new THREE.Mesh(new THREE.ShapeGeometry(forma2, 14), mat("#5a1c16", { roughness: 0.6 })));
  const lingua = ovale(0.044, 0.026, 0.008, mat("#ec847e", { roughness: 0.5 }), true);
  lingua.position.set(0, -0.058, 0.004);
  aperta.add(lingua);
  aperta.position.y = 0.014;
  const o = new THREE.Group();
  const cerchio = new THREE.Mesh(new THREE.CircleGeometry(1, 24), mat("#5a1c16", { roughness: 0.6 }));
  const linguaO = ovale(0.6, 0.35, 0.05, mat("#ec847e", { roughness: 0.5 }), true);
  linguaO.position.set(0, -0.5, 0.01);
  cerchio.add(linguaO);
  o.add(cerchio);
  o.position.y = -0.012;
  aperta.scale.setScalar(1.2);
  bocca.add(sorriso, aperta, o);
  gruppo.add(bocca);

  // ---------------------------------------------------------------- Stato
  const ora = neutra();
  /** @type {Espressione} */
  let base = neutra();
  /** @type {{ nome: string, e: Partial<Espressione>, fine: number, inizio: number }[]} */
  const brevi = [];
  let battito = -1, prossimoBattito = 1 + Math.random() * 2;
  let parla = 0, canticchia = 0;
  const guarda = new THREE.Vector2();
  let guardaAttivo = 0;
  const rosa = new THREE.Color("#ffffff"), rosso = new THREE.Color("#ff8a8a");

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
      brevi.push({ nome: typeof e === "string" ? e : "", e: ex, inizio: 0, fine: durata });
    },
    /** Quanto è attiva ora un'espressione breve (0-1): serve al corpo per ridere, sospirare… @param {string} nome */
    intensita(nome) {
      let w = 0;
      for (const x of brevi) if (x.nome === nome) w = Math.max(w, Math.min(1, x.inizio / 0.2) * Math.min(1, Math.max(0, (x.fine - x.inizio) / 0.3)));
      return w;
    },
    /** Toglie tutte le espressioni brevi (si torna all'umore). */
    pulisci() { brevi.length = 0; },
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
      /** @type {Record<string, number>} */
      const b = { ...base };
      // dalla più vecchia alla più nuova: l'ultima espressione arrivata vince
      for (const x of brevi) {
        x.inizio += dt;
        const peso = Math.min(1, x.inizio / 0.2) * Math.min(1, Math.max(0, (x.fine - x.inizio) / 0.3));
        for (const [k, v] of Object.entries(x.e)) b[k] = b[k] + (/** @type {number} */ (v) - b[k]) * peso;
      }
      for (let i = brevi.length - 1; i >= 0; i--) if (brevi[i].inizio >= brevi[i].fine) brevi.splice(i, 1);
      if (brevi.length > 12) brevi.splice(0, brevi.length - 12);
      // sguardo: segue il puntatore, altrimenti ogni tanto si guarda intorno
      if (guardaAttivo > 0) { guardaAttivo -= dt; b.sguardoX = guarda.x; b.sguardoY = guarda.y; }
      else if (!ridotto) {
        b.sguardoX += Math.sin(t * 0.37) * Math.sin(t * 0.21) * 0.6;
        b.sguardoY += Math.sin(t * 0.29 + 1) * 0.25;
      }
      for (const k of /** @type {(keyof Espressione)[]} */ (Object.keys(ora))) ora[k] = verso(ora[k], b[k], 9, dt);

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
        const ap = Math.max(0.04, (1 - Math.max(chiuso, wink)) * ciglia * (1 - ora.palpebra * 0.5));
        const s = 1 + ora.sorpresa * 0.32 + ora.lucido * 0.08;
        oc.punto.scale.set(s, ap * s, 1);
        oc.punto.position.y = -ora.palpebra * ry * 0.38;
        oc.punto.visible = ap > 0.05;
        oc.l1.scale.set(0.023 * (1 + ora.lucido * 0.6), 0.026 * (1 + ora.lucido * 0.6), 0.01);
        oc.l3.visible = ora.lucido > 0.3;
        oc.sguardo.position.set(ora.sguardoX * 0.013, ora.sguardoY * 0.011, 0);
        oc.felice.visible = fel > 0.08;
        oc.felice.scale.set(1, fel, 1);
        oc.dorme.visible = ora.dorme > 0.08 && wink < 0.5;
        oc.dorme.scale.set(1, ora.dorme, 1);
        oc.palpebra.visible = ora.palpebra > 0.15 && chiuso < 0.5 && wink < 0.5;
        oc.palpebra.position.y = -ora.palpebra * 0.014;
      });

      // sopracciglia: alzate, inclinate (interno più alto), una sola alzata
      for (const c of cigli) {
        const uno = c.lato === 1 ? ora.cigliaUno : 0;
        c.perno.position.y = (ora.cigliaAlza * 0.045 + uno * 0.04 + ora.sorpresa * 0.012) - ora.palpebra * 0.012;
        c.perno.rotation.z = -c.lato * (ora.cigliaInclina * 0.42 - uno * 0.1);
      }

      // bocca
      let ap = ora.aperta, oo = ora.o;
      if (parla > 0) { parla -= dt; ap = Math.max(ap, 0.3 + 0.45 * Math.abs(Math.sin(t * 13)) * Math.abs(Math.sin(t * 5.3))); }
      if (canticchia > 0) { canticchia -= dt; oo = Math.max(oo, 0.45 + 0.3 * Math.sin(t * 6)); }
      sorriso.visible = ap < 0.22 && oo < 0.22;
      const curva = Math.abs(ora.sorriso) < 0.06 ? 0.06 : ora.sorriso;
      sorriso.scale.set(ora.larga, curva, 1);
      sorriso.rotation.z = ora.storta * 0.3;
      sorriso.position.set(ora.storta * 0.016, curva < 0 ? -0.02 : 0, 0);
      aperta.visible = ap >= 0.22 && oo < 0.3;
      aperta.scale.set((0.75 + 0.3 * ora.larga) * 1.2, Math.max(0.25, ap) * 1.2, 1);
      aperta.rotation.z = ora.storta * 0.2;
      o.visible = oo >= 0.3;
      cerchio.scale.set(0.044 + 0.022 * oo, 0.046 + 0.044 * oo, 1);

      // guance: più grandi e più rosse con il rossore
      for (const g of guance) {
        const mg = /** @type {THREE.MeshStandardMaterial} */ (g.material);
        mg.opacity = Math.min(1, 0.4 + 0.5 * ora.guance);
        mg.color.copy(rosa).lerp(rosso, THREE.MathUtils.clamp(ora.guance - 1, 0, 0.8));
        g.scale.setScalar(0.85 + 0.25 * Math.min(ora.guance, 1.8));
      }
    },
  };
}
