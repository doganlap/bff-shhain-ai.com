/**
 * Performance Monitoring Utility
 * Tracks and reports frontend performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = import.meta.env.MODE !== 'test';
  }

  /**
   * Mark the start of a performance measurement
   */
  start(label) {
    if (!this.isEnabled) return;
    
    const startMark = `${label}_start`;
    performance.mark(startMark);
  }

  /**
   * Mark the end of a performance measurement and calculate duration
   */
  end(label, metadata = {}) {
    if (!this.isEnabled) return null;

    const startMark = `${label}_start`;
    const endMark = `${label}_end`;
    
    try {
      performance.mark(endMark);
      const measure = performance.measure(label, startMark, endMark);
      
      const metric = {
        label,
        duration: measure.duration,
        timestamp: Date.now(),
        ...metadata
      };

      this.metrics.set(label, metric);

      // Log in development
      if (import.meta.env.MODE === 'development') {
        console.log(`[Performance] ${label}: ${measure.duration.toFixed(2)}ms`, metadata);
      }

      // Send to analytics in production
      if (import.meta.env.MODE === 'production' && measure.duration > 1000) {
        this.reportSlowOperation(metric);
      }

      // Clean up marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(label);

      return measure.duration;
    } catch (error) {
      console.warn(`Performance measurement failed for "${label}":`, error);
      return null;
    }
  }

  /**
   * Measure the duration of an async function
   */
  async measure(label, fn, metadata = {}) {
    this.start(label);
    try {
      const result = await fn();
      this.end(label, metadata);
      return result;
    } catch (error) {
      this.end(label, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics() {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics by label pattern
   */
  getMetricsByPattern(pattern) {
    const regex = new RegExp(pattern);
    return this.getMetrics().filter(metric => regex.test(metric.label));
  }

  /**
   * Get average duration for a specific label
   */
  getAverageDuration(label) {
    const metrics = this.getMetricsByPattern(`^${label}`);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  /**
   * Report slow operation to analytics
   */
  reportSlowOperation(metric) {
    // TODO: Send to analytics service
    console.warn(`[Performance Warning] Slow operation detected:`, metric);
  }

  /**
   * Monitor Web Vitals (Core Web Vitals)
   */
  monitorWebVitals() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          console.log('[Web Vitals] LCP:', lastEntry.renderTime || lastEntry.loadTime);
          
          // Good: < 2.5s, Needs Improvement: 2.5s - 4s, Poor: > 4s
          if (lastEntry.renderTime > 4000) {
            this.reportSlowOperation({
              label: 'LCP',
              duration: lastEntry.renderTime,
              metric: 'Largest Contentful Paint',
              status: 'poor'
            });
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP monitoring not supported:', e);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.log('[Web Vitals] FID:', entry.processingStart - entry.startTime);
            
            // Good: < 100ms, Needs Improvement: 100ms - 300ms, Poor: > 300ms
            const fid = entry.processingStart - entry.startTime;
            if (fid > 300) {
              this.reportSlowOperation({
                label: 'FID',
                duration: fid,
                metric: 'First Input Delay',
                status: 'poor'
              });
            }
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID monitoring not supported:', e);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          
          console.log('[Web Vitals] CLS:', clsValue);
          
          // Good: < 0.1, Needs Improvement: 0.1 - 0.25, Poor: > 0.25
          if (clsValue > 0.25) {
            this.reportSlowOperation({
              label: 'CLS',
              duration: clsValue,
              metric: 'Cumulative Layout Shift',
              status: 'poor'
            });
          }
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS monitoring not supported:', e);
      }
    }

    // Time to First Byte (TTFB)
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const ttfb = timing.responseStart - timing.requestStart;
      console.log('[Web Vitals] TTFB:', ttfb);
      
      // Good: < 600ms, Needs Improvement: 600ms - 1.5s, Poor: > 1.5s
      if (ttfb > 1500) {
        this.reportSlowOperation({
          label: 'TTFB',
          duration: ttfb,
          metric: 'Time to First Byte',
          status: 'poor'
        });
      }
    }
  }

  /**
   * Get navigation timing metrics
   */
  getNavigationMetrics() {
    if (!window.performance || !window.performance.timing) {
      return null;
    }

    const timing = window.performance.timing;
    
    return {
      // Network
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      
      // Document processing
      domParsing: timing.domInteractive - timing.domLoading,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      windowLoad: timing.loadEventEnd - timing.navigationStart,
      
      // Overall
      pageLoad: timing.loadEventEnd - timing.navigationStart
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Initialize Web Vitals monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.monitorWebVitals();
    
    // Log navigation metrics
    setTimeout(() => {
      const metrics = performanceMonitor.getNavigationMetrics();
      if (metrics) {
        console.log('[Performance] Navigation Metrics:', metrics);
      }
    }, 0);
  });
}

export { PerformanceMonitor };
export default performanceMonitor;
