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
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
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
