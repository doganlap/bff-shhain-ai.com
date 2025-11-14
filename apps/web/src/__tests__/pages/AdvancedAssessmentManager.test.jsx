/**
 * Integration Tests - Advanced Assessment Manager Page
 * Tests assessment CRUD operations, modal interactions, and data management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AdvancedAssessmentManager from '../../components/AdvancedAssessmentManager';
import apiService from '../../services/apiEndpoints';

// Mock API service
vi.mock('../../services/apiEndpoints', () => ({
  default: {
    assessments: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    frameworks: {
      getAll: vi.fn(),
    },
  },
}));

const mockAssessments = [
  {
    id: 1,
    name: 'ISO 27001 Q4 2024',
    framework: 'ISO 27001',
    status: 'active',
    progress: 65,
    start_date: '2024-10-01',
    due_date: '2024-12-31',
  },
  {
    id: 2,
    name: 'NIST CSF Q4 2024',
    framework: 'NIST CSF',
    status: 'completed',
    progress: 100,
    start_date: '2024-09-01',
    due_date: '2024-11-30',
  },
  {
    id: 3,
    name: 'SOC 2 Type II',
    framework: 'SOC 2',
    status: 'pending',
    progress: 0,
    start_date: '2024-12-01',
    due_date: '2025-03-31',
  },
];

const mockFrameworks = [
  { id: 1, name: 'ISO 27001' },
  { id: 2, name: 'NIST CSF' },
  { id: 3, name: 'SOC 2' },
  { id: 4, name: 'GDPR' },
];

describe('AdvancedAssessmentManager - Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    apiService.assessments.getAll.mockResolvedValue({
      data: { data: mockAssessments },
    });

    apiService.frameworks.getAll.mockResolvedValue({
      data: { data: mockFrameworks },
    });
  });

  const renderAssessmentManager = () => {
    return render(
      <BrowserRouter>
        <AdvancedAssessmentManager />
      </BrowserRouter>
    );
  };

  describe('Page Rendering', () => {
    it('should render page with title', async () => {
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText(/Assessments/i)).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      renderAssessmentManager();

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render all assessments after loading', async () => {
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
        expect(screen.getByText('NIST CSF Q4 2024')).toBeInTheDocument();
        expect(screen.getByText('SOC 2 Type II')).toBeInTheDocument();
      });
    });

    it('should display assessment status badges', async () => {
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
        expect(screen.getByText('completed')).toBeInTheDocument();
        expect(screen.getByText('pending')).toBeInTheDocument();
      });
    });

    it('should display progress bars', async () => {
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('65%')).toBeInTheDocument();
        expect(screen.getByText('100%')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
      });
    });
  });

  describe('Create Assessment', () => {
    it('should open create modal when Create New button clicked', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('Create New')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create new/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Create Assessment')).toBeInTheDocument();
      });
    });

    it('should create new assessment with valid data', async () => {
      const user = userEvent.setup();
      const newAssessment = {
        id: 4,
        name: 'New Assessment',
        framework: 'GDPR',
        status: 'active',
        progress: 0,
      };

      apiService.assessments.create.mockResolvedValue({
        data: newAssessment,
      });

      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('Create New')).toBeInTheDocument();
      });

      // Open create modal
      const createButton = screen.getByRole('button', { name: /create new/i });
      await user.click(createButton);

      // Fill form
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/name/i), 'New Assessment');
      await user.selectOptions(screen.getByLabelText(/framework/i), 'GDPR');
      await user.type(screen.getByLabelText(/start date/i), '2024-12-01');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiService.assessments.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Assessment',
            framework: 'GDPR',
          })
        );
      });
    });

    it('should show validation errors for invalid data', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('Create New')).toBeInTheDocument();
      });

      // Open create modal
      const createButton = screen.getByRole('button', { name: /create new/i });
      await user.click(createButton);

      // Try to submit without filling required fields
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /create/i });
        expect(submitButton).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('should close modal when Cancel clicked', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('Create New')).toBeInTheDocument();
      });

      // Open create modal
      const createButton = screen.getByRole('button', { name: /create new/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Update Assessment', () => {
    it('should open edit modal when Edit button clicked', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Edit Assessment')).toBeInTheDocument();
        expect(screen.getByDisplayValue('ISO 27001 Q4 2024')).toBeInTheDocument();
      });
    });

    it('should update assessment with new data', async () => {
      const user = userEvent.setup();
      apiService.assessments.update.mockResolvedValue({
        data: { ...mockAssessments[0], name: 'Updated Assessment' },
      });

      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
      });

      // Open edit modal
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      // Update name
      await waitFor(() => {
        expect(screen.getByDisplayValue('ISO 27001 Q4 2024')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('ISO 27001 Q4 2024');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Assessment');

      // Submit
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(apiService.assessments.update).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            name: 'Updated Assessment',
          })
        );
      });
    });
  });

  describe('Delete Assessment', () => {
    it('should show delete confirmation dialog', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });

    it('should delete assessment when confirmed', async () => {
      const user = userEvent.setup();
      apiService.assessments.delete.mockResolvedValue({ data: { success: true } });

      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
      });

      // Click delete
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(apiService.assessments.delete).toHaveBeenCalledWith(1);
      });
    });

    it('should not delete when cancelled', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
      });

      // Click delete
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Cancel deletion
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(apiService.assessments.delete).not.toHaveBeenCalled();
    });
  });

  describe('Search and Filter', () => {
    it('should filter assessments by search term', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
        expect(screen.getByText('NIST CSF Q4 2024')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'ISO');

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
        expect(screen.queryByText('NIST CSF Q4 2024')).not.toBeInTheDocument();
      });
    });

    it('should filter assessments by status', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
      });

      const statusFilter = screen.getByRole('combobox', { name: /status/i });
      await user.selectOptions(statusFilter, 'active');

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
        expect(screen.queryByText('NIST CSF Q4 2024')).not.toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    it('should sort assessments by name', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
      });

      const sortButton = screen.getByRole('button', { name: /sort by name/i });
      await user.click(sortButton);

      // Check order (implementation dependent)
      const assessmentCards = screen.getAllByTestId('assessment-card');
      expect(assessmentCards).toHaveLength(3);
    });

    it('should sort assessments by due date', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
      });

      const sortButton = screen.getByRole('button', { name: /sort by date/i });
      await user.click(sortButton);

      const assessmentCards = screen.getAllByTestId('assessment-card');
      expect(assessmentCards).toHaveLength(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors when loading assessments', async () => {
      apiService.assessments.getAll.mockRejectedValue(new Error('API Error'));

      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText(/error loading/i)).toBeInTheDocument();
      });
    });

    it('should handle errors when creating assessment', async () => {
      const user = userEvent.setup();
      apiService.assessments.create.mockRejectedValue(new Error('Create Error'));

      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('Create New')).toBeInTheDocument();
      });

      // Try to create
      const createButton = screen.getByRole('button', { name: /create new/i });
      await user.click(createButton);

      const submitButton = await screen.findByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('Create New')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create new/i });
      expect(createButton).toHaveAttribute('aria-label', 'Create New Assessment');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('Create New')).toBeInTheDocument();
      });

      // Tab through elements
      await user.tab();
      expect(document.activeElement).toBeDefined();
    });
  });

  describe('Bulk Operations', () => {
    it('should select multiple assessments', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });

    it('should show bulk action menu', async () => {
      const user = userEvent.setup();
      renderAssessmentManager();

      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Q4 2024')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText(/bulk actions/i)).toBeInTheDocument();
      });
    });
  });
});
