import { svgAlbero, VIEWBOX_ALBERO } from "@/components/albero/fermo";
import { misureDellEta } from "@/components/albero/vivo/figura";
import { atmosfera } from "@/components/ambiente/atmosfera";
import type { Meteo, Posa, Stadio, Stagione } from "@/lib/albero/tipi";

// Il paesaggio della cartolina, tutto in SVG: cielo, sole, nuvole, pioggia o neve,
// colline, prato e l'albero nella posa del momento. Stessi colori del giardino
// (atmosfera.ts), disegnati fermi. Niente immagini generate con l'AI.

export interface Inquadratura {
  larghezza: number;
  altezza: number;
  /** Dove sta il prato (y del bordo alto). */
  prato: number;
  /** Dove poggiano i piedi dell'albero, e quanto è alto il suo disegno. */
  piedi: number;
  altezzaAlbero: number;
}

// Posizioni fisse ma irregolari (niente casualità: la stessa cartolina esce sempre uguale).
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function nuvola(cx: number, cy: number, s: number, colore: string, opacita: number) {
  const bolle: [number, number, number][] = [
    [0, 0, 1],
    [-0.9, 0.25, 0.72],
    [0.95, 0.22, 0.78],
    [-0.35, -0.42, 0.7],
    [0.45, -0.38, 0.62],
  ];
  return `<g opacity="${opacita}">${bolle
    .map(([x, y, r]) => `<circle cx="${cx + x * s}" cy="${cy + y * s}" r="${r * s * 0.82}" fill="${colore}"/>`)
    .join("")}<rect x="${cx - 1.6 * s}" y="${cy + 0.1 * s}" width="${3.2 * s}" height="${0.62 * s}" rx="${0.31 * s}" fill="${colore}"/></g>`;
}

export function svgScena({
  meteo,
  posa,
  stadio,
  stagione,
  giorni,
  q,
}: {
  meteo: Meteo;
  posa: Posa;
  stadio: Stadio;
  stagione: Stagione;
  /** L'età dell'albero quel giorno: la grandezza segue la crescita. */
  giorni: number;
  q: Inquadratura;
}): string {
  const { larghezza: W, altezza: H } = q;
  const v = atmosfera({ ...meteo, giorno: true }, "giorno", stagione).variabili;
  const c = meteo.cielo;
  const bagnato = c === "pioggia" || c === "temporale";
  const parti: string[] = [];

  // Cielo
  parti.push(
    `<defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${v["--cielo-1"]}"/><stop offset="0.5" stop-color="${v["--cielo-2"]}"/><stop offset="0.82" stop-color="${v["--cielo-3"]}"/></linearGradient>` +
      `<radialGradient id="alone"><stop offset="0" stop-color="${v["--sole-colore"]}" stop-opacity="0.55"/><stop offset="1" stop-color="${v["--sole-colore"]}" stop-opacity="0"/></radialGradient></defs>`,
    `<rect width="${W}" height="${H}" fill="url(#cielo)"/>`,
  );

  // Sole
  const oSole = Number(v["--o-sole"]);
  if (oSole > 0) {
    const sx = W * 0.76;
    const sy = q.prato * 0.3;
    const r = W * 0.09;
    parti.push(
      `<g opacity="${oSole}"><circle cx="${sx}" cy="${sy}" r="${r * 2.6}" fill="url(#alone)"/><circle cx="${sx}" cy="${sy}" r="${r}" fill="${v["--sole-colore"]}"/></g>`,
    );
  }

  // Nuvole
  const quante = { sole: 2, nuvole: 5, pioggia: 6, temporale: 6, neve: 5, nebbia: 3 }[c];
  for (let i = 0; i < quante; i++) {
    const x = W * (0.08 + 0.84 * rnd(i + 3));
    const y = q.prato * (0.12 + 0.45 * rnd(i + 11));
    const s = W * (0.07 + 0.05 * rnd(i + 21));
    parti.push(nuvola(x, y, s, v["--nuvola"], c === "sole" ? 0.85 : 0.95));
  }

  // Colline e prato
  const p = q.prato;
  parti.push(
    `<path d="M0,${p - H * 0.06} C${W * 0.22},${p - H * 0.12} ${W * 0.42},${p - H * 0.03} ${W * 0.62},${p - H * 0.08} S${W * 0.92},${p - H * 0.1} ${W},${p - H * 0.05} V${H} H0 Z" fill="${v["--collina-1"]}"/>`,
    `<path d="M0,${p - H * 0.02} C${W * 0.3},${p - H * 0.06} ${W * 0.55},${p + H * 0.01} ${W},${p - H * 0.035} V${H} H0 Z" fill="${v["--collina-2"]}"/>`,
    `<path d="M0,${p + H * 0.012} C${W * 0.35},${p - H * 0.012} ${W * 0.7},${p + H * 0.02} ${W},${p} V${H} H0 Z" fill="${v["--prato"]}"/>`,
  );
  for (let i = 0; i < 26; i++) {
    const x = W * rnd(i + 40);
    const y = p + H * 0.03 + (H - p) * 0.8 * rnd(i + 70);
    const s = W * 0.012;
    parti.push(
      `<path d="M${x - s},${y} q${s * 0.4},${-s * 1.8} ${s * 0.6},${-s * 2.4} M${x},${y} q0,${-s * 2} ${s * 0.2},${-s * 3} M${x + s},${y} q${-s * 0.2},${-s * 1.6} ${s * 0.4},${-s * 2.2}" stroke="${v["--prato-ombra"]}" stroke-width="${s * 0.45}" stroke-linecap="round" fill="none"/>`,
    );
  }

  // L'albero: piedi sulla linea del prato, centrato. Da piccolo la cartolina gli fa
  // uno zoom (fino a 1,6×): resta più piccolo di un adulto, ma è lui il protagonista.
  const zoom = Math.min(1.6, 1 / misureDellEta(stadio, giorni).scala);
  const k = (q.altezzaAlbero * zoom) / VIEWBOX_ALBERO.altezza;
  const tx = W / 2 - VIEWBOX_ALBERO.centro * k;
  const ty = q.piedi - VIEWBOX_ALBERO.terra * k;
  parti.push(
    `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${k.toFixed(4)})">${svgAlbero({
      posa,
      stadio,
      stagione,
      innevato: c === "neve",
      giorni,
    })}</g>`,
  );

  // Pioggia e neve, davanti a tutto
  if (bagnato) {
    for (let i = 0; i < 70; i++) {
      const x = W * rnd(i + 100);
      const y = H * 0.9 * rnd(i + 200);
      const l = H * 0.03;
      parti.push(
        `<path d="M${x},${y} l${-l * 0.25},${l}" stroke="#dfe8f0" stroke-width="${W * 0.004}" stroke-linecap="round" opacity="0.7"/>`,
      );
    }
  } else if (c === "neve") {
    for (let i = 0; i < 80; i++) {
      parti.push(
        `<circle cx="${W * rnd(i + 300)}" cy="${H * rnd(i + 400)}" r="${W * (0.004 + 0.005 * rnd(i + 500))}" fill="#ffffff" opacity="0.9"/>`,
      );
    }
  } else if (c === "nebbia") {
    parti.push(`<rect y="${p - H * 0.1}" width="${W}" height="${H * 0.25}" fill="#f2efe6" opacity="0.45"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parti.join("")}</svg>`;
}
