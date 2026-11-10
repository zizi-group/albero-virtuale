import { redirect } from "next/navigation";
import { createClient, getUtente } from "@/lib/supabase/server";

/** /giardino/mese: l'ultimo mese chiuso, o il mese in corso se non ce n'è ancora uno. */
export default async function UltimoMese() {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const supabase = await createClient();
  const { data: albero } = await supabase.from("trees").select("id").eq("owner_id", utente.id).maybeSingle();
  if (!albero) redirect("/pianta");
  const { data: mesi } = await supabase
    .from("tree_months")
    .select("number, closed_at")
    .eq("tree_id", albero.id)
    .order("number", { ascending: false });
  const scelto = (mesi ?? []).find((m) => m.closed_at) ?? mesi?.[0];
  redirect(`/giardino/mese/${scelto?.number ?? 1}`);
}
