"use client";

import { useEffect } from "react";

/**
 * Le animazioni della vetrina: testi che entrano allo scorrimento, parole dei
 * titoli in sequenza, tappe dei percorsi che prendono vita, lucchetti che si
 * aprono. Lavora solo sulle classi: con il movimento ridotto il CSS mostra
 * tutto fermo.
 */
export function Animazioni() {
  useEffect(() => {
    const radice = document.querySelector(".vetrina");
    if (!radice) return;

    // Parole dei titoli una dopo l'altra
    radice.querySelectorAll<HTMLElement>("h1 .r, h2 .r").forEach((r) => {
      const fratelli = Array.from(r.parentElement?.querySelectorAll(".r") ?? []);
      r.style.transitionDelay = `${fratelli.indexOf(r) * 0.12}s`;
    });

    // Entrata allo scorrimento, sfalsata tra elementi vicini
    const entrata = new IntersectionObserver(
      (voci) => {
        for (const v of voci) {
          if (!v.isIntersecting) continue;
          const el = v.target as HTMLElement;
          const vicini = Array.from(el.parentElement?.children ?? []).filter((c) => c.classList.contains("e"));
          el.style.transitionDelay = `${vicini.indexOf(el) * 0.09}s`;
          el.classList.add("dentro");
          entrata.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    radice.querySelectorAll(".e").forEach((e) => entrata.observe(e));

    // Percorsi: ogni tappa prende vita quando entra; poi il lucchetto si apre
    const timer: number[] = [];
    const tappe = new IntersectionObserver(
      (voci) => {
        for (const v of voci) {
          if (!v.isIntersecting) continue;
          const el = v.target as HTMLElement;
          el.classList.add("vivo");
          tappe.unobserve(el);
          if (el.querySelector(".lucchetto")) timer.push(window.setTimeout(() => el.classList.add("sbloccato"), 1700));
        }
      },
      { threshold: 0.35 },
    );
    radice.querySelectorAll(".passo, .freccia").forEach((e) => tappe.observe(e));

    return () => {
      entrata.disconnect();
      tappe.disconnect();
      timer.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return null;
}
