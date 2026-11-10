"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { ID_PACCHETTI, NOMI_PACCHETTO } from "@/lib/piani";
import { azioneDemo, type Esito } from "./actions";

const METEO_DI_PROVA = [
  { id: "", nome: "Vero", simbolo: "◎" },
  { id: "sole", nome: "Sole", simbolo: "☀" },
  { id: "pioggia", nome: "Pioggia", simbolo: "☂" },
  { id: "freddo", nome: "Freddo", simbolo: "❄" },
  { id: "neve", nome: "Neve", simbolo: "❅" },
  { id: "notte", nome: "Notte", simbolo: "☾" },
];

/** Gli strumenti della demo, in un cassetto discreto in basso a destra. */
export function Strumenti({ nome, meteoScelto, piano }: { nome: string; meteoScelto?: string; piano: string }) {
  const [esito, azione, inCorso] = useActionState<Esito, FormData>(azioneDemo, {});
  const [cosa, setCosa] = useState<"giorni" | "lettera" | "mese" | "pacchetto">("giorni");
  const [aperto, setAperto] = useState(false);
  const maniglia = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aperto) return;
    const chiudi = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAperto(false);
        maniglia.current?.focus();
      }
    };
    window.addEventListener("keydown", chiudi);
    return () => window.removeEventListener("keydown", chiudi);
  }, [aperto]);

  return (
    <div className="cassetto" data-aperto={aperto ? "1" : undefined}>
      <section id="cassetto-demo" className="cassetto-pannello pagina" aria-labelledby="titolo-cassetto" inert={!aperto}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p id="titolo-cassetto" className="occhiello text-corteccia">
              Strumenti della demo
            </p>
            <p className="mt-0.5 text-sm leading-snug text-matita">Nel prodotto vero passa un giorno ogni notte. Qui lo decidi tu.</p>
          </div>
          <button type="button" className="cassetto-chiudi" onClick={() => setAperto(false)} aria-label="Chiudi gli strumenti">
            ×
          </button>
        </div>
        <form action={azione} className="mt-3 flex flex-wrap gap-2">
          <button name="giorni" value="1" className="timbro timbro-piccolo" disabled={inCorso} onClick={() => setCosa("giorni")}>
            Fai passare un giorno
          </button>
          <button name="giorni" value="7" className="timbro timbro-piccolo" disabled={inCorso} onClick={() => setCosa("giorni")}>
            Una settimana
          </button>
          <button name="cosa" value="lettera" className="timbro timbro-carta timbro-piccolo" disabled={inCorso} onClick={() => setCosa("lettera")}>
            Lettera del mese
          </button>
          <button name="cosa" value="mese" className="timbro timbro-carta timbro-piccolo" disabled={inCorso} onClick={() => setCosa("mese")}>
            Inizio mese
          </button>
        </form>
        <p className="mt-1.5 text-sm leading-snug text-matita">
          «Inizio mese» chiude il mese dell&apos;albero: arrivano il riepilogo, la cartolina e un regalo nuovo da fare.
        </p>
        <p className="mt-3 min-h-6 text-[0.95rem] leading-snug" aria-live="polite">
          {inCorso ? (
            <span className="font-mano text-lg">
              {
                {
                  lettera: `${nome} sta scrivendo, con calma…`,
                  giorni: `${nome} sta vivendo le sue giornate…`,
                  mese: `${nome} sfoglia il diario del mese…`,
                  pacchetto: "Cambio il pacchetto…",
                }[cosa]
              }
            </span>
          ) : (
            esito.messaggio && (
              <span className={esito.ok ? "text-muschio" : "text-rosso"}>
                {esito.messaggio}
                {esito.link && (
                  <>
                    {" "}
                    <Link href={esito.link.href} className="font-semibold underline decoration-linfa decoration-2 underline-offset-4">
                      {esito.link.testo}
                    </Link>
                  </>
                )}
              </span>
            )
          )}
        </p>
        <p className="mt-3 mb-1.5 text-sm text-matita" id="pacchetto-prova">
          Il pacchetto · demo, nessun pagamento
        </p>
        <form action={azione} className="gettoni" role="group" aria-labelledby="pacchetto-prova">
          <input type="hidden" name="cosa" value="pacchetto" />
          {ID_PACCHETTI.map((id) => (
            <button
              key={id}
              name="piano"
              value={id}
              aria-pressed={piano === id}
              disabled={inCorso}
              onClick={() => setCosa("pacchetto")}
              className="gettone min-h-9 px-3 text-[0.9rem]"
            >
              {NOMI_PACCHETTO[id]}
            </button>
          ))}
        </form>
        <p className="mt-3 mb-1.5 text-sm text-matita" id="meteo-prova">
          Il meteo della scena
        </p>
        <div className="gettoni" role="group" aria-labelledby="meteo-prova">
          {METEO_DI_PROVA.map((m) => {
            const attivo = (meteoScelto ?? "") === m.id;
            return (
              <Link
                key={m.id || "vero"}
                href={m.id ? `/giardino?meteo=${m.id}` : "/giardino"}
                scroll={false}
                aria-current={attivo ? "true" : undefined}
                className="gettone min-h-9 px-3 text-[0.9rem]"
              >
                <span aria-hidden>{m.simbolo}</span> {m.nome}
              </Link>
            );
          })}
        </div>
      </section>

      <button
        ref={maniglia}
        type="button"
        className="cassetto-maniglia"
        aria-expanded={aperto}
        aria-controls="cassetto-demo"
        onClick={() => setAperto((v) => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className={inCorso ? "clessidra-gira" : undefined}>
          <path d="M6 3 h12 M6 21 h12 M7 3 c0 6 10 6 10 9 c0 3 -10 3 -10 9 M17 3 c0 6 -10 6 -10 9 c0 3 10 3 10 9" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M9.5 19 h5 l-2.5 -3 Z" fill="currentColor" />
        </svg>
        <span>
          <span className="max-sm:hidden">Strumenti della </span>demo
        </span>
      </button>
    </div>
  );
}
