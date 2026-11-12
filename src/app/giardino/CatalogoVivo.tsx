"use client";

import { useEffect, useRef } from "react";
import { catalogoVisto } from "./actions";
import { EVENTO_SPOSTA } from "./Stanza";

// I due pezzi interattivi del catalogo (Collezione.tsx resta sul server).

/**
 * Quando il catalogo si vede davvero (pannello aperto), dopo un attimo segna
 * le novità come guardate. L'etichetta «Nuovo» resta fino alla prossima visita.
 */
export function SegnaVisto({ quanti }: { quanti: number }) {
  const el = useRef<HTMLSpanElement>(null);
  const fatto = useRef(false);
  useEffect(() => {
    const nodo = el.current;
    if (!nodo || !quanti) return;
    let t = 0;
    const oss = new IntersectionObserver((voci) => {
      if (voci.some((v) => v.isIntersecting) && !fatto.current) {
        t = window.setTimeout(() => {
          fatto.current = true;
          void catalogoVisto();
        }, 1500);
      } else clearTimeout(t);
    });
    oss.observe(nodo);
    return () => {
      clearTimeout(t);
      oss.disconnect();
    };
  }, [quanti]);
  return <span ref={el} aria-hidden className="block h-px" />;
}

/** «Mettilo nella stanza»: apre il menu dei posti della stanza. */
export function Rimetti({ item, nome }: { item: string; nome: string }) {
  return (
    <button
      type="button"
      className="cat-rimetti"
      onClick={() => window.dispatchEvent(new CustomEvent<string>(EVENTO_SPOSTA, { detail: item }))}
      aria-label={`Metti ${nome} nella stanza`}
    >
      Mettilo nella stanza
    </button>
  );
}
