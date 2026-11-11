import { Albero } from "@/components/albero/Albero";
import { azione } from "@/lib/albero/azioni";
import type { Indumento, Posa } from "@/lib/albero/tipi";
import { Parole } from "./Effetti";
import { MOMENTI, NOTA_MENSILE, perMomento, TestoVoce, VOCI, type Momento } from "./Pacchetti";

// Che cosa si riceve, detto chiaro: come funziona, l'elenco delle funzioni e
// una sezione tutta per il diario, con un esempio delle sue pagine.

const PASSI = [
  {
    titolo: "Alla semina",
    testo: "Scegli il nome dell'albero e la città dove vive. Nasce con 7 tratti di carattere casuali e ti scrive subito la lettera di benvenuto.",
  },
  {
    titolo: "Ogni giorno",
    testo: "Legge il meteo reale della sua città e sceglie l'azione del giorno tra 23, in base al meteo, al carattere e a volte a un evento casuale. Poi scrive una pagina di diario.",
  },
  {
    titolo: "Ogni 30 giorni",
    testo: "Ti arriva una lettera via email. Una in più nei momenti importanti, per esempio quando prende la sua strada.",
  },
  {
    titolo: "All'undicesimo mese",
    testo: "Ricevi il diario dell'anno: PDF illustrato con l'Albero, libro stampato e spedito a casa col Premium.",
  },
];

/** Come funziona, in quattro momenti. */
export function ComeFunziona() {
  return (
    <section id="come-funziona" aria-labelledby="titolo-come" className="lp-sezione lp-chiaro scroll-mt-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="lp-occhiello">Come funziona</p>
        <h2 id="titolo-come" className="lp-h2 mt-3 max-w-3xl">
          <Parole testo="Che cosa succede, e quando." />
        </h2>
        <ol className="lp-passi lp-passi-4 mt-10">
          {PASSI.map((p, i) => (
            <li key={p.titolo} className="lp-passo affiora">
              <span className="lp-passo-numero" aria-hidden>
                {i + 1}
              </span>
              <h3 className="lp-h3 mt-3">{p.titolo}</h3>
              <p className="lp-testo mt-2 text-black/70">{p.testo}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Che cosa si riceve, piano per piano: oggetti e tempi. */
export function CheCosaRicevi() {
  const tutti = perMomento(VOCI.tutti);
  const premium = perMomento(VOCI.premium);
  const momenti = (Object.keys(MOMENTI) as Momento[]).filter((m) => tutti.some((g) => g.momento === m) || premium.some((g) => g.momento === m));
  const voci = (gruppi: typeof tutti, m: Momento) => gruppi.find((g) => g.momento === m)?.voci ?? [];
  return (
    <section aria-labelledby="titolo-ricevi" className="lp-sezione lp-scuro">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="lp-occhiello">Che cosa ricevi</p>
        <h2 id="titolo-ricevi" className="lp-h2 mt-3 max-w-3xl">
          <Parole testo="Che cosa ricevi, piano per piano." />
        </h2>
        <p className="lp-testo mt-4 max-w-2xl">
          A sinistra quello che c&apos;è in tutti i piani, a destra quello che aggiungono i Premium. Le voci «in arrivo» sono già nel piano e
          arrivano con i prossimi aggiornamenti.
        </p>
        <div className="lp-confronto mt-10">
          <div className="lp-confronto-testa" aria-hidden>
            <span />
            <span>In tutti i piani</span>
            <span>
              In più con il Premium <span className="lp-chip ml-1 align-middle">Premium</span>
            </span>
          </div>
          {momenti.map((m) => (
            <div key={m} className="lp-confronto-riga affiora">
              <h3 className="lp-confronto-momento">
                {MOMENTI[m]}
              </h3>
              {(["tutti", "premium"] as const).map((colonna) => {
                const elenco = voci(colonna === "tutti" ? tutti : premium, m);
                return (
                  <div key={colonna} className={`lp-confronto-cella lp-confronto-${colonna} ${elenco.length ? "" : "lp-confronto-niente"}`}>
                    <p className="lp-confronto-etichetta">
                      {colonna === "tutti" ? "In tutti i piani" : "In più con il Premium"}
                    </p>
                    {elenco.length > 0 ? (
                      <ul className="lp-lista lp-lista-scura">
                        {elenco.map((v) => (
                          <li key={v.testo} data-arrivo={v.inArrivo ? "" : undefined}>
                            <TestoVoce voce={v} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="lp-confronto-vuoto">{colonna === "premium" ? "Uguale in tutti i piani" : "Solo con il Premium"}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="lp-confronto-nota mt-5">{NOTA_MENSILE}</p>
      </div>
    </section>
  );
}

const posa = (id: string, extra: Partial<Posa> = {}, indossa: Indumento[] = []): Posa => {
  const a = azione(id).posa;
  return { ...a, ...extra, indossa: [...a.indossa, ...indossa] };
};

/** La sezione del diario, con un esempio grande delle sue pagine. */
export function DiarioEsempio() {
  return (
    <section id="diario-esempio" aria-labelledby="titolo-diario-esempio" className="lp-sezione lp-diario-sezione overflow-x-clip">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="lp-occhiello">Il diario dell&apos;anno</p>
          <h2 id="titolo-diario-esempio" className="lp-h2 mt-3">
            <Parole testo="Il diario dell'anno, a casa tua." />
          </h2>
          <p className="lp-testo mt-4 text-black/70">
            Ogni giorno l&apos;albero scrive da una a tre frasi: che cosa ha fatto, che tempo faceva, che cosa ha pensato.
            All&apos;undicesimo mese, prima del rinnovo, ricevi il diario dell&apos;anno: le pagine di ogni giorno, le lettere e il
            momento in cui ha preso la sua strada. L&apos;ultima pagina racconta che cosa vuole fare l&apos;anno dopo.
          </p>
        </div>

        <figure className="lp-diario-esempio affiora">
          <div className="lp-diario-libro" aria-hidden>
            {/* pagina di sinistra */}
            <div className="lp-diario-pagina carta-righe">
              <p className="lp-diario-mese">Novembre</p>
              <div className="lp-diario-vignetta">
                <Albero posa={posa("passeggiata", {}, ["cappello", "sciarpa"])} stadio="alberello" stagione="autunno" className="h-full w-full" titolo="" />
              </div>
              <p className="lp-diario-riga">
                <b>Giorno 41 · ☂ 12°</b> Pioggia fina tutto il giorno. Ho fatto la doccia con la schiuma, poi un pisolino.
              </p>
              <p className="lp-diario-riga">
                <b>Giorno 42 · ☀ 15°</b> Ho contato le formiche: 212. Domani ricomincio, ne manca una.
              </p>
              <span className="lp-diario-numero">41</span>
            </div>
            {/* pagina di destra */}
            <div className="lp-diario-pagina carta-righe">
              <p className="lp-diario-riga">
                <b>Giorno 43 · ★ ☁ 13°</b> Oggi ho deciso chi voglio diventare: un imprenditore. Ho già un cartello.
              </p>
              <div className="lp-diario-vignetta lp-diario-vignetta-grande">
                <Albero posa={posa("vendere-ombra", { occhi: "felici", bocca: "grande" }, ["cravatta"])} stadio="albero" stagione="autunno" className="h-full w-full" titolo="" />
                <span className="lp-diario-stellina">★</span>
              </div>
              <div className="lp-diario-lettera">
                <p>Cara Giulia, apro un&apos;attività: ombra a pagamento. Il primo cliente sarà lo scoiattolo, se paga.</p>
              </div>
              <span className="lp-diario-numero">42</span>
            </div>
          </div>
          <figcaption className="lp-diario-note">
            <span>
              <b>1</b> Una pagina al giorno, con la data
            </span>
            <span>
              <b>2</b> Il meteo reale di quel giorno nella sua città
            </span>
            <span>
              <b>3</b> La stellina sui giorni importanti
            </span>
            <span>
              <b>4</b> Le lettere dell&apos;anno
            </span>
          </figcaption>
          <p className="lp-piccolo mt-2 text-center text-black/50">Esempio illustrato: ogni diario è diverso, perché lo scrive il suo albero.</p>
        </figure>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="lp-diario-modo">
            <span className="lp-chip lp-chip-scura">Tutti i piani</span>
            <h3 className="lp-h3 mt-3">Albero: PDF illustrato</h3>
            <p className="lp-testo mt-2 text-black/70">
              Ogni giorno leggi la pagina nuova nel giardino. All&apos;undicesimo mese ricevi il diario dell&apos;anno impaginato e
              illustrato, in PDF.
            </p>
          </div>
          <div className="lp-diario-modo lp-diario-modo-libro">
            <div className="lp-libro-chiuso" aria-hidden>
              <span className="lp-libro-chiuso-sopra">Il primo anno</span>
              <span className="lp-libro-chiuso-ritratto">
                <Albero posa={posa("guardare-cielo", { occhi: "felici", bocca: "grande" })} stadio="albero" stagione="autunno" className="h-full w-full" titolo="" />
              </span>
              <span className="lp-libro-chiuso-titolo">Il diario di Ottavio</span>
            </div>
            <div>
              <span className="lp-chip">Premium</span>
              <h3 className="lp-h3 mt-3">Premium: libro stampato a casa</h3>
              <p className="lp-testo mt-2 text-white/75">
                Lo stesso diario, stampato e spedito a casa: all&apos;undicesimo mese con l&apos;annuale, al dodicesimo con il
                mensile se completi l&apos;anno.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
