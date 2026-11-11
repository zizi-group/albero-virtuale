import type { Strada } from "@/lib/albero/strade";
import type { Indumento, Oggetto, Posa } from "@/lib/albero/tipi";

// Le frasi del fumetto: già scritte, nessuna chiamata all'AI.
// Tono di personaggio.ts: ironico e gentile, niente persone o marchi reali.

export type Umore = "assonnato" | "bagnato" | "infreddolito" | "soleggiato" | "lettore" | "sportivo" | "allegro" | "furbo" | "pensieroso";

const GENERALI = [
  "Ciao! Stavo giusto pensando a te. Più o meno.",
  "Oh, una visita! Mi sistemo le foglie.",
  "Ciao! Oggi mi sento particolarmente verde.",
  "Le radici bene, grazie. E tu?",
  "Mi hai trovato! In effetti non mi muovo molto.",
  "Fai pure, io intanto faccio fotosintesi.",
  "Benvenuto nel mio pezzetto di prato.",
  "Ciao! Passavi di qui per caso?",
];

const STRADE: Record<Strada, string[]> = {
  filosofo: [
    "Se un albero saluta e nessuno lo vede, ha salutato davvero?",
    "Stavo chiedendomi perché il vento non si siede mai.",
  ],
  imprenditore: [
    "Hai cinque minuti per un'idea sull'ombra?",
    "Il primo saluto è gratis. Il secondo costa una ghianda.",
  ],
  artista: ["Non muoverti! Ti sto facendo un ritratto.", "Oggi dipingo tutto di verde. Anche il cielo."],
  sportivo: ["Ho fatto tre giri del prato. Da fermo.", "Dammi il cinque! Va bene anche con una foglia."],
  furfante: ["Io? Le ghiande? Mai viste.", "Shh! Se passa lo scoiattolo, non mi hai visto."],
  viaggiatore: ["Sai che da qui si vede quasi il mare? Quasi.", "Ho appena fatto il giro del mondo. Con la fantasia."],
  poeta: ["Ti dedico un verso. Domani, forse.", "Sbadiglio in rima: ciao… mmh… uao."],
};

const UMORI: Record<Umore, string[]> = {
  assonnato: ["Mmh… ancora cinque minuti…", "Zzz… chi è? Ah, ciao… zzz."],
  bagnato: ["Vuoi un po' di schiuma? Ne ho in abbondanza.", "Doccia gratis dal cielo: la migliore della settimana!"],
  infreddolito: ["Brr! Hai visto che sciarpa nuova?", "Fa così freddo che mi si gelano le gemme."],
  soleggiato: ["Che sole! Mi sto abbronzando le foglie.", "Ciao! Ti presto gli occhiali, se vuoi."],
  lettore: ["Shh, sono al capitolo più bello!", "Questo libro parla di un albero. Che coincidenza."],
  sportivo: ["Non posso fermarmi… uff… sono in allenamento!", "Un altro giro e poi mi riposo. Forse."],
  allegro: ["Oggi va tutto benissimo, anche alle formiche."],
  furbo: ["Non ho fatto niente. Per ora."],
  pensieroso: ["Stavo pensando a una cosa importante. L'ho persa."],
};

const SITUAZIONI: Record<string, string[]> = {
  solletico: ["Ih ih ih! Lì soffro il solletico!", "Ah ah, basta, mi cadono le foglie!", "Uh uh! Sono un albero sensibile!"],
  arrabbiato: ["Ehi! Sono un albero, mica un campanello!", "Adesso basta! Mi metto il broncio.", "Uffa! Conto fino a dieci. In anelli."],
  pace: ["…va bene, scherzavo.", "Scherzavo! Ciao.", "Facciamo pace? Ti offro dell'ombra."],
  atterraggio: ["Ehi! Avvisa, la prossima volta!", "Ho le radici tutte in disordine.", "Bel volo. Però anche no.", "Mi gira la chioma…"],
  sollevato: ["Mettimi giù! Soffro di vertigini!", "Uh, che vista da quassù!", "Le radici! Lasciami le radici!"],
  chioma: ["Ehi, quelle foglie mi servono!", "Mi spettini!", "Ah, ecco dov'era finita quella ghianda."],
  casa: ["Torno al mio posto, lì c'è l'ombra giusta.", "Qui va bene, grazie. Resto."],
  sbuffo: ["Uff, che caldo!", "Fresco, fresco…"],
  doccia: ["La la laaa…", "Shampoo alla resina!"],
  notte: ["…e poi il ghiro disse… zzz…", "…ancora una ghianda… zzz…"],
  lettura: ["Ah ah! Questa è bellissima.", "Ma dai! Non me l'aspettavo."],
  corsa: ["Uff… fiatone…", "Record personale! Credo."],
  freddo: ["Brr! Le mani!", "Fff… così va meglio."],
  sole: ["Aaah, che bello.", "Troppa luce! Occhiali, presto."],
  // Il mestiere dell'imprenditore
  pubblicita: ["Ghiande fresche! Ombra in offerta!", "Venghino, venghino: due ghiande, una gratis!", "Oggi sconti sull'ombra del pomeriggio!"],
  contratta: ["Due ghiande? Facciamo tre.", "Per te, prezzo da amico. Da amico ricco.", "Affare fatto, e niente sconti al tuo cugino."],
  incasso: ["Sette ghiande. No, otto. No, sette.", "Giornata d'oro. Di ghianda, ma d'oro."],
  caffe: ["Prima il caffè, poi l'impero.", "Un caffè di rugiada e sono pronto."],
  telefono: ["Certo, certo! Ghiande a volontà.", "Pronto? Sì, sono io il capo.", "Le richiamo appena finisco di essere importante."],
  contratti: ["Timbrato, firmato, ghiandato.", "Un altro contratto. Non so per cosa, ma è firmato."],
  riunione: ["Come vedi, il grafico va su. Sempre su.", "Punto primo: ghiande. Punto secondo: più ghiande."],
  notteUfficio: ["…aumento di capitale… zzz…", "…ancora una riunione… zzz…"],
  ahia: ["Ahia! Il dito!", "Il terzo chiodo era il mio dito."],
  inaugura: ["Dichiaro aperto l'ufficio!", "Un applauso per la scrivania!"],
  combinazione: ["Com'era la combinazione?", "L'ho scritta su una foglia. Quale foglia?"],
};

const OGGETTI: Partial<Record<Oggetto | string, string>> = {
  libro: "Te lo presto quando ho finito. Tra un anno.",
  tazza: "Tisana di corteccia. Vuoi un sorso?",
  telefono: "Scusa, ti richiamo io!",
  ombrello: "È mio, ma te lo presto se piove forte.",
  giornale: "Le ghiande sono in rialzo!",
  pennello: "Attento, è fresco!",
  manubrio: "Senti che muscoli di legno!",
  annaffiatoio: "Mi annaffio da solo: sono autonomo.",
  scoiattolo: "Lui è Pino. Non fidarti, ti conta le ghiande.",
  ghiande: "Non toccare, le ho appena contate!",
  cartello: "Ombra: due ghiande l'ora. Per te, lo sconto.",
  valigia: "Destinazione: il prato di là.",
  mappa: "Siamo qui. Anzi, qui. Credo.",
  quaderno: "Non sbirciare, è una poesia segreta.",
  penna: "Questa piuma scrive da sola. Quasi.",
  cavalletto: "Il quadro è quasi finito. Mancano i colori.",
  // Gli arredi del mestiere
  bancarella: "La bancarella apre all'alba. Più o meno.",
  scrivania: "L'ho costruita io. Una gamba è corta, non ditelo.",
  insegna: "Ghiande & Co. La «Co.» sono io, due volte.",
  cassaforte: "Dentro? Niente. Cioè, ghiande. Non guardare.",
};

const ACCESSORI_STRADA: Partial<Record<Indumento, Strada>> = {
  "occhiali-tondi": "filosofo",
  cravatta: "imprenditore",
  basco: "artista",
  fascia: "sportivo",
  bandana: "furfante",
  zaino: "viaggiatore",
  piuma: "poeta",
};

export function stradaDa(indossa: Indumento[]): Strada | null {
  for (const i of indossa) {
    const s = ACCESSORI_STRADA[i];
    if (s) return s;
  }
  return null;
}

export function umoreDa(posa: Posa, scenetta: string): Umore | null {
  if (scenetta === "notte") return "assonnato";
  if (scenetta === "pioggia") return "bagnato";
  if (scenetta === "freddo") return "infreddolito";
  if (scenetta === "sole") return "soleggiato";
  if (scenetta === "leggere") return "lettore";
  if (scenetta === "correre") return "sportivo";
  if (posa.occhi === "furbi" || posa.bocca === "ghigno") return "furbo";
  if (posa.occhi === "su" || posa.occhi === "sognanti" || posa.effetti.includes("pensiero")) return "pensieroso";
  if (posa.occhi === "felici" || posa.bocca === "grande") return "allegro";
  return null;
}

/** Sceglie le frasi senza ripetere le ultime uscite. */
export class Repertorio {
  private ultime: string[] = [];

  constructor(
    private strada: Strada | null,
    private umore: Umore | null,
    private rnd: () => number,
  ) {}

  aggiorna(strada: Strada | null, umore: Umore | null) {
    this.strada = strada;
    this.umore = umore;
  }

  private pesca(lista: string[]): string {
    const libere = lista.filter((f) => !this.ultime.includes(f));
    const tra = libere.length ? libere : lista;
    const f = tra[Math.floor(this.rnd() * tra.length)];
    this.ultime = [f, ...this.ultime].slice(0, 4);
    return f;
  }

  /** Il saluto: metà delle volte dalla strada o dall'umore, se ci sono. */
  saluto(): string {
    const r = this.rnd();
    if (this.strada && r < 0.4) return this.pesca(STRADE[this.strada]);
    if (this.umore && r < 0.75) return this.pesca(UMORI[this.umore]);
    return this.pesca(GENERALI);
  }

  oggetto(o: Oggetto | string): string {
    return OGGETTI[o] ?? this.saluto();
  }

  gruppo(nome: string): string {
    if (nome === "saluto") return this.saluto();
    return this.pesca(SITUAZIONI[nome] ?? GENERALI);
  }
}

export const TUTTE_LE_FRASI = {
  generali: GENERALI,
  strade: STRADE,
  umori: UMORI,
  situazioni: SITUAZIONI,
  oggetti: OGGETTI,
};
