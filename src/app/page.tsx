import { Bricolage_Grotesque } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import { Albero } from "@/components/albero/Albero";
import { Intestazione, Logo } from "@/components/Intestazione";
import { SfogliaDiario } from "@/components/landing/Diario";
import { Doni } from "@/components/landing/Doni";
import { PIANI, Piani } from "@/components/landing/Pacchetti";
import { Tessera } from "@/components/landing/Tessera";
import { ProvaIlMeteo, ProvaLeStrade, Viaggio } from "@/components/landing/Viaggio";
import { Effetti, Parole } from "@/components/landing/Effetti";
import { CheCosaRicevi, ComeFunziona, DiarioEsempio } from "@/components/landing/Funzioni";
import { InterruttoreMovimento } from "@/components/Movimento";
import { azione } from "@/lib/albero/azioni";
import "./landing.css";

// Il sans della pagina iniziale: solo qui, il resto del sito resta com'è.
const sans = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-lp",
  axes: ["opsz", "wdth"],
  display: "swap",
});

const NUMERI = [
  { cifra: "12", testo: "lettere all'anno via email, una ogni 30 giorni" },
  { cifra: "365", testo: "pagine di diario, una al giorno" },
  { cifra: "23", testo: "azioni possibili, scelte in base a meteo e carattere" },
  { cifra: "7", testo: "strade possibili: ne prende una" },
];

const PUNTI = ["Meteo reale della sua città", "Lettera via email ogni 30 giorni", "Una pagina di diario al giorno", "Diario dell'anno: PDF o libro stampato", "Tessera del fan club a casa"];

const PRESTO = [
  {
    titolo: "I boschi condivisi",
    testo: "Amici e famiglie piantano insieme, e gli alberi si conoscono tra loro.",
  },
  {
    titolo: "Il bosco dei veterani",
    testo: "Dopo il primo anno, se vuoi, il tuo albero entra nel bosco della pagina iniziale.",
  },
  {
    titolo: "Le classifiche per strada",
    testo: "Ghiande per l'imprenditore, chilometri per lo sportivo, pisolini per il poeta. Ognuno è primo in qualcosa.",
  },
];

function Capitolo({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  return (
    <section data-capitolo={id} aria-labelledby={`titolo-${id}`} className={`capitolo ${className}`}>
      {children}
    </section>
  );
}

/** Il pannello di un capitolo: occhiello, titolo, al massimo due righe. */
function Pannello({
  id,
  occhiello,
  titolo,
  lungo = false,
  children,
}: {
  id: string;
  occhiello: ReactNode;
  titolo: string;
  lungo?: boolean;
  children?: ReactNode;
}) {
  return (
    <div data-scheda className="lp-pannello">
      <p className="lp-occhiello">{occhiello}</p>
      <h2 id={`titolo-${id}`} className="lp-h2 mt-2">
        <Parole testo={titolo} />
      </h2>
      {children}
      {lungo && (
        <div className="lp-avanzamento" aria-hidden>
          <span />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className={`lp ${sans.variable} flex flex-1 flex-col`}>
      <Intestazione sopra="fissa" moderna>
        <a href="#come-funziona" className="lp-nav-pill max-md:hidden">
          Come funziona
        </a>
        <a href="#prezzi" className="lp-nav-pill max-sm:hidden">
          Piani
        </a>
        <Link href="/giardino" className="lp-nav-pill lp-nav-pill-scura">
          <span className="max-[359px]:hidden">Entra nel giardino</span>
          <span className="min-[360px]:hidden">Entra</span>
        </Link>
      </Intestazione>

      <main id="contenuto" className="flex-1">
        <Viaggio>
          {/* L'alba: il seme */}
          <Capitolo id="eroe" className="capitolo-eroe">
            <div className="lg:max-w-[40rem]">
              <p className="lp-occhiello lp-eroe-occhiello compare">Linfa · un albero digitale in abbonamento</p>
              <h1 id="titolo-eroe" className="lp-h1 mt-3">
                <Parole testo="Pianta un albero. Lui decide chi diventare." evidenza="Lui decide" subito />
              </h1>
            </div>
            <div data-scheda className="scheda-eroe">
              <p className="lp-testo">
                <span className="max-sm:hidden">
                  Scegli nome e città. Ogni giorno l&apos;albero fa una delle sue 23 azioni in base al meteo reale e al carattere, e
                  scrive una pagina di diario. Ogni 30 giorni ti scrive una lettera via email. All&apos;undicesimo mese ricevi il
                  diario dell&apos;anno.
                </span>
                <span className="sm:hidden">
                  Vive col meteo reale della tua città. Ogni giorno una pagina di diario, ogni 30 giorni una lettera via email.
                </span>
              </p>
              <ul className="lp-punti mt-3" aria-label="Che cosa include">
                {PUNTI.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2.5 max-[639px]:flex-nowrap sm:mt-5">
                <Link href="/pianta" className="lp-btn lp-btn-primario" data-magnete>
                  Pianta il tuo albero
                </Link>
                <a href="#come-funziona" className="lp-btn lp-btn-chiaro" data-magnete>
                  Come funziona
                </a>
              </div>
              <p className="lp-piccolo mt-3 text-white/70">
                Da {PIANI.albero.alMese} + IVA al mese, pagati una volta all&apos;anno. Nella demo non si paga.
              </p>
            </div>
            <a href="#titolo-meteo" className="lp-scorri" aria-label="Scorri per scoprire che cosa fa">
              <span className="lp-scorri-mouse" aria-hidden>
                <span />
              </span>
              <span>Scorri per scoprire</span>
            </a>
          </Capitolo>

          {/* Il meteo vero */}
          <Capitolo id="meteo" className="capitolo-lungo">
            <div className="capitolo-fisso">
              <Pannello id="meteo" occhiello="Meteo reale" titolo="Il meteo del giardino è quello della sua città." lungo>
                <p className="lp-testo mt-3">
                  Il giardino legge il meteo e l&apos;ora della città che scegli. Con la pioggia esce sotto l&apos;acqua, col freddo
                  mette cappello e sciarpa, di notte dorme. Scorri per vederlo.
                </p>
              </Pannello>
              <ProvaIlMeteo />
            </div>
          </Capitolo>

          {/* Le lettere: la busta si apre scorrendo, poi arrivano le risposte */}
          <Capitolo id="lettere" className="capitolo-lungo capitolo-destra">
            <div className="capitolo-fisso">
              <Pannello id="lettere" occhiello="Lettere via email" titolo="Una lettera ogni 30 giorni, nella tua email." lungo>
                <p className="lp-testo mt-3">
                  Più una in ogni momento importante, per esempio quando prende la sua strada. Le ritrovi nel giardino, e da lì puoi
                  rispondergli.
                </p>
              </Pannello>
              <div className="comandi-capitolo lp-busta-scena">
                <p className="lp-etichetta">Scorri per aprirla</p>
                <div className="lp-busta">
                  <div className="lp-busta-retro" aria-hidden />
                  <blockquote className="lp-lettera carta-righe font-mano">
                    <p>Cara Giulia, oggi è piovuto e ho fatto la doccia con la schiuma. Lo scoiattolo dice che esagero.</p>
                    <footer className="text-right text-corteccia">Ottavio</footer>
                  </blockquote>
                  <div className="lp-busta-fronte" aria-hidden />
                  <div className="lp-busta-lembo" aria-hidden />
                  <span className="lp-busta-sigillo" aria-hidden />
                </div>
                <div className="lp-risposte mt-3 flex flex-col gap-2" aria-label="Un esempio di risposta">
                  <p className="biglietto biglietto-persona text-[0.95rem] text-[var(--lp-ink)]">Ottavio, non fare il furbo con lo scoiattolo.</p>
                  <p className="biglietto biglietto-albero font-mano text-[1.1rem] leading-snug text-[var(--lp-ink)]">
                    Hai ragione. A metà. L&apos;altra metà ci penso.
                  </p>
                </div>
              </div>
            </div>
          </Capitolo>

          {/* Il diario, giorno per giorno */}
          <Capitolo id="diario">
            <Pannello id="diario" occhiello="Diario" titolo="Una pagina di diario al giorno.">
              <p className="lp-testo mt-3">Da una a tre frasi: che cosa ha fatto, che tempo faceva, che cosa ha pensato. Le leggi nel giardino.</p>
              <div className="taccuino-mini taccuino-grande mt-4 text-[var(--lp-ink)]" aria-label="Tre pagine di esempio del diario">
                <p>
                  <b>Giorno 12 · ☀</b> Ho deciso di fare ombra a tempo pieno.
                </p>
                <p>
                  <b>Giorno 13 · ☂</b> Doccia lunga. Lo scoiattolo non approva.
                </p>
                <p className="taccuino-traguardo">
                  <b>Giorno 30 · ★</b> Sono diventato un alberello. Festeggio con un pisolino.
                </p>
              </div>
            </Pannello>
          </Capitolo>

          {/* Ogni mese, col Premium */}
          <Capitolo id="premium" className="capitolo-destra">
            <Pannello
              id="premium"
              occhiello={
                <>
                  Solo Premium <span className="lp-chip ml-1 align-middle">Ogni mese</span>
                </>
              }
              titolo="Ogni mese, tre extra."
            >
              <Doni />
            </Pannello>
          </Capitolo>

          {/* Il tramonto: chi diventerà */}
          <Capitolo id="strade" className="capitolo-lungo">
            <div className="capitolo-fisso">
              <Pannello id="strade" occhiello="Carattere e strade" titolo="7 tratti di carattere. 7 strade possibili." lungo>
                <p className="lp-testo mt-3">
                  Nasce con 7 tratti casuali. Le sue giornate lo spingono verso una strada: quando una prevale, la prende e te lo
                  scrive.
                </p>
              </Pannello>
              <ProvaLeStrade />
            </div>
          </Capitolo>

          {/* La sera: il libro dell'anno */}
          <Capitolo id="libro" className="capitolo-lungo">
            <div className="capitolo-fisso">
            <Pannello id="libro" occhiello="Il diario dell'anno" titolo="All'undicesimo mese, il diario dell'anno." lungo>
              <p className="lp-testo mt-3">
                Pagine, lettere e la strada che ha preso. In PDF con l&apos;Albero, stampato e spedito a casa col Premium.
              </p>
            </Pannello>
            <SfogliaDiario />
            </div>
          </Capitolo>

          {/* La notte: il letargo */}
          <Capitolo id="letargo" className="capitolo-centro capitolo-gigante">
            <Pannello id="letargo" occhiello="Se non rinnovi" titolo="Va in letargo. Non muore.">
              <p className="lp-testo mt-3">Non va annaffiato né curato. Se non rinnovi dorme e conserva il diario; quando riattivi riparte da dove era.</p>
            </Pannello>
          </Capitolo>
        </Viaggio>

        {/* I numeri */}
        <section aria-label="Linfa in numeri" className="lp-sezione lp-scuro">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <dl className="lp-numeri">
              {NUMERI.map((n) => (
                <div key={n.testo} className="affiora">
                  <dt className="sr-only">{n.testo}</dt>
                  <dd>
                    <span className="lp-numero" data-conta={n.cifra}>
                      {n.cifra}
                    </span>
                    <span className="lp-testo mt-2 block max-w-[14rem]">{n.testo}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <ComeFunziona />
        <CheCosaRicevi />
        <DiarioEsempio />

        {/* Il regalo */}
        <section id="regalo" aria-labelledby="titolo-regalo" className="lp-sezione lp-ambra scroll-mt-16 overflow-x-clip">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 md:grid-cols-[0.9fr_1.1fr]">
            <div className="affiora relative mx-auto w-full max-w-sm">
              <div className="lp-cartellino">
                <p className="lp-h3 text-[1.9rem]">Ho piantato un albero per te.</p>
                <p className="lp-piccolo mt-2 font-semibold opacity-70">Per Marta, da Giulia</p>
                <Albero
                  posa={{ ...azione("guardare-cielo").posa, occhi: "felici", bocca: "grande", dx: { forma: "dritto", angolo: 58, anim: "saluta" } }}
                  stadio="piantina"
                  stagione="inverno"
                  className="absolute -right-6 -bottom-8 w-28"
                  titolo="Un alberello che saluta"
                />
              </div>
            </div>
            <div className="affiora">
              <p className="lp-occhiello">Da regalare</p>
              <h2 id="titolo-regalo" className="lp-h2 mt-3">
                <Parole testo="Regalalo per un anno." />
              </h2>
              <p className="lp-testo mt-4 max-w-xl">
                Scegli il Premium annuale: chi lo riceve ha la tessera del fan club a casa, tre extra al mese e, all&apos;undicesimo mese, il diario dell&apos;anno stampato.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link href="/pianta?pacchetto=premium-annuale" className="lp-btn lp-btn-scuro" data-magnete>
                  Regala un Premium annuale
                </Link>
                <p className="lp-piccolo font-semibold">
                  {PIANI["premium-annuale"].alMese} + IVA al mese, si paga una volta all&apos;anno
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Il fan club: la community dei soci */}
        <section id="fan-club" aria-labelledby="titolo-tessera" className="lp-sezione lp-scuro overflow-x-clip">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 md:grid-cols-[1.05fr_0.95fr]">
            <div className="affiora md:order-2">
              <p className="lp-occhiello">Il fan club</p>
              <h2 id="titolo-tessera" className="lp-h2 mt-3">
                <Parole testo="La tessera del fan club, a casa." />
              </h2>
              <p className="lp-testo mt-4 max-w-xl">
                Arriva a tutti gli abbonati: nome dell&apos;albero, numero di socio e un QR che apre il suo giardino. Con il Premium
                è la tessera premium; con il mensile arriva al terzo mese. Ogni socio entra nella community di Linfa.
              </p>
              <p className="lp-piccolo mt-4 flex flex-wrap items-center gap-2 text-white/75">
                <span className="lp-chip">Primi 1000</span> Sono soci fondatori: il titolo resta sulla tessera.
              </p>
            </div>
            <div className="tessere affiora" data-inclina aria-hidden>
              <Tessera numero="0042" premium={false} />
              <Tessera numero="0007" premium />
            </div>
          </div>
          <div className="mx-auto mt-14 w-full max-w-6xl px-5 sm:px-8">
            <p className="lp-etichetta">In arrivo per i soci</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {PRESTO.map((g, i) => (
                <article key={g.titolo} className="lp-gemma affiora">
                  <div className="flex items-start justify-between gap-3">
                    <svg viewBox="0 0 48 56" className="h-12 w-10 shrink-0" aria-hidden>
                      <path d="M24 54 C24 44 24 36 25 28" stroke="#c9a27a" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <path d="M25 38 C16 38 11 33 11 26 C18 26 25 30 25 38 Z" fill="#9ccf52" />
                      <path d="M25 30 C17 26 15 16 22 6 C24 3 27 3 29 6 C35 16 33 26 25 30 Z" fill={["#f2a7b5", "#f2b630", "#9ccf52"][i]} />
                    </svg>
                    <span className="lp-chip">Presto</span>
                  </div>
                  <h3 className="lp-h3 mt-4">{g.titolo}</h3>
                  <p className="lp-piccolo mt-2 text-white/70">{g.testo}</p>
                </article>
              ))}
            </div>
            <p className="lp-piccolo mt-6 max-w-2xl text-white/55">
              I regali non comprano niente: né la crescita, né la strada, né un posto in classifica.
            </p>
          </div>
        </section>

        {/* I piani */}
        <section id="prezzi" aria-labelledby="titolo-prezzi" className="lp-sezione lp-chiaro scroll-mt-16">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="affiora max-w-2xl">
              <p className="lp-occhiello">I piani</p>
              <h2 id="titolo-prezzi" className="lp-h2 mt-3">
                <Parole testo="Scegli il tuo piano." />
              </h2>
              <p className="lp-testo mt-4 text-black/65">
                Prezzi al mese, IVA esclusa. Gli annuali si pagano una volta all&apos;anno, il mensile ogni mese.
              </p>
            </div>
            <div className="mt-10 affiora">
              <Piani />
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <p className="lp-nota">
                <strong>Aggiungi un albero</strong>
                Con lo sconto, in qualsiasi piano: famiglie, coppie, amici.
              </p>
              <p className="lp-nota">
                <strong>Premium mensile</strong>
                Come il Premium annuale. Il libro arriva al dodicesimo mese, a chi completa l&apos;anno; tessera premium e adesivi al terzo mese.
              </p>
              <p className="lp-nota">
                <strong>Demo</strong>
                Nessun pagamento: il piano serve solo a provare il percorso.
              </p>
            </div>
          </div>
        </section>

      </main>

      <footer className="lp-piede">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-14 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <Logo chiaro moderno />
            <p className="lp-testo mt-3 max-w-xs">Pianta un albero. Il resto lo decide lui.</p>
          </div>
          <div className="flex flex-col gap-4 sm:items-end">
            <Link href="/pianta" className="lp-btn lp-btn-primario">
              Pianta il tuo albero
            </Link>
            <p className="lp-piccolo text-white/50">
              <Link href="/catalogo" className="underline-offset-4 hover:underline">
                Il catalogo delle azioni
              </Link>{" "}
              · Linfa, un progetto ZIZI Group · demo locale
            </p>
          </div>
        </div>
      </footer>
      <Effetti />
      <InterruttoreMovimento className="lp-interruttore" />
    </div>
  );
}
