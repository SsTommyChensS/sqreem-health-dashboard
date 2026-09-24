import { useEffect, useCallback, Suspense, lazy } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import {
  loadHealthData,
  selectDashboardStatus,
  selectDashboardError,
} from './features/dashboard/dashboardSlice';
import { selectSimulateError } from './features/ui/uiSlice';
import { Header } from './components/layout/Header';
import { ErrorBanner } from './components/layout/ErrorBanner';
import { SummaryCards } from './features/dashboard/components/SummaryCards';
import { Skeleton } from './components/ui/Skeleton';

const TrendsChart = lazy(() =>
  import('./features/dashboard/components/TrendsChart').then((m) => ({ default: m.TrendsChart }))
);
const ActivityChart = lazy(() =>
  import('./features/dashboard/components/ActivityChart').then((m) => ({ default: m.ActivityChart }))
);
const SleepPanel = lazy(() =>
  import('./features/dashboard/components/SleepPanel').then((m) => ({ default: m.SleepPanel }))
);
const NutritionPanel = lazy(() =>
  import('./features/dashboard/components/NutritionPanel').then((m) => ({ default: m.NutritionPanel }))
);
const GoalsPanel = lazy(() =>
  import('./features/dashboard/components/GoalsPanel').then((m) => ({ default: m.GoalsPanel }))
);
const RecommendationsList = lazy(() =>
  import('./features/dashboard/components/RecommendationsList').then((m) => ({ default: m.RecommendationsList }))
);
const RecentActivityFeed = lazy(() =>
  import('./features/dashboard/components/RecentActivityFeed').then((m) => ({ default: m.RecentActivityFeed }))
);
const FloatingChatButton = lazy(() =>
  import('./features/assistant/components/FloatingChatButton').then((m) => ({ default: m.FloatingChatButton }))
);
const ChatWindow = lazy(() =>
  import('./features/assistant/components/ChatWindow').then((m) => ({ default: m.ChatWindow }))
);

const ChartFallback = (
  <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-8 w-60 rounded-xl" />
    </div>
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);

const PanelFallback = (
  <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    <Skeleton className="h-48 w-full rounded-xl" />
  </div>
);

const App = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectDashboardStatus);
  const error = useAppSelector(selectDashboardError);
  const simulateError = useAppSelector(selectSimulateError);

  useEffect(() => {
    dispatch(loadHealthData(simulateError));
  }, [dispatch, simulateError]);

  const handleRetry = useCallback(() => {
    dispatch(loadHealthData(false));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* App Header */}
      <Header />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Banner when telemetry load fails */}
        {status === 'failed' && error && (
          <ErrorBanner message={error} onRetry={handleRetry} />
        )}

        {/* Section 1: Vital Signs (4 Summary Cards) */}
        <section aria-labelledby="vital-signs-heading">
          <h2 id="vital-signs-heading" className="sr-only">
            Vital Signs and Daily Metrics
          </h2>
          <SummaryCards />
        </section>

        {/* Section 2: Interactive Charts (Trends & Daily Activity) */}
        <section
          aria-labelledby="charts-heading"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <h2 id="charts-heading" className="sr-only">
            Biomarker Trends and Daily Activity Charts
          </h2>
          <Suspense fallback={ChartFallback}>
            <TrendsChart />
          </Suspense>
          <Suspense fallback={ChartFallback}>
            <ActivityChart />
          </Suspense>
        </section>

        {/* Section 3: Sleep and Nutrition Panels */}
        <section
          aria-labelledby="sleep-nutrition-heading"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <h2 id="sleep-nutrition-heading" className="sr-only">
            Sleep Recovery and Nutrition Panels
          </h2>
          <Suspense fallback={PanelFallback}>
            <SleepPanel />
          </Suspense>
          <Suspense fallback={PanelFallback}>
            <NutritionPanel />
          </Suspense>
        </section>

        {/* Section 4: Goals, Recommendations, and Recent Activity Feed */}
        <section
          aria-labelledby="insights-heading"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <h2 id="insights-heading" className="sr-only">
            Goals, Automated Recommendations, and Recent Activity Feed
          </h2>
          <Suspense fallback={PanelFallback}>
            <GoalsPanel />
          </Suspense>
          <Suspense fallback={PanelFallback}>
            <RecommendationsList />
          </Suspense>
          <Suspense fallback={PanelFallback}>
            <RecentActivityFeed />
          </Suspense>
        </section>
      </main>

      {/* Floating AI Assistant Components */}
      <Suspense fallback={null}>
        <FloatingChatButton />
        <ChatWindow />
      </Suspense>
    </div>
  );
};

export default App;
