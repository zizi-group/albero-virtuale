import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Il link magico dell'email arriva qui con token_hash: lo verifichiamo sul server,
// così funziona anche se l'email si apre in un altro browser.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const tipo = (searchParams.get("type") ?? "email") as EmailOtpType;

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL("/giardino", origin));
  }
  return NextResponse.redirect(new URL("/accedi?errore=link", origin));
}
