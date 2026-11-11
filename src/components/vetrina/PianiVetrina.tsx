import Link from "next/link";
import { IconCircles, IconGift, IconNotebook, IconPlant, IconPlus, IconSeeding, IconShirt, IconTree, IconTrees } from "@tabler/icons-react";

// I pacchetti nuovi (Federico, 11/11/2026): tutti annuali, prezzi IVA esclusa,
// mostrati al mese. Albero vero sempre in prima riga. Sono ancora solo nella
// vetrina: la demo dell'app usa i piani di src/lib/piani.ts.

type Gruppo = { titolo: string; voci?: string[]; chips?: string[] };
type Pacchetto = {
  id: string;
  nome: string;
  veri: string;
  alMese: string;
  allAnno: string;
  ivaInclusa: string;
  etichetta?: string;
  gruppi: Gruppo[];
  bottone: string;
};

const PACCHETTI: Pacchetto[] = [
  {
    id: "albero",
    nome: "Albero",
    veri: "1 albero vero piantato in Italia, ogni anno",
    alMese: "3,25 €",
    allAnno: "39 €",
    ivaInclusa: "47,58 €",
    bottone: "Pianta l'Albero",
    gruppi: [
      { titolo: "L'albero vero", voci: ["Piantato da [partner] con una specie del posto", "Certificato con specie, data e coordinate"] },
      {
        titolo: "Il tuo albero digitale",
        voci: [
          "7 tratti di carattere e la sua intelligenza artificiale",
          "Il giardino a tutto schermo, con meteo e ora reali della sua città",
          "80 azioni, e nuove a ogni stagione",
          "12 strade possibili, e una nuova a ogni stagione",
          "Gli scrivi dal giardino e ti risponde",
          "Collezione, trofei e album delle stagioni",
          "Il bosco con gli amici e le gare di stagione",
        ],
      },
      {
        titolo: "Ogni giorno, settimana, mese",
        voci: [
          "Un'azione e una pagina di diario al giorno",
          "Il buongiorno: una domanda da un tocco",
          "La cartolina della settimana, via email",
          "12 lettere all'anno, più una nei momenti importanti",
        ],
      },
      {
        titolo: "A fine anno e a casa",
        voci: ["Il diario dell'anno in PDF illustrato, all'11° mese", "La tessera del fan club", "Se non rinnovi, il letargo: il diario resta"],
      },
    ],
  },
  {
    id: "famiglia",
    nome: "Famiglia",
    veri: "3 alberi veri piantati in Italia, ogni anno",
    alMese: "7,42 €",
    allAnno: "89 €",
    ivaInclusa: "108,58 €",
    etichetta: "Per famiglie, coppie, amici",
    bottone: "Pianta la Famiglia",
    gruppi: [
      {
        titolo: "Tutto quello dell'Albero, per 3 alberi, e in più",
        voci: [
          "3 alberi digitali che si conoscono, ognuno con la sua strada",
          "Gruppo a scelta: famiglia, impresa o banda del bosco di Don Ghianda",
          "24 lettere all'anno, anche di gruppo",
        ],
      },
      {
        titolo: "10 azioni di gruppo",
        chips: [
          "Cena sotto la luna",
          "Litigio per l'ombra",
          "Foto di gruppo",
          "Giochi con lo scoiattolo",
          "Bancarella dell'ombra",
          "Un ombrello in tre",
          "Il colpo alle ghiande",
          "Fuga dal giardiniere",
          "Festa di compleanno",
          "Lettera firmata da tutti",
        ],
      },
      { titolo: "Ogni mese", voci: ["Un regalo da mandare: decide lui se usarlo", "Il riepilogo illustrato del mese", "La cartolina del mese, in formato storia e sfondo"] },
      { titolo: "A fine anno e a casa", voci: ["Il diario dell'anno in PDF e stampato", "Le tessere del fan club", "Gli adesivi e la miniatura"] },
    ],
  },
  {
    id: "foresta",
    nome: "Foresta",
    veri: "7 alberi veri piantati in Italia, ogni anno",
    alMese: "14,92 €",
    allAnno: "179 €",
    ivaInclusa: "218,38 €",
    bottone: "Pianta la Foresta",
    gruppi: [
      {
        titolo: "Tutto quello della Famiglia, per 7 alberi, e in più",
        voci: ["7 alberi digitali: una foresta con nome e insegna", "Tutti i gruppi insieme", "Le lettere della foresta, oltre alle 24"],
      },
      {
        titolo: "10 azioni di gruppo + 10 di foresta",
        chips: [
          "Festa di stagione",
          "Assemblea del bosco",
          "Mercato della foresta",
          "Squadra di calcio",
          "Coro della sera",
          "Teatro del bosco",
          "Casetta sull'albero",
          "Gita al ruscello",
          "Olimpiadi del bosco",
          "Notte delle lucciole",
        ],
      },
      {
        titolo: "A fine anno e a casa",
        voci: [
          "Il libro della foresta rilegato, oltre al PDF",
          "La maglietta con il tuo albero",
          "La miniatura del tuo albero preferito, in materiale riciclato",
          "Gli adesivi dei 7 alberi e le tessere",
          "Il certificato con la mappa del boschetto vero",
          "Ogni anno, la foto dei tuoi alberi veri",
        ],
      },
    ],
  },
];

export function PianiVetrina() {
  return (
    <>
      <div className="piani-griglia">
        {PACCHETTI.map((p) => (
          <article key={p.id} className={`piano e ${p.etichetta ? "top" : ""}`} aria-labelledby={`piano-${p.id}`}>
            {p.etichetta && <span className="eti">{p.etichetta}</span>}
            <div className="veri">
              {p.id === "albero" ? <IconTree className="ic" aria-hidden /> : <IconTrees className="ic" aria-hidden />}
              {p.veri}
            </div>
            <h3 id={`piano-${p.id}`}>{p.nome}</h3>
            <p className="prezzo">
              {p.alMese} <small>+ IVA al mese</small>
            </p>
            <p className="paga">
              Si paga una volta all&apos;anno: {p.allAnno} + IVA ({p.ivaInclusa} IVA inclusa)
            </p>
            {p.gruppi.map((g) => (
              <div key={g.titolo}>
                <p className="gr">{g.titolo}</p>
                {g.voci && (
                  <ul>
                    {g.voci.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                )}
                {g.chips && (
                  <div className="chips">
                    {g.chips.map((c) => (
                      <span key={c}>{c}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="spinta" />
            {/* Nella demo i pacchetti nuovi non esistono ancora: tutti portano alla semina. */}
            <Link className="cta" href={p.id === "albero" ? "/pianta?pacchetto=albero" : "/pianta"}>
              {p.bottone}
            </Link>
          </article>
        ))}
      </div>
      <div className="vetro rinnovo-piani e">
        <b>Ogni anno che rinnovi, per ogni albero:</b>
        <span>
          <IconPlant className="ic" aria-hidden />
          un albero vero in più
        </span>
        <span>
          <IconCircles className="ic" aria-hidden />
          un anello di crescita
        </span>
        <span>
          <IconSeeding className="ic" aria-hidden />
          un seme per un nuovo albero digitale
        </span>
      </div>
      <div className="extra e">
        <span>
          <IconPlus className="ic" aria-hidden />
          <b>Aggiungi un albero</b> a qualsiasi piano, con lo sconto
        </span>
        <span>
          <IconGift className="ic" aria-hidden />
          <b>Seme da regalare:</b> un codice per far piantare un albero a un amico
        </span>
        <span>
          <IconShirt className="ic" aria-hidden />
          <b>Regali all&apos;albero</b> oltre a quello del mese
        </span>
        <span>
          <IconNotebook className="ic" aria-hidden />
          <b>Diario stampato</b> anche per chi ha l&apos;Albero
        </span>
      </div>
      <p className="nota e">Prezzi IVA esclusa. Tutti i piani si pagano una volta all&apos;anno. Nella demo non si paga.</p>
    </>
  );
}
