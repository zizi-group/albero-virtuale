"use client";

import Link from "next/link";
import { useActionState, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { EVENTO_MOVIMENTO, movimentoRidotto } from "@/components/Movimento";
import type { Stagione } from "@/lib/albero/tipi";
import type { AlberoDelClub, Consenso, Contatori, EtichettaPersona } from "@/lib/club";
import { azioneConsenso, azioneEsempi, type EsitoClub } from "./actions";
import { Mappa2D } from "./Mappa2D";
import type { AlberoToccato, IstanzaClub, MotoreClub, Statistiche } from "./tipi";

const nessunCambio = () => () => {};
const CHIAVE_LENTO = "linfa-club-lento";

let webglPresente: boolean | null = null;
function haWebGL(): boolean {
  if (webglPresente === null) {
    try {
      const c = document.createElement("canvas");
      webglPresente = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglPresente = false;
    }
  }
  return webglPresente;
}
function giaLento(): boolean {
  try {
    return sessionStorage.getItem(CHIAVE_LENTO) === "1";
  } catch {
    return false;
  }
}

const numero = (n: number) => new Intl.NumberFormat("it-IT").format(n);
const data = (d: string) => new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
const NOMI_ETICHETTA: Record<EtichettaPersona, string> = { nessuno: "Solo il nome dell'albero", iniziali: "Le tue iniziali", nome: "Il tuo nome di battesimo" };

export interface PropsForestaClub {
  alberi: AlberoDelClub[];
  contatori: Contatori;
  consenso: Consenso;
  nomeAlbero: string;
  /** Che cosa vedrebbero gli altri accanto al nome dell'albero, per ogni scelta. */
  anteprime: Record<EtichettaPersona, string | null>;
  stagione: Stagione;
  misura: boolean;
}

export function ForestaClub(p: PropsForestaClub) {
  const tela = useRef<HTMLCanvasElement>(null);
  const nomi = useRef<HTMLDivElement>(null);
  const istanza = useRef<IstanzaClub | null>(null);
  const webgl = useSyncExternalStore(nessunCambio, () => haWebGL() && !giaLento(), () => true);
  const [stato, setStato] = useState<"carica" | "pronto" | "ripiego">("carica");
  const [toccato, setToccato] = useState<AlberoToccato | null>(null);
  const [stat, setStat] = useState<Statistiche | null>(null);
  const ultime = useRef(p);
  useLayoutEffect(() => {
    ultime.current = p;
  });
  const mio = p.alberi.some((a) => a.mio);
  // la foresta si ricrea solo se cambiano gli alberi (consenso, esempi)
  const chiave = `${p.alberi.length}:${p.alberi[0]?.seme ?? ""}:${p.alberi.filter((a) => a.mio).length}`;

  useEffect(() => {
    if (!webgl) return;
    let vivo = true;
    let pulisci = () => {};
    import("@/lib/giardino3d/club.js")
      .then((m) => {
        const { creaForestaClub } = m as unknown as MotoreClub;
        if (!vivo || !tela.current || !nomi.current) return;
        const q = ultime.current;
        const f = creaForestaClub(tela.current, {
          alberi: q.alberi,
          etichette: nomi.current,
          stagione: q.stagione,
          movimentoRidotto: movimentoRidotto(),
          misura: q.misura,
        });
        istanza.current = f;
        let raf = 0;
        let attesa = 0;
        let giro = 0;
        f.su("pronto", () => {
          if (!vivo) return;
          setStato("pronto");
          // dispositivo troppo lento: dopo che la qualità si è assestata, se resta
          // sotto i ~20 fotogrammi al secondo si passa alla mappa 2D
          attesa = window.setTimeout(() => {
            const tempi: number[] = [];
            let prima = performance.now();
            const passo = (ora: number) => {
              if (!vivo) return;
              if (!document.hidden) tempi.push(ora - prima);
              prima = ora;
              if (tempi.length < 90) {
                raf = requestAnimationFrame(passo);
                return;
              }
              const mediana = [...tempi].sort((a, b) => a - b)[45];
              if (mediana > 50) {
                console.warn(`Foresta del club troppo lenta qui (${Math.round(mediana)} ms per fotogramma): passo alla mappa 2D.`);
                try {
                  sessionStorage.setItem(CHIAVE_LENTO, "1");
                } catch {}
                setStato("ripiego");
              }
            };
            raf = requestAnimationFrame(passo);
          }, 4000);
        });
        f.su("tocca-albero", (d) => setToccato((d as AlberoToccato | null) ?? null));
        if (q.misura) giro = window.setInterval(() => setStat(f.statistiche()), 1000);
        const persa = (e: Event) => {
          e.preventDefault();
          if (vivo) setStato("ripiego");
        };
        const canvas = tela.current;
        canvas.addEventListener("webglcontextlost", persa);
        const movimento = () => f.imposta({ movimentoRidotto: movimentoRidotto() });
        window.addEventListener(EVENTO_MOVIMENTO, movimento);
        pulisci = () => {
          cancelAnimationFrame(raf);
          clearTimeout(attesa);
          clearInterval(giro);
          canvas.removeEventListener("webglcontextlost", persa);
          window.removeEventListener(EVENTO_MOVIMENTO, movimento);
        };
      })
      .catch((e) => {
        console.error("La foresta del club in 3D non è partita:", e);
        if (vivo) setStato("ripiego");
      });
    return () => {
      vivo = false;
      pulisci();
      istanza.current?.distruggi();
      istanza.current = null;
    };
  }, [webgl, chiave]);

  const in3D = webgl && stato !== "ripiego";
  const c = p.contatori;

  return (
    <div className="club" data-stato={in3D ? stato : "2d"}>
      <div className="club-scena">
        {in3D ? (
          <>
            <canvas
              key={chiave}
              ref={tela}
              className="club-tela"
              tabIndex={0}
              role="img"
              aria-label="La foresta del club in 3D: trascina per esplorarla, rotella o due dita per avvicinarti, tocca un albero per il suo nome. Con la tastiera: frecce e + o −."
            />
            <div ref={nomi} className="club-nomi" aria-hidden />
            {stato === "carica" && (
              <p className="club-carica" role="status">
                La foresta si sta svegliando…
              </p>
            )}
          </>
        ) : (
          <Mappa2D alberi={p.alberi} stagione={p.stagione} onTocca={setToccato} />
        )}
      </div>

      <header className="club-hud club-alto">
        <div className="club-carta club-titolo">
          <Link href="/" className="club-logo" aria-label="Linfa, pagina iniziale">
            Linfa
          </Link>
          <p className="club-occhiello">Il club di Linfa</p>
          <h1 className="club-h1">La foresta del club</h1>
          <p className="club-conti">
            <span>
              <b>{numero(c.alberi)}</b> {c.alberi === 1 ? "albero piantato" : "alberi piantati"} nel club
            </span>
            <span>
              <b>{numero(c.questoMese)}</b> questo mese
            </span>
          </p>
          <p className="club-nota">
            {c.inForesta === c.alberi
              ? "Tutti compaiono nella foresta."
              : `${numero(c.inForesta)} compaiono nella foresta: gli altri hanno scelto di no.`}
          </p>
          <p className="club-invito">Aiutaci a rendere questa foresta sempre più fitta.</p>
          <button type="button" className="club-seme" disabled aria-describedby="seme-arrivo">
            Regala un seme <span id="seme-arrivo">in arrivo</span>
          </button>
        </div>
        <nav className="club-comandi" aria-label="Comandi della foresta">
          <Link href="/giardino" className="club-pillola">
            ← Il tuo giardino
          </Link>
          {in3D && (
            <span className="club-zoom">
              <button type="button" className="club-tondo" onClick={() => istanza.current?.zoom(0.75)} aria-label="Avvicina">
                +
              </button>
              <button type="button" className="club-tondo" onClick={() => istanza.current?.zoom(1 / 0.75)} aria-label="Allontana">
                −
              </button>
              <button type="button" className="club-pillola" onClick={() => istanza.current?.vaiAlMio()}>
                {mio ? "Torna al mio albero" : "Torna al centro"}
              </button>
            </span>
          )}
        </nav>
      </header>

      {c.esempi > 0 && (
        <p className="club-esempi" role="note">
          <b>Demo:</b> {numero(c.esempi)} alberi d&apos;esempio, segnati «esempio della demo». Non sono persone né alberi veri e non
          entrano nei contatori.
        </p>
      )}

      {toccato && (
        <div className="club-carta club-scheda" role="status">
          <button type="button" className="club-chiudi" onClick={() => setToccato(null)} aria-label="Chiudi">
            ×
          </button>
          <p className="club-occhiello">{toccato.mio ? "Il tuo albero" : toccato.esempio ? "Esempio della demo" : "Un albero del club"}</p>
          <p className="club-scheda-nome">{toccato.nome}</p>
          {toccato.specie && <p className="club-nota">{toccato.specie}</p>}
          {!toccato.mio && !toccato.esempio && toccato.persona && <p className="club-nota">di {toccato.persona}</p>}
        </div>
      )}

      <footer className="club-hud club-basso">
        <Consenso consenso={p.consenso} nomeAlbero={p.nomeAlbero} anteprime={p.anteprime} />
        <StrumentiDemo esempi={c.esempi} stat={stat} misura={p.misura} />
      </footer>
    </div>
  );
}

function Consenso({ consenso, nomeAlbero, anteprime }: Pick<PropsForestaClub, "consenso" | "nomeAlbero" | "anteprime">) {
  const [esito, azione, inCorso] = useActionState<EsitoClub, FormData>(azioneConsenso, {});
  const [scelta, setScelta] = useState<EtichettaPersona>(consenso.etichetta);
  const anteprima = anteprime[scelta];
  return (
    <details className="club-carta club-consenso" open={!consenso.attivo}>
      <summary>
        <span className="club-occhiello">Il tuo albero nel club</span>
        <span className="club-stato" data-attivo={consenso.attivo ? "1" : undefined}>
          {consenso.attivo ? "Compare" : "Non compare"}
        </span>
      </summary>
      <form action={azione} className="club-modulo">
        <p className="club-nota">
          {consenso.attivo && consenso.dal
            ? `${nomeAlbero} compare nella foresta dal ${data(consenso.dal)}. Puoi toglierlo quando vuoi.`
            : consenso.revocatoIl
              ? `Hai tolto ${nomeAlbero} dal club il ${data(consenso.revocatoIl)}. Puoi rimetterlo quando vuoi.`
              : `${nomeAlbero} non compare. Se dici sì, gli altri membri vedono il nome dell'albero e, se vuoi, il tuo nome di battesimo o le iniziali. Mai email, città o altro.`}
        </p>
        <fieldset className="club-scelte">
          <legend className="sr-only">Che cosa si vede accanto al nome dell&apos;albero</legend>
          {(Object.keys(NOMI_ETICHETTA) as EtichettaPersona[]).map((id) => (
            <label key={id} className="club-scelta">
              <input
                type="radio"
                name="persona"
                value={id}
                checked={scelta === id}
                onChange={() => setScelta(id)}
                disabled={id !== "nessuno" && !anteprime[id]}
              />
              <span>
                {NOMI_ETICHETTA[id]}
                {id !== "nessuno" && !anteprime[id] && " (non ci hai detto come ti chiami)"}
              </span>
            </label>
          ))}
        </fieldset>
        <p className="club-anteprima">
          Gli altri vedono: <b>{nomeAlbero}</b>
          {anteprima && <span> · di {anteprima}</span>}
        </p>
        <div className="club-bottoni">
          <button className="club-pillola club-primario" name="cosa" value="dai" disabled={inCorso}>
            {consenso.attivo ? "Salva" : "Sì, fallo comparire"}
          </button>
          {consenso.attivo && (
            <button className="club-pillola" name="cosa" value="revoca" disabled={inCorso}>
              Togli il mio albero
            </button>
          )}
        </div>
        {esito.ok && <p className="club-esito" role="status">{esito.ok}</p>}
        {esito.errore && <p className="club-esito club-errore" role="alert">{esito.errore}</p>}
      </form>
    </details>
  );
}

function StrumentiDemo({ esempi, stat, misura }: { esempi: number; stat: Statistiche | null; misura: boolean }) {
  const [esito, azione, inCorso] = useActionState<EsitoClub, FormData>(azioneEsempi, {});
  return (
    <details className="club-carta club-demo">
      <summary>
        <span className="club-occhiello">Strumenti della demo</span>
      </summary>
      <p className="club-nota">
        Nella demo non ci sono altri iscritti. Questi alberi d&apos;esempio servono a provare la foresta: sono segnati «esempio della
        demo», non hanno una persona dietro e non entrano nei contatori.
      </p>
      <form action={azione} className="club-bottoni">
        {[100, 300, 1000].map((n) => (
          <button key={n} className="club-pillola" name="quanti" value={n} disabled={inCorso}>
            {n} esempi
          </button>
        ))}
        {esempi > 0 && (
          <button className="club-pillola" name="quanti" value={0} disabled={inCorso}>
            Togli gli esempi
          </button>
        )}
      </form>
      {inCorso && <p className="club-esito" role="status">Sto piantando gli esempi…</p>}
      {esito.ok && !inCorso && <p className="club-esito" role="status">{esito.ok}</p>}
      {esito.errore && <p className="club-esito club-errore" role="alert">{esito.errore}</p>}
      {misura ? (
        stat && (
          <p className="club-misura">
            {stat.alberi} alberi ({stat.vicini} vicini) · lavoro {stat.msMediana.toFixed(1)} ms (95%: {stat.ms95.toFixed(1)}) · tra due
            fotogrammi {stat.intervalloMediana.toFixed(1)} ms · {stat.disegni} disegni, {numero(stat.triangoli)} triangoli · pixel ×
            {stat.pixelRatio}
          </p>
        )
      ) : (
        <p className="club-nota">
          <Link href="/club?misura=1" className="underline">
            Misura i ms per fotogramma
          </Link>
        </p>
      )}
    </details>
  );
}
