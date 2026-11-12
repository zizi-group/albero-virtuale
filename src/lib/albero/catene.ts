import type { Cielo } from "./tipi";
import type { FasciaDiGiorno, Palinsesto } from "./giornata";
import { aggiungi, descriviRisorse, INFO_RISORSE, leggiRisorse, MAX_RISORSA, quante, type Risorsa, type Risorse } from "./risorse";

// Le catene e la memoria dell'albero (docs/stanze-e-vita.md, sezione 4).
// Una catena è una fila di attività legate da risorse e tracce: il primo passo
// la apre, il passo dopo diventa molto più probabile (×5, in giornata.ts) nei
// giorni seguenti; Pino può distrarsi e riprenderla, e dopo 10 giorni senza un
// passo la lascia perdere. Tutto qui è codice, mai deciso dall'AI.
//
// La memoria (trees.memoria) e le risorse (trees.risorse) descrivono l'albero
// all'INIZIO del giorno `oggi.giorno`, insieme alla giornata a fasce di quel
// giorno: così il giardino sa che cosa c'è nella scena a ogni fascia (le
// attività delle fasce già passate hanno lasciato le loro tracce) e il motore
// notturno, prima di vivere il giorno dopo, chiude la giornata (chiudiGiornata).

// ——— Le tracce nella scena ———

export interface Tracce {
  /** Il cerchio di sassi del falò: resta per sempre dopo il primo fuoco. */
  cerchio: boolean;
  /** Le braci: giorni che restano calde (si spengono di un giorno a notte, e con la pioggia). */
  braci: number;
  /** L'orto: 0 niente, 1 aiuola zappata, 2 seminato, 3 germogli, 4 verdure mature. */
  orto: number;
  /** Annaffiature dalla semina (la pioggia conta). */
  annaffiature: number;
  /** Verdure raccolte, pronte per la zuppa (0-3). */
  raccolto: number;
  /** Succo di bacche schiacciate, pronto per la marmellata (0-3). */
  succo: number;
  /** Vasetti di marmellata sulla mensola di sassi (0-6). */
  vasetti: number;
  /** Il mucchio di foglie rastrellate. */
  mucchio: boolean;
}

export const TRACCE_VUOTE: Tracce = {
  cerchio: false,
  braci: 0,
  orto: 0,
  annaffiature: 0,
  raccolto: 0,
  succo: 0,
  vasetti: 0,
  mucchio: false,
};

/** Quello che serve per disegnare la scena: tracce e mucchietti delle risorse. */
export type TracceScena = Partial<Tracce> & Risorse;

// ——— Le catene ———

export interface Catena {
  id: string;
  /** Con l'articolo: «il fuoco». */
  nome: string;
  passi: string[];
  /** Che cosa resta nella scena (per i testi). */
  traccia: string;
}

export const CATENE: Catena[] = [
  {
    id: "fuoco",
    nome: "il fuoco",
    passi: ["raccogliere-rami", "accendere-fuoco", "arrostire-castagne", "storie-al-fuoco"],
    traccia: "il cerchio di sassi e le braci",
  },
  {
    id: "orto",
    nome: "l'orto",
    passi: ["zappare-aiuola", "seminare", "annaffiare-orto", "annaffiare-orto", "annaffiare-orto", "raccogliere-orto", "cucinare-zuppa"],
    traccia: "l'orto che cresce",
  },
  {
    id: "marmellata",
    nome: "la marmellata",
    passi: ["raccogliere-bacche", "schiacciare-bacche", "cuocere-marmellata", "regalare-marmellata"],
    traccia: "i vasetti sulla mensola",
  },
];

const CATENA = new Map(CATENE.map((c) => [c.id, c]));

/** Dopo quanti giorni senza un passo la catena si lascia perdere. */
export const GIORNI_DI_PAZIENZA = 10;

// ——— La memoria ———

export interface CatenaAperta {
  /** L'ultimo passo fatto (0 = il primo). */
  passo: number;
  dal: number;
  ultimo: number;
}

export interface Memoria {
  v: 1;
  catene: Record<string, CatenaAperta>;
  tracce: Tracce;
  /** Le giornate degli ultimi tre giorni, dalla più recente (anti-ripetizione). */
  storia: { giorno: number; p: Palinsesto }[];
  /** Le attività fatte almeno una volta come principali (per il peso «mai fatta»). */
  fatte: string[];
  /** Quante volte ha finito ogni catena. */
  completate: Record<string, number>;
  /** I fatti delle catene, per il diario e la lettera della settimana. */
  registro: { giorno: number; testo: string }[];
  /** La giornata a fasce del giorno vissuto più di recente. */
  oggi: { giorno: number; p: Palinsesto } | null;
}

export function memoriaVuota(): Memoria {
  return { v: 1, catene: {}, tracce: { ...TRACCE_VUOTE }, storia: [], fatte: [], completate: {}, registro: [], oggi: null };
}

const numero = (x: unknown, min: number, max: number, altrimenti = 0) =>
  typeof x === "number" && Number.isFinite(x) ? Math.max(min, Math.min(max, Math.round(x))) : altrimenti;

function pulisciPalinsesto(x: unknown): Palinsesto | null {
  if (!x || typeof x !== "object") return null;
  const p = x as Record<string, unknown>;
  const fasce = ["mattina", "giorno", "pomeriggio", "sera"] as const;
  if (!fasce.every((f) => Array.isArray(p[f]) && (p[f] as unknown[]).every((i) => typeof i === "string"))) return null;
  return Object.fromEntries(fasce.map((f) => [f, (p[f] as string[]).slice(0, 4)])) as Palinsesto;
}

/** Dal database (jsonb) a una memoria pulita; vuota se manca o non si legge. */
export function leggiMemoria(grezzo: unknown): Memoria {
  const m = memoriaVuota();
  if (!grezzo || typeof grezzo !== "object") return m;
  const g = grezzo as Record<string, unknown>;
  const t = (g.tracce ?? {}) as Record<string, unknown>;
  m.tracce = {
    cerchio: t.cerchio === true,
    braci: numero(t.braci, 0, 3),
    orto: numero(t.orto, 0, 4),
    annaffiature: numero(t.annaffiature, 0, 9),
    raccolto: numero(t.raccolto, 0, 3),
    succo: numero(t.succo, 0, 3),
    vasetti: numero(t.vasetti, 0, 6),
    mucchio: t.mucchio === true,
  };
  if (g.catene && typeof g.catene === "object") {
    for (const [id, c] of Object.entries(g.catene as Record<string, Record<string, unknown>>)) {
      const def = CATENA.get(id);
      if (!def || !c) continue;
      m.catene[id] = { passo: numero(c.passo, 0, def.passi.length - 1), dal: numero(c.dal, 0, 1e6), ultimo: numero(c.ultimo, 0, 1e6) };
    }
  }
  if (Array.isArray(g.storia)) {
    for (const s of g.storia.slice(0, 3)) {
      const p = pulisciPalinsesto((s as { p?: unknown })?.p);
      if (p) m.storia.push({ giorno: numero((s as { giorno?: unknown }).giorno, 0, 1e6), p });
    }
  }
  if (Array.isArray(g.fatte)) m.fatte = g.fatte.filter((x): x is string => typeof x === "string").slice(0, 300);
  if (g.completate && typeof g.completate === "object") {
    for (const [id, n] of Object.entries(g.completate as Record<string, unknown>)) if (CATENA.has(id)) m.completate[id] = numero(n, 0, 1e4);
  }
  if (Array.isArray(g.registro)) {
    m.registro = g.registro
      .filter((r): r is { giorno: number; testo: string } => typeof r?.testo === "string" && typeof r?.giorno === "number")
      .slice(-40);
  }
  const oggi = g.oggi as { giorno?: unknown; p?: unknown } | null | undefined;
  const p = pulisciPalinsesto(oggi?.p);
  if (oggi && p) m.oggi = { giorno: numero(oggi.giorno, 0, 1e6), p };
  return m;
}

/** Memoria e risorse insieme: lo stato su cui girano le regole. */
export interface StatoCatene {
  memoria: Memoria;
  risorse: Risorse;
}

export function statoDaDatabase(memoria: unknown, risorse: unknown): StatoCatene {
  return { memoria: leggiMemoria(memoria), risorse: leggiRisorse(risorse) };
}

// ——— Che cosa fa ogni attività alle risorse e alle tracce ———

interface Effetto {
  /** Risorse che raccoglie. */
  da?: Risorse;
  /** Risorse che consuma. */
  usa?: Risorse;
  /** Senza questo non si può fare (peso 0): manca l'oggetto o la risorsa. */
  richiede?: (s: StatoCatene) => boolean;
  /** Che cosa cambia nella scena. */
  tracce?: (t: Tracce, s: StatoCatene) => void;
  /** Che cosa gli manca quando non la può fare (nuvoletta: «legna?»). */
  manca?: (s: StatoCatene) => Risorsa | null;
}

/** C'è del fuoco: le braci di ieri o almeno un ramo per riaccenderlo. */
const fuocoPossibile = (s: StatoCatene) => s.memoria.tracce.braci > 0 || quante(s.risorse, "legna") >= 1;
/** Riaccende dalle braci o con un ramo. */
function ravviva(t: Tracce, s: StatoCatene) {
  if (t.braci === 0) s.risorse = aggiungi(s.risorse, { legna: -1 });
  t.braci = Math.max(t.braci, 1);
  t.cerchio = true;
}

export const EFFETTI: Record<string, Effetto> = {
  "raccogliere-rami": { da: { legna: 3 } },
  "accendere-fuoco": {
    usa: { legna: 2 },
    richiede: (s) => quante(s.risorse, "legna") >= 2,
    manca: () => "legna",
    tracce: (t) => {
      t.braci = 2;
      t.cerchio = true;
    },
  },
  "arrostire-castagne": { richiede: fuocoPossibile, manca: () => "legna", tracce: ravviva },
  "storie-al-fuoco": { richiede: fuocoPossibile, manca: () => "legna", tracce: ravviva },
  // Qualche bacca troppo matura ha i semi: si tengono per l'orto.
  "raccogliere-bacche": { da: { bacche: 3, semi: 1 } },
  "schiacciare-bacche": {
    usa: { bacche: 2 },
    richiede: (s) => quante(s.risorse, "bacche") >= 2 && s.memoria.tracce.succo < 3,
    manca: () => "bacche",
    tracce: (t) => {
      t.succo += 1;
    },
  },
  "cuocere-marmellata": {
    richiede: (s) => s.memoria.tracce.succo >= 1 && fuocoPossibile(s) && s.memoria.tracce.vasetti < 6,
    manca: (s) => (s.memoria.tracce.succo < 1 ? "bacche" : "legna"),
    tracce: (t, s) => {
      ravviva(t, s);
      t.succo -= 1;
      t.vasetti = Math.min(6, t.vasetti + 2);
    },
  },
  "regalare-marmellata": {
    richiede: (s) => s.memoria.tracce.vasetti >= 1,
    tracce: (t) => {
      t.vasetti -= 1;
    },
  },
  "zappare-aiuola": {
    richiede: (s) => s.memoria.tracce.orto === 0,
    tracce: (t) => {
      t.orto = 1;
    },
  },
  seminare: {
    usa: { semi: 1 },
    richiede: (s) => s.memoria.tracce.orto === 1 && quante(s.risorse, "semi") >= 1,
    manca: () => "semi",
    tracce: (t) => {
      t.orto = 2;
      t.annaffiature = 0;
    },
  },
  "annaffiare-orto": {
    richiede: (s) => s.memoria.tracce.orto === 2 || s.memoria.tracce.orto === 3,
    tracce: (t, s) => {
      // L'acqua di scorta, se c'è; altrimenti va al ruscello con l'annaffiatoio.
      if (quante(s.risorse, "acqua") > 0) s.risorse = aggiungi(s.risorse, { acqua: -1 });
      annaffia(t);
    },
  },
  "raccogliere-orto": {
    richiede: (s) => s.memoria.tracce.orto === 4,
    tracce: (t) => {
      t.orto = 0;
      t.annaffiature = 0;
      t.raccolto = Math.min(3, t.raccolto + 2);
    },
  },
  "cucinare-zuppa": {
    richiede: (s) => s.memoria.tracce.raccolto >= 1 && fuocoPossibile(s),
    manca: () => "legna",
    tracce: (t, s) => {
      ravviva(t, s);
      t.raccolto -= 1;
    },
  },
  "rastrellare-foglie": {
    da: { foglie: 3 },
    tracce: (t) => {
      t.mucchio = true;
    },
  },
  "tuffo-foglie": {
    richiede: (s) => s.memoria.tracce.mucchio,
    manca: () => "foglie",
    tracce: (t) => {
      t.mucchio = false;
    },
  },
  "raccogliere-rugiada": { da: { acqua: 1 } },
  "secchio-pioggia": { da: { acqua: 3 } },
  "cercare-ghiande": { da: { ghiande: 2 } },
  "cercare-sassi": { da: { sassi: 2 } },
  "intrecciare-erba": { da: { fili: 1 } },
  // Lo scoiattolo, tra una chiacchiera e l'altra, regala qualche seme.
  "chiacchierare-scoiattolo": { da: { semi: 2 } },
  "contare-ghiande": { richiede: (s) => quante(s.risorse, "ghiande") >= 1, manca: () => "ghiande" },
};

/** Un'annaffiatura (anche quella della pioggia): i germogli dopo 2, le verdure dopo 3. */
function annaffia(t: Tracce) {
  if (t.orto < 2 || t.orto > 3) return;
  t.annaffiature += 1;
  if (t.orto === 2 && t.annaffiature >= 2) t.orto = 3;
  if (t.orto === 3 && t.annaffiature >= 3) t.orto = 4;
}

/** Si può fare adesso? (0 nei pesi se manca qualcosa.) */
export function possibile(id: string, s: StatoCatene): boolean {
  const e = EFFETTI[id];
  return !e?.richiede || e.richiede(s);
}

/** Ha requisiti: non va tra le alternative di una fascia (solo come principale, quando si può). */
export function haRequisiti(id: string): boolean {
  return !!EFFETTI[id]?.richiede;
}

const copia = (s: StatoCatene): StatoCatene => ({
  memoria: {
    ...s.memoria,
    catene: Object.fromEntries(Object.entries(s.memoria.catene).map(([k, c]) => [k, { ...c }])),
    tracce: { ...s.memoria.tracce },
    completate: { ...s.memoria.completate },
    registro: [...s.memoria.registro],
    fatte: [...s.memoria.fatte],
    storia: [...s.memoria.storia],
  },
  risorse: { ...s.risorse },
});

function annota(m: Memoria, giorno: number, testo: string) {
  m.registro = [...m.registro, { giorno, testo }].slice(-40);
}

/**
 * Fa l'attività: raccoglie e consuma risorse, lascia le tracce e manda avanti
 * le catene. Se non si può fare (manca qualcosa), non cambia niente.
 */
export function faiAttivita(s0: StatoCatene, id: string, giorno: number): StatoCatene {
  if (!possibile(id, s0)) return s0;
  const s = copia(s0);
  const e = EFFETTI[id];
  if (e?.usa) s.risorse = aggiungi(s.risorse, Object.fromEntries(Object.entries(e.usa).map(([k, v]) => [k, -(v ?? 0)])));
  if (e?.da) s.risorse = aggiungi(s.risorse, e.da);
  if (e?.tracce) e.tracce(s.memoria.tracce, s);
  avanzaCatene(s.memoria, id, giorno);
  return s;
}

function avanzaCatene(m: Memoria, id: string, giorno: number) {
  for (const c of CATENE) {
    const aperta = m.catene[c.id];
    if (aperta) {
      if (c.passi[aperta.passo + 1] !== id) continue;
      aperta.passo += 1;
      aperta.ultimo = giorno;
      if (aperta.passo >= c.passi.length - 1) {
        delete m.catene[c.id];
        m.completate[c.id] = (m.completate[c.id] ?? 0) + 1;
        annota(m, giorno, `ha finito ${c.nome} (dall'inizio alla fine${m.completate[c.id] > 1 ? `, per la ${m.completate[c.id]}ª volta` : ""})`);
      }
    } else if (c.passi[0] === id) {
      m.catene[c.id] = { passo: 0, dal: giorno, ultimo: giorno };
      annota(m, giorno, `ha cominciato ${c.nome}`);
    }
  }
}

/** Il passo che viene dopo in ogni catena aperta. */
export function prossimiPassi(s: StatoCatene): string[] {
  return Object.entries(s.memoria.catene)
    .map(([id, a]) => CATENA.get(id)?.passi[a.passo + 1])
    .filter((x): x is string => !!x);
}

/** Le risorse che servono per andare avanti nelle catene aperte. */
export function bisogni(s: StatoCatene): Risorsa[] {
  const out = new Set<Risorsa>();
  for (const id of prossimiPassi(s)) {
    if (possibile(id, s)) continue;
    const r = EFFETTI[id]?.manca?.(s);
    if (r) out.add(r);
  }
  return [...out];
}

/**
 * Il fattore della catena nei pesi (docs/stanze-e-vita.md, 3.3): ×5 se è il passo
 * successivo di una catena aperta, ×2 se ne comincia una, ×3 se raccoglie una
 * risorsa che manca per andare avanti; 0 se non si può fare.
 */
export function pesoCatena(id: string, s: StatoCatene): number {
  if (!possibile(id, s)) return 0;
  let p = 1;
  if (prossimiPassi(s).includes(id)) p *= 5;
  // La voglia di cominciare un lavoro nuovo: il primo passo di una catena chiusa.
  else if (CATENE.some((c) => c.passi[0] === id && !s.memoria.catene[c.id])) p *= 2;
  const da = EFFETTI[id]?.da;
  if (da && bisogni(s).some((r) => (da[r] ?? 0) > 0)) p *= 3;
  // Raccogliere quello che ha già in abbondanza gli interessa poco.
  if (da && (Object.keys(da) as Risorsa[]).every((r) => quante(s.risorse, r) >= MAX_RISORSA - 1)) p *= 0.2;
  return p;
}

// ——— La giornata ———

const BAGNATO: Cielo[] = ["pioggia", "temporale"];

/** All'inizio di un giorno: le braci si raffreddano, la pioggia spegne e annaffia. */
export function inizioGiorno(s0: StatoCatene, giorno: number, cielo: Cielo | null): StatoCatene {
  const s = copia(s0);
  const t = s.memoria.tracce;
  t.braci = Math.max(0, t.braci - 1);
  if (cielo && BAGNATO.includes(cielo)) {
    t.braci = 0;
    if (t.orto === 2 || t.orto === 3) {
      annaffia(t);
      // La pioggia vale come un passo «annaffia» dell'orto.
      const o = s.memoria.catene.orto;
      if (o && CATENA.get("orto")!.passi[o.passo + 1] === "annaffiare-orto") {
        o.passo += 1;
        o.ultimo = giorno;
      }
    }
  }
  // Le catene ferme da troppo tempo si lasciano perdere (le tracce restano).
  for (const [id, a] of Object.entries(s.memoria.catene)) {
    if (giorno - a.ultimo > GIORNI_DI_PAZIENZA) {
      delete s.memoria.catene[id];
      annota(s.memoria, giorno, `ha lasciato perdere ${CATENA.get(id)?.nome ?? id}, per ora`);
    }
  }
  return s;
}

/** Lo stato a una certa fascia: le principali delle fasce prima hanno già fatto la loro parte. */
export function statoAllaFascia(s: StatoCatene, p: Palinsesto, giorno: number, fascia: FasciaDiGiorno): StatoCatene {
  let st = s;
  for (const f of ["mattina", "giorno", "pomeriggio", "sera"] as const) {
    if (f === fascia) break;
    if (p[f][0]) st = faiAttivita(st, p[f][0], giorno);
  }
  return st;
}

/**
 * Chiude la giornata salvata in memoria.oggi: le attività principali fanno la
 * loro parte, la giornata entra nella storia (anti-ripetizione). Il risultato è
 * lo stato all'inizio del giorno dopo, senza `oggi`.
 */
export function chiudiGiornata(s: StatoCatene): StatoCatene {
  const oggi = s.memoria.oggi;
  if (!oggi) return s;
  let st = s;
  for (const f of ["mattina", "giorno", "pomeriggio", "sera"] as const) {
    if (oggi.p[f][0]) st = faiAttivita(st, oggi.p[f][0], oggi.giorno);
  }
  const m = copia(st).memoria;
  const principali = Object.values(oggi.p).map((l) => l[0]).filter(Boolean);
  m.fatte = [...new Set([...m.fatte, ...principali])];
  m.storia = [{ giorno: oggi.giorno, p: oggi.p }, ...m.storia.filter((x) => x.giorno < oggi.giorno)].slice(0, 3);
  m.oggi = null;
  return { memoria: m, risorse: st.risorse };
}

// ——— Testi ———

/** Le tracce e i mucchietti da disegnare. */
export function tracceDa(s: StatoCatene): TracceScena {
  return { ...s.memoria.tracce, ...s.risorse };
}

/** Per i prompt: catene aperte, che cosa ha e che cosa c'è nel prato. */
export function descriviCatene(s: StatoCatene): string {
  const righe: string[] = [];
  const aperte = Object.entries(s.memoria.catene);
  if (aperte.length) {
    righe.push(
      `Lavori in corso: ${aperte
        .map(([id, a]) => {
          const c = CATENA.get(id)!;
          return `${c.nome} (passo ${a.passo + 1} di ${c.passi.length})`;
        })
        .join(", ")}.`,
    );
  }
  const r = descriviRisorse(s.risorse);
  if (r) righe.push(`Scorte nel prato: ${r}.`);
  const t = s.memoria.tracce;
  const cose = [
    t.cerchio && (t.braci > 0 ? "il cerchio di sassi del falò con le braci ancora calde" : "il cerchio di sassi del falò"),
    t.orto === 1 && "un'aiuola zappata",
    t.orto === 2 && "l'orto appena seminato",
    t.orto === 3 && "l'orto con i germogli",
    t.orto === 4 && "l'orto con le verdure mature",
    t.vasetti > 0 && `${t.vasetti} ${t.vasetti === 1 ? "vasetto" : "vasetti"} di marmellata`,
    t.mucchio && "un mucchio di foglie",
  ].filter(Boolean);
  if (cose.length) righe.push(`Nel prato: ${cose.join(", ")}.`);
  return righe.join("\n");
}

/** I fatti delle catene tra due giorni (compresi), per la lettera della settimana. */
export function fattiDellaSettimana(m: Memoria, da: number, a: number): string[] {
  return m.registro.filter((r) => r.giorno >= da && r.giorno <= a).map((r) => `giorno ${r.giorno}: ${r.testo}`);
}

/** Che cosa gli manca, per la nuvoletta («legna?»). */
export function pensieroDelBisogno(s: StatoCatene): string | null {
  const b = bisogni(s)[0];
  return b ? `${INFO_RISORSE[b].nome}?` : null;
}
