# Technical Architecture Design — 通天路 (Tongtian Lu)

**Date:** 2026-02-28
**Status:** Approved
**Platform:** Web browser (first)
**Scope:** Full technical architecture for the React + Vite + Supabase implementation

---

## 1. Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Backend / DB / Auth | Supabase (Postgres + Auth + Realtime) |
| Fuzzy answer matching | `fuse.js` (client-side) |
| Scene rendering | 2D illustration (static assets, no Unity) |

**Dev tooling:** ESLint, Prettier

---

## 2. Project Structure

```
tongtianlu/
├── src/
│   ├── app/                # Route-level page components
│   ├── components/         # Shared UI components
│   ├── features/
│   │   ├── auth/           # Login, registration, session
│   │   ├── poetry/         # Poem data hooks, challenge engine, fuzzy matcher
│   │   ├── scenes/         # Dynasty map and scene layout components
│   │   ├── gamification/   # Rank logic, coin calculations, leaderboard
│   │   ├── dictation/      # Curriculum writing practice, error tracking
│   │   └── dashboard/      # Teacher and parent monitoring views
│   ├── lib/                # Supabase client, shared utilities
│   ├── assets/             # Images, audio, fonts
│   └── main.tsx
├── supabase/
│   └── migrations/         # SQL schema migrations
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

---

## 3. Data Schema

```sql
-- Content tables
dynasties   (id, name, display_name, order)
poets       (id, dynasty_id, name, bio_short, avatar_url)
poems       (id, poet_id, dynasty_id, title, full_text,
             curriculum_grade, difficulty_tags[])
poem_lines  (id, poem_id, line_number, text)

-- User tables (users managed by Supabase Auth)
user_profiles  (user_id, display_name, rank_level, coins, current_dynasty_id)
progress       (user_id, poem_id, mastery_level 0–3, last_practiced_at)
scores         (user_id, score, dynasty_id, created_at)  -- drives leaderboards
```

**Key relationships:** `poem_line` → `poem` → `poet` → `dynasty`.
`poem_lines` enables the alternating-line challenge mechanic (poet says one line; player replies with the next).

---

## 4. Core Challenge Loop (Data Flow)

```
1. Player selects dynasty  →  fetch poets from Supabase
2. Player selects poet     →  fetch poem_lines for a random poem
3. Game engine alternates:
     show poet's line  →  player types next line
4. Client runs fuse.js against correct answer
     score ≥ 0.85   →  correct, advance
     score 0.5–0.85 →  "close, try again"
     score < 0.5    →  reveal answer, break streak
5. On completion:
     update progress + coins  →  Supabase write
     write to scores table    →  Supabase Realtime broadcasts leaderboard refresh
```

**State management:** Local React state (`useState` / `useReducer`) within each feature module. No global state library for MVP. Supabase queries via custom hooks (`usePoemChallenge`, `useLeaderboard`, etc.).

---

## 5. Routes

| Path | View |
|------|------|
| `/` | Landing / login |
| `/app/home` | Dynasty map (main hub) |
| `/app/dynasty/:id` | Dynasty scene + poet selection |
| `/app/challenge/:id` | Active 1v1 poem challenge |
| `/app/dictation` | Curriculum dictation practice |
| `/app/profile` | Player stats, rank, progress |
| `/app/leaderboard` | Class / global rankings |
| `/admin/poems` | Poem database management (teacher/admin) |

---

## 6. Key Decisions & Rationale

- **Web browser first** (not WeChat Mini Program or native): fastest iteration cycle; can add WeChat later.
- **Supabase over Firebase**: relational Postgres fits the poem/poet/dynasty hierarchy better than Firestore's document model.
- **fuse.js client-side fuzzy match**: eliminates a server round-trip on every answer; threshold tuning (0.85/0.5) can be adjusted without a deploy.
- **2D illustration over Unity WebGL**: removes Unity dependency and dramatically reduces asset complexity for MVP.
- **No global state library**: feature-scoped hooks are sufficient; add Zustand/Jotai if cross-feature state becomes complex.
