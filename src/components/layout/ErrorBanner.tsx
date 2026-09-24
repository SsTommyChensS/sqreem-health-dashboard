import { memo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export const ErrorBanner = memo(({ message, onRetry }: ErrorBannerProps) => {
  return (
    <div className="rounded-2xl bg-rose-50 border border-rose-200/80 p-4 text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-900">Health Telemetry Synchronization Error</h4>
          <p className="text-xs text-rose-700 mt-0.5">{message}</p>
        </div>
      </div>
      <Button
        variant="danger"
        size="sm"
        icon={<RefreshCw className="w-3.5 h-3.5" />}
        onClick={onRetry}
        className="self-start sm:self-auto flex-shrink-0"
      >
        Retry Sync
      </Button>
    </div>
  );
});
