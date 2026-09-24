import { memo } from 'react';
import { Target, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';
import { selectGoals, selectDashboardStatus } from '../dashboardSlice';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatNumber, goalProgressPercent } from '../../../utils/healthCalculations';
import { GOAL_NEAR_COMPLETION_PCT } from '../../../data/constants';

export interface GoalsPanelProps {}

export const GoalsPanel = memo((_props: GoalsPanelProps) => {
  const goals = useAppSelector(selectGoals);
  const status = useAppSelector(selectDashboardStatus);

  if (status === 'loading') {
    return (
      <Card >
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card >
        <EmptyState
          title="No Active Health Goals"
          description="Create your first health or fitness milestone to start tracking progress."
          icon={<Target className="w-6 h-6 text-slate-400" />}
        />
      </Card>
    );
  }

  return (
    <Card >
      <CardHeader
        title="Goals & Milestones"
        subtitle="Active targets and weekly milestones"
        icon={<Target className="w-5 h-5 text-emerald-600" />}
        action={
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            {goals.filter((g) => g.current >= g.target).length} of {goals.length} achieved
          </span>
        }
      />

      <div className="space-y-4 mt-2">
        {goals.map((goal) => {
          const pct = goalProgressPercent(goal.current, goal.target);
          const isCompleted = goal.current >= goal.target;
          const remaining = Math.max(0, Math.round((goal.target - goal.current) * 10) / 10);

          return (
            <div
              key={goal.id}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : pct >= GOAL_NEAR_COMPLETION_PCT ? (
                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <h4 className="text-xs font-semibold text-slate-800 truncate">{goal.title}</h4>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold text-slate-800 num-tabular whitespace-nowrap">
                    {formatNumber(goal.current)} / {formatNumber(goal.target)} {goal.unit}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : pct >= GOAL_NEAR_COMPLETION_PCT
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200/80 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : pct >= GOAL_NEAR_COMPLETION_PCT
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              {/* Footer status text */}
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>
                  {isCompleted
                    ? '🎉 Target reached!'
                    : `${remaining} ${goal.unit} needed to reach target`}
                </span>
                {goal.deadline && <span>Deadline: {goal.deadline}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
});
