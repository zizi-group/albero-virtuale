"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface StatoAccesso {
  fase: "email" | "codice";
  email?: string;
  errore?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Primo passo: manda il link magico (con il codice a 6 cifre). Secondo: verifica il codice. */
export async function azioneAccesso(_prima: StatoAccesso, form: FormData): Promise<StatoAccesso> {
  const supabase = await createClient();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const codice = String(form.get("codice") ?? "").replace(/\s/g, "");

  if (!EMAIL.test(email)) {
    return { fase: "email", errore: "Scrivi un indirizzo email valido." };
  }

  if (!codice) {
    const sito = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${sito}/auth/conferma`, shouldCreateUser: true },
    });
    if (error) {
      return { fase: "email", email, errore: `Non riesco a mandare il link: ${error.message}` };
    }
    return { fase: "codice", email };
  }

  const { error } = await supabase.auth.verifyOtp({ email, token: codice, type: "email" });
  if (error) {
    return { fase: "codice", email, errore: "Codice non valido o scaduto. Controlla l'ultima email." };
  }
  redirect("/giardino");
}
