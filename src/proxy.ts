import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { accessoDemoAttivo } from "@/lib/accesso-demo";

const PROTETTE = ["/giardino", "/pianta"];

/**
 * Rinnova la sessione Supabase a ogni richiesta e rimanda all'accesso
 * chi apre il giardino senza essere entrato.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const percorso = request.nextUrl.pathname;

  if (!data.user && PROTETTE.some((p) => percorso.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.search = "";
    if (accessoDemoAttivo()) {
      // Demo senza login: entra con l'account di prova e torna qui.
      url.pathname = "/entra";
      url.searchParams.set("poi", percorso);
    } else {
      url.pathname = "/accedi";
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
