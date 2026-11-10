"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NOMI_USO } from "@/lib/albero/regali";
import { INFO_STRADE } from "@/lib/albero/strade";
import { apriNuovoMese, cambiaPacchetto, faiRegaloDelMese } from "@/lib/motore/extra";
import { faiPassareGiorni, rispondiAllaPersona, scriviEInviaLettera } from "@/lib/motore/servizio";
import { NOMI_PACCHETTO } from "@/lib/piani";
import { createClient, getUtente } from "@/lib/supabase/server";

export interface Esito {
  ok?: boolean;
  messaggio?: string;
  /** Una pagina da aprire dopo (la lettera appena scritta, il riepilogo del mese). */
  link?: { href: string; testo: string };
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

/** Strumenti della demo: giorni, lettera del mese, inizio mese, pacchetto. */
export async function azioneDemo(_prima: Esito, form: FormData): Promise<Esito> {
  const albero = await alberoDellaPersona();
  try {
    if (form.get("cosa") === "pacchetto") {
      const piano = await cambiaPacchetto(albero.id, String(form.get("piano") ?? ""));
      revalidatePath("/giardino", "layout");
      return { ok: true, messaggio: `Ora ${albero.name} ha il pacchetto ${NOMI_PACCHETTO[piano]}. Demo: nessun pagamento.` };
    }
    if (form.get("cosa") === "mese") {
      const m = await apriNuovoMese(albero.id);
      revalidatePath("/giardino", "layout");
      return {
        ok: true,
        messaggio: `Comincia il mese ${m.nuovo}. Il mese ${m.chiuso} (${m.giorni} giorni) si intitola «${m.titolo}».`,
        link: { href: `/giardino/mese/${m.chiuso}`, testo: `Apri il riepilogo del mese ${m.chiuso}` },
      };
    }
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

/** Il regalo del mese (Premium): l'albero risponde con una lettera. */
export async function faiRegalo(_prima: Esito, form: FormData): Promise<Esito> {
  const albero = await alberoDellaPersona();
  try {
    const r = await faiRegaloDelMese(albero.id, String(form.get("regalo") ?? ""));
    revalidatePath("/giardino", "layout");
    return {
      ok: true,
      messaggio: `${albero.name} ha scartato ${r.regalo.articolo}. ${NOMI_USO[r.uso]}: ${r.come}`,
      link: { href: `/giardino/lettere/${r.lettera.id}`, testo: "Leggi la sua lettera" },
    };
  } catch (e) {
    return errore(e);
  }
}
