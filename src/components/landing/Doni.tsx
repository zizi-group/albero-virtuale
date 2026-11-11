import { Albero } from "@/components/albero/Albero";
import { azione } from "@/lib/albero/azioni";

// I doni del mese, col Premium: il regalo da mandare all'albero, il riepilogo
// illustrato e la cartolina per il telefono. Disegnati, non foto.

function Regalo() {
  return (
    <svg viewBox="0 0 64 56" className="dono-figura" aria-hidden>
      <rect x="8" y="22" width="48" height="30" rx="3" fill="#b8322a" stroke="#23261d" strokeWidth="2.4" />
      <rect x="5" y="14" width="54" height="10" rx="2.5" fill="#d64a3d" stroke="#23261d" strokeWidth="2.4" />
      <path d="M32,14 V52" stroke="#e0a526" strokeWidth="5" />
      <path d="M32,14 C22,0 10,6 18,12 C22,15 28,14 32,14 C36,14 42,15 46,12 C54,6 42,0 32,14 Z" fill="#e0a526" stroke="#23261d" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function Riepilogo() {
  return (
    <div className="dono-figura dono-riepilogo" aria-hidden>
      <p className="font-titolo text-[0.62rem] leading-tight">Novembre</p>
      <p className="font-mano text-[0.66rem] leading-tight">☂ 4 docce</p>
      <p className="font-mano text-[0.66rem] leading-tight">z 11 pisolini</p>
      <p className="font-mano text-[0.66rem] leading-tight">★ 1 idea</p>
    </div>
  );
}

function Cartolina() {
  return (
    <div className="dono-figura dono-telefono" aria-hidden>
      <div className="dono-schermo">
        <Albero
          posa={{ ...azione("guardare-cielo").posa, occhi: "felici", indossa: ["sciarpa"] }}
          stadio="alberello"
          stagione="autunno"
          className="absolute bottom-[-4%] left-1/2 h-[70%] -translate-x-1/2"
          titolo=""
        />
      </div>
    </div>
  );
}

const DONI = [
  {
    titolo: "Il regalo del mese",
    testo: "Gli mandi un cappello, una bici o un libro: decide se usarlo e ti risponde con una lettera.",
    figura: <Regalo />,
  },
  {
    titolo: "Il riepilogo illustrato",
    testo: "A fine mese, una pagina illustrata con il suo mese.",
    figura: <Riepilogo />,
  },
  {
    titolo: "La cartolina del mese",
    testo: "Un'illustrazione nuova, in formato storia e sfondo del telefono.",
    figura: <Cartolina />,
  },
];

export function Doni() {
  return (
    <ul className="doni">
      {DONI.map((d) => (
        <li key={d.titolo} className="dono">
          {d.figura}
          <div>
            <p className="dono-titolo">{d.titolo}</p>
            <p className="dono-testo mt-0.5">{d.testo}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
