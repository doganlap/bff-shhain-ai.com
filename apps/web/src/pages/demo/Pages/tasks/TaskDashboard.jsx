import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Search as FiSearch, Grid as FiGrid, List as FiList, Download as FiDownload, Plus as FiPlus,
  Clock as FiClock, User as FiUser, CheckCircle as FiCheckCircle, AlertCircle as FiAlertCircle, TrendingUp as FiTrendingUp
} from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { api } from '../../services/api';

const TaskDashboard = () => {
  const { language } = useI18n();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    framework: '',
    priority: '',
    search: '',
    assigned_to: ''
  });

  const statusColumns = {
    pending: { title: 'Pending', color: 'gray', icon: FiClock },
    in_progress: { title: 'In Progress', color: 'blue', icon: FiTrendingUp },
    review: { title: 'Under Review', color: 'yellow', icon: FiAlertCircle },
    completed: { title: 'Completed', color: 'green', icon: FiCheckCircle }
  };

  useEffect(() => {
    loadTasks();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.framework) params.append('framework', filters.framework);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
      params.append('limit', '500'); // Load more for dashboard

      const response = await api.get(`/api/tasks?${params}`);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/api/tasks/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const taskId = draggableId;
    const newStatus = destination.droppableId;

    // Optimistic update
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));

    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      loadStats(); // Refresh stats after status change
    } catch (error) {
      console.error('Failed to update task status:', error);
      loadTasks(); // Reload on error
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'green'
    };
    return colors[priority] || 'gray';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const exportTasks = () => {
    const csv = [
      ['ID', 'Title', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Progress'],
      ...tasks.map(task => [
        task.id,
        task.title,
        task.status,
        task.priority,
        task.assigned_to_name || 'Unassigned',
        task.due_date || '',
        `${task.progress_percentage || 0}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grc-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'ar' ? 'لوحة المهام' : 'Task Dashboard'}
            </h1>
            <p className="text-gray-600">
              {language === 'ar'
                ? `${tasks.length} مهمة من أصل ${stats?.total || 0}`
                : `${tasks.length} of ${stats?.total || 0} tasks`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportTasks}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiDownload />
              {language === 'ar' ? 'تصدير' : 'Export'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700">
              <FiPlus />
              {language === 'ar' ? 'مهمة جديدة' : 'New Task'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'ar' ? 'الإجمالي' : 'Total'}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiGrid className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.by_status?.in_progress || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'ar' ? 'مكتملة' : 'Completed'}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.by_status?.completed || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="text-green-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'ar' ? 'نسبة الإنجاز' : 'Completion'}</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.completion_rate?.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="text-indigo-600 text-xl" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث في المهام...' : 'Search tasks...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.framework}
              onChange={(e) => setFilters({ ...filters, framework: e.target.value })}
            >
              <option value="">{language === 'ar' ? 'جميع الأطر' : 'All Frameworks'}</option>
              <option value="NCA ECC v2.0">NCA ECC v2.0</option>
              <option value="SAMA CSF">SAMA CSF</option>
              <option value="PDPL">PDPL</option>
              <option value="CITC ISCRM">CITC ISCRM</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">{language === 'ar' ? 'جميع الأولويات' : 'All Priorities'}</option>
              <option value="critical">{language === 'ar' ? 'حرجة' : 'Critical'}</option>
              <option value="high">{language === 'ar' ? 'عالية' : 'High'}</option>
              <option value="medium">{language === 'ar' ? 'متوسطة' : 'Medium'}</option>
              <option value="low">{language === 'ar' ? 'منخفضة' : 'Low'}</option>
            </select>

            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-white shadow' : ''}`}
              >
                <FiGrid className={viewMode === 'kanban' ? 'text-blue-600' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                <FiList className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-600'} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'kanban' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(statusColumns).map(([status, config]) => {
              const Icon = config.icon;
              const statusTasks = getTasksByStatus(status);

              return (
                <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className={`p-4 border-b border-gray-100 bg-${config.color}-50`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`text-${config.color}-600`} />
                        <h3 className="font-semibold text-gray-900">
                          {language === 'ar' ? config.title : config.title}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium bg-${config.color}-100 text-${config.color}-700 rounded-full`}>
                        {statusTasks.length}
                      </span>
                    </div>
                  </div>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-3 min-h-[400px] max-h-[600px] overflow-y-auto ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {statusTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white border border-gray-200 rounded-lg p-3 mb-3 cursor-move hover:shadow-md transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900 text-sm flex-1">
                                    {language === 'ar' && task.title_ar ? task.title_ar : task.title}
                                  </h4>
                                  <span className={`px-2 py-0.5 text-xs font-medium bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-700 rounded`}>
                                    {task.priority}
                                  </span>
                                </div>

                                {task.control_id && (
                                  <p className="text-xs text-gray-500 mb-2">
                                    {task.control_id}
                                  </p>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <FiUser className="text-gray-400" />
                                    <span>{task.assigned_to_name || 'Unassigned'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <FiClock className="text-gray-400" />
                                    <span className={task.due_date && new Date(task.due_date) < new Date() ? 'text-red-600 font-medium' : ''}>
                                      {formatDate(task.due_date)}
                                    </span>
                                  </div>
                                </div>

                                {task.progress_percentage > 0 && (
                                  <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-gray-600">Progress</span>
                                      <span className="font-medium">{task.progress_percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
                                        style={{ width: `${task.progress_percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {statusTasks.length === 0 && (
                          <div className="text-center text-gray-400 py-8">
                            <p className="text-sm">
                              {language === 'ar' ? 'لا توجد مهام' : 'No tasks'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'ar' ? 'العنوان' : 'Title'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'ar' ? 'الأولوية' : 'Priority'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'ar' ? 'المسؤول' : 'Assigned To'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'ar' ? 'التقدم' : 'Progress'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {language === 'ar' && task.title_ar ? task.title_ar : task.title}
                        </p>
                        {task.control_id && (
                          <p className="text-xs text-gray-500">{task.control_id}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColumns[task.status]?.color || 'gray'}-100 text-${statusColumns[task.status]?.color || 'gray'}-700`}>
                        {statusColumns[task.status]?.title || task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-700`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {task.assigned_to_name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={task.due_date && new Date(task.due_date) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {formatDate(task.due_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                            style={{ width: `${task.progress_percentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-10">
                          {task.progress_percentage || 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;
