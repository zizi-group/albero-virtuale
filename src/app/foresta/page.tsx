import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { leggiForesta } from "@/lib/foresta/dati";
import { createClient, getUtente } from "@/lib/supabase/server";
import { Foresta } from "./Foresta";
import "./foresta.css";

export const metadata: Metadata = { title: "La tua foresta — Linfa" };

// La tua foresta (docs/stanze-e-vita.md, 1.1): i tuoi alberi dall'alto, divisi
// nelle stanze. Tocchi un albero o una radura ed entri nella stanza 2D.
// `?esempi=1` aggiunge le stanze d'esempio della demo (`?esempi=pieno`: 10 stanze da 4 alberi); `?meteo=` come nel giardino;
// `?vista=mappa` forza il ripiego 2D.
export default async function PaginaForesta({ searchParams }: PageProps<"/foresta">) {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const parametri = await searchParams;
  const supabase = await createClient();
  const dati = await leggiForesta(supabase, utente.id, {
    esempi: parametri.esempi === "pieno" ? "pieno" : parametri.esempi === "1",
    meteo: typeof parametri.meteo === "string" ? parametri.meteo : undefined,
  });
  if (!dati) redirect("/pianta");
  return <Foresta dati={dati} soloMappa={parametri.vista === "mappa"} esempi={parametri.esempi === "1" || parametri.esempi === "pieno"} />;
}
