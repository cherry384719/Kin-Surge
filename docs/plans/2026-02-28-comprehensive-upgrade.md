# Comprehensive Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the MVP into a production-ready Chinese poetry learning game with Chinese-ink-style UI, dynasty-based level progression, expanded content (~65 poems), light/dark themes, and Vercel deployment.

**Architecture:** Incremental refactor of existing React+Supabase app. Add CSS custom properties for theming, Tailwind dark mode for light/dark toggle, new progress/unlock hooks for level progression, expanded SQL seed data, and redesigned components with Chinese aesthetic. Deploy to Vercel with Supabase backend.

**Tech Stack:** React 19, TypeScript, Vite 7, Tailwind CSS 3 (dark mode), Supabase, Google Fonts (Noto Serif SC, Noto Sans SC, LXGW WenKai), Vercel.

---

## Phase 1: Theme Foundation

### Task 1: Add Google Fonts and CSS Custom Properties

**Files:**
- Modify: `index.html` (add font links)
- Modify: `src/index.css` (add CSS variables and font families)
- Modify: `tailwind.config.js` (enable dark mode, extend theme)

**Step 1: Add Google Fonts to index.html**

Add preconnect and font stylesheet links to `<head>` in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet">
```

**Step 2: Add CSS variables to `src/index.css`**

Replace entire `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #FFF8F0;
    --bg-secondary: #FFF5EB;
    --bg-card: #FFFAF5;
    --text-primary: #2D1810;
    --text-secondary: #5C4033;
    --text-muted: #8B7355;
    --accent: #8B0000;
    --accent-hover: #A52A2A;
    --border: #D4A574;
    --border-light: #E8D5B7;
    --success: #2E7D32;
    --warning: #E65100;
    --error: #B71C1C;
    --gold: #DAA520;
  }

  .dark {
    --bg-primary: #1A1A2E;
    --bg-secondary: #16213E;
    --bg-card: #1E2A4A;
    --text-primary: #E8D5B7;
    --text-secondary: #C4A882;
    --text-muted: #8B7355;
    --accent: #D4A574;
    --accent-hover: #E8B44A;
    --border: #4A3728;
    --border-light: #3A2A1E;
    --success: #66BB6A;
    --warning: #FFA726;
    --error: #EF5350;
    --gold: #FFD700;
  }

  html {
    font-family: 'Noto Sans SC', sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  /* Dynasty color schemes */
  .dynasty-han { --dynasty-primary: #8B0000; --dynasty-secondary: #D4A574; }
  .dynasty-weijin { --dynasty-primary: #2E8B57; --dynasty-secondary: #F0F0E8; }
  .dynasty-tang { --dynasty-primary: #DAA520; --dynasty-secondary: #CC4444; }
  .dynasty-song { --dynasty-primary: #7BA8A8; --dynasty-secondary: #FAF8F5; }
  .dynasty-yuan { --dynasty-primary: #4A7C59; --dynasty-secondary: #4682B4; }
  .dynasty-mingqing { --dynasty-primary: #B22222; --dynasty-secondary: #E8B44A; }
}
```

**Step 3: Update `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        gold: 'var(--gold)',
        dynasty: {
          primary: 'var(--dynasty-primary)',
          secondary: 'var(--dynasty-secondary)',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
        kai: ['"LXGW WenKai"', 'cursive'],
      },
    },
  },
  plugins: [],
}
```

**Step 4: Run build to verify no errors**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 5: Commit**

```bash
git add index.html src/index.css tailwind.config.js
git commit -m "feat: add theme system with CSS variables, dynasty colors, and Chinese fonts"
```

---

### Task 2: Create Theme Toggle Component

**Files:**
- Create: `src/features/theme/ThemeToggle.tsx`
- Create: `src/features/theme/ThemeToggle.test.tsx`
- Create: `src/features/theme/useTheme.ts`
- Create: `src/features/theme/useTheme.test.ts`

**Step 1: Write the failing test for useTheme**

Create `src/features/theme/useTheme.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

test('defaults to light theme', () => {
  const { result } = renderHook(() => useTheme())
  expect(result.current.isDark).toBe(false)
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

test('toggles to dark theme', () => {
  const { result } = renderHook(() => useTheme())
  act(() => result.current.toggle())
  expect(result.current.isDark).toBe(true)
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})

test('persists preference to localStorage', () => {
  const { result } = renderHook(() => useTheme())
  act(() => result.current.toggle())
  expect(localStorage.getItem('theme')).toBe('dark')
})

test('reads saved preference on mount', () => {
  localStorage.setItem('theme', 'dark')
  const { result } = renderHook(() => useTheme())
  expect(result.current.isDark).toBe(true)
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/theme/useTheme.test.ts`
Expected: FAIL — module not found.

**Step 3: Implement useTheme**

Create `src/features/theme/useTheme.ts`:

```ts
import { useState, useEffect } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  function toggle() {
    setIsDark(prev => !prev)
  }

  return { isDark, toggle }
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/theme/useTheme.test.ts`
Expected: 4 tests PASS.

**Step 5: Write ThemeToggle component test**

Create `src/features/theme/ThemeToggle.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

test('renders sun icon in dark mode', () => {
  localStorage.setItem('theme', 'dark')
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: '切换亮色模式' })).toBeInTheDocument()
})

test('renders moon icon in light mode', () => {
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: '切换暗色模式' })).toBeInTheDocument()
})

test('toggles theme on click', async () => {
  render(<ThemeToggle />)
  const btn = screen.getByRole('button', { name: '切换暗色模式' })
  await userEvent.click(btn)
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})
```

**Step 6: Implement ThemeToggle**

Create `src/features/theme/ThemeToggle.tsx`:

```tsx
import { useTheme } from './useTheme'

export function ThemeToggle() {
  const { isDark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? '切换亮色模式' : '切换暗色模式'}
      className="p-2 rounded-lg border border-border-light hover:bg-bg-secondary transition-colors text-text-primary"
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      )}
    </button>
  )
}
```

**Step 7: Run all theme tests**

Run: `npx vitest run src/features/theme/`
Expected: 7 tests PASS.

**Step 8: Commit**

```bash
git add src/features/theme/
git commit -m "feat: add theme toggle with light/dark mode and localStorage persistence"
```

---

### Task 3: Create Shared Layout Component

**Files:**
- Create: `src/features/layout/AppLayout.tsx`
- Modify: `src/App.tsx` (wrap protected routes in layout)

**Step 1: Create AppLayout**

Create `src/features/layout/AppLayout.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../theme/ThemeToggle'
import { useUser } from '../auth/AuthProvider'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-50 bg-bg-card/80 backdrop-blur border-b border-border-light">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/app/home" className="font-serif text-xl font-bold text-accent">
            通天路
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted">
              {user?.user_metadata?.display_name ?? '旅人'}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
```

**Step 2: Update App.tsx to use AppLayout**

Replace `src/App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AuthPage } from './features/auth/AuthPage'
import { AppLayout } from './features/layout/AppLayout'
import { DynastyMap } from './features/scenes/DynastyMap'
import { DynastyPage } from './features/scenes/DynastyPage'
import { ChallengePage } from './features/poetry/ChallengePage'

function LoginPage() {
  const navigate = useNavigate()
  return <AuthPage onSuccess={() => navigate('/app/home')} />
}

function ProtectedWithLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/app/home" element={<ProtectedWithLayout><DynastyMap /></ProtectedWithLayout>} />
          <Route path="/app/dynasty/:dynastyId" element={<ProtectedWithLayout><DynastyPage /></ProtectedWithLayout>} />
          <Route path="/app/challenge/:poetId" element={<ProtectedWithLayout><ChallengePage /></ProtectedWithLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

**Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Run all tests**

Run: `npm run test:run`
Expected: All existing tests pass (layout component is thin, no dedicated test needed).

**Step 5: Commit**

```bash
git add src/features/layout/AppLayout.tsx src/App.tsx
git commit -m "feat: add AppLayout with header, navigation, and theme toggle"
```

---

## Phase 2: Auth Redesign

### Task 4: Redesign Auth Page with Register Tab

**Files:**
- Modify: `src/features/auth/AuthPage.tsx` (complete rewrite)
- Modify: `src/features/auth/AuthPage.test.tsx` (update tests)

**Step 1: Update AuthPage test for new behavior**

Replace `src/features/auth/AuthPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPage } from './AuthPage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

test('shows login form by default', () => {
  render(<AuthPage />)
  expect(screen.getByRole('heading', { name: '通天路' })).toBeInTheDocument()
  expect(screen.getByLabelText('邮箱')).toBeInTheDocument()
  expect(screen.getByLabelText('密码')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
})

test('switches to register tab', async () => {
  render(<AuthPage />)
  await userEvent.click(screen.getByRole('tab', { name: '注册' }))
  expect(screen.getByLabelText('显示名称')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument()
})

test('submits login form', async () => {
  const onSuccess = vi.fn()
  render(<AuthPage onSuccess={onSuccess} />)
  await userEvent.type(screen.getByLabelText('邮箱'), 'test@test.com')
  await userEvent.type(screen.getByLabelText('密码'), 'password123')
  await userEvent.click(screen.getByRole('button', { name: '登录' }))
})

test('submits register form', async () => {
  render(<AuthPage />)
  await userEvent.click(screen.getByRole('tab', { name: '注册' }))
  await userEvent.type(screen.getByLabelText('邮箱'), 'new@test.com')
  await userEvent.type(screen.getByLabelText('密码'), 'password123')
  await userEvent.type(screen.getByLabelText('显示名称'), '诗童')
  await userEvent.click(screen.getByRole('button', { name: '注册' }))
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/auth/AuthPage.test.tsx`
Expected: FAIL — no tab elements found.

**Step 3: Rewrite AuthPage with Chinese-style design and register tab**

Replace `src/features/auth/AuthPage.tsx`:

```tsx
import { useState } from 'react'
import { useAuth } from './useAuth'

type AuthTab = 'login' | 'register'

export function AuthPage({ onSuccess }: { onSuccess?: () => void }) {
  const [tab, setTab] = useState<AuthTab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const { login, register, error, loading } = useAuth()

  async function handleSubmit() {
    if (tab === 'login') {
      await login(email, password)
    } else {
      await register(email, password, displayName)
    }
    if (!error) onSuccess?.()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary bg-[url('/ink-bg.svg')] bg-cover bg-center">
      <div className="bg-bg-card/90 backdrop-blur p-8 rounded-2xl shadow-xl w-full max-w-sm border border-border">
        <h1 className="font-serif text-3xl font-bold text-center text-accent mb-1">通天路</h1>
        <p className="text-center text-text-muted text-sm mb-6 font-kai">诗词闯关之旅</p>

        {/* Tabs */}
        <div className="flex border-b border-border-light mb-6" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'login'}
            onClick={() => setTab('login')}
            className={`flex-1 pb-2 text-center font-medium transition-colors ${
              tab === 'login'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            登录
          </button>
          <button
            role="tab"
            aria-selected={tab === 'register'}
            onClick={() => setTab('register')}
            className={`flex-1 pb-2 text-center font-medium transition-colors ${
              tab === 'register'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            注册
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full border border-border-light rounded-lg px-3 py-2 bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full border border-border-light rounded-lg px-3 py-2 bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {tab === 'register' && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-text-secondary">
                显示名称
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="你的诗号"
                className="mt-1 block w-full border border-border-light rounded-lg px-3 py-2 bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          )}

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-accent text-white py-2.5 rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? '请稍候...' : tab === 'login' ? '登录' : '注册'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Run tests**

Run: `npx vitest run src/features/auth/AuthPage.test.tsx`
Expected: 4 tests PASS.

**Step 5: Commit**

```bash
git add src/features/auth/AuthPage.tsx src/features/auth/AuthPage.test.tsx
git commit -m "feat: redesign auth page with register tab and Chinese-style UI"
```

---

## Phase 3: Database & Unlock System

### Task 5: Create Schema Migration for Unlock System

**Files:**
- Create: `supabase/migrations/003_unlock_system.sql`

**Step 1: Write the migration**

Create `supabase/migrations/003_unlock_system.sql`:

```sql
-- Add unlock fields to dynasties
ALTER TABLE dynasties ADD COLUMN unlock_requirement int NOT NULL DEFAULT 0;

-- Add ordering and boss flag to poets
ALTER TABLE poets ADD COLUMN sort_order int NOT NULL DEFAULT 0;
ALTER TABLE poets ADD COLUMN is_boss boolean NOT NULL DEFAULT false;

-- Create new progress table for per-poet tracking
CREATE TABLE poet_progress (
  id          serial PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) NOT NULL,
  poet_id     int REFERENCES poets(id) NOT NULL,
  stars       int NOT NULL DEFAULT 0 CHECK (stars >= 0 AND stars <= 3),
  completed   boolean NOT NULL DEFAULT false,
  mistakes    int NOT NULL DEFAULT 0,
  used_reveal boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, poet_id)
);

ALTER TABLE poet_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own poet_progress"
  ON poet_progress FOR ALL USING (auth.uid() = user_id);
```

**Step 2: Commit**

```bash
git add supabase/migrations/003_unlock_system.sql
git commit -m "feat: add unlock system schema (poet_progress, sort_order, is_boss)"
```

---

### Task 6: Expand Seed Data to ~65 Poems

**Files:**
- Create: `supabase/migrations/004_expanded_seed_data.sql`

**Step 1: Write the expanded seed data**

Create `supabase/migrations/004_expanded_seed_data.sql` with all 6 dynasties, ~20 poets, ~65 poems. Each poem has its lines broken into `poem_lines` for the challenge mode.

```sql
-- Clear existing seed data (idempotent re-seed)
DELETE FROM poem_lines;
DELETE FROM poems;
DELETE FROM poets;
DELETE FROM dynasties;

-- Reset sequences
ALTER SEQUENCE dynasties_id_seq RESTART WITH 1;
ALTER SEQUENCE poets_id_seq RESTART WITH 1;
ALTER SEQUENCE poems_id_seq RESTART WITH 1;
ALTER SEQUENCE poem_lines_id_seq RESTART WITH 1;

-- ============================================================
-- DYNASTIES (6)
-- ============================================================
INSERT INTO dynasties (name, display_name, sort_order, unlock_requirement) VALUES
  ('han',      '汉朝',   1, 0),
  ('weijin',   '魏晋',   2, 3),
  ('tang',     '唐朝',   3, 3),
  ('song',     '宋朝',   4, 5),
  ('yuan',     '元朝',   5, 2),
  ('mingqing', '明清',   6, 3);

-- ============================================================
-- POETS (20 total) + BOSS poets (6)
-- ============================================================

-- 汉朝 poets (3 + 1 boss)
INSERT INTO poets (dynasty_id, name, bio_short, sort_order, is_boss) VALUES
  (1, '刘邦',   '汉高祖，开创大汉王朝',               1, false),
  (1, '项羽',   '西楚霸王，力拔山兮气盖世',            2, false),
  (1, '曹操',   '东汉末年政治家、军事家、诗人',         3, false),
  (1, '汉朝综合', '综合挑战：汉朝诗词大考验',           99, true);

-- 魏晋 poets (3 + 1 boss)
INSERT INTO poets (dynasty_id, name, bio_short, sort_order, is_boss) VALUES
  (2, '陶渊明', '东晋田园诗人，不为五斗米折腰',         1, false),
  (2, '曹植',   '曹操之子，才高八斗',                  2, false),
  (2, '谢灵运', '山水诗派鼻祖',                       3, false),
  (2, '魏晋综合', '综合挑战：魏晋诗词大考验',           99, true);

-- 唐朝 poets (5 + 1 boss)
INSERT INTO poets (dynasty_id, name, bio_short, sort_order, is_boss) VALUES
  (3, '李白',     '诗仙，浪漫主义诗人代表',             1, false),
  (3, '杜甫',     '诗圣，现实主义诗人代表',             2, false),
  (3, '白居易',   '字乐天，诗风通俗易懂',              3, false),
  (3, '王维',     '诗佛，山水田园派代表',               4, false),
  (3, '李商隐',   '晚唐诗人，擅长用典',                5, false),
  (3, '唐朝综合', '综合挑战：唐朝诗词大考验',           99, true);

-- 宋朝 poets (4 + 1 boss)
INSERT INTO poets (dynasty_id, name, bio_short, sort_order, is_boss) VALUES
  (4, '苏轼',     '东坡居士，北宋文豪',                1, false),
  (4, '李清照',   '易安居士，婉约派代表',              2, false),
  (4, '辛弃疾',   '豪放派词人，文武双全',              3, false),
  (4, '陆游',     '爱国诗人，一生主张抗金',            4, false),
  (4, '宋朝综合', '综合挑战：宋朝诗词大考验',          99, true);

-- 元朝 poets (2 + 1 boss)
INSERT INTO poets (dynasty_id, name, bio_short, sort_order, is_boss) VALUES
  (5, '马致远', '元曲四大家之一',                      1, false),
  (5, '关汉卿', '元杂剧奠基人',                       2, false),
  (5, '元朝综合', '综合挑战：元朝诗词大考验',          99, true);

-- 明清 poets (3 + 1 boss)
INSERT INTO poets (dynasty_id, name, bio_short, sort_order, is_boss) VALUES
  (6, '于谦',     '明代名臣，粉骨碎身浑不怕',          1, false),
  (6, '纳兰性德', '清代第一词人',                      2, false),
  (6, '龚自珍',   '近代启蒙思想家、诗人',              3, false),
  (6, '明清综合', '综合挑战：明清诗词大考验',           99, true);

-- ============================================================
-- POEMS & LINES
-- ============================================================

-- ---- 汉朝 ----

-- 刘邦 (poet_id=1)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (1, 1, '大风歌', '大风起兮云飞扬，威加海内兮归故乡，安得猛士兮守四方！', '初中'),
  (1, 1, '鸿鹄歌', '鸿鹄高飞，一举千里。羽翮已就，横绝四海。', '初中'),
  (1, 1, '手敕太子文', '吾遭乱世，当秦禁学。吾以布衣提三尺剑取天下。', '高中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (1, 1, '大风起兮云飞扬'), (1, 2, '威加海内兮归故乡'),
  (2, 1, '鸿鹄高飞'), (2, 2, '一举千里'), (2, 3, '羽翮已就'), (2, 4, '横绝四海'),
  (3, 1, '吾遭乱世'), (3, 2, '当秦禁学');

-- 项羽 (poet_id=2)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (2, 1, '垓下歌', '力拔山兮气盖世，时不利兮骓不逝。骓不逝兮可奈何，虞兮虞兮奈若何！', '初中'),
  (2, 1, '项羽本纪节选一', '彼可取而代也。', '初中'),
  (2, 1, '项羽本纪节选二', '富贵不归故乡，如衣绣夜行，谁知之者！', '高中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (4, 1, '力拔山兮气盖世'), (4, 2, '时不利兮骓不逝'),
  (4, 3, '骓不逝兮可奈何'), (4, 4, '虞兮虞兮奈若何'),
  (5, 1, '彼可取而代也'), (5, 2, '彼可取而代也'),
  (6, 1, '富贵不归故乡'), (6, 2, '如衣绣夜行');

-- 曹操 (poet_id=3)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (3, 1, '观沧海', '东临碣石，以观沧海。水何澹澹，山岛竦峙。', '七年级'),
  (3, 1, '短歌行', '对酒当歌，人生几何！譬如朝露，去日苦多。', '高中'),
  (3, 1, '龟虽寿', '神龟虽寿，犹有竟时。螣蛇乘雾，终为土灰。', '初中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (7, 1, '东临碣石'), (7, 2, '以观沧海'), (7, 3, '水何澹澹'), (7, 4, '山岛竦峙'),
  (8, 1, '对酒当歌'), (8, 2, '人生几何'), (8, 3, '譬如朝露'), (8, 4, '去日苦多'),
  (9, 1, '神龟虽寿'), (9, 2, '犹有竟时'), (9, 3, '螣蛇乘雾'), (9, 4, '终为土灰');

-- ---- 魏晋 ----

-- 陶渊明 (poet_id=5)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (5, 2, '饮酒·其五', '结庐在人境，而无车马喧。问君何能尔？心远地自偏。', '八年级'),
  (5, 2, '归园田居·其三', '种豆南山下，草盛豆苗稀。晨兴理荒秽，带月荷锄归。', '八年级'),
  (5, 2, '桃花源记节选', '忽逢桃花林，夹岸数百步。芳草鲜美，落英缤纷。', '八年级');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (10, 1, '结庐在人境'), (10, 2, '而无车马喧'), (10, 3, '问君何能尔'), (10, 4, '心远地自偏'),
  (11, 1, '种豆南山下'), (11, 2, '草盛豆苗稀'), (11, 3, '晨兴理荒秽'), (11, 4, '带月荷锄归'),
  (12, 1, '忽逢桃花林'), (12, 2, '夹岸数百步'), (12, 3, '芳草鲜美'), (12, 4, '落英缤纷');

-- 曹植 (poet_id=6)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (6, 2, '七步诗', '煮豆持作羹，漉豉以为汁。萁在釜下燃，豆在釜中泣。', '小学'),
  (6, 2, '白马篇节选', '白马饰金羁，连翩西北驰。借问谁家子，幽并游侠儿。', '高中'),
  (6, 2, '洛神赋节选', '翩若惊鸿，婉若游龙。荣曜秋菊，华茂春松。', '高中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (13, 1, '煮豆持作羹'), (13, 2, '漉豉以为汁'), (13, 3, '萁在釜下燃'), (13, 4, '豆在釜中泣'),
  (14, 1, '白马饰金羁'), (14, 2, '连翩西北驰'), (14, 3, '借问谁家子'), (14, 4, '幽并游侠儿'),
  (15, 1, '翩若惊鸿'), (15, 2, '婉若游龙'), (15, 3, '荣曜秋菊'), (15, 4, '华茂春松');

-- 谢灵运 (poet_id=7)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (7, 2, '登池上楼', '潜虬媚幽姿，飞鸿响远音。池塘生春草，园柳变鸣禽。', '高中'),
  (7, 2, '入彭蠡湖口', '客游倦水宿，风潮难具论。洲岛骤回合，圻岸屡崩奔。', '高中'),
  (7, 2, '石壁精舍还湖中作', '昏旦变气候，山水含清晖。清晖能娱人，游子憺忘归。', '高中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (16, 1, '潜虬媚幽姿'), (16, 2, '飞鸿响远音'), (16, 3, '池塘生春草'), (16, 4, '园柳变鸣禽'),
  (17, 1, '客游倦水宿'), (17, 2, '风潮难具论'), (17, 3, '洲岛骤回合'), (17, 4, '圻岸屡崩奔'),
  (18, 1, '昏旦变气候'), (18, 2, '山水含清晖'), (18, 3, '清晖能娱人'), (18, 4, '游子憺忘归');

-- ---- 唐朝 ----

-- 李白 (poet_id=9)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (9, 3, '静夜思', '床前明月光，疑是地上霜。举头望明月，低头思故乡。', '一年级'),
  (9, 3, '望庐山瀑布', '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', '二年级'),
  (9, 3, '早发白帝城', '朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。', '三年级'),
  (9, 3, '望天门山', '天门中断楚江开，碧水东流至此回。两岸青山相对出，孤帆一片日边来。', '三年级');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (19, 1, '床前明月光'), (19, 2, '疑是地上霜'), (19, 3, '举头望明月'), (19, 4, '低头思故乡'),
  (20, 1, '日照香炉生紫烟'), (20, 2, '遥看瀑布挂前川'), (20, 3, '飞流直下三千尺'), (20, 4, '疑是银河落九天'),
  (21, 1, '朝辞白帝彩云间'), (21, 2, '千里江陵一日还'), (21, 3, '两岸猿声啼不住'), (21, 4, '轻舟已过万重山'),
  (22, 1, '天门中断楚江开'), (22, 2, '碧水东流至此回'), (22, 3, '两岸青山相对出'), (22, 4, '孤帆一片日边来');

-- 杜甫 (poet_id=10)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (10, 3, '春望', '国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。', '八年级'),
  (10, 3, '绝句', '两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。', '三年级'),
  (10, 3, '望岳', '岱宗夫如何？齐鲁青未了。造化钟神秀，阴阳割昏晓。', '七年级'),
  (10, 3, '春夜喜雨', '好雨知时节，当春乃发生。随风潜入夜，润物细无声。', '一年级');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (23, 1, '国破山河在'), (23, 2, '城春草木深'), (23, 3, '感时花溅泪'), (23, 4, '恨别鸟惊心'),
  (24, 1, '两个黄鹂鸣翠柳'), (24, 2, '一行白鹭上青天'), (24, 3, '窗含西岭千秋雪'), (24, 4, '门泊东吴万里船'),
  (25, 1, '岱宗夫如何'), (25, 2, '齐鲁青未了'), (25, 3, '造化钟神秀'), (25, 4, '阴阳割昏晓'),
  (26, 1, '好雨知时节'), (26, 2, '当春乃发生'), (26, 3, '随风潜入夜'), (26, 4, '润物细无声');

-- 白居易 (poet_id=11)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (11, 3, '赋得古原草送别', '离离原上草，一岁一枯荣。野火烧不尽，春风吹又生。', '二年级'),
  (11, 3, '忆江南', '江南好，风景旧曾谙。日出江花红胜火，春来江水绿如蓝。能不忆江南？', '四年级'),
  (11, 3, '池上', '小娃撑小艇，偷采白莲回。不解藏踪迹，浮萍一道开。', '一年级'),
  (11, 3, '暮江吟', '一道残阳铺水中，半江瑟瑟半江红。可怜九月初三夜，露似真珠月似弓。', '四年级');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (27, 1, '离离原上草'), (27, 2, '一岁一枯荣'), (27, 3, '野火烧不尽'), (27, 4, '春风吹又生'),
  (28, 1, '日出江花红胜火'), (28, 2, '春来江水绿如蓝'),
  (29, 1, '小娃撑小艇'), (29, 2, '偷采白莲回'), (29, 3, '不解藏踪迹'), (29, 4, '浮萍一道开'),
  (30, 1, '一道残阳铺水中'), (30, 2, '半江瑟瑟半江红'), (30, 3, '可怜九月初三夜'), (30, 4, '露似真珠月似弓');

-- 王维 (poet_id=12)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (12, 3, '九月九日忆山东兄弟', '独在异乡为异客，每逢佳节倍思亲。遥知兄弟登高处，遍插茱萸少一人。', '四年级'),
  (12, 3, '鹿柴', '空山不见人，但闻人语响。返景入深林，复照青苔上。', '三年级'),
  (12, 3, '送元二使安西', '渭城朝雨浥轻尘，客舍青青柳色新。劝君更尽一杯酒，西出阳关无故人。', '四年级'),
  (12, 3, '鸟鸣涧', '人闲桂花落，夜静春山空。月出惊山鸟，时鸣春涧中。', '五年级');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (31, 1, '独在异乡为异客'), (31, 2, '每逢佳节倍思亲'), (31, 3, '遥知兄弟登高处'), (31, 4, '遍插茱萸少一人'),
  (32, 1, '空山不见人'), (32, 2, '但闻人语响'), (32, 3, '返景入深林'), (32, 4, '复照青苔上'),
  (33, 1, '渭城朝雨浥轻尘'), (33, 2, '客舍青青柳色新'), (33, 3, '劝君更尽一杯酒'), (33, 4, '西出阳关无故人'),
  (34, 1, '人闲桂花落'), (34, 2, '夜静春山空'), (34, 3, '月出惊山鸟'), (34, 4, '时鸣春涧中');

-- 李商隐 (poet_id=13)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (13, 3, '夜雨寄北', '君问归期未有期，巴山夜雨涨秋池。何当共剪西窗烛，却话巴山夜雨时。', '七年级'),
  (13, 3, '嫦娥', '云母屏风烛影深，长河渐落晓星沉。嫦娥应悔偷灵药，碧海青天夜夜心。', '五年级'),
  (13, 3, '登乐游原', '向晚意不适，驱车登古原。夕阳无限好，只是近黄昏。', '五年级'),
  (13, 3, '无题', '相见时难别亦难，东风无力百花残。春蚕到死丝方尽，蜡炬成灰泪始干。', '初中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (35, 1, '君问归期未有期'), (35, 2, '巴山夜雨涨秋池'), (35, 3, '何当共剪西窗烛'), (35, 4, '却话巴山夜雨时'),
  (36, 1, '云母屏风烛影深'), (36, 2, '长河渐落晓星沉'), (36, 3, '嫦娥应悔偷灵药'), (36, 4, '碧海青天夜夜心'),
  (37, 1, '向晚意不适'), (37, 2, '驱车登古原'), (37, 3, '夕阳无限好'), (37, 4, '只是近黄昏'),
  (38, 1, '相见时难别亦难'), (38, 2, '东风无力百花残'), (38, 3, '春蚕到死丝方尽'), (38, 4, '蜡炬成灰泪始干');

-- ---- 宋朝 ----

-- 苏轼 (poet_id=15)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (15, 4, '水调歌头', '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。', '九年级'),
  (15, 4, '题西林壁', '横看成岭侧成峰，远近高低各不同。不识庐山真面目，只缘身在此山中。', '四年级'),
  (15, 4, '饮湖上初晴后雨', '水光潋滟晴方好，山色空蒙雨亦奇。欲把西湖比西子，淡妆浓抹总相宜。', '三年级');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (39, 1, '明月几时有'), (39, 2, '把酒问青天'), (39, 3, '不知天上宫阙'), (39, 4, '今夕是何年'),
  (40, 1, '横看成岭侧成峰'), (40, 2, '远近高低各不同'), (40, 3, '不识庐山真面目'), (40, 4, '只缘身在此山中'),
  (41, 1, '水光潋滟晴方好'), (41, 2, '山色空蒙雨亦奇'), (41, 3, '欲把西湖比西子'), (41, 4, '淡妆浓抹总相宜');

-- 李清照 (poet_id=16)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (16, 4, '如梦令', '常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。', '初中'),
  (16, 4, '夏日绝句', '生当作人杰，死亦为鬼雄。至今思项羽，不肯过江东。', '五年级'),
  (16, 4, '声声慢节选', '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。乍暖还寒时候，最难将息。', '高中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (42, 1, '常记溪亭日暮'), (42, 2, '沉醉不知归路'), (42, 3, '兴尽晚回舟'), (42, 4, '误入藕花深处'),
  (43, 1, '生当作人杰'), (43, 2, '死亦为鬼雄'), (43, 3, '至今思项羽'), (43, 4, '不肯过江东'),
  (44, 1, '寻寻觅觅'), (44, 2, '冷冷清清'), (44, 3, '凄凄惨惨戚戚'), (44, 4, '乍暖还寒时候');

-- 辛弃疾 (poet_id=17)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (17, 4, '西江月·夜行黄沙道中', '明月别枝惊鹊，清风半夜鸣蝉。稻花香里说丰年，听取蛙声一片。', '六年级'),
  (17, 4, '破阵子', '醉里挑灯看剑，梦回吹角连营。八百里分麾下炙，五十弦翻塞外声。', '九年级'),
  (17, 4, '青玉案·元夕', '东风夜放花千树，更吹落、星如雨。宝马雕车香满路。', '高中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (45, 1, '明月别枝惊鹊'), (45, 2, '清风半夜鸣蝉'), (45, 3, '稻花香里说丰年'), (45, 4, '听取蛙声一片'),
  (46, 1, '醉里挑灯看剑'), (46, 2, '梦回吹角连营'), (46, 3, '八百里分麾下炙'), (46, 4, '五十弦翻塞外声'),
  (47, 1, '东风夜放花千树'), (47, 2, '更吹落星如雨');

-- 陆游 (poet_id=18)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (18, 4, '示儿', '死去元知万事空，但悲不见九州同。王师北定中原日，家祭无忘告乃翁。', '六年级'),
  (18, 4, '游山西村', '莫笑农家腊酒浑，丰年留客足鸡豚。山重水复疑无路，柳暗花明又一村。', '七年级'),
  (18, 4, '十一月四日风雨大作', '僵卧孤村不自哀，尚思为国戍轮台。夜阑卧听风吹雨，铁马冰河入梦来。', '七年级');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (48, 1, '死去元知万事空'), (48, 2, '但悲不见九州同'), (48, 3, '王师北定中原日'), (48, 4, '家祭无忘告乃翁'),
  (49, 1, '莫笑农家腊酒浑'), (49, 2, '丰年留客足鸡豚'), (49, 3, '山重水复疑无路'), (49, 4, '柳暗花明又一村'),
  (50, 1, '僵卧孤村不自哀'), (50, 2, '尚思为国戍轮台'), (50, 3, '夜阑卧听风吹雨'), (50, 4, '铁马冰河入梦来');

-- ---- 元朝 ----

-- 马致远 (poet_id=20)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (20, 5, '天净沙·秋思', '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。', '七年级'),
  (20, 5, '寿阳曲·远浦帆归', '夕阳下，酒旆闲，两三航未曾着岸。落花水香茅舍晚，断桥头卖鱼人散。', '高中'),
  (20, 5, '天净沙·秋', '孤村落日残霞，轻烟老树寒鸦，一点飞鸿影下。青山绿水，白草红叶黄花。', '初中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (51, 1, '枯藤老树昏鸦'), (51, 2, '小桥流水人家'), (51, 3, '古道西风瘦马'), (51, 4, '夕阳西下'),
  (52, 1, '夕阳下'), (52, 2, '酒旆闲'), (52, 3, '两三航未曾着岸'), (52, 4, '落花水香茅舍晚'),
  (53, 1, '孤村落日残霞'), (53, 2, '轻烟老树寒鸦'), (53, 3, '一点飞鸿影下'), (53, 4, '青山绿水');

-- 关汉卿 (poet_id=21)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (21, 5, '南吕·一枝花·不伏老', '我是个蒸不烂、煮不熟、捶不扁、炒不爆、响当当一粒铜豌豆。', '高中'),
  (21, 5, '大德歌·冬', '雪粉华，舞梨花，再不见烟村四五家。密洒堪图画，看疏林噪晚鸦。', '初中'),
  (21, 5, '四块玉·别情', '自送别，心难舍，一点相思几时绝？凭阑袖拂杨花雪。', '初中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (54, 1, '我是个蒸不烂煮不熟'), (54, 2, '捶不扁炒不爆'), (54, 3, '响当当一粒铜豌豆'), (54, 4, '响当当一粒铜豌豆'),
  (55, 1, '雪粉华'), (55, 2, '舞梨花'), (55, 3, '再不见烟村四五家'), (55, 4, '密洒堪图画'),
  (56, 1, '自送别'), (56, 2, '心难舍'), (56, 3, '一点相思几时绝'), (56, 4, '凭阑袖拂杨花雪');

-- ---- 明清 ----

-- 于谦 (poet_id=23)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (23, 6, '石灰吟', '千锤万凿出深山，烈火焚烧若等闲。粉骨碎身浑不怕，要留清白在人间。', '六年级'),
  (23, 6, '咏煤炭', '凿开混沌得乌金，藏蓄阳和意最深。爝火燃回春浩浩，洪炉照破夜沉沉。', '初中'),
  (23, 6, '入京', '绢帕蘑菇与线香，本资民用反为殃。清风两袖朝天去，免得闾阎话短长。', '初中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (57, 1, '千锤万凿出深山'), (57, 2, '烈火焚烧若等闲'), (57, 3, '粉骨碎身浑不怕'), (57, 4, '要留清白在人间'),
  (58, 1, '凿开混沌得乌金'), (58, 2, '藏蓄阳和意最深'), (58, 3, '爝火燃回春浩浩'), (58, 4, '洪炉照破夜沉沉'),
  (59, 1, '绢帕蘑菇与线香'), (59, 2, '本资民用反为殃'), (59, 3, '清风两袖朝天去'), (59, 4, '免得闾阎话短长');

-- 纳兰性德 (poet_id=24)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (24, 6, '长相思', '山一程，水一程，身向榆关那畔行，夜深千帐灯。', '四年级'),
  (24, 6, '木兰花·拟古决绝词', '人生若只如初见，何事秋风悲画扇。等闲变却故人心，却道故人心易变。', '高中'),
  (24, 6, '浣溪沙', '谁念西风独自凉，萧萧黄叶闭疏窗，沉思往事立残阳。', '高中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (60, 1, '山一程'), (60, 2, '水一程'), (60, 3, '身向榆关那畔行'), (60, 4, '夜深千帐灯'),
  (61, 1, '人生若只如初见'), (61, 2, '何事秋风悲画扇'), (61, 3, '等闲变却故人心'), (61, 4, '却道故人心易变'),
  (62, 1, '谁念西风独自凉'), (62, 2, '萧萧黄叶闭疏窗'), (62, 3, '沉思往事立残阳'), (62, 4, '沉思往事立残阳');

-- 龚自珍 (poet_id=25)
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  (25, 6, '己亥杂诗·其五', '浩荡离愁白日斜，吟鞭东指即天涯。落红不是无情物，化作春泥更护花。', '七年级'),
  (25, 6, '己亥杂诗·其一百二十五', '九州生气恃风雷，万马齐喑究可哀。我劝天公重抖擞，不拘一格降人才。', '五年级'),
  (25, 6, '己亥杂诗·其二百二十', '少年击剑更吹箫，剑气箫心一例消。谁分苍凉归棹后，万千哀乐集今朝。', '高中');

INSERT INTO poem_lines (poem_id, line_number, text) VALUES
  (63, 1, '浩荡离愁白日斜'), (63, 2, '吟鞭东指即天涯'), (63, 3, '落红不是无情物'), (63, 4, '化作春泥更护花'),
  (64, 1, '九州生气恃风雷'), (64, 2, '万马齐喑究可哀'), (64, 3, '我劝天公重抖擞'), (64, 4, '不拘一格降人才'),
  (65, 1, '少年击剑更吹箫'), (65, 2, '剑气箫心一例消'), (65, 3, '谁分苍凉归棹后'), (65, 4, '万千哀乐集今朝');
```

**Step 2: Commit**

```bash
git add supabase/migrations/004_expanded_seed_data.sql
git commit -m "feat: add expanded seed data with 65 poems across 6 dynasties and 20 poets"
```

---

### Task 7: Create Progress/Unlock Hooks

**Files:**
- Create: `src/features/progress/useProgress.ts`
- Create: `src/features/progress/useProgress.test.ts`
- Create: `src/features/progress/unlockLogic.ts`
- Create: `src/features/progress/unlockLogic.test.ts`

**Step 1: Write the unlock logic test**

Create `src/features/progress/unlockLogic.test.ts`:

```ts
import { isDynastyUnlocked, isPoetUnlocked, calculateStars } from './unlockLogic'
import type { DynastyWithProgress, PoetWithProgress } from './unlockLogic'

test('first dynasty is always unlocked', () => {
  const dynasty: DynastyWithProgress = {
    id: 1, sort_order: 1, unlock_requirement: 0,
    completedPoets: 0, totalPoets: 3,
  }
  expect(isDynastyUnlocked(dynasty, null)).toBe(true)
})

test('dynasty is locked if previous dynasty boss not completed', () => {
  const dynasty: DynastyWithProgress = {
    id: 2, sort_order: 2, unlock_requirement: 3,
    completedPoets: 0, totalPoets: 3,
  }
  const prev: DynastyWithProgress = {
    id: 1, sort_order: 1, unlock_requirement: 0,
    completedPoets: 2, totalPoets: 3, bossCompleted: false,
  }
  expect(isDynastyUnlocked(dynasty, prev)).toBe(false)
})

test('dynasty is unlocked if previous dynasty boss completed', () => {
  const dynasty: DynastyWithProgress = {
    id: 2, sort_order: 2, unlock_requirement: 3,
    completedPoets: 0, totalPoets: 3,
  }
  const prev: DynastyWithProgress = {
    id: 1, sort_order: 1, unlock_requirement: 0,
    completedPoets: 3, totalPoets: 3, bossCompleted: true,
  }
  expect(isDynastyUnlocked(dynasty, prev)).toBe(true)
})

test('first poet in dynasty is always unlocked', () => {
  const poet: PoetWithProgress = { id: 1, sort_order: 1, is_boss: false, completed: false, stars: 0 }
  expect(isPoetUnlocked(poet, null, false)).toBe(true)
})

test('poet is locked if previous poet not completed', () => {
  const poet: PoetWithProgress = { id: 2, sort_order: 2, is_boss: false, completed: false, stars: 0 }
  const prev: PoetWithProgress = { id: 1, sort_order: 1, is_boss: false, completed: false, stars: 0 }
  expect(isPoetUnlocked(poet, prev, false)).toBe(false)
})

test('poet is unlocked if previous poet completed', () => {
  const poet: PoetWithProgress = { id: 2, sort_order: 2, is_boss: false, completed: false, stars: 0 }
  const prev: PoetWithProgress = { id: 1, sort_order: 1, is_boss: false, completed: true, stars: 2 }
  expect(isPoetUnlocked(poet, prev, false)).toBe(true)
})

test('boss is locked until all regular poets completed', () => {
  const boss: PoetWithProgress = { id: 99, sort_order: 99, is_boss: true, completed: false, stars: 0 }
  expect(isPoetUnlocked(boss, null, false)).toBe(false)
})

test('boss is unlocked when all regular poets completed', () => {
  const boss: PoetWithProgress = { id: 99, sort_order: 99, is_boss: true, completed: false, stars: 0 }
  expect(isPoetUnlocked(boss, null, true)).toBe(true)
})

test('3 stars when no mistakes and no reveals', () => {
  expect(calculateStars(0, false)).toBe(3)
})

test('2 stars when 1-2 mistakes', () => {
  expect(calculateStars(1, false)).toBe(2)
  expect(calculateStars(2, false)).toBe(2)
})

test('1 star when used reveal', () => {
  expect(calculateStars(0, true)).toBe(1)
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/progress/unlockLogic.test.ts`
Expected: FAIL — module not found.

**Step 3: Implement unlockLogic**

Create `src/features/progress/unlockLogic.ts`:

```ts
export interface DynastyWithProgress {
  id: number
  sort_order: number
  unlock_requirement: number
  completedPoets: number
  totalPoets: number
  bossCompleted?: boolean
}

export interface PoetWithProgress {
  id: number
  sort_order: number
  is_boss: boolean
  completed: boolean
  stars: number
}

export function isDynastyUnlocked(
  dynasty: DynastyWithProgress,
  previousDynasty: DynastyWithProgress | null,
): boolean {
  if (dynasty.sort_order === 1) return true
  if (!previousDynasty) return false
  return previousDynasty.bossCompleted === true
}

export function isPoetUnlocked(
  poet: PoetWithProgress,
  previousPoet: PoetWithProgress | null,
  allRegularCompleted: boolean,
): boolean {
  if (poet.is_boss) return allRegularCompleted
  if (poet.sort_order === 1) return true
  if (!previousPoet) return false
  return previousPoet.completed
}

export function calculateStars(mistakes: number, usedReveal: boolean): number {
  if (usedReveal) return 1
  if (mistakes === 0) return 3
  if (mistakes <= 2) return 2
  return 1
}
```

**Step 4: Run tests**

Run: `npx vitest run src/features/progress/unlockLogic.test.ts`
Expected: 11 tests PASS.

**Step 5: Write useProgress hook test**

Create `src/features/progress/useProgress.test.ts`:

```ts
import { renderHook, waitFor } from '@testing-library/react'
import { useProgress } from './useProgress'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { poet_id: 1, stars: 3, completed: true, mistakes: 0, used_reveal: false },
          ],
          error: null,
        }),
      }),
    }),
  },
}))

test('fetches progress for a user', async () => {
  const { result } = renderHook(() => useProgress('user-123'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.progressMap).toEqual({
    1: { poet_id: 1, stars: 3, completed: true, mistakes: 0, used_reveal: false },
  })
})
```

**Step 6: Implement useProgress**

Create `src/features/progress/useProgress.ts`:

```ts
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface PoetProgress {
  poet_id: number
  stars: number
  completed: boolean
  mistakes: number
  used_reveal: boolean
}

export function useProgress(userId: string) {
  const [progressMap, setProgressMap] = useState<Record<number, PoetProgress>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    supabase
      .from('poet_progress')
      .select('poet_id, stars, completed, mistakes, used_reveal')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (!error && data) {
          const map: Record<number, PoetProgress> = {}
          for (const row of data) {
            map[row.poet_id] = row
          }
          setProgressMap(map)
        }
        setLoading(false)
      })
  }, [userId])

  async function saveProgress(poetId: number, stars: number, mistakes: number, usedReveal: boolean) {
    const entry = { user_id: userId, poet_id: poetId, stars, completed: true, mistakes, used_reveal: usedReveal }
    await supabase.from('poet_progress').upsert(entry, { onConflict: 'user_id,poet_id' })
    setProgressMap(prev => ({ ...prev, [poetId]: { poet_id: poetId, stars, completed: true, mistakes, used_reveal: usedReveal } }))
  }

  return { progressMap, loading, saveProgress }
}
```

**Step 7: Run all progress tests**

Run: `npx vitest run src/features/progress/`
Expected: All tests PASS.

**Step 8: Commit**

```bash
git add src/features/progress/
git commit -m "feat: add progress tracking with unlock logic and star ratings"
```

---

## Phase 4: UI Redesign

### Task 8: Redesign Dynasty Map Page

**Files:**
- Modify: `src/features/scenes/DynastyMap.tsx` (complete rewrite)
- Modify: `src/features/scenes/useDynasties.ts` (extend Dynasty type)
- Modify: `src/features/scenes/DynastyMap.test.tsx` (update tests)

**Step 1: Update useDynasties to include unlock_requirement**

Replace `src/features/scenes/useDynasties.ts`:

```ts
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface Dynasty {
  id: number
  name: string
  display_name: string
  sort_order: number
  unlock_requirement: number
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

**Step 2: Update DynastyMap test**

Replace `src/features/scenes/DynastyMap.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DynastyMap } from './DynastyMap'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 1, name: 'han', display_name: '汉朝', sort_order: 1, unlock_requirement: 0 },
            { id: 2, name: 'tang', display_name: '唐朝', sort_order: 2, unlock_requirement: 3 },
          ],
          error: null,
        }),
      }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

vi.mock('../progress/useProgress', () => ({
  useProgress: () => ({
    progressMap: {},
    loading: false,
  }),
}))

vi.mock('../auth/AuthProvider', () => ({
  useUser: () => ({ user: { id: 'test-user', user_metadata: { display_name: '诗童' } }, loading: false }),
}))

test('renders dynasty names', async () => {
  render(<MemoryRouter><DynastyMap /></MemoryRouter>)
  expect(await screen.findByText('汉朝')).toBeInTheDocument()
  expect(await screen.findByText('唐朝')).toBeInTheDocument()
})

test('shows locked state for locked dynasties', async () => {
  render(<MemoryRouter><DynastyMap /></MemoryRouter>)
  // Tang dynasty should show lock since no progress
  const tang = await screen.findByText('唐朝')
  expect(tang.closest('[data-locked]')).toBeInTheDocument()
})
```

**Step 3: Rewrite DynastyMap with Chinese-style scroll layout**

Replace `src/features/scenes/DynastyMap.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { useDynasties } from './useDynasties'
import { useUser } from '../auth/AuthProvider'
import { useProgress } from '../progress/useProgress'
import { isDynastyUnlocked } from '../progress/unlockLogic'
import type { DynastyWithProgress } from '../progress/unlockLogic'

const DYNASTY_STYLES: Record<string, string> = {
  han: 'dynasty-han',
  weijin: 'dynasty-weijin',
  tang: 'dynasty-tang',
  song: 'dynasty-song',
  yuan: 'dynasty-yuan',
  mingqing: 'dynasty-mingqing',
}

export function DynastyMap() {
  const { dynasties, loading } = useDynasties()
  const { user } = useUser()
  const { progressMap, loading: progressLoading } = useProgress(user?.id ?? '')

  if (loading || progressLoading) {
    return <div className="flex items-center justify-center py-20 text-text-muted">加载中…</div>
  }

  // Build dynasty progress data
  // For now, count completed poets per dynasty from progressMap
  // This is simplified — a production version would join with poets table
  const dynastyProgressList: DynastyWithProgress[] = dynasties.map(d => ({
    id: d.id,
    sort_order: d.sort_order,
    unlock_requirement: d.unlock_requirement,
    completedPoets: 0, // Will be populated when we have full data
    totalPoets: 0,
    bossCompleted: false,
  }))

  return (
    <div className="py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-accent">诗词闯关</h1>
        <p className="text-text-muted text-sm mt-1 font-kai">穿越千年，与诗人对话</p>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-4 px-4 max-w-5xl mx-auto snap-x snap-mandatory">
        {dynasties.map((d, i) => {
          const dp = dynastyProgressList[i]
          const prevDp = i > 0 ? dynastyProgressList[i - 1] : null
          const unlocked = isDynastyUnlocked(dp, prevDp)
          const styleClass = DYNASTY_STYLES[d.name] ?? ''

          if (!unlocked) {
            return (
              <div
                key={d.id}
                data-locked
                className="flex-shrink-0 w-40 snap-center opacity-50"
              >
                <div className="bg-bg-card rounded-2xl border-2 border-border-light p-6 text-center h-48 flex flex-col items-center justify-center">
                  <div className="text-4xl mb-3 text-text-muted">🔒</div>
                  <span className="font-serif text-lg text-text-muted">{d.display_name}</span>
                </div>
              </div>
            )
          }

          return (
            <Link
              key={d.id}
              to={`/app/dynasty/${d.id}`}
              className={`flex-shrink-0 w-40 snap-center ${styleClass}`}
            >
              <div className="bg-bg-card rounded-2xl border-2 border-[var(--dynasty-primary)] p-6 text-center h-48 flex flex-col items-center justify-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-[var(--dynasty-primary)]/10 flex items-center justify-center mb-3">
                  <span className="font-serif text-2xl font-bold text-[var(--dynasty-primary)]">
                    {d.display_name.charAt(0)}
                  </span>
                </div>
                <span className="font-serif text-lg font-bold text-[var(--dynasty-primary)]">
                  {d.display_name}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 4: Run tests**

Run: `npx vitest run src/features/scenes/DynastyMap.test.tsx`
Expected: Tests PASS.

**Step 5: Commit**

```bash
git add src/features/scenes/DynastyMap.tsx src/features/scenes/useDynasties.ts src/features/scenes/DynastyMap.test.tsx
git commit -m "feat: redesign dynasty map with Chinese-style scroll layout and lock states"
```

---

### Task 9: Redesign Poet List Page

**Files:**
- Modify: `src/features/scenes/DynastyPage.tsx` (complete rewrite)
- Modify: `src/features/scenes/usePoets.ts` (extend Poet type)
- Modify: `src/features/scenes/DynastyPage.test.tsx` (update tests)

**Step 1: Update usePoets to include sort_order and is_boss**

Replace `src/features/scenes/usePoets.ts`:

```ts
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface Poet {
  id: number
  name: string
  bio_short: string | null
  avatar_url: string | null
  sort_order: number
  is_boss: boolean
}

export function usePoets(dynastyId: number) {
  const [poets, setPoets] = useState<Poet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('poets')
      .select('id, name, bio_short, avatar_url, sort_order, is_boss')
      .eq('dynasty_id', dynastyId)
      .order('sort_order')
      .then(({ data }) => {
        setPoets(data ?? [])
        setLoading(false)
      })
  }, [dynastyId])

  return { poets, loading }
}
```

**Step 2: Update DynastyPage test**

Replace `src/features/scenes/DynastyPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DynastyPage } from './DynastyPage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              { id: 1, name: '李白', bio_short: '诗仙', avatar_url: null, sort_order: 1, is_boss: false },
              { id: 2, name: '杜甫', bio_short: '诗圣', avatar_url: null, sort_order: 2, is_boss: false },
              { id: 99, name: '唐朝综合', bio_short: null, avatar_url: null, sort_order: 99, is_boss: true },
            ],
            error: null,
          }),
        }),
      }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

vi.mock('../progress/useProgress', () => ({
  useProgress: () => ({
    progressMap: { 1: { poet_id: 1, stars: 3, completed: true, mistakes: 0, used_reveal: false } },
    loading: false,
  }),
}))

vi.mock('../auth/AuthProvider', () => ({
  useUser: () => ({ user: { id: 'test-user', user_metadata: {} }, loading: false }),
}))

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={['/app/dynasty/3']}>
      <Routes>
        <Route path="/app/dynasty/:dynastyId" element={<DynastyPage />} />
      </Routes>
    </MemoryRouter>
  )
}

test('renders poet names', async () => {
  renderWithRoute()
  expect(await screen.findByText('李白')).toBeInTheDocument()
  expect(await screen.findByText('杜甫')).toBeInTheDocument()
})

test('shows boss with special styling', async () => {
  renderWithRoute()
  const boss = await screen.findByText('唐朝综合')
  expect(boss.closest('[data-boss]')).toBeInTheDocument()
})
```

**Step 3: Rewrite DynastyPage with name-card style**

Replace `src/features/scenes/DynastyPage.tsx`:

```tsx
import { Link, useParams } from 'react-router-dom'
import { usePoets } from './usePoets'
import { useUser } from '../auth/AuthProvider'
import { useProgress } from '../progress/useProgress'
import { isPoetUnlocked } from '../progress/unlockLogic'
import type { PoetWithProgress } from '../progress/unlockLogic'

export function DynastyPage() {
  const { dynastyId } = useParams<{ dynastyId: string }>()
  const { poets, loading } = usePoets(Number(dynastyId))
  const { user } = useUser()
  const { progressMap, loading: progressLoading } = useProgress(user?.id ?? '')

  if (loading || progressLoading) {
    return <div className="flex items-center justify-center py-20 text-text-muted">加载中…</div>
  }

  const regularPoets = poets.filter(p => !p.is_boss)
  const bossPoet = poets.find(p => p.is_boss)
  const allRegularCompleted = regularPoets.every(p => progressMap[p.id]?.completed)

  const poetsWithProgress: PoetWithProgress[] = poets.map(p => ({
    id: p.id,
    sort_order: p.sort_order,
    is_boss: p.is_boss,
    completed: progressMap[p.id]?.completed ?? false,
    stars: progressMap[p.id]?.stars ?? 0,
  }))

  function renderStars(stars: number) {
    return (
      <span className="text-gold text-sm">
        {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
      </span>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="text-center mb-8">
        <Link to="/app/home" className="text-text-muted text-sm hover:text-accent">← 返回朝代</Link>
        <h1 className="font-serif text-2xl font-bold text-accent mt-2">选择诗人</h1>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        {regularPoets.map((p, i) => {
          const pw = poetsWithProgress.find(pw => pw.id === p.id)!
          const prevPw = i > 0 ? poetsWithProgress.find(pw => pw.id === regularPoets[i - 1].id)! : null
          const unlocked = isPoetUnlocked(pw, prevPw, false)

          if (!unlocked) {
            return (
              <div key={p.id} data-locked className="bg-bg-card rounded-xl border border-border-light p-4 opacity-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-text-muted">🔒</span>
                  <div>
                    <p className="font-serif text-lg text-text-muted">{p.name}</p>
                    {p.bio_short && <p className="text-xs text-text-muted mt-0.5">{p.bio_short}</p>}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <Link
              key={p.id}
              to={`/app/challenge/${p.id}`}
              className="block bg-bg-card rounded-xl border border-border hover:border-accent p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="font-serif font-bold text-accent">{p.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-serif text-lg font-bold text-text-primary">{p.name}</p>
                    {p.bio_short && <p className="text-xs text-text-muted mt-0.5">{p.bio_short}</p>}
                  </div>
                </div>
                <div>
                  {pw.completed ? renderStars(pw.stars) : <span className="text-sm text-text-muted">未通关</span>}
                </div>
              </div>
            </Link>
          )
        })}

        {/* BOSS */}
        {bossPoet && (
          <div className="mt-6 pt-6 border-t border-border-light">
            {allRegularCompleted ? (
              <Link
                to={`/app/challenge/${bossPoet.id}?boss=true`}
                data-boss
                className="block bg-bg-card rounded-xl border-2 border-gold p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-gold text-xl">👑</span>
                    </div>
                    <div>
                      <p className="font-serif text-lg font-bold text-gold">{bossPoet.name}</p>
                      <p className="text-xs text-text-muted">综合挑战</p>
                    </div>
                  </div>
                  <span className="text-gold font-bold">BOSS</span>
                </div>
              </Link>
            ) : (
              <div data-boss data-locked className="bg-bg-card rounded-xl border-2 border-border-light p-4 opacity-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-text-muted">🔒</span>
                  <div>
                    <p className="font-serif text-lg text-text-muted">{bossPoet.name}</p>
                    <p className="text-xs text-text-muted">通关所有诗人后解锁</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 4: Run tests**

Run: `npx vitest run src/features/scenes/DynastyPage.test.tsx`
Expected: Tests PASS.

**Step 5: Commit**

```bash
git add src/features/scenes/DynastyPage.tsx src/features/scenes/usePoets.ts src/features/scenes/DynastyPage.test.tsx
git commit -m "feat: redesign poet list with name cards, lock states, and boss challenge"
```

---

### Task 10: Redesign Challenge Page with Book/Scroll Style

**Files:**
- Modify: `src/features/poetry/ChallengePage.tsx` (complete rewrite)
- Modify: `src/features/poetry/useChallenge.ts` (fix poetId→actual poem query)
- Modify: `src/features/poetry/ChallengePage.test.tsx` (update tests)

**Step 1: Fix useChallenge to properly query poems by poet_id**

Replace `src/features/poetry/useChallenge.ts`:

```ts
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface PoemLine {
  id: number
  poem_id: number
  line_number: number
  text: string
}

export interface PoemInfo {
  id: number
  title: string
}

export function useChallenge(poetId: number) {
  const [lines, setLines] = useState<PoemLine[]>([])
  const [poems, setPoems] = useState<PoemInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Get all poems by this poet
      const { data: poemData } = await supabase
        .from('poems')
        .select('id, title')
        .eq('poet_id', poetId)
        .order('id')

      if (poemData && poemData.length > 0) {
        setPoems(poemData)
        const poemIds = poemData.map(p => p.id)
        const { data: lineData } = await supabase
          .from('poem_lines')
          .select('id, poem_id, line_number, text')
          .in('poem_id', poemIds)
          .order('poem_id')
          .order('line_number')

        setLines(lineData ?? [])
      }
      setLoading(false)
    }
    fetchData()
  }, [poetId])

  return { lines, poems, loading }
}
```

**Step 2: Update ChallengePage test**

Replace `src/features/poetry/ChallengePage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ChallengePage } from './ChallengePage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'poems') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [{ id: 1, title: '静夜思' }],
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'poem_lines') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    { id: 1, poem_id: 1, line_number: 1, text: '床前明月光' },
                    { id: 2, poem_id: 1, line_number: 2, text: '疑是地上霜' },
                    { id: 3, poem_id: 1, line_number: 3, text: '举头望明月' },
                    { id: 4, poem_id: 1, line_number: 4, text: '低头思故乡' },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'user_profiles') {
        return { update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }) }
      }
      if (table === 'poet_progress') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
          upsert: vi.fn().mockResolvedValue({}),
        }
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

vi.mock('../auth/AuthProvider', () => ({
  useUser: () => ({ user: { id: 'test-user', user_metadata: {} }, loading: false }),
}))

function renderChallenge() {
  return render(
    <MemoryRouter initialEntries={['/app/challenge/1']}>
      <Routes>
        <Route path="/app/challenge/:poetId" element={<ChallengePage />} />
      </Routes>
    </MemoryRouter>
  )
}

test('shows poet line as prompt', async () => {
  renderChallenge()
  expect(await screen.findByText('床前明月光')).toBeInTheDocument()
})

test('shows correct feedback on right answer', async () => {
  renderChallenge()
  await screen.findByText('床前明月光')
  const input = screen.getByPlaceholderText('请填写下一句…')
  await userEvent.type(input, '疑是地上霜')
  await userEvent.click(screen.getByRole('button', { name: '提交' }))
  expect(await screen.findByText('正确！')).toBeInTheDocument()
})
```

**Step 3: Rewrite ChallengePage with book/scroll style**

Replace `src/features/poetry/ChallengePage.tsx`:

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChallenge } from './useChallenge'
import { matchAnswer } from './matchAnswer'
import type { MatchResult } from './matchAnswer'
import { useUser } from '../auth/AuthProvider'
import { useCoins } from '../gamification/useCoins'

export function ChallengePage() {
  const { poetId } = useParams<{ poetId: string }>()
  const navigate = useNavigate()
  const { lines, poems, loading } = useChallenge(Number(poetId))
  const { user } = useUser()
  const { coins, awardCoins } = useCoins(user?.id ?? '')

  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<MatchResult | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [usedReveal, setUsedReveal] = useState(false)
  const [showResults, setShowResults] = useState(false)

  if (loading) return <div className="flex items-center justify-center py-20 text-text-muted">加载中…</div>
  if (lines.length < 2) return <div className="flex items-center justify-center py-20 text-text-muted">暂无题目</div>

  const totalPairs = Math.floor(lines.length / 2)
  const poetLine = lines[currentPairIndex * 2]
  const answerLine = lines[currentPairIndex * 2 + 1]
  const currentPoemTitle = poems.find(p => p.id === poetLine?.poem_id)?.title ?? ''

  function handleSubmit() {
    if (!answerLine) return
    const result = matchAnswer(answerLine.text, input)
    setFeedback(result)
    if (result === 'correct') {
      awardCoins(10)
    } else if (result === 'wrong') {
      setMistakes(prev => prev + 1)
    }
  }

  function handleReveal() {
    setUsedReveal(true)
    setFeedback('wrong')
  }

  function handleNext() {
    const nextIndex = currentPairIndex + 1
    if (nextIndex < totalPairs) {
      setCurrentPairIndex(nextIndex)
      setInput('')
      setFeedback(null)
    } else {
      setShowResults(true)
    }
  }

  // Results screen
  if (showResults) {
    const stars = usedReveal ? 1 : mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
    const earnedCoins = totalPairs * 10 // coins already awarded per question

    return (
      <div className="flex items-center justify-center py-20 px-4">
        <div className="bg-bg-card rounded-2xl border border-border p-8 text-center max-w-sm w-full">
          <h2 className="font-serif text-2xl font-bold text-accent mb-4">闯关完成！</h2>
          <div className="text-4xl mb-4">
            {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </div>
          <p className="text-text-secondary mb-2">获得 <span className="text-gold font-bold">{earnedCoins}</span> 金币</p>
          <p className="text-text-muted text-sm mb-6">
            {mistakes === 0 ? '完美通关！' : `答错 ${mistakes} 次`}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-accent text-white py-2.5 rounded-lg hover:bg-accent-hover transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    )
  }

  const feedbackConfig: Record<MatchResult, { text: string; color: string }> = {
    correct: { text: '正确！', color: 'text-success' },
    close: { text: '接近了，再试试！', color: 'text-warning' },
    wrong: { text: `答案是：${answerLine?.text}`, color: 'text-error' },
  }

  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="bg-bg-card rounded-2xl border border-border p-8 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-text-muted font-kai">{currentPoemTitle}</span>
          <span className="text-sm text-gold font-bold">💰 {coins}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-bg-secondary rounded-full h-2 mb-6">
          <div
            className="bg-accent h-2 rounded-full transition-all"
            style={{ width: `${((currentPairIndex + 1) / totalPairs) * 100}%` }}
          />
        </div>
        <p className="text-xs text-text-muted text-right mb-4">
          第 {currentPairIndex + 1} / {totalPairs} 题
        </p>

        {/* Poet's line */}
        <div className="bg-bg-secondary rounded-xl p-6 mb-6 border border-border-light">
          <p className="text-xs text-text-muted mb-2">诗人说：</p>
          <p className="font-kai text-2xl text-text-primary leading-relaxed">{poetLine?.text}</p>
        </div>

        {/* Input */}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !feedback && handleSubmit()}
          placeholder="请填写下一句…"
          disabled={feedback === 'correct' || feedback === 'wrong'}
          className="w-full border border-border-light rounded-xl px-4 py-3 mb-4 text-lg font-kai bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
        />

        {/* Feedback */}
        {feedback ? (
          <div className="space-y-3">
            <p className={`text-lg font-bold ${feedbackConfig[feedback].color}`}>
              {feedbackConfig[feedback].text}
            </p>
            {feedback === 'close' ? (
              <button
                onClick={() => { setFeedback(null); setInput(''); setMistakes(prev => prev + 1); }}
                className="w-full bg-accent text-white py-2.5 rounded-xl hover:bg-accent-hover transition-colors"
              >
                再试一次
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-accent text-white py-2.5 rounded-xl hover:bg-accent-hover transition-colors"
              >
                {currentPairIndex + 1 < totalPairs ? '下一题' : '查看结果'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleSubmit}
              className="w-full bg-accent text-white py-2.5 rounded-xl hover:bg-accent-hover transition-colors font-medium"
            >
              提交
            </button>
            <button
              onClick={handleReveal}
              className="w-full text-text-muted text-sm py-1 hover:text-text-secondary transition-colors"
            >
              看答案
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 4: Run tests**

Run: `npx vitest run src/features/poetry/ChallengePage.test.tsx`
Expected: Tests PASS.

**Step 5: Run all tests**

Run: `npm run test:run`
Expected: All tests PASS.

**Step 6: Commit**

```bash
git add src/features/poetry/ChallengePage.tsx src/features/poetry/useChallenge.ts src/features/poetry/ChallengePage.test.tsx
git commit -m "feat: redesign challenge page with scroll style, progress bar, and results screen"
```

---

## Phase 5: Fix useCoins Bug & Polish

### Task 11: Fix useCoins State Race Condition

**Files:**
- Modify: `src/features/gamification/useCoins.ts` (fix bug)
- Modify: `src/features/gamification/useCoins.test.ts` (update test)

**Step 1: Update useCoins test**

Replace `src/features/gamification/useCoins.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react'
import { useCoins } from './useCoins'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({}),
      }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: 20, error: null }),
  },
}))

test('awards coins and updates state correctly', async () => {
  const { result } = renderHook(() => useCoins('user-123'))
  expect(result.current.coins).toBe(0)

  await act(async () => {
    await result.current.awardCoins(10)
  })
  expect(result.current.coins).toBe(10)

  await act(async () => {
    await result.current.awardCoins(10)
  })
  expect(result.current.coins).toBe(20)
})
```

**Step 2: Fix useCoins — use functional update for DB call**

Replace `src/features/gamification/useCoins.ts`:

```ts
import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export function useCoins(userId: string) {
  const [coins, setCoins] = useState(0)

  const awardCoins = useCallback(async (amount: number) => {
    setCoins(prev => {
      const newTotal = prev + amount
      // Fire DB update with correct value (non-blocking)
      supabase
        .from('user_profiles')
        .update({ coins: newTotal })
        .eq('user_id', userId)
      return newTotal
    })
  }, [userId])

  return { coins, awardCoins }
}
```

**Step 3: Run test**

Run: `npx vitest run src/features/gamification/useCoins.test.ts`
Expected: PASS.

**Step 4: Commit**

```bash
git add src/features/gamification/useCoins.ts src/features/gamification/useCoins.test.ts
git commit -m "fix: resolve useCoins state race condition with functional update"
```

---

### Task 12: Add Responsive Design and Loading States

**Files:**
- Modify: `src/features/auth/ProtectedRoute.tsx` (styled loading)
- Modify: `index.html` (meta viewport, title, description)

**Step 1: Update ProtectedRoute loading state**

Replace `src/features/auth/ProtectedRoute.tsx`:

```tsx
import { Navigate } from 'react-router-dom'
import { useUser } from './AuthProvider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
        <p className="font-serif text-2xl text-accent mb-2">通天路</p>
        <p className="text-text-muted text-sm animate-pulse">加载中…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}
```

**Step 2: Update index.html with meta tags**

Update `index.html` `<head>` section to include:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="通天路 - 诗词闯关之旅，穿越千年与诗人对话">
<title>通天路 - 诗词闯关</title>
```

**Step 3: Run tests and build**

Run: `npm run test:run && npm run build`
Expected: All tests pass, build succeeds.

**Step 4: Commit**

```bash
git add src/features/auth/ProtectedRoute.tsx index.html
git commit -m "feat: add styled loading states, SEO meta tags, and responsive viewport"
```

---

## Phase 6: Deployment

### Task 13: Prepare for Vercel Deployment

**Files:**
- Create: `vercel.json` (SPA routing config)

**Step 1: Create vercel.json**

Create `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This ensures all routes are handled by the SPA's client-side router.

**Step 2: Verify build works**

Run: `npm run build`
Expected: Build succeeds, `dist/` is created.

**Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat: add Vercel config for SPA routing"
```

**Step 4: Deploy to Vercel**

Run: `npx vercel --prod`

Follow the prompts:
- Link to existing project or create new
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

Set environment variables in Vercel Dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

### Task 14: Run Supabase Migrations

This task must be done manually in the Supabase Dashboard or via Supabase CLI.

**Step 1: Apply migration 003_unlock_system.sql**

Go to Supabase Dashboard → SQL Editor → Paste and run `003_unlock_system.sql`.

**Step 2: Apply migration 004_expanded_seed_data.sql**

Go to Supabase Dashboard → SQL Editor → Paste and run `004_expanded_seed_data.sql`.

**Step 3: Verify data**

Run in SQL Editor:
```sql
SELECT COUNT(*) FROM dynasties;  -- Should be 6
SELECT COUNT(*) FROM poets;      -- Should be 26 (20 regular + 6 boss)
SELECT COUNT(*) FROM poems;      -- Should be 65
SELECT COUNT(*) FROM poem_lines; -- Should be ~260
```

---

### Task 15: Final Verification

**Step 1: Run all tests**

Run: `npm run test:run`
Expected: All tests pass.

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 3: Run type check**

Run: `npx tsc -b`
Expected: No type errors.

**Step 4: Test locally**

Run: `npm run preview`
Test the full flow: Register → Login → Dynasty Map → Select Poet → Challenge → Results

**Step 5: Commit any final fixes, then deploy**

```bash
npx vercel --prod
```
