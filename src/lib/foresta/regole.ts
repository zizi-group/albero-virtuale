// Le regole delle stanze (docs/stanze-e-vita.md, 2.1). Codice puro.

/** Massimo di stanze per persona. */
export const STANZE_MASSIME = 10;
/** Alberi per stanza (proposta, doc 2.2 e 16.8). */
export const ALBERI_PER_STANZA = 4;
/** Ogni quanti alberi piantati si apre una stanza. */
export const ALBERI_PER_STANZA_NUOVA = 5;

/**
 * Stanze di partenza del piano. Da decidere (doc 16.3, proposta Albero 1,
 * Famiglia 2, Foresta 3): i pacchetti della demo di oggi partono tutti da 1.
 */
export function stanzeDelPiano(piano: string): number {
  void piano;
  return 1;
}

/** stanze = min(10, base del piano + floor(alberi piantati / 5) + rinnovi). */
export function stanzeAperte(piano: string, alberiPiantati: number, rinnovi = 0): number {
  return Math.min(STANZE_MASSIME, stanzeDelPiano(piano) + Math.floor(alberiPiantati / ALBERI_PER_STANZA_NUOVA) + rinnovi);
}

/**
 * Quanti alberi in più servono per aprire la stanza numero `numero`
 * (contando da 1), senza rinnovi. 0 se è già aperta.
 */
export function alberiPerAprire(numero: number, piano: string, alberiPiantati: number, rinnovi = 0): number {
  const servono = (numero - stanzeDelPiano(piano) - rinnovi) * ALBERI_PER_STANZA_NUOVA;
  return Math.max(0, servono - alberiPiantati);
}

/** La regola da scrivere sul cartello della radura chiusa. */
export function regolaPerAprire(numero: number, piano: string, alberiPiantati: number, rinnovi = 0): string {
  const n = alberiPerAprire(numero, piano, alberiPiantati, rinnovi);
  if (n <= 0) return "Si apre al prossimo rinnovo";
  return n === 1 ? "Pianta ancora 1 albero" : `Pianta altri ${n} alberi`;
}
