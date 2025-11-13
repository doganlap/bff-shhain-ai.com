/**
 * Performance Optimization Utilities
 * Fixes: Transform performance, cache busting, lazy loading
 */

// Cache busting utility
export const generateCacheKey = (url, version = '1.0.0') => {
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}&t=${timestamp}`;
};

// Optimized transform animations
export const getOptimizedTransform = (property, value) => {
  const transforms = {
    translateX: `translateX(${value})`,
    translateY: `translateY(${value})`,
    scale: `scale(${value})`,
    rotate: `rotate(${value}deg)`
  };
  
  return {
    transform: transforms[property] || value,
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    WebkitPerspective: '1000px',
    perspective: '1000px'
  };
};

// Performance-optimized CSS classes
export const performanceClasses = {
  // GPU acceleration
  gpuAccelerated: 'transform-gpu will-change-transform backface-hidden',
  
  // Optimized animations
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  slideIn: 'animate-in slide-in-from-left duration-300',
  slideOut: 'animate-out slide-out-to-left duration-300',
  
  // Layout optimization
  containLayout: 'contain-layout',
  containPaint: 'contain-paint',
  containSize: 'contain-size',
  containStrict: 'contain-strict'
};

// Lazy loading utility
export const createLazyLoader = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  return observer;
};

// Web Vitals optimization
export const optimizeWebVitals = () => {
  // Preload critical resources
  const preloadResource = (href, as, type) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  };

  // Preload critical CSS and fonts
  preloadResource('/assets/css/critical.css', 'style');
  preloadResource('/assets/fonts/main.woff2', 'font', 'font/woff2');

  // Service Worker registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .catch(error => console.log('SW registration failed:', error));
  }
};

// Memory management
export const cleanupResources = () => {
  // Cleanup event listeners
  const cleanup = [];
  
  const addCleanup = (element, event, handler) => {
    element.addEventListener(event, handler);
    cleanup.push(() => element.removeEventListener(event, handler));
  };

  const cleanupAll = () => {
    cleanup.forEach(fn => fn());
    cleanup.length = 0;
  };

  return { addCleanup, cleanupAll };
};

// Cache strategies
export const cacheStrategies = {
  // Static assets - cache first
  staticAssets: {
    'cache-control': 'public, max-age=31536000, immutable'
  },
  
  // API responses - network first with fallback
  apiResponses: {
    'cache-control': 'public, max-age=300, must-revalidate'
  },
  
  // HTML pages - stale while revalidate
  htmlPages: {
    'cache-control': 'public, max-age=0, must-revalidate'
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName, renderFn) => {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    
    if (end - start > 16) { // > 1 frame at 60fps
      console.warn(`Slow render detected: ${componentName} took ${end - start}ms`);
    }
    
    return result;
  },

  // Track memory usage
  trackMemory: () => {
    if (performance.memory) {
      const memory = performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
      };
    }
    return null;
  }
};

export default {
  generateCacheKey,
  getOptimizedTransform,
  performanceClasses,
  createLazyLoader,
  optimizeWebVitals,
  cleanupResources,
  cacheStrategies,
  performanceMonitor
};
