import type { Reazione } from "./tipi";

// Le reazioni dell'albero alle cose che fa la persona (rispondere al buongiorno,
// scrivergli, fargli un regalo): un evento del browser che il giardino 3D ascolta.

export const EVENTO_REAZIONE = "linfa-reazione";

export function segnalaReazione(tipo: Reazione) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<Reazione>(EVENTO_REAZIONE, { detail: tipo }));
}
