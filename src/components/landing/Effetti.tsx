"use client";

import { useEffect, type CSSProperties } from "react";
import { EVENTO_MOVIMENTO, movimentoRidotto } from "@/components/Movimento";

// Gli effetti della pagina iniziale, tutti in un posto e solo con transform e opacity:
// - [data-rivela]: i titoli entrano parola per parola quando arrivano sullo schermo;
// - [data-conta]: i numeri contano fino al loro valore;
// - [data-inclina]: le card si inclinano verso il puntatore, con un riflesso;
// - [data-magnete]: i bottoni si lasciano attirare dal puntatore;
// - una luce morbida segue il puntatore sulle sezioni scure.
// Col movimento ridotto (senza «Animazioni complete») tutto è subito al suo posto.

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function Effetti() {
  useEffect(() => {
    let pulisci = avvia();
    const riavvia = () => {
      pulisci();
      pulisci = avvia();
    };
    window.addEventListener(EVENTO_MOVIMENTO, riavvia);
    return () => {
      window.removeEventListener(EVENTO_MOVIMENTO, riavvia);
      pulisci();
    };
  }, []);
  return null;
}

function avvia(): () => void {
  const fermo = movimentoRidotto();
  const pulizie: (() => void)[] = [];

  // L'intestazione prende un fondo appena si scorre: i capitoli non le passano sotto a vista.
  const testata = document.querySelector<HTMLElement>(".lp header");
  const aggiornaTestata = () => testata?.classList.toggle("lp-testata-piena", window.scrollY > 24);
  aggiornaTestata();
  window.addEventListener("scroll", aggiornaTestata, { passive: true });
  pulizie.push(() => window.removeEventListener("scroll", aggiornaTestata));

  // Titoli e numeri: entrano quando si vedono.
  const rivela = Array.from(document.querySelectorAll<HTMLElement>("[data-rivela]"));
  const numeri = Array.from(document.querySelectorAll<HTMLElement>("[data-conta]"));
  if (fermo) {
    rivela.forEach((el) => el.classList.add("visto"));
    numeri.forEach((el) => (el.textContent = el.dataset.conta ?? el.textContent));
  } else {
    numeri.forEach((el) => {
      if (!el.dataset.contato) el.textContent = "0";
    });
    const osserva = new IntersectionObserver(
      (voci) => {
        for (const v of voci) {
          if (!v.isIntersecting) continue;
          const el = v.target as HTMLElement;
          osserva.unobserve(el);
          if (el.dataset.rivela !== undefined) el.classList.add("visto");
          if (el.dataset.conta && !el.dataset.contato) conta(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    [...rivela, ...numeri].forEach((el) => osserva.observe(el));
    pulizie.push(() => osserva.disconnect());
  }

  // Puntatore: solo con mouse o penna, e senza movimento ridotto.
  if (!fermo && window.matchMedia("(pointer: fine)").matches) {
    const luce = document.createElement("div");
    luce.className = "lp-luce";
    luce.setAttribute("aria-hidden", "true");
    document.body.appendChild(luce);
    pulizie.push(() => luce.remove());

    let raf = 0;
    let ultimo: PointerEvent | null = null;
    const inclinate = new Set<HTMLElement>();
    const attratti = new Set<HTMLElement>();

    const disegna = () => {
      raf = 0;
      const e = ultimo;
      if (!e) return;
      luce.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const bersaglio = e.target instanceof Element ? e.target : null;
      luce.classList.toggle("accesa", !!bersaglio?.closest(".lp-scuro, .lp-ambra"));

      const sopra = bersaglio?.closest<HTMLElement>("[data-inclina]") ?? null;
      inclinate.forEach((el) => {
        if (el !== sopra) {
          el.style.removeProperty("--rx");
          el.style.removeProperty("--ry");
          el.classList.remove("inclinata");
          inclinate.delete(el);
        }
      });
      if (sopra) {
        const r = sopra.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        sopra.style.setProperty("--rx", `${((0.5 - y) * 10).toFixed(2)}deg`);
        sopra.style.setProperty("--ry", `${((x - 0.5) * 12).toFixed(2)}deg`);
        sopra.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
        sopra.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
        sopra.classList.add("inclinata");
        inclinate.add(sopra);
      }

      document.querySelectorAll<HTMLElement>("[data-magnete]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const vicino = Math.abs(dx) < r.width / 2 + 40 && Math.abs(dy) < r.height / 2 + 40;
        if (vicino) {
          el.style.translate = `${(dx * 0.18).toFixed(1)}px ${(dy * 0.25).toFixed(1)}px`;
          attratti.add(el);
        } else if (attratti.has(el)) {
          el.style.translate = "";
          attratti.delete(el);
        }
      });
    };
    const muovi = (e: PointerEvent) => {
      ultimo = e;
      if (!raf) raf = requestAnimationFrame(disegna);
    };
    window.addEventListener("pointermove", muovi, { passive: true });
    pulizie.push(() => {
      window.removeEventListener("pointermove", muovi);
      cancelAnimationFrame(raf);
      inclinate.forEach((el) => el.classList.remove("inclinata"));
      attratti.forEach((el) => (el.style.translate = ""));
    });
  }

  return () => pulizie.forEach((f) => f());
}

function conta(el: HTMLElement) {
  const fine = Number(el.dataset.conta ?? "0");
  el.dataset.contato = "1";
  const durata = fine > 50 ? 1600 : 900;
  const t0 = performance.now();
  const passo = (t: number) => {
    const k = Math.min(1, (t - t0) / durata);
    el.textContent = String(Math.round(fine * ease(k)));
    if (k < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

/**
 * Un titolo che entra parola per parola. Le parole di `evidenza` sono sottolineate.
 * `subito`: entra al caricamento con un'animazione solo CSS, senza aspettare il JavaScript
 * (per il titolo principale: deve leggersi entro un secondo anche sul telefono).
 */
export function Parole({ testo, evidenza = "", subito = false }: { testo: string; evidenza?: string; subito?: boolean }) {
  const parole = testo.split(" ");
  const accese = new Set(evidenza.split(" ").filter(Boolean));
  return (
    <span className={subito ? "parole parole-subito" : "parole"} data-rivela={subito ? undefined : true}>
      {parole.map((p, i) => (
        <span key={i}>
          <span className="parola">
            <span className={accese.has(p) ? "lp-evidenza" : undefined} style={{ "--i": i } as CSSProperties}>
              {p}
            </span>
          </span>
          {i < parole.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
