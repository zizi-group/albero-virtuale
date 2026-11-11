"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { segnalaReazione } from "@/components/giardino3d/reazioni";
import { IconaRegalo } from "@/components/IconaRegalo";
import { REGALI } from "@/lib/albero/regali";
import { azioneDemo, faiRegalo, type Esito } from "./actions";

/** Il regalo del mese: si sceglie dal catalogo, l'albero risponde con una lettera. */
export function SceltaRegalo({ nome }: { nome: string }) {
  const [esito, azione, inCorso] = useActionState<Esito, FormData>(faiRegalo, {});
  useEffect(() => {
    if (esito.ok) segnalaReazione("festa");
  }, [esito]);
  const [scelto, setScelto] = useState(REGALI[0].id);
  const r = REGALI.find((x) => x.id === scelto) ?? REGALI[0];

  return (
    <form action={azione}>
      <fieldset disabled={inCorso}>
        <legend className="sr-only">Scegli il regalo per {nome}</legend>
        <div className="regali-griglia">
          {REGALI.map((x) => (
            <label key={x.id} className="regalo-scelta" title={x.nome}>
              <input
                type="radio"
                name="regalo"
                value={x.id}
                checked={scelto === x.id}
                onChange={() => setScelto(x.id)}
                className="sr-only"
              />
              <IconaRegalo id={x.id} className="h-9 w-9" />
              <span className="regalo-nome">{x.nome}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="mt-3 min-h-12 text-[0.95rem] leading-snug text-matita">{r.descrizione}</p>
      <button className="timbro timbro-piccolo mt-2 w-full" disabled={inCorso}>
        {inCorso ? `${nome} sta scartando il regalo…` : `Regala ${r.articolo.replace(/,.*$/, "")}`}
      </button>
      <p className="mt-2 min-h-6 text-[0.95rem] leading-snug" aria-live="polite">
        {!inCorso && esito.messaggio && (
          <span className={esito.ok ? "text-muschio" : "text-rosso"}>
            {esito.messaggio}
            {esito.link && (
              <>
                {" "}
                <Link href={esito.link.href} className="font-semibold underline decoration-linfa decoration-2 underline-offset-4">
                  {esito.link.testo}
                </Link>
              </>
            )}
          </span>
        )}
      </p>
    </form>
  );
}

/** Per chi ha l'Albero: si prova il Premium con un clic (demo, nessun pagamento). */
export function PassaAlPremium({ etichetta = "Prova il Premium" }: { etichetta?: string }) {
  const [esito, azione, inCorso] = useActionState<Esito, FormData>(azioneDemo, {});
  return (
    <form action={azione} className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <input type="hidden" name="cosa" value="pacchetto" />
      <input type="hidden" name="piano" value="premium-annuale" />
      <button className="timbro timbro-linfa timbro-piccolo" disabled={inCorso}>
        {inCorso ? "Un attimo…" : etichetta}
      </button>
      <span className="text-sm text-matita">Demo: nessun pagamento.</span>
      {!inCorso && esito.messaggio && !esito.ok && <span className="text-sm text-rosso">{esito.messaggio}</span>}
    </form>
  );
}
