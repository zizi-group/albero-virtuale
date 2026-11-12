"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { Albero } from "@/components/albero/Albero";
import { EVENTO_VOCE, type DettaglioVoce } from "@/components/albero/vivo/AlberoVivo";
import { misureDellEta } from "@/components/albero/vivo/figura";
import { Ambiente } from "@/components/ambiente/Ambiente";
import type { Ora } from "@/components/ambiente/atmosfera";
import { Cassetta, Taccuino } from "@/components/ambiente/Oggetti";
import { EVENTO_MOVIMENTO, InterruttoreMovimento, movimentoRidotto } from "@/components/Movimento";
import { EVENTO_PROVA, EVENTO_REAZIONE, type DettaglioProva } from "@/components/giardino3d/reazioni";
import type { Reazione } from "@/components/giardino3d/tipi";
import { azione } from "@/lib/albero/azioni";
import { NOMI_FASCE_FRASE } from "@/lib/albero/giornata";
import type { Fascia } from "@/lib/albero/mestieri";
import type { Meteo, Posa, Stadio, Stagione } from "@/lib/albero/tipi";
import { EVENTO_DECISIONE, type DettaglioDecisione } from "./Buongiorno";
import { Suoni, type TipoSuono } from "./suoni";

// Il giardino immersivo: la scena occupa tutto lo schermo, i comandi stanno
// sopra come un HUD, lettere, diario, conversazione, mese e carattere si
// aprono in pannelli sopra la scena. Tutto schermo con F, scorciatoie, suoni
// d'ambiente (spenti di default), parallasse, time-lapse quando passa un giorno.

export type IdPannello = "buongiorno" | "lettere" | "diario" | "scrivi" | "mese" | "collezione" | "carattere";

/** `breve`: il nome nella barra a schede del telefono, dove ogni voce ha circa 50 px. */
const PANNELLI: { id: IdPannello; nome: string; breve: string; tasto: string }[] = [
  { id: "buongiorno", nome: "Buongiorno", breve: "Mattino", tasto: "B" },
  { id: "lettere", nome: "Lettere", breve: "Lettere", tasto: "L" },
  { id: "diario", nome: "Diario", breve: "Diario", tasto: "D" },
  { id: "scrivi", nome: "Scrivigli", breve: "Scrivi", tasto: "S" },
  { id: "mese", nome: "Il mese", breve: "Mese", tasto: "M" },
  { id: "collezione", nome: "Collezione", breve: "Trofei", tasto: "T" },
  { id: "carattere", nome: "Carattere", breve: "Tratti", tasto: "C" },
];

/** Icone dei comandi: tratto unico, colore del testo. */
const TRATTI = {
  buongiorno: "M3 18.5h18M6.5 18.5a5.5 5.5 0 0 1 11 0M12 4v2.6M4.5 9.2l1.9 1.3M19.5 9.2l-1.9 1.3M8.5 21.5h7",
  collezione: "M8 2.8h2.6L12 7.4l1.4-4.6H16l-1.9 6.4M12 21.2a5.6 5.6 0 1 0 0-11.2 5.6 5.6 0 0 0 0 11.2zM12 13l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z",
  lettere: "M5.5 5.5h13a2.5 2.5 0 0 1 2.5 2.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16V8a2.5 2.5 0 0 1 2.5-2.5zM3.6 7.2l8.4 6 8.4-6",
  diario: "M6 3.5h11.5v14H7.5A2 2 0 0 0 5.5 19.5M5.5 19.5A2 2 0 0 0 7.5 21.5h10v-4M5.5 19.5V5a1.5 1.5 0 0 1 .5-1.5M9 8h5.5M9 11h4",
  scrivi: "M7 4.5h10A2.5 2.5 0 0 1 19.5 7v6.5A2.5 2.5 0 0 1 17 16h-5.5L7 19.5V16a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 7 4.5z",
  mese: "M6 5h12a2.5 2.5 0 0 1 2.5 2.5V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V7.5A2.5 2.5 0 0 1 6 5zM3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2",
  carattere: "M12 21v-7.5M12 13.5c0-4.2 3-7.5 8-7.5 0 4.2-3 7.5-8 7.5zM12 15.5c0-3.2-2.6-5.8-7-5.8 0 3.2 2.6 5.8 7 5.8z",
  suoniSi: "M4 9.5h3.5L12 6v12l-4.5-3.5H4zM15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8",
  suoniNo: "M4 9.5h3.5L12 6v12l-4.5-3.5H4zM16 9.5l5 5M21 9.5l-5 5",
  schermo: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  schermoEsci: "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5",
  foresta: "M6 20v-3.5M6 16.5 2.8 12h2L3.2 9.2h1.5L6 6l1.3 3.2h1.5L7.2 12h2zM17 20v-3M17 17l-3.6-5h2.2l-1.8-3h1.7L17 5l1.5 4h1.7l-1.8 3h2.2zM11.5 20v-2.2M9.6 17.8a1.9 2.6 0 1 0 3.8 0 1.9 2.6 0 0 0-3.8 0M2 20.5h20",
  esci: "M13.5 4H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4.5M10 8l-4 4 4 4M6 12h10",
};

function Icona({ nome }: { nome: keyof typeof TRATTI }) {
  return (
    <svg className="gi-svg" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={TRATTI[nome]} />
    </svg>
  );
}

/** Evento della demo: «Fai passare un giorno» inizia e finisce. */
export const EVENTO_TEMPO = "linfa-tempo";
export interface DettaglioTempo {
  fase: "inizio" | "fine";
  ok?: boolean;
}

const ORE: Ora[] = ["alba", "giorno", "tramonto", "notte"];
const POSE_TIMELAPSE = ["guardare-cielo", "passeggiata", "leggere", "sonnellino", "scrivere-poesia", "dormire"];

/** Un'attività della giornata, pronta per la scena (la prepara il server). */
export interface AttivitaInScena {
  id: string;
  etichetta: string;
  posa: Posa;
  /** Che cosa pensa quando gli viene voglia di farla. */
  voglia: string;
  /** La didascalia scritta dall'AI, se è l'azione del giorno. */
  didascalia: string | null;
}
export type PalinsestoScena = Record<Fascia, AttivitaInScena[]>;

/** Dopo una decisione del buongiorno ci pensa su per qualche minuto (ricordato nel browser). */
const CHIAVE_PENSIERO = "linfa-pensieroso";
const EVENTO_PENSIERO = "linfa-pensieroso";
const MINUTI_PENSIEROSO = 5;
/** Ogni quanto passa all'attività dopo, mentre lo guardi. */
const CAMBIO_ATTIVITA_MS = 210_000;

function iscriviPensiero(avvisa: () => void) {
  window.addEventListener(EVENTO_PENSIERO, avvisa);
  window.addEventListener("storage", avvisa);
  return () => {
    window.removeEventListener(EVENTO_PENSIERO, avvisa);
    window.removeEventListener("storage", avvisa);
  };
}
function leggiPensiero(): string | null {
  try {
    return localStorage.getItem(CHIAVE_PENSIERO);
  } catch {
    return null;
  }
}
/** Il tema della decisione, se ci sta ancora pensando. */
function temaDelPensiero(grezzo: string | null): { tema: string; fino: number } | null {
  if (!grezzo) return null;
  try {
    const x = JSON.parse(grezzo) as { fino: number; tema: string };
    return x.fino > Date.now() ? x : null;
  } catch {
    return null;
  }
}

const voce = (d: DettaglioVoce) => window.dispatchEvent(new CustomEvent<DettaglioVoce>(EVENTO_VOCE, { detail: d }));
function aCaso<T>(x: T[]): T {
  return x[Math.floor(Math.random() * x.length)];
}

const PENSIERI_UMORE: Record<string, string[]> = {
  curioso: ["e quello cos'è?", "chissà dove va la formica"],
  allegro: ["che bella giornata!", "la la la…"],
  pensieroso: ["mmh…", "e se fosse il contrario?"],
  assonnato: ["cinque minuti ancora…", "uaaah…"],
  furbo: ["ho un piano…", "eh eh eh"],
  fiero: ["sono proprio bravo", "guardate che rami!"],
  sognante: ["una nuvola a forma di me", "un giorno volerò"],
  energico: ["facciamo qualcosa!", "via, via, via!"],
  malinconico: ["mi manca l'estate", "una foglia… addio"],
};

export interface PropsImmersivo {
  nome: string;
  citta: string;
  orario: string;
  descrizioneMeteo: string;
  simbolo: string;
  giorno: number;
  stadioNome: string;
  strada: string | null;
  umore: string;
  /** La giornata a fasce, la fascia di adesso e quale attività si vede. */
  palinsesto: PalinsestoScena;
  fascia: Fascia;
  indice: number;
  meteo: Meteo;
  ora: Ora;
  stagione: Stagione;
  stadio: Stadio;
  chiave: string;
  nonLette: number;
  /** C'è una domanda del mattino senza risposta (pallino sul Buongiorno). */
  domandaAperta?: boolean;
  totaleLettere: number;
  righeDiario: number;
  pannelli: Record<IdPannello, ReactNode>;
  avviso?: ReactNode;
  strumenti: ReactNode;
  /** È appena stato piantato: lo dice appena arrivi. */
  appenaNato?: boolean;
  /** Si arriva dalla tua foresta 3D: la scena entra sfumando, come una discesa. */
  daForesta?: boolean;
  /** Il pannello già aperto all'arrivo (per esempio tornando da una lettera). */
  pannelloIniziale?: IdPannello;
}

/** Tutto schermo: disponibile solo dove il browser lo permette (non su iPhone). */
function iscriviSchermo(avvisa: () => void) {
  document.addEventListener("fullscreenchange", avvisa);
  return () => document.removeEventListener("fullscreenchange", avvisa);
}

function tipoSuono(meteo: Meteo, ora: Ora): TipoSuono {
  if (meteo.cielo === "pioggia" || meteo.cielo === "temporale") return "pioggia";
  return ora === "notte" ? "grilli" : "uccellini";
}

export function Immersivo(p: PropsImmersivo) {
  const radice = useRef<HTMLDivElement>(null);
  const suoni = useRef<Suoni | null>(null);
  const [aperto, setAperto] = useState<IdPannello | null>(p.pannelloIniziale ?? null);
  const [aiuto, setAiuto] = useState(false);
  const schermoIntero = useSyncExternalStore(iscriviSchermo, () => !!document.fullscreenElement, () => false);
  const puoSchermoIntero = useSyncExternalStore(iscriviSchermo, () => !!document.fullscreenEnabled, () => false);
  const [calma, setCalma] = useState(false);
  const hudNascosto = schermoIntero && calma;
  const [suoniAccesi, setSuoniAccesi] = useState(false);
  const [tempo, setTempo] = useState<{ ora: Ora; posa: string } | null>(null);
  // Strumenti della demo: umore, azione e fascia di prova, solo nella scena.
  const [prova, setProva] = useState<{ umore: string | null; azione: string | null; fascia: Fascia | null }>({
    umore: null,
    azione: null,
    fascia: null,
  });
  useEffect(() => {
    const ascolta = (e: Event) => {
      const d = (e as CustomEvent<DettaglioProva>).detail;
      setProva((x) => ({
        umore: d.umore !== undefined ? d.umore : x.umore,
        azione: d.azione !== undefined ? d.azione : x.azione,
        fascia: d.fascia !== undefined ? d.fascia : x.fascia,
      }));
    };
    window.addEventListener(EVENTO_PROVA, ascolta);
    return () => window.removeEventListener(EVENTO_PROVA, ascolta);
  }, []);

  // La giornata: l'attività di adesso e, ogni pochi minuti, la successiva della fascia.
  const fascia = prova.fascia ?? p.fascia;
  const attivita = p.palinsesto[fascia];
  const [passi, setPassi] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setPassi((n) => n + 1), CAMBIO_ATTIVITA_MS);
    return () => clearInterval(t);
  }, []);
  const att = attivita[(p.indice + passi) % attivita.length];
  const dopo = attivita[(p.indice + passi + 1) % attivita.length];

  // Dopo una decisione ci pensa su per qualche minuto.
  const grezzoPensiero = useSyncExternalStore(iscriviPensiero, leggiPensiero, () => null);
  const pensiero = temaDelPensiero(grezzoPensiero);
  const finePensiero = pensiero?.fino ?? 0;
  useEffect(() => {
    if (!finePensiero) return;
    // Allo scadere si torna alla giornata.
    const t = window.setTimeout(() => window.dispatchEvent(new Event(EVENTO_PENSIERO)), finePensiero - Date.now() + 50);
    return () => clearTimeout(t);
  }, [finePensiero]);

  // La decisione si vede: zoom su di lui mentre decidi, poi risponde in un fumetto.
  const [zoomRisposta, setZoomRisposta] = useState(false);
  useEffect(() => {
    const timer: number[] = [];
    const decisa = (e: Event) => {
      const { risposta } = (e as CustomEvent<DettaglioDecisione>).detail;
      const breve = risposta.length > 42 ? `${risposta.slice(0, 40)}…` : risposta;
      setAperto(null);
      setZoomRisposta(true);
      timer.push(window.setTimeout(() => voce({ tipo: "dice", testo: `«${breve}»… Ci penso su!`, durata: 4.2 }), 700));
      timer.push(window.setTimeout(() => setZoomRisposta(false), 5400));
      try {
        localStorage.setItem(CHIAVE_PENSIERO, JSON.stringify({ fino: Date.now() + MINUTI_PENSIEROSO * 60_000, tema: breve }));
      } catch {}
      window.dispatchEvent(new Event(EVENTO_PENSIERO));
    };
    window.addEventListener(EVENTO_DECISIONE, decisa);
    return () => {
      timer.forEach(clearTimeout);
      window.removeEventListener(EVENTO_DECISIONE, decisa);
    };
  }, []);
  const zoom = zoomRisposta || (aperto === "buongiorno" && !!p.domandaAperta);

  // All'arrivo dice la cosa importante; poi reagisce a quello che fa la persona.
  const arrivo = useRef({ nato: !!p.appenaNato, posta: p.nonLette > 0 });
  useEffect(() => {
    const { nato, posta } = arrivo.current;
    const t = window.setTimeout(() => {
      if (nato) voce({ tipo: "dice", testo: "Eccomi! Sono appena nato!", durata: 4 });
      else if (posta) voce({ tipo: "dice", testo: "Psst! C'è posta per te!", durata: 3.6 });
    }, 1600);
    const reagisci = (e: Event) => {
      const tipo = (e as CustomEvent<Reazione>).detail;
      if (tipo === "festa") voce({ tipo: "dice", testo: aCaso(["Evviva!", "Che bello!", "Grazie!"]), durata: 2.6 });
      else if (tipo === "saluta") voce({ tipo: "dice", testo: "Letto! Ora ti rispondo.", durata: 3 });
      else if (tipo === "lettera") voce({ tipo: "dice", testo: "C'è posta per te!", durata: 3 });
    };
    window.addEventListener(EVENTO_REAZIONE, reagisci);
    return () => {
      clearTimeout(t);
      window.removeEventListener(EVENTO_REAZIONE, reagisci);
    };
  }, []);

  // La nuvoletta del pensiero: ogni tanto gli passa per la testa che cosa farà dopo,
  // il suo umore o la decisione appena presa. Di notte sogna.
  const testa = useRef({ tema: pensiero?.tema ?? null, dopo: dopo.voglia, umore: prova.umore ?? p.umore, notte: fascia === "notte" });
  useLayoutEffect(() => {
    testa.current = { tema: pensiero?.tema ?? null, dopo: dopo.voglia, umore: prova.umore ?? p.umore, notte: fascia === "notte" };
  });
  useEffect(() => {
    let t = 0;
    const attesa = () => (testa.current.tema ? 15000 + Math.random() * 9000 : 35000 + Math.random() * 40000);
    const pensa = () => {
      const x = testa.current;
      const testo = x.notte
        ? aCaso(["zzz…", "zzz… ghiande…", "zzz… che sogno…"])
        : x.tema
          ? aCaso([`«${x.tema}»… mmh`, "ci sto pensando…", "e se…?", "sì, però…"])
          : Math.random() < 0.6
            ? x.dopo
            : aCaso(PENSIERI_UMORE[x.umore] ?? ["mmh…"]);
      voce({ tipo: "pensa", testo });
      t = window.setTimeout(pensa, attesa());
    };
    t = window.setTimeout(pensa, 9000);
    return () => clearTimeout(t);
  }, []);

  const apri = useCallback((id: IdPannello) => setAperto((a) => (a === id ? null : id)), []);
  const chiudi = useCallback(() => {
    setAperto(null);
    setAiuto(false);
  }, []);

  const tuttoSchermo = useCallback(() => {
    // Il browser può rifiutare (permessi, iframe): si resta nella finestra.
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else radice.current?.requestFullscreen?.().catch(() => {});
  }, []);

  // Il pannello aperto prende il focus; chiuso, il focus torna alla sua voce del dock.
  const pannelloEl = useRef<HTMLElement>(null);
  const ultimoAperto = useRef<IdPannello | null>(null);
  useEffect(() => {
    if (aperto) {
      pannelloEl.current?.focus({ preventScroll: true });
    } else if (ultimoAperto.current) {
      const fuori = document.activeElement === document.body || pannelloEl.current?.contains(document.activeElement);
      if (fuori) document.querySelector<HTMLElement>(`[data-voce="${ultimoAperto.current}"]`)?.focus({ preventScroll: true });
    }
    ultimoAperto.current = aperto;
  }, [aperto]);

  // A tutto schermo l'interfaccia si nasconde dopo 3 secondi di calma.
  useEffect(() => {
    if (!schermoIntero) return;
    let t = window.setTimeout(() => setCalma(true), 3000);
    const sveglia = () => {
      setCalma(false);
      clearTimeout(t);
      t = window.setTimeout(() => setCalma(true), 3000);
    };
    const eventi = ["pointermove", "pointerdown", "keydown", "touchstart"] as const;
    eventi.forEach((e) => window.addEventListener(e, sveglia, { passive: true }));
    return () => {
      clearTimeout(t);
      eventi.forEach((e) => window.removeEventListener(e, sveglia));
    };
  }, [schermoIntero]);

  // Scorciatoie da tastiera, mai mentre si scrive.
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "escape") return chiudi();
      if (k === "f") return tuttoSchermo();
      if (e.key === "?") return setAiuto((v) => !v);
      const pannello = PANNELLI.find((x) => x.tasto.toLowerCase() === k);
      if (pannello) apri(pannello.id);
    };
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
  }, [apri, chiudi, tuttoSchermo]);

  // Profondità: la scena segue il puntatore (e l'inclinazione del telefono, dove è permessa).
  useEffect(() => {
    const el = radice.current;
    if (!el) return;
    let pulisci = () => {};
    const avvia = () => {
      pulisci();
      if (movimentoRidotto()) {
        el.style.setProperty("--gx", "0");
        el.style.setProperty("--gy", "0");
        pulisci = () => {};
        return;
      }
      let raf = 0;
      let gx = 0;
      let gy = 0;
      const scrivi = () => {
        raf = 0;
        el.style.setProperty("--gx", gx.toFixed(3));
        el.style.setProperty("--gy", gy.toFixed(3));
      };
      const muovi = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        gx = (e.clientX / window.innerWidth) * 2 - 1;
        gy = (e.clientY / window.innerHeight) * 2 - 1;
        if (!raf) raf = requestAnimationFrame(scrivi);
      };
      const inclina = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return;
        gx = Math.max(-1, Math.min(1, e.gamma / 30));
        gy = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
        if (!raf) raf = requestAnimationFrame(scrivi);
      };
      window.addEventListener("pointermove", muovi, { passive: true });
      // Su iPhone serve un permesso esplicito: lì la profondità resta col solo puntatore.
      const serveP = typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === "function";
      if (!serveP) window.addEventListener("deviceorientation", inclina, { passive: true });
      pulisci = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", muovi);
        window.removeEventListener("deviceorientation", inclina);
      };
    };
    avvia();
    window.addEventListener(EVENTO_MOVIMENTO, avvia);
    return () => {
      pulisci();
      window.removeEventListener(EVENTO_MOVIMENTO, avvia);
    };
  }, []);

  // Il time-lapse: mentre passano i giorni il cielo gira e l'albero cambia azione.
  useEffect(() => {
    let giro = 0;
    let passo = 0;
    const evento = (e: Event) => {
      const d = (e as CustomEvent<DettaglioTempo>).detail;
      clearInterval(giro);
      if (d.fase === "inizio") {
        setAperto(null);
        if (movimentoRidotto()) {
          setTempo({ ora: p.ora, posa: "guardare-cielo" });
          return;
        }
        passo = 0;
        setTempo({ ora: ORE[0], posa: POSE_TIMELAPSE[0] });
        giro = window.setInterval(() => {
          passo += 1;
          setTempo({ ora: ORE[passo % ORE.length], posa: POSE_TIMELAPSE[passo % POSE_TIMELAPSE.length] });
        }, 1100);
      } else {
        setTempo(null);
        if (d.ok) window.setTimeout(() => setAperto("diario"), 700);
      }
    };
    window.addEventListener(EVENTO_TEMPO, evento);
    return () => {
      clearInterval(giro);
      window.removeEventListener(EVENTO_TEMPO, evento);
    };
  }, [p.ora]);

  // Suoni: si accendono solo con un clic, e seguono meteo e ora.
  const tipo = tipoSuono(p.meteo, tempo?.ora ?? p.ora);
  useEffect(() => {
    if (suoniAccesi) suoni.current?.avvia(tipo);
  }, [suoniAccesi, tipo]);
  useEffect(() => () => suoni.current?.chiudi(), []);
  const cambiaSuoni = () => {
    if (!suoni.current) suoni.current = new Suoni();
    if (suoniAccesi) suoni.current.ferma();
    else suoni.current.avvia(tipo);
    setSuoniAccesi(!suoniAccesi);
  };

  const ora = tempo?.ora ?? p.ora;
  // Che cosa fa adesso: il time-lapse, poi la prova della demo, poi il pensiero
  // dopo una decisione, poi la sua giornata. I vestiti (meteo, regali, strada) restano.
  const indossa = att.posa.indossa;
  const idInScena = tempo ? tempo.posa : (prova.azione ?? (pensiero ? "pensare" : att.id));
  const posa: Posa = tempo
    ? { ...azione(tempo.posa).posa }
    : idInScena === att.id
      ? att.posa
      : { ...azione(idInScena).posa, indossa: [...new Set([...azione(idInScena).posa.indossa, ...indossa])] };
  const didascalia = tempo
    ? `${p.nome} vive le sue giornate.`
    : prova.azione
      ? `${p.nome} ${azione(prova.azione).etichetta}.`
      : pensiero
        ? `${p.nome} ci pensa su: «${pensiero.tema}».`
        : (att.didascalia ?? `${NOMI_FASCE_FRASE[fascia]} ${p.nome} ${att.etichetta}.`);
  const pannello = PANNELLI.find((x) => x.id === aperto);

  // La camera si avvicina all'albero: da germoglio occupa già un terzo della scena,
  // da adulto circa metà. La crescita resta visibile (accanto alla cassetta).
  const scala = misureDellEta(p.stadio, p.giorno).scala;
  const camera = Math.max(1, 1.06 / Math.sqrt(scala));

  const scena2d = (
    <Ambiente
      meteo={p.meteo}
      ora={ora}
      stagione={p.stagione}
      className="h-full"
      chiaveAlbero={tempo ? `tempo-${tempo.posa}` : p.chiave}
      albero={<Albero posa={posa} giorni={p.giorno} stadio={p.stadio} stagione={p.stagione} innevato={p.meteo.cielo === "neve"} titolo={`${p.nome} ${azione(idInScena).etichetta}`} />}
      palco={
        <>
          <Cassetta daLeggere={p.nonLette} totale={p.totaleLettere} onApri={() => apri("lettere")} />
          <Taccuino righe={p.righeDiario} onApri={() => apri("diario")} />
        </>
      }
    />
  );

  return (
    <div
      ref={radice}
      className="gi"
      style={{ "--gi-zoom": camera.toFixed(3) } as CSSProperties}
      data-hud-nascosto={hudNascosto ? "1" : undefined}
      data-pannello={aperto ?? undefined}
      data-tempo={tempo ? "1" : undefined}
      data-zoom={zoom ? "1" : undefined}
      data-arrivo={p.daForesta ? "foresta" : undefined}
    >
      <div className="gi-scena">{scena2d}</div>

      {/* In alto: chi è, dove e quando */}
      <header className="gi-hud gi-hud-alto">
        <div className="gi-identita">
          <Link href="/" className="gi-logo" aria-label="Linfa, pagina iniziale">
            Linfa
          </Link>
          <p className="gi-occhiello">Il giardino di</p>
          <h1 className="gi-nome">{p.nome}</h1>
          <p className="gi-chip-riga">
            <span className="gi-chip">Giorno {p.giorno}</span>
            <span className="gi-chip">{p.stadioNome}</span>
            {p.strada && <span className="gi-chip">{p.strada}</span>}
            <span className="gi-chip">Umore: {p.umore}</span>
          </p>
        </div>
        <div className="gi-destra">
          <p className="gi-meteo">
            <span>{p.citta}</span>
            <b>{p.orario}</b>
            <span>
              <span aria-hidden>{p.simbolo}</span> {p.descrizioneMeteo}
            </span>
          </p>
          <div className="gi-comandi">
            <button type="button" className="gi-icona" onClick={cambiaSuoni} aria-pressed={suoniAccesi} title="Suoni d'ambiente">
              <Icona nome={suoniAccesi ? "suoniSi" : "suoniNo"} />
              <span className="sr-only">Suoni d&apos;ambiente {suoniAccesi ? "accesi" : "spenti"}</span>
            </button>
            {puoSchermoIntero && (
              <button type="button" className="gi-icona" onClick={tuttoSchermo} aria-pressed={schermoIntero} title="Tutto schermo (F)">
                <Icona nome={schermoIntero ? "schermoEsci" : "schermo"} />
                <span className="sr-only">{schermoIntero ? "Esci da tutto schermo" : "Tutto schermo"}</span>
              </button>
            )}
            <button type="button" className="gi-icona" onClick={() => setAiuto((v) => !v)} aria-pressed={aiuto} title="Scorciatoie (?)">
              <span aria-hidden>?</span>
              <span className="sr-only">Scorciatoie da tastiera</span>
            </button>
            <Link href="/foresta" className="gi-icona gi-con-testo" title="La tua foresta, vista dall'alto">
              <Icona nome="foresta" />
              <span className="gi-testo">Foresta</span>
            </Link>
            <form action="/auth/esci" method="post">
              <button className="gi-icona gi-con-testo" title="Esci">
                <Icona nome="esci" />
                <span className="gi-testo">Esci</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {p.avviso}

      {tempo && (
        <p className="gi-tempo" role="status">
          Stanno passando i giorni…
        </p>
      )}

      {/* In basso: che cosa sta facendo, e i pannelli */}
      <div className="gi-hud gi-hud-basso">
        <p className="gi-didascalia" aria-live="polite">
          {didascalia}
        </p>
        <nav className="gi-dock" aria-label="Pannelli del giardino">
          {PANNELLI.map((x) => (
            <button
              key={x.id}
              type="button"
              className="gi-dock-voce"
              data-voce={x.id}
              title={`${x.nome} (${x.tasto})`}
              aria-pressed={aperto === x.id}
              aria-controls="gi-pannello"
              onClick={() => apri(x.id)}
            >
              <span className="gi-dock-icona">
                <Icona nome={x.id} />
                {x.id === "lettere" && p.nonLette > 0 && <span className="gi-badge">{p.nonLette}</span>}
                {x.id === "buongiorno" && p.domandaAperta && (
                  <span className="gi-badge" aria-label="una domanda da rispondere">
                    1
                  </span>
                )}
              </span>
              <span className="gi-dock-nome">
                <span className="gi-nome-lungo">{x.nome}</span>
                <span className="gi-nome-breve" aria-hidden>
                  {x.breve}
                </span>
              </span>
              <kbd className="gi-tasto">{x.tasto}</kbd>
            </button>
          ))}
        </nav>
      </div>

      {/* Il pannello aperto, sopra la scena */}
      <section
        ref={pannelloEl}
        id="gi-pannello"
        className="gi-pannello"
        tabIndex={-1}
        aria-label={pannello?.nome ?? "Pannello"}
        aria-hidden={!aperto}
        inert={!aperto}
      >
        <div className="gi-pannello-testa">
          <h2 className="gi-pannello-titolo">{pannello?.nome}</h2>
          <button type="button" className="gi-icona" onClick={() => setAperto(null)} aria-label="Chiudi il pannello (Esc)">
            ✕
          </button>
        </div>
        <div className="gi-pannello-corpo">
          {PANNELLI.map((x) => (
            <div key={x.id} hidden={aperto !== x.id}>
              {p.pannelli[x.id]}
            </div>
          ))}
        </div>
      </section>

      {aiuto && (
        <div className="gi-aiuto" role="dialog" aria-label="Scorciatoie da tastiera">
          <p className="gi-pannello-titolo">Scorciatoie</p>
          <dl>
            <div>
              <dt>F</dt>
              <dd>Tutto schermo, dove il browser lo permette</dd>
            </div>
            {PANNELLI.map((x) => (
              <div key={x.id}>
                <dt>{x.tasto}</dt>
                <dd>{x.nome}</dd>
              </div>
            ))}
            <div>
              <dt>?</dt>
              <dd>Questo aiuto</dd>
            </div>
            <div>
              <dt>Esc</dt>
              <dd>Chiude pannelli e aiuto</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm opacity-70">A tutto schermo i comandi si nascondono dopo 3 secondi: muovi il mouse o tocca lo schermo per rivederli.</p>
          <InterruttoreMovimento className="mt-3" />
        </div>
      )}

      {p.strumenti}
    </div>
  );
}
