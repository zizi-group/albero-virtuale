"use client";

import { useState } from "react";
import { Albero } from "@/components/albero/Albero";
import { azione } from "@/lib/albero/azioni";
import type { Indumento, Posa, Stagione } from "@/lib/albero/tipi";
import { usePaginaLibro } from "./Viaggio";

// Il diario dell'anno, da sfogliare nella pagina iniziale: copertina, una
// pagina di primavera, la lettera più bella, l'ultima pagina che resta aperta.

interface Pagina {
  id: string;
  occhiello?: string;
  data?: string;
  testo?: string;
  stagione: Stagione;
  posa: Posa;
}

const posa = (id: string, p: Partial<Posa> = {}, indossa: Indumento[] = []): Posa => {
  const a = azione(id).posa;
  return { ...a, ...p, indossa: [...a.indossa, ...indossa] };
};

const PAGINE: Pagina[] = [
  { id: "copertina", stagione: "estate", posa: posa("guardare-cielo", { occhi: "felici", bocca: "grande" }) },
  {
    id: "primavera",
    occhiello: "Primavera",
    data: "Giorno 1 · 14 marzo",
    testo: "Sono spuntato con la nebbia. Non vedevo niente, però avevo delle radici: mi è sembrato un buon inizio.",
    stagione: "primavera",
    posa: posa("guardare-cielo", { occhi: "su" }),
  },
  {
    id: "lettera",
    occhiello: "La lettera più bella",
    data: "Giorno 284 · 22 dicembre",
    testo:
      "Cara Giulia, oggi ho visto la mia prima neve. Ho provato a prenderla con i rami e mi è caduta tutta in testa. Credo di essere diventato un albero di Natale per sbaglio.",
    stagione: "inverno",
    posa: posa("guardare-cielo", { occhi: "felici", bocca: "grande" }, ["cappello", "sciarpa"]),
  },
  {
    id: "ultima",
    occhiello: "L'ultima pagina",
    data: "Giorno 335",
    testo: "L'anno prossimo voglio aprire una filiale dell'ombra a pagamento. Mi servirà un socio. Ci stai?",
    stagione: "inverno",
    posa: posa("pensare"),
  },
];

export function SfogliaDiario() {
  // La pagina la sfoglia lo scroll del capitolo, oppure i bottoni.
  const { pagina: i, scegliPagina } = usePaginaLibro();
  // Il verso della pagina che gira: avanti o indietro rispetto alla precedente.
  const [prima, setPrima] = useState(i);
  const [verso, setVerso] = useState<"avanti" | "indietro">("avanti");
  if (prima !== i) {
    setVerso(i > prima ? "avanti" : "indietro");
    setPrima(i);
  }
  const p = PAGINE[i];
  const vai = (n: number) => scegliPagina(n);

  return (
    <div data-comandi className="comandi-capitolo comandi-libro">
      <p className="lp-etichetta" id="sfoglia-diario">
        Sfoglia il diario di Ottavio
      </p>
      <div className="libro mt-2">
        <div key={p.id} className={`libro-pagina libro-gira-${verso} ${p.id === "copertina" ? "libro-copertina" : "carta-righe"}`}>
          {p.id === "copertina" ? (
            <>
              <p className="libro-copertina-sopra">Il primo anno · Pescara</p>
              <div className="libro-ritratto">
                <Albero posa={p.posa} stadio="albero" stagione={p.stagione} className="h-full w-full" titolo="" />
              </div>
              <p className="libro-copertina-titolo">Il diario di Ottavio</p>
            </>
          ) : (
            <>
              <p className="occhiello text-[0.66rem] text-corteccia">{p.occhiello}</p>
              <div className="libro-illustrazione">
                <Albero posa={p.posa} stadio={p.id === "primavera" ? "piantina" : "albero"} stagione={p.stagione} className="h-full w-full" titolo="" />
              </div>
              <p className="libro-data font-mano">{p.data}</p>
              <p className="libro-testo font-mano">{p.testo}</p>
              {p.id === "ultima" && <p className="libro-continua font-mano">continua…</p>}
            </>
          )}
          <span className="libro-numero" aria-hidden>
            {i + 1}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button type="button" className="lp-btn lp-btn-chiaro lp-btn-piccolo" onClick={() => vai(i - 1)} disabled={i === 0} aria-label="Pagina precedente">
          <span aria-hidden>‹</span> Indietro
        </button>
        <p className="text-sm text-matita" aria-live="polite">
          Pagina {i + 1} di {PAGINE.length}
        </p>
        <button
          type="button"
          className="lp-btn lp-btn-primario lp-btn-piccolo"
          onClick={() => vai(i + 1)}
          disabled={i === PAGINE.length - 1}
          aria-label="Pagina successiva"
        >
          Avanti <span aria-hidden>›</span>
        </button>
      </div>
      <p className="mt-2 text-[0.92rem] leading-snug text-matita">
        Per sapere come va a finire, c&apos;è il secondo anno.
      </p>
    </div>
  );
}
