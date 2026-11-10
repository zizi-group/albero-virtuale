// Carica .env (chiave dell'AI) e .env.local (Supabase locale) prima di tutto il resto.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // il file può mancare: va bene
  }
}
