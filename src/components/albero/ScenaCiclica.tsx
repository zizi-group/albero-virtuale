"use client";

import { useEffect, useState } from "react";
import { FRASI_ROUTINE, risolviScena } from "@/lib/albero/scena";
import { meteoDiProva } from "@/lib/meteo";
import { Scena } from "./Scena";

const GIRO = ["pioggia", "sole", "freddo", "notte"] as const;
/** Se l'albero è impegnato con qualcuno (clic, trascinamento) il giro aspetta; questo è il massimo. */
const MASSIMO = 20000;

/** La scena della pagina iniziale: pioggia, sole, freddo, notte, a turno. Cambia quando l'albero finisce la sua scenetta. */
export function ScenaCiclica({ nome = "Ottavio", citta = "Pescara" }: { nome?: string; citta?: string }) {
  const [i, setI] = useState(0);
  const avanti = () => setI((v) => (v + 1) % GIRO.length);
  useEffect(() => {
    const t = setTimeout(() => setI((v) => (v + 1) % GIRO.length), MASSIMO);
    return () => clearTimeout(t);
  }, [i]);

  const meteo = meteoDiProva(GIRO[i])!;
  const scena = risolviScena(meteo, "guardare-cielo", null);
  const frase = FRASI_ROUTINE[scena.routine!].replace(/^([^:]+):/, `$1 a ${citta}:`);

  return (
    <figure>
      <div className="overflow-hidden rounded-[1.8rem] border-[7px] border-carta-chiara shadow-[0_40px_70px_-40px_rgba(35,38,29,.7)] ring-1 ring-carta-scura">
        <Scena meteo={meteo} posa={scena.posa} stadio="alberello" stagione="autunno" className="block aspect-[3/2] w-full" etichetta={`${nome}. ${frase}`} onCiclo={avanti} />
      </div>
      <figcaption className="font-mano mt-4 min-h-[4.5rem] text-center text-2xl leading-snug" aria-live="polite">
        <span className="text-corteccia">{nome}.</span> {frase}
      </figcaption>
      <div className="mt-2 flex justify-center gap-2" aria-hidden>
        {GIRO.map((g, k) => (
          <button
            key={g}
            onClick={() => setI(k)}
            className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-muschio" : "w-2 bg-carta-scura"}`}
            tabIndex={-1}
          />
        ))}
      </div>
    </figure>
  );
}
