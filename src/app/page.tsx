import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Albero } from "@/components/albero/Albero";
import { Intestazione, Logo } from "@/components/Intestazione";
import { BustinaPremium } from "@/components/landing/BustinaPremium";
import { FinestraPiano, PIANI, Prezzo } from "@/components/landing/Pacchetti";
import { Tessera } from "@/components/landing/Tessera";
import { ProvaIlMeteo, ProvaLeStrade, Viaggio } from "@/components/landing/Viaggio";
import { azione } from "@/lib/albero/azioni";

const STORIA = [
  {
    id: "gennaio",
    mese: "Gennaio",
    testo: "Giulia pianta Ottavio. È un alberello timido, che passa le giornate a guardare il cielo.",
  },
  {
    id: "marzo",
    mese: "Marzo",
    testo: "Inizia a leggere i giornali finanziari sotto la pioggia, con l'ombrello. Nessuno sa perché.",
  },
  {
    id: "giugno",
    mese: "Giugno",
    testo: "Le scrive di aver aperto un'attività: ombra a pagamento per le formiche.",
  },
  {
    id: "luglio",
    mese: "Luglio",
    testo: "Giulia gli risponde di non fare il furbo. Lui le dà ragione, ma solo a metà.",
  },
];

const PRESTO = [
  {
    titolo: "I regali all'albero",
    testo: "Un cappello, una bici, un libro. Lui decide se usarli, e te lo racconta in una lettera. Col Premium, uno al mese è incluso.",
  },
  {
    titolo: "I boschi condivisi",
    testo: "Amici e famiglie piantano insieme, e gli alberi si conoscono tra loro.",
  },
  {
    titolo: "Le classifiche per strada",
    testo: "Una per ogni strada: ghiande per l'imprenditore, chilometri per lo sportivo, sonnellini per il poeta pigro. Ognuno può essere primo in qualcosa.",
  },
];

function Capitolo({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  return (
    <section data-capitolo={id} aria-labelledby={`titolo-${id}`} className={`capitolo ${className}`}>
      {children}
    </section>
  );
}

function Scheda({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div data-scheda className={`scheda-capitolo pagina nastro ${className}`}>
      {children}
    </div>
  );
}

function Freccia() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" aria-hidden>
      <path d="M9 2 C8 8 10 13 9 19 M3 13 L9 20 L15 13" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <Intestazione sopra="fissa">
        <Link href="/catalogo" className="pillola max-sm:hidden">
          Le sue abitudini
        </Link>
        <Link href="/giardino" className="pillola font-semibold">
          Entra nel giardino
        </Link>
      </Intestazione>

      <main id="contenuto" className="flex-1">
        <Viaggio>
          {/* L'alba: il seme */}
          <Capitolo id="eroe" className="capitolo-eroe">
            <div className="lg:max-w-[36rem]">
              <p className="occhiello compare">Un albero digitale tutto tuo</p>
              <h1
                id="titolo-eroe"
                className="font-titolo compare mt-3 text-[clamp(2.2rem,9.4vw,3.2rem)] leading-[1.02] text-inchiostro sm:text-6xl lg:text-[clamp(3.4rem,8.6vh,5.1rem)]"
                style={{ animationDelay: "0.1s" }}
              >
                Compri un albero.
                <span className="block text-muschio">
                  Non sai chi <span className="pennellata">diventerà</span>.
                </span>
              </h1>
            </div>
            <div data-scheda className="scheda-eroe compare" style={{ animationDelay: "0.25s" }}>
              <p className="text-[1.05rem] leading-snug sm:text-xl sm:leading-relaxed">
                <span className="max-sm:hidden">Non è un videogioco e non c&apos;è un mondo da esplorare. </span>
                C&apos;è un solo albero, il tuo: ha un carattere, vive col meteo vero della tua città, ti scrive lettere e decide da solo che vita fare.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">
                <Link href="/pianta" className="timbro">
                  Pianta il tuo albero
                </Link>
                <a href="#regalo" className="timbro timbro-carta">
                  Regalane uno
                </a>
              </div>
              <p className="mt-3 text-sm text-matita">Da {PIANI.albero.pubblico} all&apos;anno, IVA inclusa. Nella demo non si paga.</p>
              <p className="scorri mt-5 text-muschio max-lg:hidden">
                Scorri: comincia la sua giornata <Freccia />
              </p>
            </div>
          </Capitolo>

          {/* Il giorno: il meteo vero */}
          <Capitolo id="meteo">
            <Scheda>
              <p className="occhiello">Il meteo vero</p>
              <h2 id="titolo-meteo" className="font-titolo mt-2 text-[1.9rem] leading-[1.08] sm:text-[2.6rem]">
                Se a Pescara piove, lo trovi fuori che si fa la doccia.
              </h2>
              <p className="mt-3 leading-snug sm:text-lg">
                Vive nella città che scegli tu, con il meteo vero, ora per ora. E ha le sue abitudini: col sole mette gli
                occhiali, col freddo cappello e sciarpa, di notte si infila il berretto e dorme come un sasso.
              </p>
            </Scheda>
            <ProvaIlMeteo />
          </Capitolo>

          {/* Le lettere */}
          <Capitolo id="lettere">
            <Scheda>
              <p className="occhiello">Le lettere</p>
              <h2 id="titolo-lettere" className="font-titolo mt-2 text-[1.9rem] leading-[1.08] sm:text-[2.6rem]">
                Una volta al mese ti scrive. Con la sua voce.
              </h2>
              <p className="mt-3 leading-snug sm:text-lg">
                Una lettera al mese, più una per ogni momento importante: arriva nella tua email e la ritrovi nel giardino. Puoi
                rispondergli. Legge i tuoi consigli, poi decide da solo, come è giusto che sia.
              </p>
              <blockquote className="carta-righe font-mano mt-5 rounded-sm px-4 pt-1 pb-2 text-[1.3rem] text-[#2c3348]">
                <p>
                  Cara Giulia, oggi è piovuto e ho fatto la doccia con la schiuma. Lo scoiattolo dice che esagero. Io dico che lui
                  non si lava mai.
                </p>
                <footer className="text-right text-corteccia">Ottavio</footer>
              </blockquote>
            </Scheda>
          </Capitolo>

          {/* Una vita in quattro cartoline */}
          {STORIA.map((s, i) => (
            <Capitolo key={s.id} id={s.id}>
              <Scheda className="cartolina">
                {i === 0 && (
                  <>
                    <p className="occhiello">Una vita, in quattro cartoline</p>
                    <h2 id={`titolo-${s.id}`} className="font-titolo mt-2 mb-4 text-[1.9rem] leading-[1.08] sm:text-[2.6rem]">
                      Giulia pianta Ottavio.
                    </h2>
                  </>
                )}
                <p className="font-mano text-[1.7rem] leading-none text-corteccia" id={i === 0 ? undefined : `titolo-${s.id}`}>
                  {s.mese}
                </p>
                <p className="mt-2 pr-16 text-lg leading-snug sm:text-xl">{s.testo}</p>
                <span className="cartolina-francobollo" aria-hidden>
                  <span>{s.mese.slice(0, 3)}</span>
                </span>
              </Scheda>
            </Capitolo>
          ))}

          {/* Il tramonto: chi diventerà */}
          <Capitolo id="strade">
            <Scheda>
              <p className="occhiello">Il cuore di Linfa</p>
              <h2 id="titolo-strade" className="font-titolo mt-2 text-[1.9rem] leading-[1.08] sm:text-[2.6rem]">
                È lui a decidere che vita fare.
              </h2>
              <p className="mt-3 leading-snug sm:text-lg">
                Tutti partono da un seme uguale. Poi ognuno prende la sua strada, in base al carattere e a quello che gli succede.
                Qualunque cosa diventi, resta simpatico: ironico e innocuo, anche quando fa il furbo.
              </p>
            </Scheda>
            <ProvaLeStrade />
          </Capitolo>

          {/* La sera: il diario */}
          <Capitolo id="diario">
            <Scheda>
              <p className="occhiello">Il diario</p>
              <h2 id="titolo-diario" className="font-titolo mt-2 text-[1.9rem] leading-[1.08] sm:text-[2.6rem]">
                Un anno di vita, da tenere in mano.
              </h2>
              <p className="mt-3 leading-snug sm:text-lg">
                Ogni giorno lascia una riga nel suo diario. A fine anno arriva tutto impaginato e illustrato, con i momenti
                importanti e le lettere: in PDF, oppure stampato col Premium. Un ricordo da conservare.
              </p>
              <div className="taccuino-mini mt-5" aria-hidden>
                <p>
                  <b>Giorno 41</b> Ho contato le formiche: 212. Domani ricomincio.
                </p>
                <p>
                  <b>Giorno 42</b> Pioggia. Doccia lunga. Lo scoiattolo non approva.
                </p>
                <p>
                  <b>Giorno 43</b> Ho deciso: da grande faccio ombra.
                </p>
              </div>
            </Scheda>
          </Capitolo>

          {/* La notte: il letargo */}
          <Capitolo id="letargo">
            <Scheda>
              <p className="occhiello">Nessun senso di colpa</p>
              <h2 id="titolo-letargo" className="font-titolo mt-2 text-[1.9rem] leading-[1.08] sm:text-[2.6rem]">
                Se lo dimentichi, non muore. Ti aspetta.
              </h2>
              <p className="mt-3 leading-snug sm:text-lg">
                Non va annaffiato né nutrito: vive comunque, anche quando hai altro da fare. E se un anno non rinnovi, va in
                letargo. Dorme, conserva il suo diario e si risveglia quando vuoi, da dove si era fermato.
              </p>
            </Scheda>
          </Capitolo>
        </Viaggio>

        {/* Il regalo */}
        <section id="regalo" className="relative scroll-mt-16 overflow-x-clip bg-carta">
          <div className="carta-strappata-su" aria-hidden />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-20 pb-16 sm:px-8 md:grid-cols-[0.9fr_1.1fr] md:pt-28">
            <div className="affiora relative mx-auto w-full max-w-sm">
              <svg viewBox="0 0 200 60" className="absolute -top-10 left-6 w-40" aria-hidden>
                <path d="M4,52 C40,10 90,4 120,30 C140,48 170,40 196,6" stroke="#b8322a" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
              <div className="cartellino">
                <p className="font-mano text-[2rem] leading-[1.05] text-inchiostro">Ho piantato un albero per te.</p>
                <p className="mt-3 font-mano text-xl text-corteccia">Per Marta, da Giulia</p>
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
              <p className="occhiello">Da regalare</p>
              <h2 className="font-titolo mt-3 text-4xl leading-[1.05] sm:text-5xl">Il regalo che cresce tutto l&apos;anno.</h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed sm:text-xl">
                Per una nascita, un compleanno, Natale. Col Premium annuale arriva a casa la tessera del fan club, ogni mese
                c&apos;è un regalo per l&apos;albero e una cartolina, e a fine anno il diario stampato: qualcosa da scartare adesso,
                e un anno intero da seguire.
              </p>
              <Link href="/pianta?pacchetto=premium-annuale" className="timbro timbro-linfa mt-7">
                Regala un Premium · {PIANI["premium-annuale"].pubblico}
              </Link>
            </div>
          </div>
        </section>

        {/* La tessera del fan club */}
        <section aria-labelledby="titolo-tessera" className="overflow-x-clip bg-carta">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.05fr_0.95fr]">
            <div className="affiora md:order-2">
              <p className="occhiello">Arriva a casa, a tutti</p>
              <h2 id="titolo-tessera" className="font-titolo mt-3 text-4xl leading-[1.05] sm:text-5xl">
                La tessera del fan club.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed sm:text-xl">
                Il nome del tuo albero, il tuo numero di socio e un QR che apre il suo giardino. Una cosa vera, da tenere nel
                portafoglio o da mettere sotto l&apos;albero di Natale.
              </p>
              <p className="mt-4 flex flex-wrap items-center gap-3 text-matita">
                <span className="timbro-presto">Primi 1000</span>
                Socio fondatore, per sempre. Col Premium arriva la tessera premium.
              </p>
            </div>
            <div className="tessere affiora" aria-hidden>
              <Tessera numero="0042" premium={false} />
              <Tessera numero="0007" premium />
            </div>
          </div>
        </section>

        {/* I piani */}
        <section id="prezzi" aria-labelledby="titolo-prezzi" className="scroll-mt-16 bg-carta">
          <div className="mx-auto w-full max-w-5xl px-5 pt-10 pb-20 sm:px-8">
            <div className="affiora max-w-2xl">
              <p className="occhiello">I piani</p>
              <h2 id="titolo-prezzi" className="font-titolo mt-3 text-4xl leading-[1.05] sm:text-5xl">
                Scegli come farlo crescere.
              </h2>
              <p className="mt-4 text-lg text-matita">
                Prezzi IVA inclusa. L&apos;Albero si paga una volta all&apos;anno; il Premium all&apos;anno o al mese.
              </p>
            </div>
            <div className="mt-14 grid items-start gap-x-8 gap-y-12 md:grid-cols-[0.9fr_1.1fr]">
              <article className="bustina affiora" aria-labelledby="piano-albero">
                <div className="bustina-carta" style={{ "--fondo": "#e7eed6" } as CSSProperties}>
                  <p className="occhiello flex justify-between text-[0.68rem]">
                    <span>Semi di Linfa</span>
                    <span>n. 1</span>
                  </p>
                  <h3 id="piano-albero" className="font-titolo mt-2 text-[1.75rem] leading-tight">
                    Albero
                  </h3>
                  <FinestraPiano />
                  <Prezzo piano={PIANI.albero} />
                  <ul className="mt-4 mb-6 flex-1">
                    {PIANI.albero.contenuto.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  <Link href="/pianta?pacchetto=albero" className="timbro">
                    Pianta il tuo albero
                  </Link>
                </div>
              </article>
              <div className="affiora">
                <BustinaPremium />
              </div>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              <p className="nota-piani">
                <strong className="font-titolo block text-lg font-normal">Aggiungi un albero</strong>
                Con lo sconto, in qualsiasi piano: per famiglie, coppie e amici.
              </p>
              <p className="nota-piani">
                <strong className="font-titolo block text-lg font-normal">Premium mensile</strong>
                Il diario stampato arriva a chi completa i 12 mesi, la tessera premium al terzo mese.
              </p>
              <p className="nota-piani">
                <span className="timbro-presto mb-1 border-muschio text-muschio">Demo</span>
                <span className="block">Nessun pagamento: il piano si sceglie quando pianti l&apos;albero, solo per provare il percorso.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Presto */}
        <section aria-labelledby="titolo-presto" className="bg-carta pb-24">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="affiora">
              <p className="occhiello">Presto, nel bosco</p>
              <h2 id="titolo-presto" className="font-titolo mt-3 text-4xl leading-[1.05] sm:text-5xl">
                Stanno per sbocciare.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {PRESTO.map((g, i) => (
                <article key={g.titolo} className="gemma affiora" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="flex items-start justify-between gap-3">
                    <svg viewBox="0 0 48 56" className="gemma-bocciolo h-14 w-12 shrink-0" aria-hidden>
                      <path d="M24 54 C24 44 24 36 25 28" stroke="#7a5236" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <path d="M25 38 C16 38 11 33 11 26 C18 26 25 30 25 38 Z" fill="#6f9a3c" />
                      <path
                        d="M25 30 C17 26 15 16 22 6 C24 3 27 3 29 6 C35 16 33 26 25 30 Z"
                        fill={["#f2a7b5", "#e0a526", "#9cc25a"][i]}
                        stroke="#23261d"
                        strokeWidth="2"
                      />
                      <path d="M25 29 C23 22 23 14 25 7" stroke="#23261d" strokeWidth="1.4" fill="none" opacity=".5" />
                    </svg>
                    <span className="timbro-presto">Presto</span>
                  </div>
                  <h3 className="font-titolo mt-4 text-2xl leading-tight">{g.titolo}</h3>
                  <p className="mt-2 leading-snug text-matita">{g.testo}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-2xl text-matita">
              Regola del bosco: i regali non comprano niente. Né la crescita, né la strada, né un posto in classifica.
            </p>
          </div>
        </section>
      </main>

      <footer className="suolo">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-24 w-full opacity-60" aria-hidden>
          <g stroke="#7a5236" strokeWidth="5" fill="none" strokeLinecap="round">
            <path d="M600,0 C590,30 560,50 520,70 C480,90 430,96 380,118" />
            <path d="M600,0 C612,34 650,52 700,62 C760,74 800,96 860,118" />
            <path d="M600,0 C600,40 604,80 598,120" />
            <path d="M520,70 C500,84 470,96 440,120" strokeWidth="3" />
            <path d="M700,62 C720,80 740,100 742,120" strokeWidth="3" />
          </g>
        </svg>
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-28 pb-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <Logo chiaro />
            <p className="mt-3 max-w-xs text-[#d9c8a8]">Sotto ogni albero c&apos;è una storia che sta ancora crescendo.</p>
          </div>
          <div className="flex flex-col gap-4 sm:items-end">
            <Link href="/pianta" className="timbro timbro-linfa">
              Pianta il tuo albero
            </Link>
            <p className="text-sm text-[#cdb995]">
              <Link href="/catalogo" className="underline-offset-4 hover:underline">
                Il catalogo delle azioni
              </Link>{" "}
              · Linfa, un progetto ZIZI Group · demo locale
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
