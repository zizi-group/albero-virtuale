"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { Posa, Stadio, Stagione } from "@/lib/albero/tipi";
import { ArrediDavanti, ArrediDietro, fotogrammaArredi } from "./arredi";
import { canaliDaPosa } from "./canali";
import { PALETTE } from "./disegni";
import { FiguraAlbero, primoFotogramma } from "./figura";
import type { Attributi } from "./fotogramma";
import { canaliDelMestiere, statoLavoro, type StatoMestiere } from "./mestiere";
import { Motore, N_PARTICELLE } from "./motore";
import "./vivo.css";

// L'albero vivo: un pupazzo snodato in SVG. Il server disegna la posa ferma
// (stessi numeri del primo fotogramma), poi nel browser parte il motore.
// Da mettere dentro un <svg> (Albero e Scena lo fanno già).

export interface AlberoVivoProps {
  posa: Posa;
  stadio?: Stadio;
  stagione?: Stagione;
  innevato?: boolean;
  /** Clic, trascinamento, occhi che ti seguono. Di serie è attivo. */
  interattivo?: boolean;
  /** Nome leggibile (per chi usa la tastiera o un lettore di schermo). */
  titolo?: string;
  /** Forza del vento sulla chioma, 0-1. */
  vento?: number;
  /** Fa freddo: gli si vede il fiato. */
  freddo?: boolean;
  /**
   * Ricorda nel browser dove l'hai lasciato (localStorage). "auto": solo se
   * l'albero sta in un paesaggio che lo lascia uscire dal suo riquadro.
   */
  ricorda?: boolean | "auto";
  /** Raggiungibile con la tastiera. No per gli alberi decorativi (titolo vuoto). */
  focusabile?: boolean;
  /** Chiamata a ogni scenetta finita (per far girare le scene della pagina iniziale). */
  onCiclo?: () => void;
  /** L'età in giorni: la grandezza segue la crescita continua (vedi crescitaDa). */
  giorni?: number;
  /** Il mestiere: arredi costruiti e cosa fa adesso (vivo/mestiere.ts). Senza, fa quello che dice la posa. */
  mestiere?: StatoMestiere | null;
}

/**
 * Per far parlare o pensare l'albero principale della pagina da fuori (il giardino):
 * `window.dispatchEvent(new CustomEvent(EVENTO_VOCE, { detail: { tipo: "pensa", testo: "…" } }))`.
 */
export const EVENTO_VOCE = "linfa-voce";
export interface DettaglioVoce {
  tipo: "dice" | "pensa";
  testo: string;
  /** Secondi. */
  durata?: number;
}

const VENTO: Record<string, number> = { temporale: 1, pioggia: 0.6, neve: 0.45, nuvole: 0.35, sole: 0.25, nebbia: 0.15 };

interface Opzioni {
  posa: Posa;
  vento?: number;
  freddo?: boolean;
  foglia: string;
  onCiclo?: () => void;
  mestiere?: StatoMestiere | null;
}

/** Vento e freddo: dalle props se ci sono, altrimenti dal cielo del paesaggio o dagli accessori. */
function conCielo(o: Opzioni, cielo: string | undefined) {
  return {
    vento: o.vento ?? VENTO[cielo ?? ""] ?? 0.3,
    freddo: o.freddo ?? (cielo === "neve" || (o.posa.indossa.includes("sciarpa") && o.posa.indossa.includes("cappello"))),
    foglia: o.foglia,
    onCiclo: o.onCiclo,
  };
}

export function AlberoVivo({
  posa,
  stadio = "albero",
  stagione = "estate",
  innevato = false,
  interattivo = true,
  titolo,
  vento,
  freddo,
  ricorda = false,
  focusabile = true,
  onCiclo,
  giorni,
  mestiere = null,
}: AlberoVivoProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const radice = useRef<SVGGElement>(null);
  const motore = useRef<Motore | null>(null);
  /** Il cielo del paesaggio intorno (attributo data-cielo), se c'è: vento e freddo. */
  const cielo = useRef<string | undefined>(undefined);
  const [fumetto, setFumetto] = useState<string | null>(null);
  // Il primo fotogramma, calcolato una volta sola: il server lo disegna così com'è.
  const [iniziale] = useState(() => primoFotogramma(posa));

  const medio = PALETTE[stagione][1];
  const chiavePosa = JSON.stringify(posa);
  const chiaveMestiere = JSON.stringify(mestiere);
  const opzioni = useRef<Opzioni>({ posa, vento, freddo, foglia: medio, onCiclo, mestiere });

  useLayoutEffect(() => {
    opzioni.current = { posa, vento, freddo, foglia: medio, onCiclo, mestiere };
    motore.current?.aggiornaOpzioni(conCielo(opzioni.current, cielo.current));
  });

  useLayoutEffect(() => {
    const r = radice.current;
    if (!r) return;
    const svg = r.ownerSVGElement;
    cielo.current = (svg?.closest("[data-cielo]") as HTMLElement | null)?.dataset.cielo;
    const fuori = svg ? getComputedStyle(svg).overflow === "visible" : false;
    const tieni = ricorda === true || (ricorda === "auto" && fuori);
    const m = new Motore({
      radice: r,
      posa: opzioni.current.posa,
      interattivo,
      chiave: tieni ? `linfa:albero:${window.location.pathname}:${id}` : null,
      onFumetto: setFumetto,
      mestiere: opzioni.current.mestiere,
      ...conCielo(opzioni.current, cielo.current),
    });
    motore.current = m;
    return () => {
      m.distruggi();
      motore.current = null;
    };
  }, [interattivo, ricorda, id]);

  useLayoutEffect(() => {
    const m = motore.current;
    if (!m) return;
    m.aggiornaNodi();
    m.impostaPosa(opzioni.current.posa);
  }, [chiavePosa, stadio, stagione, innevato]);

  useLayoutEffect(() => {
    const m = motore.current;
    if (!m) return;
    m.aggiornaNodi();
    m.impostaMestiere(opzioni.current.mestiere ?? null);
  }, [chiaveMestiere]);

  useLayoutEffect(() => {
    if (fumetto) motore.current?.misuraFumetto();
  }, [fumetto]);

  // Solo l'albero principale (interattivo e raggiungibile) ascolta le voci del giardino.
  useEffect(() => {
    if (!interattivo || !focusabile) return;
    const ascolta = (e: Event) => {
      const d = (e as CustomEvent<DettaglioVoce>).detail;
      const m = motore.current;
      if (!m || !d?.testo) return;
      // Un pensiero non interrompe le parole.
      if (d.tipo === "pensa" && m.parla) return;
      m.fumetto(d.testo, d.durata ?? (d.tipo === "pensa" ? 3.6 : 3.4), d.tipo === "pensa");
    };
    window.addEventListener(EVENTO_VOCE, ascolta);
    return () => window.removeEventListener(EVENTO_VOCE, ascolta);
  }, [interattivo, focusabile]);

  // Arredi del mestiere: il loro primo fotogramma (poi li muove il motore).
  const lavoro = mestiere ? statoLavoro(mestiere) : null;
  const arredi: Attributi = {};
  if (lavoro) fotogrammaArredi({ ...canaliDaPosa(posa), ...canaliDelMestiere(mestiere) }, lavoro, arredi, 0);

  return (
    <FiguraAlbero
      posa={posa}
      stadio={stadio}
      stagione={stagione}
      innevato={innevato}
      A={iniziale.A}
      presenti={iniziale.presenti}
      id={id}
      interattivo={interattivo}
      focusabile={focusabile}
      nome={titolo || "Un albero di Linfa"}
      fumetto={fumetto}
      radice={radice}
      nParticelle={N_PARTICELLE}
      giorni={giorni}
      dietro={lavoro ? <ArrediDietro lavoro={lavoro} A={arredi} /> : null}
      davanti={lavoro ? <ArrediDavanti lavoro={lavoro} A={arredi} /> : null}
    />
  );
}
