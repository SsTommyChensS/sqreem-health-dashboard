import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface UIState {
  activeTab: 'overview' | 'trends' | 'activity' | 'nutrition' | 'goals';
  toast: ToastNotification | null;
  simulateError: boolean;
}

const initialState: UIState = {
  activeTab: 'overview',
  toast: null,
  simulateError: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<UIState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    showToast: (state, action: PayloadAction<Omit<ToastNotification, 'id'>>) => {
      state.toast = {
        ...action.payload,
        id: `toast-${Date.now()}`,
      };
    },
    clearToast: (state) => {
      state.toast = null;
    },
    toggleSimulateError: (state) => {
      state.simulateError = !state.simulateError;
    },
  },
});

export const { setActiveTab, showToast, clearToast, toggleSimulateError } = uiSlice.actions;

export const selectActiveTab = (state: RootState) => state.ui.activeTab;
export const selectToast = (state: RootState) => state.ui.toast;
export const selectSimulateError = (state: RootState) => state.ui.simulateError;

export default uiSlice.reducer;
