import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { I18nProvider } from './hooks/useI18n.jsx';
import { ThemeProvider } from './components/theme/ThemeProvider.jsx';
import { CulturalAdaptationProvider } from './components/Cultural/CulturalAdaptationProvider.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import './i18n'; // Initialize i18n
import './index.css';
import './App.css';
import './styles/glassmorphism-light.css';
import './styles/enterprise-modern.css';
import './styles/responsive.css';
import './styles/globals.css';

// Create a client for React Query with enhanced error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Enhanced error handling and loading
const renderApp = () => {
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      console.error('Root element not found');
      return;
    }

    // Remove loading screen if it exists
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 300);
      }, 500);
    }

    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light">
            <I18nProvider defaultLanguage="ar">
              <CulturalAdaptationProvider>
                <AppProvider>
                  <Router
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                    }}
                  >
                    <App />
                  </Router>
                </AppProvider>
              </CulturalAdaptationProvider>
            </I18nProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </React.StrictMode>
    );

    console.log('✅ Shahin-AI KSA | شاهين الذكي السعودية - منصة الحوكمة الذكية loaded successfully');
    
  } catch (error) {
    console.error('❌ Failed to render app:', error);
    
    // Fallback error display
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <div>
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ خطأ في التطبيق</h1>
            <p style="margin-bottom: 1rem;">فشل في تحميل شاهين الذكي السعودية | Failed to load Shahin-AI KSA</p>
            <button onclick="window.location.reload()" style="
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
            ">
              Reload Application
            </button>
          </div>
        </div>
      `;
    }
  }
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
