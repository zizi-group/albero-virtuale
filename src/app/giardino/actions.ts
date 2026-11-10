"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { INFO_STRADE } from "@/lib/albero/strade";
import { faiPassareGiorni, rispondiAllaPersona, scriviEInviaLettera } from "@/lib/motore/servizio";
import { createClient, getUtente } from "@/lib/supabase/server";

export interface Esito {
  ok?: boolean;
  messaggio?: string;
}

/** L'albero della persona collegata: ogni azione lo ricontrolla da sé. */
async function alberoDellaPersona() {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const supabase = await createClient();
  const { data } = await supabase.from("trees").select("id, name").eq("owner_id", utente.id).maybeSingle();
  if (!data) redirect("/pianta");
  return data;
}

const errore = (e: unknown): Esito => ({
  ok: false,
  messaggio: e instanceof Error ? e.message : "Qualcosa è andato storto.",
});

/** Strumenti della demo: far passare i giorni o chiedere la lettera del mese. */
export async function azioneDemo(_prima: Esito, form: FormData): Promise<Esito> {
  const albero = await alberoDellaPersona();
  try {
    if (form.get("cosa") === "lettera") {
      const l = await scriviEInviaLettera(albero.id, "mensile");
      revalidatePath("/giardino");
      return { ok: true, messaggio: `${albero.name} ti ha scritto: «${l.subject}». La trovi qui sotto e nella casella di prova.` };
    }
    const r = await faiPassareGiorni(albero.id, Number(form.get("giorni") ?? 1));
    revalidatePath("/giardino");
    let messaggio =
      r.vissuti === 1
        ? `È passato un giorno: ${albero.name} è al giorno ${r.giorni}.`
        : `Sono passati ${r.vissuti} giorni: ${albero.name} è al giorno ${r.giorni}.`;
    if (r.rivelata) messaggio += ` Ha capito chi è: ${INFO_STRADE[r.rivelata].nome.toLowerCase()}!`;
    if (r.lettera) messaggio += " Ti ha scritto una lettera.";
    return { ok: true, messaggio };
  } catch (e) {
    return errore(e);
  }
}

export async function inviaMessaggio(_prima: Esito, form: FormData): Promise<Esito> {
  const albero = await alberoDellaPersona();
  const testo = String(form.get("testo") ?? "").trim();
  if (!testo) return { ok: false, messaggio: "Scrivi qualcosa prima di spedire." };
  try {
    await rispondiAllaPersona(albero.id, testo);
    revalidatePath("/giardino");
    return { ok: true };
  } catch (e) {
    revalidatePath("/giardino");
    return errore(e);
  }
}
