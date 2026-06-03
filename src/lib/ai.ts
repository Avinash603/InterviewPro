import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

// ── Groq (primary — fast Llama 3.1) ─────────────────────────
export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Gemini ───────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ── Anthropic Claude ─────────────────────────────────────────
export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Model constants ───────────────────────────────────────────
export const MODELS = {
  GROQ_FAST: "llama-3.1-8b-instant",
  GROQ_SMART: "llama-3.1-70b-versatile",
  CLAUDE: "claude-sonnet-4-20250514",
  GEMINI: "gemini-1.5-flash",
};

// ── Streaming Groq helper ─────────────────────────────────────
export async function streamGroq(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  model = MODELS.GROQ_SMART
) {
  return groq.chat.completions.create({
    model,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 2048,
  });
}

// ── Structured JSON output helper ─────────────────────────────
export async function generateJSON<T>(
  prompt: string,
  schema: string,
  model = MODELS.GROQ_SMART
): Promise<T> {
  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `You are a structured data generator. Always respond with valid JSON only. No markdown, no explanation. Schema: ${schema}`,
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });
  return JSON.parse(response.choices[0].message.content || "{}") as T;
}
