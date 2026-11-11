import type { CSSProperties, ReactNode } from "react";

// Pezzi della vetrina: decorazioni e tappe dei percorsi verticali.

/** Numeri pseudo-casuali ripetibili: server e browser disegnano le stesse cose. */
function casuale(seme: number) {
  let s = seme;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Luci sfocate che galleggiano nello sfondo delle sezioni verdi. */
export function Bokeh({ seme = 7 }: { seme?: number }) {
  const r = casuale(seme);
  const luci = Array.from({ length: 14 }, (_, i) => {
    const d = 20 + r() * 90;
    return (
      <i
        key={i}
        style={{ width: d, height: d, left: `${r() * 100}%`, top: `${r() * 100}%`, opacity: 0.25 + r() * 0.5, animationDelay: `${-r() * 9}s` }}
      />
    );
  });
  return (
    <div className="bokeh" aria-hidden>
      {luci}
    </div>
  );
}

const COLORI = ["#9BE34A", "#C6F36B", "#FFD66B", "#5FD3C8", "#FF9DB0", "#7CC4F0"];

/** Coriandoli del premio: cadono una volta quando la tappa entra. */
export function Coriandoli() {
  const r = casuale(42);
  return (
    <div className="coriandoli" aria-hidden>
      {Array.from({ length: 34 }, (_, i) => (
        <i
          key={i}
          style={
            {
              left: `${10 + r() * 80}%`,
              background: COLORI[i % COLORI.length],
              "--dx": `${(r() - 0.5) * 220}px`,
              animationDelay: `${0.4 + r() * 0.8}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** La freccia che scende tra due tappe, con l'etichetta e le foglie che cadono. */
export function Freccia({ etichetta, verso = 1 }: { etichetta: string; verso?: 1 | -1 }) {
  const curva = verso === 1 ? "M20 0 C 40 40, 0 80, 20 130" : "M20 0 C 0 40, 40 80, 20 130";
  return (
    <div className="freccia" aria-hidden>
      <svg viewBox="0 0 40 140">
        <path d={curva} />
        <path className="punta" d="M10 120 L20 134 L30 120" />
      </svg>
      <span className="etic">{etichetta}</span>
      <i className="foglia-cade" />
      <i className="foglia-cade f2" />
    </div>
  );
}

/** Gli alberi in fila sopra una tappa: le immagini sono i ritratti 3D delle varianti. */
export function Alberi({ quali, misura }: { quali: string[]; misura: "uno" | "tre" | "sette" }) {
  return (
    <div className={`alberi ${misura}`} aria-hidden>
      {quali.map((q, i) => (
        <i key={i} className="lf" style={{ "--img": `url(/vetrina/${q}.webp)` } as CSSProperties} />
      ))}
    </div>
  );
}

/** Il cartello di una tappa: etichetta, titolo e quello che segue. */
export function Cartello({ num, titolo, children }: { num: string; titolo: string; children?: ReactNode }) {
  return (
    <div className="cartello">
      <span className="num">{num}</span>
      <span className="tit">{titolo}</span>
      {children}
    </div>
  );
}
