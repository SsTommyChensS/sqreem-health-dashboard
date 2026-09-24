import { memo, useCallback } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { toggleChat, selectIsChatOpen } from '../chatSlice';

export const FloatingChatButton = memo(() => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsChatOpen);

  const handleToggle = useCallback(() => {
    dispatch(toggleChat());
  }, [dispatch]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleToggle}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-400/30 active:scale-95 ${
          isOpen
            ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-900/20'
            : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-400 shadow-emerald-600/30'
        }`}
        aria-label={isOpen ? 'Close AI Health Assistant' : 'Open AI Health Assistant'}
      >
        {/* Glow pulse when closed */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-2xl bg-emerald-500/20 animate-pulse pointer-events-none" />
        )}

        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
          ) : (
            <Sparkles className="w-6 h-6 transition-transform group-hover:scale-110" />
          )}
        </div>

        {/* Small floating badge */}
        {!isOpen && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
          </span>
        )}
      </button>
    </div>
  );
});
