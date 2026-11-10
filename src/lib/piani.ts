// I tre pacchetti di docs/modello-di-business.md (piano del 10/11/2026).
// Prezzi e testi per il sito stanno in src/components/landing/Pacchetti.tsx;
// qui solo quello che serve al server per decidere che cosa vede la persona.

export const ID_PACCHETTI = ["albero", "premium-annuale", "premium-mensile"] as const;
export type IdPacchetto = (typeof ID_PACCHETTI)[number];

export function isPacchetto(v: unknown): v is IdPacchetto {
  return typeof v === "string" && (ID_PACCHETTI as readonly string[]).includes(v);
}

/** Il Premium (annuale o mensile) ha gli extra di ogni mese: regalo, riepilogo, cartolina. */
export function isPremium(piano: string | null | undefined): boolean {
  return piano === "premium-annuale" || piano === "premium-mensile";
}

export const NOMI_PACCHETTO: Record<IdPacchetto, string> = {
  albero: "Albero",
  "premium-annuale": "Premium annuale",
  "premium-mensile": "Premium mensile",
};
