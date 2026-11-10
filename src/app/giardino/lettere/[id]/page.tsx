import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Intestazione } from "@/components/Intestazione";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient, getUtente } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Una lettera — Linfa" };

export default async function Lettera({ params }: PageProps<"/giardino/lettere/[id]">) {
  const { id } = await params;
  const utente = await getUtente();
  if (!utente) redirect("/accedi");

  // La lettura passa dalle regole RLS: si vedono solo le lettere del proprio albero.
  const supabase = await createClient();
  const { data: lettera } = await supabase
    .from("letters")
    .select("id, subject, body, kind, created_at, read_at, day_number, trees(name, city, owner_name)")
    .eq("id", id)
    .maybeSingle();
  if (!lettera) notFound();

  const primaVolta = !lettera.read_at;
  if (primaVolta) {
    await createAdminClient().from("letters").update({ read_at: new Date().toISOString() }).eq("id", lettera.id);
  }

  const albero = lettera.trees as unknown as { name: string; city: string; owner_name: string | null };
  const quando = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(lettera.created_at),
  );
  const paragrafi = lettera.body.split(/\n\s*\n/);

  return (
    <>
      <Intestazione>
        <Link href="/giardino#lettere" className="pillola">
          <span aria-hidden>←</span> Torna al giardino
        </Link>
      </Intestazione>
      <main id="contenuto" className="scrittoio flex-1 px-4 pb-20 sm:px-8">
        {/* La busta si apre una volta sola, alla prima lettura; poi la lettera è subito lì. */}
        <div className="busta-scena" data-apri={primaVolta ? "1" : undefined}>
          <div className="busta" aria-hidden>
            <div className="busta-retro" />
            <div className="busta-davanti">
              <span className="busta-indirizzo font-mano">
                Per {albero.owner_name ?? "te"}
                <br />
                <span className="text-corteccia">da {albero.name}</span>
              </span>
            </div>
            <div className="busta-lembo" />
            <span className="busta-sigillo" />
          </div>

          <article className="lettera-foglio carta-righe" aria-labelledby="oggetto">
            <div className="francobollo-lettera" aria-hidden>
              <span>
                {albero.city}
                <br />
                giorno {lettera.day_number}
              </span>
            </div>
            <p className="text-sm text-matita">{quando}</p>
            <h1 id="oggetto" className="font-titolo mt-1 mb-6 max-w-[78%] text-[1.75rem] leading-tight sm:text-3xl">
              {lettera.subject}
            </h1>
            <div className="lettera-testo font-mano">
              {paragrafi.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          </article>
        </div>

        <p className="mt-10 text-center">
          <Link href="/giardino#scrivigli" className="timbro">
            Rispondi a {albero.name}
          </Link>
        </p>
      </main>
    </>
  );
}
