import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Save, Plus, X, Calendar, DollarSign, Clock, User,
  CheckCircle2, AlertTriangle, TrendingUp, Target
} from 'lucide-react';

/**
 * REMEDIATION PLAN PAGE
 * ====================
 * Create and manage remediation plans for compliance gaps
 *
 * Features:
 * - Create remediation plan from gap(s)
 * - Add multiple tasks with timeline
 * - Assign resources (people, budget, time)
 * - Estimate costs and effort
 * - Track progress and milestones
 * - Approval workflow
 * - Export to PDF/Excel
 *
 * STATUS: 🚧 Backend APIs in Development
 */

const RemediationPlanPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gapId = searchParams.get('gapId');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [planName, setPlanName] = useState('');
  const [planNameAr, setPlanNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [priority, setPriority] = useState('high');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState('draft');

  // Selected gaps
  const [selectedGaps, setSelectedGaps] = useState([]);
  const [availableGaps, setAvailableGaps] = useState([]);

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    titleAr: '',
    assignee: '',
    dueDate: '',
    estimatedCost: '',
    estimatedEffort: '',
    priority: 'medium'
  });

  // Owners list
  const OWNERS = [
    'CISO',
    'DPO (Data Protection Officer)',
    'Risk Manager',
    'IT Operations Manager',
    'SecOps/SOC Lead',
    'Compliance Officer',
    'Legal Counsel',
    'Executive Management'
  ];

  useEffect(() => {
    fetchAvailableGaps();
    if (gapId) {
      fetchGapDetails(gapId);
    }
  }, [gapId]);

  const fetchAvailableGaps = async () => {
    try {
      const response = await fetch('/api/gaps?status=open', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setAvailableGaps(data);
    } catch (error) {
      console.error('Error fetching gaps:', error);
    }
  };

  const fetchGapDetails = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gaps/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const gap = await response.json();

      // Pre-fill form with gap details
      setPlanName(`Remediation Plan for ${gap.controlId}`);
      setPlanNameAr(`خطة المعالجة لـ ${gap.controlId}`);
      setDescription(gap.description || '');
      setPriority(gap.severity === 'critical' ? 'critical' : gap.severity);
      setTotalBudget(gap.estimatedCost?.toString() || '');

      // Add gap to selected
      setSelectedGaps([gap]);
    } catch (error) {
      console.error('Error fetching gap details:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGap = (gap) => {
    if (!selectedGaps.find(g => g.id === gap.id)) {
      setSelectedGaps([...selectedGaps, gap]);
    }
  };

  const removeGap = (gapId) => {
    setSelectedGaps(selectedGaps.filter(g => g.id !== gapId));
  };

  const addTask = () => {
    if (!newTask.title || !newTask.assignee) {
      alert('Please fill required fields (Title, Assignee)');
      return;
    }

    setTasks([...tasks, { ...newTask, id: Date.now() }]);

    // Reset form
    setNewTask({
      title: '',
      titleAr: '',
      assignee: '',
      dueDate: '',
      estimatedCost: '',
      estimatedEffort: '',
      priority: 'medium'
    });
  };

  const removeTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const calculateTotals = () => {
    const totalCost = tasks.reduce((sum, t) => sum + (parseFloat(t.estimatedCost) || 0), 0);
    const totalEffort = tasks.reduce((sum, t) => sum + (parseFloat(t.estimatedEffort) || 0), 0);
    const gapsCost = selectedGaps.reduce((sum, g) => sum + (g.estimatedCost || 0), 0);

    return {
      totalCost: totalCost + gapsCost,
      totalEffort,
      taskCount: tasks.length,
      gapCount: selectedGaps.length
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedGaps.length === 0) {
      alert('Please select at least one gap to remediate');
      return;
    }

    if (tasks.length === 0) {
      alert('Please add at least one task');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        planName,
        planNameAr,
        description,
        descriptionAr,
        priority,
        startDate,
        targetDate,
        totalBudget: parseFloat(totalBudget) || 0,
        owner,
        status,
        gaps: selectedGaps.map(g => g.id),
        tasks
      };

      const response = await fetch('/api/remediation-plans', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Remediation plan created successfully!');
        navigate(`/remediation/${data.id}`);
      } else {
        const error = await response.json();
        alert(`Failed to create plan: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating remediation plan:', error);
      alert('Failed to create remediation plan');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Remediation Plan</h1>
              <p className="text-gray-600 mt-1">إنشاء خطة معالجة • Close compliance gaps systematically</p>
            </div>

            <button
              onClick={() => navigate('/gaps')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              ← Back to Gaps
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Plan Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan Name (EN) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name (English) *
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Plan Name (AR) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name (Arabic)
                </label>
                <input
                  type="text"
                  value={planNameAr}
                  onChange={(e) => setPlanNameAr(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  dir="rtl"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Owner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Owner *
                </label>
                <select
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Owner</option>
                  {OWNERS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Completion Date *
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Total Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Budget (SAR)
                </label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the remediation plan objectives and approach..."
              />
            </div>
          </div>

          {/* Selected Gaps */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Gaps to Remediate ({selectedGaps.length})</h2>

            {selectedGaps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No gaps selected. Please select gaps from the available list below.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedGaps.map(gap => (
                  <div key={gap.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-blue-600">{gap.controlId}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          gap.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          gap.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {gap.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">{gap.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <span>Cost: {gap.estimatedCost?.toLocaleString() || 0} SAR</span>
                        <span>Effort: {gap.estimatedEffort || 0}h</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGap(gap.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remediation Tasks */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Remediation Tasks ({tasks.length})</h2>

            {/* Add Task Form */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-3">Add New Task</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Task title *"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select Assignee *</option>
                  {OWNERS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  value={newTask.estimatedCost}
                  onChange={(e) => setNewTask({...newTask, estimatedCost: e.target.value})}
                  placeholder="Cost (SAR)"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  value={newTask.estimatedEffort}
                  onChange={(e) => setNewTask({...newTask, estimatedEffort: e.target.value})}
                  placeholder="Effort (hours)"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={addTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>
            </div>

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tasks added yet. Add tasks above to complete the plan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-2">{task.title}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignee}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.estimatedCost && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {parseFloat(task.estimatedCost).toLocaleString()} SAR
                          </span>
                        )}
                        {task.estimatedEffort && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimatedEffort}h
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Plan Summary</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Gaps</p>
                <p className="text-2xl font-bold text-blue-600">{totals.gapCount}</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Tasks</p>
                <p className="text-2xl font-bold text-purple-600">{totals.taskCount}</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                <p className="text-lg font-bold text-green-600">{totals.totalCost.toLocaleString()} SAR</p>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Total Effort</p>
                <p className="text-2xl font-bold text-orange-600">{totals.totalEffort}h</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/gaps')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || selectedGaps.length === 0 || tasks.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Remediation Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemediationPlanPage;
