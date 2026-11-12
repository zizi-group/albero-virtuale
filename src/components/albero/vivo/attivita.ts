import type { Canali, Lato } from "./canali";
import type { Copione, Regia } from "./copione";
import {
  alzati,
  annuisce,
  annusa,
  asciugaFronte,
  assaggia,
  beve,
  BOCCA_O,
  BRACCIA_GIU,
  cammina,
  chinati,
  contaDita,
  FELICE,
  fischia,
  grattaCorteccia,
  guardaLontano,
  impila,
  inchino,
  indica,
  intreccia,
  lancia,
  luogo,
  mano,
  manoAlMento,
  manoSuiFianchi,
  mescola,
  posaGiu,
  prendi,
  raccogli,
  rastrella,
  rialzati,
  ride,
  salta,
  saluta,
  sbadiglia,
  scava,
  scrollati,
  scuoteTesta,
  SERIO,
  sfrega,
  siediti,
  soffia,
  sospira,
  SORRISO,
  spazza,
  starnutisce,
  stiracchia,
  strizza,
  strofina,
  tira,
  trema,
  versa,
  type Luogo,
} from "./gesti";
import type { ScenaLavoro } from "./mestiere";
import type { Palco } from "./scenette";
import { POSTI_SCENA as P, postoStretto, scalaStretta } from "./tracce";

// Le scenette delle attività quotidiane della 0.2 (docs/stanze-e-vita.md, 5.1 e 8).
// Ognuna è una scena come quelle dei mestieri (vivo/mestiere.ts): un posto,
// una postura, a volte un lavoro vero la prima volta (il fuoco che si accende,
// l'aiuola che si zappa: il canale «costruzione» va da 0 a 1) e un ciclo che si
// ripete con varianti. Ogni attività ha la sua sequenza di gesti (vivo/gesti.ts):
// due attività non si somigliano mai del tutto. Tra un ciclo e l'altro, ogni
// tanto, un intermezzo (INTERMEZZI, sezione 5.5).

const tra = (p: Palco, a: number, b: number) => a + p.rnd() * (b - a);
const forse = (p: Palco, x: number) => p.rnd() < x;
const pesca = <T>(p: Palco, v: T[]) => v[Math.floor(p.rnd() * v.length)];
const dice =
  (testo: string, durata = 2.2) =>
  (r: Regia) =>
    r.fumetto(testo, durata);
const FERMO = {
  passo: 0,
  braccioPasso: 0,
  sxAnim: 0,
  dxAnim: 0,
  corpoAnim: 0.4,
  parla: 0,
  sxAllunga: 1,
  dxAllunga: 1,
  sxOgg: 0,
  dxOgg: 0,
};

/** In piedi al suo posto, braccia giù, guardando da una parte. */
const ritto = (
  l: Luogo,
  guarda = 0,
  extra: Partial<Canali> = {},
): Partial<Canali> => ({
  ...FERMO,
  x: l.x,
  verso: guarda,
  seduto: 0,
  ...BRACCIA_GIU,
  ...SORRISO,
  palpebra: 0,
  felice: 0,
  ...extra,
});

/** Seduto per terra al suo posto. */
const sedutoA = (
  l: Luogo,
  guarda = 0,
  extra: Partial<Canali> = {},
): Partial<Canali> => ({
  ...ritto(l, guarda),
  seduto: 1,
  ...mano(l, "sx", l.centro - 22, 226),
  ...mano(l, "dx", l.centro + 22, 226),
  ...extra,
});

const braccioGiu = (lato: Lato): Partial<Canali> =>
  ({
    [`${lato}Spalla`]: -50,
    [`${lato}Gomito`]: -8,
    [`${lato}Mano`]: 0,
    [`${lato}Allunga`]: 1,
    [`${lato}Ogg`]: 0,
  }) as Partial<Canali>;

/** Torna al suo posto a piedi (il ciclo finisce dove è cominciato). */
const torna = (c: Copione, p: Palco, l: Luogo, guarda: number) =>
  cammina(c, p, l.x, guarda);

const CASA = (p: Palco) => luogo(p, 120);

// Il prato si stringe sugli schermi stretti (vivo/tracce.tsx): gli oggetti si avvicinano
// all'albero e si rimpiccioliscono, l'albero no.
/** Un punto su un oggetto del prato, a `d` dal suo centro (la distanza si rimpicciolisce con il disegno). */
const X = (p: Palco, x: number, d = 0) =>
  postoStretto(x, p.stringi ?? 1) + d * scalaStretta(p.stringi ?? 1);
/** Dove sta l'albero accanto a un oggetto del prato (l'albero non rimpicciolisce: la distanza resta). */
const D = (p: Palco, x: number, d = 0) => postoStretto(x, p.stringi ?? 1) + d;
/** Un'altezza su un oggetto del prato rimpicciolito (il terreno è a y = 262). */
const Y = (p: Palco, y: number) =>
  262 - (262 - y) * scalaStretta(p.stringi ?? 1);

// ——— Le frasi delle attività (brevi, innocue, mai su persone o marchi reali) ———

const FRASI = {
  sveglia: [
    "Ancora cinque minuti…",
    "Buongiorno, mondo!",
    "Chi ha spento il sole?",
  ],
  colazione: [
    "Rugiada fresca, la migliore.",
    "Colazione dei campioni!",
    "Gnam.",
  ],
  ginnastica: [
    "Uno, due! Uno, due!",
    "Le radici, allungare le radici!",
    "Ancora una… forse.",
  ],
  rastrello: ["Quante foglie!", "Un mucchio perfetto.", "Etciù! Polline."],
  uccelli: ["Cip cip anche a te!", "Che bella voce!", "Torna domani!"],
  rugiada: [
    "Acqua di scorta.",
    "Una goccia alla volta.",
    "Il secchio si riempie.",
  ],
  scopa: ["Che disordine!", "Ecco fatto.", "La polvere scappa sempre."],
  vento: ["Vento da nord… credo.", "Tira un'arietta!", "Niente vento. Strano."],
  zappa: ["Qui verrà un orto!", "Che fatica, la terra.", "Zappa e sorridi."],
  annaffia: ["Bevete, piantine!", "Crescete, crescete!", "Che sete avevate."],
  rami: ["Questo è perfetto.", "Legna per stasera.", "Un altro ramo!"],
  bacche: ["Mmm, mature!", "Una per il cesto, una per me.", "Aspra! Ma buona."],
  schiaccia: ["Splat!", "Succo di bacche!", "Che colore!"],
  regalo: ["Per te, scoiattolo!", "Fatta con le mie radici.", "Ti piace?"],
  semi: ["Semini, crescete!", "Uno qui, uno là.", "Ci vediamo in primavera."],
  raccolto: ["Eccola!", "Che carota!", "Che orto generoso!"],
  ghiande: ["Sento odore di ghiande…", "Trovata!", "Una per la scorta."],
  sassi: ["Questo è perfetto.", "Questo no.", "Un sasso da collezione."],
  intreccio: ["Una corda d'erba.", "Sopra, sotto, sopra…", "Resisterà?"],
  bolle: ["Bolle!", "Prendila!", "Pop!"],
  bucato: [
    "Che profumo di pulito.",
    "Strizza, strizza.",
    "Al sole ad asciugare.",
  ],
  tuffo: ["Uno… due… tre!", "Che morbido!", "Ancora!"],
  fuoco: ["Dai, accenditi!", "Ce l'ho fatta!", "Che bel calduccio."],
  castagne: ["Scotta, scotta!", "Castagne calde!", "Questa è perfetta."],
  storie: [
    "C'era una volta un ghiro…",
    "E allora la lumaca disse…",
    "E vissero felici e frondosi.",
  ],
  marmellata: ["Profumo di bacche…", "Un vasetto, due vasetti.", "Gira, gira."],
  zuppa: ["Una zuppa calda.", "Un pizzico di erbette.", "Che profumino!"],
  stelle: [
    "Quella sembra una ghianda!",
    "E quella una foglia.",
    "Un'orsa? Un orsetto.",
  ],
  secchio: ["Acqua gratis dal cielo!", "Si riempie da solo.", "Che affare!"],
  pozzanghere: ["Splash!", "Ancora!", "Tutto bagnato, che bello."],
};

// ——— Le scene ———

export const ATTIVITA: Record<string, ScenaLavoro> = {
  // ——— Mattina ———
  svegliarsi: {
    dove: CASA,
    postura: (l) => ritto(l, 0, { palpebra: 0.3 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.9));
      sbadiglia(c, p);
      // Si strofina gli occhi.
      c.vai(0.35, {
        ...mano(l, "sx", l.centro - 9, 166),
        ...mano(l, "dx", l.centro + 9, 166),
        palpebra: 1,
      });
      c.oscilla("sxMano", 18, 3, 0.7).oscilla("dxMano", -18, 3, 0.7).pausa(0.7);
      c.vai(0.3, { ...BRACCIA_GIU, palpebra: 0.2 });
      stiracchia(c, p);
      if (forse(p, 0.5)) grattaCorteccia(c, p, l);
      c.evento(dice(pesca(p, FRASI.sveglia)));
      annuisce(c, 1);
      c.vai(0.3, { palpebra: 0.3 });
    },
  },
  "colazione-rugiada": {
    dove: (p) => luogo(p, 150),
    postura: (l) => ritto(l, 0.4),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      prendi(c, "dx", "tazza");
      // Raccoglie una goccia da un filo d'erba.
      chinati(c, p);
      c.vai(0.4, mano(l, "dx", l.centro + 34, 240, 0, 1.5));
      c.oscilla("dxMano", 12, 2, 0.5).pausa(0.5);
      c.evento((r) =>
        r.emetti("goccia", l.centro + 36, 226, {
          vy: 10,
          gravita: 120,
          vita: 0.5,
          mondo: true,
        }),
      );
      rialzati(c);
      c.vai(0.3, mano(l, "dx", l.centro + 18, 196));
      beve(c, l, "dx", 1 + Math.floor(p.rnd() * 2));
      c.evento(dice(pesca(p, FRASI.colazione)));
      sospira(c);
      c.vai(0.3, braccioGiu("dx"));
      prendi(c, "dx", null);
    },
  },
  ginnastica: {
    dove: CASA,
    postura: (l) => ritto(l),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.3, 0.6));
      c.evento(dice(pesca(p, FRASI.ginnastica), 1.8));
      // Braccia su e giù a tempo, con un saltello.
      for (let i = 0; i < 3; i++) {
        c.vai(
          0.25,
          { sxSpalla: 80, dxSpalla: 80, sxGomito: -4, dxGomito: -4 },
          "out",
        );
        salta(c, p, 10);
        c.vai(0.25, { ...BRACCIA_GIU }, "in");
      }
      // Si piega a toccare le radici.
      for (let i = 0; i < 2; i++) {
        chinati(c, p, 1.2);
        c.vai(0.3, {
          ...mano(l, "sx", l.centro - 12, 248, 0, 1.6),
          ...mano(l, "dx", l.centro + 12, 248, 0, 1.6),
        });
        rialzati(c, 0.3);
        c.vai(0.25, BRACCIA_GIU);
      }
      contaDita(c, l, 3);
      asciugaFronte(c, l);
      c.vai(0.3, braccioGiu("dx"));
    },
  },
  "rastrellare-foglie": {
    dove: (p) => luogo(p, D(p, P.mucchio, +50)),
    postura: (l) => ritto(l, -0.5, { mucchioIn: 1 }),
    lavoro: (c, l, p) => {
      prendi(c, "dx", "rastrello");
      rastrella(c, p, l, l.centro + 6, X(p, P.mucchio, +18), 3);
      c.vai(0.4, { costruzione: 1 });
      c.vai(0.3, BRACCIA_GIU);
      prendi(c, "dx", null);
      manoSuiFianchi(c, l);
    },
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      prendi(c, "dx", "rastrello");
      rastrella(
        c,
        p,
        l,
        l.centro + 10,
        X(p, P.mucchio, +20),
        2 + Math.floor(p.rnd() * 2),
      );
      c.vai(0.3, BRACCIA_GIU);
      if (forse(p, 0.6)) starnutisce(c, p);
      else c.evento(dice(pesca(p, FRASI.rastrello)));
      // Batte il mucchio per sistemarlo.
      chinati(c, p, 0.8);
      c.vai(0.3, mano(l, "sx", X(p, P.mucchio, +16), 236, 0, 1.5));
      c.oscilla("sxGomito", 10, 3, 0.6).pausa(0.6);
      rialzati(c);
      c.vai(0.3, braccioGiu("sx"));
      prendi(c, "dx", null);
    },
  },
  "salutare-uccelli": {
    dove: CASA,
    postura: (l) =>
      ritto(l, 0, { uccello: 0, uccelloX: l.centro + 150, uccelloY: 20 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.5, 1));
      guardaLontano(c, l, "sx", 1);
      // Arriva l'uccellino e si posa sul ramo.
      c.vai(0.2, { uccello: 1 });
      c.con(1.4, { uccelloX: l.centro + 50, uccelloY: 92 }, "out").vai(0.6, {
        pupX: 2.4,
        pupY: -2,
        verso: 0.3,
      });
      c.pausa(0.8);
      saluta(c, l, "dx", 3);
      c.vai(0.3, braccioGiu("dx"));
      fischia(c, 1.4);
      // Risponde.
      for (let i = 0; i < 3; i++)
        c.evento(
          (r) =>
            r.emetti("nota", l.centro + 54, 80, {
              vx: -14,
              vy: -24,
              vita: 1.2,
              scala: 0.7,
              mondo: true,
            }),
          i * 0.35,
        );
      c.vai(0.3, FELICE).pausa(1);
      c.evento(dice(pesca(p, FRASI.uccelli)));
      // Vola via.
      c.con(1.2, { uccelloX: l.centro - 160, uccelloY: -20 }, "in").pausa(1.2);
      c.vai(0.2, { uccello: 0, felice: 0, pupX: 0, pupY: 1, verso: 0 });
    },
  },
  "raccogliere-rugiada": {
    dove: (p) => luogo(p, D(p, P.secchio, -34)),
    postura: (l) => ritto(l, 0.4, { secchio: 1, acqua: 0.3 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      // Va sull'erba bagnata, raccoglie gocce con la mano e le porta al secchio.
      const erba = l.x - 40;
      cammina(c, p, erba, -0.4);
      const qua = luogo(p, l.centro - 40);
      for (let i = 0; i < 2; i++) {
        chinati(c, p);
        c.vai(0.35, mano(qua, "dx", qua.centro - 20 + i * 12, 244, 0, 1.6));
        c.oscilla("dxMano", 15, 2, 0.4).pausa(0.4);
        c.evento((r) =>
          r.emetti("goccia", qua.centro - 18 + i * 12, 238, {
            vy: -40,
            gravita: 200,
            vita: 0.5,
            mondo: true,
          }),
        );
        rialzati(c, 0.3);
      }
      c.vai(0.3, braccioGiu("dx"));
      cammina(c, p, l.x, 0.4);
      versa(c, l, "dx", X(p, P.secchio), 240, 0.8);
      c.con(0.8, { acqua: 0.7 }).pausa(0.2);
      chinati(c, p, 0.7);
      c.vai(0.4, { pupY: 2.8 }).pausa(0.4);
      rialzati(c);
      c.evento(dice(pesca(p, FRASI.rugiada)));
      annuisce(c);
      c.vai(0.3, braccioGiu("dx"));
    },
  },
  spazzare: {
    dove: (p) => luogo(p, 84),
    postura: (l) => ritto(l, -0.2),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.3, 0.6));
      prendi(c, "dx", "scopa");
      spazza(c, p, l, l.centro - 14, 6);
      // Si appoggia alla scopa e sospira.
      c.vai(0.4, {
        ...mano(l, "dx", l.centro + 18, 176),
        ...mano(l, "sx", l.centro + 12, 180),
        rot: p.ridotto ? 0 : 3,
        palpebra: 0.5,
      });
      sospira(c);
      if (forse(p, 0.4)) c.evento(dice(pesca(p, FRASI.scopa)));
      c.vai(0.3, { rot: 0, palpebra: 0 });
      spazza(c, p, l, l.centro + 18, 4);
      if (forse(p, 0.3)) starnutisce(c, p);
      c.vai(0.3, BRACCIA_GIU);
      prendi(c, "dx", null);
    },
  },
  "dito-bagnato": {
    dove: CASA,
    postura: (l) => ritto(l),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.9));
      // Si lecca il dito.
      c.vai(0.35, mano(l, "dx", l.centro + 3, 182, -30));
      c.vai(0.2, { ...BOCCA_O, boccaL: 2.5 })
        .pausa(0.3)
        .vai(0.2, SERIO);
      // Lo alza al vento e aspetta, serio.
      c.vai(0.45, {
        ...mano(l, "dx", l.centro + 30, 118, 0, 1.2),
        pupX: 2,
        pupY: -2.5,
        palpebra: 0.3,
      });
      c.oscilla("dxMano", 6, 2, 1).pausa(1.2);
      c.vai(0.4, { verso: forse(p, 0.5) ? 0.4 : -0.4 }).pausa(0.4);
      if (forse(p, 0.6)) annuisce(c, 2);
      else scuoteTesta(c, 2);
      c.evento(dice(pesca(p, FRASI.vento)));
      c.pausa(0.5);
      c.vai(0.35, {
        ...braccioGiu("dx"),
        verso: 0,
        pupX: 0,
        pupY: 1,
        palpebra: 0,
        ...SORRISO,
      });
    },
  },
  "zappare-aiuola": {
    dove: (p) => luogo(p, D(p, P.orto, -44)),
    postura: (l) => ritto(l, 0.6, { ortoA: 1 }),
    lavoro: (c, l, p) => {
      prendi(c, "dx", "zappa");
      scava(c, p, l, X(p, P.orto, -14), 4);
      c.vai(0.6, { costruzione: 1 });
      prendi(c, "dx", null);
      asciugaFronte(c, l);
      manoSuiFianchi(c, l);
    },
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      prendi(c, "dx", "zappa");
      scava(c, p, l, X(p, P.orto, -14 + Math.round(tra(p, -6, 10))), 3);
      c.vai(0.3, BRACCIA_GIU);
      prendi(c, "dx", null);
      if (forse(p, 0.5)) asciugaFronte(c, l);
      c.evento(dice(pesca(p, FRASI.zappa)));
      manoSuiFianchi(c, l);
      sospira(c);
      c.vai(0.3, BRACCIA_GIU);
    },
  },
  "annaffiare-orto": {
    dove: (p) => luogo(p, D(p, P.orto, -42)),
    postura: (l) => ritto(l, 0.6),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      prendi(c, "dx", "annaffiatoio");
      versa(c, l, "dx", X(p, P.orto, -14), 244, 1.2);
      versa(c, l, "dx", X(p, P.orto, +6), 244, 1);
      c.vai(0.3, braccioGiu("dx"));
      prendi(c, "dx", null);
      // Controlla le piantine da vicino.
      chinati(c, p);
      c.vai(0.5, { pupX: 2, pupY: 2.8 }).pausa(0.6);
      rialzati(c);
      c.evento(dice(pesca(p, FRASI.annaffia)));
      annuisce(c);
      c.vai(0.25, FELICE).pausa(0.4).vai(0.25, { felice: 0, pupX: 0 });
    },
  },

  // ——— Giorno e pomeriggio ———
  "raccogliere-rami": {
    dove: (p) => luogo(p, D(p, P.catasta, +40)),
    postura: (l) => ritto(l, -0.4, { legnaIn: 3 }),
    lavoro: (c, l, p) => {
      for (let i = 0; i < 3; i++) {
        raccogli(c, p, l, "dx", l.centro + 26 - i * 6, "ramo");
        c.vai(0.3, mano(l, "dx", X(p, P.catasta, +6), 236, 0, 1.4));
        prendi(c, "dx", null);
        c.con(0.3, { costruzione: (i + 1) / 3 }).vai(0.3, braccioGiu("dx"));
      }
      manoSuiFianchi(c, l);
    },
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      // Va a cercare un ramo lontano, lo prova (si spezza?), lo porta alla catasta.
      const lontano = Math.max(-p.spazioSx, Math.min(p.spazioDx, l.x + (forse(p, 0.5) ? -60 : 70)));
      cammina(c, p, lontano, 0);
      const qua = luogo(p, l.centro + (lontano - l.x));
      raccogli(c, p, qua, "dx", qua.centro + 10, "ramo");
      c.vai(0.3, { pupX: 2, pupY: 1.5 }).pausa(0.3);
      if (forse(p, 0.3)) {
        // Lo piega: crac!
        c.vai(0.25, mano(qua, "sx", qua.centro + 4, 198));
        c.vai(0.15, { sxMano: -30, dxMano: 30 }, "in");
        c.evento((r) =>
          r.emetti("polvere", qua.centro + 12, 196, {
            vy: -20,
            vita: 0.5,
            scala: 0.4,
            mondo: true,
          }),
        );
        c.vai(0.2, { sbarra: 0.8, ...BOCCA_O })
          .pausa(0.4)
          .vai(0.25, { sbarra: 0, ...SORRISO, sxMano: 0, dxMano: 0 });
      }
      c.evento(dice(pesca(p, FRASI.rami)));
      cammina(c, p, l.x, -0.4);
      impila(c, l, "dx", X(p, P.catasta, +4), 240, 1);
      prendi(c, "dx", null);
      c.vai(0.3, BRACCIA_GIU);
      manoSuiFianchi(c, l);
    },
  },
  "raccogliere-bacche": {
    dove: (p) => luogo(p, D(p, P.cespuglio, +44)),
    postura: (l) => ritto(l, -0.6, { cespuglio: 1 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.3, 0.6));
      prendi(c, "sx", "cesto");
      c.vai(0.3, mano(l, "sx", l.centro - 4, 206));
      for (let i = 0; i < 3; i++) {
        c.vai(
          0.4,
          mano(
            l,
            "dx",
            X(p, P.cespuglio, +14 + i * 4),
            Y(p, 226 + i * 8),
            0,
            1.5,
          ),
          "out",
        );
        c.oscilla("dxMano", 14, 2, 0.35).pausa(0.35);
        c.evento((r) =>
          r.emetti("succo", X(p, P.cespuglio, +14 + i * 4), Y(p, 228 + i * 8), {
            vy: -6,
            vita: 0.4,
            scala: 0.6,
            mondo: true,
          }),
        );
        c.vai(0.35, mano(l, "dx", l.centro - 2, 200), "in");
      }
      // Una la assaggia.
      assaggia(c, l, "dx", forse(p, 0.7));
      c.evento(dice(pesca(p, FRASI.bacche)));
      c.vai(0.3, BRACCIA_GIU);
      prendi(c, "sx", null);
    },
  },
  "schiacciare-bacche": {
    dove: (p) => luogo(p, D(p, P.ciotola, +40)),
    postura: (l) => ritto(l, -0.5, { ciotola: 1 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.3, 0.6));
      prendi(c, "dx", "mestolo");
      scava(
        c,
        p,
        l,
        X(p, P.ciotola, +4),
        4,
        (r) => {
          for (let k = 0; k < 2; k++)
            r.emetti("succo", X(p, P.ciotola, +(k ? 6 : -6)), 248, {
              vx: k ? 40 : -40,
              vy: -60,
              gravita: 300,
              vita: 0.7,
              scala: 0.7,
              mondo: true,
            });
        },
        Y(p, 214),
      );
      c.vai(0.3, BRACCIA_GIU);
      prendi(c, "dx", null);
      c.evento(dice(pesca(p, FRASI.schiaccia)));
      // Si lecca il dito sporco di succo.
      assaggia(c, l, "sx", true);
      if (forse(p, 0.5)) ride(c, p, 0.8);
    },
  },
  "regalare-marmellata": {
    dove: CASA,
    postura: (l) =>
      ritto(l, -0.3, { scoiattolo: 0, scoiattoloX: -200, scoiattoloSu: 0 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      raccogli(c, p, l, "dx", l.centro + 20, "vasetto");
      // Arriva lo scoiattolo.
      c.vai(0.2, { scoiattolo: 1 }).vai(
        1.1,
        { scoiattoloX: l.centro - 62 },
        "out",
      );
      c.vai(0.3, { verso: -0.6, pupX: -2.5 });
      c.evento(dice(pesca(p, FRASI.regalo)));
      c.vai(0.45, mano(l, "dx", l.centro - 46, 220, 0, 1.4));
      // Lo scoiattolo saltella dalla gioia e prende il vasetto.
      c.vai(0.15, { scoiattoloSu: 10 }, "out")
        .vai(0.2, { scoiattoloSu: 0 }, "in")
        .vai(0.15, { scoiattoloSu: 10 }, "out")
        .vai(0.2, { scoiattoloSu: 0 }, "in");
      prendi(c, "dx", null);
      c.evento((r) =>
        r.emetti("cuore", l.centro - 62, 220, {
          vy: -30,
          vita: 1.4,
          mondo: true,
        }),
      );
      c.vai(0.3, braccioGiu("dx"));
      inchino(c, p, l);
      c.vai(1.1, { scoiattoloX: -220 }, "in").vai(0.2, { scoiattolo: 0 });
      c.vai(0.3, { verso: -0.3, pupX: 0, ...FELICE })
        .pausa(0.4)
        .vai(0.2, { felice: 0 });
    },
  },
  seminare: {
    dove: (p) => luogo(p, D(p, P.orto, -46)),
    postura: (l) => ritto(l, 0.6, { ortoA: 2 }),
    lavoro: (c, l, p) => {
      prendi(c, "sx", "sacchetto");
      c.vai(0.3, mano(l, "sx", l.centro + 6, 204));
      for (let i = 0; i < 3; i++)
        versa(c, l, "dx", X(p, P.orto, -22 + i * 14), 248, 0.5, "polvere");
      c.vai(0.5, { costruzione: 1 });
      prendi(c, "sx", null);
      c.vai(0.3, BRACCIA_GIU);
    },
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      prendi(c, "sx", "sacchetto");
      c.vai(0.3, mano(l, "sx", l.centro + 6, 204));
      // Pesca un seme e lo lancia piano.
      c.vai(0.3, mano(l, "dx", l.centro + 4, 200)).pausa(0.2);
      versa(
        c,
        l,
        "dx",
        X(p, P.orto, -10 + Math.round(tra(p, -8, 14))),
        248,
        0.6,
        "polvere",
      );
      c.vai(0.3, braccioGiu("dx"));
      prendi(c, "sx", null);
      c.vai(0.3, braccioGiu("sx"));
      // Copre i semi battendo la terra.
      chinati(c, p);
      c.vai(0.35, {
        ...mano(l, "sx", X(p, P.orto, -22), 246, 0, 1.6),
        ...mano(l, "dx", X(p, P.orto, -8), 246, 0, 1.6),
      });
      c.oscilla("sxGomito", 8, 3, 0.6)
        .oscilla("dxGomito", -8, 3, 0.6)
        .pausa(0.6);
      rialzati(c);
      c.evento(dice(pesca(p, FRASI.semi)));
      c.vai(0.3, BRACCIA_GIU);
      sospira(c);
    },
  },
  "raccogliere-orto": {
    dove: (p) => luogo(p, D(p, P.orto, -44)),
    postura: (l) => ritto(l, 0.6, { ortoA: 1 }),
    lavoro: (c, l, p) => {
      for (let i = 0; i < 2; i++) {
        chinati(c, p);
        c.vai(0.35, {
          ...mano(l, "sx", X(p, P.orto, -16), 246, 0, 1.6),
          ...mano(l, "dx", X(p, P.orto, -8), 246, 0, 1.6),
        });
        c.vai(0.5, { rot: p.ridotto ? -1 : -6, sy: 0.95 }, "in");
        c.vai(0.2, { rot: 0, sy: 1.04, costruzione: (i + 1) / 2 }, "back");
        c.evento((r) =>
          r.emetti("stella", X(p, P.orto, -12), 236, {
            vy: -40,
            vita: 0.8,
            mondo: true,
          }),
        );
        rialzati(c, 0.25);
        c.vai(0.3, BRACCIA_GIU);
      }
    },
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.3, 0.7));
      // Tira la carota con tutte le forze: pop!
      chinati(c, p);
      c.vai(0.35, {
        ...mano(l, "sx", X(p, P.orto, -14), 246, 0, 1.6),
        ...mano(l, "dx", X(p, P.orto, -6), 246, 0, 1.6),
        boccaStorta: 3,
        palpebra: 0.6,
      });
      c.oscilla("rot", p.ridotto ? 0.5 : 2, 3, 0.8).pausa(0.8);
      c.vai(0.15, { rot: p.ridotto ? -1 : -7, sy: 1.05, palpebra: 0 }, "out");
      prendi(c, "dx", "carota");
      c.evento((r) => {
        r.emetti("polvere", X(p, P.orto, -10), 252, {
          vy: -30,
          vita: 0.6,
          mondo: true,
        });
        r.emetti("stella", X(p, P.orto, -10), 236, {
          vy: -40,
          vita: 0.8,
          mondo: true,
        });
      });
      c.vai(
        0.4,
        {
          rot: 0,
          sy: 1,
          ...mano(l, "dx", l.centro + 34, 140, 0, 1.2),
          ...braccioGiu("sx"),
          ...FELICE,
          boccaStorta: 0,
        },
        "molla",
      );
      c.evento(dice(pesca(p, FRASI.raccolto)));
      salta(c, p, 8);
      c.pausa(0.4);
      posaGiu(c, p, l, "dx", X(p, P.raccolto, -50));
      c.vai(0.2, { felice: 0 });
    },
  },
  "cercare-ghiande": {
    dove: CASA,
    postura: (l) => ritto(l),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.3, 0.6));
      annusa(c, p, 3);
      const dir = forse(p, 0.5) ? 1 : -1;
      const meta = l.x + dir * Math.min(70, dir > 0 ? p.spazioDx : p.spazioSx);
      cammina(c, p, meta, dir * 0.4);
      const qua = luogo(p, l.centro + (meta - l.x));
      annusa(c, p, 2);
      // Scava con le mani.
      chinati(c, p, 1.1);
      for (let i = 0; i < 3; i++) {
        c.vai(
          0.18,
          mano(qua, i % 2 ? "sx" : "dx", qua.centro + dir * 12, 248, 0, 1.6),
          "out",
        );
        c.evento((r) =>
          r.emetti("polvere", qua.centro + dir * 14, 254, {
            vx: -dir * 40,
            vy: -40,
            gravita: 160,
            vita: 0.6,
            scala: 0.4,
            mondo: true,
          }),
        );
        c.vai(
          0.15,
          mano(qua, i % 2 ? "sx" : "dx", qua.centro + dir * 4, 230, 0, 1.3),
          "in",
        );
      }
      prendi(c, "dx", "ghianda");
      rialzati(c);
      c.vai(0.4, {
        ...mano(qua, "dx", qua.centro + 30, 130, 0, 1.2),
        ...braccioGiu("sx"),
        ...FELICE,
      });
      c.evento(dice(pesca(p, FRASI.ghiande)));
      c.pausa(0.6);
      c.vai(0.3, { ...braccioGiu("dx"), felice: 0 });
      prendi(c, "dx", null);
      torna(c, p, l, 0);
    },
  },
  "cercare-sassi": {
    dove: CASA,
    postura: (l) => ritto(l),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.3, 0.6));
      const dir = forse(p, 0.5) ? 1 : -1;
      const meta = l.x + dir * Math.min(60, dir > 0 ? p.spazioDx : p.spazioSx);
      cammina(c, p, meta, dir * 0.3);
      const qua = luogo(p, l.centro + (meta - l.x));
      raccogli(c, p, qua, "dx", qua.centro + dir * 14, "sasso");
      // Lo esamina da vicino, girandolo.
      c.vai(0.4, {
        ...mano(qua, "dx", qua.centro + 8, 170),
        pupX: 1.4,
        pupY: 0.5,
        palpebra: 0.3,
      });
      c.oscilla("dxMano", 30, 2, 0.8).pausa(0.9);
      const bello = forse(p, 0.6);
      c.evento(dice(bello ? FRASI.sassi[0] : FRASI.sassi[1]));
      if (bello) {
        c.vai(0.3, { ...FELICE, palpebra: 0 }).pausa(0.4);
        c.vai(0.3, { ...braccioGiu("dx"), felice: 0 });
        cammina(c, p, luogo(p, D(p, P.sassi, +30)).x, -0.4);
        posaGiu(c, p, luogo(p, D(p, P.sassi, +30)), "dx", X(p, P.sassi, +8));
      } else {
        c.vai(0.2, { palpebra: 0, boccaStorta: -2 });
        lancia(c, p, qua, "dx", -dir, "ghianda");
        c.vai(0.2, { boccaStorta: 0 });
      }
      c.vai(0.3, braccioGiu("dx"));
      torna(c, p, l, 0);
    },
  },
  "intrecciare-erba": {
    dove: (p) => luogo(p, 120, true),
    postura: (l) =>
      sedutoA(l, 0, {
        ...mano(l, "sx", l.centro - 9, 222),
        ...mano(l, "dx", l.centro + 9, 222),
        pupY: 2.4,
        palpebra: 0.25,
      }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      intreccia(c, l, 6 + Math.floor(p.rnd() * 3), 222);
      prendi(c, "dx", "corda");
      tira(c, p, l, 218);
      c.vai(0.3, { pupY: 1.8, ...FELICE }).pausa(0.4);
      c.evento(dice(pesca(p, FRASI.intreccio)));
      c.vai(0.2, { felice: 0 });
      prendi(c, "dx", null);
      if (forse(p, 0.4)) manoAlMento(c, l, 0.8);
    },
  },
  "bolle-sapone": {
    dove: CASA,
    postura: (l) => ritto(l),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.3, 0.6));
      prendi(c, "dx", "anello");
      c.vai(0.35, mano(l, "dx", l.centro + 12, 196, -20));
      soffia(c, 150, 158, 1, "bolla", 2);
      c.vai(0.3, braccioGiu("dx"));
      prendi(c, "dx", null);
      // Insegue una bolla e la scoppia col dito.
      const meta = l.x + Math.min(50, p.spazioDx);
      cammina(c, p, meta, 0.5);
      const qua = luogo(p, l.centro + (meta - l.x));
      indica(c, qua, "dx", qua.centro + 30, 120, 0.35);
      c.evento((r) =>
        r.emetti("stella", qua.centro + 30, 116, { vita: 0.6, mondo: true }),
      );
      c.evento(dice(pesca(p, FRASI.bolle), 1.6));
      ride(c, p, 1);
      c.vai(0.3, braccioGiu("dx"));
      torna(c, p, l, 0);
    },
  },
  bucato: {
    dove: (p) => luogo(p, D(p, P.tinozza)),
    postura: (l) => ritto(l, 0, { tinozza: 1, filo: 1 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.3, 0.6));
      strofina(c, l, X(p, P.tinozza), 232, 5);
      strizza(c, l);
      c.evento(dice(pesca(p, FRASI.bucato)));
      // Va al filo e sistema i panni.
      const filo = luogo(p, D(p, P.filo, -12));
      cammina(c, p, filo.x, 0.3);
      c.vai(0.4, {
        ...mano(filo, "dx", X(p, P.filo, -6), Y(p, 168), 0, 1.4),
        ...mano(filo, "sx", X(p, P.filo, -22), Y(p, 172), 0, 1.4),
      });
      c.oscilla("dxMano", 10, 2, 0.5).pausa(0.6);
      c.vai(0.3, BRACCIA_GIU);
      manoSuiFianchi(c, filo);
      c.vai(0.3, BRACCIA_GIU);
      cammina(c, p, l.x, 0);
    },
  },
  "tuffo-foglie": {
    dove: (p) => luogo(p, D(p, P.mucchio, +64)),
    postura: (l) => ritto(l, -0.5),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      c.evento(dice(FRASI.tuffo[0], 1.6));
      // Prende la rincorsa all'indietro, poi corre e si tuffa.
      c.vai(0.3, { verso: 0.5 })
        .vai(0.6, { x: l.x + 20 }, "io")
        .vai(0.2, { verso: -0.6 });
      if (p.ridotto) {
        cammina(c, p, l.x - 40, -0.6);
        c.vai(0.4, { seduto: 1, mucchioIn: -0.3 });
      } else {
        c.vai(0.25, { passo: 2, cadenza: 3, braccioPasso: 1 });
        c.con(0.6, { x: l.x - 42 }, "in").pausa(0.6);
        c.vai(0.1, { passo: 0, braccioPasso: 0 });
        c.vai(0.25, { y: -24, sxSpalla: 80, dxSpalla: 80, rot: -10 }, "out");
        c.vai(0.25, { y: 18, sy: 0.6, rot: 0, mucchioIn: -0.6 }, "in");
      }
      c.evento((r) => {
        for (let i = 0; i < 8; i++)
          r.emetti("foglia", X(p, P.mucchio, +(i - 4) * 6), 236, {
            vx: (i - 4) * 30,
            vy: -120,
            gravita: 70,
            vita: 1.6,
            mondo: true,
          });
      });
      c.pausa(0.8);
      // Riemerge ridendo, tutto pieno di foglie.
      c.vai(0.4, { y: 0, sy: 1, seduto: 0, ...BRACCIA_GIU }, "out");
      ride(c, p, 1);
      scrollati(c, p, "foglia");
      c.evento(dice(pesca(p, FRASI.tuffo.slice(1))));
      c.con(1.2, { mucchioIn: 0 });
      cammina(c, p, l.x, -0.5);
    },
  },

  // ——— Sera ———
  "accendere-fuoco": {
    dove: (p) => luogo(p, D(p, P.falo, +36)),
    postura: (l) => ritto(l, -0.6, { fuoco: 1, legnaIn: -2 }),
    lavoro: (c, l, p) => {
      // Sistema i rami, sfrega i bastoncini, soffia. La prima volta non parte.
      chinati(c, p);
      impila(c, l, "dx", X(p, P.falo, +6), 250, 2);
      prendi(c, "dx", "bastoncini");
      sfrega(c, p, l, X(p, P.falo, +8), 240, 1.4);
      soffia(c, 96, 200, -1, "fumo");
      c.vai(0.3, { ...SERIO, cigliaY: 3, boccaStorta: -3 }).pausa(0.4);
      c.evento(dice(FRASI.fuoco[0], 1.6));
      sfrega(c, p, l, X(p, P.falo, +8), 240, 1.6);
      c.evento((r) => {
        for (let i = 0; i < 4; i++)
          r.emetti("scintilla", X(p, P.falo, +(i - 2) * 4), 244, {
            vx: (i - 2) * 20,
            vy: -60,
            gravita: 40,
            vita: 0.8,
            mondo: true,
          });
      });
      soffia(c, 96, 200, -1, "scintilla");
      c.con(1.2, { costruzione: 1 }, "out");
      rialzati(c, 0.2);
      prendi(c, "dx", null);
      // Salta indietro per la sorpresa.
      c.vai(
        0.2,
        { x: l.x + 10, sbarra: 1, cigliaY: -3, ...BOCCA_O, ...BRACCIA_GIU },
        "out",
      );
      c.pausa(0.4).vai(0.3, { x: l.x, sbarra: 0, cigliaY: 0, ...FELICE });
      c.evento(dice(FRASI.fuoco[1], 1.8));
      salta(c, p, 10);
      c.vai(0.2, { felice: 0 });
    },
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.6, 1.2));
      // Si scalda le mani.
      c.vai(0.4, {
        ...mano(l, "sx", X(p, P.falo, +16), Y(p, 210), 0, 1.3),
        ...mano(l, "dx", X(p, P.falo, +22), Y(p, 216), 0, 1.3),
        palpebra: 0.6,
      });
      c.oscilla("sxMano", 10, 3, 0.9).oscilla("dxMano", -10, 3, 0.9).pausa(0.9);
      sospira(c);
      c.vai(0.3, BRACCIA_GIU);
      // Aggiunge un ramo: scintille.
      if (forse(p, 0.7)) {
        raccogli(c, p, l, "dx", l.centro + 18, "ramo");
        lancia(c, p, l, "dx", -1, "scintilla");
        c.evento((r) => {
          for (let i = 0; i < 4; i++)
            r.emetti("scintilla", X(p, P.falo, +(i - 2) * 5), 236, {
              vx: (i - 2) * 16,
              vy: -80,
              gravita: 30,
              vita: 1,
              mondo: true,
            });
        });
      }
      c.evento(dice(FRASI.fuoco[2]));
      c.vai(0.3, { ...BRACCIA_GIU, palpebra: 0 });
    },
  },
  "arrostire-castagne": {
    dove: (p) => luogo(p, D(p, P.falo, +40), true),
    postura: (l) => sedutoA(l, -0.6, { fuoco: 1 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      prendi(c, "dx", "spiedo");
      // Tiene la castagna sul fuoco e la gira.
      c.vai(0.4, mano(l, "dx", l.centro - 10, 222, -20));
      c.oscilla("dxMano", 20, 4, 2).pausa(2);
      c.evento((r) =>
        r.emetti("fumo", X(p, P.falo), Y(p, 214), {
          vy: -24,
          vita: 1.4,
          scala: 0.5,
          cresce: 1.8,
          mondo: true,
        }),
      );
      // La soffia e la morde: scotta!
      c.vai(0.35, mano(l, "dx", l.centro + 6, 200, -60));
      soffia(c, 120, 188, 0, "sbuffo");
      c.vai(0.2, { ...BOCCA_O, sbarra: 0.6 });
      c.evento(dice(FRASI.castagne[0], 1.4));
      c.vai(0.3, mano(l, "sx", l.centro - 4, 188, 30));
      c.oscilla("sxMano", 30, 4, 0.7).pausa(0.7);
      c.vai(0.3, {
        sbarra: 0,
        ...FELICE,
        ...mano(l, "sx", l.centro - 22, 226),
      });
      c.evento(dice(pesca(p, FRASI.castagne.slice(1))), 0.3);
      c.pausa(0.8).vai(0.2, { felice: 0 });
      c.vai(0.3, mano(l, "dx", l.centro + 22, 226));
      prendi(c, "dx", null);
    },
  },
  "storie-al-fuoco": {
    dove: (p) => luogo(p, D(p, P.falo, +48), true),
    postura: (l) => sedutoA(l, -0.3, { fuoco: 1 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      // Racconta gesticolando.
      c.vai(0.3, {
        parla: 0.8,
        verso: 0.1,
        ...mano(l, "sx", l.centro - 36, 196),
        ...mano(l, "dx", l.centro + 36, 196),
      });
      c.evento(dice(pesca(p, FRASI.storie), 2.6));
      c.oscilla("sxGomito", 14, 3, 1.4)
        .oscilla("dxGomito", -14, 3, 1.4)
        .pausa(1.4);
      // Le ombre con le mani: un coniglio!
      c.vai(0.35, {
        parla: 0,
        ...mano(l, "sx", l.centro - 6, 180),
        ...mano(l, "dx", l.centro + 6, 178),
        pupY: -2,
      });
      c.oscilla("dxMano", 25, 3, 1).pausa(1);
      c.evento((r) =>
        r.emetti("stella", l.centro, 150, { vy: -10, vita: 0.8, mondo: true }),
      );
      // Fa la voce grossa, poi ride.
      c.vai(0.3, {
        ...mano(l, "sx", l.centro - 30, 160, 0, 1.2),
        ...mano(l, "dx", l.centro + 30, 160, 0, 1.2),
        cigliaY: 3,
        ...BOCCA_O,
        sy: 1.04,
      });
      c.pausa(0.6).vai(0.3, { cigliaY: 0, sy: 1 });
      ride(c, p, 1);
      c.vai(0.4, {
        ...mano(l, "sx", l.centro - 22, 226),
        ...mano(l, "dx", l.centro + 22, 226),
        verso: -0.3,
      });
      sospira(c);
    },
  },
  "cuocere-marmellata": {
    dove: (p) => luogo(p, D(p, P.falo, +38)),
    postura: (l) => ritto(l, -0.6, { fuoco: 1, pentola: 1, vasettiIn: 2 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      prendi(c, "dx", "mestolo");
      mescola(c, l, "dx", X(p, P.falo, +4), Y(p, 206), 3);
      c.evento((r) =>
        r.emetti("vapore", X(p, P.falo), Y(p, 216), {
          vy: -20,
          vita: 1.4,
          scala: 0.5,
          cresce: 1.8,
          mondo: true,
        }),
      );
      c.evento(dice(pesca(p, FRASI.marmellata)));
      // Assaggia dal mestolo.
      c.vai(0.35, mano(l, "dx", l.centro + 2, 190, -60));
      soffia(c, 120, 186, 0, "sbuffo");
      c.vai(0.25, { ...FELICE, guance: 1.5 })
        .pausa(0.5)
        .vai(0.2, { felice: 0, guance: 1 });
      mescola(c, l, "dx", X(p, P.falo, +4), Y(p, 206), 2);
      c.vai(0.3, braccioGiu("dx"));
      prendi(c, "dx", null);
      annuisce(c);
    },
  },
  "cucinare-zuppa": {
    dove: (p) => luogo(p, D(p, P.falo, +38)),
    postura: (l) => ritto(l, -0.6, { fuoco: 1, pentola: 1 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      // Spezza la carota e la butta in pentola.
      prendi(c, "dx", "carota");
      c.vai(0.3, {
        ...mano(l, "dx", l.centro + 8, 196),
        ...mano(l, "sx", l.centro - 8, 196),
      });
      c.vai(0.15, { sxMano: -30, dxMano: 30 }, "in").vai(0.2, {
        sxMano: 0,
        dxMano: 0,
      });
      lancia(c, p, l, "dx", -1, "polvere");
      c.vai(0.3, BRACCIA_GIU);
      prendi(c, "dx", "mestolo");
      mescola(c, l, "dx", X(p, P.falo, +4), Y(p, 206), 2);
      c.vai(0.3, braccioGiu("dx"));
      prendi(c, "dx", null);
      // Annusa il vapore.
      c.evento((r) =>
        r.emetti("vapore", X(p, P.falo), Y(p, 214), {
          vy: -26,
          vx: 10,
          vita: 1.6,
          scala: 0.6,
          cresce: 2,
          mondo: true,
        }),
      );
      annusa(c, p, 2);
      c.vai(0.25, { ...FELICE, palpebra: 0.5 });
      c.evento(dice(pesca(p, FRASI.zuppa)));
      c.pausa(0.8).vai(0.25, { felice: 0, palpebra: 0 });
      c.vai(0.35, {
        ...mano(l, "sx", l.centro - 19, 208),
        ...mano(l, "dx", l.centro + 19, 208),
      });
      sospira(c);
      c.vai(0.3, BRACCIA_GIU);
    },
  },
  "guardare-stelle": {
    dove: (p) => luogo(p, 120, true),
    postura: (l) => sedutoA(l, 0, { pupY: -2.5, costellazione: 0 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.6, 1.2));
      c.vai(0.4, { costellazione: 0.05, palpebra: 0, fy: -1 });
      // Indica le stelle una per una: la linea le unisce.
      const punti: [number, number][] = [
        [40, -6],
        [70, -24],
        [104, -14],
        [132, -32],
        [168, -18],
      ];
      indica(c, l, "dx", punti[0][0], punti[0][1] + 40, 0.5);
      punti.forEach(([x, y], i) => {
        c.con(0.5, { costellazione: (i + 1) / punti.length }, "lin");
        indica(c, l, i < 2 ? "sx" : "dx", x, y + 40, 0.5);
      });
      c.evento(dice(pesca(p, FRASI.stelle), 2.4));
      c.vai(0.4, {
        ...mano(l, "sx", l.centro - 22, 226),
        ...mano(l, "dx", l.centro + 22, 226),
        felice: 1,
      });
      sospira(c);
      c.pausa(1).vai(0.6, { costellazione: 0, felice: 0, fy: 0 });
    },
  },

  // ——— Con la pioggia ———
  "secchio-pioggia": {
    dove: (p) => luogo(p, D(p, P.secchio, -32)),
    postura: (l) => ritto(l, 0.5, { secchio: 1, acqua: 0.2 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.4, 0.8));
      // Guarda le gocce cadere e conta.
      c.vai(0.4, { pupY: -2.5, fy: -1 });
      c.con(3, { acqua: 0.85 }, "lin");
      contaDita(c, l, 4);
      c.evento(dice(pesca(p, FRASI.secchio)));
      c.vai(0.3, { pupY: 1, fy: 0 });
      // Controlla dentro, soddisfatto, poi lo vuota sull'erba per ricominciare.
      chinati(c, p, 0.7);
      c.vai(0.35, { pupX: 2, pupY: 2.8 }).pausa(0.5);
      rialzati(c);
      annuisce(c);
      raccogli(c, p, l, "dx", X(p, P.secchio), "secchio");
      c.vai(0.01, { secchio: 0 }, "scatto");
      versa(c, l, "dx", l.centro + 46, 250, 0.8);
      c.con(0.4, { acqua: 0.2 });
      posaGiu(c, p, l, "dx", X(p, P.secchio), (r) =>
        r.emetti("goccia", X(p, P.secchio), 240, {
          vy: -20,
          vita: 0.4,
          mondo: true,
        }),
      );
      c.vai(0.01, { secchio: 1 }, "scatto");
    },
  },
  "saltare-pozzanghere": {
    dove: (p) => luogo(p, D(p, P.pozza)),
    postura: (l) => ritto(l, 0, { pozza: 1 }),
    ciclo: (c, l, p) => {
      c.pausa(tra(p, 0.3, 0.6));
      const schizzi = (r: Regia) => {
        for (let i = 0; i < 6; i++)
          r.emetti("goccia", X(p, P.pozza, +(i - 3) * 8), 254, {
            vx: (i - 2.5) * 50,
            vy: -140,
            gravita: 520,
            vita: 0.9,
            mondo: true,
          });
      };
      const volte = 2 + Math.floor(p.rnd() * 2);
      for (let i = 0; i < volte; i++) {
        c.vai(0.2, { sxSpalla: 40, dxSpalla: 40 }, "out");
        if (p.ridotto) {
          c.vai(0.16, { sxGinocchio: 16 }, "out").vai(
            0.14,
            { sxGinocchio: 0 },
            "in",
          );
        } else salta(c, p, 18);
        c.evento(schizzi);
        c.vai(0.2, BRACCIA_GIU);
      }
      c.evento(dice(pesca(p, FRASI.pozzanghere), 1.6));
      ride(c, p, 1);
      scrollati(c, p, "goccia");
      if (forse(p, 0.3)) trema(c, p, l, 0.6);
    },
  },
};

// ——— Gli intermezzi (sezione 5.5): pochi secondi tra un ciclo e l'altro ———

const PENSIERI = [
  "e domani?",
  "che ore saranno?",
  "una ghianda…",
  "chissà lo scoiattolo",
  "che bel prato",
  "mmm…",
];

type Intermezzo = (c: Copione, l: Luogo, p: Palco, b: Canali) => void;

export const INTERMEZZI: Record<string, Intermezzo> = {
  beve: (c, l) => {
    prendi(c, "dx", "tazza");
    beve(c, l, "dx", 1);
    c.vai(0.3, braccioGiu("dx"));
    prendi(c, "dx", null);
  },
  stiracchia: (c, _l, p, b) => {
    if (b.seduto > 0.5) sbadiglia(c, p);
    else stiracchia(c, p);
  },
  sbadiglia: (c, _l, p) => sbadiglia(c, p),
  gratta: (c, l, p) => grattaCorteccia(c, p, l),
  "guarda-e-sorride": (c, l, p) => {
    const s = forse(p, 0.5) ? 1 : -1;
    c.vai(0.4, { verso: s * 0.6, pupX: s * 2.4, pupY: 2 });
    c.pausa(0.6)
      .vai(0.3, { ...FELICE })
      .pausa(0.6)
      .vai(0.4, { verso: 0, pupX: 0, pupY: 1, felice: 0 });
    void l;
  },
  sistema: (c, l, p) => {
    chinati(c, p, 0.8);
    c.vai(0.35, mano(l, "dx", l.centro + 30, 244, 0, 1.6));
    c.oscilla("dxMano", 20, 2, 0.5).pausa(0.5);
    rialzati(c);
    c.vai(0.3, braccioGiu("dx"));
    annuisce(c, 1);
  },
  "saluta-scoiattolo": (c, l, p) => {
    c.vai(0.2, { scoiattolo: 1, scoiattoloX: l.centro - 180 });
    c.con(2.2, { scoiattoloX: l.centro + 200 }, "lin");
    c.vai(0.6, { verso: -0.5, pupX: -2.4 });
    saluta(c, l, "dx", 2);
    c.vai(0.6, { verso: 0.5, pupX: 2.4, ...braccioGiu("dx") }).pausa(0.4);
    c.vai(0.2, { scoiattolo: 0, verso: 0, pupX: 0 });
    void p;
  },
  starnuto: (c, _l, p) => starnutisce(c, p),
  "si-siede": (c, l, p, b) => {
    if (b.seduto > 0.5) {
      manoAlMento(c, l, 0.8);
      return;
    }
    siediti(c, p);
    sospira(c);
    c.pausa(0.8);
    alzati(c, p);
  },
  pensa: (c, l, p) => {
    c.evento((r) =>
      r.pensa
        ? r.pensa(pesca(p, PENSIERI), 3)
        : r.fumetto(pesca(p, PENSIERI), 2.4),
    );
    manoAlMento(c, l, 2);
  },
};

/** L'attività animata con questo id, se ce n'è una. */
export function scenaDellAttivita(
  id: string | null | undefined,
): { id: string; scena: ScenaLavoro } | null {
  if (!id) return null;
  const scena = ATTIVITA[id];
  return scena ? { id, scena } : null;
}

/** Un intermezzo a caso, recitato dalla postura dell'attività e di nuovo fino a lì. */
export function intermezzo(
  scena: ScenaLavoro,
  c: Copione,
  p: Palco,
  b: Canali,
) {
  const l = scena.dove(p);
  const nomi = Object.keys(INTERMEZZI);
  INTERMEZZI[nomi[Math.floor(p.rnd() * nomi.length)]](c, l, p, b);
}

/** Per le prove e il catalogo: quante attività animate ci sono. */
export const ATTIVITA_ANIMATE = Object.keys(ATTIVITA);
