import { NOMI_CANALI, type Canale, type Canali } from "./canali";

// Il copione di una scenetta: chiavi nel tempo per ogni canale, più gli eventi
// (fumetti, gocce, foglie). Si scrive in sequenza, come una regia:
//   c.vai(0.5, { dxSpalla: 80 }).pausa(1).evento(...).vai(0.4, {...})
// e alla fine c.fine() riporta tutto alla posa di partenza, così il ciclo si chiude.

export type Andamento = (u: number) => number;

export const ANDAMENTI = {
  lin: (u: number) => u,
  /** Dolce in entrata e in uscita. */
  io: (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * u),
  out: (u: number) => 1 - (1 - u) ** 3,
  in: (u: number) => u ** 3,
  /** Supera il bersaglio e torna: per gesti con slancio. */
  back: (u: number) => {
    const s = 1.9;
    const v = u - 1;
    return 1 + (s + 1) * v ** 3 + s * v ** 2;
  },
  /** Molla smorzata: per atterraggi e schiacciamenti. */
  molla: (u: number) => (u >= 1 ? 1 : 1 - Math.exp(-6 * u) * Math.cos(12 * u)),
  /** Resta fermo e salta al valore nuovo alla fine. */
  scatto: (u: number) => (u >= 1 ? 1 : 0),
} satisfies Record<string, Andamento>;

export type NomeAndamento = keyof typeof ANDAMENTI;

interface Chiave {
  t: number;
  v: number;
  a: Andamento;
}

/** Quello che una scenetta può chiedere al motore mentre recita. */
export interface Regia {
  emetti(tipo: TipoParticella, x: number, y: number, opzioni?: OpzioniParticella): void;
  fumetto(testo: string, durata?: number): void;
  /** La nuvoletta del pensiero (a puntini), se il motore la sa disegnare. */
  pensa?(testo: string, durata?: number): void;
  /** Frase pescata dal repertorio (per umore, strada, situazione). */
  frase(gruppo: string): string;
  readonly ridotto: boolean;
}

export type TipoParticella =
  | "goccia"
  | "bolla"
  | "sbuffo"
  | "polvere"
  | "foglia"
  | "zeta"
  | "nota"
  | "cuore"
  | "stella"
  | "risata"
  | "ghianda"
  | "vapore"
  | "sudore"
  | "scintilla"
  | "succo"
  | "fumo";

export interface OpzioniParticella {
  vx?: number;
  vy?: number;
  gravita?: number;
  vita?: number;
  scala?: number;
  cresce?: number;
  giro?: number;
  /** Coordinate già del mondo (non del busto). */
  mondo?: boolean;
}

export interface Evento {
  t: number;
  fai: (r: Regia) => void;
}

export class Clip {
  constructor(
    readonly tracce: Map<Canale, Chiave[]>,
    readonly eventi: Evento[],
    readonly durata: number,
    /** Secondi finali in cui la clip sfuma verso quello che c'è sotto (solo per le interazioni). */
    readonly dissolvenza = 0,
  ) {}

  valore(c: Canale, t: number, altrimenti: number): number {
    const k = this.tracce.get(c);
    return k ? valuta(k, t) : altrimenti;
  }
}

function valuta(k: Chiave[], t: number): number {
  if (t <= k[0].t) return k[0].v;
  for (let i = 1; i < k.length; i++) {
    const b = k[i];
    if (t < b.t) {
      const a = k[i - 1];
      const u = (t - a.t) / (b.t - a.t);
      return a.v + (b.v - a.v) * b.a(u);
    }
  }
  return k[k.length - 1].v;
}

export class Copione {
  ora = 0;
  private tracce = new Map<Canale, Chiave[]>();
  private eventi: Evento[] = [];

  constructor(readonly base: Canali) {}

  /** Valore del canale al tempo t, secondo quello che è già scritto. */
  valoreA(c: Canale, t = this.ora): number {
    const k = this.tracce.get(c);
    return k ? valuta(k, t) : this.base[c];
  }

  private metti(c: Canale, t: number, v: number, a: Andamento) {
    let k = this.tracce.get(c);
    if (!k) {
      k = [];
      this.tracce.set(c, k);
    }
    let i = k.length;
    while (i > 0 && k[i - 1].t > t) i--;
    k.splice(i, 0, { t, v, a });
  }

  /** Porta i canali ai valori indicati in `d` secondi, poi va avanti. */
  vai(d: number, bersagli: Partial<Canali>, andamento: NomeAndamento = "io"): this {
    this.con(d, bersagli, andamento);
    this.ora += d;
    return this;
  }

  /** Come vai, ma non sposta il tempo: per muovere più cose insieme. */
  con(d: number, bersagli: Partial<Canali>, andamento: NomeAndamento = "io"): this {
    const a = ANDAMENTI[andamento];
    for (const c of Object.keys(bersagli) as Canale[]) {
      const v = bersagli[c];
      if (v === undefined || Number.isNaN(v)) continue;
      this.metti(c, this.ora, this.valoreA(c), ANDAMENTI.lin);
      this.metti(c, this.ora + d, v, a);
    }
    return this;
  }

  pausa(d: number): this {
    this.ora += d;
    return this;
  }

  a(t: number): this {
    this.ora = t;
    return this;
  }

  evento(fai: (r: Regia) => void, dopo = 0): this {
    this.eventi.push({ t: this.ora + dopo, fai });
    return this;
  }

  /**
   * Oscillazione attorno al valore attuale: `ampiezza` in più e in meno,
   * `volte` andate e ritorni in `durata` secondi, che si smorzano se `smorza`.
   * Non sposta il tempo.
   */
  oscilla(c: Canale, ampiezza: number, volte: number, durata: number, smorza = false): this {
    const centro = this.valoreA(c);
    const passi = Math.max(1, Math.round(volte * 2));
    const dt = durata / (passi + 1);
    const t0 = this.ora;
    this.metti(c, t0, centro, ANDAMENTI.lin);
    for (let i = 0; i < passi; i++) {
      const f = smorza ? 1 - i / passi : 1;
      const segno = i % 2 === 0 ? 1 : -1;
      this.metti(c, t0 + dt * (i + 1), centro + segno * ampiezza * f, ANDAMENTI.io);
    }
    this.metti(c, t0 + durata, centro, ANDAMENTI.io);
    return this;
  }

  ripeti(volte: number, fai: (i: number) => void): this {
    for (let i = 0; i < volte; i++) fai(i);
    return this;
  }

  /** Riporta alla posa di partenza tutti i canali toccati e chiude la clip. */
  fine(d = 0.6, andamento: NomeAndamento = "io"): Clip {
    const ritorno: Partial<Canali> = {};
    for (const c of this.tracce.keys()) ritorno[c] = this.base[c];
    this.vai(d, ritorno, andamento);
    return this.chiudi();
  }

  /** Chiude la clip così com'è; `dissolvenza` per le interazioni che sfumano. */
  chiudi(dissolvenza = 0): Clip {
    let fineTracce = this.ora;
    for (const k of this.tracce.values()) fineTracce = Math.max(fineTracce, k[k.length - 1].t);
    return new Clip(new Map(this.tracce), [...this.eventi].sort((a, b) => a.t - b.t), fineTracce, dissolvenza);
  }
}

/** Una clip che va da `da` a `a` (per i cambi di posa). */
export function transizione(da: Canali, a: Canali, durata: number, andamento: NomeAndamento): Clip {
  const c = new Copione(da);
  const bersagli: Partial<Canali> = {};
  for (const k of NOMI_CANALI) if (Math.abs(da[k] - a[k]) > 1e-3) bersagli[k] = a[k];
  c.vai(durata, bersagli, andamento);
  return c.chiudi();
}
