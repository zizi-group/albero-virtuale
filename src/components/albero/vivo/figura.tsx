import type { ReactNode, Ref } from "react";
import { crescitaDa, type Oggetto, type Posa, type Stadio, type Stagione } from "@/lib/albero/tipi";
import { canaliDaPosa, DOVE, figuraDaPosa, TERRA } from "./canali";
import {
  Bandana,
  Basco,
  BerrettoNotte,
  Cappello,
  CARTA,
  CHIOMA,
  CONTORNO,
  CORTECCIA,
  CORTECCIA_SCURA,
  Cravatta,
  disegnaOggetto,
  Fascia,
  INCHIOSTRO,
  OcchialiSole,
  OcchialiTondi,
  PALETTE,
  PERNI,
  PERNI_OGGETTI,
  Piuma,
  SCALA,
  SCHIUMA,
  SciarpaCoda,
  SciarpaNodo,
  Zaino,
} from "./disegni";
import { fotogramma, statoIniziale, type Attributi } from "./fotogramma";

// Il disegno del personaggio in un fotogramma: solo SVG, senza hook né browser.
// Lo usa AlberoVivo (che poi lo anima nel browser) e lo usa il server per le
// immagini fisse, come la cartolina del mese (src/components/albero/fermo.ts).

const MAX_CARATTERI = 26;

/** Il primo fotogramma di una posa: gli attributi SVG e gli accessori presenti. */
export function primoFotogramma(posa: Posa): { A: Attributi; presenti: Set<string> } {
  return {
    A: fotogramma(canaliDaPosa(posa), figuraDaPosa(posa), statoIniziale()) as Attributi,
    presenti: new Set<string>([...posa.indossa, ...posa.oggetti.map((o) => `ogg-${o}`)]),
  };
}

function aCapo(testo: string): string[] {
  const righe: string[] = [];
  let riga = "";
  for (const parola of testo.split(/\s+/)) {
    if (riga && (riga + " " + parola).length > MAX_CARATTERI) {
      righe.push(riga);
      riga = parola;
    } else riga = riga ? `${riga} ${parola}` : parola;
  }
  if (riga) righe.push(riga);
  return righe;
}

function presenza(chiave: string, perno: [number, number] | undefined, presenti: Set<string>, figli: ReactNode, extra: Record<string, string> = {}) {
  const [px, py] = perno ?? [120, 160];
  return (
    <g key={chiave} data-p={chiave} data-perno={`${px},${py}`} transform={presenti.has(chiave) ? undefined : "scale(0)"} {...extra}>
      {figli}
    </g>
  );
}

export interface FiguraAlberoProps {
  posa: Posa;
  stadio: Stadio;
  stagione: Stagione;
  innevato: boolean;
  /** Gli attributi SVG del fotogramma da disegnare. */
  A: Attributi;
  /** Accessori e oggetti visibili (gli altri restano a scala 0, pronti a comparire). */
  presenti: Set<string>;
  /** Prefisso unico per i clipPath. */
  id: string;
  interattivo: boolean;
  focusabile: boolean;
  nome: string;
  fumetto?: string | null;
  radice?: Ref<SVGGElement>;
  /** Quante particelle preparare (le muove il motore nel browser). */
  nParticelle?: number;
  /**
   * L'età in giorni: se c'è, la grandezza segue la crescita continua
   * (crescitaDa, da germoglio ad adulto); se manca, quella tipica dello stadio.
   */
  giorni?: number;
  /** Arredi del mestiere dietro all'albero (vivo/arredi.tsx). */
  dietro?: ReactNode;
  /** Arredi davanti all'albero e attrezzi in mano. */
  davanti?: ReactNode;
}

/** Grandezza, chioma e dettagli dell'età: la crescita continua o, senza età, lo stadio. */
export function misureDellEta(stadio: Stadio, giorni?: number) {
  if (giorni === undefined) {
    return { scala: SCALA[stadio], chioma: 1, germoglio: stadio === "piantina", ghiande: stadio === "albero", fumetto: 1 };
  }
  const c = crescitaDa(giorni);
  const scala = 0.42 + 0.58 * c;
  return {
    scala,
    // Da piccolo la chioma è un ciuffo: cresce più del resto.
    chioma: 0.6 + 0.4 * c,
    germoglio: c < 0.3,
    ghiande: c >= 0.75,
    // La nuvoletta resta leggibile anche quando l'albero è piccolo.
    fumetto: 1 / scala,
  };
}

export function FiguraAlbero({
  posa,
  stadio,
  stagione,
  innevato,
  A,
  presenti,
  id,
  interattivo,
  focusabile,
  nome,
  fumetto = null,
  radice,
  nParticelle = 0,
  giorni,
  dietro = null,
  davanti = null,
}: FiguraAlberoProps) {
  const [scuro, medio, chiaro] = PALETTE[stagione];
  const at = (k: string) => A[k] ?? {};
  const pres = presenti;
  const ha = (i: string) => posa.indossa.includes(i as never);
  const oggetti = (dove: (typeof DOVE)[Oggetto]) => posa.oggetti.filter((o) => DOVE[o] === dove);
  const zonaOggetto = (o: Oggetto) => ({ "data-zona": "oggetto", "data-oggetto": o });
  const eta = misureDellEta(stadio, giorni);
  const s = eta.scala;
  const k = eta.chioma;
  const righe = fumetto ? aCapo(fumetto) : [];

  return (
    <g
      ref={radice}
      transform={`translate(120 ${TERRA}) scale(${s}) translate(-120 -${TERRA})`}
      className={interattivo ? "lv-radice lv-interattivo" : "lv-radice"}
      tabIndex={interattivo && focusabile ? 0 : undefined}
      role={interattivo && focusabile ? "button" : undefined}
      aria-label={interattivo && focusabile ? `${nome}. Premi Invio per salutarlo; trascinalo per spostarlo.` : undefined}
    >
      <defs>
        <clipPath id={`${id}-osx`}>
          <ellipse cx={110} cy={164} rx={5.5} ry={6.5} />
        </clipPath>
        <clipPath id={`${id}-odx`}>
          <ellipse cx={130} cy={164} rx={5.5} ry={6.5} />
        </clipPath>
        <clipPath id={`${id}-bocca`}>
          <path data-n="boccaClip" {...at("boccaClip")} />
        </clipPath>
      </defs>

      <ellipse data-n="ombra" cx={0} cy={0} rx={52} ry={7} fill="#000" {...at("ombra")} />
      {/* Anello del fuoco: invisibile di serie (anche senza CSS), compare solo con la tastiera */}
      {interattivo && focusabile && (
        <ellipse data-n="anello" className="lv-anello" opacity={0} cx={120} cy={146} rx={88} ry={128} fill="none" stroke={INCHIOSTRO} strokeWidth={2.5} strokeDasharray="6 7" {...at("anello")} />
      )}

      {oggetti("terra").map((o) => presenza(`ogg-${o}`, PERNI_OGGETTI[o], pres, disegnaOggetto(o), zonaOggetto(o)))}

      {dietro}

      <g data-n="corpo" data-zona="corpo" {...at("corpo")}>
        {/* Gambe-radici */}
        <g data-n="gambe" {...at("gambe")}>
          {(["Sx", "Dx"] as const).map((L) => (
            <g key={L}>
              <path data-n={`gamba${L}`} stroke={CORTECCIA_SCURA} strokeWidth={11} strokeLinecap="round" fill="none" {...at(`gamba${L}`)} />
              <g data-n={`piede${L}`} {...at(`piede${L}`)}>
                <g data-n={`radici${L}`} {...at(`radici${L}`)}>
                  <path d="M-7,2 q-4,8 -2,15 M0,4 q2,8 -2,16 M7,2 q5,7 2,14 M-3,10 l-5,4 M3,12 l5,3" stroke={CORTECCIA_SCURA} strokeWidth={2.2} strokeLinecap="round" fill="none" />
                </g>
                <ellipse cx={0} cy={0} rx={12} ry={6} fill={CORTECCIA_SCURA} />
              </g>
            </g>
          ))}
        </g>
        <g data-n="incrociate" stroke={CORTECCIA_SCURA} strokeWidth={10} strokeLinecap="round" fill="none" {...at("incrociate")}>
          <path d="M100,242 Q120,256 144,246" />
          <path d="M140,242 Q120,256 96,246" />
          <ellipse cx={92} cy={247} rx={8} ry={5} fill={CORTECCIA_SCURA} stroke="none" />
          <ellipse cx={148} cy={247} rx={8} ry={5} fill={CORTECCIA_SCURA} stroke="none" />
        </g>

        <g data-n="busto" {...at("busto")}>
          {ha("zaino") && presenza("zaino", PERNI.zaino, pres, <Zaino />)}

          {/* Tronco */}
          <path d="M94,116 C90,158 88,198 97,220 Q120,228 143,220 C152,198 150,158 146,116 Z" fill={CORTECCIA} stroke={CONTORNO} strokeWidth={2.5} />
          <g stroke={CORTECCIA_SCURA} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.55}>
            <path d="M105,206 q4,-8 2,-16" />
            <path d="M136,210 q-4,-6 -2,-14" />
            <path d="M120,214 q2,-5 0,-9" />
          </g>
          <ellipse cx={131} cy={204} rx={3.5} ry={4.5} fill={CORTECCIA_SCURA} opacity={0.7} />
          <ellipse cx={120} cy={176} rx={46} ry={58} fill="transparent" />

          {/* Chioma */}
          <g data-n="chioma" data-zona="chioma" {...at("chioma")}>
            {/* La chioma cresce intorno al punto dove poggia sul tronco (lo stesso perno del motore) */}
            <g transform={k === 1 ? undefined : `translate(120 132) scale(${k.toFixed(3)}) translate(-120 -132)`}>
              <circle cx={120} cy={66} r={86} fill="transparent" />
              {CHIOMA.map(([cx, cy, r], i) => (
                <circle key={`o${i}`} cx={cx + 3} cy={cy + 5} r={r} fill={scuro} />
              ))}
              {CHIOMA.map(([cx, cy, r], i) => (
                <circle key={`m${i}`} cx={cx} cy={cy} r={r} fill={medio} />
              ))}
              {CHIOMA.slice(0, 6).map(([cx, cy, r], i) => (
                <circle key={`l${i}`} cx={cx - r * 0.28} cy={cy - r * 0.3} r={r * 0.45} fill={chiaro} opacity={0.75} />
              ))}
              {stagione === "primavera" &&
                [
                  [96, 60],
                  [146, 40],
                  [166, 96],
                  [80, 100],
                  [124, 92],
                ].map(([x, y], i) => <circle key={`f${i}`} cx={x} cy={y} r={4} fill="#f2a7b5" />)}
              {eta.ghiande &&
                [
                  [100, 74],
                  [142, 50],
                  [160, 104],
                  [116, 108],
                  [74, 88],
                ].map(([x, y], i) => <circle key={`g${i}`} cx={x} cy={y} r={3.6} fill="#e0a526" stroke="#a8761a" strokeWidth={1} />)}
              {eta.germoglio && (
                <g>
                  <path d="M120,8 L120,-8" stroke={scuro} strokeWidth={3} strokeLinecap="round" />
                  <ellipse cx={113} cy={-10} rx={8} ry={4.5} fill={chiaro} transform="rotate(-25 113 -10)" />
                  <ellipse cx={127} cy={-12} rx={8} ry={4.5} fill={medio} transform="rotate(25 127 -12)" />
                </g>
              )}
              {innevato &&
                [
                  [120, 8, 22],
                  [90, 27, 18],
                  [150, 27, 18],
                  [70, 66, 14],
                  [170, 66, 14],
                ].map(([x, y, rx], i) => <ellipse key={`n${i}`} cx={x} cy={y} rx={rx} ry={6} fill="#ffffff" />)}
              {SCHIUMA.map(([x, y, r], i) => (
                <g key={`s${i}`} data-n={`schiuma${i}`} {...at(`schiuma${i}`)}>
                  <circle cx={x} cy={y} r={r} fill="#ffffff" stroke="#cfe3ee" strokeWidth={1} />
                  <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.25} fill="#eef6fa" />
                </g>
              ))}
              {ha("fascia") && presenza("fascia", PERNI.fascia, pres, <Fascia />)}
              {ha("cappello") &&
                presenza(
                  "cappello",
                  PERNI.cappello,
                  pres,
                  <g data-n="cappello" {...at("cappello")}>
                    <Cappello />
                  </g>,
                )}
              {ha("berretto-notte") &&
                presenza(
                  "berretto-notte",
                  PERNI["berretto-notte"],
                  pres,
                  <g data-n="berretto" {...at("berretto")}>
                    <BerrettoNotte />
                  </g>,
                )}
              {ha("basco") && presenza("basco", PERNI.basco, pres, <Basco />)}
              {ha("piuma") && presenza("piuma", PERNI.piuma, pres, <Piuma />)}
            </g>
          </g>

          {/* Collo: la sciarpa sta dietro la faccia, così gli occhi si vedono sempre */}
          {ha("sciarpa") &&
            presenza(
              "sciarpa",
              PERNI.sciarpa,
              pres,
              <>
                <g data-n="sciarpaCoda" {...at("sciarpaCoda")}>
                  <SciarpaCoda />
                </g>
                <g data-n="sciarpaNodo" {...at("sciarpaNodo")}>
                  <SciarpaNodo />
                </g>
              </>,
            )}
          {ha("bandana") && presenza("bandana", PERNI.bandana, pres, <Bandana />)}

          {/* Faccia */}
          <g data-n="faccia" {...at("faccia")}>
            <g data-n="guance" {...at("guance")}>
              <circle cx={103} cy={177} r={5} fill="#e88a6a" />
              <circle cx={137} cy={177} r={5} fill="#e88a6a" />
            </g>
            <g data-n="occhiAperti" {...at("occhiAperti")}>
              {(["Sx", "Dx"] as const).map((L) => {
                const x = L === "Sx" ? 110 : 130;
                return (
                  <g key={L}>
                    <g data-n={`occhio${L}`} {...at(`occhio${L}`)}>
                      <ellipse cx={x} cy={164} rx={5.5} ry={6.5} fill={CARTA} />
                      <g clipPath={`url(#${id}-o${L.toLowerCase()})`}>
                        <g data-n={`pupilla${L}`} {...at(`pupilla${L}`)}>
                          <circle cx={x} cy={164} r={3} fill={INCHIOSTRO} />
                          <circle cx={x + 1} cy={163} r={0.9} fill="#fff" />
                        </g>
                        <path data-n={`palpebra${L}`} fill={CORTECCIA} {...at(`palpebra${L}`)} />
                      </g>
                    </g>
                    <path data-n={`ciglia${L}`} stroke={INCHIOSTRO} strokeWidth={2.1} strokeLinecap="round" fill="none" {...at(`ciglia${L}`)} />
                  </g>
                );
              })}
            </g>
            <g data-n="felici" stroke={INCHIOSTRO} strokeWidth={2.2} fill="none" strokeLinecap="round" {...at("felici")}>
              <path d="M105,166 Q110,159 115,166" />
              <path d="M125,166 Q130,159 135,166" />
            </g>
            <path data-n="stella" d="M137,145 l1.4,3.2 l3.2,1.4 l-3.2,1.4 l-1.4,3.2 l-1.4,-3.2 l-3.2,-1.4 l3.2,-1.4 Z" fill="#e0a526" {...at("stella")} />
            <path data-n="sopraSx" d="M104.5,153 Q110,150.5 115.5,152.5" stroke={CORTECCIA_SCURA} strokeWidth={2.4} strokeLinecap="round" fill="none" {...at("sopraSx")} />
            <path data-n="sopraDx" d="M124.5,152.5 Q130,150.5 135.5,153" stroke={CORTECCIA_SCURA} strokeWidth={2.4} strokeLinecap="round" fill="none" {...at("sopraDx")} />
            <path data-n="bocca" fill="#4a1f1a" stroke={INCHIOSTRO} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" {...at("bocca")} />
            <g clipPath={`url(#${id}-bocca)`}>
              <ellipse data-n="lingua" cx={0} cy={0} rx={5} ry={3} fill="#d9776a" {...at("lingua")} />
            </g>
            {ha("occhiali-sole") &&
              presenza(
                "occhiali-sole",
                PERNI["occhiali-sole"],
                pres,
                <g data-n="occhialiSole" {...at("occhialiSole")}>
                  <OcchialiSole />
                </g>,
              )}
            {ha("occhiali-tondi") && presenza("occhiali-tondi", PERNI["occhiali-tondi"], pres, <OcchialiTondi />)}
          </g>

          {ha("cravatta") && presenza("cravatta", PERNI.cravatta, pres, <Cravatta />)}

          {/* Oggetti tenuti davanti con due mani */}
          <g data-n="davanti" {...at("davanti")}>
            {oggetti("davanti").map((o) =>
              presenza(`ogg-${o}`, PERNI_OGGETTI[o], pres, o === "libro" ? <Libro at={at} /> : disegnaOggetto(o), zonaOggetto(o)),
            )}
          </g>

          {posa.effetti.includes("pensiero") && (
            <g data-n="pensiero" fill="#ffffff" stroke="#b9b2a0" strokeWidth={1.2} {...at("pensiero")}>
              <circle cx={174} cy={52} r={4} />
              <circle cx={186} cy={36} r={6} />
              <ellipse cx={210} cy={8} rx={24} ry={16} />
              <text x={210} y={15} textAnchor="middle" fontSize={20} fill={INCHIOSTRO} stroke="none" fontFamily="var(--font-gochi), cursive">
                ?
              </text>
            </g>
          )}

          {/* Braccia-rami: spalla, gomito, mano; gli oggetti seguono la mano */}
          {(["Sx", "Dx"] as const).map((L) => {
            const lato = L === "Sx" ? "sx" : "dx";
            return (
              <g key={L}>
                <path data-n={`braccio${L}C`} stroke={CONTORNO} strokeWidth={12} strokeLinecap="round" fill="none" {...at(`braccio${L}C`)} />
                <path data-n={`rametto${L}C`} stroke={CONTORNO} strokeWidth={7} strokeLinecap="round" fill="none" {...at(`rametto${L}C`)} />
                <path data-n={`braccio${L}F`} stroke={CORTECCIA} strokeWidth={8.5} strokeLinecap="round" fill="none" {...at(`braccio${L}F`)} />
                <path data-n={`rametto${L}F`} stroke={CORTECCIA} strokeWidth={4} strokeLinecap="round" fill="none" {...at(`rametto${L}F`)} />
                <g data-n={`foglia${L}`} {...at(`foglia${L}`)}>
                  <ellipse cx={0} cy={0} rx={5.5} ry={3.2} fill={medio} />
                </g>
                <g data-n={`mano${L}`} {...at(`mano${L}`)}>
                  <ellipse cx={0} cy={0} rx={7.5} ry={5} fill={medio} transform="rotate(-20)" />
                  <ellipse cx={2} cy={5} rx={6} ry={3.6} fill={medio} transform="rotate(25 2 5)" />
                </g>
                <g data-n={`ogg${L}`} {...at(`ogg${L}`)}>
                  {oggetti(lato).map((o) => presenza(`ogg-${o}`, [0, 0], pres, disegnaOggetto(o), zonaOggetto(o)))}
                </g>
              </g>
            );
          })}
        </g>
      </g>

      {davanti}

      <g className="lv-particelle" aria-hidden>
        {Array.from({ length: nParticelle }, (_, i) => (
          <path key={i} data-n={`p${i}`} display="none" />
        ))}
      </g>

      <g data-n="fumetto" className="lv-fumetto" display="none" aria-hidden>
        <g transform={eta.fumetto === 1 ? undefined : `scale(${eta.fumetto.toFixed(3)})`}>
          <g data-n="fumettoBox">
            <rect data-n="fumettoRett" rx={12} fill={CARTA} stroke={INCHIOSTRO} strokeWidth={2} />
            <text data-n="fumettoTesto" fontSize={15} fill={INCHIOSTRO}>
              {righe.map((r, i) => (
                <tspan key={i} x={0} y={-16 - (righe.length - 1 - i) * 17}>
                  {r}
                </tspan>
              ))}
            </text>
          </g>
          <path d="M-7,-9.6 L0,0 L7,-9.6 Z" fill={CARTA} />
          <path d="M-7,-8.4 L0,0 L7,-8.4" fill="none" stroke={INCHIOSTRO} strokeWidth={2} strokeLinejoin="round" />
        </g>
      </g>

      {interattivo && focusabile && (
        <foreignObject x={0} y={0} width={1} height={1}>
          <div role="status" className="lv-solo-lettori">
            {fumetto ?? ""}
          </div>
        </foreignObject>
      )}
    </g>
  );
}

/** Il libro: si apre, si chiude e gira pagina. */
function Libro({ at }: { at: (k: string) => Record<string, string> }) {
  return (
    <g>
      <path d="M120,195 L146,190 L146,216 L120,221 Z" fill="#8b3a3a" />
      <path d="M143,190 L120,194 L120,217 L143,213 Z" fill="#f3ecdc" />
      <path d="M125,200 l14,-2 M125,205 l14,-2 M125,210 l11,-1.6" stroke="#b9b2a0" strokeWidth={1.2} />
      <g data-n="libroSx" {...at("libroSx")}>
        <path d="M94,190 L120,195 L120,221 L94,216 Z" fill="#8b3a3a" />
        <path d="M97,190 L120,194 L120,217 L97,213 Z" fill={CARTA} />
        <path d="M101,198 l14,2 M101,203 l14,2 M101,208 l10,1.5" stroke="#b9b2a0" strokeWidth={1.2} />
      </g>
      <g data-n="pagina" {...at("pagina")}>
        <path d="M143,190 L120,194 L120,217 L143,213 Z" fill="#fffaf0" stroke="#e6dbc2" strokeWidth={0.8} />
        <path d="M125,200 l14,-2 M125,205 l14,-2" stroke="#c9c2b0" strokeWidth={1.1} />
      </g>
      <g data-n="copertina" {...at("copertina")}>
        <path d="M120,195 L146,190 L146,216 L120,221 Z" fill="#8b3a3a" stroke="#6e2c2c" strokeWidth={1} />
        <path d="M126,201 l14,-2.6" stroke="#e0a526" strokeWidth={1.6} strokeLinecap="round" />
      </g>
    </g>
  );
}
