import { Albero } from "@/components/albero/Albero";
import { azione } from "@/lib/albero/azioni";

// La tessera del fan club, disegnata: nome dell'albero, numero di socio, un QR
// (qui solo decorativo) e il timbro «socio fondatore» dei primi 1000.

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const LATO = 21;
const mirino = (x: number, y: number) => x < 7 && y < 7;

/** Un motivo da QR, fisso e decorativo: non porta da nessuna parte. */
function QrDecorativo({ seme }: { seme: number }) {
  const celle: string[] = [];
  for (let y = 0; y < LATO; y++) {
    for (let x = 0; x < LATO; x++) {
      const inMirino = mirino(x, y) || mirino(LATO - 1 - x, y) || mirino(x, LATO - 1 - y);
      if (!inMirino && rnd(seme + y * LATO + x) > 0.52) celle.push(`M${x},${y}h1v1h-1z`);
    }
  }
  const quadro = (x: number, y: number) => `M${x},${y}h7v7h-7z M${x + 1},${y + 1}v5h5v-5z M${x + 2},${y + 2}h3v3h-3z`;
  return (
    <svg viewBox={`-1 -1 ${LATO + 2} ${LATO + 2}`} className="tessera-qr">
      <rect x="-1" y="-1" width={LATO + 2} height={LATO + 2} rx="1.5" fill="#fbf7ec" />
      <path d={`${quadro(0, 0)} ${quadro(LATO - 7, 0)} ${quadro(0, LATO - 7)} ${celle.join("")}`} fill="#23261d" fillRule="evenodd" />
    </svg>
  );
}

export function Tessera({ numero, premium }: { numero: string; premium: boolean }) {
  return (
    <div className={`tessera ${premium ? "tessera-premium" : "tessera-standard"}`}>
      <div className="tessera-testa">
        <span>Linfa · fan club</span>
        <span>{premium ? "Premium" : "Socio"}</span>
      </div>
      <div className="tessera-corpo">
        <div className="tessera-ritratto">
          <Albero
            posa={{ ...azione("guardare-cielo").posa, occhi: "felici", bocca: "grande" }}
            stadio="alberello"
            stagione={premium ? "autunno" : "primavera"}
            className="h-full w-full"
            titolo=""
          />
        </div>
        <div className="min-w-0">
          <p className="tessera-etichetta">Albero</p>
          <p className="tessera-nome">Ottavio</p>
          <p className="tessera-etichetta mt-1">Socio n.</p>
          <p className="tessera-numero">{numero}</p>
        </div>
        <div className="tessera-qr-box">
          <QrDecorativo seme={premium ? 300 : 100} />
          <span>il suo giardino</span>
        </div>
      </div>
      <span className="tessera-fondatore">Socio fondatore</span>
    </div>
  );
}
