import { memo } from 'react';
import {
  Flame,
  Clock,
  HeartPulse,
  Activity,
  Dumbbell,
  Bike,
  Footprints,
} from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';
import { selectRecentActivities, selectDashboardStatus } from '../dashboardSlice';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDate } from '../../../utils/healthCalculations';

export const RecentActivityFeed = memo(() => {
  const activities = useAppSelector(selectRecentActivities);
  const status = useAppSelector(selectDashboardStatus);

  if (status === 'loading') {
    return (
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No Recent Activities"
          description="Track your workouts with your wearable device to see telemetry feeds."
          icon={<Activity className="w-6 h-6 text-slate-400" />}
        />
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'running':
        return <Footprints className="w-5 h-5 text-emerald-600" />;
      case 'cycling':
        return <Bike className="w-5 h-5 text-sky-600" />;
      case 'yoga':
        return <Activity className="w-5 h-5 text-indigo-600" />;
      case 'hiit':
        return <Dumbbell className="w-5 h-5 text-rose-600" />;
      default:
        return <Footprints className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <Card>
      <CardHeader
        title="Recent Activities"
        subtitle="Recent logged training sessions"
        icon={<Activity className="w-5 h-5 text-emerald-600" />}
        action={
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {activities.length} sessions
          </span>
        }
      />

      <div className="space-y-2.5 mt-2">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center flex-shrink-0">
                {getActivityIcon(act.type)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {act.type} Session
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>{formatDate(act.date, true)}</span>
                  <span>•</span>
                  <span>{act.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-right flex-shrink-0">
              <div>
                <div className="flex items-center justify-end gap-1 text-xs font-bold text-slate-800">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{act.caloriesBurned} kcal</span>
                </div>
                <div className="flex items-center justify-end gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {act.durationMin}m
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <HeartPulse className="w-3 h-3 text-rose-500" />
                    {act.heartRateAvgBpm} bpm
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});
