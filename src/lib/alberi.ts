import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_ALBERO } from "./stanze";
import { createClient, getUtente } from "./supabase/server";

// Più alberi per persona (docs/stanze-e-vita.md, fase 5): quale albero si sta
// guardando. Il giardino lo sceglie con `?albero=<id>` e lo ricorda nel cookie
// `linfa-albero` (lo scrive RicordaAlbero nel browser); le azioni del server
// leggono il cookie. Senza scelta, o se l'albero non è della persona, vale il
// primo piantato. La lettura passa da RLS: si vedono solo i propri alberi.

export { COOKIE_ALBERO };

/** La persona collegata, i suoi alberi (dal primo piantato) e quello scelto. Null se non ne ha. */
export async function alberiDellaPersona(richiesto?: string | null) {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const supabase = await createClient();
  const { data } = await supabase.from("trees").select("*").eq("owner_id", utente.id).order("planted_at", { ascending: true });
  const alberi = data ?? [];
  if (!alberi.length) return { utente, supabase, alberi, albero: null };
  const ricordato = richiesto ?? (await cookies()).get(COOKIE_ALBERO)?.value;
  const albero = alberi.find((a) => a.id === ricordato) ?? alberi[0];
  return { utente, supabase, alberi, albero };
}

/** Come sopra, ma senza alberi si va a piantarne uno. */
export async function alberoScelto(richiesto?: string | null) {
  const r = await alberiDellaPersona(richiesto);
  if (!r.albero) redirect("/pianta");
  return { ...r, albero: r.albero };
}
