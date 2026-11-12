import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Albero } from "@/components/albero/Albero";
import { Scena } from "@/components/albero/Scena";
import { Intestazione } from "@/components/Intestazione";
import { azione } from "@/lib/albero/azioni";
import type { Cielo } from "@/lib/albero/tipi";
import { datiMese, regaliInUso, scenaDelGiorno, stradaAlGiorno, type DatiMese } from "@/lib/motore/extra";
import { isPremium } from "@/lib/piani";
import { alberoScelto } from "@/lib/alberi";
import { PassaAlPremium } from "../../SceltaRegalo";
import "../../extra.css";

export const metadata: Metadata = { title: "Il riepilogo del mese — Linfa" };

const CIELI: Record<Cielo, { nome: string; simbolo: string }> = {
  sole: { nome: "sole", simbolo: "☀" },
  nuvole: { nome: "nuvole", simbolo: "☁" },
  pioggia: { nome: "pioggia", simbolo: "☂" },
  temporale: { nome: "temporale", simbolo: "⚡" },
  neve: { nome: "neve", simbolo: "❄" },
  nebbia: { nome: "nebbia", simbolo: "≋" },
};

const data = (d: string, mese: "long" | "short" = "long") =>
  new Intl.DateTimeFormat("it-IT", { day: "numeric", month: mese, timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

export default async function RiepilogoDelMese({ params }: PageProps<"/giardino/mese/[numero]">) {
  const { numero } = await params;
  const n = Number(numero);
  if (!Number.isInteger(n) || n < 1) notFound();

  const { supabase, albero } = await alberoScelto();

  const dati = await datiMese(supabase, albero.id, n, albero.name);
  if (!dati) notFound();
  const premium = isPremium(albero.plan);
  const regali = await regaliInUso(supabase, albero.id, n);
  const momento = dati.momento;
  const scena = momento ? scenaDelGiorno(momento, stradaAlGiorno(albero.path, albero.biography, momento.day_number), regali) : null;
  const titolo = dati.recap && !dati.inCorso ? dati.recap.titolo : `Il mese ${n}`;
  const primaPagina = dati.pagine[0];
  const ultimaPagina = dati.pagine[dati.pagine.length - 1];

  return (
    <>
      <Intestazione>
        <Link href="/giardino#extra" className="pillola">
          <span aria-hidden>←</span> Torna al giardino
        </Link>
      </Intestazione>
      <main id="contenuto" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 sm:px-8">
        <header className="max-w-3xl pt-6">
          <p className="occhiello">
            Il riepilogo del mese · {albero.name}
            {dati.inCorso && <span className="text-rosso"> · in corso</span>}
          </p>
          <h1 className="font-titolo mt-3 text-[2.4rem] leading-[1.04] sm:text-6xl">
            Mese {n}: <span className="pennellata">{titolo.replace(/^Il mese \d+$/, "il diario")}</span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-matita">
            {primaPagina && ultimaPagina
              ? `Dal giorno ${primaPagina.day_number} al giorno ${ultimaPagina.day_number}, dal ${data(primaPagina.lived_on)} al ${data(ultimaPagina.lived_on)}, a ${albero.city}.`
              : "Questo mese è appena cominciato: le prime pagine arrivano con i primi giorni."}
            {dati.inCorso && dati.pagine.length > 0 && " Il mese non è ancora finito: il riepilogo vero arriva alla sua fine."}
          </p>
        </header>

        {!premium ? (
          <InvitoPremium nome={albero.name} dati={dati} scena={scena} />
        ) : dati.pagine.length === 0 ? null : (
          <>
            {momento && scena && (
              <section aria-labelledby="titolo-momento" className="mese-momento mt-12">
                <figure className="polaroid mese-polaroid affiora">
                  <Scena
                    meteo={scena.meteo}
                    posa={scena.posa}
                    stadio={scena.stadio}
                    stagione={scena.stagione}
                    giorni={scena.giorni}
                    className="block aspect-[4/3] w-full"
                    etichetta={dati.recap?.didascalia ?? `${albero.name} ${azione(momento.action).etichetta}`}
                    interattivo={false}
                  />
                  <figcaption className="pt-3 pb-1">
                    <p className="font-mano text-[1.5rem] leading-tight">{dati.recap?.didascalia}</p>
                    <p className="mt-1 text-sm text-matita">
                      Giorno {momento.day_number} · {data(momento.lived_on)}
                      {scena.meteo.descrizione && ` · ${scena.meteo.descrizione}`}
                    </p>
                  </figcaption>
                </figure>
                <div>
                  <p className="occhiello text-corteccia">Il momento più bello</p>
                  <h2 id="titolo-momento" className="font-titolo mt-2 text-3xl leading-tight sm:text-4xl">
                    Il giorno {momento.day_number}
                  </h2>
                  <blockquote className="mese-pagina carta-righe font-mano mt-5">{momento.body}</blockquote>
                  <p className="mt-3 text-sm text-matita">Dal suo diario, giorno {momento.day_number}.</p>
                </div>
              </section>
            )}

            <section aria-labelledby="titolo-numeri" className="mt-16">
              <h2 id="titolo-numeri" className="font-titolo mb-6 text-3xl sm:text-4xl">
                I numeri del mese
              </h2>
              <div className="mese-numeri">
                <div className="mese-numero pagina">
                  <p className="occhiello">Giorni vissuti</p>
                  <p className="mese-cifra">{dati.pagine.length}</p>
                  <p className="text-matita">
                    {dati.pagine.filter((p) => p.milestone).length > 0
                      ? `${dati.pagine.filter((p) => p.milestone).length} da ricordare, segnati con la stella`
                      : "tutti con una pagina di diario"}
                  </p>
                </div>
                <div className="mese-numero pagina">
                  <p className="occhiello">Le azioni più frequenti</p>
                  <ol className="mese-azioni">
                    {dati.azioni.map((a) => (
                      <li key={a.id}>
                        <Albero
                          posa={azione(a.id).posa}
                          stadio={scena?.stadio}
                          stagione={scena?.stagione}
                          giorni={scena?.giorni}
                          className="h-14 w-12 shrink-0"
                          titolo=""
                        />
                        <span className="leading-snug">
                          {a.etichetta}
                          <span className="block text-sm text-matita">{a.volte === 1 ? "una volta" : `${a.volte} volte`}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="mese-numero pagina">
                  <p className="occhiello">Il meteo vissuto</p>
                  <ul className="mese-meteo">
                    {dati.meteo.map((m) => (
                      <li key={m.cielo}>
                        <span aria-hidden className="mese-meteo-simbolo">
                          {CIELI[m.cielo].simbolo}
                        </span>
                        <span>
                          {m.giorni} {m.giorni === 1 ? "giorno" : "giorni"} di {CIELI[m.cielo].nome}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {dati.minima !== null && dati.massima !== null && (
                    <p className="mt-2 text-matita">
                      Tra {dati.minima}° e {dati.massima}°, a {albero.city}.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {dati.recap && (
              <section aria-labelledby="titolo-frase" className="mt-16">
                <h2 id="titolo-frase" className="font-titolo mb-6 text-3xl sm:text-4xl">
                  La frase migliore del diario
                </h2>
                <figure className="mese-frase pagina nastro">
                  <blockquote className="font-mano">«{dati.recap.frase}»</blockquote>
                  <figcaption className="mt-3 text-matita">
                    {albero.name}, giorno {dati.recap.giornoFrase}
                  </figcaption>
                </figure>
              </section>
            )}

            <section id="cartolina" aria-labelledby="titolo-cartolina" className="mt-16 scroll-mt-6">
              <h2 id="titolo-cartolina" className="font-titolo mb-2 text-3xl sm:text-4xl">
                La cartolina del mese
              </h2>
              <p className="mb-6 max-w-2xl text-lg text-matita">
                Il momento più bello, da mettere nelle storie o come sfondo del telefono. Si scarica in PNG.
              </p>
              {dati.inCorso ? (
                <p className="text-matita">La cartolina arriva quando il mese finisce.</p>
              ) : (
                <div className="mese-cartoline">
                  {(
                    [
                      { formato: "storia", nome: "Storia", misura: "1080 × 1920" },
                      { formato: "sfondo", nome: "Sfondo del telefono", misura: "1170 × 2532" },
                    ] as const
                  ).map((c) => (
                    <figure key={c.formato} className="mese-cartolina">
                      {/* eslint-disable-next-line @next/next/no-img-element -- immagine generata al volo, non ottimizzabile */}
                      <img
                        src={`/giardino/mese/${n}/cartolina?formato=${c.formato}`}
                        alt={`La cartolina del mese ${n} di ${albero.name}, formato ${c.nome.toLowerCase()}`}
                        width={c.formato === "storia" ? 270 : 234}
                        height={c.formato === "storia" ? 480 : 506}
                        loading="lazy"
                      />
                      <figcaption className="mt-3">
                        <p className="font-titolo text-lg leading-tight">{c.nome}</p>
                        <p className="text-sm text-matita">{c.misura} pixel</p>
                        <a href={`/giardino/mese/${n}/cartolina?formato=${c.formato}&scarica=1`} download className="timbro timbro-piccolo mt-3">
                          Scarica
                        </a>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {dati.mesi.length > 1 && (
          <nav aria-label="Gli altri mesi" className="mt-16">
            <p className="occhiello mb-2">Gli altri mesi</p>
            <div className="gettoni">
              {dati.mesi.map((m) => (
                <Link
                  key={m.number}
                  href={`/giardino/mese/${m.number}`}
                  aria-current={m.number === n ? "true" : undefined}
                  className="gettone min-h-9 px-3 text-[0.9rem]"
                >
                  Mese {m.number}
                  {!m.closed_at && " · in corso"}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </main>
    </>
  );
}

/** Chi ha l'Albero: il momento del mese si intravede, il resto è un invito garbato. */
function InvitoPremium({
  nome,
  dati,
  scena,
}: {
  nome: string;
  dati: DatiMese;
  scena: ReturnType<typeof scenaDelGiorno> | null;
}) {
  return (
    <section aria-labelledby="titolo-invito" className="mese-momento mt-12">
      {scena && dati.momento ? (
        <figure className="polaroid mese-polaroid">
          <Scena
            meteo={scena.meteo}
            posa={scena.posa}
            stadio={scena.stadio}
            stagione={scena.stagione}
            giorni={scena.giorni}
            className="block aspect-[4/3] w-full"
            etichetta={`${nome} ${azione(dati.momento.action).etichetta}`}
            interattivo={false}
          />
          <figcaption className="pt-3 pb-1 text-sm text-matita">Giorno {dati.momento.day_number}: un momento del mese</figcaption>
        </figure>
      ) : (
        <div />
      )}
      <div className="extra-invito pagina nastro">
        <p className="occhiello">Un extra del Premium</p>
        <h2 id="titolo-invito" className="font-titolo mt-2 text-3xl leading-tight">
          Il riepilogo illustrato di {nome}
        </h2>
        <p className="mt-3 text-lg leading-snug">
          Con il Premium, a fine mese {nome} sfoglia il diario e sceglie il momento più bello: lo trovi disegnato, con i
          numeri del mese, la frase migliore e la cartolina da scaricare.
        </p>
        <p className="mt-3 text-matita">Il diario completo resta sempre tuo, anche con l&apos;Albero.</p>
        <div className="mt-5">
          <PassaAlPremium etichetta="Prova il Premium" />
        </div>
      </div>
    </section>
  );
}
