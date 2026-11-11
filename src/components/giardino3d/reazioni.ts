import type { Reazione } from "./tipi";

// Le reazioni dell'albero alle cose che fa la persona (rispondere al buongiorno,
// scrivergli, fargli un regalo): un evento del browser che il giardino 3D ascolta.

export const EVENTO_REAZIONE = "linfa-reazione";

/** Strumenti della demo: provare un umore o un'azione senza aspettare un giorno. */
export const EVENTO_PROVA = "linfa-prova";
export interface DettaglioProva {
  umore?: string | null;
  azione?: string | null;
}
export function provaNelGiardino(d: DettaglioProva) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<DettaglioProva>(EVENTO_PROVA, { detail: d }));
}

export function segnalaReazione(tipo: Reazione) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<Reazione>(EVENTO_REAZIONE, { detail: tipo }));
}
