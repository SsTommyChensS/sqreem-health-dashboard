export interface Persona {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  goalsSummary: string;
}

export interface HealthSnapshot {
  date: string; // ISO date: YYYY-MM-DD
  steps: number;
  heartRateAvgBpm: number;
  caloriesBurned: number;
  sleepHours: number;
  sleepQualityScore: number; // 0 - 100
  waterIntakeMl: number;
  weightKg: number;
}

export interface NutritionEntry {
  date: string; // YYYY-MM-DD
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Goal {
  id: string;
  title: string;
  category: 'steps' | 'sleep' | 'calories' | 'hydration' | 'workout';
  target: number;
  current: number;
  unit: string;
  deadline?: string;
}

export interface RecentActivity {
  id: string;
  date: string; // YYYY-MM-DD or formatted timestamp
  time: string;
  type: 'Running' | 'Cycling' | 'HIIT' | 'Yoga' | 'Walking' | 'Swimming';
  durationMin: number;
  caloriesBurned: number;
  heartRateAvgBpm: number;
}

export interface HealthDataState {
  persona: Persona;
  dailySnapshots: HealthSnapshot[];
  nutrition: NutritionEntry[];
  goals: Goal[];
  recentActivities: RecentActivity[];
}

export interface HighlightedMetric {
  label: string;
  value: string;
}

export type AIConfidence = 'high' | 'insufficient_data';

export interface LLMResponse {
  answer: string;
  highlightedMetrics: HighlightedMetric[];
  confidence: AIConfidence;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  highlightedMetrics?: HighlightedMetric[];
  confidence?: AIConfidence;
  timestamp: string;
}

// Standard API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  status: number;
  code: string;
  stack?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: ApiError;
}
