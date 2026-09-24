import { memo } from 'react';
import { Sparkles } from 'lucide-react';

export const TypingIndicator = memo(() => {
  return (
    <div className="flex items-start gap-2.5 my-2">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
        <Sparkles className="w-3.5 h-3.5" />
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
        <div className="flex items-center gap-1.5 h-4">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" />
        </div>
      </div>
    </div>
  );
});
