import type { Metadata, Viewport } from "next";
import { Gochi_Hand, Newsreader, Young_Serif } from "next/font/google";
import "./globals.css";
import "./esperienza.css";
import { SCRIPT_MOVIMENTO } from "@/lib/movimento";

const titolo = Young_Serif({
  variable: "--font-young-serif",
  weight: "400",
  subsets: ["latin"],
});

const testo = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const mano = Gochi_Hand({
  variable: "--font-gochi",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linfa — Pianta un albero. Lui decide chi diventare.",
  description:
    "Un albero digitale in abbonamento: vive con il meteo reale della tua città, scrive una pagina di diario al giorno e una lettera via email ogni 30 giorni. All'undicesimo mese ricevi il diario dell'anno.",
  appleWebApp: { capable: true, title: "Linfa", statusBarStyle: "black-translucent" },
  icons: { apple: "/icone/linfa-apple.png" },
};

export const viewport: Viewport = {
  themeColor: "#f3ecdc",
  // Aree sicure: il giardino usa tutto lo schermo anche col notch.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${titolo.variable} ${testo.variable} ${mano.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col text-[17px] leading-relaxed">
        {/* «Animazioni complete»: la scelta salvata si applica prima del primo disegno.
            Lo script sta dentro un contenitore: lo esegue il browser leggendo la pagina,
            mai React quando ridisegna sul client (che avviserebbe in console). */}
        <div hidden dangerouslySetInnerHTML={{ __html: `<script>${SCRIPT_MOVIMENTO}</script>` }} />
        <a href="#contenuto" className="salta-al-contenuto">
          Vai al contenuto
        </a>
        {children}
      </body>
    </html>
  );
}
