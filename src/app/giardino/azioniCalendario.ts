"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rispondiBuongiorno } from "@/lib/motore/servizio";
import { createClient, getUtente } from "@/lib/supabase/server";
import type { Esito } from "./actions";

// La risposta al buongiorno. Come in actions.ts: l'azione ricontrolla che
// l'albero sia della persona collegata. («Mattina» e «Fine settimana» della
// demo stanno in azioneDemo, actions.ts.)

async function alberoDellaPersona() {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const supabase = await createClient();
  const { data } = await supabase.from("trees").select("id, name").eq("owner_id", utente.id).maybeSingle();
  if (!data) redirect("/pianta");
  return data;
}

/** La persona risponde alla domanda del mattino con un tocco. */
export async function rispondiAlBuongiorno(_prima: Esito, form: FormData): Promise<Esito> {
  const albero = await alberoDellaPersona();
  try {
    const r = await rispondiBuongiorno(albero.id, Number(form.get("giorno")), String(form.get("risposta") ?? ""));
    revalidatePath("/giardino");
    return { ok: true, messaggio: `Risposta data: «${r.risposta}».` };
  } catch (e) {
    return { ok: false, messaggio: e instanceof Error ? e.message : "Qualcosa è andato storto." };
  }
}
