import { memo, useMemo, useCallback } from 'react';
import { Flame, RefreshCw, Sparkles, User, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  selectPersona,
  selectTimeRange,
  setTimeRange,
  loadHealthData,
  selectDashboardStatus,
  TimeRangeFilter,
} from '../../features/dashboard/dashboardSlice';
import { toggleSimulateError, selectSimulateError } from '../../features/ui/uiSlice';
import { toggleChat } from '../../features/assistant/chatSlice';
import { Button } from '../ui/Button';

export const Header = memo(() => {
  const dispatch = useAppDispatch();
  const persona = useAppSelector(selectPersona);
  const timeRange = useAppSelector(selectTimeRange);
  const status = useAppSelector(selectDashboardStatus);
  const simulateError = useAppSelector(selectSimulateError);

  const handleRefresh = useCallback(() => {
    dispatch(loadHealthData(simulateError));
  }, [dispatch, simulateError]);

  const handleRangeChange = useCallback((range: TimeRangeFilter) => {
    dispatch(setTimeRange(range));
  }, [dispatch]);

  const handleToggleErrorMode = useCallback(() => {
    dispatch(toggleSimulateError());
  }, [dispatch]);

  const handleOpenChat = useCallback(() => {
    dispatch(toggleChat());
  }, [dispatch]);

  const todayFormatted = useMemo(() => new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date()), []);

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* User info & Persona */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/10">
                <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-emerald-600 font-bold text-base">
                  {persona ? (
                    persona.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                  ) : (
                    <User className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20" />
            </div>

              <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {persona?.name || 'Personal Health'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-600 border border-orange-200/60">
                  <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                  12-day streak
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>{todayFormatted}</span>
                <span>•</span>
                <span>{persona ? `${persona.age} yrs • ${persona.occupation}` : 'Telemetry'}</span>
              </p>
            </div>
          </div>

          {/* Controls: Time Filter, Refresh, Simulate Error, AI Quick Trigger */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Time Filter Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium">
              {(['7d', '14d', '30d'] as TimeRangeFilter[]).map((range) => (
                <button
                  key={range}
                  onClick={() => handleRangeChange(range)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeRange === range
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'hover:text-slate-900 text-slate-500'
                  }`}
                  aria-label={`Show ${range.toUpperCase()} data range`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Refresh Data Button */}
            <Button
              variant="outline"
              size="sm"
              icon={
                <RefreshCw
                  className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin text-emerald-600' : ''}`}
                />
              }
              onClick={handleRefresh}
              disabled={status === 'loading'}
              ariaLabel="Refresh health telemetry data"
              title="Refresh Health Telemetry"
            >
              <span className="hidden sm:inline">Sync</span>
            </Button>

            {/* Test toggle to simulate API error for assessment review */}
            <button
              onClick={handleToggleErrorMode}
              className={`p-2 rounded-xl text-xs border transition-all ${
                simulateError
                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-medium'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={simulateError ? 'Simulate Error Mode is ON (Click to disable)' : 'Test Error Handling (Simulate Error)'}
              aria-label="Toggle error simulation"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>

            {/* AI Assistant Quick Opener */}
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-emerald-200" />}
              onClick={handleOpenChat}
              ariaLabel="Open AI Health Assistant"
            >
              <span>Ask AI</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
});
