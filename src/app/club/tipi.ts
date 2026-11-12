import type { Stagione } from "@/lib/albero/tipi";
import type { AlberoDelClub } from "@/lib/club";

// Il contratto con il motore della foresta del club (src/lib/giardino3d/club.js).

export interface OpzioniClub {
  alberi: Omit<AlberoDelClub, never>[];
  etichette: HTMLElement;
  stagione?: Stagione;
  movimentoRidotto?: boolean;
  /** Include il lavoro della scheda grafica nei ms (legge un pixel, così aspetta la GPU): solo per le misure. */
  misura?: boolean;
}

export interface Statistiche {
  alberi: number;
  vicini: number;
  msMediana: number;
  ms95: number;
  intervalloMediana: number;
  pixelRatio: number;
  disegni: number;
  triangoli: number;
}

export type AlberoToccato = AlberoDelClub & { indice?: number; specie?: string };

export interface IstanzaClub {
  su(evento: "pronto" | "tocca-albero", cb: (dati?: unknown) => void): () => void;
  imposta(parziale: { movimentoRidotto?: boolean }): void;
  vaiAlMio(): void;
  zoom(fattore: number): void;
  statistiche(): Statistiche;
  distruggi(): void;
}

export interface MotoreClub {
  creaForestaClub(canvas: HTMLCanvasElement, opzioni: OpzioniClub): IstanzaClub;
}
