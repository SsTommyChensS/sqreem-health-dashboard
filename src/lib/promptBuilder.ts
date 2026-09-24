import { HealthDataState } from '../data/types';
import { average } from '../utils/healthCalculations';
import { LLM_AVG_WINDOW_DAYS, LLM_MAX_RECENT_ACTIVITIES } from '../data/constants';

export interface HealthContextPayload {
  persona: {
    name: string;
    age: number;
    gender: string;
    occupation: string;
    goalsSummary: string;
  };
  today: {
    date: string;
    steps: number;
    heartRateAvgBpm: number;
    caloriesBurned: number;
    sleepHours: number;
    sleepQualityScore: number;
    waterIntakeMl: number;
    weightKg: number;
  } | null;
  yesterday: {
    date: string;
    steps: number;
    heartRateAvgBpm: number;
    caloriesBurned: number;
    sleepHours: number;
    sleepQualityScore: number;
  } | null;
  last7DaysAverage: {
    steps: number;
    heartRateAvgBpm: number;
    caloriesBurned: number;
    sleepHours: number;
    sleepQualityScore: number;
    waterIntakeMl: number;
    weightKg: number;
  };
  todayNutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  } | null;
  goals: Array<{
    title: string;
    current: number;
    target: number;
    unit: string;
    progressPercent: number;
  }>;
  recentActivities: Array<{
    date: string;
    type: string;
    durationMin: number;
    caloriesBurned: number;
    heartRateAvgBpm: number;
  }>;
}

/**
 * Builds the compact structured health data context object to be sent to /api/chat.
 * Grounds the LLM only on current data, preventing hallucination while minimizing token usage.
 */
export function buildHealthContext(data: HealthDataState): string {
  const snapshots = data.dailySnapshots;
  const today = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const yesterday = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  const last7Days = snapshots.slice(-LLM_AVG_WINDOW_DAYS);
  const avg7d = {
    steps: Math.round(average(last7Days.map((s) => s.steps))),
    heartRateAvgBpm: Math.round(average(last7Days.map((s) => s.heartRateAvgBpm))),
    caloriesBurned: Math.round(average(last7Days.map((s) => s.caloriesBurned))),
    sleepHours: Math.round(average(last7Days.map((s) => s.sleepHours)) * 10) / 10,
    sleepQualityScore: Math.round(average(last7Days.map((s) => s.sleepQualityScore))),
    waterIntakeMl: Math.round(average(last7Days.map((s) => s.waterIntakeMl))),
    weightKg: Math.round(average(last7Days.map((s) => s.weightKg)) * 10) / 10,
  };

  const todayNutr = data.nutrition.length > 0 ? data.nutrition[data.nutrition.length - 1] : null;

  const payload: HealthContextPayload = {
    persona: data.persona,
    today: today
      ? {
          date: today.date,
          steps: today.steps,
          heartRateAvgBpm: today.heartRateAvgBpm,
          caloriesBurned: today.caloriesBurned,
          sleepHours: today.sleepHours,
          sleepQualityScore: today.sleepQualityScore,
          waterIntakeMl: today.waterIntakeMl,
          weightKg: today.weightKg,
        }
      : null,
    yesterday: yesterday
      ? {
          date: yesterday.date,
          steps: yesterday.steps,
          heartRateAvgBpm: yesterday.heartRateAvgBpm,
          caloriesBurned: yesterday.caloriesBurned,
          sleepHours: yesterday.sleepHours,
          sleepQualityScore: yesterday.sleepQualityScore,
        }
      : null,
    last7DaysAverage: avg7d,
    todayNutrition: todayNutr
      ? {
          calories: todayNutr.calories,
          protein_g: todayNutr.protein_g,
          carbs_g: todayNutr.carbs_g,
          fat_g: todayNutr.fat_g,
        }
      : null,
    goals: data.goals.map((g) => ({
      title: g.title,
      current: g.current,
      target: g.target,
      unit: g.unit,
      progressPercent: Math.round((g.current / g.target) * 100),
    })),
    recentActivities: data.recentActivities.slice(0, LLM_MAX_RECENT_ACTIVITIES).map((a) => ({
      date: a.date,
      type: a.type,
      durationMin: a.durationMin,
      caloriesBurned: a.caloriesBurned,
      heartRateAvgBpm: a.heartRateAvgBpm,
    })),
  };

  return JSON.stringify(payload, null, 2);
}
