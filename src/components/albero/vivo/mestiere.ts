import { MESTIERI } from "@/lib/albero/mestieri";
import type { Strada } from "@/lib/albero/strade";
import { attrezzo, type Canali } from "./canali";
import { Copione, type Clip, type Regia } from "./copione";
import { POSTI, type StatoLavoro } from "./arredi";
import {
  alzati,
  asciugaFronte,
  BOCCA_O,
  cammina,
  colpi,
  luogo,
  mano,
  manoSuiFianchi,
  prendi,
  RISATA,
  saltelloContento,
  SERIO,
  siediti,
  SORRISO,
  sospira,
  type Luogo,
} from "./gesti";
import type { Palco } from "./scenette";

// Le scenette dei mestieri (pilota: l'imprenditore). Ogni scena di lavoro ha
// un posto (dove sta l'albero), una postura (come sta lì), un ciclo che si
// ripete con varianti e, per i cantieri, il lavoro vero che si vede una volta
// sola all'arrivo: lo stadio dell'arredo avanza col canale «costruzione».
// Il progetto completo è in docs/routine-strade.md.

/** Quello che la pagina dice all'albero sul suo mestiere. */
export interface StatoMestiere {
  strada: Strada;
  /** Arredi finiti (oltre a quelli iniziali della strada). */
  arredi: string[];
  /** Cosa fa adesso: un'attività, oppure un passo di cantiere (0 = il primo). */
  adesso?: { attivita: string } | { cantiere: string; passo: number } | null;
}

export function statoLavoro(m: StatoMestiere): StatoLavoro {
  const mestiere = MESTIERI[m.strada];
  const stadi: Record<string, number> = {};
  for (const a of mestiere.iniziali) stadi[a] = 1;
  for (const c of mestiere.cantieri) if (m.arredi.includes(c.lascia)) stadi[c.lascia] = c.passi.length;
  let inCorso: StatoLavoro["inCorso"] = null;
  if (m.adesso && "cantiere" in m.adesso) {
    const id = m.adesso.cantiere;
    const c = mestiere.cantieri.find((x) => x.id === id);
    if (c) inCorso = { arredo: c.lascia, passo: Math.min(m.adesso.passo, c.passi.length - 1), passi: c.passi.length };
  }
  return {
    strada: m.strada,
    stadi,
    inCorso,
    scoiattolo: m.strada === "imprenditore",
    lavagna: m.strada === "imprenditore" && m.arredi.includes("scrivania"),
  };
}

/** I canali del primo fotogramma col mestiere (il cantiere riparte dall'inizio del passo). */
export function canaliDelMestiere(m: StatoMestiere | null | undefined): Partial<Canali> {
  if (!m) return {};
  const inCorso = !!(m.adesso && "cantiere" in m.adesso);
  return { costruzione: inCorso ? 0 : 1 };
}

interface ScenaLavoro {
  dove: (p: Palco) => Luogo;
  postura: (l: Luogo, b: Canali) => Partial<Canali>;
  /** Il lavoro vero del cantiere, una volta, all'arrivo (costruzione da 0 a 1). */
  lavoro?: (c: Copione, l: Luogo, p: Palco) => void;
  /** Il lavoro parte da casa e finisce da solo al posto (senza andarci prima). */
  parteDaSe?: boolean;
  ciclo: (c: Copione, l: Luogo, p: Palco, b: Canali) => void;
}

const tra = (p: Palco, a: number, b: number) => a + p.rnd() * (b - a);
const forse = (p: Palco, x: number) => p.rnd() < x;
const fumetto = (gruppo: string, durata = 2.2) => (r: Regia) => r.fumetto(r.frase(gruppo), durata);
const FERMO = { passo: 0, braccioPasso: 0, sxAnim: 0, dxAnim: 0, corpoAnim: 0.4, parla: 0, sxAllunga: 1, dxAllunga: 1 };

// ——— Posture ———

const alBanco = (l: Luogo): Partial<Canali> => ({
  ...FERMO,
  x: l.x,
  verso: 0,
  seduto: 0,
  ...mano(l, "sx", l.centro - 20, 222),
  ...mano(l, "dx", l.centro + 20, 222),
  ...SORRISO,
});

const allaScrivania = (l: Luogo): Partial<Canali> => ({
  ...FERMO,
  x: l.x,
  verso: 0,
  seduto: 1,
  ...mano(l, "sx", l.centro - 20, 211),
  ...mano(l, "dx", l.centro + 20, 211),
  ...SORRISO,
  palpebra: 0,
  felice: 0,
});

const inPiedi = (l: Luogo, guarda: number): Partial<Canali> => ({
  ...FERMO,
  x: l.x,
  verso: guarda,
  seduto: 0,
  sxSpalla: -50,
  sxGomito: -8,
  sxMano: 0,
  dxSpalla: -50,
  dxGomito: -8,
  dxMano: 0,
  ...SORRISO,
  palpebra: 0,
  felice: 0,
});

// ——— Pezzi comuni ———

function guardaIntorno(c: Copione) {
  c.vai(0.4, { verso: -0.4, pupX: -2.2 }).pausa(0.4).vai(0.5, { verso: 0.4, pupX: 2.2 }).pausa(0.3).vai(0.35, { verso: 0, pupX: 0 });
}

/** I ritocchi di un cantiere: qualche colpo, un passo indietro per guardare, il sudore. */
function ritocchi(attr: Parameters<typeof prendi>[2], punto: [number, number], guarda: number, lato: "sx" | "dx" = "dx") {
  return (c: Copione, l: Luogo, p: Palco) => {
    c.pausa(tra(p, 0.6, 1.2));
    prendi(c, lato, attr);
    colpi(
      c,
      l,
      lato,
      [punto[0] - 6, punto[1] - 24],
      punto,
      2 + Math.floor(p.rnd() * 2),
      0.7,
      (r) => r.emetti("polvere", punto[0] - l.centro + 120, punto[1] - (l.seduto ? 22 : 0), { vy: -10, vita: 0.5, scala: 0.3 }),
      {},
      1.5,
    );
    c.vai(0.35, { [`${lato}Spalla`]: -50, [`${lato}Gomito`]: -8, [`${lato}Mano`]: 0, [`${lato}Allunga`]: 1 } as Partial<Canali>);
    // Un passo indietro, guarda il lavoro con la testa piegata.
    c.vai(0.5, { x: l.x - 12 * guarda, verso: guarda, rot: -3 * guarda, palpebra: 0.3, boccaStorta: -2 });
    c.pausa(tra(p, 0.8, 1.4));
    c.vai(0.4, { rot: 0, palpebra: 0, boccaStorta: 0, x: l.x });
    if (forse(p, 0.5)) asciugaFronte(c, l);
    else manoSuiFianchi(c, l);
    c.pausa(0.6);
    prendi(c, lato, null);
  };
}

// ——— Le scene dell'imprenditore ———

const SCENE: Record<string, ScenaLavoro> = {
  // Livello 1: la bancarella
  "imprenditore.pubblicita": {
    dove: (p) => luogo(p, POSTI.bancarella),
    postura: (l) => alBanco(l),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.6, 1.2));
      guardaIntorno(c);
      prendi(c, "dx", "megafono");
      c.vai(0.4, mano(l, "dx", l.centro + 8, 182, -90));
      const volte = 2 + Math.floor(p.rnd() * 2);
      if (forse(p, 0.6)) c.evento(fumetto("pubblicita"));
      for (let i = 0; i < volte; i++) {
        c.vai(0.25, { ...RISATA, rot: 3, sy: 1.04 }, "out");
        c.evento((r) => r.emetti("risata", 158, 170, { vx: 30, vy: -10, vita: 0.7 }));
        if (!p.ridotto) c.oscilla("chiomaRot", 3, 2, 0.5);
        c.pausa(0.5).vai(0.25, { ...SORRISO, rot: 0, sy: 1 });
      }
      c.vai(0.3, { dxSpalla: -40, dxGomito: -10, dxMano: 0 });
      prendi(c, "dx", null);
      // Indica il cartello dei prezzi e fa l'occhiolino.
      c.vai(0.4, { ...mano(l, "dx", l.centro + 32, 178, 0, 1.1), pupX: 2.4, verso: 0.3 });
      c.pausa(0.5).vai(0.15, { occhiolino: 1, boccaStorta: -3 }).pausa(0.4).vai(0.2, { occhiolino: 0, boccaStorta: 0, pupX: 0, verso: 0 });
    },
  },
  "imprenditore.contratta": {
    dove: (p) => luogo(p, POSTI.bancarella),
    postura: (l) => ({ ...alBanco(l), scoiattolo: 0, scoiattoloX: -190, scoiattoloSu: 0, scoiattoloDorme: 0 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.5, 1));
      // Arriva lo scoiattolo.
      c.vai(0.3, { scoiattolo: 1 }).vai(1, { scoiattoloX: -96 }, "out");
      c.vai(0.35, { verso: -0.6, pupX: -2.5, rot: -3, sbarra: 0.4, cigliaY: -2 });
      c.evento(fumetto("contratta", 2));
      // Gesti della trattativa: palmo aperto, conta sulle dita.
      c.vai(0.35, mano(l, "sx", l.centro - 46, 200, 30));
      c.oscilla("sxMano", 14, 3, 0.9).pausa(0.9);
      // Lo scoiattolo dice di no.
      c.vai(0.15, { scoiattoloSu: 5 }, "out").vai(0.15, { scoiattoloSu: 0 }, "in").vai(0.15, { scoiattoloSu: 5 }, "out").vai(0.15, { scoiattoloSu: 0 }, "in");
      // Ci pensa: mano al mento.
      c.vai(0.4, { ...SERIO, ...mano(l, "dx", l.centro + 2, 194, 60), pupY: -2, boccaStorta: 2 });
      c.pausa(tra(p, 0.8, 1.4));
      // Va bene: stretta di mano.
      c.vai(0.35, { ...mano(l, "sx", l.centro - 64, 232, 0, 1.2), pupY: 0.5, ...SORRISO, boccaStorta: 0 });
      c.oscilla("sxGomito", 8, 3, 0.6).pausa(0.6);
      c.vai(0.15, { scoiattoloSu: 12 }, "out").vai(0.2, { scoiattoloSu: 0 }, "in");
      c.evento((r) => r.emetti("ghianda", -96, 232, { vx: 70, vy: -140, gravita: 520, vita: 1.2, mondo: true }));
      c.vai(0.4, { ...mano(l, "sx", l.centro - 20, 222), ...mano(l, "dx", l.centro + 20, 222), verso: 0, rot: 0, sbarra: 0, cigliaY: 0, felice: 1 });
      // Lo scoiattolo se ne va.
      c.vai(1, { scoiattoloX: -190 }, "in").vai(0.3, { scoiattolo: 0, felice: 0 });
    },
  },
  "imprenditore.incasso": {
    dove: (p) => luogo(p, POSTI.bancarella),
    postura: (l) => alBanco(l),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.5, 1));
      // Conta le ghiande sul banco, una per una, con la bocca che si muove.
      c.vai(0.2, { parla: 0.5, pupY: 2.5, palpebra: 0.25 });
      for (const x of [-54, -42, -30]) {
        c.vai(0.35, mano(l, "dx", x, 218, 0, 1.4));
        c.vai(0.12, { fy: 1 }).vai(0.15, { fy: 0 });
      }
      if (forse(p, 0.5)) {
        // Le riconta.
        c.vai(0.25, { parla: 0, pupY: 0, palpebra: 0, boccaStorta: 3 }).pausa(0.4).vai(0.2, { parla: 0.5, pupY: 2.5 });
        for (const x of [-54, -42, -30]) c.vai(0.25, mano(l, "dx", x, 218, 0, 1.4));
      }
      c.vai(0.3, { parla: 0, pupY: 1, palpebra: 0, ...mano(l, "dx", l.centro + 20, 222) });
      c.evento(fumetto("incasso", 2));
      c.vai(0.5, { ...BOCCA_O, boccaSu: -9, boccaGiu: 9, palpebra: 1, sxSpalla: 90, dxSpalla: 90, sy: 1.05 });
      c.pausa(0.5).vai(0.4, { ...SORRISO, palpebra: 0, sy: 1, ...mano(l, "sx", l.centro - 20, 222), ...mano(l, "dx", l.centro + 20, 222) }, "molla");
    },
  },
  // Livello 2: l'ufficio
  "imprenditore.caffe": {
    dove: (p) => luogo(p, POSTI.scrivania, true),
    postura: (l) => ({ ...allaScrivania(l), lampada: 0 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.6, 1));
      prendi(c, "dx", "tazza");
      c.vai(0.4, mano(l, "dx", l.centro + 26, 205));
      const sorsi = 2 + Math.floor(p.rnd() * 2);
      for (let i = 0; i < sorsi; i++) {
        c.vai(0.45, { ...mano(l, "dx", l.centro + 12, 214), palpebra: 1, felice: 0, ...BOCCA_O, boccaL: 3 });
        c.evento((r) => r.emetti("vapore", 132, 168, { vy: -14, vita: 1.2, scala: 0.3, cresce: 1.8 }));
        c.pausa(0.4).vai(0.4, { ...mano(l, "dx", l.centro + 26, 205), palpebra: 0, felice: 1, ...SORRISO });
        c.pausa(tra(p, 0.5, 1));
      }
      // Si appoggia indietro, soddisfatto.
      c.vai(0.6, { rot: -5, fy: -1, felice: 1 });
      if (forse(p, 0.4)) c.evento(fumetto("caffe"));
      sospira(c);
      c.vai(0.5, { rot: 0, fy: 0, felice: 0 });
      c.vai(0.3, mano(l, "dx", l.centro + 20, 211));
      prendi(c, "dx", null);
    },
  },
  "imprenditore.telefono": {
    dove: (p) => luogo(p, POSTI.scrivania, true),
    postura: (l) => ({ ...allaScrivania(l), cornetta: 1, squillo: 0 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.8, 1.6));
      // Squilla: salta sulla sedia, cerca il telefono.
      c.vai(0.1, { squillo: 1 });
      c.vai(0.15, { sbarra: 1, cigliaY: -3, y: p.ridotto ? 0 : -5 }, "out").vai(0.2, { y: 0 }, "in");
      c.vai(0.3, { verso: -0.3, pupX: -2.5 }).pausa(0.5);
      // Alza la cornetta.
      c.vai(0.35, mano(l, "sx", POSTI.scrivania - 37, 199));
      c.vai(0.01, { cornetta: 0, squillo: 0, attrSx: attrezzo("cornetta") }, "scatto");
      c.vai(0.35, { ...mano(l, "sx", l.centro - 22, 194), sbarra: 0, cigliaY: 0, verso: 0, pupX: 0 });
      // Parla, si alza e cammina dietro la scrivania gesticolando.
      c.vai(0.2, { parla: 0.8, boccaL: 5, boccaSu: -2, boccaGiu: 4 });
      c.evento(fumetto("telefono", 2.4), 0.3);
      alzati(c, p);
      const ritto = luogo(p, l.centro);
      c.vai(0.3, mano(ritto, "sx", l.centro - 22, 172));
      const giri = p.ridotto ? 0 : 1 + Math.floor(p.rnd() * 2);
      for (let i = 0; i < giri; i++) {
        c.vai(0.6, { x: l.x - 16, verso: -0.5, passo: 0.8, cadenza: 2 }).vai(0.6, { x: l.x + 16, verso: 0.5 }).vai(0.4, { x: l.x, verso: 0, passo: 0 });
      }
      c.oscilla("dxGomito", 22, 3, 1.2).pausa(1.2);
      // Risata finta.
      c.vai(0.2, { felice: 1, ...RISATA, parla: 0 });
      c.oscilla("sy", 0.03, 4, 0.8).pausa(0.8);
      c.vai(0.3, { felice: 0, ...SORRISO });
      // Si risiede, riattacca, annota.
      siediti(c, p);
      c.vai(0.35, mano(l, "sx", POSTI.scrivania - 37, 199));
      c.vai(0.01, { cornetta: 1, attrSx: 0 }, "scatto");
      c.vai(0.3, mano(l, "sx", l.centro - 20, 211));
      prendi(c, "dx", "penna");
      c.vai(0.35, { ...mano(l, "dx", POSTI.scrivania + 10, 204), pupY: 2.5, palpebra: 0.3 });
      c.oscilla("dxMano", 8, 4, 0.9).con(0.9, { pila: 0.55 }).pausa(0.9);
      c.vai(0.3, { ...mano(l, "dx", l.centro + 20, 211), pupY: 1, palpebra: 0, pila: 0.4 });
      prendi(c, "dx", null);
    },
  },
  "imprenditore.contratti": {
    dove: (p) => luogo(p, POSTI.scrivania, true),
    postura: (l) => ({ ...allaScrivania(l), pila: 0.4 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.5, 1));
      prendi(c, "dx", "timbro");
      c.vai(0.3, { ...SERIO, cigliaRot: 6, palpebra: 0.2 });
      const timbri = 3 + Math.floor(p.rnd() * 2);
      for (let i = 0; i < timbri; i++) {
        c.vai(0.3, mano(l, "dx", l.centro + 18, 168), "out");
        c.vai(0.12, mano(l, "dx", l.centro + 14, 206), "in");
        c.vai(0.06, { scrivaniaY: 2, sy: 0.97, pila: 0.4 + (i + 1) * 0.1 }, "out").vai(0.18, { scrivaniaY: 0, sy: 1 }, "molla");
        c.evento((r) => r.emetti("polvere", 134, 186, { vy: -12, vita: 0.4, scala: 0.25 }));
        c.pausa(tra(p, 0.15, 0.35));
      }
      // Soffia sull'inchiostro.
      c.vai(0.3, { ...BOCCA_O, cigliaRot: 0, palpebra: 0 });
      c.evento((r) => r.emetti("sbuffo", 128, 186, { vx: 20, vy: -6, vita: 0.8, scala: 0.4 }));
      c.pausa(0.5).vai(0.3, { ...SORRISO });
      prendi(c, "dx", null);
      // Archivia: la pila torna giù nel cassetto.
      c.vai(0.4, mano(l, "sx", POSTI.scrivania + 6, 206)).vai(0.5, { pila: 0.4 }).vai(0.3, mano(l, "sx", l.centro - 20, 211));
      c.vai(0.3, mano(l, "dx", l.centro + 20, 211));
      if (forse(p, 0.4)) c.evento(fumetto("contratti"));
    },
  },
  "imprenditore.riunione": {
    dove: (p) => luogo(p, POSTI.scrivania, true),
    postura: (l) => ({ ...allaScrivania(l), lavagna: 0, grafico: 0, scoiattolo: 0, scoiattoloX: 304, scoiattoloDorme: 0 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.5, 1));
      // Compaiono la lavagna e lo scoiattolo, che si siede davanti.
      c.vai(0.5, { lavagna: 1, scoiattolo: 1 }, "back");
      alzati(c, p);
      const presso = luogo(p, POSTI.lavagna + 50);
      cammina(c, p, presso.x, -0.6);
      prendi(c, "sx", "bacchetta");
      c.vai(0.35, mano(presso, "sx", 156, 200, 0, 1.3));
      c.evento(fumetto("riunione", 2.2));
      c.con(1.6, mano(presso, "sx", 196, 176, 0, 1.3), "io").con(1.6, { grafico: 1, parla: 0.6 }).pausa(1.6);
      // Entusiasmo: braccia in alto.
      c.vai(0.3, { parla: 0, felice: 1, ...RISATA, dxSpalla: 80, dxGomito: 20 }, "back");
      saltelloContento(c, p);
      c.pausa(0.5);
      // Si gira verso lo scoiattolo: dorme.
      c.vai(0.4, { verso: 0.5, pupX: 2.5, pupY: 2.5, felice: 0, ...SORRISO, dxSpalla: -50, dxGomito: -8 });
      c.vai(0.3, { scoiattoloDorme: 1 });
      c.evento((r) => r.emetti("zeta", 304, 222, { vx: 10, vy: -20, vita: 1.8, scala: 0.6, cresce: 1.4, mondo: true }));
      c.vai(0.4, { ...SERIO, boccaY: 3, boccaSu: -3, boccaGiu: -3, palpebra: 0.4, cigliaRot: -8 });
      sospira(c);
      // Batte la bacchetta sulla lavagna: lo scoiattolo si sveglia di soprassalto.
      colpi(c, presso, "sx", [166, 176], [170, 190], 2, 0.4, undefined, {}, 1.3);
      c.vai(0.1, { scoiattoloDorme: 0, scoiattoloSu: 10 }, "out").vai(0.2, { scoiattoloSu: 0 }, "in");
      c.vai(0.3, { palpebra: 0, cigliaRot: 0, ...SORRISO, verso: 0, pupX: 0, pupY: 1 });
      prendi(c, "sx", null);
      c.vai(0.4, { lavagna: 0, scoiattolo: 0, grafico: 0 });
      cammina(c, p, l.x, 0);
      siediti(c, p);
    },
  },
  "imprenditore.chiude": {
    dove: (p) => luogo(p, POSTI.scrivania, true),
    postura: (l) => ({ ...allaScrivania(l), lampada: 1 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.6, 1));
      // Conta l'incasso della giornata.
      c.vai(0.2, { parla: 0.5, pupY: 2.5, palpebra: 0.3 });
      c.oscilla("dxGomito", 10, 4, 1.4).oscilla("sxGomito", -10, 4, 1.4).pausa(1.4);
      c.vai(0.2, { parla: 0, pupY: 1, palpebra: 0 });
      if (forse(p, 0.4)) c.evento(fumetto("incasso", 2));
      // Sbadiglio e stiracchiata.
      c.vai(0.6, { ...BOCCA_O, boccaSu: -9, boccaGiu: 9, palpebra: 1, sxSpalla: 95, dxSpalla: 95, sxGomito: -6, dxGomito: -6 });
      c.pausa(0.5);
      // Spegne la lampada.
      c.vai(0.4, { ...SORRISO, palpebra: 0.5, ...mano(l, "dx", POSTI.scrivania + 54, 192), sxSpalla: -40, sxGomito: -60 });
      c.vai(0.05, { lampada: 0 }, "scatto");
      c.pausa(tra(p, 1, 1.6));
      // «Ancora un conto»: la riaccende.
      c.vai(0.2, { palpebra: 0, sbarra: 0.6, cigliaY: -2 });
      c.vai(0.05, { lampada: 1 }, "scatto");
      c.vai(0.4, { sbarra: 0, cigliaY: 0, ...mano(l, "sx", l.centro - 20, 211), ...mano(l, "dx", l.centro + 20, 211) });
    },
  },
  "imprenditore.notte": {
    dove: (p) => luogo(p, POSTI.scrivania, true),
    postura: (l) => ({
      ...allaScrivania(l),
      lampada: 0,
      palpebra: 1,
      ...BOCCA_O,
      fy: 3,
      y: 4,
      ...mano(l, "sx", l.centro - 8, 208),
      ...mano(l, "dx", l.centro + 8, 208),
      corpoAnim: 0,
    }),
    ciclo: (c, l, p) => {
      const respiro = () => {
        c.vai(1.4, { sy: 1.03, boccaSu: -5, boccaGiu: 5, chiomaSy: 1.015 });
        c.evento((r) => r.emetti("zeta", 140, 172, { vx: 16, vy: -24, vita: 2.2, scala: 0.8, cresce: 1.5, giro: -8 }));
        c.vai(1.6, { sy: 0.99, boccaSu: -8, boccaGiu: 8, chiomaSy: 1 });
      };
      respiro();
      respiro();
      if (forse(p, 0.4)) c.evento(fumetto("notteUfficio", 2));
      respiro();
    },
  },
  "imprenditore.deposito": {
    dove: (p) => luogo(p, POSTI.cassaforte + 62),
    postura: (l) => ({ ...inPiedi(l, -0.5), sportello: 0 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.5, 1));
      // Si guarda intorno con aria furba.
      c.vai(0.3, { palpebra: 0.45, palpebraInc: -3, boccaStorta: -3 });
      guardaIntorno(c);
      // Apre lo sportello, mette le ghiande, richiude.
      c.vai(0.4, { ...mano(l, "sx", POSTI.cassaforte + 12, 238, 0, 1.6), sy: 0.94 });
      c.vai(0.5, { sportello: 1 });
      for (let i = 0; i < 2; i++) {
        c.vai(0.35, mano(l, "sx", l.centro - 8, 206));
        prendi(c, "sx", "ghianda");
        c.vai(0.45, mano(l, "sx", POSTI.cassaforte + 4, 242, 0, 1.6));
        prendi(c, "sx", null);
      }
      c.vai(0.45, { sportello: 0 });
      // Gira la combinazione e controlla la maniglia.
      c.vai(0.3, mano(l, "sx", POSTI.cassaforte, 238, 0, 1.6));
      c.vai(0.9, { disco: c.valoreA("disco") + 1.5 }, "io");
      c.oscilla("sxGomito", 6, 2, 0.4).pausa(0.4);
      c.vai(0.4, { sy: 1, palpebra: 0, palpebraInc: 0, boccaStorta: 0, sxSpalla: -50, sxGomito: -8, sxMano: 0, sxAllunga: 1, dxAllunga: 1, disco: 0 });
      c.vai(0.15, { occhiolino: 1 }).pausa(0.3).vai(0.2, { occhiolino: 0 });
    },
  },

  // ——— Cantiere 1: la scrivania (l'albero lavora a sinistra del cantiere, guardando a destra) ———
  "scrivania.0": {
    dove: (p) => luogo(p, POSTI.scrivania - 82),
    postura: (l) => inPiedi(l, 0.5),
    lavoro: (c, l, p) => {
      // Va a prendere i rami (a sinistra), li porta al mucchio: tre viaggi.
      for (let i = 0; i < 3; i++) {
        cammina(c, p, l.x - 70, -0.5);
        c.vai(0.3, { sy: 0.9, ...mano(l, "dx", l.centro - 60, 250, 0, 1.4) }, "in");
        prendi(c, "dx", "ramo");
        c.vai(0.3, { sy: 1, ...mano(l, "dx", l.centro - 60, 200) }, "out");
        cammina(c, p, l.x, 0.5);
        c.vai(0.3, mano(l, "dx", l.centro + 40, 240, 0, 1.4));
        prendi(c, "dx", null);
        c.vai(0.25, { costruzione: (i + 1) * 0.25 });
        c.vai(0.25, { dxSpalla: -50, dxGomito: -8, dxMano: 0, dxAllunga: 1 });
      }
      // Prova un ramo: si spezza. Faccia offesa, lo butta.
      prendi(c, "dx", "ramo");
      c.vai(0.3, { ...mano(l, "dx", l.centro + 18, 190), ...mano(l, "sx", l.centro - 18, 190) });
      c.oscilla("dxGomito", 10, 2, 0.6).pausa(0.6);
      c.evento((r) => {
        r.emetti("polvere", 120, 190, { vx: 20, vy: -30, vita: 0.6, scala: 0.4 });
        r.emetti("polvere", 120, 190, { vx: -20, vy: -30, vita: 0.6, scala: 0.4 });
      });
      prendi(c, "dx", null);
      c.vai(0.25, { ...BOCCA_O, sbarra: 1, cigliaY: -3 }).pausa(0.4);
      c.vai(0.35, { ...SERIO, boccaSu: -3, boccaGiu: -3, sbarra: 0, cigliaY: 1, cigliaRot: 10 });
      c.pausa(0.5).vai(0.3, { cigliaRot: 0, cigliaY: 0, ...SORRISO, sxSpalla: -50, sxGomito: -8, dxSpalla: -50, dxGomito: -8 });
      c.vai(0.4, { costruzione: 1 });
      manoSuiFianchi(c, l);
      c.pausa(0.5);
    },
    ciclo: ritocchi("ramo", [POSTI.scrivania - 20, 246], 0.5),
  },
  "scrivania.1": {
    dove: (p) => luogo(p, POSTI.scrivania - 82),
    postura: (l) => inPiedi(l, 0.5),
    lavoro: (c, l, p) => {
      // Sega: segatura che vola.
      prendi(c, "dx", "sega");
      c.vai(0.35, mano(l, "dx", l.centro + 34, 236, 0, 1.35));
      for (let i = 0; i < 6; i++) {
        c.vai(0.18, mano(l, "dx", l.centro + 48, 236, 0, 1.4)).vai(0.18, mano(l, "dx", l.centro + 30, 236, 0, 1.35));
        if (i % 2) c.evento((r) => r.emetti("polvere", 168, 236, { vx: 10 - 20 * p.rnd(), vy: -20, vita: 0.6, scala: 0.25 }));
      }
      c.con(2.2, { costruzione: 0.55 }).pausa(0.1);
      prendi(c, "dx", "martello");
      // Martella tre chiodi; al terzo prende il dito.
      colpi(c, l, "dx", [l.centro + 50, 196], [l.centro + 56, 230], 2, 0.6, (r) =>
        r.emetti("polvere", 176, 232, { vy: -10, vita: 0.4, scala: 0.25 }),
        { ...mano(l, "sx", l.centro + 52, 234, 0, 1.9) },
        1.4,
      );
      c.vai(0.25, mano(l, "dx", l.centro + 50, 196, 0, 1.4), "out").vai(0.12, mano(l, "dx", l.centro + 54, 232, 0, 1.4), "in");
      c.vai(0.15, { palpebra: 1, ...BOCCA_O, boccaSu: -9, boccaGiu: 9, cigliaY: 2, costruzione: 0.85 }, "out");
      c.evento(fumetto("ahia", 1.6));
      prendi(c, "dx", null);
      // Saltella soffiandosi sul dito.
      c.vai(0.25, { ...mano(l, "sx", l.centro - 10, 186), sxAllunga: 1, dxSpalla: -50, dxGomito: -8, dxAllunga: 1 });
      if (!p.ridotto) {
        for (let i = 0; i < 3; i++) c.vai(0.14, { y: -8, sy: 1.04 }, "out").vai(0.14, { y: 0, sy: 0.97 }, "in");
      }
      c.oscilla("sxMano", 20, 3, 0.6).pausa(0.6);
      c.vai(0.3, { palpebra: 0, cigliaY: 0, ...SORRISO, sy: 1, costruzione: 1, sxSpalla: -50, sxGomito: -8, sxMano: 0 });
    },
    ciclo: ritocchi("martello", [POSTI.scrivania - 16, 238], 0.5),
  },
  "scrivania.2": {
    dove: (p) => luogo(p, POSTI.scrivania - 82),
    postura: (l) => inPiedi(l, 0.5),
    lavoro: (c, l, p) => {
      // Solleva il piano e lo appoggia sul telaio.
      c.vai(0.4, { ...mano(l, "sx", l.centro - 10, 150), ...mano(l, "dx", l.centro + 30, 150), sy: 0.95 });
      c.vai(0.3, { sy: 1.03 }, "out");
      cammina(c, p, l.x + 18, 0.5);
      const l2 = luogo(p, l.centro + 18);
      c.vai(0.35, { ...mano(l2, "sx", l2.centro + 30, 208, 0, 1.3), ...mano(l2, "dx", l2.centro + 60, 208, 0, 1.4), costruzione: 0.45 });
      c.vai(0.3, { sxSpalla: -50, sxGomito: -8, sxAllunga: 1, dxSpalla: -50, dxGomito: -8, dxAllunga: 1, sy: 1 });
      cammina(c, p, l.x, 0.5);
      // La livella: la scrivania balla.
      prendi(c, "dx", "livella");
      c.vai(0.35, mano(l, "dx", POSTI.scrivania - 10, 206, 0, 1.25));
      c.oscilla("scrivaniaY", 1.5, 3, 0.7).pausa(0.7);
      c.vai(0.3, { ...SERIO, boccaStorta: 3, pupY: 2.5 });
      prendi(c, "dx", null);
      // Infila una ghianda sotto la gamba corta.
      const gamba = luogo(p, POSTI.scrivania + 18, true);
      cammina(c, p, gamba.x, 0.5);
      prendi(c, "dx", "ghianda");
      c.vai(0.4, { seduto: 1, ...mano(gamba, "dx", POSTI.scrivania + 52, 258, 0, 1.5) });
      c.pausa(0.2).vai(0.25, { costruzione: 0.8 });
      prendi(c, "dx", null);
      c.vai(0.35, { seduto: 0, dxSpalla: -50, dxGomito: -8, dxMano: 0, dxAllunga: 1 });
      cammina(c, p, l.x, 0.5);
      prendi(c, "dx", "livella");
      c.vai(0.35, mano(l, "dx", POSTI.scrivania - 10, 206, 0, 1.25)).pausa(0.5);
      c.vai(0.3, { ...SORRISO, felice: 1, boccaStorta: 0, pupY: 1, costruzione: 1 });
      prendi(c, "dx", null);
      c.vai(0.3, { dxSpalla: -50, dxGomito: -8, dxMano: 0, dxAllunga: 1, felice: 0 });
      saltelloContento(c, p);
      c.pausa(0.5);
    },
    ciclo: (c, l, p) => {
      // Lucida il piano.
      c.pausa(tra(p, 0.6, 1));
      c.vai(0.4, mano(l, "dx", POSTI.scrivania - 24, 208, 0, 1.2));
      c.oscilla("dxSpalla", 6, 4, 1.4).pausa(1.4);
      c.vai(0.3, { dxSpalla: -50, dxGomito: -8, dxMano: 0, dxAllunga: 1 });
      manoSuiFianchi(c, l);
      sospira(c);
      c.vai(0.3, { sxSpalla: -50, sxGomito: -8, dxSpalla: -50, dxGomito: -8 });
    },
  },
  "scrivania.3": {
    // Il ciclo è seduto alla scrivania nuova; l'inaugurazione si fa davanti.
    dove: (p) => luogo(p, POSTI.scrivania, true),
    postura: (l) => ({ ...allaScrivania(l), nastro: 0, scoiattolo: 0, scoiattoloX: 350 }),
    parteDaSe: true,
    lavoro: (c, _l, p) => {
      const l = luogo(p, POSTI.scrivania - 40);
      c.vai(0.01, { nastro: 1 }, "scatto");
      c.vai(0.4, { scoiattolo: 1, scoiattoloX: 350 }, "back");
      cammina(c, p, l.x, 0.3);
      // Discorso, nastro, forbici.
      c.vai(0.3, { parla: 0.7, ...mano(l, "sx", l.centro - 30, 160) });
      c.evento(fumetto("inaugura", 2.2));
      c.pausa(1.8).vai(0.2, { parla: 0 });
      prendi(c, "dx", "forbici");
      c.vai(0.4, mano(l, "dx", POSTI.scrivania, 226, 0, 1.4));
      c.oscilla("dxMano", 10, 2, 0.4).pausa(0.4);
      c.vai(0.01, { nastro: 0 }, "scatto");
      c.evento((r) => {
        for (let i = 0; i < 6; i++) r.emetti("stella", 120 + 80 * (r.ridotto ? 0 : 1) * (Math.random() - 0.5), 150 + 40 * Math.random(), { vy: -20, vita: 1, scala: 0.8 });
      });
      c.vai(0.15, { scoiattoloSu: 10 }, "out").vai(0.2, { scoiattoloSu: 0 }, "in").vai(0.15, { scoiattoloSu: 10 }, "out").vai(0.2, { scoiattoloSu: 0 }, "in");
      prendi(c, "dx", null);
      c.vai(0.3, { felice: 1, ...RISATA, dxSpalla: -50, dxGomito: -8, dxMano: 0, dxAllunga: 1, sxSpalla: -50, sxGomito: -8 });
      saltelloContento(c, p);
      // Si siede per la prima volta e gira sulla sedia.
      const sedia = luogo(p, POSTI.scrivania, true);
      cammina(c, p, sedia.x, 0);
      siediti(c, p);
      c.vai(0.25, { verso: -1 }).vai(0.25, { verso: 1 }).vai(0.25, { verso: -1 }).vai(0.3, { verso: 0, felice: 0, ...SORRISO, costruzione: 1 });
      c.vai(0.4, { ...mano(sedia, "sx", sedia.centro - 20, 211), ...mano(sedia, "dx", sedia.centro + 20, 211), scoiattolo: 0 });
    },
    ciclo: (c, l, p) => {
      // Ammira la scrivania nuova e la accarezza.
      c.pausa(tra(p, 0.8, 1.5));
      c.vai(0.4, mano(l, "dx", POSTI.scrivania - 30, 208, 0, 1.2));
      c.oscilla("dxSpalla", 5, 3, 1).pausa(1);
      c.vai(0.3, { dxSpalla: -50, dxGomito: -8, dxMano: 0, dxAllunga: 1, felice: 1 });
      sospira(c);
      c.vai(0.3, { felice: 0 });
    },
  },

  // ——— Cantiere 2: l'insegna ———
  "insegna.0": {
    dove: (p) => luogo(p, POSTI.insegna - 46, true),
    postura: (l) => ({ ...inPiedi(l, 0.5), seduto: 1 }),
    lavoro: (c, l) => {
      prendi(c, "dx", "pennello");
      c.vai(0.4, { ...mano(l, "dx", POSTI.insegna - 28, 254, 0, 1.6), pupY: 2.5, palpebra: 0.3 });
      for (let i = 0; i < 5; i++) {
        c.vai(0.4, mano(l, "dx", POSTI.insegna - 28 + i * 13, 252, 0, 1.6)).oscilla("dxMano", 10, 1, 0.3);
        c.con(0.4, { costruzione: (i + 1) * 0.2 });
      }
      // Una lettera è al contrario: la corregge.
      c.vai(0.3, { ...BOCCA_O, sbarra: 0.6 }).pausa(0.4);
      c.vai(0.4, mano(l, "dx", POSTI.insegna - 2, 254, 0, 1.6)).oscilla("dxMano", 14, 2, 0.6).pausa(0.6);
      c.vai(0.3, { ...SORRISO, sbarra: 0, palpebra: 0, pupY: 1, costruzione: 1 });
      prendi(c, "dx", null);
    },
    ciclo: ritocchi("pennello", [POSTI.insegna - 14, 254], 0.5),
  },
  "insegna.1": {
    dove: (p) => luogo(p, POSTI.insegna - 46, true),
    postura: (l) => ({ ...inPiedi(l, 0.5), seduto: 1 }),
    lavoro: (c, l) => {
      prendi(c, "dx", "pennello");
      for (let i = 0; i < 4; i++) {
        c.vai(0.5, mano(l, "dx", POSTI.insegna - 30 + i * 20, 255, 0, 1.6));
        c.oscilla("dxMano", 12, 2, 0.5).con(0.5, { costruzione: (i + 1) * 0.25 }).pausa(0.5);
      }
      c.vai(0.3, { felice: 1, dxAllunga: 1, dxSpalla: -50, dxGomito: -8 }).pausa(0.6).vai(0.3, { felice: 0 });
      prendi(c, "dx", null);
    },
    ciclo: ritocchi("pennello", [POSTI.insegna + 10, 255], 0.5),
  },
  "insegna.2": {
    dove: (p) => luogo(p, POSTI.insegna - 52),
    postura: (l) => ({ ...inPiedi(l, 0.5), insegnaRot: 0 }),
    lavoro: (c, l, p) => {
      // La solleva e la appende al palo: storta.
      c.vai(0.4, { ...mano(l, "sx", l.centro + 20, 200), ...mano(l, "dx", l.centro + 50, 200, 0, 1.2), sy: 0.95 });
      c.vai(0.5, { ...mano(l, "sx", l.centro + 26, 150, 0, 1.4), ...mano(l, "dx", l.centro + 52, 150, 0, 1.5), sy: 1.04 });
      c.vai(0.01, { costruzione: 0.6, insegnaRot: 12 }, "scatto");
      c.vai(0.4, { sxSpalla: -50, sxGomito: -8, dxSpalla: -50, dxGomito: -8, sxAllunga: 1, dxAllunga: 1, sy: 1 });
      // Un passo indietro: è storta.
      c.vai(0.5, { x: l.x - 14, rot: -4, boccaStorta: 3, pupY: -1.5 });
      c.pausa(0.6);
      c.vai(0.5, { x: l.x, rot: 0 });
      // Un colpetto e si raddrizza (con un rimbalzo).
      c.vai(0.3, mano(l, "dx", POSTI.insegna - 30, 160, 0, 1.5));
      c.vai(0.6, { insegnaRot: 0, costruzione: 1 }, "molla");
      c.vai(0.3, { dxSpalla: -50, dxGomito: -8, dxMano: 0, dxAllunga: 1, ...SORRISO, boccaStorta: 0, pupY: 1, felice: 1 });
      saltelloContento(c, p);
      c.vai(0.3, { felice: 0 });
    },
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.8, 1.4));
      c.vai(0.5, { x: l.x - 10, pupY: -2, verso: 0.6 });
      manoSuiFianchi(c, l);
      sospira(c);
      c.vai(0.4, { x: l.x, pupY: 1, verso: 0.5, sxSpalla: -50, sxGomito: -8, dxSpalla: -50, dxGomito: -8 });
    },
  },

  // ——— Cantiere 3: la cassaforte (l'albero lavora a destra, guardando a sinistra) ———
  "cassaforte.0": {
    dove: (p) => luogo(p, POSTI.cassaforte + 62),
    postura: (l) => inPiedi(l, -0.5),
    lavoro: (c, l) => {
      prendi(c, "sx", "pala");
      for (let i = 0; i < 4; i++) {
        c.vai(0.35, { ...mano(l, "sx", POSTI.cassaforte + 20, 246, 0, 1.6), sy: 0.93 }, "in");
        c.vai(0.35, { ...mano(l, "sx", l.centro - 10, 186), sy: 1 }, "out");
        c.evento((r) => r.emetti("polvere", 70, 200, { vx: -40, vy: -40, gravita: 200, vita: 0.7, scala: 0.4 }));
        c.con(0.2, { costruzione: (i + 1) * 0.25 });
      }
      c.vai(0.3, { sxSpalla: -50, sxGomito: -8, sxAllunga: 1 });
      prendi(c, "sx", null);
      asciugaFronte(c, l);
    },
    ciclo: ritocchi("pala", [POSTI.cassaforte + 20, 250], -0.5, "sx"),
  },
  "cassaforte.1": {
    dove: (p) => luogo(p, POSTI.cassaforte + 62),
    postura: (l) => inPiedi(l, -0.5),
    lavoro: (c, l, p) => {
      // La cassa compare (la mette giù), poi la fissa col martello.
      c.vai(0.4, { ...mano(l, "sx", POSTI.cassaforte + 10, 212, 0, 1.4), ...mano(l, "dx", POSTI.cassaforte + 30, 212, 0, 1.6), sy: 0.95 });
      c.vai(0.6, { costruzione: 0.6 }, "out");
      c.vai(0.3, { sy: 1, sxSpalla: -50, sxGomito: -8, sxAllunga: 1, dxAllunga: 1 });
      prendi(c, "sx", "martello");
      colpi(c, l, "sx", [POSTI.cassaforte + 30, 200], [POSTI.cassaforte + 24, 230], 3, 0.6, (r) => r.emetti("polvere", 66, 226, { vy: -10, vita: 0.4, scala: 0.25 }), {}, 1.5);
      prendi(c, "sx", null);
      c.vai(0.3, { costruzione: 1, sxSpalla: -50, sxGomito: -8, sxMano: 0, sxAllunga: 1, dxSpalla: -50, dxGomito: -8, dxAllunga: 1 });
      saltelloContento(c, p);
    },
    ciclo: ritocchi("martello", [POSTI.cassaforte + 24, 232], -0.5, "sx"),
  },
  "cassaforte.2": {
    dove: (p) => luogo(p, POSTI.cassaforte + 62),
    postura: (l) => ({ ...inPiedi(l, -0.5), disco: 0 }),
    lavoro: (c, l) => {
      // Sceglie la combinazione, la scrive su una foglia... e la dimentica.
      c.vai(0.35, mano(l, "sx", POSTI.cassaforte, 238, 0, 1.6));
      c.vai(1.2, { disco: 2.5, palpebra: 0.4, pupX: -2 }, "io");
      prendi(c, "dx", "penna");
      c.vai(0.35, { ...mano(l, "dx", l.centro + 4, 196), pupY: 2.5 });
      c.oscilla("dxMano", 8, 3, 0.7).pausa(0.7);
      prendi(c, "dx", null);
      c.vai(0.3, { dxSpalla: -50, dxGomito: -8, dxMano: 0, sxSpalla: -50, sxGomito: -8, sxAllunga: 1, pupY: 1, palpebra: 0, pupX: 0 });
      // Un attimo dopo: com'era?
      c.vai(0.3, { ...BOCCA_O, sbarra: 0.8, cigliaY: -3 });
      c.evento(fumetto("combinazione", 2));
      c.vai(0.4, mano(l, "dx", l.centro + 34, 134, 0, 1.4));
      c.oscilla("dxGomito", 9, 3, 0.8).pausa(0.8);
      c.vai(0.4, { dxSpalla: -50, dxGomito: -8, dxAllunga: 1, ...SORRISO, sbarra: 0, cigliaY: 0, costruzione: 1, disco: 0 });
    },
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.8, 1.2));
      c.vai(0.35, mano(l, "sx", POSTI.cassaforte, 238, 0, 1.6));
      c.vai(1, { disco: 1.5 }, "io");
      c.oscilla("sxGomito", 6, 2, 0.4).pausa(0.4);
      c.vai(0.4, { disco: 0, sxSpalla: -50, sxGomito: -8, sxAllunga: 1 });
      sospira(c);
    },
  },
};

/** La scena da recitare adesso, se il mestiere ne ha una animata. */
export function scenaDelMestiere(m: StatoMestiere | null | undefined): { id: string; scena: ScenaLavoro } | null {
  if (!m?.adesso) return null;
  const id = "attivita" in m.adesso ? m.adesso.attivita : `${m.adesso.cantiere}.${m.adesso.passo}`;
  const scena = SCENE[id];
  return scena ? { id, scena } : null;
}

/** I canali al lavoro: la posa della pagina più la postura del posto. */
export function baseAlLavoro(scena: ScenaLavoro, b: Canali, p: Palco): Canali {
  const l = scena.dove(p);
  return { ...b, ...scena.postura(l, b), costruzione: 1 } as Canali;
}

/** Il primo giro: va al suo posto e, se è un cantiere, fa il lavoro vero. */
export function entrata(scena: ScenaLavoro, b: Canali, p: Palco): Clip {
  const l = scena.dove(p);
  const arrivo = scena.postura(l, b);
  const inizio: Canali = { ...b, costruzione: scena.lavoro ? 0 : 1 };
  const c = new Copione(inizio);
  // Gli attrezzi di quello che faceva prima spariscono (scatto: non passano dagli altri).
  c.vai(0.01, { attrSx: 0, attrDx: 0 }, "scatto");
  c.pausa(0.3);
  if (!scena.parteDaSe) {
    if (b.seduto > 0.5 && !l.seduto) alzati(c, p);
    cammina(c, p, l.x, (arrivo.verso as number | undefined) ?? 0);
    if (l.seduto) siediti(c, p);
    const { costruzione: _c, ...resto } = arrivo;
    void _c;
    c.vai(0.45, resto);
  }
  if (scena.lavoro) scena.lavoro(c, l, p);
  // Chiude sulla postura: da qui riparte il ciclo.
  c.vai(0.4, { ...arrivo, costruzione: 1 });
  return c.chiudi();
}

/** Un giro del ciclo, che parte e finisce nella postura. */
export function ciclo(scena: ScenaLavoro, base: Canali, p: Palco): Clip {
  const l = scena.dove(p);
  const c = new Copione(base);
  scena.ciclo(c, l, p, base);
  return c.fine(0.5);
}

export type { ScenaLavoro };
