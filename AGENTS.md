# Repository Guidelines

## Project Structure & Modules
- `src/` holds app code. Feature domains live under `src/features/` (auth, gamification, poetry, progress, scenes, theme) with co-located components/hooks/tests. Shared utilities are in `src/lib/` (e.g., `supabase.ts` client) and entrypoints in `src/main.tsx` and `src/App.tsx`.
- Styling uses Tailwind tokens in `src/index.css` and `src/App.css`; design tokens are configured in `tailwind.config.js` via CSS variables.
- Static assets live in `public/`; production output is generated in `dist/`.
- Backend schema seeds are stored as SQL in `supabase/migrations/` for Supabase. Long-form plans live in `docs/plans/`.

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server with HMR.
- `npm run build` — type-check (`tsc -b`) then create production bundle.
- `npm run preview` — serve the built bundle locally.
- `npm run lint` — run ESLint (flat config in `eslint.config.js`).
- `npm test` — Vitest in watch/interactive mode (jsdom, setup via `src/test-setup.ts`).
- `npm run test:run` — Vitest in CI mode.

## Coding Style & Naming
- TypeScript everywhere; React components and files in `PascalCase.tsx`; hooks prefixed with `use*`; utility modules in `camelCase.ts`.
- Prefer function components with hooks; route wiring lives in `src/App.tsx` using React Router.
- Tailwind-first styling; keep color/spacing via CSS variables defined in `index.css` to align with theming.
- Follow ESLint recommendations already enforced; no auto-formatter is configured, so keep diffs tight and consistent (2-space indent).

## Testing Guidelines
- Place unit and component tests as `*.test.ts`/`*.test.tsx` beside the code (see `src/features/theme/ThemeToggle.test.tsx`).
- Use Testing Library for React behavior; avoid implementation details. Prefer data-testid only when semantics are insufficient.
- Run `npm run test:run` before pushing; add new tests for stateful hooks (coins/progress) and route guards.

## Environment & Data
- Required env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`; the client throws early if missing (`src/lib/supabase.ts`). Do not commit secrets.
- Database changes belong in new files under `supabase/migrations/` (sequential numbering). Coordinate with Supabase Dashboard or CLI to apply them.

## Commit & Pull Request Guidelines
- Use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, etc.) as seen in git history (e.g., `fix: resolve useCoins state race condition`).
- PRs should include: summary of changes, screenshots/GIFs for UI updates, and linked issue/ticket if applicable.
- Before opening a PR, run `npm run lint` and `npm run test:run`; mention results in the description.
- For routing changes, note any Vercel considerations; SPA rewrites are handled via `vercel.json` and should remain intact.
