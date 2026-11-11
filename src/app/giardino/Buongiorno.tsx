"use client";

import { useActionState, useEffect } from "react";
import { segnalaReazione } from "@/components/giardino3d/reazioni";
import type { Esito } from "./actions";
import { rispondiAlBuongiorno } from "./azioniCalendario";
import "./calendario.css";

export interface DomandaDelMattino {
  /** Il giorno che la risposta consiglia: il prossimo da vivere. */
  giorno: number;
  domanda: string;
  risposte: string[];
  risposta: string | null;
}

/** Il pannello Buongiorno: la domanda del mattino, una risposta con un tocco. */
export function Buongiorno({ nome, domanda }: { nome: string; domanda: DomandaDelMattino | null }) {
  const [esito, azione, inCorso] = useActionState<Esito, FormData>(rispondiAlBuongiorno, {});
  useEffect(() => {
    if (esito.ok) segnalaReazione("festa");
  }, [esito]);

  if (!domanda) {
    return (
      <div className="cal-buongiorno">
        <p className="cal-occhiello">Il buongiorno</p>
        <p className="cal-vuoto">
          Ogni mattina {nome} ti fa una domanda sulla sua giornata. La prossima arriva dopo la notte.
        </p>
      </div>
    );
  }

  return (
    <div className="cal-buongiorno">
      <p className="cal-occhiello">Stamattina {nome} ti chiede</p>
      <p className="cal-domanda">{domanda.domanda}</p>
      {domanda.risposta ? (
        <p className="cal-risposta-data">
          Hai risposto <b>«{domanda.risposta}»</b>. Lo leggerà prima del giorno {domanda.giorno}; poi decide lui, e nel
          diario racconta se ti ha dato retta.
        </p>
      ) : (
        <form action={azione} className="cal-risposte">
          <input type="hidden" name="giorno" value={domanda.giorno} />
          {domanda.risposte.map((r) => (
            <button key={r} name="risposta" value={r} className="cal-risposta" disabled={inCorso}>
              {r}
            </button>
          ))}
        </form>
      )}
      {!domanda.risposta && (
        <p className="cal-nota">Un tocco basta. È un consiglio: {nome} decide sempre da solo.</p>
      )}
      {esito.messaggio && !esito.ok && (
        <p className="cal-errore" role="alert">
          {esito.messaggio}
        </p>
      )}
    </div>
  );
}
