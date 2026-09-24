import { useState, useRef, useEffect, memo } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { CHAT_FOCUS_DELAY_MS, CHAT_INPUT_MAX_LENGTH } from '../../../data/constants';
import {
  selectChatMessages,
  selectChatStatus,
  selectChatError,
  selectIsChatOpen,
  selectLastFailedPrompt,
  sendChatMessage,
  addUserMessage,
  clearChat,
  setChatOpen,
} from '../chatSlice';
import { selectFullHealthData } from '../../dashboard/dashboardSlice';
import { buildHealthContext } from '../../../lib/promptBuilder';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

const PRESET_QUESTIONS = [
  'How am I progressing this week?',
  'What should I focus on today?',
  'How was my sleep quality recently?',
  'Am I hitting my daily protein target?',
];

export const ChatWindow = memo(() => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsChatOpen);
  const messages = useAppSelector(selectChatMessages);
  const status = useAppSelector(selectChatStatus);
  const error = useAppSelector(selectChatError);
  const lastFailedPrompt = useAppSelector(selectLastFailedPrompt);
  const healthData = useAppSelector(selectFullHealthData);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages or typing indicator
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, status, isOpen]);

  // Focus input when chat window opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), CHAT_FOCUS_DELAY_MS);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const message = (textToSend || input).trim();
    if (!message || status === 'loading') return;

    // Build fresh context string grounded in current Redux state
    const healthContext = healthData ? buildHealthContext(healthData) : '{}';

    // Dispatch user message to UI immediately
    dispatch(addUserMessage(message));
    setInput('');

    // Trigger LLM API call
    dispatch(sendChatMessage({ message, healthContext }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = () => {
    if (!lastFailedPrompt || status === 'loading') return;
    const healthContext = healthData ? buildHealthContext(healthData) : '{}';
    dispatch(sendChatMessage({ message: lastFailedPrompt, healthContext }));
  };

  return (
    <div
      className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[420px] sm:h-[600px] bg-white sm:rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col z-50 overflow-clip transition-all duration-300 animate-in fade-in zoom-in-95"
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Health AI Companion</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>Grounded in Anna&apos;s Telemetry</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch(clearChat())}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => dispatch(setChatOpen(false))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            aria-label="Close chat window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preset Suggestion Chips */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2 overflow-x-auto flex-shrink-0 min-w-0 w-full scrollbar-thin">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
          Suggestions:
        </span>
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={status === 'loading'}
            className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200/80 shadow-xs whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-slate-50/40">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing indicator while LLM responds */}
        {status === 'loading' && <TypingIndicator />}

        {/* Error notification banner with retry */}
        {status === 'failed' && error && (
          <div className="my-3 p-3 rounded-2xl bg-rose-50 border border-rose-200/70 text-rose-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900 bg-white px-2 py-1 rounded-lg border border-rose-200 text-xs shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            maxLength={CHAT_INPUT_MAX_LENGTH}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about steps, sleep, cardio, or calories..."
            disabled={status === 'loading'}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-2xl pl-4 pr-20 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
            aria-label="Ask AI Assistant a question"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 select-none">
              {input.length}/500
            </span>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || status === 'loading'}
              className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-emerald-600 active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-400 mt-2">
          AI answers strictly grounded in Anna&apos;s health data. No medical diagnosis provided.
        </p>
      </div>
    </div>
  );
});
