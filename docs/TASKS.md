# Task Plan — Health Insight Dashboard

Estimated total time: 1-2 focused working days. Check off `[x]` as you go, and commit in small groups (see `RULES.md`).

## Phase 0 — Project Setup
- [x] Scaffold project: `npm create vite@latest health-dashboard -- --template react-ts`
- [x] Install and configure Tailwind CSS
- [x] Install Redux Toolkit + react-redux, set up `store.ts`, `hooks.ts` (`useAppDispatch`, `useAppSelector`)
- [x] Install Recharts
- [x] Configure ESLint + Prettier
- [x] Create the folder structure from `SYSTEM_DESIGN.md`
- [x] Set up `.env.example` and `.gitignore` (make sure `.env` is ignored)
- [x] `git init`, first commit `chore: init project setup` (skipped git actions per user instruction)

## Phase 1 — Data & Types
- [x] Define types in `data/types.ts` (Persona, HealthSnapshot, NutritionEntry, Goal, Activity)
- [x] Create `data/mockPersona.ts` with a reasonable fictional persona (if the assessment hasn't supplied specific data yet, invent one, e.g. "Anna, 32, focused on improving cardiovascular health and sleep") plus 14-30 days of sample data (steps, sleep, calories, weight, nutrition)
- [x] Write helper functions: `average()`, `percentChange()`, `goalProgressPercent()`

## Phase 2 — Redux Slices
- [x] `dashboardSlice`: state `{ persona, dailySnapshots, nutrition, goals, recentActivities, status, error }`
- [x] `loadHealthData` thunk (simulated async, e.g. `setTimeout` + mock import) to get a real loading state
- [x] `uiSlice` if needed (theme, layout state) — can be merged into `dashboardSlice` if kept simple
- [x] `chatSlice`: state `{ messages: [], status, error }`, `sendChatMessage` thunk

## Phase 3 — Layout & Summary Cards
- [x] `App.tsx` overall layout (header + content grid + floating chat)
- [x] `SummaryCards.tsx`: today's steps / sleep / calories / heart rate, compared with yesterday
- [x] Skeleton loading state for cards
- [x] Empty state if today's data isn't available yet

## Phase 4 — Trends & Charts
- [x] `TrendsChart.tsx`: 7-30 day line chart (steps or weight), switchable metric via tabs/select
- [x] `ActivityChart.tsx`: bar chart of daily activity
- [x] Tooltips, legend, responsive width (Recharts `ResponsiveContainer`)

## Phase 5 — Sleep, Nutrition, Goals, Recommendations, Recent Activity
- [x] `SleepPanel.tsx`: sleep hours chart + sleep quality
- [x] `NutritionPanel.tsx`: macro breakdown (donut or stacked bar) for the latest day
- [x] `GoalsPanel.tsx`: progress bar per goal, remaining amount needed
- [x] `RecommendationsList.tsx`: rule-based, e.g.:
  - last-7-day average sleep < 6.5h → suggest sleeping earlier
  - average steps below goal → suggest more activity
  - protein intake low → suggest adding protein
- [x] `RecentActivityFeed.tsx`: timeline/list of recent activities

## Phase 6 — AI Assistant UI
- [x] `FloatingChatButton.tsx`: fixed round button, bottom-right, toggles `ChatWindow`
- [x] `ChatWindow.tsx`: message list, input field, send button, auto-scroll to bottom
- [x] `ChatMessage.tsx`: distinct styling for user vs. assistant, renders `highlightedMetrics` if present
- [x] Loading indicator while waiting for a response (typing dots)
- [x] Error state inside the chat + "Retry" button
- [x] Responsive: full-screen on mobile

## Phase 7 — Backend Proxy & LLM Integration
- [x] Create `api/chat.ts` (Vercel serverless function supporting Gemini, OpenAI, Anthropic)
- [x] Install the chosen provider's SDK (`@google/genai`, `openai`, `@anthropic-ai/sdk`)
- [x] Implement `promptBuilder.ts` (builds the `<health_data>` context)
- [x] Build the system prompt per `PROMPT_DESIGN.md`
- [x] Call the API, parse the structured JSON response, validate the schema (e.g. with `zod`)
- [x] Handle errors/timeouts/fallback responses
- [x] Wire the `chatSlice` thunk to the `/api/chat` endpoint
- [x] Test with the sample questions from the brief (progressing, focus, activity change, summary, improve)

## Phase 8 — Responsive, Loading/Error/Empty States Across the App
- [x] Check responsiveness at 375px, 768px, 1280px
- [x] Wrap the app in an Error Boundary
- [x] Confirm every data-driven section has all 3 states: loading / error / empty / populated

## Phase 9 — README & Documentation
- [x] Write `README.md`: intro, screenshot/gif (if time allows), setup instructions, required environment variables
- [x] "Architecture" section summarizing `SYSTEM_DESIGN.md`
- [x] "Product decisions" section — explain why these sections/layout were chosen
- [x] "LLM/Prompt approach" section summarizing `PROMPT_DESIGN.md`
- [x] Double-check no secrets were committed (`git log -p | grep -i "key"` as a quick self-check)

