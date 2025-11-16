import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock all dependencies before importing the component
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  BrowserRouter: ({ children }) => children,
}));

vi.mock('../../components/guidance/ProcessGuideBanner', () => ({
  default: () => null,
}));

vi.mock('../../config/processGuides', () => ({
  processGuides: {},
  resolveGuideKey: vi.fn(),
}));

// Now import the component
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';

describe('EnterprisePageLayout Minimal Test', () => {
  it('should render title', () => {
    render(
      <EnterprisePageLayout title="Test Title">
        <div>Test Content</div>
      </EnterprisePageLayout>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});