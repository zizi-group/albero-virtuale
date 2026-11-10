"use client";

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Albero } from "@/components/albero/Albero";
import { Ambiente } from "@/components/ambiente/Ambiente";
import { Seme } from "@/components/ambiente/Oggetti";
import type { Ora } from "@/components/ambiente/atmosfera";
import { azione } from "@/lib/albero/azioni";
import { FRASI_ROUTINE, risolviScena } from "@/lib/albero/scena";
import { INFO_STRADE, STRADE, type Strada } from "@/lib/albero/strade";
import type { Cielo, Indumento, Meteo, Posa, Stadio, Stagione } from "@/lib/albero/tipi";
import { meteoDiProva } from "@/lib/meteo";

// Il viaggio della pagina iniziale: una scena ferma sullo sfondo e i capitoli
// che le scorrono sopra. Ogni capitolo cambia ora, meteo, stagione e azione:
// il cielo sfuma dall'alba alla notte mentre la persona scorre.

export type ProvaMeteo = "sole" | "pioggia" | "freddo" | "notte";

const meteo = (cielo: Cielo, temperatura: number, giorno = true): Meteo => ({
  cielo,
  temperatura,
  giorno,
  descrizione: `${cielo}, ${temperatura}°`,
});

const SALUTO: Posa = {
  ...azione("guardare-cielo").posa,
  occhi: "felici",
  bocca: "grande",
  dx: { forma: "dritto", angolo: 58, anim: "saluta" },
};

interface Fotogramma {
  meteo: Meteo;
  ora: Ora;
  stagione: Stagione;
  stadio: Stadio;
  posa: Posa;
  chiave: string;
  timbro: [string, string, string];
  /** Una riga dell'albero, scritta a mano sotto il timbro (non attaccata al personaggio). */
  nota?: string;
  buste?: boolean;
}

function fotogramma(
  chiave: string,
  m: Meteo,
  ora: Ora,
  stagione: Stagione,
  stadio: Stadio,
  idAzione: string,
  timbro: [string, string, string],
  extra: { indossa?: Indumento[]; nota?: string; buste?: boolean } = {},
): Fotogramma {
  const a = azione(idAzione);
  return {
    meteo: m,
    ora,
    stagione,
    stadio,
    posa: { ...a.posa, indossa: [...a.posa.indossa, ...(extra.indossa ?? [])] },
    chiave: `${chiave}-${idAzione}`,
    timbro,
    nota: extra.nota,
    buste: extra.buste,
  };
}

const FISSI: Record<string, Fotogramma> = {
  lettere: fotogramma("lettere", meteo("nuvole", 17), "giorno", "estate", "alberello", "scrivere-poesia", ["Pescara", "11:20", "17°"], {
    nota: "Cara Giulia…",
    buste: true,
  }),
  gennaio: fotogramma("gennaio", meteo("neve", -1), "giorno", "inverno", "piantina", "guardare-cielo", ["Gennaio", "10:05", "-1°"], {
    indossa: ["cappello", "sciarpa"],
    nota: "Fa freddo. Guardo il cielo lo stesso.",
  }),
  marzo: fotogramma("marzo", meteo("pioggia", 11), "giorno", "primavera", "alberello", "giornale-ombrello", ["Marzo", "8:30", "11°"], {
    nota: "Le ghiande sono in rialzo.",
  }),
  giugno: fotogramma("giugno", meteo("sole", 27), "giorno", "estate", "alberello", "vendere-ombra", ["Giugno", "15:10", "27°"], {
    indossa: ["occhiali-sole"],
    nota: "Ombra fresca! Due ghiande l'ora.",
  }),
  luglio: fotogramma("luglio", meteo("sole", 29), "tramonto", "estate", "albero", "telefonata", ["Luglio", "20:40", "29°"], {
    nota: "Hai ragione. A metà.",
  }),
  diario: fotogramma("diario", meteo("sole", 14, false), "notte", "autunno", "albero", "leggere", ["Pescara", "22:15", "14°"], {
    indossa: ["berretto-notte"],
    nota: "Caro diario, oggi…",
  }),
  letargo: fotogramma("letargo", meteo("neve", -2, false), "notte", "inverno", "albero", "dormire", ["Pescara", "2:10", "-2°"]),
};

const FRASI_METEO: Record<ProvaMeteo, string | undefined> = {
  sole: "Che giornata. Non disturbate.",
  pioggia: "Doccia gratis!",
  freddo: "Brr. Meno male che ho la sciarpa.",
  notte: undefined,
};

const AZIONE_STRADA: Record<Strada, string> = {
  filosofo: "pensare",
  imprenditore: "contare-ghiande",
  artista: "dipingere",
  sportivo: "allenarsi",
  furfante: "chiacchierare-scoiattolo",
  viaggiatore: "studiare-mappa",
  poeta: "sonnellino",
};
const FRASI_STRADA: Record<Strada, string> = {
  filosofo: "Perché le foglie cadono sempre in giù?",
  imprenditore: "Trecentododici. Trecentotredici…",
  artista: "Questo tramonto lo ridipingo meglio.",
  sportivo: "Ancora una serie. Radici comprese.",
  furfante: "Queste ghiande? Le ho trovate.",
  viaggiatore: "Domani parto. Forse dopodomani.",
  poeta: "Un verso al giorno. Poi riposo.",
};

function fotogrammaMeteo(scelta: ProvaMeteo): Fotogramma {
  const m = meteoDiProva(scelta)!;
  const s = risolviScena(m, "guardare-cielo", null);
  return {
    meteo: m,
    ora: m.giorno ? "giorno" : "notte",
    stagione: "estate",
    stadio: "alberello",
    posa: s.posa,
    chiave: `meteo-${scelta}`,
    timbro: ["Pescara", { sole: "13:00", pioggia: "9:40", freddo: "8:15", notte: "23:50" }[scelta], `${m.temperatura}°`],
    nota: FRASI_METEO[scelta],
  };
}

function fotogrammaStrada(s: Strada): Fotogramma {
  const f = fotogramma(`strada-${s}`, meteo("sole", 15), "tramonto", "autunno", "albero", AZIONE_STRADA[s], ["Pescara", "17:30", "15°"], {
    indossa: [INFO_STRADE[s].accessorio],
    nota: FRASI_STRADA[s],
  });
  return f;
}

interface StatoViaggio {
  attivo: string;
  provaMeteo: ProvaMeteo;
  scegliMeteo: (m: ProvaMeteo) => void;
  strada: Strada;
  scegliStrada: (s: Strada) => void;
}

const Contesto = createContext<StatoViaggio | null>(null);
const useViaggio = () => {
  const c = useContext(Contesto);
  if (!c) throw new Error("Fuori dal viaggio");
  return c;
};

export function Viaggio({ children }: { children: ReactNode }) {
  const radice = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const [attivo, setAttivo] = useState("eroe");
  const [piantato, setPiantato] = useState(false);
  const [provaMeteo, setProvaMeteo] = useState<ProvaMeteo>("pioggia");
  const [strada, setStrada] = useState<Strada>("filosofo");
  const [stradaScelta, setStradaScelta] = useState(false);

  // Il seme germoglia da solo poco dopo l'arrivo (subito con il movimento ridotto).
  useEffect(() => {
    const ridotto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setPiantato(true), ridotto ? 0 : 1500);
    return () => clearTimeout(t);
  }, []);

  // Il capitolo attivo: l'ultimo la cui scheda è salita oltre il 62% dello schermo.
  useEffect(() => {
    const el = radice.current;
    if (!el) return;
    let raf = 0;
    const misura = () => {
      raf = 0;
      const soglia = window.innerHeight * 0.62;
      let id = "eroe";
      el.querySelectorAll<HTMLElement>("[data-capitolo]").forEach((s) => {
        const scheda = s.querySelector<HTMLElement>("[data-scheda]") ?? s;
        if (scheda.getBoundingClientRect().top < soglia) id = s.dataset.capitolo ?? id;
      });
      setAttivo(id);
      if (window.scrollY > 40) setPiantato(true);
      // Parallasse leggera: quanto del viaggio è già passato (0-1).
      const corsa = Math.max(1, el.offsetHeight - window.innerHeight);
      palco.current?.style.setProperty("--scorri", Math.min(1, Math.max(0, window.scrollY / corsa)).toFixed(3));
    };
    const pianifica = () => {
      if (!raf) raf = requestAnimationFrame(misura);
    };
    misura();
    window.addEventListener("scroll", pianifica, { passive: true });
    window.addEventListener("resize", pianifica);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", pianifica);
      window.removeEventListener("resize", pianifica);
    };
  }, []);

  // Le strade si provano da sole, finché la persona non ne sceglie una.
  useEffect(() => {
    if (attivo !== "strade" || stradaScelta) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setStrada((s) => STRADE[(STRADE.indexOf(s) + 1) % STRADE.length]), 2600);
    return () => clearInterval(t);
  }, [attivo, stradaScelta]);

  const f: Fotogramma =
    attivo === "eroe"
      ? {
          meteo: meteo("sole", 11),
          ora: "alba",
          stagione: "primavera",
          stadio: "piantina",
          posa: SALUTO,
          chiave: "eroe",
          timbro: ["Pescara", "6:48", "11°"],
        }
      : attivo === "meteo"
        ? fotogrammaMeteo(provaMeteo)
        : attivo === "strade"
          ? fotogrammaStrada(strada)
          : (FISSI[attivo] ?? FISSI.lettere);

  const stato: StatoViaggio = {
    attivo,
    provaMeteo,
    scegliMeteo: setProvaMeteo,
    strada,
    scegliStrada: (s) => {
      setStrada(s);
      setStradaScelta(true);
    },
  };

  return (
    <Contesto.Provider value={stato}>
      <div className="viaggio" ref={radice}>
        <div className="viaggio-palco" ref={palco}>
          <Ambiente
            meteo={f.meteo}
            ora={f.ora}
            stagione={f.stagione}
            seme={!piantato}
            chiaveAlbero={piantato ? f.chiave : "seme"}
            albero={
              <Albero
                posa={f.posa}
                stadio={f.stadio}
                stagione={f.stagione}
                innevato={f.meteo.cielo === "neve"}
                titolo="Ottavio, l'albero di Giulia"
              />
            }
            palco={
              <>
                <Seme />
                <span className="scoppio" aria-hidden>
                  {[-70, -40, -12, 16, 44, 72, -56, 58].map((a, i) => (
                    <i
                      key={i}
                      style={
                        {
                          "--dx": `${Math.round(Math.sin((a * Math.PI) / 180) * 90)}px`,
                          "--dy": `${-60 - (i % 3) * 30}px`,
                          "--rot": `${a * 4}deg`,
                          animationDelay: `${(i % 4) * 0.05}s`,
                          background: i % 2 ? "#6f9a3c" : "#9cc25a",
                        } as CSSProperties
                      }
                    />
                  ))}
                </span>
              </>
            }
          >
            {!piantato && (
              <button type="button" className="seme-bottone timbro timbro-linfa timbro-piccolo" onClick={() => setPiantato(true)}>
                Pianta il seme
              </button>
            )}
            {f.buste && <BusteInVolo />}
            <p className={`timbro-luogo ${attivo === "eroe" ? "max-lg:hidden" : ""}`} aria-hidden key={`t-${f.timbro.join()}`}>
              <span>
                <span className="block">{f.timbro[0]}</span>
                <b>{f.timbro[1]}</b>
                <span className="block">{f.timbro[2]}</span>
              </span>
            </p>
            {f.nota && (
              <p key={`n-${f.chiave}`} className="nota-albero" aria-hidden>
                <span>Ottavio:</span> {f.nota}
              </p>
            )}
          </Ambiente>
        </div>
        <div className="viaggio-capitoli">{children}</div>
      </div>
    </Contesto.Provider>
  );
}

function BusteInVolo() {
  return (
    <div className="buste-in-volo" aria-hidden>
      {[
        [-110, -18, 0],
        [60, 14, 1.8],
        [-30, -8, 3.6],
      ].map(([dx, rot, ritardo], i) => (
        <svg
          key={i}
          viewBox="0 0 40 28"
          style={{ "--dx": `${dx}px`, "--rot": `${rot}deg`, animationDelay: `${ritardo}s` } as CSSProperties}
        >
          <rect x="1" y="1" width="38" height="26" rx="2" fill="#f4e7cb" stroke="#23261d" strokeWidth="1.6" />
          <path d="M1,2 L20,16 L39,2" fill="none" stroke="#23261d" strokeWidth="1.6" />
          <circle cx="20" cy="16" r="3.4" fill="#e0a526" stroke="#a8761a" />
        </svg>
      ))}
    </div>
  );
}

const nomeCorto = (s: Strada) => {
  const n = INFO_STRADE[s].nome.replace(/^(Il |Lo |L')/, "");
  return n[0].toUpperCase() + n.slice(1);
};

const SCELTE_METEO: { id: ProvaMeteo; nome: string; simbolo: string }[] = [
  { id: "sole", nome: "Sole", simbolo: "☀" },
  { id: "pioggia", nome: "Pioggia", simbolo: "☂" },
  { id: "freddo", nome: "Freddo", simbolo: "❄" },
  { id: "notte", nome: "Notte", simbolo: "☾" },
];

/** Il visitatore cambia il tempo e guarda l'albero reagire. */
export function ProvaIlMeteo() {
  const { provaMeteo, scegliMeteo } = useViaggio();
  const s = risolviScena(meteoDiProva(provaMeteo)!, "guardare-cielo", null);
  return (
    <div data-comandi className="comandi-capitolo pagina">
      <p className="etichetta-mano" id="prova-meteo">
        Prova tu: che tempo fa a Pescara?
      </p>
      <div className="gettoni mt-2" role="group" aria-labelledby="prova-meteo">
        {SCELTE_METEO.map((m) => (
          <button key={m.id} type="button" className="gettone" aria-pressed={provaMeteo === m.id} onClick={() => scegliMeteo(m.id)}>
            <span aria-hidden>{m.simbolo}</span> {m.nome}
          </button>
        ))}
      </div>
      <p className="mt-2.5 min-h-[2.6em] text-[0.98rem] leading-snug text-matita" aria-live="polite">
        {s.routine ? FRASI_ROUTINE[s.routine] : ""}
      </p>
    </div>
  );
}

/** Le strade possibili: si provano una alla volta sull'albero della scena. */
export function ProvaLeStrade() {
  const { strada, scegliStrada } = useViaggio();
  return (
    <div data-comandi className="comandi-capitolo pagina">
      <p className="etichetta-mano" id="prova-strade">
        Tocca una strada e guardalo provarla
      </p>
      <div className="gettoni mt-2" role="group" aria-labelledby="prova-strade">
        {STRADE.map((s) => (
          <button key={s} type="button" className="gettone" aria-pressed={strada === s} onClick={() => scegliStrada(s)}>
            {nomeCorto(s)}
          </button>
        ))}
        <span className="gettone border-dashed opacity-80">…e chissà</span>
      </div>
      <p className="mt-2.5 min-h-[2.6em] text-[0.98rem] leading-snug" aria-live="polite">
        <span className="font-titolo">{INFO_STRADE[strada].nome}.</span>{" "}
        <span className="text-matita">{INFO_STRADE[strada].descrizione}</span>
      </p>
    </div>
  );
}
