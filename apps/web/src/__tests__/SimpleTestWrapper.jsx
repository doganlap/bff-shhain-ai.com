import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Simple test wrapper that provides basic routing
export const SimpleTestWrapper = ({ children, initialEntries = ['/'] }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  );
};

// Minimal render function for basic component testing
export const simpleRender = (ui, options = {}) => {
  const { initialEntries = ['/'], ...renderOptions } = options;
  
  return render(
    <SimpleTestWrapper initialEntries={initialEntries}>
      {ui}
    </SimpleTestWrapper>,
    renderOptions
  );
};

// Export all testing utilities
export * from '@testing-library/react';
export { simpleRender as render };