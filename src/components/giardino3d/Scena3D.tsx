"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Ora } from "@/components/ambiente/atmosfera";
import { EVENTO_MOVIMENTO, movimentoRidotto } from "@/components/Movimento";
import type { Meteo, Stagione } from "@/lib/albero/tipi";
import { EVENTO_REAZIONE } from "./reazioni";
import type { IstanzaGiardino, MotoreGiardino, OpzioniGiardino, Reazione } from "./tipi";

// Il giardino in 3D: una tela WebGL con il motore di src/lib/giardino3d.
// Il motore si carica solo nel browser e solo qui (è pesante: three.js).
// Se WebGL manca o il motore si ferma, resta la scena 2D passata in `ripiego`.

export interface PropsScena3D {
  idAlbero: string;
  nome: string;
  giorni: number;
  strada: string | null;
  azione: string;
  umore: string;
  meteo: Meteo;
  ora: Ora;
  stagione: Stagione;
  /** Cambia quando bisogna far reagire l'albero (per esempio una lettera nuova). */
  reazione?: { tipo: Reazione; n: number } | null;
  /** Quanti alberi in tutto (1, 3 o 7): gli altri sono compagni della demo. */
  quanti?: number;
  /** Parti dello schermo coperte dai riquadri (telefono in verticale). */
  margini?: { sopra: number; sotto: number } | null;
  onCassetta?: () => void;
  onTaccuino?: () => void;
  /** La scena 2D di sempre: si usa se il 3D non parte. */
  ripiego: ReactNode;
}

const nessunCambio = () => () => {};

/** In questa visita il 3D si è già rivelato troppo lento: si parte dal 2D. */
export const CHIAVE_LENTO = "linfa-3d-lento";
function giaLento(): boolean {
  try {
    return sessionStorage.getItem(CHIAVE_LENTO) === "1";
  } catch {
    return false;
  }
}

// I compagni della demo (Famiglia, Foresta): semi fissi, strade e nomi diversi.
const COMPAGNI = [
  { nome: "Ulivetta", strada: "artista" },
  { nome: "Betta", strada: "sportivo" },
  { nome: "Rovere", strada: "filosofo" },
  { nome: "Pinolo", strada: "viaggiatore" },
  { nome: "Ciliegina", strada: "poeta" },
  { nome: "Don Ghianda", strada: "furfante" },
];

let webglPresente: boolean | null = null;
/** Si controlla una volta sola: creare una tela WebGL costa. */
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

export function Scena3D(p: PropsScena3D) {
  const tela = useRef<HTMLCanvasElement>(null);
  const istanza = useRef<IstanzaGiardino | null>(null);
  const webgl = useSyncExternalStore(nessunCambio, () => haWebGL() && !giaLento(), () => true);
  const [stato, setStato] = useState<"carica" | "pronto" | "ripiego">("carica");
  // Le ultime props, lette dal motore quando finisce di caricarsi.
  const ultime = useRef(p);
  useLayoutEffect(() => {
    ultime.current = p;
  });

  // Avvio e chiusura del motore
  useEffect(() => {
    if (!webgl) return;
    let vivo = true;
    let pulisci = () => {};
    import("@/lib/giardino3d")
      .then((m) => {
        const { creaGiardino } = m as unknown as MotoreGiardino;
        if (!vivo || !tela.current) return;
        const q = ultime.current;
        const opzioni: OpzioniGiardino = {
          alberi: [
            { id: q.idAlbero, seme: q.idAlbero, strada: q.strada ?? undefined, nome: q.nome, giorni: q.giorni, principale: true },
            ...COMPAGNI.slice(0, Math.max(0, (q.quanti ?? 1) - 1)).map((c, i) => ({
              id: `${q.idAlbero}-compagno-${i}`,
              seme: `${q.idAlbero}-compagno-${i}`,
              strada: c.strada,
              nome: c.nome,
              giorni: q.giorni,
            })),
          ],
          meteo: q.meteo,
          ora: q.ora,
          stagione: q.stagione,
          azione: q.azione,
          umore: q.umore,
          movimentoRidotto: movimentoRidotto(),
          ...(q.margini ? { margini: q.margini } : {}),
        };
        const g = creaGiardino(tela.current, opzioni);
        istanza.current = g;
        g.su("pronto", () => {
          if (!vivo) return;
          setStato("pronto");
          controllaFluidita();
        });
        g.su("tocca-cassetta", () => ultime.current.onCassetta?.());
        g.su("tocca-taccuino", () => ultime.current.onTaccuino?.());
        // Se la scheda grafica si perde (driver, troppe schede aperte), si torna al 2D.
        const persa = (e: Event) => {
          e.preventDefault();
          if (vivo) setStato("ripiego");
        };
        tela.current.addEventListener("webglcontextlost", persa);
        // Dispositivo troppo lento: dopo che la qualità adattiva si è assestata,
        // se resta sotto i ~20 fotogrammi al secondo il giardino passa al 2D.
        let raf = 0;
        let attesa = 0;
        const controllaFluidita = () => {
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
                console.warn(`Giardino 3D troppo lento qui (${Math.round(mediana)} ms per fotogramma): passo al 2D.`);
                try {
                  sessionStorage.setItem(CHIAVE_LENTO, "1");
                } catch {}
                setStato("ripiego");
              }
            };
            raf = requestAnimationFrame(passo);
          }, 4000);
        };
        const movimento = () => g.imposta({ movimentoRidotto: movimentoRidotto() });
        const reagisci = (e: Event) => g.reagisci((e as CustomEvent<Reazione>).detail);
        window.addEventListener(EVENTO_MOVIMENTO, movimento);
        window.addEventListener(EVENTO_REAZIONE, reagisci);
        const canvas = tela.current;
        pulisci = () => {
          cancelAnimationFrame(raf);
          clearTimeout(attesa);
          canvas.removeEventListener("webglcontextlost", persa);
          window.removeEventListener(EVENTO_MOVIMENTO, movimento);
          window.removeEventListener(EVENTO_REAZIONE, reagisci);
        };
      })
      .catch((e) => {
        console.error("Il giardino 3D non è partito:", e);
        if (vivo) setStato("ripiego");
      });
    return () => {
      vivo = false;
      pulisci();
      istanza.current?.distruggi();
      istanza.current = null;
    };
    // Con un numero diverso di alberi il giardino si ricrea da capo.
  }, [webgl, p.quanti]);

  // I cambi dal vivo: meteo, ora, stagione, azione, umore
  const { meteo, ora, stagione, azione, umore } = p;
  useEffect(() => {
    istanza.current?.imposta({ meteo, ora, stagione, azione, umore });
  }, [meteo, ora, stagione, azione, umore]);

  const margini = p.margini;
  useEffect(() => {
    if (margini) istanza.current?.imposta({ margini });
  }, [margini]);

  const reazione = p.reazione;
  useEffect(() => {
    if (reazione) istanza.current?.reagisci(reazione.tipo);
  }, [reazione]);

  if (!webgl || stato === "ripiego") return <>{p.ripiego}</>;

  return (
    <div className="g3d" data-stato={stato}>
      <canvas key={p.quanti ?? 1} ref={tela} className="g3d-tela" aria-label={`Il giardino di ${p.nome} in 3D: tocca l'albero per salutarlo, trascinalo per spostarlo.`} role="img" />
      {stato === "carica" && (
        <p className="g3d-carica" role="status">
          Il bosco si sta svegliando…
        </p>
      )}
    </div>
  );
}
