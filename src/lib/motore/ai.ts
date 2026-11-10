import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

// Un solo punto per parlare con Claude.
// - Modello: claude-opus-5-5, cambiabile con LINFA_AI_MODEL.
// - Fallback lato server attivi: se una richiesta viene rifiutata dai filtri
//   di sicurezza, l'API la ripete su un modello di riserva nella stessa chiamata.
// - Output strutturati: la risposta arriva già validata con lo schema zod.

export const MODELLO = process.env.LINFA_AI_MODEL || "claude-opus-5-5";

let client: Anthropic | null = null;
function ai() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Manca ANTHROPIC_API_KEY nel file .env del repository.");
  }
  client ??= new Anthropic();
  return client;
}

export class ErroreAI extends Error {}

export async function chiediStrutturato<S extends z.ZodType>({
  sistema,
  richiesta,
  schema,
  effort = "low",
  maxTokens = 16000,
}: {
  sistema: string;
  richiesta: string;
  schema: S;
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
}): Promise<z.infer<S>> {
  let risposta;
  try {
    risposta = await ai().beta.messages.parse({
      model: MODELLO,
      max_tokens: maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // Il prompt di sistema è fisso: lo mettiamo in cache.
      system: [{ type: "text", text: sistema, cache_control: { type: "ephemeral" } }],
      output_config: { effort, format: zodOutputFormat(schema) },
      messages: [{ role: "user", content: richiesta }],
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      throw new ErroreAI("La chiave ANTHROPIC_API_KEY non è valida.");
    }
    if (e instanceof Anthropic.RateLimitError) {
      throw new ErroreAI("Troppe richieste all'AI: riprova tra poco.");
    }
    if (e instanceof Anthropic.APIError) {
      throw new ErroreAI(`Errore dell'AI (${e.status ?? "rete"}): ${e.message}`);
    }
    throw e;
  }

  if (risposta.stop_reason === "refusal") {
    throw new ErroreAI("L'AI ha rifiutato la richiesta.");
  }
  if (risposta.stop_reason === "max_tokens") {
    throw new ErroreAI("La risposta dell'AI è stata troncata.");
  }
  if (!risposta.parsed_output) {
    throw new ErroreAI("La risposta dell'AI non rispetta il formato atteso.");
  }
  return risposta.parsed_output as z.infer<S>;
}
