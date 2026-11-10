"use client";

import { useActionState, useState, type CSSProperties } from "react";
import { Albero } from "@/components/albero/Albero";
import { Ambiente } from "@/components/ambiente/Ambiente";
import { Cartello, Seme } from "@/components/ambiente/Oggetti";
import { NOTA_MENSILE, PIANI, type IdPiano } from "@/components/landing/Pacchetti";
import { azione } from "@/lib/albero/azioni";
import type { Meteo, Posa } from "@/lib/albero/tipi";
import { azioneSemina, type StatoSemina } from "./actions";

const VALORE_PIANO: Record<IdPiano, string> = { albero: "albero", "premium-annuale": "premium-annuale", "premium-mensile": "premium-mensile" };
const ORDINE: IdPiano[] = ["albero", "premium-annuale", "premium-mensile"];
const FONDI: Record<IdPiano, string> = { albero: "#e7eed6", "premium-annuale": "#f7e3b0", "premium-mensile": "#f4e7cb" };

const ALBA: Meteo = { cielo: "sole", temperatura: 12, giorno: true, descrizione: "sereno, 12°" };
const SALUTO: Posa = {
  ...azione("guardare-cielo").posa,
  occhi: "felici",
  bocca: "grande",
  dx: { forma: "dritto", angolo: 58, anim: "saluta" },
};

export function ModuloSemina({ pacchetto = "albero" }: { pacchetto?: IdPiano }) {
  const [stato, azione, inCorso] = useActionState<StatoSemina, FormData>(azioneSemina, {});
  const [nome, setNome] = useState("");
  const [citta, setCitta] = useState("");

  return (
    <div className="semina">
      <div className="semina-scena">
        <Ambiente
          meteo={ALBA}
          ora="alba"
          stagione="primavera"
          className="h-full"
          seme={!inCorso}
          chiaveAlbero={inCorso ? "germoglio" : "seme"}
          albero={<Albero posa={SALUTO} stadio="piantina" stagione="primavera" titolo={nome ? `${nome}, appena spuntato` : "Un germoglio"} />}
          palco={
            <>
              <Seme />
              <Cartello nome={nome.trim() || "…"} sotto={citta.trim() || undefined} />
            </>
          }
        />
      </div>

      <section className="semina-foglio pagina nastro" aria-labelledby="titolo-semina">
        <p className="occhiello">Semina</p>
        <h1 id="titolo-semina" className="font-titolo mt-2 text-[2rem] leading-[1.05] sm:text-[2.6rem]">
          Compri un albero. Non sai chi diventerà.
        </h1>
        <p className="mt-2 text-matita">Tutti partono da un seme uguale. Poi ognuno prende la sua strada.</p>

        <form action={azione} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="occhiello">Come si chiama?</span>
              <input
                name="nome"
                required
                maxLength={40}
                className="campo-carta mt-1.5"
                placeholder="Ottavio"
                autoFocus
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="occhiello">E tu come ti chiami?</span>
              <input name="persona" maxLength={40} className="campo-carta mt-1.5" placeholder="Giulia" />
            </label>
          </div>
          <label className="block">
            <span className="occhiello">In che città lo pianti?</span>
            <input
              name="citta"
              required
              className="campo-carta mt-1.5"
              placeholder="Pescara"
              value={citta}
              onChange={(e) => setCitta(e.target.value)}
            />
            <span className="mt-1.5 block text-sm text-matita">Vivrà con il meteo vero di questa città, ora per ora.</span>
          </label>

          <fieldset>
            <legend className="occhiello mb-2">Il piano</legend>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {ORDINE.map((id) => {
                const p = PIANI[id];
                return (
                  <label key={id} className="pacchetto-scelta" style={{ "--fondo": FONDI[id] } as CSSProperties}>
                    <input type="radio" name="piano" value={VALORE_PIANO[id]} defaultChecked={id === pacchetto} className="sr-only" />
                    <span className="block font-titolo text-[1.02rem] leading-tight">{p.nome}</span>
                    <span className="mt-1 block font-titolo text-[1.5rem] leading-none">{p.pubblico}</span>
                    <span className="mt-0.5 block text-[0.78rem] leading-snug text-matita">
                      {p.periodo}, IVA inclusa · {p.netto} + IVA
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-sm leading-snug text-matita">{NOTA_MENSILE}</p>
            <p className="mt-1 text-sm leading-snug text-matita">Demo: nessun pagamento, il piano serve solo a provare il percorso.</p>
          </fieldset>

          {stato.errore && (
            <p className="text-rosso" role="alert">
              {stato.errore}
            </p>
          )}
          <button className="timbro w-full text-lg" disabled={inCorso}>
            {inCorso ? "Lo stiamo piantando… e sta già scrivendo la prima lettera" : "Pianta il tuo albero"}
          </button>
        </form>
      </section>
    </div>
  );
}
