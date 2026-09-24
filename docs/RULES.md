# Coding & Workflow Rules

Purpose: keep the code clean and consistent, and easy to review — this is a technical assessment, so the reviewer will read the code carefully, not just run it once.

## 1. TypeScript

- Enable `strict: true` in `tsconfig.json`.
- Avoid `any` (if unavoidable, use `unknown` + a type guard and comment why).
- Define types/interfaces for: health data, LLM responses, Redux state — kept in a `types.ts` per feature.
- Every component's props get their own interface, named `XxxProps`.

## 2. Components & Code Style

- Functional components + hooks only.
- 1 component = 1 file, PascalCase name matching the file name.
- Keep components small and single-purpose (1 card = 1 component; don't cram the whole dashboard into one file).
- Custom hooks live in `hooks/`, named starting with `use`.
- Don't scatter calculation logic (e.g. % progress, sleep quality classification) inside JSX — extract it into `utils/` or selectors.
- ESLint + Prettier are required; run `lint` before committing (optionally set up a husky pre-commit hook if time allows).

## 3. Redux Toolkit

- One slice per feature (`dashboardSlice`, `chatSlice`, `uiSlice`).
- Use `createAsyncThunk` for API calls (mock data loading, calling `/api/chat`).
- Components should never call `fetch` directly — always go through a thunk/service layer (`lib/api.ts`).
- Keep selectors next to their slice; memoize with `createSelector` instead of recomputing inside components.

## 4. Styling

- Utility-first Tailwind; avoid custom CSS unless you need a specific animation/keyframe.
- Consistent design tokens: one color palette, a fixed spacing scale (don't hard-code scattered hex colors).
- Dark mode: optional, but if implemented use CSS variables + `prefers-color-scheme`.

## 5. AI/LLM Integration Rules

- **Never call the LLM API directly from the client** — the key must stay server-side.
- The system prompt must always stress: answer only from the provided data, never fabricate numbers.
- Always validate the LLM response before rendering it (avoid rendering stray HTML/scripts, avoid crashing on malformed output).
- Cap the `history` sent with each request (e.g. last 10 messages) to avoid an overly long prompt.
- Log API call errors (console/server log) without logging sensitive data.

## 6. Accessibility & Small UX Details

- Every icon-only button has an `aria-label` (open chat, close chat, etc.).
- Text/background contrast meets basic standards (no light gray text on a white background).
- Clear focus state on the chat input.

## 7. "Done" Checklist for Each Task

- [ ] No leftover `console.log` statements.
- [ ] No unresolved TODOs related to that task.
- [ ] Loading/error/empty states handled if the task involves data.
- [ ] Responsiveness checked at least at 375px (mobile) and 1280px (desktop).
- [ ] No new `any` types introduced.
- [ ] Commit message is clear and follows the convention.
