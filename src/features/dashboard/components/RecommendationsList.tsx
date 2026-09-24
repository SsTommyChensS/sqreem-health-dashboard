import { memo, useMemo, type ReactNode } from 'react';
import {
  Lightbulb,
  Sparkles,
  Bed,
  Footprints,
  Apple,
  Droplets,
  HeartPulse,
} from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';
import {
  selectTodaySnapshot,
  selectFilteredSnapshots,
  selectTodayNutrition,
  selectDashboardStatus,
} from '../dashboardSlice';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { average } from '../../../utils/healthCalculations';
import { SLEEP_TARGET_HOURS, STEPS_TARGET, WATER_TARGET_ML, PROTEIN_TARGET_G, HR_OPTIMAL_MAX } from '../../../data/constants';

export interface RecommendationsListProps {}

interface RuleRecommendation {
  id: string;
  category: 'sleep' | 'activity' | 'nutrition' | 'hydration' | 'cardio';
  badgeLabel: string;
  title: string;
  description: string;
  icon: ReactNode;
  variant: 'success' | 'warning' | 'info';
}

const BADGE_STYLES = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
  info: 'bg-sky-50 text-sky-700 border-sky-200/60',
};

export const RecommendationsList = memo((_props: RecommendationsListProps) => {
  const today = useAppSelector(selectTodaySnapshot);
  const snapshots = useAppSelector(selectFilteredSnapshots);
  const nutrition = useAppSelector(selectTodayNutrition);
  const status = useAppSelector(selectDashboardStatus);

  // Generate deterministic, data-driven recommendations
  const recommendations = useMemo(() => {
    const recs: RuleRecommendation[] = [];

    if (today && snapshots.length > 0) {
      const avgSleep = Math.round(average(snapshots.map((s) => s.sleepHours)) * 10) / 10;

      // 1. Sleep Rule
      if (avgSleep < SLEEP_TARGET_HOURS - 0.3) {
        recs.push({
          id: 'rec-sleep-deficit',
          category: 'sleep',
          badgeLabel: 'Sleep Deficit',
          title: 'Adjust Sleep Schedule by 30 Minutes',
          description: `Your period average is ${avgSleep}h vs ${SLEEP_TARGET_HOURS}h target. Initiating your wind-down routine by 10:15 PM will improve your deep sleep stages.`,
          icon: <Bed className="w-4 h-4 text-indigo-600" />,
          variant: 'warning',
        });
      } else {
        recs.push({
          id: 'rec-sleep-optimal',
          category: 'sleep',
          badgeLabel: 'Optimal Rest',
          title: 'Excellent Circadian Consistency',
          description: `Your sleep averaged ${avgSleep}h with quality score ${today.sleepQualityScore}/100. Keep this consistent sleep window over the weekend.`,
          icon: <Bed className="w-4 h-4 text-emerald-600" />,
          variant: 'success',
        });
      }

      // 2. Activity / Steps Rule
      if (today.steps >= STEPS_TARGET) {
        recs.push({
          id: 'rec-step-streak',
          category: 'activity',
          badgeLabel: 'Active Streak',
          title: 'Daily Movement Target Achieved',
          description: `You logged ${today.steps.toLocaleString()} steps today! This level of active cadence supports optimal cardiovascular health.`,
          icon: <Footprints className="w-4 h-4 text-emerald-600" />,
          variant: 'success',
        });
      } else {
        recs.push({
          id: 'rec-step-boost',
          category: 'activity',
          badgeLabel: 'Activity Goal',
          title: 'Quick Evening Walk Needed',
          description: `You are at ${today.steps.toLocaleString()} steps. A gentle 15-minute post-dinner walk will complete your ${STEPS_TARGET.toLocaleString()} step milestone.`,
          icon: <Footprints className="w-4 h-4 text-amber-600" />,
          variant: 'warning',
        });
      }

      // 3. Nutrition / Protein Rule
      if (nutrition) {
        if (nutrition.protein_g >= PROTEIN_TARGET_G) {
          recs.push({
            id: 'rec-protein-on-track',
            category: 'nutrition',
            badgeLabel: 'Optimal Nutrition',
            title: 'Target Protein Intake Achieved',
            description: `Great job hitting ${nutrition.protein_g}g of protein today. This facilitates muscle recovery after your training sessions.`,
            icon: <Apple className="w-4 h-4 text-emerald-600" />,
            variant: 'success',
          });
        } else {
          recs.push({
            id: 'rec-protein-boost',
            category: 'nutrition',
            badgeLabel: 'Nutrition Target',
            title: 'Increase Protein for Recovery',
            description: `You logged ${nutrition.protein_g}g protein today (target: ${PROTEIN_TARGET_G}g). Consider pairing dinner with Greek yogurt or edamame.`,
            icon: <Apple className="w-4 h-4 text-amber-600" />,
            variant: 'warning',
          });
        }
      }

      // 4. Hydration Rule
      if (today.waterIntakeMl < WATER_TARGET_ML) {
        recs.push({
          id: 'rec-water-boost',
          category: 'hydration',
          badgeLabel: 'Hydration Reminder',
          title: 'Drink 250ml Water Before Rest',
          description: `Current water intake is ${today.waterIntakeMl.toLocaleString()}ml (target ${WATER_TARGET_ML.toLocaleString()}ml). One more glass will maintain fluid balance.`,
          icon: <Droplets className="w-4 h-4 text-sky-600" />,
          variant: 'info',
        });
      }

      // 5. Resting Heart Rate Rule
      if (today.heartRateAvgBpm <= HR_OPTIMAL_MAX) {
        recs.push({
          id: 'rec-hr-optimal',
          category: 'cardio',
          badgeLabel: 'Cardio Fitness',
          title: 'Optimal Resting Heart Rate',
          description: `Your resting heart rate is ${today.heartRateAvgBpm} bpm, indicating strong parasympathetic recovery and cardio adaptation.`,
          icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
          variant: 'success',
        });
      }
    }

    return recs;
  }, [today, snapshots, nutrition]);

  if (status === 'loading') {
    return (
      <Card >
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-100 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card >
      <CardHeader
        title="Rule-Based Health Insights"
        subtitle="Automated telemetry-driven recommendations"
        icon={<Lightbulb className="w-5 h-5 text-amber-500" />}
        action={
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deterministic engine</span>
          </div>
        }
      />

      <div className="space-y-3 mt-2">
        {recommendations.slice(0, 4).map((rec) => (
          <div
            key={rec.id}
            className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all flex items-start gap-3 shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              {rec.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-semibold text-slate-900">{rec.title}</h4>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    BADGE_STYLES[rec.variant]
                  }`}
                >
                  {rec.badgeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});
