import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, LLMResponse } from '../../data/types';
import { postChatMessage } from '../../lib/api';
import { LLM_MAX_HISTORY_MESSAGES } from '../../data/constants';
import type { RootState, AppDispatch } from '../../app/store';

export interface ChatState {
  messages: ChatMessage[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  isOpen: boolean;
  lastFailedPrompt: string | null;
}

const initialWelcomeMessage: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content:
    "Hello Anna! I'm your personal AI health companion, grounded in your latest health telemetry. Ask me anything about your steps, sleep trends, cardio activity, or nutrition progress!",
  confidence: 'high',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const initialState: ChatState = {
  messages: [initialWelcomeMessage],
  status: 'idle',
  error: null,
  isOpen: false,
  lastFailedPrompt: null,
};

export interface SendMessagePayload {
  message: string;
  healthContext: string;
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChat: (state: ChatState): void => {
      state.isOpen = !state.isOpen;
    },
    setChatOpen: (state: ChatState, action: PayloadAction<boolean>): void => {
      state.isOpen = action.payload;
    },
    clearChat: (state: ChatState): void => {
      state.messages = [initialWelcomeMessage];
      state.error = null;
      state.status = 'idle';
      state.lastFailedPrompt = null;
    },
    dismissError: (state: ChatState): void => {
      state.error = null;
    },
    addUserMessage: (state: ChatState, action: PayloadAction<string>): void => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: action.payload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      state.messages.push(userMsg);
      state.lastFailedPrompt = action.payload;
    },
    setChatLoading: (state: ChatState): void => {
      state.status = 'loading';
      state.error = null;
    },
    setChatFulfilled: (state: ChatState, action: PayloadAction<LLMResponse>): void => {
      state.status = 'idle';
      state.error = null;
      state.lastFailedPrompt = null;
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: action.payload.answer,
        highlightedMetrics: action.payload.highlightedMetrics,
        confidence: action.payload.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      state.messages.push(assistantMsg);
    },
    setChatRejected: (state: ChatState, action: PayloadAction<string>): void => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  toggleChat,
  setChatOpen,
  clearChat,
  dismissError,
  addUserMessage,
  setChatLoading,
  setChatFulfilled,
  setChatRejected,
} = chatSlice.actions;

/** Async thunk — plain function */
export const sendChatMessage = (payload: SendMessagePayload) => {
  return async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    dispatch(setChatLoading());
    try {
      const state: RootState = getState();
      const history: Array<{ role: 'user' | 'assistant'; content: string }> = state.chat.messages
        .slice(-LLM_MAX_HISTORY_MESSAGES)
        .map((m: ChatMessage) => ({ role: m.role, content: m.content }));

      const response: LLMResponse = await postChatMessage({
        message: payload.message,
        history,
        healthContext: payload.healthContext,
      });

      dispatch(setChatFulfilled(response));
    } catch (err: unknown) {
      const errorMsg: string = err instanceof Error ? err.message : 'Failed to reach AI assistant';
      dispatch(setChatRejected(errorMsg));
    }
  };
};

// Selectors
export const selectChatMessages = (state: RootState): ChatMessage[] => state.chat.messages;
export const selectChatStatus = (state: RootState): ChatState['status'] => state.chat.status;
export const selectChatError = (state: RootState): string | null => state.chat.error;
export const selectIsChatOpen = (state: RootState): boolean => state.chat.isOpen;
export const selectLastFailedPrompt = (state: RootState): string | null => state.chat.lastFailedPrompt;

export default chatSlice.reducer;
