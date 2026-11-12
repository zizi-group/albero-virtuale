"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { alberoScelto } from "@/lib/alberi";
import { cambiaPacchettoConto, festeggiaStanze, rinominaStanza, simulaRinnovo, traslocaAlbero } from "@/lib/motore/stanze";
import { NOMI_PACCHETTO_CONTO } from "@/lib/stanze";
import type { Esito } from "./actions";

// Le stanze (fase 5): trasloco, nome sul cartello, festa, e gli strumenti della
// demo per pacchetto e rinnovi. Ogni azione ricontrolla la persona collegata;
// le funzioni in src/lib/motore/stanze.ts verificano che stanze e alberi siano suoi.

const errore = (e: unknown): Esito => ({ ok: false, messaggio: e instanceof Error ? e.message : "Qualcosa è andato storto." });

const stanzeAperte = (n: number) => (n === 1 ? "Si è aperta una stanza nuova!" : `Si sono aperte ${n} stanze nuove!`);

/** Sposta un albero in un'altra stanza. */
export async function trasloca(_prima: Esito, form: FormData): Promise<Esito> {
  const { utente } = await alberoScelto();
  try {
    const r = await traslocaAlbero(utente.id, String(form.get("albero") ?? ""), String(form.get("stanza") ?? ""));
    revalidatePath("/giardino");
    return { ok: true, messaggio: `${r.albero} ha traslocato in «${r.stanza}».` };
  } catch (e) {
    return errore(e);
  }
}

/** Il nome sul cartello della stanza. */
export async function rinomina(_prima: Esito, form: FormData): Promise<Esito> {
  const { utente } = await alberoScelto();
  try {
    const nome = await rinominaStanza(utente.id, String(form.get("stanza") ?? ""), String(form.get("nome") ?? ""));
    revalidatePath("/giardino");
    return { ok: true, messaggio: `Ora il cartello dice «${nome}».` };
  } catch (e) {
    return errore(e);
  }
}

/** La festa per le stanze nuove è stata vista: si torna al giardino (o si entra nella stanza nuova). */
export async function festeggia(form: FormData) {
  const { utente } = await alberoScelto();
  await festeggiaStanze(utente.id);
  revalidatePath("/giardino");
  const vai = String(form.get("vai") ?? "");
  redirect(vai.startsWith("/giardino") ? vai : "/giardino");
}

/** Strumenti della demo: pacchetto nuovo (Albero, Famiglia, Foresta) e rinnovo. */
export async function demoStanze(_prima: Esito, form: FormData): Promise<Esito> {
  const { utente } = await alberoScelto();
  try {
    if (form.get("cosa") === "rinnovo") {
      const r = await simulaRinnovo(utente.id);
      revalidatePath("/giardino");
      return {
        ok: true,
        messaggio: `Rinnovo n. ${r.rinnovi} registrato. ${r.nuove.length ? stanzeAperte(r.nuove.length) : "Le stanze sono già al massimo."} Demo: nessun pagamento.`,
      };
    }
    const r = await cambiaPacchettoConto(utente.id, String(form.get("pacchetto") ?? ""));
    revalidatePath("/giardino");
    return {
      ok: true,
      messaggio: `Ora hai il pacchetto ${NOMI_PACCHETTO_CONTO[r.pacchetto]}.${r.nuove.length ? ` ${stanzeAperte(r.nuove.length)}` : ""} Demo: nessun pagamento.`,
    };
  } catch (e) {
    return errore(e);
  }
}
