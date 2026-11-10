import { azione, type Azione } from "./azioni";
import { INFO_STRADE, isStrada } from "./strade";
import type { Indumento, Meteo, Posa } from "./tipi";

export const FREDDO_SOTTO = 8;
export const SOLE_DA = 18;

export interface ScenaRisolta {
  azione: Azione;
  posa: Posa;
  /** Perché fa quello che fa, quando decide il meteo. */
  routine: "notte" | "pioggia" | "freddo" | "sole" | null;
}

/**
 * Le abitudini dell'albero: il meteo vero della sua città vince sull'azione
 * scelta per la giornata. Di notte dorme, con la pioggia si fa la doccia,
 * con il freddo cappello e sciarpa, con il sole gli occhiali.
 */
export function risolviScena(
  meteo: Meteo,
  azioneDelGiorno: string | null | undefined,
  strada: string | null | undefined,
): ScenaRisolta {
  let scelta = azione(azioneDelGiorno);
  let routine: ScenaRisolta["routine"] = null;
  const indossa = new Set<Indumento>();
  const bagnato = meteo.cielo === "pioggia" || meteo.cielo === "temporale";

  if (!meteo.giorno) {
    scelta = azione("dormire");
    routine = "notte";
  } else if (bagnato) {
    if (scelta.meteo !== "pioggia") scelta = azione("doccia");
    routine = "pioggia";
  } else {
    if (scelta.meteo === "pioggia" || scelta.meteo === "notte") {
      scelta = azione("guardare-cielo");
    }
    if (meteo.temperatura < FREDDO_SOTTO || meteo.cielo === "neve") {
      indossa.add("cappello");
      indossa.add("sciarpa");
      routine = "freddo";
      if (["guardare-cielo", "prendere-sole", "sonnellino"].includes(scelta.id)) {
        scelta = azione("passeggiata");
      }
    } else if (meteo.cielo === "sole" && meteo.temperatura >= SOLE_DA) {
      indossa.add("occhiali-sole");
      routine = "sole";
      if (scelta.id === "guardare-cielo") scelta = azione("prendere-sole");
    }
  }

  for (const i of scelta.posa.indossa) indossa.add(i);
  aggiungiAccessorio(indossa, strada);

  // Il berretto da notte prende il posto del cappello di lana.
  if (indossa.has("berretto-notte")) indossa.delete("cappello");

  return {
    azione: scelta,
    posa: { ...scelta.posa, indossa: [...indossa] },
    routine,
  };
}

/** L'accessorio della strada, se non va in conflitto con quello che ha già addosso. */
function aggiungiAccessorio(indossa: Set<Indumento>, strada: string | null | undefined) {
  if (!isStrada(strada)) return;
  const acc = INFO_STRADE[strada].accessorio;
  const conflitto =
    (acc === "occhiali-tondi" && indossa.has("occhiali-sole")) ||
    (acc === "fascia" && (indossa.has("cappello") || indossa.has("berretto-notte"))) ||
    (acc === "basco" && (indossa.has("cappello") || indossa.has("berretto-notte"))) ||
    (acc === "bandana" && indossa.has("sciarpa"));
  if (!conflitto) indossa.add(acc);
}

/**
 * La posa di un giorno passato (riepilogo del mese, cartolina): l'azione scelta
 * quel giorno, senza le abitudini che la cambierebbero, ma vestita per il suo meteo.
 */
export function posaDelGiorno(azioneDelGiorno: string, meteo: Meteo, strada: string | null | undefined): Posa {
  const scelta = azione(azioneDelGiorno);
  const indossa = new Set<Indumento>(scelta.posa.indossa);
  if (meteo.temperatura < FREDDO_SOTTO || meteo.cielo === "neve") {
    indossa.add("cappello");
    indossa.add("sciarpa");
  } else if (meteo.cielo === "sole" && meteo.temperatura >= SOLE_DA) {
    indossa.add("occhiali-sole");
  }
  aggiungiAccessorio(indossa, strada);
  if (indossa.has("berretto-notte")) indossa.delete("cappello");
  return { ...scelta.posa, indossa: [...indossa] };
}

export const FRASI_ROUTINE: Record<NonNullable<ScenaRisolta["routine"]>, string> = {
  notte: "È notte: si è infilato il berretto e dorme come un sasso.",
  pioggia: "Piove: è uscito fuori e si fa la doccia, con tanto di schiuma.",
  freddo: "Fa freddo: ha tirato fuori cappello e sciarpa e cammina più svelto.",
  sole: "C'è il sole: ha messo gli occhiali e si gode la giornata.",
};
