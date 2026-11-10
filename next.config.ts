import type { NextConfig } from "next";

// Modello di cache classico: le pagine che leggono la sessione Supabase
// sono dinamiche, senza bisogno di Suspense ovunque.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
