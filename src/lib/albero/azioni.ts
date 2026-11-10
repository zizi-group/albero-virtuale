import type { Strada } from "./strade";
import type { Braccio, Posa } from "./tipi";

// La libreria delle azioni: l'AI sceglie solo da qui, l'animazione è già pronta.
// "meteo" dice quando un'azione ha senso: all'asciutto, sotto la pioggia,
// con qualsiasi tempo, oppure solo di notte.

export type CompatibilitaMeteo = "asciutto" | "pioggia" | "qualsiasi" | "notte";

export interface Azione {
  id: string;
  /** Terza persona, per la didascalia: «Ottavio legge un libro». */
  etichetta: string;
  meteo: CompatibilitaMeteo;
  strade: Strada[];
  posa: Posa;
}

const giu = (angolo = -50): Braccio => ({ forma: "dritto", angolo });
const su = (angolo = 62): Braccio => ({ forma: "dritto", angolo });
const tiene = (angolo = 0): Braccio => ({ forma: "piegato", angolo });

const base: Posa = {
  occhi: "aperti",
  bocca: "sorriso",
  sx: giu(),
  dx: giu(),
  gambe: "ferme",
  corpo: "ondeggia",
  oggetti: [],
  effetti: [],
  indossa: [],
};

const posa = (p: Partial<Posa>): Posa => ({ ...base, ...p });

export const AZIONI: Azione[] = [
  {
    id: "guardare-cielo",
    etichetta: "guarda il cielo",
    meteo: "asciutto",
    strade: ["filosofo", "poeta"],
    posa: posa({ occhi: "su", sx: giu(-40), dx: giu(-40) }),
  },
  {
    id: "leggere",
    etichetta: "legge un libro",
    meteo: "qualsiasi",
    strade: ["filosofo", "poeta"],
    posa: posa({ occhi: "giu", bocca: "neutro", sx: tiene(), dx: tiene(), oggetti: ["libro"] }),
  },
  {
    id: "giornale-ombrello",
    etichetta: "legge i giornali finanziari sotto l'ombrello",
    meteo: "pioggia",
    strade: ["imprenditore"],
    posa: posa({
      occhi: "giu",
      bocca: "neutro",
      sx: su(70),
      dx: tiene(),
      oggetti: ["ombrello", "giornale"],
    }),
  },
  {
    id: "doccia",
    etichetta: "si fa la doccia sotto la pioggia",
    meteo: "pioggia",
    strade: [],
    posa: posa({
      occhi: "felici",
      bocca: "grande",
      sx: { forma: "dritto", angolo: 68, anim: "strofina" },
      dx: { forma: "dritto", angolo: 68, anim: "strofina" },
      effetti: ["schiuma"],
    }),
  },
  {
    id: "prendere-sole",
    etichetta: "si gode il sole",
    meteo: "asciutto",
    strade: ["poeta"],
    posa: posa({ occhi: "chiusi", sx: su(58), dx: su(58), corpo: "respira" }),
  },
  {
    id: "passeggiata",
    etichetta: "cammina di buon passo",
    meteo: "qualsiasi",
    strade: ["viaggiatore", "sportivo"],
    posa: posa({
      sx: { forma: "dritto", angolo: -60, anim: "oscilla" },
      dx: { forma: "dritto", angolo: -60, anim: "oscilla" },
      gambe: "cammina",
      corpo: "cammina",
    }),
  },
  {
    id: "dormire",
    etichetta: "dorme come un sasso",
    meteo: "notte",
    strade: [],
    posa: posa({
      occhi: "chiusi",
      bocca: "o",
      sx: giu(-62),
      dx: giu(-62),
      corpo: "respira",
      effetti: ["zzz"],
      indossa: ["berretto-notte"],
    }),
  },
  {
    id: "sonnellino",
    etichetta: "fa un sonnellino",
    meteo: "asciutto",
    strade: ["poeta"],
    posa: posa({
      occhi: "chiusi",
      bocca: "o",
      sx: giu(-30),
      dx: giu(-30),
      gambe: "incrociate",
      corpo: "respira",
      effetti: ["zzz"],
    }),
  },
  {
    id: "telefonata",
    etichetta: "è al telefono da un'ora",
    meteo: "qualsiasi",
    strade: ["imprenditore"],
    posa: posa({
      bocca: "parla",
      dx: { forma: "dritto", angolo: 100 },
      sx: { forma: "dritto", angolo: -30, anim: "saluta" },
      oggetti: ["telefono"],
    }),
  },
  {
    id: "corsa",
    etichetta: "corre al parco",
    meteo: "asciutto",
    strade: ["sportivo"],
    posa: posa({
      occhi: "aperti",
      bocca: "o",
      sx: { forma: "dritto", angolo: -20, anim: "oscilla" },
      dx: { forma: "dritto", angolo: -20, anim: "oscilla" },
      gambe: "corsa",
      corpo: "corsa",
      effetti: ["sudore"],
    }),
  },
  {
    id: "allenarsi",
    etichetta: "solleva pesi fatti di ghiande",
    meteo: "qualsiasi",
    strade: ["sportivo"],
    posa: posa({
      bocca: "neutro",
      sx: giu(-45),
      dx: { forma: "piegato", angolo: 10, anim: "solleva" },
      oggetti: ["manubrio"],
      effetti: ["sudore"],
    }),
  },
  {
    id: "dipingere",
    etichetta: "dipinge un quadro",
    meteo: "asciutto",
    strade: ["artista"],
    posa: posa({
      occhi: "giu",
      bocca: "neutro",
      sx: giu(-40),
      dx: { forma: "dritto", angolo: 10, anim: "pennella" },
      oggetti: ["cavalletto", "pennello"],
      effetti: ["stelline"],
    }),
  },
  {
    id: "scrivere-poesia",
    etichetta: "scrive una poesia",
    meteo: "qualsiasi",
    strade: ["poeta", "artista"],
    posa: posa({
      occhi: "sognanti",
      bocca: "neutro",
      sx: tiene(),
      dx: { forma: "piegato", angolo: 0, anim: "scrive" },
      oggetti: ["quaderno", "penna"],
    }),
  },
  {
    id: "meditare",
    etichetta: "medita a gambe incrociate",
    meteo: "qualsiasi",
    strade: ["filosofo"],
    posa: posa({
      occhi: "chiusi",
      bocca: "neutro",
      sx: giu(-8),
      dx: giu(-8),
      gambe: "incrociate",
      corpo: "galleggia",
      effetti: ["stelline"],
    }),
  },
  {
    id: "pensare",
    etichetta: "pensa al senso delle foglie",
    meteo: "qualsiasi",
    strade: ["filosofo"],
    posa: posa({
      occhi: "su",
      bocca: "neutro",
      sx: giu(-45),
      dx: { forma: "piegato", angolo: 52 },
      effetti: ["pensiero"],
    }),
  },
  {
    id: "contare-ghiande",
    etichetta: "conta le ghiande, due volte",
    meteo: "qualsiasi",
    strade: ["furfante", "imprenditore"],
    posa: posa({
      occhi: "furbi",
      bocca: "ghigno",
      sx: giu(-55),
      dx: { forma: "dritto", angolo: -58, anim: "conta" },
      oggetti: ["ghiande"],
    }),
  },
  {
    id: "vendere-ombra",
    etichetta: "vende ombra a pagamento",
    meteo: "asciutto",
    strade: ["imprenditore", "furfante"],
    posa: posa({
      bocca: "grande",
      sx: giu(-50),
      dx: { forma: "dritto", angolo: 40, anim: "saluta" },
      oggetti: ["cartello"],
    }),
  },
  {
    id: "chiacchierare-scoiattolo",
    etichetta: "chiacchiera con lo scoiattolo",
    meteo: "asciutto",
    strade: ["furfante", "viaggiatore"],
    posa: posa({
      bocca: "parla",
      sx: giu(-45),
      dx: { forma: "dritto", angolo: -10, anim: "saluta" },
      oggetti: ["scoiattolo"],
      effetti: ["cuori"],
    }),
  },
  {
    id: "fare-valigia",
    etichetta: "prepara la valigia per un viaggio immaginario",
    meteo: "qualsiasi",
    strade: ["viaggiatore"],
    posa: posa({
      occhi: "giu",
      sx: giu(-55),
      dx: { forma: "dritto", angolo: -48, anim: "conta" },
      oggetti: ["valigia"],
    }),
  },
  {
    id: "studiare-mappa",
    etichetta: "studia una mappa del mondo",
    meteo: "qualsiasi",
    strade: ["viaggiatore", "filosofo"],
    posa: posa({ occhi: "giu", bocca: "o", sx: tiene(), dx: tiene(), oggetti: ["mappa"] }),
  },
  {
    id: "ballare",
    etichetta: "balla da solo",
    meteo: "asciutto",
    strade: ["artista"],
    posa: posa({
      occhi: "felici",
      bocca: "grande",
      sx: { forma: "dritto", angolo: 60, anim: "saluta" },
      dx: { forma: "dritto", angolo: 60, anim: "saluta" },
      gambe: "cammina",
      corpo: "balla",
      effetti: ["note"],
    }),
  },
  {
    id: "annaffiarsi",
    etichetta: "si annaffia da solo",
    meteo: "asciutto",
    strade: ["poeta"],
    posa: posa({
      occhi: "felici",
      sx: giu(-45),
      dx: { forma: "dritto", angolo: 74 },
      oggetti: ["annaffiatoio"],
    }),
  },
  {
    id: "bere-tisana",
    etichetta: "beve una tisana",
    meteo: "qualsiasi",
    strade: ["poeta", "filosofo"],
    posa: posa({ occhi: "chiusi", bocca: "sorriso", sx: giu(-45), dx: tiene(18), oggetti: ["tazza"] }),
  },
];

const PER_ID = new Map(AZIONI.map((a) => [a.id, a]));

export const ID_AZIONI = AZIONI.map((a) => a.id) as [string, ...string[]];

export function azione(id: string | null | undefined): Azione {
  return PER_ID.get(id ?? "") ?? PER_ID.get("guardare-cielo")!;
}

/** Le azioni che hanno senso con un certo tempo (di giorno). */
export function azioniPerMeteo(pioggia: boolean): Azione[] {
  return AZIONI.filter((a) =>
    a.meteo === "qualsiasi" || (pioggia ? a.meteo === "pioggia" : a.meteo === "asciutto"),
  );
}
