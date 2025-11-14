import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, Square, User, Filter,
  Search, Download, Plus, Calendar
} from 'lucide-react';

/**
 * TASK MANAGEMENT PAGE
 * ===================
 * Complete task management system with 6,911 GRC execution tasks
 *
 * Features:
 * - 6,911 pre-defined GRC tasks (NCA ECC, SAMA CSF, PDPL)
 * - Bilingual support (EN/AR)
 * - Filter by framework, priority, assignee, status
 * - Search by control ID, summary, description
 * - Task assignment to roles (CISO, DPO, Risk Manager, etc.)
 * - Evidence requirements per task
 * - Progress tracking
 * - Due date management
 * - RICE/WSJF scoring
 *
 * STATUS: 🚧 Backend APIs & CSV Import in Development
 */

const TaskManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFramework, setFilterFramework] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Task stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    overdue: 0
  });

  // Frameworks from CSV
  const FRAMEWORKS = [
    'NCA ECC v2.0',
    'SAMA CSF',
    'PDPL',
    'ISO 27001',
    'NIST CSF',
    'CIS Controls'
  ];

  // Priorities from CSV
  const PRIORITIES = ['Highest', 'High', 'Medium', 'Low'];

  // Assignees from CSV
  const ASSIGNEES = [
    'CISO',
    'DPO (Data Protection Officer)',
    'Risk Manager',
    'IT Operations Manager',
    'SecOps/SOC Lead',
    'Network Team',
    'Cloud Team',
    'HR Manager',
    'Legal/Compliance Officer',
    'Procurement Manager'
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, searchTerm, filterFramework, filterPriority, filterAssignee, filterStatus]);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await response.json();
      setTasks(data);

      // Calculate stats
      const completed = data.filter(t => t.status === 'completed').length;
      const inProgress = data.filter(t => t.status === 'in_progress').length;
      const notStarted = data.filter(t => t.status === 'not_started').length;
      const overdue = data.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length;

      setStats({
        total: data.length,
        completed,
        inProgress,
        notStarted,
        overdue
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.summary.toLowerCase().includes(term) ||
        task.descriptionEn?.toLowerCase().includes(term) ||
        task.descriptionAr?.includes(term) ||
        task.controlId?.toLowerCase().includes(term) ||
        task.section?.toLowerCase().includes(term)
      );
    }

    // Framework filter
    if (filterFramework !== 'all') {
      filtered = filtered.filter(task => task.labels?.includes(filterFramework));
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Assignee filter
    if (filterAssignee !== 'all') {
      filtered = filtered.filter(task => task.assignee === filterAssignee);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    setFilteredTasks(filtered);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const exportTasks = () => {
    const csv = [
      ['Control ID', 'Summary', 'Description (EN)', 'Description (AR)', 'Assignee', 'Priority', 'Status', 'Due Date', 'Evidence'],
      ...filteredTasks.map(task => [
        task.controlId || '',
        task.summary || '',
        task.descriptionEn || '',
        task.descriptionAr || '',
        task.assignee || '',
        task.priority || '',
        task.status || '',
        task.dueDate || '',
        task.evidence || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grc_tasks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
              <p className="text-gray-600 mt-1">GRC Execution Tasks • شاهين Shahin Platform</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportTasks}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>

              <button
                onClick={() => navigate('/tasks/create')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Task
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Not Started</p>
              <p className="text-2xl font-bold text-blue-600">{stats.notStarted}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by control ID, summary, description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Framework Filter */}
            <div>
              <select
                value={filterFramework}
                onChange={(e) => setFilterFramework(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Frameworks</option>
                {FRAMEWORKS.map(fw => (
                  <option key={fw} value={fw}>{fw}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Assignee Filter */}
            <div>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Assignees</option>
                {ASSIGNEES.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3 mt-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('not_started')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'not_started' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Not Started
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'in_progress' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-3">
            Showing {filteredTasks.length} of {stats.total} tasks
          </p>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Framework</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      No tasks found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => {
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

                    return (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              const newStatus = task.status === 'completed' ? 'in_progress' :
                                             task.status === 'in_progress' ? 'completed' : 'in_progress';
                              updateTaskStatus(task.id, newStatus);
                            }}
                            className="focus:outline-none"
                          >
                            {task.status === 'completed' ? (
                              <CheckSquare className="w-6 h-6 text-green-600" />
                            ) : (
                              <Square className="w-6 h-6 text-gray-400 hover:text-blue-600" />
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm font-mono text-blue-600">{task.controlId}</span>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900 mb-1">{task.summary}</p>
                          {task.descriptionEn && (
                            <p className="text-xs text-gray-600 line-clamp-2">{task.descriptionEn}</p>
                          )}
                          {task.descriptionAr && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-1" dir="rtl">{task.descriptionAr}</p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{task.assignee}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'Highest' ? 'bg-red-100 text-red-800' :
                            task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.priority}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-gray-400'}`} />
                            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {task.labels?.split(',').slice(0, 2).map((label, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                {label.trim()}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagementPage;
