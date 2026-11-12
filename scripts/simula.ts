// Simula uno o più alberi in memoria, senza database: utile per provare il motore e i prompt.
// Uso: npm run simula -- --giorni 7 --citta Pescara --nome Ottavio --persona Giulia [--lettera]
//
// Più alberi nella stessa stanza (fase 4: imprese, contagio, attività di gruppo):
//   npm run simula -- --alberi 3 --giorni 60
//   --nomi Ottavio,Ulivetta,Quercino   nomi degli alberi
//   --caratteri 90/30,40/85,40/20      carisma/influenzabilità per albero (altrimenti dalla nascita)
//   --strade furfante,-,-              strade già rivelate alla partenza («-» = germoglio)
//   --senza-ai                         niente chiamate all'AI né al meteo: giornate finte, per le statistiche
//   --seme 42                          caso riproducibile
//   --prove 200                        ripete la stanza N volte senza AI e stampa le statistiche del contagio
//
// Le giornate a fasce, le risorse e le catene (fase 2) girano sempre, per ogni albero:
// alla fine c'è il controllo delle ripetizioni e delle catene finite.
//   --meteo-finto                      meteo simulato anche con l'AI (senza Open-Meteo)
//   --fasce                            stampa la giornata a fasce di ogni albero (con un albero solo: sempre)
import "./_env";
import { azione } from "../src/lib/albero/azioni";
import { CATENE, descriviCatene, statoDaDatabase, type StatoCatene } from "../src/lib/albero/catene";
import { FASCE_DI_GIORNO, pianificaGiornate, type Palinsesto } from "../src/lib/albero/giornata";
import { descriviRisorse } from "../src/lib/albero/risorse";
import {
  CAMBIO_STRADA,
  descriviImprese,
  giornoDellaStanza,
  probabilitaContagio,
  raccontaFatti,
  type AlberoInStanza,
  type FattoStanza,
} from "../src/lib/albero/contagio";
import { avanzamento, membri, tipoImpresa, type Impresa } from "../src/lib/albero/imprese";
import {
  carattereDa,
  classifica,
  inclinazioni,
  INFO_STRADE,
  isStrada,
  NOMI_TRATTI,
  STRADE,
  trattiCasuali,
  TRATTI,
  type Strada,
} from "../src/lib/albero/strade";
import type { Cielo } from "../src/lib/albero/tipi";
import { cercaCitta, oggiNelFuso, previsioni, type MeteoGiorno } from "../src/lib/meteo";
import { MODELLO, MODELLO_GIORNATE } from "../src/lib/motore/ai";
import { UMORI } from "../src/lib/motore/personaggio";
import { scriviTestoLettera } from "../src/lib/motore/scritture";
import {
  applicaEsiti,
  applicaStanza,
  conPalinsesto,
  pianificaGiorni,
  preparaGiorni,
  type EsitoGiorno,
  type GiornoDaVivere,
  type PaginaDiario,
  type StatoAlbero,
} from "../src/lib/motore/vita";

function arg(nome: string, predefinito: string) {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : predefinito;
}
const flag = (nome: string) => process.argv.includes(`--${nome}`);

/** Numeri casuali riproducibili (mulberry32). */
function casuale(seme: number): () => number {
  let a = seme;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Parole che non devono mai comparire (tono di personaggio.ts e della banda del bosco, sezione 6). */
const FUORI_TONO = /\b(mafi\w*|padrin\w*|pizz\w*|omert\w*|cosca|clan|boss|pistol\w*|fucil\w*|coltell\w*|uccid\w*|ammazz\w*|sangue|morto|morte|picchia\w*|picchiat\w*|minacc\w*|estorsion\w*|droga|soldi|euro|dollar\w*)\b/i;

const NOMI = ["Ottavio", "Ulivetta", "Quercino", "Betulla"];

/** Meteo finto per le prove senza rete: un giro di tempi diversi. */
function meteoFinto(dataSemina: string, giorni: number, rnd: () => number): MeteoGiorno[] {
  const cieli: Cielo[] = ["sole", "sole", "nuvole", "pioggia", "sole", "nebbia", "temporale", "nuvole"];
  return Array.from({ length: giorni + 8 }, (_, k) => {
    const d = new Date(`${dataSemina}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + k);
    const cielo = cieli[Math.floor(rnd() * cieli.length)];
    const t = Math.round(8 + rnd() * 18);
    return { data: d.toISOString().slice(0, 10), cielo, temperatura: t, minima: t - 4, massima: t + 3, giorno: true, descrizione: `${cielo} (simulato), ${t}°` };
  });
}

/** Una giornata senza AI: la strada cresce con le inclinazioni, il diario elenca i fatti della stanza. */
function esitoFinto(stato: StatoAlbero, g: GiornoDaVivere, rnd: () => number): EsitoGiorno {
  const inc = inclinazioni(stato.tratti);
  const pesi = STRADE.map((s) => [s, Math.pow(inc[s], 3) * (stato.strada === s ? 4 : 1)] as const);
  const tot = pesi.reduce((a, [, p]) => a + p, 0);
  const pesca = () => {
    let r = rnd() * tot;
    return (pesi.find(([, p]) => (r -= p) <= 0) ?? pesi[0])[0];
  };
  const spinte = Object.fromEntries(STRADE.map((s) => [s, 0])) as Record<Strada, number>;
  spinte[pesca()] += 3;
  spinte[pesca()] += 1;
  // Con la giornata a fasce racconta la principale di mezzogiorno (come farebbe di solito l'AI).
  const az = g.palinsesto?.giorno[0] ?? g.ammesse[Math.floor(rnd() * g.ammesse.length)];
  return {
    giorno: g.giorno,
    azione: az as EsitoGiorno["azione"],
    umore: UMORI[Math.floor(rnd() * UMORI.length)],
    diario: g.fattiStanza?.join(" ") || "(giornata tranquilla, senza AI)",
    didascalia: `${stato.nome} ${azione(az).etichetta}.`,
    spinte,
    tratti_rafforzati: [],
    momento_importante: false,
    fatto_da_ricordare: null,
  };
}

interface Albero {
  id: string;
  stato: StatoAlbero;
  diario: PaginaDiario[];
  /** Memoria e risorse (catene.ts) e le giornate a fasce vissute. */
  catene: StatoCatene;
  giornate: { giorno: number; p: Palinsesto }[];
}

const inStanza = (a: Albero): AlberoInStanza => ({
  id: a.id,
  nome: a.stato.nome,
  strada: a.stato.strada,
  punteggi: a.stato.punteggi,
  carisma: a.stato.carisma ?? 50,
  influenzabilita: a.stato.influenzabilita ?? 50,
  giorni: a.stato.giorni,
});

interface Opzioni {
  /** Seme delle giornate a fasce. */
  seme: number;
  giorni: number;
  quanti: number;
  senzaAi: boolean;
  rnd: () => number;
  stampa: boolean;
}

/** Una stanza di alberi che vivono insieme. Restituisce tutti i fatti, giorno per giorno. */
async function vivi(opz: Opzioni) {
  const { rnd, stampa } = opz;
  const nomi = arg("nomi", "").split(",").filter(Boolean);
  const caratteri = arg("caratteri", "").split(",").filter(Boolean);
  const stradeIniziali = arg("strade", "").split(",");
  const luogo = opz.senzaAi || flag("meteo-finto")
    ? { citta: "Pescara (simulata)", latitudine: 0, longitudine: 0, fusoOrario: "Europe/Rome" }
    : await cercaCitta(arg("citta", "Pescara"));
  if (!luogo) throw new Error("Città non trovata");
  const dataSemina = oggiNelFuso(luogo.fusoOrario);

  const alberi: Albero[] = Array.from({ length: opz.quanti }, (_, i) => {
    const tratti = trattiCasuali(rnd);
    const nato = carattereDa(tratti, rnd);
    const [c, inf] = (caratteri[i] ?? "").split("/").map(Number);
    const s = stradeIniziali[i];
    const strada = isStrada(s) ? s : null;
    return {
      id: `albero-${i + 1}`,
      diario: [],
      catene: statoDaDatabase(null, null),
      giornate: [],
      stato: {
        nome: nomi[i] ?? (opz.quanti === 1 ? arg("nome", NOMI[0]) : NOMI[i] ?? `Albero ${i + 1}`),
        nomePersona: arg("persona", "Giulia"),
        citta: luogo.citta,
        giorni: 0,
        dataSemina,
        tratti,
        punteggi: strada ? { [strada]: 30 } : {},
        strada,
        umore: "curioso",
        biografia: [],
        carisma: Number.isFinite(c) ? c : nato.carisma,
        influenzabilita: Number.isFinite(inf) ? inf : nato.influenzabilita,
      },
    };
  });

  if (stampa) {
    console.log(opz.senzaAi ? "Senza AI: giornate finte, meteo simulato." : `Modelli: giornate ${MODELLO_GIORNATE}, lettere ${MODELLO}.`);
    for (const a of alberi) {
      const s = a.stato;
      console.log(`${s.nome} spunta a ${s.citta}${s.strada ? ` (già ${s.strada})` : ""}. Carisma ${s.carisma}, influenzabilità ${s.influenzabilita}.`);
      console.log(`  Tratti: ${TRATTI.map((t) => `${NOMI_TRATTI[t]} ${s.tratti[t]}`).join(", ")}`);
    }
    if (!CAMBIO_STRADA.attivo) console.log("Cambio di strada per contagio: spento.");
    console.log("");
  }

  const prev = opz.senzaAi || flag("meteo-finto") ? meteoFinto(dataSemina, opz.giorni, rnd) : await previsioni(luogo.latitudine, luogo.longitudine);
  let imprese: Impresa[] = [];
  const storia: { giorno: number; fatti: FattoStanza[]; prima: AlberoInStanza[]; imprese: Impresa[] }[] = [];
  // Con l'AI si vivono 7 giorni per chiamata (come il motore notturno); senza, uno alla volta.
  const blocco = opz.senzaAi ? 1 : 7;
  let fatto = 0;
  while (fatto < opz.giorni) {
    const n = Math.min(blocco, opz.giorni - fatto);
    const giorniPer = new Map(alberi.map((a) => [a.id, preparaGiorni(a.stato, n, prev, rnd)]));
    for (let k = 0; k < n; k++) {
      const giorno = fatto + k + 1;
      const prima = alberi.map(inStanza);
      const cielo = giorniPer.get(alberi[0].id)![k].meteo.cielo;
      const esito = giornoDellaStanza({ stanza: "stanza-1", giorno, alberi: prima, imprese, cielo, rnd });
      storia.push({ giorno, fatti: esito.fatti, prima, imprese });
      imprese = esito.imprese;
      const racconti = raccontaFatti(esito.fatti, prima, imprese);
      for (const a of alberi) {
        const r = applicaStanza(a.stato, giorno, esito.spinte[a.id], esito.cambi[a.id]);
        a.stato = r.stato;
        giorniPer.get(a.id)![k].fattiStanza = racconti[a.id];
        if (stampa && r.rivelata) console.log(`>>> ${a.stato.nome}: strada rivelata dal contagio, ${INFO_STRADE[r.rivelata].nome}`);
        if (stampa && r.cambiata) console.log(`>>> ${a.stato.nome} cambia strada: ${INFO_STRADE[r.cambiata].nome} (va annunciato con una lettera)`);
      }
    }
    for (const a of alberi) {
      // Le giornate a fasce dalla memoria (come il motore notturno): l'AI sceglie tra quelle attività.
      const fasce = giorniPer.get(a.id)!.map((g) => ({ giorno: g.giorno, meteo: g.meteo, umore: a.stato.umore }));
      const semeGiornate = `${opz.seme}-${a.id}`;
      const bozza = pianificaGiornate(semeGiornate, a.stato.strada, a.catene, fasce);
      const giorni = giorniPer.get(a.id)!.map((g, i) => conPalinsesto(g, bozza.palinsesti[i]));
      const esiti = opz.senzaAi
        ? giorni.map((g) => esitoFinto(a.stato, g, rnd))
        : await pianificaGiorni(a.stato, giorni, {
            diarioRecente: a.diario.slice(-6).map((p) => ({ giorno: p.giorno, azione: azione(p.azione).etichetta, testo: p.testo, meteo: p.meteo.descrizione })),
            messaggiPersona: [],
            catene: descriviCatene(bozza.inizi[0]),
          });
      const finale = pianificaGiornate(semeGiornate, a.stato.strada, a.catene, fasce, esiti.map((e) => e.azione));
      a.catene = finale.fine;
      finale.palinsesti.forEach((p, i) => a.giornate.push({ giorno: giorni[i].giorno, p }));
      const r = applicaEsiti(a.stato, giorni, esiti, rnd);
      a.stato = r.stato;
      a.diario.push(...r.pagine);
      if (stampa && r.rivelata) console.log(`>>> ${a.stato.nome}: strada rivelata, ${INFO_STRADE[r.rivelata].nome}`);
    }
    if (stampa) {
      for (let k = 0; k < n; k++) {
        const giorno = fatto + k + 1;
        const fatti = storia.find((s) => s.giorno === giorno)!.fatti.filter((f) => f.tipo !== "punti");
        for (const a of alberi) {
          const p = a.diario.find((x) => x.giorno === giorno)!;
          const fuori = FUORI_TONO.exec(`${p.testo} ${p.didascalia}`);
          const conFasce = opz.quanti === 1 || flag("fasce");
          if (opz.senzaAi && !fatti.length && !conFasce) continue;
          console.log(`Giorno ${p.giorno} · ${a.stato.nome} · ${p.meteo.descrizione} · ${p.azione} · ${p.umore}${p.momento ? " ★" : ""}`);
          const pal = a.giornate.find((x) => x.giorno === giorno)?.p;
          if (conFasce && pal) for (const f of FASCE_DI_GIORNO) console.log(`  ${f.padEnd(10)} ${pal[f][0].padEnd(22)} (oppure ${pal[f].slice(1).join(", ")})`);
          if (!opz.senzaAi) console.log(`  diario: ${p.testo}`);
          for (const f of giorniPer.get(a.id)![k].fattiStanza ?? []) console.log(`  stanza: ${f}`);
          if (fuori) console.log(`  !!! PAROLA FUORI TONO: «${fuori[0]}»`);
        }
      }
      console.log("");
    }
    fatto += n;
  }
  return { alberi, imprese, storia };
}

/** Il controllo della fase 2: ripetizioni nella giornata a fasce e catene finite. */
function controllo(a: Albero) {
  const conta = new Map<string, number>();
  let violazioni = 0;
  let maxDiFila = 0;
  a.giornate.forEach(({ p }, i) => {
    for (const f of FASCE_DI_GIORNO) {
      conta.set(p[f][0], (conta.get(p[f][0]) ?? 0) + 1);
      for (const k of [1, 2]) if (a.giornate[i - k]?.p[f][0] === p[f][0]) violazioni++;
    }
  });
  for (const id of conta.keys()) {
    let fila = 0;
    for (const { p } of a.giornate) {
      fila = FASCE_DI_GIORNO.some((f) => p[f][0] === id) ? fila + 1 : 0;
      maxDiFila = Math.max(maxDiFila, fila);
    }
  }
  const ordinate = [...conta.entries()].sort((x, y) => y[1] - x[1]);
  const m = a.catene.memoria;
  console.log(`=== Controllo di ${a.stato.nome} ===`);
  for (const f of m.registro) console.log(`  >> giorno ${f.giorno}: ${f.testo}`);
  console.log(`Attività principali diverse: ${conta.size} su ${a.giornate.length * 4} fasce.`);
  console.log(`Le più frequenti: ${ordinate.slice(0, 8).map(([id, n]) => `${id} ${n}`).join(", ")}`);
  console.log(`Stessa principale nella stessa fascia entro 3 giorni: ${violazioni} volte.`);
  console.log(`Giorni di fila con la stessa attività principale (in qualsiasi fascia): al massimo ${maxDiFila}.`);
  console.log(`Catene finite: ${CATENE.map((c) => `${c.id} ${m.completate[c.id] ?? 0}`).join(", ")}.`);
  console.log(`Scorte: ${descriviRisorse(a.catene.risorse) || "niente"}.`);
  console.log(descriviCatene(a.catene) || "(niente nel prato)");
  console.log("");
}

/** --prove N: la stessa stanza N volte, senza AI. Misura quanto spesso ogni capo coinvolge ogni albero. */
async function prove(n: number, giorni: number, quanti: number, seme: number) {
  type Conto = { giorniLiberi: number; ingressi: number; primi: number[] };
  const conti = new Map<string, Conto>();
  const tot = { uscite: 0, cambi: 0, rivalita: 0, gruppo: 0, cantieri: 0, prove: 0 };
  const livelli: number[] = [];
  let car: number[] = [];
  let inf: number[] = [];
  let nomi: string[] = [];
  for (let p = 0; p < n; p++) {
    const { storia, imprese, alberi } = await vivi({ seme: seme + p, giorni, quanti, senzaAi: true, rnd: casuale(seme + p), stampa: false });
    nomi = alberi.map((a) => a.stato.nome);
    car = alberi.map((a) => a.stato.carisma ?? 0);
    inf = alberi.map((a) => a.stato.influenzabilita ?? 0);
    tot.prove++;
    const primo = new Map<string, number>();
    for (const s of storia) {
      // Giorni «liberi»: l'impresa del capo esiste e l'albero non è sostenitore di nessuno né membro.
      for (const imp of s.imprese) {
        for (const a of s.prima) {
          if (membri(imp).includes(a.id) || s.imprese.some((i) => i.sostenitori.some((x) => x.albero === a.id))) continue;
          const k = `${imp.capo}>${a.id}`;
          const c = conti.get(k) ?? { giorniLiberi: 0, ingressi: 0, primi: [] };
          c.giorniLiberi++;
          conti.set(k, c);
        }
      }
      for (const f of s.fatti) {
        if (f.tipo === "entra" && f.motivo === "contagio") {
          const k = `${f.capo}>${f.albero}`;
          const c = conti.get(k) ?? { giorniLiberi: 0, ingressi: 0, primi: [] };
          c.ingressi++;
          if (!primo.has(k)) {
            primo.set(k, s.giorno);
            c.primi.push(s.giorno);
          }
          conti.set(k, c);
        }
        if (f.tipo === "esce") tot.uscite++;
        if (f.tipo === "cambio-strada") tot.cambi++;
        if (f.tipo === "rivalita") tot.rivalita++;
        if (f.tipo === "gruppo") tot.gruppo++;
        if (f.tipo === "lavoro" && f.fatto.tipo === "cantiere") tot.cantieri++;
      }
    }
    for (const i of imprese) livelli.push(avanzamento(i).livello);
  }
  console.log(`${n} stanze di ${quanti} alberi, ${giorni} giorni ciascuna, senza AI.`);
  console.log(`Alberi: ${nomi.map((x, i) => `${x} (carisma ${car[i]}, influenzabilità ${inf[i]})`).join(" · ")}\n`);
  console.log("Contagio (capo → albero): tasso osservato al giorno sui giorni in cui poteva entrare");
  for (const [k, c] of [...conti].sort()) {
    const [capo, altro] = k.split(">").map((x) => Number(x.split("-")[1]) - 1);
    const tasso = c.ingressi / Math.max(1, c.giorniLiberi);
    const medio = c.primi.length ? Math.round(c.primi.reduce((a, b) => a + b, 0) / c.primi.length) : null;
    console.log(
      `  ${nomi[capo]} → ${nomi[altro]}: ${tasso ? `1 giorno su ${Math.round(1 / tasso)}` : "mai"} (${c.ingressi} ingressi in ${c.giorniLiberi} giorni liberi); entrato almeno una volta in ${c.primi.length}/${n} stanze${medio ? `, la prima volta in media al giorno ${medio}` : ""}`,
    );
  }
  console.log(`\nIn media per stanza: ${(tot.uscite / n).toFixed(1)} uscite, ${(tot.cantieri / n).toFixed(1)} cantieri finiti, ${(tot.gruppo / n).toFixed(1)} attività di gruppo, ${(tot.rivalita / n).toFixed(1)} sfide tra rivali, ${(tot.cambi / n).toFixed(2)} cambi di strada.`);
  const perLivello = [1, 2, 3].map((l) => livelli.filter((x) => x === l).length);
  console.log(`Imprese alla fine: livello 1 ${perLivello[0]}, livello 2 ${perLivello[1]}, livello 3 ${perLivello[2]}.`);
  console.log("\nProbabilità teoriche della formula (sezione 7.2, affinità ×1, nessun sostenitore):");
  const imp = { id: "x", tipo: "banda-del-bosco", stanza: "s", capo: "c", fondata: 0, passi: 0, lavoro: 0, sostenitori: [] };
  for (const [c, i] of [[90, 85], [90, 50], [90, 20], [50, 85], [30, 85]] as const) {
    const pr = probabilitaContagio({ carisma: c }, { id: "a", nome: "a", strada: null, punteggi: {}, carisma: 50, influenzabilita: i, giorni: 0 }, imp);
    console.log(`  carisma ${c} × influenzabilità ${i}: ${(pr * 100).toFixed(1)}% al giorno, 1 giorno su ${Math.round(1 / pr)}`);
  }
}

async function main() {
  const giorni = Math.max(1, Number(arg("giorni", "7")));
  const quanti = Math.max(1, Math.min(4, Number(arg("alberi", "1"))));
  const seme = Number(arg("seme", String(Date.now() % 100000)));
  const nProve = Number(arg("prove", "0"));
  if (nProve > 0) return prove(nProve, giorni, quanti, seme);

  const senzaAi = flag("senza-ai");
  const { alberi, imprese } = await vivi({ seme, giorni, quanti, senzaAi, rnd: senzaAi ? casuale(seme) : Math.random, stampa: true });

  for (const a of alberi) controllo(a);
  for (const a of alberi) {
    const s = a.stato;
    console.log(`${s.nome}: ${s.strada ? INFO_STRADE[s.strada].nome : "strada non ancora rivelata"}. Punteggi: ${classifica(s.punteggi).map(([x, p]) => `${x} ${p}`).join(", ")}`);
    console.log(`  Biografia: ${s.biografia.map((f) => `g${f.giorno} ${f.testo}`).join(" | ") || "(vuota)"}`);
  }
  if (imprese.length) {
    console.log("\nImprese:");
    for (const r of descriviImprese(imprese, alberi.map(inStanza))) console.log(`  ${r}`);
  }
  const fuori = alberi.flatMap((a) => a.diario.filter((p) => FUORI_TONO.test(`${p.testo} ${p.didascalia}`)).map((p) => `${a.stato.nome} g${p.giorno}`));
  if (!senzaAi) console.log(`\nControllo del tono: ${fuori.length ? `parole fuori tono in ${fuori.join(", ")}` : "nessuna parola fuori tono"}.`);
  for (const i of imprese) if (!tipoImpresa(i.tipo)) throw new Error(i.tipo);

  if (flag("lettera")) {
    const a = alberi[0];
    // La lettera della settimana (Federico, 12/11/2026), con i fatti delle catene.
    const l = await scriviTestoLettera(
      a.stato,
      "settimanale",
      {
        diarioRecente: a.diario.slice(-7).map((p) => ({ giorno: p.giorno, azione: p.azione, testo: p.testo })),
        messaggiPersona: [],
      },
      a.catene.memoria.registro
        .filter((f) => f.giorno > a.stato.giorni - 7)
        .map((f) => `giorno ${f.giorno}: ${f.testo}`)
        .join("; ") || undefined,
    );
    console.log(`\n=== Lettera della settimana di ${a.stato.nome}: ${l.oggetto} ===\n${l.testo}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
