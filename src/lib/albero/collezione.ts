import { FREDDO_SOTTO, SOLE_DA } from "./scena";
import { stagioneDa, type Cielo, type Stagione } from "./tipi";

// La collezione dell'albero: trofei, oggetti, vestiti e l'album delle stagioni.
// Si sbloccano vivendo, mai comprando. Le regole sono qui, deterministiche:
// le calcola il codice dal diario, l'AI non decide niente (al massimo ne parla
// nel diario, dopo). Ogni regola restituisce il giorno in cui è scattata, o null.

export type TipoSblocco = "trofeo" | "oggetto" | "vestito" | "stagione";

/** Una pagina di diario, con quello che serve alle regole. */
export interface PaginaCollezione {
  giorno: number;
  /** AAAA-MM-GG */
  data: string;
  azione: string;
  cielo: Cielo | null;
  temperatura: number | null;
  minima: number | null;
  massima: number | null;
}

export interface DatiCollezione {
  /** In ordine di giorno. */
  pagine: PaginaCollezione[];
  /** Il giorno in cui ha capito chi è (dalla biografia), se l'ha capito. */
  giornoStrada: number | null;
  /** Il giorno della prima lettera di ringraziamento per un regalo. */
  giornoPrimoRegalo: number | null;
  /** La persona gli ha scritto almeno una volta. */
  haScritto: boolean;
  /** Il giorno di oggi (per gli sblocchi che non hanno una pagina precisa). */
  oggi: number;
}

export interface Sblocco {
  id: string;
  tipo: TipoSblocco;
  nome: string;
  /** Come si ottiene, in una frase concreta: si legge anche prima di averlo. */
  come: string;
  /** Icona: un id di IconaRegalo, una stagione o un simbolo. */
  icona: string;
  regola: (d: DatiCollezione) => number | null;
}

const bagnato = (c: Cielo | null) => c === "pioggia" || c === "temporale";
const freddo = (p: PaginaCollezione) =>
  p.cielo === "neve" || (p.temperatura ?? p.minima ?? 99) < FREDDO_SOTTO;

/** Il giorno della n-esima pagina che rispetta la condizione. */
function ennesimo(d: DatiCollezione, n: number, se: (p: PaginaCollezione) => boolean): number | null {
  let visti = 0;
  for (const p of d.pagine) {
    if (se(p) && ++visti === n) return p.giorno;
  }
  return null;
}

const primo = (d: DatiCollezione, se: (p: PaginaCollezione) => boolean) => ennesimo(d, 1, se);
const giornoDiario = (d: DatiCollezione, n: number) => ennesimo(d, 1, (p) => p.giorno >= n);

function stagione(s: Stagione) {
  return (d: DatiCollezione) => primo(d, (p) => stagioneDa(new Date(`${p.data}T12:00:00`)) === s);
}

export const COLLEZIONE: Sblocco[] = [
  // ——— Trofei ———
  { id: "prima-pioggia", tipo: "trofeo", nome: "La prima pioggia", come: "Vivere un giorno di pioggia.", icona: "☂", regola: (d) => primo(d, (p) => bagnato(p.cielo)) },
  { id: "primo-temporale", tipo: "trofeo", nome: "Il primo temporale", come: "Restare in piedi durante un temporale.", icona: "⚡", regola: (d) => primo(d, (p) => p.cielo === "temporale") },
  { id: "prima-nebbia", tipo: "trofeo", nome: "La prima nebbia", come: "Vivere un giorno di nebbia.", icona: "≋", regola: (d) => primo(d, (p) => p.cielo === "nebbia") },
  { id: "prima-neve", tipo: "trofeo", nome: "La prima neve", come: "Vedere nevicare sul prato.", icona: "❄", regola: (d) => primo(d, (p) => p.cielo === "neve") },
  { id: "primo-gelo", tipo: "trofeo", nome: "Il primo gelo", come: "Passare una notte sotto zero.", icona: "✻", regola: (d) => primo(d, (p) => (p.minima ?? p.temperatura ?? 99) <= 0) },
  { id: "gran-caldo", tipo: "trofeo", nome: "Il gran caldo", come: "Vivere un giorno da 30 gradi.", icona: "☀", regola: (d) => primo(d, (p) => (p.massima ?? p.temperatura ?? -99) >= 30) },
  { id: "una-settimana", tipo: "trofeo", nome: "Una settimana di diario", come: "Arrivare al giorno 7.", icona: "7", regola: (d) => giornoDiario(d, 7) },
  { id: "trenta-giorni", tipo: "trofeo", nome: "Trenta giorni di diario", come: "Arrivare al giorno 30.", icona: "30", regola: (d) => giornoDiario(d, 30) },
  { id: "cento-giorni", tipo: "trofeo", nome: "Cento giorni di diario", come: "Arrivare al giorno 100.", icona: "100", regola: (d) => giornoDiario(d, 100) },
  {
    id: "dieci-cose",
    tipo: "trofeo",
    nome: "Dieci cose diverse",
    come: "Fare dieci azioni diverse dalla libreria.",
    icona: "10",
    regola: (d) => {
      const viste = new Set<string>();
      for (const p of d.pagine) {
        viste.add(p.azione);
        if (viste.size === 10) return p.giorno;
      }
      return null;
    },
  },
  { id: "la-strada", tipo: "trofeo", nome: "La strada presa", come: "Capire chi diventare.", icona: "✦", regola: (d) => d.giornoStrada },
  { id: "primo-regalo", tipo: "trofeo", nome: "Il primo regalo", come: "Ricevere un regalo e decidere che cosa farne.", icona: "regalo", regola: (d) => d.giornoPrimoRegalo },
  { id: "prima-chiacchierata", tipo: "trofeo", nome: "La prima chiacchierata", come: "Ricevere il primo messaggio dalla persona.", icona: "✉", regola: (d) => (d.haScritto ? d.oggi : null) },

  // ——— Oggetti ———
  { id: "ombrello", tipo: "oggetto", nome: "L'ombrello", come: "Tre giorni di pioggia: l'ombrello diventa suo.", icona: "ombrello", regola: (d) => ennesimo(d, 3, (p) => bagnato(p.cielo)) },
  { id: "tazza", tipo: "oggetto", nome: "La tazza della tisana", come: "Bere la prima tisana.", icona: "tazza", regola: (d) => primo(d, (p) => p.azione === "bere-tisana") },
  { id: "libro", tipo: "oggetto", nome: "Il libro", come: "Leggere tre volte.", icona: "libro", regola: (d) => ennesimo(d, 3, (p) => p.azione === "leggere") },
  { id: "quaderno", tipo: "oggetto", nome: "Il quaderno delle poesie", come: "Scrivere tre poesie.", icona: "quaderno", regola: (d) => ennesimo(d, 3, (p) => p.azione === "scrivere-poesia") },
  { id: "valigia", tipo: "oggetto", nome: "La valigia", come: "Preparare la valigia per un viaggio immaginario.", icona: "valigia", regola: (d) => primo(d, (p) => p.azione === "fare-valigia") },

  // ——— Vestiti ———
  { id: "berretto", tipo: "vestito", nome: "Il berretto di lana", come: `Un giorno sotto gli ${FREDDO_SOTTO} gradi.`, icona: "berretto", regola: (d) => primo(d, freddo) },
  { id: "sciarpa", tipo: "vestito", nome: "La sciarpa", come: "Cinque giorni di freddo.", icona: "sciarpa", regola: (d) => ennesimo(d, 5, freddo) },
  {
    id: "occhiali",
    tipo: "vestito",
    nome: "Gli occhiali da sole",
    come: `Un giorno di sole sopra i ${SOLE_DA} gradi.`,
    icona: "occhiali",
    regola: (d) => primo(d, (p) => p.cielo === "sole" && (p.massima ?? p.temperatura ?? -99) >= SOLE_DA),
  },

  // ——— L'album delle stagioni ———
  { id: "primavera", tipo: "stagione", nome: "La primavera", come: "Vivere un giorno di primavera.", icona: "primavera", regola: stagione("primavera") },
  { id: "estate", tipo: "stagione", nome: "L'estate", come: "Vivere un giorno d'estate.", icona: "estate", regola: stagione("estate") },
  { id: "autunno", tipo: "stagione", nome: "L'autunno", come: "Vivere un giorno d'autunno.", icona: "autunno", regola: stagione("autunno") },
  { id: "inverno", tipo: "stagione", nome: "L'inverno", come: "Vivere un giorno d'inverno.", icona: "inverno", regola: stagione("inverno") },
];

const PER_ID = new Map(COLLEZIONE.map((s) => [s.id, s]));

export function sblocco(id: string): Sblocco | null {
  return PER_ID.get(id) ?? null;
}

export const NOMI_TIPO: Record<TipoSblocco, string> = {
  trofeo: "Trofei",
  oggetto: "Oggetti",
  vestito: "Vestiti",
  stagione: "L'album delle stagioni",
};

/** Gli sblocchi scattati e non ancora registrati, con il loro giorno. */
export function nuoviSblocchi(d: DatiCollezione, gia: Set<string>): { id: string; giorno: number }[] {
  const nuovi: { id: string; giorno: number }[] = [];
  for (const s of COLLEZIONE) {
    if (gia.has(s.id)) continue;
    const giorno = s.regola(d);
    if (giorno !== null) nuovi.push({ id: s.id, giorno });
  }
  return nuovi;
}
