import { HealthDataState, LLMResponse, ApiResponse } from '../data/types';
import { mockPersonaData } from '../data/mockPersona';
import { MOCK_FETCH_DELAY_MS, API_REQUEST_TIMEOUT_MS, API_CHAT_ENDPOINT } from '../data/constants';

export async function fetchHealthData(shouldFail = false): Promise<HealthDataState> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Failed to retrieve biomarker telemetry from health server.'));
      } else {
        resolve(JSON.parse(JSON.stringify(mockPersonaData)));
      }
    }, MOCK_FETCH_DELAY_MS);
  });
}

export interface ChatApiPayload {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  healthContext: string;
}

export async function postChatMessage(payload: ChatApiPayload): Promise<LLMResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(API_CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json: ApiResponse<LLMResponse> = await response.json();

    if (!json.success) {
      throw new Error(json.message || 'Request failed');
    }

    if (!json.data) {
      throw new Error('No data received from server');
    }

    return json.data;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI assistant response timed out. Please try again.');
    }
    throw error;
  }
}
