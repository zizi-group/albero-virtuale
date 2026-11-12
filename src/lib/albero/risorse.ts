// Le risorse che l'albero raccoglie e consuma (docs/stanze-e-vita.md, sezione 4.1).
// Quantità piccole, da 0 a 9: nella scena si vedono come mucchietti che crescono
// e calano. Non c'è commercio con la persona: le risorse non si comprano mai.
// Le regole su chi le dà e chi le usa sono in catene.ts (EFFETTI).

export const RISORSE = ["legna", "ghiande", "foglie", "sassi", "bacche", "acqua", "resina", "piume", "semi", "fili"] as const;
export type Risorsa = (typeof RISORSE)[number];
export type Risorse = Partial<Record<Risorsa, number>>;

export const MAX_RISORSA = 9;

export const INFO_RISORSE: Record<Risorsa, { nome: string; uno: string }> = {
  legna: { nome: "legna", uno: "un ramo secco" },
  ghiande: { nome: "ghiande", uno: "una ghianda" },
  foglie: { nome: "foglie", uno: "una foglia" },
  sassi: { nome: "sassi", uno: "un sasso" },
  bacche: { nome: "bacche", uno: "una bacca" },
  acqua: { nome: "acqua", uno: "un secchio d'acqua" },
  resina: { nome: "resina", uno: "una goccia di resina" },
  piume: { nome: "piume", uno: "una piuma" },
  semi: { nome: "semi", uno: "un seme" },
  fili: { nome: "fili d'erba intrecciati", uno: "una corda d'erba" },
};

const limita = (v: number) => Math.max(0, Math.min(MAX_RISORSA, Math.round(v)));

/** Dal database (jsonb) a risorse pulite: solo le chiavi note, solo numeri 0-9. */
export function leggiRisorse(grezzo: unknown): Risorse {
  const fuori: Risorse = {};
  if (!grezzo || typeof grezzo !== "object") return fuori;
  for (const r of RISORSE) {
    const v = (grezzo as Record<string, unknown>)[r];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) fuori[r] = limita(v);
  }
  return fuori;
}

export function quante(r: Risorse, k: Risorsa): number {
  return r[k] ?? 0;
}

/** Aggiunge (o toglie, con numeri negativi): il risultato resta tra 0 e 9. */
export function aggiungi(r: Risorse, d: Risorse): Risorse {
  const fuori: Risorse = { ...r };
  for (const k of Object.keys(d) as Risorsa[]) {
    const v = limita(quante(fuori, k) + (d[k] ?? 0));
    if (v > 0) fuori[k] = v;
    else delete fuori[k];
  }
  return fuori;
}

/** Ne ha abbastanza? */
export function basta(r: Risorse, serve: Risorse): boolean {
  return (Object.keys(serve) as Risorsa[]).every((k) => quante(r, k) >= (serve[k] ?? 0));
}

/** Per i prompt e i controlli: «legna 3, bacche 2» (vuoto se non ha niente). */
export function descriviRisorse(r: Risorse): string {
  return RISORSE.filter((k) => quante(r, k) > 0)
    .map((k) => `${INFO_RISORSE[k].nome} ${quante(r, k)}`)
    .join(", ");
}
