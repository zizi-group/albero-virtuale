import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Intestazione } from "@/components/Intestazione";
import { PIANI, type IdPiano } from "@/components/landing/Pacchetti";
import { alberiDellaPersona } from "@/lib/alberi";
import { caricaConto, contoDaRiga } from "@/lib/motore/stanze";
import { alberiMassimi, NOMI_PACCHETTO_CONTO } from "@/lib/stanze";
import { ModuloSemina } from "./ModuloSemina";

export const metadata: Metadata = { title: "Pianta il tuo albero — Linfa" };

export default async function PaginaSemina({ searchParams }: PageProps<"/pianta">) {
  const { utente, alberi } = await alberiDellaPersona();
  const { pacchetto, altro, stanza } = await searchParams;
  // Chi ha già un albero arriva qui solo per piantarne un altro (fase 5: più alberi per persona).
  if (alberi.length && altro !== "1") redirect("/giardino");
  const scelto = typeof pacchetto === "string" && pacchetto in PIANI ? (pacchetto as IdPiano) : undefined;

  let unAltro: { quanti: number; massimo: number; pacchetto: string; stanza?: string } | undefined;
  if (alberi.length) {
    const conto = contoDaRiga(await caricaConto(utente.id));
    unAltro = {
      quanti: alberi.length,
      massimo: alberiMassimi(conto),
      pacchetto: NOMI_PACCHETTO_CONTO[conto.pacchetto],
      stanza: typeof stanza === "string" ? stanza : undefined,
    };
  }

  return (
    <>
      <Intestazione sopra="assoluta">
        <form action="/auth/esci" method="post">
          <button className="pillola">Esci</button>
        </form>
      </Intestazione>
      <main id="contenuto" className="flex-1">
        <ModuloSemina pacchetto={scelto} unAltro={unAltro} />
      </main>
    </>
  );
}
