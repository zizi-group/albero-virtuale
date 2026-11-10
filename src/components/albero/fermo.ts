import { Fragment, type ReactElement, type ReactNode } from "react";
import type { Posa, Stadio, Stagione } from "@/lib/albero/tipi";
import { FiguraAlbero, primoFotogramma } from "./vivo/figura";

// L'albero fermo, come testo SVG: per le immagini fatte sul server (la cartolina
// del mese con ImageResponse), dove non girano né hook né browser.
// Stesso disegno di AlberoVivo (vivo/figura.tsx), nel suo sistema di coordinate:
// viewBox "-20 -40 280 320", terreno a y = 262, centro a x = 120.

export const VIEWBOX_ALBERO = { x: -20, y: -40, larghezza: 280, altezza: 320, terra: 262, centro: 120 } as const;

/** Gli attributi SVG che restano in camelCase. */
const CAMEL = new Set([
  "viewBox",
  "preserveAspectRatio",
  "gradientTransform",
  "gradientUnits",
  "patternUnits",
  "patternTransform",
  "clipPathUnits",
  "maskUnits",
  "spreadMethod",
  "startOffset",
  "textLength",
  "lengthAdjust",
  "stdDeviation",
]);
/** Attributi dell'interazione: in un'immagine non servono. */
const SALTA = new Set(["children", "ref", "key", "tabIndex", "role", "className", "style"]);

function nomeAttributo(k: string) {
  if (CAMEL.has(k) || k.startsWith("data-") || k.startsWith("aria-")) return k;
  return k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function eElemento(n: unknown): n is ReactElement<Record<string, unknown>> {
  return typeof n === "object" && n !== null && "type" in n && "props" in n;
}

/** Trasforma un albero di elementi React (solo SVG e componenti senza hook) in testo SVG. */
export function svgDaReact(nodo: ReactNode): string {
  if (nodo == null || typeof nodo === "boolean") return "";
  if (typeof nodo === "string" || typeof nodo === "number") return esc(String(nodo));
  if (Array.isArray(nodo)) return nodo.map(svgDaReact).join("");
  if (!eElemento(nodo)) return "";
  const { type, props } = nodo;
  if (type === Fragment) return svgDaReact(props.children as ReactNode);
  if (typeof type === "function") return svgDaReact((type as (p: Record<string, unknown>) => ReactNode)(props));
  if (typeof type !== "string") return "";
  let attributi = "";
  for (const [k, v] of Object.entries(props)) {
    if (SALTA.has(k) || v === null || v === undefined || v === false || typeof v === "function" || typeof v === "object") continue;
    attributi += ` ${nomeAttributo(k)}="${esc(String(v))}"`;
  }
  const figli = svgDaReact(props.children as ReactNode);
  return figli ? `<${type}${attributi}>${figli}</${type}>` : `<${type}${attributi}/>`;
}

/** Il personaggio fermo in una posa, come gruppo SVG (coordinate di VIEWBOX_ALBERO). */
export function svgAlbero({
  posa,
  stadio = "albero",
  stagione = "estate",
  innevato = false,
  id = "fermo",
  giorni,
}: {
  posa: Posa;
  stadio?: Stadio;
  stagione?: Stagione;
  innevato?: boolean;
  id?: string;
  /** L'età in giorni, per la grandezza (crescita continua). */
  giorni?: number;
}): string {
  const { A, presenti } = primoFotogramma(posa);
  return svgDaReact(
    FiguraAlbero({
      posa,
      stadio,
      stagione,
      innevato,
      A,
      presenti,
      id,
      interattivo: false,
      focusabile: false,
      nome: "",
      giorni,
    }),
  );
}
