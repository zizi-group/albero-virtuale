"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ID_PACCHETTI_CONTO, NOMI_PACCHETTO_CONTO, type PacchettoConto } from "@/lib/stanze";
import type { Esito } from "./actions";
import { demoStanze } from "./azioniStanze";

/** Strumenti della demo per la fase 5: pacchetto nuovo, un altro albero, un rinnovo. */
export function StrumentiStanze({
  pacchetto,
  alberi,
  massimo,
  stanze,
  rinnovi,
  piantati,
}: {
  pacchetto: PacchettoConto;
  alberi: number;
  massimo: number;
  stanze: number;
  rinnovi: number;
  piantati: number;
}) {
  const [esito, azione, inCorso] = useActionState<Esito, FormData>(demoStanze, {});
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-sm text-matita" id="conto-prova">
        Alberi e stanze · {alberi} {alberi === 1 ? "albero" : "alberi"} su {massimo}, {stanze} {stanze === 1 ? "stanza" : "stanze"}, piantati
        in tutto {piantati}, rinnovi {rinnovi}
      </p>
      <form action={azione} className="gettoni" role="group" aria-labelledby="conto-prova">
        <input type="hidden" name="cosa" value="pacchetto" />
        {ID_PACCHETTI_CONTO.map((id) => (
          <button key={id} name="pacchetto" value={id} aria-pressed={pacchetto === id} disabled={inCorso} className="gettone min-h-9 px-3 text-[0.9rem]">
            {NOMI_PACCHETTO_CONTO[id]}
          </button>
        ))}
      </form>
      <div className="mt-2 flex flex-wrap gap-2">
        {alberi < massimo ? (
          <Link href="/pianta?altro=1" className="timbro timbro-piccolo">
            Pianta un altro albero
          </Link>
        ) : (
          <span className="timbro timbro-carta timbro-piccolo opacity-60" aria-disabled>
            Pacchetto pieno
          </span>
        )}
        <form action={azione}>
          <button name="cosa" value="rinnovo" className="timbro timbro-carta timbro-piccolo" disabled={inCorso}>
            Simula un rinnovo
          </button>
        </form>
      </div>
      <p className="mt-1.5 text-sm leading-snug text-matita">
        Albero 1 albero, Famiglia 3, Foresta 7; ogni rinnovo aggiunge una stanza e un seme per albero. Una stanza in più ogni 5 alberi
        piantati, fino a 10.
      </p>
      <p className="mt-1 min-h-5 text-[0.95rem] leading-snug" aria-live="polite">
        {inCorso ? <span className="font-mano text-lg">Un momento…</span> : esito.messaggio && <span className={esito.ok ? "text-muschio" : "text-rosso"}>{esito.messaggio}</span>}
      </p>
    </div>
  );
}
