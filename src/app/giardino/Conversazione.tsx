"use client";

import { useActionState, useEffect, useRef } from "react";
import { segnalaReazione } from "@/components/giardino3d/reazioni";
import { inviaMessaggio, type Esito } from "./actions";

export interface Messaggio {
  id: string;
  autore: "persona" | "albero";
  testo: string;
}

/** La conversazione come biglietti: quelli dell'albero scritti a mano, i tuoi su carta a righe. */
export function Conversazione({ nome, messaggi }: { nome: string; messaggi: Messaggio[] }) {
  const [esito, azione, inCorso] = useActionState<Esito, FormData>(inviaMessaggio, {});
  const modulo = useRef<HTMLFormElement>(null);
  const scatola = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (esito.ok) {
      modulo.current?.reset();
      segnalaReazione("saluta");
    }
  }, [esito]);
  useEffect(() => {
    // Scorre solo la scatola dei biglietti, non la pagina.
    const el = scatola.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messaggi.length, inCorso]);

  return (
    <div className="biglietti-tavolo">
      <div ref={scatola} className="biglietti" role="log" aria-label={`Biglietti con ${nome}`}>
        {messaggi.length === 0 && !inCorso && (
          <p className="biglietto biglietto-vuoto">
            Scrivigli qualcosa: un consiglio, una domanda, una notizia. Leggerà tutto, ma poi deciderà da solo.
          </p>
        )}
        {messaggi.map((m, i) =>
          m.autore === "albero" ? (
            <div key={m.id} className="biglietto biglietto-albero" style={{ rotate: `${i % 2 ? 0.9 : -1.1}deg` }}>
              <p className="occhiello mb-0.5 text-[0.62rem] text-corteccia">{nome}</p>
              <p className="font-mano text-[1.25rem] leading-snug">{m.testo}</p>
            </div>
          ) : (
            <div key={m.id} className="biglietto biglietto-persona" style={{ rotate: `${i % 2 ? -0.6 : 0.7}deg` }}>
              <p className="occhiello mb-0.5 text-[0.62rem]">Tu</p>
              <p className="leading-snug">{m.testo}</p>
            </div>
          ),
        )}
        {inCorso && (
          <p className="biglietto biglietto-albero biglietto-attesa" aria-live="polite">
            <span className="font-mano text-[1.2rem]">{nome} legge, ci pensa su</span>
            <span className="puntini" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </p>
        )}
      </div>

      <form ref={modulo} action={azione} className="biglietto-nuovo">
        <label className="etichetta-mano block" htmlFor="testo">
          Scrivi a {nome}
        </label>
        <div className="mt-1 flex flex-wrap items-end gap-2">
          <input
            id="testo"
            name="testo"
            required
            maxLength={1000}
            autoComplete="off"
            className="campo-righe min-w-0 flex-1 basis-48"
            placeholder="Un consiglio, una domanda…"
            disabled={inCorso}
          />
          <button className="timbro timbro-piccolo grow sm:grow-0" disabled={inCorso}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path d="M3 11.5 L21 3 L14 21 L11 13 Z" fill="currentColor" opacity=".25" />
              <path d="M3 11.5 L21 3 L14 21 L11 13 Z M11 13 L21 3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
            </svg>
            Spedisci
          </button>
        </div>
      </form>
      {esito.ok === false && esito.messaggio && (
        <p className="mt-2 text-rosso" role="alert">
          {esito.messaggio}
        </p>
      )}
    </div>
  );
}
