import type { Indumento, Meteo, Oggetto, Posa } from "./tipi";

// Il catalogo dei regali all'albero: uno al mese è incluso nel Premium.
// L'albero decide da solo se usarlo e come (lo racconta in una lettera).
// Se il personaggio sa già disegnare l'oggetto o l'indumento, il regalo può
// comparire nella scena; altrimenti resta solo nel racconto.
// Regola (docs/modello-di-business.md): i regali non cambiano la strada né le classifiche.

export type ScenaRegalo =
  /** Lo indossa nel giardino, se non va in conflitto con quello che ha già. */
  | { tipo: "indossa"; indumento: Indumento }
  /** Lo appoggia sul prato accanto a sé. */
  | { tipo: "a-terra"; oggetto: Oggetto }
  /** Compare quando fa un'azione che lo usa già (per esempio leggere). */
  | { tipo: "con-azione"; oggetto: Oggetto; quando: string };

export interface Regalo {
  id: string;
  nome: string;
  /** Con l'articolo, per le frasi: «un berretto di lana». */
  articolo: string;
  /** Una riga per l'AI: com'è fatto, senza suggerire che cosa farne. */
  descrizione: string;
  scena: ScenaRegalo | null;
}

export const REGALI: Regalo[] = [
  {
    id: "berretto",
    nome: "Berretto di lana",
    articolo: "un berretto di lana rosso, con il pompon",
    descrizione: "Un berretto di lana rosso fatto a mano, con un pompon bianco in cima.",
    scena: { tipo: "indossa", indumento: "cappello" },
  },
  {
    id: "sciarpa",
    nome: "Sciarpa a righe",
    articolo: "una sciarpa rossa a righe",
    descrizione: "Una sciarpa rossa a righe bianche, lunga abbastanza da fare due giri.",
    scena: { tipo: "indossa", indumento: "sciarpa" },
  },
  {
    id: "occhiali",
    nome: "Occhiali da sole",
    articolo: "un paio di occhiali da sole",
    descrizione: "Occhiali da sole scuri, un po' da divo del cinema.",
    scena: { tipo: "indossa", indumento: "occhiali-sole" },
  },
  {
    id: "libro",
    nome: "Libro di avventure",
    articolo: "un libro di avventure",
    descrizione: "Un libro con la copertina rossa: storie di esploratori, mappe e isole lontane.",
    scena: { tipo: "con-azione", oggetto: "libro", quando: "quando legge" },
  },
  {
    id: "bici",
    nome: "Bicicletta",
    articolo: "una bicicletta",
    descrizione: "Una bicicletta verde con il campanello e il cestino davanti.",
    scena: null,
  },
  {
    id: "ombrello",
    nome: "Ombrello",
    articolo: "un ombrello",
    descrizione: "Un ombrello grande, abbastanza per ripararsi in due.",
    scena: { tipo: "con-azione", oggetto: "ombrello", quando: "quando piove e legge il giornale" },
  },
  {
    id: "tazza",
    nome: "Tazza per la tisana",
    articolo: "una tazza per la tisana",
    descrizione: "Una tazza di ceramica, con una bustina di tisana alla camomilla.",
    scena: { tipo: "con-azione", oggetto: "tazza", quando: "quando beve la tisana" },
  },
  {
    id: "quaderno",
    nome: "Quaderno e matita",
    articolo: "un quaderno con la matita",
    descrizione: "Un quaderno a righe, nuovo, con una matita appena temperata.",
    scena: { tipo: "con-azione", oggetto: "quaderno", quando: "quando scrive" },
  },
  {
    id: "aquilone",
    nome: "Aquilone",
    articolo: "un aquilone",
    descrizione: "Un aquilone a rombo, giallo e blu, con una coda di fiocchi.",
    scena: null,
  },
  {
    id: "valigia",
    nome: "Valigia",
    articolo: "una valigia da viaggio",
    descrizione: "Una piccola valigia di cartone, con le cinghie e lo spazio per le etichette.",
    scena: { tipo: "a-terra", oggetto: "valigia" },
  },
];

const PER_ID = new Map(REGALI.map((r) => [r.id, r]));

export function regalo(id: string | null | undefined): Regalo | null {
  return PER_ID.get(id ?? "") ?? null;
}

/** Che cosa decide l'albero del regalo. */
export const USI = ["lo-usa", "a-modo-suo", "lo-conserva", "lo-presta"] as const;
export type Uso = (typeof USI)[number];

export const NOMI_USO: Record<Uso, string> = {
  "lo-usa": "Lo usa",
  "a-modo-suo": "Lo usa a modo suo",
  "lo-conserva": "Lo tiene da parte",
  "lo-presta": "L'ha prestato a un amico del prato",
};

/** Un regalo già ricevuto, come lo conosce la scena. */
export interface RegaloInUso {
  gift: string;
  use: string;
}

// Un solo accessorio per zona: in testa, sulla faccia, al collo.
const ZONE: Indumento[][] = [
  ["cappello", "berretto-notte", "basco", "piuma", "fascia"],
  ["occhiali-sole", "occhiali-tondi"],
  ["sciarpa", "bandana"],
];

function zonaLibera(indossa: Indumento[], nuovo: Indumento) {
  const zona = ZONE.find((z) => z.includes(nuovo));
  return !zona || !indossa.some((i) => zona.includes(i));
}

/**
 * Aggiunge alla posa i regali che l'albero ha deciso di usare e che sa disegnare:
 * gli indumenti che indossa, se la zona è libera; la valigia sul prato (anche se
 * la usa a modo suo), se non c'è già altro appoggiato a terra.
 * Di notte niente regali (dorme col berretto); con la pioggia niente occhiali da sole.
 */
export function vestiConRegali(posa: Posa, regali: RegaloInUso[], meteo?: Pick<Meteo, "cielo" | "giorno">): Posa {
  if (meteo && !meteo.giorno) return posa;
  const bagnato = meteo?.cielo === "pioggia" || meteo?.cielo === "temporale";
  const indossa = [...posa.indossa];
  const oggetti = [...posa.oggetti];
  for (const r of regali) {
    const s = regalo(r.gift)?.scena;
    if (!s) continue;
    // Un oggetto sul prato c'è anche se lo usa a modo suo; un indumento solo se lo indossa.
    const inScena = r.use === "lo-usa" || (r.use === "a-modo-suo" && s.tipo === "a-terra");
    if (!inScena) continue;
    if (s.tipo === "indossa") {
      if (s.indumento === "occhiali-sole" && bagnato) continue;
      if (!indossa.includes(s.indumento) && zonaLibera(indossa, s.indumento)) indossa.push(s.indumento);
    } else if (s.tipo === "a-terra") {
      const aTerra = ["cavalletto", "ghiande", "cartello", "scoiattolo", "valigia"];
      if (!oggetti.some((o) => aTerra.includes(o))) oggetti.push(s.oggetto);
    }
  }
  return { ...posa, indossa, oggetti };
}
