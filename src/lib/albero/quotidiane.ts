import type { Azione } from "./azioni";
import type { Fascia } from "./mestieri";
import type { Braccio, Posa } from "./tipi";

// Le prime 30 attività quotidiane della 0.2 (docs/stanze-e-vita.md, sezione 5.1):
// si aggiungono alle 23 azioni di azioni.ts. Ognuna ha la sua scenetta, montata
// con i gesti di vivo/gesti.ts (vivo/attivita.ts): qui ci sono solo la posa
// ferma (il primo fotogramma, disegnato dal server), quando ha senso e che
// cosa gli fa venire voglia di farla. Le risorse che danno o che servono e le
// catene di cui fanno parte sono in catene.ts.
// La posa deve restare diversa da quella di ogni altra azione: il pupazzo
// riconosce l'attività dalla posa (vivo/scenette.ts, azioneDaPosa).

type FasciaDiGiorno = Exclude<Fascia, "notte">;

export interface InfoAttivita {
  fasce: FasciaDiGiorno[];
  /** Ferma: scrive, legge, medita, guarda. Al massimo una al giorno come principale. */
  ferma?: boolean;
  /** Si muove: almeno una al giorno come principale. */
  movimento?: boolean;
  /** Con il freddo (sotto gli 8° o con la neve) non la fa. */
  noFreddo?: boolean;
  umori: string[];
  /** Che cosa gli passa per la testa quando gli viene voglia di farla (nuvoletta). */
  voglia: string;
}

const giu = (angolo = -50): Braccio => ({ forma: "dritto", angolo });
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

const MATTINA: FasciaDiGiorno[] = ["mattina"];
const DI_GIORNO: FasciaDiGiorno[] = ["giorno", "pomeriggio"];
const SERA: FasciaDiGiorno[] = ["sera"];

interface Voce {
  azione: Azione;
  info: InfoAttivita;
}

const v = (
  id: string,
  etichetta: string,
  meteo: Azione["meteo"],
  p: Partial<Posa>,
  info: InfoAttivita,
  strade: Azione["strade"] = [],
): Voce => ({ azione: { id, etichetta, meteo, strade, posa: posa(p) }, info });

const VOCI: Voce[] = [
  // ——— Mattina ———
  v("svegliarsi", "si sveglia e si stiracchia", "qualsiasi", { occhi: "chiusi", bocca: "o", sx: giu(-36), dx: giu(-36), corpo: "respira" }, {
    fasce: MATTINA,
    umori: ["assonnato", "allegro", "malinconico"],
    voglia: "ancora cinque minuti…",
  }),
  v("colazione-rugiada", "fa colazione con la rugiada", "asciutto", { occhi: "felici", bocca: "sorriso", sx: giu(-42), dx: tiene(10) }, {
    fasce: MATTINA,
    umori: ["allegro", "assonnato", "sognante"],
    voglia: "che fame… rugiada!",
  }),
  v("ginnastica", "fa ginnastica col sole", "asciutto", { occhi: "aperti", bocca: "grande", sx: giu(-20), dx: giu(-20), corpo: "saltella" }, {
    fasce: ["mattina", "pomeriggio"],
    movimento: true,
    umori: ["energico", "allegro", "fiero"],
    voglia: "uno, due, uno, due!",
  }, ["sportivo"]),
  v("rastrellare-foglie", "rastrella le foglie", "asciutto", { occhi: "giu", bocca: "sorriso", sx: tiene(-14), dx: tiene(-14) }, {
    fasce: ["mattina", "giorno"],
    movimento: true,
    umori: ["energico", "pensieroso", "allegro"],
    voglia: "quante foglie per terra…",
  }),
  v("salutare-uccelli", "saluta gli uccelli", "asciutto", { occhi: "su", bocca: "o", sx: giu(-50), dx: giu(24) }, {
    fasce: ["mattina", "giorno"],
    umori: ["allegro", "curioso", "sognante"],
    voglia: "cip cip?",
  }, ["poeta"]),
  v("raccogliere-rugiada", "raccoglie la rugiada nel secchio", "asciutto", { occhi: "giu", bocca: "neutro", sx: giu(-30), dx: tiene(-20) }, {
    fasce: MATTINA,
    movimento: true,
    umori: ["curioso", "pensieroso", "energico"],
    voglia: "un po' d'acqua di scorta",
  }),
  v("spazzare", "spazza davanti a casa", "qualsiasi", { occhi: "giu", bocca: "neutro", sx: tiene(-30), dx: tiene(-6) }, {
    fasce: ["mattina", "giorno"],
    movimento: true,
    umori: ["energico", "fiero", "malinconico"],
    voglia: "che disordine…",
  }),
  v("dito-bagnato", "controlla il vento col dito bagnato", "qualsiasi", { occhi: "su", bocca: "neutro", sx: giu(-50), dx: { forma: "dritto", angolo: 88 } }, {
    fasce: ["mattina", "giorno"],
    umori: ["curioso", "pensieroso", "furbo"],
    voglia: "che vento tira?",
  }, ["viaggiatore", "filosofo"]),
  v("zappare-aiuola", "zappa un'aiuola", "asciutto", { occhi: "aperti", bocca: "neutro", sx: tiene(26), dx: tiene(26) }, {
    fasce: ["mattina", "giorno"],
    movimento: true,
    umori: ["energico", "fiero", "pensieroso"],
    voglia: "e se facessi un orto?",
  }),
  v("annaffiare-orto", "annaffia l'orto", "asciutto", { occhi: "giu", bocca: "sorriso", sx: giu(-55), dx: giu(-6) }, {
    fasce: ["mattina", "pomeriggio"],
    movimento: true,
    umori: ["allegro", "pensieroso", "sognante"],
    voglia: "l'orto ha sete",
  }),

  // ——— Giorno e pomeriggio ———
  v("raccogliere-rami", "raccoglie rami secchi", "asciutto", { occhi: "giu", bocca: "neutro", sx: giu(-62), dx: giu(-62) }, {
    fasce: DI_GIORNO,
    movimento: true,
    umori: ["energico", "curioso", "pensieroso"],
    voglia: "un po' di legna…",
  }),
  v("raccogliere-bacche", "raccoglie le bacche", "asciutto", { occhi: "felici", bocca: "sorriso", sx: tiene(-26), dx: giu(30) }, {
    fasce: DI_GIORNO,
    movimento: true,
    umori: ["allegro", "curioso", "furbo"],
    voglia: "bacche mature, mmm",
  }),
  v("schiacciare-bacche", "schiaccia le bacche in una ciotola", "qualsiasi", { occhi: "giu", bocca: "ghigno", sx: giu(-30), dx: tiene(-30) }, {
    fasce: DI_GIORNO,
    umori: ["energico", "furbo", "allegro"],
    voglia: "e se ci facessi qualcosa?",
  }),
  v("regalare-marmellata", "regala un vasetto di marmellata allo scoiattolo", "asciutto", { occhi: "felici", bocca: "grande", sx: giu(-50), dx: giu(6) }, {
    fasce: DI_GIORNO,
    movimento: true,
    umori: ["allegro", "sognante", "fiero"],
    voglia: "chissà se gli piace…",
  }),
  v("seminare", "semina l'aiuola", "asciutto", { occhi: "giu", bocca: "o", sx: tiene(-4), dx: giu(-24) }, {
    fasce: ["mattina", "giorno", "pomeriggio"],
    movimento: true,
    umori: ["sognante", "allegro", "pensieroso"],
    voglia: "semini, crescete!",
  }),
  v("raccogliere-orto", "raccoglie le verdure dell'orto", "asciutto", { occhi: "felici", bocca: "o", sx: giu(-66), dx: giu(-66) }, {
    fasce: ["mattina", "giorno", "pomeriggio"],
    movimento: true,
    umori: ["allegro", "fiero", "energico"],
    voglia: "sono pronte!",
  }),
  v("cercare-ghiande", "cerca ghiande nell'erba", "asciutto", { occhi: "furbi", bocca: "neutro", sx: giu(-62), dx: giu(-40) }, {
    fasce: DI_GIORNO,
    movimento: true,
    umori: ["furbo", "curioso", "energico"],
    voglia: "sento odore di ghiande",
  }, ["furfante", "imprenditore"]),
  v("cercare-sassi", "cerca sassi belli", "asciutto", { occhi: "giu", bocca: "o", sx: giu(-58), dx: tiene(30) }, {
    fasce: DI_GIORNO,
    movimento: true,
    umori: ["curioso", "pensieroso", "sognante"],
    voglia: "un sasso perfetto…",
  }, ["artista", "filosofo"]),
  v("intrecciare-erba", "intreccia fili d'erba", "qualsiasi", { occhi: "giu", bocca: "neutro", sx: tiene(8), dx: tiene(8), gambe: "incrociate", corpo: "respira" }, {
    fasce: ["giorno", "pomeriggio", "sera"],
    ferma: true,
    umori: ["pensieroso", "malinconico", "sognante"],
    voglia: "una corda d'erba…",
  }, ["artista", "poeta"]),
  v("bolle-sapone", "fa le bolle di sapone", "asciutto", { occhi: "sognanti", bocca: "o", sx: giu(-48), dx: tiene(40) }, {
    fasce: ["giorno", "pomeriggio"],
    movimento: true,
    noFreddo: true,
    umori: ["allegro", "sognante", "assonnato"],
    voglia: "bolle! tante bolle!",
  }, ["poeta", "artista"]),
  v("bucato", "fa il bucato e lo stende", "asciutto", { occhi: "aperti", bocca: "neutro", sx: tiene(-40), dx: tiene(-40), corpo: "respira" }, {
    fasce: DI_GIORNO,
    movimento: true,
    noFreddo: true,
    umori: ["energico", "fiero", "malinconico"],
    voglia: "la sciarpa puzza un po'",
  }),
  v("tuffo-foglie", "si tuffa nel mucchio di foglie", "asciutto", { occhi: "felici", bocca: "grande", sx: { forma: "dritto", angolo: 70 }, dx: { forma: "dritto", angolo: 70 } }, {
    fasce: DI_GIORNO,
    movimento: true,
    umori: ["allegro", "energico", "furbo"],
    voglia: "quel mucchio mi chiama…",
  }),

  // ——— Sera ———
  v("accendere-fuoco", "accende il fuoco", "asciutto", { occhi: "giu", bocca: "o", sx: tiene(-20), dx: tiene(-20) }, {
    fasce: ["pomeriggio", "sera"],
    movimento: true,
    umori: ["energico", "fiero", "curioso"],
    voglia: "un bel fuoco, stasera",
  }),
  v("arrostire-castagne", "arrostisce castagne sul fuoco", "asciutto", { occhi: "felici", bocca: "sorriso", sx: giu(-50), dx: tiene(-10), gambe: "incrociate" }, {
    fasce: SERA,
    umori: ["allegro", "sognante", "assonnato"],
    voglia: "castagne calde…",
  }),
  v("storie-al-fuoco", "racconta storie davanti al fuoco", "asciutto", { occhi: "sognanti", bocca: "parla", sx: tiene(30), dx: tiene(30), gambe: "incrociate" }, {
    fasce: SERA,
    umori: ["sognante", "allegro", "malinconico"],
    voglia: "c'era una volta un ghiro…",
  }, ["poeta", "filosofo"]),
  v("cuocere-marmellata", "cuoce la marmellata e riempie i vasetti", "asciutto", { occhi: "giu", bocca: "sorriso", sx: giu(-44), dx: tiene(-34) }, {
    fasce: ["pomeriggio", "sera"],
    umori: ["allegro", "pensieroso", "fiero"],
    voglia: "marmellata di bacche!",
  }, ["imprenditore"]),
  v("cucinare-zuppa", "cucina una zuppa con le verdure dell'orto", "asciutto", { occhi: "felici", bocca: "o", sx: giu(-40), dx: tiene(-26) }, {
    fasce: ["pomeriggio", "sera"],
    umori: ["allegro", "assonnato", "fiero"],
    voglia: "una zuppa calda…",
  }),
  v("guardare-stelle", "guarda le stelle e unisce i puntini", "asciutto", { occhi: "su", bocca: "sorriso", sx: giu(-50), dx: { forma: "dritto", angolo: 60 }, gambe: "incrociate" }, {
    fasce: SERA,
    ferma: true,
    umori: ["sognante", "pensieroso", "malinconico"],
    voglia: "quella sembra una ghianda",
  }, ["filosofo", "poeta", "viaggiatore"]),

  // ——— Con la pioggia ———
  v("secchio-pioggia", "mette il secchio sotto la pioggia", "pioggia", { occhi: "su", bocca: "sorriso", sx: giu(-50), dx: giu(-24) }, {
    fasce: ["mattina", "giorno", "pomeriggio"],
    umori: ["furbo", "curioso", "pensieroso"],
    voglia: "acqua gratis dal cielo!",
  }, ["imprenditore"]),
  v("saltare-pozzanghere", "salta nelle pozzanghere", "pioggia", { occhi: "felici", bocca: "grande", sx: giu(-10), dx: giu(-10), corpo: "saltella" }, {
    fasce: ["giorno", "pomeriggio"],
    movimento: true,
    umori: ["allegro", "energico", "furbo"],
    voglia: "splash!",
  }, ["sportivo"]),
];

export const QUOTIDIANE: Azione[] = VOCI.map((x) => x.azione);
export const INFO_QUOTIDIANE: Record<string, InfoAttivita> = Object.fromEntries(VOCI.map((x) => [x.azione.id, x.info]));
