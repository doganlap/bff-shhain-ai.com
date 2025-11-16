import React, { Suspense } from 'react'
import { Routes, Route, Link } from 'react-router-dom'

const modules = import.meta.glob('/src/pages/**/*.jsx')

const toKebab = (s) => s.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()

const derivePath = (p, base) => {
  const rel = p.replace('/src/pages/', '')
  const parts = rel.split('/')
  const file = parts.pop() || ''
  const name = file.replace(/\.jsx$/, '')
  const cleaned = name.replace(/Page$/, '').replace(/Landing$/, '').replace(/Dashboard$/, '')
  return `${base}/${[...parts, toKebab(cleaned)].filter(Boolean).join('/')}`
}

export default function AutoRoutes({ base = '/dev/auto' }) {
  const entries = Object.entries(modules).map(([path, loader]) => ({ path: derivePath(path, base), loader }))
  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Auto Pages</h1>
        <p className="text-sm text-gray-600">Development-only index of discovered pages</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
        {entries.map((e) => (
          <Link key={e.path} to={e.path} className="px-3 py-2 rounded border hover:bg-gray-50 text-sm">
            {e.path}
          </Link>
        ))}
      </div>
      <Suspense fallback={<div className="p-4">Loading…</div>}>
        <Routes>
          {entries.map((e) => {
            const Comp = React.lazy(e.loader)
            const rel = e.path.replace(`${base}/`, '')
            return <Route key={e.path} path={rel} element={<Comp />} />
          })}
        </Routes>
      </Suspense>
    </div>
  )
}