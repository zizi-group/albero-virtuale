import type { FasciaDiGiorno } from "./giornata";
import type { Strada } from "./strade";
import type { Cielo } from "./tipi";

// Le attività di gruppo (docs/stanze-e-vita.md, sezione 5.4): con due o più
// alberi nella stessa stanza, a volte la giornata la fanno insieme. Le decide
// il codice, come il contagio; il diario di ognuno le racconta a modo suo.

export type MeteoGruppo = "asciutto" | "pioggia" | "sole" | "qualsiasi";

export interface AttivitaDiGruppo {
  id: string;
  /** Al plurale, dopo i nomi: «Pino e Ulivetta fanno una foto di gruppo». */
  frase: string;
  fasce: FasciaDiGiorno[];
  meteo: MeteoGruppo;
  /** Quanti alberi servono, almeno. */
  minimo: number;
  /** La propone un albero di questa strada (che ne è il promotore). */
  promotore?: Strada;
  /** Si fa solo con un'impresa di questo tipo con almeno un sostenitore: partecipano i suoi membri. */
  impresa?: string;
  /** Solo tra due capi rivali. */
  rivalita?: boolean;
  /** Solo il giorno del compleanno di uno degli alberi. */
  compleanno?: boolean;
  peso: number;
}

const g = (id: string, frase: string, fasce: FasciaDiGiorno[], meteo: MeteoGruppo, extra: Partial<AttivitaDiGruppo> = {}): AttivitaDiGruppo => ({
  id,
  frase,
  fasce,
  meteo,
  minimo: 2,
  peso: 1,
  ...extra,
});

export const ATTIVITA_DI_GRUPPO: AttivitaDiGruppo[] = [
  g("cena-luna", "cenano insieme sotto la luna", ["sera"], "asciutto"),
  g("litigio-ombra", "litigano per chi sta all'ombra, poi si spostano tutti insieme", ["giorno", "pomeriggio"], "sole"),
  g("foto-gruppo", "fanno una foto di gruppo, e qualcuno ha gli occhi chiusi", ["mattina", "giorno", "pomeriggio"], "asciutto"),
  g("partita-palla", "giocano a palla, con regole inventate sul momento", ["giorno", "pomeriggio"], "asciutto"),
  g("bancarella-insieme", "aprono una bancarella insieme", ["giorno", "pomeriggio"], "asciutto", { promotore: "imprenditore" }),
  g("ombrello-solo", "fanno una riunione sotto un ombrello solo", ["mattina", "giorno", "pomeriggio"], "pioggia"),
  g("colpo-banda", "tentano il colpo del secolo: la mela più rossa del giardino (domani la restituiscono, si sentono in colpa)", ["sera"], "asciutto", { impresa: "banda-del-bosco", peso: 2 }),
  g("fuga-giardiniere", "scappano dal giardiniere che passa col rastrello, ridendo", ["giorno", "pomeriggio"], "asciutto", { promotore: "furfante" }),
  g("compleanno", "fanno una festa di compleanno con la torta di muschio", ["pomeriggio", "sera"], "qualsiasi", { compleanno: true, peso: 50 }),
  g("lettera-tutti", "scrivono una lettera firmata da tutti", ["sera"], "qualsiasi", { peso: 0.5 }),
  g("storie-fuoco", "si raccontano storie intorno al fuoco", ["sera"], "asciutto"),
  g("coro-sera", "cantano in coro la sera, ognuno in una tonalità diversa", ["sera"], "qualsiasi"),
  g("braccio-ferro", "fanno a braccio di ferro con i rami", ["giorno", "pomeriggio"], "qualsiasi", { promotore: "sportivo" }),
  g("gara-rime", "fanno una gara di rime, e nessuna rima torna", ["pomeriggio", "sera"], "qualsiasi", { promotore: "poeta" }),
  g("lezione-filosofo", "ascoltano una lezione del filosofo su perché le foglie cadono in giù", ["mattina", "giorno"], "asciutto", { promotore: "filosofo" }),
  g("ritratto-gruppo", "posano per un ritratto di gruppo, e sembrano tutti patate", ["mattina", "giorno", "pomeriggio"], "asciutto", { promotore: "artista" }),
  g("torneo", "fanno un torneo con la premiazione sul podio", ["pomeriggio"], "asciutto", { impresa: "club-sportivo", peso: 2 }),
  // La rivalità tra due capi (sezione 7.2): buffa, mai cattiva.
  g("chi-piu-ombra", "fanno la gara di chi ha più ombra, misurandola a passi", ["giorno", "pomeriggio"], "sole", { rivalita: true, peso: 3 }),
  g("gara-imprese", "fanno una gara tra le loro imprese, e alla fine si stringono il ramo", ["giorno", "pomeriggio"], "asciutto", { rivalita: true, peso: 3 }),
];

/** Quante volte, in media, una stanza con più alberi fa un'attività insieme (proposta: circa due giorni su sette). */
export const PROBABILITA_GRUPPO = 0.3;

export interface PartecipanteGruppo {
  id: string;
  strada: Strada | null;
  /** Giorni vissuti: il compleanno è ogni 365. */
  giorni: number;
}

export interface ScenaGruppo {
  attivita: AttivitaDiGruppo;
  fascia: FasciaDiGiorno;
  partecipanti: string[];
}

function adatta(m: MeteoGruppo, cielo: Cielo): boolean {
  const bagnato = cielo === "pioggia" || cielo === "temporale";
  if (m === "qualsiasi") return true;
  if (m === "pioggia") return bagnato;
  if (m === "sole") return cielo === "sole";
  return !bagnato && cielo !== "neve";
}

/**
 * L'attività di gruppo del giorno, se c'è. `imprese` sono le imprese della
 * stanza con i loro membri; `rivali` le coppie di capi in rivalità.
 */
export function attivitaDiGruppo(
  alberi: PartecipanteGruppo[],
  cielo: Cielo,
  imprese: { tipo: string; membri: string[] }[],
  rivali: [string, string][],
  rnd: () => number,
): ScenaGruppo | null {
  if (alberi.length < 2) return null;
  const festeggiato = alberi.find((a) => a.giorni > 0 && a.giorni % 365 === 0);
  if (!festeggiato && rnd() >= PROBABILITA_GRUPPO) return null;

  const candidati: { a: AttivitaDiGruppo; chi: string[] }[] = [];
  for (const a of ATTIVITA_DI_GRUPPO) {
    if (!adatta(a.meteo, cielo)) continue;
    let chi = alberi.map((x) => x.id);
    if (a.compleanno && !festeggiato) continue;
    if (a.promotore) {
      const p = alberi.find((x) => x.strada === a.promotore);
      if (!p) continue;
      chi = [p.id, ...chi.filter((x) => x !== p.id)];
    }
    if (a.impresa) {
      const imp = imprese.find((i) => i.tipo === a.impresa && i.membri.length >= 2);
      if (!imp) continue;
      chi = imp.membri;
    }
    if (a.rivalita) {
      if (!rivali.length) continue;
      chi = rivali[Math.floor(rnd() * rivali.length)];
    }
    if (chi.length >= a.minimo) candidati.push({ a, chi });
  }
  if (!candidati.length) return null;
  const tot = candidati.reduce((s, c) => s + c.a.peso, 0);
  let r = rnd() * tot;
  const scelto = candidati.find((c) => (r -= c.a.peso) <= 0) ?? candidati[candidati.length - 1];
  const fascia = scelto.a.fasce[Math.floor(rnd() * scelto.a.fasce.length)];
  return { attivita: scelto.a, fascia, partecipanti: scelto.chi };
}
