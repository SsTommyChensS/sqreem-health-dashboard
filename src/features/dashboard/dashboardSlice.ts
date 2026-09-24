import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { HealthDataState, HealthSnapshot, NutritionEntry, Goal, RecentActivity, Persona } from '../../data/types';
import { fetchHealthData } from '../../lib/api';
import type { RootState, AppDispatch } from '../../app/store';

export type TimeRangeFilter = '7d' | '14d' | '30d';
export type ChartMetric = 'steps' | 'sleep' | 'heartRate' | 'weight' | 'calories';

export interface DashboardState {
  persona: Persona | null;
  dailySnapshots: HealthSnapshot[];
  nutrition: NutritionEntry[];
  goals: Goal[];
  recentActivities: RecentActivity[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  timeRange: TimeRangeFilter;
  selectedMetric: ChartMetric;
}

const initialState: DashboardState = {
  persona: null,
  dailySnapshots: [],
  nutrition: [],
  goals: [],
  recentActivities: [],
  status: 'idle',
  error: null,
  timeRange: '7d',
  selectedMetric: 'steps',
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setTimeRange: (state: DashboardState, action: PayloadAction<TimeRangeFilter>): void => {
      state.timeRange = action.payload;
    },
    setSelectedMetric: (state: DashboardState, action: PayloadAction<ChartMetric>): void => {
      state.selectedMetric = action.payload;
    },
    updateGoalProgress: (state: DashboardState, action: PayloadAction<{ id: string; current: number }>): void => {
      const goal: Goal | undefined = state.goals.find((g: Goal) => g.id === action.payload.id);
      if (goal) {
        goal.current = action.payload.current;
      }
    },
    setDataLoading: (state: DashboardState): void => {
      state.status = 'loading';
      state.error = null;
    },
    setDataLoaded: (state: DashboardState, action: PayloadAction<HealthDataState>): void => {
      state.status = 'succeeded';
      state.persona = action.payload.persona;
      state.dailySnapshots = action.payload.dailySnapshots;
      state.nutrition = action.payload.nutrition;
      state.goals = action.payload.goals;
      state.recentActivities = action.payload.recentActivities;
    },
    setDataError: (state: DashboardState, action: PayloadAction<string>): void => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  setTimeRange,
  setSelectedMetric,
  updateGoalProgress,
  setDataLoading,
  setDataLoaded,
  setDataError,
} = dashboardSlice.actions;

/** Async thunk — plain function, no createAsyncThunk */
export const loadHealthData = (shouldFail: boolean = false) => {
  return async (dispatch: AppDispatch): Promise<void> => {
    dispatch(setDataLoading());
    try {
      const data: HealthDataState = await fetchHealthData(shouldFail);
      dispatch(setDataLoaded(data));
    } catch (err: unknown) {
      const message: string = err instanceof Error ? err.message : 'Unknown error loading health data';
      dispatch(setDataError(message));
    }
  };
};

// Base selectors
export const selectDashboardState = (state: RootState): DashboardState => state.dashboard;
export const selectDashboardStatus = (state: RootState): DashboardState['status'] => state.dashboard.status;
export const selectDashboardError = (state: RootState): string | null => state.dashboard.error;
export const selectPersona = (state: RootState): Persona | null => state.dashboard.persona;
export const selectTimeRange = (state: RootState): TimeRangeFilter => state.dashboard.timeRange;
export const selectSelectedMetric = (state: RootState): ChartMetric => state.dashboard.selectedMetric;
export const selectAllSnapshots = (state: RootState): HealthSnapshot[] => state.dashboard.dailySnapshots;
export const selectGoals = (state: RootState): Goal[] => state.dashboard.goals;
export const selectRecentActivities = (state: RootState): RecentActivity[] => state.dashboard.recentActivities;
export const selectNutrition = (state: RootState): NutritionEntry[] => state.dashboard.nutrition;

// Derived selectors
export const selectTodaySnapshot = (state: RootState): HealthSnapshot | null => {
  const s: HealthSnapshot[] = state.dashboard.dailySnapshots;
  return s[s.length - 1] ?? null;
};

export const selectYesterdaySnapshot = (state: RootState): HealthSnapshot | null => {
  const s: HealthSnapshot[] = state.dashboard.dailySnapshots;
  return s[s.length - 2] ?? null;
};

export const selectFilteredSnapshots = createSelector(
  [selectAllSnapshots, selectTimeRange],
  (dailySnapshots: HealthSnapshot[], timeRange: TimeRangeFilter): HealthSnapshot[] => {
    const days: number = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    return dailySnapshots.slice(-days);
  }
);

export const selectTodayNutrition = (state: RootState): NutritionEntry | null => {
  const n: NutritionEntry[] = state.dashboard.nutrition;
  return n[n.length - 1] ?? null;
};

const selectDashboardPersona = (state: RootState): Persona | null => state.dashboard.persona;
const selectDashboardSnapshots = (state: RootState): HealthSnapshot[] => state.dashboard.dailySnapshots;
const selectDashboardNutrition = (state: RootState): NutritionEntry[] => state.dashboard.nutrition;
const selectDashboardGoals = (state: RootState): Goal[] => state.dashboard.goals;
const selectDashboardActivities = (state: RootState): RecentActivity[] => state.dashboard.recentActivities;

export const selectFullHealthData = createSelector(
  [selectDashboardPersona, selectDashboardSnapshots, selectDashboardNutrition, selectDashboardGoals, selectDashboardActivities],
  (persona, dailySnapshots, nutrition, goals, recentActivities): HealthDataState | null => {
    if (!persona) return null;
    return { persona, dailySnapshots, nutrition, goals, recentActivities };
  }
);

export default dashboardSlice.reducer;
