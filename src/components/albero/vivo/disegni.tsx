import type { ReactNode } from "react";
import type { Indumento, Oggetto, Stadio, Stagione } from "@/lib/albero/tipi";
import type { TipoParticella } from "./copione";

// I disegni fermi del personaggio: colori, chioma, accessori, oggetti.
// Ripresi dal disegno di partenza; il motore li sposta, non li ridisegna.

export const CORTECCIA = "#7a5236";
export const CORTECCIA_SCURA = "#5b3b25";
export const CONTORNO = "#4a2f1d";
export const INCHIOSTRO = "#23261d";
export const CARTA = "#fbf7ec";

export const PALETTE: Record<Stagione, [string, string, string]> = {
  primavera: ["#4f7f2e", "#6f9a3c", "#9cc25a"],
  estate: ["#365f24", "#4f7f2e", "#74a040"],
  autunno: ["#8a4f1f", "#c0702a", "#e0a526"],
  inverno: ["#3d5440", "#56705a", "#7f9a82"],
};

export const CHIOMA: [number, number, number][] = [
  [120, 74, 52],
  [76, 94, 34],
  [164, 94, 34],
  [90, 54, 30],
  [150, 54, 30],
  [120, 34, 28],
  [100, 112, 24],
  [140, 112, 24],
];

export const SCHIUMA: [number, number, number][] = [
  [84, 36, 11],
  [104, 20, 13],
  [130, 14, 12],
  [154, 26, 11],
  [172, 50, 10],
  [68, 60, 10],
  [118, 30, 9],
];

export const SCALA: Record<Stadio, number> = { piantina: 0.8, alberello: 0.9, albero: 1 };

/** Dove si «aggancia» ogni accessorio: il punto da cui compare quando lo indossa. */
export const PERNI: Record<string, [number, number]> = {
  "occhiali-sole": [120, 164],
  "occhiali-tondi": [120, 164],
  cappello: [120, 30],
  "berretto-notte": [124, 30],
  basco: [126, 12],
  piuma: [152, 30],
  fascia: [120, 92],
  sciarpa: [120, 146],
  bandana: [120, 144],
  cravatta: [120, 192],
  zaino: [148, 170],
};

// ——— Indumenti ———

export function OcchialiSole() {
  return (
    <g>
      <rect x={101} y={158} width={17} height={12} rx={5} fill="#1f2227" />
      <rect x={122} y={158} width={17} height={12} rx={5} fill="#1f2227" />
      <path d="M118,162 L122,162" stroke="#1f2227" strokeWidth={2} />
      <path d="M104,161 l5,0" stroke="#fff" strokeWidth={1.4} opacity={0.6} strokeLinecap="round" />
      <path d="M125,161 l5,0" stroke="#fff" strokeWidth={1.4} opacity={0.6} strokeLinecap="round" />
    </g>
  );
}

export function OcchialiTondi() {
  return (
    <g stroke={INCHIOSTRO} strokeWidth={1.8} fill="none">
      <circle cx={110} cy={164} r={8.5} />
      <circle cx={130} cy={164} r={8.5} />
      <path d="M118.5,163 Q120,161 121.5,163" />
    </g>
  );
}

export function Cappello() {
  return (
    <g>
      <path d="M84,30 Q120,-16 156,30 Z" fill="#c0392b" />
      <rect x={82} y={24} width={76} height={11} rx={5.5} fill="#a5311f" />
      <path d="M96,12 l4,12 M110,4 l2,20 M130,4 l-2,20 M144,12 l-4,12" stroke="#a5311f" strokeWidth={2} />
      <circle cx={120} cy={-8} r={9} fill={CARTA} />
    </g>
  );
}

export function BerrettoNotte({ nappa }: { nappa?: ReactNode }) {
  return (
    <g>
      <path d="M86,28 C92,-6 138,-12 160,8 C172,20 180,34 184,48 C170,32 160,26 154,28 Z" fill="#3d5a99" />
      <path d="M118,-2 l6,26 M142,2 l2,22" stroke="#e6e9f2" strokeWidth={3} opacity={0.6} />
      <rect x={84} y={22} width={72} height={11} rx={5.5} fill="#e6e9f2" />
      {nappa ?? <circle cx={185} cy={50} r={7} fill="#e6e9f2" />}
    </g>
  );
}

export function SciarpaNodo() {
  return (
    <g>
      <path d="M97,136 Q120,150 143,136 L144,149 Q120,163 96,149 Z" fill="#c0392b" />
      <path d="M108,144 l0,10 M120,147 l0,11 M132,144 l0,10" stroke="#f3ecdc" strokeWidth={2} opacity={0.8} />
    </g>
  );
}

export function SciarpaCoda() {
  return (
    <g>
      <path d="M103,148 L97,186 L110,187 L114,152 Z" fill="#c0392b" />
      <path d="M99,170 l11,1 M98,178 l11,1" stroke="#f3ecdc" strokeWidth={2} />
      <path d="M97,186 l-1,5 M101,186.5 l0,5 M105,186.8 l0,5 M109,187 l1,5" stroke="#c0392b" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

export function Bandana() {
  return (
    <g>
      <path d="M98,138 Q120,147 142,138 L120,155 Z" fill="#b8322a" />
      {[
        [110, 143],
        [120, 146],
        [130, 143],
        [120, 151],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.4} fill={CARTA} />
      ))}
    </g>
  );
}

export function Cravatta() {
  return (
    <g>
      <path d="M115,190 L125,190 L122,196 L118,196 Z" fill="#2c4a7a" />
      <path d="M118,196 L122,196 L127,214 L120,221 L113,214 Z" fill="#2c4a7a" />
      <path d="M116,204 l8,-3 M115,211 l9,-3" stroke="#e0a526" strokeWidth={1.4} />
    </g>
  );
}

export function Basco() {
  return (
    <g>
      <ellipse cx={126} cy={10} rx={34} ry={11} fill="#8b2f3a" transform="rotate(-10 126 10)" />
      <circle cx={129} cy={-2} r={3.5} fill="#8b2f3a" />
    </g>
  );
}

export function Fascia() {
  return (
    <g>
      <path d="M46,98 Q120,70 194,98" stroke="#c0392b" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M190,96 l14,10 M190,96 l16,0" stroke="#c0392b" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
}

export function Zaino() {
  return (
    <g>
      <rect x={134} y={146} width={30} height={48} rx={9} fill="#c9822e" />
      <rect x={140} y={170} width={20} height={14} rx={4} fill="#a8692a" />
    </g>
  );
}

export function Piuma() {
  return (
    <g>
      <path d="M150,30 C150,8 160,-8 180,-20 C174,0 166,16 150,30 Z" fill={CARTA} stroke="#b9a77a" strokeWidth={1.4} />
      <path d="M151,28 C158,10 166,-4 178,-18" stroke="#b9a77a" strokeWidth={1.2} fill="none" />
    </g>
  );
}

/** Gli accessori che stanno sulla chioma (girano con lei). */
export const SULLA_CHIOMA: Indumento[] = ["cappello", "berretto-notte", "basco", "piuma", "fascia"];
/** Gli accessori che stanno sulla faccia. */
export const SULLA_FACCIA: Indumento[] = ["occhiali-sole", "occhiali-tondi"];

// ——— Oggetti (escluso il libro, che si anima a parte) ———

export function disegnaOggetto(o: Oggetto): ReactNode {
  switch (o) {
    case "libro":
      return null;
    case "quaderno":
      return (
        <g>
          <rect x={102} y={190} width={36} height={26} rx={2} fill="#f6f0de" stroke="#b9b2a0" />
          <path d="M107,198 l24,0 M107,204 l20,0 M107,210 l22,0" stroke="#9fb4c8" strokeWidth={1.2} />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={106 + i * 7} cy={190} r={1.6} fill="#6b6656" />
          ))}
        </g>
      );
    case "mappa":
      return (
        <g>
          <path d="M86,188 L105,192 L124,187 L143,192 L156,188 L156,214 L143,218 L124,213 L105,218 L86,214 Z" fill="#efe2bf" stroke="#b9a77a" />
          <path d="M105,192 L105,218 M124,187 L124,213 M143,192 L143,218" stroke="#b9a77a" />
          <path d="M92,208 q10,-10 22,-4 t24,-8" stroke="#c0392b" strokeWidth={1.6} strokeDasharray="3 3" fill="none" />
          <path d="M143,192 l6,6 M149,192 l-6,6" stroke="#c0392b" strokeWidth={2} />
        </g>
      );
    case "giornale":
      return (
        <g transform="rotate(-6)">
          <rect x={-16} y={-30} width={30} height={36} fill="#f4f1e8" stroke="#b9b2a0" />
          <rect x={-13} y={-27} width={24} height={5} fill="#6b6656" />
          <polyline points="-12,-6 -6,-12 -1,-9 5,-17 10,-14" stroke="#3f7a3a" strokeWidth={1.6} fill="none" />
          <path d="M-12,-18 l22,0 M-12,-1 l22,0 M-12,3 l16,0" stroke="#b9b2a0" strokeWidth={1.2} />
        </g>
      );
    case "ombrello":
      return (
        <g>
          <path d="M0,8 L0,-66" stroke="#3a2a20" strokeWidth={2.6} />
          <path d="M0,8 q0,7 -6,6" stroke="#3a2a20" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <path d="M-44,-60 Q0,-108 44,-60 Q33,-67 22,-60 Q11,-67 0,-60 Q-11,-67 -22,-60 Q-33,-67 -44,-60 Z" fill="#26304a" />
          <path d="M0,-96 L0,-60 M-22,-60 Q-18,-86 0,-96 M22,-60 Q18,-86 0,-96" stroke="#3b4769" strokeWidth={1.4} fill="none" />
        </g>
      );
    case "telefono":
      return (
        <g transform="rotate(-10)">
          <rect x={-4.5} y={-11} width={9} height={17} rx={2.2} fill="#2b2a24" />
          <rect x={-3} y={-9} width={6} height={11} rx={1} fill="#7fb3c8" />
        </g>
      );
    case "pennello":
      return (
        <g>
          <path d="M0,6 L0,-22" stroke="#a0703c" strokeWidth={2.8} strokeLinecap="round" />
          <path d="M-2.4,-22 L2.4,-22 L1.2,-30 L-1.2,-30 Z" fill="#c0392b" />
        </g>
      );
    case "penna":
      return (
        <g>
          <path d="M0,2 C2,-12 8,-24 16,-32 C14,-18 8,-8 0,2 Z" fill={CARTA} stroke="#b9a77a" strokeWidth={1.2} />
          <path d="M0,2 L-2,7" stroke={INCHIOSTRO} strokeWidth={1.6} />
        </g>
      );
    case "manubrio":
      return (
        <g>
          <path d="M-16,0 L16,0" stroke="#5a5a52" strokeWidth={3.4} strokeLinecap="round" />
          {[-17, 17].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={2} rx={6} ry={7.5} fill="#a0703c" />
              <path d={`M${x - 6.5},-2 Q${x},-9 ${x + 6.5},-2 Z`} fill="#6b4a2b" />
            </g>
          ))}
        </g>
      );
    case "annaffiatoio":
      return (
        <g transform="rotate(30)">
          <rect x={-6} y={-8} width={26} height={20} rx={4} fill="#5f8fa8" />
          <path d="M-6,-2 L-26,-14" stroke="#5f8fa8" strokeWidth={4} strokeLinecap="round" />
          <path d="M2,-8 Q8,-20 14,-8" stroke="#5f8fa8" strokeWidth={3} fill="none" />
        </g>
      );
    case "tazza":
      return (
        <g>
          <rect x={-7} y={-12} width={14} height={14} rx={3} fill={CARTA} stroke="#b9b2a0" />
          <path d="M7,-9 q6,0 6,5 q0,5 -6,5" stroke="#b9b2a0" strokeWidth={2} fill="none" />
        </g>
      );
    case "cavalletto":
      return (
        <g>
          <path d="M184,262 L200,192 L216,262 M200,262 L200,200" stroke="#8a5a2b" strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <rect x={178} y={182} width={44} height={36} fill={CARTA} stroke="#8a5a2b" strokeWidth={2} />
          <circle cx={192} cy={196} r={7} fill="#e0a526" />
          <path d="M182,214 Q196,198 218,212" stroke="#4f7f2e" strokeWidth={4} fill="none" />
          <circle cx={210} cy={192} r={4} fill="#c0392b" />
        </g>
      );
    case "ghiande":
      return (
        <g>
          {[
            [30, 256],
            [44, 257],
            [58, 256],
            [37, 246],
            [51, 246],
            [44, 236],
          ].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={6} ry={7} fill="#a0703c" />
              <path d={`M${x - 6.5},${y - 3} Q${x},${y - 11} ${x + 6.5},${y - 3} Z`} fill="#6b4a2b" />
            </g>
          ))}
        </g>
      );
    case "cartello":
      return (
        <g>
          <path d="M206,262 L206,214" stroke="#7a5236" strokeWidth={4} />
          <rect x={176} y={190} width={62} height={30} rx={3} fill="#d8b07a" stroke="#7a5236" strokeWidth={2} />
          <text x={207} y={204} textAnchor="middle" fontSize={11} fontFamily="var(--font-gochi), cursive" fill={INCHIOSTRO}>
            OMBRA
          </text>
          <text x={207} y={215} textAnchor="middle" fontSize={8} fontFamily="var(--font-gochi), cursive" fill={INCHIOSTRO}>
            2 ghiande l&apos;ora
          </text>
        </g>
      );
    case "scoiattolo":
      return (
        <g>
          <path d="M214,258 C236,256 240,226 226,212 C218,204 206,210 214,222 C220,232 220,244 210,250 Z" fill="#c5763a" />
          <ellipse cx={200} cy={248} rx={11} ry={13} fill="#b5652b" />
          <circle cx={194} cy={232} r={8} fill="#b5652b" />
          <path d="M190,226 l-2,-8 l6,5 Z" fill="#b5652b" />
          <circle cx={191} cy={231} r={1.6} fill={INCHIOSTRO} />
          <ellipse cx={196} cy={252} rx={6} ry={4} fill="#e8c9a0" />
        </g>
      );
    case "valigia":
      return (
        <g>
          <path d="M188,226 q0,-8 8,-8 l12,0 q8,0 8,8" stroke="#5b3b25" strokeWidth={3} fill="none" />
          <rect x={176} y={226} width={52} height={36} rx={5} fill="#8b5a2b" />
          <path d="M176,240 L228,240" stroke="#6b4420" strokeWidth={2} />
          <rect x={184} y={244} width={12} height={9} rx={2} fill="#e0a526" />
          <circle cx={214} cy={250} r={5} fill="#5f8fa8" />
        </g>
      );
  }
}

/** Perno per far comparire gli oggetti posati a terra o tenuti davanti. */
export const PERNI_OGGETTI: Partial<Record<Oggetto, [number, number]>> = {
  cavalletto: [200, 262],
  ghiande: [44, 262],
  cartello: [206, 262],
  scoiattolo: [210, 262],
  valigia: [202, 262],
  quaderno: [120, 204],
  mappa: [120, 204],
  libro: [120, 205],
};

// ——— Particelle: forme semplici, centrate in 0,0 ———

export const PARTICELLE: Record<TipoParticella, { d: string; fill: string; stroke?: string; sw?: number; opacita?: number }> = {
  goccia: { d: "M0,-5 Q4.2,1 0,4.5 Q-4.2,1 0,-5Z", fill: "#7fb3c8" },
  sudore: { d: "M0,-5 Q4.2,1 0,4.5 Q-4.2,1 0,-5Z", fill: "#9cc8dd" },
  bolla: { d: "M-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0Z", fill: "#ffffff", stroke: "#cfe3ee", sw: 1, opacita: 0.8 },
  sbuffo: { d: "M-8,3 a4.5,4.5 0 0,1 1,-8 a6,6 0 0,1 10.5,-1 a4.5,4.5 0 0,1 4,8 Z", fill: "#ffffff", opacita: 0.85 },
  vapore: { d: "M-8,3 a4.5,4.5 0 0,1 1,-8 a6,6 0 0,1 10.5,-1 a4.5,4.5 0 0,1 4,8 Z", fill: "#f4f1e8", opacita: 0.9 },
  polvere: { d: "M-8,3 a4.5,4.5 0 0,1 1,-8 a6,6 0 0,1 10.5,-1 a4.5,4.5 0 0,1 4,8 Z", fill: "#c9b48a", opacita: 0.75 },
  foglia: { d: "M0,-7 Q6,-1 0,7 Q-6,-1 0,-7Z M0,-6 L0,6", fill: "#6f9a3c", stroke: "#4f7f2e", sw: 0.8 },
  zeta: { d: "M-4.5,-4.5 L4.5,-4.5 L-4.5,4.5 L4.5,4.5", fill: "none", stroke: INCHIOSTRO, sw: 2, opacita: 0.75 },
  nota: { d: "M-1,4.5 a3.2,2.4 -20 1,1 0.1,0 Z M1.8,3.6 L1.8,-8 Q6,-6.5 6.5,-2.5 Q5,-5 1.8,-5", fill: INCHIOSTRO, stroke: INCHIOSTRO, sw: 1.4, opacita: 0.8 },
  cuore: { d: "M0,5 C-7,0 -5,-6 0,-2.5 C5,-6 7,0 0,5Z", fill: "#d9534f" },
  stella: { d: "M0,-7 L1.6,-1.6 L7,0 L1.6,1.6 L0,7 L-1.6,1.6 L-7,0 L-1.6,-1.6Z", fill: "#f2c14e" },
  risata: { d: "M0,-5 L7,-8 M1,0 L9,0 M0,5 L7,8", fill: "none", stroke: INCHIOSTRO, sw: 1.8, opacita: 0.8 },
  ghianda: { d: "M-4,-1 Q-4,7 0,8 Q4,7 4,-1Z M-5,-1 Q0,-7 5,-1Z", fill: "#c08a3a", stroke: "#6b4a2b", sw: 0.8 },
};
