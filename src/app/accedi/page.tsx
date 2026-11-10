import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Albero } from "@/components/albero/Albero";
import { Ambiente } from "@/components/ambiente/Ambiente";
import { Intestazione } from "@/components/Intestazione";
import { accessoDemoAttivo } from "@/lib/accesso-demo";
import { azione } from "@/lib/albero/azioni";
import type { Meteo } from "@/lib/albero/tipi";
import { getUtente } from "@/lib/supabase/server";
import { ModuloAccesso } from "./ModuloAccesso";

export const metadata: Metadata = { title: "Entra — Linfa" };

const ERRORI: Record<string, string> = {
  link: "Il link è scaduto o è già stato usato. Chiedine uno nuovo.",
  demo: "L'accesso demo non è riuscito: controlla che Supabase sia acceso, oppure entra con l'email.",
};

const MATTINA: Meteo = { cielo: "sole", temperatura: 16, giorno: true, descrizione: "sole, 16°" };

export default async function PaginaAccesso({ searchParams }: PageProps<"/accedi">) {
  if (await getUtente()) redirect("/giardino");
  const { errore, email } = await searchParams;
  // Demo senza login: si entra subito con l'account di prova.
  // Con ?email si vede comunque il modulo del link magico.
  if (accessoDemoAttivo() && !errore && email === undefined) redirect("/entra");

  return (
    <>
      <Intestazione sopra="assoluta" />
      <main id="contenuto" className="flex-1">
        <div className="semina">
          <div className="semina-scena">
            <Ambiente
              meteo={MATTINA}
              ora="giorno"
              stagione="autunno"
              className="h-full"
              albero={
                <Albero
                  posa={{ ...azione("guardare-cielo").posa, occhi: "felici", bocca: "grande", dx: { forma: "dritto", angolo: 58, anim: "saluta" } }}
                  stadio="alberello"
                  stagione="autunno"
                  titolo="Un albero che saluta"
                />
              }
            />
          </div>
          <section className="semina-foglio pagina nastro" aria-labelledby="titolo-accesso">
            <p className="occhiello">Il giardino</p>
            <h1 id="titolo-accesso" className="font-titolo mt-2 mb-6 text-[2rem] leading-[1.05] sm:text-[2.6rem]">
              Il tuo albero ti aspetta.
            </h1>
            <ModuloAccesso errore={typeof errore === "string" ? ERRORI[errore] : undefined} />
          </section>
        </div>
      </main>
    </>
  );
}
