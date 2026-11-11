"use client";

import { useState } from "react";
import { azione } from "@/lib/albero/azioni";
import { attivitaAmmesse, carrieraAlGiorno, FASCE, livelloDa, MESTIERI, NOMI_FASCE, type Fascia } from "@/lib/albero/mestieri";
import type { Posa } from "@/lib/albero/tipi";
import type { StatoMestiere } from "./vivo/mestiere";
import { AlberoVivo } from "./vivo/AlberoVivo";

// La vetrina del pilota: l'imprenditore, giorno per giorno. Si sceglie a che
// punto della carriera è e l'ora del giorno, e lui fa quello che farebbe:
// lavora al cantiere del giorno oppure una delle attività ammesse.

const STRADA = "imprenditore" as const;
const ULTIMO_GIORNO = 22;
const POSA: Posa = { ...azione("guardare-cielo").posa, occhi: "aperti", indossa: ["cravatta"] };
const NOTTE: Posa = { ...azione("dormire").posa, indossa: ["berretto-notte", "cravatta"] };

export function VetrinaMestiere() {
  const [giorno, setGiorno] = useState(4);
  const [fascia, setFascia] = useState<Fascia>("giorno");
  const [scelta, setScelta] = useState<string | null>(null);

  const mestiere = MESTIERI[STRADA];
  const { arredi, cantiere } = carrieraAlGiorno(STRADA, giorno);
  const livello = livelloDa(STRADA, arredi);
  const ammesse = attivitaAmmesse(STRADA, arredi, fascia, false).filter((a) => a.animata);
  const datiCantiere = cantiere ? mestiere.cantieri.find((c) => c.id === cantiere.id) : null;
  // Il cantiere si fa di giorno; la sera e la notte si torna alle attività.
  const alCantiere = !!cantiere && (fascia === "giorno" || fascia === "pomeriggio") && scelta === null;
  const attivita = ammesse.find((a) => a.id === scelta) ?? ammesse[0] ?? null;

  const stato: StatoMestiere = {
    strada: STRADA,
    arredi,
    adesso: alCantiere && cantiere ? { cantiere: cantiere.id, passo: cantiere.passo } : attivita ? { attivita: attivita.id } : null,
  };
  const cosaFa = alCantiere && datiCantiere && cantiere ? datiCantiere.passi[cantiere.passo].etichetta : (attivita?.etichetta ?? "si gode la giornata");
  const notte = fascia === "notte";
  const sera = fascia === "sera";

  return (
    <div className="foglio overflow-hidden">
      <svg viewBox="-200 -70 620 360" className="block aspect-[31/18] w-full" role="group" aria-label={`L'imprenditore ${cosaFa}`}>
        <defs>
          <linearGradient id="vetrina-cielo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={notte ? "#0d1a30" : sera ? "#e9a46a" : "#86c8ea"} />
            <stop offset="1" stopColor={notte ? "#2c3d5c" : sera ? "#f6d7a4" : "#f7e6b5"} />
          </linearGradient>
        </defs>
        <rect x={-200} y={-70} width={620} height={360} fill="url(#vetrina-cielo)" />
        <path d="M-200,236 Q-40,214 120,232 T420,228 L420,290 L-200,290 Z" fill={notte ? "#4d5a3f" : "#9cbf62"} />
        <rect x={-200} y={262} width={620} height={28} fill={notte ? "#3f4a33" : "#7fa846"} />
        <AlberoVivo posa={notte && !stato.adesso ? NOTTE : POSA} stadio="albero" stagione="estate" titolo="L'imprenditore" mestiere={stato} vento={0.25} />
        {notte && <rect x={-200} y={-70} width={620} height={360} fill="#0b1630" opacity={0.25} pointerEvents="none" />}
      </svg>

      <div className="grid gap-4 p-5 sm:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="occhiello">Livello {livello} · {mestiere.livelli[livello - 1]}</p>
          <p className="font-mano mt-1 text-2xl leading-tight">L&apos;imprenditore {cosaFa}.</p>
          <label className="mt-4 block text-sm text-matita" htmlFor="vetrina-giorno">
            Giorno da quando ha preso la strada: <strong className="text-inchiostro">{giorno}</strong>
            {cantiere && datiCantiere ? ` · cantiere: ${datiCantiere.nome}, passo ${cantiere.passo + 1} di ${datiCantiere.passi.length}` : ""}
          </label>
          <input
            id="vetrina-giorno"
            type="range"
            min={0}
            max={ULTIMO_GIORNO}
            value={giorno}
            onChange={(e) => {
              setGiorno(Number(e.target.value));
              setScelta(null);
            }}
            className="mt-2 w-full accent-[var(--muschio)]"
          />
          <p className="mt-1 text-xs text-matita">Arredi nel prato: {["bancarella", ...arredi].join(", ")}.</p>
        </div>
        <div>
          <p className="text-sm text-matita">Ora del giorno</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {FASCE.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFascia(f);
                  setScelta(null);
                }}
                className={`rounded-full px-3 py-1 text-sm ${f === fascia ? "bg-muschio text-carta-chiara" : "bg-carta-scura/70"}`}
                aria-pressed={f === fascia}
              >
                {NOMI_FASCE[f]}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-matita">Cosa può fare adesso</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {cantiere && datiCantiere && (fascia === "giorno" || fascia === "pomeriggio") && (
              <button
                type="button"
                onClick={() => setScelta(null)}
                className={`rounded-full px-3 py-1 text-sm ${alCantiere ? "bg-corteccia text-carta-chiara" : "bg-carta-scura/70"}`}
                aria-pressed={alCantiere}
              >
                Cantiere: {datiCantiere.nome}
              </button>
            )}
            {ammesse.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setScelta(a.id)}
                className={`rounded-full px-3 py-1 text-sm ${!alCantiere && attivita?.id === a.id ? "bg-muschio text-carta-chiara" : "bg-carta-scura/70"}`}
                aria-pressed={!alCantiere && attivita?.id === a.id}
              >
                {a.etichetta}
              </button>
            ))}
            {!ammesse.length && !alCantiere && <span className="text-sm text-matita">Niente, a quest&apos;ora: si gode la giornata.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
