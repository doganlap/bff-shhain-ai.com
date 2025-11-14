# Pages Modernization Plan - Batch Update Strategy

## 📊 Discovered Pages (24 Total)

### 🏢 Platform Pages (5)
1. ⏳ AutoAssessmentGeneratorPage.jsx - **CRITICAL**
2. ⏳ LicensesManagementPage.jsx
3. ⏳ PartnerManagementPage.jsx
4. ⏳ RenewalsPipelinePage.jsx
5. ⏳ UpgradePage.jsx

### 🏛️ Regulatory Pages (5)
1. ⏳ RegulatorsPage.jsx - **CRITICAL**
2. ⏳ RegulatoryIntelligencePage.jsx
3. ⏳ RegulatoryIntelligenceEnginePage.jsx
4. ⏳ KSAGRCPage.jsx
5. ✅ SectorIntelligence.jsx - **ALREADY FIXED**

### 📊 Reports Pages (1)
1. ⏳ ReportsPage.jsx - **CRITICAL**

### ⚙️ System Pages (13)
1. ⏳ UserManagementPage.jsx - **CRITICAL**
2. ⏳ SettingsPage.jsx - **CRITICAL**
3. ⏳ AuditLogsPage.jsx
4. ⏳ APIManagementPage.jsx
5. ⏳ DocumentManagementPage.jsx
6. ⏳ NotificationManagementPage.jsx
7. ⏳ AISchedulerPage.jsx
8. ⏳ WorkflowManagementPage.jsx
9. ⏳ DatabasePage.jsx
10. ⏳ PerformanceMonitorPage.jsx
11. ⏳ RAGServicePage.jsx
12. ⏳ MissionControlPage.jsx
13. ⏳ SystemHealthDashboard.jsx

---

## 🎯 Batch Update Strategy

### Phase 1: Critical Pages (Priority 1) - **4 pages**
These are the most commonly used pages and should be updated first:

1. **UserManagementPage** (System) - User CRUD operations
2. **RegulatorsPage** (Regulatory) - Core GRC functionality
3. **ReportsPage** (Reports) - Essential reporting
4. **AutoAssessmentGeneratorPage** (Platform) - Key feature

**Timeline:** 2 hours
**Impact:** High - affects daily operations

### Phase 2: High-Traffic Pages (Priority 2) - **6 pages**
Important pages with moderate usage:

5. **SettingsPage** (System)
6. **AuditLogsPage** (System)
7. **LicensesManagementPage** (Platform)
8. **PartnerManagementPage** (Platform)
9. **RegulatoryIntelligencePage** (Regulatory)
10. **NotificationManagementPage** (System)

**Timeline:** 3 hours
**Impact:** Medium - affects specific workflows

### Phase 3: Secondary Pages (Priority 3) - **10 pages**
Less frequently used but still important:

11. APIManagementPage
12. DocumentManagementPage
13. AISchedulerPage
14. WorkflowManagementPage
15. DatabasePage
16. PerformanceMonitorPage
17. RAGServicePage
18. RegulatoryIntelligenceEnginePage
19. KSAGRCPage
20. RenewalsPipelinePage

**Timeline:** 5 hours
**Impact:** Low - specialized features

### Phase 4: Administrative Pages (Priority 4) - **4 pages**
Admin-only pages with minimal traffic:

21. MissionControlPage
22. SystemHealthDashboard
23. UpgradePage
24. (Already completed: SectorIntelligence)

**Timeline:** 2 hours
**Impact:** Very Low - admin tools

---

## 📋 Standard Template (Apply to All Pages)

### **Structure:**
```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { [Icons] } from 'lucide-react';
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { format } from 'date-fns';

const [PageName] = () => {
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [stats, setStats] = useState({});

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.[resource].getAll({
        search: searchTerm,
        filter: filterBy !== 'all' ? filterBy : undefined
      });
      setData(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterBy]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.[resource].getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  // Stats cards
  const statsCards = [
    { title: 'Total [Items]', value: stats.total || data.length, icon: Icon1, color: 'blue', trend: 'Trend info' },
    { title: '[Metric 2]', value: stats.metric2 || 0, icon: Icon2, color: 'green', trend: 'Trend info' },
    { title: '[Metric 3]', value: stats.metric3 || 0, icon: Icon3, color: 'yellow', trend: 'Trend info' },
    { title: '[Metric 4]', value: stats.metric4 || 0, icon: Icon4, color: 'purple', trend: 'Trend info' }
  ];

  // Filter and sort
  const filteredData = data.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || item.status === filterBy;
    return matchesSearch && matchesFilter;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  // Handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await apiService.[resource].delete(id);
        toast.success('Deleted successfully');
        fetchData();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  // Render
  if (loading && data.length === 0) {
    return (
      <EnterprisePageLayout title="[Page Title]" subtitle="[Description]">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </EnterprisePageLayout>
    );
  }

  return (
    <EnterprisePageLayout
      title="[Page Title]"
      subtitle="[Description]"
      actions={
        <div className="flex gap-2">
          <button onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </button>
          <button onClick={fetchData} className="btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div key={index} className="stats-card">
              <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
              <span>{stat.trend}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filters-section">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
            <option value="all">All</option>
            {/* Add filter options */}
          </select>
        </div>

        {/* Grid or Table View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedData.map(item => (
              <div key={item.id} className="card">
                {/* Grid item content */}
              </div>
            ))}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Name</th>
                  {/* Add more columns */}
                </tr>
              </thead>
              <tbody>
                {sortedData.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    {/* Add more cells */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </EnterprisePageLayout>
  );
};

export default [PageName];
```

---

## 🔧 Quick Conversion Checklist

For each page, follow these steps:

### 1. **Imports (Remove)**
- ❌ `import { motion } from 'framer-motion'`
- ❌ `import { useI18n } from '../../hooks/useI18n'`
- ❌ `import { useTheme } from '../../components/theme/ThemeProvider'`
- ❌ `import { AnimatedCard, CulturalLoadingSpinner } from '...'`
- ❌ `import AdvancedAnalyticsPanel from '...'`
- ❌ `import RealTimeMonitor from '...'`
- ❌ `import QuickActionsToolbar from '...'`
- ❌ `import { PermissionBasedCard } from '...'`

### 2. **Imports (Add)**
- ✅ `import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout'`
- ✅ `import { toast } from 'sonner'`
- ✅ `import { format } from 'date-fns'`
- ✅ Add relevant Lucide React icons

### 3. **State (Standardize)**
```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [filterBy, setFilterBy] = useState('all');
const [viewMode, setViewMode] = useState('grid');
const [sortField, setSortField] = useState('created_at');
const [sortDirection, setSortDirection] = useState('desc');
const [stats, setStats] = useState({});
```

### 4. **Data Fetching (Use useCallback)**
```jsx
const fetchData = useCallback(async () => { ... }, [searchTerm, filterBy]);
const fetchStats = useCallback(async () => { ... }, []);
```

### 5. **Components (Replace)**
- Replace `<AnimatedCard>` with `<div className="...">`
- Replace `<CulturalLoadingSpinner>` with simple spinner
- Replace custom headers with `<EnterprisePageLayout>`
- Remove `<RealTimeMonitor>`, `<AdvancedAnalyticsPanel>`

### 6. **Styling (Use Tailwind)**
- Use standard Tailwind classes
- Remove inline styles
- Use dark mode classes (`dark:bg-gray-800`)

---

## 📈 Progress Tracking

### ✅ Completed (3)
- DocumentsPage
- ComplianceTrackingPage
- EvidenceManagementPage

### 🚧 In Progress (0)
- (None)

### ⏳ Pending (24)
- Platform: 5 pages
- Regulatory: 4 pages (1 already fixed)
- Reports: 1 page
- System: 13 pages

---

## ⏱️ Estimated Timeline

- **Phase 1 (4 pages):** 2 hours
- **Phase 2 (6 pages):** 3 hours
- **Phase 3 (10 pages):** 5 hours
- **Phase 4 (4 pages):** 2 hours

**Total:** ~12 hours for complete modernization

---

## 🎯 Success Metrics

After each batch update:

1. ✅ Build passes with no errors
2. ✅ All pages use EnterprisePageLayout
3. ✅ All pages have 4 stats cards
4. ✅ All pages have grid/table toggle
5. ✅ All pages have search & filters
6. ✅ All pages use consistent styling
7. ✅ Dark mode works everywhere
8. ✅ Mobile responsive
9. ✅ Loading states implemented
10. ✅ Error handling with toasts

---

**Last Updated:** November 13, 2025
**Status:** Ready to Execute Phase 1
