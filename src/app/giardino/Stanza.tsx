"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { EVENTO_VOCE, type DettaglioVoce } from "@/components/albero/vivo/AlberoVivo";
import { CassettaAttrezzi, FiguraOggetto, Pacco } from "@/components/albero/vivo/oggettiStanza";
import { movimentoRidotto } from "@/components/Movimento";
import { inScena, POSTI_STANZA, voce, type Categoria, type VoceCatalogo } from "@/lib/albero/oggetti";
import { apriIPacchi, spostaNellaStanza } from "./actions";
import { dlin } from "./suoni";
import "./stanza.css";

// La stanza 2D (docs/stanze-e-vita.md, 2.3 e 9.3): i posti fissi con gli
// oggetti, i pacchi che aspettano, il momento dello sblocco (coriandoli,
// l'oggetto che vola al suo posto, Pino che reagisce, il banner in alto) e lo
// spostamento degli oggetti da parte della persona.

export interface OggettoInStanza {
  item: string;
  /** Il posto, o null se è in deposito. */
  place: string | null;
  nuovo: boolean;
}

export interface DatiStanza {
  oggetti: OggettoInStanza[];
  /** Gli oggetti dentro ogni pacco in attesa (al massimo 3 pacchi). */
  pacchi: string[][];
  /** Quante voci ha già nella collezione, e quante ne ha il catalogo. */
  sbloccati: number;
  totale: number;
  /** Ha almeno un attrezzo: si vede la cassetta degli attrezzi. */
  haAttrezzi: boolean;
}

/** Il giardino ascolta questo evento: Pino fa la festa per qualche secondo. */
export const EVENTO_SBLOCCO = "linfa-sblocco";
/** Il catalogo lo manda per rimettere nella stanza un oggetto in deposito. */
export const EVENTO_SPOSTA = "linfa-sposta";

const NOMI_POSTO: Record<string, string> = {
  "sfondo-1": "In fondo, a sinistra",
  "sfondo-2": "In fondo, a destra",
  "prato-s1": "Sul prato, a sinistra",
  "prato-s2": "Sul prato, tutto a sinistra",
  "prato-d1": "Sul prato, a destra",
  "prato-d2": "Sul prato, tutto a destra",
  "davanti-1": "Davanti, a sinistra",
  "davanti-2": "Davanti, a destra",
  "rami-1": "Appeso, a sinistra",
  "rami-2": "Appeso, a destra",
};
const DIETRO = [...POSTI_STANZA.sfondo, ...POSTI_STANZA.rami, ...POSTI_STANZA.prato];
const DAVANTI = POSTI_STANZA.davanti;

const REAZIONI: Record<Categoria, string[]> = {
  edificio: ["L'ho costruito io! Più o meno.", "Una casa nuova per le mie idee!"],
  arredo: ["Lo metto lì, ci sta benissimo.", "Proprio quello che mancava!"],
  attrezzo: ["Questo mi servirà, eccome.", "Nella cassetta, pronto all'uso!"],
  gioco: ["Si gioca!", "Evviva, un gioco nuovo!"],
  vestito: ["Come mi sta?", "Elegantissimo, vero?"],
  trofeo: ["Un trofeo! Per me?", "Lo appendo nella bacheca."],
  rarita: ["Che cosa rara!", "Questa la conservo con cura."],
};

const aCaso = <T,>(x: T[]) => x[Math.floor(Math.random() * x.length)];
const voceAlbero = (d: DettaglioVoce) => window.dispatchEvent(new CustomEvent<DettaglioVoce>(EVENTO_VOCE, { detail: d }));
const sulClient = () => () => {};

/** Dove vola un oggetto appena scartato: il suo posto, Pino, la cassetta o il catalogo. */
function destinazione(v: VoceCatalogo, place: string | null): Element | null {
  if (place) return document.querySelector(`[data-st-posto="${place}"]`);
  if (v.posto === "armadio") return document.querySelector(".gi .amb-albero");
  if (v.posto === "cassetta") return document.querySelector(".st-cassetta-attrezzi");
  return document.querySelector('[data-voce="collezione"]');
}

function elenco(nomi: string[]) {
  if (nomi.length <= 2) return nomi.join(" e ");
  return `${nomi.slice(0, 2).join(", ")} e altri ${nomi.length - 2}`;
}

/** I coriandoli che escono dal pacco aperto. */
function coriandoli(radice: HTMLElement | null, da: DOMRect) {
  if (!radice || movimentoRidotto()) return;
  const colori = ["#e0a526", "#b8322a", "#7fb3c8", "#9cc25a", "#c46aa0", "#fbf7ec"];
  for (let i = 0; i < 28; i++) {
    const c = document.createElement("span");
    c.className = "st-coriandolo";
    const angolo = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const forza = 90 + Math.random() * 130;
    c.style.left = `${da.left + da.width / 2}px`;
    c.style.top = `${da.top + da.height * 0.3}px`;
    c.style.background = colori[i % colori.length];
    c.style.setProperty("--dx", `${Math.cos(angolo) * forza}px`);
    c.style.setProperty("--dy", `${Math.sin(angolo) * forza}px`);
    c.style.setProperty("--giro", `${Math.round((Math.random() - 0.5) * 900)}deg`);
    c.style.animationDelay = `${Math.random() * 80}ms`;
    radice.appendChild(c);
    window.setTimeout(() => c.remove(), 1700);
  }
}

/** L'oggetto vola dal pacco al suo posto (o a Pino, alla cassetta, al catalogo). */
function vola(radice: HTMLElement | null, item: string, da: DOMRect, verso: Element | null): Promise<void> {
  const v = voce(item);
  if (!radice || !v || !verso || movimentoRidotto()) return Promise.resolve();
  const fine = verso.getBoundingClientRect();
  const lato = Math.max(56, Math.min(120, da.width * 1.1));
  const fantasma = document.createElement("div");
  fantasma.className = "st-fantasma";
  fantasma.style.width = fantasma.style.height = `${lato}px`;
  fantasma.style.left = `${da.left + da.width / 2 - lato / 2}px`;
  fantasma.style.top = `${da.top - lato * 0.4}px`;
  const figura = document.querySelector(`[data-st-figura="${item}"]`);
  if (figura) fantasma.innerHTML = figura.innerHTML;
  radice.appendChild(fantasma);
  const dx = fine.left + fine.width / 2 - (da.left + da.width / 2);
  const dy = fine.top + fine.height / 2 - (da.top - lato * 0.4 + lato / 2);
  const scala = Math.max(0.3, Math.min(2.4, Math.max(fine.width, fine.height) / lato));
  const anim = fantasma.animate(
    [
      { transform: "translate(0, 0) scale(0.2) rotate(-20deg)", opacity: 0 },
      { transform: "translate(0, -60px) scale(1.15) rotate(6deg)", opacity: 1, offset: 0.3 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 90}px) scale(1) rotate(-4deg)`, opacity: 1, offset: 0.65 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scala}) rotate(0deg)`, opacity: 0.2 },
    ],
    { duration: 1300, easing: "cubic-bezier(0.45, 0, 0.25, 1)", fill: "forwards" },
  );
  // Con la scheda in secondo piano le animazioni si fermano: non si aspetta mai più di così.
  const scadenza = new Promise<void>((r) => window.setTimeout(r, 1800));
  return Promise.race([anim.finished.then(() => undefined, () => undefined), scadenza]).then(() => fantasma.remove());
}

interface Banner {
  testo: string;
  conto: string;
  chiave: number;
}

export function Stanza({ dati, nome, suoniAccesi }: { dati: DatiStanza; nome: string; suoniAccesi: boolean }) {
  const montato = useSyncExternalStore(sulClient, () => true, () => false);
  // Le modifiche fatte qui (oggetti arrivati, spostati) finché il server non le conferma.
  const [posti, setPosti] = useState<Record<string, string | null>>({});
  const [aperti, setAperti] = useState<Set<string>>(new Set());
  const [inVolo, setInVolo] = useState<Set<string>>(new Set());
  const [atterrati, setAtterrati] = useState<Set<string>>(new Set());
  const [aprendo, setAprendo] = useState<number | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [cassettaVista, setCassettaVista] = useState(dati.haAttrezzi);
  const strato = useRef<HTMLDivElement>(null);
  const pacchiEl = useRef<(HTMLButtonElement | null)[]>([]);
  const banners = useRef(0);

  const oggetti = useMemo(() => {
    const tutti = new Map(dati.oggetti.map((o) => [o.item, { ...o }]));
    for (const [item, place] of Object.entries(posti)) {
      const o = tutti.get(item) ?? { item, place, nuovo: true };
      tutti.set(item, { ...o, place });
    }
    return [...tutti.values()];
  }, [dati.oggetti, posti]);
  const perPosto = new Map(oggetti.filter((o) => o.place).map((o) => [o.place!, o]));
  const pacchi = dati.pacchi.filter((p) => !p.every((i) => aperti.has(i)));
  const conto = dati.sbloccati;

  // Pino ci gira intorno, curioso: ogni tanto ci pensa ad alta voce.
  const ciSonoPacchi = pacchi.length > 0;
  useEffect(() => {
    if (!ciSonoPacchi) return;
    const primo = window.setTimeout(() => voceAlbero({ tipo: "dice", testo: "Psst! È arrivato un pacco!", durata: 3.4 }), 5200);
    const giro = window.setInterval(
      () => voceAlbero({ tipo: "pensa", testo: aCaso(["un pacco… per me?", "che cosa ci sarà dentro?", "lo apriamo?"]) }),
      24000,
    );
    return () => {
      clearTimeout(primo);
      clearInterval(giro);
    };
  }, [ciSonoPacchi]);

  // Il catalogo chiede di rimettere nella stanza un oggetto in deposito.
  useEffect(() => {
    const apri = (e: Event) => setMenu((e as CustomEvent<string>).detail);
    window.addEventListener(EVENTO_SPOSTA, apri);
    return () => window.removeEventListener(EVENTO_SPOSTA, apri);
  }, []);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 5200);
    return () => clearTimeout(t);
  }, [banner]);

  useEffect(() => {
    if (!menu) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [menu]);

  async function apri(indice: number) {
    if (aprendo !== null) return;
    const contenuto = pacchi[indice];
    if (!contenuto) return;
    const bottone = pacchiEl.current[indice];
    const da = bottone?.getBoundingClientRect() ?? new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 80, 80);
    setAprendo(indice);
    setErrore(null);
    if (suoniAccesi) dlin();
    coriandoli(strato.current, da);
    setInVolo(new Set(contenuto));
    const risposta = await apriIPacchi(contenuto);
    if (!risposta.ok) {
      setAprendo(null);
      setInVolo(new Set());
      setErrore(risposta.messaggio ?? "Il pacco non si apre. Riprova.");
      return;
    }
    const arrivati = risposta.arrivati;
    // Pino sistema: i posti nuovi (e quello che ha messo via) si vedono subito.
    setPosti((p) => {
      const n = { ...p };
      for (const a of arrivati) {
        if (a.toglie) n[a.toglie] = null;
        if (voce(a.item) && inScena(voce(a.item)!)) n[a.item] = a.place;
      }
      return n;
    });
    setAperti((s) => new Set([...s, ...contenuto]));
    if (arrivati.some((a) => voce(a.item)?.posto === "cassetta")) setCassettaVista(true);
    const nomi = arrivati.map((a) => voce(a.item)?.articolo ?? a.item);
    const prima = voce(arrivati[0]?.item ?? "");
    setBanner({
      testo: `${arrivati.length > 1 ? "Nuovi" : "Nuovo"} nella collezione: ${elenco(nomi)}`,
      conto: `${conto} su ${dati.totale}`,
      chiave: ++banners.current,
    });
    window.dispatchEvent(new CustomEvent(EVENTO_SBLOCCO, { detail: { item: prima?.id } }));
    if (prima) {
      window.setTimeout(
        () => voceAlbero({ tipo: "dice", testo: arrivati.length > 1 ? "Quante cose! Le sistemo io." : aCaso(REAZIONI[prima.categoria]), durata: 3.6 }),
        movimentoRidotto() ? 200 : 900,
      );
    }
    // Un attimo: i posti nuovi sono nel DOM e si possono misurare.
    await new Promise((r) => window.setTimeout(r, 40));
    for (const [i, a] of arrivati.entries()) {
      const v = voce(a.item);
      if (!v) continue;
      await new Promise((r) => window.setTimeout(r, i === 0 ? 120 : 260));
      await vola(strato.current, a.item, da, destinazione(v, a.place));
      setInVolo((s) => {
        const n = new Set(s);
        n.delete(a.item);
        return n;
      });
      setAtterrati((s) => new Set([...s, a.item]));
    }
    setInVolo(new Set());
    setAprendo(null);
  }

  async function sposta(item: string, posto: string | null) {
    setMenu(null);
    const prima = posti;
    const occupante = posto ? perPosto.get(posto) : undefined;
    const vecchio = oggetti.find((o) => o.item === item)?.place ?? null;
    setPosti((p) => ({ ...p, [item]: posto, ...(occupante && occupante.item !== item ? { [occupante.item]: vecchio } : {}) }));
    const r = await spostaNellaStanza(item, posto);
    if (!r.ok) {
      setPosti(prima);
      setErrore(r.messaggio ?? "Non si sposta. Riprova.");
    } else if (posto) {
      voceAlbero({ tipo: "dice", testo: aCaso(["Lì sta meglio, hai ragione.", "Ottima idea!", "Mmh… va bene!"]), durata: 2.8 });
    }
  }

  const figura = (o: OggettoInStanza, posto: string) => {
    const v = voce(o.item);
    if (!v) return null;
    const nascosto = inVolo.has(o.item);
    return (
      <button
        type="button"
        className="st-oggetto"
        data-tipo={v.posto}
        data-nuovo={o.nuovo || atterrati.has(o.item) ? "1" : undefined}
        data-atterrato={atterrati.has(o.item) ? "1" : undefined}
        style={nascosto ? { visibility: "hidden" } : undefined}
        onClick={() => setMenu(o.item)}
        aria-label={`${v.nome}. ${NOMI_POSTO[posto]}. Tocca per spostarlo.`}
        title={v.nome}
      >
        <FiguraOggetto id={o.item} className="st-svg" />
      </button>
    );
  };

  const posto = (p: string) => {
    const o = perPosto.get(p);
    return (
      <div key={p} className="st-posto" data-st-posto={p} data-pieno={o ? "1" : undefined}>
        {o && figura(o, p)}
      </div>
    );
  };

  const voceMenu = menu ? voce(menu) : null;
  const doveMenu = menu ? (oggetti.find((o) => o.item === menu)?.place ?? null) : null;

  return (
    <>
      {/* Dietro all'albero: sfondo, rami, prato */}
      <div className="st st-dietro" aria-label="Gli oggetti della stanza" role="group">
        {DIETRO.map(posto)}
      </div>
      {/* Davanti all'albero: le cose piccole, la cassetta degli attrezzi e i pacchi */}
      <div className="st st-davanti">
        {DAVANTI.map(posto)}
        {cassettaVista && (
          <div className="st-cassetta-attrezzi" title="La cassetta degli attrezzi" aria-hidden>
            <CassettaAttrezzi />
          </div>
        )}
        {pacchi.length > 0 && (
          <div className="st-pacchi">
            {pacchi.map((contenuto, i) => (
              <button
                key={contenuto.join("+")}
                ref={(el) => {
                  pacchiEl.current[i] = el;
                }}
                type="button"
                className="st-pacco"
                data-aprendo={aprendo === i ? "1" : undefined}
                disabled={aprendo !== null}
                onClick={() => apri(i)}
                aria-label={contenuto.length > 1 ? `Un pacco con ${contenuto.length} novità per ${nome}: aprilo` : `Un pacco per ${nome}: aprilo`}
              >
                <Pacco tanti={contenuto.length} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Le figure degli oggetti in arrivo, da copiare nel fantasma che vola */}
      <div hidden>
        {[...new Set([...dati.pacchi.flat(), ...inVolo])].map((i) => (
          <div key={i} data-st-figura={i}>
            <FiguraOggetto id={i} simbolo={voce(i)?.simbolo} className="st-svg" />
          </div>
        ))}
      </div>

      {montato &&
        createPortal(
          <div className="st-sopra" ref={strato}>
            {banner && (
              <p key={banner.chiave} className="st-banner" role="status">
                <span className="st-banner-stella" aria-hidden>
                  ✦
                </span>
                <span>{banner.testo}</span>
                <b>· {banner.conto}</b>
              </p>
            )}
            {errore && (
              <p className="st-banner st-banner-errore" role="alert" onClick={() => setErrore(null)}>
                {errore}
              </p>
            )}
            {voceMenu && inScena(voceMenu) && (
              <div className="st-menu" role="dialog" aria-label={`Dove mettere ${voceMenu.articolo}`}>
                <div className="st-menu-testa">
                  <span className="st-menu-figura">
                    <FiguraOggetto id={voceMenu.id} className="st-svg" />
                  </span>
                  <div>
                    <p className="st-menu-nome">{voceMenu.nome}</p>
                    <p className="st-menu-nota">
                      {doveMenu ? NOMI_POSTO[doveMenu] : "In deposito"}
                      {voceMenu.usi.length > 0 && ` · apre: ${voceMenu.usi.slice(0, 2).join(", ")}`}
                    </p>
                  </div>
                </div>
                <p className="st-menu-domanda">Dove lo metti?</p>
                <div className="st-menu-posti">
                  {POSTI_STANZA[voceMenu.posto].map((p) => {
                    const chi = perPosto.get(p);
                    const qui = p === doveMenu;
                    return (
                      <button key={p} type="button" className="st-menu-posto" disabled={qui} aria-pressed={qui} onClick={() => sposta(voceMenu.id, p)}>
                        {NOMI_POSTO[p]}
                        {chi && !qui && <small>scambia con {voce(chi.item)?.nome.toLowerCase()}</small>}
                      </button>
                    );
                  })}
                </div>
                <div className="st-menu-fondo">
                  {doveMenu && (
                    <button type="button" className="st-menu-via" onClick={() => sposta(voceMenu.id, null)}>
                      Mettilo via
                    </button>
                  )}
                  <button type="button" className="st-menu-chiudi" onClick={() => setMenu(null)} autoFocus>
                    Chiudi
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
