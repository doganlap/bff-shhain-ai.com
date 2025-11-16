import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';

// Mock all external dependencies
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
  BrowserRouter: ({ children }) => children,
}));

// Mock the hooks that require context
vi.mock('../../hooks/useI18n.jsx', () => ({
  useI18n: () => ({
    t: (key) => key,
    language: 'en',
    direction: 'ltr',
    changeLanguage: vi.fn(),
    isRTL: false,
  }),
  I18nProvider: ({ children }) => children,
}));

vi.mock('../theme/ThemeProvider', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }) => children,
}));

vi.mock('../../components/guidance/ProcessGuideBanner', () => ({
  default: () => null,
}));

vi.mock('../../config/processGuides', () => ({
  processGuides: {},
  resolveGuideKey: vi.fn(),
}));

// Now import the component after all mocks are set up
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';

describe('EnterprisePageLayout Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLayout = (props = {}) => {
    const defaultProps = {
      title: 'Test Page',
      children: <div>Test Content</div>,
    };

    return render(
      <EnterprisePageLayout {...defaultProps} {...props} />
    );
  };

  describe('Basic Rendering', () => {
    it('should render title and children', () => {
      renderLayout();

      expect(screen.getByText('Test Page')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render subtitle when provided', () => {
      renderLayout({ subtitle: 'Test Subtitle' });

      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('should render breadcrumb when provided', () => {
      renderLayout({ breadcrumb: 'Home / Dashboard' });

      expect(screen.getByText('Home / Dashboard /')).toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    it('should render back button when backButton=true', () => {
      renderLayout({ backButton: true });

      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should navigate back when back button clicked', async () => {
      const user = userEvent.setup();
      renderLayout({ backButton: true });

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should navigate to backUrl when provided', async () => {
      const user = userEvent.setup();
      renderLayout({ backButton: true, backUrl: '/dashboard' });

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Compact Mode', () => {
    it('should apply compact styling when compact=true', () => {
      renderLayout({ compact: true, subtitle: 'Should not show' });

      // Title should be smaller (text-lg instead of text-xl)
      const title = screen.getByText('Test Page');
      expect(title.className).toContain('text-lg');

      // Subtitle should not be visible in compact mode
      expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
    });
  });

  describe('Utility Icons', () => {
    it('should render help icon by default', () => {
      renderLayout();

      const helpButton = screen.getByRole('button', { name: /help/i });
      expect(helpButton).toBeInTheDocument();
    });

    it('should not render help icon when showHelp=false', () => {
      renderLayout({ showHelp: false });

      const helpButton = screen.queryByRole('button', { name: /help/i });
      expect(helpButton).not.toBeInTheDocument();
    });
  });
});