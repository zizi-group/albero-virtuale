/** @jsxRuntime automatic */
/** @jsxImportSource react */
// (Il pragma serve quando lo usa il motore notturno, fuori da Next: npm run notte.)
import { ImageResponse } from "next/og";
import { svgScena, type Inquadratura } from "@/app/giardino/mese/[numero]/cartolina/scena";
import type { Meteo, Posa, Stadio, Stagione } from "@/lib/albero/tipi";
import { caratteriCartolina } from "./caratteri";

// La cartolina della settimana, per l'email (tutti i piani): lo stesso paesaggio
// e lo stesso albero vettoriale della cartolina del mese, in orizzontale,
// con una striscia di carta per la didascalia. PNG 1200×900.

const EMAIL: Inquadratura = { larghezza: 1200, altezza: 900, prato: 600, piedi: 700, altezzaAlbero: 520 };
const INCHIOSTRO = "#23261d";

export async function pngSettimana({
  nome,
  numero,
  primo,
  ultimo,
  didascalia,
  scena,
}: {
  nome: string;
  numero: number;
  primo: number;
  ultimo: number;
  didascalia: string;
  scena: { meteo: Meteo; posa: Posa; stadio: Stadio; stagione: Stagione; giorni: number };
}): Promise<Buffer> {
  const q = EMAIL;
  const svg = svgScena({ ...scena, q });
  const sfondo = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const fonts = await caratteriCartolina();

  const immagine = new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", fontFamily: "Young Serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- dentro ImageResponse non c'è next/image */}
        <img src={sfondo} width={q.larghezza} height={q.altezza} alt="" style={{ position: "absolute", top: 0, left: 0 }} />
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 48,
            display: "flex",
            padding: "12px 22px",
            background: "rgba(251,247,236,0.92)",
            borderRadius: 999,
            fontSize: 26,
            color: "#3f5a2a",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {`Settimana ${numero} · giorni ${primo}–${ultimo}`}
        </div>
        <div
          style={{
            position: "absolute",
            top: 768,
            left: 120,
            width: q.larghezza - 240,
            display: "flex",
            justifyContent: "center",
            padding: "20px 30px",
            background: "#fffaf0",
            borderRadius: 8,
            boxShadow: "0 18px 40px -22px rgba(35,38,29,0.6)",
            transform: "rotate(-0.8deg)",
            fontFamily: "Gochi Hand",
            fontSize: 38,
            lineHeight: 1.2,
            color: INCHIOSTRO,
            textAlign: "center",
          }}
        >
          {didascalia || nome}
        </div>
      </div>
    ),
    { width: q.larghezza, height: q.altezza, fonts },
  );
  return Buffer.from(await immagine.arrayBuffer());
}
