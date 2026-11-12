import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Albero } from "@/components/albero/Albero";
import { oraDelGiorno, type Ora } from "@/components/ambiente/atmosfera";
import { fontModerna } from "@/components/fontModerna";
import { azione } from "@/lib/albero/azioni";
import { sblocco } from "@/lib/albero/collezione";
import { vestiConRegali } from "@/lib/albero/regali";
import { fasciaAdesso, giornataDi, indiceAdesso, voglia } from "@/lib/albero/giornata";
import { FRASI_ROUTINE, posaDelGiorno, risolviScena } from "@/lib/albero/scena";
import { classifica, INFO_STRADE, isStrada, NOMI_TRATTI, TRATTI, type PunteggiStrade, type Tratti } from "@/lib/albero/strade";
import { stadioDa, stagioneDa, type Cielo, type Meteo, type Stagione } from "@/lib/albero/tipi";
import { meteoAttuale, meteoDiProva, oggiNelFuso } from "@/lib/meteo";
import type { RecapMese } from "@/lib/motore/extra";
import { isPremium } from "@/lib/piani";
import { createClient, getUtente } from "@/lib/supabase/server";
import { Buongiorno } from "./Buongiorno";
import { Collezione, type PaginaStagione } from "./Collezione";
import { Conversazione } from "./Conversazione";
import { ExtraDelMese } from "./Extra";
import { Immersivo, type AttivitaInScena, type PalinsestoScena } from "./Immersivo";
import "./immersivo.css";
import { Strumenti } from "./Strumenti";

export const metadata: Metadata = { title: "Il giardino — Linfa" };

const SIMBOLI: Record<Cielo, string> = {
  sole: "☀",
  nuvole: "☁",
  pioggia: "☂",
  temporale: "⚡",
  neve: "❄",
  nebbia: "≋",
};

const TIPI_LETTERA: Record<string, string> = {
  benvenuto: "Benvenuto",
  mensile: "Lettera del mese",
  "meta-mese": "Lettera di metà mese",
  momento: "Un momento importante",
  regalo: "Grazie per il regalo",
};

const NOMI_STADIO = { piantina: "Piantina", alberello: "Alberello", albero: "Albero" } as const;

const data = (d: string) =>
  new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

export default async function Giardino({ searchParams }: PageProps<"/giardino">) {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const supabase = await createClient();
  const parametri = await searchParams;
  // Dalla tua foresta (/foresta) arrivano `stanza`, `albero` e `da=foresta`. Oggi c'è un
  // albero per persona e nessuna stanza: `albero` sceglie l'albero se è uno dei suoi.
  // `stanza` è pronto per la fase 5 (docs/stanze-e-vita.md, sezione 2).
  const alberoScelto = typeof parametri.albero === "string" && /^[0-9a-f-]{36}$/i.test(parametri.albero) ? parametri.albero : null;
  let query = supabase.from("trees").select("*").eq("owner_id", utente.id);
  if (alberoScelto) query = query.eq("id", alberoScelto);
  const { data: albero } = await query.order("planted_at", { ascending: true }).limit(1).maybeSingle();
  if (!albero) redirect(alberoScelto ? "/giardino" : "/pianta");

  const sceltaMeteo = typeof parametri.meteo === "string" ? parametri.meteo : undefined;
  const nuovo = parametri.nuovo === "1";
  const pannelloIniziale = (["buongiorno", "lettere", "diario", "scrivi", "mese", "collezione", "carattere"] as const).find(
    (x) => x === parametri.pannello,
  );

  const [diario, lettere, messaggi, meteoVero, mesi, regali, domanda, sbloccati] = await Promise.all([
    supabase.from("diary_entries").select("*").eq("tree_id", albero.id).order("day_number", { ascending: false }).limit(12),
    supabase.from("letters").select("id, kind, subject, created_at, read_at, day_number").eq("tree_id", albero.id).order("created_at", { ascending: false }),
    supabase.from("messages").select("id, author, body").eq("tree_id", albero.id).order("created_at", { ascending: true }).limit(40),
    meteoDiProva(sceltaMeteo) ? Promise.resolve(null) : meteoAttuale(albero.latitude, albero.longitude),
    supabase.from("tree_months").select("number, first_day, closed_at, recap").eq("tree_id", albero.id).order("number", { ascending: false }),
    supabase.from("gifts").select("gift, use, how, month_number, letter_id, included").eq("tree_id", albero.id).order("created_at", { ascending: true }),
    // La domanda del mattino vale per il prossimo giorno da vivere.
    supabase
      .from("morning_questions")
      .select("day_number, question, options, answer")
      .eq("tree_id", albero.id)
      .eq("day_number", albero.day_count + 1)
      .maybeSingle(),
    supabase.from("unlocks").select("item, day_number").eq("tree_id", albero.id).order("unlocked_at", { ascending: true }),
  ]);
  const elencoSbloccati = sbloccati.data ?? [];
  // L'album delle stagioni: la prima pagina di diario di ogni stagione vissuta.
  const giorniStagione = elencoSbloccati.filter((u) => sblocco(u.item)?.tipo === "stagione");
  const { data: pagineStagione } = giorniStagione.length
    ? await supabase
        .from("diary_entries")
        .select("day_number, lived_on, action, body")
        .eq("tree_id", albero.id)
        .in(
          "day_number",
          giorniStagione.map((u) => u.day_number),
        )
    : { data: [] };
  const stagioni: Partial<Record<Stagione, PaginaStagione>> = {};
  for (const u of giorniStagione) {
    const p = (pagineStagione ?? []).find((x) => x.day_number === u.day_number);
    if (p) stagioni[u.item as Stagione] = { giorno: p.day_number, data: p.lived_on, azione: p.action, testo: p.body };
  }
  const domandaDelMattino = domanda.data
    ? {
        giorno: domanda.data.day_number,
        domanda: domanda.data.question,
        risposte: Array.isArray(domanda.data.options) ? (domanda.data.options as string[]) : [],
        risposta: domanda.data.answer,
      }
    : null;
  const elencoMesi = mesi.data ?? [];
  const meseCorrente = elencoMesi[0] ?? { number: 1, first_day: 0, closed_at: null, recap: null };
  const ultimoChiuso = elencoMesi.find((m) => m.closed_at);
  const doni = regali.data ?? [];
  const regaloDelMese = doni.find((g) => g.included && g.month_number === meseCorrente.number) ?? null;

  const prova = meteoDiProva(sceltaMeteo);
  const meteo: Meteo = prova ??
    meteoVero ??
    (albero.last_weather as Meteo | null) ?? { cielo: "nuvole", temperatura: 15, giorno: true, descrizione: "cielo nuvoloso" };
  const scena = risolviScena(meteo, albero.today_action, albero.path);
  const stadio = stadioDa(albero.day_count);
  const stagione = stagioneDa(new Date(`${oggiNelFuso(albero.timezone)}T12:00:00`));
  const strada = isStrada(albero.path) ? albero.path : null;
  const tratti = albero.traits as Tratti;
  const [[primaStrada, primoPunteggio]] = classifica((albero.path_scores ?? {}) as PunteggiStrade);
  const elencoLettere = lettere.data ?? [];
  const nonLette = elencoLettere.filter((l) => !l.read_at).length;
  const pagine = diario.data ?? [];

  // L'ora vera della città: alba, giorno, tramonto o notte. Col meteo di prova si resta sul giorno o sulla notte.
  const adesso = new Date();
  const oraLocale = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: albero.timezone }).format(adesso));
  const orario = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: albero.timezone }).format(adesso);
  const ora: Ora = prova ? (meteo.giorno ? "giorno" : "notte") : oraDelGiorno(meteo, oraLocale, stagione);

  // La giornata a fasce (docs/stanze-e-vita.md, sezione 3): tre attività per fascia,
  // a turno ogni 45 minuti e, durante la visita, ogni pochi minuti.
  const palinsestoGrezzo = giornataDi({
    seme: albero.id,
    giorno: albero.day_count,
    strada: albero.path,
    umore: albero.mood,
    azioneDelGiorno: albero.today_action,
    azioniRecenti: pagine.filter((x) => x.day_number < albero.day_count).map((x) => x.action),
    meteo,
  });
  const stessoCielo = (albero.last_weather as Meteo | null)?.cielo === meteo.cielo;
  const inScena = (id: string): AttivitaInScena => ({
    id,
    etichetta: azione(id).etichetta,
    posa: vestiConRegali(posaDelGiorno(id, meteo, albero.path), doni, meteo),
    voglia: voglia(id),
    // La frase dell'AI racconta il tempo del suo giorno: la si usa solo se il cielo è lo stesso.
    didascalia: id === albero.today_action && albero.today_caption && stessoCielo ? albero.today_caption : null,
  });
  const palinsesto: PalinsestoScena = {
    mattina: palinsestoGrezzo.mattina.map(inScena),
    giorno: palinsestoGrezzo.giorno.map(inScena),
    pomeriggio: palinsestoGrezzo.pomeriggio.map(inScena),
    sera: palinsestoGrezzo.sera.map(inScena),
    notte: [{ ...inScena("dormire"), didascalia: FRASI_ROUTINE.notte.replace(/^([^:]+):/, `$1: ${albero.name}`) }],
  };
  const minutiLocali = oraLocale * 60 + adesso.getUTCMinutes();
  const fascia = fasciaAdesso(oraLocale, meteo.giorno);
  const indice = indiceAdesso(minutiLocali, palinsesto[fascia].length);

  const scheda = (
    <section aria-labelledby="titolo-scheda" className="scheda-albero pagina">
      <div className="scheda-ritratto" aria-hidden={!strada}>
        {strada ? (
          <Albero
            className="h-full w-full"
            posa={{ ...azione("guardare-cielo").posa, occhi: "felici", indossa: [INFO_STRADE[strada].accessorio] }}
            giorni={albero.day_count}
            stadio={stadio}
            stagione={stagione}
            titolo={`${albero.name}, ${INFO_STRADE[strada].nome.toLowerCase()}`}
            interattivo={false}
          />
        ) : (
          <span className="scheda-mistero">?</span>
        )}
      </div>
      <div>
        <p className="occhiello">La sua strada</p>
        {strada ? (
          <>
            <h2 id="titolo-scheda" className="font-titolo mt-1 text-3xl leading-tight">
              {INFO_STRADE[strada].nome}
            </h2>
            <p className="mt-1 text-lg text-matita">{INFO_STRADE[strada].descrizione}</p>
          </>
        ) : (
          <>
            <h2 id="titolo-scheda" className="font-titolo mt-1 text-3xl leading-tight">
              Non l&apos;ha ancora presa.
            </h2>
            <p className="mt-1 text-lg">
              {primoPunteggio >= 6 ? (
                <>
                  Per ora la più vicina è: <span className="font-mano text-xl text-corteccia">{INFO_STRADE[primaStrada].nome.toLowerCase()}</span>.
                </>
              ) : (
                <span className="text-matita">Le sue giornate non lo spingono ancora verso una strada precisa.</span>
              )}
            </p>
          </>
        )}
        <p className="mt-2 text-sm text-matita">
          Piantato a {albero.city}
          {albero.owner_name ? ` da ${albero.owner_name}` : ""} · giorno {albero.day_count} · umore: {albero.mood}
        </p>
      </div>
      <dl className="tratti">
        {TRATTI.map((t) => (
          <div key={t}>
            <dt>{NOMI_TRATTI[t]}</dt>
            <dd>
              <span className="tratto-barra" style={{ width: `${tratti[t]}%` }} />
              <span className="sr-only">{tratti[t]} su 100</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );

  const pannelloLettere = (
    <div>
      <p className="gi-nota">
        {elencoLettere.length} {elencoLettere.length === 1 ? "lettera" : "lettere"}
        {nonLette > 0 ? `, ${nonLette} da aprire` : ""}.{" "}
        {isPremium(albero.plan)
          ? "Con il Premium ne arriva una ogni 15 giorni, più una nei momenti importanti."
          : "Ne arriva una ogni 30 giorni, più una nei momenti importanti."}
      </p>
      <ul className="mt-4 space-y-4">
        {/* Prima quelle da aprire, poi le lette */}
        {[...elencoLettere.filter((l) => !l.read_at), ...elencoLettere.filter((l) => l.read_at)].map((l) => (
          <li key={l.id}>
            <Link href={`/giardino/lettere/${l.id}`} className="busta-lista" data-da-leggere={!l.read_at ? "1" : undefined}>
              <span className="busta-lista-francobollo" aria-hidden>
                <span>g. {l.day_number}</span>
              </span>
              <span className="occhiello block pr-12 text-[0.66rem] text-corteccia">
                {TIPI_LETTERA[l.kind] ?? "Lettera"} · giorno {l.day_number}
              </span>
              <span className="busta-lista-stato">{l.read_at ? "Letta ✓" : "Nuova · da aprire"}</span>
              <span className="mt-1 block pr-12 font-mano text-[1.35rem] leading-tight text-[#2c3348]">{l.subject}</span>
              <span className="busta-lista-sigillo" aria-hidden />
            </Link>
          </li>
        ))}
        {elencoLettere.length === 0 && <li className="text-matita">Nessuna lettera, per ora.</li>}
      </ul>
    </div>
  );

  const pannelloDiario = (
    <div>
      <p className="gi-nota">Una pagina al giorno, scritta da {albero.name}: da una a tre frasi. Qui le ultime 12.</p>
      <div className="taccuino mt-4">
        {pagine.length === 0 ? (
          <p className="text-matita">La prima pagina arriva con il primo giorno.</p>
        ) : (
          <ol>
            {pagine.map((p) => {
              const m = p.weather as { cielo?: Cielo } | null;
              return (
                <li key={p.id} data-traguardo={p.milestone ? "1" : undefined}>
                  <p className="taccuino-data">
                    <span aria-hidden>{p.milestone ? "★" : m?.cielo ? SIMBOLI[m.cielo] : "·"}</span> Giorno {p.day_number} ·{" "}
                    {data(p.lived_on)}
                    {p.milestone && <span className="sr-only"> (un giorno importante)</span>}
                  </p>
                  <p className="taccuino-testo">{p.body}</p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );

  const pannelloScrivi = (
    <div>
      <p className="gi-nota">Scrivi un messaggio: {albero.name} lo legge e ti risponde per iscritto. I consigli li considera, ma decide da solo.</p>
      <div className="mt-4">
        <Conversazione
          nome={albero.name}
          messaggi={(messaggi.data ?? []).map((m) => ({ id: m.id, autore: m.author as "persona" | "albero", testo: m.body }))}
        />
      </div>
    </div>
  );

  const pannelloMese = (
    <ExtraDelMese
      nome={albero.name}
      piano={albero.plan}
      mese={meseCorrente}
      regaloDelMese={regaloDelMese}
      ultimoChiuso={ultimoChiuso ? { number: ultimoChiuso.number, recap: ultimoChiuso.recap as RecapMese | null } : null}
    />
  );

  const pannelloBuongiorno = (
    <div>
      <p className="gi-nota">
        Ogni mattina {albero.name} ti fa una domanda sulla sua giornata. La tua risposta gli arriva come consiglio prima
        del giorno {albero.day_count + 1}.
      </p>
      <div className="mt-4">
        <Buongiorno nome={albero.name} domanda={domandaDelMattino} />
      </div>
    </div>
  );

  const pannelloCollezione = (
    <div>
      <p className="gi-nota">
        Trofei, oggetti, vestiti e stagioni arrivano vivendo: la prima pioggia, i 30 giorni di diario, la strada presa.
        Non si comprano.
      </p>
      <div className="mt-4">
        <Collezione nome={albero.name} sbloccati={elencoSbloccati} stagioni={stagioni} />
      </div>
    </div>
  );

  return (
    <main id="contenuto" className={`flex-1 ${fontModerna.variable}`}>
      <Immersivo
        pannelloIniziale={pannelloIniziale}
        appenaNato={nuovo}
        daForesta={parametri.da === "foresta"}
        palinsesto={palinsesto}
        fascia={fascia}
        indice={indice}
        nome={albero.name}
        citta={albero.city}
        orario={orario}
        descrizioneMeteo={meteo.descrizione}
        simbolo={SIMBOLI[meteo.cielo]}
        giorno={albero.day_count}
        stadioNome={NOMI_STADIO[stadio]}
        strada={strada ? INFO_STRADE[strada].nome : null}
        umore={albero.mood}
        meteo={meteo}
        ora={ora}
        stagione={stagione}
        stadio={stadio}
        chiave={`${scena.azione.id}-${stadio}`}
        nonLette={nonLette}
        totaleLettere={elencoLettere.length}
        righeDiario={pagine.length}
        domandaAperta={!!domandaDelMattino && !domandaDelMattino.risposta}
        pannelli={{
          buongiorno: pannelloBuongiorno,
          lettere: pannelloLettere,
          diario: pannelloDiario,
          scrivi: pannelloScrivi,
          mese: pannelloMese,
          collezione: pannelloCollezione,
          carattere: scheda,
        }}
        avviso={
          nuovo ? (
            <div className="gi-avviso" role="status">
              <p className="font-bold">
                {albero.name} è nato oggi a {albero.city}.
              </p>
              <p className="mt-1">La lettera di benvenuto è nella cassetta delle lettere e nella tua email.</p>
              <Link href="/giardino" scroll={false} className="mt-2 inline-block font-semibold underline underline-offset-4">
                Ok
              </Link>
            </div>
          ) : undefined
        }
        strumenti={<Strumenti nome={albero.name} meteoScelto={sceltaMeteo} piano={albero.plan} />}
      />
    </main>
  );
}
