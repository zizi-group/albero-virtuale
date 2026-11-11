import { Albero } from "@/components/albero/Albero";
import { IconaRegalo } from "@/components/IconaRegalo";
import { azione } from "@/lib/albero/azioni";
import { COLLEZIONE, NOMI_TIPO, type Sblocco, type TipoSblocco } from "@/lib/albero/collezione";
import type { Stagione } from "@/lib/albero/tipi";
import "./calendario.css";

// Il pannello Collezione: trofei, oggetti, vestiti e l'album delle stagioni.
// Si sbloccano vivendo (regole in src/lib/albero/collezione.ts), mai comprando.
// Quelli ancora chiusi dicono come si ottengono.

export interface PaginaStagione {
  giorno: number;
  data: string;
  azione: string;
  testo: string;
}

/** Le icone che IconaRegalo sa disegnare; le altre sono un simbolo. */
const DISEGNI = new Set(["berretto", "sciarpa", "occhiali", "libro", "ombrello", "tazza", "quaderno", "valigia", "regalo"]);

const DI_STAGIONE: Record<Stagione, string> = {
  primavera: "di primavera",
  estate: "d'estate",
  autunno: "d'autunno",
  inverno: "d'inverno",
};

const data = (d: string) =>
  new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

function Icona({ s }: { s: Sblocco }) {
  if (DISEGNI.has(s.icona)) return <IconaRegalo id={s.icona} className="cal-icona-disegno" />;
  return (
    <span className="cal-icona-simbolo" aria-hidden>
      {s.icona}
    </span>
  );
}

export function Collezione({
  nome,
  sbloccati,
  stagioni,
}: {
  nome: string;
  sbloccati: { item: string; day_number: number }[];
  /** Il primo giorno vissuto in ogni stagione, per l'album. */
  stagioni: Partial<Record<Stagione, PaginaStagione>>;
}) {
  const quando = new Map(sbloccati.map((u) => [u.item, u.day_number]));
  const gruppi: TipoSblocco[] = ["trofeo", "oggetto", "vestito"];

  return (
    <div className="cal-collezione">
      <p className="cal-conto">
        <b>
          {quando.size} su {COLLEZIONE.length}
        </b>{" "}
        nella collezione di {nome}.
      </p>

      {gruppi.map((tipo) => (
        <section key={tipo} aria-labelledby={`cal-${tipo}`} className="cal-gruppo">
          <h3 id={`cal-${tipo}`} className="cal-gruppo-titolo">
            {NOMI_TIPO[tipo]}
          </h3>
          <ul className="cal-griglia">
            {COLLEZIONE.filter((s) => s.tipo === tipo).map((s) => {
              const giorno = quando.get(s.id);
              const preso = giorno !== undefined;
              return (
                <li key={s.id} className="cal-voce" data-preso={preso ? "1" : undefined}>
                  <span className="cal-icona">
                    <Icona s={s} />
                  </span>
                  <span className="cal-voce-nome">{s.nome}</span>
                  <span className="cal-voce-nota">{preso ? `giorno ${giorno}` : s.come}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section aria-labelledby="cal-stagioni" className="cal-gruppo">
        <h3 id="cal-stagioni" className="cal-gruppo-titolo">
          {NOMI_TIPO.stagione}
        </h3>
        <ul className="cal-album">
          {COLLEZIONE.filter((s) => s.tipo === "stagione").map((s) => {
            const st = s.id as Stagione;
            const p = stagioni[st];
            return (
              <li key={s.id} className="cal-stagione" data-preso={p ? "1" : undefined} data-stagione={st}>
                <div className="cal-stagione-figura">
                  {p ? (
                    <Albero posa={azione(p.azione).posa} stagione={st} giorni={p.giorno} className="h-full w-full" titolo="" />
                  ) : (
                    <span className="cal-stagione-chiusa" aria-hidden>
                      ?
                    </span>
                  )}
                </div>
                <p className="cal-voce-nome">{s.nome}</p>
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
