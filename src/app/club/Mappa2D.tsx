"use client";

import { useMemo } from "react";
import { modelloDaNumero, sistemaPosti } from "@/lib/giardino3d/clubPosti.js";
import { SPECIE } from "@/lib/giardino3d/modelli.js";
import type { Stagione } from "@/lib/albero/tipi";
import type { AlberoDelClub } from "@/lib/club";
import type { AlberoToccato } from "./tipi";

// Il ripiego senza WebGL o su dispositivi lenti: la foresta vista dall'alto,
// un cerchio per albero con il colore della sua specie, la bandierina sul tuo.

type Specie = (typeof SPECIE)[keyof typeof SPECIE];

function colore(sp: Specie, stagione: Stagione): string {
  if (stagione === "primavera") return (sp.primavera ?? sp.estate)[1];
  if (stagione === "autunno") return (sp.autunno ?? sp.estate)[1];
  if (stagione === "inverno" && !sp.sempreverde) return "#a89f86";
  return sp.estate[1];
}

export function Mappa2D({ alberi, stagione, onTocca }: { alberi: AlberoDelClub[]; stagione: Stagione; onTocca: (a: AlberoToccato | null) => void }) {
  const { R, punti } = useMemo(() => {
    const { R, pos } = sistemaPosti(alberi);
    const punti = alberi.map((a, i) => {
      const mod = modelloDaNumero(a.modello);
      const sp = SPECIE[mod.specie as keyof typeof SPECIE];
      return { a, x: pos[i].x, z: pos[i].z, r: (0.6 + 0.9 * a.crescita) * mod.chioma, fill: colore(sp, stagione), specie: sp.nome };
    });
    return { R, punti };
  }, [alberi, stagione]);
  const lato = R + 6;
  const mio = punti.find((p) => p.a.mio);

  return (
    <div className="club-mappa">
      <svg viewBox={`${-lato} ${-lato} ${lato * 2} ${lato * 2}`} role="img" aria-label={`La foresta del club vista dall'alto: ${alberi.length} alberi. Tocca un albero per il suo nome.`}>
        <defs>
          <radialGradient id="club-radura">
            <stop offset="0" stopColor="#c9e39a" />
            <stop offset="1" stopColor="#8db85a" />
          </radialGradient>
        </defs>
        <circle r={R + 4} fill="url(#club-radura)" />
        {punti.map((p) => (
          <circle
            key={p.a.seme}
            cx={p.x}
            cy={p.z}
            r={p.r}
            fill={p.fill}
            stroke={p.a.mio ? "#e0a526" : "rgba(30,50,20,.35)"}
            strokeWidth={p.a.mio ? 0.5 : 0.15}
            strokeDasharray={p.a.esempio ? "0.4 0.3" : undefined}
            onClick={() => onTocca({ ...p.a, specie: p.specie })}
            style={{ cursor: "pointer" }}
          >
            <title>{`${p.a.nome}${p.a.mio ? " (il tuo albero)" : p.a.esempio ? " (esempio della demo)" : p.a.persona ? ` di ${p.a.persona}` : ""}`}</title>
          </circle>
        ))}
        {mio && (
          <g transform={`translate(${mio.x + mio.r * 0.6} ${mio.z - mio.r * 0.6}) scale(${Math.max(1, lato / 30)})`} pointerEvents="none">
            <line x1="0" y1="0" x2="0" y2="-4" stroke="#f6f1e6" strokeWidth="0.25" />
            <path d="M0 -4 L2.4 -3.3 L0 -2.6 Z" fill="#e0a526" />
            <text x="0.4" y="-4.6" fontSize="1.8" fill="#23261d" fontWeight="700" stroke="#fbf7ec" strokeWidth="0.5" paintOrder="stroke">
              {mio.a.nome}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
