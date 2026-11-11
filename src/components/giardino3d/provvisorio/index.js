// Motore PROVVISORIO, solo per provare l'integrazione nel giardino finché non
// arriva quello vero di src/lib/giardino3d. Stessa API: creaGiardino(canvas, opzioni).
import * as THREE from "three";
import { creaLinfa, tempo } from "./linfa.js";

const LUCI = {
  alba: { cielo: "#f7c7a0", sole: "#ffcf9a", forza: 2.2, emi: 0.9 },
  giorno: { cielo: "#a8e0d0", sole: "#fff1cf", forza: 3.0, emi: 1.1 },
  tramonto: { cielo: "#f0a878", sole: "#ff9c5a", forza: 2.0, emi: 0.8 },
  notte: { cielo: "#16263a", sole: "#9fb8ff", forza: 0.6, emi: 0.35 },
};

export function creaGiardino(canvas, opzioni) {
  const o = { ...opzioni };
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;

  const scena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
  camera.position.set(0, 4.2, 11);
  camera.lookAt(0, 1.6, 0);

  const emi = new THREE.HemisphereLight("#d8f5e8", "#3a5a2a", 1);
  scena.add(emi);
  const sole = new THREE.DirectionalLight("#fff1cf", 3);
  sole.position.set(6, 10, 6);
  sole.castShadow = true;
  sole.shadow.mapSize.set(1024, 1024);
  scena.add(sole);

  const prato = new THREE.Mesh(new THREE.CircleGeometry(30, 48), new THREE.MeshStandardMaterial({ color: "#5fae4a", roughness: 0.95 }));
  prato.rotation.x = -Math.PI / 2;
  prato.receiveShadow = true;
  scena.add(prato);

  const principale = o.alberi.find((a) => a.principale) ?? o.alberi[0];
  const linfa = creaLinfa({ seme: principale.seme, ...(principale.strada ? { strada: principale.strada === "poeta" ? "poeta-pigro" : principale.strada } : {}) });
  linfa.gruppo.scale.setScalar(1.3);
  scena.add(linfa.gruppo);

  // Pioggia semplice
  const gocce = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(Array.from({ length: 1500 * 3 }, (_, i) => (i % 3 === 1 ? Math.random() * 14 : (Math.random() - 0.5) * 24)), 3)),
    new THREE.PointsMaterial({ color: "#cfe6ff", size: 0.06, transparent: true, opacity: 0.8 }),
  );
  scena.add(gocce);

  function applica() {
    const l = LUCI[o.ora] ?? LUCI.giorno;
    scena.background = new THREE.Color(l.cielo);
    scena.fog = new THREE.Fog(l.cielo, o.meteo.cielo === "nebbia" ? 6 : 18, o.meteo.cielo === "nebbia" ? 22 : 60);
    sole.color.set(l.sole);
    sole.intensity = l.forza * (o.meteo.cielo === "sole" ? 1 : 0.6);
    emi.intensity = l.emi;
    gocce.visible = (o.meteo.cielo === "pioggia" || o.meteo.cielo === "temporale") && !o.movimentoRidotto;
  }
  applica();

  const ascolti = {};
  const emetti = (e, d) => (ascolti[e] ?? []).forEach((cb) => cb(d));

  function misura() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(misura);
  ro.observe(canvas);
  misura();

  const raggio = new THREE.Raycaster();
  const clic = (e) => {
    const r = canvas.getBoundingClientRect();
    raggio.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    if (raggio.intersectObject(linfa.gruppo, true).length) {
      linfa.saluta();
      emetti("tocca-albero");
    }
  };
  canvas.addEventListener("click", clic);

  let t = 0, ultimo = performance.now(), raf = 0, primo = true;
  function giro(ora) {
    raf = requestAnimationFrame(giro);
    if (document.hidden) { ultimo = ora; return; }
    const dt = Math.min(0.05, (ora - ultimo) / 1000);
    ultimo = ora;
    t += o.movimentoRidotto ? dt * 0.4 : dt;
    tempo.value = t;
    linfa.aggiorna(t, dt);
    if (gocce.visible) {
      const p = gocce.geometry.attributes.position;
      for (let i = 1; i < p.array.length; i += 3) { p.array[i] -= dt * 14; if (p.array[i] < 0) p.array[i] = 14; }
      p.needsUpdate = true;
    }
    renderer.render(scena, camera);
    if (primo) { primo = false; emetti("pronto"); }
  }
  raf = requestAnimationFrame(giro);

  return {
    imposta(p) { Object.assign(o, p); if (p.meteo) o.meteo = { ...o.meteo, ...p.meteo }; applica(); },
    reagisci() { linfa.saluta(); },
    su(e, cb) { (ascolti[e] ??= []).push(cb); },
    distruggi() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("click", clic);
      scena.traverse((m) => { m.geometry?.dispose?.(); const mm = m.material; (Array.isArray(mm) ? mm : mm ? [mm] : []).forEach((x) => { x.map?.dispose?.(); x.dispose(); }); });
      renderer.dispose();
    },
  };
}
