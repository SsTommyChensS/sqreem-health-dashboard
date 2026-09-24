import { memo } from 'react';
import { Sparkles, User, AlertCircle, TrendingUp } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../../data/types';

export interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-start gap-2.5 my-3 ${
        isUser ? 'flex-row-reverse self-end' : 'self-start'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
          isUser
            ? 'bg-slate-800 text-white'
            : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
            isUser
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs'
              : 'bg-white border border-slate-100 text-slate-800 rounded-tl-xs'
          }`}
        >
          {/* Main message text */}
          <div className="whitespace-pre-line space-y-1.5">{message.content}</div>

          {/* Highlighted Metrics pills if present */}
          {message.highlightedMetrics && message.highlightedMetrics.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
              {message.highlightedMetrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-800 text-[11px] font-medium"
                >
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-slate-500">{metric.label}:</span>
                  <span className="font-bold text-emerald-900">{metric.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Low confidence / insufficient data alert */}
          {message.confidence === 'insufficient_data' && (
            <div className="mt-2.5 pt-2 border-t border-amber-100/60 flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50/60 px-2.5 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
              <span>
                Note: There isn&apos;t enough biomarker telemetry recorded to answer this precisely.
              </span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={`text-[10px] text-slate-400 mt-1 px-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
});
