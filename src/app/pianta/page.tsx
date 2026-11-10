import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Intestazione } from "@/components/Intestazione";
import { PIANI, type IdPiano } from "@/components/landing/Pacchetti";
import { createClient, getUtente } from "@/lib/supabase/server";
import { ModuloSemina } from "./ModuloSemina";

export const metadata: Metadata = { title: "Pianta il tuo albero — Linfa" };

export default async function PaginaSemina({ searchParams }: PageProps<"/pianta">) {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const supabase = await createClient();
  const { data: albero } = await supabase.from("trees").select("id").eq("owner_id", utente.id).maybeSingle();
  if (albero) redirect("/giardino");

  const { pacchetto } = await searchParams;
  const scelto = typeof pacchetto === "string" && pacchetto in PIANI ? (pacchetto as IdPiano) : undefined;

  return (
    <>
      <Intestazione sopra="assoluta">
        <form action="/auth/esci" method="post">
          <button className="pillola">Esci</button>
        </form>
      </Intestazione>
      <main id="contenuto" className="flex-1">
        <ModuloSemina pacchetto={scelto} />
      </main>
    </>
  );
}
