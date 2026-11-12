import { z } from "zod";
import { azione, azioniPerMeteo, ID_AZIONI } from "../albero/azioni";
import {
  classifica,
  descriviCarattere,
  inclinazioni,
  INFO_STRADE,
  NOMI_TRATTI,
  STRADE,
  stradaRivelata,
  TRATTI,
  type PunteggiStrade,
  type Strada,
  type Tratti,
} from "../albero/strade";
import type { MeteoGiorno } from "../meteo";
import { chiediStrutturato } from "./ai";
import { BIBBIA, EVENTI, UMORI } from "./personaggio";

// La vita dell'albero, giorno per giorno. Qui c'è la parte "pura" del motore:
// prepara i giorni, chiede all'AI come li vive e applica il risultato allo stato.
// Il salvataggio nel database sta in servizio.ts, così lo stesso motore
// gira anche in memoria (npm run simula).

export interface FattoBiografia {
  giorno: number;
  testo: string;
}

export interface StatoAlbero {
  nome: string;
  nomePersona: string | null;
  citta: string;
  /** Giorni vissuti finora (0 = giorno della semina). */
  giorni: number;
  /** Data della semina, AAAA-MM-GG. */
  dataSemina: string;
  tratti: Tratti;
  punteggi: PunteggiStrade;
  strada: Strada | null;
  umore: string;
  biografia: FattoBiografia[];
  /** I regali ricevuti dalla persona (Premium: uno al mese). */
  regali?: RegaloRicevuto[];
  /** Fissi alla nascita (0.2, sezione 7.1): quanto trascina e quanto si lascia trascinare. */
  carisma?: number;
  influenzabilita?: number;
}

export interface RegaloRicevuto {
  mese: number;
  /** Con l'articolo: «un berretto di lana rosso». */
  cosa: string;
  /** Che cosa ha deciso di farne, in breve. */
  come: string;
}

export interface PaginaDiario {
  giorno: number;
  data: string;
  meteo: MeteoGiorno;
  azione: string;
  umore: string;
  testo: string;
  didascalia: string;
  momento: boolean;
}

export interface GiornoDaVivere {
  giorno: number;
  data: string;
  meteo: MeteoGiorno;
  evento: string | null;
  ammesse: string[];
  /** Quello che succede nella sua stanza con gli altri alberi (imprese, contagio, attività di gruppo). */
  fattiStanza?: string[];
}

export function aggiungiGiorni(data: string, n: number): string {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const METEO_DI_RISERVA = (data: string): MeteoGiorno => ({
  data,
  cielo: "nuvole",
  temperatura: 14,
  minima: 10,
  massima: 17,
  giorno: true,
  descrizione: "cielo nuvoloso, tra 10° e 17°",
});

/** I prossimi n giorni, col meteo delle previsioni e qualche evento a caso. */
export function preparaGiorni(
  stato: StatoAlbero,
  n: number,
  previsioni: MeteoGiorno[],
  rnd: () => number = Math.random,
): GiornoDaVivere[] {
  return Array.from({ length: n }, (_, k) => {
    const giorno = stato.giorni + k + 1;
    const data = aggiungiGiorni(stato.dataSemina, giorno);
    const trovato = previsioni.find((p) => p.data === data);
    // Oltre i 16 giorni di previsioni si riusa una previsione, con la data giusta.
    const ripiego = previsioni.length ? previsioni[(giorno - 1) % previsioni.length] : null;
    const meteo = trovato ?? (ripiego ? { ...ripiego, data } : METEO_DI_RISERVA(data));
    const bagnato = meteo.cielo === "pioggia" || meteo.cielo === "temporale";
    const evento = rnd() < 0.35 ? EVENTI[Math.floor(rnd() * EVENTI.length)] : null;
    return { giorno, data, meteo, evento, ammesse: azioniPerMeteo(bagnato).map((a) => a.id) };
  });
}

const Spinte = z.object({
  filosofo: z.number().int(),
  imprenditore: z.number().int(),
  artista: z.number().int(),
  sportivo: z.number().int(),
  furfante: z.number().int(),
  viaggiatore: z.number().int(),
  poeta: z.number().int(),
});

const SchemaVita = z.object({
  giorni: z.array(
    z.object({
      giorno: z.number().int(),
      azione: z.enum(ID_AZIONI),
      umore: z.enum(UMORI),
      diario: z.string(),
      didascalia: z.string(),
      spinte: Spinte,
      tratti_rafforzati: z.array(z.enum(TRATTI)),
      momento_importante: z.boolean(),
      fatto_da_ricordare: z.string().nullable(),
    }),
  ),
  buongiorno: z.object({
    domanda: z.string(),
    risposte: z.array(z.string()),
  }),
});

export type EsitoGiorno = z.infer<typeof SchemaVita>["giorni"][number];

/** La domanda del mattino: breve, con 2-3 risposte da un tocco. */
export interface Buongiorno {
  domanda: string;
  risposte: string[];
}

/** Ripulisce la domanda dell'AI: 2 o 3 risposte corte e diverse, altrimenti niente. */
export function pulisciBuongiorno(b: { domanda: string; risposte: string[] } | null | undefined): Buongiorno | null {
  if (!b) return null;
  const domanda = b.domanda.trim().replace(/\s+/g, " ").slice(0, 160);
  const viste = new Set<string>();
  const risposte: string[] = [];
  for (const r of b.risposte) {
    const pulita = r.trim().replace(/[.!]+$/, "").slice(0, 32);
    if (!pulita || viste.has(pulita.toLowerCase())) continue;
    viste.add(pulita.toLowerCase());
    risposte.push(pulita);
  }
  return domanda.length >= 5 && risposte.length >= 2 ? { domanda, risposte: risposte.slice(0, 3) } : null;
}

/** Le istruzioni per la domanda del mattino, uguali per la giornata e per la domanda da sola. */
export function regoleBuongiorno(nome: string, giorno: number, meteo?: string | null) {
  return `la domanda che ${nome} fa alla persona la mattina del giorno ${giorno}${meteo ? ` (previsto: ${meteo})` : ""}, prima di cominciare la giornata. Una sola domanda breve (al massimo 80 caratteri) e concreta su che cosa fare quel giorno, legata al meteo previsto, a quello che sta facendo o a una cosa successa di recente, in prima persona e con il suo carattere. Da 2 a 3 risposte da un tocco, di 1-4 parole l'una, tutte buone. Esempio: «Domani piove: ombrello o doccia sotto la pioggia?» con «Ombrello», «Doccia», «Un po' e un po'». Niente domande sulla vita della persona, niente frasi fatte.`;
}

export interface ContestoVita {
  diarioRecente: { giorno: number; azione: string; testo: string; meteo?: string | null }[];
  messaggiPersona: string[];
  /** Le risposte della persona alle domande del mattino, per i giorni da vivere. */
  buongiorno?: { giorno: number; domanda: string; risposta: string }[];
  /** Trofei e oggetti della collezione appena sbloccati, di cui non ha ancora parlato. */
  novita?: string[];
}

export function descriviStato(stato: StatoAlbero): string {
  const inc = inclinazioni(stato.tratti);
  const righe = [
    `Albero: ${stato.nome}. Vive in un prato a ${stato.citta}. Piantato il ${stato.dataSemina}, oggi ha ${stato.giorni} giorni di vita.`,
    `La persona che l'ha piantato si chiama: ${stato.nomePersona || "(nome non detto)"}.`,
    `Tratti attuali (0-100): ${TRATTI.map((t) => `${NOMI_TRATTI[t]} ${stato.tratti[t]}`).join(", ")}.`,
    `Inclinazioni naturali che vengono dai tratti (0-100): ${STRADE.map((s) => `${s} ${inc[s]}`).join(", ")}.`,
    `Punteggi delle strade accumulati finora: ${classifica(stato.punteggi)
      .map(([s, p]) => `${s} ${p}`)
      .join(", ")}.`,
    stato.strada
      ? `Strada rivelata: ${INFO_STRADE[stato.strada].nome}.`
      : "Strada: non ancora rivelata (la sta cercando).",
    `Umore recente: ${stato.umore}.`,
  ];
  if (stato.carisma != null && stato.influenzabilita != null) {
    righe.push(
      `Con gli altri alberi: ${descriviCarattere({ carisma: stato.carisma, influenzabilita: stato.influenzabilita })}. Non dirlo mai come un numero: si vede da come si comporta.`,
    );
  }
  if (stato.biografia.length) {
    righe.push(
      "Fatti della sua vita da ricordare:",
      ...stato.biografia.slice(-15).map((f) => `- giorno ${f.giorno}: ${f.testo}`),
    );
  }
  if (stato.regali?.length) {
    righe.push(
      "Regali ricevuti dalla persona (li ha ancora, e se ne ricorda):",
      ...stato.regali.map((r) => `- mese ${r.mese}: ${r.cosa}. ${r.come}`),
    );
  }
  return righe.join("\n");
}

function descriviContesto(ctx: ContestoVita): string {
  const righe: string[] = [];
  if (ctx.diarioRecente.length) {
    righe.push(
      "Ultime pagine del suo diario:",
      ...ctx.diarioRecente.map(
        (d) => `- giorno ${d.giorno}${d.meteo ? ` (${d.meteo})` : ""}, ${d.azione}: «${d.testo}»`,
      ),
    );
  }
  if (ctx.messaggiPersona.length) {
    righe.push(
      "Le ultime cose che gli ha scritto la persona (consigli che può seguire o no):",
      ...ctx.messaggiPersona.map((m) => `- «${m}»`),
    );
  }
  if (ctx.buongiorno?.length) {
    righe.push(
      "Le risposte della persona alle sue domande del mattino. Sono consigli: decide lui se seguirli, a metà o per niente, secondo il suo carattere, e il diario di quel giorno lo racconta:",
      ...ctx.buongiorno.map((b) => `- mattina del giorno ${b.giorno}: «${b.domanda}» La persona ha risposto: «${b.risposta}».`),
    );
  }
  if (ctx.novita?.length) {
    righe.push(
      `Novità della sua collezione, ottenute vivendo: ${ctx.novita.map((n) => `«${n}»`).join(", ")}. Se gli va, ne parla in una frase del diario di uno dei giorni, a modo suo.`,
    );
  }
  return righe.join("\n");
}

/** Una sola chiamata all'AI per vivere fino a 7 giorni di fila. */
export async function pianificaGiorni(
  stato: StatoAlbero,
  giorni: GiornoDaVivere[],
  ctx: ContestoVita,
): Promise<EsitoGiorno[]> {
  return (await viviGiornate(stato, giorni, ctx)).esiti;
}

/**
 * Come pianificaGiorni, e nella stessa chiamata la domanda del mattino dopo
 * l'ultimo giorno vissuto (il buongiorno): nessuna chiamata in più all'AI.
 */
export async function viviGiornate(
  stato: StatoAlbero,
  giorni: GiornoDaVivere[],
  ctx: ContestoVita,
  domani?: { meteo?: string | null },
): Promise<{ esiti: EsitoGiorno[]; buongiorno: Buongiorno | null }> {
  const giornoDomani = (giorni[giorni.length - 1]?.giorno ?? stato.giorni) + 1;
  const elenco = giorni
    .map(
      (g) =>
        `- giorno ${g.giorno} (${g.data}): meteo ${g.meteo.descrizione}. ${
          g.evento ? `Evento: ${g.evento}` : "Nessun evento particolare."
        }${g.fattiStanza?.length ? ` Nella sua stanza: ${g.fattiStanza.join(" ")}` : ""} Azioni ammesse: ${g.ammesse.join(", ")}.`,
    )
    .join("\n");

  const richiesta = `${descriviStato(stato)}

${descriviContesto(ctx)}

Vivi i prossimi ${giorni.length} giorni di ${stato.nome}:
${elenco}

Restituisci un elemento per ogni giorno, nello stesso ordine, con:
- giorno: il numero del giorno.
- azione: una delle azioni ammesse quel giorno (id esatto), coerente con carattere, meteo ed evento. Varia: non ripetere la stessa azione più di due giorni di fila.
- umore.
- diario: da 1 a 3 frasi in prima persona, nella voce dell'albero, al massimo 300 caratteri. Se c'è un evento, il diario ne parla. Se nella sua stanza è successo qualcosa con gli altri alberi (un'impresa, qualcuno che entra o esce, una cosa fatta insieme), il diario lo racconta a modo suo, con i loro nomi: con affetto e ironia, mai con cattiveria.
- didascalia: una frase in terza persona che comincia con «${stato.nome}», al massimo 110 caratteri, da mostrare sotto il suo ritratto (esempio: «${stato.nome} legge giornali finanziari sotto l'ombrello. Nessuno sa perché.»).
- spinte: per ogni strada un intero da -2 a 5, quanto la giornata lo avvicina a quella strada. Di solito una o due strade positive e le altre a 0. Seguono il carattere e le scelte, con qualche sorpresa ogni tanto.
- tratti_rafforzati: da 0 a 2 tratti che la giornata ha rafforzato.
- momento_importante: true solo per qualcosa di davvero notevole, al massimo una volta ogni sette giorni.
- fatto_da_ricordare: una frase breve se il giorno merita di entrare nella sua biografia, altrimenti null.

Poi, a parte:
- buongiorno: ${regoleBuongiorno(stato.nome, giornoDomani, domani?.meteo)}
${
  stato.strada
    ? "La strada è già rivelata: la segue, ma resta capace di sorprendere."
    : "La strada non è ancora rivelata: lascia indizi sempre più chiari di quella che sta prendendo, senza nominarla come una scelta fatta."
}`;

  // Le giornate vanno sul modello piccolo (Haiku): costa una frazione e basta
  // per scegliere l'azione e scrivere due righe. Effort medio per la qualità
  // dell'italiano, che su Haiku costa pochissimo.
  const esito = await chiediStrutturato({ sistema: BIBBIA, richiesta, schema: SchemaVita, effort: "medium", compito: "giornata" });

  // L'AI potrebbe restituire un numero diverso di giorni o un'azione non ammessa.
  const esiti = giorni.map((g, i) => {
    const e = esito.giorni[i] ?? esito.giorni[esito.giorni.length - 1];
    if (!e) throw new Error("L'AI non ha restituito nessun giorno.");
    const ammessa = g.ammesse.includes(e.azione)
      ? e.azione
      : g.ammesse.includes("passeggiata")
        ? "passeggiata"
        : g.ammesse[0];
    return { ...e, giorno: g.giorno, azione: ammessa };
  });
  return { esiti, buongiorno: pulisciBuongiorno(esito.buongiorno) };
}

const limita = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export interface RisultatoGiorni {
  stato: StatoAlbero;
  pagine: PaginaDiario[];
  rivelata: Strada | null;
  momento: EsitoGiorno | null;
}

/** Applica i giorni vissuti allo stato: punteggi, tratti, biografia, strada. */
export function applicaEsiti(
  stato: StatoAlbero,
  giorni: GiornoDaVivere[],
  esiti: EsitoGiorno[],
  rnd: () => number = Math.random,
): RisultatoGiorni {
  const nuovo: StatoAlbero = {
    ...stato,
    tratti: { ...stato.tratti },
    punteggi: { ...stato.punteggi },
    biografia: [...stato.biografia],
  };
  const pagine: PaginaDiario[] = [];
  let rivelata: Strada | null = null;
  let momento: EsitoGiorno | null = null;

  giorni.forEach((g, i) => {
    const e = esiti[i];
    for (const s of STRADE) {
      nuovo.punteggi[s] = Math.max(0, (nuovo.punteggi[s] ?? 0) + limita(e.spinte[s], -2, 5));
    }
    for (const t of new Set(e.tratti_rafforzati)) {
      nuovo.tratti[t] = limita(nuovo.tratti[t] + 2, 0, 100);
    }
    if (rnd() < 0.3) {
      const t = TRATTI[Math.floor(rnd() * TRATTI.length)];
      nuovo.tratti[t] = limita(nuovo.tratti[t] + (rnd() < 0.5 ? -1 : 1), 0, 100);
    }
    if (e.fatto_da_ricordare) nuovo.biografia.push({ giorno: g.giorno, testo: e.fatto_da_ricordare });
    nuovo.umore = e.umore;
    nuovo.giorni = g.giorno;

    let pietra = e.momento_importante;
    if (!nuovo.strada) {
      const r = stradaRivelata(nuovo.punteggi);
      if (r) {
        nuovo.strada = r;
        rivelata = r;
        pietra = true;
        nuovo.biografia.push({ giorno: g.giorno, testo: `Ha capito chi è: ${INFO_STRADE[r].nome.toLowerCase()}.` });
      }
    }
    if (e.momento_importante && !momento) momento = e;

    pagine.push({
      giorno: g.giorno,
      data: g.data,
      meteo: g.meteo,
      azione: e.azione,
      umore: e.umore,
      testo: e.diario,
      didascalia: e.didascalia,
      momento: pietra,
    });
  });

  nuovo.biografia = nuovo.biografia.slice(-40);
  return { stato: nuovo, pagine, rivelata, momento };
}

export function etichettaAzione(id: string) {
  return azione(id).etichetta;
}

/**
 * Applica allo stato quello che il contagio ha deciso per lui oggi
 * (contagio.ts, giornoDellaStanza): i punti alla strada del capo prima della
 * rivelazione, e il cambio di strada (raro, annunciato) dopo.
 */
export function applicaStanza(
  stato: StatoAlbero,
  giorno: number,
  spinte: PunteggiStrade | undefined,
  cambio: Strada | undefined,
): { stato: StatoAlbero; rivelata: Strada | null; cambiata: Strada | null } {
  const nuovo: StatoAlbero = { ...stato, punteggi: { ...stato.punteggi }, biografia: [...stato.biografia] };
  let rivelata: Strada | null = null;
  for (const [s, p] of Object.entries(spinte ?? {}) as [Strada, number][]) {
    nuovo.punteggi[s] = (nuovo.punteggi[s] ?? 0) + p;
  }
  if (!nuovo.strada && spinte) {
    const r = stradaRivelata(nuovo.punteggi);
    if (r) {
      nuovo.strada = r;
      rivelata = r;
      nuovo.biografia.push({ giorno, testo: `Ha capito chi è: ${INFO_STRADE[r].nome.toLowerCase()}.` });
    }
  }
  if (cambio && nuovo.strada && cambio !== nuovo.strada) {
    nuovo.biografia.push({
      giorno,
      testo: `Ha cambiato strada: da ${INFO_STRADE[nuovo.strada].nome.toLowerCase()} a ${INFO_STRADE[cambio].nome.toLowerCase()}.`,
    });
    nuovo.strada = cambio;
    // La strada nuova resta in testa: i punti la seguono.
    const max = Math.max(...Object.values(nuovo.punteggi).map((v) => v ?? 0));
    nuovo.punteggi[cambio] = max + 6;
  }
  nuovo.biografia = nuovo.biografia.slice(-40);
  return { stato: nuovo, rivelata, cambiata: cambio && stato.strada && stato.strada !== cambio ? cambio : null };
}
