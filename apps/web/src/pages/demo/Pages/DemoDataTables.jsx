import React, { useEffect, useState } from 'react'
import apiService from '../../../services/apiEndpoints'

const Table = ({ title, columns, rows }) => (
  <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">{title}</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th key={col}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {rows.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                  {row[col] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export default function DemoDataTables() {
  const [frameworks, setFrameworks] = useState([])
  const [controls, setControls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        const [fwRes, ctrlRes] = await Promise.allSettled([
          apiService.frameworks.getAll(),
          apiService.controls.getAll(),
        ])

        const fwData = fwRes.status === 'fulfilled'
          ? (fwRes.value.data?.data || fwRes.value.data || [])
          : []

        const ctrlData = ctrlRes.status === 'fulfilled'
          ? (ctrlRes.value.data?.data || ctrlRes.value.data || [])
          : []

        setFrameworks(Array.isArray(fwData) ? fwData : [])
        setControls(Array.isArray(ctrlData) ? ctrlData : [])
      } catch (e) {
        setError('Failed to load demo data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading demo tables...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <Table
          title="Frameworks"
          columns={["id", "name", "description"]}
          rows={frameworks.map(f => ({
            id: f.id,
            name: f.name || f.name_en || f.name_ar,
            description: f.description || f.description_en || f.description_ar,
          }))}
        />

        <Table
          title="Controls"
          columns={["id", "control_id", "title", "control_status"]}
          rows={controls.map(c => ({
            id: c.id,
            control_id: c.control_id || c.controlId,
            title: c.title || c.title_en || c.title_ar,
            control_status: c.control_status || c.status,
          }))}
        />
      </div>
    </div>
  )
}