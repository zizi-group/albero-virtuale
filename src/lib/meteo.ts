import type { Cielo, Meteo } from "./albero/tipi";

// Meteo vero da Open-Meteo: gratuito e senza chiave.
// Si inviano solo il nome della città (per trovarla) e le coordinate.

const GEO = "https://geocoding-api.open-meteo.com/v1/search";
const PREVISIONI = "https://api.open-meteo.com/v1/forecast";

export interface Luogo {
  citta: string;
  latitudine: number;
  longitudine: number;
  fusoOrario: string;
  paese?: string;
}

export async function cercaCitta(nome: string): Promise<Luogo | null> {
  const url = `${GEO}?name=${encodeURIComponent(nome.trim())}&count=1&language=it&format=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const dati = (await res.json()) as {
    results?: { name: string; latitude: number; longitude: number; timezone: string; country?: string }[];
  };
  const r = dati.results?.[0];
  if (!r) return null;
  return {
    citta: r.name,
    latitudine: r.latitude,
    longitudine: r.longitude,
    fusoOrario: r.timezone || "Europe/Rome",
    paese: r.country,
  };
}

/** Codici meteo WMO → cielo di Linfa. */
export function cieloDaCodice(codice: number): Cielo {
  if (codice === 0 || codice === 1) return "sole";
  if (codice === 2 || codice === 3) return "nuvole";
  if (codice === 45 || codice === 48) return "nebbia";
  if ((codice >= 71 && codice <= 77) || codice === 85 || codice === 86) return "neve";
  if (codice >= 95) return "temporale";
  if ((codice >= 51 && codice <= 67) || (codice >= 80 && codice <= 82)) return "pioggia";
  return "nuvole";
}

const PAROLE: Record<Cielo, string> = {
  sole: "sole",
  nuvole: "cielo nuvoloso",
  pioggia: "pioggia",
  temporale: "temporale",
  neve: "neve",
  nebbia: "nebbia",
};

export function descrivi(cielo: Cielo, temperatura: number, giorno = true): string {
  const base = !giorno && cielo === "sole" ? "cielo sereno" : PAROLE[cielo];
  return `${base}, ${temperatura}°`;
}

/** Il meteo di adesso nella città dell'albero (ricontrollato al massimo ogni 10 minuti). */
export async function meteoAttuale(lat: number, lon: number): Promise<Meteo | null> {
  const url = `${PREVISIONI}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`;
  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    const d = (await res.json()) as {
      current?: { temperature_2m: number; weather_code: number; is_day: number };
    };
    if (!d.current) return null;
    const cielo = cieloDaCodice(d.current.weather_code);
    const temperatura = Math.round(d.current.temperature_2m);
    const giorno = d.current.is_day === 1;
    return { cielo, temperatura, giorno, descrizione: descrivi(cielo, temperatura, giorno) };
  } catch {
    return null;
  }
}

export interface MeteoGiorno extends Meteo {
  data: string; // AAAA-MM-GG
  minima: number;
  massima: number;
}

/** Previsioni giornaliere fino a 16 giorni: servono per i giorni che passano. */
export async function previsioni(lat: number, lon: number, giorni = 16): Promise<MeteoGiorno[]> {
  const url = `${PREVISIONI}?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=${giorni}&timezone=auto`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const d = (await res.json()) as {
      daily?: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
    };
    if (!d.daily) return [];
    return d.daily.time.map((data, i) => {
      const cielo = cieloDaCodice(d.daily!.weather_code[i]);
      const massima = Math.round(d.daily!.temperature_2m_max[i]);
      const minima = Math.round(d.daily!.temperature_2m_min[i]);
      const temperatura = Math.round((massima * 2 + minima) / 3);
      return { data, cielo, temperatura, massima, minima, giorno: true, descrizione: `${PAROLE[cielo]}, tra ${minima}° e ${massima}°` };
    });
  } catch {
    return [];
  }
}

/** Meteo di prova per la demo (?meteo=…). */
export function meteoDiProva(tipo: string | undefined): Meteo | null {
  switch (tipo) {
    case "sole":
      return { cielo: "sole", temperatura: 24, giorno: true, descrizione: "sole, 24° (prova)" };
    case "pioggia":
      return { cielo: "pioggia", temperatura: 14, giorno: true, descrizione: "pioggia, 14° (prova)" };
    case "freddo":
      return { cielo: "nuvole", temperatura: 3, giorno: true, descrizione: "cielo nuvoloso, 3° (prova)" };
    case "neve":
      return { cielo: "neve", temperatura: -1, giorno: true, descrizione: "neve, -1° (prova)" };
    case "notte":
      return { cielo: "sole", temperatura: 9, giorno: false, descrizione: "cielo sereno, 9° (prova)" };
    case "temporale":
      return { cielo: "temporale", temperatura: 17, giorno: true, descrizione: "temporale, 17° (prova)" };
    case "caldo":
      return { cielo: "sole", temperatura: 33, giorno: true, descrizione: "sole e caldo, 33° (prova)" };
    case "nebbia":
      return { cielo: "nebbia", temperatura: 8, giorno: true, descrizione: "nebbia, 8° (prova)" };
    case "nuvole":
      return { cielo: "nuvole", temperatura: 15, giorno: true, descrizione: "cielo nuvoloso, 15° (prova)" };
    default:
      return null;
  }
}

/** La data di oggi (AAAA-MM-GG) nel fuso orario della città. */
export function oggiNelFuso(fuso: string, data = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: fuso, year: "numeric", month: "2-digit", day: "2-digit" }).format(data);
}
