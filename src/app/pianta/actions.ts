"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_ALBERO, alberiDellaPersona } from "@/lib/alberi";
import { cercaCitta } from "@/lib/meteo";
import { piantaAlbero } from "@/lib/motore/servizio";
import { dopoLaSemina, preparaSemina } from "@/lib/motore/stanze";

export interface StatoSemina {
  errore?: string;
}

const PIANI = ["albero", "premium-annuale", "premium-mensile"] as const;

export async function azioneSemina(_prima: StatoSemina, form: FormData): Promise<StatoSemina> {
  const { utente, alberi } = await alberiDellaPersona();
  // Un altro albero (fase 5): stesso piano degli altri, nella stanza chiesta o nella prima con posto.
  const altro = form.get("altro") === "1";
  if (alberi.length && !altro) redirect("/giardino");

  const nome = String(form.get("nome") ?? "").trim().slice(0, 40);
  const nomePersona = String(form.get("persona") ?? "").trim().slice(0, 40) || null;
  const citta = String(form.get("citta") ?? "").trim();
  const piano = alberi.length ? alberi[0].plan : String(form.get("piano") ?? "albero");

  if (!nome) return { errore: "Dai un nome al tuo albero." };
  if (!citta) return { errore: "In che città lo pianti? Serve per il suo meteo." };
  if (!(PIANI as readonly string[]).includes(piano)) return { errore: "Scegli un piano." };

  const luogo = await cercaCitta(citta);
  if (!luogo) return { errore: `Non trovo «${citta}». Prova con il nome di una città più grande vicina.` };

  let stanzaId: string;
  try {
    ({ stanzaId } = await preparaSemina(utente.id, String(form.get("stanza") ?? "") || null));
  } catch (e) {
    return { errore: e instanceof Error ? e.message : "Non c'è posto per un altro albero." };
  }

  const nato = await piantaAlbero({
    ownerId: utente.id,
    nome,
    nomePersona: nomePersona ?? alberi[0]?.owner_name ?? null,
    luogo,
    piano: piano as (typeof PIANI)[number],
    stanzaId,
  });
  // Un albero in più: può aprire una stanza (la festa la mostra il giardino).
  await dopoLaSemina(utente.id);
  (await cookies()).set(COOKIE_ALBERO, nato.id, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  redirect(alberi.length ? `/giardino?albero=${nato.id}&nuovo=1` : "/giardino?nuovo=1");
}
