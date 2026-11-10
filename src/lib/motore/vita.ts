import { z } from "zod";
import { azione, azioniPerMeteo, ID_AZIONI } from "../albero/azioni";
import {
  classifica,
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
});

export type EsitoGiorno = z.infer<typeof SchemaVita>["giorni"][number];

export interface ContestoVita {
  diarioRecente: { giorno: number; azione: string; testo: string; meteo?: string | null }[];
  messaggiPersona: string[];
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
  return righe.join("\n");
}

/** Una sola chiamata all'AI per vivere fino a 7 giorni di fila. */
export async function pianificaGiorni(
  stato: StatoAlbero,
  giorni: GiornoDaVivere[],
  ctx: ContestoVita,
): Promise<EsitoGiorno[]> {
  const elenco = giorni
    .map(
      (g) =>
        `- giorno ${g.giorno} (${g.data}): meteo ${g.meteo.descrizione}. ${
          g.evento ? `Evento: ${g.evento}` : "Nessun evento particolare."
        } Azioni ammesse: ${g.ammesse.join(", ")}.`,
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
- diario: da 1 a 3 frasi in prima persona, nella voce dell'albero, al massimo 300 caratteri. Se c'è un evento, il diario ne parla.
- didascalia: una frase in terza persona che comincia con «${stato.nome}», al massimo 110 caratteri, da mostrare sotto il suo ritratto (esempio: «${stato.nome} legge giornali finanziari sotto l'ombrello. Nessuno sa perché.»).
- spinte: per ogni strada un intero da -2 a 5, quanto la giornata lo avvicina a quella strada. Di solito una o due strade positive e le altre a 0. Seguono il carattere e le scelte, con qualche sorpresa ogni tanto.
- tratti_rafforzati: da 0 a 2 tratti che la giornata ha rafforzato.
- momento_importante: true solo per qualcosa di davvero notevole, al massimo una volta ogni sette giorni.
- fatto_da_ricordare: una frase breve se il giorno merita di entrare nella sua biografia, altrimenti null.
${
  stato.strada
    ? "La strada è già rivelata: la segue, ma resta capace di sorprendere."
    : "La strada non è ancora rivelata: lascia indizi sempre più chiari di quella che sta prendendo, senza nominarla come una scelta fatta."
}`;

  const esito = await chiediStrutturato({ sistema: BIBBIA, richiesta, schema: SchemaVita, effort: "low" });

  // L'AI potrebbe restituire un numero diverso di giorni o un'azione non ammessa.
  return giorni.map((g, i) => {
    const e = esito.giorni[i] ?? esito.giorni[esito.giorni.length - 1];
    if (!e) throw new Error("L'AI non ha restituito nessun giorno.");
    const ammessa = g.ammesse.includes(e.azione)
      ? e.azione
      : g.ammesse.includes("passeggiata")
        ? "passeggiata"
        : g.ammesse[0];
    return { ...e, giorno: g.giorno, azione: ammessa };
  });
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
