"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { indirizzoStanza, type DatiForesta } from "@/lib/foresta/tipi";
import { MappaForesta } from "./MappaForesta";
import { Panoramica3D, useTreD, type Margini, type Tocco } from "./Panoramica3D";

// La pagina della tua foresta: la vista (3D o mappa), il pannello dei numeri
// veri e il passaggio alla stanza 2D (la camera scende, la pagina sfuma).

const AVVISO_ESEMPIO = "È una stanza d'esempio della demo: per ora si entra solo nelle tue.";
const numero = (n: number) => new Intl.NumberFormat("it-IT").format(n);

function Pannello({ dati, esempi }: { dati: DatiForesta; esempi: boolean }) {
  const n = dati.numeri;
  const righe: [string, string][] = [
    [numero(n.alberiPiantati), n.alberiPiantati === 1 ? "albero piantato" : "alberi piantati"],
    [numero(n.giorniVissuti), n.giorniVissuti === 1 ? "giorno vissuto" : "giorni vissuti"],
    [numero(n.lettereRicevute), n.lettereRicevute === 1 ? "lettera ricevuta" : "lettere ricevute"],
    [numero(n.oggettiSbloccati), n.oggettiSbloccati === 1 ? "oggetto sbloccato" : "oggetti sbloccati"],
    [`${n.stanzeAperte} di ${n.stanzeMassime}`, "stanze aperte"],
  ];
  return (
    <>
      <p className="occhiello fo-pannello-titolo">I numeri veri</p>
      <dl className="fo-numeri">
        {righe.map(([v, l]) => (
          <div key={l} className="fo-numero">
            <dt>{l}</dt>
            <dd className="font-titolo">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="fo-veri">
        <p className="fo-veri-titolo">Gli alberi veri in Italia</p>
        {n.alberiVeri === null ? (
          <p className="fo-veri-testo">
            <span className="fo-bollino">in arrivo</span> Qui vedrai dove sono stati piantati, la specie e da quanti anni li curiamo.
          </p>
        ) : (
          <ul className="fo-veri-testo">
            {n.alberiVeri.map((a, i) => (
              <li key={i}>
                {a.specie}, {a.luogo}, {a.anni === 1 ? "1 anno" : `${a.anni} anni`}
              </li>
            ))}
          </ul>
        )}
      </div>
      {esempi && <p className="fo-nota">Le stanze d&apos;esempio della demo non entrano nei numeri.</p>}
    </>
  );
}

export function Foresta({ dati, soloMappa, esempi }: { dati: DatiForesta; soloMappa: boolean; esempi: boolean }) {
  const router = useRouter();
  const puo3D = useTreD();
  const [ripiego, setRipiego] = useState(false);
  const tre = puo3D && !soloMappa && !ripiego;
  const [vola, setVola] = useState<Tocco | null>(null);
  const [velo, setVelo] = useState(false);
  const [avviso, setAvviso] = useState<string | null>(null);
  const [margini, setMargini] = useState<Margini>({ sopra: 0, sotto: 0, sinistra: 0, destra: 0 });
  const testata = useRef<HTMLElement>(null);
  const pannello = useRef<HTMLElement>(null);
  const uscita = useRef(false);
  const veloGiu = useRef(false);

  // Le parti dello schermo coperte da testata e pannello: la foresta si centra nel resto.
  useEffect(() => {
    const misura = () => {
      const W = window.innerWidth, H = window.innerHeight;
      const t = testata.current?.getBoundingClientRect();
      const p = pannello.current?.getBoundingClientRect();
      const largo = W >= 900;
      setMargini({
        sopra: t ? Math.min(0.3, t.bottom / H) : 0,
        sotto: !largo && p ? Math.min(0.5, (H - p.top) / H) : 0,
        sinistra: 0,
        destra: largo && p ? Math.min(0.45, (W - p.left) / W) : 0,
      });
    };
    misura();
    const ro = new ResizeObserver(misura);
    if (testata.current) ro.observe(testata.current);
    if (pannello.current) ro.observe(pannello.current);
    window.addEventListener("resize", misura);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", misura);
    };
  }, []);

  useEffect(() => {
    router.prefetch("/giardino");
  }, [router]);

  useEffect(() => {
    if (!avviso) return;
    const t = setTimeout(() => setAvviso(null), 4200);
    return () => clearTimeout(t);
  }, [avviso]);

  /** Sfuma la pagina e apre la stanza 2D. */
  const esci = useCallback(
    (href: string) => {
      if (uscita.current) return;
      uscita.current = true;
      // se il velo è già sceso (durante il volo) si va subito
      const attesa = veloGiu.current ? 0 : 380;
      setVelo(true);
      window.setTimeout(() => router.push(href), attesa);
    },
    [router],
  );

  const tocca = useCallback(
    (t: Tocco) => {
      if (uscita.current || vola) return;
      if (t.stanza.startsWith("esempio-")) {
        setAvviso(AVVISO_ESEMPIO);
        return;
      }
      setVola(t);
      // la pagina comincia a sfumare mentre la camera finisce di scendere
      window.setTimeout(() => {
        veloGiu.current = true;
        setVelo(true);
      }, 820);
    },
    [vola],
  );

  return (
    <main className="foresta" data-vista={tre ? "3d" : "mappa"}>
      {tre ? (
        <Panoramica3D
          dati={dati}
          margini={margini}
          vola={vola}
          onTocca={tocca}
          onBloccata={(b) => setAvviso(`Stanza ${b.numero}: ${b.regola.charAt(0).toLowerCase()}${b.regola.slice(1)} per aprirla.`)}
          onEntrata={(t) => esci(indirizzoStanza(t.stanza, t.albero ?? undefined))}
          onRipiego={() => setRipiego(true)}
        />
      ) : (
        <MappaForesta dati={dati} onEntra={esci} onEsempio={() => setAvviso(AVVISO_ESEMPIO)} />
      )}

      <header ref={testata} className="fo-testata">
        <Link href="/" className="fo-logo font-titolo" aria-label="Linfa, pagina iniziale">
          Linfa
        </Link>
        <h1 className="font-titolo fo-titolo">La tua foresta</h1>
        <nav className="fo-azioni">
          <Link href={esempi ? "/foresta" : "/foresta?esempi=1"} className="fo-bottone fo-bottone-chiaro">
            {esempi ? "Solo le mie stanze" : "Vedi esempi della demo"}
          </Link>
          <Link href="/giardino" className="fo-bottone" onClick={(e) => { e.preventDefault(); esci("/giardino?da=foresta"); }}>
            Al giardino
          </Link>
        </nav>
      </header>

      <aside ref={pannello} className="fo-pannello" aria-label="I numeri della tua foresta">
        <Pannello dati={dati} esempi={esempi} />
        <p className="fo-aiuto">{tre ? "Tocca un albero o una radura per entrare nella sua stanza." : "Tocca una radura per entrare nella sua stanza."}</p>
      </aside>

      <p className="fo-avviso" role="status" aria-live="polite" data-visibile={avviso ? true : undefined}>
        {avviso}
      </p>
      <div className="fo-velo" data-attivo={velo || undefined} aria-hidden />
    </main>
  );
}
