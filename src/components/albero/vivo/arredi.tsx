import type { ReactNode } from "react";
import type { Strada } from "@/lib/albero/strade";
import { ATTREZZI, type Attrezzo, type Canali } from "./canali";
import { CONTORNO, disegnaOggetto, INCHIOSTRO } from "./disegni";
import type { Attributi } from "./fotogramma";

// Gli arredi che l'albero costruisce nel prato e gli attrezzi del mestiere.
// Coordinate del personaggio (terreno a y = 262, l'albero a casa ha il centro
// a x = 120). Gli arredi stanno fermi nel prato: non seguono l'albero quando
// lo trascini. Ogni arredo ha i suoi stadi di costruzione (vivo/mestiere.ts).

const LEGNO = "#a8743f";
const LEGNO_SCURO = "#7a5236";
const LEGNO_CHIARO = "#c99a62";

/** Dove sta ogni arredo (x del centro, coordinate del personaggio). */
export const POSTI: Record<string, number> = {
  bancarella: -30,
  cassaforte: -118,
  scrivania: 272,
  insegna: 352,
  lavagna: 172,
};

/** Lo stato del lavoro che serve per disegnare: arredi presenti e a che stadio. */
export interface StatoLavoro {
  strada: Strada;
  /** Arredo → stadio di costruzione (numero di passi fatti; finito = numero dei passi). */
  stadi: Record<string, number>;
  /** L'arredo in costruzione oggi: il suo stadio cresce col canale «costruzione». */
  inCorso: { arredo: string; passo: number; passi: number } | null;
  /** C'è lo scoiattolo (cliente e socio)? */
  scoiattolo: boolean;
  /** C'è la lavagna delle riunioni? */
  lavagna: boolean;
}

const lim = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const n2 = (v: number) => Math.round(v * 100) / 100;
const vis = (si: boolean) => (si ? "inline" : "none");

/** Gli attributi del primo fotogramma come props di React (stroke-dashoffset → strokeDashoffset). */
function attr(A: Attributi, k: string): Record<string, string> {
  const fuori: Record<string, string> = {};
  for (const [n, v] of Object.entries(A[k] ?? {})) fuori[n.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  return fuori;
}

/** Lo stadio di un arredo in questo fotogramma. */
export function stadioArredo(lavoro: StatoLavoro, arredo: string, v: Canali): number {
  if (lavoro.inCorso?.arredo === arredo) return lavoro.inCorso.passo + lim(v.costruzione, 0, 1);
  return lavoro.stadi[arredo] ?? 0;
}

/** Gli attributi animati degli arredi (gli stessi sul server e nel browser). */
export function fotogrammaArredi(v: Canali, lavoro: StatoLavoro, A: Attributi, t: number) {
  // Bancarella: niente di animato.
  // Scrivania
  if (lavoro.stadi.scrivania !== undefined || lavoro.inCorso?.arredo === "scrivania") {
    const s = stadioArredo(lavoro, "scrivania", v);
    const rami = s < 1 ? Math.ceil(5 * s - 0.001) : s < 2 ? 5 - Math.floor(5 * (s - 1)) : 0;
    for (let i = 0; i < 5; i++) A[`a-ramo${i}`] = { display: vis(i < rami) };
    A["a-gambaS"] = { display: vis(s >= 1.25) };
    A["a-gambaD"] = { display: vis(s >= 1.5) };
    A["a-traverso"] = { display: vis(s >= 1.8) };
    A["a-piano"] = { display: vis(s >= 2.4) };
    A["a-zeppa"] = { display: vis(s >= 2.75) };
    A["a-accessori"] = { display: vis(s >= 3) };
    A["arr-sedia"] = { display: vis(s >= 3) };
    A["a-nastro"] = { display: vis(s >= 3 && s < 4 && v.nastro > 0.5) };
    A["a-nastroTagliato"] = { display: vis(s >= 3 && s < 4 && v.nastro <= 0.5) };
    A["a-desk"] = { transform: `translate(0 ${n2(v.scrivaniaY)})` };
    const sq = lim(v.squillo, 0, 1);
    A["a-telefono"] = { transform: sq > 0.01 ? `rotate(${n2(Math.sin(t * 60) * 6 * sq)} -37 210)` : "rotate(0)" };
    A["a-drin"] = { opacity: `${n2(sq * (0.6 + 0.4 * Math.sin(t * 20)))}` };
    A["a-cornetta"] = { display: vis(v.cornetta > 0.5) };
    A["a-luce"] = { opacity: `${n2(lim(v.lampada, 0, 1) * 0.55)}` };
    A["a-lampadina"] = { fill: v.lampada > 0.5 ? "#fff3b0" : "#e6dbc2" };
    A["a-pila"] = { transform: `translate(0 212) scale(1 ${n2(0.2 + 1.6 * lim(v.pila, 0, 1))}) translate(0 -212)` };
  }
  // Insegna
  if (lavoro.stadi.insegna !== undefined || lavoro.inCorso?.arredo === "insegna") {
    const s = stadioArredo(lavoro, "insegna", v);
    A["a-insegnaTerra"] = { display: vis(s < 2.5) };
    A["a-lettereTerra"] = { opacity: `${n2(lim(s, 0, 1))}` };
    A["a-vernice"] = { opacity: `${n2(lim(s - 1, 0, 1))}` };
    A["a-palo"] = { display: vis(s >= 2) };
    A["a-insegnaSu"] = { display: vis(s >= 2.5), transform: `rotate(${n2(v.insegnaRot)} 0 150)` };
  }
  // Cassaforte
  if (lavoro.stadi.cassaforte !== undefined || lavoro.inCorso?.arredo === "cassaforte") {
    const s = stadioArredo(lavoro, "cassaforte", v);
    const buca = lim(s, 0, 1);
    A["a-buca"] = { transform: `translate(0 262) scale(${n2(Math.max(0.01, buca))}) translate(0 -262)` };
    const cassa = lim((s - 1.2) / 0.4, 0, 1);
    A["a-cassa"] = { display: vis(cassa > 0), transform: `translate(0 262) scale(${n2(Math.max(0.01, cassa))}) translate(0 -262)` };
    A["a-sportello"] = { transform: `translate(-18 0) scale(${n2(1 - 0.85 * lim(v.sportello, 0, 1))} 1) translate(18 0)` };
    A["a-disco"] = { transform: `rotate(${n2(v.disco * 360)} 0 238)` };
  }
  // Lavagna delle riunioni
  if (lavoro.lavagna) {
    const l = lim(v.lavagna, 0, 1);
    A["arr-lavagna"] = { display: vis(l > 0.01), transform: `translate(${POSTI.lavagna} 262) scale(${n2(Math.max(0.01, l))}) translate(0 -262)` };
    A["a-grafico"] = { "stroke-dashoffset": `${n2(90 * (1 - lim(v.grafico, 0, 1)))}` };
  }
  // Lo scoiattolo
  if (lavoro.scoiattolo) {
    const sv = lim(v.scoiattolo, 0, 1);
    A["a-scoiattolo"] = {
      display: vis(sv > 0.01),
      transform: `translate(${n2(v.scoiattoloX)} ${n2(-v.scoiattoloSu)}) translate(0 262) scale(${n2(Math.max(0.01, sv))}) translate(0 -262)`,
    };
    A["a-scoiattoloAperto"] = { display: vis(v.scoiattoloDorme < 0.5) };
    A["a-scoiattoloChiuso"] = { display: vis(v.scoiattoloDorme >= 0.5) };
  }
}

/** Visibilità degli attrezzi nelle mani. */
export function fotogrammaAttrezzi(v: Canali, A: Attributi) {
  const sx = Math.round(v.attrSx);
  const dx = Math.round(v.attrDx);
  ATTREZZI.forEach((_, i) => {
    A[`attrSx-${i}`] = { display: vis(sx === i + 1) };
    A[`attrDx-${i}`] = { display: vis(dx === i + 1) };
  });
}

// ——— Disegni degli attrezzi (centrati sulla mano, dritti) ———

function Attrezzo({ a }: { a: Attrezzo }): ReactNode {
  switch (a) {
    case "cornetta":
      return (
        <g>
          <path d="M-3,-13 Q-12,0 -3,13 L2,11 Q-4,0 2,-11 Z" fill="#7a2f2f" stroke="#4d1c1c" strokeWidth={1} />
          <ellipse cx={-1} cy={-12} rx={5} ry={3} fill="#7a2f2f" />
          <ellipse cx={-1} cy={12} rx={5} ry={3} fill="#7a2f2f" />
        </g>
      );
    case "megafono":
      return <path d="M1,-3 L24,-13 Q27,-3 24,8 L1,3 Z" fill="#7aa548" stroke="#4f7f2e" strokeWidth={1.4} />;
    case "martello":
      return (
        <g>
          <path d="M0,7 L0,-18" stroke={LEGNO_SCURO} strokeWidth={3.2} strokeLinecap="round" />
          <rect x={-8} y={-25} width={16} height={7} rx={1.5} fill="#5a5a52" />
        </g>
      );
    case "sega":
      return (
        <g>
          <path d="M-1,-3 L-34,-12 L-34,-3 L-1,4 Z" fill="#cfd3d8" stroke="#7d828a" strokeWidth={1} />
          <path d="M-34,-3 l3,3 l3,-2 l3,3 l3,-2 l3,3 l3,-2 l3,3 l3,-2 l3,3" stroke="#7d828a" strokeWidth={1} fill="none" />
          <rect x={-2} y={-6} width={8} height={11} rx={2} fill={LEGNO} stroke={LEGNO_SCURO} />
        </g>
      );
    case "timbro":
      return (
        <g>
          <circle cx={0} cy={-15} r={4.5} fill={LEGNO_SCURO} />
          <rect x={-2} y={-12} width={4} height={8} fill={LEGNO} />
          <rect x={-8} y={-5} width={16} height={6} rx={1.5} fill="#2c4a7a" />
        </g>
      );
    case "tazza":
      return disegnaOggetto("tazza");
    case "ghianda":
      return (
        <g>
          <ellipse cx={0} cy={-3} rx={4.5} ry={5.5} fill="#a0703c" />
          <path d="M-5,-6 Q0,-12 5,-6 Z" fill="#6b4a2b" />
        </g>
      );
    case "bacchetta":
      return (
        <g>
          <path d="M0,5 L0,-36" stroke={LEGNO_SCURO} strokeWidth={2} strokeLinecap="round" />
          <circle cx={0} cy={-36} r={2} fill="#c0392b" />
        </g>
      );
    case "forbici":
      return (
        <g stroke={INCHIOSTRO} strokeWidth={1.4} fill="none">
          <circle cx={-3} cy={4} r={3} />
          <circle cx={3} cy={4} r={3} />
          <path d="M-1,1 L4,-14 M1,1 L-4,-14" stroke="#7d828a" strokeWidth={2} />
        </g>
      );
    case "pennello":
      return disegnaOggetto("pennello");
    case "ramo":
      return (
        <g stroke={LEGNO_SCURO} strokeLinecap="round" fill="none">
          <path d="M-24,-6 L24,4" strokeWidth={5} />
          <path d="M6,0 l6,-9" strokeWidth={2.5} />
        </g>
      );
    case "penna":
      return disegnaOggetto("penna");
    case "livella":
      return (
        <g>
          <rect x={-18} y={-4} width={36} height={7} rx={2} fill="#e0a526" stroke="#a8761a" />
          <rect x={-4} y={-2.5} width={8} height={4} rx={2} fill="#bfe6dc" />
        </g>
      );
    case "pala":
      return (
        <g>
          <path d="M0,4 L0,-30" stroke={LEGNO_SCURO} strokeWidth={3} strokeLinecap="round" />
          <path d="M-7,4 L7,4 L5,16 Q0,21 -5,16 Z" fill="#8a8f96" stroke="#5a5a52" />
        </g>
      );
  }
}

/** Gli attrezzi di una mano: tutti pronti, ne compare uno alla volta. */
export function AttrezziMano({ lato, A }: { lato: "Sx" | "Dx"; A: Attributi }) {
  return (
    <g data-n={`attr${lato}`} {...attr(A, `attr${lato}`)}>
      {ATTREZZI.map((a, i) => (
        <g key={a} data-n={`attr${lato}-${i}`} display="none">
          <Attrezzo a={a} />
        </g>
      ))}
    </g>
  );
}

// ——— Gli arredi ———

function Bancarella() {
  return (
    <g data-n="arr-bancarella" transform={`translate(${POSTI.bancarella} 0)`} data-zona="oggetto" data-oggetto="bancarella">
      <rect x={-40} y={224} width={80} height={38} rx={3} fill="#b07a45" stroke={CONTORNO} strokeWidth={2} />
      <path d="M-40,237 H40 M-40,250 H40" stroke="#8a5a2b" strokeWidth={1.5} />
      <path d="M-45,223 L45,223 L41,233 L-41,233 Z" fill="#3f5a2a" />
      <path d="M-41,233 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5 l6,-5" fill="none" stroke="#3f5a2a" strokeWidth={1.6} />
      {[-24, -12, 0].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={218} rx={4.5} ry={5.5} fill="#a0703c" />
          <path d={`M${x - 5},215 Q${x},209 ${x + 5},215 Z`} fill="#6b4a2b" />
        </g>
      ))}
      <path d="M30,224 L30,186" stroke={LEGNO_SCURO} strokeWidth={3} />
      <rect x={12} y={170} width={38} height={20} rx={3} fill="#efe2bf" stroke={LEGNO_SCURO} strokeWidth={1.5} />
      <text x={31} y={184} textAnchor="middle" fontSize={11} fontFamily="var(--font-gochi), cursive" fill={INCHIOSTRO}>
        2 x 1
      </text>
    </g>
  );
}

function SediaScrivania({ A }: { A: Attributi }) {
  return (
    <g data-n="arr-sedia" transform={`translate(${POSTI.scrivania} 0)`} {...attr(A, "arr-sedia")}>
      <rect x={-17} y={236} width={34} height={26} rx={4} fill="#8a5a2b" stroke={CONTORNO} strokeWidth={2} />
      <ellipse cx={0} cy={236} rx={17} ry={5} fill={LEGNO_CHIARO} stroke={CONTORNO} strokeWidth={1.5} />
      <path d="M-6,236 a6,2.5 0 1,0 12,0" stroke="#8a5a2b" fill="none" />
    </g>
  );
}

function Scrivania({ A }: { A: Attributi }) {
  const at = (k: string) => attr(A, k);
  return (
    <g data-n="arr-scrivania" transform={`translate(${POSTI.scrivania} 0)`} data-zona="oggetto" data-oggetto="scrivania">
      {/* Il mucchio di rami raccolti */}
      <g>
        {[
          "M-34,258 L18,250",
          "M-28,252 L26,258",
          "M-38,246 L10,240",
          "M-22,240 L30,246",
          "M-30,234 L16,236",
        ].map((d, i) => (
          <path key={i} data-n={`a-ramo${i}`} d={d} stroke={LEGNO_SCURO} strokeWidth={5} strokeLinecap="round" {...at(`a-ramo${i}`)} />
        ))}
      </g>
      <g data-n="a-desk" {...at("a-desk")}>
        {/* Telaio: gambe (la destra è corta) e traverso */}
        <rect data-n="a-gambaS" x={-57} y={220} width={9} height={42} rx={1.5} fill={LEGNO} stroke={CONTORNO} strokeWidth={1.5} {...at("a-gambaS")} />
        <rect data-n="a-gambaD" x={48} y={220} width={9} height={39} rx={1.5} fill={LEGNO} stroke={CONTORNO} strokeWidth={1.5} {...at("a-gambaD")} />
        <rect data-n="a-traverso" x={-50} y={240} width={100} height={5} fill={LEGNO_SCURO} {...at("a-traverso")} />
        <ellipse data-n="a-zeppa" cx={52.5} cy={260} rx={5} ry={3} fill="#a0703c" stroke="#6b4a2b" strokeWidth={0.8} {...at("a-zeppa")} />
        {/* Piano col cassetto */}
        <g data-n="a-piano" {...at("a-piano")}>
          <rect x={-40} y={221} width={80} height={16} fill="#8a5a2b" stroke={CONTORNO} strokeWidth={1.5} />
          <rect x={-6} y={227} width={12} height={4} rx={2} fill="#e0a526" />
          <rect x={-65} y={211} width={130} height={10} rx={2} fill={LEGNO} stroke={CONTORNO} strokeWidth={2} />
        </g>
        {/* Sulla scrivania: lampada, telefono, pila di carte */}
        <g data-n="a-accessori" {...at("a-accessori")}>
          <path data-n="a-luce" d="M50,190 L70,211 L30,211 Z" fill="#f6e7a0" {...at("a-luce")} />
          <ellipse cx={48} cy={210} rx={9} ry={2.5} fill="#2e5f45" />
          <path d="M48,210 L42,194 L50,186" stroke="#2e5f45" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <path d="M42,180 L60,178 L63,190 L45,192 Z" fill="#2e6f4e" stroke="#1f4a35" strokeWidth={1} />
          <circle data-n="a-lampadina" cx={54} cy={191} r={2.6} fill="#e6dbc2" {...at("a-lampadina")} />
          <g data-n="a-pila" {...at("a-pila")}>
            <rect x={-6} y={204} width={28} height={8} fill="#fbf7ec" stroke="#b9b2a0" strokeWidth={1} />
            <path d="M-3,207 h22 M-3,209.5 h18" stroke="#d6cfbd" strokeWidth={0.8} />
          </g>
          <g data-n="a-telefono" {...at("a-telefono")}>
            <path d="M-50,211 L-46,201 L-28,201 L-24,211 Z" fill="#7a2f2f" stroke="#4d1c1c" strokeWidth={1} />
            <circle cx={-37} cy={206} r={3} fill="#e6dbc2" />
            <g data-n="a-cornetta" {...at("a-cornetta")}>
              <path d="M-49,199 Q-37,193 -25,199 L-27,202 Q-37,198 -47,202 Z" fill="#7a2f2f" stroke="#4d1c1c" strokeWidth={1} />
            </g>
          </g>
          <g data-n="a-drin" stroke={INCHIOSTRO} strokeWidth={1.6} fill="none" strokeLinecap="round" {...at("a-drin")}>
            <path d="M-55,196 q-4,-6 0,-12 M-60,198 q-6,-9 0,-18" />
            <path d="M-19,196 q4,-6 0,-12 M-14,198 q6,-9 0,-18" />
          </g>
        </g>
        {/* Il nastro dell'inaugurazione */}
        <g data-n="a-nastro" {...at("a-nastro")}>
          <path d="M-66,226 Q0,232 66,226" stroke="#c0392b" strokeWidth={3.5} fill="none" />
          <path d="M-6,229 l-9,-7 l1,12 Z M6,229 l9,-7 l-1,12 Z" fill="#c0392b" />
        </g>
        <g data-n="a-nastroTagliato" {...at("a-nastroTagliato")}>
          <path d="M-66,226 Q-40,230 -30,250" stroke="#c0392b" strokeWidth={3.5} fill="none" />
          <path d="M66,226 Q40,230 30,250" stroke="#c0392b" strokeWidth={3.5} fill="none" />
        </g>
      </g>
    </g>
  );
}

function Insegna({ A }: { A: Attributi }) {
  const at = (k: string) => attr(A, k);
  const scritta = (
    <text x={0} y={169} textAnchor="middle" fontSize={13} fontFamily="var(--font-gochi), cursive" fill="#2f4a3a">
      Ghiande & Co.
    </text>
  );
  return (
    <g data-n="arr-insegna" transform={`translate(${POSTI.insegna} 0)`} data-zona="oggetto" data-oggetto="insegna">
      <g data-n="a-insegnaTerra" {...at("a-insegnaTerra")}>
        <g transform="translate(0 181.4) scale(1 0.45)">
          <rect x={-46} y={148} width={92} height={30} rx={4} fill="#efe2bf" stroke={LEGNO_SCURO} strokeWidth={2} />
          <rect data-n="a-vernice" x={-46} y={148} width={92} height={30} rx={4} fill="#d8b07a" {...at("a-vernice")} />
          <g data-n="a-lettereTerra" {...at("a-lettereTerra")}>{scritta}</g>
        </g>
      </g>
      <g data-n="a-palo" {...at("a-palo")}>
        <rect x={-3} y={150} width={6} height={112} fill={LEGNO_SCURO} />
        <path d="M-14,262 L14,262" stroke="#6b5a40" strokeWidth={4} strokeLinecap="round" />
      </g>
      <g data-n="a-insegnaSu" {...at("a-insegnaSu")}>
        <path d="M-30,150 L-30,156 M30,150 L30,156" stroke="#5a5a52" strokeWidth={1.6} />
        <path d="M-40,150 L40,150" stroke={LEGNO_SCURO} strokeWidth={4} strokeLinecap="round" />
        <rect x={-46} y={154} width={92} height={24} rx={4} fill="#d8b07a" stroke={LEGNO_SCURO} strokeWidth={2} />
        <g transform="translate(0 -3)">{scritta}</g>
      </g>
    </g>
  );
}

function Cassaforte({ A }: { A: Attributi }) {
  const at = (k: string) => attr(A, k);
  return (
    <g data-n="arr-cassaforte" transform={`translate(${POSTI.cassaforte} 0)`} data-zona="oggetto" data-oggetto="cassaforte">
      <g data-n="a-buca" {...at("a-buca")}>
        <path d="M-34,262 Q-26,244 -10,248 Q4,240 16,250 Q30,246 36,262 Z" fill="#8a6a45" />
        <path d="M-20,258 q4,-3 8,0 M6,256 q4,-3 8,0" stroke="#6b5233" strokeWidth={1.4} fill="none" />
      </g>
      <g data-n="a-cassa" {...at("a-cassa")}>
        <rect x={-25} y={212} width={50} height={50} rx={5} fill="#5a5a52" stroke="#2b2a24" strokeWidth={2} />
        <g>
          {[-10, 0, 10].map((x) => (
            <ellipse key={x} cx={x} cy={248} rx={4} ry={5} fill="#a0703c" />
          ))}
        </g>
        <g data-n="a-sportello" {...at("a-sportello")}>
          <rect x={-18} y={219} width={36} height={37} rx={3} fill="#74746a" stroke="#2b2a24" strokeWidth={1.4} />
          <g data-n="a-disco" {...at("a-disco")}>
            <circle cx={0} cy={238} r={7} fill="#c9ccd1" stroke="#2b2a24" strokeWidth={1.2} />
            <path d="M0,238 L0,232" stroke="#2b2a24" strokeWidth={1.6} />
          </g>
          <rect x={10} y={234} width={4} height={9} rx={1.5} fill="#2b2a24" />
        </g>
      </g>
    </g>
  );
}

function Lavagna({ A }: { A: Attributi }) {
  const at = (k: string) => attr(A, k);
  return (
    <g data-n="arr-lavagna" {...at("arr-lavagna")}>
      <path d="M-28,262 L-14,150 M28,262 L14,150 M0,262 L0,200" stroke={LEGNO_SCURO} strokeWidth={3} strokeLinecap="round" />
      <rect x={-36} y={148} width={72} height={52} rx={3} fill="#2f4a3a" stroke={LEGNO_SCURO} strokeWidth={3} />
      <path d="M-28,192 L-28,156 M-28,192 L28,192" stroke="#e6e9f2" strokeWidth={1.4} opacity={0.7} />
      <path data-n="a-grafico" d="M-26,188 L-14,182 L-4,186 L8,172 L16,176 L27,158" stroke="#f6c945" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="90" {...at("a-grafico")} />
    </g>
  );
}

function Scoiattolo({ A }: { A: Attributi }) {
  const at = (k: string) => attr(A, k);
  return (
    <g data-n="a-scoiattolo" {...at("a-scoiattolo")}>
      <g transform="translate(-210 0)">
        <path d="M214,258 C236,256 240,226 226,212 C218,204 206,210 214,222 C220,232 220,244 210,250 Z" fill="#c5763a" />
        <ellipse cx={200} cy={248} rx={11} ry={13} fill="#b5652b" />
        <circle cx={194} cy={232} r={8} fill="#b5652b" />
        <path d="M190,226 l-2,-8 l6,5 Z" fill="#b5652b" />
        <circle data-n="a-scoiattoloAperto" cx={191} cy={231} r={1.6} fill={INCHIOSTRO} {...at("a-scoiattoloAperto")} />
        <path data-n="a-scoiattoloChiuso" d="M188.5,231 q2.5,2 5,0" stroke={INCHIOSTRO} strokeWidth={1.2} fill="none" {...at("a-scoiattoloChiuso")} />
        <ellipse cx={196} cy={252} rx={6} ry={4} fill="#e8c9a0" />
      </g>
    </g>
  );
}

/** Che arredi disegnare e dietro o davanti all'albero. */
function ha(lavoro: StatoLavoro, arredo: string) {
  return lavoro.stadi[arredo] !== undefined || lavoro.inCorso?.arredo === arredo;
}

/** Gli arredi dietro all'albero: sedia, insegna, lavagna. */
export function ArrediDietro({ lavoro, A }: { lavoro: StatoLavoro; A: Attributi }) {
  if (lavoro.strada !== "imprenditore") return null;
  return (
    <g className="lv-arredi">
      {ha(lavoro, "insegna") && <Insegna A={A} />}
      {lavoro.lavagna && <Lavagna A={A} />}
      {ha(lavoro, "scrivania") && <SediaScrivania A={A} />}
    </g>
  );
}

/** Gli arredi davanti all'albero (ci si siede dietro), lo scoiattolo e gli attrezzi in mano. */
export function ArrediDavanti({ lavoro, A }: { lavoro: StatoLavoro; A: Attributi }) {
  return (
    <g className="lv-arredi">
      {lavoro.strada === "imprenditore" && (
        <>
          {ha(lavoro, "bancarella") && <Bancarella />}
          {ha(lavoro, "scrivania") && <Scrivania A={A} />}
          {ha(lavoro, "cassaforte") && <Cassaforte A={A} />}
          {lavoro.scoiattolo && <Scoiattolo A={A} />}
        </>
      )}
      <AttrezziMano lato="Sx" A={A} />
      <AttrezziMano lato="Dx" A={A} />
    </g>
  );
}
