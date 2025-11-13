# Plotly Charts & Dashboard Migration Guide

## What's New

✅ **14+ Advanced Chart Types** - Line, Bar, Pie, Heatmap, Gauge, Radar, Funnel, etc.
✅ **9 Charts per Dashboard** - Minimum 6, example has 9 interactive charts
✅ **Enterprise Layout** - No duplicate titles, clean structure
✅ **Real-time Updates** - Auto-refresh every 30 seconds
✅ **Interactive & Responsive** - Zoom, pan, hover tooltips
✅ **Dark Mode Support** - All charts adapt to theme

---

## Installation

### Step 1: Install Plotly.js
```bash
npm install plotly.js react-plotly.js
```

### Step 2: Verify Installation
```bash
npm list react-plotly.js
# Should show: react-plotly.js@2.x.x
```

---

## Files Created

1. ✅ **PlotlyCharts.jsx** - 14 reusable chart components
   - [Location](./apps/web/src/components/charts/PlotlyCharts.jsx)

2. ✅ **EnhancedDashboardV2.jsx** - Migrated dashboard with 9 charts
   - [Location](./apps/web/src/pages/dashboard/EnhancedDashboardV2.jsx)

3. ✅ **EnterprisePageLayout.jsx** - Layout component (no double titles)
   - [Location](./apps/web/src/components/layout/EnterprisePageLayout.jsx)

---

## Available Chart Types

### 1. **LineChart** - Trend Analysis
```jsx
import { LineChart } from '../../components/charts/PlotlyCharts';

<LineChart
  data={[
    {
      name: 'Compliance Score',
      x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      y: [65, 72, 78, 75, 82, 87],
    }
  ]}
  title="Compliance Trend"
  xTitle="Month"
  yTitle="Score %"
  height={400}
/>
```

### 2. **BarChart** - Comparisons
```jsx
<BarChart
  data={[{
    name: 'Assessments',
    x: ['Completed', 'In Progress', 'Pending'],
    y: [25, 12, 8],
    color: ['#10b981', '#3b82f6', '#eab308'],
  }]}
  title="Assessment Status"
  orientation="v" // or "h" for horizontal
  height={400}
/>
```

### 3. **PieChart / DonutChart** - Distribution
```jsx
<PieChart
  data={{
    labels: ['Critical', 'High', 'Medium', 'Low'],
    values: [12, 28, 45, 65],
    colors: ['#ef4444', '#f59e0b', '#eab308', '#10b981'],
  }}
  title="Risk Distribution"
  donut={true} // Set to false for pie
  height={400}
/>
```

### 4. **GaugeChart** - KPI Display
```jsx
<GaugeChart
  value={87}
  title="Overall Compliance"
  max={100}
  threshold={{ low: 60, high: 80 }}
  height={350}
/>
```

### 5. **HeatmapChart** - Correlation Matrix
```jsx
<HeatmapChart
  data={[
    [85, 92, 78, 95, 88],
    [72, 85, 90, 82, 79],
    [95, 88, 76, 91, 85],
  ]}
  xLabels={['Access', 'Data', 'Network', 'Incident', 'Business']}
  yLabels={['ISO 27001', 'NIST', 'SOC 2']}
  title="Controls Compliance Heatmap"
  colorscale="RdYlGn" // Red-Yellow-Green
  height={400}
/>
```

### 6. **RadarChart** - Multi-dimensional Comparison
```jsx
<RadarChart
  data={[
    {
      name: 'Current',
      labels: ['ISO 27001', 'NIST', 'SOC 2', 'GDPR', 'HIPAA'],
      values: [87, 82, 78, 91, 85],
    },
    {
      name: 'Target',
      labels: ['ISO 27001', 'NIST', 'SOC 2', 'GDPR', 'HIPAA'],
      values: [90, 90, 90, 90, 90],
    },
  ]}
  title="Framework Compliance"
  height={450}
/>
```

### 7. **FunnelChart** - Conversion Metrics
```jsx
<FunnelChart
  data={{
    labels: ['Total Controls', 'Implemented', 'Tested', 'Verified', 'Compliant'],
    values: [150, 135, 120, 110, 105],
  }}
  title="Compliance Funnel"
  height={400}
/>
```

### 8. **StackedAreaChart** - Cumulative Trends
```jsx
<StackedAreaChart
  data={[
    { name: 'Critical', x: ['Jan', 'Feb', 'Mar'], y: [15, 14, 12] },
    { name: 'High', x: ['Jan', 'Feb', 'Mar'], y: [32, 30, 28] },
    { name: 'Medium', x: ['Jan', 'Feb', 'Mar'], y: [48, 47, 45] },
  ]}
  title="Risk Trends"
  xTitle="Month"
  yTitle="Count"
  height={400}
/>
```

### 9. **ScatterChart** - Correlation
```jsx
<ScatterChart
  data={[{
    name: 'Risks',
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    y: [2, 4, 3, 7, 5, 9, 6, 8, 7, 10],
    size: 10,
    color: '#3b82f6',
  }]}
  title="Risk Impact vs Likelihood"
  xTitle="Likelihood"
  yTitle="Impact"
  height={400}
/>
```

### 10. **WaterfallChart** - Sequential Changes
```jsx
<WaterfallChart
  data={{
    labels: ['Start', 'New Risks', 'Mitigated', 'Accepted', 'End'],
    values: [50, 20, -15, -10, 45],
  }}
  title="Risk Change Analysis"
  height={400}
/>
```

### 11-14: BoxPlot, Candlestick, Sunburst, Timeline
See [PlotlyCharts.jsx](./apps/web/src/components/charts/PlotlyCharts.jsx) for full documentation.

---

## Example: Complete Dashboard with 9 Charts

### EnhancedDashboardV2 Structure:

```jsx
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';
import {
  LineChart,
  BarChart,
  PieChart,
  GaugeChart,
  HeatmapChart,
  RadarChart,
  FunnelChart,
  StackedAreaChart,
} from '../../components/charts/PlotlyCharts';

const MyDashboard = () => {
  return (
    <EnterprisePageLayout
      title="GRC Dashboard"
      subtitle="Last updated: 2:30 PM"
      actions={<>{/* Action buttons */}</>}
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">{/* 4 KPI cards */}</div>

      {/* Chart 1 & 2 */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <LineChart {...complianceTrendProps} />
        </div>
        <div>
          <GaugeChart {...complianceGaugeProps} />
        </div>
      </div>

      {/* Chart 3 & 4 */}
      <div className="grid grid-cols-2 gap-6">
        <PieChart {...riskDistributionProps} />
        <BarChart {...assessmentStatusProps} />
      </div>

      {/* Chart 5 */}
      <HeatmapChart {...controlsHeatmapProps} />

      {/* Chart 6 */}
      <RadarChart {...frameworkRadarProps} />

      {/* Chart 7 & 8 */}
      <div className="grid grid-cols-2 gap-6">
        <FunnelChart {...complianceFunnelProps} />
        <StackedAreaChart {...riskTrendProps} />
      </div>

      {/* Chart 9 */}
      <BarChart {...complianceByDomainProps} />
    </EnterprisePageLayout>
  );
};
```

**Result:** 9 interactive charts + 4 KPI cards = Professional enterprise dashboard!

---

## Migration Steps

### Quick Migration (5 minutes per dashboard):

#### 1. Update Imports
```jsx
// OLD
import { someOldChart } from './old-charts';

// NEW
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';
import { LineChart, BarChart, PieChart } from '../../components/charts/PlotlyCharts';
```

#### 2. Replace Layout
```jsx
// OLD
<div className="p-8">
  <h1>Dashboard</h1>
  <div className="bg-white p-6">
    <h2>Dashboard</h2> {/* Duplicate! */}
    {/* Content */}
  </div>
</div>

// NEW
<EnterprisePageLayout title="Dashboard" subtitle="Real-time insights">
  {/* Content - no duplicate title */}
</EnterprisePageLayout>
```

#### 3. Replace Charts
```jsx
// OLD
<canvas ref={chartRef}></canvas>
// Complex Chart.js setup code (50+ lines)

// NEW
<LineChart data={myData} title="Trend" height={400} />
// That's it! (1 line)
```

---

## Dashboard Pages to Migrate

### Priority 1: Main Dashboards (4 pages)
1. ✅ **EnhancedDashboardV2** - DONE (9 charts)
2. ⏳ **AdvancedDashboard** - Next (add 6+ charts)
3. ⏳ **TenantDashboard** - Next (add 6+ charts)
4. ⏳ **RegulatoryMarketDashboard** - Next (add 6+ charts)

### Priority 2: Analytics Pages (3 pages)
5. ⏳ **EnhancedRiskPage** - Add risk analytics charts
6. ⏳ **ComplianceTrackingModule** - Add compliance charts
7. ⏳ **RiskManagementModule** - Add risk trend charts

---

## Features Comparison

| Before | After |
|--------|-------|
| Duplicate titles on every page | Single clean title |
| 50+ lines per chart setup | 1 line per chart |
| Static charts | Interactive (zoom, pan, hover) |
| Manual refresh | Auto-refresh every 30s |
| 2-3 charts per page | 6-9 charts per page |
| Chart.js/Custom | Plotly.js (enterprise-grade) |
| Inconsistent styling | Unified enterprise look |

---

## Chart Selection Guide

| Use Case | Recommended Chart |
|----------|-------------------|
| Trends over time | LineChart, StackedAreaChart |
| Comparisons | BarChart (vertical/horizontal) |
| Distribution/Parts of whole | PieChart, DonutChart |
| KPIs/Metrics | GaugeChart |
| Correlations/Patterns | HeatmapChart, ScatterChart |
| Multi-dimensional | RadarChart, SunburstChart |
| Process/Conversion | FunnelChart, WaterfallChart |
| Statistical data | BoxPlotChart |
| Financial data | CandlestickChart |
| Project timelines | TimelineChart |

---

## Troubleshooting

### Issue 1: "Cannot find module 'react-plotly.js'"
```bash
# Solution:
npm install plotly.js react-plotly.js
```

### Issue 2: Chart not rendering
```jsx
// Make sure data is in correct format:
<LineChart
  data={[
    {
      name: 'Series 1',  // ✅ Required
      x: [1, 2, 3],      // ✅ Required
      y: [10, 20, 30],   // ✅ Required
    }
  ]}
  title="My Chart"      // ✅ Required
/>
```

### Issue 3: Charts too slow
```jsx
// Reduce data points or use sampling:
const sampledData = data.filter((_, idx) => idx % 10 === 0);
```

---

## Performance Tips

1. **Limit data points** - Max 1000 points per chart for best performance
2. **Use lazy loading** - Load charts on scroll (React Lazy)
3. **Debounce updates** - Don't update charts on every keystroke
4. **Cache API responses** - Use React Query or SWR
5. **Memoize chart data** - Use `useMemo` for data transformations

---

## Next Steps

1. ✅ Install Plotly: `npm install plotly.js react-plotly.js`
2. ✅ Use EnhancedDashboardV2 as reference
3. 🔄 Migrate remaining dashboards (4 pages)
4. 🔄 Add 6+ charts to each dashboard
5. 🔄 Test in production tonight

---

## Support

- **Documentation**: See individual chart components in PlotlyCharts.jsx
- **Examples**: See EnhancedDashboardV2.jsx for complete implementation
- **Plotly Docs**: https://plotly.com/javascript/

Ready to create stunning enterprise dashboards! 🚀📊
