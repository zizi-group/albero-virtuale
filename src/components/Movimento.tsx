"use client";

import { useSyncExternalStore } from "react";
import { CHIAVE_MOVIMENTO, EVENTO_MOVIMENTO } from "@/lib/movimento";

export { EVENTO_MOVIMENTO };

// Il movimento del sito. Di default segue il sistema (prefers-reduced-motion).
// «Animazioni complete» lo forza: <html data-movimento="pieno">, ricordato nel
// browser (localStorage) e letto prima del primo disegno da uno script in
// layout.tsx. Vale per tutto il sito, albero animato compreso: le regole
// del movimento ridotto vanno scritte sotto :root:not([data-movimento="pieno"]).

export function movimentoForzato(): boolean {
  return typeof document !== "undefined" && document.documentElement.dataset.movimento === "pieno";
}

/** true se le animazioni vanno fermate: sistema in movimento ridotto e niente «Animazioni complete». */
export function movimentoRidotto(): boolean {
  if (typeof window === "undefined") return false;
  if (movimentoForzato()) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const QUERY = "(prefers-reduced-motion: reduce)";

/** Si iscrive ai cambi del sistema e dell'interruttore. */
function iscrivi(avvisa: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", avvisa);
  window.addEventListener(EVENTO_MOVIMENTO, avvisa);
  return () => {
    mq.removeEventListener("change", avvisa);
    window.removeEventListener(EVENTO_MOVIMENTO, avvisa);
  };
}
const sistemaRidotto = () => window.matchMedia(QUERY).matches;
const maiSulServer = () => false;

/** Stato reattivo del movimento ridotto: cambia col sistema e con l'interruttore. */
export function useMovimentoRidotto(): boolean {
  return useSyncExternalStore(iscrivi, movimentoRidotto, maiSulServer);
}

/** L'interruttore discreto «Animazioni complete». */
export function InterruttoreMovimento({ className = "" }: { className?: string }) {
  const pieno = useSyncExternalStore(iscrivi, movimentoForzato, maiSulServer);
  const ridottoDalSistema = useSyncExternalStore(iscrivi, sistemaRidotto, maiSulServer);
  const attiva = pieno || !ridottoDalSistema;
  // Serve solo a chi ha il movimento ridotto nel sistema: per gli altri è già tutto acceso.
  if (!ridottoDalSistema && !pieno) return null;

  const scegli = () => {
    const nuovo = !pieno;
    try {
      if (nuovo) localStorage.setItem(CHIAVE_MOVIMENTO, "pieno");
      else localStorage.removeItem(CHIAVE_MOVIMENTO);
    } catch {
      // Navigazione privata: vale solo per questa visita.
    }
    if (nuovo) document.documentElement.dataset.movimento = "pieno";
    else delete document.documentElement.dataset.movimento;
    window.dispatchEvent(new Event(EVENTO_MOVIMENTO));
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={attiva}
      onClick={scegli}
      className={`interruttore-movimento ${className}`}
      title={ridottoDalSistema && !pieno ? "Il sistema chiede movimento ridotto: attivale per vedere tutti gli effetti" : undefined}
    >
      <span className="interruttore-movimento-binario" aria-hidden>
        <span />
      </span>
      <span className="max-sm:hidden">Animazioni complete</span>
      <span className="sm:hidden">Animazioni</span>
    </button>
  );
}
