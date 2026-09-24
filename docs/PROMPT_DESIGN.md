# LLM & Prompt Design

## 1. Core Principles

1. The model may only answer using the health data provided in context — **it must never fabricate numbers**.
2. If the user asks about something not present in the data (e.g. "what's my blood pressure?" when blood pressure isn't tracked) → the model must state clearly that it doesn't have that information, not guess.
3. Conversation context is preserved so follow-up questions ("what about sleep?") are still understood correctly.
4. Responses must always be in a format that's safe to parse/render (no stray markdown that breaks the UI, no HTML injection).

## 2. How Health Data Is Passed to the Model

Instead of sending the entire raw dataset (which can be long), a **structured summary** is built in `lib/promptBuilder.ts` from the Redux state before each request:

```ts
function buildHealthContext(state: HealthDataState): string {
  const latest = state.dailySnapshots.at(-1);
  const avg7d = average(state.dailySnapshots.slice(-7));
  return JSON.stringify({
    persona: state.persona,
    today: latest,
    last7DaysAverage: avg7d,
    goals: state.goals.map(g => ({
      title: g.title, progressPercent: Math.round((g.current / g.target) * 100),
    })),
    recentActivities: state.recentActivities.slice(-5),
  });
}
```

Reasoning: this reduces token cost, avoids overwhelming the model with raw data, and forces the data into a shape the model can cite precisely.

## 3. Prompt Structure (server-side, in `/api/chat.ts`)

```
SYSTEM PROMPT:
"You are a personal health assistant inside the Health Insight Dashboard app.
You may ONLY use the data inside the <health_data> block below to answer.
If a question requires information not present in <health_data>, clearly say
you don't have that data — do NOT guess or invent numbers.
Keep answers concise and friendly; use bullet points when listing things.
When commenting on a trend (increase/decrease), base it on the specific
figures provided, and cite the numbers where relevant.

<health_data>
{healthContextJSON}
</health_data>
"

MESSAGES:
  ...conversation history (last 10 messages max, role user/assistant)...
  { role: "user", content: <new question> }
```

- `healthContextJSON` is rebuilt **on every call** (never hard-cached) so the model always sees the latest data if the state has changed.
- Conversation history is kept in `chatSlice` on the client and sent with every request — the server function itself is stateless.

## 4. Structured Output

The model is asked to return JSON in a fixed schema (using OpenAI's JSON mode or Claude's tool-use/structured prompting) so the frontend can render it consistently:

```json
{
  "answer": "You're making good progress on your step count...",
  "highlightedMetrics": [
    { "label": "7-day average steps", "value": "8,200" }
  ],
  "confidence": "high" // or "insufficient_data"
}
```

If `confidence = "insufficient_data"`, the UI shows a small note alongside the answer: "There isn't enough data available to answer this precisely."

## 5. Handling Invalid Responses / Errors

- Server: wrap the LLM call in `try/catch`; if JSON parsing fails, fall back to `{ answer: "Sorry, I couldn't process that — could you try asking again?", confidence: "insufficient_data" }` instead of returning a meaningless 500.
- Timeout: set a ~15s timeout on the LLM call; on timeout, return a friendly error instead of hanging the UI.
- Rate limit / quota errors from the provider → show a dedicated message ("The AI assistant is temporarily overloaded, please try again shortly").
- Client: on a network/`fetch` failure, show a "Retry" button in `ChatWindow` and keep the user's typed message intact.

## 6. Basic Prompt-Injection Protection

- The `<health_data>` content is static, app-controlled data (not free user input), so injection risk from that side is low.
- User input is never concatenated directly into the system prompt — it always stays in a separate `user`-role message, distinct from the system instructions.
- Cap the length of user input (e.g. 500 characters) to prevent abuse.

## 7. Model & Cost

- Recommended: `gpt-4o-mini` (OpenAI) or `claude-haiku` (Anthropic) — good enough for context-grounded Q&A, low cost, low latency — well suited for a test/demo project.
- `max_tokens` for the response capped around 400-500 tokens, since answers only need to be concise.
