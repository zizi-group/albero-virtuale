import { NextResponse, type NextRequest } from "next/server";
import { accessoDemoAttivo } from "@/lib/accesso-demo";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Accesso demo senza login: entra con un account di prova locale, senza email.
 * Funziona solo con LINFA_ACCESSO_DEMO=1 (in `.env.local`): mai in produzione.
 *
 * Crea l'account la prima volta, genera un link magico con la chiave segreta
 * e lo verifica subito sul server, così i cookie di sessione sono già pronti.
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  if (!accessoDemoAttivo()) {
    return NextResponse.redirect(new URL("/accedi", origin));
  }

  const email = process.env.LINFA_EMAIL_DEMO || "demo@linfa.local";
  const admin = createAdminClient();

  // Se l'account esiste già, Supabase risponde con un errore che si ignora.
  await admin.auth.admin.createUser({ email, email_confirm: true });

  const { data: link, error: erroreLink } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (erroreLink || !link.properties?.hashed_token) {
    console.error("[entra] link demo non generato:", erroreLink?.message);
    return NextResponse.redirect(new URL("/accedi?errore=demo", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties.hashed_token,
  });
  if (error) {
    console.error("[entra] accesso demo non riuscito:", error.message);
    return NextResponse.redirect(new URL("/accedi?errore=demo", origin));
  }

  return NextResponse.redirect(new URL(destinazione(searchParams.get("poi")), origin));
}

/** Solo percorsi interni: niente redirect verso altri siti. */
function destinazione(poi: string | null) {
  if (poi && poi.startsWith("/") && !poi.startsWith("//")) return poi;
  return "/giardino";
}
