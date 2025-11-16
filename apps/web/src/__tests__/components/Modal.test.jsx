import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Modal } from '../../../src/components/ui/InteractiveComponents';

describe('Modal accessibility and focus management', () => {
  test('renders with aria attributes when title and description provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test" description="A test modal" disablePortal>
        <button>OK</button>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
    // title should exist
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('does not set aria-describedby if no description provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="NoDesc" disablePortal>
        <button>OK</button>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).not.toHaveAttribute('aria-describedby');
  });

  test('focus trap cycles within modal focusable elements', async () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Focus Test" disablePortal>
        <div>
          <button>First</button>
          <button>Second</button>
        </div>
      </Modal>
    );

    const firstBtn = screen.getByText('First');
    const secondBtn = screen.getByText('Second');

    // First element should be focused
    expect(document.activeElement).toBe(firstBtn);

    // Tab to next
    await userEvent.tab();
    expect(document.activeElement).toBe(secondBtn);

    // Tab again should wrap to first
    await userEvent.tab();
    expect(document.activeElement).toBe(firstBtn);
  });

  // skip ImpactAssessmentModal specialised test to avoid heavy imports during unit test runs
});
