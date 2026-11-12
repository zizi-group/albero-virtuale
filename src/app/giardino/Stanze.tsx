"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type CSSProperties } from "react";
import { Albero } from "@/components/albero/Albero";
import type { Posa, Stadio, Stagione } from "@/lib/albero/tipi";
import { arrediInScena, COOKIE_ALBERO, type ArredoInStanza } from "@/lib/stanze";
import type { Esito } from "./actions";
import { rinomina, trasloca } from "./azioniStanze";

// Le stanze nel giardino (docs/stanze-e-vita.md, sezione 2): la scelta della
// stanza in alto, gli altri alberi della stanza nella scena e il cookie che
// ricorda quale albero si guarda. Chi ha un albero solo in una stanza sola non
// vede niente di nuovo.

export interface AlberoInElenco {
  id: string;
  nome: string;
  giorni: number;
}
export interface StanzaInElenco {
  id: string;
  numero: number;
  nome: string;
  alberi: AlberoInElenco[];
}

/** Ricorda nel browser quale albero si sta guardando: le azioni del server lo leggono. */
export function RicordaAlbero({ id }: { id: string }) {
  useEffect(() => {
    document.cookie = `${COOKIE_ALBERO}=${encodeURIComponent(id)}; path=/; max-age=31536000; samesite=lax`;
  }, [id]);
  return null;
}

function Messaggio({ esito }: { esito: Esito }) {
  if (!esito.messaggio) return null;
  return (
    <p className={`st-esito ${esito.ok ? "" : "st-errore"}`} role="status">
      {esito.messaggio}
    </p>
  );
}

/** Il bottone in alto con la stanza di adesso; apre l'elenco delle stanze. */
export function SceltaStanza({
  stanze,
  stanzaId,
  alberoId,
  alberoNome,
  capienza,
  chiuse,
  regola,
  puoPiantare,
}: {
  stanze: StanzaInElenco[];
  stanzaId: string | null;
  alberoId: string;
  alberoNome: string;
  capienza: number;
  /** Stanze ancora chiuse, fino a 10. */
  chiuse: number;
  /** Che cosa apre la prossima stanza. */
  regola: string | null;
  puoPiantare: boolean;
}) {
  const [aperto, setAperto] = useState(false);
  const [esitoTrasloco, azioneTrasloco, traslocoInCorso] = useActionState<Esito, FormData>(trasloca, {});
  const [esitoNome, azioneNome, nomeInCorso] = useActionState<Esito, FormData>(rinomina, {});
  const [rinominando, setRinominando] = useState(false);
  const radice = useRef<HTMLDivElement>(null);
  const qui = stanze.find((s) => s.id === stanzaId) ?? null;

  useEffect(() => {
    if (!aperto) return;
    const fuori = (e: PointerEvent) => {
      if (!radice.current?.contains(e.target as Node)) setAperto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAperto(false);
    };
    window.addEventListener("pointerdown", fuori);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", fuori);
      window.removeEventListener("keydown", esc);
    };
  }, [aperto]);

  const doveAndare = stanze.filter((s) => s.id !== stanzaId && s.alberi.length < capienza);

  return (
    <div className="st" ref={radice}>
      <button type="button" className="gi-chip st-bottone" aria-expanded={aperto} aria-controls="st-elenco" onClick={() => setAperto((v) => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden className="st-icona">
          <path d="M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5h4v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {qui ? qui.nome : "Le stanze"}
        {qui && qui.alberi.length > 1 && <span className="st-conta">{qui.alberi.length}</span>}
        <span aria-hidden className="st-freccia">
          ▾
        </span>
      </button>

      <div id="st-elenco" className="st-elenco" hidden={!aperto} role="region" aria-label="Le tue stanze">
        <p className="st-titolo">Le tue stanze</p>
        <ul className="st-lista">
          {stanze.map((s) => (
            <li key={s.id} className="st-stanza" data-qui={s.id === stanzaId ? "1" : undefined}>
              <div className="st-riga">
                <span className="st-numero">{s.numero}</span>
                <span className="st-nome">{s.nome}</span>
                <span className="st-posti">
                  {s.alberi.length}/{capienza}
                </span>
              </div>
              {s.alberi.length ? (
                <div className="st-alberi">
                  {s.alberi.map((a) => (
                    <Link
                      key={a.id}
                      href={`/giardino?albero=${a.id}`}
                      scroll={false}
                      className="st-albero"
                      aria-current={a.id === alberoId ? "true" : undefined}
                      onClick={() => setAperto(false)}
                    >
                      {a.nome}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="st-alberi">
                  <span className="st-vuota">Vuota.</span>
                  {puoPiantare && (
                    <Link href={`/pianta?altro=1&stanza=${s.id}`} className="st-albero">
                      Pianta qui
                    </Link>
                  )}
                </div>
              )}
            </li>
          ))}
          {chiuse > 0 && (
            <li className="st-stanza st-chiusa">
              <div className="st-riga">
                <span className="st-numero" aria-hidden>
                  <svg viewBox="0 0 24 24" className="st-icona">
                    <path d="M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9h-13z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="st-nome">
                  {chiuse === 1 ? "Ancora una stanza chiusa" : `Ancora ${chiuse} stanze chiuse`}
                </span>
              </div>
              {regola && <p className="st-regola">{regola}.</p>}
            </li>
          )}
        </ul>

        {doveAndare.length > 0 && (
          <form action={azioneTrasloco} className="st-modulo">
            <input type="hidden" name="albero" value={alberoId} />
            <label className="st-etichetta" htmlFor="st-dove">
              Trasloca {alberoNome} in
            </label>
            <div className="st-fila">
              <select id="st-dove" name="stanza" className="st-campo" defaultValue={doveAndare[0].id}>
                {doveAndare.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} ({s.alberi.length}/{capienza})
                  </option>
                ))}
              </select>
              <button className="st-azione" disabled={traslocoInCorso}>
                {traslocoInCorso ? "…" : "Trasloca"}
              </button>
            </div>
            <Messaggio esito={esitoTrasloco} />
          </form>
        )}

        {qui &&
          (rinominando ? (
            <form action={azioneNome} className="st-modulo">
              <input type="hidden" name="stanza" value={qui.id} />
              <label className="st-etichetta" htmlFor="st-nome">
                Il nome sul cartello
              </label>
              <div className="st-fila">
                <input id="st-nome" name="nome" className="st-campo" defaultValue={qui.nome} maxLength={40} required />
                <button className="st-azione" disabled={nomeInCorso}>
                  {nomeInCorso ? "…" : "Salva"}
                </button>
              </div>
              <Messaggio esito={esitoNome} />
            </form>
          ) : (
            <button type="button" className="st-link" onClick={() => setRinominando(true)}>
              Cambia il nome di «{qui.nome}»
            </button>
          ))}
      </div>
    </div>
  );
}

/** Un altro albero della stanza, nella scena: fa la sua giornata; toccarlo lo mette davanti. */
export interface CompagnoInScena {
  id: string;
  nome: string;
  etichetta: string;
  posa: Posa;
  giorni: number;
  stadio: Stadio;
  /** Posizione in percentuale della larghezza. */
  x: number;
  /** Quanto avvicinarlo, come la camera del protagonista. */
  camera: number;
  /** Dietro (più piccolo) o accanto. */
  dietro: boolean;
}

export function Compagni({ compagni, stagione, innevato }: { compagni: CompagnoInScena[]; stagione: Stagione; innevato: boolean }) {
  if (!compagni.length) return null;
  return (
    <div className="st-compagni">
      {compagni.map((c) => (
        <Link
          key={c.id}
          href={`/giardino?albero=${c.id}`}
          scroll={false}
          className="st-compagno"
          data-dietro={c.dietro ? "1" : undefined}
          style={{ "--st-x": `${c.x}%`, "--st-camera": c.camera.toFixed(3) } as CSSProperties}
          aria-label={`${c.nome} ${c.etichetta}. Guardalo da vicino`}
        >
          <Albero posa={c.posa} giorni={c.giorni} stadio={c.stadio} stagione={stagione} innevato={innevato} titolo="" />
          <span className="st-cartellino" aria-hidden>
            {c.nome}
          </span>
        </Link>
      ))}
    </div>
  );
}

/**
 * Gli arredi sistemati nei posti della stanza (sezione 2.3). È l'aggancio per
 * `room_items` della fase 3: finché gli oggetti non hanno un disegno si vede un
 * cartellino col nome nel suo posto.
 */
export function Arredi({ arredi }: { arredi: ArredoInStanza[] }) {
  const inScena = arrediInScena(arredi);
  if (!inScena.length) return null;
  return (
    <div className="st-arredi" aria-label="Gli oggetti della stanza" role="list">
      {inScena.map((a) => (
        <span
          key={`${a.posto}-${a.indice}`}
          role="listitem"
          className="st-arredo"
          data-posto={a.posto}
          style={{ left: `${a.x}%`, "--st-alto": a.alto, "--st-scala": a.scala } as CSSProperties}
        >
          {a.nome}
        </span>
      ))}
    </div>
  );
}
