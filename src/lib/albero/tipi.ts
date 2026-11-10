// Il vocabolario visivo dell'albero: pose, oggetti, indumenti, effetti.

export type Occhi =
  | "aperti"
  | "chiusi"
  | "su"
  | "giu"
  | "furbi"
  | "felici"
  | "sognanti";

export type Bocca = "sorriso" | "grande" | "o" | "parla" | "neutro" | "ghigno";

export type AnimBraccio =
  | "saluta"
  | "strofina"
  | "pennella"
  | "solleva"
  | "scrive"
  | "oscilla"
  | "conta";

/** Angolo in gradi: positivo = braccio verso l'alto (per entrambe le braccia). */
export interface Braccio {
  forma: "dritto" | "piegato";
  angolo: number;
  anim?: AnimBraccio;
}

export type Gambe = "ferme" | "cammina" | "corsa" | "incrociate";

export type AnimCorpo =
  | "ondeggia"
  | "respira"
  | "saltella"
  | "cammina"
  | "galleggia"
  | "balla"
  | "corsa";

export type Oggetto =
  | "libro"
  | "giornale"
  | "ombrello"
  | "telefono"
  | "pennello"
  | "cavalletto"
  | "quaderno"
  | "penna"
  | "manubrio"
  | "ghiande"
  | "cartello"
  | "scoiattolo"
  | "valigia"
  | "mappa"
  | "annaffiatoio"
  | "tazza";

export type Indumento =
  | "occhiali-sole"
  | "occhiali-tondi"
  | "cappello"
  | "berretto-notte"
  | "sciarpa"
  | "cravatta"
  | "basco"
  | "fascia"
  | "bandana"
  | "zaino"
  | "piuma";

export type Effetto =
  | "zzz"
  | "schiuma"
  | "sudore"
  | "note"
  | "pensiero"
  | "cuori"
  | "stelline";

export interface Posa {
  occhi: Occhi;
  bocca: Bocca;
  sx: Braccio;
  dx: Braccio;
  gambe: Gambe;
  corpo: AnimCorpo;
  oggetti: Oggetto[];
  effetti: Effetto[];
  indossa: Indumento[];
}

export type Stadio = "piantina" | "alberello" | "albero";
export type Stagione = "primavera" | "estate" | "autunno" | "inverno";
export type Cielo = "sole" | "nuvole" | "pioggia" | "temporale" | "neve" | "nebbia";

export interface Meteo {
  cielo: Cielo;
  /** Gradi centigradi, arrotondati. */
  temperatura: number;
  /** false di notte, nell'ora della città dell'albero. */
  giorno: boolean;
  /** Descrizione breve in italiano, per diario e didascalie. */
  descrizione: string;
}

export function stadioDa(giorni: number): Stadio {
  if (giorni >= 30) return "albero";
  if (giorni >= 7) return "alberello";
  return "piantina";
}

export function stagioneDa(data: Date): Stagione {
  const m = data.getMonth(); // 0 = gennaio
  if (m >= 2 && m <= 4) return "primavera";
  if (m >= 5 && m <= 7) return "estate";
  if (m >= 8 && m <= 10) return "autunno";
  return "inverno";
}
