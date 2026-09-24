import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import chatReducer from '../features/assistant/chatSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
