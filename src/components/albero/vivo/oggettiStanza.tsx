import type { ReactNode } from "react";
import { IconaRegalo } from "@/components/IconaRegalo";
import { CARTA, INCHIOSTRO as I } from "./disegni";

// I disegni 2D degli oggetti del catalogo (src/lib/albero/oggetti.ts), nello
// stile del pupazzo: contorno d'inchiostro, colori caldi, niente sfumature.
// Ogni disegno sta in un riquadro 100 × 100 con il terreno a y = 96, così la
// stanza li appoggia tutti allo stesso modo. Gli oggetti che erano già regali
// riusano le icone di IconaRegalo. Senza disegno: null (la voce è «in arrivo»).

const LEGNO = "#a8743f";
const LEGNO_SCURO = "#7a5236";
const LEGNO_CHIARO = "#c99a62";
const ROSSO = "#b8322a";
const OCRA = "#e0a526";
const FOGLIA = "#4f7f2e";
const FOGLIA_CHIARA = "#9cc25a";
const SASSO = "#b9b2a0";
const SASSO_SCURO = "#8f8878";
const LUCE = "#f6e7a0";
const CIELO = "#7fb3c8";

const t = { stroke: I, strokeWidth: 2.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const filo = { stroke: I, strokeWidth: 2, fill: "none", strokeLinecap: "round" as const };

/** Gli oggetti che riusano le icone dei regali (riquadro 48 × 48). */
const DA_ICONA = new Set(["berretto", "sciarpa", "occhiali", "libro", "bici", "ombrello", "tazza", "quaderno", "aquilone", "valigia"]);

const DISEGNI: Record<string, ReactNode> = {
  // ——— Edifici ———
  casetta: (
    <>
      <rect x={66} y={18} width={9} height={20} fill={ROSSO} {...t} />
      <rect x={18} y={48} width={64} height={48} fill={LEGNO_CHIARO} {...t} />
      <path d="M18,60 H82 M18,72 H82 M18,84 H82" stroke={LEGNO} strokeWidth={1.6} />
      <path d="M8,52 L50,14 L92,52 Z" fill={ROSSO} {...t} />
      <rect x={43} y={66} width={16} height={30} rx={2} fill={LEGNO_SCURO} {...t} />
      <circle cx={55} cy={82} r={1.6} fill={OCRA} />
      <rect x={23} y={58} width={13} height={13} fill={LUCE} {...t} />
      <path d="M29.5,58 V71 M23,64.5 H36" stroke={I} strokeWidth={1.6} />
      <rect x={66} y={58} width={10} height={10} fill={LUCE} {...t} />
    </>
  ),
  serra: (
    <>
      <path d="M12,96 V58 Q50,18 88,58 V96 Z" fill="#d6ece6" {...t} />
      <path d="M31,96 V44 M50,96 V34 M69,96 V44 M12,72 H88" stroke="#7aa89c" strokeWidth={1.6} />
      {[22, 40, 60, 78].map((x, i) => (
        <g key={x}>
          <path d={`M${x},96 v-10`} stroke={FOGLIA} strokeWidth={2} />
          <circle cx={x} cy={84 - (i % 2) * 4} r={6} fill={i % 2 ? FOGLIA_CHIARA : FOGLIA} stroke={I} strokeWidth={1.4} />
        </g>
      ))}
      <path d="M12,96 V58 Q50,18 88,58 V96" fill="none" {...t} />
    </>
  ),
  faro: (
    <>
      <path d="M36,96 L43,32 L57,32 L64,96 Z" fill={CARTA} {...t} />
      <path d="M40.5,56 L59.5,56 L61,70 L39,70 Z M38,84 L62,84 L63.4,96 L36.6,96 Z" fill={ROSSO} />
      <path d="M36,96 L43,32 L57,32 L64,96 Z" fill="none" {...t} />
      <path d="M8,26 L41,22 M8,10 L41,20 M92,26 L59,22 M92,10 L59,20" stroke={OCRA} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
      <rect x={41} y={16} width={18} height={14} fill={LUCE} {...t} />
      <path d="M39,16 L50,5 L61,16 Z" fill={ROSSO} {...t} />
      <rect x={38} y={30} width={24} height={4} fill={I} />
      <rect x={46} y={78} width={8} height={18} rx={4} fill={LEGNO_SCURO} {...t} />
    </>
  ),
  pozzo: (
    <>
      <path d="M28,64 V30 M72,64 V30" stroke={LEGNO_SCURO} strokeWidth={5} />
      <path d="M18,34 L50,14 L82,34 Z" fill={ROSSO} {...t} />
      <path d="M50,30 V54" stroke={I} strokeWidth={1.6} />
      <path d="M44,54 h12 l-2,9 h-8 Z" fill={LEGNO} {...t} />
      <rect x={22} y={62} width={56} height={34} rx={4} fill={SASSO} {...t} />
      <path d="M22,74 H78 M22,86 H78 M36,62 V74 M58,62 V74 M46,74 V86 M68,74 V86 M32,86 V96 M56,86 V96" stroke={SASSO_SCURO} strokeWidth={1.6} />
      <rect x={20} y={58} width={60} height={7} rx={3} fill="#cfc8b4" {...t} />
    </>
  ),
  forno: (
    <>
      <path d="M62,40 V24 h10 v22" fill={SASSO_SCURO} {...t} />
      <path d="M67,18 q-5,-6 1,-12 M74,16 q-4,-5 1,-10" {...filo} stroke="#9a9483" />
      <path d="M12,96 Q12,40 50,40 Q88,40 88,96 Z" fill={SASSO} {...t} />
      <path d="M22,70 q8,-4 14,2 M60,60 q8,-2 12,4 M30,54 q6,-4 12,0 M66,82 q6,-3 12,1" {...filo} stroke={SASSO_SCURO} strokeWidth={1.6} />
      <path d="M36,96 V80 Q50,64 64,80 V96 Z" fill="#3a2a20" {...t} />
      <path d="M42,96 q2,-10 8,-12 q-1,6 4,8 q2,-4 4,-6 q2,6 0,10 Z" fill="#e8762c" />
      <path d="M46,96 q2,-6 5,-6 q1,3 3,4 q0,2 -1,2 Z" fill={OCRA} />
    </>
  ),
  tenda: (
    <>
      <path d="M50,24 V10" stroke={LEGNO_SCURO} strokeWidth={2.4} />
      <path d="M50,10 l12,4 l-12,4 Z" fill={ROSSO} {...t} strokeWidth={1.6} />
      <path d="M10,96 L50,24 L90,96 Z" fill={OCRA} {...t} />
      <path d="M50,24 L40,96 L60,96 Z" fill={LEGNO_SCURO} {...t} />
      <path d="M50,24 L40,96 Q48,74 50,48" fill="#c98a1e" {...t} />
      <path d="M10,96 L4,99 M90,96 L96,99" stroke={I} strokeWidth={2} />
    </>
  ),
  palco: (
    <>
      <path d="M10,72 V20 Q50,8 90,20 V72" fill="none" stroke={LEGNO_SCURO} strokeWidth={4} />
      <path d="M10,20 Q50,8 90,20 L90,30 Q50,20 10,30 Z" fill={ROSSO} {...t} />
      <path d="M12,30 Q24,46 16,72 L12,72 Z M88,30 Q76,46 84,72 L88,72 Z" fill="#8f2620" {...t} />
      <path d="M50,38 l3,6 l6.5,0.6 l-5,4.4 l1.6,6.4 l-6.1,-3.4 l-6.1,3.4 l1.6,-6.4 l-5,-4.4 l6.5,-0.6 Z" fill={OCRA} {...t} strokeWidth={1.6} />
      <rect x={6} y={72} width={88} height={24} fill={LEGNO} {...t} />
      <path d="M6,80 H94" stroke={LEGNO_SCURO} strokeWidth={1.6} />
      <path d="M20,86 h8 M44,90 h10 M70,86 h8" stroke={LEGNO_SCURO} strokeWidth={1.6} />
    </>
  ),
  osservatorio: (
    <>
      <path d="M58,40 L84,14" stroke={I} strokeWidth={9} strokeLinecap="round" />
      <path d="M58,40 L84,14" stroke="#5a6b7a" strokeWidth={6} strokeLinecap="round" />
      <rect x={20} y={56} width={60} height={40} fill="#e6dbc2" {...t} />
      <path d="M18,58 Q50,18 82,58 Z" fill="#56705a" {...t} />
      <path d="M48,30 L54,30 L56,58 L50,58 Z" fill="#3d5440" />
      <rect x={42} y={72} width={16} height={24} rx={8} fill={LEGNO_SCURO} {...t} />
      <circle cx={30} cy={70} r={5} fill={LUCE} {...t} strokeWidth={1.6} />
      <path d="M14,14 l1.5,3 l3,1.5 l-3,1.5 l-1.5,3 l-1.5,-3 l-3,-1.5 l3,-1.5 Z M32,8 l1,2 l2,1 l-2,1 l-1,2 l-1,-2 l-2,-1 l2,-1 Z" fill={OCRA} />
    </>
  ),
  biblioteca: (
    <>
      <path d="M10,40 L50,12 L90,40 Z" fill={FOGLIA} {...t} />
      <rect x={16} y={40} width={68} height={56} fill={LEGNO_SCURO} {...t} />
      <rect x={24} y={48} width={52} height={40} fill="#5b3b25" {...t} strokeWidth={1.6} />
      <path d="M24,62 H76 M24,76 H76" stroke={LEGNO_CHIARO} strokeWidth={2.4} />
      {[
        [27, 50, ROSSO],
        [32, 52, OCRA],
        [37, 50, CIELO],
        [42, 51, FOGLIA_CHIARA],
        [54, 50, CARTA],
        [59, 52, ROSSO],
        [28, 64, FOGLIA_CHIARA],
        [33, 65, CARTA],
        [44, 64, ROSSO],
        [49, 64, OCRA],
        [62, 65, CIELO],
        [67, 64, ROSSO],
        [30, 78, OCRA],
        [35, 79, ROSSO],
        [52, 78, CIELO],
        [57, 79, CARTA],
        [62, 78, FOGLIA_CHIARA],
      ].map(([x, y, c], i) => (
        <rect key={i} x={x as number} y={y as number} width={4} height={(i % 3 === 0 ? 12 : 10) - ((y as number) % 2)} fill={c as string} stroke={I} strokeWidth={0.8} />
      ))}
      <path d="M44,32 h12" stroke={OCRA} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  atelier: (
    <>
      <path d="M12,44 L80,22 L88,44 Z" fill={LEGNO} {...t} />
      <path d="M30,38 L70,26 L74,38 Z" fill="#cfe4ec" {...t} strokeWidth={1.6} />
      <rect x={16} y={44} width={68} height={52} fill="#efe2bf" {...t} />
      <rect x={24} y={54} width={26} height={22} fill="#cfe4ec" {...t} />
      <path d="M37,54 V76 M24,65 H50" stroke={I} strokeWidth={1.4} />
      <rect x={60} y={64} width={16} height={32} rx={2} fill={LEGNO_SCURO} {...t} />
      <path d="M58,50 q8,-6 16,0 q2,6 -6,7 q-2,-3 -5,0 q-6,0 -5,-7 Z" fill={CARTA} {...t} strokeWidth={1.4} />
      <circle cx={62} cy={51} r={1.6} fill={ROSSO} />
      <circle cx={67} cy={49} r={1.6} fill={CIELO} />
      <circle cx={71} cy={52} r={1.6} fill={OCRA} />
      <path d="M22,84 q8,-6 14,0 t14,0" {...filo} stroke={ROSSO} strokeWidth={2.4} />
    </>
  ),

  // ——— Arredi grandi ———
  panchina: (
    <>
      <path d="M20,96 V66 M80,96 V66 M24,66 V40 M76,66 V40" stroke={LEGNO_SCURO} strokeWidth={4} />
      <rect x={12} y={36} width={76} height={8} rx={2} fill={LEGNO} {...t} />
      <rect x={12} y={48} width={76} height={6} rx={2} fill={LEGNO} {...t} />
      <rect x={8} y={62} width={84} height={8} rx={2} fill={LEGNO_CHIARO} {...t} />
    </>
  ),
  amaca: (
    <>
      <path d="M10,96 V30 M90,96 V30" stroke={LEGNO_SCURO} strokeWidth={5} />
      <path d="M10,36 L24,48 M90,36 L76,48" stroke={I} strokeWidth={1.6} />
      <path d="M22,46 Q50,86 78,46 Q50,72 22,46 Z" fill={OCRA} {...t} />
      <path d="M30,52 Q50,72 70,52" stroke={ROSSO} strokeWidth={2.4} fill="none" />
      <path d="M36,56 Q50,68 64,56" stroke={CARTA} strokeWidth={2} fill="none" />
    </>
  ),
  cavalletto: (
    <>
      <path d="M50,14 L28,96 M50,14 L72,96 M50,14 L52,96" stroke={LEGNO_SCURO} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M30,74 H70" stroke={LEGNO} strokeWidth={4} />
      <rect x={24} y={22} width={52} height={44} fill={CARTA} {...t} />
      <path d="M32,56 Q42,36 54,48 T70,38" {...filo} stroke={CIELO} strokeWidth={4} />
      <circle cx={62} cy={32} r={6} fill={OCRA} />
      <path d="M30,60 q10,-6 18,0 q8,-6 18,0" {...filo} stroke={FOGLIA} strokeWidth={3} />
    </>
  ),
  scrittoio: (
    <>
      <path d="M20,96 V60 M80,96 V60" stroke={LEGNO_SCURO} strokeWidth={4.4} />
      <path d="M22,84 H78" stroke={LEGNO} strokeWidth={3} />
      <path d="M12,62 L88,62 L84,48 L16,54 Z" fill={LEGNO} {...t} />
      <rect x={30} y={44} width={22} height={10} fill={CARTA} {...t} strokeWidth={1.4} transform="rotate(-5 41 49)" />
      <path d="M34,48 h12 M34,51 h9" stroke={SASSO_SCURO} strokeWidth={1} transform="rotate(-5 41 49)" />
      <rect x={64} y={42} width={9} height={8} rx={2} fill="#26304a" {...t} strokeWidth={1.6} />
      <path d="M70,42 C72,30 78,22 86,16 C82,28 76,36 70,42 Z" fill={CARTA} {...t} strokeWidth={1.4} />
    </>
  ),
  tavolino: (
    <>
      <path d="M50,62 V92" stroke={LEGNO_SCURO} strokeWidth={6} />
      <path d="M36,96 Q50,88 64,96" fill={LEGNO_SCURO} {...t} />
      <ellipse cx={50} cy={60} rx={38} ry={8} fill={LEGNO} {...t} />
      <path d="M38,56 h18 v-10 q-9,-6 -18,0 Z" fill="#e7eed6" {...t} strokeWidth={1.8} />
      <path d="M56,50 q6,-2 7,3" {...filo} strokeWidth={1.8} />
      <path d="M38,48 q-6,-2 -6,-6" {...filo} strokeWidth={1.8} />
      <path d="M44,36 q-2,-4 1,-7 M50,36 q-2,-4 1,-7" {...filo} stroke="#9a9483" strokeWidth={1.6} />
      <rect x={66} y={50} width={8} height={7} rx={2} fill={CARTA} {...t} strokeWidth={1.4} />
    </>
  ),
  sbarra: (
    <>
      <path d="M14,96 V22 M86,96 V22" stroke={LEGNO_SCURO} strokeWidth={6} strokeLinecap="round" />
      <path d="M14,26 H86" stroke="#5a5a52" strokeWidth={4} strokeLinecap="round" />
      <path d="M8,96 h12 M80,96 h12" stroke={I} strokeWidth={3} strokeLinecap="round" />
      <path d="M44,26 v6 M56,26 v6" stroke={ROSSO} strokeWidth={4} />
    </>
  ),
  aiuola: (
    <>
      <path d="M6,96 Q8,76 50,76 Q92,76 94,96 Z" fill="#6b4a2b" {...t} />
      <path d="M16,90 q10,-4 20,0 M44,86 q10,-4 20,0 M66,92 q8,-3 16,0" {...filo} stroke="#4a2f1d" strokeWidth={1.6} />
      {[20, 38, 56, 74].map((x, i) => (
        <g key={x}>
          <path d={`M${x},80 V${66 - (i % 2) * 6}`} stroke={FOGLIA} strokeWidth={2.4} />
          <path d={`M${x},${70 - (i % 2) * 6} q-8,-2 -9,-9 q7,1 9,7 M${x},${68 - (i % 2) * 6} q8,-3 9,-10 q-7,2 -9,8`} fill={FOGLIA_CHIARA} stroke={I} strokeWidth={1.2} />
        </g>
      ))}
    </>
  ),
  muretto: (
    <>
      {[
        [16, 86, 12, 9],
        [40, 87, 13, 8],
        [64, 86, 12, 9],
        [86, 88, 9, 7],
        [28, 70, 12, 8],
        [52, 70, 12, 8],
        [74, 72, 10, 7],
        [40, 56, 11, 7],
        [62, 57, 10, 6],
      ].map(([cx, cy, rx, ry], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={i % 2 ? SASSO : "#cfc8b4"} {...t} />
      ))}
      <path d="M58,52 q4,-8 8,-2" {...filo} stroke={FOGLIA} />
    </>
  ),
  ombrellone: (
    <>
      <path d="M50,24 V96" stroke={LEGNO_SCURO} strokeWidth={3.4} />
      <path d="M8,40 Q50,0 92,40 Z" fill={CARTA} {...t} />
      <path d="M8,40 Q16,18 36,12 L36,40 Z M64,12 Q84,18 92,40 L64,40 Z" fill={ROSSO} />
      <path d="M8,40 Q50,0 92,40 Z" fill="none" {...t} />
      <path d="M8,40 q7,6 14,0 q7,6 14,0 q7,6 14,0 q7,6 14,0 q7,6 14,0 q7,6 14,0" fill="none" {...t} strokeWidth={1.8} />
      <path d="M38,96 h24" stroke={I} strokeWidth={3} strokeLinecap="round" />
    </>
  ),

  // ——— Arredi piccoli ———
  falo: (
    <>
      <path d="M30,92 L66,76 M30,76 L68,92" stroke={LEGNO_SCURO} strokeWidth={7} strokeLinecap="round" />
      <path d="M38,82 Q34,62 46,52 Q44,62 52,64 Q50,52 58,44 Q66,62 60,80 Z" fill="#e8762c" {...t} strokeWidth={1.8} />
      <path d="M46,82 Q44,70 50,66 Q52,72 56,72 Q58,78 54,82 Z" fill={OCRA} />
      {[
        [12, 92],
        [24, 95],
        [40, 97],
        [58, 97],
        [74, 95],
        [88, 92],
      ].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={9} ry={5} fill={i % 2 ? SASSO : "#cfc8b4"} {...t} strokeWidth={1.8} />
      ))}
    </>
  ),
  lanterna: (
    <>
      <circle cx={50} cy={62} r={26} fill={LUCE} opacity={0.45} />
      <path d="M50,20 q-10,0 -10,10 M50,20 q10,0 10,10" {...filo} />
      <path d="M36,36 h28 l-4,-6 h-20 Z" fill="#2e5f45" {...t} />
      <rect x={38} y={36} width={24} height={40} rx={3} fill={LUCE} {...t} />
      <path d="M44,36 V76 M56,36 V76" stroke="#2e5f45" strokeWidth={2} />
      <path d="M50,64 q-4,-6 0,-12 q4,6 0,12 Z" fill="#e8762c" />
      <rect x={34} y={76} width={32} height={8} rx={2} fill="#2e5f45" {...t} />
      <path d="M42,84 L40,96 M58,84 L60,96" stroke={I} strokeWidth={2.4} />
    </>
  ),
  sgabello: (
    <>
      <path d="M34,66 L24,96 M66,66 L76,96 M50,68 V96" stroke={LEGNO_SCURO} strokeWidth={4.4} strokeLinecap="round" />
      <path d="M30,84 H70" stroke={LEGNO} strokeWidth={3} />
      <ellipse cx={50} cy={64} rx={26} ry={7} fill={LEGNO_CHIARO} {...t} />
      <path d="M38,62 q12,4 24,0" {...filo} stroke={LEGNO} strokeWidth={1.4} />
    </>
  ),
  vaso: (
    <>
      <path d="M50,60 V30 M50,48 L36,30 M50,44 L64,28" stroke={FOGLIA} strokeWidth={2.6} />
      {[
        [50, 26, ROSSO],
        [34, 26, OCRA],
        [66, 24, "#c46aa0"],
      ].map(([cx, cy, c], i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={cx as number} cy={(cy as number) - 6} rx={3.6} ry={6} fill={c as string} stroke={I} strokeWidth={1} transform={`rotate(${a} ${cx} ${cy})`} />
          ))}
          <circle cx={cx as number} cy={cy as number} r={3.4} fill={OCRA} stroke={I} strokeWidth={1.2} />
        </g>
      ))}
      <path d="M44,52 q-8,-2 -10,-8 q8,0 10,6" fill={FOGLIA_CHIARA} stroke={I} strokeWidth={1.2} />
      <path d="M28,60 h44 l-6,36 h-32 Z" fill="#c0702a" {...t} />
      <rect x={25} y={58} width={50} height={8} rx={2} fill="#d98a3c" {...t} />
    </>
  ),
  catasta: (
    <>
      {[
        [22, 86],
        [42, 86],
        [62, 86],
        [82, 86],
        [32, 68],
        [52, 68],
        [72, 68],
        [42, 50],
        [62, 50],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={10} fill={LEGNO_CHIARO} {...t} />
          <circle cx={cx} cy={cy} r={5} fill="none" stroke={LEGNO} strokeWidth={1.4} />
          <circle cx={cx} cy={cy} r={1.4} fill={LEGNO_SCURO} />
        </g>
      ))}
    </>
  ),

  // ——— Cose appese ———
  altalena: (
    <>
      <path d="M14,96 L30,10 L46,96 M54,96 L70,10 L86,96" stroke={LEGNO_SCURO} strokeWidth={4} strokeLinecap="round" fill="none" />
      <path d="M24,12 H76" stroke={LEGNO} strokeWidth={6} strokeLinecap="round" />
      <g className="lv-dondola">
        <path d="M40,14 V72 M60,14 V72" stroke={I} strokeWidth={1.8} />
        <rect x={34} y={70} width={32} height={7} rx={2} fill={ROSSO} {...t} />
      </g>
    </>
  ),
  "casetta-uccelli": (
    <>
      <path d="M50,52 V96" stroke={LEGNO_SCURO} strokeWidth={5} />
      <rect x={32} y={30} width={36} height={28} fill={OCRA} {...t} />
      <path d="M26,32 L50,10 L74,32 Z" fill={ROSSO} {...t} />
      <circle cx={50} cy={42} r={6} fill="#3a2a20" {...t} strokeWidth={1.6} />
      <path d="M46,52 h8" stroke={LEGNO_SCURO} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M70,18 q4,-4 8,0 q3,-3 6,0 l-3,4 q-6,2 -11,-4 Z" fill="#3d5440" stroke={I} strokeWidth={1.2} />
      <path d="M84,18 l4,-1" stroke={OCRA} strokeWidth={1.6} />
    </>
  ),
  "filo-poesie": (
    <>
      <path d="M8,96 V24 M92,96 V24" stroke={LEGNO_SCURO} strokeWidth={4} />
      <path d="M8,28 Q50,48 92,28" {...filo} strokeWidth={1.6} />
      {[
        [24, 34, -6],
        [44, 39, 3],
        [64, 38, -3],
        [80, 33, 7],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <rect x={x - 7} y={y} width={14} height={18} fill={CARTA} {...t} strokeWidth={1.4} />
          <path d={`M${x - 4},${y + 5} h8 M${x - 4},${y + 9} h6 M${x - 4},${y + 13} h7`} stroke={SASSO_SCURO} strokeWidth={1} />
          <path d={`M${x - 2},${y - 2} v4`} stroke={OCRA} strokeWidth={2} />
        </g>
      ))}
    </>
  ),
  festoni: (
    <>
      <path d="M8,96 V20 M92,96 V20" stroke={LEGNO_SCURO} strokeWidth={4} />
      <path d="M8,24 Q50,50 92,24" {...filo} strokeWidth={1.6} />
      {[16, 28, 40, 52, 64, 76, 86].map((x, i) => {
        const y = 24 + 26 * (1 - Math.pow((x - 50) / 42, 2)) * 0.98;
        const c = [ROSSO, OCRA, CIELO, FOGLIA_CHIARA][i % 4];
        return <path key={x} d={`M${x - 5},${y - 1} L${x + 5},${y + 1} L${x},${y + 12} Z`} fill={c} stroke={I} strokeWidth={1.2} strokeLinejoin="round" />;
      })}
    </>
  ),

  // ——— Attrezzi ———
  annaffiatoio: (
    <>
      <path d="M26,46 h36 v40 q0,8 -8,8 h-20 q-8,0 -8,-8 Z" fill="#5e8c6a" {...t} />
      <path d="M62,56 L86,36 l4,4 l-6,2" fill="none" {...t} strokeWidth={3} />
      <ellipse cx={88} cy={38} rx={5} ry={3} fill="#5e8c6a" {...t} transform="rotate(-40 88 38)" />
      <path d="M30,46 q14,-18 28,0" {...filo} strokeWidth={3} />
      <path d="M32,62 h24" stroke="#86b392" strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  rastrello: (
    <>
      <path d="M70,10 L34,78" stroke={LEGNO} strokeWidth={4} strokeLinecap="round" />
      <path d="M14,72 L54,92" stroke="#5a5a52" strokeWidth={4} strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${16 + i * 7.5},${73 + i * 3.8} l-3,8`} stroke="#5a5a52" strokeWidth={2.4} strokeLinecap="round" />
      ))}
      <path d="M78,60 q6,-6 12,0 q-6,4 -12,0" fill={OCRA} stroke={I} strokeWidth={1.2} />
    </>
  ),
  scopa: (
    <>
      <path d="M72,8 L48,62" stroke={LEGNO} strokeWidth={4} strokeLinecap="round" />
      <path d="M40,58 L58,66 L56,94 Q36,96 22,86 Z" fill={OCRA} {...t} />
      <path d="M44,66 L36,90 M50,68 L46,93 M54,70 L54,94" stroke="#a87a1e" strokeWidth={1.6} />
      <path d="M40,62 L58,70" stroke={ROSSO} strokeWidth={3} />
    </>
  ),
  secchio: (
    <>
      <path d="M26,44 q24,-30 48,0" {...filo} strokeWidth={2.6} />
      <path d="M22,44 h56 l-6,48 h-44 Z" fill="#9fb4c8" {...t} />
      <ellipse cx={50} cy={44} rx={28} ry={5} fill={CIELO} {...t} />
      <path d="M28,58 h44 M30,76 h40" stroke="#7f95aa" strokeWidth={2} />
    </>
  ),
  lente: (
    <>
      <path d="M58,58 L86,90" stroke={LEGNO_SCURO} strokeWidth={8} strokeLinecap="round" />
      <circle cx={40} cy={40} r={26} fill="#dcecf2" stroke={I} strokeWidth={5} />
      <circle cx={40} cy={40} r={26} fill="none" stroke={OCRA} strokeWidth={2.4} />
      <path d="M26,30 q6,-10 16,-10" {...filo} stroke="#fff" strokeWidth={3} />
    </>
  ),
  cannocchiale: (
    <>
      <path d="M16,70 L84,30" stroke={I} strokeWidth={22} strokeLinecap="round" />
      <path d="M18,69 L46,53" stroke="#5a6b7a" strokeWidth={14} strokeLinecap="round" />
      <path d="M46,53 L66,41" stroke={OCRA} strokeWidth={17} />
      <path d="M66,41 L82,31" stroke="#5a6b7a" strokeWidth={19} strokeLinecap="round" />
      <path d="M42,66 L30,96 M54,58 L66,96" stroke={LEGNO_SCURO} strokeWidth={3.4} strokeLinecap="round" />
    </>
  ),
  acciarino: (
    <>
      <path d="M14,56 Q14,40 34,40 H66 Q86,40 86,56" fill="none" stroke="#5a5a52" strokeWidth={8} strokeLinecap="round" />
      <path d="M14,56 Q14,40 34,40 H66 Q86,40 86,56" fill="none" stroke={I} strokeWidth={1.6} />
      <path d="M38,64 L58,58 L66,80 L42,88 Z" fill={SASSO} {...t} />
      <path d="M50,32 l2,-10 M60,34 l7,-8 M42,34 l-5,-8" stroke={OCRA} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={56} cy={18} r={2} fill="#e8762c" />
    </>
  ),
  "canna-pesca": (
    <>
      <path d="M14,92 Q46,40 88,10" fill="none" stroke={LEGNO} strokeWidth={3.6} strokeLinecap="round" />
      <path d="M88,10 Q90,44 82,62" {...filo} strokeWidth={1.2} />
      <circle cx={82} cy={66} r={4} fill={ROSSO} stroke={I} strokeWidth={1.4} />
      <circle cx={30} cy={74} r={6} fill="#5a5a52" {...t} />
      <path d="M30,74 l5,-3" stroke={I} strokeWidth={1.4} />
    </>
  ),
  tavolozza: (
    <>
      <path d="M50,18 C78,18 94,36 88,58 C84,72 70,66 64,74 C58,84 64,92 48,92 C22,92 8,74 10,52 C12,32 28,18 50,18 Z" fill={LEGNO_CHIARO} {...t} />
      <ellipse cx={34} cy={72} rx={7} ry={5} fill="#f3ecdc" {...t} strokeWidth={1.4} />
      {[
        [30, 42, ROSSO],
        [46, 32, OCRA],
        [64, 34, CIELO],
        [76, 48, FOGLIA],
        [24, 56, "#c46aa0"],
      ].map(([cx, cy, c], i) => (
        <circle key={i} cx={cx as number} cy={cy as number} r={6} fill={c as string} stroke={I} strokeWidth={1.4} />
      ))}
      <path d="M56,82 L90,52" stroke={LEGNO_SCURO} strokeWidth={3} strokeLinecap="round" />
      <path d="M90,52 l4,-4" stroke={ROSSO} strokeWidth={4} strokeLinecap="round" />
    </>
  ),
  binocolo: (
    <>
      <rect x={18} y={36} width={26} height={44} rx={8} fill="#3a3a34" {...t} />
      <rect x={56} y={36} width={26} height={44} rx={8} fill="#3a3a34" {...t} />
      <rect x={42} y={46} width={16} height={14} rx={3} fill="#5a5a52" {...t} />
      <ellipse cx={31} cy={80} rx={11} ry={5} fill={CIELO} {...t} />
      <ellipse cx={69} cy={80} rx={11} ry={5} fill={CIELO} {...t} />
      <path d="M22,30 Q50,10 78,30" {...filo} stroke={ROSSO} strokeWidth={2.4} />
    </>
  ),

  // ——— Giochi ———
  pallone: (
    <>
      <ellipse cx={50} cy={95} rx={24} ry={3} fill={I} opacity={0.2} />
      <circle cx={50} cy={66} r={28} fill={CARTA} {...t} />
      <path d="M50,54 l11,8 l-4,13 h-14 l-4,-13 Z" fill={I} />
      <path d="M50,54 V39 M61,62 l13,-5 M57,75 l8,12 M43,75 l-8,12 M39,62 l-13,-5" stroke={I} strokeWidth={2} />
      <path d="M26,52 l5,-8 l7,2 M74,52 l-5,-8 l-7,2" fill="none" stroke={I} strokeWidth={1.6} />
    </>
  ),
  bolle: (
    <>
      {[
        [40, 46, 20],
        [70, 30, 12],
        [72, 64, 9],
        [24, 22, 8],
        [52, 82, 7],
      ].map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="#dcecf2" fillOpacity={0.5} stroke={CIELO} strokeWidth={2} />
          <path d={`M${cx - r * 0.55},${cy - r * 0.3} q${r * 0.2},${-r * 0.4} ${r * 0.55},${-r * 0.4}`} {...filo} stroke="#fff" strokeWidth={1.8} />
        </g>
      ))}
      <path d="M16,96 l10,-22" stroke={OCRA} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={27} cy={70} r={5} fill="none" stroke={OCRA} strokeWidth={2.4} />
    </>
  ),
  trottola: (
    <>
      <ellipse cx={50} cy={95} rx={16} ry={2.5} fill={I} opacity={0.2} />
      <path d="M50,94 L28,58 Q50,42 72,58 Z" fill="#a0703c" {...t} />
      <path d="M30,58 Q50,30 70,58 Q50,50 30,58 Z" fill="#6b4a2b" {...t} />
      <path d="M50,40 V26" stroke={LEGNO_SCURO} strokeWidth={4} strokeLinecap="round" />
      <path d="M36,68 q14,6 28,0" {...filo} stroke={OCRA} strokeWidth={2.4} />
      <path d="M18,52 q-6,10 0,20 M82,52 q6,10 0,20" {...filo} stroke={I} strokeWidth={1.4} opacity={0.5} />
    </>
  ),
  "aereo-carta": (
    <>
      <path d="M10,60 L90,28 L46,72 Z" fill={CARTA} {...t} />
      <path d="M46,72 L52,88 L90,28" fill="#efe2bf" {...t} />
      <path d="M10,60 L52,58 L90,28" {...filo} strokeWidth={1.6} />
      <path d="M8,86 q14,-6 22,2 q8,8 20,0" {...filo} stroke={SASSO_SCURO} strokeWidth={1.6} strokeDasharray="3 4" />
    </>
  ),
  scacchi: (
    <>
      <path d="M8,86 L50,70 L92,86 L50,98 Z" fill={LEGNO_CHIARO} {...t} />
      <path d="M22,81 L64,94 M36,76 L78,90 M36,93 L78,76 M22,88 L64,72" stroke={LEGNO_SCURO} strokeWidth={1.4} />
      <path d="M36,80 v-14 q-5,-2 -4,-8 q4,-4 8,0 q1,6 -4,8 Z" fill={CARTA} {...t} strokeWidth={1.6} />
      <path d="M60,82 v-20 h-4 v-6 h3 v-4 h3 v4 h3 v-4 h3 v4 h3 v6 h-4 v20 Z" fill={I} />
      <circle cx={48} cy={74} r={4} fill={I} />
    </>
  ),

  // ——— Vestiti ———
  basco: (
    <>
      <ellipse cx={50} cy={62} rx={36} ry={14} fill="#2b2a3a" {...t} />
      <path d="M18,60 Q30,36 56,38 Q82,42 84,58" fill="#3b3a52" {...t} />
      <path d="M54,38 l4,-8" stroke={I} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  bandana: (
    <>
      <path d="M12,40 Q50,30 88,40 L50,86 Z" fill={ROSSO} {...t} />
      <circle cx={34} cy={44} r={2.4} fill={CARTA} />
      <circle cx={52} cy={52} r={2.4} fill={CARTA} />
      <circle cx={66} cy={44} r={2.4} fill={CARTA} />
      <circle cx={50} cy={68} r={2.4} fill={CARTA} />
      <path d="M12,40 l-8,-8 M12,40 l-6,6 M88,40 l8,-8 M88,40 l6,6" stroke={I} strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
  cravatta: (
    <>
      <path d="M38,14 h24 l-6,12 h-12 Z" fill="#26304a" {...t} />
      <path d="M44,26 h12 l10,52 l-16,16 l-16,-16 Z" fill="#26304a" {...t} />
      <path d="M48,40 l10,10 M46,56 l14,12 M44,72 l10,10" stroke={OCRA} strokeWidth={2.4} />
    </>
  ),
  "berretto-notte": (
    <>
      <path d="M18,72 Q24,30 56,20 Q80,14 84,40 Q72,30 66,40 Q60,58 82,72 Z" fill="#3b4769" {...t} />
      <path d="M30,40 l1.4,3 l3,1 l-3,1 l-1.4,3 l-1.4,-3 l-3,-1 l3,-1 Z M50,30 l1,2 l2,1 l-2,1 l-1,2 l-1,-2 l-2,-1 l2,-1 Z" fill={OCRA} />
      <rect x={14} y={68} width={72} height={14} rx={7} fill={CARTA} {...t} />
      <circle cx={86} cy={42} r={8} fill={CARTA} {...t} />
    </>
  ),
  piuma: (
    <>
      <path d="M26,90 C34,56 56,24 86,10 C80,40 60,68 26,90 Z" fill={CARTA} {...t} />
      <path d="M26,90 C46,62 66,34 86,10" {...filo} strokeWidth={1.6} />
      <path d="M44,66 l-8,-4 M52,56 l-8,-6 M62,44 l-6,-8 M70,34 l-4,-8 M48,66 l6,8 M58,54 l8,6 M68,42 l8,4" stroke="#c9bfa6" strokeWidth={1.2} />
      <path d="M26,90 l-6,6" stroke={I} strokeWidth={2.6} strokeLinecap="round" />
    </>
  ),
  zaino: (
    <>
      <path d="M36,26 q14,-16 28,0" {...filo} strokeWidth={3} />
      <rect x={22} y={26} width={56} height={66} rx={12} fill="#5e7a3a" {...t} />
      <path d="M22,48 Q50,58 78,48 L78,40 Q50,50 22,40 Z" fill="#4a6230" {...t} />
      <rect x={32} y={62} width={36} height={22} rx={5} fill="#7a9a4a" {...t} />
      <path d="M50,48 v10" stroke={OCRA} strokeWidth={3} />
    </>
  ),
  fascia: (
    <>
      <path d="M10,50 Q50,34 90,50 L90,64 Q50,48 10,64 Z" fill={ROSSO} {...t} />
      <path d="M12,56 Q50,41 88,56" stroke={CARTA} strokeWidth={2.4} fill="none" />
      <path d="M86,58 l8,22 l-8,-4 l-4,8 l-4,-24" fill={ROSSO} {...t} />
    </>
  ),
  "occhiali-tondi": (
    <>
      <circle cx={30} cy={56} r={16} fill="#dcecf2" fillOpacity={0.6} stroke={I} strokeWidth={3.4} />
      <circle cx={70} cy={56} r={16} fill="#dcecf2" fillOpacity={0.6} stroke={I} strokeWidth={3.4} />
      <path d="M46,54 q4,-5 8,0 M14,52 L4,44 M86,52 L96,44" {...filo} strokeWidth={3} />
      <path d="M22,50 q4,-5 9,-5 M62,50 q4,-5 9,-5" {...filo} stroke="#fff" strokeWidth={2} />
    </>
  ),

  // ——— Rarità ———
  arcobaleno: (
    <>
      {[ROSSO, "#e8762c", OCRA, FOGLIA_CHIARA, CIELO, "#6a5a9a"].map((c, i) => (
        <path key={c} d={`M${8 + i * 5},84 A${42 - i * 5},${42 - i * 5} 0 0 1 ${92 - i * 5},84`} fill="none" stroke={c} strokeWidth={5.4} />
      ))}
      <path d="M2,86 q8,-10 18,-2 q8,-8 16,0 Q20,96 2,86 Z M64,86 q8,-10 18,-2 q8,-8 16,0 Q82,96 64,86 Z" fill={CARTA} {...t} strokeWidth={1.8} />
    </>
  ),
  "foglia-oro": (
    <>
      <path d="M50,92 V80" stroke={LEGNO_SCURO} strokeWidth={3} strokeLinecap="round" />
      <path d="M50,80 C20,72 14,40 50,10 C86,40 80,72 50,80 Z" fill={OCRA} {...t} />
      <path d="M50,80 V18 M50,64 l-16,-12 M50,50 l-14,-12 M50,64 l16,-12 M50,50 l14,-12 M50,36 l-8,-8 M50,36 l8,-8" stroke="#a87a1e" strokeWidth={1.6} fill="none" />
      <path d="M20,22 l2,4 l4,2 l-4,2 l-2,4 l-2,-4 l-4,-2 l4,-2 Z M80,56 l1.5,3 l3,1.5 l-3,1.5 l-1.5,3 l-1.5,-3 l-3,-1.5 l3,-1.5 Z" fill="#fff3b0" stroke={OCRA} strokeWidth={0.8} />
    </>
  ),
  "pupazzo-neve": (
    <>
      <circle cx={50} cy={74} r={22} fill="#f7f9fb" {...t} />
      <circle cx={50} cy={40} r={15} fill="#f7f9fb" {...t} />
      <path d="M50,42 l14,3 l-14,2 Z" fill="#e8762c" stroke={I} strokeWidth={1.2} />
      <circle cx={45} cy={36} r={1.8} fill={I} />
      <circle cx={55} cy={36} r={1.8} fill={I} />
      <path d="M38,26 h24 l-3,-14 h-18 Z" fill={I} />
      <path d="M36,54 Q50,60 64,54 L64,60 Q50,66 36,60 Z" fill={ROSSO} {...t} strokeWidth={1.6} />
      <path d="M30,66 L10,52 M70,66 L90,52" stroke={LEGNO_SCURO} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={50} cy={70} r={2} fill={I} />
      <circle cx={50} cy={80} r={2} fill={I} />
    </>
  ),
};

/** Il disegno di un oggetto del catalogo, o null se non c'è (voce «in arrivo»). */
export function haDisegno(id: string) {
  return id in DISEGNI || DA_ICONA.has(id);
}

export function FiguraOggetto({ id, className, simbolo }: { id: string; className?: string; simbolo?: string }) {
  if (DA_ICONA.has(id)) return <IconaRegalo id={id} className={className} />;
  const disegno = DISEGNI[id];
  if (disegno) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden overflow="visible">
        {disegno}
      </svg>
    );
  }
  if (simbolo) return <Coccarda simbolo={simbolo} className={className} />;
  return null;
}

/** I trofei: una coccarda con il loro simbolo. */
export function Coccarda({ simbolo, className }: { simbolo: string; className?: string }) {
  const corto = simbolo.length <= 3;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M36,58 L26,96 L38,88 L44,98 L50,62 Z M64,58 L74,96 L62,88 L56,98 L50,62 Z" fill={ROSSO} {...t} strokeWidth={1.8} />
      <circle cx={50} cy={42} r={32} fill={OCRA} {...t} />
      <circle cx={50} cy={42} r={24} fill="#f2c94c" stroke="#a87a1e" strokeWidth={1.6} />
      {corto ? (
        <text x={50} y={51} textAnchor="middle" fontSize={simbolo.length > 2 ? 18 : 24} fontWeight={700} fontFamily="var(--font-gochi), cursive" fill={I}>
          {simbolo}
        </text>
      ) : (
        <path d="M50,28 l4,9 l10,1 l-7.5,6.5 l2.5,10 l-9,-5.5 l-9,5.5 l2.5,-10 l-7.5,-6.5 l10,-1 Z" fill={I} />
      )}
    </svg>
  );
}

/** Il pacco con il nastro: compare nella stanza quando c'è qualcosa di nuovo. */
export function Pacco({ tanti = 0 }: { tanti?: number }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden overflow="visible">
      <ellipse cx={50} cy={96} rx={36} ry={4} fill={I} opacity={0.18} />
      <rect x={16} y={46} width={68} height={50} rx={3} fill={ROSSO} {...t} />
      <rect x={44} y={46} width={12} height={50} fill={OCRA} stroke={I} strokeWidth={1.6} />
      <g className="lv-coperchio">
        <rect x={11} y={34} width={78} height={14} rx={3} fill="#c94a3c" {...t} />
        <rect x={44} y={34} width={12} height={14} fill={OCRA} stroke={I} strokeWidth={1.6} />
        <path d="M50,34 C40,14 22,18 30,30 C34,35 44,35 50,34 Z M50,34 C60,14 78,18 70,30 C66,35 56,35 50,34 Z" fill={OCRA} {...t} strokeWidth={1.8} />
        <circle cx={50} cy={33} r={4.4} fill="#c98a1e" {...t} strokeWidth={1.6} />
      </g>
      {tanti > 1 && (
        <g>
          <circle cx={84} cy={40} r={11} fill={CARTA} {...t} />
          <text x={84} y={45} textAnchor="middle" fontSize={14} fontWeight={700} fill={I}>
            {tanti}
          </text>
        </g>
      )}
    </svg>
  );
}

/** La cassetta degli attrezzi: compare quando ne ha almeno uno. */
export function CassettaAttrezzi() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden overflow="visible">
      <path d="M34,52 V40 h32 v12" fill="none" stroke={I} strokeWidth={4} />
      <path d="M40,40 L32,12" stroke={LEGNO} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M26,10 q6,-6 12,0 q-6,6 -12,0" fill={OCRA} stroke={I} strokeWidth={1.2} />
      <path d="M60,40 L70,18" stroke="#5a5a52" strokeWidth={3} strokeLinecap="round" />
      <rect x={10} y={52} width={80} height={44} rx={4} fill={ROSSO} {...t} />
      <path d="M10,66 H90" stroke={I} strokeWidth={2} />
      <rect x={44} y={62} width={12} height={8} rx={2} fill={SASSO} {...t} strokeWidth={1.4} />
    </svg>
  );
}
