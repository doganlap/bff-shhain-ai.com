import React, { Suspense } from 'react';
const LazyPlot = React.lazy(() => import('react-plotly.js'));
const Plot = (props) => (
  <Suspense fallback={<div />}> 
    <LazyPlot {...props} />
  </Suspense>
);

/**
 * Advanced Plotly Chart Components Library
 *
 * Provides 10+ reusable chart types with enterprise styling
 * All charts are responsive and support dark mode
 */

const defaultLayout = {
  autosize: true,
  margin: { l: 50, r: 30, t: 50, b: 50 },
  font: { family: 'Inter, sans-serif', size: 12 },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  hovermode: 'closest',
};

const defaultConfig = {
  responsive: true,
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
};

/**
 * 1. Line Chart - Trend Analysis
 */
export const LineChart = ({ data, title, height = 400, xTitle, yTitle }) => {
  const traces = data.map((series, idx) => ({
    x: series.x,
    y: series.y,
    type: 'scatter',
    mode: 'lines+markers',
    name: series.name,
    line: { width: 3, shape: 'spline' },
    marker: { size: 6 },
  }));

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        xaxis: { title: xTitle, gridcolor: '#e5e7eb' },
        yaxis: { title: yTitle, gridcolor: '#e5e7eb' },
        height,
        showlegend: true,
        legend: { orientation: 'h', y: -0.2 },
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 2. Bar Chart - Comparisons
 */
export const BarChart = ({ data, title, height = 400, orientation = 'v', xTitle, yTitle }) => {
  const traces = data.map((series) => ({
    x: orientation === 'v' ? series.x : series.y,
    y: orientation === 'v' ? series.y : series.x,
    type: 'bar',
    name: series.name,
    orientation,
    marker: {
      color: series.color || undefined,
      line: { width: 1, color: '#fff' },
    },
  }));

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        xaxis: { title: xTitle, gridcolor: '#e5e7eb' },
        yaxis: { title: yTitle, gridcolor: '#e5e7eb' },
        height,
        barmode: 'group',
        showlegend: data.length > 1,
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 3. Pie/Donut Chart - Distribution
 */
export const PieChart = ({ data, title, height = 400, donut = false }) => {
  const trace = {
    labels: data.labels,
    values: data.values,
    type: 'pie',
    hole: donut ? 0.4 : 0,
    marker: {
      colors: data.colors || undefined,
      line: { color: '#fff', width: 2 },
    },
    textposition: 'inside',
    textinfo: 'label+percent',
    hoverinfo: 'label+value+percent',
  };

  return (
    <Plot
      data={[trace]}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        height,
        showlegend: true,
        legend: { orientation: 'h', y: -0.1 },
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 4. Heatmap - Correlation Matrix
 */
export const HeatmapChart = ({ data, title, height = 500, xLabels, yLabels, colorscale = 'RdYlGn' }) => {
  const trace = {
    z: data,
    x: xLabels,
    y: yLabels,
    type: 'heatmap',
    colorscale,
    showscale: true,
    hovertemplate: '%{y} - %{x}: %{z}<extra></extra>',
  };

  return (
    <Plot
      data={[trace]}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        height,
        xaxis: { side: 'bottom' },
        yaxis: { autorange: 'reversed' },
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 5. Gauge Chart - KPI Display
 */
export const GaugeChart = ({ value, title, height = 350, max = 100, threshold = { low: 40, high: 70 } }) => {
  const trace = {
    type: 'indicator',
    mode: 'gauge+number+delta',
    value: value,
    title: { text: title, font: { size: 20 } },
    delta: { reference: max * 0.8 },
    gauge: {
      axis: { range: [0, max], tickwidth: 1 },
      bar: { color: value < threshold.low ? '#ef4444' : value < threshold.high ? '#f59e0b' : '#10b981' },
      steps: [
        { range: [0, threshold.low], color: '#fee2e2' },
        { range: [threshold.low, threshold.high], color: '#fef3c7' },
        { range: [threshold.high, max], color: '#d1fae5' },
      ],
      threshold: {
        line: { color: 'red', width: 4 },
        thickness: 0.75,
        value: threshold.high,
      },
    },
  };

  return (
    <Plot
      data={[trace]}
      layout={{
        ...defaultLayout,
        height,
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 6. Stacked Area Chart - Cumulative Trends
 */
export const StackedAreaChart = ({ data, title, height = 400, xTitle, yTitle }) => {
  const traces = data.map((series) => ({
    x: series.x,
    y: series.y,
    type: 'scatter',
    mode: 'lines',
    name: series.name,
    fill: 'tonexty',
    line: { width: 0.5 },
    stackgroup: 'one',
  }));

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        xaxis: { title: xTitle, gridcolor: '#e5e7eb' },
        yaxis: { title: yTitle, gridcolor: '#e5e7eb' },
        height,
        showlegend: true,
        legend: { orientation: 'h', y: -0.2 },
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 7. Scatter Plot - Correlation Analysis
 */
export const ScatterChart = ({ data, title, height = 400, xTitle, yTitle }) => {
  const traces = data.map((series) => ({
    x: series.x,
    y: series.y,
    type: 'scatter',
    mode: 'markers',
    name: series.name,
    marker: {
      size: series.size || 10,
      color: series.color || undefined,
      line: { width: 1, color: '#fff' },
    },
  }));

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        xaxis: { title: xTitle, gridcolor: '#e5e7eb' },
        yaxis: { title: yTitle, gridcolor: '#e5e7eb' },
        height,
        showlegend: data.length > 1,
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 8. Waterfall Chart - Sequential Changes
 */
export const WaterfallChart = ({ data, title, height = 400 }) => {
  const trace = {
    type: 'waterfall',
    orientation: 'v',
    x: data.labels,
    y: data.values,
    text: data.values.map(v => `${v > 0 ? '+' : ''}${v}`),
    textposition: 'outside',
    connector: { line: { color: '#6b7280' } },
    increasing: { marker: { color: '#10b981' } },
    decreasing: { marker: { color: '#ef4444' } },
    totals: { marker: { color: '#3b82f6' } },
  };

  return (
    <Plot
      data={[trace]}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        height,
        showlegend: false,
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 9. Funnel Chart - Conversion Metrics
 */
export const FunnelChart = ({ data, title, height = 400 }) => {
  const trace = {
    type: 'funnel',
    y: data.labels,
    x: data.values,
    textposition: 'inside',
    textinfo: 'value+percent initial',
    marker: {
      color: data.colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    },
    connector: { line: { color: '#6b7280', width: 2 } },
  };

  return (
    <Plot
      data={[trace]}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        height,
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 10. Radar Chart - Multi-dimensional Comparison
 */
export const RadarChart = ({ data, title, height = 500 }) => {
  const traces = data.map((series) => ({
    type: 'scatterpolar',
    r: series.values,
    theta: series.labels,
    fill: 'toself',
    name: series.name,
  }));

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        height,
        polar: {
          radialaxis: {
            visible: true,
            range: [0, 100],
          },
        },
        showlegend: data.length > 1,
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 11. Box Plot - Statistical Distribution
 */
export const BoxPlotChart = ({ data, title, height = 400 }) => {
  const traces = data.map((series) => ({
    y: series.values,
    type: 'box',
    name: series.name,
    boxmean: 'sd',
  }));

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        height,
        showlegend: data.length > 1,
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 12. Candlestick Chart - Financial Data
 */
export const CandlestickChart = ({ data, title, height = 400 }) => {
  const trace = {
    type: 'candlestick',
    x: data.dates,
    open: data.open,
    high: data.high,
    low: data.low,
    close: data.close,
    increasing: { line: { color: '#10b981' } },
    decreasing: { line: { color: '#ef4444' } },
  };

  return (
    <Plot
      data={[trace]}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        height,
        xaxis: { rangeslider: { visible: false } },
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 13. Sunburst Chart - Hierarchical Data
 */
export const SunburstChart = ({ data, title, height = 500 }) => {
  const trace = {
    type: 'sunburst',
    labels: data.labels,
    parents: data.parents,
    values: data.values,
    branchvalues: 'total',
    marker: { colorscale: 'RdYlGn' },
  };

  return (
    <Plot
      data={[trace]}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        height,
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

/**
 * 14. Timeline/Gantt Chart - Project Tracking
 */
export const TimelineChart = ({ data, title, height = 400 }) => {
  const traces = data.map((task) => ({
    x: [task.duration],
    y: [task.name],
    type: 'bar',
    orientation: 'h',
    base: task.start,
    marker: { color: task.color },
    name: task.name,
    showlegend: false,
  }));

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 16, weight: 'bold' } },
        height,
        barmode: 'overlay',
        xaxis: { type: 'date', title: 'Timeline' },
      }}
      config={defaultConfig}
      style={{ width: '100%' }}
    />
  );
};

export default {
  LineChart,
  BarChart,
  PieChart,
  HeatmapChart,
  GaugeChart,
  StackedAreaChart,
  ScatterChart,
  WaterfallChart,
  FunnelChart,
  RadarChart,
  BoxPlotChart,
  CandlestickChart,
  SunburstChart,
  TimelineChart,
};
