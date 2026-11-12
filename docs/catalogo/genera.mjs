// Genera i file del catalogo e controlla che siano coerenti.
//
//   node docs/catalogo/genera.mjs            scrive gesti.md, attivita.md, oggetti.md, imprese.md, controllo.md
//   node docs/catalogo/genera.mjs --controlla  solo il controllo (non scrive niente)
//
// I dati stanno in docs/catalogo/fonte/*.mjs: si modificano lì, poi si rigenera.
// Esce con codice 1 se c'è anche un solo errore.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GESTI } from "./fonte/gesti.mjs";
import { SEZIONI, TRACCE } from "./fonte/attivita.mjs";
import { OGGETTI } from "./fonte/oggetti.mjs";
import { CATENE, CANTIERI, IMPRESE } from "./fonte/imprese.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..");
const SOLO_CONTROLLO = process.argv.includes("--controlla");

// ——— Vocabolario fisso ———

const STRADE = ["filosofo", "imprenditore", "artista", "sportivo", "furfante", "viaggiatore", "poeta"];
const UMORI = ["curioso", "allegro", "pensieroso", "assonnato", "furbo", "fiero", "sognante", "energico", "malinconico"];
const FASCE = { M: "mattina", G: "giorno", P: "pomeriggio", S: "sera", N: "notte" };
const POSTI_ATTIVITA = ["casa", "prato", "davanti", "sfondo", "rami", "giro"];
const POSTI_OGGETTI = ["sfondo", "prato", "davanti", "rami", "armadio", "cassetta", "mensola"];
const RISORSE = ["legna", "ghiande", "foglie", "sassi", "bacche", "acqua", "resina", "piume", "semi", "fili"];
const CATEGORIE = {
  edificio: "Edifici",
  arredo: "Arredi",
  attrezzo: "Attrezzi",
  gioco: "Giochi",
  vestito: "Vestiti",
  trofeo: "Trofei",
  stagione: "Album delle stagioni",
  rarita: "Rarità",
};
const PRIORITA = { "c'è": "disegno già fatto", 1: "lancio", 2: "dopo (ogni mese)", icona: "icona" };

const METEO = {
  qualsiasi: "con qualsiasi tempo",
  asciutto: "senza pioggia né neve (oggi `asciutto`)",
  pioggia: "pioggia o temporale (oggi `pioggia`)",
  temporale: "temporale",
  neve: "neve",
  nebbia: "nebbia",
  sole: "cielo di sole",
  vento: "vento forte (da aggiungere a `Meteo`: Open-Meteo dà la velocità del vento; soglia da decidere)",
  caldo: "massima dai `SOLE_DA` gradi in su (scena.ts)",
  freddo: "sotto `FREDDO_SOTTO` gradi o neve (scena.ts)",
  dopoPioggia: "giornata asciutta dopo un giorno di pioggia, o pozzanghera nella stanza",
  dopoTemporale: "giornata asciutta dopo un temporale",
  sereno: "sera senza pioggia né nuvole",
};
const METEO_REGOLE = {
  bagnato: "pioggia o temporale",
  pioggia: "pioggia",
  temporale: "temporale",
  neve: "neve",
  nebbia: "nebbia",
  sole: "sole",
  vento: "vento forte",
  freddo: "sotto FREDDO_SOTTO gradi o neve",
  gelo: "minima a 0 gradi o meno",
  caldo30: "massima a 30 gradi o più",
  soleCaldo: "sole con massima da SOLE_DA gradi",
};
// Compatibilità con CompatibilitaMeteo di azioni.ts e mestieri.ts.
const METEO_CODICE = {
  qualsiasi: ["qualsiasi"],
  asciutto: ["asciutto", "sole", "vento", "caldo", "freddo", "nebbia", "dopoPioggia", "dopoTemporale", "sereno", "neve"],
  pioggia: ["pioggia", "temporale"],
  notte: ["qualsiasi", "sereno"],
};
const QUANDO = {
  sempre: "qualsiasi giorno",
  "dopo-cantiere": "il giorno dopo un cantiere finito",
  "dopo-scavo": "in una giornata con un'attività che scava (cerca-ghiande, furfante.nasconde, furfante.galleria, zappa-aiuola)",
  "agosto-10-13": "dal 10 al 13 agosto, sera serena",
  estate: "in estate (stagioneDa)",
  primavera: "in primavera (stagioneDa)",
  "autunno-una-volta": "in autunno, una volta l'anno",
  "primo-giorno-primavera": "il primo giorno di primavera vissuto",
  "prima-neve-anno": "la prima neve dell'anno",
  caldo30: "con la massima a 30 gradi o più",
  "ogni-365-giorni": "al giorno 365, 730, …",
  notte: "di notte",
  "1-aprile": "il 1° aprile",
  "sole-dopo-pioggia": "giornata di sole dopo un giorno di pioggia",
};
const SEGNI = ["ferma", "mov", "gruppo", "L1", "L2", "L3"];

// ——— Lettura ———

const righe = (testo) =>
  testo
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r && !r.startsWith("#"))
    .map((r) => r.split("|").map((c) => c.trim()));

const lista = (c) => (!c || c === "-" ? [] : c.split(/\s+/).filter(Boolean));

const errori = [];
const avvisi = [];
const errore = (m) => errori.push(m);
const avviso = (m) => avvisi.push(m);

const gesti = righe(GESTI).map(([id, gruppo, durata, movimento, ridotto, stato]) => ({ id, gruppo, durata, movimento, ridotto, stato }));
const GESTO = new Map(gesti.map((g) => [g.id, g]));

const tracce = righe(TRACCE).map(([id, descrizione, dura]) => ({ id, descrizione, dura }));
const TRACCIA = new Map(tracce.map((t) => [t.id, t]));

function risorse(c, dove) {
  const r = {};
  for (const x of lista(c)) {
    const [nome, q] = x.split(":");
    if (!RISORSE.includes(nome)) errore(`${dove}: risorsa sconosciuta «${nome}»`);
    const n = Number(q);
    if (!Number.isInteger(n) || n < 1 || n > 9) errore(`${dove}: quantità fuori da 1-9 in «${x}»`);
    r[nome] = n;
  }
  return r;
}

const attivita = [];
for (const s of SEZIONI) {
  for (const c of righe(s.righe)) {
    if (c.length !== 14) {
      errore(`attività «${c[0]}»: ${c.length} campi invece di 14`);
      continue;
    }
    const [id, etichetta, fasce, meteo, umori, g, posto, richiede, prende, lascia, tr, porta, voglia, note] = c;
    const segni = lista(note);
    const opz = Object.fromEntries(segni.filter((x) => x.includes("=")).map((x) => x.split("=")));
    attivita.push({
      id,
      etichetta,
      sezione: s,
      tipo: s.tipo,
      strada: s.strada ?? null,
      fasce: lista(fasce),
      meteo: lista(meteo),
      umori: lista(umori),
      gesti: lista(g),
      posto,
      richiede: lista(richiede),
      prende: risorse(prende, id),
      lascia: risorse(lascia, id),
      tracce: lista(tr),
      porta: lista(porta),
      voglia,
      segni: segni.filter((x) => !x.includes("=")),
      opz,
    });
  }
}
const ATT = new Map();
for (const a of attivita) {
  if (ATT.has(a.id)) errore(`attività «${a.id}» ripetuta`);
  ATT.set(a.id, a);
}

const oggetti = righe(OGGETTI).map(([id, nome, categoria, posto, sblocco, indizio, priorita]) => ({ id, nome, categoria, posto, sblocco, indizio, priorita, usi: [] }));
const OGG = new Map();
for (const o of oggetti) {
  if (OGG.has(o.id)) errore(`oggetto «${o.id}» ripetuto`);
  OGG.set(o.id, o);
}

const catene = righe(CATENE).map(([id, nome, strada, passi, finale]) => ({ id, nome, strada, passi: lista(passi), finale }));
const CAT = new Map(catene.map((x) => [x.id, x]));

const cantieri = righe(CANTIERI).map(([id, nome, lascia, di, apre, passi]) => ({ id, nome, lascia, di, apre, passi: passi.split(";").map((p) => p.trim()) }));
const CANT = new Map(cantieri.map((x) => [x.id, x]));

const IMP = new Map(IMPRESE.map((x) => [x.id, x]));

// ——— Le regole di sblocco ———

const NUMERICHE = ["catene", "cantieri", "giorni", "diverse", "regali", "messaggi", "lettere", "stanze", "compagni", "sostenitori", "collezione", "attrezzi", "livello"];

function controllaTermine(t, dove, proprio) {
  let m;
  if (t === "iniziale" || t === "baratto" || t === "tesoro") return;
  if ((m = t.match(/^iniziale:(.+)$/))) return STRADE.includes(m[1]) || errore(`${dove}: strada sconosciuta in «${t}»`);
  if ((m = t.match(/^fatta:([^×]+)(?:×(\d+))?$/))) return ATT.has(m[1]) || errore(`${dove}: attività sconosciuta in «${t}»`);
  if ((m = t.match(/^catena:([^×]+)(?:×(\d+))?$/))) return CAT.has(m[1]) || errore(`${dove}: catena sconosciuta in «${t}»`);
  if ((m = t.match(/^cantiere:(.+)$/))) return CANT.has(m[1]) || errore(`${dove}: cantiere sconosciuto in «${t}»`);
  if ((m = t.match(/^impresa:([^@]+)@([123])$/))) return m[1] === "*" || IMP.has(m[1]) || errore(`${dove}: impresa sconosciuta in «${t}»`);
  if ((m = t.match(/^regalo:(.+)$/))) return m[1] === proprio || errore(`${dove}: «${t}» deve avere l'id dell'oggetto stesso`);
  if ((m = t.match(/^meteo:([^×]+)(?:×(\d+))?$/))) return m[1] in METEO_REGOLE || errore(`${dove}: meteo sconosciuto in «${t}»`);
  if ((m = t.match(/^strada:(.+)$/))) return m[1] === "*" || STRADE.includes(m[1]) || errore(`${dove}: strada sconosciuta in «${t}»`);
  if ((m = t.match(/^stagione:(.+)$/))) return ["primavera", "estate", "autunno", "inverno"].includes(m[1]) || errore(`${dove}: stagione sconosciuta in «${t}»`);
  if ((m = t.match(/^risorsa:([a-z]+):(\d)$/))) return RISORSE.includes(m[1]) || errore(`${dove}: risorsa sconosciuta in «${t}»`);
  if ((m = t.match(/^([a-z]+):(\d+)$/)) && NUMERICHE.includes(m[1])) return;
  errore(`${dove}: regola non riconosciuta «${t}»`);
}

const alternative = (regola) => regola.split(" o ").map((alt) => alt.split(" + ").map((t) => t.trim()));
function controllaRegola(regola, dove, proprio) {
  for (const alt of alternative(regola)) for (const t of alt) controllaTermine(t, dove, proprio);
}
const termini = (regola) => alternative(regola).flat();

// ——— Controlli ———

// Gesti
const usoGesti = new Map(gesti.map((g) => [g.id, 0]));
for (const g of gesti) {
  if (!["base", "movimento", "mani", "viso", "corpo", "testa"].includes(g.gruppo)) errore(`gesto «${g.id}»: gruppo sconosciuto`);
  if (!["c'è", "nuovo"].includes(g.stato)) errore(`gesto «${g.id}»: stato sconosciuto`);
}
const gestiCodice = [...readFileSync(join(RADICE, "src/components/albero/vivo/gesti.ts"), "utf8").matchAll(/^export function (\w+)/gm)].map((m) => m[1]);
for (const id of ["luogo", "mano", "prendi", "cammina", "siediti", "alzati", "colpi", "sospira", "asciugaFronte", "manoSuiFianchi", "saltelloContento"]) {
  if (!gestiCodice.includes(id)) avviso(`il gesto «${id}» non è più in gesti.ts`);
}
for (const g of gesti.filter((x) => x.stato === "c'è")) if (!gestiCodice.includes(g.id)) errore(`gesto «${g.id}» segnato «c'è» ma non è in gesti.ts`);

// Attività
const usoTracce = new Map(tracce.map((t) => [t.id, { lasciata: [], richiesta: [] }]));
for (const a of attivita) {
  const dove = `attività «${a.id}»`;
  if (a.fasce.length === 0 || a.fasce.some((f) => !(f in FASCE))) errore(`${dove}: fasce non valide`);
  if (a.meteo.length === 0 || a.meteo.some((m) => !(m in METEO))) errore(`${dove}: meteo non valido «${a.meteo.join(" ")}»`);
  if (a.tipo !== "intermezzo" && (a.umori.length === 0 || a.umori.some((u) => !UMORI.includes(u)))) errore(`${dove}: umori non validi`);
  if (!POSTI_ATTIVITA.includes(a.posto)) errore(`${dove}: posto sconosciuto «${a.posto}»`);
  const [min, max] = a.tipo === "intermezzo" ? [1, 2] : [3, 4];
  if (a.gesti.length < min || a.gesti.length > max) errore(`${dove}: ${a.gesti.length} gesti (servono ${min}-${max})`);
  for (const g of a.gesti) {
    if (!GESTO.has(g)) errore(`${dove}: gesto sconosciuto «${g}»`);
    else if (GESTO.get(g).gruppo === "base") errore(`${dove}: «${g}» è uno strumento, non un gesto`);
    else usoGesti.set(g, usoGesti.get(g) + 1);
  }
  for (const r of a.richiede) {
    let m;
    if ((m = r.match(/^\?\*(.+)$/))) {
      if (!(m[1] in CATEGORIE)) errore(`${dove}: categoria sconosciuta «${m[1]}»`);
      for (const o of oggetti.filter((x) => x.categoria === m[1])) o.usi.push({ att: a.id, modo: "qualsiasi" });
    } else if ((m = r.match(/^(\??)~(.+)$/))) {
      if (!TRACCIA.has(m[2])) errore(`${dove}: traccia sconosciuta «${m[2]}»`);
      else usoTracce.get(m[2]).richiesta.push(a.id);
    } else if ((m = r.match(/^\$(.+)$/))) {
      if (!RISORSE.includes(m[1])) errore(`${dove}: risorsa sconosciuta «${m[1]}»`);
    } else {
      const facoltativo = r.startsWith("?");
      const id = r.replace(/^\?/, "");
      if (!OGG.has(id)) errore(`${dove}: oggetto sconosciuto «${id}»`);
      else OGG.get(id).usi.push({ att: a.id, modo: facoltativo ? "se c'è" : "serve" });
    }
  }
  for (const t of a.tracce) {
    if (!TRACCIA.has(t)) errore(`${dove}: traccia sconosciuta «${t}»`);
    else usoTracce.get(t).lasciata.push(a.id);
  }
  for (const p of a.porta) if (!ATT.has(p)) errore(`${dove}: «porta a» sconosciuta «${p}»`);
  if (a.tipo !== "intermezzo" && (!a.voglia || a.voglia === "-")) errore(`${dove}: manca la voglia`);
  for (const s of a.segni) if (!SEGNI.includes(s)) errore(`${dove}: segno sconosciuto «${s}»`);
  for (const k of Object.keys(a.opz)) if (!["base", "quando", "p", "da"].includes(k)) errore(`${dove}: segno sconosciuto «${k}=»`);
  if (a.opz.quando && !(a.opz.quando in QUANDO)) errore(`${dove}: «quando» sconosciuto «${a.opz.quando}»`);
  if (a.tipo === "rara" && !a.opz.quando) errore(`${dove}: una rara deve avere «quando»`);
  if (a.tipo === "strada" && !a.segni.some((s) => /^L[123]$/.test(s))) errore(`${dove}: manca il livello (L1, L2, L3)`);
  if (a.tipo === "strada" && !a.id.startsWith(`${a.strada}.`)) errore(`${dove}: l'id deve cominciare con «${a.strada}.»`);
  if (a.tipo === "gruppo" && !a.segni.includes("gruppo")) errore(`${dove}: manca il segno «gruppo»`);
  if (a.segni.includes("ferma") && a.segni.includes("mov")) errore(`${dove}: non può essere ferma e di movimento insieme`);
}
for (const s of STRADE) {
  const n = attivita.filter((a) => a.strada === s).length;
  if (n !== 12) errore(`la strada «${s}» ha ${n} attività invece di 12`);
}

// Risorse: chi le prende deve poterle trovare.
const produttori = Object.fromEntries(RISORSE.map((r) => [r, attivita.filter((a) => a.lascia[r]).map((a) => a.id)]));
for (const a of attivita) {
  for (const r of [...Object.keys(a.prende), ...a.richiede.filter((x) => x.startsWith("$")).map((x) => x.slice(1))]) {
    if (!produttori[r]?.length) errore(`attività «${a.id}»: usa «${r}» ma nessuna attività la raccoglie`);
  }
}
for (const r of RISORSE) {
  const consumatori = attivita.filter((a) => a.prende[r]);
  if (!produttori[r].length) avviso(`la risorsa «${r}» non si raccoglie con nessuna attività del catalogo (arriva da regali, ospiti o eventi)`);
  if (!consumatori.length && !oggetti.some((o) => o.sblocco.includes(`risorsa:${r}:`))) avviso(`la risorsa «${r}» non serve a nessuna attività`);
}

// Tracce: una traccia richiesta deve nascere da qualche parte.
for (const [id, u] of usoTracce) {
  const sola = TRACCIA.get(id).dura.includes("nasce anche da sola");
  if (u.richiesta.length && !u.lasciata.length && !sola) errore(`la traccia «${id}» serve a ${u.richiesta.join(", ")} ma nessuna attività la lascia`);
  if (!u.richiesta.length && !u.lasciata.length) avviso(`la traccia «${id}» non è usata`);
}

// Le attività e i nomi di oggi (azioni.ts, mestieri.ts, giornata.ts) restano.
const azioniTs = readFileSync(join(RADICE, "src/lib/albero/azioni.ts"), "utf8");
const azioniOggi = [...azioniTs.matchAll(/id: "([^"]+)",\s*etichetta: "([^"]+)",\s*meteo: "([^"]+)"/g)].map((m) => ({ id: m[1], etichetta: m[2], meteo: m[3] }));
const giornataTs = readFileSync(join(RADICE, "src/lib/albero/giornata.ts"), "utf8");
const infoOggi = new Map(
  [...giornataTs.matchAll(/^\s+"?([a-z-]+)"?: \{ fasce: (TUTTE|\[[^\]]*\]).*?voglia: "([^"]+)"/gm)].map((m) => [
    m[1],
    { fasce: m[2] === "TUTTE" ? ["mattina", "giorno", "pomeriggio", "sera"] : [...m[2].matchAll(/"(\w+)"/g)].map((x) => x[1]), voglia: m[3] },
  ]),
);
const mestieriTs = readFileSync(join(RADICE, "src/lib/albero/mestieri.ts"), "utf8");
const mestieriOggi = [...mestieriTs.matchAll(/a\("([^"]+)", "([^"]+)", \[([^\]]*)\](?:, (\d))?(?:, \[([^\]]*)\])?(?:, "(\w+)")?/g)].map((m) => ({
  id: m[1],
  etichetta: m[2],
  fasce: [...m[3].matchAll(/"(\w+)"/g)].map((x) => x[1]),
  livello: Number(m[4] ?? 1),
  richiede: m[5] ? [...m[5].matchAll(/"([\w-]+)"/g)].map((x) => x[1]) : [],
  meteo: m[6] ?? "asciutto",
}));
const cantieriOggi = [...new Map([...mestieriTs.matchAll(/id: "([\w-]+)",\s*nome: "[^"]+",\s*lascia: "([\w-]+)"/g)].map((m) => [m[1], { id: m[1], lascia: m[2] }])).values()];
if (cantieriOggi.length !== 21) avviso(`in mestieri.ts ho letto ${cantieriOggi.length} cantieri (attesi 21)`);
const fasceDi = (a) => a.fasce.map((f) => FASCE[f]);
const stessi = (x, y) => x.length === y.length && x.every((v) => y.includes(v));

if (azioniOggi.length !== 23) avviso(`in azioni.ts ho letto ${azioniOggi.length} azioni (attese 23): controllare l'espressione regolare`);
for (const z of azioniOggi) {
  const a = ATT.get(z.id);
  if (!a) {
    errore(`l'azione di oggi «${z.id}» manca nel catalogo`);
    continue;
  }
  if (a.opz.da !== "azioni") errore(`attività «${z.id}»: è in azioni.ts, deve avere «da=azioni»`);
  if (a.etichetta !== z.etichetta) avviso(`attività «${z.id}»: etichetta diversa da azioni.ts («${z.etichetta}»)`);
  if (!a.meteo.every((m) => METEO_CODICE[z.meteo]?.includes(m))) errore(`attività «${z.id}»: meteo «${a.meteo.join(" ")}» non compatibile con «${z.meteo}» di azioni.ts`);
  const info = infoOggi.get(z.id);
  if (info && !stessi(fasceDi(a), info.fasce)) avviso(`attività «${z.id}»: fasce diverse da giornata.ts (${info.fasce.join(", ")})`);
  if (info && a.voglia !== info.voglia) avviso(`attività «${z.id}»: voglia diversa da giornata.ts («${info.voglia}»)`);
}
if (mestieriOggi.length !== 42) avviso(`in mestieri.ts ho letto ${mestieriOggi.length} attività (attese 42): controllare l'espressione regolare`);
for (const z of mestieriOggi) {
  const a = ATT.get(z.id);
  if (!a) {
    errore(`l'attività di mestieri.ts «${z.id}» manca nel catalogo`);
    continue;
  }
  if (a.opz.da !== "mestieri") errore(`attività «${z.id}»: è in mestieri.ts, deve avere «da=mestieri»`);
  if (a.etichetta !== z.etichetta) avviso(`attività «${z.id}»: etichetta diversa da mestieri.ts («${z.etichetta}»)`);
  if (!stessi(fasceDi(a), z.fasce)) errore(`attività «${z.id}»: fasce diverse da mestieri.ts (${z.fasce.join(", ")})`);
  if (!a.segni.includes(`L${z.livello}`)) errore(`attività «${z.id}»: livello diverso da mestieri.ts (${z.livello})`);
  if (!a.meteo.every((m) => METEO_CODICE[z.meteo]?.includes(m))) errore(`attività «${z.id}»: meteo non compatibile con «${z.meteo}» di mestieri.ts`);
  for (const r of z.richiede) if (!a.richiede.includes(r)) errore(`attività «${z.id}»: mestieri.ts richiede «${r}»`);
}
for (const a of attivita.filter((x) => x.opz.da)) {
  const lista = a.opz.da === "azioni" ? azioniOggi : mestieriOggi;
  if (!lista.some((z) => z.id === a.id)) errore(`attività «${a.id}»: segnata «da=${a.opz.da}» ma non c'è`);
}
for (const c of cantieriOggi) {
  if (!CANT.has(c.id)) errore(`il cantiere di mestieri.ts «${c.id}» manca`);
  else if (CANT.get(c.id).lascia !== c.lascia) errore(`cantiere «${c.id}»: lascia «${CANT.get(c.id).lascia}», in mestieri.ts «${c.lascia}»`);
}

// Oggetti
const collezioneTs = readFileSync(join(RADICE, "src/lib/albero/collezione.ts"), "utf8");
const regaliTs = readFileSync(join(RADICE, "src/lib/albero/regali.ts"), "utf8");
const idCollezione = [...collezioneTs.matchAll(/\{\s*id: "([\w-]+)",\s*tipo:/g)].map((m) => m[1]);
const idRegali = [...regaliTs.matchAll(/\{\s*id: "([\w-]+)",\s*nome:/g)].map((m) => m[1]);
if (idCollezione.length !== 25) avviso(`in collezione.ts ho letto ${idCollezione.length} voci (attese 25)`);
if (idRegali.length !== 10) avviso(`in regali.ts ho letto ${idRegali.length} regali (attesi 10)`);
for (const id of idCollezione) if (!OGG.has(id)) errore(`la voce di collezione.ts «${id}» manca nel catalogo`);
for (const id of idRegali) {
  if (!OGG.has(id)) errore(`il regalo di regali.ts «${id}» manca nel catalogo`);
  else if (!OGG.get(id).sblocco.includes(`regalo:${id}`)) errore(`oggetto «${id}»: è in regali.ts, la regola deve avere «regalo:${id}»`);
}
for (const o of oggetti) {
  const dove = `oggetto «${o.id}»`;
  if (!(o.categoria in CATEGORIE)) errore(`${dove}: categoria sconosciuta «${o.categoria}»`);
  if (!POSTI_OGGETTI.includes(o.posto)) errore(`${dove}: posto sconosciuto «${o.posto}»`);
  if (!(o.priorita in PRIORITA)) errore(`${dove}: priorità sconosciuta «${o.priorita}»`);
  if (["trofeo", "stagione", "rarita"].includes(o.categoria) !== (o.priorita === "icona")) errore(`${dove}: «icona» vale solo per trofei e album`);
  if (!o.indizio) errore(`${dove}: manca l'indizio`);
  controllaRegola(o.sblocco, dove, o.id);
  if (o.usi.length === 0) errore(`${dove}: nessuna attività lo usa`);
  const specifici = o.usi.filter((u) => u.modo !== "qualsiasi");
  if (o.usi.length && !specifici.length && !["trofeo", "stagione", "rarita"].includes(o.categoria)) avviso(`${dove}: usato solo come «un oggetto qualsiasi»`);
  if (o.sblocco.includes("regalo:") && specifici.length < 2) avviso(`${dove}: è un regalo e apre ${specifici.length} attività (la sezione 11 ne chiede almeno 2)`);
}
for (const c of cantieri) {
  const dove = `cantiere «${c.id}»`;
  if (!OGG.has(c.lascia)) errore(`${dove}: lascia l'oggetto sconosciuto «${c.lascia}»`);
  else if (!termini(OGG.get(c.lascia).sblocco).includes(`cantiere:${c.id}`)) errore(`${dove}: l'oggetto «${c.lascia}» non si sblocca con «cantiere:${c.id}»`);
  if (c.di !== "libero" && !IMP.has(c.di)) errore(`${dove}: impresa sconosciuta «${c.di}»`);
  controllaRegola(c.apre, dove);
  if (c.passi.length < 2 || c.passi.some((p) => !p)) errore(`${dove}: servono almeno 2 passi`);
}

// Catene: i passi esistono, le risorse e le tracce arrivano prima di servire, nessun cerchio, finale scritto.
for (const k of catene) {
  const dove = `catena «${k.id}»`;
  if (k.strada !== "tutti" && !STRADE.includes(k.strada)) errore(`${dove}: strada sconosciuta`);
  if (k.passi.length < 3) errore(`${dove}: servono almeno 3 passi`);
  if (!k.finale) errore(`${dove}: manca il finale`);
  const compagnia = k.finale.includes("Serve compagnia");
  const fatte = new Set();
  const tracceViste = new Set();
  k.passi.forEach((p, i) => {
    const a = ATT.get(p);
    if (!a) return errore(`${dove}: passo sconosciuto «${p}»`);
    if (a.strada && k.strada !== a.strada) errore(`${dove}: il passo «${p}» è di un'altra strada`);
    if (a.tipo === "gruppo" && !compagnia && i === k.passi.length - 1) errore(`${dove}: l'ultimo passo è di gruppo e si salterebbe da solo: la catena non si chiude`);
    for (const r of a.richiede) {
      const m = r.match(/^~(.+)$/);
      if (m && !tracceViste.has(m[1]) && !usoTracce.get(m[1])?.lasciata.some((x) => !k.passi.includes(x)) && !TRACCIA.get(m[1])?.dura.includes("da sola"))
        errore(`${dove}: il passo «${p}» vuole la traccia «${m[1]}» che nella catena arriva dopo`);
      const id = r.replace(/^\?/, "");
      if (!r.startsWith("?") && OGG.has(id)) {
        const regola = OGG.get(id).sblocco;
        if (termini(regola).includes(`catena:${k.id}`) && !regola.includes(" o ")) errore(`${dove}: il passo «${p}» vuole «${id}», che si sblocca solo finendo la catena stessa`);
        const dopo = k.passi.slice(i).find((q) => termini(regola).some((t) => t.startsWith(`fatta:${q}`)));
        if (dopo && !regola.includes(" o ")) errore(`${dove}: il passo «${p}» vuole «${id}», che arriva solo con «${dopo}»`);
      }
    }
    for (const r of Object.keys(a.prende)) if (!produttori[r].length) errore(`${dove}: il passo «${p}» consuma «${r}» che nessuno raccoglie`);
    a.tracce.forEach((t) => tracceViste.add(t));
    fatte.add(p);
  });
}

// Imprese
const espandi = (pattern) => (pattern.endsWith(".*") ? attivita.filter((a) => a.id.startsWith(pattern.slice(0, -1))).map((a) => a.id) : [pattern]);
for (const imp of IMPRESE) {
  const dove = `impresa «${imp.id}»`;
  if (imp.strada && !STRADE.includes(imp.strada)) errore(`${dove}: strada sconosciuta`);
  if (imp.livelli.length !== 3) errore(`${dove}: servono 3 livelli`);
  controllaRegola(imp.si_apre, dove);
  for (const c of imp.cantieri) if (!CANT.has(c)) errore(`${dove}: cantiere sconosciuto «${c}»`);
  else if (CANT.get(c).di !== imp.id) errore(`${dove}: il cantiere «${c}» è di «${CANT.get(c).di}»`);
  for (const c of cantieri.filter((x) => x.di === imp.id)) if (!imp.cantieri.includes(c.id)) errore(`${dove}: manca il cantiere «${c.id}» nell'elenco`);
  imp.tutte = [...new Set(imp.attivita.flatMap(espandi))];
  for (const a of imp.tutte) if (!ATT.has(a)) errore(`${dove}: attività sconosciuta «${a}»`);
  for (const r of imp.ruoli) for (const a of r.fa) {
    if (!ATT.has(a)) errore(`${dove}, ruolo «${r.id}»: attività sconosciuta «${a}»`);
    if (!imp.tutte.includes(a) && ATT.get(a)?.strada && ATT.get(a).strada !== imp.strada) avviso(`${dove}, ruolo «${r.id}»: «${a}» è di un'altra strada`);
  }
  if (imp.si_apre.startsWith("catena:") && !CAT.has(imp.si_apre.slice(7))) errore(`${dove}: catena sconosciuta`);
  if (imp.strada === null && !imp.si_apre.startsWith("catena:")) errore(`${dove}: un'impresa libera si apre con una catena`);
}

// ——— Numeri ———

const conta = (xs, f) => xs.filter(f).length;
const perTipo = (t) => conta(attivita, (a) => a.tipo === t);
const nQuotidiane = conta(attivita, (a) => a.tipo === "quotidiana" && a.sezione.id !== "azioni");
const nAzioni = conta(attivita, (a) => a.sezione.id === "azioni");
const nStrada = perTipo("strada");
const nRare = perTipo("rara");
const nCatena = perTipo("catena");
const nGioco = perTipo("gioco");
const nGruppo = perTipo("gruppo");
const nInter = perTipo("intermezzo");
const nGiornata = attivita.length - nGruppo - nInter;
const nGestiNuovi = conta(gesti, (g) => g.stato === "nuovo");
const nGestiOggi = conta(gesti, (g) => g.stato === "c'è");
const perCat = (c) => conta(oggetti, (o) => o.categoria === c);
const nLancio = conta(oggetti, (o) => o.priorita === "c'è" || o.priorita === 1 || o.priorita === "1");
const nDisegnati = conta(oggetti, (o) => o.priorita === "c'è");
const nRegali = conta(oggetti, (o) => o.sblocco.includes("regalo:"));

// ——— Scrittura ———

const esc = (s) => String(s).replaceAll("|", "\\|");
const tabella = (intest, righe) => [`| ${intest.join(" | ")} |`, `|${intest.map(() => "---").join("|")}|`, ...righe.map((r) => `| ${r.map(esc).join(" | ")} |`)].join("\n");
const cod = (s) => `\`${s}\``;
const codici = (xs) => (xs.length ? xs.map(cod).join(" ") : "—");
const avvertenza = "> File generato da `node docs/catalogo/genera.mjs` a partire da `docs/catalogo/fonte/`. Si modifica la fonte, poi si rigenera.";

const catenaDi = new Map();
for (const k of catene) k.passi.forEach((p, i) => catenaDi.set(p, [...(catenaDi.get(p) ?? []), { k, i }]));
const portaTutte = (a) => [...new Set([...a.porta, ...(catenaDi.get(a.id) ?? []).map(({ k, i }) => k.passi[i + 1]).filter(Boolean)])];
const sbloccatiDa = (pref) => oggetti.filter((o) => termini(o.sblocco).some((t) => t === pref || t.startsWith(`${pref}×`) || t.startsWith(`${pref}@`)));
const rischieste = (a) =>
  a.richiede
    .map((r) => {
      if (r.startsWith("?*")) return `un ${r.slice(2)} qualsiasi (se c'è)`;
      if (r.startsWith("?~")) return `traccia ${cod(r.slice(2))} (se c'è)`;
      if (r.startsWith("~")) return `traccia ${cod(r.slice(1))}`;
      if (r.startsWith("$")) return `ha ${cod(r.slice(1))}`;
      if (r.startsWith("?")) return `${cod(r.slice(1))}?`;
      return `**${cod(r)}**`;
    })
    .join(" ") || "—";
const res = (o, segno) => Object.entries(o).map(([k, v]) => `${segno}${v} ${k}`);

function md(file, testo) {
  if (!SOLO_CONTROLLO) writeFileSync(join(QUI, file), testo.trimEnd() + "\n");
}

// gesti.md
{
  const nuoviPerUso = gesti.filter((g) => g.stato === "nuovo").sort((x, y) => usoGesti.get(y.id) - usoGesti.get(x.id));
  const fase2 = new Set(nuoviPerUso.slice(0, 20).map((g) => g.id));
  const gruppi = ["base", "movimento", "mani", "viso", "testa", "corpo"];
  const nomi = { base: "Strumenti (non si vedono da soli)", movimento: "Movimento", mani: "Mani", viso: "Viso", testa: "Testa", corpo: "Corpo" };
  md(
    "gesti.md",
    `# I gesti di Linfa

**${gesti.length} gesti**: ${nGestiOggi} ci sono già in \`src/components/albero/vivo/gesti.ts\` (2 sono strumenti), ${nGestiNuovi} nuovi.
Il progetto (\`docs/stanze-e-vita.md\`, sezione 8) ne chiede circa 50; i ${nGestiNuovi - 50 > 0 ? nGestiNuovi - 50 : 0} in più servono al catalogo
delle attività (leggere, guardare in su, annuire, pensare, brindare, tirare una corda…).

${avvertenza}

- **Durata**: secondi del gesto da solo, proposta da tarare nel browser. Un'attività ne mette in fila 3-4 e gira a ciclo in 8-15 s (sezione 3.1).
- **Movimento ridotto**: che cosa fa quando il sistema chiede meno movimento (niente salti, scosse né corse; sezione 8).
- **Usato da**: in quante attività del catalogo compare.
- **Fase 2**: i 20 gesti nuovi più usati, da fare per primi.
- Gli id nuovi seguono lo stile di \`gesti.ts\` (camelCase, verbo). «strofina», «dipinge», «scrive», «saluta» e «contaDita» esistono già come movimenti del braccio nelle pose di \`azioni.ts\` (\`anim\`): diventano gesti veri.

${gruppi
  .map(
    (gr) => `## ${nomi[gr]}

${tabella(
  ["Gesto", "Durata (s)", "Movimento", "Con movimento ridotto", "Stato", "Usato da"],
  gesti
    .filter((g) => g.gruppo === gr)
    .map((g) => [cod(g.id), g.durata, g.movimento, g.ridotto, g.stato === "c'è" ? "c'è" : fase2.has(g.id) ? "nuovo · **fase 2**" : "nuovo", gr === "base" ? "—" : usoGesti.get(g.id)]),
)}`,
  )
  .join("\n\n")}
`,
  );
}

// attivita.md
{
  const intestazione = ["Id", "Attività", "Quando", "Umori", "Gesti", "Posto · oggetti", "Risorse · tracce", "Porta a", "Nuvoletta", "Segni"];
  const riga = (a) => {
    const quando = `${a.fasce.join("")} · ${a.meteo.join(", ")}`;
    const risorseTracce = [...res(a.prende, "−"), ...res(a.lascia, "+"), ...a.tracce.map((t) => `▸${t}`)].join(" ") || "—";
    const catenaTxt = (catenaDi.get(a.id) ?? []).map(({ k, i }) => `⛓ ${k.id} ${i + 1}/${k.passi.length}`);
    const segni = [...a.segni, ...Object.entries(a.opz).filter(([k]) => k !== "da").map(([k, v]) => `${k}=${v}`), a.opz.da ? `già in ${a.opz.da}.ts` : null].filter(Boolean).join(" ");
    return [cod(a.id), a.etichetta, quando, a.umori.join(", ") || "—", a.gesti.join(" → "), `${a.posto} · ${rischieste(a)}`, risorseTracce, [...catenaTxt, ...portaTutte(a).map(cod)].join(" ") || "—", a.voglia === "-" ? "—" : `«${a.voglia}»`, segni || "—"];
  };
  md(
    "attivita.md",
    `# Le attività di Linfa

**${attivita.length} attività** in tutto, di cui **${nGiornata} per la giornata** (quelle che il codice pesa e l'AI sceglie):

| Gruppo | Quante | Nel progetto (sezione 5) |
|---|---|---|
| Quotidiane (mattino, giorno e pomeriggio, sera, meteo) | ${nQuotidiane} | 70 |
| Le altre azioni di oggi (\`azioni.ts\`) | ${nAzioni} | — (restano: l'AI le conosce) |
| Di strada (12 per ognuna delle 7) | ${nStrada} | 84 |
| Rare | ${nRare} | 20 |
| Passi delle catene e delle imprese libere | ${nCatena} | — (servono alle catene della sezione 4.2) |
| Con i giochi e i regali | ${nGioco} | — (ogni gioco o regalo apre un'attività, sezione 11) |
| **Per la giornata** | **${nGiornata}** | **~175** |
| Di gruppo | ${nGruppo} | 17 (sezione 5.4) |
| Intermezzi | ${nInter} | 10 (sezione 5.5) |

Tutte le 23 azioni di \`azioni.ts\` e le 42 attività di \`mestieri.ts\` ci sono con il loro id (controllato da \`genera.mjs\`).

${avvertenza}

## Come si legge

- **Quando**: fasce (M mattina · G giorno · P pomeriggio · S sera · N notte) e meteo.
- **Posto · oggetti**: il posto della stanza (casa = dove sta l'albero; giro = cammina per la stanza), poi gli oggetti.
  **in grassetto** = serve (senza, peso 0) · \`id\`? = lo usa se c'è (×2) · traccia = serve quella traccia nella stanza · ha \`x\` = ne ha almeno 1.
- **Risorse · tracce**: −2 legna = la consuma · +2 legna = la raccoglie · ▸traccia = resta nella stanza (elenco in fondo).
- **Porta a**: attività che diventano più probabili dopo; ⛓ = passo di una catena (\`imprese.md\`): il passo dopo vale ×5.
- **Nuvoletta**: la frase che pensa quando gli viene voglia di farla (sezione 9.2).
- **Segni**: ferma (al massimo una al giorno) · mov (almeno una al giorno) · L1-L3 = livello della strada · gruppo = servono due alberi ·
  base=N = base diversa dal solito · quando / p = condizione e probabilità al giorno delle rare.
- **Peso** (sezione 3.3): base (quotidiana 10 · di strada 4 · rara 0,5; proposta per i passi delle catene e i giochi: 4) × strada × impresa × catena × oggetti × umore × meteo × novità.

### Meteo

${tabella(["Valore", "Vuol dire"], Object.entries(METEO).map(([k, v]) => [cod(k), v]))}

${SEZIONI.map(
  (s) => `## ${s.titolo} (${conta(attivita, (a) => a.sezione === s)})

${s.nota ? `${s.nota}\n\n` : ""}${tabella(intestazione, attivita.filter((a) => a.sezione === s).map(riga))}`,
).join("\n\n")}

## Le rare: quando

${tabella(["quando", "Vuol dire"], Object.entries(QUANDO).map(([k, v]) => [cod(k), v]))}

## Le tracce

${tabella(["Traccia", "Che cosa si vede", "Quanto resta", "La lasciano", "Serve a"], tracce.map((t) => [cod(t.id), t.descrizione, t.dura, codici(usoTracce.get(t.id).lasciata), codici(usoTracce.get(t.id).richiesta)]))}

## Le risorse

${tabella(["Risorsa", "La raccolgono", "La consumano"], RISORSE.map((r) => [r, codici(produttori[r]), codici(attivita.filter((a) => a.prende[r]).map((a) => a.id))]))}

Quantità da 0 a 9 per risorsa (sezione 4.1); le risorse non si comprano mai. Le piume arrivano con gli uccelli e gli ospiti; non si consumano nelle attività ma servono all'aquilone (regola di sblocco).
`,
  );
}

// oggetti.md
{
  const descr = (o) => o.sblocco.replaceAll(" o ", " **o** ").replaceAll(" + ", " **+** ");
  const usi = (o) => {
    const s = o.usi.filter((u) => u.modo !== "qualsiasi");
    const q = o.usi.length - s.length;
    return [s.map((u) => (u.modo === "serve" ? `**${u.att}**` : u.att)).join(", "), q ? `e ${q} come «oggetto qualsiasi»` : ""].filter(Boolean).join(" ") || "—";
  };
  md(
    "oggetti.md",
    `# Il catalogo degli oggetti di Linfa

**${oggetti.length} voci** (il progetto ne prevede ~200, sezione 10):

| Categoria | Quante | Nel progetto | Già disegnate | Da disegnare per il lancio |
|---|---|---|---|---|
${Object.entries(CATEGORIE)
  .map(([c, n]) => `| ${n} | ${perCat(c)} | ${{ edificio: 20, arredo: 50, attrezzo: 25, gioco: 20, vestito: 40, trofeo: 30, stagione: "15 con le rarità", rarita: "" }[c]} | ${conta(oggetti, (o) => o.categoria === c && o.priorita === "c'è")} | ${conta(oggetti, (o) => o.categoria === c && o.priorita === "1")} |`)
  .join("\n")}

- **Al lancio: ${nLancio} disegni** (${nDisegnati} ci sono già, ${nLancio - nDisegnati} da fare, tra cui ${conta(oggetti, (o) => o.categoria === "edificio" && o.priorita === "1")} edifici); trofei e album sono icone. Le voci «dopo» restano nel catalogo come «in arrivo» e non si sbloccano finché non hanno il disegno (sezione 10).
- **Regali**: ${nRegali} voci possono arrivare anche come regalo (\`regalo:id\` nella regola): è il catalogo dei regali della sezione 11, da 10 a ${nRegali}. I regali non cambiano mai la strada.
- Gli attrezzi della categoria comprendono gli oggetti che si tengono in mano (libro, tazza, ombrello…): la collezione di oggi li chiama «oggetti».
- Tutte le 25 voci di \`collezione.ts\` e i 10 regali di \`regali.ts\` ci sono con il loro id; i 21 arredi dei cantieri di \`mestieri.ts\` pure.

${avvertenza}

## Le regole di sblocco

Le calcola il codice, mai l'AI (come \`collezione.ts\`): ogni regola restituisce il giorno in cui è scattata.
« **o** » = basta una delle due, « **+** » = servono tutte e due, ×N = N volte.

${tabella(
  ["Regola", "Vuol dire"],
  [
    ["`iniziale` · `iniziale:strada`", "ce l'hanno tutti dal primo giorno · ce l'ha chi prende quella strada (gli «iniziali» di mestieri.ts)"],
    ["`fatta:attività×N`", "ha fatto quell'attività N volte (dal diario e dalla giornata)"],
    ["`catena:id×N` · `catene:N`", "ha finito quella catena N volte · ha finito N catene in tutto"],
    ["`cantiere:id` · `cantieri:N`", "ha finito quel cantiere · N cantieri in tutto"],
    ["`impresa:id@N` · `impresa:*@N`", "quell'impresa (o una qualsiasi) è arrivata al livello N"],
    ["`strada:x` · `strada:*`", "la strada si è rivelata (quella o una qualsiasi)"],
    ["`meteo:x×N`", `N giorni con quel tempo: ${Object.entries(METEO_REGOLE).map(([k, v]) => `${k} = ${v}`).join("; ")}`],
    ["`stagione:x`", "ha vissuto un giorno di quella stagione (stagioneDa)"],
    ["`giorni:N` · `diverse:N`", "giorni vissuti · attività diverse fatte"],
    ["`regali:N` · `messaggi:N` · `lettere:N`", "regali ricevuti · messaggi della persona · lettere scritte"],
    ["`stanze:N` · `compagni:N` · `sostenitori:N`", "stanze sbloccate · altri alberi nella stanza · sostenitori delle sue imprese"],
    ["`collezione:N` · `attrezzi:N`", "voci sbloccate · attrezzi posseduti"],
    ["`risorsa:x:N`", "ha N di quella risorsa insieme"],
    ["`regalo:id`", "arriva come regalo della persona (Premium)"],
    ["`baratto` · `tesoro`", "esce da un baratto con lo scoiattolo · da un tesoro sepolto (si pesca tra le voci che lo hanno)"],
  ],
)}

${Object.entries(CATEGORIE)
  .map(
    ([c, n]) => `## ${n} (${perCat(c)})

${tabella(
  ["Id", "Nome", "Posto", "Si sblocca", "Indizio sulla sagoma", "Usi (attività)", "Disegno"],
  oggetti.filter((o) => o.categoria === c).map((o) => [cod(o.id), o.nome, o.posto, descr(o), o.indizio, usi(o), { "c'è": "c'è", 1: "**lancio**", 2: "dopo", icona: "icona" }[o.priorita]]),
)}`,
  )
  .join("\n\n")}

## Pescate dal baratto e dal tesoro

- **Baratto con lo scoiattolo** (\`baratto-scoiattolo\`): ${codici(oggetti.filter((o) => termini(o.sblocco).includes("baratto")).map((o) => o.id))}
- **Tesoro sepolto** (\`rara.tesoro\`): ${codici(oggetti.filter((o) => termini(o.sblocco).includes("tesoro")).map((o) => o.id))}
`,
  );
}

// imprese.md
{
  const nPrincipali = conta(IMPRESE, (i) => i.strada);
  md(
    "imprese.md",
    `# Catene, cantieri e imprese di Linfa

**${catene.length} catene** · **${cantieri.length} cantieri** (${cantieriOggi.length} di \`mestieri.ts\`, ${cantieri.length - cantieriOggi.length} nuovi) · **${IMPRESE.length} imprese** (${nPrincipali} delle strade, ${IMPRESE.length - nPrincipali} libere) · **${IMPRESE.reduce((n, i) => n + i.ruoli.length, 0)} ruoli** dei sostenitori.

${avvertenza}

Regole (\`docs/stanze-e-vita.md\`, sezioni 4.2, 6 e 7):

- Una **catena** si apre col primo passo; il passo dopo vale ×5 nei giorni seguenti. Un passo può saltare (si distrae) e riprendere.
  Un passo «di gruppo» si salta se l'albero è solo nella stanza, tranne nelle catene che dicono «Serve compagnia».
- Un'**impresa** ha tre livelli: livello = 1 + cantieri finiti (massimo 3). I cantieri «dopo» il terzo livello lasciano un edificio in più.
  Le sue attività valgono ×4 per il capo e per i sostenitori.
- Le imprese delle strade si aprono quando la strada si rivela (il mestiere di oggi diventa l'impresa); dal **livello 2** il capo prova a
  coinvolgere gli altri alberi della stanza con il **contagio** (sezione 7.2: carisma del capo × influenzabilità dell'altro × affinità × sostenitori).
- Le **imprese libere** non hanno strada: si aprono finendo una catena, il capo è chi l'ha finita, e tutti possono entrarci (affinità neutra).
- **La banda del bosco** resta la caricatura del boss da film: cappello, gessato, «affari» di ghiande; niente parole o simboli della criminalità vera, niente violenza, niente accenti presi in giro.

## Le catene

${tabella(
  ["Catena", "Di chi", "Passi", "Come finisce", "Sblocca"],
  catene.map((k) => [`${cod(k.id)} ${k.nome}`, k.strada, k.passi.map((p) => (ATT.get(p)?.tipo === "gruppo" ? `${cod(p)} (gruppo)` : cod(p))).join(" → "), k.finale, codici([...sbloccatiDa(`catena:${k.id}`).map((o) => o.id), ...IMPRESE.filter((i) => i.si_apre === `catena:${k.id}`).map((i) => `impresa ${i.id}`), ...cantieri.filter((c) => termini(c.apre).some((t) => t.startsWith(`catena:${k.id}`))).map((c) => `cantiere ${c.id}`)])]),
)}

## Le imprese

${IMPRESE.map(
  (i) => `### ${i.nome} (${cod(i.id)})

- **Strada**: ${i.strada ?? "libera"} · **si apre**: ${cod(i.si_apre)}
- **Livelli**: ${i.livelli.map((l, n) => `${n + 1}. ${l}`).join(" · ")}
- **Attività dell'impresa** (×4): ${codici(i.tutte)}
- **Sblocca**: ${codici([1, 2, 3].flatMap((n) => sbloccatiDa(`impresa:${i.id}@${n}`).map((o) => `${o.id} (liv. ${n})`)))}

${tabella(["Ruolo", "Che cosa fa"], i.ruoli.map((r) => [`${r.nome} (${cod(r.id)})`, codici(r.fa)]))}

${tabella(
  ["Cantiere", "Lascia", "Si apre", "Passi"],
  i.cantieri.map((c) => CANT.get(c)).filter(Boolean).map((c) => [`${cod(c.id)} ${c.nome}`, cod(c.lascia), cod(c.apre), c.passi.join(" → ")]),
)}`,
).join("\n\n")}

## I cantieri liberi

Non sono di un'impresa: si aprono per tutti quando vale la regola.

${tabella(["Cantiere", "Lascia", "Si apre", "Passi"], cantieri.filter((c) => c.di === "libero").map((c) => [`${cod(c.id)} ${c.nome}`, cod(c.lascia), cod(c.apre), c.passi.join(" → ")]))}
`,
  );
}

// controllo.md
const oggettiPerUsi = [...oggetti].sort((x, y) => x.usi.filter((u) => u.modo !== "qualsiasi").length - y.usi.filter((u) => u.modo !== "qualsiasi").length);
md(
  "controllo.md",
  `# Controllo di coerenza del catalogo

Risultato di \`node docs/catalogo/genera.mjs\`: **${errori.length} errori**, **${avvisi.length} avvisi**.

${avvertenza}

## Che cosa controlla

| Controllo | Esito |
|---|---|
| Ogni attività usa solo gesti della libreria (3-4; gli intermezzi 1-2), mai gli strumenti | ${errori.some((e) => e.includes("gest")) ? "❌" : "✅"} |
| Ogni attività ha fasce, meteo, umori, posto e nuvoletta validi | ${errori.some((e) => /fasce|meteo|umori|posto|voglia/.test(e)) ? "❌" : "✅"} |
| Ogni strada ha 12 attività, ognuna con il suo livello | ${errori.some((e) => /strada «|livello/.test(e)) ? "❌" : "✅"} |
| Le 23 azioni di \`azioni.ts\` e le 42 attività di \`mestieri.ts\` ci sono con lo stesso id, fasce, livello, meteo e arredi | ${errori.some((e) => /azioni\.ts|mestieri\.ts/.test(e)) ? "❌" : "✅"} |
| Le 25 voci di \`collezione.ts\`, i 10 regali e i 21 cantieri ci sono con lo stesso id | ${errori.some((e) => /collezione\.ts|regali\.ts|cantiere di mestieri/.test(e)) ? "❌" : "✅"} |
| Ogni oggetto citato da un'attività esiste; **ogni oggetto ha almeno un uso** | ${errori.some((e) => /oggetto/.test(e)) ? "❌" : "✅"} |
| Ogni regola di sblocco è scritta bene e cita attività, catene, cantieri e imprese che esistono | ${errori.some((e) => /regola|sconosciut[ao] in/.test(e)) ? "❌" : "✅"} |
| Ogni risorsa consumata si raccoglie da qualche parte; ogni traccia richiesta nasce da qualche parte | ${errori.some((e) => /risorsa|traccia/.test(e)) ? "❌" : "✅"} |
| **Ogni catena si chiude**: passi esistenti, almeno 3, finale scritto, risorse e tracce disponibili prima di servire, nessun oggetto che arriva solo dopo, ultimo passo non saltabile | ${errori.some((e) => /catena «/.test(e)) ? "❌" : "✅"} |
| Ogni cantiere lascia un oggetto che si sblocca con quel cantiere; ogni impresa ha 3 livelli, cantieri, attività e ruoli esistenti | ${errori.some((e) => /cantiere «|impresa «/.test(e)) ? "❌" : "✅"} |

## Errori

${errori.length ? errori.map((e) => `- ${e}`).join("\n") : "Nessuno."}

## Avvisi

${avvisi.length ? avvisi.map((e) => `- ${e}`).join("\n") : "Nessuno."}

## Conteggi

| Che cosa | Quanti |
|---|---|
| Gesti | ${gesti.length} (${nGestiOggi} di oggi, ${nGestiNuovi} nuovi) |
| Attività | ${attivita.length} (${nGiornata} per la giornata, ${nGruppo} di gruppo, ${nInter} intermezzi) |
| Oggetti | ${oggetti.length} (${nLancio} disegni al lancio, ${nRegali} anche come regalo) |
| Catene · cantieri · imprese · ruoli | ${catene.length} · ${cantieri.length} · ${IMPRESE.length} · ${IMPRESE.reduce((n, i) => n + i.ruoli.length, 0)} |
| Tracce · risorse | ${tracce.length} · ${RISORSE.length} |

## Gli oggetti meno usati

Gli oggetti con meno attività che li usano davvero (non come «oggetto qualsiasi»): i primi candidati per attività nuove.

${tabella(["Oggetto", "Categoria", "Attività"], oggettiPerUsi.filter((o) => !["trofeo", "stagione", "rarita"].includes(o.categoria)).slice(0, 25).map((o) => [cod(o.id), o.categoria, o.usi.filter((u) => u.modo !== "qualsiasi").length]))}

## I gesti mai usati

${codici(gesti.filter((g) => g.gruppo !== "base" && usoGesti.get(g.id) === 0).map((g) => g.id))}
`,
);

console.log(`Gesti ${gesti.length} · attività ${attivita.length} (giornata ${nGiornata}) · oggetti ${oggetti.length} · catene ${catene.length} · cantieri ${cantieri.length} · imprese ${IMPRESE.length}`);
console.log(`${errori.length} errori, ${avvisi.length} avvisi`);
for (const e of errori) console.log(`ERRORE  ${e}`);
for (const a of avvisi) console.log(`avviso  ${a}`);
process.exit(errori.length ? 1 : 0);
