// Gli oggetti del giardino, sul prato accanto all'albero: la cassetta delle
// lettere e il taccuino del diario. Sono link: portano alle sezioni sotto la scena.

export function Cassetta({ daLeggere, totale }: { daLeggere: number; totale: number }) {
  const etichetta =
    daLeggere > 0
      ? `La cassetta delle lettere: ${daLeggere} ${daLeggere === 1 ? "lettera da leggere" : "lettere da leggere"}`
      : `La cassetta delle lettere: ${totale} ${totale === 1 ? "lettera" : "lettere"}`;
  return (
    <a href="#lettere" className="oggetto-scena cassetta" data-piena={daLeggere > 0 ? "1" : undefined} aria-label={etichetta}>
      <svg viewBox="0 0 64 124" aria-hidden>
        <rect x="27" y="52" width="10" height="70" rx="2" fill="#7a5236" stroke="#23261d" strokeWidth="2.5" />
        <path d="M22,122 h20" stroke="#23261d" strokeWidth="2.5" strokeLinecap="round" />
        {daLeggere > 0 && (
          <g className="cassetta-lettere">
            <rect x="12" y="10" width="26" height="18" rx="1.5" fill="#fbf7ec" stroke="#23261d" strokeWidth="2" transform="rotate(-12 25 19)" />
            <rect x="22" y="8" width="26" height="18" rx="1.5" fill="#f4e7cb" stroke="#23261d" strokeWidth="2" transform="rotate(8 35 17)" />
          </g>
        )}
        <path d="M5,60 L5,34 Q5,16 32,16 Q59,16 59,34 L59,60 Z" fill="#b8322a" stroke="#23261d" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M10,34 Q10,22 32,22" stroke="#e46a5c" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".7" />
        <rect x="16" y="40" width="32" height="5" rx="2.5" fill="#23261d" />
        <g className="cassetta-bandiera">
          <path d="M59,52 L59,26" stroke="#23261d" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M59,26 L75,30 L59,36 Z" fill="#e0a526" stroke="#23261d" strokeWidth="2" strokeLinejoin="round" />
        </g>
      </svg>
      {daLeggere > 0 && <span className="cassetta-numero">{daLeggere}</span>}
    </a>
  );
}

export function Taccuino({ righe }: { righe: number }) {
  return (
    <a href="#diario" className="oggetto-scena taccuino-scena" aria-label={`Il diario: ${righe} ${righe === 1 ? "pagina" : "pagine"}`}>
      <svg viewBox="0 0 96 64" aria-hidden>
        <path d="M10,48 L54,60 L90,40 L46,30 Z" fill="#fbf7ec" stroke="#23261d" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10,44 L54,56 L90,36 L46,26 Z" fill="#f3ecdc" stroke="#23261d" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10,40 L54,52 L90,32 L46,22 Z" fill="#3f5a2a" stroke="#23261d" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M62,47.6 L35,25.6" stroke="#e0a526" strokeWidth="3.4" />
        <path d="M30,38 l18,5 M33,34 l14,4" stroke="#fbf7ec" strokeWidth="2" strokeLinecap="round" opacity=".8" />
      </svg>
    </a>
  );
}

/** Il mucchio di terra con il seme, prima che germogli. */
export function Seme() {
  return (
    <svg className="seme" viewBox="0 0 100 40" aria-hidden>
      <path d="M4,36 C14,14 34,8 50,8 C66,8 86,14 96,36 Z" fill="#6b4a2b" />
      <path d="M14,30 C24,18 38,15 50,15 C62,15 76,18 86,30" stroke="#5b3b25" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".6" />
      <g className="seme-chicco">
        <ellipse cx="50" cy="10" rx="7.5" ry="5.5" fill="#a0703c" stroke="#4a2f1d" strokeWidth="1.6" />
        <path d="M50,5 q3,-6 8,-6" stroke="#6f9a3c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Il cartello di legno piantato accanto al seme, con il nome scritto a mano. */
export function Cartello({ nome, sotto }: { nome: string; sotto?: string }) {
  return (
    <div className="cartello-legno" aria-hidden>
      <div className="cartello-asse">
        <span className="cartello-nome">{nome}</span>
        {sotto && <span className="cartello-sotto">{sotto}</span>}
      </div>
    </div>
  );
}
