// Simula un albero in memoria, senza database: utile per provare il motore e i prompt.
// Uso: npm run simula -- --giorni 7 --citta Pescara --nome Ottavio --persona Giulia [--lettera]
import "./_env";
import { trattiCasuali, INFO_STRADE, NOMI_TRATTI, TRATTI, classifica } from "../src/lib/albero/strade";
import { azione } from "../src/lib/albero/azioni";
import { cercaCitta, oggiNelFuso, previsioni } from "../src/lib/meteo";
import { MODELLO } from "../src/lib/motore/ai";
import { scriviTestoLettera } from "../src/lib/motore/scritture";
import { applicaEsiti, pianificaGiorni, preparaGiorni, type PaginaDiario, type StatoAlbero } from "../src/lib/motore/vita";

function arg(nome: string, predefinito: string) {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : predefinito;
}

async function main() {
  const giorniTotali = Math.max(1, Number(arg("giorni", "7")));
  const luogo = await cercaCitta(arg("citta", "Pescara"));
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
  console.log(`Modello: ${MODELLO}. ${stato.nome} spunta a ${stato.citta}.`);
  console.log(`Tratti: ${TRATTI.map((t) => `${NOMI_TRATTI[t]} ${stato.tratti[t]}`).join(", ")}\n`);

  const prev = await previsioni(luogo.latitudine, luogo.longitudine);
  const diario: PaginaDiario[] = [];
  while (stato.giorni < giorniTotali) {
    const n = Math.min(7, giorniTotali - stato.giorni);
    const giorni = preparaGiorni(stato, n, prev);
    const esiti = await pianificaGiorni(stato, giorni, {
      diarioRecente: diario.slice(-6).map((p) => ({ giorno: p.giorno, azione: azione(p.azione).etichetta, testo: p.testo, meteo: p.meteo.descrizione })),
      messaggiPersona: [],
    });
    const r = applicaEsiti(stato, giorni, esiti);
    stato = r.stato;
    for (const [i, p] of r.pagine.entries()) {
      diario.push(p);
      const ev = giorni[i].evento ? `  [evento: ${giorni[i].evento}]` : "";
      console.log(`Giorno ${p.giorno} · ${p.data} · ${p.meteo.descrizione} · ${p.azione} · ${p.umore}${p.momento ? " ★" : ""}${ev}`);
      console.log(`  diario: ${p.testo}`);
      console.log(`  didascalia: ${p.didascalia}\n`);
    }
    if (r.rivelata) console.log(`>>> Strada rivelata: ${INFO_STRADE[r.rivelata].nome}\n`);
  }
  console.log("Punteggi:", classifica(stato.punteggi).map(([s, p]) => `${s} ${p}`).join(", "));
  console.log("Biografia:", stato.biografia.map((f) => `g${f.giorno} ${f.testo}`).join(" | ") || "(vuota)");

  if (process.argv.includes("--lettera")) {
    const l = await scriviTestoLettera(stato, "mensile", {
      diarioRecente: diario.slice(-20).map((p) => ({ giorno: p.giorno, azione: p.azione, testo: p.testo })),
      messaggiPersona: [],
    });
    console.log(`\n=== Lettera: ${l.oggetto} ===\n${l.testo}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
