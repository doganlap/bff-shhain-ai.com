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

export default function DemoPendingActions() {
  const [pendingTasks, setPendingTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiService.tasks.getTasks({ status: 'pending', limit: 50 })
        const data = res?.data?.data || res?.data || []
        setPendingTasks(Array.isArray(data) ? data : [])
      } catch (e) {
        setError('Failed to load pending actions')
      } finally {
        setLoading(false)
      }
    }
    fetchPending()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading pending actions...</p>
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
          title="Pending Actions"
          columns={["id", "summary", "priority", "status", "due_date"]}
          rows={pendingTasks.map(t => ({
            id: t.id,
            summary: t.summary || t.title || t.name,
            priority: t.priority || t.importance,
            status: t.status,
            due_date: t.due_date || t.dueDate || '',
          }))}
        />
      </div>
    </div>
  )
}