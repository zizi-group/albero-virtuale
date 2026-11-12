// La tua foresta (docs/stanze-e-vita.md, 1.1 e 13): i dati che la vista
// d'insieme legge. Li prepara l'adattatore di `dati.ts`; la pagina e il motore
// 3D non sanno da dove vengono (oggi un albero solo, domani le stanze vere).

/** Un albero digitale come lo vede la foresta. */
export interface AlberoForesta {
  id: string;
  nome: string;
  /** Sceglie il modello 3D (come nel giardino): oggi l'id dell'albero. */
  seme: string;
  strada: string | null;
  giorni: number;
  umore: string;
  /** Esempio della demo, non un albero della persona. */
  esempio?: boolean;
}

/** Una stanza aperta: una radura con il recinto e il cartello. */
export interface StanzaForesta {
  id: string;
  numero: number;
  nome: string;
  /** Da 1 a 4 alberi (capienza proposta, doc 2.2). */
  alberi: AlberoForesta[];
  /** Stanza d'esempio della demo: si vede, ma non conta nei numeri. */
  esempio?: boolean;
}

/** Una stanza ancora chiusa: radura incolta con il lucchetto di rami. */
export interface StanzaBloccata {
  numero: number;
  /** La regola per aprirla, da mostrare così com'è («Pianta altri 4 alberi»). */
  regola: string;
}

/** I numeri veri del pannello: solo dati del database, mai stime. */
export interface NumeriForesta {
  /** Alberi digitali che la persona ha piantato (ognuno corrisponde a un albero vero). */
  alberiPiantati: number;
  giorniVissuti: number;
  lettereRicevute: number;
  oggettiSbloccati: number;
  stanzeAperte: number;
  stanzeMassime: number;
  /**
   * Gli alberi veri piantati in Italia (dove, specie, da quanti anni). Nel
   * database non c'è ancora nulla: `null` vuol dire «in arrivo». Niente CO2
   * (doc 1.4: serve una fonte approvata).
   */
  alberiVeri: { luogo: string; specie: string; anni: number }[] | null;
}

export interface DatiForesta {
  stanze: StanzaForesta[];
  bloccate: StanzaBloccata[];
  numeri: NumeriForesta;
  /** Luce, stagione e cielo della città dell'albero principale. */
  ora: "alba" | "giorno" | "tramonto" | "notte";
  stagione: "primavera" | "estate" | "autunno" | "inverno";
  cielo: "sole" | "nuvole" | "pioggia" | "temporale" | "neve" | "nebbia";
}

/** L'indirizzo della stanza 2D (il giardino), con la stanza e l'albero scelti. */
export function indirizzoStanza(idStanza: string, idAlbero?: string): string {
  const q = new URLSearchParams({ stanza: idStanza });
  if (idAlbero) q.set("albero", idAlbero);
  q.set("da", "foresta");
  return `/giardino?${q.toString()}`;
}
