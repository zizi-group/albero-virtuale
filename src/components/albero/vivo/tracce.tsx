import type { ReactNode } from "react";
import type { TracceScena } from "@/lib/albero/catene";
import type { Attrezzo, Canali } from "./canali";
import { CONTORNO, disegnaOggetto, INCHIOSTRO } from "./disegni";
import type { Attributi } from "./fotogramma";

// Le tracce nella scena (docs/stanze-e-vita.md, sezioni 4 e 8): quello che
// l'albero ha lasciato vivendo (la catasta di legna, il cerchio di sassi con le
// braci, l'orto che cresce, i vasetti di marmellata, il mucchio di foglie, le
// scorte) e gli oggetti di scena delle attività quotidiane (il fuoco che
// crepita, la pentola, il cespuglio di bacche, il filo del bucato,
// l'uccellino, le stelle). Coordinate del personaggio, come gli arredi dei
// mestieri: terreno a y = 262, l'albero a casa ha il centro a x = 120. Le
// tracce stanno ferme nel prato: non seguono l'albero quando lo trascini.

const LEGNO = "#a8743f";
const LEGNO_SCURO = "#7a5236";
const SASSO = "#9a958a";
const SASSO_SCURO = "#6f6b62";
const TERRA_ORTO = "#7a5534";
const VERDE = "#5f8f35";
const BACCA = "#8e3b6e";

/** Dove sta ogni cosa (x del centro, coordinate del personaggio). */
export const POSTI_SCENA = {
  mucchio: -122,
  cespuglio: -160,
  sassi: -92,
  catasta: -54,
  falo: 16,
  pozza: 62,
  ghiande: 64,
  ciotola: 166,
  secchio: 176,
  cesto: 198,
  tinozza: 204,
  orto: 250,
  raccolto: 292,
  mensola: 322,
  filo: 300,
} as const;

type NomePosto = keyof typeof POSTI_SCENA;

/** Il prato largo per cui sono pensati i posti (x del mondo, oggetti compresi). */
const PRATO = { sx: -178, dx: 356 };

/**
 * Quanto stringere il prato perché ci stia tutto nello spazio che si vede
 * (sul telefono il prato è stretto): 1 sul computer, meno sul telefono.
 */
export function stringiPrato(sx: number, dx: number): number {
  const a = sx + 24;
  const b = dx - 24;
  return lim(
    Math.min((120 - a) / (120 - PRATO.sx), (b - 120) / (PRATO.dx - 120)),
    0.3,
    1,
  );
}

/** Dove sta davvero un posto del prato, stretto attorno all'albero (x = 120). */
export const postoStretto = (x: number, k: number) => 120 + (x - 120) * k;
/** Quanto si rimpiccioliscono i disegni nel prato stretto. */
export const scalaStretta = (k: number) => lim(k, 0.62, 1);

/** Lo stato della scena che serve per disegnare: le tracce lasciate vivendo. */
export interface StatoScena {
  tracce: TracceScena;
  /** C'è già lo scoiattolo dei mestieri (non se ne disegna un secondo). */
  scoiattoloDelMestiere: boolean;
}

const lim = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const n2 = (v: number) => Math.round(v * 100) / 100;
const vis = (si: boolean) => (si ? "inline" : "none");
const scala = (x: number, y: number, s: number, sy = s) =>
  `translate(${x} ${y}) scale(${n2(Math.max(0.01, s))} ${n2(Math.max(0.01, sy))}) translate(${-x} ${-y})`;

function attr(A: Attributi, k: string): Record<string, string> {
  const fuori: Record<string, string> = {};
  for (const [n, v] of Object.entries(A[k] ?? {}))
    fuori[n.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  return fuori;
}

/** Quanto fuoco si vede adesso. */
const fiamma = (v: Canali) => lim(v.fuoco, 0, 1) * lim(v.costruzione, 0, 1);

/** Gli attributi animati delle tracce (gli stessi sul server e nel browser). `k`: quanto è stretto il prato. */
export function fotogrammaScena(
  v: Canali,
  s: StatoScena,
  A: Attributi,
  t: number,
  k0 = 1,
) {
  const tr = s.tracce;
  const sc = scalaStretta(k0);
  for (const nome of Object.keys(POSTI_SCENA) as NomePosto[]) {
    const x = POSTI_SCENA[nome];
    A[`t-p-${nome}`] = {
      transform:
        k0 >= 0.999
          ? "translate(0 0)"
          : `translate(${n2(postoStretto(x, k0))} 262) scale(${n2(sc)}) translate(${-x} -262)`,
    };
  }
  const k = lim(v.costruzione, 0, 1);

  // La catasta: un tronchetto ogni ramo raccolto (al massimo 6).
  const legna = lim(Math.round((tr.legna ?? 0) + v.legnaIn * k), 0, 6);
  for (let i = 0; i < 6; i++) A[`t-legna${i}`] = { display: vis(i < legna) };

  // Il falò: il cerchio resta, le braci brillano, le fiamme crepitano.
  const f = fiamma(v);
  const braci = (tr.braci ?? 0) > 0;
  A["t-falo"] = { display: vis(!!tr.cerchio || f > 0.01 || braci) };
  A["t-braci"] = {
    opacity: `${n2(braci || f > 0.01 ? 0.55 + 0.25 * Math.sin(t * 3) + 0.2 * f : 0)}`,
  };
  A["t-fiamme"] = {
    display: vis(f > 0.01),
    transform: scala(
      POSTI_SCENA.falo,
      250,
      f,
      f * (1 + 0.08 * Math.sin(t * 13)),
    ),
  };
  for (let i = 0; i < 3; i++) {
    A[`t-fiamma${i}`] = {
      transform: `translate(${POSTI_SCENA.falo + (i - 1) * 7} 250) scale(${n2(1 + 0.1 * Math.sin(t * (9 + i * 2.3) + i))} ${n2(1 + 0.22 * Math.sin(t * (11 + i * 1.7) + i * 2))})`,
    };
  }
  A["t-pentola"] = { display: vis(v.pentola > 0.5) };

  // Il mucchio di foglie.
  const mucchio = lim((tr.mucchio ? 1 : 0) + v.mucchioIn * k, 0, 1.2);
  A["t-mucchio"] = {
    display: vis(mucchio > 0.02),
    transform: scala(POSTI_SCENA.mucchio, 262, mucchio),
  };

  // L'orto: aiuola, semi, germogli, verdure.
  const orto0 = tr.orto ?? 0;
  const orto = lim(v.ortoA >= 0 ? orto0 + (v.ortoA - orto0) * k : orto0, 0, 4);
  A["t-orto"] = { display: vis(orto > 0.02) };
  A["t-aiuola"] = {
    transform: scala(POSTI_SCENA.orto, 256, lim(orto, 0, 1), 1),
  };
  A["t-semi"] = { display: vis(orto >= 1.9) };
  A["t-germogli"] = {
    display: vis(orto >= 2.1),
    transform: scala(POSTI_SCENA.orto, 252, 1, lim(orto - 2, 0.05, 1)),
  };
  A["t-verdure"] = {
    display: vis(orto >= 3.1),
    transform: scala(POSTI_SCENA.orto, 252, lim(orto - 3, 0.05, 1)),
  };

  // La mensola con i vasetti di marmellata.
  const vasetti = lim(Math.round((tr.vasetti ?? 0) + v.vasettiIn * k), 0, 6);
  A["t-mensola"] = { display: vis(vasetti > 0) };
  for (let i = 0; i < 6; i++)
    A[`t-vasetto${i}`] = { display: vis(i < vasetti) };

  // Le scorte.
  const sassi = lim(tr.sassi ?? 0, 0, 9);
  for (let i = 0; i < 4; i++)
    A[`t-sasso${i}`] = { display: vis(sassi > i * 2) };
  const ghiande = lim(tr.ghiande ?? 0, 0, 9);
  for (let i = 0; i < 4; i++)
    A[`t-ghianda${i}`] = { display: vis(ghiande > i * 2) };
  A["t-cesto"] = { display: vis((tr.bacche ?? 0) > 0) };
  A["t-raccolto"] = { display: vis((tr.raccolto ?? 0) > 0) };
  A["t-ciotola"] = { display: vis(v.ciotola > 0.5 || (tr.succo ?? 0) > 0) };
  A["t-succo"] = { display: vis(v.ciotola > 0.5 || (tr.succo ?? 0) > 0) };
  const acqua = Math.max(lim(v.acqua, 0, 1), (tr.acqua ?? 0) / 9);
  A["t-secchio"] = { display: vis(v.secchio > 0.5 || (tr.acqua ?? 0) > 0) };
  A["t-acqua"] = {
    transform: scala(POSTI_SCENA.secchio, 258, 1, lim(acqua, 0.02, 1)),
  };

  // Gli oggetti di scena delle attività.
  A["t-cespuglio"] = {
    display: vis(v.cespuglio > 0.01),
    transform: scala(POSTI_SCENA.cespuglio, 262, lim(v.cespuglio, 0, 1)),
  };
  A["t-tinozza"] = {
    display: vis(v.tinozza > 0.01),
    transform: scala(POSTI_SCENA.tinozza, 262, lim(v.tinozza, 0, 1)),
  };
  A["t-filo"] = {
    display: vis(v.filo > 0.01),
    transform: scala(POSTI_SCENA.filo, 262, 1, lim(v.filo, 0, 1)),
  };
  A["t-panni"] = {
    transform: `rotate(${n2(3 * Math.sin(t * 2.2))} ${POSTI_SCENA.filo} 172)`,
  };
  A["t-pozza"] = {
    display: vis(v.pozza > 0.01),
    transform: scala(POSTI_SCENA.pozza, 262, lim(v.pozza, 0, 1.3), 1),
  };
  const u = lim(v.uccello, 0, 1);
  A["t-uccello"] = {
    display: vis(u > 0.01),
    transform: `translate(${n2(v.uccelloX)} ${n2(v.uccelloY)}) scale(${n2(Math.max(0.01, u) * 1.6)})`,
  };
  A["t-ali"] = {
    transform: `scale(1 ${n2(0.4 + 0.6 * Math.abs(Math.sin(t * 14)))})`,
  };
  const st = lim(v.costellazione, 0, 1);
  A["t-stelle"] = {
    display: vis(st > 0.01),
    opacity: `${n2(Math.min(1, st * 3))}`,
  };
  A["t-linea"] = { "stroke-dashoffset": `${n2(160 * (1 - st))}` };

  // Lo scoiattolo delle attività (quello dei mestieri lo disegna arredi.tsx).
  if (!s.scoiattoloDelMestiere) {
    const sv = lim(v.scoiattolo, 0, 1);
    A["t-scoiattolo"] = {
      display: vis(sv > 0.01),
      transform: `translate(${n2(v.scoiattoloX)} ${n2(-v.scoiattoloSu)}) translate(0 262) scale(${n2(Math.max(0.01, sv))}) translate(0 -262)`,
    };
  }
}

// ——— I disegni ———

/** Un posto del prato: si sposta e si rimpicciolisce insieme al suo disegno quando il prato è stretto. */
function Posto({
  nome,
  at,
  children,
}: {
  nome: NomePosto;
  at: (k: string) => Record<string, string>;
  children: ReactNode;
}) {
  return (
    <g data-n={`t-p-${nome}`} {...at(`t-p-${nome}`)}>
      {children}
    </g>
  );
}

function Catasta({ at }: { at: (k: string) => Record<string, string> }) {
  const x = POSTI_SCENA.catasta;
  const tronchi: [number, number][] = [
    [-12, 256],
    [0, 256],
    [12, 256],
    [-6, 248],
    [6, 248],
    [0, 240],
  ];
  return (
    <g data-zona="oggetto" data-oggetto="catasta">
      {tronchi.map(([dx, y], i) => (
        <g key={i} data-n={`t-legna${i}`} display="none" {...at(`t-legna${i}`)}>
          <rect
            x={x + dx - 10}
            y={y - 4}
            width={20}
            height={8}
            rx={4}
            fill={LEGNO}
            stroke={LEGNO_SCURO}
            strokeWidth={1.2}
          />
          <circle
            cx={x + dx + 10}
            cy={y}
            r={3.6}
            fill="#d8b384"
            stroke={LEGNO_SCURO}
            strokeWidth={1}
          />
        </g>
      ))}
    </g>
  );
}

function Falo({ at }: { at: (k: string) => Record<string, string> }) {
  const x = POSTI_SCENA.falo;
  return (
    <g
      data-n="t-falo"
      display="none"
      {...at("t-falo")}
      data-zona="oggetto"
      data-oggetto="falo"
    >
      <ellipse cx={x} cy={258} rx={22} ry={6} fill="#5a4636" opacity={0.5} />
      <g data-n="t-braci" opacity={0} {...at("t-braci")}>
        <ellipse cx={x} cy={256} rx={13} ry={4} fill="#e8582c" />
        <ellipse cx={x - 3} cy={255} rx={5} ry={2} fill="#ffc04a" />
      </g>
      <path
        d={`M${x - 12},258 L${x + 10},250 M${x - 10},250 L${x + 12},258`}
        stroke={LEGNO_SCURO}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <g data-n="t-fiamme" display="none" {...at("t-fiamme")}>
        {[0, 1, 2].map((i) => (
          <g key={i} data-n={`t-fiamma${i}`} {...at(`t-fiamma${i}`)}>
            <path
              d={
                i === 1
                  ? "M0,0 C-9,-8 -5,-20 0,-30 C5,-20 9,-8 0,0Z"
                  : "M0,0 C-6,-6 -4,-14 0,-21 C4,-14 6,-6 0,0Z"
              }
              fill="#f08a24"
            />
            <path
              d={
                i === 1
                  ? "M0,0 C-5,-5 -3,-12 0,-18 C3,-12 5,-5 0,0Z"
                  : "M0,0 C-3,-4 -2,-8 0,-12 C2,-8 3,-4 0,0Z"
              }
              fill="#ffd25c"
            />
          </g>
        ))}
      </g>
      {[-20, -12, 0, 12, 20].map((dx, i) => (
        <ellipse
          key={i}
          cx={x + dx}
          cy={259 + (i % 2)}
          rx={5.5}
          ry={4}
          fill={SASSO}
          stroke={SASSO_SCURO}
          strokeWidth={1}
        />
      ))}
      <g data-n="t-pentola" display="none" {...at("t-pentola")}>
        <path
          d={`M${x - 15},224 L${x + 15},224 L${x + 12},242 Q${x},247 ${x - 12},242 Z`}
          fill="#4a4d52"
          stroke={INCHIOSTRO}
          strokeWidth={1.4}
        />
        <ellipse
          cx={x}
          cy={224}
          rx={15}
          ry={3.5}
          fill="#c45b3c"
          stroke={INCHIOSTRO}
          strokeWidth={1.2}
        />
        <path
          d={`M${x - 15},226 q-5,0 -5,4 M${x + 15},226 q5,0 5,4`}
          stroke={INCHIOSTRO}
          strokeWidth={1.6}
          fill="none"
        />
      </g>
    </g>
  );
}

function Mucchio({ at }: { at: (k: string) => Record<string, string> }) {
  const x = POSTI_SCENA.mucchio;
  const foglie: [number, number, string][] = [
    [-16, 256, "#c9822f"],
    [-6, 252, "#d9a23a"],
    [6, 254, "#b5582c"],
    [16, 257, "#d9a23a"],
    [-10, 244, "#b5582c"],
    [4, 242, "#c9822f"],
    [-2, 234, "#d9a23a"],
  ];
  return (
    <g
      data-n="t-mucchio"
      display="none"
      {...at("t-mucchio")}
      data-zona="oggetto"
      data-oggetto="mucchio"
    >
      <path
        d={`M${x - 26},262 Q${x - 18},236 ${x},230 Q${x + 18},236 ${x + 26},262 Z`}
        fill="#c9822f"
        stroke="#8a5424"
        strokeWidth={1.4}
      />
      {foglie.map(([dx, y, c], i) => (
        <ellipse
          key={i}
          cx={x + dx}
          cy={y}
          rx={6}
          ry={3.4}
          fill={c}
          transform={`rotate(${((i * 47) % 60) - 30} ${x + dx} ${y})`}
        />
      ))}
    </g>
  );
}

function Orto({ at }: { at: (k: string) => Record<string, string> }) {
  const x = POSTI_SCENA.orto;
  return (
    <g
      data-n="t-orto"
      display="none"
      {...at("t-orto")}
      data-zona="oggetto"
      data-oggetto="orto"
    >
      <g data-n="t-aiuola" {...at("t-aiuola")}>
        <path
          d={`M${x - 34},262 Q${x},247 ${x + 34},262 Z`}
          fill={TERRA_ORTO}
          stroke="#5a3d24"
          strokeWidth={1.4}
        />
        <path
          d={`M${x - 24},258 q12,-4 24,0 M${x},257 q12,-4 22,1`}
          stroke="#5a3d24"
          strokeWidth={1.2}
          fill="none"
        />
      </g>
      <g data-n="t-semi" display="none" {...at("t-semi")}>
        {[-20, -8, 4, 16].map((dx) => (
          <circle key={dx} cx={x + dx} cy={255} r={1.5} fill="#e8d6a0" />
        ))}
      </g>
      <g data-n="t-germogli" display="none" {...at("t-germogli")}>
        {[-20, -8, 4, 16].map((dx) => (
          <g key={dx}>
            <path
              d={`M${x + dx},255 L${x + dx},244`}
              stroke={VERDE}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <ellipse
              cx={x + dx - 4}
              cy={244}
              rx={4.5}
              ry={2.4}
              fill={VERDE}
              transform={`rotate(-25 ${x + dx - 4} 244)`}
            />
            <ellipse
              cx={x + dx + 4}
              cy={243}
              rx={4.5}
              ry={2.4}
              fill="#7aa548"
              transform={`rotate(25 ${x + dx + 4} 243)`}
            />
          </g>
        ))}
      </g>
      <g data-n="t-verdure" display="none" {...at("t-verdure")}>
        {[-20, -8, 4, 16].map((dx, i) =>
          i % 2 ? (
            <circle
              key={dx}
              cx={x + dx}
              cy={244}
              r={7}
              fill="#7fb24a"
              stroke="#4f7f2e"
              strokeWidth={1.2}
            />
          ) : (
            <g key={dx}>
              <path
                d={`M${x + dx - 4},236 l4,10 l4,-10`}
                stroke={VERDE}
                strokeWidth={2.4}
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={`M${x + dx - 4},248 L${x + dx + 4},248 L${x + dx},256 Z`}
                fill="#e8822c"
              />
            </g>
          ),
        )}
      </g>
    </g>
  );
}

function Mensola({ at }: { at: (k: string) => Record<string, string> }) {
  const x = POSTI_SCENA.mensola;
  return (
    <g
      data-n="t-mensola"
      display="none"
      {...at("t-mensola")}
      data-zona="oggetto"
      data-oggetto="vasetti"
    >
      <rect
        x={x - 32}
        y={250}
        width={64}
        height={12}
        rx={5}
        fill={SASSO}
        stroke={SASSO_SCURO}
        strokeWidth={1.2}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const vx =
          x - 25 + (i % 3) * 25 + (i >= 3 ? 12 : 0) - (i >= 3 ? 12 : 0);
        const vy = i >= 3 ? 230 : 250;
        return (
          <g
            key={i}
            data-n={`t-vasetto${i}`}
            display="none"
            {...at(`t-vasetto${i}`)}
          >
            <rect
              x={vx - 7}
              y={vy - 16}
              width={14}
              height={16}
              rx={3}
              fill={BACCA}
              stroke={INCHIOSTRO}
              strokeWidth={1.2}
            />
            <rect
              x={vx - 8}
              y={vy - 19}
              width={16}
              height={5}
              rx={1.5}
              fill="#e9dcc0"
              stroke={INCHIOSTRO}
              strokeWidth={1}
            />
            <rect
              x={vx - 5}
              y={vy - 11}
              width={10}
              height={6}
              rx={1}
              fill="#fffaf0"
            />
          </g>
        );
      })}
    </g>
  );
}

function Scorte({ at }: { at: (k: string) => Record<string, string> }) {
  return (
    <g>
      {/* Sassi belli */}
      <Posto nome="sassi" at={at}>
        {[0, 1, 2, 3].map((i) => (
          <ellipse
            key={i}
            data-n={`t-sasso${i}`}
            display="none"
            {...at(`t-sasso${i}`)}
            cx={POSTI_SCENA.sassi + [-8, 6, -1, 10][i]}
            cy={[258, 258, 251, 252][i]}
            rx={6}
            ry={4.2}
            fill={["#a7a49b", "#c3b8a4", "#8f8b82", "#b8b2a6"][i]}
            stroke={SASSO_SCURO}
            strokeWidth={1}
          />
        ))}
      </Posto>
      {/* Ghiande */}
      <Posto nome="ghiande" at={at}>
        {[0, 1, 2, 3].map((i) => (
          <g
            key={i}
            data-n={`t-ghianda${i}`}
            display="none"
            {...at(`t-ghianda${i}`)}
          >
            <ellipse
              cx={POSTI_SCENA.ghiande + [-6, 4, -1, 9][i]}
              cy={[258, 258, 252, 253][i]}
              rx={3.6}
              ry={4.4}
              fill="#c08a3a"
            />
            <path
              d={`M${POSTI_SCENA.ghiande + [-6, 4, -1, 9][i] - 4},${[255, 255, 249, 250][i]} q4,-5 8,0 Z`}
              fill="#6b4a2b"
            />
          </g>
        ))}
      </Posto>
      {/* Cesto di bacche */}
      <Posto nome="cesto" at={at}>
        <g
          data-n="t-cesto"
          display="none"
          {...at("t-cesto")}
          data-zona="oggetto"
          data-oggetto="cesto"
        >
          <path
            d={`M${POSTI_SCENA.cesto - 13},248 L${POSTI_SCENA.cesto + 13},248 L${POSTI_SCENA.cesto + 10},262 L${POSTI_SCENA.cesto - 10},262 Z`}
            fill="#c99a62"
            stroke={LEGNO_SCURO}
            strokeWidth={1.2}
          />
          {[-7, -1, 5, -4, 2].map((dx, i) => (
            <circle
              key={i}
              cx={POSTI_SCENA.cesto + dx}
              cy={i < 3 ? 246 : 242}
              r={3}
              fill={BACCA}
            />
          ))}
        </g>
      </Posto>
      {/* Verdure raccolte */}
      <Posto nome="raccolto" at={at}>
        <g data-n="t-raccolto" display="none" {...at("t-raccolto")}>
          <path
            d={`M${POSTI_SCENA.raccolto - 10},258 L${POSTI_SCENA.raccolto + 6},252 L${POSTI_SCENA.raccolto + 8},256 Z`}
            fill="#e8822c"
          />
          <circle
            cx={POSTI_SCENA.raccolto + 10}
            cy={256}
            r={6}
            fill="#7fb24a"
            stroke="#4f7f2e"
            strokeWidth={1}
          />
        </g>
      </Posto>
      {/* La ciotola del succo di bacche */}
      <Posto nome="ciotola" at={at}>
        <g data-n="t-ciotola" display="none" {...at("t-ciotola")}>
          <path
            d={`M${POSTI_SCENA.ciotola - 13},250 Q${POSTI_SCENA.ciotola},266 ${POSTI_SCENA.ciotola + 13},250 Z`}
            fill="#c9b48a"
            stroke={LEGNO_SCURO}
            strokeWidth={1.2}
          />
          <ellipse
            data-n="t-succo"
            display="none"
            {...at("t-succo")}
            cx={POSTI_SCENA.ciotola}
            cy={251}
            rx={11}
            ry={2.4}
            fill={BACCA}
          />
        </g>
      </Posto>
      {/* Il secchio dell'acqua */}
      <Posto nome="secchio" at={at}>
        <g
          data-n="t-secchio"
          display="none"
          {...at("t-secchio")}
          data-zona="oggetto"
          data-oggetto="secchio"
        >
          <path
            d={`M${POSTI_SCENA.secchio - 11},240 L${POSTI_SCENA.secchio + 11},240 L${POSTI_SCENA.secchio + 8},262 L${POSTI_SCENA.secchio - 8},262 Z`}
            fill="#8a9aa8"
            stroke="#56636e"
            strokeWidth={1.2}
          />
          <rect
            data-n="t-acqua"
            {...at("t-acqua")}
            x={POSTI_SCENA.secchio - 8}
            y={244}
            width={16}
            height={14}
            fill="#7fb3c8"
            opacity={0.85}
          />
          <path
            d={`M${POSTI_SCENA.secchio - 11},240 Q${POSTI_SCENA.secchio},226 ${POSTI_SCENA.secchio + 11},240`}
            stroke="#56636e"
            strokeWidth={1.4}
            fill="none"
          />
        </g>
      </Posto>
    </g>
  );
}

function Cespuglio({ at }: { at: (k: string) => Record<string, string> }) {
  const x = POSTI_SCENA.cespuglio;
  return (
    <g data-n="t-cespuglio" display="none" {...at("t-cespuglio")}>
      <circle cx={x - 14} cy={246} r={16} fill="#4f7f2e" />
      <circle cx={x + 10} cy={244} r={18} fill="#5f8f35" />
      <circle cx={x} cy={230} r={15} fill="#6f9a3c" />
      {[
        [-18, 242],
        [-6, 228],
        [8, 236],
        [18, 248],
        [-2, 250],
        [12, 224],
      ].map(([dx, y], i) => (
        <circle
          key={i}
          cx={x + dx}
          cy={y}
          r={3.2}
          fill={BACCA}
          stroke="#5e2148"
          strokeWidth={0.6}
        />
      ))}
    </g>
  );
}

function Filo({ at }: { at: (k: string) => Record<string, string> }) {
  const x = POSTI_SCENA.filo;
  return (
    <g data-n="t-filo" display="none" {...at("t-filo")}>
      <path
        d={`M${x - 38},262 L${x - 38},166 M${x + 38},262 L${x + 38},166`}
        stroke={LEGNO_SCURO}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <path
        d={`M${x - 38},170 Q${x},178 ${x + 38},170`}
        stroke="#e9dcc0"
        strokeWidth={1.4}
        fill="none"
      />
      <g data-n="t-panni" {...at("t-panni")}>
        <path
          d={`M${x - 26},173 L${x - 10},175 L${x - 12},196 L${x - 24},194 Z`}
          fill="#c94c4c"
          stroke={INCHIOSTRO}
          strokeWidth={1}
        />
        <path
          d={`M${x - 4},176 L${x + 14},176 L${x + 16},190 Q${x + 5},186 ${x - 6},190 Z`}
          fill="#e0a526"
          stroke={INCHIOSTRO}
          strokeWidth={1}
        />
        <path
          d={`M${x + 20},174 L${x + 30},172 L${x + 30},188 L${x + 20},190 Z`}
          fill="#4a7fb0"
          stroke={INCHIOSTRO}
          strokeWidth={1}
        />
      </g>
    </g>
  );
}

function Pozza({ at }: { at: (k: string) => Record<string, string> }) {
  const x = POSTI_SCENA.pozza;
  return (
    <g data-n="t-pozza" display="none" {...at("t-pozza")}>
      <ellipse
        cx={x}
        cy={260}
        rx={34}
        ry={6}
        fill="#7fb3c8"
        opacity={0.8}
        stroke="#5c8fa3"
        strokeWidth={1}
      />
      <ellipse
        cx={x - 8}
        cy={259}
        rx={10}
        ry={1.6}
        fill="#ffffff"
        opacity={0.5}
      />
    </g>
  );
}

function Uccello({ at }: { at: (k: string) => Record<string, string> }) {
  return (
    <g data-n="t-uccello" display="none" {...at("t-uccello")}>
      <ellipse
        cx={0}
        cy={0}
        rx={8}
        ry={6}
        fill="#5b7fb0"
        stroke={INCHIOSTRO}
        strokeWidth={1}
      />
      <circle
        cx={6}
        cy={-5}
        r={4.5}
        fill="#5b7fb0"
        stroke={INCHIOSTRO}
        strokeWidth={1}
      />
      <circle cx={7.5} cy={-6} r={1} fill={INCHIOSTRO} />
      <path d="M10.5,-5 l4,1 l-4,1.4 Z" fill="#e0a526" />
      <path d="M-8,0 l-6,-3 l1,5 Z" fill="#41608a" />
      <g data-n="t-ali" {...at("t-ali")}>
        <path d="M-2,-2 Q-6,-14 4,-10 Z" fill="#41608a" />
      </g>
    </g>
  );
}

function Stelle({ at }: { at: (k: string) => Record<string, string> }) {
  const punti: [number, number][] = [
    [40, -6],
    [70, -24],
    [104, -14],
    [132, -32],
    [168, -18],
  ];
  return (
    <g data-n="t-stelle" display="none" {...at("t-stelle")}>
      <path
        data-n="t-linea"
        {...at("t-linea")}
        d={`M${punti.map(([x, y]) => `${x},${y}`).join(" L")}`}
        stroke="#f6e7a8"
        strokeWidth={1.4}
        fill="none"
        strokeDasharray="160"
        strokeDashoffset={160}
      />
      {punti.map(([x, y], i) => (
        <path
          key={i}
          d={`M${x},${y - 5} L${x + 1.3},${y - 1.3} L${x + 5},${y} L${x + 1.3},${y + 1.3} L${x},${y + 5} L${x - 1.3},${y + 1.3} L${x - 5},${y} L${x - 1.3},${y - 1.3}Z`}
          fill="#f6e7a8"
        />
      ))}
    </g>
  );
}

function Tinozza({ at }: { at: (k: string) => Record<string, string> }) {
  const x = POSTI_SCENA.tinozza;
  return (
    <g data-n="t-tinozza" display="none" {...at("t-tinozza")}>
      <path
        d={`M${x - 24},238 L${x + 24},238 L${x + 19},262 L${x - 19},262 Z`}
        fill="#b07a45"
        stroke={CONTORNO}
        strokeWidth={1.6}
      />
      <path
        d={`M${x - 22},246 H${x + 22} M${x - 20},254 H${x + 20}`}
        stroke="#8a5a2b"
        strokeWidth={1.2}
      />
      <ellipse
        cx={x}
        cy={238}
        rx={24}
        ry={4}
        fill="#cfe3ee"
        stroke={CONTORNO}
        strokeWidth={1.2}
      />
      {[-12, 0, 10].map((dx) => (
        <circle
          key={dx}
          cx={x + dx}
          cy={234}
          r={3.4}
          fill="#ffffff"
          stroke="#cfe3ee"
          strokeWidth={0.8}
        />
      ))}
    </g>
  );
}

function Scoiattolino({ at }: { at: (k: string) => Record<string, string> }) {
  return (
    <g data-n="t-scoiattolo" display="none" {...at("t-scoiattolo")}>
      <path
        d="M8,258 C28,256 32,228 18,214 C10,206 -2,212 6,224 C12,234 12,246 2,252 Z"
        fill="#c5763a"
      />
      <ellipse cx={-8} cy={250} rx={10} ry={12} fill="#b5652b" />
      <circle cx={-13} cy={235} r={7.5} fill="#b5652b" />
      <path d="M-17,229 l-2,-8 l6,5 Z" fill="#b5652b" />
      <circle cx={-16} cy={234} r={1.5} fill={INCHIOSTRO} />
      <ellipse cx={-11} cy={253} rx={5.5} ry={3.5} fill="#e8c9a0" />
    </g>
  );
}

/** Le tracce dietro all'albero (quasi tutto: sono per terra o sullo sfondo). */
export function TracceDietro({
  scena,
  A,
  scoiattolo,
}: {
  scena: StatoScena;
  A: Attributi;
  scoiattolo: boolean;
}) {
  const at = (k: string) => attr(A, k);
  void scena;
  return (
    <g className="lv-tracce">
      <Stelle at={at} />
      <Posto nome="filo" at={at}>
        <Filo at={at} />
      </Posto>
      <Posto nome="cespuglio" at={at}>
        <Cespuglio at={at} />
      </Posto>
      <Posto nome="mucchio" at={at}>
        <Mucchio at={at} />
      </Posto>
      <Scorte at={at} />
      <Posto nome="catasta" at={at}>
        <Catasta at={at} />
      </Posto>
      <Posto nome="falo" at={at}>
        <Falo at={at} />
      </Posto>
      <Posto nome="pozza" at={at}>
        <Pozza at={at} />
      </Posto>
      <Posto nome="orto" at={at}>
        <Orto at={at} />
      </Posto>
      <Posto nome="mensola" at={at}>
        <Mensola at={at} />
      </Posto>
      {scoiattolo && <Scoiattolino at={at} />}
      <Uccello at={at} />
    </g>
  );
}

/** Le tracce davanti all'albero: la tinozza (l'albero ci sta dietro). */
export function TracceDavanti({ A }: { A: Attributi }) {
  const at = (k: string) => attr(A, k);
  return (
    <g className="lv-tracce">
      <Posto nome="tinozza" at={at}>
        <Tinozza at={at} />
      </Posto>
    </g>
  );
}

// ——— Gli attrezzi delle attività quotidiane (centrati sulla mano) ———

export function AttrezzoQuotidiano({ a }: { a: Attrezzo }): ReactNode {
  switch (a) {
    case "rastrello":
      return (
        <g>
          <path
            d="M0,6 L0,-34"
            stroke={LEGNO_SCURO}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <path
            d="M-10,8 H10 M-9,8 v6 M-3,8 v6 M3,8 v6 M9,8 v6"
            stroke="#7d828a"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </g>
      );
    case "scopa":
      return (
        <g>
          <path
            d="M0,6 L0,-34"
            stroke={LEGNO_SCURO}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <path
            d="M-7,6 L7,6 L11,22 L-11,22 Z"
            fill="#e0b85a"
            stroke="#a8761a"
            strokeWidth={1}
          />
          <path
            d="M-4,10 L-6,21 M0,10 V21 M4,10 L6,21"
            stroke="#a8761a"
            strokeWidth={0.8}
          />
        </g>
      );
    case "zappa":
      return (
        <g>
          <path
            d="M0,6 L0,-34"
            stroke={LEGNO_SCURO}
            strokeWidth={2.8}
            strokeLinecap="round"
          />
          <path
            d="M-2,4 L12,6 L12,13 L-2,10 Z"
            fill="#8a8f96"
            stroke="#5a5a52"
            strokeWidth={1}
          />
        </g>
      );
    case "secchio":
      return (
        <g>
          <path
            d="M-7,-6 Q0,-16 7,-6"
            stroke="#56636e"
            strokeWidth={1.4}
            fill="none"
          />
          <path
            d="M-9,-6 L9,-6 L7,12 L-7,12 Z"
            fill="#8a9aa8"
            stroke="#56636e"
            strokeWidth={1.2}
          />
          <rect x={-7} y={-3} width={14} height={4} fill="#7fb3c8" />
        </g>
      );
    case "cesto":
      return (
        <g>
          <path
            d="M-8,-4 Q0,-16 8,-4"
            stroke={LEGNO_SCURO}
            strokeWidth={1.4}
            fill="none"
          />
          <path
            d="M-10,-4 L10,-4 L7,10 L-7,10 Z"
            fill="#c99a62"
            stroke={LEGNO_SCURO}
            strokeWidth={1.2}
          />
          <circle cx={-4} cy={-5} r={2.6} fill={BACCA} />
          <circle cx={2} cy={-6} r={2.6} fill={BACCA} />
        </g>
      );
    case "bastoncini":
      return (
        <path
          d="M-10,4 L8,-10 M-8,8 L10,-4"
          stroke={LEGNO_SCURO}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      );
    case "spiedo":
      return (
        <g>
          <path
            d="M0,4 L-24,-18"
            stroke={LEGNO_SCURO}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle
            cx={-24}
            cy={-18}
            r={4.2}
            fill="#7a4a2a"
            stroke="#4d2c18"
            strokeWidth={1}
          />
        </g>
      );
    case "mestolo":
      return (
        <g>
          <path
            d="M0,4 L0,24"
            stroke={LEGNO}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <ellipse
            cx={0}
            cy={27}
            rx={4.5}
            ry={3.4}
            fill={LEGNO}
            stroke={LEGNO_SCURO}
            strokeWidth={1}
          />
        </g>
      );
    case "sacchetto":
      return (
        <g>
          <path
            d="M-7,-2 Q-9,12 0,12 Q9,12 7,-2 Z"
            fill="#d8c08a"
            stroke="#8a6a3a"
            strokeWidth={1.2}
          />
          <path d="M-5,-2 L5,-2" stroke="#8a6a3a" strokeWidth={1.6} />
        </g>
      );
    case "vasetto":
      return (
        <g>
          <rect
            x={-6}
            y={-6}
            width={12}
            height={14}
            rx={3}
            fill={BACCA}
            stroke={INCHIOSTRO}
            strokeWidth={1.1}
          />
          <rect
            x={-7}
            y={-9}
            width={14}
            height={4}
            rx={1.4}
            fill="#e9dcc0"
            stroke={INCHIOSTRO}
            strokeWidth={0.9}
          />
        </g>
      );
    case "annaffiatoio":
      return disegnaOggetto("annaffiatoio");
    case "anello":
      return (
        <g>
          <path
            d="M0,6 L0,-14"
            stroke="#c94c4c"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle
            cx={0}
            cy={-20}
            r={6}
            fill="#dff0f7"
            fillOpacity={0.5}
            stroke="#c94c4c"
            strokeWidth={1.8}
          />
        </g>
      );
    case "sasso":
      return (
        <ellipse
          cx={0}
          cy={-2}
          rx={5.5}
          ry={4}
          fill="#c3b8a4"
          stroke={SASSO_SCURO}
          strokeWidth={1}
        />
      );
    case "carota":
      return (
        <g>
          <path d="M-4,-2 L4,-2 L0,14 Z" fill="#e8822c" />
          <path
            d="M-3,-2 l-3,-8 M0,-2 v-9 M3,-2 l3,-8"
            stroke={VERDE}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      );
    case "corda":
      return (
        <path
          d="M-14,0 q3.5,-4 7,0 t7,0 t7,0 t7,0"
          stroke="#b8a46a"
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
      );
    default:
      return null;
  }
}
