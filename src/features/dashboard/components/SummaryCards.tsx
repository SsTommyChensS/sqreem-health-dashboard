import { memo } from 'react';
import {
  Footprints,
  Moon,
  Flame,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';
import {
  selectTodaySnapshot,
  selectYesterdaySnapshot,
  selectGoals,
  selectDashboardStatus,
} from '../dashboardSlice';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  formatNumber,
  percentChange,
  getSleepQualityDescriptor,
  getHeartRateDescriptor,
} from '../../../utils/healthCalculations';
import { CALORIE_BURN_TARGET, HR_OPTIMAL_MIN, HR_OPTIMAL_MAX, HR_DISPLAY_MAX, STEPS_TARGET, SLEEP_TARGET_HOURS } from '../../../data/constants';

export interface SummaryCardsProps {}

export const SummaryCards = memo((_props: SummaryCardsProps) => {
  const today = useAppSelector(selectTodaySnapshot);
  const yesterday = useAppSelector(selectYesterdaySnapshot);
  const goals = useAppSelector(selectGoals);
  const status = useAppSelector(selectDashboardStatus);

  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!today) {
    return (
      <EmptyState
        title="No Biomarker Data for Today"
        description="Today's telemetry metrics have not been synchronized yet. Click the sync button above to refresh."
        icon={<Sparkles className="w-6 h-6 text-slate-400" />}
      />
    );
  }

  // Calculations for Steps
  const stepsGoal: number = goals.find((g) => g.category === 'steps')?.target ?? STEPS_TARGET;
  const stepsDelta = yesterday ? percentChange(today.steps, yesterday.steps) : 0;
  const stepsPct = Math.min(100, Math.round((today.steps / stepsGoal) * 100));

  // Calculations for Sleep
  const sleepGoalTarget: number = goals.find((g) => g.category === 'sleep')?.target ?? SLEEP_TARGET_HOURS;
  const sleepDelta = yesterday ? Math.round((today.sleepHours - yesterday.sleepHours) * 10) / 10 : 0;
  const sleepQuality = getSleepQualityDescriptor(today.sleepQualityScore);

  // Calculations for Calories
  const calDelta = yesterday ? today.caloriesBurned - yesterday.caloriesBurned : 0;
  const calPct = Math.min(100, Math.round((today.caloriesBurned / CALORIE_BURN_TARGET) * 100));

  // Calculations for Resting Heart Rate
  const hrDelta = yesterday ? today.heartRateAvgBpm - yesterday.heartRateAvgBpm : 0;
  const hrDescriptor = getHeartRateDescriptor(today.heartRateAvgBpm);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Daily Steps Card */}
      <Card className="relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Daily Steps
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 num-tabular">
                {formatNumber(today.steps)}
              </span>
              <span className="text-xs text-slate-400">/ {formatNumber(stepsGoal)}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
            <Footprints className="w-5 h-5" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stepsPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs">
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              stepsDelta >= 0 ? 'text-emerald-600' : 'text-rose-500'
            }`}
          >
            {stepsDelta >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {stepsDelta >= 0 ? `+${stepsDelta}%` : `${stepsDelta}%`}
            <span className="font-normal text-slate-400">vs yesterday</span>
          </span>
          <span className="text-emerald-700 font-medium">{stepsPct}% goal</span>
        </div>
      </Card>

      {/* 2. Sleep Card */}
      <Card className="relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sleep & Recovery
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 num-tabular">
                {today.sleepHours}h
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-semibold ${sleepQuality.bgClass} ${sleepQuality.colorClass}`}
              >
                {today.sleepQualityScore}/100 {sleepQuality.label}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
            <Moon className="w-5 h-5" />
          </div>
        </div>

        {/* Sleep Progress vs target */}
        <div className="mt-3.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((today.sleepHours / sleepGoalTarget) * 100))}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs">
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              sleepDelta >= 0 ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            {sleepDelta >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {sleepDelta >= 0 ? `+${sleepDelta}h` : `${sleepDelta}h`}
            <span className="font-normal text-slate-400">vs yesterday</span>
          </span>
          <span className="text-slate-400">Goal: {sleepGoalTarget}h</span>
        </div>
      </Card>

      {/* 3. Calories Burned Card */}
      <Card className="relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Calories
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 num-tabular">
                {formatNumber(today.caloriesBurned)}
              </span>
              <span className="text-xs text-slate-400">kcal</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Calorie bar */}
        <div className="mt-3.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${calPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs">
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              calDelta >= 0 ? 'text-amber-600' : 'text-slate-500'
            }`}
          >
            {calDelta >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {calDelta >= 0 ? `+${calDelta}` : `${calDelta}`} kcal
            <span className="font-normal text-slate-400">vs yesterday</span>
          </span>
          <span className="text-slate-400">Target: {CALORIE_BURN_TARGET.toLocaleString()}</span>
        </div>
      </Card>

      {/* 4. Resting Heart Rate Card */}
      <Card className="relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Resting Heart Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 num-tabular">
                {today.heartRateAvgBpm}
              </span>
              <span className="text-xs text-slate-400">bpm</span>
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${hrDescriptor.colorClass} ${hrDescriptor.bgClass}`}>
                {hrDescriptor.label}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>

        {/* Normal zone indicator */}
        <div className="mt-3.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (today.heartRateAvgBpm / HR_DISPLAY_MAX) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs">
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              hrDelta <= 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {hrDelta <= 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5" />
            )}
            {hrDelta > 0 ? `+${hrDelta}` : `${hrDelta}`} bpm
            <span className="font-normal text-slate-400">
              {hrDelta <= 0 ? '(improved)' : '(elevated)'}
            </span>
          </span>
          <span className="text-slate-400">Range: {HR_OPTIMAL_MIN}-{HR_OPTIMAL_MAX}</span>
        </div>
      </Card>
    </div>
  );
});
