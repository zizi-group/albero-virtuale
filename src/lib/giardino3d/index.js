// Il giardino 3D di Linfa: una radura con fino a 7 alberi-personaggio.
//
//   const g = creaGiardino(canvas, { alberi, meteo, ora, stagione, azione, umore, movimentoRidotto });
//   g.imposta({ ora: "notte" });  g.reagisci("saluta");  g.su("tocca-albero", cb);  g.distruggi();
//
// Moduli ES con JSDoc: funzionano in Next (dipendenza npm "three") e nelle pagine
// di prova con l'importmap. Modelli e licenze in /giardino3d/.
import * as THREE from "three";
import { creaAlbero, UNIFORMI } from "./albero.js";
import { verso } from "./casuale.js";
import { CASSETTA, creaAmbiente, quota, TACCUINO } from "./ambiente.js";
import { creaComportamento } from "./comportamento.js";
import { MODELLI, MODELLI_PER_ID, modelloDalSeme } from "./modelli.js";
import { texAlone } from "./texture.js";

export { MODELLI, modelloDalSeme };
export { SPECIE } from "./modelli.js";

/**
 * @typedef {Object} AlberoGiardino
 * @property {string} id
 * @property {string} seme
 * @property {string} [modello] id di MODELLI; se manca viene dal seme
 * @property {string} [strada] filosofo, imprenditore, artista, sportivo, furfante, viaggiatore, poeta
 * @property {string} [nome]
 * @property {number} [giorni]
 * @property {boolean} [principale]
 */

/**
 * @typedef {Object} OpzioniGiardino
 * @property {AlberoGiardino[]} alberi
 * @property {{ cielo: "sole"|"nuvole"|"pioggia"|"temporale"|"neve"|"nebbia", temperatura?: number, giorno?: string }} [meteo]
 * @property {"alba"|"giorno"|"tramonto"|"notte"} [ora]
 * @property {"primavera"|"estate"|"autunno"|"inverno"} [stagione]
 * @property {string} [azione] una delle 23 azioni (src/lib/albero/azioni.ts)
 * @property {"curioso"|"allegro"|"pensieroso"|"assonnato"|"furbo"|"fiero"|"sognante"|"energico"|"malinconico"} [umore]
 * @property {boolean} [movimentoRidotto]
 */

/** Dove stanno gli alberi: il principale al centro, gli altri a ventaglio dietro. @param {number} n */
function posti(n) {
  const out = [{ x: 0, z: 0.3 }];
  const giro = [[-2.3, -0.6], [2.3, -0.6], [-4.3, -1.8], [4.3, -1.8], [-1.2, -2.8], [1.4, -3.0]];
  for (let i = 1; i < n; i++) out.push({ x: giro[i - 1][0], z: giro[i - 1][1] });
  return out;
}

/**
 * Crea il giardino nel canvas dato.
 * @param {HTMLCanvasElement} canvas
 * @param {OpzioniGiardino} opzioni
 */
export function creaGiardino(canvas, opzioni) {
  const ridotto = !!opzioni.movimentoRidotto;
  const lista = (opzioni.alberi?.length ? opzioni.alberi : [{ id: "linfa", seme: "linfa", principale: true }]).slice(0, 7);
  // il principale per primo
  lista.sort((a, b) => Number(!!b.principale) - Number(!!a.principale));

  // _conservaFotogramma: solo per le catture dello schermo nelle pagine di prova
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: !!(/** @type {any} */ (opzioni)._conservaFotogramma) });
  let rapporto = Math.min(window.devicePixelRatio || 1, 2); // pixel ratio massimo 2 (scende se il computer fatica)
  renderer.setPixelRatio(rapporto);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false; // le ombre del bosco si calcolano solo quando cambia la luce

  const scena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 140);
  const dove = posti(lista.length);
  const mondo = {
    cielo: opzioni.meteo?.cielo ?? "sole",
    ora: opzioni.ora ?? "giorno",
    temperatura: opzioni.meteo?.temperatura ?? 18,
    stagione: opzioni.stagione ?? "estate",
  };
  const ambiente = creaAmbiente(scena, renderer, { ridotto, alberi: dove });

  // Alberi
  const alone = new THREE.MeshBasicMaterial({ map: texAlone("0,0,0", 0.5), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const geoOmbra = new THREE.PlaneGeometry(1, 1);
  const alberi = lista.map((a, i) => {
    const mod = (a.modello && MODELLI_PER_ID[a.modello]) || modelloDalSeme(a.seme);
    const albero = creaAlbero(mod, { seme: a.seme, strada: a.strada, giorni: a.giorni });
    if (i > 0) albero.scala.scale.multiplyScalar(0.82);
    scena.add(albero.radice);
    // ogni albero resta in una zona che la camera vede
    const limiti = i === 0 ? { x0: -1.0, x1: 1.0, z0: -1.3, z1: 0.8 } : { x0: dove[i].x - 1, x1: dove[i].x + 1, z0: dove[i].z - 0.8, z1: dove[i].z + 0.6 };
    const comp = creaComportamento(albero, { scena, casa: dove[i], cassetta: ambiente.cassetta.gruppo.position, ridotto, mondo, camera: camera.position, limiti });
    const ombra = new THREE.Mesh(geoOmbra, alone);
    ombra.rotation.x = -Math.PI / 2;
    scena.add(ombra);
    albero.stagione(mondo.stagione);
    return { dati: a, albero, comp, ombra };
  });

  // ---------------------------------------------------------------- Eventi
  /** @type {Record<string, ((dati?: any) => void)[]>} */
  const ascoltatori = {};
  /** @param {string} ev @param {any} [dati] */
  const emetti = (ev, dati) => { for (const cb of ascoltatori[ev] ?? []) cb(dati); };

  ambiente.suLampo(() => { for (const a of alberi) a.comp.reagisci("lampo"); });

  /** Applica le opzioni (tutte o in parte). @param {Partial<OpzioniGiardino>} p */
  function imposta(p) {
    if (p.meteo?.cielo) mondo.cielo = p.meteo.cielo;
    if (p.meteo?.temperatura !== undefined) mondo.temperatura = p.meteo.temperatura;
    if (p.ora) mondo.ora = p.ora;
    const cambiaStagione = p.stagione && p.stagione !== mondo.stagione;
    if (p.stagione) mondo.stagione = p.stagione;
    ambiente.imposta({ ora: mondo.ora, cielo: mondo.cielo, stagione: mondo.stagione, temperatura: mondo.temperatura });
    for (const a of alberi) {
      if (cambiaStagione) a.albero.stagione(mondo.stagione);
      if (p.umore) a.comp.umore(p.umore);
      if (p.azione !== undefined && a.dati.principale !== false) a.comp.azione(p.azione);
      a.comp.mondoCambiato();
    }
  }
  imposta({ ...opzioni, stagione: undefined });
  for (const a of alberi) {
    a.comp.umore(opzioni.umore ?? "curioso");
    a.comp.azione(opzioni.azione ?? "");
  }

  // ---------------------------------------------------------------- Camera
  const BERSAGLIO = new THREE.Vector3(0, 1.45, 0.2);
  const POSIZIONE = new THREE.Vector3();
  function inquadra() {
    const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
    renderer.setPixelRatio(rapporto);
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    // l'albero principale occupa circa il 43% dell'altezza dello schermo, visto poco
    // dall'alto; con più alberi la camera si allontana quanto basta per vederli tutti
    // computer: l'albero occupa il 43% dell'altezza; telefono in verticale: il 38%
    const tg = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const s = alberi[0].albero.scala.scale.x;
    const alto = alberi[0].albero.altezza * s;
    const quota0 = camera.aspect < 0.8 ? 0.38 : 0.43;
    let dist = alto / quota0 / (2 * tg);
    if (lista.length > 1) dist = Math.max(dist, 5.4 / (tg * camera.aspect), 12);
    // poco sopra l'altezza degli occhi dell'albero, guardando appena in giù
    BERSAGLIO.set(0, alto * 0.46, 0.3);
    POSIZIONE.set(0, 1.0 * s + 0.75 + dist * 0.07, BERSAGLIO.z + dist);
    camera.position.copy(POSIZIONE);
    camera.lookAt(BERSAGLIO);
  }
  inquadra();
  const osservatore = new ResizeObserver(inquadra);
  osservatore.observe(canvas);

  // ---------------------------------------------------------------- Puntatore
  const raggio = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pianoTerra = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const tmp = new THREE.Vector3();
  /** @type {{ albero: (typeof alberi)[number], x: number, y: number, trascina: boolean } | null} */
  let premuto = null;
  let ultimoPuntatore = -10;

  /** @param {PointerEvent} e */
  const aNdc = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raggio.setFromCamera(ndc, camera);
  };
  /** @returns {{ tipo: "albero", a: (typeof alberi)[number] } | { tipo: "cassetta" | "taccuino" } | null} */
  const colpito = () => {
    const bersagli = [...alberi.map((a) => a.albero.bersaglio), ambiente.cassetta.bersaglio, ambiente.taccuino.bersaglio];
    const hit = raggio.intersectObjects(bersagli, false)[0];
    if (!hit) return null;
    if (hit.object === ambiente.cassetta.bersaglio) return { tipo: "cassetta" };
    if (hit.object === ambiente.taccuino.bersaglio) return { tipo: "taccuino" };
    const a = alberi.find((x) => x.albero.bersaglio === hit.object);
    return a ? { tipo: "albero", a } : null;
  };
  /** @param {PointerEvent} e */
  const giu = (e) => {
    aNdc(e);
    const c = colpito();
    if (c?.tipo === "albero") {
      premuto = { albero: c.a, x: e.clientX, y: e.clientY, trascina: false };
      canvas.setPointerCapture(e.pointerId);
    }
  };
  /** @param {PointerEvent} e */
  const muovi = (e) => {
    aNdc(e);
    ultimoPuntatore = performance.now();
    if (premuto) {
      if (!premuto.trascina && Math.hypot(e.clientX - premuto.x, e.clientY - premuto.y) > 8) {
        premuto.trascina = true;
        premuto.albero.comp.prendi();
        emetti("trascina-albero", { id: premuto.albero.dati.id });
      }
      if (premuto.trascina && raggio.ray.intersectPlane(pianoTerra, tmp)) premuto.albero.comp.trascina(tmp);
    } else {
      canvas.style.cursor = colpito() ? "pointer" : "";
    }
  };
  /** @param {PointerEvent} e */
  const su = (e) => {
    if (premuto) {
      if (premuto.trascina) premuto.albero.comp.lascia();
      else {
        premuto.albero.comp.reagisci("saluta");
        emetti("tocca-albero", { id: premuto.albero.dati.id });
      }
      premuto = null;
      return;
    }
    aNdc(e);
    const c = colpito();
    if (c?.tipo === "cassetta") emetti("tocca-cassetta");
    if (c?.tipo === "taccuino") emetti("tocca-taccuino");
  };
  canvas.addEventListener("pointerdown", giu);
  canvas.addEventListener("pointermove", muovi);
  canvas.addEventListener("pointerup", su);
  canvas.style.touchAction = "none";

  // ---------------------------------------------------------------- Ciclo
  const orologio = new THREE.Timer();
  let t = 0;
  let pronto = false;
  let fermo = false;
  const testa = new THREE.Vector3();
  const seguito = new THREE.Vector3();
  /** @param {number} dt */
  function passo(dt) {
    t += dt;
    UNIFORMI.uTempo.value = ridotto ? 0 : t;
    ambiente.aggiorna(dt, t);
    for (const a of alberi) {
      a.comp.aggiorna(dt, t);
      a.albero.viso.aggiorna(dt, t, ridotto);
      a.albero.effetti.aggiorna(dt);
      const r = a.albero.radice.position;
      const s = a.albero.scala.scale.x;
      a.ombra.position.set(r.x, quota(r.x, r.z) + 0.04, r.z + 0.08 * s);
      const alto = Math.max(0, r.y - quota(r.x, r.z));
      a.ombra.scale.set(1.15 * s * (1 - alto * 0.25), 0.85 * s * (1 - alto * 0.25), 1);
    }
    // gli alberi non si sovrappongono fra loro né alla cassetta e al taccuino
    const ostacoli = [[CASSETTA[0], CASSETTA[1], 1.0], [TACCUINO[0], TACCUINO[1], 1.0]];
    for (let i = 0; i < alberi.length; i++) {
      const pi = alberi[i].comp.posizione;
      for (let j = i + 1; j < alberi.length; j++) {
        const pj = alberi[j].comp.posizione;
        const dx = pj.x - pi.x, dz = pj.y - pi.y, d = Math.hypot(dx, dz) || 0.001;
        if (d < 1.5) {
          const k = (1.5 - d) / 2 / d;
          if (!alberi[i].comp.preso) { pi.x -= dx * k; pi.y -= dz * k; }
          if (!alberi[j].comp.preso) { pj.x += dx * k; pj.y += dz * k; }
        }
      }
      for (const [ox, oz, r] of ostacoli) {
        const dx = pi.x - ox, dz = pi.y - oz, d = Math.hypot(dx, dz) || 0.001;
        if (d < r && !alberi[i].comp.preso) { pi.x = ox + (dx / d) * r; pi.y = oz + (dz / d) * r; }
      }
    }
    // la camera segue piano il principale quando cammina (niente scatti)
    if (lista.length === 1) {
      const r0 = alberi[0].albero.radice.position;
      const fx = verso(camera.position.x - POSIZIONE.x, r0.x * 0.85, 1.2, dt);
      const fz = verso(camera.position.z - POSIZIONE.z, (r0.z - 0.3) * 0.6, 1.2, dt);
      camera.position.set(POSIZIONE.x + fx, POSIZIONE.y, POSIZIONE.z + fz);
      seguito.set(BERSAGLIO.x + fx, BERSAGLIO.y, BERSAGLIO.z + fz);
      camera.lookAt(seguito);
    }
    // lo sguardo del principale segue il puntatore
    if (performance.now() - ultimoPuntatore < 2500 && !ridotto) {
      const a = alberi[0].albero;
      a.radice.localToWorld(testa.set(0, 1.2, 0.4)).project(camera);
      a.viso.guarda((ndc.x - testa.x) * 2.2, (ndc.y - testa.y) * 2.2);
    }
  }
  // qualità adattiva: se il computer fatica (sotto i 45 fps per qualche secondo),
  // la risoluzione scende un poco, fino a pixel ratio 1
  let media = 1 / 60, finestra = 0;
  function disegna() {
    orologio.update(performance.now());
    const dt = orologio.getDelta();
    passo(Math.min(dt, 0.05));
    renderer.render(scena, camera);
    media += (Math.min(dt, 0.2) - media) * 0.05;
    finestra += dt;
    if (finestra > 3 && media > 1 / 45 && rapporto > 1) {
      rapporto = Math.max(1, rapporto - 0.25);
      renderer.setPixelRatio(rapporto);
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      finestra = 0;
    }
  }
  const avvia = () => { if (!fermo) renderer.setAnimationLoop(disegna); };
  const visibilita = () => {
    if (document.hidden) renderer.setAnimationLoop(null);
    else { orologio.update(performance.now()); avvia(); }
  };
  document.addEventListener("visibilitychange", visibilita);

  ambiente.pronto.then(() => {
    if (fermo) return;
    renderer.shadowMap.needsUpdate = true;
    pronto = true;
    avvia();
    emetti("pronto");
  });

  const istanza = {
    imposta,
    /** @param {"saluta"|"lettera"|"festa"|"carezza"} tipo */
    reagisci(tipo) {
      if (tipo === "lettera") ambiente.cassetta.arriva();
      alberi[0].comp.reagisci(tipo);
      for (const a of alberi.slice(1)) if (tipo === "festa") a.comp.reagisci("festa");
    },
    /** @param {string} evento "pronto" | "tocca-albero" | "tocca-cassetta" | "tocca-taccuino" @param {(dati?: any) => void} cb */
    su(evento, cb) {
      (ascoltatori[evento] ??= []).push(cb);
      if (evento === "pronto" && pronto) cb();
      return () => { ascoltatori[evento] = (ascoltatori[evento] ?? []).filter((x) => x !== cb); };
    },
    /** La lettera è stata letta: la bandierina torna giù. */
    letteraLetta() { ambiente.cassetta.letta(); },
    distruggi() {
      fermo = true;
      renderer.setAnimationLoop(null);
      document.removeEventListener("visibilitychange", visibilita);
      canvas.removeEventListener("pointerdown", giu);
      canvas.removeEventListener("pointermove", muovi);
      canvas.removeEventListener("pointerup", su);
      osservatore.disconnect();
      for (const a of alberi) a.comp.distruggi();
      scena.traverse((o) => {
        const m = /** @type {THREE.Mesh} */ (o);
        if (m.geometry) m.geometry.dispose();
        const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
        for (const x of mats) {
          for (const v of Object.values(x)) if (v && /** @type {THREE.Texture} */ (v).isTexture) /** @type {THREE.Texture} */ (v).dispose();
          x.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      for (const k of Object.keys(ascoltatori)) delete ascoltatori[k];
    },
    /** Solo per le pagine di prova: misura i ms per fotogramma senza il limite dello schermo. */
    _prove: {
      scena, camera, renderer, alberi, ambiente, mondo,
      /** @param {number} secondi */
      avanza(secondi) { for (let i = 0; i < Math.round(secondi * 60); i++) passo(1 / 60); renderer.render(scena, camera); },
      misura(n = 120) {
        const gl = renderer.getContext(), px = new Uint8Array(4);
        const t0 = performance.now();
        for (let i = 0; i < n; i++) { passo(1 / 60); renderer.render(scena, camera); }
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        return { msPerFotogramma: +((performance.now() - t0) / n).toFixed(2), chiamate: renderer.info.render.calls, triangoli: renderer.info.render.triangles, pixel: [renderer.domElement.width, renderer.domElement.height] };
      },
    },
  };
  return istanza;
}
