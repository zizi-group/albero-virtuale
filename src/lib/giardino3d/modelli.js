// Il catalogo: 16 specie (quasi tutte italiane) e 30 modelli di albero-personaggio.
// Una specie decide sagoma della chioma, foglia, corteccia e colori di stagione;
// un modello aggiunge proporzioni, tono e viso. Il modello viene dal seme.
import { generatore, hash } from "./casuale.js";

/**
 * @typedef {Object} Specie
 * @property {string} nome
 * @property {"tonda"|"larga"|"ovale"|"cono"|"ombrello"|"colonna"|"piangente"|"stretta"} forma
 * @property {string} foglia tipo di texture (texture.js)
 * @property {[number, number]} dim larghezza e lunghezza della foglia
 * @property {number} foglie quante foglie in estate
 * @property {[string, string]} estate colori (scuro, chiaro)
 * @property {[string, string]} [autunno]
 * @property {[string, string]} [primavera]
 * @property {boolean} sempreverde
 * @property {string} corteccia (texture.js, CORTECCE)
 * @property {{ tipo: "fiore-rosa"|"fiore-bianco", n: number }} [fiori] in primavera
 * @property {{ colore: string, r: number, n: number, stagioni: string[] }} [frutti]
 */

/** @type {Record<string, Specie>} */
export const SPECIE = {
  quercia: { nome: "Quercia", forma: "tonda", foglia: "quercia", dim: [0.21, 0.27], foglie: 1250, estate: ["#2f7a1f", "#5ea82c"], primavera: ["#4f9a2a", "#8ccc44"], autunno: ["#a8561a", "#dca03a"], sempreverde: false, corteccia: "quercia" },
  "pino-marittimo": { nome: "Pino marittimo", forma: "ombrello", foglia: "aghi", dim: [0.2, 0.32], foglie: 1150, estate: ["#2a6a34", "#4c9440"], sempreverde: true, corteccia: "pino" },
  ulivo: { nome: "Ulivo", forma: "larga", foglia: "ulivo", dim: [0.13, 0.27], foglie: 1300, estate: ["#55784a", "#95b47e"], sempreverde: true, corteccia: "ulivo" },
  betulla: { nome: "Betulla", forma: "ovale", foglia: "betulla", dim: [0.16, 0.18], foglie: 1100, estate: ["#5fa02e", "#a0d24e"], autunno: ["#d8a41c", "#f4d846"], sempreverde: false, corteccia: "betulla" },
  ciliegio: { nome: "Ciliegio", forma: "tonda", foglia: "ovale", dim: [0.17, 0.23], foglie: 850, estate: ["#3f8a2a", "#70b63c"], autunno: ["#b8402a", "#e8803a"], sempreverde: false, corteccia: "ciliegio", fiori: { tipo: "fiore-rosa", n: 650 }, frutti: { colore: "#c8102e", r: 0.035, n: 40, stagioni: ["estate"] } },
  acero: { nome: "Acero", forma: "tonda", foglia: "acero", dim: [0.25, 0.25], foglie: 900, estate: ["#3f8f2a", "#72b83c"], autunno: ["#c2241a", "#f4661e"], sempreverde: false, corteccia: "liscia" },
  faggio: { nome: "Faggio", forma: "ovale", foglia: "ovale", dim: [0.16, 0.2], foglie: 1150, estate: ["#4a9a2a", "#82c63e"], autunno: ["#b0621c", "#de9232"], sempreverde: false, corteccia: "liscia" },
  salice: { nome: "Salice piangente", forma: "piangente", foglia: "salice", dim: [0.09, 0.32], foglie: 1700, estate: ["#6aa83a", "#b0d866"], autunno: ["#c8b040", "#ecd866"], sempreverde: false, corteccia: "chiara" },
  castagno: { nome: "Castagno", forma: "tonda", foglia: "castagno", dim: [0.14, 0.32], foglie: 1150, estate: ["#3a7a22", "#68a834"], autunno: ["#b8781e", "#e4ae44"], sempreverde: false, corteccia: "rossa", frutti: { colore: "#8a9a2a", r: 0.05, n: 22, stagioni: ["estate", "autunno"] } },
  abete: { nome: "Abete", forma: "cono", foglia: "aghi", dim: [0.17, 0.28], foglie: 1300, estate: ["#2a7040", "#48a05c"], sempreverde: true, corteccia: "scura" },
  cipresso: { nome: "Cipresso", forma: "colonna", foglia: "aghi", dim: [0.14, 0.22], foglie: 1150, estate: ["#357236", "#56984c"], sempreverde: true, corteccia: "scura" },
  limone: { nome: "Limone", forma: "tonda", foglia: "limone", dim: [0.15, 0.21], foglie: 900, estate: ["#2f7a24", "#52a032"], sempreverde: true, corteccia: "liscia", frutti: { colore: "#f6d21e", r: 0.06, n: 26, stagioni: ["primavera", "estate", "autunno", "inverno"] } },
  fico: { nome: "Fico", forma: "larga", foglia: "fico", dim: [0.3, 0.3], foglie: 700, estate: ["#4a8a2a", "#7ab442"], autunno: ["#c0a030", "#e4c850"], sempreverde: false, corteccia: "liscia", frutti: { colore: "#6a2a5a", r: 0.045, n: 24, stagioni: ["estate"] } },
  melo: { nome: "Melo", forma: "tonda", foglia: "ovale", dim: [0.15, 0.19], foglie: 950, estate: ["#3f8a2a", "#6cb23a"], autunno: ["#a88a2a", "#d8b444"], sempreverde: false, corteccia: "scura", fiori: { tipo: "fiore-bianco", n: 500 }, frutti: { colore: "#d42a1e", r: 0.065, n: 22, stagioni: ["estate", "autunno"] } },
  larice: { nome: "Larice", forma: "cono", foglia: "aghi", dim: [0.15, 0.25], foglie: 1100, estate: ["#5a9a3a", "#8ec652"], autunno: ["#d8a020", "#f6c844"], sempreverde: false, corteccia: "rossa" },
  pioppo: { nome: "Pioppo", forma: "stretta", foglia: "cuore", dim: [0.15, 0.16], foglie: 1100, estate: ["#4a9a2a", "#86c444"], autunno: ["#dcc020", "#f6e044"], sempreverde: false, corteccia: "chiara" },
};

/**
 * @typedef {Object} Modello
 * @property {string} id
 * @property {string} nome
 * @property {string} specie
 * @property {number} altezza proporzione del tronco (0.9-1.14)
 * @property {number} larghezza (0.88-1.12)
 * @property {number} chioma grandezza della chioma (0.85-1.15)
 * @property {number} tono 0-1, il tono delle foglie dentro la specie
 * @property {"tondi"|"ovali"|"piccoli"} occhi
 * @property {number} distanza distanza fra gli occhi (0.9-1.1)
 * @property {boolean} lentiggini
 * @property {boolean} sopracciglia corte, alte e dolci
 */

/** @param {string} id @param {string} nome @param {string} specie @param {Partial<Modello>} [extra] @returns {Modello} */
const m = (id, nome, specie, extra = {}) => ({ id, nome, specie, altezza: 1, larghezza: 1, chioma: 1, tono: 0.5, occhi: "tondi", distanza: 1, lentiggini: false, sopracciglia: false, ...extra });

/** I 30 modelli: ognuno ha un nome e un carattere visivo suo. @type {Modello[]} */
export const MODELLI = [
  m("quercia-del-colle", "Quercia del colle", "quercia"),
  m("quercia-tonda", "Quercia tondetta", "quercia", { altezza: 0.92, larghezza: 1.1, chioma: 1.1, tono: 0.75, occhi: "ovali", lentiggini: true }),
  m("quercia-saggia", "Quercia saggia", "quercia", { altezza: 1.12, larghezza: 0.95, tono: 0.15, occhi: "piccoli", sopracciglia: true }),
  m("pino-del-mare", "Pino del mare", "pino-marittimo", { altezza: 1.1, larghezza: 0.92 }),
  m("pino-ombrellino", "Pino ombrellino", "pino-marittimo", { altezza: 0.95, chioma: 0.9, tono: 0.8, occhi: "ovali", lentiggini: true }),
  m("ulivo-antico", "Ulivo antico", "ulivo", { larghezza: 1.12, tono: 0.3, occhi: "piccoli", sopracciglia: true }),
  m("ulivo-argento", "Ulivo d'argento", "ulivo", { altezza: 0.94, tono: 0.85, occhi: "ovali" }),
  m("betulla-bianca", "Betulla bianca", "betulla", { altezza: 1.1, larghezza: 0.9, occhi: "ovali", sopracciglia: true }),
  m("betulla-ballerina", "Betulla ballerina", "betulla", { altezza: 1.0, larghezza: 0.92, chioma: 0.92, tono: 0.85, lentiggini: true }),
  m("ciliegio-in-fiore", "Ciliegio in fiore", "ciliegio", { tono: 0.6, occhi: "ovali", lentiggini: true }),
  m("ciliegio-piccolo", "Ciliegino", "ciliegio", { altezza: 0.9, larghezza: 1.05, chioma: 0.9, tono: 0.3 }),
  m("acero-rosso", "Acero rosso", "acero", { altezza: 1.05, tono: 0.4, sopracciglia: true }),
  m("acero-di-monte", "Acero di monte", "acero", { larghezza: 1.08, chioma: 1.08, tono: 0.8, occhi: "ovali" }),
  m("faggio-gentile", "Faggio gentile", "faggio", { altezza: 1.08, occhi: "piccoli" }),
  m("faggio-rotondo", "Faggio rotondo", "faggio", { altezza: 0.92, larghezza: 1.1, chioma: 1.1, tono: 0.2, lentiggini: true }),
  m("salice-sognatore", "Salice sognatore", "salice", { tono: 0.6, occhi: "ovali" }),
  m("salice-del-fiume", "Salice del fiume", "salice", { altezza: 1.1, larghezza: 0.94, tono: 0.2, sopracciglia: true }),
  m("castagno-buono", "Castagno buono", "castagno", { larghezza: 1.1, tono: 0.5, lentiggini: true }),
  m("castagno-del-bosco", "Castagno del bosco", "castagno", { altezza: 1.1, chioma: 1.08, tono: 0.15, occhi: "piccoli" }),
  m("abete-di-natale", "Abete di Natale", "abete", { altezza: 1.0, tono: 0.5, occhi: "ovali" }),
  m("abete-alto", "Abete alto", "abete", { altezza: 1.12, larghezza: 0.92, chioma: 1.12, tono: 0.2, sopracciglia: true }),
  m("cipresso-toscano", "Cipresso toscano", "cipresso", { altezza: 1.1, larghezza: 0.9, occhi: "piccoli" }),
  m("cipressino", "Cipressino", "cipresso", { altezza: 0.92, chioma: 0.9, tono: 0.8, lentiggini: true }),
  m("limone-di-sorrento", "Limone di Sorrento", "limone", { larghezza: 1.06, tono: 0.6, occhi: "ovali", lentiggini: true }),
  m("limoncino", "Limoncino", "limone", { altezza: 0.9, chioma: 0.92, tono: 0.3 }),
  m("fico-goloso", "Fico goloso", "fico", { larghezza: 1.1, tono: 0.5, sopracciglia: true }),
  m("melo-della-nonna", "Melo della nonna", "melo", { tono: 0.5, occhi: "ovali", lentiggini: true }),
  m("melo-rosso", "Melo rosso", "melo", { altezza: 0.94, larghezza: 1.06, chioma: 1.05, tono: 0.2 }),
  m("larice-alpino", "Larice alpino", "larice", { altezza: 1.08, larghezza: 0.94, tono: 0.5, occhi: "piccoli" }),
  m("pioppo-del-viale", "Pioppo del viale", "pioppo", { altezza: 1.12, larghezza: 0.9, tono: 0.5, occhi: "ovali", sopracciglia: true }),
];

/** @type {Record<string, Modello>} */
export const MODELLI_PER_ID = Object.fromEntries(MODELLI.map((x) => [x.id, x]));

/**
 * Il modello che spetta a un seme: sempre lo stesso per lo stesso seme.
 * @param {string | number} seme
 * @returns {Modello}
 */
export function modelloDalSeme(seme) {
  const r = generatore(hash(`modello:${seme}`));
  return MODELLI[Math.floor(r() * MODELLI.length)];
}
