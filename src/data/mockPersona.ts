import { HealthDataState, HealthSnapshot, NutritionEntry, Goal, RecentActivity } from './types';

// Helper to generate dates backwards from a base date
function generateDates(count: number, endDateStr: string): string[] {
  const dates: string[] = [];
  const base = new Date(endDateStr);
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

const dates30 = generateDates(30, '2026-09-23');

// 30 days of realistic health snapshots showing an upward trend in activity and sleep consistency
const rawSnapshotsData: Array<Omit<HealthSnapshot, 'date'>> = [
  { steps: 7420, heartRateAvgBpm: 68, caloriesBurned: 1940, sleepHours: 6.4, sleepQualityScore: 71, waterIntakeMl: 2100, weightKg: 58.8 },
  { steps: 8100, heartRateAvgBpm: 67, caloriesBurned: 2020, sleepHours: 6.8, sleepQualityScore: 74, waterIntakeMl: 2200, weightKg: 58.7 },
  { steps: 7890, heartRateAvgBpm: 68, caloriesBurned: 1980, sleepHours: 6.2, sleepQualityScore: 68, waterIntakeMl: 2000, weightKg: 58.8 },
  { steps: 9400, heartRateAvgBpm: 66, caloriesBurned: 2180, sleepHours: 7.1, sleepQualityScore: 80, waterIntakeMl: 2400, weightKg: 58.6 },
  { steps: 10200, heartRateAvgBpm: 65, caloriesBurned: 2260, sleepHours: 7.4, sleepQualityScore: 82, waterIntakeMl: 2500, weightKg: 58.6 },
  { steps: 8800, heartRateAvgBpm: 66, caloriesBurned: 2080, sleepHours: 7.0, sleepQualityScore: 78, waterIntakeMl: 2300, weightKg: 58.5 },
  { steps: 6900, heartRateAvgBpm: 69, caloriesBurned: 1880, sleepHours: 6.5, sleepQualityScore: 72, waterIntakeMl: 2100, weightKg: 58.7 },
  { steps: 8350, heartRateAvgBpm: 67, caloriesBurned: 2050, sleepHours: 7.2, sleepQualityScore: 81, waterIntakeMl: 2350, weightKg: 58.6 },
  { steps: 9150, heartRateAvgBpm: 65, caloriesBurned: 2120, sleepHours: 7.3, sleepQualityScore: 83, waterIntakeMl: 2400, weightKg: 58.5 },
  { steps: 8900, heartRateAvgBpm: 66, caloriesBurned: 2100, sleepHours: 6.7, sleepQualityScore: 75, waterIntakeMl: 2250, weightKg: 58.5 },
  { steps: 10600, heartRateAvgBpm: 64, caloriesBurned: 2300, sleepHours: 7.6, sleepQualityScore: 86, waterIntakeMl: 2600, weightKg: 58.4 },
  { steps: 11200, heartRateAvgBpm: 64, caloriesBurned: 2380, sleepHours: 7.8, sleepQualityScore: 88, waterIntakeMl: 2700, weightKg: 58.4 },
  { steps: 9600, heartRateAvgBpm: 65, caloriesBurned: 2190, sleepHours: 7.2, sleepQualityScore: 82, waterIntakeMl: 2450, weightKg: 58.3 },
  { steps: 7800, heartRateAvgBpm: 67, caloriesBurned: 1960, sleepHours: 6.9, sleepQualityScore: 77, waterIntakeMl: 2200, weightKg: 58.5 },
  { steps: 8950, heartRateAvgBpm: 66, caloriesBurned: 2110, sleepHours: 7.1, sleepQualityScore: 80, waterIntakeMl: 2350, weightKg: 58.4 },
  { steps: 9800, heartRateAvgBpm: 65, caloriesBurned: 2200, sleepHours: 7.4, sleepQualityScore: 84, waterIntakeMl: 2500, weightKg: 58.3 },
  { steps: 9300, heartRateAvgBpm: 65, caloriesBurned: 2150, sleepHours: 7.0, sleepQualityScore: 79, waterIntakeMl: 2400, weightKg: 58.3 },
  { steps: 10450, heartRateAvgBpm: 64, caloriesBurned: 2280, sleepHours: 7.5, sleepQualityScore: 85, waterIntakeMl: 2550, weightKg: 58.2 },
  { steps: 11100, heartRateAvgBpm: 63, caloriesBurned: 2350, sleepHours: 8.0, sleepQualityScore: 90, waterIntakeMl: 2750, weightKg: 58.2 },
  { steps: 8700, heartRateAvgBpm: 66, caloriesBurned: 2060, sleepHours: 7.1, sleepQualityScore: 79, waterIntakeMl: 2300, weightKg: 58.3 },
  { steps: 7950, heartRateAvgBpm: 67, caloriesBurned: 1990, sleepHours: 6.8, sleepQualityScore: 76, waterIntakeMl: 2200, weightKg: 58.4 },
  { steps: 9550, heartRateAvgBpm: 65, caloriesBurned: 2170, sleepHours: 7.3, sleepQualityScore: 82, waterIntakeMl: 2450, weightKg: 58.3 },
  { steps: 10100, heartRateAvgBpm: 64, caloriesBurned: 2240, sleepHours: 7.5, sleepQualityScore: 85, waterIntakeMl: 2500, weightKg: 58.2 },
  { steps: 9700, heartRateAvgBpm: 65, caloriesBurned: 2190, sleepHours: 7.2, sleepQualityScore: 81, waterIntakeMl: 2400, weightKg: 58.2 },
  { steps: 10850, heartRateAvgBpm: 64, caloriesBurned: 2310, sleepHours: 7.7, sleepQualityScore: 87, waterIntakeMl: 2600, weightKg: 58.1 },
  { steps: 11500, heartRateAvgBpm: 63, caloriesBurned: 2410, sleepHours: 8.2, sleepQualityScore: 92, waterIntakeMl: 2800, weightKg: 58.1 },
  { steps: 8900, heartRateAvgBpm: 66, caloriesBurned: 2070, sleepHours: 7.0, sleepQualityScore: 78, waterIntakeMl: 2300, weightKg: 58.2 },
  { steps: 9250, heartRateAvgBpm: 66, caloriesBurned: 2120, sleepHours: 6.9, sleepQualityScore: 76, waterIntakeMl: 2350, weightKg: 58.3 }, // Yesterday - 1
  { steps: 9250, heartRateAvgBpm: 66, caloriesBurned: 2120, sleepHours: 6.9, sleepQualityScore: 76, waterIntakeMl: 2350, weightKg: 58.3 }, // Yesterday
  { steps: 10420, heartRateAvgBpm: 64, caloriesBurned: 2240, sleepHours: 7.8, sleepQualityScore: 88, waterIntakeMl: 2450, weightKg: 58.2 }, // Today
];

export const mockDailySnapshots: HealthSnapshot[] = dates30.map((date, idx) => ({
  date,
  ...rawSnapshotsData[idx],
}));

export const mockNutrition: NutritionEntry[] = dates30.map((date, idx) => {
  // Baseline calories around 2000-2200 kcal
  const variance = (idx % 5) * 40 - 80;
  return {
    date,
    calories: 2080 + variance,
    protein_g: 118 + (idx % 3) * 4 - 4,
    carbs_g: 225 + (idx % 4) * 8 - 12,
    fat_g: 62 + (idx % 3) * 3 - 3,
  };
});

export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Daily Steps',
    category: 'steps',
    target: 10000,
    current: 10420,
    unit: 'steps',
  },
  {
    id: 'goal-2',
    title: 'Sleep Duration',
    category: 'sleep',
    target: 7.5,
    current: 7.8,
    unit: 'hours',
  },
  {
    id: 'goal-3',
    title: 'Weekly Cardio Activity',
    category: 'workout',
    target: 150,
    current: 135,
    unit: 'minutes',
    deadline: 'End of week',
  },
  {
    id: 'goal-4',
    title: 'Daily Hydration',
    category: 'hydration',
    target: 2500,
    current: 2450,
    unit: 'ml',
  },
  {
    id: 'goal-5',
    title: 'Daily Protein Target',
    category: 'calories',
    target: 110,
    current: 118,
    unit: 'g',
  },
];

export const mockRecentActivities: RecentActivity[] = [
  {
    id: 'act-1',
    date: '2026-09-23',
    time: '07:15 AM',
    type: 'Running',
    durationMin: 35,
    caloriesBurned: 360,
    heartRateAvgBpm: 146,
  },
  {
    id: 'act-2',
    date: '2026-09-22',
    time: '06:30 PM',
    type: 'Yoga',
    durationMin: 40,
    caloriesBurned: 130,
    heartRateAvgBpm: 92,
  },
  {
    id: 'act-3',
    date: '2026-09-21',
    time: '07:00 AM',
    type: 'HIIT',
    durationMin: 25,
    caloriesBurned: 295,
    heartRateAvgBpm: 158,
  },
  {
    id: 'act-4',
    date: '2026-09-20',
    time: '05:45 PM',
    type: 'Cycling',
    durationMin: 50,
    caloriesBurned: 440,
    heartRateAvgBpm: 135,
  },
  {
    id: 'act-5',
    date: '2026-09-19',
    time: '08:00 PM',
    type: 'Walking',
    durationMin: 30,
    caloriesBurned: 125,
    heartRateAvgBpm: 102,
  },
];

export const mockPersonaData: HealthDataState = {
  persona: {
    name: 'Anna Davis',
    age: 32,
    gender: 'Female',
    occupation: 'Lead Product Designer',
    goalsSummary: 'Improve resting heart rate, maintain sleep consistency >7.5h, and reach 10,000 steps daily.',
  },
  dailySnapshots: mockDailySnapshots,
  nutrition: mockNutrition,
  goals: mockGoals,
  recentActivities: mockRecentActivities,
};
