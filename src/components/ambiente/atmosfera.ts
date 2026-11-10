import type { Cielo, Meteo, Stagione } from "@/lib/albero/tipi";

// L'atmosfera della scena: colori del cielo, delle colline e della luce,
// posizione del sole e della luna, che cosa cade dal cielo.
// Tutto diventa variabili CSS registrate (@property in globals.css):
// quando cambiano, il browser le sfuma da sole.

export type Ora = "alba" | "giorno" | "tramonto" | "notte";

type Tre = [string, string, string];

const CIELO_SERENO: Record<Ora, Tre> = {
  alba: ["#7b90c2", "#eeb2a2", "#fbe1b2"],
  giorno: ["#5ea8dc", "#9dcfec", "#f2e6c4"],
  tramonto: ["#35416f", "#cf6f5a", "#f3b766"],
  notte: ["#0a1430", "#1c2c55", "#3a4f7c"],
};

const CIELO_METEO: Record<Exclude<Cielo, "sole">, { giorno: Tre; notte: Tre }> = {
  nuvole: { giorno: ["#90a7bc", "#c3cfd8", "#ede5d1"], notte: ["#101a2e", "#27344d", "#425069"] },
  pioggia: { giorno: ["#5c6c80", "#8492a0", "#b7bfbd"], notte: ["#0a1120", "#1b2535", "#323e50"] },
  temporale: { giorno: ["#333c4a", "#515c69", "#858e94"], notte: ["#070c16", "#141b27", "#262f3d"] },
  neve: { giorno: ["#a8b9ca", "#cfdae2", "#f3f3ee"], notte: ["#16233b", "#33445f", "#5e6f88"] },
  nebbia: { giorno: ["#bbc1bc", "#d5d6cd", "#ebe7dc"], notte: ["#1c2433", "#353e4e", "#4f5868"] },
};

/** Colline lontane, colline vicine, prato, ombra del prato. */
const COLLINE: Record<Stagione, [string, string, string, string]> = {
  primavera: ["#a8c879", "#85b351", "#6f9a3c", "#587e2f"],
  estate: ["#9bba62", "#77a042", "#5f8a33", "#4a6f27"],
  autunno: ["#ccae6b", "#b39149", "#988337", "#7b692b"],
  inverno: ["#a9b39f", "#8c9983", "#7b896d", "#647259"],
};
const COLLINE_NEVE: [string, string, string, string] = ["#e2e8ed", "#edf1f3", "#f6f8f9", "#d9e2e8"];

const NUVOLE: Record<Ora | Exclude<Cielo, "sole">, string> = {
  alba: "#fde8de",
  giorno: "#ffffff",
  tramonto: "#f5c3a4",
  notte: "#3a4a6e",
  nuvole: "#f4f4f1",
  pioggia: "#8d98a4",
  temporale: "#5b6470",
  neve: "#eef1f4",
  nebbia: "#f1efe7",
};

const QUANTE_NUVOLE: Record<Cielo, number> = { sole: 2, nuvole: 5, pioggia: 6, temporale: 6, neve: 5, nebbia: 2 };

/** Il momento della giornata, dall'ora locale della città (0-23). */
export function oraDelGiorno(meteo: Meteo, ora: number, stagione: Stagione): Ora {
  if (!meteo.giorno) return "notte";
  const finoAlba = { inverno: 9, autunno: 8, primavera: 7, estate: 7 }[stagione];
  const daTramonto = { inverno: 16, autunno: 17, primavera: 19, estate: 20 }[stagione];
  if (ora < finoAlba) return "alba";
  if (ora >= daTramonto) return "tramonto";
  return "giorno";
}

export interface Atmosfera {
  variabili: Record<string, string>;
  nuvole: number;
  temporale: boolean;
}

export function atmosfera(meteo: Meteo, ora: Ora, stagione: Stagione): Atmosfera {
  const notte = ora === "notte";
  const c = meteo.cielo;
  const bagnato = c === "pioggia" || c === "temporale";
  const neve = c === "neve";

  const [c1, c2, c3] = c === "sole" ? CIELO_SERENO[ora] : CIELO_METEO[c][notte ? "notte" : "giorno"];
  const [lontane, vicine, prato, ombra] = neve ? COLLINE_NEVE : COLLINE[stagione];

  let luce = "#ffffff";
  let oLuce = 0;
  if (notte) {
    luce = "#2a3d70";
    oLuce = bagnato ? 0.56 : 0.46;
  } else if (ora === "tramonto") {
    luce = c === "sole" ? "#f0a06c" : "#c98d78";
    oLuce = 0.3;
  } else if (ora === "alba") {
    luce = "#f4c2ae";
    oLuce = c === "sole" ? 0.24 : 0.14;
  } else if (bagnato) {
    luce = "#7d8b9a";
    oLuce = c === "temporale" ? 0.38 : 0.24;
  } else if (c === "nuvole" || c === "nebbia") {
    luce = "#c7cdd1";
    oLuce = 0.12;
  }

  const sole = notte ? 0 : c === "sole" ? 1 : c === "nuvole" ? 0.45 : 0;
  const luna = notte ? (c === "sole" ? 1 : bagnato ? 0 : 0.5) : 0;
  const stelle = notte ? ({ sole: 1, nuvole: 0.35, neve: 0.25, nebbia: 0.15, pioggia: 0, temporale: 0 } as const)[c] : 0;
  const verde = stagione === "primavera" || stagione === "estate";

  const variabili: Record<string, string> = {
    "--cielo-1": c1,
    "--cielo-2": c2,
    "--cielo-3": c3,
    "--luce": luce,
    "--nebbia": notte ? "#5d6a84" : "#f2efe6",
    "--o-luce": String(oLuce),
    "--collina-1": lontane,
    "--collina-2": vicine,
    "--prato": prato,
    "--prato-ombra": ombra,
    "--nuvola": c === "sole" ? NUVOLE[ora] : notte ? NUVOLE.notte : NUVOLE[c],
    "--o-nuvole": notte ? "0.7" : "0.95",
    "--sole-colore": ora === "tramonto" ? "#f28a4c" : ora === "alba" ? "#f9b46e" : "#f8cd4a",
    "--sole-angolo": { alba: "-42deg", giorno: "24deg", tramonto: "56deg", notte: "120deg" }[ora],
    "--o-sole": String(sole),
    "--luna-angolo": notte ? "28deg" : "-120deg",
    "--o-luna": String(luna),
    "--o-stelle": String(stelle),
    "--o-pioggia": c === "temporale" ? "1" : c === "pioggia" ? "0.85" : "0",
    "--o-neve": neve ? "1" : "0",
    "--o-nebbia": c === "nebbia" ? "0.9" : bagnato ? "0.25" : "0",
    "--o-lucciole": notte && !bagnato && !neve && stagione !== "inverno" ? "1" : "0",
    "--o-polline": !notte && verde && (c === "sole" || c === "nuvole") ? "1" : "0",
    "--o-foglie": !notte && stagione === "autunno" && !neve ? "1" : "0",
    "--o-fiori": verde && !neve ? "1" : "0",
    "--o-pozzanghere": bagnato ? "1" : "0",
  };

  return { variabili, nuvole: QUANTE_NUVOLE[c], temporale: c === "temporale" };
}
