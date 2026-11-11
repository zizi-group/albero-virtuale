import { Bricolage_Grotesque } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBook,
  IconBrain,
  IconBriefcase,
  IconBuildingStore,
  IconBulb,
  IconCamera,
  IconCertificate,
  IconCircles,
  IconCloudRain,
  IconCrown,
  IconFeather,
  IconFileText,
  IconFlag,
  IconHandGrab,
  IconHomeHeart,
  IconLeaf,
  IconLock,
  IconLockOpen,
  IconMail,
  IconMailHeart,
  IconMap2,
  IconMapPin,
  IconMessageCircle,
  IconMoodSmile,
  IconNotebook,
  IconPackage,
  IconPalette,
  IconPlant,
  IconPlus,
  IconRoute,
  IconRun,
  IconSeeding,
  IconShovel,
  IconSparkles,
  IconTree,
  IconTrees,
} from "@tabler/icons-react";
import { InterruttoreMovimento } from "@/components/Movimento";
import { Animazioni } from "@/components/vetrina/Animazioni";
import { Alberi, Bokeh, Cartello, Coriandoli, Freccia } from "@/components/vetrina/Pezzi";
import { PianiVetrina } from "@/components/vetrina/PianiVetrina";
import "./vetrina.css";

// Il sans della pagina iniziale: solo qui, il resto del sito resta com'è.
const sans = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-lp",
  axes: ["opsz", "wdth"],
  display: "swap",
});

const SETTE = ["v1", "v2", "v3", "v4", "v5", "v6", "v7"];

const PERSONALITA = [
  "💼 Imprenditore di successo",
  "🤔 Filosofo",
  "🎨 Artista",
  "🏃 Sportivo",
  "🧭 Viaggiatore",
  "🪶 Poeta pigro",
  "🎵 Musicista",
  "🔬 Scienziato",
  "🍳 Cuoco",
  "🔭 Astronomo",
  "🔍 Detective",
];

function Logo() {
  return (
    <Link className="logo" href="/" aria-label="Linfa, pagina iniziale">
      <svg viewBox="0 0 32 32" aria-hidden>
        <path d="M6 26C6 12 15 5 27 5c0 12-7 21-21 21z" fill="none" stroke="#9BE34A" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M6 26 20 12" stroke="#9BE34A" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      Linfa
    </Link>
  );
}

export default function Home() {
  return (
    <div className={`vetrina ${sans.variable} flex flex-1 flex-col`}>
      <Animazioni />

      <header className="testata">
        <div className="wrap">
          <Logo />
          <nav aria-label="Sezioni">
            <a href="#come">Cos&apos;è Linfa</a>
            <a href="#vero">L&apos;albero vero</a>
            <a href="#insieme">Insieme</a>
            <a href="#piani">Piani</a>
          </nav>
          <div className="destra">
            <Link className="entra" href="/giardino">
              Il mio giardino
            </Link>
            <Link className="cta" href="/pianta">
              Pianta il tuo albero
            </Link>
          </div>
        </div>
      </header>

      <main id="contenuto" className="flex-1">
        {/* Eroe: la foto con Linfa sul prato e la piantagione vera */}
        <section className="eroe" aria-labelledby="titolo-eroe">
          <div className="sfondo" aria-hidden />
          <div className="velo" aria-hidden />
          <div className="luce" aria-hidden />
          <div className="wrap eroe-testo">
            <h1 id="titolo-eroe" className="e">
              <span className="r">Pianta un albero</span>
              <br />
              <span className="r l">digitale.</span> <span className="r">Noi ne</span>
              <br />
              <span className="r">piantiamo uno</span>{" "}
              <span className="r l s">
                vero.
                <svg viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden>
                  <path d="M2 10C30 2 70 2 98 8" stroke="#9BE34A" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <ul className="vantaggi">
              <li className="e">
                <span className="tonda">
                  <IconMoodSmile className="ic" aria-hidden />
                </span>
                <span>
                  Ha un <b>carattere suo</b> e sceglie da solo <b>chi diventare</b>
                </span>
              </li>
              <li className="e">
                <span className="tonda">
                  <IconCloudRain className="ic" aria-hidden />
                </span>
                <span>
                  Vive con il <b>meteo reale</b> della tua città
                </span>
              </li>
              <li className="e">
                <span className="tonda">
                  <IconMail className="ic" aria-hidden />
                </span>
                <span>
                  Ti <b>scrive</b>: un diario ogni giorno, una lettera ogni mese
                </span>
              </li>
              <li className="e">
                <span className="tonda">
                  <IconMapPin className="ic" aria-hidden />
                </span>
                <span>
                  Per ognuno piantiamo un <b>albero vero in Italia</b>, e ti diciamo dove
                </span>
              </li>
            </ul>
            <div className="e">
              <Link className="cta grande" href="/pianta">
                <IconLeaf className="ic" aria-hidden />
                Pianta il tuo albero
                <IconArrowRight className="ic" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="personaggio e">
            <div className="ombra" aria-hidden />
            <Image src="/vetrina/linfa.webp" alt="Linfa, l'albero digitale, che sorride" width={560} height={637} priority />
            <div className="bolla" style={{ left: "-14%", top: "22%" }} aria-hidden>
              <IconBrain className="ic" />
            </div>
            <div className="bolla" style={{ left: "8%", top: "-6%", animationDelay: "-1s" }} aria-hidden>
              <IconPalette className="ic" />
            </div>
            <div className="bolla" style={{ right: "4%", top: "-8%", animationDelay: "-2s" }} aria-hidden>
              <IconBriefcase className="ic" />
            </div>
            <div className="bolla" style={{ right: "-20%", top: "16%", animationDelay: "-3s" }} aria-hidden>
              <IconFeather className="ic" />
            </div>
            <div className="bolla" style={{ right: "-26%", top: "46%", animationDelay: "-1.5s" }} aria-hidden>
              <IconMap2 className="ic" />
            </div>
          </div>
          <div className="badge-vero e">
            <IconMapPin className="ic" aria-hidden />
            <span>
              Piantato davvero
              <br />
              in Italia
            </span>
          </div>
        </section>

        {/* Cos'è Linfa: perché è speciale, in un percorso che scende */}
        <section className="foresta fbosco sez" id="come" aria-labelledby="titolo-come">
          <div className="raggi" aria-hidden />
          <div className="wrap">
            <div className="centro">
              <p className="occh e">
                <IconSparkles className="ic" aria-hidden />
                Cos&apos;è Linfa
              </p>
              <h2 id="titolo-come" className="e">
                <span className="r">Un albero che vive</span> <span className="r l">di vita propria.</span>
              </h2>
            </div>
            <div className="flusso">
              <div className="passo">
                <Alberi quali={["linfa"]} misura="uno" />
                <Cartello num="Tu" titolo="Pianti un albero digitale">
                  <p>Da quel momento ha una vita tutta sua, indipendente da te.</p>
                </Cartello>
              </div>
              <Freccia etichetta="e lui?" />
              <div className="passo">
                <Alberi quali={SETTE} misura="sette" />
                <Cartello num="Chi diventerà?" titolo="Non lo sai. Lo decide lui.">
                  <div className="sblocchi molti">
                    {PERSONALITA.map((p) => (
                      <span key={p}>{p}</span>
                    ))}
                    <span className="boss">🎩 Boss della banda del bosco</span>
                  </div>
                </Cartello>
              </div>
              <Freccia etichetta="e nel mondo vero" />
              <div className="passo">
                <div className="tondo foto" role="img" aria-label="Una piantina messa a dimora (immagine illustrativa)" />
                <Cartello num="Per ogni albero digitale" titolo="Piantiamo un albero vero in Italia">
                  <div className="gruppi">
                    <span>
                      <IconCertificate className="ic" aria-hidden />
                      certificato con il luogo
                    </span>
                    <span>
                      <IconCamera className="ic" aria-hidden />
                      una foto ogni anno
                    </span>
                  </div>
                </Cartello>
              </div>
              <Freccia etichetta="quando vuoi" />
              <div className="passo">
                <div className="tondo icone" aria-hidden>
                  <IconMessageCircle className="ic" />
                  <IconHandGrab className="ic" />
                  <IconBulb className="ic" />
                </div>
                <Cartello num="Su Linfa" titolo="Passi a trovarlo">
                  <div className="sblocchi">
                    <span>✍️ Gli scrivi</span>
                    <span>🖐️ Lo trascini in giro</span>
                    <span>💡 Gli dai consigli</span>
                  </div>
                  <p className="attenzione">
                    <IconAlertTriangle className="ic" aria-hidden />
                    <span>
                      Ma attenzione: vive per conto suo, grazie all&apos;<b>inalberatura artificiale</b> (anche detta AI).
                    </span>
                  </p>
                </Cartello>
              </div>
              <Freccia etichetta="ogni tanto" />
              <div className="passo">
                <div className="tondo busta" aria-hidden>
                  <IconMailHeart className="ic" />
                  <span className="notifica">1</span>
                </div>
                <Cartello num="Nella tua email" titolo="Ti scrive lettere">
                  <p>Come va la giornata, che cosa combina, chi sta diventando.</p>
                </Cartello>
              </div>
              <Freccia etichetta="a fine anno" />
              <div className="passo">
                <div className="tondo premio" aria-hidden>
                  <div className="raggiera" />
                  <Coriandoli />
                  <div className="libro-mini">
                    <IconLeaf className="ic" />
                    Il mio anno
                  </div>
                </div>
                <Cartello num="Il premio" titolo="Il diario del tuo albero">
                  <p>Che cosa ha fatto su Linfa, e chi è diventato grazie a te.</p>
                </Cartello>
              </div>
              <Freccia etichetta="e a casa" />
              <div className="passo">
                <div className="tondo pacco" aria-hidden>
                  <IconPackage className="ic" />
                </div>
                <Cartello num="Direttamente a casa" titolo="La tessera del club, e i gadget">
                  <div className="sblocchi">
                    <span>🪪 Tessera del club</span>
                    <span>🏷️ Adesivi</span>
                    <span>🌳 Miniatura del tuo albero, riciclata</span>
                    <span>👕 Maglietta con il tuo albero</span>
                    <span>🗺️ Certificato con la mappa</span>
                  </div>
                  <p className="nota-piani">Quali gadget, dipende dal piano.</p>
                </Cartello>
              </div>
            </div>
          </div>
        </section>

        {/* L'albero vero */}
        <section className="chiaro sez" id="vero" aria-labelledby="titolo-vero">
          <div className="wrap duo">
            <div className="e" style={{ position: "relative" }}>
              <div className="fotovera" role="img" aria-label="Mani che piantano una piantina (immagine illustrativa)">
                <span className="seg">IMMAGINE ILLUSTRATIVA · QUI LA FOTO VERA DEL PARTNER</span>
              </div>
              <div className="cert">
                <small>Certificato n. [numero]</small>
                <b>[specie]</b>
                <p>
                  [luogo] · [coordinate]
                  <br />
                  Piantato il [data] da [partner]
                </p>
              </div>
            </div>
            <div>
              <p className="occh e">
                <IconTree className="ic" aria-hidden />
                L&apos;albero vero
              </p>
              <h2 id="titolo-vero" className="e">
                <span className="r">Ogni anno,</span> <span className="r l">un albero vero</span> <span className="r">in Italia.</span>
              </h2>
              <ul className="elenco">
                <li className="e">
                  <IconShovel className="ic" aria-hidden />
                  <span>
                    Lo pianta <b>[partner]</b> a <b>[luogo]</b>, con una specie del posto.
                  </span>
                </li>
                <li className="e">
                  <IconCertificate className="ic" aria-hidden />
                  <span>
                    Ricevi il <b>certificato</b> con specie, data e coordinate.
                  </span>
                </li>
                <li className="e">
                  <IconCamera className="ic" aria-hidden />
                  <span>
                    Ogni anno una <b>foto</b> di com&apos;è cresciuto.
                  </span>
                </li>
                <li className="e">
                  <IconPlus className="ic" aria-hidden />
                  <span>
                    Ogni rinnovo, <b>un albero vero in più</b>.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Insieme: più alberi, più cose da fare */}
        <section className="foresta ftramonto sez" id="insieme" aria-labelledby="titolo-insieme">
          <div className="raggi" aria-hidden />
          <div className="wrap">
            <div className="centro">
              <p className="occh e">
                <IconTrees className="ic" aria-hidden />
                Insieme
              </p>
              <h2 id="titolo-insieme" className="e">
                <span className="r">Più alberi,</span> <span className="r l">più cose da fare.</span>
              </h2>
            </div>
            <div className="flusso">
              <div className="passo">
                <Alberi quali={["linfa"]} misura="uno" />
                <Cartello num="1 albero" titolo="Tutta la sua vita">
                  <div className="sblocchi">
                    <span>
                      <IconRun className="ic" aria-hidden />
                      80 azioni
                    </span>
                    <span>
                      <IconRoute className="ic" aria-hidden />
                      12 strade
                    </span>
                    <span>
                      <IconNotebook className="ic" aria-hidden />
                      diario ogni giorno
                    </span>
                    <span>
                      <IconMail className="ic" aria-hidden />
                      12 lettere
                    </span>
                  </div>
                </Cartello>
              </div>
              <Freccia etichetta="+ 2 alberi" />
              <div className="passo">
                <Alberi quali={["v2", "v4", "v5"]} misura="tre" />
                <Cartello num="3 alberi · Famiglia" titolo="Si conoscono, e fanno le cose insieme">
                  <div className="lucchetto">
                    <IconLock className="ic chiuso" aria-hidden />
                    <IconLockOpen className="ic aperto" aria-hidden />
                    si sbloccano 10 azioni di gruppo
                  </div>
                  <div className="sblocchi">
                    <span>🌙 Cena sotto la luna</span>
                    <span>📸 Foto di gruppo</span>
                    <span>☂️ Un ombrello in tre</span>
                    <span>🎂 Festa di compleanno</span>
                    <span>+ 6</span>
                  </div>
                  <div className="gruppi">
                    <span>
                      <IconHomeHeart className="ic" aria-hidden />
                      famiglia
                    </span>
                    <span>
                      <IconBuildingStore className="ic" aria-hidden />
                      impresa
                    </span>
                    <span>
                      <IconCrown className="ic" aria-hidden />
                      banda di Don Ghianda
                    </span>
                  </div>
                </Cartello>
              </div>
              <Freccia etichetta="+ 4 alberi" verso={-1} />
              <div className="passo">
                <Alberi quali={SETTE} misura="sette" />
                <Cartello num="7 alberi · Foresta" titolo="Una foresta con il suo nome">
                  <div className="lucchetto">
                    <IconLock className="ic chiuso" aria-hidden />
                    <IconLockOpen className="ic aperto" aria-hidden />
                    più 10 azioni di foresta
                  </div>
                  <div className="sblocchi">
                    <span>⚽ Squadra di calcio</span>
                    <span>🎭 Teatro del bosco</span>
                    <span>🏅 Olimpiadi del bosco</span>
                    <span>✨ Notte delle lucciole</span>
                    <span>+ 6</span>
                  </div>
                  <div className="gruppi">
                    <span>
                      <IconFlag className="ic" aria-hidden />
                      nome e insegna
                    </span>
                    <span>
                      <IconMailHeart className="ic" aria-hidden />
                      lettere della foresta
                    </span>
                  </div>
                </Cartello>
              </div>
              <Freccia etichetta="ogni anno che rinnovi" />
              <div className="passo">
                <Cartello num="E la foresta cresce" titolo="Ogni rinnovo, per ogni albero">
                  <div className="sblocchi grandi">
                    <span>
                      <IconPlant className="ic" aria-hidden />
                      un albero vero in più
                    </span>
                    <span>
                      <IconCircles className="ic" aria-hidden />
                      un anello di crescita
                    </span>
                    <span>
                      <IconSeeding className="ic" aria-hidden />
                      un seme per un nuovo albero
                    </span>
                  </div>
                </Cartello>
              </div>
            </div>
          </div>
        </section>

        {/* Il diario dell'anno */}
        <section className="chiaro sez" id="diario" aria-labelledby="titolo-diario">
          <div className="wrap">
            <p className="occh e">
              <IconBook className="ic" aria-hidden />
              Il diario dell&apos;anno
            </p>
            <h2 id="titolo-diario" className="e">
              <span className="r">Un anno di vita,</span> <span className="r l">da tenere.</span>
            </h2>
            <div className="fotodiario e" role="img" aria-label="Un diario aperto sul muschio, al tramonto (immagine illustrativa)">
              <p className="cap">
                All&apos;11° mese arriva il diario dell&apos;anno: le sue pagine, le lettere, le foto dell&apos;albero vero. Nell&apos;ultima
                pagina dice che cosa vuole fare l&apos;anno dopo.
              </p>
            </div>
            <div className="libri">
              <div className="vetro libretto pdf e">
                <div className="cop">
                  <IconFileText className="ic" aria-hidden />
                </div>
                <h3>PDF illustrato</h3>
                <p>Con l&apos;Albero. Tutte le pagine del diario e le lettere dell&apos;anno.</p>
              </div>
              <div className="vetro libretto e">
                <div className="cop">
                  <IconNotebook className="ic" aria-hidden />
                </div>
                <h3>Diario stampato</h3>
                <p>Con la Famiglia. Il PDF e la copia stampata, spedita a casa.</p>
              </div>
              <div className="vetro libretto foresta-libro top e">
                <div className="cop">
                  <IconBook className="ic" aria-hidden />
                </div>
                <h3>Libro della foresta</h3>
                <p>Con la Foresta. Rilegato, con le storie dei 7 alberi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Piani */}
        <section className="foresta fbosco sez" id="piani" aria-labelledby="titolo-piani">
          <div className="raggi" aria-hidden />
          <Bokeh seme={11} />
          <div className="wrap">
            <div className="centro">
              <p className="occh e">
                <IconLeaf className="ic" aria-hidden />I piani
              </p>
              <h2 id="titolo-piani" className="e">
                <span className="r">Scegli quanti alberi</span> <span className="r l">piantare.</span>
              </h2>
              <p className="lead e">
                Ogni albero fa le stesse cose in tutti i piani. Con più alberi si sbloccano le azioni di gruppo e arrivano più cose a casa.
              </p>
            </div>
            <PianiVetrina />
          </div>
        </section>

        {/* Finale */}
        <section className="foresta ftramonto finale" aria-labelledby="titolo-finale">
          <div className="raggi" aria-hidden />
          <Bokeh seme={23} />
          <div className="wrap">
            <h2 id="titolo-finale" className="e">
              <span className="r">Il tuo albero</span> <span className="r l">ti aspetta.</span>
            </h2>
            <p className="lead e" style={{ margin: "20px auto 0" }}>
              Due minuti per piantarlo. Domattina ti scrive.
            </p>
            <div className="e">
              <Link className="cta grande" href="/pianta">
                <IconLeaf className="ic" aria-hidden />
                Pianta il tuo albero
                <IconArrowRight className="ic" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="piede">
        <div className="wrap">
          <span>Linfa · ZIZI Group</span>
          <InterruttoreMovimento />
          <Link href="/catalogo">Il catalogo dei regali</Link>
        </div>
      </footer>
    </div>
  );
}
