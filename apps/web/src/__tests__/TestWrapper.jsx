import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../components/theme/ThemeProvider';
import { I18nProvider } from '../hooks/useI18n';
import { AppProvider } from '../context/AppContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock RBAC hook
vi.mock('../hooks/useRBAC', () => ({
  useRBAC: () => ({
    hasPermission: vi.fn(() => true),
    hasAnyPermission: vi.fn(() => true),
    hasAllPermissions: vi.fn(() => true),
    hasFeature: vi.fn(() => true),
    isSuperAdmin: true,
    userRole: 'admin',
    userPermissions: ['read', 'write', 'delete'],
    loading: false
  })
}));

// Mock Auth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com', role: 'admin' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    loading: false
  })
}));

// Mock I18n hook and provider
vi.mock('../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key) => key,
    isRTL: false,
    language: 'en',
    setLanguage: vi.fn()
  }),
  I18nProvider: ({ children, defaultLanguage = 'en' }) => (
    <div data-testid="i18n-provider" data-language={defaultLanguage}>
      {children}
    </div>
  )
}));

// Mock Permission components from PermissionBasedCard
vi.mock('../components/common/PermissionBasedCard', () => ({
  PermissionBasedCard: ({ children, title, description, ...props }) => (
    <div {...props} data-testid="permission-card">
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {children}
    </div>
  ),
  PermissionBasedButton: ({ children, ...props }) => (
    <button {...props}>{children}</button>
  ),
  PermissionBasedComponent: ({ children }) => <>{children}</>,
  PermissionWrapper: ({ children }) => <>{children}</>
}));

// Create query client for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export const TestWrapper = ({ children, initialEntries = ['/'] }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <ThemeProvider defaultTheme="light">
          <I18nProvider defaultLanguage="en">
            <AppProvider>
              {children}
            </AppProvider>
          </I18nProvider>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

export const renderWithProviders = (ui, options = {}) => {
  const { initialEntries = ['/'], ...renderOptions } = options;
  
  return render(
    <TestWrapper initialEntries={initialEntries}>
      {ui}
    </TestWrapper>,
    renderOptions
  );
};

// Re-export testing utilities
export * from '@testing-library/react';
export { renderWithProviders as render };