import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { oraDelGiorno } from "@/components/ambiente/atmosfera";
import { stagioneDa, type Meteo } from "@/lib/albero/tipi";
import { meteoDiProva, oggiNelFuso } from "@/lib/meteo";
import type { Database } from "@/lib/supabase/database.types";
import { ALBERI_PER_STANZA, regolaPerAprire, STANZE_MASSIME, stanzeAperte } from "./regole";
import type { AlberoForesta, DatiForesta, StanzaBloccata, StanzaForesta } from "./tipi";

// L'adattatore della tua foresta: dal database ai dati della vista d'insieme.
//
// Oggi (0.1.2) nel database c'è un albero per persona e non ci sono stanze:
// l'albero vive nella stanza 1, «La radura di <nome>». Quando la fase 5 aggiunge
// `rooms` e `trees.room_id`, cambia solo `stanzeDaAlberi` (e la lettura delle
// stanze): la pagina e il motore 3D restano uguali.
//
// Le stanze d'esempio della demo (`esempi: true`) servono a vedere la foresta
// piena: sono segnate come tali e non entrano mai nei numeri.

type Client = SupabaseClient<Database>;
type RigaAlbero = Database["public"]["Tables"]["trees"]["Row"];

/** Quante radure chiuse si mostrano dopo quelle aperte (le prossime da conquistare). */
const BLOCCATE_VISIBILI = 2;

function versoForesta(a: RigaAlbero): AlberoForesta {
  return { id: a.id, nome: a.name, seme: a.id, strada: a.path, giorni: a.day_count, umore: a.mood };
}

/** Oggi: tutti gli alberi nella stanza 1 (con la fase 5: raggruppati per `room_id`). */
function stanzeDaAlberi(alberi: RigaAlbero[]): StanzaForesta[] {
  const principale = alberi[0];
  return [
    {
      id: "1",
      numero: 1,
      nome: `La radura di ${principale.name}`,
      alberi: alberi.slice(0, ALBERI_PER_STANZA).map(versoForesta),
    },
  ];
}

// Gli esempi della demo: nomi e strade dei compagni del giardino 3D.
const ESEMPI: { nome: string; alberi: [string, string][] }[] = [
  { nome: "Il prato dei curiosi", alberi: [["Ulivetta", "artista"], ["Betta", "sportivo"]] },
  { nome: "Il boschetto dei sognatori", alberi: [["Rovere", "filosofo"], ["Pinolo", "viaggiatore"], ["Ciliegina", "poeta"]] },
  { nome: "La tana della banda", alberi: [["Don Ghianda", "furfante"], ["Nocciolo", "imprenditore"], ["Salice", "poeta"], ["Acerina", "artista"]] },
];

// Con `pieno` la foresta più grande possibile: 10 stanze da 4 alberi (prova delle prestazioni).
const NOMI_PIENO = ["Il colle", "La conca", "Il ruscello", "La fonte", "Il poggio", "La piana"];
const STRADE = ["filosofo", "imprenditore", "artista", "sportivo", "furfante", "viaggiatore", "poeta"];
function esempiPieni(quante: number): typeof ESEMPI {
  const nomi = ESEMPI.flatMap((s) => s.alberi.map(([n]) => n));
  return Array.from({ length: quante }, (_, i) => ({
    nome: i < ESEMPI.length ? ESEMPI[i].nome : NOMI_PIENO[(i - ESEMPI.length) % NOMI_PIENO.length],
    alberi: Array.from({ length: 4 }, (_, j): [string, string] => [nomi[(i * 4 + j) % nomi.length], STRADE[(i * 3 + j) % STRADE.length]]),
  }));
}

function stanzeDiEsempio(da: number, idBase: string, giorni: number, pieno: boolean): StanzaForesta[] {
  return (pieno ? esempiPieni(STANZE_MASSIME - da + 1) : ESEMPI).map((s, i) => ({
    id: `esempio-${i + 1}`,
    numero: da + i,
    nome: s.nome,
    esempio: true,
    alberi: s.alberi.map(([nome, strada], j) => ({
      id: `esempio-${i + 1}-${j + 1}`,
      nome,
      seme: `${idBase}-esempio-${i}-${j}`,
      strada,
      giorni: Math.max(10, giorni - j * 20),
      umore: "curioso",
      esempio: true,
    })),
  }));
}

/**
 * Legge la foresta della persona. `null` se non ha ancora un albero.
 * @param esempi aggiunge le stanze d'esempio della demo (strumento di prova); "pieno": fino a 10 stanze da 4
 * @param meteo meteo di prova (`?meteo=` come nel giardino)
 */
export async function leggiForesta(supabase: Client, idUtente: string, op: { esempi?: boolean | "pieno"; meteo?: string } = {}): Promise<DatiForesta | null> {
  const { data: alberi } = await supabase.from("trees").select("*").eq("owner_id", idUtente).order("planted_at", { ascending: true });
  if (!alberi?.length) return null;
  const ids = alberi.map((a) => a.id);

  const [lettere, sbloccati] = await Promise.all([
    supabase.from("letters").select("id", { count: "exact", head: true }).in("tree_id", ids),
    supabase.from("unlocks").select("item", { count: "exact", head: true }).in("tree_id", ids),
  ]);

  const principale = alberi[0];
  const piantati = alberi.length;
  const aperte = stanzeAperte(principale.plan, piantati);
  let stanze = stanzeDaAlberi(alberi);
  if (op.esempi) stanze = [...stanze, ...stanzeDiEsempio(stanze.length + 1, principale.id, principale.day_count, op.esempi === "pieno")].slice(0, STANZE_MASSIME);

  const daBloccare = Math.min(BLOCCATE_VISIBILI, STANZE_MASSIME - stanze.length, STANZE_MASSIME - aperte);
  const bloccate: StanzaBloccata[] = Array.from({ length: Math.max(0, daBloccare) }, (_, i) => {
    // Le stanze d'esempio non contano: la prossima da aprire è sempre quella vera.
    const numero = aperte + 1 + i;
    return { numero, regola: regolaPerAprire(numero, principale.plan, piantati) };
  });

  // Luce e stagione della città dell'albero principale (come il giardino).
  const meteo: Meteo = meteoDiProva(op.meteo) ?? (principale.last_weather as Meteo | null) ?? { cielo: "nuvole", temperatura: 15, giorno: true, descrizione: "cielo nuvoloso" };
  const stagione = stagioneDa(new Date(`${oggiNelFuso(principale.timezone)}T12:00:00`));
  const oraLocale = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: principale.timezone }).format(new Date()));
  const ora = meteoDiProva(op.meteo) ? (meteo.giorno ? "giorno" : "notte") : oraDelGiorno(meteo, oraLocale, stagione);

  return {
    stanze,
    bloccate,
    numeri: {
      alberiPiantati: piantati,
      giorniVissuti: alberi.reduce((s, a) => s + a.day_count, 0),
      lettereRicevute: lettere.count ?? 0,
      oggettiSbloccati: sbloccati.count ?? 0,
      stanzeAperte: aperte,
      stanzeMassime: STANZE_MASSIME,
      // Nessuna tabella per gli alberi veri, per ora: il pannello scrive «in arrivo».
      alberiVeri: null,
    },
    ora,
    stagione,
    cielo: meteo.cielo,
  };
}
