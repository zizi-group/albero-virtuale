import { AZIONI } from "./azioni";
import { MESTIERI, type Attivita, type Cantiere, type Fascia } from "./mestieri";
import { STRADE, type Strada } from "./strade";

// Le imprese (docs/stanze-e-vita.md, sezione 6): progetti lunghi con un capo e
// dei sostenitori. Estendono i mestieri: i tre livelli e i tre cantieri di ogni
// strada (mestieri.ts) diventano i livelli dell'impresa principale di quella
// strada. Le imprese libere non hanno strada e si aprono finendo una catena.
//
// Tutto qui è codice puro e deterministico: lo decide il codice, mai l'AI
// (sezione 3.2). Il contagio, chi entra e chi esce, sta in contagio.ts.

export interface Ruolo {
  id: string;
  nome: string;
  /** Che cosa fa nel suo ruolo, in terza persona: «fa la guardia col cappello calato». */
  fa: string;
}

export interface TipoImpresa {
  id: string;
  nome: string;
  /** La strada dell'impresa principale; null per le imprese libere. */
  strada: Strada | null;
  livelli: [string, string, string];
  /** In ordine: il primo porta al livello 2, il secondo al 3, il terzo la completa. */
  cantieri: Cantiere[];
  /** Edifici e oggetti dell'impresa (tabella della sezione 6). */
  oggetti: string[];
  /** Ruoli dei sostenitori, assegnati a turno. */
  ruoli: Ruolo[];
  /** Le attività dell'impresa: quelle che diventano ×4 per capo e sostenitori. */
  attivita: Attivita[];
  /** Solo per le libere: la catena (fase 2, catene.ts) che la apre. */
  catena?: string;
}

const r = (id: string, nome: string, fa: string): Ruolo => ({ id, nome, fa });
const att = (id: string, etichetta: string, fasce: Fascia[], meteo: Attivita["meteo"] = "asciutto"): Attivita => ({
  id,
  etichetta,
  fasce,
  meteo,
  livello: 1,
  richiede: [],
});

/** Nome, oggetti e ruoli delle imprese principali (tabella della sezione 6). */
const PRINCIPALI: Record<Strada, { id: string; nome: string; oggetti: string[]; ruoli: Ruolo[] }> = {
  imprenditore: {
    id: "ghiande-e-co",
    nome: "Ghiande & Co.",
    oggetti: ["banco", "scrivania", "insegna", "cassaforte"],
    ruoli: [
      r("socio", "socio", "firma i contratti accanto al capo"),
      r("contabile", "contabile", "conta le ghiande e rifà i conti due volte"),
      r("fattorino", "fattorino", "corre a consegnare ghiande in giro per il prato"),
    ],
  },
  filosofo: {
    id: "scuola-sotto-la-chioma",
    nome: "La scuola sotto la chioma",
    oggetti: ["panchina", "biblioteca", "cannocchiale", "lavagna"],
    ruoli: [
      r("allievo", "allievo", "prende appunti alle lezioni e alza la mano"),
      r("assistente", "assistente", "cancella la lavagna e distribuisce le domande"),
    ],
  },
  artista: {
    id: "atelier",
    nome: "L'atelier",
    oggetti: ["cavalletto", "atelier", "scultura", "galleria"],
    ruoli: [
      r("modello", "modello", "posa immobile per il ritratto (quasi)"),
      r("assistente", "assistente", "lava i pennelli e porge i colori"),
      r("critico", "critico", "guarda i quadri e dice «interessante»"),
    ],
  },
  sportivo: {
    id: "club-sportivo",
    nome: "Il club sportivo",
    oggetti: ["sbarra", "ostacoli", "podio"],
    ruoli: [
      r("compagno", "compagno di squadra", "si allena insieme al capo e perde volentieri"),
      r("allenatore", "allenatore", "fischia col fischietto e cronometra"),
    ],
  },
  furfante: {
    id: "banda-del-bosco",
    nome: "La banda del bosco",
    oggetti: ["nascondiglio", "mercato", "mappa", "covo"],
    ruoli: [
      r("palo", "palo", "fa la guardia col cappello calato"),
      r("contabile", "contabile delle ghiande", "tiene il libro delle ghiande, con la matita dietro l'orecchio"),
      r("galoppino", "galoppino", "porta i messaggi in codice scritti sulle foglie"),
    ],
  },
  viaggiatore: {
    id: "agenzia-di-viaggi",
    nome: "L'agenzia di viaggi",
    oggetti: ["bacheca", "cartelli", "mongolfiera"],
    ruoli: [
      r("compagno", "compagno di viaggio", "prepara lo zaino anche lui, per sicurezza"),
      r("cartografo", "cartografo", "disegna mappe di posti che nessuno ha visto"),
    ],
  },
  poeta: {
    id: "festival-di-poesia",
    nome: "Il festival di poesia",
    oggetti: ["amaca", "scrittoio", "filo delle poesie", "palco"],
    ruoli: [
      r("lettore", "lettore", "legge ad alta voce i versi del capo"),
      r("pubblico", "pubblico", "applaude alla fine di ogni verso, anche a metà"),
    ],
  },
};

const principale = (s: Strada): TipoImpresa => ({
  ...PRINCIPALI[s],
  strada: s,
  livelli: MESTIERI[s].livelli,
  cantieri: MESTIERI[s].cantieri,
  attivita: MESTIERI[s].attivita,
});

/**
 * Le imprese libere (sezione 6): più rare, aperte da una catena. Livelli,
 * cantieri e attività sono una proposta, dalle attività quotidiane del
 * catalogo (sezione 5.1); la fase 2 collega le catene.
 */
const LIBERE: TipoImpresa[] = [
  {
    id: "orto-comunitario",
    nome: "L'orto comunitario",
    strada: null,
    catena: "orto",
    livelli: ["L'aiuola", "L'orto", "L'orto comunitario"],
    oggetti: ["aiuola", "recinto", "spaventapasseri"],
    cantieri: [
      { id: "aiuola", nome: "L'aiuola", lascia: "aiuola", passi: [{ etichetta: "zappa l'aiuola" }, { etichetta: "semina in fila (quasi dritta)" }] },
      { id: "recinto", nome: "Il recinto", lascia: "recinto", passi: [{ etichetta: "pianta i paletti" }, { etichetta: "lega il recinto con i fili d'erba" }] },
      { id: "spaventapasseri", nome: "Lo spaventapasseri", lascia: "spaventapasseri", passi: [{ etichetta: "veste lo spaventapasseri" }, { etichetta: "gli dà un nome" }] },
    ],
    ruoli: [r("annaffiatore", "annaffiatore", "annaffia l'orto con l'annaffiatoio"), r("raccoglitore", "raccoglitore", "controlla se è spuntato qualcosa")],
    attivita: [
      att("orto.annaffia", "annaffia l'orto", ["mattina", "pomeriggio"]),
      att("orto.zappa", "zappa l'aiuola", ["giorno", "pomeriggio"]),
      att("orto.semina", "semina", ["mattina", "giorno"]),
    ],
  },
  {
    id: "cucina-del-bosco",
    nome: "La cucina del bosco",
    strada: null,
    catena: "marmellata",
    livelli: ["Il fornello", "La cucina", "L'osteria del bosco"],
    oggetti: ["fornello di sassi", "tavolino", "insegna della cucina"],
    cantieri: [
      { id: "fornello", nome: "Il fornello di sassi", lascia: "fornello di sassi", passi: [{ etichetta: "sceglie i sassi per il fornello" }, { etichetta: "accende il primo fuoco del fornello" }] },
      { id: "tavolino", nome: "Il tavolino", lascia: "tavolino", passi: [{ etichetta: "monta il tavolino" }, { etichetta: "apparecchia con le foglie" }] },
      { id: "insegna-cucina", nome: "L'insegna", lascia: "insegna della cucina", passi: [{ etichetta: "scrive il menù del giorno" }, { etichetta: "appende l'insegna" }] },
    ],
    ruoli: [r("aiuto-cuoco", "aiuto cuoco", "mescola la pentola e assaggia di nascosto"), r("cameriere", "cameriere", "porta le tazze di tisana")],
    attivita: [
      att("cucina.zuppa", "cucina una zuppa", ["giorno", "sera"]),
      att("cucina.tisana", "prepara la tisana", ["mattina", "sera"], "qualsiasi"),
      att("cucina.marmellata", "riempie i vasetti di marmellata", ["pomeriggio"]),
    ],
  },
  {
    id: "squadra-di-calcio",
    nome: "La squadra di calcio",
    strada: null,
    catena: "palla",
    livelli: ["La palla", "Il campetto", "La squadra"],
    oggetti: ["pallone", "porta di rami", "maglie di foglie"],
    cantieri: [
      { id: "porta", nome: "La porta di rami", lascia: "porta di rami", passi: [{ etichetta: "pianta i pali della porta" }, { etichetta: "intreccia la rete" }] },
      { id: "maglie", nome: "Le maglie", lascia: "maglie di foglie", passi: [{ etichetta: "cuce le maglie di foglie" }, { etichetta: "ci dipinge i numeri" }] },
      { id: "coppa", nome: "La coppa", lascia: "coppa di ghianda", passi: [{ etichetta: "lucida una ghianda grande" }, { etichetta: "la alza al cielo" }] },
    ],
    ruoli: [r("portiere", "portiere", "para (a volte) i tiri"), r("attaccante", "attaccante", "rincorre la palla e esulta")],
    attivita: [
      att("calcio.partita", "gioca a palla", ["giorno", "pomeriggio"]),
      att("calcio.allenamento", "si allena a calciare in porta", ["mattina", "pomeriggio"]),
    ],
  },
  {
    id: "coro",
    nome: "Il coro",
    strada: null,
    catena: "concerto",
    livelli: ["Il canto", "Il coro", "Il concerto della sera"],
    oggetti: ["leggio", "flauto di canna", "palco"],
    cantieri: [
      { id: "leggio", nome: "Il leggio", lascia: "leggio", passi: [{ etichetta: "costruisce il leggio" }, { etichetta: "ci appoggia lo spartito di foglie" }] },
      { id: "flauto", nome: "Il flauto di canna", lascia: "flauto di canna", passi: [{ etichetta: "taglia la canna" }, { etichetta: "ci fa i buchi e prova le note" }] },
      { id: "palco-coro", nome: "Il palco", lascia: "palco", passi: [{ etichetta: "allinea i ceppi del palco" }, { etichetta: "fa la prova generale" }] },
    ],
    ruoli: [r("voce", "voce", "canta, un po' stonato ma con impegno"), r("musicista", "musicista", "suona il flauto di canna")],
    attivita: [
      att("coro.prova", "prova le canzoni del coro", ["pomeriggio", "sera"], "qualsiasi"),
      att("coro.flauto", "suona il flauto di canna", ["giorno", "pomeriggio"]),
    ],
  },
  {
    id: "teatro",
    nome: "Il teatro",
    strada: null,
    catena: "storie",
    livelli: ["Le storie al fuoco", "Il teatrino", "La prima"],
    oggetti: ["sipario di foglie", "costumi", "biglietti"],
    cantieri: [
      { id: "sipario", nome: "Il sipario", lascia: "sipario di foglie", passi: [{ etichetta: "cuce il sipario di foglie" }, { etichetta: "lo appende tra due rami" }] },
      { id: "costumi", nome: "I costumi", lascia: "costumi", passi: [{ etichetta: "sceglie i costumi" }, { etichetta: "prova il costume davanti alla pozzanghera" }] },
      { id: "prima", nome: "La prima", lascia: "biglietti", passi: [{ etichetta: "scrive i biglietti a mano" }, { etichetta: "va in scena e fa l'inchino" }] },
    ],
    ruoli: [r("attore", "attore", "ripete la sua battuta a voce alta"), r("suggeritore", "suggeritore", "sussurra le battute da dietro il sipario")],
    attivita: [
      att("teatro.prove", "prova la parte", ["pomeriggio", "sera"], "qualsiasi"),
      att("teatro.storie", "racconta storie con le ombre delle mani", ["sera"]),
    ],
  },
];

export const TIPI_IMPRESA: TipoImpresa[] = [...STRADE.map(principale), ...LIBERE];

export function tipoImpresa(id: string): TipoImpresa {
  const t = TIPI_IMPRESA.find((x) => x.id === id);
  if (!t) throw new Error(`Impresa sconosciuta: ${id}`);
  return t;
}

/** L'impresa principale di una strada. */
export function impresaDellaStrada(s: Strada): TipoImpresa {
  return tipoImpresa(PRINCIPALI[s].id);
}

/** L'impresa libera che si apre finendo una catena, se c'è. */
export function impresaDellaCatena(catena: string): TipoImpresa | null {
  return LIBERE.find((t) => t.catena === catena) ?? null;
}

// ── Lo stato di un'impresa (tabelle ventures e venture_members) ─────────────

export interface Sostenitore {
  albero: string;
  ruolo: string;
  /** Giorno (della stanza) in cui è entrato. */
  dal: number;
}

export interface Impresa {
  id: string;
  tipo: string;
  stanza: string;
  capo: string;
  /** Giorno di fondazione. */
  fondata: number;
  /** Passi di cantiere fatti in tutto. */
  passi: number;
  /** Lavoro accumulato verso il prossimo passo (0-1). */
  lavoro: number;
  sostenitori: Sostenitore[];
}

/** Quanto vale un giorno di lavoro, in passi di cantiere (proposta, da tarare con la simulazione). */
export const LAVORO_CAPO = 0.2;
export const LAVORO_SOSTENITORE = 0.1;
/** Un'impresa attiva rende più probabili le sue attività per capo e sostenitori (sezione 3.3). */
export const MOLTIPLICATORE_IMPRESA = 4;

export function fondaImpresa(tipo: string, capo: string, stanza: string, giorno: number): Impresa {
  return { id: `${tipo}:${capo}`, tipo, stanza, capo, fondata: giorno, passi: 0, lavoro: 0, sostenitori: [] };
}

/** I cantieri finiti, il livello (1-3) e il cantiere in corso. */
export function avanzamento(imp: Impresa) {
  const t = tipoImpresa(imp.tipo);
  const finiti: Cantiere[] = [];
  let resto = imp.passi;
  let inCorso: { cantiere: Cantiere; passo: number } | null = null;
  for (const c of t.cantieri) {
    if (resto >= c.passi.length) {
      finiti.push(c);
      resto -= c.passi.length;
    } else {
      inCorso = { cantiere: c, passo: resto };
      break;
    }
  }
  const livello = Math.min(3, 1 + finiti.length) as 1 | 2 | 3;
  return { livello, nomeLivello: t.livelli[livello - 1], arredi: finiti.map((c) => c.lascia), inCorso, completa: !inCorso };
}

export function membri(imp: Impresa): string[] {
  return [imp.capo, ...imp.sostenitori.map((s) => s.albero)];
}

/** Il ruolo da dare al prossimo sostenitore: a turno, nell'ordine della tabella. */
export function prossimoRuolo(imp: Impresa): Ruolo {
  const ruoli = tipoImpresa(imp.tipo).ruoli;
  return ruoli[imp.sostenitori.length % ruoli.length];
}

export function ruolo(imp: Impresa, albero: string): Ruolo | null {
  const s = imp.sostenitori.find((x) => x.albero === albero);
  return s ? (tipoImpresa(imp.tipo).ruoli.find((x) => x.id === s.ruolo) ?? null) : null;
}

export type FattoImpresa =
  | { tipo: "passo"; etichetta: string }
  | { tipo: "cantiere"; nome: string; lascia: string; livello: 1 | 2 | 3; nomeLivello: string };

/**
 * Un giorno di lavoro: il capo e ogni sostenitore aggiungono lavoro; a ogni
 * passo intero il cantiere va avanti. Restituisce l'impresa nuova e che cosa
 * è successo (passi e cantieri finiti), per il diario.
 */
export function lavoraImpresa(imp: Impresa): { impresa: Impresa; fatti: FattoImpresa[] } {
  const fatti: FattoImpresa[] = [];
  const nuova: Impresa = { ...imp, sostenitori: [...imp.sostenitori] };
  if (avanzamento(nuova).completa) return { impresa: nuova, fatti };
  nuova.lavoro += LAVORO_CAPO + LAVORO_SOSTENITORE * nuova.sostenitori.length;
  while (nuova.lavoro >= 1 - 1e-9) {
    const prima = avanzamento(nuova);
    if (!prima.inCorso) break;
    nuova.lavoro -= 1;
    const { cantiere, passo } = prima.inCorso;
    fatti.push({ tipo: "passo", etichetta: cantiere.passi[passo].etichetta });
    nuova.passi += 1;
    const dopo = avanzamento(nuova);
    if (dopo.arredi.length > prima.arredi.length) {
      fatti.push({ tipo: "cantiere", nome: cantiere.nome, lascia: cantiere.lascia, livello: dopo.livello, nomeLivello: dopo.nomeLivello });
    }
  }
  if (avanzamento(nuova).completa) nuova.lavoro = 0;
  return { impresa: nuova, fatti };
}

// ── Per i pesi della giornata (giornata.ts, sezione 3.3) ─────────────────────

/** Le imprese di cui l'albero fa parte, da capo o da sostenitore. */
export function impreseDi(albero: string, imprese: Impresa[]): Impresa[] {
  return imprese.filter((i) => membri(i).includes(albero));
}

/**
 * Il fattore «impresa» del peso di un'attività: ×4 se appartiene a un'impresa
 * attiva in cui l'albero è capo o sostenitore, altrimenti ×1. Vale per gli id
 * delle attività dei mestieri e delle imprese libere («imprenditore.caffe»,
 * «orto.annaffia») e, finché la giornata usa le 23 azioni di oggi, per le
 * azioni legate alla strada dell'impresa («contare-ghiande» per la banda).
 */
export function fattoreImpresa(attivitaId: string, albero: string, imprese: Impresa[]): number {
  for (const imp of impreseDi(albero, imprese)) {
    const t = tipoImpresa(imp.tipo);
    if (t.attivita.some((a) => a.id === attivitaId)) return MOLTIPLICATORE_IMPRESA;
    if (t.strada && AZIONI.some((a) => a.id === attivitaId && a.strade.includes(t.strada!))) return MOLTIPLICATORE_IMPRESA;
  }
  return 1;
}
