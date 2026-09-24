// ── Health Targets ──────────────────────────────────────────────
export const CALORIE_BURN_TARGET = 2200;
export const CALORIE_INTAKE_TARGET = 2100;
export const SLEEP_TARGET_HOURS = 7.5;
export const STEPS_TARGET = 10000;
export const WATER_TARGET_ML = 2500;

// ── Nutrition Macros ────────────────────────────────────────────
export const PROTEIN_TARGET_G = 110;
export const CARBS_TARGET_G = 240;
export const FAT_TARGET_G = 65;
export const PROTEIN_CAL_PER_GRAM = 4;
export const CARBS_CAL_PER_GRAM = 4;
export const FAT_CAL_PER_GRAM = 9;

// ── Heart Rate Zones ────────────────────────────────────────────
export const HR_OPTIMAL_MIN = 55;
export const HR_OPTIMAL_MAX = 65;
export const HR_NORMAL_MAX = 72;
export const HR_ELEVATED_MAX = 80;
export const HR_DISPLAY_MAX = 100;

// ── Sleep Quality Thresholds (0-100 score) ──────────────────────
export const SLEEP_SCORE_OPTIMAL = 85;
export const SLEEP_SCORE_GOOD = 75;
export const SLEEP_SCORE_FAIR = 60;

// ── Chart UI Thresholds ─────────────────────────────────────────
export const CHART_K_FORMAT_THRESHOLD = 1000;
export const GOAL_NEAR_COMPLETION_PCT = 80;

// ── API / Network ───────────────────────────────────────────────
export const API_CHAT_ENDPOINT = '/api/chat';
export const API_REQUEST_TIMEOUT_MS = 18_000;
export const MOCK_FETCH_DELAY_MS = 600;
export const LLM_MAX_HISTORY_MESSAGES = 10;
export const LLM_MAX_RECENT_ACTIVITIES = 5;
export const LLM_AVG_WINDOW_DAYS = 7;
export const CHAT_INPUT_MAX_LENGTH = 500;
export const CHAT_FOCUS_DELAY_MS = 150;

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

// ── Time Range Filter ──────────────────────────────────────────
export const TIME_RANGE_DAYS: Record<string, number> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
};

// ── Chart Dimensions ────────────────────────────────────────────
export const CHART_GRADIENT_OPACITY_START = 0.25;
export const CHART_GRADIENT_OPACITY_END = 0.0;
export const CHART_ACTIVE_DOT_RADIUS = 5;

export const SLEEP_CHART_Y_DOMAIN: [number, number] = [4, 10];
export const SLEEP_CHART_Y_TICKS: number[] = [4, 6, 8, 10];

export const WEIGHT_CHART_Y_PADDING = 0.5;
export const Y_AXIS_UPPER_SCALE_DEFAULT = 1.08;
export const Y_AXIS_UPPER_SCALE_ACTIVITY = 1.15;

export const DONUT_INNER_RADIUS = 38;
export const DONUT_OUTER_RADIUS = 56;
export const DONUT_PADDING_ANGLE = 4;
