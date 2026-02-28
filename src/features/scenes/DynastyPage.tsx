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
