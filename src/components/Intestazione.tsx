import Link from "next/link";
import type { ReactNode } from "react";

export function Logo({ className = "", chiaro = false, moderno = false }: { className?: string; chiaro?: boolean; moderno?: boolean }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 ${className}`} aria-label="Linfa, pagina iniziale">
      <svg viewBox="0 0 32 32" className="h-8 w-8 transition-transform duration-500 group-hover:-rotate-6" aria-hidden>
        <path d="M16 29 C16 22 16 16 16 11" stroke={chiaro ? "#d8b48a" : "#7a5236"} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M16 17 C9 17 5 12 5 6 C11 6 16 10 16 17 Z" fill="#6f9a3c" />
        <path d="M16 13 C22 13 27 9 27 3 C21 3 16 7 16 13 Z" fill={chiaro ? "#9cc25a" : "#3f5a2a"} />
        <circle cx="16" cy="22" r="2.4" fill="#e0a526" className="transition-transform group-hover:scale-125" style={{ transformOrigin: "16px 22px" }} />
      </svg>
      <span className={`${moderno ? "lp-logo" : "font-titolo text-2xl"} leading-none ${chiaro ? "text-carta" : "text-inchiostro"}`}>Linfa</span>
    </Link>
  );
}

/**
 * L'intestazione. `sopra`: galleggia sopra una scena (fissa nella pagina
 * iniziale, assoluta nel giardino), con logo e link su pillole di carta.
 */
export function Intestazione({
  children,
  sopra,
  moderna = false,
}: {
  children?: ReactNode;
  sopra?: "fissa" | "assoluta";
  /** Lo stile della pagina iniziale: pillole bianche nette, logo nel sans. */
  moderna?: boolean;
}) {
  if (sopra && moderna) {
    return (
      <header className={`${sopra === "fissa" ? "fixed" : "absolute"} inset-x-0 top-0 z-40`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
          <span className="lp-nav-pill py-1 pr-4 pl-2">
            <Logo moderno />
          </span>
          <nav aria-label="Principale" className="flex items-center gap-2">
            {children}
          </nav>
        </div>
      </header>
    );
  }
  if (sopra) {
    return (
      <header className={`${sopra === "fissa" ? "fixed" : "absolute"} inset-x-0 top-0 z-40`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
          <span className="pillola py-1 pr-4 pl-2">
            <Logo />
          </span>
          <nav aria-label="Principale" className="flex items-center gap-2">
            {children}
          </nav>
        </div>
      </header>
    );
  }
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5">
      <Logo />
      <nav aria-label="Principale" className="flex items-center gap-2 text-[15px]">
        {children}
      </nav>
    </header>
  );
}
