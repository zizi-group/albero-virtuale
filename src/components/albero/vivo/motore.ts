import type { Oggetto, Posa } from "@/lib/albero/tipi";
import { EVENTO_MOVIMENTO, movimentoRidotto } from "@/components/Movimento";
import { braccioLibero, canaliDaPosa, DISCRETI, DOVE, figuraDaPosa, NOMI_CANALI, TERRA, type Canali, type Figura, type Lato } from "./canali";
import { Copione, type Clip, type OpzioniParticella, type Regia, type TipoParticella } from "./copione";
import { PARTICELLE } from "./disegni";
import { aMondo, fotogramma, statoIniziale, type Attributi, type StatoVivo } from "./fotogramma";
import { Repertorio, stradaDa, umoreDa } from "./frasi";
import * as I from "./interazioni";
import { azioneDaPosa, SCENETTE, scegliScenetta, type NomeScenetta, type Palco } from "./scenette";
import { intermezzo, scenaDellAttivita } from "./attivita";
import { stringiPrato, type StatoScena } from "./tracce";
import { alzati, cammina } from "./gesti";
import { baseAlLavoro, canaliDelMestiere, ciclo, entrata, scenaDelMestiere, statoLavoro, type ScenaLavoro, type StatoMestiere } from "./mestiere";

// Il motore dell'albero vivo: un orologio unico per tutti gli alberi della pagina,
// che a ogni fotogramma fa recitare la scenetta, sovrappone le reazioni alle
// persone, aggiunge lo strato di vita (respiro, ciglia, sguardo, molle della
// chioma) e scrive gli attributi SVG cambiati. Niente React a ogni fotogramma.

export const N_PARTICELLE = 24;
const TAU = Math.PI * 2;
const lim = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const verso0 = (dt: number, rapidita: number) => 1 - Math.exp(-dt * rapidita);
const liscio = (u: number) => {
  const x = lim(u, 0, 1);
  return x * x * (3 - 2 * x);
};
const fuoriBack = (u: number) => {
  const s = 1.7;
  const v = u - 1;
  return 1 + (s + 1) * v ** 3 + s * v ** 2;
};

// ——— Orologio condiviso e puntatore ———

const ATTIVI = new Set<Motore>();
let raf = 0;
let ultimo = 0;

function giro(ora: number) {
  const dt = ultimo ? Math.min(0.05, Math.max(0.001, (ora - ultimo) / 1000)) : 1 / 60;
  ultimo = ora;
  for (const m of ATTIVI) m.leggi();
  for (const m of ATTIVI) m.passo(dt);
  raf = ATTIVI.size ? requestAnimationFrame(giro) : 0;
  if (!raf) ultimo = 0;
}

const PUNTATORE = { x: 0, y: 0, t: -1e9, tipo: "mouse" };
let iscritti = 0;
const MOTORI = new Set<Motore>();
function suMovimento(e: PointerEvent) {
  PUNTATORE.x = e.clientX;
  PUNTATORE.y = e.clientY;
  PUNTATORE.t = performance.now();
  PUNTATORE.tipo = e.pointerType;
}
function suScorrimento() {
  for (const m of MOTORI) m.sporca();
}
function iscrivi(m: Motore) {
  MOTORI.add(m);
  if (iscritti++ === 0) {
    window.addEventListener("pointermove", suMovimento, { passive: true });
    window.addEventListener("scroll", suScorrimento, { passive: true, capture: true });
    window.addEventListener("resize", suScorrimento, { passive: true });
  }
}
function disiscrivi(m: Motore) {
  MOTORI.delete(m);
  if (--iscritti === 0) {
    window.removeEventListener("pointermove", suMovimento);
    window.removeEventListener("scroll", suScorrimento, { capture: true });
    window.removeEventListener("resize", suScorrimento);
  }
}

/** I primi antenati che tagliano in orizzontale e in verticale (overflow diverso da visible). */
function contenitori(svg: Element): { x: Element | null; y: Element | null } {
  let x: Element | null = null;
  let y: Element | null = null;
  for (let el = svg.parentElement; el && (!x || !y); el = el.parentElement) {
    const cs = getComputedStyle(el);
    if (!x && cs.overflowX !== "visible") x = el;
    if (!y && cs.overflowY !== "visible") y = el;
  }
  return { x, y };
}

// ——— Tipi ———

export interface OpzioniMotore {
  radice: SVGGElement;
  posa: Posa;
  interattivo: boolean;
  /** Chiave di localStorage per ricordare dove l'hai lasciato (solo nelle scene). */
  chiave: string | null;
  vento: number;
  freddo: boolean;
  /** Colore delle foglie che cadono. */
  foglia: string;
  onFumetto: (testo: string | null) => void;
  onCiclo?: () => void;
  /** Il mestiere: arredi e cosa fa adesso (vivo/mestiere.ts). */
  mestiere?: StatoMestiere | null;
  /** Le tracce nella scena (vivo/tracce.tsx): con queste le attività quotidiane hanno i loro oggetti. */
  scena?: StatoScena | null;
}

interface Particella {
  vivo: boolean;
  tipo: TipoParticella;
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  vita: number;
  eta: number;
  scala: number;
  cresce: number;
  giro: number;
  rot: number;
  op: number;
  seme: number;
  nodo?: SVGElement;
}

interface Sovrapposta {
  clip: Clip;
  t: number;
  foto: Canali;
  tipo: string;
}

interface Aria {
  vs: Canali;
  X: number;
  Y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  t: number;
  cadendo: boolean;
  rot: number;
  rotV: number;
  gamba: Record<Lato, number>;
  gambaV: Record<Lato, number>;
  ginocchio: Record<Lato, number>;
  ginocchioV: Record<Lato, number>;
  prossimoCalcio: number;
  segno: number;
  lamentato: boolean;
}

interface Premuto {
  id: number;
  tipo: string;
  x: number;
  y: number;
  zona: string;
  oggetto?: Oggetto;
  timer: number;
}

export class Motore implements Regia {
  private o: OpzioniMotore;
  private nodi = new Map<string, SVGElement>();
  private cache = new Map<string, string>();
  private s: StatoVivo = statoIniziale();
  /** I canali su cui gira la scenetta: la posa, oppure la posa al posto di lavoro. */
  private base: Canali;
  /** I canali della posa della pagina. */
  private basePosa: Canali;
  private mestiere: StatoMestiere | null = null;
  private chiaveMestiere = "";
  private lavoro: { id: string; scena: ScenaLavoro } | null = null;
  /** È già al suo posto di lavoro (il prossimo giro è il ciclo, non l'arrivo). */
  private alPosto = false;
  /** Il lavoro è un'attività quotidiana (non un mestiere): tra un ciclo e l'altro, gli intermezzi. */
  private quotidiana = false;
  private dopoIntermezzo = true;
  /** La posa di adesso (quella della pagina). */
  private posa: Posa;
  private figura: Figura;
  private scenetta: NomeScenetta;
  private chiavePosa: string;
  private clip: Clip;
  private clipT = 0;
  private clipScenetta = true;
  private ov: Sovrapposta | null = null;
  private aria: Aria | null = null;
  private v: Canali;
  private vBase: Canali;
  private casa = 0;
  private _ridotto = false;
  private rnd = Math.random;
  private repertorio: Repertorio;
  private particelle: Particella[] = [];
  private prossima = 0;
  private limiti = { sx: -20, dx: 260, su: -40, giu: 280 };
  private ctmInv: DOMMatrix | null = null;
  private ctmSporco = true;
  private ultimaMisura = -1;
  private ciglioT = -1;
  private prossimoCiglio = 2;
  private doppio = false;
  private sguardo = { tx: 0, ty: 0, cambio: 2 };
  private premuto: Premuto | null = null;
  private clic: number[] = [];
  private ultimoAccorto = -10;
  private lontano = true;
  private emettitori: Record<string, number> = {};
  private fum = { testo: null as string | null, t: 0, durata: 0, w: 0, h: 0, x0: 0, pensiero: false };
  private molle = { c: 0, cv: 0, dy: 0, dyv: 0, coda: 0, codav: 0 };
  private rotLento = 0;
  private prevX = 0;
  private prevY = 0;
  private velX = 0;
  private velY = 0;
  private presa = { x: 120, y: 160 };
  private pernoW = 0;
  private presenze = new Map<SVGElement, { p: number; px: number; py: number }>();
  private pulizie: (() => void)[] = [];
  private visibile = true;
  private io: IntersectionObserver | null = null;

  constructor(o: OpzioniMotore) {
    this.o = o;
    this.mestiere = o.mestiere ?? null;
    this.chiaveMestiere = JSON.stringify(this.mestiere);
    this.s.lavoro = this.mestiere ? statoLavoro(this.mestiere) : null;
    this.s.scena = o.scena ?? null;
    this.posa = o.posa;
    this.lavoro = this.scegliLavoro(o.posa);
    this.basePosa = { ...canaliDaPosa(o.posa), ...canaliDelMestiere(this.mestiere) };
    this.base = this.basePosa;
    this.figura = figuraDaPosa(o.posa);
    this.scenetta = scegliScenetta(o.posa);
    this.chiavePosa = JSON.stringify(o.posa);
    this.v = { ...this.base };
    this.vBase = { ...this.base };
    this.repertorio = new Repertorio(stradaDa(this.figura.indossa), umoreDa(o.posa, this.scenetta), this.rnd);
    for (let i = 0; i < N_PARTICELLE; i++) {
      this.particelle.push({ vivo: false, tipo: "foglia", x: 0, y: 0, vx: 0, vy: 0, g: 0, vita: 1, eta: 0, scala: 1, cresce: 1, giro: 0, rot: 0, op: 1, seme: Math.random() * 10 });
    }

    // Movimento ridotto: quello del sistema, salvo l'interruttore «Animazioni complete» del sito.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this._ridotto = movimentoRidotto();
    const suCambio = () => {
      this._ridotto = movimentoRidotto();
    };
    mq.addEventListener("change", suCambio);
    window.addEventListener(EVENTO_MOVIMENTO, suCambio);
    this.pulizie.push(() => {
      mq.removeEventListener("change", suCambio);
      window.removeEventListener(EVENTO_MOVIMENTO, suCambio);
    });

    this.aggiornaNodi(true);
    this.misuraLimiti();
    this.clip = this.nuovaScenetta();
    this.prossimoCiglio = 1.2 + this.rnd() * 3;
    this.sguardo.cambio = 1.5 + this.rnd() * 3;
    this.ripristinaPosto();

    iscrivi(this);
    this.attacca();
    // In sviluppo il motore si raggiunge dalla console: document.querySelector(".lv-radice").__motore
    if (process.env.NODE_ENV !== "production") (o.radice as unknown as { __motore?: Motore }).__motore = this;
    const svg = o.radice.ownerSVGElement;
    if (svg && "IntersectionObserver" in window) {
      this.io = new IntersectionObserver((voci) => {
        this.visibile = voci.some((v) => v.isIntersecting);
        this.accendi();
      });
      this.io.observe(svg);
    }
    this.accendi();
  }

  get ridotto() {
    return this._ridotto;
  }

  private accendi() {
    if (this.visibile) {
      ATTIVI.add(this);
      if (!raf) raf = requestAnimationFrame(giro);
    } else {
      ATTIVI.delete(this);
    }
  }

  distruggi() {
    ATTIVI.delete(this);
    disiscrivi(this);
    this.io?.disconnect();
    if (this.premuto) clearTimeout(this.premuto.timer);
    for (const f of this.pulizie) f();
    this.pulizie = [];
  }

  aggiornaOpzioni(o: Partial<Pick<OpzioniMotore, "vento" | "freddo" | "foglia" | "onFumetto" | "onCiclo">>) {
    Object.assign(this.o, o);
  }

  sporca() {
    this.ctmSporco = true;
  }

  // ——— Nodi e presenze ———

  aggiornaNodi(iniziale = false) {
    const r = this.o.radice;
    this.nodi.clear();
    this.cache.clear();
    r.querySelectorAll<SVGElement>("[data-n]").forEach((el) => {
      if (el.dataset.n) this.nodi.set(el.dataset.n, el);
    });
    const viste = new Map<SVGElement, { p: number; px: number; py: number }>();
    r.querySelectorAll<SVGElement>("[data-p]").forEach((el) => {
      const prima = this.presenze.get(el);
      if (prima) {
        viste.set(el, prima);
      } else {
        const [px, py] = (el.dataset.perno ?? "120,160").split(",").map(Number);
        viste.set(el, { p: iniziale ? 1 : 0, px, py });
      }
    });
    this.presenze = viste;
    this.particelle.forEach((p, i) => {
      p.nodo = this.nodi.get(`p${i}`);
    });
  }

  // ——— Misure: dal puntatore alle coordinate dell'albero ———

  private misuraLimiti() {
    const r = this.o.radice;
    const svg = r.ownerSVGElement;
    const m = r.getScreenCTM();
    if (!svg || !m) return;
    const b = svg.getBoundingClientRect();
    if (b.width < 1 || b.height < 1) return;
    const inv = m.inverse();
    // Dove si può muovere: dentro l'SVG, oppure (se l'SVG lascia uscire il disegno,
    // come nel paesaggio delle pagine) dentro il primo contenitore che taglia, e
    // comunque dentro la finestra.
    let r0 = { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
    if (getComputedStyle(svg).overflow === "visible") {
      if (!this.contenitori) this.contenitori = contenitori(svg);
      const cx = this.contenitori.x?.getBoundingClientRect();
      const cy = this.contenitori.y?.getBoundingClientRect();
      r0 = {
        left: Math.max(cx?.left ?? 0, 0),
        right: Math.min(cx?.right ?? window.innerWidth, window.innerWidth),
        top: Math.max(cy?.top ?? 0, 0),
        bottom: Math.max(b.bottom, Math.min(cy?.bottom ?? window.innerHeight, window.innerHeight)),
      };
    }
    const p1 = new DOMPoint(r0.left, r0.top).matrixTransform(inv);
    const p2 = new DOMPoint(r0.right, r0.bottom).matrixTransform(inv);
    this.limiti = { sx: Math.min(p1.x, p2.x), dx: Math.max(p1.x, p2.x), su: Math.min(p1.y, p2.y), giu: Math.max(p1.y, p2.y) };
    // Il prato delle tracce si stringe sugli schermi stretti (a passi, per non ridisegnare a ogni pixel).
    this.s.stringi = Math.round(stringiPrato(this.limiti.sx, this.limiti.dx) * 20) / 20;
    this.ctmInv = inv;
    this.ctmSporco = false;
  }

  private contenitori: { x: Element | null; y: Element | null } | null = null;

  private locale(cx: number, cy: number) {
    if (!this.ctmInv) this.misuraLimiti();
    const p = new DOMPoint(cx, cy).matrixTransform(this.ctmInv ?? new DOMMatrix());
    return { x: p.x, y: p.y };
  }

  /** Fase di lettura del fotogramma (prima di tutte le scritture). */
  leggi() {
    const recente = performance.now() - PUNTATORE.t < 200;
    // Rimisura anche ogni tanto: il contenitore può spostarsi o crescere con una transizione CSS.
    if (this.ctmSporco || this.s.t - this.ultimaMisura > 1.2 || (recente && this.s.t - this.ultimaMisura > 0.4)) {
      this.misuraLimiti();
      this.ultimaMisura = this.s.t;
    }
  }

  // ——— Regia (usata dalle scenette) ———

  private palco(): Palco {
    const margine = 80;
    return {
      rnd: this.rnd,
      ridotto: this._ridotto,
      spazioDx: lim(this.limiti.dx - margine - (120 + this.casa), 0, 170),
      spazioSx: lim(120 + this.casa - margine - this.limiti.sx, 0, 170),
      figura: this.figura,
      casa: this.casa,
      stringi: this.s.stringi,
    };
  }

  /** Il mestiere, se c'è; altrimenti l'attività quotidiana della posa, se ha una scenetta sua. */
  private scegliLavoro(posa: Posa): { id: string; scena: ScenaLavoro } | null {
    const m = scenaDelMestiere(this.mestiere);
    this.quotidiana = !m;
    return m ?? (this.s.scena ? scenaDellAttivita(azioneDaPosa(posa)) : null);
  }

  private nuovaScenetta(): Clip {
    this.clipScenetta = true;
    if (this.lavoro) {
      // Il mestiere o l'attività: la prima volta va al suo posto (e fa il lavoro vero), poi ripete il ciclo.
      const p = this.palco();
      const al = baseAlLavoro(this.lavoro.scena, this.basePosa, p);
      if (!this.alPosto) {
        this.alPosto = true;
        this.base = al;
        return entrata(this.lavoro.scena, { ...this.basePosa, x: 0 }, p);
      }
      this.base = al;
      // Tra un ciclo e l'altro, ogni tanto, un intermezzo breve (docs/stanze-e-vita.md, 5.5).
      if (this.quotidiana && !this.dopoIntermezzo && this.rnd() < 0.3) {
        this.dopoIntermezzo = true;
        const c = new Copione(al);
        intermezzo(this.lavoro.scena, c, p, al);
        return c.fine(0.4);
      }
      this.dopoIntermezzo = false;
      return ciclo(this.lavoro.scena, al, p);
    }
    this.base = this.basePosa;
    return SCENETTE[this.scenetta](this.base, this.palco());
  }

  pensa(testo: string, durata = 3.4) {
    this.fumetto(testo, durata, true);
  }

  frase(gruppo: string): string {
    if (gruppo.startsWith("oggetto:")) return this.repertorio.oggetto(gruppo.slice(8) as Oggetto);
    return this.repertorio.gruppo(gruppo);
  }

  /** Un fumetto (parole) o, con `pensiero`, la nuvoletta di quello che gli passa per la testa. */
  fumetto(testo: string, durata = 3, pensiero = false) {
    this.fum = { ...this.fum, testo, t: 0, durata, pensiero };
    this.o.onFumetto(testo);
  }

  /** C'è già un fumetto o una nuvoletta in scena. */
  get parla(): boolean {
    return !!this.fum.testo;
  }

  /** Dopo che React ha scritto il testo: misura e disegna la nuvoletta. */
  misuraFumetto() {
    const testo = this.nodi.get("fumettoTesto") as SVGTextElement | undefined;
    const rett = this.nodi.get("fumettoRett");
    const g = this.nodi.get("fumetto");
    if (!testo || !rett || !g || !this.fum.testo) return;
    // Per misurare il testo il gruppo deve essere visibile: lo si porta fuori dalla
    // vista a grandezza piena (rimpicciolito, il carattere minimo del browser falsa la misura).
    if (this.cache.get("fumetto|display") !== "inline") {
      g.setAttribute("display", "inline");
      g.setAttribute("transform", "translate(-10000 -10000)");
      this.cache.set("fumetto|display", "inline");
    }
    let b: DOMRect;
    try {
      b = testo.getBBox();
    } catch {
      return;
    }
    const x = b.x - 9;
    const y = b.y - 6;
    const w = b.width + 18;
    const h = -8 - y;
    rett.setAttribute("x", `${x}`);
    rett.setAttribute("y", `${y}`);
    rett.setAttribute("width", `${w}`);
    rett.setAttribute("height", `${h}`);
    // Il pensiero è una nuvola tonda, con le bollicine; le parole hanno la punta.
    rett.setAttribute("rx", this.fum.pensiero ? `${Math.min(h / 2, 22)}` : "12");
    testo.setAttribute("font-style", this.fum.pensiero ? "italic" : "normal");
    testo.setAttribute("fill-opacity", this.fum.pensiero ? "0.8" : "1");
    this.fum.w = w;
    this.fum.h = h;
    this.fum.x0 = x;
  }

  emetti(tipo: TipoParticella, x: number, y: number, op: OpzioniParticella = {}) {
    if (this._ridotto && tipo !== "zeta" && this.rnd() < 0.4) return;
    const [wx, wy] = op.mondo ? [x, y] : aMondo(this.v, this.s, x, y);
    const p = this.particelle[this.prossima];
    this.prossima = (this.prossima + 1) % N_PARTICELLE;
    if (!p.nodo) return;
    const forma = PARTICELLE[tipo];
    const lento = this._ridotto ? 0.35 : 1;
    Object.assign(p, {
      vivo: true,
      tipo,
      x: wx,
      y: wy,
      vx: (op.vx ?? 0) * lento,
      vy: (op.vy ?? -10) * lento,
      g: (op.gravita ?? (tipo === "goccia" || tipo === "sudore" ? 260 : 0)) * lento,
      vita: op.vita ?? 1.2,
      eta: 0,
      scala: op.scala ?? 1,
      cresce: op.cresce ?? 1,
      giro: (op.giro ?? 0) * lento,
      rot: tipo === "foglia" ? this.rnd() * 360 : 0,
      op: forma.opacita ?? 1,
      seme: this.rnd() * 10,
    });
    const n = p.nodo;
    n.setAttribute("d", forma.d);
    n.setAttribute("fill", tipo === "foglia" ? this.o.foglia : forma.fill);
    n.setAttribute("stroke", forma.stroke ?? "none");
    n.setAttribute("stroke-width", `${forma.sw ?? 0}`);
    n.setAttribute("opacity", "0");
    n.setAttribute("display", "inline");
  }

  // ——— Posa ———

  impostaPosa(posa: Posa) {
    const chiave = JSON.stringify(posa);
    if (chiave === this.chiavePosa) return;
    this.chiavePosa = chiave;
    this.posa = posa;
    const nuova = canaliDaPosa(posa);
    this.figura = figuraDaPosa(posa);
    this.scenetta = scegliScenetta(posa);
    this.repertorio.aggiorna(stradaDa(this.figura.indossa), umoreDa(posa, this.scenetta));
    this.basePosa = { ...nuova, ...canaliDelMestiere(null) };
    // Un'attività quotidiana nuova: ci va camminando, come per un mestiere.
    const prima = this.lavoro?.id ?? null;
    this.lavoro = this.scegliLavoro(posa);
    const cambiata = this.quotidiana && (this.lavoro?.id ?? null) !== prima;
    if (cambiata) this.alPosto = false;
    this.base = this.lavoro ? baseAlLavoro(this.lavoro.scena, this.basePosa, this.palco()) : this.basePosa;
    this.emettitori = {};
    if (this.aria) return;
    const foto = { ...(this.ov ? this.vBase : this.v) };
    if (cambiata && this.lavoro) {
      this.alPosto = true;
      this.clip = entrata(this.lavoro.scena, foto, this.palco());
    } else if (Math.abs(foto.x - this.base.x) > 4) this.clip = this.aPiedi(foto, this.base);
    else this.clip = I.cambio(foto, this.base, this.palco());
    this.clipT = 0;
    this.clipScenetta = false;
  }

  /** Torna a piedi alla posa nuova (dopo un'attività lontana da casa), senza scivolare. */
  private aPiedi(foto: Canali, base: Canali): Clip {
    const p = this.palco();
    const c = new Copione(foto);
    c.vai(0.01, { attrSx: 0, attrDx: 0 }, "scatto");
    if (foto.seduto > 0.5) alzati(c, p);
    cammina(c, p, base.x, 0);
    const bersagli: Partial<Canali> = {};
    for (const k of NOMI_CANALI) if (!DISCRETI.has(k) && k !== "x" && Math.abs(c.valoreA(k) - base[k]) > 1e-3) bersagli[k] = base[k];
    c.vai(0.5, bersagli);
    return c.chiudi();
  }

  /** Le tracce nella scena cambiano (la pagina passa all'attività dopo, o alla fascia dopo). */
  impostaScena(scena: StatoScena | null) {
    this.s.scena = scena;
  }

  /** Cambia il mestiere o quello che sta facendo: ci va camminando dal punto in cui è. */
  impostaMestiere(m: StatoMestiere | null) {
    const chiave = JSON.stringify(m);
    if (chiave === this.chiaveMestiere) return;
    this.chiaveMestiere = chiave;
    this.mestiere = m;
    this.s.lavoro = m ? statoLavoro(m) : null;
    this.lavoro = this.scegliLavoro(this.posa);
    this.alPosto = false;
    if (this.aria) return;
    const foto = { ...(this.ov ? this.vBase : this.v), ...canaliDelMestiere(m) };
    if (this.lavoro) {
      const p = this.palco();
      this.base = baseAlLavoro(this.lavoro.scena, this.basePosa, p);
      this.alPosto = true;
      this.clip = entrata(this.lavoro.scena, foto, p);
    } else {
      this.base = this.basePosa;
      this.clip = I.cambio(foto, this.base, this.palco());
      this.clipScenetta = false;
    }
    this.clipT = 0;
  }

  private ripristinaPosto() {
    if (!this.o.chiave) return;
    let salvata = NaN;
    try {
      salvata = Number(window.localStorage.getItem(this.o.chiave));
    } catch {
      return;
    }
    if (!Number.isFinite(salvata) || Math.abs(salvata) < 2) return;
    const minX = this.limiti.sx + 70 - 120;
    const maxX = this.limiti.dx - 70 - 120;
    this.casa = lim(salvata, minX, maxX);
    if (this._ridotto) return;
    const foto = { ...this.v, x: -this.casa };
    this.avvia(I.vaiAlPosto(foto, this.palco(), -this.casa), foto, "posto");
  }

  private salva(x: number | null) {
    if (!this.o.chiave) return;
    try {
      if (x === null || Math.abs(x) < 2) window.localStorage.removeItem(this.o.chiave);
      else window.localStorage.setItem(this.o.chiave, `${Math.round(x)}`);
    } catch {
      // localStorage non disponibile: pazienza, la posizione non si ricorda.
    }
  }

  private avvia(clip: Clip, foto: Canali, tipo: string) {
    this.ov = { clip, t: 0, foto, tipo };
  }

  // ——— Il fotogramma ———

  private eventi(clip: Clip, da: number, a: number) {
    for (const e of clip.eventi) if (e.t > da && e.t <= a) e.fai(this);
    if (da === 0) for (const e of clip.eventi) if (e.t === 0) e.fai(this);
  }

  passo(dt: number) {
    const s = this.s;
    s.t += dt;
    s.ridotto = this._ridotto;

    // 1. La scenetta (ferma mentre l'albero reagisce a te)
    if (!this.ov && !this.aria) {
      const t0 = this.clipT;
      this.clipT += dt;
      this.eventi(this.clip, t0, this.clipT);
      if (this.clipT >= this.clip.durata) {
        const eraScenetta = this.clipScenetta;
        this.clip = this.nuovaScenetta();
        this.clipT = 0;
        if (eraScenetta) this.o.onCiclo?.();
      }
    }
    const v = this.v;
    const vb = this.vBase;
    for (const c of NOMI_CANALI) vb[c] = this.clip.valore(c, this.clipT, this.base[c]);
    Object.assign(v, vb);

    // 2. La reazione in corso, che sfuma alla fine
    if (this.ov) {
      const ov = this.ov;
      const t0 = ov.t;
      ov.t += dt;
      this.eventi(ov.clip, t0, ov.t);
      const d = ov.clip.durata;
      const diss = ov.clip.dissolvenza;
      const w = diss > 0 && ov.t > d - diss ? 1 - liscio((ov.t - (d - diss)) / diss) : 1;
      for (const c of NOMI_CANALI) {
        const val = ov.clip.valore(c, ov.t, ov.foto[c]);
        v[c] = DISCRETI.has(c) ? (w > 0.5 ? val : vb[c]) : vb[c] + (val - vb[c]) * w;
      }
      if (ov.t >= d) this.ov = null;
    }

    // 3. In volo (trascinato o in caduta)
    let X = this.casa + v.x;
    let Y = v.y;
    if (this.aria) [X, Y] = this.passoAria(dt, v);
    this.pernoW += ((this.aria ? 1 : 0) - this.pernoW) * verso0(dt, 10);
    s.pernoX = 120 + (this.presa.x - 120) * this.pernoW;
    s.pernoY = TERRA + (this.presa.y - TERRA) * this.pernoW;
    s.X = X;
    s.Y = Y;

    // 4. Passo, molle, vita
    if (v.passo > 0.01) s.fase += TAU * v.cadenza * dt;
    this.velX += ((X - this.prevX) / dt - this.velX) * verso0(dt, 12);
    this.velY += ((Y - this.prevY) / dt - this.velY) * verso0(dt, 12);
    this.prevX = X;
    this.prevY = Y;
    this.rotLento += (v.rot - this.rotLento) * verso0(dt, 6);
    this.passoMolle(dt, v);
    this.passoVita(dt, v, X, Y);
    if (!this.aria && !this.lavoro) this.passoEmettitori(v);

    // 5. Disegno
    const A = fotogramma(v, this.figura, s);
    this.scrivi(A);
    this.passoParticelle(dt);
    this.passoPresenze(dt);
    this.passoFumetto(dt, X, Y, v);
  }

  private passoMolle(dt: number, v: Canali) {
    const m = this.molle;
    const t = this.s.t;
    const vento = this.o.vento * (this._ridotto ? 0.3 : 1);
    const raffica = vento * (2 * Math.sin(t * 0.9) + 0.9 * Math.sin(t * 2.3 + 1) + 0.6 * Math.sin(t * 5.1 + 2));
    const scatto = v.rot - this.rotLento;
    const bersC = raffica - lim(this.velX * 0.012, -10, 10) - scatto * 0.9;
    m.cv += (80 * (bersC - m.c) - 7 * m.cv) * dt;
    m.c += m.cv * dt;
    const bersDy = lim(-this.velY * 0.012, -6, 6);
    m.dyv += (120 * (bersDy - m.dy) - 9 * m.dyv) * dt;
    m.dy += m.dyv * dt;
    const bersCoda = lim(-this.velX * 0.05, -28, 28) + raffica * 2 + (v.passo > 0.05 ? Math.sin(this.s.fase) * 5 * Math.min(1, v.passo) : 0) - scatto;
    m.codav += (60 * (bersCoda - m.coda) - 6 * m.codav) * dt;
    m.coda += m.codav * dt;
    this.s.chiomaA = lim(m.c, -25, 25);
    this.s.chiomaDy = lim(m.dy, -8, 8);
    this.s.codaA = lim(m.coda, -40, 40);
  }

  private passoVita(dt: number, v: Canali, X: number, Y: number) {
    const s = this.s;
    // Battito di ciglia a intervalli casuali, a volte doppio.
    if (this.ciglioT >= 0) {
      this.ciglioT += dt;
      const u = this.ciglioT / 0.15;
      s.ciglio = u < 1 ? 1 - Math.abs(2 * u - 1) : 0;
      if (u >= 1) {
        this.ciglioT = -1;
        if (this.doppio) {
          this.doppio = false;
          this.prossimoCiglio = s.t + 0.12;
        } else this.prossimoCiglio = s.t + 1.8 + this.rnd() * 4.5;
      }
    } else if (s.t >= this.prossimoCiglio) {
      this.ciglioT = 0;
      this.doppio = this.rnd() < 0.2;
    }

    // Si guarda intorno.
    const g = this.sguardo;
    if (s.t >= g.cambio) {
      if (g.tx === 0 && g.ty === 0 && this.rnd() < 0.8) {
        g.tx = (this.rnd() * 2 - 1) * 2.2;
        g.ty = (this.rnd() * 2 - 1) * 1.1;
        g.cambio = s.t + 0.6 + this.rnd() * 1.2;
      } else {
        g.tx = 0;
        g.ty = 0;
        g.cambio = s.t + 2 + this.rnd() * 4;
      }
    }
    s.sguardoX += (g.tx - s.sguardoX) * verso0(dt, 14);
    s.sguardoY += (g.ty - s.sguardoY) * verso0(dt, 14);

    // Gli occhi seguono il puntatore quando è vicino.
    let wT = 0;
    if (this.o.interattivo && this.ctmInv && !this.aria && v.palpebra < 0.8 && performance.now() - PUNTATORE.t < 4000) {
      const p = this.locale(PUNTATORE.x, PUNTATORE.y);
      const ex = X + 120 + 7 * v.verso;
      const ey = Y + 164 + v.seduto * 22;
      const dx = p.x - ex;
      const dy = p.y - ey;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 300) {
        wT = d < 220 ? 1 : (300 - d) / 80;
        const m = Math.min(2.8, d / 22);
        s.guardaX += ((dx / d) * m - s.guardaX) * verso0(dt, 16);
        s.guardaY += ((dy / d) * m * 0.85 - s.guardaY) * verso0(dt, 16);
      }
      if (d < 150 && this.lontano && PUNTATORE.tipo === "mouse") {
        this.lontano = false;
        this.accorgiti(Math.sign(dx) || 1);
      }
      if (d > 240) this.lontano = true;
    }
    s.guardaW += (wT * 0.92 - s.guardaW) * verso0(dt, 6);
  }

  private accorgiti(dir: number) {
    if (this.ov || this.aria || this.s.t - this.ultimoAccorto < 7) return;
    if (this.v.palpebra > 0.8) return;
    this.ultimoAccorto = this.s.t;
    const foto = { ...this.v };
    this.avvia(I.accorto(foto, this.palco(), dir), foto, "accorto");
  }

  private ogni(nome: string, periodo: number, fai: () => void) {
    const t = this.s.t;
    const prossimo = this.emettitori[nome] ?? t + this.rnd() * periodo;
    if (t >= prossimo) {
      fai();
      this.emettitori[nome] = t + periodo * (0.75 + this.rnd() * 0.5);
    } else this.emettitori[nome] = prossimo;
  }

  private passoEmettitori(v: Canali) {
    const f = this.figura;
    const r = () => this.rnd();
    if (this.scenetta === "generica" && !this.ov) {
      for (const e of f.effetti) {
        if (e === "zzz") this.ogni("zzz", 1.5, () => this.emetti("zeta", 140, 168, { vx: 16, vy: -24, vita: 2.4, scala: 0.8, cresce: 1.5, giro: -8 }));
        if (e === "sudore") this.ogni("sudore", 1.1, () => this.emetti("sudore", r() < 0.5 ? 84 : 158, 112, { vy: 20, vita: 0.9 }));
        if (e === "note") this.ogni("note", 0.8, () => this.emetti("nota", r() < 0.5 ? 168 : 72, 110, { vx: (r() - 0.5) * 30, vy: -26, vita: 1.8, giro: 30 }));
        if (e === "cuori") this.ogni("cuori", 1.3, () => this.emetti("cuore", 176, 150, { vx: 10, vy: -24, vita: 1.8, cresce: 1.3 }));
        if (e === "stelline") this.ogni("stelline", 0.45, () => this.emetti("stella", 50 + r() * 140, 40 + r() * 130, { vy: 0, vita: 0.9 }));
        if (e === "schiuma") this.ogni("bolle", 0.9, () => this.emetti("bolla", 80 + r() * 80, 60 + r() * 50, { vx: (r() - 0.5) * 20, vy: -24, vita: 1.8, scala: 0.8 }));
      }
    }
    for (const o of f.oggetti) {
      const dove = DOVE[o];
      if (dove !== "sx" && dove !== "dx") continue;
      const manoX = this.mano[dove].x;
      const manoY = this.mano[dove].y;
      if (o === "tazza") this.ogni("tazza", 1.2, () => this.emetti("vapore", manoX, manoY - 18, { vy: -14, vx: 4, vita: 1.6, scala: 0.3, cresce: 1.8 }));
      if (o === "annaffiatoio") this.ogni("annaffia", 0.22, () => this.emetti("goccia", manoX - 16, manoY - 24, { vx: -8, vy: 30, gravita: 320, vita: 0.8, scala: 0.6 }));
    }
    if (this.o.freddo && this.scenetta !== "freddo" && v.parla < 0.1 && v.palpebra < 0.9) {
      this.ogni("fiato", 2.8, () => this.emetti("sbuffo", 120 + v.verso * 8, 186, { vx: v.verso * 20, vy: -16, vita: 1.3, scala: 0.5, cresce: 1.4 }));
    }
  }

  private mano: Record<Lato, { x: number; y: number }> = { sx: { x: 50, y: 180 }, dx: { x: 190, y: 180 } };

  private scrivi(A: Attributi) {
    for (const k in A) {
      const at = A[k];
      if (k[0] === "_") {
        if (k === "_manoSx") this.mano.sx = { x: Number(at.x), y: Number(at.y) };
        if (k === "_manoDx") this.mano.dx = { x: Number(at.x), y: Number(at.y) };
        continue;
      }
      const el = this.nodi.get(k);
      if (!el) continue;
      for (const a in at) {
        const chiave = `${k}|${a}`;
        const val = at[a];
        if (this.cache.get(chiave) !== val) {
          this.cache.set(chiave, val);
          el.setAttribute(a, val);
        }
      }
    }
  }

  private passoParticelle(dt: number) {
    for (const p of this.particelle) {
      if (!p.vivo || !p.nodo) continue;
      p.eta += dt;
      if (p.eta >= p.vita) {
        p.vivo = false;
        p.nodo.setAttribute("display", "none");
        continue;
      }
      p.vy += p.g * dt;
      if (p.tipo === "foglia") {
        p.vy = Math.min(p.vy, 38);
        p.x += Math.sin(p.eta * 3.5 + p.seme) * 26 * dt;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.exp(-dt * 0.8);
      p.rot += p.giro * dt;
      if (p.y > TERRA + 4 && p.g > 0) {
        if (p.tipo === "ghianda" || p.tipo === "foglia") {
          p.y = TERRA + 2;
          p.vy = 0;
          p.g = 0;
          p.vx *= 0.3;
          p.giro = 0;
        } else {
          p.vivo = false;
          p.nodo.setAttribute("display", "none");
          continue;
        }
      }
      const u = p.eta / p.vita;
      let sc = p.scala * (1 + (p.cresce - 1) * u);
      if (p.tipo === "stella") sc *= 0.3 + Math.sin(Math.PI * u) * 1.1;
      const a = p.op * Math.min(1, u / 0.12) * Math.min(1, (1 - u) / 0.3);
      p.nodo.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)}) scale(${sc.toFixed(2)})`);
      p.nodo.setAttribute("opacity", a.toFixed(2));
    }
  }

  private passoPresenze(dt: number) {
    for (const [el, pr] of this.presenze) {
      if (pr.p >= 1) continue;
      pr.p = Math.min(1, pr.p + dt / 0.4);
      if (pr.p >= 1) el.removeAttribute("transform");
      else el.setAttribute("transform", `translate(${pr.px} ${pr.py}) scale(${fuoriBack(pr.p).toFixed(3)}) translate(${-pr.px} ${-pr.py})`);
    }
  }

  private passoFumetto(dt: number, X: number, Y: number, v: Canali) {
    const f = this.fum;
    const g = this.nodi.get("fumetto");
    const box = this.nodi.get("fumettoBox");
    if (!g || !box) return;
    if (!f.testo) {
      if (this.cache.get("fumetto|display") !== "none") {
        this.cache.set("fumetto|display", "none");
        g.setAttribute("display", "none");
      }
      return;
    }
    f.t += dt;
    let pop: number;
    if (f.t < 0.28) pop = fuoriBack(f.t / 0.28);
    else if (f.t < f.durata) pop = 1;
    else {
      const u = (f.t - f.durata) / 0.18;
      pop = 1 - u;
      if (u >= 1) {
        f.testo = null;
        this.o.onFumetto(null);
        return;
      }
    }
    const L = this.limiti;
    const alto = Y + v.seduto * 22;
    let tipX = X + 170;
    let tipY = alto + 44;
    if (tipX + 30 > L.dx - 4) tipX = X + 70;
    const w = f.w || 120;
    const h = f.h || 30;
    let bx = -6 - f.x0;
    const sinistra = tipX + f.x0 + bx;
    if (sinistra + w > L.dx - 4) bx -= sinistra + w - (L.dx - 4);
    if (tipX + f.x0 + bx < L.sx + 4) bx += L.sx + 4 - (tipX + f.x0 + bx);
    bx = lim(bx, 12 - w - f.x0, -12 - f.x0);
    if (tipY - 8 - h < L.su + 4) tipY = L.su + 4 + 8 + h;
    this.cache.set("fumetto|display", "inline");
    g.setAttribute("display", "inline");
    g.setAttribute("transform", `translate(${tipX.toFixed(1)} ${tipY.toFixed(1)}) scale(${Math.max(0.001, pop).toFixed(3)})`);
    // Punta per le parole, bollicine per i pensieri.
    const forma = f.pensiero ? "pensiero" : "parole";
    if (this.cache.get("fumetto|forma") !== forma) {
      this.cache.set("fumetto|forma", forma);
      this.nodi.get("fumettoCoda")?.setAttribute("display", f.pensiero ? "none" : "inline");
      this.nodi.get("fumettoBolle")?.setAttribute("display", f.pensiero ? "inline" : "none");
    }
    box.setAttribute("transform", `translate(${bx.toFixed(1)} 0)`);
  }

  // ——— Interazioni ———

  private attacca() {
    if (!this.o.interattivo) return;
    const r = this.o.radice;
    const su = <K extends keyof SVGElementEventMap>(tipo: K, fn: (e: SVGElementEventMap[K]) => void, opz?: AddEventListenerOptions) => {
      r.addEventListener(tipo, fn as EventListener, opz);
      this.pulizie.push(() => r.removeEventListener(tipo, fn as EventListener, opz));
    };
    su("pointerdown", this.giu);
    su("pointermove", this.muovi);
    su("pointerup", this.alza);
    su("pointercancel", this.annulla);
    su("keydown", this.tasto);
    su("pointerenter", (e) => {
      if (e.pointerType === "mouse") this.accorgiti(1);
    });
    su("contextmenu", (e) => {
      if (this.premuto || this.aria) e.preventDefault();
    });
    su("touchmove", (e) => {
      if (this.aria) e.preventDefault();
    }, { passive: false });
  }

  private giu = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = (e.target as Element).closest<SVGElement>("[data-zona]");
    const zona = el?.dataset.zona;
    if (!zona) return;
    this.misuraLimiti();
    const p: Premuto = { id: e.pointerId, tipo: e.pointerType, x: e.clientX, y: e.clientY, zona, oggetto: el?.dataset.oggetto as Oggetto | undefined, timer: 0 };
    this.premuto = p;
    try {
      this.o.radice.setPointerCapture(e.pointerId);
    } catch {
      // alcuni browser non catturano sugli elementi SVG: va bene lo stesso
    }
    if (e.pointerType === "mouse") e.preventDefault();
    else if (zona !== "oggetto") {
      p.timer = window.setTimeout(() => {
        if (this.premuto === p) this.solleva(p.x, p.y);
      }, 380);
    }
  };

  private muovi = (e: PointerEvent) => {
    const p = this.premuto;
    if (!p || e.pointerId !== p.id) return;
    if (this.aria && !this.aria.cadendo) {
      const l = this.locale(e.clientX, e.clientY);
      this.aria.tx = l.x - this.presa.x;
      this.aria.ty = l.y - this.presa.y;
      return;
    }
    const d = Math.hypot(e.clientX - p.x, e.clientY - p.y);
    if (p.tipo === "mouse") {
      if (d > 5 && (p.zona === "corpo" || p.zona === "chioma")) this.solleva(e.clientX, e.clientY);
    } else if (d > 10) {
      clearTimeout(p.timer);
      this.premuto = null;
    }
  };

  private alza = (e: PointerEvent) => {
    const p = this.premuto;
    if (!p || e.pointerId !== p.id) return;
    clearTimeout(p.timer);
    this.premuto = null;
    if (this.aria && !this.aria.cadendo) {
      this.lascia();
      return;
    }
    if (!this.aria) this.tocca(p.zona, p.oggetto);
  };

  private annulla = (e: PointerEvent) => {
    const p = this.premuto;
    if (!p || e.pointerId !== p.id) return;
    clearTimeout(p.timer);
    this.premuto = null;
    if (this.aria && !this.aria.cadendo) this.lascia();
  };

  private tasto = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.tocca("corpo");
    }
  };

  /** Clic, tocco o Invio. Tanti di fila: solletico, poi finta rabbia. */
  tocca(zona: string, oggetto?: Oggetto) {
    // Mentre atterra o torna al suo posto finisce quello che sta facendo;
    // mentre fa finta di arrabbiarsi non si lascia interrompere.
    if (this.aria || this.ov?.tipo === "atterraggio" || this.ov?.tipo === "posto") return;
    if (this.ov?.tipo === "arrabbiato" && this.ov.t < this.ov.clip.durata - 0.6) return;
    const ora = this.s.t;
    this.clic = this.clic.filter((t) => ora - t < 1.6);
    this.clic.push(ora);
    const n = this.clic.length;
    const foto = { ...this.v };
    const p = this.palco();
    if (n >= 6) {
      this.clic = [];
      this.avvia(I.arrabbiato(foto, p), foto, "arrabbiato");
      return;
    }
    if (n >= 3) {
      if (this.ov?.tipo !== "solletico" || this.ov.t > 1) this.avvia(I.solletico(foto, p), foto, "solletico");
      return;
    }
    const lato: Lato = braccioLibero(this.figura, "dx") ? "dx" : braccioLibero(this.figura, "sx") ? "sx" : "dx";
    const opz: I.OpzioniSaluto = {};
    if (zona === "chioma") opz.chioma = true;
    if (zona === "oggetto" && oggetto) opz.oggetto = { nome: oggetto, dove: DOVE[oggetto] };
    this.avvia(I.saluto(foto, p, lato, opz), foto, "saluto");
  }

  private solleva(cx: number, cy: number) {
    if (this.aria) return;
    const l = this.locale(cx, cy);
    const X = this.s.X;
    const Y = this.s.Y;
    this.presa = { x: lim(l.x - X, 60, 180), y: lim(l.y - Y, 0, 250) };
    this.ov = null;
    this.aria = {
      vs: { ...this.v },
      X,
      Y,
      tx: X,
      ty: Y - 18,
      vx: 0,
      vy: 0,
      t: 0,
      cadendo: false,
      rot: this.v.rot,
      rotV: 0,
      gamba: { sx: 0, dx: 0 },
      gambaV: { sx: 0, dx: 0 },
      ginocchio: { sx: 0, dx: 0 },
      ginocchioV: { sx: 0, dx: 0 },
      prossimoCalcio: 0.3,
      segno: 0,
      lamentato: false,
    };
    this.clip = this.nuovaScenetta();
    this.clipT = 0;
    this.alPosto = false;
    this.o.radice.setAttribute("data-trascina", "");
  }

  private lascia() {
    const a = this.aria;
    if (!a) return;
    a.cadendo = true;
    a.vx = lim(a.vx * 0.5, -500, 500);
    a.vy = lim(a.vy * 0.4, -320, 320);
    this.o.radice.removeAttribute("data-trascina");
  }

  private passoAria(dt: number, v: Canali): [number, number] {
    const a = this.aria!;
    a.t += dt;
    const L = this.limiti;
    const minX = L.sx + 70 - 120;
    const maxX = L.dx - 70 - 120;
    // Si può alzare anche oltre il bordo di sopra: la chioma esce, la faccia resta in vista.
    const minY = Math.min(-24, L.su - 40);
    const rid = this._ridotto;

    if (!a.cadendo) {
      const tx = lim(a.tx, minX, maxX);
      const ty = lim(a.ty, minY, -6);
      const k = verso0(dt, 22);
      const nx = a.X + (tx - a.X) * k;
      const ny = a.Y + (ty - a.Y) * k;
      a.vx = (nx - a.X) / dt;
      a.vy = (ny - a.Y) / dt;
      a.X = nx;
      a.Y = ny;
      // Se lo scuoti, perde le foglie.
      const sg = Math.sign(a.vx);
      if (Math.abs(a.vx) > 260) {
        if (a.segno !== 0 && sg !== a.segno) {
          for (let i = 0; i < 2; i++) this.emetti("foglia", 70 + this.rnd() * 100, 40 + this.rnd() * 80, { vx: -a.vx * 0.1, vy: 10, gravita: 40, vita: 2.6, giro: (this.rnd() - 0.5) * 220 });
        }
        a.segno = sg;
      }
      if (a.t > 2.2 && !a.lamentato) {
        a.lamentato = true;
        this.fumetto(this.frase("sollevato"), 2.2);
      }
    } else if (rid) {
      a.Y += (0 - a.Y) * verso0(dt, 9);
      if (a.Y > -0.6) a.Y = 0;
    } else {
      a.vy += 2400 * dt;
      a.X = lim(a.X + a.vx * dt, minX, maxX);
      a.vx *= Math.exp(-dt * 2.5);
      a.Y = Math.min(0, a.Y + a.vy * dt);
      if (a.Y >= 0) a.Y = 0;
    }

    // Il corpo oscilla come un pendolo attorno a dove lo tieni.
    const rotBers = rid || a.cadendo ? 0 : lim(a.vx * 0.05, -28, 28);
    a.rotV += (90 * (rotBers - a.rot) - 8 * a.rotV) * dt;
    a.rot += a.rotV * dt;

    // Le radici penzolano e ogni tanto scalcia.
    for (const lato of ["sx", "dx"] as const) {
      const bers = lim(-a.vx * 0.04 - a.rot, -35, 35);
      a.gambaV[lato] += (40 * (bers - a.gamba[lato]) - 3 * a.gambaV[lato]) * dt;
      a.gamba[lato] += a.gambaV[lato] * dt;
      a.ginocchioV[lato] += (60 * (0 - a.ginocchio[lato]) - 6 * a.ginocchioV[lato]) * dt;
      a.ginocchio[lato] += a.ginocchioV[lato] * dt;
    }
    if (!rid && a.t > a.prossimoCalcio) {
      const lato: Lato = this.rnd() < 0.5 ? "sx" : "dx";
      a.ginocchioV[lato] += 420 + this.rnd() * 200;
      a.gambaV[lato] += (this.rnd() - 0.5) * 300;
      a.prossimoCalcio = a.t + 0.35 + this.rnd() * 0.7;
    }

    const t = a.t;
    const sbatti = rid ? 0.2 : 1;
    const T: Partial<Canali> = {
      sbarra: 1,
      palpebra: 0,
      palpebraInc: 0,
      occhiolino: 0,
      felice: 0,
      stella: 0,
      cigliaY: -3.5,
      cigliaRot: 0,
      boccaL: 3.6,
      boccaY: 3,
      boccaSu: -7,
      boccaGiu: 7,
      boccaStorta: 0,
      parla: 0,
      passo: 0,
      braccioPasso: 0,
      sxAnim: 0,
      dxAnim: 0,
      corpoAnim: 0,
      radici: 1,
      seduto: 0,
      sx: rid ? 1 : 0.97,
      sy: rid ? 1 : 1.05,
      verso: lim(a.vx / 400, -0.6, 0.6),
      pupY: -0.5,
      sxSpalla: 30 + 32 * sbatti * Math.sin(TAU * 2.1 * t),
      sxGomito: -20 + 26 * sbatti * Math.sin(TAU * 2.1 * t + 1),
      dxSpalla: 30 + 32 * sbatti * Math.sin(TAU * 2.1 * t + Math.PI),
      dxGomito: -20 + 26 * sbatti * Math.sin(TAU * 2.1 * t + Math.PI + 1),
      sxAllunga: 1,
      dxAllunga: 1,
      libro: 1,
      pagina: 0,
    };
    const k = verso0(dt, 12);
    for (const c of Object.keys(T) as (keyof Canali)[]) a.vs[c] += (T[c]! - a.vs[c]) * k;
    const fronte = a.vs.verso >= 0 ? 1 : -1;
    a.vs.sxAnca = a.gamba.sx * fronte;
    a.vs.dxAnca = a.gamba.dx * fronte;
    a.vs.sxGinocchio = lim(a.ginocchio.sx, 0, 80);
    a.vs.dxGinocchio = lim(a.ginocchio.dx, 0, 80);
    Object.assign(v, a.vs);
    v.rot = a.rot;
    v.x = a.X - this.casa;
    v.y = a.Y;

    const X = a.X;
    const Y = a.Y;
    if (a.cadendo && a.Y >= 0) this.atterra();
    return [X, Y];
  }

  private atterra() {
    const a = this.aria;
    if (!a) return;
    this.aria = null;
    const resta = this.o.chiave ? this.rnd() < 0.5 : this.rnd() < 0.3;
    let da = 0;
    if (resta) {
      this.casa = a.X;
      this.salva(a.X);
    } else {
      da = a.X - this.casa;
      this.salva(this.casa);
    }
    const foto: Canali = { ...a.vs, rot: a.rot, x: da, y: 0 };
    this.clip = this.nuovaScenetta();
    this.clipT = 0;
    this.avvia(I.atterraggio(foto, this.palco(), { da, torna: !resta, protesta: this.rnd() < 0.55 }), foto, "atterraggio");
  }
}
