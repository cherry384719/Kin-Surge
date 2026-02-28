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
