"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { FinestraPiano, PIANI, PREMIUM_MENSILE_ANNO, Prezzo, RISPARMIO_ANNUALE } from "./Pacchetti";

/** Il Premium, il piano da spingere: una bustina sola, annuale o mensile. */
export function BustinaPremium() {
  const [mensile, setMensile] = useState(false);
  const piano = PIANI[mensile ? "premium-mensile" : "premium-annuale"];

  return (
    <article className="bustina bustina-premium" aria-labelledby="piano-premium">
      <span className="bustina-nastro">Da regalare</span>
      <div className="bustina-carta" style={{ "--fondo": "#f7e3b0" } as CSSProperties}>
        <p className="occhiello flex justify-between text-[0.68rem]">
          <span>Semi di Linfa</span>
          <span>n. 2</span>
        </p>
        <h3 id="piano-premium" className="font-titolo mt-2 text-[1.75rem] leading-tight">
          Premium
        </h3>
        <div className="interruttore mt-3" role="radiogroup" aria-label="Come pagare il Premium">
          <button type="button" role="radio" aria-checked={!mensile} onClick={() => setMensile(false)}>
            Annuale
          </button>
          <button type="button" role="radio" aria-checked={mensile} onClick={() => setMensile(true)}>
            Mensile
          </button>
        </div>
        <FinestraPiano premium />
        <Prezzo piano={piano} />
        <p className="mt-2 min-h-[2.6em] text-[0.92rem] leading-snug text-muschio" aria-live="polite">
          {mensile
            ? `In un anno fanno ${PREMIUM_MENSILE_ANNO}: con l'annuale ne spendi ${PIANI["premium-annuale"].pubblico}.`
            : `Rispetto a dodici mesi di mensile risparmi ${RISPARMIO_ANNUALE}.`}
        </p>
        <ul className="mt-3 mb-6 flex-1">
          {piano.contenuto.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <Link href={`/pianta?pacchetto=${piano.id}`} className="timbro timbro-linfa">
          Regala o pianta un Premium
        </Link>
      </div>
    </article>
  );
}
