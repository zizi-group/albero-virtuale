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
  onCassetta?: () => void;
  onTaccuino?: () => void;
  /** La scena 2D di sempre: si usa se il 3D non parte. */
  ripiego: ReactNode;
}

const nessunCambio = () => () => {};

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
  const webgl = useSyncExternalStore(nessunCambio, haWebGL, () => true);
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
    import("./provvisorio")
      .then((m) => {
        const { creaGiardino } = m as unknown as MotoreGiardino;
        if (!vivo || !tela.current) return;
        const q = ultime.current;
        const opzioni: OpzioniGiardino = {
          alberi: [{ id: q.idAlbero, seme: q.idAlbero, strada: q.strada ?? undefined, nome: q.nome, giorni: q.giorni, principale: true }],
          meteo: q.meteo,
          ora: q.ora,
          stagione: q.stagione,
          azione: q.azione,
          umore: q.umore,
          movimentoRidotto: movimentoRidotto(),
        };
        const g = creaGiardino(tela.current, opzioni);
        istanza.current = g;
        g.su("pronto", () => vivo && setStato("pronto"));
        g.su("tocca-cassetta", () => ultime.current.onCassetta?.());
        g.su("tocca-taccuino", () => ultime.current.onTaccuino?.());
        const movimento = () => g.imposta({ movimentoRidotto: movimentoRidotto() });
        const reagisci = (e: Event) => g.reagisci((e as CustomEvent<Reazione>).detail);
        window.addEventListener(EVENTO_MOVIMENTO, movimento);
        window.addEventListener(EVENTO_REAZIONE, reagisci);
        pulisci = () => {
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
  }, [webgl]);

  // I cambi dal vivo: meteo, ora, stagione, azione, umore
  const { meteo, ora, stagione, azione, umore } = p;
  useEffect(() => {
    istanza.current?.imposta({ meteo, ora, stagione, azione, umore });
  }, [meteo, ora, stagione, azione, umore]);

  const reazione = p.reazione;
  useEffect(() => {
    if (reazione) istanza.current?.reagisci(reazione.tipo);
  }, [reazione]);

  if (!webgl || stato === "ripiego") return <>{p.ripiego}</>;

  return (
    <div className="g3d" data-stato={stato}>
      <canvas ref={tela} className="g3d-tela" aria-label={`Il giardino di ${p.nome} in 3D: tocca l'albero per salutarlo, trascinalo per spostarlo.`} role="img" />
      {stato === "carica" && (
        <p className="g3d-carica" role="status">
          Il bosco si sta svegliando…
        </p>
      )}
    </div>
  );
}
