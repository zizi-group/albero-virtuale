// Simula un albero in memoria, senza database: utile per provare il motore e i prompt.
// Uso: npm run simula -- --giorni 7 --citta Pescara --nome Ottavio --persona Giulia [--lettera] [--senza-ai] [--seme abc]
// --senza-ai: solo il codice (giornate a fasce, risorse, catene), senza chiamate all'AI e senza costi.
// --meteo-finto: un meteo di prova che gira (sole, nuvole, pioggia, freddo), senza Open-Meteo:
//   le giornate si possono confrontare da un giro all'altro.
import "./_env";
import { trattiCasuali, INFO_STRADE, NOMI_TRATTI, TRATTI, classifica } from "../src/lib/albero/strade";
import { azione } from "../src/lib/albero/azioni";
import { CATENE, descriviCatene, statoDaDatabase, type StatoCatene } from "../src/lib/albero/catene";
import { FASCE_DI_GIORNO, pianificaGiornate, type Palinsesto } from "../src/lib/albero/giornata";
import { descriviRisorse } from "../src/lib/albero/risorse";
import type { Cielo } from "../src/lib/albero/tipi";
import { cercaCitta, descrivi, oggiNelFuso, previsioni, type Luogo, type MeteoGiorno } from "../src/lib/meteo";
import { MODELLO, MODELLO_GIORNATE } from "../src/lib/motore/ai";
import { scriviTestoLettera } from "../src/lib/motore/scritture";
import {
  applicaEsiti,
  conPalinsesto,
  pianificaGiorni,
  preparaGiorni,
  type EsitoGiorno,
  type PaginaDiario,
  type StatoAlbero,
} from "../src/lib/motore/vita";

function arg(nome: string, predefinito: string) {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : predefinito;
}

/** Senza AI: la principale della fascia di giorno racconta la giornata. */
function esitoFinto(p: Palinsesto, giorno: number, umore: string): EsitoGiorno {
  const zero = { filosofo: 0, imprenditore: 0, artista: 0, sportivo: 0, furfante: 0, viaggiatore: 0, poeta: 0 };
  return {
    giorno,
    azione: p.giorno[0],
    umore: umore as EsitoGiorno["umore"],
    diario: "(senza AI)",
    didascalia: "",
    spinte: zero,
    tratti_rafforzati: [],
    momento_importante: false,
    fatto_da_ricordare: null,
  };
}

/** Sedici giorni di meteo di prova: ogni tanto piove, ogni tanto fa freddo. */
function meteoFinto(primo: string): MeteoGiorno[] {
  const giri: [Cielo, number][] = [
    ["sole", 19], ["nuvole", 16], ["sole", 21], ["pioggia", 13], ["nuvole", 15], ["sole", 18], ["nebbia", 9], ["sole", 6],
    ["nuvole", 12], ["temporale", 17], ["sole", 22], ["nuvole", 14], ["pioggia", 11], ["sole", 17], ["neve", -1], ["nuvole", 10],
  ];
  return giri.map(([cielo, t], i) => {
    const d = new Date(`${primo}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i + 1);
    return { data: d.toISOString().slice(0, 10), cielo, temperatura: t, minima: t - 4, massima: t + 3, giorno: true, descrizione: descrivi(cielo, t) };
  });
}

async function main() {
  const giorniTotali = Math.max(1, Number(arg("giorni", "7")));
  const senzaAI = process.argv.includes("--senza-ai");
  const seme = arg("seme", "albero-di-prova");
  const finto = process.argv.includes("--meteo-finto");
  const luogo: Luogo | null = finto
    ? { citta: arg("citta", "Pescara"), latitudine: 42.46, longitudine: 14.21, fusoOrario: "Europe/Rome" }
    : await cercaCitta(arg("citta", "Pescara"));
  if (!luogo) throw new Error("Città non trovata");
  let stato: StatoAlbero = {
    nome: arg("nome", "Ottavio"),
    nomePersona: arg("persona", "Giulia"),
    citta: luogo.citta,
    giorni: 0,
    dataSemina: oggiNelFuso(luogo.fusoOrario),
    tratti: trattiCasuali(),
    punteggi: {},
    strada: null,
    umore: "curioso",
    biografia: [],
  };
  let catene: StatoCatene = statoDaDatabase(null, null);
  console.log(senzaAI ? "Senza AI: solo giornate, risorse e catene." : `Modelli: giornate ${MODELLO_GIORNATE}, lettere ${MODELLO}.`);
  console.log(`${stato.nome} spunta a ${stato.citta}. Tratti: ${TRATTI.map((t) => `${NOMI_TRATTI[t]} ${stato.tratti[t]}`).join(", ")}\n`);

  const prev = finto ? meteoFinto(stato.dataSemina) : await previsioni(luogo.latitudine, luogo.longitudine);
  const diario: PaginaDiario[] = [];
  const giornate: { giorno: number; p: Palinsesto }[] = [];
  let registroVisto = 0;
  while (stato.giorni < giorniTotali) {
    const n = Math.min(7, giorniTotali - stato.giorni);
    const giorni = preparaGiorni(stato, n, prev);
    const fasce = giorni.map((g) => ({ giorno: g.giorno, meteo: g.meteo, umore: stato.umore }));
    const bozza = pianificaGiornate(seme, stato.strada, catene, fasce);
    const giorniAI = giorni.map((g, i) => conPalinsesto(g, bozza.palinsesti[i]));
    const esiti = senzaAI
      ? giorniAI.map((g, i) => esitoFinto(bozza.palinsesti[i], g.giorno, stato.umore))
      : await pianificaGiorni(stato, giorniAI, {
          diarioRecente: diario.slice(-6).map((p) => ({ giorno: p.giorno, azione: azione(p.azione).etichetta, testo: p.testo, meteo: p.meteo.descrizione })),
          messaggiPersona: [],
          catene: descriviCatene(bozza.inizi[0]),
        });
    const finale = pianificaGiornate(seme, stato.strada, catene, fasce, esiti.map((e) => e.azione));
    const r = applicaEsiti(stato, giorniAI, esiti);
    stato = r.stato;
    for (const [i, p] of r.pagine.entries()) {
      diario.push(p);
      const pal = finale.palinsesti[i];
      giornate.push({ giorno: p.giorno, p: pal });
      console.log(`Giorno ${p.giorno} · ${p.meteo.descrizione} · azione del giorno: ${p.azione}${p.momento ? " ★" : ""}`);
      for (const f of FASCE_DI_GIORNO) console.log(`  ${f.padEnd(10)} ${pal[f][0].padEnd(22)} (oppure ${pal[f].slice(1).join(", ")})`);
      if (!senzaAI) console.log(`  diario: ${p.testo}`);
    }
    catene = finale.fine;
    for (const f of catene.memoria.registro.slice(registroVisto)) console.log(`  >> giorno ${f.giorno}: ${f.testo}`);
    registroVisto = catene.memoria.registro.length;
    console.log(`  scorte: ${descriviRisorse(catene.risorse) || "niente"}\n`);
    if (r.rivelata) console.log(`>>> Strada rivelata: ${INFO_STRADE[r.rivelata].nome}\n`);
  }

  // ——— Il controllo: ripetizioni e catene ———
  const conta = new Map<string, number>();
  let violazioni = 0;
  let maxDiFila = 0;
  giornate.forEach(({ p }, i) => {
    for (const f of FASCE_DI_GIORNO) {
      conta.set(p[f][0], (conta.get(p[f][0]) ?? 0) + 1);
      for (const k of [1, 2]) if (giornate[i - k]?.p[f][0] === p[f][0]) violazioni++;
    }
  });
  for (const id of conta.keys()) {
    let fila = 0;
    for (const { p } of giornate) {
      fila = FASCE_DI_GIORNO.some((f) => p[f][0] === id) ? fila + 1 : 0;
      maxDiFila = Math.max(maxDiFila, fila);
    }
  }
  const ordinate = [...conta.entries()].sort((a, b) => b[1] - a[1]);
  console.log("=== Controllo ===");
  console.log(`Attività principali diverse: ${conta.size} su ${giornate.length * 4} fasce.`);
  console.log(`Le più frequenti: ${ordinate.slice(0, 8).map(([id, n]) => `${id} ${n}`).join(", ")}`);
  console.log(`Stessa principale nella stessa fascia entro 3 giorni: ${violazioni} volte.`);
  console.log(`Giorni di fila con la stessa attività principale (in qualsiasi fascia): al massimo ${maxDiFila}.`);
  console.log(`Catene finite: ${CATENE.map((c) => `${c.id} ${catene.memoria.completate[c.id] ?? 0}`).join(", ")}.`);
  console.log(descriviCatene(catene) || "(niente nel prato)");

  if (senzaAI) return;
  console.log("\nPunteggi:", classifica(stato.punteggi).map(([s, p]) => `${s} ${p}`).join(", "));
  console.log("Biografia:", stato.biografia.map((f) => `g${f.giorno} ${f.testo}`).join(" | ") || "(vuota)");

  if (process.argv.includes("--lettera")) {
    const l = await scriviTestoLettera(
      stato,
      "settimanale",
      {
        diarioRecente: diario.slice(-7).map((p) => ({ giorno: p.giorno, azione: p.azione, testo: p.testo })),
        messaggiPersona: [],
      },
      catene.memoria.registro
        .filter((f) => f.giorno > stato.giorni - 7)
        .map((f) => `giorno ${f.giorno}: ${f.testo}`)
        .join("; ") || undefined,
    );
    console.log(`\n=== Lettera della settimana: ${l.oggetto} ===\n${l.testo}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
