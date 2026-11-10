import Link from "next/link";
import { IconaRegalo } from "@/components/IconaRegalo";
import { PIANI } from "@/components/landing/Pacchetti";
import { NOMI_USO, regalo, type Uso } from "@/lib/albero/regali";
import { GIORNI_DEL_MESE, type RecapMese } from "@/lib/motore/extra";
import { isPremium, NOMI_PACCHETTO, isPacchetto } from "@/lib/piani";
import { PassaAlPremium, SceltaRegalo } from "./SceltaRegalo";
import "./extra.css";

export interface PropsExtra {
  nome: string;
  piano: string;
  mese: { number: number; first_day: number };
  /** Il regalo incluso di questo mese, se l'ha già fatto. */
  regaloDelMese: { gift: string; use: string; how: string; letter_id: string | null } | null;
  /** L'ultimo mese chiuso: il suo riepilogo e la sua cartolina. */
  ultimoChiuso: { number: number; recap: RecapMese | null } | null;
}

const PREMIUM_ANNUALE = PIANI["premium-annuale"];

/** Il prezzo annuale al netto diviso per 12, come lo mostra il sito: «49 €» → «4,08 €». */
function alMese(nettoAnnuale: string) {
  const euro = Number(nettoAnnuale.replace(/[^\d,]/g, "").replace(",", "."));
  return `${(euro / 12).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/** Gli extra del mese: per il Premium funzionano, per l'Albero sono un invito garbato. */
export function ExtraDelMese({ nome, piano, mese, regaloDelMese, ultimoChiuso }: PropsExtra) {
  const premium = isPremium(piano);
  const fineMese = mese.first_day + GIORNI_DEL_MESE - 1;

  if (!premium) {
    return (
      <section id="extra" aria-labelledby="titolo-extra" className="mt-14 scroll-mt-6">
        <div className="extra-invito pagina nastro">
          <p className="occhiello">Il tuo pacchetto: {isPacchetto(piano) ? NOMI_PACCHETTO[piano] : piano}</p>
          <h2 id="titolo-extra" className="font-titolo mt-2 text-3xl leading-tight">
            Ogni mese, con il Premium, {nome} ti manda qualcosa in più
          </h2>
          <ul className="extra-anteprime mt-6">
            <li>
              <IconaRegalo id="berretto" className="h-12 w-12" />
              <p className="font-titolo text-xl leading-tight">Un regalo da fargli</p>
              <p className="text-matita">Uno al mese, incluso. Lui decide se usarlo e come, e te lo racconta in una lettera.</p>
            </li>
            <li>
              <span className="extra-icona-pagina" aria-hidden>
                ★
              </span>
              <p className="font-titolo text-xl leading-tight">Il riepilogo illustrato</p>
              <p className="text-matita">Il momento più bello del mese disegnato, i suoi numeri e la frase migliore del diario.</p>
            </li>
            <li>
              <span className="extra-icona-cartolina" aria-hidden />
              <p className="font-titolo text-xl leading-tight">La cartolina digitale</p>
              <p className="text-matita">Il momento del mese in formato storia e sfondo del telefono, da scaricare.</p>
            </li>
          </ul>
          <p className="mt-6 max-w-2xl leading-snug">
            E a fine anno il diario stampato, da tenere in mano. Premium annuale:{" "}
            <b className="font-titolo text-lg font-normal">{alMese(PREMIUM_ANNUALE.netto)} + IVA al mese</b>.{" "}
            <span className="text-matita">
              Si paga {PREMIUM_ANNUALE.netto} + IVA all&apos;anno ({PREMIUM_ANNUALE.pubblico} IVA inclusa).
            </span>
          </p>
          <div className="mt-4">
            <PassaAlPremium />
          </div>
        </div>
      </section>
    );
  }

  const dono = regaloDelMese ? regalo(regaloDelMese.gift) : null;
  return (
    <section id="extra" aria-labelledby="titolo-extra" className="mt-14 scroll-mt-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="titolo-extra" className="font-titolo text-3xl">
          Il mese {mese.number} di {nome}
        </h2>
        <p className="text-sm text-matita">
          {isPacchetto(piano) ? NOMI_PACCHETTO[piano] : piano} · dal giorno {mese.first_day} al giorno {fineMese}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="extra-scheda pagina nastro" aria-labelledby="titolo-regalo">
          <p className="occhiello text-corteccia">Il regalo del mese</p>
          {regaloDelMese && dono ? (
            <>
              <div className="mt-3 flex items-center gap-3">
                <IconaRegalo id={dono.id} className="h-14 w-14 shrink-0" />
                <h3 id="titolo-regalo" className="font-titolo text-xl leading-tight">
                  Gli hai regalato {dono.articolo.replace(/,.*$/, "")}
                </h3>
              </div>
              <p className="mt-3">
                <span className="etichetta-chip">{NOMI_USO[regaloDelMese.use as Uso] ?? regaloDelMese.use}</span>
              </p>
              <p className="mt-2 font-mano text-xl leading-snug">{regaloDelMese.how}</p>
              {dono.scena?.tipo === "con-azione" && regaloDelMese.use === "lo-usa" && (
                <p className="mt-1 text-sm text-matita">Lo vedi nel giardino {dono.scena.quando}.</p>
              )}
              {dono.scena?.tipo === "indossa" && regaloDelMese.use === "lo-usa" && (
                <p className="mt-1 text-sm text-matita">Lo vedi addosso a lui nel giardino, di giorno.</p>
              )}
              {dono.scena?.tipo === "a-terra" && (regaloDelMese.use === "lo-usa" || regaloDelMese.use === "a-modo-suo") && (
                <p className="mt-1 text-sm text-matita">Lo vedi nel giardino, appoggiato sul prato accanto a lui.</p>
              )}
              {regaloDelMese.letter_id && (
                <Link href={`/giardino/lettere/${regaloDelMese.letter_id}`} className="timbro timbro-carta timbro-piccolo mt-4">
                  Leggi la sua lettera
                </Link>
              )}
              <p className="mt-3 text-sm text-matita">Il prossimo regalo arriva con il mese {mese.number + 1}.</p>
            </>
          ) : (
            <>
              <h3 id="titolo-regalo" className="font-titolo mt-1 mb-3 text-xl leading-tight">
                Che cosa gli regali questo mese?
              </h3>
              <SceltaRegalo nome={nome} />
            </>
          )}
        </article>

        <article className="extra-scheda pagina" aria-labelledby="titolo-riepilogo">
          <p className="occhiello text-corteccia">Il riepilogo illustrato</p>
          {ultimoChiuso ? (
            <>
              <h3 id="titolo-riepilogo" className="font-titolo mt-1 text-xl leading-tight">
                Il mese {ultimoChiuso.number}: <span className="pennellata">{ultimoChiuso.recap?.titolo ?? "è pronto"}</span>
              </h3>
              {ultimoChiuso.recap && <p className="mt-3 font-mano text-xl leading-snug">«{ultimoChiuso.recap.frase}»</p>}
              <Link href={`/giardino/mese/${ultimoChiuso.number}`} className="timbro timbro-piccolo mt-4">
                Apri il riepilogo
              </Link>
            </>
          ) : (
            <>
              <h3 id="titolo-riepilogo" className="font-titolo mt-1 text-xl leading-tight">
                Il primo arriva alla fine del mese
              </h3>
              <p className="mt-2 text-matita">
                Al giorno {fineMese} {nome} sfoglia il diario e sceglie il momento più bello. Intanto puoi guardare il mese in corso.
              </p>
              <Link href={`/giardino/mese/${mese.number}`} className="timbro timbro-carta timbro-piccolo mt-4">
                Il mese in corso
              </Link>
            </>
          )}
        </article>

        <article className="extra-scheda pagina cartolina" aria-labelledby="titolo-cartolina">
          <p className="occhiello text-corteccia">La cartolina digitale</p>
          {ultimoChiuso ? (
            <div className="mt-3 flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- immagine generata al volo, non ottimizzabile */}
              <img
                src={`/giardino/mese/${ultimoChiuso.number}/cartolina?formato=storia`}
                alt={`La cartolina del mese ${ultimoChiuso.number} di ${nome}`}
                width={108}
                height={192}
                loading="lazy"
                className="extra-cartolina-mini"
              />
              <div>
                <h3 id="titolo-cartolina" className="font-titolo text-xl leading-tight">
                  Il momento del mese {ultimoChiuso.number}
                </h3>
                <p className="mt-2 text-matita">Formato storia e sfondo del telefono.</p>
                <Link href={`/giardino/mese/${ultimoChiuso.number}#cartolina`} className="timbro timbro-carta timbro-piccolo mt-3">
                  Scarica la cartolina
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h3 id="titolo-cartolina" className="font-titolo mt-1 text-xl leading-tight">
                Arriva insieme al riepilogo
              </h3>
              <p className="mt-2 text-matita">Il momento più bello del mese, da mettere come storia o sfondo del telefono.</p>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
