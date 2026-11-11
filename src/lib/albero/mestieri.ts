import type { CompatibilitaMeteo } from "./azioni";
import type { Strada } from "./strade";

// I mestieri delle strade: quello che l'albero costruisce e fa ogni giorno
// quando ha preso la sua strada. Progetto in docs/routine-strade.md.
//
// - Livello: sale di uno a ogni cantiere finito (1, 2, 3).
// - Cantiere: una cosa da costruire in più passi, un passo per giornata di lavoro.
//   Finito, lascia un arredo nel prato per sempre.
// - Attività: una scenetta per fascia oraria, possibile da un certo livello e
//   con certi arredi.
//
// Nel pilota (11/11/2026) sono animate le attività e i cantieri
// dell'imprenditore; le altre strade hanno già il catalogo, l'animazione
// arriva una strada alla volta (finché manca, l'albero usa la posa viva).

export const FASCE = ["mattina", "giorno", "pomeriggio", "sera", "notte"] as const;
export type Fascia = (typeof FASCE)[number];

export const NOMI_FASCE: Record<Fascia, string> = {
  mattina: "Mattina",
  giorno: "Giorno",
  pomeriggio: "Pomeriggio",
  sera: "Sera",
  notte: "Notte",
};

/** La fascia dall'ora del giorno (0-23) nella città dell'albero. */
export function fasciaDa(ora: number): Fascia {
  if (ora >= 6 && ora < 11) return "mattina";
  if (ora >= 11 && ora < 14) return "giorno";
  if (ora >= 14 && ora < 19) return "pomeriggio";
  if (ora >= 19 && ora < 22) return "sera";
  return "notte";
}

export interface Attivita {
  id: string;
  /** Terza persona, per le didascalie: «risponde al telefono». */
  etichetta: string;
  fasce: Fascia[];
  meteo: CompatibilitaMeteo;
  /** Da che livello si fa. */
  livello: 1 | 2 | 3;
  /** Arredi che servono. */
  richiede: string[];
  /** C'è già l'animazione? (Pilota: solo l'imprenditore.) */
  animata?: boolean;
}

export interface PassoCantiere {
  etichetta: string;
}

export interface Cantiere {
  id: string;
  nome: string;
  /** L'arredo che resta nel prato quando è finito. */
  lascia: string;
  passi: PassoCantiere[];
  animato?: boolean;
}

export interface Mestiere {
  strada: Strada;
  /** I nomi dei tre livelli. */
  livelli: [string, string, string];
  /** Arredi che ha già quando la strada si rivela. */
  iniziali: string[];
  /** In ordine: il primo porta al livello 2, il secondo al 3. */
  cantieri: Cantiere[];
  attivita: Attivita[];
}

const a = (
  id: string,
  etichetta: string,
  fasce: Fascia[],
  livello: 1 | 2 | 3 = 1,
  richiede: string[] = [],
  meteo: CompatibilitaMeteo = "asciutto",
  animata = false,
): Attivita => ({ id, etichetta, fasce, livello, richiede, meteo, animata });

export const MESTIERI: Record<Strada, Mestiere> = {
  imprenditore: {
    strada: "imprenditore",
    livelli: ["La bancarella", "L'ufficio sotto la chioma", "La holding del bosco"],
    iniziali: ["bancarella"],
    cantieri: [
      {
        id: "scrivania",
        nome: "La scrivania",
        lascia: "scrivania",
        animato: true,
        passi: [
          { etichetta: "raccoglie i rami per la scrivania" },
          { etichetta: "sega e inchioda (e si martella un dito)" },
          { etichetta: "monta il piano e mette una ghianda sotto la gamba corta" },
          { etichetta: "inaugura la scrivania col nastro rosso" },
        ],
      },
      {
        id: "insegna",
        nome: "L'insegna",
        lascia: "insegna",
        animato: true,
        passi: [
          { etichetta: "disegna le lettere dell'insegna" },
          { etichetta: "dipinge l'insegna" },
          { etichetta: "appende l'insegna, storta, e la raddrizza" },
        ],
      },
      {
        id: "cassaforte",
        nome: "La cassaforte di ghiande",
        lascia: "cassaforte",
        animato: true,
        passi: [
          { etichetta: "scava la buca della cassaforte" },
          { etichetta: "monta lo sportello della cassaforte" },
          { etichetta: "sceglie la combinazione e la dimentica subito" },
        ],
      },
    ],
    attivita: [
      a("imprenditore.pubblicita", "fa pubblicità col megafono di foglia", ["mattina", "giorno"], 1, ["bancarella"], "asciutto", true),
      a("imprenditore.contratta", "contratta con lo scoiattolo", ["giorno", "pomeriggio"], 1, ["bancarella"], "asciutto", true),
      a("imprenditore.incasso", "conta l'incasso della giornata", ["sera"], 1, ["bancarella"], "qualsiasi", true),
      a("imprenditore.caffe", "beve il caffè alla scrivania", ["mattina"], 2, ["scrivania"], "qualsiasi", true),
      a("imprenditore.telefono", "risponde al telefono", ["giorno", "pomeriggio"], 2, ["scrivania"], "qualsiasi", true),
      a("imprenditore.contratti", "firma contratti col timbro", ["giorno", "pomeriggio"], 2, ["scrivania"], "qualsiasi", true),
      a("imprenditore.riunione", "fa una riunione con lo scoiattolo", ["pomeriggio"], 2, ["scrivania"], "asciutto", true),
      a("imprenditore.chiude", "chiude l'ufficio e spegne la lampada", ["sera"], 2, ["scrivania"], "qualsiasi", true),
      a("imprenditore.deposito", "mette le ghiande in cassaforte", ["sera"], 3, ["cassaforte"], "qualsiasi", true),
      a("imprenditore.notte", "si addormenta alla scrivania", ["notte"], 2, ["scrivania"], "qualsiasi", true),
    ],
  },
  filosofo: {
    strada: "filosofo",
    livelli: ["Il pensatore del prato", "La scuola sotto la chioma", "L'osservatorio"],
    iniziali: [],
    cantieri: [
      { id: "panchina", nome: "La panchina per pensare", lascia: "panchina", passi: [{ etichetta: "sceglie il ramo giusto per la panchina" }, { etichetta: "inchioda la panchina" }, { etichetta: "ci si siede per la prima volta e pensa" }] },
      { id: "biblioteca", nome: "La biblioteca di cortecce", lascia: "biblioteca", passi: [{ etichetta: "raccoglie le cortecce" }, { etichetta: "ci scrive sopra i titoli" }, { etichetta: "le mette in ordine, poi le rimette in disordine" }] },
      { id: "cannocchiale", nome: "Il cannocchiale di canna", lascia: "cannocchiale", passi: [{ etichetta: "taglia una canna" }, { etichetta: "ci mette una goccia di rugiada come lente" }, { etichetta: "guarda la luna per la prima volta" }] },
    ],
    attivita: [
      a("filosofo.vento", "fa domande al vento", ["mattina", "giorno"], 1),
      a("filosofo.aforismi", "scrive aforismi sulle foglie", ["giorno", "pomeriggio"], 1, [], "qualsiasi"),
      a("filosofo.formiche", "osserva le formiche con la lente", ["pomeriggio"], 1),
      a("filosofo.lumaca", "discute con la lumaca", ["pomeriggio", "sera"], 2, ["panchina"]),
      a("filosofo.biblioteca", "consulta la biblioteca di cortecce", ["giorno"], 2, ["biblioteca"], "qualsiasi"),
      a("filosofo.stelle", "guarda le stelle col cannocchiale", ["sera"], 3, ["cannocchiale"]),
    ],
  },
  artista: {
    strada: "artista",
    livelli: ["Il pittore del prato", "L'atelier all'aperto", "La mostra"],
    iniziali: ["cavalletto"],
    cantieri: [
      { id: "atelier", nome: "L'atelier", lascia: "atelier", passi: [{ etichetta: "tende un filo tra due rami" }, { etichetta: "appende le tele ad asciugare" }, { etichetta: "dà un nome all'atelier" }] },
      { id: "scultura", nome: "La scultura", lascia: "scultura", passi: [{ etichetta: "sceglie un ramo da scolpire" }, { etichetta: "scolpisce e si riempie di trucioli" }, { etichetta: "scopre che sembra lo scoiattolo" }] },
      { id: "galleria", nome: "La galleria", lascia: "galleria", passi: [{ etichetta: "costruisce le cornici" }, { etichetta: "appende i quadri" }, { etichetta: "inaugura la mostra" }] },
    ],
    attivita: [
      a("artista.dipinge", "dipinge un quadro", ["mattina", "giorno"], 1, ["cavalletto"]),
      a("artista.ispirazione", "cerca l'ispirazione", ["pomeriggio"], 1, [], "qualsiasi"),
      a("artista.colori", "mescola i colori e si sporca", ["giorno"], 1),
      a("artista.scolpisce", "scolpisce un ramo", ["pomeriggio"], 2, ["atelier"]),
      a("artista.mostra", "fa da guida alla sua mostra", ["pomeriggio", "sera"], 3, ["galleria"]),
    ],
  },
  sportivo: {
    strada: "sportivo",
    livelli: ["L'atleta del prato", "La palestra all'aperto", "Il campione"],
    iniziali: [],
    cantieri: [
      { id: "sbarra", nome: "La sbarra per le trazioni", lascia: "sbarra", passi: [{ etichetta: "pianta due pali" }, { etichetta: "ci lega la sbarra" }, { etichetta: "prova la prima trazione" }] },
      { id: "ostacoli", nome: "Il percorso a ostacoli", lascia: "ostacoli", passi: [{ etichetta: "allinea i sassi" }, { etichetta: "monta gli ostacoli di rami" }, { etichetta: "fa il primo giro cronometrato" }] },
      { id: "podio", nome: "Il podio", lascia: "podio", passi: [{ etichetta: "impila tre ceppi" }, { etichetta: "ci scrive 1, 2, 3" }, { etichetta: "si premia da solo" }] },
    ],
    attivita: [
      a("sportivo.stretching", "fa stretching", ["mattina"], 1, [], "qualsiasi"),
      a("sportivo.corsa", "corre al parco", ["mattina", "giorno"], 1),
      a("sportivo.salto", "fa salto in lungo", ["pomeriggio"], 1),
      a("sportivo.trazioni", "fa trazioni alla sbarra", ["giorno", "pomeriggio"], 2, ["sbarra"]),
      a("sportivo.ostacoli", "fa il percorso a ostacoli", ["pomeriggio"], 3, ["ostacoli"]),
      a("sportivo.premiazione", "si premia sul podio", ["sera"], 3, ["podio"]),
    ],
  },
  furfante: {
    strada: "furfante",
    livelli: ["Il ladruncolo di ghiande", "Il mercato nero del bosco", "Il re del bosco"],
    iniziali: [],
    cantieri: [
      { id: "nascondiglio", nome: "Il nascondiglio", lascia: "nascondiglio", passi: [{ etichetta: "scava una buca segreta" }, { etichetta: "la copre di foglie" }, { etichetta: "dimentica dov'è" }] },
      { id: "mercato", nome: "Il banco del mercato nero", lascia: "mercato", passi: [{ etichetta: "monta un banco sotto un telo" }, { etichetta: "scrive i prezzi in codice" }, { etichetta: "apre con un sussurro" }] },
      { id: "tesoro", nome: "La mappa del tesoro", lascia: "tesoro", passi: [{ etichetta: "disegna la mappa" }, { etichetta: "nasconde il tesoro" }, { etichetta: "lo ritrova, dopo molto cercare" }] },
    ],
    attivita: [
      a("furfante.nasconde", "nasconde le ghiande", ["mattina", "giorno"], 1),
      a("furfante.travestimento", "si traveste da cespuglio", ["giorno"], 1),
      a("furfante.spia", "spia lo scoiattolo", ["pomeriggio"], 1),
      a("furfante.bottino", "conta il bottino", ["sera"], 1, [], "qualsiasi"),
      a("furfante.mercato", "vende ghiande d'importazione", ["pomeriggio"], 2, ["mercato"]),
    ],
  },
  viaggiatore: {
    strada: "viaggiatore",
    livelli: ["Il sognatore di viaggi", "L'agenzia di viaggi del prato", "Il capitano della mongolfiera"],
    iniziali: [],
    cantieri: [
      { id: "bacheca", nome: "La bacheca delle cartoline", lascia: "bacheca", passi: [{ etichetta: "pianta un pannello di corteccia" }, { etichetta: "ci appende le cartoline" }] },
      { id: "cartelli", nome: "I cartelli direzionali", lascia: "cartelli", passi: [{ etichetta: "taglia le frecce" }, { etichetta: "ci scrive città che non ha mai visto" }, { etichetta: "li pianta tutti nella direzione sbagliata" }] },
      { id: "mongolfiera", nome: "La mongolfiera di foglie", lascia: "mongolfiera", passi: [{ etichetta: "cuce le foglie" }, { etichetta: "intreccia la cesta" }, { etichetta: "lega le corde" }, { etichetta: "la gonfia" }, { etichetta: "si alza di un palmo e torna giù felice" }] },
    ],
    attivita: [
      a("viaggiatore.zaino", "prepara lo zaino", ["mattina"], 1, [], "qualsiasi"),
      a("viaggiatore.mappa", "studia la mappa", ["giorno"], 1, [], "qualsiasi"),
      a("viaggiatore.binocolo", "guarda lontano col binocolo", ["pomeriggio"], 1),
      a("viaggiatore.cartoline", "scrive cartoline", ["sera"], 2, ["bacheca"], "qualsiasi"),
      a("viaggiatore.partenza", "fa finta di partire, e torna", ["pomeriggio"], 3, ["mongolfiera"]),
    ],
  },
  poeta: {
    strada: "poeta",
    livelli: ["Il poeta del prato", "Lo scrittoio sotto la chioma", "Il festival di poesia"],
    iniziali: [],
    cantieri: [
      { id: "amaca", nome: "L'amaca", lascia: "amaca", passi: [{ etichetta: "intreccia l'amaca" }, { etichetta: "la lega a due rami" }, { etichetta: "ci si sdraia e non si alza più" }] },
      { id: "scrittoio", nome: "Lo scrittoio", lascia: "scrittoio", passi: [{ etichetta: "trova un ceppo piatto" }, { etichetta: "ci mette il calamaio" }, { etichetta: "scrive la prima riga" }] },
      { id: "filo", nome: "Il filo delle poesie", lascia: "filo", passi: [{ etichetta: "tende un filo tra i rami" }, { etichetta: "ci appende i versi" }] },
    ],
    attivita: [
      a("poeta.scrive", "scrive e cancella", ["mattina", "giorno"], 1, [], "qualsiasi"),
      a("poeta.recita", "recita alle formiche", ["pomeriggio"], 1),
      a("poeta.rima", "cerca una rima", ["giorno"], 1, [], "qualsiasi"),
      a("poeta.amaca", "sonnecchia in amaca", ["pomeriggio"], 2, ["amaca"]),
      a("poeta.versi", "appende un verso al filo", ["sera"], 3, ["filo"]),
    ],
  },
};

/** Il livello: 1 più i cantieri finiti (massimo 3). */
export function livelloDa(strada: Strada, arredi: string[]): 1 | 2 | 3 {
  const finiti = MESTIERI[strada].cantieri.filter((c) => arredi.includes(c.lascia)).length;
  return Math.min(3, 1 + finiti) as 1 | 2 | 3;
}

/** Il prossimo cantiere da cominciare, se ce n'è uno. */
export function prossimoCantiere(strada: Strada, arredi: string[]): Cantiere | null {
  return MESTIERI[strada].cantieri.find((c) => !arredi.includes(c.lascia)) ?? null;
}

/** Le attività possibili adesso: per livello, arredi, fascia e meteo. */
export function attivitaAmmesse(strada: Strada, arredi: string[], fascia: Fascia, pioggia: boolean): Attivita[] {
  const livello = livelloDa(strada, arredi);
  const tutti = [...MESTIERI[strada].iniziali, ...arredi];
  // Prima quelle del suo livello: chi ha l'ufficio non torna volentieri alla bancarella.
  return MESTIERI[strada].attivita
    .filter(
      (x) =>
        x.livello <= livello &&
        x.fasce.includes(fascia) &&
        x.richiede.every((r) => tutti.includes(r)) &&
        (x.meteo === "qualsiasi" || (pioggia ? x.meteo === "pioggia" : x.meteo === "asciutto")),
    )
    .sort((x, y) => y.livello - x.livello);
}

export function attivita(id: string | null | undefined): Attivita | null {
  if (!id) return null;
  for (const m of Object.values(MESTIERI)) {
    const x = m.attivita.find((y) => y.id === id);
    if (x) return x;
  }
  return null;
}

/**
 * La carriera simulata giorno per giorno (per la demo e per le prove): tre
 * giorni per ambientarsi, poi un passo di cantiere al giorno e due giorni di
 * pausa tra un cantiere e l'altro. `giorno` conta da quando la strada si è
 * rivelata. Restituisce gli arredi finiti e, se quel giorno lavora a un
 * cantiere, quale passo.
 */
export function carrieraAlGiorno(strada: Strada, giorno: number): { arredi: string[]; cantiere: { id: string; passo: number } | null } {
  const arredi: string[] = [];
  let inizio = 3;
  for (const c of MESTIERI[strada].cantieri) {
    const fine = inizio + c.passi.length;
    if (giorno < inizio) return { arredi, cantiere: null };
    if (giorno < fine) return { arredi, cantiere: { id: c.id, passo: giorno - inizio } };
    arredi.push(c.lascia);
    inizio = fine + 2;
  }
  return { arredi, cantiere: null };
}
