import "server-only";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// La foresta del club (docs/stanze-e-vita.md, 1.3 e 14). Le letture degli
// alberi degli altri passano solo dalla vista club_forest (campi pubblici);
// consenso ed esempi si scrivono solo dal server con la chiave segreta.

export type EtichettaPersona = "nessuno" | "iniziali" | "nome";
export const ETICHETTE: EtichettaPersona[] = ["nessuno", "iniziali", "nome"];
export const isEtichetta = (x: unknown): x is EtichettaPersona => ETICHETTE.includes(x as EtichettaPersona);

export interface AlberoDelClub {
  seme: string;
  modello: number;
  nome: string;
  persona: string | null;
  crescita: number;
  x: number;
  z: number;
  esempio: boolean;
  mio: boolean;
}

export interface Contatori {
  /** Alberi veri piantati nel club (tutti, anche chi non compare). */
  alberi: number;
  /** Alberi veri piantati questo mese (ora italiana). */
  questoMese: number;
  /** Alberi veri che compaiono nella foresta (con il consenso). */
  inForesta: number;
  /** Alberi d'esempio della demo. */
  esempi: number;
}

export interface Consenso {
  attivo: boolean;
  etichetta: EtichettaPersona;
  dal: string | null;
  revocatoIl: string | null;
}

type Client = SupabaseClient<Database>;

/** Il seme pubblico di un albero: lo stesso che calcola la vista (md5). */
export const semeClub = (id: string) => createHash("md5").update(`linfa-club:${id}`).digest("hex");

/** Che cosa vedono gli altri della persona: la stessa regola della vista. */
export function etichettaPersona(nomePersona: string | null, etichetta: EtichettaPersona): string | null {
  const parole = (nomePersona ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parole.length || etichetta === "nessuno") return null;
  if (etichetta === "nome") return parole[0];
  return parole.map((p) => `${p[0].toUpperCase()}.`).join(" ");
}

/** Tutti gli alberi della foresta, a pagine da 1000 (il limite di PostgREST). */
export async function leggiForesta(supabase: Client, mieiId: string[]): Promise<AlberoDelClub[]> {
  const miei = new Set(mieiId.map(semeClub));
  const righe: AlberoDelClub[] = [];
  const PAGINA = 1000;
  for (let da = 0; ; da += PAGINA) {
    const { data, error } = await supabase
      .from("club_forest")
      .select("seme, modello, nome, persona, crescita, x, z, esempio")
      .order("seme")
      .range(da, da + PAGINA - 1);
    if (error) throw new Error(`Foresta del club: ${error.message}`);
    for (const r of data ?? []) {
      if (!r.seme || r.nome == null || r.x == null || r.z == null) continue;
      righe.push({
        seme: r.seme,
        modello: r.modello ?? 0,
        nome: r.nome,
        persona: r.persona,
        crescita: r.crescita ?? 0,
        x: r.x,
        z: r.z,
        esempio: !!r.esempio,
        mio: miei.has(r.seme),
      });
    }
    if (!data || data.length < PAGINA) break;
  }
  return righe;
}

export async function leggiContatori(supabase: Client): Promise<Contatori> {
  const { data, error } = await supabase.rpc("club_contatori");
  if (error) throw new Error(`Contatori del club: ${error.message}`);
  const r = data?.[0];
  return { alberi: r?.alberi ?? 0, questoMese: r?.questo_mese ?? 0, inForesta: r?.in_foresta ?? 0, esempi: r?.esempi ?? 0 };
}

export async function leggiConsenso(supabase: Client, ownerId: string): Promise<Consenso> {
  const { data } = await supabase.from("club_consent").select("owner_label, granted_at, revoked_at").eq("owner_id", ownerId).maybeSingle();
  if (!data) return { attivo: false, etichetta: "nessuno", dal: null, revocatoIl: null };
  return {
    attivo: !data.revoked_at,
    etichetta: isEtichetta(data.owner_label) ? data.owner_label : "nessuno",
    dal: data.granted_at,
    revocatoIl: data.revoked_at,
  };
}

/**
 * Dà o aggiorna il consenso (admin: le scritture solo dal server).
 * Se era revocato, riparte con la data di oggi.
 */
export async function daiConsenso(admin: Client, ownerId: string, etichetta: EtichettaPersona) {
  const { data: prima } = await admin.from("club_consent").select("revoked_at, granted_at").eq("owner_id", ownerId).maybeSingle();
  const adesso = new Date().toISOString();
  const nuovo = !prima || !!prima.revoked_at;
  const { error } = await admin.from("club_consent").upsert({
    owner_id: ownerId,
    owner_label: etichetta,
    granted_at: nuovo ? adesso : prima.granted_at,
    revoked_at: null,
    updated_at: adesso,
  });
  if (error) throw new Error(`Consenso del club: ${error.message}`);
}

/** Revoca: l'albero sparisce subito dalla vista; resta la data della revoca. */
export async function revocaConsenso(admin: Client, ownerId: string) {
  const adesso = new Date().toISOString();
  const { error } = await admin.from("club_consent").update({ revoked_at: adesso, updated_at: adesso }).eq("owner_id", ownerId).is("revoked_at", null);
  if (error) throw new Error(`Revoca del club: ${error.message}`);
}

// ------------------------------------------------------------ Esempi della demo

/** Nomi d'albero inventati per gli esempi: nessuna persona, nessun marchio. */
const NOMI_ESEMPIO = [
  "Ghiandino", "Fogliolina", "Rametto", "Muschio", "Resinella", "Pigna", "Bacca", "Frondoso", "Corteccino", "Rugiada",
  "Germoglio", "Linfetta", "Radichetta", "Ombretta", "Venticello", "Scoiattolo", "Castagnola", "Faggiolo", "Ramingo", "Fruscio",
  "Brezza", "Tronchetto", "Nocciolino", "Sottobosco", "Pinolo", "Cipressino", "Gemma", "Fiorellino", "Stelo", "Felce",
  "Nuvoletta", "Lucciola", "Grillo", "Trifoglio", "Sassolino", "Torrente", "Collina", "Tramonto", "Aurora", "Piumino",
];

/**
 * Porta gli alberi d'esempio a `quanti` (toglie i vecchi e ne crea di nuovi).
 * Sono nella tabella club_examples, mai in trees: non sono persone né alberi veri.
 */
export async function preparaEsempi(admin: Client, quanti: number) {
  await togliEsempi(admin);
  const righe = Array.from({ length: quanti }, (_, i) => ({
    name: `${NOMI_ESEMPIO[i % NOMI_ESEMPIO.length]} ${Math.floor(i / NOMI_ESEMPIO.length) + 1}`,
    // età varia, così si vedono germogli e alberi grandi (non è un dato vero)
    day_count: Math.floor(((i * 7919) % 1000) / 1000 * 140),
  }));
  for (let da = 0; da < righe.length; da += 500) {
    const { error } = await admin.from("club_examples").insert(righe.slice(da, da + 500));
    if (error) throw new Error(`Esempi del club: ${error.message}`);
  }
}

export async function togliEsempi(admin: Client) {
  const { error } = await admin.from("club_examples").delete().gte("created_at", "1970-01-01");
  if (error) throw new Error(`Esempi del club: ${error.message}`);
}
