import { Albero } from "@/components/albero/Albero";
import { azione } from "@/lib/albero/azioni";
import type { Posa } from "@/lib/albero/tipi";

// I piani di docs/modello-di-business.md (piano temporaneo del 10/11/2026).
// Prezzi decisi al netto dell'IVA; verso i consumatori si mostra quello con
// l'IVA al 22%, grande, e il netto piccolo accanto.

export type IdPiano = "albero" | "premium-annuale" | "premium-mensile";

export interface Piano {
  id: IdPiano;
  nome: string;
  /** Prezzo al netto dell'IVA. */
  netto: string;
  /** Prezzo al pubblico, IVA inclusa. */
  pubblico: string;
  periodo: "all'anno" | "al mese";
  contenuto: string[];
}

export const PIANI: Record<IdPiano, Piano> = {
  albero: {
    id: "albero",
    nome: "Albero",
    netto: "29 €",
    pubblico: "35,38 €",
    periodo: "all'anno",
    contenuto: [
      "L'albero per un anno: lettere, giardino e risposte",
      "Il diario di fine anno in digitale, un PDF illustrato",
      "La tessera del fan club, spedita a casa",
    ],
  },
  "premium-annuale": {
    id: "premium-annuale",
    nome: "Premium annuale",
    netto: "49 €",
    pubblico: "59,78 €",
    periodo: "all'anno",
    contenuto: [
      "Tutto quello dell'Albero",
      "Il diario di fine anno stampato, da tenere in mano",
      "Ogni mese un regalo per l'albero, il riepilogo illustrato e la cartolina digitale",
      "La tessera del fan club premium",
    ],
  },
  "premium-mensile": {
    id: "premium-mensile",
    nome: "Premium mensile",
    netto: "6 €",
    pubblico: "7,32 €",
    periodo: "al mese",
    contenuto: [
      "Tutto quello dell'Albero",
      "Il diario stampato, al 12° mese, a chi completa l'anno",
      "Ogni mese un regalo per l'albero, il riepilogo illustrato e la cartolina digitale",
      "La tessera del fan club premium, spedita al terzo mese",
    ],
  },
};

/** Il Premium mensile in un anno (7,32 € × 12) e il risparmio dell'annuale. */
export const PREMIUM_MENSILE_ANNO = "87,84 €";
export const RISPARMIO_ANNUALE = "28,06 €";

export const NOTA_MENSILE =
  "Premium mensile: il diario stampato arriva a chi completa i 12 mesi, la tessera premium al terzo mese.";

const felice = (p: Partial<Posa> = {}): Posa => ({ ...azione("guardare-cielo").posa, occhi: "felici", ...p });

/** L'illustrazione nella finestrella della bustina. */
export function FinestraPiano({ premium = false }: { premium?: boolean }) {
  if (!premium) {
    return (
      <div className="bustina-finestra" aria-hidden>
        <Albero
          posa={felice({ dx: { forma: "dritto", angolo: 58, anim: "saluta" } })}
          stadio="alberello"
          stagione="primavera"
          className="bottom-[-2%] left-1/2 h-[96%] -translate-x-1/2"
          titolo=""
        />
      </div>
    );
  }
  return (
    <div className="bustina-finestra" aria-hidden>
      <Albero posa={felice({ bocca: "grande" })} stadio="alberello" stagione="autunno" className="bottom-[-2%] left-[30%] h-[92%] -translate-x-1/2" titolo="" />
      <svg viewBox="0 0 100 90" className="right-[4%] bottom-[6%] w-[46%]">
        {/* il diario stampato */}
        <g transform="rotate(-6 40 50)">
          <rect x="6" y="26" width="58" height="46" rx="3" fill="#8b3a3a" stroke="#23261d" strokeWidth="2" />
          <rect x="12" y="32" width="46" height="34" rx="2" fill="#fbf7ec" />
          <text x="35" y="47" textAnchor="middle" fontSize="8.5" fontFamily="var(--font-gochi), cursive" fill="#23261d">
            Il diario
          </text>
          <text x="35" y="58" textAnchor="middle" fontSize="6.5" fontFamily="var(--font-gochi), cursive" fill="#7a5236">
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

/** Il prezzo: grande con l'IVA, il netto piccolo accanto. */
export function Prezzo({ piano }: { piano: Piano }) {
  return (
    <p className="bustina-prezzo-blocco">
      <span className="bustina-prezzo">{piano.pubblico}</span>
      <span className="bustina-prezzo-nota">
        <span className="block">{piano.periodo}, IVA inclusa</span>
        <span className="block">{piano.netto} + IVA</span>
      </span>
    </p>
  );
}
