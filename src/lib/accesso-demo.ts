/**
 * Accesso demo senza login (solo sviluppo in locale).
 * Si accende con LINFA_ACCESSO_DEMO=1 in `.env.local`.
 */
export function accessoDemoAttivo() {
  return process.env.LINFA_ACCESSO_DEMO === "1";
}
