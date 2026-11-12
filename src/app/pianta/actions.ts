"use server";

import { redirect } from "next/navigation";
import { daiConsenso, isEtichetta } from "@/lib/club";
import { cercaCitta } from "@/lib/meteo";
import { createAdminClient } from "@/lib/supabase/admin";
import { piantaAlbero } from "@/lib/motore/servizio";
import { createClient, getUtente } from "@/lib/supabase/server";

export interface StatoSemina {
  errore?: string;
}

const PIANI = ["albero", "premium-annuale", "premium-mensile"] as const;

export async function azioneSemina(_prima: StatoSemina, form: FormData): Promise<StatoSemina> {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");

  const supabase = await createClient();
  const { data: esistente } = await supabase.from("trees").select("id").eq("owner_id", utente.id).maybeSingle();
  if (esistente) redirect("/giardino");

  const nome = String(form.get("nome") ?? "").trim().slice(0, 40);
  const nomePersona = String(form.get("persona") ?? "").trim().slice(0, 40) || null;
  const citta = String(form.get("citta") ?? "").trim();
  const piano = String(form.get("piano") ?? "albero");

  if (!nome) return { errore: "Dai un nome al tuo albero." };
  if (!citta) return { errore: "In che città lo pianti? Serve per il suo meteo." };
  if (!(PIANI as readonly string[]).includes(piano)) return { errore: "Scegli un piano." };

  const luogo = await cercaCitta(citta);
  if (!luogo) return { errore: `Non trovo «${citta}». Prova con il nome di una città più grande vicina.` };

  await piantaAlbero({
    ownerId: utente.id,
    nome,
    nomePersona,
    luogo,
    piano: piano as (typeof PIANI)[number],
  });
  // La foresta del club: solo con il sì esplicito (casella non spuntata di partenza).
  if (form.get("club") === "si") {
    const etichetta = form.get("club_persona");
    try {
      await daiConsenso(createAdminClient(), utente.id, isEtichetta(etichetta) ? etichetta : "nessuno");
    } catch (e) {
      // l'albero è piantato: il consenso si può dare dopo da /club
      console.error(e);
    }
  }
  redirect("/giardino?nuovo=1");
}
