import { memo, useMemo, type ReactNode } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Footprints, Moon, HeartPulse, Scale, Flame } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  selectFilteredSnapshots,
  selectSelectedMetric,
  setSelectedMetric,
  selectDashboardStatus,
  selectTimeRange,
  ChartMetric,
} from '../dashboardSlice';
import { HealthSnapshot } from '../../../data/types';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { average, formatDate, formatNumber } from '../../../utils/healthCalculations';
import {
  CHART_K_FORMAT_THRESHOLD,
  CHART_GRADIENT_OPACITY_START,
  CHART_GRADIENT_OPACITY_END,
  CHART_ACTIVE_DOT_RADIUS,
  WEIGHT_CHART_Y_PADDING,
  Y_AXIS_UPPER_SCALE_DEFAULT,
} from '../../../data/constants';

const COLORS = {
  emerald: { 50: '#ecfdf5', 500: '#10b981' },
  indigo: { 50: '#eef2ff', 500: '#6366f1' },
  rose: { 50: '#fff1f2', 500: '#f43f5e' },
  sky: { 50: '#f0f9ff', 600: '#0284c7' },
  amber: { 50: '#fffbeb', 500: '#f59e0b' },
  slate: { 50: '#f8fafc', 100: '#f1f5f9', 400: '#94a3b8', 500: '#64748b' },
} as const;

export interface TrendsChartProps {}

interface MetricConfig {
  key: keyof HealthSnapshot;
  label: string;
  unit: string;
  stroke: string;
  fill: string;
  gradientId: string;
  icon: ReactNode;
}

const METRIC_CONFIGS: Record<ChartMetric, MetricConfig> = {
  steps: {
    key: 'steps',
    label: 'Daily Steps',
    unit: 'steps',
    stroke: COLORS.emerald[500],
    fill: COLORS.emerald[50],
    gradientId: 'gradient-steps',
    icon: <Footprints className="w-3.5 h-3.5" />,
  },
  sleep: {
    key: 'sleepHours',
    label: 'Sleep Duration',
    unit: 'hours',
    stroke: COLORS.indigo[500],
    fill: COLORS.indigo[50],
    gradientId: 'gradient-sleep',
    icon: <Moon className="w-3.5 h-3.5" />,
  },
  heartRate: {
    key: 'heartRateAvgBpm',
    label: 'Resting Heart Rate',
    unit: 'bpm',
    stroke: COLORS.rose[500],
    fill: COLORS.rose[50],
    gradientId: 'gradient-hr',
    icon: <HeartPulse className="w-3.5 h-3.5" />,
  },
  weight: {
    key: 'weightKg',
    label: 'Weight',
    unit: 'kg',
    stroke: COLORS.sky[600],
    fill: COLORS.sky[50],
    gradientId: 'gradient-weight',
    icon: <Scale className="w-3.5 h-3.5" />,
  },
  calories: {
    key: 'caloriesBurned',
    label: 'Calories Burned',
    unit: 'kcal',
    stroke: COLORS.amber[500],
    fill: COLORS.amber[50],
    gradientId: 'gradient-cal',
    icon: <Flame className="w-3.5 h-3.5" />,
  },
};

const CHART_MARGIN = { top: 10, right: 10, left: -20, bottom: 0 };

const formatShortDate = (date: string): string => formatDate(date, true);

const formatYAxisTick = (val: number): string =>
  val >= CHART_K_FORMAT_THRESHOLD ? `${(val / 1000).toFixed(0)}k` : `${val}`;

interface TrendsTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string; payload?: HealthSnapshot; color?: string }>;
  unit: string;
}

const TrendsTooltip = memo(({ active, payload, unit }: TrendsTooltipProps) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const snapshot = entry.payload as HealthSnapshot | undefined;
    const val = typeof entry.value === 'number' ? entry.value : 0;
    if (!snapshot) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl text-xs border border-slate-700/50">
        <p className="text-slate-400 font-medium mb-1">
          {formatDate(snapshot.date)}
        </p>
        <p className="font-bold text-sm text-white flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color || '#10b981' }}
          />
          <span>{formatNumber(val)}</span>
          <span className="text-slate-400 text-xs font-normal">
            {unit}
          </span>
        </p>
      </div>
    );
  }
  return null;
});

export const TrendsChart = memo((_props: TrendsChartProps) => {
  const dispatch = useAppDispatch();
  const snapshots = useAppSelector(selectFilteredSnapshots);
  const selectedMetric = useAppSelector(selectSelectedMetric);
  const status = useAppSelector(selectDashboardStatus);
  const timeRange = useAppSelector(selectTimeRange);

  const currentConfig = METRIC_CONFIGS[selectedMetric] || METRIC_CONFIGS.steps;

  const { avgVal, minVal, maxVal, yDomainMin, yDomainMax } = useMemo(() => {
    if (snapshots.length === 0) {
      return { avgVal: 0, minVal: 0, maxVal: 0, yDomainMin: 0, yDomainMax: 100 };
    }
    const vals = snapshots.map((s) => Number(s[currentConfig.key]));
    const avg = average(vals);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const yMin = selectedMetric === 'weight' ? min - WEIGHT_CHART_Y_PADDING : Math.max(0, Math.floor(min * 0.9));
    const yMax = selectedMetric === 'weight' ? max + WEIGHT_CHART_Y_PADDING : Math.ceil(max * Y_AXIS_UPPER_SCALE_DEFAULT);
    return { avgVal: avg, minVal: min, maxVal: max, yDomainMin: yMin, yDomainMax: yMax };
  }, [snapshots, currentConfig.key, selectedMetric]);

  if (status === 'loading') {
    return (
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-60 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </Card>
    );
  }

  if (snapshots.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No Trend Telemetry Available"
          description="We need at least a few days of data to generate trends."
          icon={<TrendingUp className="w-6 h-6 text-slate-400" />}
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Biomarker Trends"
        subtitle={`Chronological trajectory over the last ${
          timeRange === '7d' ? '7 days' : timeRange === '14d' ? '14 days' : '30 days'
        }`}
        icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        action={
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium overflow-x-auto max-w-full">
            {(Object.keys(METRIC_CONFIGS) as ChartMetric[]).map((key) => {
              const cfg = METRIC_CONFIGS[key];
              const isSelected = selectedMetric === key;
              return (
                <button
                  key={key}
                  onClick={() => dispatch(setSelectedMetric(key))}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  aria-label={`Show ${cfg.label} trend`}
                >
                  <span className={isSelected ? 'text-emerald-600' : 'text-slate-400'}>
                    {cfg.icon}
                  </span>
                  <span>{cfg.label.replace('Daily ', '').replace('Resting ', '')}</span>
                </button>
              );
            })}
          </div>
        }
      />

      {/* Chart container */}
      <div className="h-64 sm:h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={snapshots} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.stroke} stopOpacity={CHART_GRADIENT_OPACITY_START} />
                <stop offset="95%" stopColor={currentConfig.stroke} stopOpacity={CHART_GRADIENT_OPACITY_END} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.slate[100]} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={{ fontSize: 11, fill: COLORS.slate[400] }}
              tickLine={false}
              axisLine={{ stroke: COLORS.slate[100] }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[yDomainMin, yDomainMax]}
              tick={{ fontSize: 11, fill: COLORS.slate[400] }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxisTick}
            />
            <Tooltip
              content={<TrendsTooltip unit={currentConfig.unit} />}
            />
            <ReferenceLine
              y={avgVal}
              stroke={COLORS.slate[400]}
              strokeDasharray="4 4"
              label={{
                value: `Avg: ${avgVal} ${currentConfig.unit}`,
                position: 'insideTopRight',
                fill: COLORS.slate[500],
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey={currentConfig.key}
              stroke={currentConfig.stroke}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${currentConfig.gradientId})`}
              activeDot={{ r: CHART_ACTIVE_DOT_RADIUS, strokeWidth: 2, stroke: '#ffffff' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-3 gap-3 pt-4 mt-2 border-t border-slate-100 text-center">
        <div className="bg-slate-50/70 rounded-xl p-2.5">
          <p className="text-[11px] font-medium text-slate-400">Period Average</p>
          <p className="text-sm font-bold text-slate-800 mt-0.5 num-tabular">
            {formatNumber(avgVal)} {currentConfig.unit}
          </p>
        </div>
        <div className="bg-slate-50/70 rounded-xl p-2.5">
          <p className="text-[11px] font-medium text-slate-400">Peak High</p>
          <p className="text-sm font-bold text-emerald-600 mt-0.5 num-tabular">
            {formatNumber(maxVal)} {currentConfig.unit}
          </p>
        </div>
        <div className="bg-slate-50/70 rounded-xl p-2.5">
          <p className="text-[11px] font-medium text-slate-400">Lowest</p>
          <p className="text-sm font-bold text-slate-700 mt-0.5 num-tabular">
            {formatNumber(minVal)} {currentConfig.unit}
          </p>
        </div>
      </div>
    </Card>
  );
});
