import Link from "next/link";
import { Albero } from "@/components/albero/Albero";
import { azione } from "@/lib/albero/azioni";
import type { Posa } from "@/lib/albero/tipi";

// I piani di docs/modello-di-business.md (piano temporaneo del 10/11/2026).
// Come chiede Federico, il prezzo grande è sempre al mese e IVA esclusa; sotto,
// ben leggibile, quanto si paga davvero e con che cadenza, IVA inclusa
// (riferimento: pagina 2 di docs/offerta/offerta.html).

export type IdPiano = "albero" | "premium-annuale" | "premium-mensile";

/** Quando arriva una cosa: i titoli degli elenchi, in quest'ordine. */
export type Momento = "subito" | "giorno" | "settimana" | "mese" | "anno" | "casa";
export const MOMENTI: Record<Momento, string> = {
  subito: "Da subito",
  giorno: "Ogni giorno",
  settimana: "Ogni settimana",
  mese: "Ogni mese",
  anno: "A fine anno",
  casa: "A casa",
};
const ORDINE: Momento[] = ["subito", "giorno", "settimana", "mese", "anno", "casa"];

export interface Voce {
  testo: string;
  quando: Momento;
  /** Promessa nell'offerta ma non ancora costruita: etichetta «in arrivo». */
  inArrivo?: boolean;
}

// Gli elenchi completi approvati da Federico (11/11/2026). Le voci «in arrivo»
// sono nell'offerta ma non ancora nel prodotto.
const VOCI_ALBERO: Voce[] = [
  { quando: "subito", testo: "Il tuo albero, con 7 tratti di carattere casuali e la sua intelligenza artificiale" },
  { quando: "subito", testo: "Il giardino online a tutto schermo, con il meteo e l'ora reali della sua città" },
  { quando: "subito", testo: "Le risposte: gli scrivi dal giardino e ti risponde" },
  { quando: "subito", testo: "7 strade possibili: quando ne prende una, te lo scrive" },
  { quando: "subito", testo: "Collezione e trofei sbloccati vivendo, più l'album delle stagioni", inArrivo: true },
  { quando: "subito", testo: "Il bosco con gli amici e le gare di stagione", inArrivo: true },
  { quando: "giorno", testo: "Un'azione scelta tra 23 e una pagina di diario, da una a tre frasi" },
  { quando: "giorno", testo: "Il buongiorno: una domanda a cui rispondi con un tocco", inArrivo: true },
  { quando: "settimana", testo: "Una cartolina breve dal giardino", inArrivo: true },
  { quando: "mese", testo: "Una lettera via email ogni 30 giorni, più una in ogni momento importante" },
  { quando: "anno", testo: "Il diario dell'anno in PDF illustrato, all'undicesimo mese" },
  { quando: "anno", testo: "Il letargo, se non rinnovi: conserva il diario e si riattiva quando vuoi" },
  { quando: "casa", testo: "La tessera del fan club" },
];

const VOCI_PREMIUM: Voce[] = [
  { quando: "subito", testo: "L'albero ti scrive anche su WhatsApp", inArrivo: true },
  { quando: "mese", testo: "Una lettera ogni 15 giorni invece di 30" },
  { quando: "mese", testo: "Un regalo da mandargli, a cui risponde con una lettera" },
  { quando: "mese", testo: "Il riepilogo illustrato del mese" },
  { quando: "mese", testo: "La cartolina del mese, in formato storia e come sfondo del telefono" },
  { quando: "mese", testo: "Un messaggio vocale con la voce dell'albero", inArrivo: true },
  { quando: "anno", testo: "Il diario dell'anno anche stampato e spedito a casa, all'undicesimo mese" },
  { quando: "casa", testo: "La tessera premium e un foglio di adesivi del suo albero" },
];

// Il mensile ha le stesse cose del Premium annuale; cambiano solo i tempi del
// libro (a chi completa l'anno) e di tessera e adesivi (al terzo mese).
const VOCI_PREMIUM_MENSILE: Voce[] = VOCI_PREMIUM.map((v) =>
  v.quando === "anno"
    ? { ...v, testo: "Il diario dell'anno anche stampato e spedito a casa, al dodicesimo mese, a chi completa l'anno" }
    : v.quando === "casa"
      ? { ...v, testo: "La tessera premium e un foglio di adesivi del suo albero, al terzo mese" }
      : v,
);

/** Le voci divise per momento, nell'ordine dei titoli. */
export function perMomento(voci: Voce[]) {
  return ORDINE.map((m) => ({ momento: m, voci: voci.filter((v) => v.quando === m) })).filter((g) => g.voci.length > 0);
}

/** Che cosa c'è in tutti i piani e che cosa in più nei Premium: per «Che cosa ricevi». */
export const VOCI = { tutti: VOCI_ALBERO, premium: VOCI_PREMIUM };

export interface Piano {
  id: IdPiano;
  nome: string;
  /** Prezzo al netto dell'IVA, per il periodo in cui si paga. */
  netto: string;
  /** Prezzo al pubblico, IVA inclusa, per il periodo in cui si paga. */
  pubblico: string;
  periodo: "all'anno" | "al mese";
  /** Il prezzo grande: al mese, IVA esclusa. */
  alMese: string;
  /** Quanto e quando si paga davvero. */
  siPaga: string;
  /** Che cosa dà: tutto, per l'Albero; solo le voci in più, per i Premium. */
  voci: Voce[];
  /** I Premium partono da tutto quello dell'Albero. */
  base?: "Albero";
  /** Una riga sotto il prezzo, se serve. */
  nota?: string;
}

export const PIANI: Record<IdPiano, Piano> = {
  albero: {
    id: "albero",
    nome: "Albero",
    netto: "29 €",
    pubblico: "35,38 €",
    periodo: "all'anno",
    alMese: "2,42 €",
    siPaga: "Si paga 29 € + IVA all'anno (35,38 € IVA inclusa)",
    voci: VOCI_ALBERO,
  },
  "premium-annuale": {
    id: "premium-annuale",
    nome: "Premium annuale",
    netto: "49 €",
    pubblico: "59,78 €",
    periodo: "all'anno",
    alMese: "4,08 €",
    siPaga: "Si paga 49 € + IVA all'anno (59,78 € IVA inclusa)",
    voci: VOCI_PREMIUM,
    base: "Albero",
  },
  "premium-mensile": {
    id: "premium-mensile",
    nome: "Premium mensile",
    netto: "6 €",
    pubblico: "7,32 €",
    periodo: "al mese",
    alMese: "6 €",
    siPaga: "Si paga ogni mese (7,32 € IVA inclusa)",
    voci: VOCI_PREMIUM_MENSILE,
    base: "Albero",
    nota: "Come il Premium annuale, pagato mese per mese: 1,92 € + IVA al mese in più.",
  },
};

export const NOTA_MENSILE =
  "Premium mensile: come il Premium annuale. Il diario stampato arriva al dodicesimo mese, a chi completa l'anno; tessera premium e adesivi al terzo mese.";

/** Una voce dell'elenco, con l'etichetta «in arrivo» se non è ancora costruita. */
export function TestoVoce({ voce }: { voce: Voce }) {
  return (
    <>
      {voce.testo}
      {voce.inArrivo && <span className="lp-in-arrivo">in arrivo</span>}
    </>
  );
}

/** L'elenco completo di un piano, diviso per momento. */
export function ElencoPiano({ piano }: { piano: Piano }) {
  return (
    <div className="lp-voci">
      {piano.base && <p className="lp-voci-base">Tutto quello dell&apos;{piano.base}, e in più:</p>}
      {perMomento(piano.voci).map((g) => (
        <div key={g.momento} className="lp-voci-gruppo">
          <p className="lp-voci-titolo">{MOMENTI[g.momento]}</p>
          <ul className="lp-lista">
            {g.voci.map((v) => (
              <li key={v.testo} data-arrivo={v.inArrivo ? "" : undefined}>
                <TestoVoce voce={v} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Lo stesso elenco in forma compatta, per la semina: un momento per riga. */
export function ElencoCompatto({ piano }: { piano: Piano }) {
  return (
    <div className="elenco-compatto">
      <p className="elenco-compatto-titolo">
        Che cosa comprende {piano.nome}
        {piano.base && <span>: tutto quello dell&apos;{piano.base}, e in più</span>}
      </p>
      <dl>
        {perMomento(piano.voci).map((g) => (
          <div key={g.momento}>
            <dt>{MOMENTI[g.momento]}</dt>
            <dd>
              {g.voci.map((v, i) => (
                <span key={v.testo}>
                  {i > 0 && " · "}
                  <TestoVoce voce={v} />
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const felice = (p: Partial<Posa> = {}): Posa => ({ ...azione("guardare-cielo").posa, occhi: "felici", ...p });

/** L'illustrazione del piano: una piccola scena del gioco. */
export function FinestraPiano({ premium = false }: { premium?: boolean }) {
  if (!premium) {
    return (
      <div className="lp-finestra" aria-hidden>
        <Albero
          posa={felice({ dx: { forma: "dritto", angolo: 58, anim: "saluta" } })}
          stadio="alberello"
          stagione="primavera"
          className="bottom-[-3%] left-1/2 h-[98%] -translate-x-1/2"
          titolo=""
        />
      </div>
    );
  }
  return (
    <div className="lp-finestra" aria-hidden>
      <Albero posa={felice({ bocca: "grande" })} stadio="alberello" stagione="autunno" className="bottom-[-3%] left-[30%] h-[94%] -translate-x-1/2" titolo="" />
      <svg viewBox="0 0 100 90" className="right-[4%] bottom-[6%] w-[44%]">
        {/* il diario stampato */}
        <g transform="rotate(-6 40 50)">
          <rect x="6" y="26" width="58" height="46" rx="3" fill="#8b3a3a" stroke="#23261d" strokeWidth="2" />
          <rect x="12" y="32" width="46" height="34" rx="2" fill="#fbf7ec" />
          <text x="35" y="47" textAnchor="middle" fontSize="8.5" fontWeight="800" fontFamily="var(--font-lp), sans-serif" fill="#23261d">
            Il diario
          </text>
          <text x="35" y="58" textAnchor="middle" fontSize="6.5" fontFamily="var(--font-lp), sans-serif" fill="#7a5236">
            di Ottavio
          </text>
        </g>
        {/* la tessera */}
        <g transform="rotate(10 76 26)">
          <rect x="56" y="12" width="40" height="26" rx="4" fill="#e0a526" stroke="#23261d" strokeWidth="2" />
          <rect x="61" y="18" width="12" height="9" rx="1.5" fill="#fbf7ec" />
          <path d="M78,22 h12 M78,28 h9" stroke="#23261d" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* il regalo del mese */}
        <g>
          <rect x="66" y="58" width="26" height="22" rx="2" fill="#b8322a" stroke="#23261d" strokeWidth="2" />
          <path d="M79,58 v22 M66,68 h26" stroke="#e0a526" strokeWidth="3" />
          <path d="M79,58 c-8,-10 -14,-2 0,0 c8,-10 14,-2 0,0" fill="none" stroke="#e0a526" strokeWidth="2.4" />
        </g>
      </svg>
    </div>
  );
}

function Calendario() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="mt-[0.15em] shrink-0">
      <rect x="3" y="5" width="18" height="16" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Il prezzo: grande al mese, IVA esclusa; sotto, quanto e quando si paga. */
export function Prezzo({ piano }: { piano: Piano }) {
  return (
    <div>
      <p className="lp-prezzo">
        <span className="lp-prezzo-cifra">{piano.alMese}</span>
        <span className="lp-prezzo-unita">+ IVA al mese</span>
      </p>
      <p className="lp-si-paga">
        <Calendario />
        <span>{piano.siPaga}</span>
      </p>
    </div>
  );
}

function CartaPiano({ piano, evidenza, invito }: { piano: Piano; evidenza?: string; invito: string }) {
  return (
    <article className={`lp-piano ${evidenza ? "lp-piano-evidenza" : ""}`} aria-labelledby={`piano-${piano.id}`} data-inclina>
      {evidenza && <span className="lp-piano-badge">{evidenza}</span>}
      <h3 id={`piano-${piano.id}`} className="lp-h3">
        {piano.nome}
      </h3>
      <FinestraPiano premium={piano.id !== "albero"} />
      <Prezzo piano={piano} />
      {piano.nota && <p className="lp-piano-nota">{piano.nota}</p>}
      <ElencoPiano piano={piano} />
      <Link href={`/pianta?pacchetto=${piano.id}`} className={`lp-btn w-full ${evidenza ? "lp-btn-primario" : "lp-btn-scuro"}`}>
        {invito}
      </Link>
    </article>
  );
}

/** I piani: i due annuali nello stesso riquadro, il mensile in uno a parte. */
export function Piani() {
  return (
    <div className="lp-piani">
      <section className="lp-gruppo" aria-labelledby="gruppo-annuali">
        <p id="gruppo-annuali" className="lp-gruppo-titolo">
          <Calendario />
          Piani annuali · si paga una volta all&apos;anno
        </p>
        <div className="lp-gruppo-griglia">
          <CartaPiano piano={PIANI.albero} invito="Pianta il tuo albero" />
          <CartaPiano piano={PIANI["premium-annuale"]} evidenza="Da regalare" invito="Scegli il Premium" />
        </div>
      </section>
      <section className="lp-gruppo lp-gruppo-mensile" aria-labelledby="gruppo-mensile">
        <p id="gruppo-mensile" className="lp-gruppo-titolo">
          <Calendario />
          Si paga ogni mese
        </p>
        <CartaPiano piano={PIANI["premium-mensile"]} invito="Scegli il mensile" />
      </section>
    </div>
  );
}
