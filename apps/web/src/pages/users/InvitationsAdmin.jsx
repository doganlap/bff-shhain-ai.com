import React, { useEffect, useState } from 'react'
import { Mail, UserCircle2, Timer, Trash2, RefreshCw, Plus } from 'lucide-react'

export default function InvitationsAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', tenantId: '', ttlHours: 48 })
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0 })

  const fetchInvites = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: String(pagination.limit), offset: String(pagination.offset) })
      const resp = await fetch(`/api/invitations?${params.toString()}`)
      const data = await resp.json()
      if (!resp.ok || !data.success) throw new Error(data.error || 'Failed to load')
      setItems(data.data || [])
      setPagination(data.pagination || { total: 0, limit: 50, offset: 0 })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const createInvite = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const resp = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await resp.json()
      if (!resp.ok || !data.success) throw new Error(data.error || 'Failed to create')
      setForm({ email: '', tenantId: '', ttlHours: 48 })
      fetchInvites()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  const revokeInvite = async (token) => {
    setLoading(true)
    setError('')
    try {
      const resp = await fetch(`/api/invitations/${encodeURIComponent(token)}/revoke`, { method: 'PATCH' })
      const data = await resp.json()
      if (!resp.ok || !data.success) throw new Error(data.error || 'Failed to revoke')
      fetchInvites()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  useEffect(() => { fetchInvites() }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invitations</h1>
        <button onClick={fetchInvites} className="px-3 py-2 border rounded flex items-center gap-2"><RefreshCw className="h-4 w-4" />Refresh</button>
      </div>
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      <form onSubmit={createInvite} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full pl-10 pr-3 py-2 border rounded" required />
        </div>
        <div className="relative">
          <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={form.tenantId} onChange={(e)=>setForm({...form,tenantId:e.target.value})} placeholder="Tenant ID" className="w-full pl-10 pr-3 py-2 border rounded" required />
        </div>
        <div className="relative">
          <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="number" value={form.ttlHours} onChange={(e)=>setForm({...form,ttlHours:Number(e.target.value)})} placeholder="TTL hours" className="w-full pl-10 pr-3 py-2 border rounded" min="1" />
        </div>
        <button type="submit" disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2"><Plus className="h-4 w-4" />Create</button>
      </form>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tenant</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Token</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Expires</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((it)=> (
              <tr key={it.token}>
                <td className="px-4 py-2 text-sm">{it.email}</td>
                <td className="px-4 py-2 text-sm">{it.tenant_id}</td>
                <td className="px-4 py-2 text-sm font-mono">{it.token}</td>
                <td className="px-4 py-2 text-sm">{it.status}</td>
                <td className="px-4 py-2 text-sm">{new Date(it.expires_at).toLocaleString()}</td>
                <td className="px-4 py-2 text-right text-sm">
                  <button onClick={()=>revokeInvite(it.token)} className="px-3 py-1 border rounded text-red-600 flex items-center gap-2 justify-end"><Trash2 className="h-4 w-4" />Revoke</button>
                </td>
              </tr>
            ))}
            {items.length===0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={6}>No invitations</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}