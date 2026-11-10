import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Client con la chiave segreta: salta le regole RLS.
 * Solo per il server e per gli script del motore, mai nel browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Mancano NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY: controlla .env.local",
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
