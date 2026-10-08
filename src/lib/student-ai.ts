import { GoogleGenAI } from "@google/genai";

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-3.7-flash";

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

async function generateWithRetry(
  client: GoogleGenAI,
  model: string,
  prompt: string,
  retries = 2
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(
        `Gemini ${model} attempt ${attempt + 1}/${retries + 1}`
      );

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

      console.error(
        `Gemini ${model} attempt ${attempt + 1} failed:`,
        error
      );

      if (!isTemporaryError(error) || attempt === retries) {
        throw error;
      }

      // Wait before retrying: 2 seconds, then 4 seconds.
      const delay = 2000 * (attempt + 1);

      console.log(
        `Temporary Gemini error. Retrying in ${delay / 1000}s...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

export async function askGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const client = new GoogleGenAI({ apiKey });

  try {
    // Primary model: up to 3 attempts
    return await generateWithRetry(
      client,
      PRIMARY_MODEL,
      prompt,
      2
    );
  } catch (primaryError) {
    console.error("Primary Gemini model failed:", primaryError);

    // Only use fallback for temporary service errors.
    if (!isTemporaryError(primaryError)) {
      throw primaryError;
    }

    console.log("Primary model unavailable. Trying fallback model...");

    // Fallback model: up to 3 attempts
    return await generateWithRetry(
      client,
      FALLBACK_MODEL,
      prompt,
      2
    );
  }
}
