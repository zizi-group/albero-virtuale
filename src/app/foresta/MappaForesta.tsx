"use client";

import Link from "next/link";
import { indirizzoStanza, type DatiForesta } from "@/lib/foresta/tipi";

// Il ripiego 2D della tua foresta: una mappa disegnata con le radure, senza
// WebGL. Si usa sui dispositivi senza 3D o lenti, e con `?vista=mappa`.

const POSTI: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[33, 52], [67, 50]],
  3: [[32, 40], [68, 40], [50, 68]],
  4: [[33, 36], [67, 36], [33, 68], [67, 68]],
};

// Colori delle chiome per strada (solo per distinguerli sulla mappa).
const CHIOME: Record<string, string> = {
  filosofo: "#5f8a3a",
  imprenditore: "#7a9a2c",
  artista: "#c0782a",
  sportivo: "#4f9a46",
  furfante: "#4a6a3a",
  viaggiatore: "#6aa04a",
  poeta: "#8aa83e",
};

function Alberello({ x, y, colore }: { x: number; y: number; colore: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="11" rx="9" ry="3" fill="rgba(0,0,0,.18)" />
      <rect x="-2.2" y="0" width="4.4" height="11" rx="2" fill="#7a5236" />
      <circle cx="0" cy="-5" r="10" fill={colore} />
      <circle cx="-4" cy="-9" r="5" fill="rgba(255,255,255,.18)" />
      <circle cx="-2.6" cy="-4" r="1.3" fill="#23261d" />
      <circle cx="2.6" cy="-4" r="1.3" fill="#23261d" />
    </g>
  );
}

export function MappaForesta({ dati, onEntra, onEsempio }: { dati: DatiForesta; onEntra?: (href: string) => void; onEsempio?: () => void }) {
  const vai = (href: string, esempio?: boolean) => (e: React.MouseEvent) => {
    if (esempio && onEsempio) {
      e.preventDefault();
      onEsempio();
      return;
    }
    if (!onEntra) return;
    e.preventDefault();
    onEntra(href);
  };
  return (
    <div className="fo-mappa" data-stagione={dati.stagione} data-ora={dati.ora}>
      <ol className="fo-mappa-griglia">
        {dati.stanze.map((s) => {
          const posti = POSTI[Math.min(4, Math.max(1, s.alberi.length))];
          const href = indirizzoStanza(s.id);
          return (
            <li key={s.id} className="fo-radura" data-esempio={s.esempio || undefined}>
              <svg viewBox="0 0 100 100" className="fo-radura-disegno" aria-hidden>
                <circle cx="50" cy="52" r="44" className="fo-radura-prato" />
                <circle cx="50" cy="52" r="44" className="fo-radura-recinto" />
                {s.alberi.slice(0, 4).map((a, i) => (
                  <Link key={a.id} href={indirizzoStanza(s.id, a.id)} onClick={vai(indirizzoStanza(s.id, a.id), s.esempio)} aria-label={`Entra da ${a.nome}`}>
                    <Alberello x={posti[i][0]} y={posti[i][1]} colore={CHIOME[a.strada ?? ""] ?? "#6f9a3c"} />
                  </Link>
                ))}
              </svg>
              <Link href={href} onClick={vai(href, s.esempio)} className="fo-cartello">
                <span className="fo-cartello-nome">{s.nome}</span>
                <span className="fo-cartello-riga">{s.esempio ? "esempio della demo" : s.alberi.map((a) => a.nome).join(" · ")}</span>
              </Link>
            </li>
          );
        })}
        {dati.bloccate.map((b) => (
          <li key={`chiusa-${b.numero}`} className="fo-radura fo-radura-chiusa">
            <svg viewBox="0 0 100 100" className="fo-radura-disegno" aria-hidden>
              <circle cx="50" cy="52" r="44" className="fo-radura-incolta" />
              {[[24, 34], [74, 30], [30, 76], [72, 74], [50, 86], [18, 56], [84, 54]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={7 + (i % 3) * 2} fill="#4e7a34" opacity=".85" />
              ))}
              {/* il lucchetto di rami */}
              <g transform="translate(50 54)" stroke="#5a3a26" strokeLinecap="round" fill="none">
                <path d="M-9 -8 A9 11 0 0 1 9 -8" strokeWidth="4" />
                <path d="M-14 -6 H14 M-14 0 H14 M-14 6 H14 M-14 12 H14" strokeWidth="4.5" />
                <path d="M-7 -8 V14 M7 -8 V14" stroke="#5a8a34" strokeWidth="2" />
              </g>
            </svg>
            <p className="fo-cartello fo-cartello-chiuso">
              <span className="fo-cartello-nome">Stanza {b.numero}</span>
              <span className="fo-cartello-riga">{b.regola}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
