import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import {
  HTTP_STATUS,
  API_ERROR_CODE,
  LLM_MODEL,
  LLM_TEMPERATURE,
  LLM_MAX_TOKENS,
  LLM_TIMEOUT_MS,
  CHAT_INPUT_MAX_LENGTH,
} from '../src/data/constants';

interface ChatRequest {
  message?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  healthContext?: string;
}

interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  error: {
    status: number;
    code: string;
    stack?: string;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

const HighlightedMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const LLMOutputSchema = z.object({
  answer: z.string(),
  highlightedMetrics: z.array(HighlightedMetricSchema).default([]),
  confidence: z.enum(['high', 'insufficient_data']).default('high'),
});

type LLMOutput = z.infer<typeof LLMOutputSchema>;

// ── Response Helpers ────────────────────────────────────────────

function ok<T>(message: string, data: T): SuccessResponse<T> {
  return { success: true, message, data };
}

function fail(status: number, code: string, message: string, stack?: string): ErrorResponse {
  const error: ErrorResponse['error'] = { status, code };
  if (process.env.NODE_ENV === 'development' && stack) {
    error.stack = stack;
  }
  return { success: false, message, error };
}

// ── LLM Helpers ────────────────────────────────────────────────

function buildSystemPrompt(healthContext: string): string {
  return `You are a personal health assistant inside the Health Insight Dashboard app.
You may ONLY use the data inside the <health_data> block below to answer.
If a question requires information not present in <health_data>, clearly say you don't have that data — do NOT guess or invent numbers.
Keep answers concise and friendly; use bullet points when listing things.
When commenting on a trend, base it on the specific figures provided and cite the numbers.

CRITICAL: You MUST respond in pure, valid JSON format:
{
  "answer": "Your concise response grounded only in the data",
  "highlightedMetrics": [{ "label": "Metric name", "value": "Metric value" }],
  "confidence": "high"
}

<health_data>
${healthContext || '{}'}
</health_data>`;
}

function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<LLMOutput> {
  const ai = new GoogleGenAI({ apiKey });

  const contents = [
    ...history.slice(-10).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const response = await ai.models.generateContent({
    model: LLM_MODEL,
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: LLM_TEMPERATURE,
      maxOutputTokens: LLM_MAX_TOKENS,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text || '{}';
  return LLMOutputSchema.parse(JSON.parse(cleanJsonOutput(text)));
}

// ── Error Classification ────────────────────────────────────────

function classifyError(error: Error): ErrorResponse {
  const msg = error.message.toLowerCase();
  const stack = error.stack;

  if (error.message === 'LLM_TIMEOUT') {
    return fail(HTTP_STATUS.GATEWAY_TIMEOUT, API_ERROR_CODE.LLM_TIMEOUT, 'The AI assistant took too long to respond. Please try again.', stack);
  }

  if (msg.includes('rate_limit') || msg.includes('quota') || msg.includes('429') || msg.includes('resource_exhausted')) {
    return fail(HTTP_STATUS.RATE_LIMIT_EXCEEDED, API_ERROR_CODE.RATE_LIMIT_EXCEEDED, 'The AI assistant is temporarily busy. Please try again in a moment.', stack);
  }

  if (msg.includes('not_found') || msg.includes('404') || msg.includes('deprecated')) {
    return fail(HTTP_STATUS.SERVICE_UNAVAILABLE, API_ERROR_CODE.PROVIDER_ERROR, 'The AI model is temporarily unavailable. Please try again later.', stack);
  }

  if (error.name === 'ZodError' || error instanceof SyntaxError) {
    return fail(HTTP_STATUS.BAD_GATEWAY, API_ERROR_CODE.INVALID_LLM_OUTPUT, 'Failed to generate a valid response. Please try again.', stack);
  }

  return fail(HTTP_STATUS.SERVICE_UNAVAILABLE, API_ERROR_CODE.PROVIDER_ERROR, 'Unable to reach the AI assistant. Please try again later.', stack);
}

// ── Main Handler ────────────────────────────────────────────────

export async function handleChatRequest(
  body: ChatRequest
): Promise<{ status: number; data: ApiResponse<LLMOutput> }> {
  const userMessage = (body.message || '').trim().slice(0, CHAT_INPUT_MAX_LENGTH);
  if (!userMessage) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      data: fail(HTTP_STATUS.BAD_REQUEST, API_ERROR_CODE.BAD_REQUEST, 'Message content is required.'),
    };
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (!geminiKey) {
    return {
      status: HTTP_STATUS.INTERNAL_ERROR,
      data: fail(HTTP_STATUS.INTERNAL_ERROR, API_ERROR_CODE.MISSING_API_KEY, 'GEMINI_API_KEY is not configured.'),
    };
  }

  const history = Array.isArray(body.history) ? body.history : [];
  const systemPrompt = buildSystemPrompt(body.healthContext || '{}');

  try {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('LLM_TIMEOUT')), LLM_TIMEOUT_MS);
    });

    const result = await Promise.race([
      callGemini(geminiKey, systemPrompt, userMessage, history),
      timeout,
    ]);

    return { status: HTTP_STATUS.OK, data: ok('Response generated successfully', result) };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    const errorResponse = classifyError(error);
    return { status: errorResponse.error.status, data: errorResponse };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    const data = fail(HTTP_STATUS.METHOD_NOT_ALLOWED, API_ERROR_CODE.METHOD_NOT_ALLOWED, 'Only POST method is allowed.');
    return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json(data);
  }

  const result = await handleChatRequest(req.body);
  return res.status(result.status).json(result.data);
}
