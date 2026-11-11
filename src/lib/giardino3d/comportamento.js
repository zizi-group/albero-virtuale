// Il comportamento dell'albero: posa a strati (base, attività, reazione, meteo)
// che si fonde in modo morbido, routine che si alternano all'azione del giorno,
// sonno di notte, reazioni al clic e al trascinamento.
import * as THREE from "three";
import { busta, verso } from "./casuale.js";
import { quota, RAGGIO_RADURA } from "./ambiente.js";
import { AZIONI } from "./azioni.js";
import * as O from "./oggetti.js";

/**
 * @typedef {{ alza: number, avanti: number, giro: number }} Braccio
 * @typedef {{ giro: number, salto: number, seduto: number, inchino: number, piega: number, allunga: number, bracci: [Braccio, Braccio], gambe: [number, number], divarica: number }} Posa
 */

/** @returns {Posa} */
const posaBase = () => ({
  giro: 0, salto: 0, seduto: 0, inchino: 0, piega: 0, allunga: 0, divarica: 0,
  bracci: [{ alza: -0.15, avanti: 0, giro: 0 }, { alza: -0.15, avanti: 0, giro: 0 }],
  gambe: [0, 0],
});

export { busta };

/**
 * @typedef {Object} Contesto
 * @property {ReturnType<typeof import("./albero.js").creaAlbero>} albero
 * @property {(i: number, o: THREE.Object3D) => THREE.Object3D} inMano mette un oggetto in mano (0 sinistra, 1 destra)
 * @property {(o: THREE.Object3D, dx: number, dz: number, giro?: number) => THREE.Object3D} aTerra mette un oggetto a terra vicino all'albero
 * @property {(o: THREE.Object3D, y: number, z: number) => THREE.Object3D} davanti mette un oggetto davanti al tronco (segue il corpo)
 * @property {(tipo: string, n?: number) => void} emetti
 * @property {ReturnType<typeof import("./viso.js").creaViso>} viso
 * @property {Record<string, any>} dati memoria dell'attività
 * @property {{ cielo: string, ora: string, temperatura: number, stagione: string }} meteo
 */

/**
 * @typedef {Object} Attivita
 * @property {number} durata secondi (Infinity: finché non cambia qualcosa)
 * @property {(ctx: Contesto) => void} [inizia]
 * @property {(p: Posa, t: number, ctx: Contesto) => void} posa
 * @property {(ctx: Contesto) => void} [fine]
 * @property {boolean} [cammina] l'attività sposta l'albero verso un punto a caso
 * @property {(t: number) => { x: number, z: number, vel?: number }} [percorso] l'attività segue un percorso (rispetto a casa)
 */

// ------------------------------------------------------------------ Routine
/** @type {Record<string, Attivita>} */
export const ROUTINE = {
  // fermo davanti alla camera (per le prove e per i momenti di quiete)
  fermo: { durata: 6, posa: (p) => { p.giro = 0; } },
  stiracchia: {
    durata: 3.4,
    inizia: (c) => c.viso.breve("sbadiglia", 2.2),
    posa: (p, t) => {
      const k = busta(t, 3.4, 0.8, 0.8);
      p.bracci[0].alza = p.bracci[1].alza = -0.15 + 2.3 * k;
      p.bracci[0].avanti = p.bracci[1].avanti = -0.2 * k;
      p.inchino = -0.18 * k;
      p.allunga = 0.07 * k;
      p.piega = Math.sin(t * 2) * 0.06 * k;
    },
  },
  sbadiglia: {
    durata: 2.6,
    inizia: (c) => c.viso.breve("sbadiglia", 2.3),
    posa: (p, t) => {
      const k = busta(t, 2.6, 0.5, 0.6);
      p.bracci[1].alza = 0.5 * k; p.bracci[1].avanti = 1.25 * k;
      p.inchino = -0.12 * k;
    },
  },
  "guarda-cielo": {
    durata: 5,
    inizia: (c) => c.viso.breve({ sguardoY: 1, sorriso: 0.9, sorpresa: 0.2 }, 4.6),
    posa: (p, t) => {
      const k = busta(t, 5, 0.8, 0.8);
      p.inchino = -0.3 * k;
      if (t > 1.5 && t < 3.5) { p.bracci[1].alza = 1.5 * busta(t - 1.5, 2); p.bracci[1].avanti = 0.4; }
    },
  },
  siedi: {
    durata: 7,
    inizia: (c) => c.viso.breve({ palpebra: 0.35, sorriso: 0.8, guance: 0.8 }, 6.5),
    posa: (p, t) => {
      const k = busta(t, 7, 0.8, 0.8);
      p.seduto = k;
      p.bracci[0].alza = p.bracci[1].alza = -0.15 - 0.3 * k;
      p.bracci[0].avanti = p.bracci[1].avanti = 0.5 * k;
      p.piega = Math.sin(t * 0.9) * 0.05 * k;
    },
  },
  "raccogli-foglia": {
    durata: 4.6,
    inizia: (c) => { c.dati.f = null; },
    posa: (p, t, c) => {
      if (t < 1.4) { const k = busta(t, 1.6, 0.6, 0.3); p.inchino = 0.45 * k; p.bracci[1].alza = -0.9 * k; p.bracci[1].avanti = 1.0 * k; }
      if (t >= 1.2 && !c.dati.f) {
        c.dati.f = c.inMano(1, O.foglia(["quercia", "acero", "betulla"][Math.floor(Math.random() * 3)], c.meteo.stagione === "autunno" ? "#e0902a" : "#6cc244", 0.18));
        c.viso.breve("sorpreso", 0.8);
      }
      if (t >= 1.4) {
        const k = busta(t - 1.4, 3.2, 0.5, 0.5);
        p.bracci[1].alza = 0.75 * k; p.bracci[1].avanti = 1.3 * k;
        if (t > 2.2 && !c.dati.r) { c.dati.r = 1; c.viso.breve("ride", 1.4); }
      }
    },
  },
  uccellino: {
    durata: 6.5,
    inizia: (c) => {
      const u = O.uccellino();
      c.dati.u = c.aTerra(u, 3, 1.5);
      c.dati.u.position.y += 2.5;
    },
    posa: (p, t, c) => {
      const u = /** @type {THREE.Object3D} */ (c.dati.u);
      const mano = c.albero.mani[1];
      const k = busta(t, 6.5, 0.8, 0.8);
      p.bracci[1].alza = 0.85 * k; p.bracci[1].avanti = 0.7 * k;
      const fine = new THREE.Vector3();
      mano.getWorldPosition(fine);
      fine.y += 0.1;
      const ali = u.userData.ali;
      if (t < 1.6) {
        const f = t / 1.6;
        const da = c.dati.da ?? (c.dati.da = u.position.clone());
        u.position.lerpVectors(da, fine, f * f * (3 - 2 * f));
        u.position.y += Math.sin(f * Math.PI) * 0.6;
        ali.forEach((/** @type {THREE.Object3D} */ a, /** @type {number} */ i) => (a.rotation.z = (i ? -1 : 1) * Math.sin(t * 40) * 0.9));
      } else if (t < 5.2) {
        u.position.copy(fine);
        u.position.y += Math.abs(Math.sin(t * 6)) * 0.03;
        ali.forEach((/** @type {THREE.Object3D} */ a) => (a.rotation.z = 0));
        if (!c.dati.c) { c.dati.c = 1; c.viso.breve("cuoricini", 2.5); c.emetti("nota", 2); }
      } else {
        const f = (t - 5.2) / 1.3;
        u.position.copy(fine).add(new THREE.Vector3(-f * 3, f * 2.5, -f * 2));
        ali.forEach((/** @type {THREE.Object3D} */ a, /** @type {number} */ i) => (a.rotation.z = (i ? -1 : 1) * Math.sin(t * 40) * 0.9));
      }
      u.lookAt(c.albero.radice.position.x, u.position.y, c.albero.radice.position.z + 5);
    },
  },
  cammina: {
    durata: 6,
    cammina: true,
    posa: () => {},
  },
  canticchia: {
    durata: 4,
    inizia: (c) => { c.viso.parla(3.6, true); c.emetti("nota", 3); },
    posa: (p, t) => { p.piega = Math.sin(t * 3) * 0.08; p.bracci[0].alza = p.bracci[1].alza = 0.2 + Math.sin(t * 3) * 0.15; },
  },
  // ---- meteo
  ripara: {
    durata: 9,
    inizia: (c) => { c.dati.o = c.inMano(1, O.ombrelloFoglia(Math.max(0.6, (c.albero.altezza - 1.2) / 1.5))); c.dati.o.userData.diritto = [0, 0, 0.1]; c.viso.breve({ sorriso: 0.9, sguardoY: 0.7 }, 3); },
    posa: (p, t) => {
      const k = busta(t, 9, 0.6, 0.6);
      p.bracci[1].alza = 1.25 * k; p.bracci[1].avanti = 0.45 * k;
      p.bracci[0].alza = -0.4; p.bracci[0].avanti = 0.6;
      p.piega = Math.sin(t * 1.3) * 0.03;
    },
  },
  "fa-vento": {
    durata: 5,
    inizia: (c) => { c.dati.v = c.inMano(1, O.ventaglio()); c.viso.breve({ palpebra: 0.35, sorriso: 0.4, o: 0.35 }, 4.5); c.emetti("goccia", 1); },
    posa: (p, t) => {
      const k = busta(t, 5, 0.4, 0.4);
      p.bracci[1].alza = 0.9 * k; p.bracci[1].avanti = 1.25 * k;
      p.bracci[1].giro = Math.sin(t * 14) * 0.5 * k;
    },
  },
  dormi: {
    durata: Infinity,
    inizia: (c) => { c.dati.z = 0; },
    posa: (p, t, c) => {
      const k = Math.min(1, t / 1.5);
      p.seduto = k;
      p.inchino = 0.22 * k + Math.sin(t * 0.9) * 0.03;
      p.piega = 0.12 * k;
      p.bracci[0].alza = p.bracci[1].alza = -0.6 * k;
      p.bracci[0].avanti = p.bracci[1].avanti = 0.4 * k;
      c.viso.breve("dorme", 0.3);
      if (t - c.dati.z > 2.6) { c.dati.z = t; c.emetti("zzz", 1); }
    },
  },
};

// ------------------------------------------------------------------ Reazioni
/** @type {Record<string, { durata: number, inizia: (c: Contesto) => void, posa: (p: Posa, t: number, c: Contesto) => void }>} */
const REAZIONI = {
  saluta: {
    durata: 2.3,
    inizia: (c) => { c.viso.breve("ride", 1.8); },
    posa: (p, t) => {
      const k = busta(t, 2.3, 0.25, 0.4);
      p.bracci[1].alza = (0.3 + 0.32 * Math.sin(t * 14)) * k + 0.2;
      p.bracci[1].avanti = 1.05 * k;
      p.salto = t < 0.45 ? Math.sin((t / 0.45) * Math.PI) * 0.18 : 0;
      p.giro = 0;
    },
  },
  lettera: {
    durata: 3.4,
    inizia: (c) => { c.viso.breve("sorpreso", 0.9); c.emetti("!", 1); },
    posa: (p, t, c) => {
      if (t > 0.9 && !c.dati.felice) { c.dati.felice = 1; c.viso.breve("cuoricini", 2); }
      const k = busta(t, 3.4, 0.3, 0.5);
      p.giro = c.dati.versoCassetta * k;
      p.bracci[1].alza = 1.1 * k; p.bracci[1].avanti = 0.9 * k;
      p.salto = t > 0.9 && t < 2.1 ? Math.abs(Math.sin((t - 0.9) * 7.8)) * 0.14 : 0;
    },
  },
  festa: {
    durata: 3.6,
    inizia: (c) => { c.viso.breve("ride", 3.2); c.emetti("stella", 5); },
    posa: (p, t) => {
      const k = busta(t, 3.6, 0.2, 0.4);
      p.salto = Math.abs(Math.sin(t * 5.2)) * 0.32 * k;
      p.bracci[0].alza = p.bracci[1].alza = (1.9 + Math.sin(t * 10) * 0.25) * k;
      p.gambe = [Math.sin(t * 10.4) * 0.3 * k, -Math.sin(t * 10.4) * 0.3 * k];
      p.giro = Math.sin(t * 2.6) * 0.5 * k;
    },
  },
  carezza: {
    durata: 2.6,
    inizia: (c) => { c.viso.breve("imbarazzato", 1.3); c.emetti("cuore", 3); },
    posa: (p, t, c) => {
      if (t > 1.1 && !c.dati.felice) { c.dati.felice = 1; c.viso.breve("cuoricini", 1.4); }
      const k = busta(t, 2.6, 0.3, 0.5);
      p.piega = Math.sin(t * 4) * 0.1 * k;
      p.bracci[0].avanti = p.bracci[1].avanti = 1.1 * k;
      p.bracci[0].alza = p.bracci[1].alza = 0.2 * k;
      p.inchino = 0.08 * k;
    },
  },
  lampo: {
    durata: 1.1,
    inizia: (c) => { c.viso.breve("spaventato", 0.9); c.emetti("!", 1); },
    posa: (p, t) => {
      const k = busta(t, 1.1, 0.05, 0.5);
      p.salto = t < 0.35 ? Math.sin((t / 0.35) * Math.PI) * 0.22 : 0;
      p.bracci[0].alza = p.bracci[1].alza = 1.6 * k;
      p.bracci[0].avanti = p.bracci[1].avanti = 0.5 * k;
    },
  },
  posato: {
    durata: 2.4,
    inizia: (c) => { c.viso.breve("ride", 2); c.emetti("stella", 2); },
    posa: (p, t) => {
      const k = busta(t, 2.4, 0.2, 0.5);
      p.piega = Math.sin(t * 7) * 0.08 * k;
      p.bracci[0].alza = p.bracci[1].alza = 0.9 * k;
    },
  },
};

/** Piccole espressioni che ogni umore fa da solo, ogni tanto. @type {Record<string, string[]>} */
const MICRO = {
  curioso: ["sorpreso", "canticchia"],
  allegro: ["ride", "canticchia", "ride"],
  pensieroso: ["sospira"],
  assonnato: ["sbadiglia", "sospira"],
  furbo: ["occhiolino", "ride"],
  fiero: ["ride", "canticchia"],
  sognante: ["sospira", "canticchia"],
  energico: ["ride", "canticchia"],
  malinconico: ["sospira", "sospira"],
};

/** Le routine preferite di ogni umore (pesi). @type {Record<string, Record<string, number>>} */
const GUSTI = {
  curioso: { cammina: 3, "raccogli-foglia": 3, uccellino: 2, "guarda-cielo": 2, stiracchia: 1 },
  allegro: { cammina: 3, canticchia: 3, uccellino: 2, stiracchia: 1, "raccogli-foglia": 1 },
  pensieroso: { siedi: 3, "guarda-cielo": 3, cammina: 1, "raccogli-foglia": 1 },
  assonnato: { sbadiglia: 3, siedi: 3, stiracchia: 2, cammina: 1 },
  furbo: { cammina: 3, "raccogli-foglia": 2, canticchia: 1, uccellino: 1 },
  fiero: { cammina: 2, stiracchia: 2, "guarda-cielo": 2, canticchia: 1 },
  sognante: { "guarda-cielo": 3, siedi: 2, uccellino: 2, canticchia: 1 },
  energico: { cammina: 4, stiracchia: 2, canticchia: 2, uccellino: 1 },
  malinconico: { siedi: 3, "guarda-cielo": 2, cammina: 1, sbadiglia: 1 },
};

// ------------------------------------------------------------------ Il cervello
/**
 * @param {ReturnType<typeof import("./albero.js").creaAlbero>} albero
 * @param {{ scena: THREE.Scene, casa: { x: number, z: number }, cassetta: THREE.Vector3, ridotto: boolean, mondo: { cielo: string, ora: string, temperatura: number, stagione: string }, camera: THREE.Vector3, limiti: { x0: number, x1: number, z0: number, z1: number } }} op
 */
export function creaComportamento(albero, op) {
  const pos = new THREE.Vector2(op.casa.x, op.casa.z);
  const casa = new THREE.Vector2(op.casa.x, op.casa.z);
  const ora = posaBase();
  let umore = "curioso";
  let azione = "";
  /** @type {{ nome: string, a: Attivita, t: number, ctx: Contesto } | null} */
  let att = null;
  /** @type {{ nome: string, r: (typeof REAZIONI)[string], t: number, ctx: Contesto } | null} */
  let reaz = null;
  let primaNotte = op.mondo.ora === "notte";
  let prossimaMicro = 3 + Math.random() * 3;
  let sveglia = false;
  let contaAttivita = 0;
  let giro = 0;
  /** @type {THREE.Vector2 | null} */
  let meta = null;
  let fasePasso = 0, velPasso = 1;
  // trascinamento
  let preso = false, caduta = false, vy = 0, altezza = 0;
  const presa = new THREE.Vector3();

  /** Oggetti dell'attività corrente, da togliere alla fine. @type {THREE.Object3D[]} */
  let oggetti = [];
  /** @param {Record<string, any>} dati @returns {Contesto} */
  const contesto = (dati) => ({
    albero,
    viso: albero.viso,
    dati,
    meteo: op.mondo,
    emetti: (tipo, n) => { if (!op.ridotto) albero.effetti.emetti(tipo, n); },
    inMano: (i, o) => { o.scale.multiplyScalar(1.5); albero.mani[i].add(o); oggetti.push(o); return o; },
    davanti: (o, y, z) => { o.position.set(0, y, 0.52 + z); albero.corpo.add(o); oggetti.push(o); return o; },
    aTerra: (o, dx, dz, g = 0) => {
      // rispetto a dove guarda da fermo (verso la camera): gli oggetti stanno davanti o di lato
      const r = albero.radice, ang = versoCamera();
      const s = Math.sin(ang), c = Math.cos(ang);
      const x = r.position.x + dx * c + dz * s, z = r.position.z - dx * s + dz * c;
      o.position.set(x, quota(x, z), z);
      o.rotation.y = ang + g;
      op.scena.add(o);
      oggetti.push(o);
      return o;
    },
  });
  const libera = () => {
    for (const o of oggetti) {
      o.removeFromParent();
      o.traverse((x) => {
        const m = /** @type {THREE.Mesh} */ (x);
        if (m.isMesh) { m.geometry.dispose(); /** @type {THREE.Material} */ (m.material).dispose(); }
      });
    }
    oggetti = [];
  };

  /** L'angolo che lo gira verso la camera, da dove sta. */
  const versoCamera = () => Math.atan2(op.camera.x - pos.x, op.camera.z - pos.y);

  /** @param {string} nome */
  function avvia(nome) {
    if (att) { att.a.fine?.(att.ctx); libera(); }
    const a = ROUTINE[nome] ?? AZIONI[nome];
    if (!a) { att = null; return; }
    const ctx = contesto({});
    att = { nome, a, t: 0, ctx };
    if (a.cammina) {
      // un punto nella radura, lontano dalla cassetta e dal taccuino
      for (let k = 0; k < 20; k++) {
        const ang = Math.random() * Math.PI * 2, r = 0.5 + Math.random() * 1.1;
        const m = new THREE.Vector2(casa.x + Math.cos(ang) * r, casa.y + Math.sin(ang) * r * 0.7);
        if (m.length() > RAGGIO_RADURA - 1.5) continue;
        if (m.x < op.limiti.x0 || m.x > op.limiti.x1 || m.y < op.limiti.z0 || m.y > op.limiti.z1) continue;
        meta = m;
        break;
      }
    }
    a.inizia?.(ctx);
  }

  /** Sceglie la prossima attività. */
  function prossima() {
    const m = op.mondo;
    contaAttivita++;
    if (m.ora === "notte") return avvia("dormi");
    if (sveglia) { sveglia = false; return avvia(Math.random() < 0.5 ? "stiracchia" : "sbadiglia"); }
    const piove = m.cielo === "pioggia" || m.cielo === "temporale";
    if (piove && azione !== "giornale-ombrello" && Math.random() < 0.65) return avvia("ripara");
    if (m.temperatura > 28 && Math.random() < 0.35) return avvia("fa-vento");
    // torna verso casa se si è allontanato
    if (pos.distanceTo(casa) > 1.6 && Math.random() < 0.7) { meta = casa.clone(); att = { nome: "torna", a: ROUTINE.cammina, t: 0, ctx: contesto({}) }; return; }
    if (azione && AZIONI[azione] && (contaAttivita % 2 === 1 || Math.random() < 0.3)) return avvia(azione);
    const gusti = GUSTI[umore] ?? GUSTI.curioso;
    const lista = Object.entries(gusti);
    let x = Math.random() * lista.reduce((s, [, w]) => s + w, 0);
    for (const [nome, w] of lista) { x -= w; if (x <= 0) return avvia(nome); }
    avvia("cammina");
  }

  /** @param {string} nome */
  function reagisci(nome) {
    const r = REAZIONI[nome];
    if (!r || preso) return;
    const ctx = contesto({});
    if (nome === "lettera") {
      const d = new THREE.Vector2(op.cassetta.x - pos.x, op.cassetta.z - pos.y);
      ctx.dati.versoCassetta = THREE.MathUtils.clamp(Math.atan2(d.x, d.y) - versoCamera(), -0.6, 0.6); // si gira, ma il viso resta verso di noi
    }
    // svegliarsi di soprassalto se dormiva
    if (att?.nome === "dormi") { att.a.fine?.(att.ctx); libera(); att = null; }
    reaz = { nome, r, t: 0, ctx };
    r.inizia(ctx);
    if (nome === "saluta" || nome === "carezza") albero.viso.guarda(0, 0.15); // ci guarda negli occhi
  }

  return {
    reagisci,
    /** Solo per le prove: avvia subito un'attività. @param {string} nome */
    avvia(nome) { reaz = null; avvia(nome); },
    /** @param {string} u */
    umore(u) { umore = u; albero.viso.umore(u); },
    /** @param {string} a */
    azione(a) { azione = a; if (att && AZIONI[att.nome]) att.t = att.a.durata; },
    /** Il mondo è cambiato (ora, meteo): interrompe le attività che non c'entrano più. */
    mondoCambiato() {
      const notte = op.mondo.ora === "notte";
      if (notte !== primaNotte) {
        if (!notte) sveglia = true;
        primaNotte = notte;
        if (att) att.t = att.a.durata;
      }
      const piove = op.mondo.cielo === "pioggia" || op.mondo.cielo === "temporale";
      if (att?.nome === "ripara" && !piove) att.t = att.a.durata;
    },
    // ---- trascinamento
    prendi() {
      if (att) { att.a.fine?.(att.ctx); libera(); att = null; }
      preso = true; caduta = false; reaz = null; meta = null;
      albero.viso.breve("spaventato", 60);
      altezza = 0;
    },
    /** @param {THREE.Vector3} p punto del terreno sotto il puntatore */
    trascina(p) {
      presa.copy(p);
      const l = Math.hypot(p.x, p.z), max = RAGGIO_RADURA - 1;
      if (l > max) presa.multiplyScalar(max / l);
    },
    lascia() {
      if (!preso) return;
      preso = false; caduta = true; vy = 0;
      casa.set(THREE.MathUtils.clamp(pos.x, op.limiti.x0, op.limiti.x1), THREE.MathUtils.clamp(pos.y, op.limiti.z0, op.limiti.z1));
    },
    get preso() { return preso; },
    /** Posizione sul prato (x, z): si può spostare per non sovrapporsi agli altri. */
    get posizione() { return pos; },
    get casa() { return casa; },

    /** @param {number} dt @param {number} t */
    aggiorna(dt, t) {
      const p = posaBase();
      const terra = quota(pos.x, pos.y);

      if (op.ridotto) {
        // solo respiro e battito di ciglia
        applica(p, dt, t, terra, 0);
        return;
      }

      if (preso || caduta) {
        if (preso) {
          pos.lerp(new THREE.Vector2(presa.x, presa.z), 1 - Math.exp(-12 * dt));
          altezza = verso(altezza, 1.4, 8, dt);
          // gambe a penzoloni che scalciano, braccia in alto
          p.gambe = [Math.sin(t * 13) * 0.55, -Math.sin(t * 13) * 0.55];
          p.bracci[0].alza = p.bracci[1].alza = 1.7 + Math.sin(t * 11) * 0.3;
          p.piega = Math.sin(t * 5) * 0.12;
          p.allunga = 0.05;
        } else {
          vy -= 14 * dt;
          altezza += vy * dt;
          if (altezza <= 0) {
            altezza = 0;
            if (vy < -1.5) vy = -vy * 0.3; else { caduta = false; vy = 0; albero.viso.pulisci(); reagisci("posato"); }
          }
          p.bracci[0].alza = p.bracci[1].alza = 1.2;
          p.gambe = [0.3, -0.3];
        }
        applica(p, dt, t, terra, altezza);
        return;
      }

      // attività
      if (!att || att.t >= att.a.durata) prossima();
      let camminando = false;
      if (att) {
        att.t += dt;
        att.a.posa(p, att.t, att.ctx);
        if (att.a.percorso && !reaz) {
          const q = att.a.percorso(att.t);
          const d = new THREE.Vector2(casa.x + q.x - pos.x, casa.y + q.z - pos.y);
          const dist = d.length();
          if (dist > 0.04) {
            camminando = true;
            pos.addScaledVector(d.normalize(), Math.min(dist, (q.vel ?? 0.9) * dt));
            giro = Math.atan2(d.x, d.y);
            velPasso = (q.vel ?? 0.9) / 0.9;
          }
        }
        if (att.a.cammina && meta) {
          const d = meta.clone().sub(pos);
          const dist = d.length();
          if (dist > 0.08 && !reaz) {
            camminando = true;
            const vel = umore === "energico" ? 1.15 : umore === "malinconico" || umore === "assonnato" ? 0.55 : 0.85;
            pos.addScaledVector(d.normalize(), Math.min(dist, vel * dt));
            giro = Math.atan2(d.x, d.y);
            att.t = Math.min(att.t, att.a.durata - 1);
          } else if (dist <= 0.08) {
            meta = null;
            giro = 0;
            att.t = Math.max(att.t, att.a.durata - 0.6);
          }
        }
      }
      if (camminando) {
        fasePasso += dt * 9 * velPasso;
        p.gambe = [Math.sin(fasePasso) * 0.55, -Math.sin(fasePasso) * 0.55];
        p.salto = Math.abs(Math.sin(fasePasso)) * 0.05;
        p.piega = Math.sin(fasePasso) * 0.05;
        if (!att?.a.percorso) {
          p.bracci[0].avanti = -Math.sin(fasePasso) * 0.35;
          p.bracci[1].avanti = Math.sin(fasePasso) * 0.35;
        }
        p.giro = giro;
      } else {
        // da fermo si gira verso di noi (la camera): l'attività può aggiungere un piccolo giro
        velPasso = 1;
        const dondolo = att?.nome === "dormi" ? 0 : Math.sin(t * 0.23) * 0.12;
        p.giro = versoCamera() + (p.giro || dondolo);
      }

      // freddo: trema e si stringe (sopra tutto, tranne quando dorme)
      if (op.mondo.temperatura < 2 || op.mondo.cielo === "neve") {
        if (att?.nome !== "dormi") {
          p.piega += Math.sin(t * 38) * 0.018;
          if (!att || !AZIONI[att.nome]) {
            p.bracci[0].avanti = p.bracci[1].avanti = 1.25;
            p.bracci[0].alza = p.bracci[1].alza = -0.25;
          }
          if (Math.random() < dt * 0.25) albero.viso.breve("trema", 1.5);
        }
      }

      // micro-espressioni dell'umore
      prossimaMicro -= dt;
      if (prossimaMicro <= 0 && !reaz && att?.nome !== "dormi") {
        prossimaMicro = 5 + Math.random() * 5;
        const lista = MICRO[umore] ?? MICRO.curioso;
        const m = lista[Math.floor(Math.random() * lista.length)];
        albero.viso.breve(m, m === "ride" ? 1.6 : m === "sospira" ? 2.2 : m === "canticchia" ? 3.2 : 1.4);
        if (m === "canticchia") { albero.viso.parla(3, true); if (!op.ridotto) albero.effetti.emetti("nota", 2); }
      }
      // il corpo segue il viso: ride scuotendo il tronco, sospira alzando il petto, canticchia dondolando
      const ride = albero.viso.intensita("ride"), sospiro = albero.viso.intensita("sospira"), canto = albero.viso.intensita("canticchia");
      if (ride) { p.piega += Math.sin(t * 26) * 0.05 * ride; p.salto += Math.abs(Math.sin(t * 13)) * 0.035 * ride; }
      if (sospiro) { p.allunga += 0.05 * sospiro; p.inchino -= 0.06 * sospiro; for (const b of p.bracci) b.alza -= 0.15 * sospiro; }
      if (canto) p.piega += Math.sin(t * 3.2) * 0.07 * canto;

      // reazione sopra a tutto
      if (reaz) {
        reaz.t += dt;
        p.giro = 0;
        reaz.r.posa(p, reaz.t, reaz.ctx);
        p.giro += versoCamera(); // le reazioni sono sempre rivolte a noi
        if (reaz.t >= reaz.r.durata) reaz = null;
      }
      pos.x = THREE.MathUtils.clamp(pos.x, op.limiti.x0, op.limiti.x1);
      pos.y = THREE.MathUtils.clamp(pos.y, op.limiti.z0, op.limiti.z1);
      applica(p, dt, t, terra, 0);
      raddrizza();
    },
    distruggi() { if (att) att.a.fine?.(att.ctx); libera(); },
  };

  /** Gli oggetti segnati con userData.diritto restano dritti (ombrelli, tazze), qualunque sia il braccio. */
  function raddrizza() {
    const qPadre = new THREE.Quaternion(), qVoluto = new THREE.Quaternion(), e = new THREE.Euler();
    albero.radice.updateMatrixWorld(true);
    for (const o of oggetti) {
      if (!o.userData.diritto || !o.parent) continue;
      o.parent.getWorldQuaternion(qPadre);
      const [x, y, z] = o.userData.diritto;
      qVoluto.setFromEuler(e.set(x, albero.radice.rotation.y + y, z));
      o.quaternion.copy(qPadre.invert().multiply(qVoluto));
    }
  }

  /**
   * Fonde la posa bersaglio con quella attuale e la mette sulle ossa.
   * @param {Posa} p @param {number} dt @param {number} t @param {number} terra @param {number} sopra
   */
  function applica(p, dt, t, terra, sopra) {
    const v = 12, vb = 16;
    ora.giro = verso(ora.giro, p.giro, 6, dt);
    ora.salto = verso(ora.salto, p.salto, 20, dt);
    ora.seduto = verso(ora.seduto, p.seduto, 5, dt);
    ora.inchino = verso(ora.inchino, p.inchino, v, dt);
    ora.piega = verso(ora.piega, p.piega, v, dt);
    ora.allunga = verso(ora.allunga, p.allunga, v, dt);
    ora.divarica = verso(ora.divarica, p.divarica, v, dt);
    for (let i = 0; i < 2; i++) {
      ora.bracci[i].alza = verso(ora.bracci[i].alza, p.bracci[i].alza, vb, dt);
      ora.bracci[i].avanti = verso(ora.bracci[i].avanti, p.bracci[i].avanti, vb, dt);
      ora.bracci[i].giro = verso(ora.bracci[i].giro, p.bracci[i].giro, vb, dt);
      ora.gambe[i] = verso(ora.gambe[i], p.gambe[i], vb, dt);
    }
    const a = albero;
    const s = a.scala.scale.x;
    a.radice.position.set(pos.x, terra + (ora.salto + sopra) * s, pos.y);
    a.radice.rotation.y = ora.giro;
    a.scala.position.y = -ora.seduto * 0.3 * s;
    a.corpo.rotation.x = ora.inchino;
    a.corpo.rotation.z = ora.piega;
    // respiro: lento quando dorme
    const lento = att?.nome === "dormi" ? 0.55 : 1;
    const r = Math.sin(t * 1.6 * lento);
    a.busto.scale.set(1 - 0.006 * r, 1 + 0.012 * r + ora.allunga, 1 - 0.006 * r);
    a.chioma.scale.setScalar(1 + 0.025 * r);
    a.chioma.position.y = a.busto.scale.y * a.chioma.userData.y0;
    // braccia: alza positivo = in su (per entrambi), avanti positivo = verso chi guarda
    a.bracci[1].rotation.set(ora.bracci[1].giro, -ora.bracci[1].avanti, ora.bracci[1].alza);
    a.bracci[0].rotation.set(ora.bracci[0].giro, ora.bracci[0].avanti, -ora.bracci[0].alza);
    for (let i = 0; i < 2; i++) {
      a.gambe[i].rotation.x = ora.gambe[i] - 1.35 * ora.seduto;
      a.gambe[i].rotation.z = (i ? 1 : -1) * ora.divarica;
    }
  }
}
