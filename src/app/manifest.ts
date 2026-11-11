import type { MetadataRoute } from "next";

// «Aggiungi alla schermata Home»: il giardino si apre come un'app, a tutto schermo.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Linfa — il tuo albero",
    short_name: "Linfa",
    description: "Il giardino del tuo albero digitale: meteo reale della sua città, diario, lettere.",
    start_url: "/giardino",
    scope: "/",
    display: "fullscreen",
    display_override: ["fullscreen", "standalone"],
    orientation: "any",
    background_color: "#11140e",
    theme_color: "#11140e",
    lang: "it",
    icons: [
      { src: "/icone/linfa-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone/linfa-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icone/linfa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
