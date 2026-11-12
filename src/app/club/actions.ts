"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { daiConsenso, isEtichetta, preparaEsempi, revocaConsenso, togliEsempi } from "@/lib/club";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUtente } from "@/lib/supabase/server";

export interface EsitoClub {
  ok?: string;
  errore?: string;
}

/** Comparire o no nella foresta del club, e che cosa si vede della persona. */
export async function azioneConsenso(_prima: EsitoClub, form: FormData): Promise<EsitoClub> {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const cosa = String(form.get("cosa") ?? "");
  const etichetta = form.get("persona");
  try {
    const admin = createAdminClient();
    if (cosa === "revoca") {
      await revocaConsenso(admin, utente.id);
      revalidatePath("/club");
      return { ok: "Fatto: il tuo albero non compare più nella foresta del club." };
    }
    if (cosa === "dai") {
      await daiConsenso(admin, utente.id, isEtichetta(etichetta) ? etichetta : "nessuno");
      revalidatePath("/club");
      return { ok: "Fatto: il tuo albero compare nella foresta del club." };
    }
    return { errore: "Scelta non valida." };
  } catch (e) {
    console.error(e);
    return { errore: "Non è andata: riprova tra poco." };
  }
}

/** Strumento della demo: alberi d'esempio, segnati come tali (mai persone vere). */
export async function azioneEsempi(_prima: EsitoClub, form: FormData): Promise<EsitoClub> {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const quanti = Number(form.get("quanti"));
  try {
    const admin = createAdminClient();
    if (quanti === 0) {
      await togliEsempi(admin);
      revalidatePath("/club");
      return { ok: "Esempi tolti: restano solo gli alberi veri." };
    }
    if (![100, 300, 1000].includes(quanti)) return { errore: "Numero non previsto." };
    await preparaEsempi(admin, quanti);
    revalidatePath("/club");
    return { ok: `Pronti ${quanti} alberi d'esempio.` };
  } catch (e) {
    console.error(e);
    return { errore: "Non è andata: riprova tra poco." };
  }
}
