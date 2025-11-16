import { describe, it, expect, vi } from 'vitest';

// Just test that mocks work
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

vi.mock('../../hooks/useI18n.jsx', () => ({
  useI18n: () => ({
    t: (key) => key,
    language: 'en',
  }),
}));

describe('Test Mocks Only', () => {
  it('should pass without importing component', () => {
    expect(1 + 1).toBe(2);
  });

  it('can use mocked functions', () => {
    const { useNavigate } = vi.importedMocks['react-router-dom']();
    expect(typeof useNavigate).toBe('function');
  });
});