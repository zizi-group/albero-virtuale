// Le icone del catalogo dei regali (src/lib/albero/regali.ts), disegnate a mano
// con i colori dell'albero. Decorative: il nome del regalo sta sempre accanto.

const I = "#23261d";
const ROSSO = "#c0392b";
const CARTA = "#fbf7ec";

const DISEGNI: Record<string, React.ReactNode> = {
  berretto: (
    <>
      <path d="M10,32 Q24,6 38,32 Z" fill={ROSSO} stroke={I} strokeWidth={2} strokeLinejoin="round" />
      <rect x={8} y={30} width={32} height={8} rx={4} fill="#a5311f" stroke={I} strokeWidth={2} />
      <circle cx={24} cy={10} r={5} fill={CARTA} stroke={I} strokeWidth={2} />
    </>
  ),
  sciarpa: (
    <>
      <path d="M8,14 Q24,24 40,14 L40,22 Q24,32 8,22 Z" fill={ROSSO} stroke={I} strokeWidth={2} strokeLinejoin="round" />
      <path d="M14,24 L11,42 L19,42 L21,26 Z" fill={ROSSO} stroke={I} strokeWidth={2} strokeLinejoin="round" />
      <path d="M12,33 l8,1 M17,19 l0,6 M24,21 l0,7 M31,19 l0,6" stroke={CARTA} strokeWidth={2} />
    </>
  ),
  occhiali: (
    <>
      <rect x={5} y={18} width={16} height={12} rx={5} fill="#1f2227" stroke={I} strokeWidth={2} />
      <rect x={27} y={18} width={16} height={12} rx={5} fill="#1f2227" stroke={I} strokeWidth={2} />
      <path d="M21,22 L27,22" stroke={I} strokeWidth={2} />
      <path d="M9,22 l5,0 M31,22 l5,0" stroke="#fff" strokeWidth={1.6} opacity={0.6} strokeLinecap="round" />
    </>
  ),
  libro: (
    <>
      <path d="M10,10 L34,8 L36,38 L12,40 Z" fill="#8b3a3a" stroke={I} strokeWidth={2} strokeLinejoin="round" />
      <path d="M12,40 L36,38 L37,41 L13,43 Z" fill={CARTA} stroke={I} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M16,17 l14,-1.4" stroke="#e0a526" strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
  bici: (
    <g fill="none" stroke={I} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={32} r={8} />
      <circle cx={36} cy={32} r={8} />
      <path d="M12,32 L20,18 L32,18 L36,32 M20,18 L24,32 L32,18 M18,14 h5 M32,18 l-2,-6 h5" stroke="#3f5a2a" />
      <circle cx={24} cy={32} r={1.6} fill={I} />
    </g>
  ),
  ombrello: (
    <>
      <path d="M6,24 Q24,2 42,24 Q36,20 30,24 Q24,20 18,24 Q12,20 6,24 Z" fill={ROSSO} stroke={I} strokeWidth={2} strokeLinejoin="round" />
      <path d="M24,22 L24,38 Q24,43 19,42" fill="none" stroke={I} strokeWidth={2.2} strokeLinecap="round" />
    </>
  ),
  tazza: (
    <>
      <path d="M11,20 h22 v14 q0,6 -6,6 h-10 q-6,0 -6,-6 Z" fill="#e7eed6" stroke={I} strokeWidth={2} strokeLinejoin="round" />
      <path d="M33,23 q7,0 7,6 q0,6 -7,6" fill="none" stroke={I} strokeWidth={2} />
      <path d="M17,14 q-2,-4 1,-7 M23,14 q-2,-4 1,-7 M29,14 q-2,-4 1,-7" fill="none" stroke="#9a9483" strokeWidth={1.8} strokeLinecap="round" />
    </>
  ),
  quaderno: (
    <>
      <rect x={9} y={8} width={24} height={32} rx={2} fill="#f6f0de" stroke={I} strokeWidth={2} />
      <path d="M14,16 h14 M14,22 h14 M14,28 h10" stroke="#b9b2a0" strokeWidth={1.6} />
      <path d="M37,10 L42,14 L30,38 L25,40 L25,34 Z" fill="#e0a526" stroke={I} strokeWidth={1.8} strokeLinejoin="round" />
    </>
  ),
  aquilone: (
    <>
      <path d="M24,4 L38,18 L24,34 L10,18 Z" fill="#e0a526" stroke={I} strokeWidth={2} strokeLinejoin="round" />
      <path d="M24,4 L24,34 L10,18 Z" fill="#3d5a99" stroke={I} strokeWidth={2} strokeLinejoin="round" />
      <path d="M24,34 q-4,4 0,7 q4,3 0,6" fill="none" stroke={I} strokeWidth={1.6} />
      <path d="M21,38 l6,0 M21,44 l6,0" stroke={ROSSO} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  valigia: (
    <>
      <path d="M18,14 v-4 h12 v4" fill="none" stroke={I} strokeWidth={2.2} />
      <rect x={6} y={14} width={36} height={26} rx={4} fill="#a0703a" stroke={I} strokeWidth={2} />
      <path d="M16,14 v26 M32,14 v26" stroke="#5b3b25" strokeWidth={3} />
      <rect x={20} y={22} width={8} height={6} rx={1} fill={CARTA} stroke={I} strokeWidth={1.2} />
    </>
  ),
};

export function IconaRegalo({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {DISEGNI[id] ?? (
        <g>
          <rect x={8} y={18} width={32} height={24} rx={2} fill={ROSSO} stroke={I} strokeWidth={2} />
          <path d="M24,18 v24 M8,28 h32" stroke="#e0a526" strokeWidth={3} />
        </g>
      )}
    </svg>
  );
}
