import { Bricolage_Grotesque } from "next/font/google";

// Il sans dell'interfaccia moderna: pagina iniziale e comandi sopra il giardino.
export const fontModerna = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-lp",
  axes: ["opsz", "wdth"],
  display: "swap",
});
