"use client";

import { useActionState } from "react";
import { azioneAccesso, type StatoAccesso } from "./actions";

const MAILPIT = process.env.NEXT_PUBLIC_MAILPIT_URL;

export function ModuloAccesso({ errore }: { errore?: string }) {
  const [stato, azione, inCorso] = useActionState<StatoAccesso, FormData>(azioneAccesso, {
    fase: "email",
    errore,
  });

  if (stato.fase === "codice") {
    return (
      <form action={azione} className="space-y-5">
        <input type="hidden" name="email" value={stato.email} />
        <p className="text-lg">
          Ti abbiamo scritto a <strong>{stato.email}</strong>. Apri il link nell&apos;email, oppure scrivi qui il codice
          di 6 cifre.
        </p>
        <label className="block">
          <span className="occhiello">Codice</span>
          <input
            name="codice"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            required
            autoFocus
            className="campo-carta mt-2 text-center font-mono text-2xl tracking-[0.4em]"
            placeholder="······"
          />
        </label>
        {stato.errore && (
          <p className="text-rosso" role="alert">
            {stato.errore}
          </p>
        )}
        <button className="timbro w-full" disabled={inCorso}>
          {inCorso ? "Controllo…" : "Entra nel giardino"}
        </button>
        {MAILPIT && (
          <p className="text-sm text-matita">
            In locale le email non escono davvero: le trovi nella{" "}
            <a href={MAILPIT} target="_blank" rel="noreferrer" className="underline decoration-linfa decoration-2 underline-offset-4">
              casella di prova (Mailpit)
            </a>
            .
          </p>
        )}
      </form>
    );
  }

  return (
    <form action={azione} className="space-y-5">
      <label className="block">
        <span className="occhiello">La tua email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          defaultValue={stato.email}
          className="campo-carta mt-2"
          placeholder="giulia@esempio.it"
        />
      </label>
      {stato.errore && (
          <p className="text-rosso" role="alert">
            {stato.errore}
          </p>
        )}
      <button className="timbro w-full" disabled={inCorso}>
        {inCorso ? "Spedisco il link…" : "Mandami il link per entrare"}
      </button>
      <p className="text-sm text-matita">Niente password: ti mandiamo un link magico. Se è la prima volta, ti creiamo l&apos;account.</p>
    </form>
  );
}
