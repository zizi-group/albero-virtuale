"use client";

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Albero } from "@/components/albero/Albero";
import { Ambiente } from "@/components/ambiente/Ambiente";
import { Seme } from "@/components/ambiente/Oggetti";
import { movimentoRidotto } from "@/components/Movimento";
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
  extra: { indossa?: Indumento[]; nota?: string; buste?: boolean; posa?: Partial<Posa> } = {},
): Fotogramma {
  const a = azione(idAzione);
  return {
    meteo: m,
    ora,
    stagione,
    stadio,
    posa: { ...a.posa, ...extra.posa, indossa: [...a.posa.indossa, ...(extra.indossa ?? [])] },
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
  diario: fotogramma("diario", meteo("sole", 19), "giorno", "estate", "alberello", "scrivere-poesia", ["Pescara", "18:10", "19°"], {
    nota: "Caro diario, oggi ho contato le formiche.",
  }),
  premium: fotogramma("premium", meteo("sole", 16), "giorno", "autunno", "albero", "guardare-cielo", ["Pescara", "11:00", "16°"], {
    indossa: ["cappello"],
    posa: { occhi: "felici", bocca: "grande", effetti: ["cuori"] },
    nota: "Un cappello nuovo! Lo metto. Forse.",
  }),
  libro: fotogramma("libro", meteo("sole", 9, false), "notte", "autunno", "albero", "leggere", ["Pescara", "22:15", "9°"], {
    indossa: ["berretto-notte"],
    nota: "Che anno. Lo rileggo tutto.",
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
  pagina: number;
  scegliPagina: (n: number) => void;
}

const Contesto = createContext<StatoViaggio | null>(null);
const useViaggio = () => {
  const c = useContext(Contesto);
  if (!c) throw new Error("Fuori dal viaggio");
  return c;
};

/** La pagina del libro dell'anno: la sfoglia lo scroll, oppure la persona. */
export function usePaginaLibro() {
  const { pagina, scegliPagina } = useViaggio();
  return { pagina, scegliPagina };
}

const ORDINE_METEO: ProvaMeteo[] = ["sole", "pioggia", "freddo", "notte"];
export const PAGINE_LIBRO = 4;

const fra = (v: number) => Math.min(1, Math.max(0, v));

export function Viaggio({ children }: { children: ReactNode }) {
  const radice = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const [attivo, setAttivo] = useState("eroe");
  const [piantato, setPiantato] = useState(false);
  const [provaMeteo, setProvaMeteo] = useState<ProvaMeteo>("sole");
  const [strada, setStrada] = useState<Strada>("filosofo");
  const [pagina, setPagina] = useState(0);
  // Una scelta fatta a mano vale finché si resta nel capitolo; poi torna lo scroll.
  const manuale = useRef({ meteo: false, strada: false, pagina: false });

  // Il seme germoglia da solo poco dopo l'arrivo (subito con il movimento ridotto).
  useEffect(() => {
    const t = setTimeout(() => setPiantato(true), movimentoRidotto() ? 0 : 1500);
    return () => clearTimeout(t);
  }, []);

  // Lo scroll guida tutto: capitolo attivo, zoom d'ingresso, avanzamento di ogni capitolo.
  useEffect(() => {
    const el = radice.current;
    if (!el) return;
    let raf = 0;
    const misura = () => {
      raf = 0;
      const alto = window.innerHeight;
      let id = "eroe";
      el.querySelectorAll<HTMLElement>("[data-capitolo]").forEach((s) => {
        const lungo = s.classList.contains("capitolo-lungo");
        const r = s.getBoundingClientRect();
        const rif = lungo ? r.top : (s.querySelector<HTMLElement>("[data-scheda]") ?? s).getBoundingClientRect().top;
        if (rif < alto * (lungo ? 0.6 : 0.62)) id = s.dataset.capitolo ?? id;
        // Avanzamento 0-1 dentro il capitolo (solo per quelli vicini allo schermo).
        if (r.bottom > -alto && r.top < alto * 2) {
          const p = fra(-r.top / Math.max(1, r.height - alto));
          s.style.setProperty("--p", p.toFixed(3));
          const cap = s.dataset.capitolo;
          if (cap === "meteo" && !manuale.current.meteo) setProvaMeteo(ORDINE_METEO[Math.min(3, Math.floor(p * 4))]);
          if (cap === "strade" && !manuale.current.strada) setStrada(STRADE[Math.min(STRADE.length - 1, Math.floor(p * STRADE.length))]);
          if (cap === "libro" && !manuale.current.pagina) setPagina(Math.min(PAGINE_LIBRO - 1, Math.floor(p * PAGINE_LIBRO)));
        }
      });
      setAttivo(id);
      if (window.scrollY > 40) setPiantato(true);
      // Zoom d'ingresso: 0 in cima, 1 quando l'eroe è passato.
      el.style.setProperty("--intro", fra(window.scrollY / (alto * 0.85)).toFixed(3));
      // Parallasse leggera: quanto del viaggio è già passato (0-1).
      const corsa = Math.max(1, el.offsetHeight - alto);
      palco.current?.style.setProperty("--scorri", fra(window.scrollY / corsa).toFixed(3));
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

  // Uscendo da un capitolo, le scelte a mano si dimenticano.
  useEffect(() => {
    if (attivo !== "meteo") manuale.current.meteo = false;
    if (attivo !== "strade") manuale.current.strada = false;
    if (attivo !== "libro") manuale.current.pagina = false;
  }, [attivo]);

  const f: Fotogramma =
    attivo === "eroe"
      ? {
          meteo: meteo("sole", 11),
          ora: "alba",
          stagione: "primavera",
          stadio: "alberello",
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
    scegliMeteo: (m) => {
      manuale.current.meteo = true;
      setProvaMeteo(m);
    },
    strada,
    scegliStrada: (s) => {
      manuale.current.strada = true;
      setStrada(s);
    },
    pagina,
    scegliPagina: (n) => {
      manuale.current.pagina = true;
      setPagina(Math.min(PAGINE_LIBRO - 1, Math.max(0, n)));
    },
  };

  return (
    <Contesto.Provider value={stato}>
      <div className="viaggio" ref={radice}>
        <div className="viaggio-palco" ref={palco}>
          <div className="viaggio-camera" data-camera={attivo}>
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
              <button type="button" className="seme-bottone lp-btn lp-btn-primario lp-btn-piccolo" onClick={() => setPiantato(true)}>
                Pianta il seme
              </button>
            )}
            {f.buste && <BusteInVolo />}
          </Ambiente>
          </div>
          <p className={`lp-hud ${attivo === "eroe" ? "lp-hud-nascosto" : ""}`} aria-hidden key={`t-${f.timbro.join()}`}>
            <span>{f.timbro[0]}</span>
            <i>·</i>
            <b>{f.timbro[1]}</b>
            <i>·</i>
            <span>{f.timbro[2]}</span>
          </p>
          {f.nota && attivo !== "eroe" && (
            <p key={`n-${f.chiave}`} className="nota-albero" aria-hidden>
              <span>Ottavio:</span> {f.nota}
            </p>
          )}
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
    <div data-comandi className="comandi-capitolo">
      <p className="lp-etichetta" id="prova-meteo">
        Cambia il tempo a Pescara
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

/** Le strade possibili come carte: scorrono con lo scroll, o si toccano. */
export function ProvaLeStrade() {
  const { strada, scegliStrada } = useViaggio();
  const indice = STRADE.indexOf(strada);
  return (
    <div data-comandi className="comandi-capitolo">
      <p className="lp-etichetta" id="prova-strade">
        Le sue vite possibili · {indice + 1} di {STRADE.length}
      </p>
      <div className="lp-carte mt-3" role="group" aria-labelledby="prova-strade">
        <div className="lp-carte-binario" style={{ "--indice": indice } as CSSProperties}>
          {STRADE.map((s) => {
            const a = azione(AZIONE_STRADA[s]);
            return (
              <button
                key={s}
                type="button"
                className="lp-carta-strada"
                aria-pressed={strada === s}
                onClick={() => scegliStrada(s)}
              >
                <span className="lp-carta-ritratto" aria-hidden>
                  <Albero
                    posa={{ ...a.posa, indossa: [...a.posa.indossa, INFO_STRADE[s].accessorio] }}
                    stadio="albero"
                    stagione="autunno"
                    className="h-full w-full"
                    titolo=""
                  />
                </span>
                <span className="lp-carta-nome">{nomeCorto(s)}</span>
                <span className="lp-carta-testo">{INFO_STRADE[s].descrizione}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
