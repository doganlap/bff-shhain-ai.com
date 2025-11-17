import React, { useEffect, useState, useMemo } from 'react'
import { regulatorsApi } from '../../services/regulatorsApi'

export default function RegulatorsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sector, setSector] = useState('all')
  const [jurisdiction, setJurisdiction] = useState('all')
  const [form, setForm] = useState({ id: null, name: '', description: '', type: '', website: '', contactEmail: '', contactPhone: '', address: '', countryCode: '', sectors: [], jurisdictions: [], isActive: true })
  const [translating, setTranslating] = useState(false)
  const sectors = useMemo(() => {
    const s = new Set()
    items.forEach(r => (r.sectors || []).forEach(x => s.add(x)))
    return ['all', ...Array.from(s)]
  }, [items])
  const jurisdictions = useMemo(() => {
    const s = new Set()
    items.forEach(r => (r.jurisdictions || []).forEach(x => s.add(x)))
    return ['all', ...Array.from(s)]
  }, [items])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await regulatorsApi.getRegulators()
        setItems(res)
      } catch (e) {
        setError('Failed to load regulators')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return items.filter(r => {
      const okSector = sector === 'all' || (r.sectors || []).includes(sector)
      const okJur = jurisdiction === 'all' || (r.jurisdictions || []).includes(jurisdiction)
      return okSector && okJur
    })
  }, [items, sector, jurisdiction])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Regulators</h1>
      <div className="border rounded p-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input className="border rounded p-2" placeholder="Type" value={form.type} onChange={e=>setForm({...form,type:e.target.value})} />
          <input className="border rounded p-2" placeholder="Website" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} />
          <input className="border rounded p-2" placeholder="Email" value={form.contactEmail} onChange={e=>setForm({...form,contactEmail:e.target.value})} />
          <input className="border rounded p-2" placeholder="Phone" value={form.contactPhone} onChange={e=>setForm({...form,contactPhone:e.target.value})} />
          <input className="border rounded p-2" placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
          <input className="border rounded p-2" placeholder="Country Code" value={form.countryCode} onChange={e=>setForm({...form,countryCode:e.target.value})} />
          <input className="border rounded p-2 col-span-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <input className="border rounded p-2" placeholder="Sectors (comma)" value={form.sectors.join(',')} onChange={e=>setForm({...form,sectors:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
          <input className="border rounded p-2" placeholder="Jurisdictions (comma)" value={form.jurisdictions.join(',')} onChange={e=>setForm({...form,jurisdictions:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
        </div>
        <div className="mt-3 flex gap-2">
          <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={async()=>{
            try {
              setLoading(true)
              if (form.id) {
                await regulatorsApi.updateRegulator(form.id, form)
              } else {
                await regulatorsApi.createRegulator(form)
              }
              const res = await regulatorsApi.getRegulators()
              setItems(res)
              setForm({ id: null, name: '', description: '', type: '', website: '', contactEmail: '', contactPhone: '', address: '', countryCode: '', sectors: [], jurisdictions: [], isActive: true })
            } catch { setError('Save failed') } finally { setLoading(false) }
          }}>Save</button>
          <button className="border px-3 py-2 rounded" onClick={()=>setForm({ id: null, name: '', description: '', type: '', website: '', contactEmail: '', contactPhone: '', address: '', countryCode: '', sectors: [], jurisdictions: [], isActive: true })}>Reset</button>
          <button className="border px-3 py-2 rounded" onClick={()=>{
            const rows = items.map(r=>{
              const pubs = (r.publications||[]).map(p=>`${p.title} (${p.url||''})`).join('|')
              return {
                id: r.id,
                name: r.name,
                type: r.type||'',
                website: r.website||'',
                email: r.contactEmail||'',
                phone: r.contactPhone||'',
                address: r.address||'',
                country: r.countryCode||'',
                sectors: (r.sectors||[]).join(';'),
                jurisdictions: (r.jurisdictions||[]).join(';'),
                publications: pubs
              }
            })
            const headers = Object.keys(rows[0]||{id:'',name:''})
            const csv = [headers.join(','), ...rows.map(row=>headers.map(h=>`"${String(row[h]).replace(/"/g,'""')}"`).join(','))].join('\n')
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'regulators.csv'
            a.click()
            URL.revokeObjectURL(url)
          }}>Export CSV</button>
          <button className="border px-3 py-2 rounded" onClick={async()=>{
            try {
              setTranslating(true)
              const updated = []
              for (const r of items) {
                const descTr = await regulatorsApi.translateText?.(r.description||'', 'en', 'ar', 'regulatory')
                const pubs = []
                for (const p of (r.publications||[])) {
                  const t = await regulatorsApi.translateText?.(p.title||'', 'en', 'ar', 'regulatory')
                  pubs.push({ ...p, title: (t?.translated_text)||p.title })
                }
                updated.push({ ...r, description: (descTr?.translated_text)||r.description, publications: pubs })
              }
              setItems(updated)
            } finally { setTranslating(false) }
          }}>{translating?'Translating…':'Translate to Arabic'}</button>
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <select className="border rounded p-2" value={sector} onChange={e => setSector(e.target.value)}>
          {sectors.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>
        <select className="border rounded p-2" value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}>
          {jurisdictions.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="space-y-3">
        {filtered.map(r => (
          <li key={r.id} className="border rounded p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-sm text-gray-600">{r.description}</div>
                <div className="text-sm text-gray-600">{r.website}</div>
                <div className="text-sm text-gray-600">{r.contactEmail}</div>
                {r.contactPhone && <div className="text-sm text-gray-600">{r.contactPhone}</div>}
                {r.address && <div className="text-sm text-gray-600">{r.address}</div>}
                {r.countryCode && <div className="text-sm text-gray-600">{r.countryCode}</div>}
              </div>
              <div className="text-xs text-gray-500">
                {(r.sectors || []).join(', ')} | {(r.jurisdictions || []).join(', ')}
              </div>
              <div className="ml-4">
                <button className="text-blue-600 text-sm" onClick={()=>setForm({ id: r.id, name: r.name, description: r.description||'', type: r.type||'', website: r.website||'', contactEmail: r.contactEmail||'', contactPhone: r.contactPhone||'', address: r.address||'', countryCode: r.countryCode||'', sectors: r.sectors||[], jurisdictions: r.jurisdictions||[], isActive: r.isActive })}>Edit</button>
              </div>
            </div>
            {r.publications?.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-semibold">Publications</div>
                <ul className="list-disc ml-5 text-sm">
                  {r.publications.map(p => (
                    <li key={p.id}><a className="text-blue-600" href={p.url} target="_blank" rel="noreferrer">{p.title}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}