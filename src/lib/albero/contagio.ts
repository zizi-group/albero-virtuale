import { attivitaDiGruppo, type ScenaGruppo } from "./gruppo";
import {
  avanzamento,
  fondaImpresa,
  impresaDellaCatena,
  impresaDellaStrada,
  lavoraImpresa,
  membri,
  prossimoRuolo,
  tipoImpresa,
  type FattoImpresa,
  type Impresa,
} from "./imprese";
import { classifica, type PunteggiStrade, type Strada } from "./strade";
import type { Cielo } from "./tipi";

// Il contagio (docs/stanze-e-vita.md, sezione 7.2): ogni giorno, in ogni
// stanza, i capi delle imprese provano a coinvolgere gli altri alberi. Chi
// accetta diventa sostenitore con un ruolo; chi è poco convinto se ne va.
// Tutto deciso dal codice con un caso riproducibile; l'AI lo racconta soltanto.

/** I numeri del contagio. Proposta tarata con `npm run simula -- --senza-ai --prove 200`. */
export const CONTAGIO = {
  /** 0,12 × carisma × influenzabilità × affinità × sostenitori (formula della sezione 7.2). */
  base: 0.12,
  /**
   * L'influenzabilità conta con questo esponente: con 1 (formula pura) un albero
   * testardo (20) entrerebbe un giorno su 46; con 1,5 uno su cento («quasi mai»),
   * mentre 90 × 85 resta circa uno su dodici.
   */
  esponenteInfluenzabilita: 1.5,
  affinitaVicina: 1.5,
  affinitaLontana: 0.5,
  /** Ogni sostenitore che l'impresa ha già: +0,2 (la banda che cresce attira). */
  perSostenitore: 0.2,
  /** Ogni giorno un sostenitore può andarsene: 0,02 × (1,5 − influenzabilità) × (1,5 − carisma del capo) × affinità. */
  abbandonoBase: 0.02,
  /** Due capi con almeno questo carisma nella stessa stanza diventano rivali (buffi). */
  sogliaRivalita: 60,
} as const;

/**
 * Il cambio di strada per contagio (sezione 7.2 e 16.7): **proposta ancora da
 * confermare da Federico**. Con `attivo: false` non succede mai.
 */
export const CAMBIO_STRADA = {
  attivo: true,
  /** Giorni minimi da sostenitore di un'impresa di un'altra strada. */
  giorniMinimi: 60,
  /** Probabilità al giorno dopo i giorni minimi, per un albero influenzabile al massimo (si moltiplica per l'influenzabilità). */
  probabilita: 0.01,
};

// Strade vicine e lontane per l'affinità: le vicine condividono i tratti che
// le fanno nascere (inclinazioni in strade.ts), le lontane li hanno opposti.
// Tutte le altre coppie valgono ×1. Proposta.
const VICINE: [Strada, Strada][] = [
  ["filosofo", "poeta"],
  ["filosofo", "viaggiatore"],
  ["artista", "poeta"],
  ["artista", "viaggiatore"],
  ["imprenditore", "furfante"],
  ["imprenditore", "sportivo"],
  ["sportivo", "viaggiatore"],
];
const LONTANE: [Strada, Strada][] = [
  ["filosofo", "sportivo"],
  ["poeta", "sportivo"],
  ["poeta", "imprenditore"],
  ["filosofo", "furfante"],
  ["artista", "imprenditore"],
];
const coppia = (l: [Strada, Strada][], a: Strada, b: Strada) => l.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

/** ×1,5 se le strade sono la stessa o vicine, ×0,5 se lontane, ×1 altrimenti (o se una manca). */
export function affinita(a: Strada | null, b: Strada | null): number {
  if (!a || !b) return 1;
  if (a === b || coppia(VICINE, a, b)) return CONTAGIO.affinitaVicina;
  if (coppia(LONTANE, a, b)) return CONTAGIO.affinitaLontana;
  return 1;
}

export interface AlberoInStanza {
  id: string;
  nome: string;
  strada: Strada | null;
  punteggi: PunteggiStrade;
  carisma: number;
  influenzabilita: number;
  /** Giorni vissuti. */
  giorni: number;
}

/** La strada verso cui sta andando: quella rivelata, o la prima in classifica se ha già dei punti. */
export function stradaDiFatto(a: AlberoInStanza): Strada | null {
  if (a.strada) return a.strada;
  const [[prima, punti]] = classifica(a.punteggi);
  return punti > 0 ? prima : null;
}

/** La probabilità che il capo coinvolga l'altro oggi nella sua impresa. */
export function probabilitaContagio(capo: Pick<AlberoInStanza, "carisma">, altro: AlberoInStanza, impresa: Impresa): number {
  const t = tipoImpresa(impresa.tipo);
  return Math.min(
    1,
    CONTAGIO.base *
      (capo.carisma / 100) *
      Math.pow(altro.influenzabilita / 100, CONTAGIO.esponenteInfluenzabilita) *
      affinita(t.strada, stradaDiFatto(altro)) *
      (1 + CONTAGIO.perSostenitore * impresa.sostenitori.length),
  );
}

/** La probabilità che un sostenitore se ne vada oggi. */
export function probabilitaAbbandono(capo: Pick<AlberoInStanza, "carisma">, altro: AlberoInStanza, impresa: Impresa): number {
  const t = tipoImpresa(impresa.tipo);
  const s = stradaDiFatto(altro);
  // Chi è della stessa strada dell'impresa ci sta bene: se ne va molto di rado.
  const aff = s && s === t.strada ? 0.25 : affinita(t.strada, s) > 1 ? 0.5 : affinita(t.strada, s) < 1 ? 2 : 1;
  return CONTAGIO.abbandonoBase * (1.5 - altro.influenzabilita / 100) * (1.5 - capo.carisma / 100) * aff;
}

export type FattoStanza =
  | { tipo: "fondata"; impresa: string; capo: string }
  | { tipo: "entra"; impresa: string; capo: string; albero: string; ruolo: string; motivo: "contagio" | "stessa-strada" }
  | { tipo: "esce"; impresa: string; capo: string; albero: string }
  | { tipo: "lavoro"; impresa: string; capo: string; fatto: FattoImpresa }
  | { tipo: "punti"; albero: string; strada: Strada; punti: number; impresa: string }
  | { tipo: "cambio-strada"; albero: string; da: Strada; a: Strada; impresa: string }
  | { tipo: "chiusa"; impresa: string; capo: string }
  | { tipo: "rivalita"; capi: [string, string] }
  | { tipo: "gruppo"; scena: ScenaGruppo };

export interface GiornoStanza {
  stanza: string;
  /** Il giorno della stanza (per le date di entrata dei sostenitori). */
  giorno: number;
  alberi: AlberoInStanza[];
  imprese: Impresa[];
  cielo: Cielo;
  /** Catene finite oggi (fase 2): ognuna può aprire un'impresa libera. */
  catene?: { albero: string; catena: string }[];
  rnd: () => number;
}

export interface EsitoStanza {
  imprese: Impresa[];
  fatti: FattoStanza[];
  /** Punti da aggiungere alle strade degli alberi non ancora rivelati. */
  spinte: Record<string, PunteggiStrade>;
  /** Alberi che cambiano strada oggi (raro, annunciato, con una lettera). */
  cambi: Record<string, Strada>;
  rivali: [string, string][];
}

/** Il sostenitore di un'impresa (non capo): al massimo una per albero. */
const sostenitoreDi = (albero: string, imprese: Impresa[]) => imprese.find((i) => i.sostenitori.some((s) => s.albero === albero)) ?? null;

/**
 * Un giorno nella stanza: fondazioni, contagio, abbandoni, punti alla strada,
 * cambi di strada, lavoro delle imprese, rivalità e attività di gruppo.
 * Puro: non tocca il database. Si chiama prima di vivere le giornate, così
 * il diario di ognuno può raccontare quello che è successo.
 */
export function giornoDellaStanza(g: GiornoStanza): EsitoStanza {
  const { rnd, giorno } = g;
  const fatti: FattoStanza[] = [];
  const spinte: Record<string, PunteggiStrade> = {};
  const cambi: Record<string, Strada> = {};
  const alberi = new Map(g.alberi.map((a) => [a.id, a]));
  let imprese = g.imprese.filter((i) => alberi.has(i.capo)).map((i) => ({ ...i, sostenitori: i.sostenitori.filter((s) => alberi.has(s.albero)) }));

  // 1. Chi ha una strada ha la sua impresa. Se nella stanza c'è già quella
  //    della sua strada, ci entra (il capo resta chi l'ha fondata).
  for (const a of [...g.alberi].sort((x, y) => y.carisma - x.carisma)) {
    if (!a.strada) continue;
    const tipo = impresaDellaStrada(a.strada).id;
    const esistente = imprese.find((i) => i.tipo === tipo);
    if (!esistente) {
      imprese.push(fondaImpresa(tipo, a.id, g.stanza, giorno));
      fatti.push({ tipo: "fondata", impresa: tipo, capo: a.id });
    } else if (!membri(esistente).includes(a.id)) {
      // Lascia l'impresa di cui era sostenitore: ora ha quella della sua strada.
      const prima = sostenitoreDi(a.id, imprese);
      if (prima) {
        prima.sostenitori = prima.sostenitori.filter((s) => s.albero !== a.id);
        fatti.push({ tipo: "esce", impresa: prima.tipo, capo: prima.capo, albero: a.id });
      }
      const ruolo = prossimoRuolo(esistente).id;
      esistente.sostenitori.push({ albero: a.id, ruolo, dal: giorno });
      fatti.push({ tipo: "entra", impresa: tipo, capo: esistente.capo, albero: a.id, ruolo, motivo: "stessa-strada" });
    }
  }
  for (const c of g.catene ?? []) {
    const t = impresaDellaCatena(c.catena);
    if (t && alberi.has(c.albero) && !imprese.some((i) => i.tipo === t.id)) {
      imprese.push(fondaImpresa(t.id, c.albero, g.stanza, giorno));
      fatti.push({ tipo: "fondata", impresa: t.id, capo: c.albero });
    }
  }

  // 2. Rivalità: due capi carismatici nella stessa stanza.
  const capi = [...new Set(imprese.map((i) => i.capo))].map((id) => alberi.get(id)!).filter((a) => a.carisma >= CONTAGIO.sogliaRivalita);
  const rivali: [string, string][] = [];
  for (let i = 0; i < capi.length; i++)
    for (let j = i + 1; j < capi.length; j++) rivali.push([capi[i].id, capi[j].id]);
  const sonoRivali = (a: string, b: string) => rivali.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

  // 3. Abbandoni (prima del contagio: chi entra oggi non se ne va oggi).
  for (const imp of imprese) {
    const capo = alberi.get(imp.capo)!;
    imp.sostenitori = imp.sostenitori.filter((s) => {
      const a = alberi.get(s.albero)!;
      if (s.dal === giorno || rnd() >= probabilitaAbbandono(capo, a, imp)) return true;
      fatti.push({ tipo: "esce", impresa: imp.tipo, capo: imp.capo, albero: a.id });
      return false;
    });
  }

  // 4. Contagio: i capi più carismatici provano per primi.
  for (const imp of [...imprese].sort((x, y) => alberi.get(y.capo)!.carisma - alberi.get(x.capo)!.carisma)) {
    const capo = alberi.get(imp.capo)!;
    for (const a of g.alberi) {
      if (membri(imp).includes(a.id) || sostenitoreDi(a.id, imprese) || sonoRivali(capo.id, a.id)) continue;
      if (rnd() >= probabilitaContagio(capo, a, imp)) continue;
      const ruolo = prossimoRuolo(imp).id;
      imp.sostenitori.push({ albero: a.id, ruolo, dal: giorno });
      fatti.push({ tipo: "entra", impresa: imp.tipo, capo: capo.id, albero: a.id, ruolo, motivo: "contagio" });
    }
  }

  // 5. Prima della rivelazione: punti alla strada del capo. Dopo: il cambio raro.
  for (const imp of imprese) {
    const strada = tipoImpresa(imp.tipo).strada;
    if (!strada) continue;
    for (const s of imp.sostenitori) {
      const a = alberi.get(s.albero)!;
      if (!a.strada) {
        const punti = Math.round((2 * a.influenzabilita) / 100 + 0.5);
        spinte[a.id] = { ...spinte[a.id], [strada]: (spinte[a.id]?.[strada] ?? 0) + punti };
        fatti.push({ tipo: "punti", albero: a.id, strada, punti, impresa: imp.tipo });
      } else if (
        CAMBIO_STRADA.attivo &&
        a.strada !== strada &&
        !cambi[a.id] &&
        giorno - s.dal >= CAMBIO_STRADA.giorniMinimi &&
        rnd() < CAMBIO_STRADA.probabilita * (a.influenzabilita / 100)
      ) {
        cambi[a.id] = strada;
        fatti.push({ tipo: "cambio-strada", albero: a.id, da: a.strada, a: strada, impresa: imp.tipo });
      }
    }
  }
  // Chi cambia strada chiude l'impresa della strada vecchia: i suoi sostenitori tornano liberi.
  for (const id of Object.keys(cambi)) {
    const vecchia = imprese.find((i) => i.capo === id && tipoImpresa(i.tipo).strada !== null);
    if (vecchia) {
      imprese = imprese.filter((i) => i !== vecchia);
      fatti.push({ tipo: "chiusa", impresa: vecchia.tipo, capo: id });
    }
  }

  // 6. Il lavoro del giorno: le imprese con più sostenitori crescono più in fretta.
  imprese = imprese.map((imp) => {
    const { impresa, fatti: f } = lavoraImpresa(imp);
    for (const x of f) fatti.push({ tipo: "lavoro", impresa: imp.tipo, capo: imp.capo, fatto: x });
    return impresa;
  });

  // 7. Attività di gruppo (e la rivalità, che è un'attività di gruppo buffa).
  const scena = attivitaDiGruppo(
    g.alberi.map((a) => ({ id: a.id, strada: a.strada, giorni: a.giorni })),
    g.cielo,
    imprese.map((i) => ({ tipo: i.tipo, membri: membri(i) })),
    rivali,
    rnd,
  );
  if (scena) {
    fatti.push({ tipo: "gruppo", scena });
    if (scena.attivita.rivalita) fatti.push({ tipo: "rivalita", capi: scena.partecipanti as [string, string] });
  }

  return { imprese, fatti, spinte, cambi, rivali };
}

// ── Il racconto: frasi per il prompt delle giornate e per la simulazione ────

const elencoNomi = (n: string[]) => (n.length <= 1 ? n.join("") : `${n.slice(0, -1).join(", ")} e ${n[n.length - 1]}`);

/**
 * I fatti della stanza raccontati in terza persona, per ognuno degli alberi
 * coinvolti: entrano nel prompt della giornata (GiornoDaVivere.fattiStanza),
 * così il diario ne parla con la voce dell'albero.
 */
export function raccontaFatti(fatti: FattoStanza[], alberi: AlberoInStanza[], imprese: Impresa[]): Record<string, string[]> {
  const nome = (id: string) => alberi.find((a) => a.id === id)?.nome ?? "un albero";
  const out: Record<string, string[]> = {};
  const dai = (ids: string[], frase: string) => {
    for (const id of new Set(ids)) (out[id] ??= []).push(frase);
  };
  const tutti = alberi.map((a) => a.id);
  for (const f of fatti) {
    switch (f.tipo) {
      case "fondata":
        dai(tutti, `${nome(f.capo)} fonda l'impresa «${tipoImpresa(f.impresa).nome}» e ne è il capo.`);
        break;
      case "entra": {
        const t = tipoImpresa(f.impresa);
        const ruolo = t.ruoli.find((r) => r.id === f.ruolo);
        const come =
          f.motivo === "stessa-strada"
            ? `entra nell'impresa «${t.nome}» di ${nome(f.capo)}: è la sua stessa strada`
            : `si lascia convincere da ${nome(f.capo)} ed entra nell'impresa «${t.nome}»`;
        dai([f.albero, f.capo], `${nome(f.albero)} ${come}, come ${ruolo?.nome ?? "sostenitore"} (${ruolo?.fa ?? "dà una mano"}).`);
        break;
      }
      case "esce":
        dai([f.albero, f.capo], `${nome(f.albero)} lascia l'impresa «${tipoImpresa(f.impresa).nome}» di ${nome(f.capo)}, con garbo: non faceva per lui.`);
        break;
      case "lavoro": {
        const imp = imprese.find((i) => i.tipo === f.impresa);
        const chi = imp ? membri(imp) : [f.capo];
        const aiuti = chi.filter((x) => x !== f.capo).map(nome);
        const nomeImp = tipoImpresa(f.impresa).nome;
        if (f.fatto.tipo === "passo")
          dai(chi, `«${nomeImp}» va avanti: ${nome(f.capo)} ${f.fatto.etichetta}${aiuti.length ? `, con l'aiuto di ${elencoNomi(aiuti)}` : ""}.`);
        else if (f.fatto.saleDiLivello)
          dai(chi, `«${nomeImp}» finisce il cantiere «${f.fatto.nome}» e sale al livello ${f.fatto.livello}: ${f.fatto.nomeLivello}.`);
        else dai(chi, `«${nomeImp}» finisce il cantiere «${f.fatto.nome}»${f.fatto.completa ? ": l'impresa è completa, e se ne vanta un po'" : ""}.`);
        break;
      }
      case "punti":
        // Non si dice: si vede col tempo (la strada non si nomina prima della rivelazione).
        break;
      case "cambio-strada":
        dai(tutti, `Dopo tanto tempo nell'impresa «${tipoImpresa(f.impresa).nome}», ${nome(f.albero)} annuncia che cambia strada: da ${f.da} a ${f.a}. Un grande giorno, e resta simpatico come prima.`);
        break;
      case "chiusa":
        dai(tutti, `${nome(f.capo)} chiude l'impresa «${tipoImpresa(f.impresa).nome}» e conserva gli arredi per ricordo.`);
        break;
      case "rivalita":
        dai(f.capi, `${elencoNomi(f.capi.map(nome))} sono capi rivali: si sfidano per ridere, mai per cattiveria.`);
        break;
      case "gruppo":
        dai(f.scena.partecipanti, `${elencoNomi(f.scena.partecipanti.map(nome))} ${f.scena.attivita.frase} (${f.scena.fascia}).`);
        break;
    }
  }
  return out;
}

/** Una riga per la simulazione: livello e membri di ogni impresa. */
export function descriviImprese(imprese: Impresa[], alberi: AlberoInStanza[]): string[] {
  const nome = (id: string) => alberi.find((a) => a.id === id)?.nome ?? id;
  return imprese.map((i) => {
    const av = avanzamento(i);
    const t = tipoImpresa(i.tipo);
    const sost = i.sostenitori.map((s) => `${nome(s.albero)} (${t.ruoli.find((r) => r.id === s.ruolo)?.nome})`);
    return `«${t.nome}» di ${nome(i.capo)}: livello ${av.livello} (${av.nomeLivello})${av.inCorso ? `, cantiere «${av.inCorso.cantiere.nome}» passo ${av.inCorso.passo + 1}` : ", completa"}; sostenitori: ${sost.join(", ") || "nessuno"}`;
  });
}
