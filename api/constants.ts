export const CHAT_INPUT_MAX_LENGTH = 500;

// ── LLM Config ─────────────────────────────────────────────────
export const LLM_MODEL = 'gemini-3.1-flash-lite';
export const LLM_TEMPERATURE = 0.2;
export const LLM_MAX_TOKENS = 800;
export const LLM_TIMEOUT_MS = 30000;

// ── HTTP Status Codes ──────────────────────────────────────────
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  METHOD_NOT_ALLOWED: 405,
  UNPROCESSABLE_ENTITY: 422,
  RATE_LIMIT_EXCEEDED: 429,
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// ── API Error Codes ────────────────────────────────────────────
export const API_ERROR_CODE = {
  BAD_REQUEST: 'BAD_REQUEST',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  MISSING_API_KEY: 'MISSING_API_KEY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  LLM_TIMEOUT: 'LLM_TIMEOUT',
  INVALID_LLM_OUTPUT: 'INVALID_LLM_OUTPUT',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
} as const;

