import { COLLEZIONE, type DatiCollezione, type PaginaCollezione, type Sblocco } from "./collezione";
import { REGALI } from "./regali";
import { FREDDO_SOTTO } from "./scena";
import { stagioneDa, type Cielo, type Indumento } from "./tipi";

// Il catalogo degli oggetti (docs/stanze-e-vita.md, sezione 10): edifici,
// arredi, attrezzi, giochi, vestiti, trofei e rarità. Estende la collezione
// (collezione.ts: le 25 voci di prima restano con lo stesso id) e i regali
// (regali.ts: ogni regalo diventa un oggetto che apre almeno due attività).
//
// Regole fisse:
// - si sblocca solo vivendo, mai comprando; la regola è qui, nel codice, e
//   l'AI non decide niente (al massimo ne parla nel diario, dopo);
// - una voce «in arrivo» non ha ancora il disegno e non si sblocca: si vede
//   nel catalogo come sagoma con l'indizio, e arriva con gli aggiornamenti;
// - i regali non cambiano mai la strada: qui diventano solo oggetti.

export type Categoria = "edificio" | "arredo" | "attrezzo" | "gioco" | "vestito" | "trofeo" | "rarita";

export const CATEGORIE: Categoria[] = ["edificio", "arredo", "gioco", "attrezzo", "vestito", "trofeo", "rarita"];

export const NOMI_CATEGORIA: Record<Categoria, string> = {
  edificio: "Edifici",
  arredo: "Arredi",
  attrezzo: "Attrezzi",
  gioco: "Giochi",
  vestito: "Vestiti",
  trofeo: "Trofei",
  rarita: "Rarità e stagioni",
};

/**
 * Il tipo di posto della stanza (sezione 2.3). Sfondo, prato, davanti e rami
 * si vedono nella scena; armadio e cassetta degli attrezzi no (i vestiti li
 * indossa, gli attrezzi li usa); trofei e rarità stanno nella bacheca, cioè
 * solo nel catalogo.
 */
export type TipoPosto = "sfondo" | "prato" | "davanti" | "rami" | "armadio" | "cassetta" | "bacheca";

/** I posti della stanza 2D, nell'ordine in cui Pino li riempie. */
export const POSTI_STANZA: Record<"sfondo" | "prato" | "davanti" | "rami", string[]> = {
  sfondo: ["sfondo-1", "sfondo-2"],
  prato: ["prato-d1", "prato-s1", "prato-d2", "prato-s2"],
  davanti: ["davanti-1", "davanti-2"],
  rami: ["rami-1", "rami-2"],
};

/** Da dove arriva un oggetto nella stanza (colonna `source` di room_items). */
export type Provenienza = "decisione" | "regalo" | "costruzione";

export interface DatiOggetti extends DatiCollezione {
  /** I regali ricevuti, con il giorno della lettera di ringraziamento. */
  regali: { id: string; giorno: number }[];
  /** La strada presa, se l'ha presa. */
  strada: string | null;
}

export interface VoceCatalogo {
  id: string;
  categoria: Categoria;
  nome: string;
  /** Con l'articolo, per il banner e i fumetti: «l'altalena». */
  articolo: string;
  /** Per la sagoma bloccata: fa venire voglia di tornare, senza spiegare tutto. */
  indizio: string;
  posto: TipoPosto;
  /** Le attività che apre (sezione 5): almeno due per i regali. */
  usi: string[];
  /** «in-arrivo»: il disegno non c'è ancora, e la voce non si sblocca. */
  stato: "disegnato" | "in-arrivo";
  /** Il giorno in cui è scattata, o null. Senza regola si ottiene solo come regalo. */
  regola: ((d: DatiOggetti) => number | null) | null;
  /** Da dove arriva quando lo sblocca vivendo (il regalo lo dice da sé). */
  provenienza: Provenienza;
  /** Il regalo che lo porta (id di REGALI), se c'è. */
  regalo?: string;
  /** Il vestito che Pino sa già indossare. */
  indumento?: Indumento;
  /** Trofei e album: il simbolo della coccarda. */
  simbolo?: string;
}

// ——— Le regole ———

const bagnato = (c: Cielo | null) => c === "pioggia" || c === "temporale";
const freddo = (p: PaginaCollezione) => p.cielo === "neve" || (p.temperatura ?? p.minima ?? 99) < FREDDO_SOTTO;
const caldo = (soglia: number) => (p: PaginaCollezione) => (p.massima ?? p.temperatura ?? -99) >= soglia;
const stagione = (p: PaginaCollezione) => stagioneDa(new Date(`${p.data}T12:00:00`));

function ennesimo(d: DatiOggetti, n: number, se: (p: PaginaCollezione) => boolean): number | null {
  let visti = 0;
  for (const p of d.pagine) if (se(p) && ++visti === n) return p.giorno;
  return null;
}

/** L'n-esima volta che fa una di queste azioni. */
const fatto = (n: number, ...azioni: string[]) => (d: DatiOggetti) => ennesimo(d, n, (p) => azioni.includes(p.azione));
/** L'n-esimo giorno con questo tempo. */
const tempo = (n: number, se: (p: PaginaCollezione) => boolean) => (d: DatiOggetti) => ennesimo(d, n, se);
/** Il giorno n della sua vita. */
const giorno = (n: number) => (d: DatiOggetti) => ennesimo(d, 1, (p) => p.giorno >= n);
/** Qualche giorno dopo aver preso una strada precisa. */
const strada = (s: string, dopo: number) => (d: DatiOggetti) => {
  if (d.strada !== s || d.giornoStrada === null) return null;
  const quando = d.giornoStrada + dopo;
  return d.oggi >= quando ? quando : null;
};
/** Il primo giorno in cui un giorno di sole arriva dopo uno di pioggia. */
const dopoLaPioggia = (d: DatiOggetti) => {
  for (let i = 1; i < d.pagine.length; i++) {
    if (bagnato(d.pagine[i - 1].cielo) && d.pagine[i].cielo === "sole") return d.pagine[i].giorno;
  }
  return null;
};
/** La prima che scatta tra più regole. */
const oppure =
  (...regole: ((d: DatiOggetti) => number | null)[]) =>
  (d: DatiOggetti) => {
    const giorni = regole.map((r) => r(d)).filter((g): g is number => g !== null);
    return giorni.length ? Math.min(...giorni) : null;
  };

// ——— Le voci di prima (collezione.ts), nelle categorie nuove ———

const DA_COLLEZIONE: Record<string, Pick<VoceCatalogo, "categoria" | "posto" | "usi" | "articolo"> & Partial<VoceCatalogo>> = {
  ombrello: { categoria: "attrezzo", posto: "cassetta", articolo: "l'ombrello", usi: ["legge sotto l'ombrello", "riunione sotto un ombrello solo"] },
  tazza: { categoria: "attrezzo", posto: "cassetta", articolo: "la tazza della tisana", usi: ["prepara la tisana", "fa colazione con la rugiada"] },
  libro: { categoria: "attrezzo", posto: "cassetta", articolo: "il libro", usi: ["legge un libro", "conserva la foglia d'oro"] },
  quaderno: { categoria: "attrezzo", posto: "cassetta", articolo: "il quaderno delle poesie", usi: ["scrive nel taccuino", "cerca una rima"] },
  valigia: { categoria: "arredo", posto: "davanti", articolo: "la valigia", usi: ["prepara lo zaino", "fa finta di partire"] },
  berretto: { categoria: "vestito", posto: "armadio", articolo: "il berretto di lana", indumento: "cappello", usi: ["esce col freddo", "fa il pupazzo di neve"] },
  sciarpa: { categoria: "vestito", posto: "armadio", articolo: "la sciarpa", indumento: "sciarpa", usi: ["si scalda le mani al fuoco", "battaglia di palle di neve"] },
  occhiali: { categoria: "vestito", posto: "armadio", articolo: "gli occhiali da sole", indumento: "occhiali-sole", usi: ["prende il sole", "fa il divo del prato"] },
};

const ARTICOLI_TROFEI: Record<string, string> = {
  "prima-pioggia": "la prima pioggia",
  "primo-temporale": "il primo temporale",
  "prima-nebbia": "la prima nebbia",
  "prima-neve": "la prima neve",
  "primo-gelo": "il primo gelo",
  "gran-caldo": "il gran caldo",
  "una-settimana": "una settimana di diario",
  "trenta-giorni": "trenta giorni di diario",
  "cento-giorni": "cento giorni di diario",
  "dieci-cose": "dieci cose diverse",
  "la-strada": "la strada presa",
  "primo-regalo": "il primo regalo",
  "prima-chiacchierata": "la prima chiacchierata",
  primavera: "la pagina della primavera",
  estate: "la pagina dell'estate",
  autunno: "la pagina dell'autunno",
  inverno: "la pagina dell'inverno",
};

/** I regali che portano una voce di prima (stesso id). */
const REGALO_DI: Record<string, string> = { berretto: "berretto", sciarpa: "sciarpa", occhiali: "occhiali", libro: "libro", ombrello: "ombrello", tazza: "tazza", quaderno: "quaderno", valigia: "valigia" };

function daCollezione(s: Sblocco): VoceCatalogo {
  const extra = DA_COLLEZIONE[s.id];
  const base: VoceCatalogo = {
    id: s.id,
    categoria: s.tipo === "stagione" ? "rarita" : "trofeo",
    nome: s.nome,
    articolo: ARTICOLI_TROFEI[s.id] ?? s.nome.toLowerCase(),
    indizio: s.come,
    posto: "bacheca",
    usi: [],
    stato: "disegnato",
    regola: s.regola,
    provenienza: "decisione",
    simbolo: s.icona,
  };
  if (!extra) return base;
  return { ...base, ...extra, simbolo: undefined, regalo: REGALO_DI[s.id] };
}

// ——— Le voci nuove ———

type Nuova = Omit<VoceCatalogo, "stato" | "provenienza"> & Partial<Pick<VoceCatalogo, "stato" | "provenienza">>;

const NUOVE: Nuova[] = [
  // ——— Edifici (sfondo): li costruisce lui ———
  { id: "casetta", categoria: "edificio", nome: "La casetta di legno", articolo: "la casetta di legno", indizio: "Dopo tre settimane di vita ogni albero vuole un tetto.", posto: "sfondo", usi: ["apre le finestre della casetta", "spazza davanti a casa", "dipinge un murale sulla casetta"], regola: giorno(21), provenienza: "costruzione" },
  { id: "serra", categoria: "edificio", nome: "La serra", articolo: "la serra", indizio: "A forza di annaffiarsi, gli viene voglia di un orto al riparo.", posto: "sfondo", usi: ["zappa l'aiuola", "semina", "annaffia l'orto"], regola: fatto(4, "annaffiarsi"), provenienza: "costruzione" },
  { id: "faro", categoria: "edificio", nome: "Il faro del prato", articolo: "il faro del prato", indizio: "Chi studia tante mappe prima o poi vuole una luce per tornare.", posto: "sfondo", usi: ["guarda col binocolo", "accende le lanterne", "racconta viaggi mai fatti"], regola: oppure(fatto(4, "studiare-mappa"), strada("viaggiatore", 10)), provenienza: "costruzione" },
  { id: "pozzo", categoria: "edificio", nome: "Il pozzo", articolo: "il pozzo", indizio: "Tre giorni di gran caldo, e la sete si fa sentire.", posto: "sfondo", usi: ["raccoglie l'acqua", "annaffia l'orto", "esprime un desiderio"], regola: tempo(3, caldo(28)), provenienza: "costruzione" },
  { id: "forno", categoria: "edificio", nome: "Il forno di sassi", articolo: "il forno di sassi", indizio: "Dieci giorni di freddo fanno venire voglia di qualcosa di caldo.", posto: "sfondo", usi: ["cucina una zuppa", "cuoce la marmellata", "arrostisce castagne"], regola: tempo(10, freddo), provenienza: "costruzione" },
  { id: "tenda", categoria: "edificio", nome: "La tenda da campo", articolo: "la tenda da campo", indizio: "Chi prepara spesso la valigia vuole provare a dormire fuori.", posto: "sfondo", usi: ["prova la tenda", "racconta viaggi mai fatti"], regola: fatto(3, "fare-valigia"), provenienza: "costruzione" },
  { id: "palco", categoria: "edificio", nome: "Il palco", articolo: "il palco", indizio: "Ballare da solo va bene, ma un palco è un'altra cosa.", posto: "sfondo", usi: ["balla da solo", "organizza una serata di poesia", "dirige il concerto delle cicale"], regola: fatto(4, "ballare"), provenienza: "costruzione" },
  { id: "osservatorio", categoria: "edificio", nome: "L'osservatorio", articolo: "l'osservatorio", indizio: "Ha guardato il cielo tante volte: ora lo vuole vedere da vicino.", posto: "sfondo", usi: ["guarda le stelle", "aspetta la pioggia di stelle", "tiene lezione agli alberi"], regola: oppure(fatto(8, "guardare-cielo"), strada("filosofo", 20)), provenienza: "costruzione" },
  { id: "biblioteca", categoria: "edificio", nome: "La biblioteca del bosco", articolo: "la biblioteca del bosco", indizio: "I libri letti cominciano a non stare più in un ramo solo.", posto: "sfondo", usi: ["consulta la biblioteca", "legge un libro", "presta un libro allo scoiattolo"], regola: fatto(8, "leggere", "giornale-ombrello"), provenienza: "costruzione" },
  { id: "atelier", categoria: "edificio", nome: "L'atelier", articolo: "l'atelier", indizio: "Tanti quadri hanno bisogno di una casa con la luce giusta.", posto: "sfondo", usi: ["dipinge", "prepara la mostra", "appende un quadro e lo raddrizza"], regola: oppure(fatto(5, "dipingere"), strada("artista", 15)), provenienza: "costruzione" },

  // ——— Arredi grandi (prato) ———
  { id: "panchina", categoria: "arredo", nome: "La panchina", articolo: "la panchina", indizio: "Per guardare il cielo serve un posto dove sedersi.", posto: "prato", usi: ["guarda il tramonto", "legge un libro", "medita sul sasso piatto"], regola: fatto(3, "guardare-cielo", "meditare"), provenienza: "costruzione" },
  { id: "amaca", categoria: "arredo", nome: "L'amaca", articolo: "l'amaca", indizio: "Tre pisolini sull'erba, e la schiena chiede di meglio.", posto: "prato", usi: ["sonnecchia in amaca", "osserva le nuvole", "legge un libro"], regola: fatto(3, "sonnellino"), provenienza: "costruzione" },
  { id: "cavalletto", categoria: "arredo", nome: "Il cavalletto", articolo: "il cavalletto", indizio: "La prima volta che prende in mano un pennello.", posto: "prato", usi: ["dipinge", "ritrae gli altri alberi", "mescola i colori"], regola: fatto(1, "dipingere"), provenienza: "costruzione" },
  { id: "scrittoio", categoria: "arredo", nome: "Lo scrittoio", articolo: "lo scrittoio", indizio: "Cinque poesie scritte sulle ginocchia sono abbastanza.", posto: "prato", usi: ["scrive nel taccuino", "cerca una rima", "scrive un trattato e lo perde"], regola: fatto(5, "scrivere-poesia"), provenienza: "costruzione" },
  { id: "tavolino", categoria: "arredo", nome: "Il tavolino", articolo: "il tavolino", indizio: "Tre tisane bevute in piedi: ci vuole un tavolo.", posto: "prato", usi: ["cena sotto la luna", "prepara la tisana", "gioca a scacchi da solo"], regola: fatto(3, "bere-tisana"), provenienza: "costruzione" },
  { id: "sbarra", categoria: "arredo", nome: "La sbarra", articolo: "la sbarra", indizio: "Chi si allena spesso vuole qualcosa a cui appendersi.", posto: "prato", usi: ["fa le trazioni", "sfida gli altri a braccio di ferro", "misura il record"], regola: oppure(fatto(3, "allenarsi"), strada("sportivo", 5)), provenienza: "costruzione" },
  { id: "aiuola", categoria: "arredo", nome: "L'aiuola", articolo: "l'aiuola", indizio: "Due volte annaffiato: forse qualcosa può crescere anche accanto.", posto: "prato", usi: ["zappa l'aiuola", "semina", "annaffia l'orto"], regola: fatto(2, "annaffiarsi"), provenienza: "costruzione" },
  { id: "muretto", categoria: "arredo", nome: "Il muretto di sassi", articolo: "il muretto di sassi", indizio: "Passeggiando si raccolgono tanti sassi. Che farne?", posto: "prato", usi: ["costruisce un muretto di sassi", "cerca sassi belli", "costruisce un castello di sassi"], regola: fatto(5, "passeggiata", "corsa"), provenienza: "costruzione" },
  { id: "ombrellone", categoria: "arredo", nome: "L'ombrellone", articolo: "l'ombrellone", indizio: "Tre giorni di gran caldo e anche un albero cerca l'ombra.", posto: "prato", usi: ["prende il sole", "si sventola col ventaglio", "vende ombra a metà prezzo"], regola: tempo(3, caldo(30)), provenienza: "decisione" },

  // ——— Arredi piccoli (davanti) ———
  { id: "falo", categoria: "arredo", nome: "Il cerchio del falò", articolo: "il cerchio del falò", indizio: "Cinque giorni di freddo: ci vuole un fuoco.", posto: "davanti", usi: ["accende il fuoco", "arrostisce castagne", "racconta storie al fuoco"], regola: tempo(5, freddo), provenienza: "costruzione" },
  { id: "lanterna", categoria: "arredo", nome: "La lanterna", articolo: "la lanterna", indizio: "Dopo dieci notti nel prato, un po' di luce non guasta.", posto: "davanti", usi: ["accende le lanterne", "conta le lucciole", "scrive il diario della giornata"], regola: giorno(10), provenienza: "decisione" },
  { id: "sgabello", categoria: "arredo", nome: "Lo sgabello", articolo: "lo sgabello", indizio: "Pensare tanto stanca le radici.", posto: "davanti", usi: ["si siede un attimo", "pesca nella pozzanghera", "ritrae gli altri alberi"], regola: fatto(3, "pensare"), provenienza: "costruzione" },
  { id: "vaso", categoria: "arredo", nome: "Il vaso di fiori", articolo: "il vaso di fiori", indizio: "Tre giorni al sole, e qualcosa fiorisce.", posto: "davanti", usi: ["annaffia i fiori", "si commuove per il primo fiore"], regola: fatto(3, "prendere-sole"), provenienza: "decisione" },
  { id: "catasta", categoria: "arredo", nome: "La catasta di legna", articolo: "la catasta di legna", indizio: "I temporali lasciano sempre qualche ramo per terra.", posto: "davanti", usi: ["raccoglie rami", "accende il fuoco", "rastrella i rami del temporale"], regola: tempo(2, (p) => p.cielo === "temporale"), provenienza: "decisione" },

  // ——— Cose appese (rami) ———
  { id: "altalena", categoria: "arredo", nome: "L'altalena", articolo: "l'altalena", indizio: "Due settimane di vita: è l'età giusta per dondolare.", posto: "rami", usi: ["va in altalena", "dondola e ride"], regola: giorno(15), provenienza: "costruzione" },
  { id: "casetta-uccelli", categoria: "arredo", nome: "La casetta degli uccelli", articolo: "la casetta degli uccelli", indizio: "Dieci giorni di sole, e gli uccelli cercano casa.", posto: "rami", usi: ["saluta gli uccelli", "fischia con il merlo", "concerto della mattina"], regola: tempo(10, (p) => p.cielo === "sole"), provenienza: "costruzione" },
  { id: "filo-poesie", categoria: "arredo", nome: "Il filo delle poesie", articolo: "il filo delle poesie", indizio: "Quando le poesie sono troppe per il quaderno, si appendono.", posto: "rami", usi: ["appende un verso", "rilegge le poesie al vento"], regola: oppure(fatto(7, "scrivere-poesia"), strada("poeta", 10)), provenienza: "decisione" },
  { id: "festoni", categoria: "arredo", nome: "I festoni", articolo: "i festoni", indizio: "Quaranta giorni di vita meritano una festa.", posto: "rami", usi: ["la festa improvvisata", "balla da solo"], regola: giorno(40), provenienza: "decisione" },

  // ——— Attrezzi (cassetta degli attrezzi) ———
  { id: "annaffiatoio", categoria: "attrezzo", nome: "L'annaffiatoio", articolo: "l'annaffiatoio", indizio: "La prima volta che si prende cura di sé con l'acqua.", posto: "cassetta", usi: ["si annaffia", "annaffia l'orto"], regola: fatto(1, "annaffiarsi"), provenienza: "decisione" },
  { id: "rastrello", categoria: "attrezzo", nome: "Il rastrello", articolo: "il rastrello", indizio: "Cinque giorni d'autunno, e le foglie sono ovunque.", posto: "cassetta", usi: ["rastrella le foglie", "si tuffa nelle foglie"], regola: tempo(5, (p) => stagione(p) === "autunno"), provenienza: "decisione" },
  { id: "scopa", categoria: "attrezzo", nome: "La scopa di saggina", articolo: "la scopa di saggina", indizio: "Dopo cinque giorni il prato va tenuto in ordine.", posto: "cassetta", usi: ["spazza davanti a casa", "balla con la scopa"], regola: giorno(5), provenienza: "decisione" },
  { id: "secchio", categoria: "attrezzo", nome: "Il secchio", articolo: "il secchio", indizio: "Due giorni di pioggia: peccato sprecarla.", posto: "cassetta", usi: ["mette il secchio sotto la pioggia", "raccoglie la rugiada"], regola: tempo(2, (p) => bagnato(p.cielo)), provenienza: "decisione" },
  { id: "lente", categoria: "attrezzo", nome: "La lente d'ingrandimento", articolo: "la lente d'ingrandimento", indizio: "Chi pensa tanto vuole guardare le cose piccole.", posto: "cassetta", usi: ["osserva le formiche con la lente", "esamina un sasso bello"], regola: oppure(fatto(5, "pensare", "meditare"), strada("filosofo", 3)), provenienza: "decisione" },
  { id: "cannocchiale", categoria: "attrezzo", nome: "Il cannocchiale", articolo: "il cannocchiale", indizio: "Sei volte a naso in su: le nuvole sono troppo lontane.", posto: "cassetta", usi: ["guarda le stelle", "guarda l'eclissi"], regola: fatto(6, "guardare-cielo"), provenienza: "decisione" },
  { id: "acciarino", categoria: "attrezzo", nome: "L'acciarino", articolo: "l'acciarino", indizio: "Dopo tanti giorni di freddo, accendere il fuoco diventa un'arte.", posto: "cassetta", usi: ["accende il fuoco", "accende le lanterne"], regola: tempo(15, freddo), provenienza: "decisione" },
  { id: "canna-pesca", categoria: "attrezzo", nome: "La canna da pesca", articolo: "la canna da pesca", indizio: "Cinque giorni di pioggia lasciano pozzanghere piene di sorprese.", posto: "cassetta", usi: ["pesca nella pozzanghera", "lancia un messaggio in bottiglia"], regola: tempo(5, (p) => bagnato(p.cielo)), provenienza: "decisione" },
  { id: "tavolozza", categoria: "attrezzo", nome: "La tavolozza", articolo: "la tavolozza", indizio: "Tre quadri fatti con i colori sparsi sul prato.", posto: "cassetta", usi: ["mescola i colori", "fa i colori con le bacche"], regola: fatto(3, "dipingere"), provenienza: "decisione" },
  { id: "binocolo", categoria: "attrezzo", nome: "Il binocolo", articolo: "il binocolo", indizio: "Studiare le mappe non basta: bisogna vedere lontano.", posto: "cassetta", usi: ["guarda col binocolo", "spia lo scoiattolo"], regola: oppure(fatto(2, "studiare-mappa"), strada("viaggiatore", 3)), provenienza: "decisione" },

  // ——— Giochi ———
  { id: "pallone", categoria: "gioco", nome: "Il pallone", articolo: "il pallone", indizio: "Corre così tanto che gli manca solo qualcosa da calciare.", posto: "davanti", usi: ["gioca a palla", "partita a palla con gli altri"], regola: fatto(2, "corsa", "allenarsi"), provenienza: "decisione" },
  { id: "aquilone", categoria: "gioco", nome: "L'aquilone", articolo: "l'aquilone", indizio: "Arriva solo come regalo.", posto: "rami", usi: ["fa volare l'aquilone", "ripara l'aquilone dopo il temporale"], regola: null, provenienza: "regalo", regalo: "aquilone" },
  { id: "bici", categoria: "gioco", nome: "La bicicletta", articolo: "la bicicletta", indizio: "Arriva solo come regalo.", posto: "davanti", usi: ["fa un giro in bicicletta", "porta lo scoiattolo nel cestino", "suona il campanello alle formiche"], regola: null, provenienza: "regalo", regalo: "bici" },
  { id: "bolle", categoria: "gioco", nome: "Le bolle di sapone", articolo: "le bolle di sapone", indizio: "Una doccia sotto la pioggia, e la schiuma resta.", posto: "davanti", usi: ["fa le bolle di sapone", "insegue le bolle"], regola: fatto(1, "doccia"), provenienza: "decisione" },
  { id: "trottola", categoria: "gioco", nome: "La trottola di ghianda", articolo: "la trottola di ghianda", indizio: "Tre volte a contare ghiande: una si può far girare.", posto: "davanti", usi: ["fa girare la trottola", "sfida lo scoiattolo"], regola: fatto(3, "contare-ghiande", "vendere-ombra"), provenienza: "decisione" },
  { id: "aereo-carta", categoria: "gioco", nome: "L'aereo di carta", articolo: "l'aereo di carta", indizio: "Le mappe vecchie si piegano bene.", posto: "davanti", usi: ["piega un aereo di carta e lo lancia", "manda messaggi in volo"], regola: fatto(3, "studiare-mappa", "fare-valigia"), provenienza: "decisione" },
  { id: "scacchi", categoria: "gioco", nome: "La scacchiera", articolo: "la scacchiera", indizio: "Chi medita spesso ha bisogno di un avversario. Anche se stesso.", posto: "davanti", usi: ["gioca a scacchi da solo e perde", "sfida il filosofo della stanza"], regola: fatto(4, "meditare", "pensare"), provenienza: "decisione" },

  // ——— Vestiti (armadio): li indossa ———
  { id: "basco", categoria: "vestito", nome: "Il basco", articolo: "il basco", indizio: "Ogni artista, prima o poi, ne trova uno.", posto: "armadio", indumento: "basco", usi: ["dipinge col basco", "fa da guida alla mostra"], regola: oppure(fatto(4, "dipingere"), strada("artista", 1)), provenienza: "decisione" },
  { id: "bandana", categoria: "vestito", nome: "La bandana", articolo: "la bandana", indizio: "Ha l'aria di chi conta le ghiande degli altri.", posto: "armadio", indumento: "bandana", usi: ["fa la guardia col cappello calato", "prova l'aria da duro"], regola: oppure(fatto(4, "contare-ghiande"), strada("furfante", 1)), provenienza: "decisione" },
  { id: "cravatta", categoria: "vestito", nome: "La cravatta", articolo: "la cravatta", indizio: "Tre telefonate importanti: ci vuole un po' di serietà.", posto: "armadio", indumento: "cravatta", usi: ["risponde al telefono", "firma contratti"], regola: oppure(fatto(3, "telefonata", "vendere-ombra"), strada("imprenditore", 1)), provenienza: "decisione" },
  { id: "berretto-notte", categoria: "vestito", nome: "Il berretto da notte", articolo: "il berretto da notte", indizio: "Due pisolini e capisce che dormire è una cosa seria.", posto: "armadio", indumento: "berretto-notte", usi: ["si prepara per la notte", "parla nel sonno"], regola: fatto(2, "sonnellino", "dormire"), provenienza: "decisione" },
  { id: "piuma", categoria: "vestito", nome: "La piuma sul cappello", articolo: "la piuma", indizio: "Una poesia ben riuscita merita una piuma.", posto: "armadio", indumento: "piuma", usi: ["recita alle formiche", "scrive con la piuma"], regola: oppure(fatto(2, "scrivere-poesia"), strada("poeta", 1)), provenienza: "decisione" },
  { id: "zaino", categoria: "vestito", nome: "Lo zaino", articolo: "lo zaino", indizio: "Tre passeggiate con le mani piene.", posto: "armadio", indumento: "zaino", usi: ["prepara lo zaino", "parte per la passeggiata"], regola: oppure(fatto(3, "passeggiata"), strada("viaggiatore", 1)), provenienza: "decisione" },
  { id: "fascia", categoria: "vestito", nome: "La fascia da campione", articolo: "la fascia da campione", indizio: "Due allenamenti sudati.", posto: "armadio", indumento: "fascia", usi: ["fa ginnastica col sole", "organizza la corsa della stanza"], regola: oppure(fatto(2, "allenarsi", "corsa"), strada("sportivo", 1)), provenienza: "decisione" },
  { id: "occhiali-tondi", categoria: "vestito", nome: "Gli occhiali tondi", articolo: "gli occhiali tondi", indizio: "A forza di leggere, le lettere si fanno piccole.", posto: "armadio", indumento: "occhiali-tondi", usi: ["legge il giornale delle foglie", "consulta la biblioteca"], regola: fatto(5, "leggere", "giornale-ombrello"), provenienza: "decisione" },

  // ——— Trofei nuovi ———
  { id: "cinquanta-giorni", categoria: "trofeo", nome: "Cinquanta giorni di diario", articolo: "cinquanta giorni di diario", indizio: "Arrivare al giorno 50.", posto: "bacheca", usi: [], simbolo: "50", regola: giorno(50) },
  { id: "un-anno", categoria: "trofeo", nome: "Un anno di vita", articolo: "un anno di vita", indizio: "Arrivare al giorno 365.", posto: "bacheca", usi: [], simbolo: "1", regola: giorno(365) },
  { id: "sempre-in-moto", categoria: "trofeo", nome: "Sempre in movimento", articolo: "sempre in movimento", indizio: "Dieci giornate a correre, allenarsi o camminare.", posto: "bacheca", usi: [], simbolo: "➶", regola: fatto(10, "corsa", "allenarsi", "passeggiata", "ballare") },

  // ——— Rarità ———
  { id: "arcobaleno", categoria: "rarita", nome: "L'arcobaleno", articolo: "l'arcobaleno", indizio: "Dopo la pioggia, se torna il sole…", posto: "bacheca", usi: ["corre a cercarne la fine"], regola: dopoLaPioggia },
  { id: "foglia-oro", categoria: "rarita", nome: "La foglia d'oro", articolo: "la foglia d'oro", indizio: "In autunno, una sola foglia cade diversa dalle altre.", posto: "bacheca", usi: ["la conserva nel libro"], regola: tempo(20, (p) => stagione(p) === "autunno") },
  { id: "pupazzo-neve", categoria: "rarita", nome: "Il pupazzo di neve", articolo: "il pupazzo di neve", indizio: "Ci vuole parecchia neve.", posto: "davanti", usi: ["fa il pupazzo di neve", "gli presta la sciarpa"], regola: tempo(3, (p) => p.cielo === "neve"), provenienza: "costruzione" },

  // ——— In arrivo: nel catalogo, senza disegno, non si sbloccano ancora ———
  ...(
    [
      ["mulino", "edificio", "Il mulino a vento", "sfondo", "Gira solo quando c'è vento."],
      ["capanno", "edificio", "Il capanno degli attrezzi", "sfondo", "Quando gli attrezzi non stanno più nella cassetta."],
      ["casa-albero", "edificio", "La casa sull'albero", "sfondo", "Un albero che costruisce una casa su un altro albero."],
      ["galleria", "edificio", "La galleria", "sfondo", "Dopo l'atelier, la mostra."],
      ["holding", "edificio", "La sede di Ghiande & Co.", "sfondo", "Per chi fa affari molto, molto seri."],
      ["covo", "edificio", "Il covo della banda", "sfondo", "Nessuno sa dov'è. Neanche lui, a volte."],
      ["mongolfiera", "edificio", "La mongolfiera", "sfondo", "Il viaggio più lungo comincia con tante foglie cucite."],
      ["scuola", "edificio", "La scuola sotto la chioma", "sfondo", "Per chi ha sempre una lezione da dare."],
      ["podio", "edificio", "Il podio", "sfondo", "Serve un torneo, prima."],
      ["orto-grande", "edificio", "L'orto comunitario", "sfondo", "Si fa in tanti."],
      ["tappeto", "arredo", "La coperta da picnic", "davanti", "Si stende nei giorni di sole."],
      ["tinozza", "arredo", "La tinozza", "davanti", "Per il bagno nei giorni di caldo."],
      ["campanella", "arredo", "La campanella a vento", "rami", "Suona solo con il vento giusto."],
      ["lavagna-piccola", "arredo", "La lavagnetta", "prato", "Per i piani segreti e le lezioni."],
      ["bancone", "arredo", "Il banco sotto il telo", "prato", "Per gli affari di ghiande d'importazione."],
      ["bacheca-viaggi", "arredo", "La bacheca dei viaggi", "prato", "Cartoline da posti mai visti."],
      ["leggio", "arredo", "Il leggio", "davanti", "Per le serate di poesia."],
      ["cassaforte-piccola", "arredo", "Il salvadanaio di corteccia", "davanti", "Per le ghiande di scorta."],
      ["lanterne-carta", "arredo", "Le lanterne di carta", "rami", "Si accendono la notte delle lucciole."],
      ["zappa", "attrezzo", "La zappa", "cassetta", "Per l'orto serio."],
      ["martello", "attrezzo", "Il martello", "cassetta", "Qualcosa da riparare c'è sempre."],
      ["fischietto", "attrezzo", "Il fischietto", "cassetta", "Per allenare lo scoiattolo."],
      ["megafono", "attrezzo", "Il megafono", "cassetta", "Per la pubblicità delle ghiande."],
      ["pentola", "attrezzo", "La pentola", "cassetta", "Per la zuppa del bosco."],
      ["flauto", "attrezzo", "Il flauto di canna", "cassetta", "Stona, ma con passione."],
      ["birilli", "gioco", "I birilli", "davanti", "Per le domeniche di sole."],
      ["cerchio", "gioco", "Il cerchio", "davanti", "Gira, gira, gira."],
      ["telefono-barattolo", "gioco", "Il telefono di barattolo", "davanti", "Per parlare con l'albero accanto."],
      ["giocoliere", "gioco", "Le clave del giocoliere", "davanti", "Il circo del bosco passa di rado."],
      ["gessato", "vestito", "Il gessato", "armadio", "Per le riunioni di famiglia della banda."],
      ["impermeabile", "vestito", "L'impermeabile giallo", "armadio", "Per chi ama la pioggia davvero."],
      ["costume", "vestito", "Il costume da bagno", "armadio", "Per i giorni di caldo vero."],
      ["corona", "vestito", "La corona di foglie", "armadio", "Per il re del bosco."],
      ["guanti", "vestito", "I guanti di lana", "armadio", "Per il freddo che morde."],
      ["prima-stella", "rarita", "La stella cadente", "bacheca", "Nelle notti d'agosto, se guarda in su."],
      ["fossile", "rarita", "Il fossile", "bacheca", "Scavando, molto raramente."],
      ["sasso-speciale", "rarita", "Il sasso del ruscello", "bacheca", "Torna dalla gita al ruscello."],
      ["lettera-bottiglia", "rarita", "La lettera nella bottiglia", "bacheca", "Il mare non c'è, ma le bottiglie arrivano."],
      ["ospite", "trofeo", "L'ospite inatteso", "bacheca", "Qualcuno, un giorno, bussa."],
      ["compleanno", "trofeo", "Il primo compleanno", "bacheca", "Una torta di muschio, prima o poi."],
    ] as [string, Categoria, string, TipoPosto, string][]
  ).map(
    ([id, categoria, nome, posto, indizio]): Nuova => ({
      id,
      categoria,
      nome,
      articolo: nome.charAt(0).toLowerCase() + nome.slice(1),
      indizio,
      posto,
      usi: [],
      regola: null,
      stato: "in-arrivo",
    }),
  ),
];

export const CATALOGO: VoceCatalogo[] = [
  ...COLLEZIONE.map(daCollezione),
  ...NUOVE.map((v): VoceCatalogo => ({ stato: "disegnato", provenienza: "decisione", ...v })),
];

const PER_ID = new Map(CATALOGO.map((v) => [v.id, v]));

export function voce(id: string): VoceCatalogo | null {
  return PER_ID.get(id) ?? null;
}

/** Quante voci ha il catalogo in tutto (anche quelle in arrivo): il «TOT» del banner. */
export const TOTALE_CATALOGO = CATALOGO.length;

/** La voce che un regalo porta nella stanza. */
export function voceDelRegalo(regalo: string): VoceCatalogo | null {
  return CATALOGO.find((v) => v.regalo === regalo) ?? null;
}

/** Il giorno in cui la voce è scattata: vivendo o ricevendola in regalo. */
export function quandoScatta(v: VoceCatalogo, d: DatiOggetti): { giorno: number; provenienza: Provenienza } | null {
  if (v.stato !== "disegnato") return null;
  const vissuto = v.regola ? v.regola(d) : null;
  const dono = v.regalo ? d.regali.find((r) => r.id === v.regalo)?.giorno ?? null : null;
  if (dono !== null && (vissuto === null || dono <= vissuto)) return { giorno: dono, provenienza: "regalo" };
  if (vissuto !== null) return { giorno: vissuto, provenienza: v.provenienza };
  return null;
}

/** Le voci scattate e non ancora registrate, con il loro giorno. */
export function nuoviDalCatalogo(d: DatiOggetti, gia: Set<string>): { id: string; giorno: number; provenienza: Provenienza }[] {
  const nuovi: { id: string; giorno: number; provenienza: Provenienza }[] = [];
  for (const v of CATALOGO) {
    if (gia.has(v.id)) continue;
    const s = quandoScatta(v, d);
    if (s) nuovi.push({ id: v.id, ...s });
  }
  return nuovi;
}

/** Si vede nella scena della stanza? */
export function inScena(v: VoceCatalogo): v is VoceCatalogo & { posto: keyof typeof POSTI_STANZA } {
  return v.posto in POSTI_STANZA;
}

/**
 * Pino sistema da solo le cose nuove (proposta della sezione 2.3): il primo
 * posto libero del suo tipo; se sono tutti pieni, toglie la cosa più vecchia di
 * quel tipo (resta nella collezione, in deposito) e ci mette la nuova.
 * `occupati`: posto → oggetto, nell'ordine in cui sono arrivati.
 */
export function postoPerNuovo(
  v: VoceCatalogo,
  occupati: { item: string; place: string | null }[],
): { posto: string | null; toglie: string | null } {
  if (!inScena(v)) return { posto: null, toglie: null };
  const posti = POSTI_STANZA[v.posto];
  const pieni = new Set(occupati.map((o) => o.place));
  const libero = posti.find((p) => !pieni.has(p));
  if (libero) return { posto: libero, toglie: null };
  const vecchio = occupati.find((o) => o.place && posti.includes(o.place));
  return { posto: vecchio?.place ?? null, toglie: vecchio?.item ?? null };
}

/** I regali del catalogo dei regali che non hanno ancora una voce: devono essere zero. */
export const REGALI_SENZA_OGGETTO = REGALI.filter((r) => !voceDelRegalo(r.id)).map((r) => r.id);
