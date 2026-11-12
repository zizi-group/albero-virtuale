import { Albero } from "@/components/albero/Albero";
import { FiguraOggetto } from "@/components/albero/vivo/oggettiStanza";
import { azione } from "@/lib/albero/azioni";
import { CATALOGO, CATEGORIE, NOMI_CATEGORIA, TOTALE_CATALOGO, type VoceCatalogo } from "@/lib/albero/oggetti";
import type { Stagione } from "@/lib/albero/tipi";
import { Rimetti, SegnaVisto } from "./CatalogoVivo";
import "./calendario.css";
import "./stanza.css";

// Il catalogo della collezione (docs/stanze-e-vita.md, sezione 10): edifici,
// arredi, giochi, attrezzi, vestiti, trofei, rarità e l'album delle stagioni.
// Le voci prese hanno il disegno, il giorno e le attività che aprono; quelle
// ancora chiuse sono sagome con un indizio; quelle «in arrivo» non hanno ancora
// il disegno. Si sbloccano vivendo (regole in src/lib/albero/oggetti.ts).

export interface PaginaStagione {
  giorno: number;
  data: string;
  azione: string;
  testo: string;
}

const STAGIONI = new Set(["primavera", "estate", "autunno", "inverno"]);

const DI_STAGIONE: Record<Stagione, string> = {
  primavera: "di primavera",
  estate: "d'estate",
  autunno: "d'autunno",
  inverno: "d'inverno",
};

const data = (d: string) =>
  new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

interface Sbloccato {
  item: string;
  day_number: number;
  opened_at: string | null;
  seen_at: string | null;
}

function Voce({ v, s, deposito }: { v: VoceCatalogo; s: Sbloccato | undefined; deposito: boolean }) {
  const inArrivo = v.stato === "in-arrivo";
  const nelPacco = !!s && !s.opened_at;
  const preso = !!s && !nelPacco;
  const nuovo = preso && !s.seen_at;
  const stato = preso ? "preso" : inArrivo ? "in-arrivo" : nelPacco ? "pacco" : "chiuso";
  return (
    <li className="cat-voce" data-stato={stato}>
      <span className="cat-figura">
        {inArrivo ? (
          <span className="cat-arrivo" aria-hidden>
            ?
          </span>
        ) : (
          <FiguraOggetto id={v.id} simbolo={v.simbolo} className="cat-svg" />
        )}
        {nuovo && <span className="cat-nuovo">Nuovo</span>}
      </span>
      <span className="cat-nome">{preso ? v.nome : nelPacco ? v.nome : <span className="sr-only">Da scoprire: </span>}</span>
      {preso ? (
        <>
          <span className="cat-nota">Giorno {s.day_number}</span>
          {v.usi.length > 0 && <span className="cat-usi">Apre: {v.usi.slice(0, 2).join(" · ")}</span>}
          {deposito && (
            <>
              <span className="cat-nota">In deposito</span>
              <Rimetti item={v.id} nome={v.articolo} />
            </>
          )}
        </>
      ) : nelPacco ? (
        <span className="cat-nota">È nel pacco: aprilo nella stanza.</span>
      ) : (
        <>
          <span className="cat-indizio">{v.indizio}</span>
          {inArrivo && <span className="cat-chip">In arrivo</span>}
        </>
      )}
    </li>
  );
}

export function Collezione({
  nome,
  sbloccati,
  stagioni,
  inDeposito,
}: {
  nome: string;
  sbloccati: Sbloccato[];
  /** Il primo giorno vissuto in ogni stagione, per l'album. */
  stagioni: Partial<Record<Stagione, PaginaStagione>>;
  /** Oggetti della stanza messi via (si possono rimettere). */
  inDeposito: string[];
}) {
  const per = new Map(sbloccati.map((u) => [u.item, u]));
  const deposito = new Set(inDeposito);
  const disegnati = CATALOGO.filter((v) => v.stato === "disegnato").length;
  const nuovi = sbloccati.filter((u) => u.opened_at && !u.seen_at).length;

  return (
    <div className="cal-collezione">
      <SegnaVisto quanti={nuovi} />
      <div className="cat-conto">
        <p>
          <b>
            {sbloccati.length} su {TOTALE_CATALOGO}
          </b>{" "}
          nella collezione di {nome}.
        </p>
        <span className="cat-barra" aria-hidden>
          <span style={{ width: `${(100 * sbloccati.length) / TOTALE_CATALOGO}%` }} />
        </span>
        <p className="cat-nota">
          {disegnati} si possono già trovare, {TOTALE_CATALOGO - disegnati} sono in arrivo con i prossimi aggiornamenti.
          {nuovi > 0 && ` ${nuovi === 1 ? "Una novità" : `${nuovi} novità`} da guardare.`}
        </p>
      </div>

      {CATEGORIE.map((c) => {
        const voci = CATALOGO.filter((v) => v.categoria === c && !STAGIONI.has(v.id));
        if (!voci.length) return null;
        const presi = voci.filter((v) => per.get(v.id)?.opened_at).length;
        // Prima le prese (le nuove in cima), poi le chiuse, poi quelle in arrivo.
        const ordine = (v: VoceCatalogo) => {
          const s = per.get(v.id);
          if (s?.opened_at) return s.seen_at ? 1 : 0;
          if (s) return 2;
          return v.stato === "disegnato" ? 3 : 4;
        };
        return (
          <section key={c} aria-labelledby={`cat-${c}`} className="cal-gruppo">
            <h3 id={`cat-${c}`} className="cal-gruppo-titolo">
              {NOMI_CATEGORIA[c]}{" "}
              <span className="cat-gruppo-conto">
                {presi}/{voci.length}
              </span>
            </h3>
            <ul className="cat-griglia">
              {[...voci]
                .sort((a, b) => ordine(a) - ordine(b))
                .map((v) => (
                  <Voce key={v.id} v={v} s={per.get(v.id)} deposito={deposito.has(v.id)} />
                ))}
            </ul>
          </section>
        );
      })}

      <section aria-labelledby="cal-stagioni" className="cal-gruppo">
        <h3 id="cal-stagioni" className="cal-gruppo-titolo">
          L&apos;album delle stagioni
        </h3>
        <ul className="cal-album">
          {CATALOGO.filter((v) => STAGIONI.has(v.id)).map((v) => {
            const st = v.id as Stagione;
            const p = stagioni[st];
            return (
              <li key={v.id} className="cal-stagione" data-preso={p ? "1" : undefined} data-stagione={st}>
                <div className="cal-stagione-figura">
                  {p ? (
                    <Albero posa={azione(p.azione).posa} stagione={st} giorni={p.giorno} className="h-full w-full" titolo="" />
                  ) : (
                    <span className="cal-stagione-chiusa" aria-hidden>
                      ?
                    </span>
                  )}
                </div>
                <p className="cal-voce-nome">{v.nome}</p>
                {p ? (
                  <>
                    <p className="cal-voce-nota">
                      Giorno {p.giorno}, {data(p.data)}
                    </p>
                    <p className="cal-stagione-testo">«{p.testo}»</p>
                  </>
                ) : (
                  <p className="cal-voce-nota">
                    La pagina si apre con il primo giorno {DI_STAGIONE[st]} di {nome}.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
