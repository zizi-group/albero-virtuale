import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fontModerna } from "@/components/fontModerna";
import { stagioneDa } from "@/lib/albero/tipi";
import { etichettaPersona, leggiConsenso, leggiContatori, leggiForesta } from "@/lib/club";
import { createClient, getUtente } from "@/lib/supabase/server";
import { ForestaClub } from "./ForestaClub";
import "./club.css";

export const metadata: Metadata = { title: "La foresta del club — Linfa" };

export default async function PaginaClub({ searchParams }: PageProps<"/club">) {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const supabase = await createClient();
  // RLS: la persona legge solo i suoi alberi. Quelli degli altri arrivano dalla vista.
  const { data: miei } = await supabase.from("trees").select("id, name, owner_name").eq("owner_id", utente.id).order("planted_at");
  if (!miei?.length) redirect("/pianta");

  const [alberi, contatori, consenso] = await Promise.all([
    leggiForesta(
      supabase,
      miei.map((a) => a.id),
    ),
    leggiContatori(supabase),
    leggiConsenso(supabase, utente.id),
  ]);
  const { misura } = await searchParams;
  const primo = miei[0];

  return (
    <main id="contenuto" className={`flex-1 ${fontModerna.variable}`}>
      <ForestaClub
        alberi={alberi}
        contatori={contatori}
        consenso={consenso}
        nomeAlbero={primo.name}
        anteprime={{
          nessuno: null,
          iniziali: etichettaPersona(primo.owner_name, "iniziali"),
          nome: etichettaPersona(primo.owner_name, "nome"),
        }}
        stagione={stagioneDa(new Date())}
        misura={misura === "1"}
      />
    </main>
  );
}
