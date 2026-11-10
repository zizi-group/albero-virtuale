"use client";

import { useId } from "react";
import { FREDDO_SOTTO } from "@/lib/albero/scena";
import type { Meteo, Posa, Stadio, Stagione } from "@/lib/albero/tipi";
import { AlberoVivo } from "./vivo/AlberoVivo";
import "./vivo/vivo.css";

// La scena intorno all'albero: cielo, sole o luna, nuvole, pioggia, neve, prato.
// Posizioni pseudo-casuali ma fisse (niente differenze tra server e browser).
// Quando cambia il meteo il cielo sfuma, pioggia e astri compaiono piano;
// l'albero (vivo/) fa un saltello e cambia posa.

// Arrotondato: Math.sin può differire nelle ultime cifre tra server e browser.
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 10000) / 10000;
};

const CIELI: Record<string, [string, string]> = {
  sole: ["#86c8ea", "#f7e6b5"],
  nuvole: ["#a9bccb", "#e8e2d2"],
  pioggia: ["#76879a", "#b7c0c2"],
  temporale: ["#475260", "#858f96"],
  neve: ["#bccbd8", "#f2f2ec"],
  nebbia: ["#c4c8c2", "#e9e6dc"],
  notte: ["#0d1a30", "#2c3d5c"],
};

const PRATI: Record<Stagione, [string, string]> = {
  primavera: ["#8dbb55", "#6f9a3c"],
  estate: ["#7fa846", "#5f8a33"],
  autunno: ["#b3a253", "#93843e"],
  inverno: ["#9aa58a", "#7f8b70"],
};

export interface ScenaProps {
  meteo: Meteo;
  posa: Posa;
  stadio?: Stadio;
  stagione?: Stagione;
  className?: string;
  etichetta?: string;
  /** Clic, trascinamento e occhi che seguono il puntatore. Di serie è attivo. */
  interattivo?: boolean;
  /** Chiamata quando l'albero finisce una scenetta. */
  onCiclo?: () => void;
  /** L'età in giorni, per la grandezza dell'albero (crescita continua). */
  giorni?: number;
}

const VENTO: Record<Meteo["cielo"], number> = { sole: 0.25, nuvole: 0.35, pioggia: 0.6, temporale: 1, neve: 0.45, nebbia: 0.15 };

export function Scena({ meteo, posa, stadio = "albero", stagione = "estate", className, etichetta, interattivo = true, onCiclo, giorni }: ScenaProps) {
  const notte = !meteo.giorno;
  const chiave = notte ? "notte" : meteo.cielo;
  const [alto, basso] = CIELI[chiave];
  const neve = meteo.cielo === "neve";
  const bagnato = meteo.cielo === "pioggia" || meteo.cielo === "temporale";
  const [pratoLontano, prato] = neve ? ["#e9eef0", "#f6f8f8"] : PRATI[stagione];
  const nNuvole = { sole: 2, nuvole: 4, pioggia: 5, temporale: 5, neve: 4, nebbia: 2 }[meteo.cielo];
  const coloreNuvola = bagnato ? (meteo.cielo === "temporale" ? "#5d6670" : "#8f9aa5") : notte ? "#3b4a66" : "#ffffff";
  const id = `l-cielo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const titolo = etichetta ?? `L'albero con ${meteo.descrizione}`;

  return (
    <svg
      viewBox="0 0 480 320"
      className={className}
      role={interattivo ? "group" : "img"}
      aria-label={titolo}
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="lv-cielo" style={{ stopColor: alto }} />
          <stop offset="1" className="lv-cielo" style={{ stopColor: basso }} />
        </linearGradient>
      </defs>
      <rect width={480} height={320} fill={`url(#${id})`} />

      {notte &&
        Array.from({ length: 34 }, (_, i) => (
          <circle
            key={i}
            className="l-stella"
            style={{ animationDelay: `${(rnd(i) * 4).toFixed(2)}s` }}
            cx={rnd(i + 1) * 480}
            cy={rnd(i + 50) * 190}
            r={0.6 + rnd(i + 99) * 1.3}
            fill="#f4efe3"
          />
        ))}

      {notte ? (
        <g key="luna" className="lv-compare">
          <circle cx={392} cy={62} r={24} fill="#f4efe3" />
          <circle cx={404} cy={54} r={22} fill={alto} />
        </g>
      ) : (
        (meteo.cielo === "sole" || meteo.cielo === "nuvole") && (
          <g key="sole" className="lv-compare">
            <circle className="l-pulsa" cx={392} cy={66} r={50} fill="#f6c945" opacity={0.22} />
            <circle cx={392} cy={66} r={30} fill="#f6c945" />
          </g>
        )
      )}

      {Array.from({ length: nNuvole }, (_, i) => {
        const x = 30 + rnd(i + 7) * 380;
        const y = 34 + rnd(i + 17) * 70;
        const s = 0.7 + rnd(i + 27) * 0.6;
        return (
          <g key={i} className="l-nuvola" style={{ animationDuration: `${40 + rnd(i + 3) * 40}s` }}>
            <g transform={`translate(${x} ${y}) scale(${s})`} fill={coloreNuvola} opacity={notte ? 0.7 : 0.94}>
              <ellipse cx={0} cy={10} rx={46} ry={14} />
              <circle cx={-18} cy={2} r={18} />
              <circle cx={8} cy={-6} r={24} />
              <circle cx={30} cy={4} r={15} />
            </g>
          </g>
        );
      })}

      {meteo.cielo === "temporale" && (
        <path className="l-lampo" d="M300,40 L286,92 L302,92 L290,140 L320,80 L304,80 L316,40 Z" fill="#fff6c4" />
      )}

      {/* Colline e prato */}
      <path d="M0,250 Q90,214 190,240 T380,232 T480,242 L480,320 L0,320 Z" fill={pratoLontano} />
      <path d="M0,290 Q240,266 480,290 L480,320 L0,320 Z" fill={prato} />
      {!neve &&
        Array.from({ length: 16 }, (_, i) => {
          const x = 14 + i * 30 + rnd(i + 200) * 12;
          const y = 292 + rnd(i + 300) * 18;
          return <path key={i} d={`M${x},${y} l-3,-8 M${x},${y} l1,-10 M${x},${y} l4,-7`} stroke={pratoLontano} strokeWidth={1.6} strokeLinecap="round" />;
        })}
      {(stagione === "primavera" || stagione === "estate") &&
        !neve &&
        Array.from({ length: 7 }, (_, i) => (
          <circle key={i} cx={20 + rnd(i + 400) * 440} cy={298 + rnd(i + 500) * 14} r={2.6} fill={i % 2 ? "#f2a7b5" : "#f6e7a0"} />
        ))}
      {bagnato && (
        <g fill="#c9dbe6" opacity={0.7}>
          <ellipse cx={92} cy={304} rx={34} ry={5} />
          <ellipse cx={378} cy={300} rx={26} ry={4} />
        </g>
      )}

      {meteo.cielo === "nebbia" && (
        <g fill={notte ? "#7d8aa3" : "#f4f2ea"} opacity={notte ? 0.35 : 0.6}>
          <rect className="l-nuvola" x={-40} y={206} width={560} height={30} rx={15} />
          <rect className="l-nuvola" style={{ animationDuration: "70s" }} x={-40} y={244} width={560} height={20} rx={10} opacity={0.8} />
        </g>
      )}

      <g transform="translate(120 22)">
        <AlberoVivo
          posa={posa}
          stadio={stadio}
          stagione={stagione}
          innevato={neve}
          interattivo={interattivo}
          titolo={titolo}
          vento={VENTO[meteo.cielo]}
          freddo={meteo.temperatura < FREDDO_SOTTO || neve}
          ricorda
          onCiclo={onCiclo}
          giorni={giorni}
        />
      </g>

      {bagnato && (
        <g key="pioggia" className="lv-compare" stroke="#e6eef4" strokeWidth={1.4} strokeLinecap="round" opacity={0.75}>
          {Array.from({ length: 70 }, (_, i) => {
            const x = rnd(i + 600) * 500;
            const y = rnd(i + 700) * 320;
            return (
              <line
                key={i}
                className="l-pioggia"
                style={{
                  animationDuration: `${(0.65 + rnd(i + 800) * 0.4).toFixed(2)}s`,
                  animationDelay: `-${(rnd(i + 900) * 1).toFixed(2)}s`,
                }}
                x1={x}
                y1={y}
                x2={x - 4}
                y2={y + 13}
              />
            );
          })}
        </g>
      )}

      {neve && (
        <g key="neve" className="lv-compare" fill="#ffffff">
          {Array.from({ length: 55 }, (_, i) => (
            <circle
              key={i}
              className="l-neve"
              style={{
                animationDuration: `${(5 + rnd(i + 1000) * 5).toFixed(2)}s`,
                animationDelay: `-${(rnd(i + 1100) * 8).toFixed(2)}s`,
              }}
              cx={rnd(i + 1200) * 480}
              cy={rnd(i + 1300) * 320}
              r={1.4 + rnd(i + 1400) * 2}
            />
          ))}
        </g>
      )}

      {notte && <rect width={480} height={320} fill="#0b1630" opacity={0.18} />}
    </svg>
  );
}
