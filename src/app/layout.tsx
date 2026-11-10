import type { Metadata, Viewport } from "next";
import { Gochi_Hand, Newsreader, Young_Serif } from "next/font/google";
import "./globals.css";
import "./esperienza.css";

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
  title: "Linfa — Compri un albero. Non sai chi diventerà.",
  description:
    "Un albero digitale tutto tuo, con un carattere e una vita propria. Ti scrive lettere, vive col meteo della tua città e decide da solo chi diventare.",
};

export const viewport: Viewport = {
  themeColor: "#f3ecdc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${titolo.variable} ${testo.variable} ${mano.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-[17px] leading-relaxed">
        <a href="#contenuto" className="salta-al-contenuto">
          Vai al contenuto
        </a>
        {children}
      </body>
    </html>
  );
}
