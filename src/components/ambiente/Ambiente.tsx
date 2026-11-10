import type { CSSProperties, ReactNode } from "react";
import type { Meteo, Stagione } from "@/lib/albero/tipi";
import { atmosfera, type Ora } from "./atmosfera";

// Il paesaggio intorno all'albero, a tutta larghezza: cielo, sole e luna su un
// arco, nuvole, colline, prato, pioggia, neve, lucciole, polline, foglie.
// L'albero arriva da fuori (prop `albero`): qui si decide solo dove sta.
// Nessun hook: funziona anche nei Server Component. I cambi di meteo e di ora
// sfumano da soli perché i colori sono variabili CSS registrate.

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
/** Arrotondato: stessi numeri sul server e nel browser. */
const r2 = (n: number) => Number(n.toFixed(2));

const NUVOLA =
  "M-50,12 C-60,12 -62,-1 -51,-5 C-53,-19 -35,-25 -25,-16 C-21,-32 5,-38 14,-22 C22,-31 41,-26 40,-12 C55,-12 59,8 46,12 Z";

export interface AmbienteProps {
  meteo: Meteo;
  ora: Ora;
  stagione: Stagione;
  className?: string;
  style?: CSSProperties;
  /** Più stelle, nuvole e particelle: per le scene grandi. */
  ricco?: boolean;
  /** L'albero (di solito <Albero />): viene messo in piedi sul prato. */
  albero?: ReactNode;
  /** Quando cambia, l'albero fa un piccolo saltello. */
  chiaveAlbero?: string;
  /** Il seme non è ancora germogliato: l'albero resta sotto terra. */
  seme?: boolean;
  /** Oggetti sul prato (cassetta delle lettere, taccuino): sotto la luce della scena. */
  palco?: ReactNode;
  /** Testi e comandi sopra la scena. */
  children?: ReactNode;
}

export function Ambiente({
  meteo,
  ora,
  stagione,
  className = "",
  style,
  ricco = true,
  albero,
  chiaveAlbero,
  seme = false,
  palco,
  children,
}: AmbienteProps) {
  const { variabili, nuvole, temporale } = atmosfera(meteo, ora, stagione);
  const nStelle = ricco ? 42 : 18;
  const nCiuffi = ricco ? 18 : 9;

  return (
    <div
      className={`ambiente ${className}`}
      style={{ ...variabili, ...style } as CSSProperties}
      data-ora={ora}
      data-cielo={meteo.cielo}
      data-seme={seme ? "1" : undefined}
    >
      <div className="amb-cielo" aria-hidden />

      <div className="amb-stelle" aria-hidden>
        {Array.from({ length: nStelle }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${r2(rnd(i + 1) * 100)}%`,
              top: `${r2(rnd(i + 50) * 62)}%`,
              width: `${r2(1.2 + rnd(i + 99) * 2)}px`,
              height: `${r2(1.2 + rnd(i + 99) * 2)}px`,
              animationDelay: `${r2(rnd(i) * 4)}s`,
            }}
          />
        ))}
      </div>

      <div className="amb-astri" aria-hidden>
        <div className="amb-arco amb-arco-sole">
          <span className="amb-sole" />
        </div>
        <div className="amb-arco amb-arco-luna">
          <span className="amb-luna" />
        </div>
      </div>

      <div className="amb-nuvole" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className="amb-nuvola"
            style={{
              left: `${r2(-8 + rnd(i + 7) * 88)}%`,
              top: `${r2(4 + rnd(i + 17) * 30)}%`,
              width: `${r2(16 + rnd(i + 27) * 16)}cqw`,
              animationDuration: `${r2(46 + rnd(i + 3) * 40)}s`,
              animationDelay: `-${r2(rnd(i + 5) * 40)}s`,
            }}
          >
            <svg viewBox="-62 -40 124 56" style={{ opacity: i < nuvole ? 1 : 0 }}>
              <path d={NUVOLA} transform="translate(3 4)" className="amb-nuvola-ombra" />
              <path d={NUVOLA} />
            </svg>
          </span>
        ))}
      </div>

      <svg className="amb-colline amb-colline-lontane" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden>
        <path d="M0,118 C110,64 250,58 372,98 C470,128 560,78 700,66 C826,56 918,98 1000,86 L1000,200 L0,200 Z" />
      </svg>
      <svg className="amb-colline amb-colline-vicine" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden>
        <path d="M0,150 C140,104 310,132 460,140 C610,148 770,100 1000,128 L1000,200 L0,200 Z" />
      </svg>
      <div className="amb-prato" aria-hidden>
        <svg viewBox="0 0 1000 60" preserveAspectRatio="none">
          <path d="M0,38 C180,12 340,30 500,22 C660,14 820,36 1000,16 L1000,60 L0,60 Z" />
        </svg>
      </div>

      <div className="amb-suolo" aria-hidden>
        {Array.from({ length: nCiuffi }, (_, i) => {
          const f = rnd(i + 300);
          return (
            <svg
              key={`c${i}`}
              className="amb-ciuffo"
              viewBox="0 0 20 14"
              style={{
                left: `${r2(2 + ((i * 37) % 94) + rnd(i + 200) * 3)}%`,
                bottom: `calc(var(--suolo) * ${r2(0.08 + f * 0.82)})`,
                width: `${r2(10 + (1 - f) * 16)}px`,
              }}
            >
              <path d="M10,14 L5,3 M10,14 L10,1 M10,14 L15,5" />
            </svg>
          );
        })}
        <div className="amb-fiori">
          {Array.from({ length: ricco ? 10 : 5 }, (_, i) => {
            const f = rnd(i + 500);
            return (
              <span
                key={`f${i}`}
                className="amb-fiore"
                style={{
                  left: `${r2(4 + rnd(i + 400) * 92)}%`,
                  bottom: `calc(var(--suolo) * ${r2(0.12 + f * 0.75)})`,
                  width: `${r2(7 + (1 - f) * 8)}px`,
                  height: `${r2(7 + (1 - f) * 8)}px`,
                  background: ["#f2a7b5", "#f6e39a", "#fbf7ec"][i % 3],
                }}
              />
            );
          })}
        </div>
        <div className="amb-pozzanghere">
          {[
            [16, 0.42, 18],
            [74, 0.22, 24],
            [58, 0.62, 12],
          ].map(([x, f, w], i) => (
            <span key={i} style={{ left: `${x}%`, bottom: `calc(var(--suolo) * ${f})`, width: `${w}cqw` }}>
              <i style={{ animationDelay: `${i * 0.6}s` }} />
            </span>
          ))}
        </div>
      </div>

      {palco}

      {/* La striscia di terreno percorribile: larga quanto la scena, il bordo
          inferiore sulla linea del terreno, tutto il cielo sopra per sollevarlo.
          Non intercetta i clic: li riceve solo l'albero. */}
      {albero && (
        <div className="amb-terreno">
          <div className="amb-albero" key={chiaveAlbero}>
            <div className="amb-cresce">{albero}</div>
          </div>
        </div>
      )}

      <div className="amb-nebbia" aria-hidden>
        <span />
        <span />
      </div>

      <div className="amb-luce" aria-hidden />

      <div className="amb-lucciole" aria-hidden>
        {Array.from({ length: ricco ? 16 : 7 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${r2(6 + rnd(i + 1500) * 88)}%`,
              top: `${r2(40 + rnd(i + 1600) * 46)}%`,
              animationDuration: `${r2(7 + rnd(i + 1700) * 6)}s, ${r2(1.8 + rnd(i + 1800) * 2.4)}s`,
              animationDelay: `-${r2(rnd(i + 1900) * 8)}s, -${r2(rnd(i + 2000) * 3)}s`,
            }}
          />
        ))}
      </div>

      <div className="amb-polline" aria-hidden>
        {Array.from({ length: ricco ? 14 : 6 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${r2(4 + rnd(i + 2100) * 92)}%`,
              bottom: `calc(var(--suolo) + ${r2(rnd(i + 2200) * 30)}%)`,
              animationDuration: `${r2(8 + rnd(i + 2300) * 8)}s`,
              animationDelay: `-${r2(rnd(i + 2400) * 12)}s`,
            }}
          />
        ))}
      </div>

      <div className="amb-foglie" aria-hidden>
        {Array.from({ length: ricco ? 10 : 5 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${r2(4 + rnd(i + 2500) * 92)}%`,
              animationDuration: `${r2(9 + rnd(i + 2600) * 8)}s`,
              animationDelay: `-${r2(rnd(i + 2700) * 14)}s`,
            }}
          >
            <i
              style={{
                background: ["#c0702a", "#e0a526", "#8a4f1f", "#b3502a"][i % 4],
                animationDuration: `${r2(2.4 + rnd(i + 2800) * 2)}s`,
              }}
            />
          </span>
        ))}
      </div>

      <div className="amb-pioggia" aria-hidden>
        <span className="amb-strato amb-strato-1" />
        <span className="amb-strato amb-strato-2" />
      </div>
      <div className="amb-neve" aria-hidden>
        <span className="amb-strato amb-strato-1" />
        <span className="amb-strato amb-strato-2" />
      </div>
      {temporale && <div className="amb-lampo" aria-hidden />}

      <div className="amb-grana" aria-hidden />

      {children}
    </div>
  );
}
