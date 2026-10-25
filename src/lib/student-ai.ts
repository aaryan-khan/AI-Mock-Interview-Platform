import { GoogleGenAI } from "@google/genai";

const PRIMARY_GEMINI_MODEL = "gemini-3.8-flash";
const FALLBACK_GEMINI_MODEL = "gemini-3.7-flash";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function isTemporaryError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error);

  return (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.toLowerCase().includes("high demand")
  );
}

async function askOllama(prompt: string): Promise<string> {
  const host = process.env.OLLAMA_HOST || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2:3b";

  console.log(`[AI] Calling local Ollama (${model}) at ${host}...`);

  const response = await fetch(`${host}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: "json",
      options: {
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.response ?? "";
}

async function generateWithGemini(
  client: GoogleGenAI,
  model: string,
  prompt: string,
  retries = 2
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[AI] Gemini ${model} attempt ${attempt + 1}/${retries + 1}`);

      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: 1800,
        },
      });

      return response.text ?? "";
    } catch (error) {
      lastError = error;
      console.error(`[AI] Gemini ${model} attempt ${attempt + 1} failed:`, error);

      if (!isTemporaryError(error) || attempt === retries) {
        throw error;
      }

      const delay = 2000 * (attempt + 1);
      console.log(`[AI] Temporary error. Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }

  throw lastError;
}

async function askGoogleGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const client = new GoogleGenAI({ apiKey });

  try {
    return await generateWithGemini(client, PRIMARY_GEMINI_MODEL, prompt, 2);
  } catch (primaryError) {
    if (!isTemporaryError(primaryError)) {
      throw primaryError;
    }
    console.log("[AI] Primary model unavailable. Trying fallback model...");
    return await generateWithGemini(client, FALLBACK_GEMINI_MODEL, prompt, 2);
  }
}

/**
 * Main AI function that automatically routes to Ollama or Gemini
 * based on environment variables (USE_OLLAMA or AI_PROVIDER).
 */
export async function askAI(prompt: string): Promise<string> {
  const useOllama =
    process.env.USE_OLLAMA === "true" ||
    process.env.AI_PROVIDER?.toLowerCase() === "ollama" ||
    !process.env.GEMINI_API_KEY;

  if (useOllama) {
    try {
      return await askOllama(prompt);
    } catch (ollamaErr) {
      // If Ollama fails and Gemini API key is available, fallback to Gemini
      if (process.env.GEMINI_API_KEY?.trim()) {
        console.warn("[AI] Ollama failed, falling back to Gemini:", ollamaErr);
        return await askGoogleGemini(prompt);
      }
      throw ollamaErr;
    }
  }

  return await askGoogleGemini(prompt);
}

// Backward-compatibility export
export const askGemini = askAI;
