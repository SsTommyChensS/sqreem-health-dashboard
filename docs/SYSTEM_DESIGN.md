# System Design — Health Insight Dashboard

## 1. Product Goal

Build a personal health dashboard that helps a (fictional) user understand:
- Current health status (overview metrics)
- Trends over time
- Activity, sleep, nutrition
- Goals and progress
- Recommendations for improvement
- An AI assistant to ask questions grounded in that same data

Since the brief has no fixed layout, the key thing to demonstrate is **product thinking**: what to show, why, and what to prioritize.

## 2. Tech Stack

| Area | Choice | Reason |
|---|---|---|
| Build tool | Vite + React + TypeScript | Fast, current standard, easy to deploy on Vercel |
| State management | Redux Toolkit (RTK) + RTK Query | Standardized store, API caching, less boilerplate |
| UI | Tailwind CSS + shadcn/ui (or MUI) | Fast responsive styling, consistent design |
| Charting | Recharts | Lightweight, declarative in React, covers needed chart types (line, bar, radial) |
| LLM Provider | OpenAI (gpt-4o-mini) or Anthropic Claude (Haiku) | Cheap, fast enough for chat, supports JSON mode / structured output |
| Backend for LLM | Vercel Serverless Function (Node) | Hides the API key, avoids calling the LLM directly from the client |
| Deployment | Vercel | Free, ships with serverless functions built in |

> Key decision: **never call the LLM API directly from the frontend**, since that would leak the API key in the bundle. Every AI request goes through a single `/api/chat` serverless endpoint that acts as a proxy and builds the prompt.

## 3. Overall Architecture

```
┌─────────────────────────────┐
│  React SPA (Vite + TS)      │
│  ┌────────────────────────┐ │
│  │ Redux Store             │ │
│  │  - healthDataSlice       │ │
│  │  - uiSlice (loading/err) │ │
│  │  - chatSlice             │ │
│  └────────────────────────┘ │
│  Dashboard Components         │
│  AI Assistant (floating chat) │
└───────────────┬──────────────┘
                │ fetch /api/chat
                ▼
┌─────────────────────────────┐
│  Vercel Serverless Function   │
│  /api/chat.ts                 │
│  - Receives: userMessage,     │
│    healthDataSnapshot,        │
│    chatHistory                │
│  - Builds system prompt        │
│  - Calls LLM Provider API      │
│  - Validates & returns          │
│    a well-formed JSON response │
└───────────────┬──────────────┘
                ▼
        LLM Provider API (OpenAI/Anthropic)
```

## 4. Folder Structure (proposed)

```
src/
  app/
    store.ts
    hooks.ts
  data/
    mockPersona.ts        # mock persona + health data
    types.ts               # HealthData, Persona, Goal, SleepEntry,...
  features/
    dashboard/
      dashboardSlice.ts
      components/
        SummaryCards.tsx
        ActivityChart.tsx
        SleepPanel.tsx
        NutritionPanel.tsx
        GoalsPanel.tsx
        TrendsChart.tsx
        RecommendationsList.tsx
        RecentActivityFeed.tsx
    assistant/
      chatSlice.ts
      components/
        FloatingChatButton.tsx
        ChatWindow.tsx
        ChatMessage.tsx
  components/ui/           # button, card, skeleton, spinner (shared)
  lib/
    api.ts                 # fetch wrapper for /api/chat
    promptBuilder.ts        # builds the context sent to the backend
  pages/ (or App.tsx if single-page)
api/
  chat.ts                  # Vercel serverless function
.env.example
README.md
```

## 5. Data Model (example — to be aligned once the actual assessment data is provided)

```ts
interface Persona {
  name: string;
  age: number;
  gender: string;
  goalsSummary: string;
}

interface HealthSnapshot {
  date: string;
  steps: number;
  heartRateAvgBpm: number;
  caloriesBurned: number;
  sleepHours: number;
  sleepQualityScore: number; // 0-100
  waterIntakeMl: number;
  weightKg: number;
}

interface NutritionEntry {
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
}

interface HealthDataState {
  persona: Persona;
  dailySnapshots: HealthSnapshot[];   // used for trends/progress
  nutrition: NutritionEntry[];
  goals: Goal[];
  recentActivities: { date: string; type: string; durationMin: number }[];
}
```

## 6. Proposed Dashboard Layout (information priority)

1. **Header**: persona name, current date, quick streak/overview.
2. **Summary cards** (first row, highest priority — the "vital signs"): today's steps, sleep, calories, heart rate — each with a % change vs. yesterday/goal.
3. **Trends section**: 7-30 day line/area chart for steps, sleep, weight — to show "is this going up or down."
4. **Goals**: progress bar per goal, remaining amount to reach it.
5. **Sleep panel**: sleep hours chart + quality.
6. **Nutrition panel**: macro breakdown (donut/stacked bar) for the day.
7. **Recommendations**: rule-based list (not AI) driven by data thresholds (e.g. sleep < 6h → suggest sleeping earlier) — kept separate from the AI Assistant.
8. **Recent activities feed**: timeline/list style.
9. **Floating AI Assistant** (bottom-right, always visible, high z-index, expands into a chat panel).

Rationale: follows an "F-pattern" — most important overview info first, details/exploration after, and the AI action (ask more) always available in the corner.

## 7. AI Assistant — Flow

1. User clicks the floating button → opens `ChatWindow`.
2. User types a question → dispatches `chatSlice.sendMessage`.
3. Frontend calls `POST /api/chat` with:
   ```json
   {
     "message": "How am I progressing?",
     "history": [ { "role": "user"/"assistant", "content": "..." } ],
     "healthContext": { ...trimmed summary from Redux store... }
   }
   ```
4. The serverless function builds the system prompt (see `PROMPT_DESIGN.md`) and calls the LLM.
5. Response received → structure validated → returned to the client.
6. Client renders the message (with a loading state while waiting, an error state on failure, and a retry option).

## 8. Loading / Error / Empty States

- **Loading**: skeletons for each card/chart while mock data is (simulated) loading, a spinner in `ChatWindow` while waiting on the LLM.
- **Error**: an error banner if data fetch or the LLM call fails (with a "Retry" button); the whole app should not crash (Error Boundary).
- **Empty**: if part of the data is missing (e.g. no goals yet), show an empty-state card with a suggested action instead of leaving a blank area.

## 9. Responsive Design

- Mobile-first, default Tailwind breakpoints (sm/md/lg/xl).
- Grid layout: 1 column on mobile → 2 columns on tablet → 3-4 columns on desktop for summary cards.
- `ChatWindow` is full-screen on mobile, a floating panel on desktop.

## 10. Security

- The LLM API key lives only in a server-side environment variable (`OPENAI_API_KEY` / `ANTHROPIC_API_KEY`), never exposed via `VITE_*`.
- `.env` is in `.gitignore`; `.env.example` documents the required variables.
- Basic rate limiting on the serverless function (optional but worth mentioning in the README) to avoid spamming the LLM and racking up cost.
