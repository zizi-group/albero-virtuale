import type { Ora } from "@/components/ambiente/atmosfera";
import type { Meteo, Stagione } from "@/lib/albero/tipi";

// Il contratto con il motore 3D di src/lib/giardino3d (JavaScript con JSDoc).

export interface AlberoGiardino {
  id: string;
  seme: string;
  modello?: string | number;
  strada?: string;
  nome: string;
  giorni: number;
  principale?: boolean;
}

export interface OpzioniGiardino {
  alberi: AlberoGiardino[];
  meteo: Pick<Meteo, "cielo" | "temperatura" | "giorno">;
  ora: Ora;
  stagione: Stagione;
  azione: string;
  umore: string;
  movimentoRidotto: boolean;
  /** Parti dello schermo coperte dai riquadri, in frazioni dell'altezza. */
  margini?: { sopra: number; sotto: number };
}

export type Reazione = "saluta" | "lettera" | "festa" | "carezza";
export type EventoGiardino = "pronto" | "tocca-albero" | "tocca-cassetta" | "tocca-taccuino";

export interface IstanzaGiardino {
  imposta(parziale: Partial<OpzioniGiardino>): void;
  reagisci(tipo: Reazione): void;
  su(evento: EventoGiardino, cb: (dati?: unknown) => void): void;
  distruggi(): void;
}

export interface MotoreGiardino {
  creaGiardino(canvas: HTMLCanvasElement, opzioni: OpzioniGiardino): IstanzaGiardino;
}
