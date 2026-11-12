// La foresta del club: centinaia di alberi degli altri membri, fermi, che
// ondeggiano col vento. Non usa gli alberi-personaggio (troppo pesanti per
// mille copie): ogni forma di chioma è un modello leggero disegnato in istanze
// (un modello, tante copie), in due livelli di dettaglio scelti dalla distanza.
// La specie e i colori vengono dal catalogo dei 30 modelli (modelli.js), come
// nel giardino: lo stesso albero ha la stessa specie dappertutto.
//
//   const f = creaForestaClub(canvas, { alberi, etichette, stagione, movimentoRidotto });
//   f.su("tocca-albero", ({ indice }) => …);  f.vaiAlMio();  f.zoom(0.8);
//   f.statistiche();  f.distruggi();
//
// Solo nel browser. Dipende da three e da modelli.js / casuale.js, non dal
// resto del motore.
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { generatore, hash, verso } from "./casuale.js";
import { modelloDaNumero, sistemaPosti } from "./clubPosti.js";
import { SPECIE } from "./modelli.js";

/**
 * @typedef {Object} AlberoClub
 * @property {string} seme hash pubblico dell'albero (grandezza, rotazione)
 * @property {number} modello numero in [0, 1) che sceglie il modello (come modelloDalSeme)
 * @property {string} nome
 * @property {string | null} [persona] nome di battesimo o iniziali, se consentiti
 * @property {number} crescita 0..1
 * @property {number} x posizione nel cerchio di raggio 1
 * @property {number} z
 * @property {boolean} [esempio] albero d'esempio della demo
 * @property {boolean} [mio] l'albero di chi guarda: bandierina e partenza della telecamera
 */

/**
 * @typedef {Object} OpzioniClub
 * @property {AlberoClub[]} alberi
 * @property {HTMLElement} etichette contenitore sopra la tela per i nomi
 * @property {"primavera"|"estate"|"autunno"|"inverno"} [stagione]
 * @property {boolean} [movimentoRidotto]
 * @property {boolean} [misura] include il lavoro della scheda grafica nei ms (legge un pixel, così aspetta la GPU): solo per le misure
 */

/** Quanti nomi al massimo sullo schermo. */
const MAX_NOMI = 14;
/** Oltre questa distanza della telecamera i nomi spariscono (tranne il tuo). */
const DISTANZA_NOMI = 62;

/** Tinta del tronco per corteccia. @type {Record<string, string>} */
const TRONCHI = { betulla: "#e6e0d2", chiara: "#a89a86", ulivo: "#8c8272", pino: "#7a4a2e", rossa: "#7a4630", scura: "#4e3424", liscia: "#857462", quercia: "#6a4a32", ciliegio: "#6e3e30" };

// ------------------------------------------------------------------ Geometrie

/** Sfera un po' bitorzoluta (chiome vicine). @param {number} seme @param {number} segmenti */
function sferaMorbida(seme, segmenti) {
  const g = new THREE.SphereGeometry(1, segmenti, Math.round(segmenti * 0.7));
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const d = 1 + 0.09 * Math.sin(v.x * 3.1 + seme) * Math.sin(v.y * 2.7 + seme * 2) + 0.07 * Math.sin(v.z * 4.3 - seme);
    p.setXYZ(i, v.x * d, v.y * d, v.z * d);
  }
  return g;
}

/** Cono a palchi (abeti, larici). @param {number} segmenti @param {number} palchi */
function conoAPalchi(segmenti, palchi) {
  /** @type {THREE.Vector2[]} */
  const profilo = [new THREE.Vector2(0, 0)];
  for (let i = 0; i < palchi; i++) {
    const y0 = i / palchi, y1 = (i + 1) / palchi, rb = 1 - (i / palchi) * 0.8;
    profilo.push(new THREE.Vector2(rb, y0 + 0.02), new THREE.Vector2(rb * 0.4, y1 - 0.02));
  }
  profilo.push(new THREE.Vector2(0, 1));
  return new THREE.LatheGeometry(profilo, segmenti);
}

/**
 * Prepara un pezzo: posizione, scala, colore per vertice e attributo «foglia»
 * (1 = chioma, prende il colore dell'albero; 0 = tronco, il suo colore).
 * @param {THREE.BufferGeometry} g @param {{ x?: number, y?: number, z?: number, sx?: number, sy?: number, sz?: number }} t
 * @param {number} foglia @param {number} chiaro luminosità di base del pezzo
 */
function pezzo(g, t, foglia, chiaro = 1) {
  g.scale(t.sx ?? 1, t.sy ?? 1, t.sz ?? 1);
  g.translate(t.x ?? 0, t.y ?? 0, t.z ?? 0);
  // normali morbide: si uniscono i vertici doppi (cuciture), si calcolano, poi
  // si torna a vertici separati per unire i pezzi
  for (const nome of Object.keys(g.attributes)) if (nome !== "position") g.deleteAttribute(nome);
  g = mergeVertices(g, 1e-4);
  g.computeVertexNormals();
  g = g.toNonIndexed();
  const n = g.attributes.position.count;
  const colori = new Float32Array(n * 3);
  const fo = new Float32Array(n);
  const p = g.attributes.position;
  for (let i = 0; i < n; i++) {
    // un po' più scuro in basso nella chioma: sembra più piena
    const y = p.getY(i);
    const ombra = foglia ? 0.78 + 0.22 * Math.min(1, Math.max(0, (y - (t.y ?? 0) + (t.sy ?? 1)) / (2 * (t.sy ?? 1)))) : 1;
    const c = chiaro * ombra * (foglia ? 0.94 + 0.12 * ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 : 1);
    colori[i * 3] = colori[i * 3 + 1] = colori[i * 3 + 2] = c;
    fo[i] = foglia;
  }
  g.setAttribute("color", new THREE.BufferAttribute(colori, 3));
  g.setAttribute("aFoglia", new THREE.BufferAttribute(fo, 1));
  return g;
}

/**
 * Le forme della chioma (come in modelli.js), in due dettagli. Misure in metri
 * per un albero adulto, con la base del tronco nell'origine.
 * @param {string} forma @param {boolean} vicino
 */
function geometriaForma(forma, vicino) {
  const sfera = (/** @type {number} */ s) => (vicino ? sferaMorbida(s, 14) : new THREE.IcosahedronGeometry(1, 1));
  const segT = vicino ? 7 : 5;
  const tronco = (/** @type {number} */ h, /** @type {number} */ r = 0.15) => pezzo(new THREE.CylinderGeometry(r * 0.65, r, h, segT, 1, true), { y: h / 2 }, 0);
  /** @type {THREE.BufferGeometry[]} */
  const parti = [];
  switch (forma) {
    case "cono": {
      parti.push(tronco(1.1), pezzo(conoAPalchi(vicino ? 14 : 7, vicino ? 4 : 2), { y: 0.55, sx: 1.25, sy: 3.7, sz: 1.25 }, 1));
      break;
    }
    case "colonna": {
      parti.push(tronco(0.7, 0.13), pezzo(sfera(2), { y: 2.45, sx: 0.62, sy: 2.15, sz: 0.62 }, 1));
      break;
    }
    case "stretta": {
      parti.push(tronco(1.2, 0.14), pezzo(sfera(3), { y: 2.9, sx: 0.78, sy: 1.85, sz: 0.78 }, 1));
      if (vicino) parti.push(pezzo(sferaMorbida(7, 10), { y: 3.9, x: 0.15, sx: 0.5, sy: 0.9, sz: 0.5 }, 1, 1.05));
      break;
    }
    case "ombrello": {
      // il pino marittimo: fusto alto e chioma piatta a ombrello
      parti.push(tronco(2.8, 0.16), pezzo(sfera(4), { y: 3.25, sx: 1.75, sy: 0.62, sz: 1.75 }, 1));
      if (vicino) parti.push(pezzo(sferaMorbida(9, 12), { y: 3.6, x: 0.5, sx: 1.0, sy: 0.45, sz: 1.0 }, 1, 1.06));
      break;
    }
    case "piangente": {
      parti.push(tronco(1.7), pezzo(sfera(5), { y: 2.75, sx: 1.45, sy: 1.05, sz: 1.45 }, 1));
      // la gonna di rami che cade
      parti.push(pezzo(new THREE.CylinderGeometry(1.42, 1.62, 1.6, vicino ? 16 : 8, 1, true), { y: 1.95 }, 1, 0.92));
      break;
    }
    case "larga": {
      parti.push(tronco(1.3, 0.17), pezzo(sfera(6), { y: 2.3, sx: 1.75, sy: 1.0, sz: 1.75 }, 1));
      if (vicino) parti.push(pezzo(sferaMorbida(2, 12), { y: 2.75, x: -0.6, z: 0.3, sx: 1.0, sy: 0.75, sz: 1.0 }, 1, 1.06));
      break;
    }
    case "ovale": {
      parti.push(tronco(1.5, 0.14), pezzo(sfera(8), { y: 2.95, sx: 1.0, sy: 1.55, sz: 1.0 }, 1));
      break;
    }
    default: {
      // tonda
      parti.push(tronco(1.6), pezzo(sfera(1), { y: 2.75, sx: 1.35, sy: 1.25, sz: 1.35 }, 1));
      if (vicino) {
        parti.push(pezzo(sferaMorbida(4, 12), { y: 3.35, x: 0.55, z: 0.25, sx: 0.85, sy: 0.75, sz: 0.85 }, 1, 1.06));
        parti.push(pezzo(sferaMorbida(6, 12), { y: 2.6, x: -0.7, z: -0.2, sx: 0.8, sy: 0.7, sz: 0.8 }, 1, 0.97));
      }
    }
  }
  return /** @type {THREE.BufferGeometry} */ (mergeGeometries(parti));
}

/** Altezza della cima, per mettere il nome sopra. @type {Record<string, number>} */
const CIMA = { cono: 4.4, colonna: 4.7, stretta: 4.9, ombrello: 3.9, piangente: 3.9, larga: 3.4, ovale: 4.6, tonda: 4.2 };
/** Raggio della chioma, per l'ombra a terra. @type {Record<string, number>} */
const RAGGIO = { cono: 1.3, colonna: 0.7, stretta: 0.85, ombrello: 1.8, piangente: 1.6, larga: 1.8, ovale: 1.0, tonda: 1.5 };

// ------------------------------------------------------------------ Materiali

const UNIF = { uTempo: { value: 0 }, uVento: { value: 1 } };

/** Materiale degli alberi: tronco e chioma, colore per istanza solo sulla chioma, vento. */
function materialeAlberi() {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTempo = UNIF.uTempo;
    s.uniforms.uVento = UNIF.uVento;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aFoglia;\nattribute vec3 aTronco;\nuniform float uTempo;\nuniform float uVento;")
      .replace(
        "#include <color_vertex>",
        `vColor = vec4(color, 1.0);
        vColor.rgb *= mix(aTronco, instanceColor, aFoglia);`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float fase = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.23;
        float alto = max(position.y - 0.8, 0.0);
        float spinta = sin(uTempo * 1.1 + fase) * 0.6 + sin(uTempo * 2.3 + fase * 1.7) * 0.25;
        transformed.x += spinta * uVento * 0.03 * alto * alto;
        transformed.z += cos(uTempo * 0.9 + fase) * uVento * 0.016 * alto * alto;`,
      );
  };
  m.customProgramCacheKey = () => "club-alberi";
  return m;
}

/** Ombra morbida a terra (canvas con un alone). */
function texOmbra() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
  const g = x.createRadialGradient(32, 32, 2, 32, 32, 31);
  g.addColorStop(0, "rgba(20,40,10,0.55)");
  g.addColorStop(0.6, "rgba(20,40,10,0.25)");
  g.addColorStop(1, "rgba(20,40,10,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Prato: macchie d'erba di toni diversi, ripetute. */
function texPrato() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
  x.fillStyle = "#8db85a";
  x.fillRect(0, 0, 256, 256);
  const r = generatore(7);
  for (let i = 0; i < 900; i++) {
    const tono = r();
    x.fillStyle = tono < 0.5 ? `rgba(98,140,58,${0.18 + r() * 0.2})` : `rgba(176,206,110,${0.15 + r() * 0.2})`;
    x.beginPath();
    x.ellipse(r() * 256, r() * 256, 2 + r() * 7, 1 + r() * 4, r() * Math.PI, 0, Math.PI * 2);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** @param {string} hex @param {string} altro @param {number} t */
const mescola = (hex, altro, t) => new THREE.Color(hex).lerp(new THREE.Color(altro), t);

/**
 * @param {HTMLCanvasElement} canvas
 * @param {OpzioniClub} op
 */
export function creaForestaClub(canvas, op) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  let rapporto = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(rapporto);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const cielo = new THREE.Color("#cfe6f2");
  const scena = new THREE.Scene();
  scena.background = cielo;
  scena.fog = new THREE.Fog(cielo, 40, 160);
  scena.add(new THREE.HemisphereLight("#e8f4ff", "#5a7a34", 1.6));
  const sole = new THREE.DirectionalLight("#fff1d6", 2.2);
  sole.position.set(30, 60, 25);
  scena.add(sole);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 600);
  const stagione = op.stagione ?? "estate";
  const alberi = op.alberi;
  const n = alberi.length;
  const { R, pos } = sistemaPosti(alberi);
  /** @type {THREE.Object3D[]} */
  const daLiberare = [];

  // ------------------------------------------------------------ Terra
  const prato = texPrato();
  const raggioPrato = R + 140;
  prato.repeat.set(raggioPrato / 6, raggioPrato / 6);
  const terra = new THREE.Mesh(new THREE.CircleGeometry(raggioPrato, 64).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: prato }));
  scena.add(terra);
  daLiberare.push(terra);
  // la radura del club: un tono più chiaro sotto gli alberi
  const radura = new THREE.Mesh(
    new THREE.CircleGeometry(R + 4, 64).rotateX(-Math.PI / 2).translate(0, 0.01, 0),
    new THREE.MeshBasicMaterial({ color: "#c9e39a", transparent: true, opacity: 0.22, depthWrite: false }),
  );
  scena.add(radura);
  daLiberare.push(radura);

  // ------------------------------------------------------------ Alberi
  const FORME = ["tonda", "larga", "ovale", "cono", "ombrello", "colonna", "piangente", "stretta"];
  const materiale = materialeAlberi();
  /** Per ogni albero: forma, matrice, colori, cima. */
  const dati = alberi.map((a, i) => {
    const mod = modelloDaNumero(a.modello ?? 0);
    const sp = SPECIE[mod.specie];
    const r = generatore(hash(`club:${a.seme}`));
    const colori =
      stagione === "primavera" ? sp.primavera ?? sp.estate
      : stagione === "autunno" ? sp.autunno ?? sp.estate
      : stagione === "inverno" && !sp.sempreverde ? /** @type {[string, string]} */ ([mescola(sp.autunno?.[0] ?? sp.estate[0], "#8a8a7a", 0.55).getStyle(), mescola(sp.autunno?.[1] ?? sp.estate[1], "#b0ab98", 0.55).getStyle()])
      : sp.estate;
    const chioma = mescola(colori[0], colori[1], Math.min(1, Math.max(0, 0.3 + mod.tono * 0.45 + (r() - 0.5) * 0.18)));
    if (sp.fiori && stagione === "primavera") chioma.lerp(new THREE.Color(sp.fiori.tipo === "fiore-rosa" ? "#f4b8c8" : "#f4f0ea"), 0.45);
    const tronco = new THREE.Color(TRONCHI[sp.corteccia] ?? "#6e4a30");
    // grandezza: dal germoglio (0,4) all'adulto (1), più la proporzione del modello
    const scala = (0.42 + 0.58 * Math.min(1, Math.max(0, a.crescita ?? 1))) * (0.92 + r() * 0.16);
    const sx = scala * mod.larghezza * mod.chioma, sy = scala * mod.altezza;
    const rot = r() * Math.PI * 2;
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(pos[i].x, 0, pos[i].z),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot),
      new THREE.Vector3(sx, sy, sx),
    );
    return { forma: sp.forma, m, chioma, tronco, cima: CIMA[sp.forma] * sy, raggio: RAGGIO[sp.forma] * sx, specie: sp.nome };
  });

  /** Due mesh per forma (vicino, lontano), con la loro capienza piena. */
  const mesh = FORME.map((forma) => {
    const quanti = dati.filter((d) => d.forma === forma).length;
    const crea = (/** @type {boolean} */ vicino) => {
      const g = geometriaForma(forma, vicino);
      // il colore del tronco è per istanza: attributo istanziato
      const im = new THREE.InstancedMesh(g, materiale, Math.max(1, quanti));
      im.geometry.setAttribute("aTronco", new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, quanti) * 3), 3));
      im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, quanti) * 3), 3);
      im.count = 0;
      im.frustumCulled = false;
      scena.add(im);
      daLiberare.push(im);
      return im;
    };
    return { forma, vicino: crea(true), lontano: crea(false) };
  });
  const perForma = Object.fromEntries(mesh.map((x) => [x.forma, x]));

  // ombre a terra: tutte in una mesh, ferme
  const ombre = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0.02, 0),
    new THREE.MeshBasicMaterial({ map: texOmbra(), transparent: true, depthWrite: false }),
    Math.max(1, n),
  );
  ombre.count = n;
  {
    const m4 = new THREE.Matrix4();
    dati.forEach((d, i) => {
      const s = d.raggio * 2.3;
      ombre.setMatrixAt(i, m4.makeScale(s, 1, s).setPosition(pos[i].x + 0.35, 0, pos[i].z + 0.3));
    });
  }
  scena.add(ombre);
  daLiberare.push(ombre);

  /** Sceglie il dettaglio di ogni albero dalla distanza dalla telecamera. */
  const VICINO2 = 34 * 34;
  const MAX_VICINI = 260;
  function aggiornaDettaglio() {
    for (const x of mesh) { x.vicino.count = 0; x.lontano.count = 0; }
    const cx = camera.position.x, cz = camera.position.z;
    let vicini = 0;
    for (let i = 0; i < n; i++) {
      const d = dati[i];
      const dx = pos[i].x - cx, dz = pos[i].z - cz;
      const vicino = vicini < MAX_VICINI && dx * dx + dz * dz < VICINO2 + camera.position.y * camera.position.y * 0.2;
      if (vicino) vicini++;
      const im = vicino ? perForma[d.forma].vicino : perForma[d.forma].lontano;
      const k = im.count++;
      im.instanceMatrix.array.set(d.m.elements, k * 16);
      /** @type {Float32Array} */ (im.instanceColor?.array).set([d.chioma.r, d.chioma.g, d.chioma.b], k * 3);
      /** @type {Float32Array} */ (im.geometry.attributes.aTronco.array).set([d.tronco.r, d.tronco.g, d.tronco.b], k * 3);
    }
    for (const x of mesh)
      for (const im of [x.vicino, x.lontano]) {
        im.instanceMatrix.needsUpdate = true;
        if (im.instanceColor) im.instanceColor.needsUpdate = true;
        im.geometry.attributes.aTronco.needsUpdate = true;
      }
  }

  // ------------------------------------------------------------ La bandierina
  const mio = alberi.findIndex((a) => a.mio);
  /** @type {THREE.Group | null} */
  let bandiera = null;
  /** @type {THREE.BufferAttribute | null} */
  let telo = null;
  /** @type {Float32Array | null} */
  let teloFermo = null;
  if (mio >= 0) {
    bandiera = new THREE.Group();
    const h = dati[mio].cima + 1.6;
    const asta = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, h, 6).translate(0, h / 2, 0), new THREE.MeshLambertMaterial({ color: "#f6f1e6" }));
    const g = new THREE.PlaneGeometry(1.15, 0.7, 8, 2).translate(0.58, h - 0.38, 0);
    const drappo = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: "#e0a526", side: THREE.DoubleSide }));
    telo = /** @type {THREE.BufferAttribute} */ (g.attributes.position);
    teloFermo = Float32Array.from(telo.array);
    const pomo = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6).translate(0, h + 0.04, 0), new THREE.MeshLambertMaterial({ color: "#e0a526" }));
    // anello chiaro a terra intorno al tuo albero
    const anello = new THREE.Mesh(
      new THREE.RingGeometry(dati[mio].raggio * 1.1, dati[mio].raggio * 1.1 + 0.18, 40).rotateX(-Math.PI / 2).translate(0, 0.03, 0),
      new THREE.MeshBasicMaterial({ color: "#fff6d8", transparent: true, opacity: 0.85, depthWrite: false }),
    );
    bandiera.add(asta, drappo, pomo, anello);
    // l'asta sta accanto al tronco, non dentro la chioma
    bandiera.position.set(pos[mio].x + dati[mio].raggio * 0.75, 0, pos[mio].z + dati[mio].raggio * 0.5);
    anello.position.set(-dati[mio].raggio * 0.75, 0, -dati[mio].raggio * 0.5);
    scena.add(bandiera);
    daLiberare.push(bandiera);
  }

  // ------------------------------------------------------------ Telecamera
  const ELEVAZIONE = 0.92; // radianti sopra l'orizzonte (circa 53°)
  const distanzaMax = Math.max(55, R * 2.4);
  const partenza = mio >= 0 ? pos[mio] : { x: 0, z: 0 };
  const cam = { x: partenza.x, z: partenza.z, d: mio >= 0 ? 22 : Math.min(distanzaMax, 26), giro: 0.5 };
  const vuole = { ...cam };
  const posizionaCamera = () => {
    const orizz = Math.cos(ELEVAZIONE) * cam.d;
    camera.position.set(cam.x + Math.sin(cam.giro) * orizz, Math.sin(ELEVAZIONE) * cam.d, cam.z + Math.cos(cam.giro) * orizz);
    camera.lookAt(cam.x, 0, cam.z);
    if (scena.fog instanceof THREE.Fog) {
      scena.fog.near = cam.d * 1.1;
      scena.fog.far = cam.d * 3.2 + 50;
    }
  };
  const limita = () => {
    vuole.d = Math.min(distanzaMax, Math.max(6, vuole.d));
    const lim = R + 8, dist = Math.hypot(vuole.x, vuole.z);
    if (dist > lim) { vuole.x *= lim / dist; vuole.z *= lim / dist; }
  };
  posizionaCamera();

  // ------------------------------------------------------------ Nomi
  const contenitore = op.etichette;
  /** @type {{ el: HTMLDivElement, chi: number }[]} */
  const pool = [];
  for (let i = 0; i < MAX_NOMI + 1; i++) {
    const el = document.createElement("div");
    el.className = "club-nome";
    el.hidden = true;
    contenitore.appendChild(el);
    pool.push({ el, chi: -1 });
  }
  /** @param {number} i */
  const testoNome = (i) => {
    const a = alberi[i];
    return { nome: a.nome, sotto: a.mio ? "il tuo albero" : a.esempio ? "esempio della demo" : a.persona ? `di ${a.persona}` : "" };
  };
  let selezionato = -1;
  const v = new THREE.Vector3();
  /** @type {{ x0: number, y0: number, x1: number, y1: number }[]} */
  const occupati = [];
  function aggiornaNomi() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z;
    const limite = Math.min(DISTANZA_NOMI, cam.d * 1.5);
    /** @type {{ i: number, d: number }[]} */
    const candidati = [];
    for (let i = 0; i < n; i++) {
      const dx = pos[i].x - cx, dz = pos[i].z - cz, dy = dati[i].cima - cy;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (i === mio || i === selezionato || (cam.d < DISTANZA_NOMI && d < limite)) candidati.push({ i, d: i === mio || i === selezionato ? -1 : d });
    }
    candidati.sort((a, b) => a.d - b.d);
    occupati.length = 0;
    let usati = 0;
    for (const c of candidati) {
      if (usati >= pool.length) break;
      v.set(pos[c.i].x, dati[c.i].cima + (c.i === mio ? 2 : 0.35), pos[c.i].z).project(camera);
      if (v.z > 1 || v.x < -1.1 || v.x > 1.1 || v.y < -1.1 || v.y > 1.1) continue;
      const sx = (v.x * 0.5 + 0.5) * w, sy = (-v.y * 0.5 + 0.5) * h;
      // niente nomi uno sopra l'altro: vince il più vicino
      const box = { x0: sx - 60, y0: sy - 34, x1: sx + 60, y1: sy };
      if (c.d >= 0 && occupati.some((o) => box.x0 < o.x1 && box.x1 > o.x0 && box.y0 < o.y1 && box.y1 > o.y0)) continue;
      occupati.push(box);
      const p = pool[usati++];
      if (p.chi !== c.i) {
        const t = testoNome(c.i);
        p.el.replaceChildren();
        const b = document.createElement("b");
        b.textContent = t.nome;
        p.el.appendChild(b);
        if (t.sotto) {
          const s = document.createElement("span");
          s.textContent = t.sotto;
          p.el.appendChild(s);
        }
        p.el.dataset.mio = alberi[c.i].mio ? "1" : "";
        p.el.dataset.esempio = alberi[c.i].esempio ? "1" : "";
        p.chi = c.i;
      }
      const sbiadito = c.d < 0 ? 1 : Math.min(1, Math.max(0, (limite - c.d) / (limite * 0.25)));
      p.el.style.opacity = sbiadito.toFixed(2);
      p.el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
      p.el.hidden = false;
    }
    for (let k = usati; k < pool.length; k++) {
      pool[k].el.hidden = true;
      pool[k].chi = -1;
    }
  }

  // ------------------------------------------------------------ Puntatore
  /** @type {Map<number, { x: number, y: number }>} */
  const puntatori = new Map();
  let mosso = 0;
  let pinza = 0;
  const raggio = new THREE.Raycaster();
  const piano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const ndc = new THREE.Vector2();
  /** Punto del prato sotto il puntatore. @param {number} x @param {number} y */
  const aTerra = (x, y) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    raggio.setFromCamera(ndc, camera);
    return raggio.ray.intersectPlane(piano, new THREE.Vector3());
  };
  /** @param {PointerEvent} e */
  const giu = (e) => {
    canvas.setPointerCapture(e.pointerId);
    puntatori.set(e.pointerId, { x: e.clientX, y: e.clientY });
    mosso = 0;
    if (puntatori.size === 2) {
      const [a, b] = [...puntatori.values()];
      pinza = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  /** @param {PointerEvent} e */
  const muovi = (e) => {
    const prima = puntatori.get(e.pointerId);
    if (!prima) return;
    const ora = { x: e.clientX, y: e.clientY };
    mosso += Math.hypot(ora.x - prima.x, ora.y - prima.y);
    if (puntatori.size === 1) {
      // trascinare sposta la foresta sotto il dito (la telecamera segue al volo)
      const a = aTerra(prima.x, prima.y), b = aTerra(ora.x, ora.y);
      if (a && b) {
        vuole.x += a.x - b.x;
        vuole.z += a.z - b.z;
        cam.x = vuole.x;
        cam.z = vuole.z;
      }
    } else if (puntatori.size === 2) {
      puntatori.set(e.pointerId, ora);
      const [a, b] = [...puntatori.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinza > 0 && d > 0) vuole.d *= pinza / d;
      pinza = d;
    }
    puntatori.set(e.pointerId, ora);
    limita();
  };
  /** @param {PointerEvent} e */
  const su = (e) => {
    const era = puntatori.get(e.pointerId);
    puntatori.delete(e.pointerId);
    if (puntatori.size < 2) pinza = 0;
    if (era && mosso < 7 && puntatori.size === 0) tocca(e.clientX, e.clientY);
  };
  /** @param {WheelEvent} e */
  const rotella = (e) => {
    e.preventDefault();
    vuole.d *= Math.exp(e.deltaY * 0.0012);
    limita();
  };
  /** Il tocco su un albero: il più vicino al punto toccato, se è abbastanza vicino. @param {number} x @param {number} y */
  const tocca = (x, y) => {
    const p = aTerra(x, y);
    if (!p) return;
    let meglio = -1, dm = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.hypot(pos[i].x - p.x, pos[i].z - p.z);
      if (d < dm) { dm = d; meglio = i; }
    }
    // il punto a terra cade dietro la chioma: si accetta un po' di margine
    if (meglio >= 0 && dm < dati[meglio].raggio + 1.6) {
      selezionato = meglio;
      emetti("tocca-albero", { indice: meglio, ...alberi[meglio], specie: dati[meglio].specie });
    } else {
      selezionato = -1;
      emetti("tocca-albero", null);
    }
  };
  /** Frecce e +/- per chi usa la tastiera. @param {KeyboardEvent} e */
  const tasto = (e) => {
    const passo = cam.d * 0.12;
    const s = Math.sin(cam.giro), c = Math.cos(cam.giro);
    if (e.key === "ArrowUp") { vuole.x -= s * passo; vuole.z -= c * passo; }
    else if (e.key === "ArrowDown") { vuole.x += s * passo; vuole.z += c * passo; }
    else if (e.key === "ArrowLeft") { vuole.x -= c * passo; vuole.z += s * passo; }
    else if (e.key === "ArrowRight") { vuole.x += c * passo; vuole.z -= s * passo; }
    else if (e.key === "+" || e.key === "=") vuole.d *= 0.85;
    else if (e.key === "-") vuole.d /= 0.85;
    else return;
    e.preventDefault();
    limita();
  };
  canvas.addEventListener("pointerdown", giu);
  canvas.addEventListener("pointermove", muovi);
  canvas.addEventListener("pointerup", su);
  canvas.addEventListener("pointercancel", su);
  canvas.addEventListener("wheel", rotella, { passive: false });
  canvas.addEventListener("keydown", tasto);
  canvas.style.touchAction = "none";

  // ------------------------------------------------------------ Eventi
  /** @type {Map<string, Set<(dati?: unknown) => void>>} */
  const ascolti = new Map();
  /** @param {string} ev @param {unknown} [d] */
  const emetti = (ev, d) => ascolti.get(ev)?.forEach((cb) => cb(d));

  // ------------------------------------------------------------ Dimensioni
  const ridimensiona = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // sul telefono in verticale si vede un po' più di foresta
    camera.fov = w / h < 0.8 ? 55 : 42;
    camera.updateProjectionMatrix();
  };
  const osservatore = new ResizeObserver(ridimensiona);
  osservatore.observe(canvas);
  ridimensiona();

  // ------------------------------------------------------------ Ciclo
  let ridotto = !!op.movimentoRidotto;
  let vivo = true;
  let raf = 0;
  let ultimo = performance.now();
  let tempo = 0;
  let ultimoDettaglio = { x: Infinity, z: Infinity, d: Infinity };
  /** Tempi degli ultimi fotogrammi: lavoro (ms) e intervallo tra fotogrammi. */
  const lavoro = new Float32Array(120), intervalli = new Float32Array(120);
  let k = 0, contati = 0, lentiDiFila = 0;
  const gl = renderer.getContext();
  const pixel = new Uint8Array(4);

  const ciclo = (/** @type {number} */ ora) => {
    if (!vivo) return;
    raf = requestAnimationFrame(ciclo);
    const inizio = performance.now();
    const dt = Math.min(0.1, (ora - ultimo) / 1000);
    intervalli[k] = ora - ultimo;
    ultimo = ora;
    tempo += dt;
    UNIF.uTempo.value = tempo;
    UNIF.uVento.value = ridotto ? 0.3 : 1;
    // la telecamera raggiunge morbida il punto voluto
    const vel = ridotto ? 30 : 7;
    cam.x = verso(cam.x, vuole.x, vel, dt);
    cam.z = verso(cam.z, vuole.z, vel, dt);
    cam.d = verso(cam.d, vuole.d, vel, dt);
    posizionaCamera();
    if (Math.hypot(cam.x - ultimoDettaglio.x, cam.z - ultimoDettaglio.z) > 2 || Math.abs(cam.d - ultimoDettaglio.d) > 1.5) {
      aggiornaDettaglio();
      ultimoDettaglio = { x: cam.x, z: cam.z, d: cam.d };
    }
    // il drappo sventola
    if (telo && teloFermo) {
      for (let i = 0; i < telo.count; i++) {
        const x = teloFermo[i * 3];
        telo.setZ(i, teloFermo[i * 3 + 2] + Math.sin(tempo * (ridotto ? 1.2 : 4) - x * 4) * 0.12 * x);
      }
      telo.needsUpdate = true;
    }
    renderer.render(scena, camera);
    aggiornaNomi();
    if (op.misura) gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    lavoro[k] = performance.now() - inizio;
    k = (k + 1) % 120;
    contati++;
    // qualità adattiva: se i fotogrammi arrivano lenti, meno pixel
    if (contati % 120 === 0 && rapporto > 1) {
      const mediana = [...intervalli].sort((a, b) => a - b)[60];
      lentiDiFila = mediana > 24 ? lentiDiFila + 1 : 0;
      if (lentiDiFila >= 2) {
        rapporto = Math.max(1, rapporto - 0.5);
        renderer.setPixelRatio(rapporto);
        ridimensiona();
        lentiDiFila = 0;
      }
    }
    if (contati === 3) emetti("pronto");
  };
  aggiornaDettaglio();
  raf = requestAnimationFrame(ciclo);

  return {
    /** @param {"pronto"|"tocca-albero"} ev @param {(dati?: unknown) => void} cb */
    su(ev, cb) {
      if (!ascolti.has(ev)) ascolti.set(ev, new Set());
      ascolti.get(ev)?.add(cb);
      return () => ascolti.get(ev)?.delete(cb);
    },
    /** @param {{ movimentoRidotto?: boolean }} parziale */
    imposta(parziale) {
      if (parziale.movimentoRidotto !== undefined) ridotto = parziale.movimentoRidotto;
    },
    /** Torna al tuo albero (o al centro). */
    vaiAlMio() {
      vuole.x = partenza.x;
      vuole.z = partenza.z;
      vuole.d = mio >= 0 ? 22 : vuole.d;
      selezionato = -1;
    },
    /** @param {number} fattore minore di 1 avvicina */
    zoom(fattore) {
      vuole.d *= fattore;
      limita();
    },
    /** Misure degli ultimi 120 fotogrammi. */
    statistiche() {
      const quanti = Math.min(contati, 120);
      const l = [...lavoro.slice(0, quanti)].sort((a, b) => a - b);
      const iv = [...intervalli.slice(0, quanti)].sort((a, b) => a - b);
      const vicini = mesh.reduce((s, x) => s + x.vicino.count, 0);
      return {
        alberi: n,
        vicini,
        msMediana: l[Math.floor(quanti / 2)] ?? 0,
        ms95: l[Math.floor(quanti * 0.95)] ?? 0,
        intervalloMediana: iv[Math.floor(quanti / 2)] ?? 0,
        pixelRatio: rapporto,
        disegni: renderer.info.render.calls,
        triangoli: renderer.info.render.triangles,
      };
    },
    distruggi() {
      vivo = false;
      cancelAnimationFrame(raf);
      osservatore.disconnect();
      canvas.removeEventListener("pointerdown", giu);
      canvas.removeEventListener("pointermove", muovi);
      canvas.removeEventListener("pointerup", su);
      canvas.removeEventListener("pointercancel", su);
      canvas.removeEventListener("wheel", rotella);
      canvas.removeEventListener("keydown", tasto);
      for (const p of pool) p.el.remove();
      for (const o of daLiberare)
        o.traverse((x) => {
          if (x instanceof THREE.Mesh) {
            x.geometry.dispose();
            const mats = Array.isArray(x.material) ? x.material : [x.material];
            for (const m of mats) {
              if ("map" in m && m.map instanceof THREE.Texture) m.map.dispose();
              m.dispose();
            }
          }
        });
      renderer.dispose();
      ascolti.clear();
    },
  };
}
