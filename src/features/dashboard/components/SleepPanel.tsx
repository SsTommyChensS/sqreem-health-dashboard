import { useMemo, memo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Moon, BedDouble, ShieldCheck } from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';
import {
  selectFilteredSnapshots,
  selectTodaySnapshot,
  selectGoals,
  selectDashboardStatus,
} from '../dashboardSlice';
import { HealthSnapshot } from '../../../data/types';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  average,
  formatDate,
  getSleepQualityDescriptor,
} from '../../../utils/healthCalculations';
import { SLEEP_TARGET_HOURS, SLEEP_CHART_Y_DOMAIN, SLEEP_CHART_Y_TICKS } from '../../../data/constants';

const COLORS = {
  indigo: { 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1' },
  slate: { 50: '#f8fafc', 400: '#94a3b8' },
} as const;

const CHART_MARGIN = { top: 10, right: 10, left: -20, bottom: 0 };

const formatShortDate = (date: string): string => formatDate(date, true);

const formatSleepYAxisTick = (val: number): string => `${val}h`;

export interface SleepPanelProps {}

interface SleepTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: HealthSnapshot }>;
}

const SleepTooltip = memo(({ active, payload }: SleepTooltipProps) => {
  if (active && payload && payload.length) {
    const snapshot = payload[0].payload as HealthSnapshot | undefined;
    if (!snapshot) return null;
    const quality = getSleepQualityDescriptor(snapshot.sleepQualityScore);

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl text-xs border border-slate-700/50">
        <p className="text-slate-400 font-medium mb-1">
          {formatDate(snapshot.date)}
        </p>
        <p className="font-bold text-sm text-indigo-400 flex items-center justify-between gap-3">
          <span>Duration:</span>
          <span>{snapshot.sleepHours} hrs</span>
        </p>
        <p className="text-slate-300 text-xs flex items-center justify-between gap-3 mt-1">
          <span>Score:</span>
          <span className="font-semibold text-emerald-400">
            {snapshot.sleepQualityScore}/100 ({quality.label})
          </span>
        </p>
      </div>
    );
  }
  return null;
});

export const SleepPanel = memo((_props: SleepPanelProps) => {
  const snapshots = useAppSelector(selectFilteredSnapshots);
  const today = useAppSelector(selectTodaySnapshot);
  const goals = useAppSelector(selectGoals);
  const status = useAppSelector(selectDashboardStatus);

  const sleepGoalTarget = goals.find((g) => g.category === 'sleep')?.target || SLEEP_TARGET_HOURS;

  const { avgSleepHours, avgQualityScore, todayQuality } = useMemo(() => {
    if (snapshots.length === 0 || !today) {
      return { avgSleepHours: 0, avgQualityScore: 0, todayQuality: getSleepQualityDescriptor(0) };
    }
    const avgH = Math.round(average(snapshots.map((s) => s.sleepHours)) * 10) / 10;
    const avgQ = Math.round(average(snapshots.map((s) => s.sleepQualityScore)));
    const tq = getSleepQualityDescriptor(today.sleepQualityScore);
    return { avgSleepHours: avgH, avgQualityScore: avgQ, todayQuality: tq };
  }, [snapshots, today]);

  if (status === 'loading') {
    return (
      <Card >
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </Card>
    );
  }

  if (snapshots.length === 0 || !today) {
    return (
      <Card >
        <EmptyState
          title="No Sleep Telemetry Logged"
          description="Sleep stage metrics and quality scores will be visualized here."
          icon={<Moon className="w-6 h-6 text-slate-400" />}
        />
      </Card>
    );
  }

  return (
    <Card >
      <CardHeader
        title="Sleep & Circadian Rhythm"
        subtitle={`Nightly sleep duration with ${SLEEP_TARGET_HOURS}h baseline`}
        icon={<Moon className="w-5 h-5 text-indigo-600" />}
        action={
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${todayQuality.bgClass} ${todayQuality.colorClass} border border-indigo-100`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Score: {today.sleepQualityScore}/100</span>
          </span>
        }
      />

      {/* Mini Bar Chart */}
      <div className="h-44 sm:h-52 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={snapshots} margin={CHART_MARGIN}>
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={{ fontSize: 10, fill: COLORS.slate[400] }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={SLEEP_CHART_Y_DOMAIN}
              ticks={SLEEP_CHART_Y_TICKS}
              tick={{ fontSize: 10, fill: COLORS.slate[400] }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatSleepYAxisTick}
            />
            <Tooltip
              content={<SleepTooltip />}
              cursor={{ fill: COLORS.slate[50] }}
            />
            <ReferenceLine
              y={sleepGoalTarget}
              stroke={COLORS.indigo[400]}
              strokeDasharray="3 3"
              label={{
                value: `${sleepGoalTarget}h Goal`,
                position: 'insideTopRight',
                fill: COLORS.indigo[500],
                fontSize: 10,
              }}
            />
            <Bar dataKey="sleepHours" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false}>
              {snapshots.map((entry, index) => (
                <Cell
                  key={`sleep-cell-${index}`}
                  fill={entry.sleepHours >= sleepGoalTarget ? COLORS.indigo[500] : COLORS.indigo[300]}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sleep Insights Breakdown */}
      <div className="grid grid-cols-3 gap-2.5 pt-3.5 mt-2 border-t border-slate-100 text-center">
        <div className="bg-indigo-50/50 rounded-xl p-2.5 border border-indigo-100/50">
          <div className="flex items-center justify-center gap-1 text-[11px] text-indigo-700 font-medium">
            <BedDouble className="w-3 h-3" />
            <span>Last Night</span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-0.5 num-tabular">
            {today.sleepHours} hrs
          </p>
        </div>
        <div className="bg-slate-50/70 rounded-xl p-2.5">
          <p className="text-[11px] font-medium text-slate-400">Period Avg</p>
          <p className="text-sm font-bold text-slate-800 mt-0.5 num-tabular">
            {avgSleepHours} hrs
          </p>
        </div>
        <div className="bg-slate-50/70 rounded-xl p-2.5">
          <p className="text-[11px] font-medium text-slate-400">Quality Avg</p>
          <p className="text-sm font-bold text-emerald-600 mt-0.5 num-tabular">
            {avgQualityScore}/100
          </p>
        </div>
      </div>
    </Card>
  );
});
