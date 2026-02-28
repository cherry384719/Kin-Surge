# 通天路 MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working browser-based MVP of 通天路 — an interactive Chinese poetry 1v1 challenge game with dynasty scenes, fuzzy answer matching, and basic gamification.

**Architecture:** React 18 + TypeScript SPA served by Vite; Supabase handles Postgres data, Auth, and Realtime leaderboard updates; fuse.js does client-side fuzzy answer matching against pre-seeded poem lines.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, @supabase/supabase-js, fuse.js, Vitest + React Testing Library

---

## Prerequisites

Before starting, you need:
1. Node.js ≥ 18 installed
2. A free Supabase project created at supabase.com — save the **Project URL** and **anon key**
3. `git` configured

---

## Task 1: Scaffold the Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

**Step 1: Scaffold with Vite**

```bash
cd /Users/szn/Desktop/Kin-Surge
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **Yes** (only CLAUDE.md and docs/ exist; they will be re-added in the next step).

**Step 2: Restore docs and CLAUDE.md**

```bash
git checkout CLAUDE.md docs/
```

**Step 3: Install base dependencies**

```bash
npm install
npm install react-router-dom @supabase/supabase-js fuse.js
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Step 4: Init Tailwind**

```bash
npx tailwindcss init -p
```

Replace the content of `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Add to the top of `src/index.css` (replace existing content):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 5: Configure Vitest**

Add to `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

Create `src/test-setup.ts`:

```ts
import '@testing-library/jest-dom'
```

**Step 6: Add test script to package.json**

In `package.json`, under `"scripts"`, add:

```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 7: Smoke-test the scaffold**

```bash
npm run dev
```

Expected: Vite dev server starts; browser shows default Vite+React page.

```bash
npm run test:run
```

Expected: "No test files found" (not a failure).

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS + Tailwind + Vitest"
```

---

## Task 2: Supabase client and environment config

**Files:**
- Create: `.env.local`, `src/lib/supabase.ts`

**Step 1: Create the env file**

Create `.env.local` in the project root (this file is git-ignored by default):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase Project URL and anon key from the Supabase dashboard → Settings → API.

**Step 2: Add .env.local to .gitignore**

Open `.gitignore` and confirm `.env.local` is listed. If not, add it.

**Step 3: Create the Supabase client**

Create `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(url, key)
```

**Step 4: Write a test for the client module**

Create `src/lib/supabase.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('supabase module', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key')
  })

  it('exports a supabase client object', async () => {
    const { supabase } = await import('./supabase')
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })
})
```

**Step 5: Run the test**

```bash
npm run test:run src/lib/supabase.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/supabase.ts src/lib/supabase.test.ts .gitignore
git commit -m "feat: add Supabase client with env validation"
```

---

## Task 3: Database schema migrations

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Install the Supabase CLI**

```bash
npm install -g supabase
supabase --version
```

Expected: version number printed (e.g. `1.x.x`)

**Step 2: Init Supabase locally**

```bash
supabase init
```

This creates a `supabase/` folder with config.

**Step 3: Write the migration**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Dynasties
create table dynasties (
  id   serial primary key,
  name text not null,
  display_name text not null,
  sort_order int not null
);

-- Poets
create table poets (
  id          serial primary key,
  dynasty_id  int references dynasties(id) not null,
  name        text not null,
  bio_short   text,
  avatar_url  text
);

-- Poems
create table poems (
  id               serial primary key,
  poet_id          int references poets(id) not null,
  dynasty_id       int references dynasties(id) not null,
  title            text not null,
  full_text        text not null,
  curriculum_grade text
);

-- Poem lines (used in 1v1 challenge)
create table poem_lines (
  id          serial primary key,
  poem_id     int references poems(id) not null,
  line_number int not null,
  text        text not null
);

-- User profiles (extends Supabase auth.users)
create table user_profiles (
  user_id          uuid primary key references auth.users(id),
  display_name     text not null,
  rank_level       int not null default 1,
  coins            int not null default 0,
  current_dynasty_id int references dynasties(id)
);

-- Learning progress per poem
create table progress (
  id               serial primary key,
  user_id          uuid references auth.users(id) not null,
  poem_id          int references poems(id) not null,
  mastery_level    int not null default 0, -- 0=unseen, 1=beginner, 2=intermediate, 3=master
  last_practiced_at timestamptz,
  unique(user_id, poem_id)
);

-- Scores (drives leaderboards)
create table scores (
  id          serial primary key,
  user_id     uuid references auth.users(id) not null,
  dynasty_id  int references dynasties(id) not null,
  score       int not null,
  created_at  timestamptz not null default now()
);

-- Row-level security: users can only read/write their own rows
alter table user_profiles enable row level security;
alter table progress enable row level security;
alter table scores enable row level security;

create policy "users manage own profile"
  on user_profiles for all using (auth.uid() = user_id);

create policy "users manage own progress"
  on progress for all using (auth.uid() = user_id);

create policy "users insert own scores"
  on scores for insert with check (auth.uid() = user_id);

create policy "scores are public for read"
  on scores for select using (true);

-- Public read for content tables
alter table dynasties enable row level security;
alter table poets enable row level security;
alter table poems enable row level security;
alter table poem_lines enable row level security;

create policy "public read dynasties" on dynasties for select using (true);
create policy "public read poets" on poets for select using (true);
create policy "public read poems" on poems for select using (true);
create policy "public read poem_lines" on poem_lines for select using (true);
```

**Step 4: Apply the migration to your Supabase project**

In the Supabase dashboard → SQL Editor, paste the entire SQL above and click **Run**.

Expected: All tables created without errors.

**Step 5: Seed sample data**

In the Supabase SQL Editor, run:

```sql
insert into dynasties (name, display_name, sort_order) values
  ('han', '汉朝', 1),
  ('tang', '唐朝', 2),
  ('song', '宋朝', 3);

insert into poets (dynasty_id, name, bio_short) values
  (2, '李白', '字太白，号青莲居士，唐代伟大浪漫主义诗人'),
  (2, '杜甫', '字子美，唐代伟大现实主义诗人'),
  (3, '苏轼', '字子瞻，号东坡居士，北宋文学家');

insert into poems (poet_id, dynasty_id, title, full_text, curriculum_grade) values
  (1, 2, '静夜思', '床前明月光，疑是地上霜。举头望明月，低头思故乡。', '一年级'),
  (1, 2, '望庐山瀑布', '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', '二年级');

insert into poem_lines (poem_id, line_number, text) values
  (1, 1, '床前明月光'),
  (1, 2, '疑是地上霜'),
  (1, 3, '举头望明月'),
  (1, 4, '低头思故乡'),
  (2, 1, '日照香炉生紫烟'),
  (2, 2, '遥看瀑布挂前川'),
  (2, 3, '飞流直下三千尺'),
  (2, 4, '疑是银河落九天');
```

**Step 6: Commit**

```bash
git add supabase/
git commit -m "feat: add initial DB schema migration and sample seed data"
```

---

## Task 4: Authentication — login and registration pages

**Files:**
- Create: `src/features/auth/AuthPage.tsx`
- Create: `src/features/auth/AuthPage.test.tsx`
- Create: `src/features/auth/useAuth.ts`
- Modify: `src/App.tsx`

**Step 1: Write failing tests**

Create `src/features/auth/AuthPage.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPage } from './AuthPage'

// Mock supabase so tests don't hit the network
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

describe('AuthPage', () => {
  it('renders email and password inputs', () => {
    render(<AuthPage />)
    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument()
  })

  it('has a login button', () => {
    render(<AuthPage />)
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument()
  })

  it('calls signInWithPassword with entered credentials', async () => {
    const { supabase } = await import('../../lib/supabase')
    render(<AuthPage />)
    await userEvent.type(screen.getByLabelText(/邮箱/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/密码/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /登录/i }))
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })
})
```

**Step 2: Run tests to confirm they fail**

```bash
npm run test:run src/features/auth/AuthPage.test.tsx
```

Expected: FAIL — "Cannot find module './AuthPage'"

**Step 3: Create the auth hook**

Create `src/features/auth/useAuth.ts`:

```ts
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function useAuth() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function login(email: string, password: string) {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function register(email: string, password: string, displayName: string) {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  return { login, register, error, loading }
}
```

**Step 4: Create the AuthPage component**

Create `src/features/auth/AuthPage.tsx`:

```tsx
import { useState } from 'react'
import { useAuth } from './useAuth'

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, error, loading } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-amber-900">通天路</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={() => login(email, password)}
            disabled={loading}
            className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 5: Run tests to confirm they pass**

```bash
npm run test:run src/features/auth/AuthPage.test.tsx
```

Expected: 3 PASS

**Step 6: Wire AuthPage into App.tsx**

Replace contents of `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthPage } from './features/auth/AuthPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Step 7: Verify in browser**

```bash
npm run dev
```

Expected: Login form renders at `http://localhost:5173`

**Step 8: Commit**

```bash
git add src/features/auth/ src/App.tsx
git commit -m "feat: add authentication page with login form"
```

---

## Task 5: Auth session management and protected routes

**Files:**
- Create: `src/features/auth/AuthProvider.tsx`
- Create: `src/features/auth/ProtectedRoute.tsx`
- Modify: `src/App.tsx`

**Step 1: Write failing test**

Create `src/features/auth/ProtectedRoute.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AuthContext } from './AuthProvider'

function renderWithAuth(user: object | null, component: React.ReactNode) {
  return render(
    <AuthContext.Provider value={{ user, loading: false }}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={component} />
          <Route path="/" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('ProtectedRoute', () => {
  it('renders children when user is logged in', () => {
    renderWithAuth({ id: 'abc' }, <ProtectedRoute><div>Secret</div></ProtectedRoute>)
    expect(screen.getByText('Secret')).toBeInTheDocument()
  })

  it('redirects to / when user is null', () => {
    renderWithAuth(null, <ProtectedRoute><div>Secret</div></ProtectedRoute>)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Secret')).not.toBeInTheDocument()
  })
})
```

**Step 2: Run to confirm fail**

```bash
npm run test:run src/features/auth/ProtectedRoute.test.tsx
```

Expected: FAIL

**Step 3: Create AuthProvider**

Create `src/features/auth/AuthProvider.tsx`:

```tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

interface AuthContextValue {
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

export function useUser() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
```

**Step 4: Create ProtectedRoute**

Create `src/features/auth/ProtectedRoute.tsx`:

```tsx
import { Navigate } from 'react-router-dom'
import { useUser } from './AuthProvider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()

  if (loading) return <div className="min-h-screen flex items-center justify-center">加载中…</div>
  if (!user) return <Navigate to="/" replace />

  return <>{children}</>
}
```

**Step 5: Run tests**

```bash
npm run test:run src/features/auth/ProtectedRoute.test.tsx
```

Expected: 2 PASS

**Step 6: Wrap App with AuthProvider**

Replace `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AuthPage } from './features/auth/AuthPage'

function Placeholder({ label }: { label: string }) {
  return <div className="p-8 text-2xl">{label}</div>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route
            path="/app/home"
            element={<ProtectedRoute><Placeholder label="Dynasty Map" /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

**Step 7: Commit**

```bash
git add src/features/auth/AuthProvider.tsx src/features/auth/ProtectedRoute.tsx src/features/auth/ProtectedRoute.test.tsx src/App.tsx
git commit -m "feat: add session management and protected routes"
```

---

## Task 6: Dynasty map page

**Files:**
- Create: `src/features/scenes/useDynasties.ts`
- Create: `src/features/scenes/DynastyMap.tsx`
- Create: `src/features/scenes/DynastyMap.test.tsx`
- Modify: `src/App.tsx`

**Step 1: Write failing tests**

Create `src/features/scenes/DynastyMap.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DynastyMap } from './DynastyMap'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 1, name: 'tang', display_name: '唐朝', sort_order: 1 },
            { id: 2, name: 'song', display_name: '宋朝', sort_order: 2 },
          ],
          error: null,
        }),
      }),
    }),
  },
}))

describe('DynastyMap', () => {
  it('renders a heading', async () => {
    render(<MemoryRouter><DynastyMap /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /选择朝代/i })).toBeInTheDocument()
  })

  it('renders dynasty cards from Supabase data', async () => {
    render(<MemoryRouter><DynastyMap /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('唐朝')).toBeInTheDocument()
      expect(screen.getByText('宋朝')).toBeInTheDocument()
    })
  })

  it('each dynasty card links to the dynasty page', async () => {
    render(<MemoryRouter><DynastyMap /></MemoryRouter>)
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /唐朝/i })
      expect(link).toHaveAttribute('href', '/app/dynasty/1')
    })
  })
})
```

**Step 2: Run to confirm fail**

```bash
npm run test:run src/features/scenes/DynastyMap.test.tsx
```

Expected: FAIL

**Step 3: Create useDynasties hook**

Create `src/features/scenes/useDynasties.ts`:

```ts
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface Dynasty {
  id: number
  name: string
  display_name: string
  sort_order: number
}

export function useDynasties() {
  const [dynasties, setDynasties] = useState<Dynasty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('dynasties')
      .select('*')
      .order('sort_order')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setDynasties(data ?? [])
        setLoading(false)
      })
  }, [])

  return { dynasties, loading, error }
}
```

**Step 4: Create DynastyMap component**

Create `src/features/scenes/DynastyMap.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { useDynasties } from './useDynasties'

export function DynastyMap() {
  const { dynasties, loading } = useDynasties()

  return (
    <div className="min-h-screen bg-amber-50 p-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8 text-center">选择朝代</h1>

      {loading ? (
        <p className="text-center text-gray-500">加载中…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {dynasties.map(d => (
            <Link
              key={d.id}
              to={`/app/dynasty/${d.id}`}
              className="block bg-white rounded-xl shadow hover:shadow-md transition-shadow p-6 text-center border border-amber-200 hover:border-amber-400"
            >
              <span className="text-2xl font-semibold text-amber-800">{d.display_name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 5: Run tests**

```bash
npm run test:run src/features/scenes/DynastyMap.test.tsx
```

Expected: 3 PASS

**Step 6: Add route to App.tsx**

Replace the `Placeholder label="Dynasty Map"` element with `<DynastyMap />` in `src/App.tsx`. Add the import at the top:

```tsx
import { DynastyMap } from './features/scenes/DynastyMap'
```

Then update the route:

```tsx
<Route
  path="/app/home"
  element={<ProtectedRoute><DynastyMap /></ProtectedRoute>}
/>
```

Also update `AuthPage` to redirect to `/app/home` after successful login. In `useAuth.ts`, add a callback parameter or navigate via React Router. Simplest approach — accept an `onSuccess` prop on `AuthPage`:

In `AuthPage.tsx`, update the component signature:

```tsx
export function AuthPage({ onSuccess }: { onSuccess?: () => void }) {
```

And in the `login` call:

```tsx
const { login, error, loading } = useAuth()
// after login:
await login(email, password)
if (!error) onSuccess?.()
```

In `App.tsx`, pass `onSuccess`:

```tsx
import { useNavigate } from 'react-router-dom'

// Inside App() before the return:
// AuthPage needs to navigate, so wrap it:
function LoginPage() {
  const navigate = useNavigate()
  return <AuthPage onSuccess={() => navigate('/app/home')} />
}
```

Then use `<LoginPage />` in the route instead of `<AuthPage />`.

**Step 7: Commit**

```bash
git add src/features/scenes/ src/App.tsx src/features/auth/AuthPage.tsx src/features/auth/useAuth.ts
git commit -m "feat: add dynasty map page with Supabase data"
```

---

## Task 7: Dynasty page — poet selection

**Files:**
- Create: `src/features/scenes/usePoets.ts`
- Create: `src/features/scenes/DynastyPage.tsx`
- Create: `src/features/scenes/DynastyPage.test.tsx`
- Modify: `src/App.tsx`

**Step 1: Write failing tests**

Create `src/features/scenes/DynastyPage.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DynastyPage } from './DynastyPage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { id: 1, name: '李白', bio_short: '浪漫主义诗人', avatar_url: null },
          ],
          error: null,
        }),
      }),
    }),
  },
}))

function renderWithRoute(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/app/dynasty/${id}`]}>
      <Routes>
        <Route path="/app/dynasty/:dynastyId" element={<DynastyPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('DynastyPage', () => {
  it('renders a list of poets for the dynasty', async () => {
    renderWithRoute('2')
    await waitFor(() => {
      expect(screen.getByText('李白')).toBeInTheDocument()
    })
  })

  it('each poet links to the challenge page', async () => {
    renderWithRoute('2')
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /李白/i })
      expect(link).toHaveAttribute('href', '/app/challenge/1')
    })
  })
})
```

**Step 2: Run to confirm fail**

```bash
npm run test:run src/features/scenes/DynastyPage.test.tsx
```

Expected: FAIL

**Step 3: Create usePoets hook**

Create `src/features/scenes/usePoets.ts`:

```ts
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface Poet {
  id: number
  name: string
  bio_short: string | null
  avatar_url: string | null
}

export function usePoets(dynastyId: number) {
  const [poets, setPoets] = useState<Poet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('poets')
      .select('id, name, bio_short, avatar_url')
      .eq('dynasty_id', dynastyId)
      .then(({ data }) => {
        setPoets(data ?? [])
        setLoading(false)
      })
  }, [dynastyId])

  return { poets, loading }
}
```

**Step 4: Create DynastyPage**

Create `src/features/scenes/DynastyPage.tsx`:

```tsx
import { Link, useParams } from 'react-router-dom'
import { usePoets } from './usePoets'

export function DynastyPage() {
  const { dynastyId } = useParams<{ dynastyId: string }>()
  const { poets, loading } = usePoets(Number(dynastyId))

  return (
    <div className="min-h-screen bg-amber-50 p-8">
      <h1 className="text-2xl font-bold text-amber-900 mb-8 text-center">选择诗人</h1>

      {loading ? (
        <p className="text-center text-gray-500">加载中…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          {poets.map(p => (
            <Link
              key={p.id}
              to={`/app/challenge/${p.id}`}
              className="block bg-white rounded-xl shadow p-5 border border-amber-200 hover:border-amber-500 transition-colors"
            >
              <p className="text-xl font-semibold text-amber-800">{p.name}</p>
              {p.bio_short && <p className="text-sm text-gray-500 mt-1">{p.bio_short}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 5: Run tests**

```bash
npm run test:run src/features/scenes/DynastyPage.test.tsx
```

Expected: 2 PASS

**Step 6: Add route to App.tsx**

```tsx
import { DynastyPage } from './features/scenes/DynastyPage'

// Add inside <Routes>:
<Route
  path="/app/dynasty/:dynastyId"
  element={<ProtectedRoute><DynastyPage /></ProtectedRoute>}
/>
```

**Step 7: Commit**

```bash
git add src/features/scenes/usePoets.ts src/features/scenes/DynastyPage.tsx src/features/scenes/DynastyPage.test.tsx src/App.tsx
git commit -m "feat: add dynasty page with poet selection"
```

---

## Task 8: Challenge engine — fuzzy answer matching

**Files:**
- Create: `src/features/poetry/matchAnswer.ts`
- Create: `src/features/poetry/matchAnswer.test.ts`

This is the core business logic. Build and test it in isolation before wiring it to the UI.

**Step 1: Write failing tests**

Create `src/features/poetry/matchAnswer.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { matchAnswer } from './matchAnswer'

describe('matchAnswer', () => {
  it('returns correct for an exact match', () => {
    const result = matchAnswer('低头思故乡', '低头思故乡')
    expect(result).toBe('correct')
  })

  it('returns correct for a near match (one character off)', () => {
    // "低头思故乡" vs "低头思故鄉" (traditional vs simplified)
    const result = matchAnswer('低头思故乡', '低头思故鄉')
    expect(result).toBe('correct')
  })

  it('returns close for a partially correct answer', () => {
    const result = matchAnswer('低头思故乡', '低头望故乡')
    expect(result).toBe('close')
  })

  it('returns wrong for an unrelated answer', () => {
    const result = matchAnswer('低头思故乡', '春眠不觉晓')
    expect(result).toBe('wrong')
  })

  it('is tolerant of leading/trailing whitespace', () => {
    const result = matchAnswer('低头思故乡', '  低头思故乡  ')
    expect(result).toBe('correct')
  })
})
```

**Step 2: Run to confirm fail**

```bash
npm run test:run src/features/poetry/matchAnswer.test.ts
```

Expected: FAIL

**Step 3: Implement matchAnswer**

Create `src/features/poetry/matchAnswer.ts`:

```ts
import Fuse from 'fuse.js'

export type MatchResult = 'correct' | 'close' | 'wrong'

/**
 * Compare a player's answer against the correct poem line.
 * Returns 'correct' (score >= 0.85), 'close' (>= 0.5), or 'wrong'.
 *
 * Fuse.js score is 0 (perfect) to 1 (no match), so we invert it.
 */
export function matchAnswer(correct: string, playerInput: string): MatchResult {
  const normalised = playerInput.trim()

  // Exact match fast-path
  if (normalised === correct.trim()) return 'correct'

  const fuse = new Fuse([correct], {
    includeScore: true,
    threshold: 1.0,  // allow Fuse to score everything; we threshold manually
    distance: correct.length,
  })

  const results = fuse.search(normalised)
  if (results.length === 0) return 'wrong'

  const similarity = 1 - (results[0].score ?? 1)

  if (similarity >= 0.85) return 'correct'
  if (similarity >= 0.5) return 'close'
  return 'wrong'
}
```

**Step 4: Run tests**

```bash
npm run test:run src/features/poetry/matchAnswer.test.ts
```

Expected: 5 PASS. If a threshold test fails, adjust the constants (0.85/0.5) until all pass.

**Step 5: Commit**

```bash
git add src/features/poetry/matchAnswer.ts src/features/poetry/matchAnswer.test.ts
git commit -m "feat: add fuzzy poem answer matcher with fuse.js"
```

---

## Task 9: Challenge page — 1v1 poem challenge UI

**Files:**
- Create: `src/features/poetry/useChallenge.ts`
- Create: `src/features/poetry/ChallengePage.tsx`
- Create: `src/features/poetry/ChallengePage.test.tsx`
- Modify: `src/App.tsx`

**Step 1: Write failing tests**

Create `src/features/poetry/ChallengePage.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ChallengePage } from './ChallengePage'

const mockLines = [
  { id: 1, poem_id: 1, line_number: 1, text: '床前明月光' },
  { id: 2, poem_id: 1, line_number: 2, text: '疑是地上霜' },
  { id: 3, poem_id: 1, line_number: 3, text: '举头望明月' },
  { id: 4, poem_id: 1, line_number: 4, text: '低头思故乡' },
]

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: mockLines, error: null }),
          }),
        }),
      }),
    }),
  },
}))

function renderChallenge(poetId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/app/challenge/${poetId}`]}>
      <Routes>
        <Route path="/app/challenge/:poetId" element={<ChallengePage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ChallengePage', () => {
  it('shows the poet line prompt after loading', async () => {
    renderChallenge()
    await waitFor(() => {
      expect(screen.getByText('床前明月光')).toBeInTheDocument()
    })
  })

  it('shows a text input for the player', async () => {
    renderChallenge()
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  it('shows 正确 feedback on correct answer', async () => {
    renderChallenge()
    await waitFor(() => screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), '疑是地上霜')
    await userEvent.click(screen.getByRole('button', { name: /提交/i }))
    await waitFor(() => {
      expect(screen.getByText(/正确/i)).toBeInTheDocument()
    })
  })
})
```

**Step 2: Run to confirm fail**

```bash
npm run test:run src/features/poetry/ChallengePage.test.tsx
```

Expected: FAIL

**Step 3: Create useChallenge hook**

Create `src/features/poetry/useChallenge.ts`:

```ts
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface PoemLine {
  id: number
  poem_id: number
  line_number: number
  text: string
}

export function useChallenge(poetId: number) {
  const [lines, setLines] = useState<PoemLine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch lines for a random poem by this poet (limit 1 poem = 4 lines)
    supabase
      .from('poem_lines')
      .select('id, poem_id, line_number, text')
      .eq('poem_id', poetId)   // simplified for MVP: poetId doubles as poemId in seed data
      .order('line_number')
      .limit(8)
      .then(({ data }) => {
        setLines(data ?? [])
        setLoading(false)
      })
  }, [poetId])

  return { lines, loading }
}
```

**Step 4: Create ChallengePage**

Create `src/features/poetry/ChallengePage.tsx`:

```tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useChallenge } from './useChallenge'
import { matchAnswer, MatchResult } from './matchAnswer'

export function ChallengePage() {
  const { poetId } = useParams<{ poetId: string }>()
  const { lines, loading } = useChallenge(Number(poetId))

  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<MatchResult | null>(null)

  if (loading) return <div className="p-8 text-center">加载中…</div>
  if (lines.length < 2) return <div className="p-8 text-center">暂无题目</div>

  // Pairs: poet says even-indexed line, player answers with odd-indexed line
  const poetLine = lines[currentPairIndex * 2]
  const answerLine = lines[currentPairIndex * 2 + 1]

  function handleSubmit() {
    if (!answerLine) return
    const result = matchAnswer(answerLine.text, input)
    setFeedback(result)
  }

  function handleNext() {
    const nextIndex = currentPairIndex + 1
    if (nextIndex * 2 + 1 < lines.length) {
      setCurrentPairIndex(nextIndex)
      setInput('')
      setFeedback(null)
    }
  }

  const feedbackLabels: Record<MatchResult, string> = {
    correct: '正确！',
    close: '接近了，再试试！',
    wrong: `答案是：${answerLine?.text}`,
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-lg">
        <p className="text-sm text-gray-500 mb-2">诗人说：</p>
        <p className="text-2xl font-bold text-amber-900 mb-6">{poetLine?.text}</p>

        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !feedback && handleSubmit()}
          placeholder="请填写下一句…"
          disabled={!!feedback}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-lg"
        />

        {feedback ? (
          <div className="space-y-3">
            <p className={`text-lg font-semibold ${feedback === 'correct' ? 'text-green-600' : feedback === 'close' ? 'text-yellow-600' : 'text-red-600'}`}>
              {feedbackLabels[feedback]}
            </p>
            <button
              onClick={handleNext}
              className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
            >
              下一句
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
          >
            提交
          </button>
        )}
      </div>
    </div>
  )
}
```

**Step 5: Run tests**

```bash
npm run test:run src/features/poetry/ChallengePage.test.tsx
```

Expected: 3 PASS

**Step 6: Add route in App.tsx**

```tsx
import { ChallengePage } from './features/poetry/ChallengePage'

// Add inside <Routes>:
<Route
  path="/app/challenge/:poetId"
  element={<ProtectedRoute><ChallengePage /></ProtectedRoute>}
/>
```

**Step 7: Full manual test**

```bash
npm run dev
```

Walk through the full flow: login → dynasty map → dynasty page → challenge page. Type a correct poem line.

**Step 8: Commit**

```bash
git add src/features/poetry/ src/App.tsx
git commit -m "feat: add 1v1 poem challenge page with fuzzy answer feedback"
```

---

## Task 10: Basic gamification — coins on correct answer

**Files:**
- Create: `src/features/gamification/useCoins.ts`
- Create: `src/features/gamification/useCoins.test.ts`
- Modify: `src/features/poetry/ChallengePage.tsx`

**Step 1: Write failing test**

Create `src/features/gamification/useCoins.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCoins } from './useCoins'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { coins: 10 },
            error: null,
          }),
        }),
      }),
    }),
  },
}))

describe('useCoins', () => {
  it('starts at 0 before fetch', () => {
    const { result } = renderHook(() => useCoins('user-123'))
    expect(result.current.coins).toBe(0)
  })

  it('awards coins and updates local state', async () => {
    const { result } = renderHook(() => useCoins('user-123'))
    await act(async () => {
      await result.current.awardCoins(5)
    })
    expect(result.current.coins).toBe(5)
  })
})
```

**Step 2: Run to confirm fail**

```bash
npm run test:run src/features/gamification/useCoins.test.ts
```

Expected: FAIL

**Step 3: Create useCoins**

Create `src/features/gamification/useCoins.ts`:

```ts
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function useCoins(userId: string) {
  const [coins, setCoins] = useState(0)

  async function awardCoins(amount: number) {
    setCoins(prev => prev + amount)
    await supabase
      .from('user_profiles')
      .update({ coins: coins + amount })
      .eq('user_id', userId)
  }

  return { coins, awardCoins }
}
```

**Step 4: Run tests**

```bash
npm run test:run src/features/gamification/useCoins.test.ts
```

Expected: 2 PASS

**Step 5: Wire coins into ChallengePage**

In `ChallengePage.tsx`, import `useUser` and `useCoins`, then call `awardCoins(10)` when `feedback === 'correct'`:

```tsx
import { useUser } from '../auth/AuthProvider'
import { useCoins } from '../gamification/useCoins'

// Inside the component:
const { user } = useUser()
const { coins, awardCoins } = useCoins(user?.id ?? '')

// Update handleSubmit:
function handleSubmit() {
  if (!answerLine) return
  const result = matchAnswer(answerLine.text, input)
  setFeedback(result)
  if (result === 'correct') awardCoins(10)
}
```

Also display the coin count somewhere visible:

```tsx
<p className="text-sm text-right text-amber-700 mb-4">金币: {coins}</p>
```

**Step 6: Commit**

```bash
git add src/features/gamification/ src/features/poetry/ChallengePage.tsx
git commit -m "feat: award coins on correct poem answers"
```

---

## Task 11: Run the full test suite and fix any failures

**Step 1: Run all tests**

```bash
npm run test:run
```

Expected: All tests PASS. If any fail, diagnose and fix before continuing.

**Step 2: Build to confirm no TypeScript errors**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 3: Commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve test and TypeScript issues from integration"
```

---

## What's NOT in this plan (next iterations)

- Dictation module (Task 6 in architecture)
- Parent / teacher dashboards
- Leaderboard with Supabase Realtime
- User registration flow (only login is built above)
- Rank system (童生 → 诗仙)
- Full poem database seeding (only 2 poems seeded above)
- Scene illustrations / art assets
