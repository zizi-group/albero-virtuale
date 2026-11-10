import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";
import { datiMese, regaliInUso, scenaDelGiorno, stradaAlGiorno } from "@/lib/motore/extra";
import { isPremium } from "@/lib/piani";
import { createClient, getUtente } from "@/lib/supabase/server";
import { svgScena, type Inquadratura } from "./scena";

// La cartolina digitale del mese (Premium): il momento più bello, in formato
// storia (1080×1920) o sfondo del telefono (1170×2532). PNG fatto da
// ImageResponse (next/og): il paesaggio e l'albero sono SVG vettoriali, il testo
// è impaginato sopra. ?scarica=1 la fa scaricare invece di mostrarla.

const FORMATI = {
  // Storia: titolo sotto la zona dei comandi in alto, frase sopra la barra delle risposte.
  storia: { larghezza: 1080, altezza: 1920, prato: 1330, piedi: 1450, altezzaAlbero: 820 },
  // Sfondo: il cielo in alto resta libero per l'orologio, l'albero sta in basso.
  sfondo: { larghezza: 1170, altezza: 2532, prato: 1880, piedi: 2060, altezzaAlbero: 1020 },
} satisfies Record<string, Inquadratura>;

type Formato = keyof typeof FORMATI;

const INCHIOSTRO = "#23261d";
const CARTA = "#fbf7ec";

// I caratteri del sito (Young Serif, Gochi Hand) in TTF da Google Fonts, una volta
// sola per processo. Se la rete non risponde si usa il carattere di serie di next/og.
const caratteri = new Map<string, Promise<ArrayBuffer | null>>();
function carattere(famiglia: string): Promise<ArrayBuffer | null> {
  let p = caratteri.get(famiglia);
  if (!p) {
    p = (async () => {
      try {
        const css = await fetch(`https://fonts.googleapis.com/css2?family=${famiglia.replace(/ /g, "+")}`, {
          signal: AbortSignal.timeout(4000),
        }).then((r) => r.text());
        const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
        if (!url) return null;
        const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
        return r.ok ? await r.arrayBuffer() : null;
      } catch {
        return null;
      }
    })();
    caratteri.set(famiglia, p);
    // Un errore di rete non resta in memoria: si riprova alla cartolina successiva.
    p.then((f) => {
      if (!f) caratteri.delete(famiglia);
    });
  }
  return p;
}

export async function GET(request: NextRequest, { params }: RouteContext<"/giardino/mese/[numero]/cartolina">) {
  const { numero } = await params;
  const n = Number(numero);
  const formato: Formato = request.nextUrl.searchParams.get("formato") === "sfondo" ? "sfondo" : "storia";
  const scarica = request.nextUrl.searchParams.get("scarica") === "1";

  const utente = await getUtente();
  if (!utente) return NextResponse.redirect(new URL("/accedi", request.nextUrl.origin));
  const supabase = await createClient();
  const { data: albero } = await supabase.from("trees").select("*").eq("owner_id", utente.id).maybeSingle();
  if (!albero) return new NextResponse("Nessun albero.", { status: 404 });
  if (!isPremium(albero.plan)) return new NextResponse("La cartolina del mese è un extra del Premium.", { status: 403 });

  const dati = Number.isInteger(n) && n >= 1 ? await datiMese(supabase, albero.id, n, albero.name) : null;
  if (!dati?.momento || !dati.recap) return new NextResponse("Questo mese non ha ancora un momento da disegnare.", { status: 404 });

  const regali = await regaliInUso(supabase, albero.id, n);
  const scena = scenaDelGiorno(dati.momento, stradaAlGiorno(albero.path, albero.biography, dati.momento.day_number), regali);
  const q = FORMATI[formato];
  const svg = svgScena({ ...scena, q });
  const sfondo = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  const [titolo, mano] = await Promise.all([carattere("Young Serif"), carattere("Gochi Hand")]);
  const fonts = [
    titolo && { name: "Young Serif", data: titolo, weight: 400 as const, style: "normal" as const },
    mano && { name: "Gochi Hand", data: mano, weight: 400 as const, style: "normal" as const },
  ].filter((f) => !!f);

  const { recap } = dati;
  const titoloMese = recap.titolo.replace(/^Il mese \d+$/, `Il mese di ${albero.name}`);
  const s = q.larghezza / 1080;

  const immagine = new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", fontFamily: "Young Serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- dentro ImageResponse non c'è next/image */}
        <img src={sfondo} width={q.larghezza} height={q.altezza} alt="" style={{ position: "absolute", top: 0, left: 0 }} />

        {formato === "storia" ? (
          <>
            {/* L'etichetta in alto, come un cartellino di carta */}
            <div
              style={{
                position: "absolute",
                top: 230,
                left: 90,
                width: q.larghezza - 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "38px 46px 42px",
                background: CARTA,
                borderRadius: 10,
                boxShadow: "0 24px 50px -24px rgba(35,38,29,0.55)",
                transform: "rotate(-1.5deg)",
                color: INCHIOSTRO,
              }}
            >
              <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#3f5a2a" }}>
                {`Linfa · mese ${n} · ${albero.city}`}
              </div>
              <div style={{ display: "flex", marginTop: 16, fontSize: 72, lineHeight: 1.05, textAlign: "center" }}>{titoloMese}</div>
              <div style={{ display: "flex", marginTop: 14, fontSize: 34, color: "#7a5236", fontFamily: "Gochi Hand" }}>
                {`${albero.name}, giorno ${dati.momento.day_number}`}
              </div>
            </div>

            {/* La frase migliore del diario, su un biglietto */}
            <div
              style={{
                position: "absolute",
                top: 1500,
                left: 110,
                width: q.larghezza - 220,
                display: "flex",
                flexDirection: "column",
                padding: "34px 42px 30px",
                background: "#fffaf0",
                borderRadius: 8,
                boxShadow: "0 24px 50px -26px rgba(35,38,29,0.6)",
                transform: "rotate(1deg)",
                color: "#2c3348",
              }}
            >
              <div style={{ display: "flex", fontFamily: "Gochi Hand", fontSize: 46, lineHeight: 1.25 }}>{`«${recap.frase}»`}</div>
              <div style={{ display: "flex", marginTop: 14, fontSize: 26, color: "#6b6656" }}>{`dal diario di ${albero.name}`}</div>
            </div>
          </>
        ) : (
          /* Lo sfondo: solo una firma piccola in basso, sopra la barra del telefono */
          <div
            style={{
              position: "absolute",
              left: 0,
              width: q.larghezza,
              top: 2300 * (q.altezza / 2532),
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: `${14 * s}px ${30 * s}px`,
                background: "rgba(251,247,236,0.88)",
                borderRadius: 999,
                fontFamily: "Gochi Hand",
                fontSize: 40 * s,
                color: INCHIOSTRO,
              }}
            >
              {`${albero.name} · ${titoloMese}`}
            </div>
          </div>
        )}
      </div>
    ),
    {
      width: q.larghezza,
      height: q.altezza,
      fonts: fonts.length ? fonts : undefined,
      headers: { "Cache-Control": "private, no-store" },
    },
  );

  if (!scarica) return immagine;
  const nomeFile = `linfa-${albero.name}-mese-${n}-${formato}.png`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9.-]+/g, "-");
  const headers = new Headers(immagine.headers);
  headers.set("Content-Disposition", `attachment; filename="${nomeFile}"`);
  return new Response(immagine.body, { status: immagine.status, headers });
}
