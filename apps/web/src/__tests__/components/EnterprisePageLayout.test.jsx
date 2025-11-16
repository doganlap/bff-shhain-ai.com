/**
 * Component Unit Tests - EnterprisePageLayout
 * Tests layout component props, rendering, and interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';
import { renderWithProviders } from '../TestWrapper';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

vi.mock('../../components/guidance/ProcessGuideBanner', () => ({
  default: () => null,
}));

vi.mock('../../config/processGuides', () => ({
  processGuides: {},
  resolveGuideKey: vi.fn(),
}));

describe('EnterprisePageLayout Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLayout = (props = {}) => {
    const defaultProps = {
      title: 'Test Page',
      children: <div>Test Content</div>,
    };

    return renderWithProviders(
      <BrowserRouter>
        <EnterprisePageLayout {...defaultProps} {...props} />
      </BrowserRouter>
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

    it('should render actions when provided', () => {
      const actions = <button>Action Button</button>;
      renderLayout({ actions });

      expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should apply compact styling when compact=true', () => {
      renderLayout({ compact: true, subtitle: 'Should not show' });

      // Title should be smaller (text-lg instead of text-xl)
      const title = screen.getByText('Test Page');
      expect(title.className).toMatch(/text-lg/);

      // Subtitle should not be visible in compact mode
      expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
    });

    it('should use normal styling when compact=false', () => {
      renderLayout({ compact: false, subtitle: 'Should show' });

      const title = screen.getByText('Test Page');
      expect(title.className).toMatch(/text-xl/);

      // Subtitle should be visible
      expect(screen.getByText('Should show')).toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    it('should render back button when backButton=true', () => {
      renderLayout({ backButton: true });

      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should not render back button when backButton=false', () => {
      renderLayout({ backButton: false });

      const backButton = screen.queryByRole('button', { name: /go back/i });
      expect(backButton).not.toBeInTheDocument();
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

    it('should render settings icon when showSettings=true', () => {
      renderLayout({ showSettings: true });

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      expect(settingsButton).toBeInTheDocument();
    });

    it('should render notifications icon when showNotifications=true', () => {
      renderLayout({ showNotifications: true });

      const notificationsButton = screen.getByRole('button', { name: /notifications/i });
      expect(notificationsButton).toBeInTheDocument();
    });

    it('should show notification badge when notifications enabled', () => {
      renderLayout({ showNotifications: true });

      const badge = screen.getByTestId('notification-badge');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Max Width', () => {
    it('should apply full width by default', () => {
      const { container } = renderLayout();

      const contentDiv = container.querySelector('.max-w-full');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should apply specified max width', () => {
      const { container } = renderLayout({ maxWidth: 'lg' });

      const contentDiv = container.querySelector('.max-w-screen-lg');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('Padding', () => {
    it('should apply padding by default', () => {
      const { container } = renderLayout();

      const contentDiv = container.querySelector('.px-4');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should not apply padding when padding=false', () => {
      const { container } = renderLayout({ padding: false });

      const contentDiv = container.querySelector('.px-4');
      expect(contentDiv).not.toBeInTheDocument();
    });
  });

  describe('Custom Class Name', () => {
    it('should apply custom className', () => {
      const { container } = renderLayout({ className: 'custom-class' });

      const rootDiv = container.querySelector('.custom-class');
      expect(rootDiv).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      const { container } = renderLayout();

      // Check for dark mode classes - using attribute selector as alternative
      const headerDiv = container.querySelector('[class*="dark:bg-gray-800"]');
      expect(headerDiv).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button types', () => {
      renderLayout({ backButton: true, showHelp: true, showSettings: true });

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should have aria-label on buttons', () => {
      renderLayout({ backButton: true });

      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toHaveAttribute('aria-label', 'Go back');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderLayout({ backButton: true, showHelp: true });

      // Tab through elements
      await user.tab();
      expect(document.activeElement).toHaveAttribute('type', 'button');

      await user.tab();
      expect(document.activeElement).toHaveAttribute('type', 'button');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive padding classes', () => {
      const { container } = renderLayout();

      // Check for responsive padding - checking individual classes
      const contentDiv = container.querySelector('.px-4');
      expect(contentDiv).toBeInTheDocument();
      expect(contentDiv.className).toContain('sm:px-6');
      expect(contentDiv.className).toContain('lg:px-8');
    });
  });
});
