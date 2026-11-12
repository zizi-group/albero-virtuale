"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { EVENTO_MOVIMENTO, movimentoRidotto } from "@/components/Movimento";
import type { DatiForesta } from "@/lib/foresta/tipi";

// La tua foresta in 3D: il motore di src/lib/giardino3d in modo «panoramica».
// Si carica solo nel browser; se WebGL manca, la scheda grafica si perde o il
// dispositivo è lento, `onRipiego` fa passare la pagina alla mappa 2D.

export interface Margini {
  sopra: number;
  sotto: number;
  sinistra: number;
  destra: number;
}

interface IstanzaPanoramica {
  margini(m: Partial<Margini>): void;
  entra(idStanza: string, idAlbero?: string | null): void;
  su(evento: "pronto" | "tocca-stanza" | "tocca-bloccata" | "entrata", cb: (dati?: unknown) => void): () => void;
  distruggi(): void;
}
interface MotorePanoramica {
  creaPanoramica(canvas: HTMLCanvasElement, opzioni: Record<string, unknown>): IstanzaPanoramica;
}

export type Tocco = { stanza: string; albero: string | null };

/** Lo stesso segno del giardino 3D: in questa visita il 3D si è già rivelato lento. */
const CHIAVE_LENTO = "linfa-3d-lento";

let webglPresente: boolean | null = null;
function haWebGL(): boolean {
  if (webglPresente === null) {
    try {
      const c = document.createElement("canvas");
      webglPresente = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglPresente = false;
    }
  }
  return webglPresente;
}
function giaLento(): boolean {
  try {
    return sessionStorage.getItem(CHIAVE_LENTO) === "1";
  } catch {
    return false;
  }
}
const nessunCambio = () => () => {};

/** true se il 3D può partire (WebGL presente e non già scartato come lento). */
export function useTreD(): boolean {
  return useSyncExternalStore(nessunCambio, () => haWebGL() && !giaLento(), () => true);
}

export function Panoramica3D(p: {
  dati: DatiForesta;
  margini: Margini;
  /** Cambia quando bisogna scendere in una stanza. */
  vola: Tocco | null;
  onTocca: (t: Tocco) => void;
  onBloccata: (b: { numero: number; regola: string }) => void;
  onEntrata: (t: Tocco) => void;
  onRipiego: () => void;
}) {
  const tela = useRef<HTMLCanvasElement>(null);
  const istanza = useRef<IstanzaPanoramica | null>(null);
  const [pronto, setPronto] = useState(false);
  // Cresce quando la vista va ricreata da capo (cambio del movimento ridotto).
  const [rinasci, setRinasci] = useState(0);
  const ultime = useRef(p);
  useLayoutEffect(() => {
    ultime.current = p;
  });

  useEffect(() => {
    let vivo = true;
    let pulisci = () => {};
    import("@/lib/giardino3d/panoramica")
      .then((m) => {
        const { creaPanoramica } = m as unknown as MotorePanoramica;
        const canvas = tela.current;
        if (!vivo || !canvas) return;
        const q = ultime.current;
        const g = creaPanoramica(canvas, {
          stanze: q.dati.stanze,
          bloccate: q.dati.bloccate,
          ora: q.dati.ora,
          stagione: q.dati.stagione,
          cielo: q.dati.cielo,
          movimentoRidotto: movimentoRidotto(),
          margini: q.margini,
        });
        istanza.current = g;
        // In sviluppo: `window.__foresta.misura()` dà i ms per fotogramma (come le prove del giardino 3D).
        if (process.env.NODE_ENV === "development") (window as unknown as { __foresta?: unknown }).__foresta = { ...(g as unknown as { _prove: object })._prove, istanza: g };
        g.su("tocca-stanza", (d) => ultime.current.onTocca(d as Tocco));
        g.su("tocca-bloccata", (d) => ultime.current.onBloccata(d as { numero: number; regola: string }));
        g.su("entrata", (d) => ultime.current.onEntrata(d as Tocco));
        let raf = 0;
        let attesa = 0;
        g.su("pronto", () => {
          if (!vivo) return;
          setPronto(true);
          // Come nel giardino 3D: dopo l'assestamento, se resta sotto i ~20 fps si passa alla mappa.
          attesa = window.setTimeout(() => {
            const tempi: number[] = [];
            let prima = performance.now();
            const passo = (ora: number) => {
              if (!vivo) return;
              if (!document.hidden) tempi.push(ora - prima);
              prima = ora;
              if (tempi.length < 90) {
                raf = requestAnimationFrame(passo);
                return;
              }
              const ordinati = [...tempi].sort((a, b) => a - b);
              const mediana = ordinati[Math.floor(ordinati.length / 2)];
              if (mediana > 50) {
                console.warn(`Foresta 3D troppo lenta qui (${Math.round(mediana)} ms per fotogramma): passo alla mappa.`);
                try {
                  sessionStorage.setItem(CHIAVE_LENTO, "1");
                } catch {}
                ultime.current.onRipiego();
              }
            };
            raf = requestAnimationFrame(passo);
          }, 4000);
        });
        const persa = (e: Event) => {
          e.preventDefault();
          if (vivo) ultime.current.onRipiego();
        };
        canvas.addEventListener("webglcontextlost", persa);
        // Il movimento ridotto si decide alla nascita: se cambia, la vista si ricrea.
        const movimento = () => {
          pulisci();
          g.distruggi();
          istanza.current = null;
          if (vivo) setRinasci((n) => n + 1);
        };
        window.addEventListener(EVENTO_MOVIMENTO, movimento);
        pulisci = () => {
          cancelAnimationFrame(raf);
          clearTimeout(attesa);
          canvas.removeEventListener("webglcontextlost", persa);
          window.removeEventListener(EVENTO_MOVIMENTO, movimento);
        };
      })
      .catch((e) => {
        console.error("La foresta 3D non è partita:", e);
        if (vivo) ultime.current.onRipiego();
      });
    return () => {
      vivo = false;
      pulisci();
      istanza.current?.distruggi();
      istanza.current = null;
    };
  }, [rinasci]);

  const { sopra, sotto, sinistra, destra } = p.margini;
  useEffect(() => {
    istanza.current?.margini({ sopra, sotto, sinistra, destra });
  }, [sopra, sotto, sinistra, destra]);

  const vola = p.vola;
  useEffect(() => {
    if (vola) istanza.current?.entra(vola.stanza, vola.albero);
  }, [vola]);

  return (
    <div className="fo-tela" data-pronto={pronto || undefined}>
      <canvas
        key={rinasci}
        ref={tela}
        aria-label="La tua foresta vista dall'alto: tocca un albero o una radura per entrare nella sua stanza."
        role="img"
      />
      {!pronto && (
        <p className="fo-carica" role="status">
          La foresta si sta svegliando…
        </p>
      )}
    </div>
  );
}
