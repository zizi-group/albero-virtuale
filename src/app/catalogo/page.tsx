import type { Metadata } from "next";
import Link from "next/link";
import { Albero } from "@/components/albero/Albero";
import { Scena } from "@/components/albero/Scena";
import { VetrinaMestiere } from "@/components/albero/VetrinaMestiere";
import { Intestazione } from "@/components/Intestazione";
import { AZIONI } from "@/lib/albero/azioni";
import { FRASI_ROUTINE, risolviScena } from "@/lib/albero/scena";
import { INFO_STRADE, STRADE } from "@/lib/albero/strade";
import { GIORNI_PER_CRESCERE, stadioDa } from "@/lib/albero/tipi";
import { meteoDiProva } from "@/lib/meteo";

export const metadata: Metadata = { title: "Catalogo delle azioni — Linfa" };

const ROUTINE = [
  { meteo: "sole", titolo: "Il sole" },
  { meteo: "pioggia", titolo: "La pioggia" },
  { meteo: "freddo", titolo: "Il freddo" },
  { meteo: "notte", titolo: "La notte" },
  { meteo: "neve", titolo: "La neve" },
] as const;

const COMPATIBILITA = {
  asciutto: { testo: "all'asciutto", simbolo: "☀" },
  pioggia: { testo: "con la pioggia", simbolo: "☂" },
  qualsiasi: { testo: "con ogni tempo", simbolo: "◎" },
  notte: { testo: "di notte", simbolo: "☾" },
};
/** Le tappe della crescita: da germoglio ad adulto in GIORNI_PER_CRESCERE giorni. */
const TAPPE = [0, 10, 30, 60, GIORNI_PER_CRESCERE];

export default function Catalogo() {
  return (
    <>
      <Intestazione>
        <Link href="/" className="pillola max-sm:hidden">
          Pagina iniziale
        </Link>
        <Link href="/giardino" className="pillola font-semibold">
          Il giardino
        </Link>
      </Intestazione>
      <main id="contenuto" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 sm:px-8">
        <header className="max-w-3xl pt-6">
          <p className="occhiello">Per chi disegna e per chi scrive i prompt</p>
          <h1 className="font-titolo mt-3 text-[2.6rem] leading-[1.02] sm:text-6xl">
            L&apos;erbario delle <span className="pennellata">azioni</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-matita sm:text-xl">
            L&apos;AI non inventa le animazioni: ogni giorno sceglie da questa libreria. Ogni stagione se ne aggiungono di
            nuove. Sotto, le abitudini col meteo, gli accessori di ogni strada e come cresce.
          </p>
        </header>

        <section aria-labelledby="titolo-abitudini" className="mt-14">
          <h2 id="titolo-abitudini" className="font-titolo mb-6 text-3xl sm:text-4xl">
            Le abitudini col meteo
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
            {ROUTINE.map((r, i) => {
              const meteo = meteoDiProva(r.meteo)!;
              const scena = risolviScena(meteo, "guardare-cielo", null);
              return (
                <figure key={r.meteo} className="polaroid affiora" style={{ rotate: `${[-1.2, 0.8, -0.5, 1.1, -0.9][i]}deg` }}>
                  <Scena
                    meteo={meteo}
                    posa={scena.posa}
                    stadio="alberello"
                    stagione="autunno"
                    className="block aspect-square w-full"
                    etichetta={scena.routine ? FRASI_ROUTINE[scena.routine] : r.titolo}
                  />
                  <figcaption className="pt-2.5">
                    <p className="font-mano text-[1.35rem] leading-none">{r.titolo}</p>
                    <p className="mt-1 text-[0.9rem] leading-snug text-matita">
                      {scena.routine ? FRASI_ROUTINE[scena.routine] : "Si copre bene e va avanti."}
                    </p>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="titolo-azioni" className="mt-20">
          <h2 id="titolo-azioni" className="font-titolo mb-6 text-3xl sm:text-4xl">
            Le {AZIONI.length} azioni
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {AZIONI.map((a, i) => (
              <li key={a.id} className="esemplare affiora" style={{ rotate: `${[-0.8, 0.6, -0.3, 0.9, -0.5][i % 5]}deg` }}>
                <Albero posa={a.posa} stagione="estate" className="mx-auto aspect-[7/8] w-full" titolo={a.etichetta} />
                <div className="esemplare-etichetta">
                  <code>{a.id}</code>
                  <p className="leading-snug">{a.etichetta}</p>
                  <p className="mt-0.5 text-xs text-matita">
                    <span aria-hidden>{COMPATIBILITA[a.meteo].simbolo}</span> {COMPATIBILITA[a.meteo].testo}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titolo-strade" className="mt-20">
          <h2 id="titolo-strade" className="font-titolo mb-6 text-3xl sm:text-4xl">
            Le strade
          </h2>
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-7">
            {STRADE.map((s) => (
              <li key={s} className="text-center">
                <div className="ritratto-strada">
                  <Albero
                    posa={{ ...AZIONI[0].posa, occhi: "felici", indossa: [INFO_STRADE[s].accessorio] }}
                    stagione="primavera"
                    className="h-full w-full"
                    titolo={INFO_STRADE[s].nome}
                    interattivo={false}
                  />
                </div>
                <p className="font-titolo mt-2 text-lg leading-tight">{INFO_STRADE[s].nome}</p>
                <p className="mt-0.5 text-[0.85rem] leading-snug text-matita">{INFO_STRADE[s].descrizione}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titolo-mestiere" className="mt-20">
          <h2 id="titolo-mestiere" className="font-titolo mb-2 text-3xl sm:text-4xl">
            Il mestiere dell&apos;imprenditore
          </h2>
          <p className="mb-6 max-w-2xl text-matita">
            Prova pilota delle routine di strada: costruisce la scrivania, l&apos;insegna e la cassaforte, poi le usa ogni
            giorno con i suoi orari. Sposta il giorno e l&apos;ora per vedere che cosa fa.
          </p>
          <VetrinaMestiere />
        </section>

        <section aria-labelledby="titolo-crescita" className="mt-20">
          <h2 id="titolo-crescita" className="font-titolo mb-6 text-3xl sm:text-4xl">
            Come cresce
          </h2>
          <p className="mb-6 max-w-3xl text-lg text-matita">
            Non nasce grande: spunta come un germoglio e cresce un po&apos; ogni giorno, in fretta le prime settimane e
            poi con calma. Dopo {GIORNI_PER_CRESCERE} giorni è un albero fatto.
          </p>
          <div className="crescita">
            {TAPPE.map((g) => (
              <figure key={g} className="text-center">
                <Albero
                  posa={AZIONI[0].posa}
                  stadio={stadioDa(g)}
                  giorni={g}
                  stagione="estate"
                  className="mx-auto h-44 w-40 sm:h-56 sm:w-48"
                  titolo={`${stadioDa(g)}, giorno ${g}`}
                  interattivo={false}
                />
                <figcaption className="mt-2">
                  <span className="font-mano text-xl capitalize">{stadioDa(g)}</span>
                  <span className="block text-sm text-matita">{g === 0 ? "il giorno della semina" : `giorno ${g}`}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
