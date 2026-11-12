"use client";

import Link from "next/link";
import { useActionState, useState, type CSSProperties } from "react";
import { Albero } from "@/components/albero/Albero";
import { Ambiente } from "@/components/ambiente/Ambiente";
import { Cartello, Seme } from "@/components/ambiente/Oggetti";
import { ElencoCompatto, PIANI, type IdPiano } from "@/components/landing/Pacchetti";
import { azione } from "@/lib/albero/azioni";
import type { Meteo, Posa } from "@/lib/albero/tipi";
import { azioneSemina, type StatoSemina } from "./actions";

const VALORE_PIANO: Record<IdPiano, string> = { albero: "albero", "premium-annuale": "premium-annuale", "premium-mensile": "premium-mensile" };
const FONDI: Record<IdPiano, string> = { albero: "#f4f7ec", "premium-annuale": "#f7e3b0", "premium-mensile": "#f6efe0" };

/** Un piano da scegliere: prezzo al mese IVA esclusa, sotto quanto e quando si paga. */
function SceltaPiano({ id, scelto }: { id: IdPiano; scelto: IdPiano }) {
  const p = PIANI[id];
  return (
    <label className="pacchetto-scelta" style={{ "--fondo": FONDI[id] } as CSSProperties}>
      <input type="radio" name="piano" value={VALORE_PIANO[id]} defaultChecked={id === scelto} className="sr-only" />
      <span className="block font-titolo text-[1.02rem] leading-tight">{p.nome}</span>
      <span className="mt-1 flex items-baseline gap-1.5">
        <span className="font-titolo text-[1.5rem] leading-none">{p.alMese}</span>
        <span className="text-[0.8rem] text-matita">+ IVA al mese</span>
      </span>
      <span className="mt-1 block text-[0.84rem] leading-snug font-semibold text-inchiostro">{p.siPaga}</span>
    </label>
  );
}

const ALBA: Meteo = { cielo: "sole", temperatura: 12, giorno: true, descrizione: "sereno, 12°" };
const SALUTO: Posa = {
  ...azione("guardare-cielo").posa,
  occhi: "felici",
  bocca: "grande",
  dx: { forma: "dritto", angolo: 58, anim: "saluta" },
};

/** Chi ha già un albero e ne pianta un altro (fase 5): quanti ne ha, quanti ne tiene il pacchetto. */
export interface UnAltroAlbero {
  quanti: number;
  massimo: number;
  pacchetto: string;
  stanza?: string;
}

export function ModuloSemina({ pacchetto = "albero", unAltro }: { pacchetto?: IdPiano; unAltro?: UnAltroAlbero }) {
  const pieno = !!unAltro && unAltro.quanti >= unAltro.massimo;
  const [stato, azione, inCorso] = useActionState<StatoSemina, FormData>(azioneSemina, {});
  const [nome, setNome] = useState("");
  const [citta, setCitta] = useState("");
  const [scelto, setScelto] = useState<IdPiano>(pacchetto);

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
          albero={<Albero posa={SALUTO} stadio="piantina" giorni={0} stagione="primavera" titolo={nome ? `${nome}, appena spuntato` : "Un germoglio"} />}
          palco={
            <>
              <Seme />
              <Cartello nome={nome.trim() || "…"} sotto={citta.trim() || undefined} />
            </>
          }
        />
      </div>

      <section className="semina-foglio pagina nastro" aria-labelledby="titolo-semina">
        <p className="occhiello">{unAltro ? `Un altro albero · ne hai ${unAltro.quanti} su ${unAltro.massimo}` : "Semina"}</p>
        <h1 id="titolo-semina" className="font-titolo mt-2 text-[2rem] leading-[1.05] sm:text-[2.6rem]">
          {unAltro ? "Un seme nuovo, un carattere tutto suo." : "Compri un albero. Non sai chi diventerà."}
        </h1>
        <p className="mt-2 text-matita">
          {unAltro
            ? "Andrà a vivere in una stanza con posto, accanto agli altri. Ogni 5 alberi piantati si apre una stanza nuova."
            : "Tutti partono da un seme uguale. Poi ognuno prende la sua strada."}
        </p>

        {pieno && unAltro && (
          <div className="mt-6 space-y-4">
            <p>
              Il pacchetto {unAltro.pacchetto} tiene {unAltro.massimo === 1 ? "un albero solo" : `${unAltro.massimo} alberi`} e li hai già
              piantati tutti. Nella demo puoi cambiare pacchetto o simulare un rinnovo dagli strumenti del giardino.
            </p>
            <Link href="/giardino" className="timbro inline-block">
              Torna al giardino
            </Link>
          </div>
        )}
        <form action={azione} className="mt-6 space-y-5" hidden={pieno}>
          {unAltro && <input type="hidden" name="altro" value="1" />}
          {unAltro?.stanza && <input type="hidden" name="stanza" value={unAltro.stanza} />}
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

          <fieldset
            hidden={!!unAltro}
            disabled={!!unAltro}
            onChange={(e) => {
              const campo = e.target;
              if (campo instanceof HTMLInputElement && campo.name === "piano" && campo.value in PIANI) setScelto(campo.value as IdPiano);
            }}
          >
            <legend className="occhiello mb-2">Il piano · prezzi al mese, IVA esclusa</legend>
            <div className="grid gap-2.5">
              <div className="scelta-gruppo gruppo-annuali">
                <p className="gruppo-piani-titolo">Piani annuali · si paga una volta all&apos;anno</p>
                <div className="scelta-griglia">
                  {(["albero", "premium-annuale"] as const).map((id) => (
                    <SceltaPiano key={id} id={id} scelto={pacchetto} />
                  ))}
                </div>
              </div>
              <div className="scelta-gruppo gruppo-mensile">
                <p className="gruppo-piani-titolo">Si paga ogni mese</p>
                <SceltaPiano id="premium-mensile" scelto={pacchetto} />
              </div>
            </div>
            <ElencoCompatto piano={PIANI[scelto]} />
            <p className="mt-1 text-sm leading-snug text-matita">Demo: nessun pagamento, il piano serve solo a provare il percorso.</p>
          </fieldset>

          {stato.errore && (
            <p className="text-rosso" role="alert">
              {stato.errore}
            </p>
          )}
          <button className="timbro w-full text-lg" disabled={inCorso}>
            {inCorso ? "Lo stiamo piantando… e sta già scrivendo la prima lettera" : unAltro ? "Pianta questo albero" : "Pianta il tuo albero"}
          </button>
          {unAltro && (
            <Link href="/giardino" className="block text-center text-matita underline underline-offset-4">
              Non ora, torna al giardino
            </Link>
          )}
        </form>
      </section>
    </div>
  );
}
