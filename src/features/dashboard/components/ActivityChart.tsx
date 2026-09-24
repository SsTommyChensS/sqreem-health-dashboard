import { useMemo, memo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Activity, Zap } from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';
import {
  selectFilteredSnapshots,
  selectDashboardStatus,
  selectTimeRange,
} from '../dashboardSlice';
import { HealthSnapshot } from '../../../data/types';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { average, formatDate, formatNumber } from '../../../utils/healthCalculations';
import {
  CALORIE_BURN_TARGET,
  Y_AXIS_UPPER_SCALE_ACTIVITY,
} from '../../../data/constants';

const COLORS = {
  amber: { 400: '#fbbf24', 500: '#f59e0b' },
  slate: { 50: '#f8fafc', 100: '#f1f5f9', 400: '#94a3b8' },
} as const;

const CHART_MARGIN = { top: 10, right: 10, left: -20, bottom: 0 };

const formatShortDate = (date: string): string => formatDate(date, true);

const formatYAxisTick = (val: number): string => `${(val / 1000).toFixed(1)}k`;

export interface ActivityChartProps {}

interface ActivityTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: HealthSnapshot }>;
}

const ActivityTooltip = memo(({ active, payload }: ActivityTooltipProps) => {
  if (active && payload && payload.length) {
    const snapshot = payload[0].payload as HealthSnapshot | undefined;
    if (!snapshot) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl text-xs border border-slate-700/50">
        <p className="text-slate-400 font-medium mb-1">
          {formatDate(snapshot.date)}
        </p>
        <div className="space-y-1">
          <p className="font-bold text-sm text-amber-400 flex items-center justify-between gap-3">
            <span>Burned:</span>
            <span>{formatNumber(snapshot.caloriesBurned)} kcal</span>
          </p>
          <p className="text-slate-300 text-xs flex items-center justify-between gap-3">
            <span>Steps:</span>
            <span>{formatNumber(snapshot.steps)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
});

export const ActivityChart = memo((_props: ActivityChartProps) => {
  const snapshots = useAppSelector(selectFilteredSnapshots);
  const status = useAppSelector(selectDashboardStatus);
  const timeRange = useAppSelector(selectTimeRange);

  const { totalBurned, avgBurned, maxDay } = useMemo(() => {
    const list = snapshots.map((s) => s.caloriesBurned);
    const total = list.reduce((acc, c) => acc + c, 0);
    const avg = Math.round(average(list));
    const max = Math.max(...list);
    return { totalBurned: total, avgBurned: avg, maxDay: max };
  }, [snapshots]);

  if (status === 'loading') {
    return (
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </Card>
    );
  }

  if (snapshots.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No Daily Activity Recorded"
          description="Activity telemetry data will appear here once tracked."
          icon={<Activity className="w-6 h-6 text-slate-400" />}
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Daily Caloric Expenditure"
        subtitle={`Energy burn distribution over the last ${
          timeRange === '7d' ? '7 days' : timeRange === '14d' ? '14 days' : '30 days'
        }`}
        icon={<Activity className="w-5 h-5 text-amber-500" />}
        action={
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl font-semibold border border-amber-200/60">
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Target: {CALORIE_BURN_TARGET.toLocaleString()} kcal</span>
          </div>
        }
      />

      {/* Bar Chart container */}
      <div className="h-64 sm:h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={snapshots} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.slate[100]} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={{ fontSize: 11, fill: COLORS.slate[400] }}
              tickLine={false}
              axisLine={{ stroke: COLORS.slate[100] }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: COLORS.slate[400] }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxisTick}
              domain={[0, Math.ceil(maxDay * Y_AXIS_UPPER_SCALE_ACTIVITY)]}
            />
            <Tooltip
              content={<ActivityTooltip />}
              cursor={{ fill: COLORS.slate[50] }}
            />
            <Bar dataKey="caloriesBurned" radius={[6, 6, 0, 0]} maxBarSize={36} isAnimationActive={false}>
              {snapshots.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.caloriesBurned >= CALORIE_BURN_TARGET ? COLORS.amber[500] : COLORS.amber[400]}
                  className="transition-opacity hover:opacity-80 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 gap-3 pt-4 mt-2 border-t border-slate-100 text-center">
        <div className="bg-slate-50/70 rounded-xl p-2.5">
          <p className="text-[11px] font-medium text-slate-400">
            Total Burned ({timeRange.toUpperCase()})
          </p>
          <p className="text-sm font-bold text-slate-800 mt-0.5 num-tabular">
            {formatNumber(totalBurned)} kcal
          </p>
        </div>
        <div className="bg-slate-50/70 rounded-xl p-2.5">
          <p className="text-[11px] font-medium text-slate-400">Daily Average</p>
          <p className="text-sm font-bold text-amber-600 mt-0.5 num-tabular">
            {formatNumber(avgBurned)} kcal/day
          </p>
        </div>
      </div>
    </Card>
  );
});
