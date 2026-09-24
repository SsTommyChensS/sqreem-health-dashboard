import { useMemo, memo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Apple, Utensils } from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';
import { selectTodayNutrition, selectDashboardStatus } from '../dashboardSlice';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatNumber } from '../../../utils/healthCalculations';
import {
  PROTEIN_TARGET_G,
  CARBS_TARGET_G,
  FAT_TARGET_G,
  CALORIE_INTAKE_TARGET,
  PROTEIN_CAL_PER_GRAM,
  CARBS_CAL_PER_GRAM,
  FAT_CAL_PER_GRAM,
  DONUT_INNER_RADIUS,
  DONUT_OUTER_RADIUS,
  DONUT_PADDING_ANGLE,
} from '../../../data/constants';

export interface NutritionPanelProps {}

const COLORS = {
  emerald: { 500: '#10b981' },
  blue: { 500: '#3b82f6' },
  amber: { 500: '#f59e0b' },
  slate: { 900: '#0f172a' },
} as const;

const MACRO_COLORS: Record<string, string> = {
  Protein: COLORS.emerald[500],
  Carbs: COLORS.blue[500],
  Fat: COLORS.amber[500],
};

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: '#0f172a',
  borderRadius: '0.75rem',
  color: '#fff',
  border: 'none',
  fontSize: '11px',
};

interface NutritionTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
  macroData: Array<{ name: string; grams: number }>;
}

const NutritionTooltip = memo(({ active, payload, macroData }: NutritionTooltipProps) => {
  if (active && payload && payload.length) {
    const valNum = Number(payload[0].value) || 0;
    const nameStr = String(payload[0].name);
    const item = macroData.find((m) => m.name === nameStr);
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl text-xs border border-slate-700/50">
        <p className="font-bold text-sm">{nameStr}</p>
        <p className="text-slate-400 mt-1">{valNum}% ({formatNumber(item?.grams || 0)}g)</p>
      </div>
    );
  }
  return null;
});

export const NutritionPanel = memo((_props: NutritionPanelProps) => {
  const nutrition = useAppSelector(selectTodayNutrition);
  const status = useAppSelector(selectDashboardStatus);

  const macroData = useMemo(() => {
    if (!nutrition) return [];
    const proteinCal = nutrition.protein_g * PROTEIN_CAL_PER_GRAM;
    const carbsCal = nutrition.carbs_g * CARBS_CAL_PER_GRAM;
    const fatCal = nutrition.fat_g * FAT_CAL_PER_GRAM;
    const totalMacroCal = proteinCal + carbsCal + fatCal;

    return [
      {
        name: 'Protein',
        grams: nutrition.protein_g,
        targetGrams: PROTEIN_TARGET_G,
        calories: proteinCal,
        percentage: Math.round((proteinCal / totalMacroCal) * 100),
        color: MACRO_COLORS.Protein,
      },
      {
        name: 'Carbs',
        grams: nutrition.carbs_g,
        targetGrams: CARBS_TARGET_G,
        calories: carbsCal,
        percentage: Math.round((carbsCal / totalMacroCal) * 100),
        color: MACRO_COLORS.Carbs,
      },
      {
        name: 'Fat',
        grams: nutrition.fat_g,
        targetGrams: FAT_TARGET_G,
        calories: fatCal,
        percentage: Math.round((fatCal / totalMacroCal) * 100),
        color: MACRO_COLORS.Fat,
      },
    ];
  }, [nutrition]);

  if (status === 'loading') {
    return (
      <Card >
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </Card>
    );
  }

  if (!nutrition) {
    return (
      <Card >
        <EmptyState
          title="No Nutrition Data Recorded"
          description="Log daily meals to see caloric balance and macronutrient breakdown."
          icon={<Apple className="w-6 h-6 text-slate-400" />}
        />
      </Card>
    );
  }

  return (
    <Card >
      <CardHeader
        title="Nutrition & Macros"
        subtitle="Today's caloric and macronutrient split"
        icon={<Utensils className="w-5 h-5 text-emerald-600" />}
        action={
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {formatNumber(nutrition.calories)} / {CALORIE_INTAKE_TARGET.toLocaleString()} kcal
          </span>
        }
      />

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
        {/* Donut Chart */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={<NutritionTooltip macroData={macroData} />}
                contentStyle={TOOLTIP_CONTENT_STYLE}
              />
              <Pie
                data={macroData}
                dataKey="percentage"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={DONUT_INNER_RADIUS}
                outerRadius={DONUT_OUTER_RADIUS}
                paddingAngle={DONUT_PADDING_ANGLE}
                isAnimationActive={false}
              >
                {macroData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Donut Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-extrabold text-slate-800 num-tabular">
              {formatNumber(nutrition.calories)}
            </span>
            <span className="text-[10px] text-slate-400">kcal</span>
          </div>
        </div>

        {/* Macro Bars */}
        <div className="flex-1 w-full space-y-2.5">
          {macroData.map((macro) => {
            const pctOfTarget = Math.min(100, Math.round((macro.grams / macro.targetGrams) * 100));
            return (
              <div key={macro.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: macro.color }}
                    />
                    {macro.name}
                  </span>
                  <span className="text-slate-500 font-medium">
                    <strong className="text-slate-900">{macro.grams}g</strong> / {macro.targetGrams}g
                    <span className="text-slate-400 text-[10px] ml-1">({macro.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${pctOfTarget}%`,
                      backgroundColor: macro.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
});
