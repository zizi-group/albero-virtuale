import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Albero } from "@/components/albero/Albero";
import { Ambiente } from "@/components/ambiente/Ambiente";
import { oraDelGiorno, type Ora } from "@/components/ambiente/atmosfera";
import { Cassetta, Taccuino } from "@/components/ambiente/Oggetti";
import { Intestazione } from "@/components/Intestazione";
import { azione } from "@/lib/albero/azioni";
import { vestiConRegali } from "@/lib/albero/regali";
import { FRASI_ROUTINE, risolviScena } from "@/lib/albero/scena";
import { classifica, INFO_STRADE, isStrada, NOMI_TRATTI, TRATTI, type PunteggiStrade, type Tratti } from "@/lib/albero/strade";
import { stadioDa, stagioneDa, type Cielo, type Meteo } from "@/lib/albero/tipi";
import { meteoAttuale, meteoDiProva, oggiNelFuso } from "@/lib/meteo";
import type { RecapMese } from "@/lib/motore/extra";
import { createClient, getUtente } from "@/lib/supabase/server";
import { Conversazione } from "./Conversazione";
import { ExtraDelMese } from "./Extra";
import { Strumenti } from "./Strumenti";

export const metadata: Metadata = { title: "Il giardino — Linfa" };

const SIMBOLI: Record<Cielo, string> = {
  sole: "☀",
  nuvole: "☁",
  pioggia: "☂",
  temporale: "⚡",
  neve: "❄",
  nebbia: "≋",
};

const TIPI_LETTERA: Record<string, string> = {
  benvenuto: "Benvenuto",
  mensile: "Lettera del mese",
  momento: "Un momento importante",
  regalo: "Grazie per il regalo",
};

const NOMI_STADIO = { piantina: "Piantina", alberello: "Alberello", albero: "Albero" } as const;

const data = (d: string) =>
  new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

export default async function Giardino({ searchParams }: PageProps<"/giardino">) {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const supabase = await createClient();
  const { data: albero } = await supabase.from("trees").select("*").eq("owner_id", utente.id).maybeSingle();
  if (!albero) redirect("/pianta");

  const parametri = await searchParams;
  const sceltaMeteo = typeof parametri.meteo === "string" ? parametri.meteo : undefined;
  const nuovo = parametri.nuovo === "1";

  const [diario, lettere, messaggi, meteoVero, mesi, regali] = await Promise.all([
    supabase.from("diary_entries").select("*").eq("tree_id", albero.id).order("day_number", { ascending: false }).limit(12),
    supabase.from("letters").select("id, kind, subject, created_at, read_at, day_number").eq("tree_id", albero.id).order("created_at", { ascending: false }),
    supabase.from("messages").select("id, author, body").eq("tree_id", albero.id).order("created_at", { ascending: true }).limit(40),
    meteoDiProva(sceltaMeteo) ? Promise.resolve(null) : meteoAttuale(albero.latitude, albero.longitude),
    supabase.from("tree_months").select("number, first_day, closed_at, recap").eq("tree_id", albero.id).order("number", { ascending: false }),
    supabase.from("gifts").select("gift, use, how, month_number, letter_id, included").eq("tree_id", albero.id).order("created_at", { ascending: true }),
  ]);
  const elencoMesi = mesi.data ?? [];
  const meseCorrente = elencoMesi[0] ?? { number: 1, first_day: 0, closed_at: null, recap: null };
  const ultimoChiuso = elencoMesi.find((m) => m.closed_at);
  const doni = regali.data ?? [];
  const regaloDelMese = doni.find((g) => g.included && g.month_number === meseCorrente.number) ?? null;

  const prova = meteoDiProva(sceltaMeteo);
  const meteo: Meteo = prova ??
    meteoVero ??
    (albero.last_weather as Meteo | null) ?? { cielo: "nuvole", temperatura: 15, giorno: true, descrizione: "cielo nuvoloso" };
  const scena = risolviScena(meteo, albero.today_action, albero.path);
  // I regali che ha deciso di usare compaiono nella scena, se li sa già disegnare.
  const posa = vestiConRegali(scena.posa, doni, meteo);
  const stadio = stadioDa(albero.day_count);
  const stagione = stagioneDa(new Date(`${oggiNelFuso(albero.timezone)}T12:00:00`));
  const strada = isStrada(albero.path) ? albero.path : null;
  const tratti = albero.traits as Tratti;
  const [[primaStrada, primoPunteggio]] = classifica((albero.path_scores ?? {}) as PunteggiStrade);
  const didascalia =
    scena.routine && scena.azione.id !== azione(albero.today_action).id
      ? FRASI_ROUTINE[scena.routine].replace(/^([^:]+):/, `$1: ${albero.name}`)
      : (albero.today_caption ?? `${albero.name} ${scena.azione.etichetta}.`);
  const elencoLettere = lettere.data ?? [];
  const nonLette = elencoLettere.filter((l) => !l.read_at).length;
  const pagine = diario.data ?? [];

  // L'ora vera della città: alba, giorno, tramonto o notte. Col meteo di prova si resta sul giorno o sulla notte.
  const adesso = new Date();
  const oraLocale = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: albero.timezone }).format(adesso));
  const orario = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: albero.timezone }).format(adesso);
  const ora: Ora = prova ? (meteo.giorno ? "giorno" : "notte") : oraDelGiorno(meteo, oraLocale, stagione);

  return (
    <>
      <Intestazione sopra="assoluta">
        <Link href="/catalogo" className="pillola max-sm:hidden">
          Catalogo delle azioni
        </Link>
        <form action="/auth/esci" method="post">
          <button className="pillola">Esci</button>
        </form>
      </Intestazione>

      <main id="contenuto" className="flex-1">
        <section className="giardino-scena bordo-strappato" aria-labelledby="nome-albero">
          <Ambiente
            meteo={meteo}
            ora={ora}
            stagione={stagione}
            className="h-full"
            chiaveAlbero={`${scena.azione.id}-${stadio}`}
            albero={
              <Albero
                posa={posa}
                giorni={albero.day_count}
                stadio={stadio}
                stagione={stagione}
                innevato={meteo.cielo === "neve"}
                titolo={`${albero.name} ${scena.azione.etichetta}`}
              />
            }
            palco={
              <>
                <Cassetta daLeggere={nonLette} totale={elencoLettere.length} />
                <Taccuino righe={pagine.length} />
              </>
            }
          >
            <div className="cartello-giardino pagina compare">
              <p className="occhiello text-[0.68rem]">Il giardino di</p>
              <h1 id="nome-albero" className="font-titolo text-[2.1rem] leading-none sm:text-5xl">
                {albero.name}
              </h1>
              <p className="mt-2 flex flex-wrap gap-1.5 text-[0.85rem]">
                <span className="etichetta-chip">Giorno {albero.day_count}</span>
                <span className="etichetta-chip">{NOMI_STADIO[stadio]}</span>
                {strada && <span className="etichetta-chip">{INFO_STRADE[strada].nome}</span>}
              </p>
            </div>

            <p className="timbro-luogo timbro-meteo" key={`${meteo.cielo}-${ora}`}>
              <span>
                <span className="block">{albero.city}</span>
                <b>{orario}</b>
                <span className="block">
                  <span aria-hidden>{SIMBOLI[meteo.cielo]}</span> {meteo.temperatura}°
                </span>
              </span>
              <span className="sr-only">
                A {albero.city} sono le {orario}: {meteo.descrizione}.
              </span>
            </p>

            {nuovo && (
              <div className="nota-nuovo pagina nastro" role="status">
                <p className="font-titolo text-xl leading-tight">{albero.name} è spuntato.</p>
                <p className="mt-1 leading-snug">Ti ha già scritto la prima lettera: è nella cassetta, e anche nella tua email.</p>
                <Link href="/giardino" scroll={false} className="etichetta-mano mt-1 inline-block underline decoration-linfa decoration-2 underline-offset-4">
                  Ho capito
                </Link>
              </div>
            )}

            <div className="giardino-piede">
              <p className="didascalia-scena" aria-live="polite">
                {didascalia}
              </p>
              <nav className="segnalibri" aria-label="Nel giardino">
                <a href="#lettere">
                  Lettere{nonLette > 0 && <span className="segnalibro-numero">{nonLette}</span>}
                </a>
                <a href="#extra">Il mese</a>
                <a href="#diario">Diario</a>
                <a href="#scrivigli">Scrivigli</a>
              </nav>
            </div>
          </Ambiente>
        </section>

        <Strumenti nome={albero.name} meteoScelto={sceltaMeteo} piano={albero.plan} />

        <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-8">
          {/* La scheda del personaggio */}
          <section id="scheda" aria-labelledby="titolo-scheda" className="scheda-albero pagina affiora">
            <div className="scheda-ritratto" aria-hidden={!strada}>
              {strada ? (
                <Albero
                  className="h-full w-full"
                  posa={{ ...azione("guardare-cielo").posa, occhi: "felici", indossa: [INFO_STRADE[strada].accessorio] }}
                  giorni={albero.day_count}
                  stadio={stadio}
                  stagione={stagione}
                  titolo={`${albero.name}, ${INFO_STRADE[strada].nome.toLowerCase()}`}
                  interattivo={false}
                />
              ) : (
                <span className="scheda-mistero">?</span>
              )}
            </div>
            <div>
              <p className="occhiello">Chi sta diventando?</p>
              {strada ? (
                <>
                  <h2 id="titolo-scheda" className="font-titolo mt-1 text-3xl leading-tight">
                    {INFO_STRADE[strada].nome}
                  </h2>
                  <p className="mt-1 text-lg text-matita">{INFO_STRADE[strada].descrizione}</p>
                </>
              ) : (
                <>
                  <h2 id="titolo-scheda" className="font-titolo mt-1 text-3xl leading-tight">
                    Ancora non si sa.
                  </h2>
                  <p className="mt-1 text-lg">
                    {primoPunteggio >= 6 ? (
                      <>
                        Ultimamente <span className="font-mano text-xl text-corteccia">{INFO_STRADE[primaStrada].indizio}</span>.
                      </>
                    ) : (
                      <span className="text-matita">È troppo presto per dirlo: lascialo vivere qualche giorno.</span>
                    )}
                  </p>
                </>
              )}
              <p className="mt-2 text-sm text-matita">
                Piantato a {albero.city}
                {albero.owner_name ? ` da ${albero.owner_name}` : ""} · giorno {albero.day_count} · umore: {albero.mood}
              </p>
            </div>
            <dl className="tratti">
              {TRATTI.map((t) => (
                <div key={t}>
                  <dt>{NOMI_TRATTI[t]}</dt>
                  <dd>
                    <span className="tratto-barra" style={{ width: `${tratti[t]}%` }} />
                    <span className="sr-only">{tratti[t]} su 100</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <ExtraDelMese
            nome={albero.name}
            piano={albero.plan}
            mese={meseCorrente}
            regaloDelMese={regaloDelMese}
            ultimoChiuso={ultimoChiuso ? { number: ultimoChiuso.number, recap: ultimoChiuso.recap as RecapMese | null } : null}
          />

          <div className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-8">
            {/* Le lettere */}
            <section id="lettere" aria-labelledby="titolo-lettere" className="scroll-mt-6">
              <h2 id="titolo-lettere" className="font-titolo mb-5 flex items-baseline gap-3 text-3xl">
                Le lettere
                {nonLette > 0 && <span className="etichetta-mano text-rosso">{nonLette} da aprire</span>}
              </h2>
              <ul className="space-y-4">
                {elencoLettere.map((l, i) => (
                  <li key={l.id} className="affiora" style={{ rotate: `${[-0.8, 0.6, -0.3, 0.9][i % 4]}deg` }}>
                    <Link href={`/giardino/lettere/${l.id}`} className="busta-lista" data-da-leggere={!l.read_at ? "1" : undefined}>
                      <span className="busta-lista-francobollo" aria-hidden>
                        <span>g. {l.day_number}</span>
                      </span>
                      <span className="occhiello block pr-12 text-[0.66rem] text-corteccia">
                        {TIPI_LETTERA[l.kind] ?? "Lettera"} · giorno {l.day_number}
                        {!l.read_at && <span className="text-rosso"> · da aprire</span>}
                      </span>
                      <span className="mt-1 block pr-12 font-mano text-[1.35rem] leading-tight text-[#2c3348]">{l.subject}</span>
                      <span className="busta-lista-sigillo" aria-hidden />
                    </Link>
                  </li>
                ))}
                {elencoLettere.length === 0 && <li className="text-matita">La cassetta è vuota, per ora.</li>}
              </ul>
            </section>

            {/* Il diario */}
            <section id="diario" aria-labelledby="titolo-diario" className="scroll-mt-6">
              <h2 id="titolo-diario" className="font-titolo mb-5 text-3xl">
                Il diario
              </h2>
              <div className="taccuino affiora">
                {pagine.length === 0 ? (
                  <p className="text-matita">Le prime pagine arrivano con i primi giorni.</p>
                ) : (
                  <ol>
                    {pagine.map((p) => {
                      const m = p.weather as { cielo?: Cielo } | null;
                      return (
                        <li key={p.id} data-traguardo={p.milestone ? "1" : undefined}>
                          <p className="taccuino-data">
                            <span aria-hidden>{p.milestone ? "★" : m?.cielo ? SIMBOLI[m.cielo] : "·"}</span> Giorno {p.day_number} ·{" "}
                            {data(p.lived_on)}
                            {p.milestone && <span className="sr-only"> (un giorno importante)</span>}
                          </p>
                          <p className="taccuino-testo">{p.body}</p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </section>

            {/* I biglietti */}
            <section id="scrivigli" aria-labelledby="titolo-scrivigli" className="scroll-mt-6">
              <h2 id="titolo-scrivigli" className="font-titolo mb-5 text-3xl">
                Scrivigli
              </h2>
              <Conversazione
                nome={albero.name}
                messaggi={(messaggi.data ?? []).map((m) => ({ id: m.id, autore: m.author as "persona" | "albero", testo: m.body }))}
              />
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
