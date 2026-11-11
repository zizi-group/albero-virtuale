// Le 23 azioni del giorno (gli id di src/lib/albero/azioni.ts), ognuna con la sua
// animazione e i suoi oggetti 3D. Ogni azione è un'Attivita (comportamento.js):
// prepara gli oggetti, muove la posa nel tempo, dà espressioni al viso.
import * as THREE from "three";
import { busta } from "./casuale.js";
import { mat, ovale } from "./forme.js";
import * as O from "./oggetti.js";
import { texAlone } from "./texture.js";

/** @typedef {import("./comportamento.js").Attivita} Attivita */
/** @typedef {import("./comportamento.js").Posa} Posa */
/** @typedef {import("./comportamento.js").Contesto} Contesto */

/** Due braccia verso un oggetto tenuto davanti. @param {Posa} p @param {number} k @param {number} [alza] */
const dueMani = (p, k, alza = 0.15) => {
  for (const b of p.bracci) { b.alza = -0.15 + (alza + 0.15) * k; b.avanti = 1.15 * k; }
};

/** Gocce d'acqua che cadono da un punto (doccia, annaffiatoio). */
function gocce(/** @type {number} */ n) {
  const g = new THREE.Group();
  const m = mat("#8fd0f6", { roughness: 0.1, transparent: true, opacity: 0.85 });
  for (let i = 0; i < n; i++) {
    const d = ovale(0.018, 0.03, 0.018, m, true);
    d.userData.f = i / n;
    g.add(d);
  }
  /** @param {number} t @param {THREE.Vector3} da @param {number} giu @param {number} larg */
  g.userData.muovi = (t, da, giu, larg) => {
    g.children.forEach((d, i) => {
      const f = (t * 1.6 + d.userData.f) % 1;
      d.position.set(da.x + Math.sin(i * 12.9) * larg, da.y - f * giu, da.z + Math.cos(i * 7.3) * larg);
      d.visible = f > 0.05;
    });
  };
  return g;
}

/** Vapore della tisana: sprite morbidi che salgono. */
function vapore() {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texAlone("255,255,255", 0.8), transparent: true, depthWrite: false }));
    s.userData.f = i / 4;
    g.add(s);
  }
  /** @param {number} t */
  g.userData.muovi = (t) => {
    g.children.forEach((s, i) => {
      const f = (t * 0.5 + s.userData.f) % 1;
      s.position.set(Math.sin(t * 2 + i) * 0.03, 0.08 + f * 0.3, 0);
      s.scale.setScalar(0.06 + f * 0.12);
      /** @type {THREE.SpriteMaterial} */ (/** @type {THREE.Sprite} */ (s).material).opacity = (1 - f) * 0.6;
    });
  };
  return g;
}

/** Nuvoletta della doccia. */
function nuvoletta() {
  const g = new THREE.Group();
  const bianco = mat("#f6faff", { roughness: 1 });
  for (const [x, y, z, r] of [[0, 0, 0, 0.28], [0.26, -0.04, 0, 0.2], [-0.26, -0.03, 0.02, 0.22], [0.1, 0.12, -0.02, 0.2]]) {
    const b = ovale(r, r * 0.8, r, bianco);
    b.position.set(x, y, z);
    g.add(b);
  }
  return g;
}

/** @type {Record<string, Attivita>} */
export const AZIONI = {
  "guardare-cielo": {
    durata: 11,
    inizia: (c) => { c.viso.breve({ sguardoY: 1, palpebra: 0.3, sorriso: 0.9, guance: 0.8 }, 10.5); c.dati.telo = c.aTerra(O.telo(), 0, -0.35); },
    posa: (p, t) => {
      const k = busta(t, 11, 1, 1);
      p.seduto = k;
      p.inchino = -0.55 * k;
      p.bracci[0].alza = p.bracci[1].alza = 0.5 * k;
      p.bracci[0].avanti = p.bracci[1].avanti = -0.9 * k;
      p.gambe = [Math.sin(t * 1.2) * 0.15 * k, -Math.sin(t * 1.2) * 0.15 * k];
      if (t > 4 && t < 6) p.bracci[1].alza = 1.6 * busta(t - 4, 2);
    },
  },
  leggere: {
    durata: 12,
    inizia: (c) => {
      c.dati.l = c.davanti(O.libro(["#8b3a3a", "#2f6a9a", "#3a7a3a"][Math.floor(Math.random() * 3)]), 0.62, 0.22);
      c.dati.l.rotation.x = 0.9;
      c.dati.l.scale.setScalar(1.6);
      c.viso.breve({ sguardoY: -0.8, sorriso: 0.5, palpebra: 0.15 }, 11.5);
    },
    posa: (p, t, c) => {
      const k = busta(t, 12, 0.8, 0.8);
      p.seduto = k;
      dueMani(p, k, -0.25);
      p.inchino = 0.08 * k;
      if (t > 5 && t < 5.1 && !c.dati.r) { c.dati.r = 1; c.viso.breve("ride", 1.4); }
      if (t > 8.5 && !c.dati.s) { c.dati.s = 1; c.viso.breve("sorpreso", 0.9); c.emetti("!", 1); }
    },
  },
  "giornale-ombrello": {
    durata: 12,
    inizia: (c) => {
      c.dati.g = c.davanti(O.giornale(), 0.82, 0.3);
      c.dati.o = c.inMano(1, O.ombrello(["#e04a3a", "#3a8ad0", "#f0b828"][Math.floor(Math.random() * 3)]));
      c.dati.o.position.set(0, 0.05, 0);
      c.dati.o.userData.diritto = [0, 0, 0.12];
      c.viso.breve({ sguardoY: -0.5, sorriso: 0.35, storta: 0.3, guance: 0.5 }, 11.5);
    },
    posa: (p, t, c) => {
      const k = busta(t, 12, 0.6, 0.6);
      p.bracci[0].alza = 0.1 * k; p.bracci[0].avanti = 1.2 * k;
      p.bracci[1].alza = 1.25 * k; p.bracci[1].avanti = 0.35 * k;
      c.dati.g.rotation.y = Math.sin(t * 0.4) * 0.1;
      if (t > 6 && !c.dati.a) { c.dati.a = 1; c.viso.breve("sorpreso", 1); }
    },
  },
  doccia: {
    durata: 10,
    inizia: (c) => {
      c.dati.n = c.davanti(nuvoletta(), c.albero.altezza + 0.5, -0.5);
      c.dati.g = c.davanti(gocce(26), 0, 0);
      c.dati.g.position.set(0, 0, 0);
      c.viso.breve("ride", 9.5);
    },
    posa: (p, t, c) => {
      const k = busta(t, 10, 0.6, 0.6);
      p.bracci[0].alza = p.bracci[1].alza = (1.5 + Math.sin(t * 8) * 0.3) * k;
      p.bracci[0].avanti = p.bracci[1].avanti = 0.5 * k;
      p.piega = Math.sin(t * 4) * 0.1 * k;
      c.dati.n.position.x = Math.sin(t) * 0.1;
      c.dati.g.userData.muovi(t, new THREE.Vector3(0, c.albero.altezza + 0.3, 0.02), c.albero.altezza * 0.9, 0.35);
      if (Math.floor(t) % 3 === 0 && !c.dati["n" + Math.floor(t)]) { c.dati["n" + Math.floor(t)] = 1; c.emetti("nota", 1); }
    },
  },
  "prendere-sole": {
    durata: 12,
    inizia: (c) => {
      c.dati.t = c.aTerra(O.telo(), 0, -0.2);
      c.dati.o = c.davanti(O.occhialiSole(), 0.95, 0.03);
      c.viso.breve({ felice: 0.9, sorriso: 1, guance: 1 }, 11.5);
    },
    posa: (p, t) => {
      const k = busta(t, 12, 1, 1);
      p.seduto = k;
      p.inchino = -0.4 * k;
      p.bracci[0].alza = p.bracci[1].alza = 0.9 * k;
      p.bracci[0].avanti = p.bracci[1].avanti = -1.1 * k;
      p.gambe = [Math.sin(t * 0.8) * 0.12 * k, 0];
    },
  },
  passeggiata: {
    durata: 14,
    inizia: (c) => { c.viso.parla(3, true); c.emetti("nota", 2); },
    percorso: (t) => {
      const a = (t / 14) * Math.PI * 2;
      return { x: Math.sin(a) * 1.2, z: (1 - Math.cos(a)) * -0.6, vel: 0.6 };
    },
    posa: (p) => {
      // mani dietro la schiena
      p.bracci[0].alza = p.bracci[1].alza = -0.6;
      p.bracci[0].avanti = p.bracci[1].avanti = -0.9;
    },
  },
  dormire: {
    durata: 14,
    inizia: (c) => { c.dati.c = c.aTerra(O.cuscino(), 0, -0.55); c.dati.z = 0; },
    posa: (p, t, c) => {
      const k = busta(t, 14, 1.2, 1);
      p.seduto = k;
      p.inchino = -0.35 * k;
      p.piega = 0.15 * k;
      p.bracci[0].alza = p.bracci[1].alza = -0.6 * k;
      p.bracci[0].avanti = p.bracci[1].avanti = 0.6 * k;
      if (k > 0.8) c.viso.breve("dorme", 0.3);
      if (t - c.dati.z > 2.4 && k > 0.8) { c.dati.z = t; c.emetti("zzz", 1); }
    },
  },
  sonnellino: {
    durata: 9,
    inizia: (c) => { c.dati.z = 0; c.viso.breve("sbadiglia", 1.6); },
    posa: (p, t, c) => {
      const k = busta(t - 1.2, 7.8, 0.8, 0.6);
      p.seduto = k;
      p.inchino = (0.22 + Math.sin(t * 0.8) * 0.06) * k;
      p.bracci[0].avanti = p.bracci[1].avanti = 1.0 * k;
      p.bracci[0].alza = p.bracci[1].alza = -0.4 * k;
      if (k > 0.7) c.viso.breve({ dorme: 1, sorriso: 0.3 }, 0.3);
      if (t - c.dati.z > 2.2 && k > 0.7) { c.dati.z = t; c.emetti("zzz", 1); }
    },
  },
  telefonata: {
    durata: 11,
    inizia: (c) => {
      const tel = c.inMano(1, O.telefono());
      tel.position.set(0.02, 0.06, 0.06);
      tel.scale.multiplyScalar(1.5);
      tel.userData.diritto = [0, -1.3, 0];
      c.viso.parla(10.5);
    },
    posa: (p, t, c) => {
      const k = busta(t, 11, 0.6, 0.6);
      p.bracci[1].alza = 0.5 * k; p.bracci[1].avanti = 1.15 * k; p.bracci[1].giro = -0.4 * k;
      p.bracci[0].alza = (0.3 + Math.sin(t * 3) * 0.35) * k; p.bracci[0].avanti = 0.7 * k;
      p.piega = Math.sin(t * 1.5) * 0.06;
      p.gambe = [Math.max(0, Math.sin(t * 2)) * 0.25, 0];
      if (t > 3 && !c.dati.a) { c.dati.a = 1; c.viso.breve("ride", 1.3); }
      if (t > 7 && !c.dati.b) { c.dati.b = 1; c.viso.breve("sorpreso", 0.8); c.emetti("!", 1); }
    },
  },
  corsa: {
    durata: 12,
    inizia: (c) => c.viso.breve({ sorpresa: 0.2, aperta: 0.55, sorriso: 1.1, guance: 1.2 }, 11.5),
    percorso: (t) => {
      const a = (t / 6) * Math.PI * 2;
      return { x: Math.sin(a) * 1.3, z: (Math.cos(a) - 1) * 0.7, vel: 1.5 };
    },
    posa: (p, t, c) => {
      p.bracci[0].alza = p.bracci[1].alza = 0.2;
      p.bracci[0].avanti = Math.sin(t * 16) * 0.9;
      p.bracci[1].avanti = -Math.sin(t * 16) * 0.9;
      p.inchino = 0.12;
      if (Math.floor(t * 0.5) !== c.dati.g) { c.dati.g = Math.floor(t * 0.5); c.emetti("goccia", 1); }
    },
  },
  allenarsi: {
    durata: 11,
    inizia: (c) => {
      for (const i of [0, 1]) { const m = c.inMano(i, O.manubrio()); m.userData.diritto = [0, Math.PI / 2, 0]; m.position.y = 0.03; }
      c.viso.breve({ aperta: 0.3, sorriso: 0.9, sorpresa: 0.15, guance: 1.1 }, 10.5);
    },
    posa: (p, t, c) => {
      const k = busta(t, 11, 0.5, 0.6);
      const su = (Math.sin(t * 3.2) + 1) / 2;
      p.bracci[0].alza = p.bracci[1].alza = (-0.3 + 1.9 * su) * k;
      p.bracci[0].avanti = p.bracci[1].avanti = 0.35 * k;
      p.seduto = 0.25 * (1 - su) * k;
      p.allunga = 0.03 * su * k;
      if (Math.floor(t / 2.5) !== c.dati.g) { c.dati.g = Math.floor(t / 2.5); c.emetti("goccia", 1); }
    },
  },
  dipingere: {
    durata: 14,
    inizia: (c) => {
      c.dati.cav = c.aTerra(O.cavalletto(), 0.85, 0.75, -0.9); // davanti a lui, di lato
      c.dati.p = c.inMano(1, O.pennello());
      c.viso.breve({ sorriso: 0.75, storta: 0.25, sguardoX: 0.8, sguardoY: 0.2, guance: 0.8 }, 13.5);
    },
    posa: (p, t, c) => {
      const k = busta(t, 14, 0.6, 0.6);
      p.giro = 0.65 * k;
      p.bracci[1].alza = (0.55 + Math.sin(t * 7) * 0.18) * k;
      p.bracci[1].avanti = (1.0 + Math.cos(t * 7) * 0.12) * k;
      p.bracci[0].alza = 0.1; p.bracci[0].avanti = 0.6;
      const colori = /** @type {THREE.Mesh[]} */ (c.dati.cav.userData.colori);
      colori.forEach((m, i) => m.scale.setScalar(Math.max(0.001, Math.min(1, (t - 1.5 - i * 2.2) / 1.2))));
      if (t > 12.5 && !c.dati.f) { c.dati.f = 1; c.viso.breve("cuoricini", 1.4); c.emetti("stella", 2); }
    },
  },
  "scrivere-poesia": {
    durata: 13,
    inizia: (c) => {
      const q = c.davanti(O.quaderno(), 0.58, 0.22);
      q.rotation.x = 0.6;
      q.scale.setScalar(1.5);
      c.dati.q = q;
      const pen = c.inMano(1, O.penna());
      pen.rotation.set(0.6, 0, -0.6);
      c.viso.breve({ sguardoY: -0.7, sorriso: 0.55, palpebra: 0.2 }, 6);
    },
    posa: (p, t, c) => {
      const k = busta(t, 13, 0.8, 0.8);
      p.seduto = k;
      const pensa = t > 6 && t < 8.5;
      p.bracci[1].alza = (pensa ? 0.75 : -0.15 + Math.sin(t * 9) * 0.05) * k;
      p.bracci[1].avanti = (pensa ? 1.3 : 1.15 + Math.cos(t * 9) * 0.05) * k;
      p.bracci[0].alza = -0.2 * k; p.bracci[0].avanti = 1.0 * k;
      if (pensa && !c.dati.p) { c.dati.p = 1; c.viso.breve({ sguardoY: 0.9, sguardoX: 0.5, palpebra: 0.4, sorriso: 0.7 }, 2.4); c.emetti("?", 1); }
      if (t > 8.5 && !c.dati.c) { c.dati.c = 1; c.viso.parla(3.5, true); c.emetti("nota", 2); }
    },
  },
  meditare: {
    durata: 13,
    inizia: (c) => c.viso.breve({ dorme: 1, sorriso: 0.65, guance: 0.8 }, 12.5),
    posa: (p, t) => {
      const k = busta(t, 13, 1, 1);
      p.seduto = k;
      p.salto = (0.12 + Math.sin(t * 1.1) * 0.05) * k; // leggero, sembra fluttuare
      p.bracci[0].alza = p.bracci[1].alza = 0.25 * k;
      p.bracci[0].avanti = p.bracci[1].avanti = 0.35 * k;
      p.gambe = [0.2 * k, 0.2 * k];
      p.divarica = 0.3 * k;
    },
  },
  pensare: {
    durata: 10,
    inizia: (c) => { c.viso.breve({ sguardoY: 0.8, sguardoX: -0.6, sorriso: 0.3, storta: 0.4, palpebra: 0.2 }, 9); c.emetti("?", 1); },
    percorso: (t) => ({ x: Math.sin(t * 0.6) * 0.6, z: 0, vel: 0.45 }),
    posa: (p, t, c) => {
      const k = busta(t, 10, 0.6, 0.6);
      p.bracci[1].alza = 0.65 * k; p.bracci[1].avanti = 1.35 * k; p.bracci[1].giro = 0.3 * k;
      p.bracci[0].alza = -0.4 * k; p.bracci[0].avanti = -0.6 * k;
      if (t > 8.2 && !c.dati.i) { c.dati.i = 1; c.viso.breve("sorpreso", 0.6); c.emetti("!", 1); }
      if (t > 8.9 && !c.dati.r) { c.dati.r = 1; c.viso.breve("ride", 1); }
    },
  },
  "contare-ghiande": {
    durata: 12,
    inizia: (c) => {
      c.dati.g = [0, 1, 2, 3, 4].map((i) => {
        const g = c.aTerra(O.ghianda(), -0.5 + i * 0.25, 0.75);
        g.scale.setScalar(1.6);
        return g;
      });
      c.dati.n = 0;
      c.viso.breve({ sguardoY: -0.9, sorriso: 0.7 }, 11.5);
    },
    posa: (p, t, c) => {
      const k = busta(t, 12, 0.8, 0.8);
      p.seduto = k;
      const n = Math.min(5, Math.floor((t - 1) / 2));
      const f = ((t - 1) % 2) / 2;
      p.bracci[1].alza = (-0.7 + Math.sin(f * Math.PI) * 0.5) * k;
      p.bracci[1].avanti = 1.1 * k;
      p.inchino = 0.12 * Math.sin(f * Math.PI) * k;
      if (n > c.dati.n && n <= 5) {
        c.dati.n = n;
        const g = c.dati.g[n - 1];
        if (g) g.position.y += 0.06;
        c.emetti(n === 5 ? "stella" : "!", 1);
        if (n === 5) c.viso.breve("ride", 1.6);
      }
    },
  },
  "vendere-ombra": {
    durata: 12,
    inizia: (c) => {
      c.dati.c = c.aTerra(O.cartello(), -1.05, 0.75, 0.35); // davanti, alla sua destra: sempre in vista
      c.viso.breve({ palpebra: 0.25, sorriso: 0.95, storta: 0.6, guance: 0.8 }, 11.5);
    },
    posa: (p, t, c) => {
      const k = busta(t, 12, 0.6, 0.6);
      p.allunga = 0.04 * k;
      p.inchino = -0.08 * k;
      p.bracci[0].alza = (0.4 + Math.sin(t * 2) * 0.1) * k; p.bracci[0].avanti = 0.3 * k;
      p.bracci[1].alza = (0.9 + (t > 5 && t < 7 ? Math.sin(t * 12) * 0.3 : 0)) * k; p.bracci[1].avanti = 0.2 * k;
      if (t > 5 && !c.dati.o) { c.dati.o = 1; c.viso.breve("occhiolino", 1.2); c.viso.parla(1.6); }
    },
  },
  "chiacchierare-scoiattolo": {
    durata: 13,
    inizia: (c) => {
      c.dati.s = c.aTerra(O.scoiattolo(), 0.95, 0.55, -2.2);
      c.dati.s.scale.setScalar(1.3);
      c.viso.breve({ sguardoX: 0.8, sguardoY: -0.6, sorriso: 0.9, guance: 0.9 }, 12.5);
    },
    posa: (p, t, c) => {
      const k = busta(t, 13, 0.6, 0.6);
      p.giro = 0.55 * k;
      p.inchino = 0.15 * k;
      const parlaLui = Math.floor(t / 2.2) % 2 === 0;
      if (parlaLui && c.dati.turno !== Math.floor(t / 2.2)) { c.dati.turno = Math.floor(t / 2.2); c.viso.parla(2); }
      if (!parlaLui && c.dati.turno !== Math.floor(t / 2.2)) { c.dati.turno = Math.floor(t / 2.2); c.viso.breve(Math.random() < 0.5 ? "ride" : "sorpreso", 1.2); c.emetti(Math.random() < 0.5 ? "?" : "nota", 1); }
      p.bracci[1].alza = (parlaLui ? 0.4 + Math.sin(t * 5) * 0.3 : 0) * k;
      p.bracci[1].avanti = 0.8 * k;
      const s = /** @type {THREE.Object3D} */ (c.dati.s);
      s.userData.coda.rotation.x = Math.sin(t * 6) * 0.25;
      s.position.y = s.userData.y0 ??= s.position.y;
      if (!parlaLui) s.position.y += Math.abs(Math.sin(t * 9)) * 0.05;
    },
  },
  "fare-valigia": {
    durata: 12,
    inizia: (c) => {
      c.dati.v = c.aTerra(O.valigia(), 0.75, 0.6, -0.4);
      c.viso.breve({ sorriso: 1, aperta: 0.3, guance: 0.9 }, 11.5);
      c.dati.n = 0;
    },
    posa: (p, t, c) => {
      const k = busta(t, 12, 0.6, 0.6);
      p.giro = 0.4 * k;
      // prende qualcosa dalla chioma e lo mette in valigia
      const f = (t % 3) / 3;
      p.bracci[1].alza = (f < 0.5 ? 2.0 * Math.sin(f * 2 * Math.PI) - 0.2 : -0.7 * Math.sin((f - 0.5) * 2 * Math.PI)) * k;
      p.bracci[1].avanti = 0.9 * k;
      p.inchino = (f > 0.5 ? 0.3 * Math.sin((f - 0.5) * 2 * Math.PI) : 0) * k;
      const n = Math.floor(t / 3);
      if (n !== c.dati.n) {
        c.dati.n = n;
        if (n >= 3) { c.viso.breve("ride", 1.5); c.emetti("stella", 2); }
        else c.emetti("!", 1);
      }
      c.dati.v.position.y = c.dati.y0 ??= c.dati.v.position.y;
      if (f > 0.7 && f < 0.8) c.dati.v.position.y += 0.03;
    },
  },
  "studiare-mappa": {
    durata: 11,
    inizia: (c) => {
      const m = c.davanti(O.mappa(), 0.82, 0.34);
      m.scale.setScalar(1.4);
      m.rotation.x = -0.35;
      c.dati.m = m;
      c.viso.breve({ sguardoY: -0.4, sorriso: 0.5, sorpresa: 0.15 }, 6);
    },
    posa: (p, t, c) => {
      const k = busta(t, 11, 0.6, 0.6);
      dueMani(p, k, 0.3);
      c.dati.m.rotation.z = t > 3 && t < 6 ? Math.sin((t - 3) * 1.1) * 0.6 : 0;
      if (t > 4 && !c.dati.q) { c.dati.q = 1; c.emetti("?", 1); }
      if (t > 7.5) {
        if (!c.dati.e) { c.dati.e = 1; c.viso.breve("sorpreso", 0.8); c.emetti("!", 1); c.dati.m.visible = false; }
        p.bracci[1].alza = 1.1 * k; p.bracci[1].avanti = 0.3 * k;
        p.bracci[0].alza = -0.15; p.bracci[0].avanti = 0;
        p.giro = 0.5;
      }
    },
  },
  ballare: {
    durata: 12,
    inizia: (c) => { c.viso.breve("ride", 11.5); c.viso.parla(11, true); c.emetti("nota", 3); },
    posa: (p, t, c) => {
      const k = busta(t, 12, 0.4, 0.6);
      const b = t * 6.4;
      p.salto = Math.abs(Math.sin(b * 0.5)) * 0.14 * k;
      p.piega = Math.sin(b * 0.5) * 0.18 * k;
      p.giro = (Math.floor(t / 3) % 2 ? Math.sin(t * 2) * 0.8 : 0) * k;
      p.bracci[0].alza = (1.2 + Math.sin(b) * 0.6) * k;
      p.bracci[1].alza = (1.2 - Math.sin(b) * 0.6) * k;
      p.bracci[0].avanti = p.bracci[1].avanti = 0.3 * k;
      p.gambe = [Math.max(0, Math.sin(b * 0.5)) * 0.5 * k, Math.max(0, -Math.sin(b * 0.5)) * 0.5 * k];
      if (Math.floor(t / 2) !== c.dati.n) { c.dati.n = Math.floor(t / 2); c.emetti("nota", 1); }
    },
  },
  annaffiarsi: {
    durata: 11,
    inizia: (c) => {
      const a = c.inMano(1, O.annaffiatoio());
      a.position.set(0.02, 0.0, 0);
      a.userData.diritto = [0, Math.PI / 2, -0.7];
      c.dati.a = a;
      c.dati.g = c.davanti(gocce(18), 0, 0);
      c.viso.breve({ felice: 0.8, sorriso: 1.1, guance: 1 }, 10.5);
    },
    posa: (p, t, c) => {
      const k = busta(t, 11, 0.6, 0.6);
      p.bracci[1].alza = 0.85 * k; p.bracci[1].avanti = 0.95 * k;
      c.dati.a.userData.diritto = [0, Math.PI / 2, -0.7 * k + Math.sin(t * 2) * 0.1];
      const becco = new THREE.Vector3();
      c.dati.a.userData.becco.getWorldPosition(becco);
      c.dati.g.parent.worldToLocal(becco);
      c.dati.g.userData.muovi(t, becco, 1.2, 0.08);
      c.dati.g.visible = k > 0.5;
      if (t > 6 && !c.dati.r) { c.dati.r = 1; c.viso.breve("ride", 1.5); c.emetti("cuore", 2); }
    },
  },
  "bere-tisana": {
    durata: 12,
    inizia: (c) => {
      const tz = c.inMano(1, O.tazza());
      tz.position.set(0, 0.06, 0.08);
      tz.scale.multiplyScalar(1.3);
      tz.userData.diritto = [0, 0, 0];
      const v = vapore();
      tz.add(v);
      c.dati.v = v;
      c.viso.breve({ palpebra: 0.35, sorriso: 0.85, guance: 1 }, 11.5);
    },
    posa: (p, t, c) => {
      const k = busta(t, 12, 0.8, 0.8);
      p.seduto = k;
      const sorso = (t % 4) > 2.6 && (t % 4) < 3.6;
      p.bracci[1].alza = (sorso ? 0.5 : 0.15) * k;
      p.bracci[1].avanti = (sorso ? 1.35 : 1.1) * k;
      p.bracci[1].giro = sorso ? -0.4 : 0;
      p.bracci[0].alza = -0.2 * k; p.bracci[0].avanti = 1.0 * k;
      c.dati.v.userData.muovi(t);
      const n = Math.floor(t / 4);
      if (sorso && c.dati.s !== n) { c.dati.s = n; c.viso.breve({ felice: 1, sorriso: 1, guance: 1.3 }, 1.2); }
    },
  },
};
