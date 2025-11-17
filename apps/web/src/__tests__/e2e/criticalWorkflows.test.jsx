import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../TestWrapper';

// Import pages for E2E testing
import SimpleLoginPage from '../../pages/auth/SimpleLoginPage';
import StoryDrivenRegistration from '../../pages/auth/StoryDrivenRegistration';
import EnhancedDashboard from '../../pages/dashboard/EnhancedDashboard';
import AdvancedAssessmentManager from '../../pages/grc-modules/AssessmentDetailsCollaborative';
import { FrameworksModuleEnhanced, RiskManagementModuleEnhanced } from '../../pages';
import Evidence from '../../pages/grc-modules/Evidence';

// Mock API service
vi.mock('../../services/apiEndpoints', () => ({
  default: {
    auth: {
      login: vi.fn(),
      register: vi.fn()
    },
    dashboard: {
      getKPIs: vi.fn(),
      getActivity: vi.fn(),
      getTrends: vi.fn()
    },
    assessments: {
      getAll: vi.fn(),
      create: vi.fn(),
      getById: vi.fn(),
      generateQuestions: vi.fn(),
      getProgress: vi.fn(),
      submitResponse: vi.fn()
    },
    frameworks: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      getControls: vi.fn(),
      getAnalytics: vi.fn()
    },
    risks: {
      getAll: vi.fn(),
      create: vi.fn(),
      getMetrics: vi.fn(),
      getHeatmap: vi.fn()
    },
    users: {
      getAll: vi.fn(),
      invite: vi.fn()
    }
  }
}));

// Mock hooks
vi.mock('../../hooks/useRBAC', () => ({
  useRBAC: () => ({
    hasPermission: vi.fn(() => true),
    userRole: 'admin',
    isSuperAdmin: true
  })
}));

vi.mock('../../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key) => key,
    isRTL: false,
    language: 'en'
  })
}));

vi.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    send: vi.fn()
  })
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.OPEN;
  }
  send = vi.fn();
  close = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}
global.WebSocket = MockWebSocket;

// Mock file upload
const createMockFile = (name, content, type) => {
  return new File([content], name, { type });
};

// Test data generators
const generateMockUser = () => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  tenant_id: 'tenant-123'
});

const generateMockTenant = () => ({
  id: 'tenant-123',
  name: 'Test Tenant',
  domain: 'test.example.com'
});

const generateMockAssessment = () => ({
  id: 'assessment-123',
  title: 'SOX Compliance Assessment',
  framework_id: 'framework-123',
  status: 'draft',
  progress: 0,
  tenant_id: 'tenant-123',
  created_at: new Date().toISOString()
});

const generateMockFramework = () => ({
  id: 'framework-123',
  name: 'SOX Compliance Framework',
  version: '1.0',
  description: 'Sarbanes-Oxley Act compliance framework',
  status: 'active',
  controls_count: 25
});

const generateMockRisk = () => ({
  id: 'risk-123',
  title: 'Data Breach Risk',
  description: 'Risk of unauthorized data access',
  impact: 'high',
  probability: 'medium',
  status: 'open',
  risk_score: 75
});

const generateMockKPIs = () => ({
  total_assessments: 150,
  completed_assessments: 120,
  pending_risks: 25,
  compliance_score: 85,
  active_frameworks: 8,
  total_controls: 245
});

describe('End-to-End Critical Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('User Authentication and Onboarding Workflow', () => {
    it('should complete full user registration and login flow', async () => {
      const { auth } = (await import('../../services/apiEndpoints')).default;
      
      // Mock successful registration
      auth.register.mockResolvedValueOnce({
        data: { 
          success: true, 
          data: { 
            user: generateMockUser(),
            token: 'new-user-token'
          }
        }
      });

      // Mock successful login
      auth.login.mockResolvedValueOnce({
        data: { 
          success: true, 
          data: { 
            user: generateMockUser(),
            token: 'login-token'
          }
        }
      });

      const user = userEvent.setup();

      // Step 1: Render registration page
      renderWithProviders(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<StoryDrivenRegistration />} />
            <Route path="/login" element={<SimpleLoginPage />} />
            <Route path="/dashboard" element={<EnhancedDashboard />} />
          </Routes>
        </MemoryRouter>
      );

      // Step 2: Fill registration form
      await waitFor(() => {
        expect(screen.getByText('Create Your Account')).toBeInTheDocument();
      });

      // Fill company information
      const companyInput = screen.getByPlaceholderText(/company name/i);
      await user.type(companyInput, 'Test Company');

      // Fill user information
      const emailInput = screen.getByPlaceholderText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const passwordInput = screen.getByPlaceholderText(/password/i);
      await user.type(passwordInput, 'SecurePassword123!');

      // Submit registration
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Step 3: Verify registration API was called
      expect(auth.register).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        company: 'Test Company'
      }));

      // Step 4: Navigate to login (simulated)
      // In real app, this would happen automatically after registration
      
      // Step 5: Login with credentials
      const loginEmailInput = screen.getByPlaceholderText(/email/i);
      await user.clear(loginEmailInput);
      await user.type(loginEmailInput, 'test@example.com');

      const loginPasswordInput = screen.getByPlaceholderText(/password/i);
      await user.type(loginPasswordInput, 'SecurePassword123!');

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(loginButton);

      // Step 6: Verify login API was called
      expect(auth.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePassword123!'
      });
    });
  });

  describe('Complete Assessment Workflow', () => {
    it('should create, execute, and complete an assessment from start to finish', async () => {
      const { assessments, frameworks, dashboard } = (await import('../../services/apiEndpoints')).default;
      
      // Mock API responses
      frameworks.getAll.mockResolvedValue({
        data: { success: true, data: [generateMockFramework()] }
      });
      
      assessments.getAll.mockResolvedValue({
        data: { success: true, data: [] }
      });
      
      assessments.create.mockResolvedValue({
        data: { success: true, data: generateMockAssessment() }
      });
      
      assessments.generateQuestions.mockResolvedValue({
        data: { success: true, data: [
          { id: 'q1', question: 'Is data encrypted at rest?', type: 'yes_no' },
          { id: 'q2', question: 'How often are backups performed?', type: 'multiple_choice' }
        ]}
      });
      
      assessments.getProgress.mockResolvedValue({
        data: { success: true, data: { completed: 0, total: 2, percentage: 0 } }
      });
      
      assessments.submitResponse.mockResolvedValue({
        data: { success: true, data: { submitted: true } }
      });
      
      dashboard.getKPIs.mockResolvedValue({
        data: { success: true, data: generateMockKPIs() }
      });

      const user = userEvent.setup();

      // Step 1: Start from dashboard
      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<EnhancedDashboard />} />
            <Route path="/assessments" element={<AdvancedAssessmentManager />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Step 2: Navigate to assessments
      const assessmentsLink = screen.getByRole('link', { name: /assessments/i });
      await user.click(assessmentsLink);

      await waitFor(() => {
        expect(screen.getByText('Assessment Management')).toBeInTheDocument();
      });

      // Step 3: Create new assessment
      const createButton = screen.getByRole('button', { name: /create assessment/i });
      await user.click(createButton);

      // Fill assessment form
      const titleInput = screen.getByPlaceholderText(/assessment title/i);
      await user.type(titleInput, 'Q4 Compliance Assessment');

      const frameworkSelect = screen.getByLabelText(/framework/i);
      await user.selectOptions(frameworkSelect, 'framework-123');

      const createSubmitButton = screen.getByRole('button', { name: /create/i });
      await user.click(createSubmitButton);

      // Verify assessment was created
      expect(assessments.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Q4 Compliance Assessment',
        framework_id: 'framework-123'
      }));

      // Step 4: Generate questions
      const generateQuestionsButton = screen.getByRole('button', { name: /generate questions/i });
      await user.click(generateQuestionsButton);

      expect(assessments.generateQuestions).toHaveBeenCalledWith('assessment-123', expect.any(Object));

      // Step 5: Answer questions
      await waitFor(() => {
        expect(screen.getByText('Is data encrypted at rest?')).toBeInTheDocument();
      });

      const yesRadio = screen.getByLabelText(/yes/i);
      await user.click(yesRadio);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Answer second question
      const dailyOption = screen.getByLabelText(/daily/i);
      await user.click(dailyOption);

      const submitAssessmentButton = screen.getByRole('button', { name: /submit assessment/i });
      await user.click(submitAssessmentButton);

      // Verify responses were submitted
      expect(assessments.submitResponse).toHaveBeenCalledTimes(2);
    });
  });

  describe('Risk Management and Mitigation Workflow', () => {
    it('should identify, assess, and mitigate a risk end-to-end', async () => {
      const { risks } = (await import('../../services/apiEndpoints')).default;
      
      // Mock API responses
      risks.getAll.mockResolvedValue({
        data: { success: true, data: [] }
      });
      
      risks.create.mockResolvedValue({
        data: { success: true, data: generateMockRisk() }
      });
      
      risks.getMetrics.mockResolvedValue({
        data: { success: true, data: { total_risks: 0, open_risks: 0, high_risks: 0 } }
      });
      
      risks.getHeatmap.mockResolvedValue({
        data: { success: true, data: [] }
      });

      const user = userEvent.setup();

      // Step 1: Navigate to risk management
      renderWithProviders(
        <MemoryRouter initialEntries={['/risks']}>
          <Routes>
            <Route path="/risks" element={<RiskManagementModuleEnhanced />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Risk Management')).toBeInTheDocument();
      });

      // Step 2: Create new risk
      const createRiskButton = screen.getByRole('button', { name: /create risk/i });
      await user.click(createRiskButton);

      // Fill risk form
      const titleInput = screen.getByPlaceholderText(/risk title/i);
      await user.type(titleInput, 'Cyber Security Threat');

      const descriptionInput = screen.getByPlaceholderText(/risk description/i);
      await user.type(descriptionInput, 'Potential data breach from external attack');

      const impactSelect = screen.getByLabelText(/impact/i);
      await user.selectOptions(impactSelect, 'high');

      const probabilitySelect = screen.getByLabelText(/probability/i);
      await user.selectOptions(probabilitySelect, 'medium');

      const saveRiskButton = screen.getByRole('button', { name: /save risk/i });
      await user.click(saveRiskButton);

      // Verify risk was created
      expect(risks.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Cyber Security Threat',
        impact: 'high',
        probability: 'medium'
      }));

      // Step 3: Assess the risk
      await waitFor(() => {
        expect(screen.getByText('Cyber Security Threat')).toBeInTheDocument();
      });

      const assessButton = screen.getByRole('button', { name: /assess/i });
      await user.click(assessButton);

      // Verify risk assessment was triggered
      expect(screen.getByText('Risk Score: 75')).toBeInTheDocument();
    });
  });

  describe('Framework Management Workflow', () => {
    it('should create, configure, and manage a compliance framework', async () => {
      const { frameworks } = (await import('../../services/apiEndpoints')).default;
      
      // Mock API responses
      frameworks.getAll.mockResolvedValue({
        data: { success: true, data: [] }
      });
      
      frameworks.create.mockResolvedValue({
        data: { success: true, data: generateMockFramework() }
      });
      
      frameworks.getControls.mockResolvedValue({
        data: { success: true, data: [
          { id: 'control-1', name: 'Access Control', status: 'implemented' },
          { id: 'control-2', name: 'Data Encryption', status: 'implemented' }
        ]}
      });
      
      frameworks.getAnalytics.mockResolvedValue({
        data: { success: true, data: { total_frameworks: 0, active_frameworks: 0 } }
      });

      const user = userEvent.setup();

      // Step 1: Navigate to frameworks
      renderWithProviders(
        <MemoryRouter initialEntries={['/frameworks']}>
          <Routes>
            <Route path="/frameworks" element={<FrameworksModuleEnhanced />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Frameworks Management')).toBeInTheDocument();
      });

      // Step 2: Create new framework
      const createFrameworkButton = screen.getByRole('button', { name: /create framework/i });
      await user.click(createFrameworkButton);

      // Fill framework form
      const nameInput = screen.getByPlaceholderText(/framework name/i);
      await user.type(nameInput, 'ISO 27001 Framework');

      const versionInput = screen.getByPlaceholderText(/version/i);
      await user.type(versionInput, '2022');

      const descriptionInput = screen.getByPlaceholderText(/description/i);
      await user.type(descriptionInput, 'Information Security Management System');

      const saveFrameworkButton = screen.getByRole('button', { name: /save framework/i });
      await user.click(saveFrameworkButton);

      // Verify framework was created
      expect(frameworks.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'ISO 27001 Framework',
        version: '2022',
        description: 'Information Security Management System'
      }));

      // Step 3: View framework controls
      await waitFor(() => {
        expect(screen.getByText('ISO 27001 Framework')).toBeInTheDocument();
      });

      const viewControlsButton = screen.getByRole('button', { name: /view controls/i });
      await user.click(viewControlsButton);

      // Verify controls were loaded
      expect(frameworks.getControls).toHaveBeenCalledWith('framework-123');

      await waitFor(() => {
        expect(screen.getByText('Access Control')).toBeInTheDocument();
        expect(screen.getByText('Data Encryption')).toBeInTheDocument();
      });
    });
  });

  describe('Document Upload and Evidence Management Workflow', () => {
    it('should upload documents and manage evidence throughout assessment process', async () => {
      const { documents, evidence } = (await import('../../services/apiEndpoints')).default;
      
      // Mock API responses
      documents.upload.mockResolvedValue({
        data: { success: true, data: { id: 'doc-123', name: 'policy.pdf', size: 1024 } }
      });
      
      evidence.getAll.mockResolvedValue({
        data: { success: true, data: [] }
      });
      
      evidence.upload.mockResolvedValue({
        data: { success: true, data: { id: 'evidence-123', title: 'Uploaded Policy', status: 'valid' } }
      });

      const user = userEvent.setup();

      // Step 1: Navigate to evidence management
      renderWithProviders(
        <MemoryRouter initialEntries={['/evidence']}>
          <Routes>
            <Route path="/evidence" element={<Evidence />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Evidence Management')).toBeInTheDocument();
      });

      // Step 2: Upload document
      const fileInput = screen.getByLabelText(/upload file/i);
      const mockFile = createMockFile('security-policy.pdf', 'PDF content', 'application/pdf');
      
      await user.upload(fileInput, mockFile);

      // Verify file was uploaded
      expect(evidence.upload).toHaveBeenCalled();

      // Step 3: Verify evidence was created
      await waitFor(() => {
        expect(screen.getByText('Uploaded Policy')).toBeInTheDocument();
      });

      // Step 4: Link evidence to assessment (if applicable)
      const linkToAssessmentButton = screen.getByRole('button', { name: /link to assessment/i });
      await user.click(linkToAssessmentButton);

      // Select assessment from dropdown
      const assessmentSelect = screen.getByLabelText(/select assessment/i);
      await user.selectOptions(assessmentSelect, 'assessment-123');

      const confirmLinkButton = screen.getByRole('button', { name: /link/i });
      await user.click(confirmLinkButton);
    });
  });

  describe('Multi-user Collaboration Workflow', () => {
    it('should handle team collaboration on assessments with different roles', async () => {
      const { assessments, users } = (await import('../../services/apiEndpoints')).default;
      
      // Mock different user roles
      const adminUser = { ...generateMockUser(), role: 'admin', id: 'admin-123' };
      const reviewerUser = { ...generateMockUser(), role: 'reviewer', id: 'reviewer-456' };
      const analystUser = { ...generateMockUser(), role: 'analyst', id: 'analyst-789' };
      
      users.getAll.mockResolvedValue({
        data: { success: true, data: [adminUser, reviewerUser, analystUser] }
      });
      
      assessments.getAll.mockResolvedValue({
        data: { success: true, data: [generateMockAssessment()] }
      });
      
      assessments.getProgress.mockResolvedValue({
        data: { success: true, data: { completed: 1, total: 2, percentage: 50 } }
      });

      const user = userEvent.setup();

      // Step 1: Admin assigns assessment to analyst
      renderWithProviders(
        <MemoryRouter initialEntries={['/assessments']}>
          <Routes>
            <Route path="/assessments" element={<AdvancedAssessmentManager />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Assessment Management')).toBeInTheDocument();
      });

      // Select assessment
      const assessmentCard = screen.getByText('SOX Compliance Assessment');
      await user.click(assessmentCard);

      // Assign to analyst
      const assignButton = screen.getByRole('button', { name: /assign/i });
      await user.click(assignButton);

      // Select analyst from dropdown
      const userSelect = screen.getByLabelText(/select user/i);
      await user.selectOptions(userSelect, 'analyst-789');

      const confirmAssignButton = screen.getByRole('button', { name: /assign/i });
      await user.click(confirmAssignButton);

      // Step 2: Analyst completes assessment
      // Simulate analyst login and completion
      const completeButton = screen.getByRole('button', { name: /complete/i });
      await user.click(completeButton);

      // Step 3: Reviewer reviews completed assessment
      const reviewButton = screen.getByRole('button', { name: /review/i });
      await user.click(reviewButton);

      // Add review comments
      const commentsTextarea = screen.getByPlaceholderText(/review comments/i);
      await user.type(commentsTextarea, 'Assessment completed satisfactorily. All controls verified.');

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      // Verify collaboration workflow completed
      expect(screen.getByText('Assessment Approved')).toBeInTheDocument();
    });
  });

  describe('Compliance Reporting Workflow', () => {
    it('should generate comprehensive compliance report with all supporting data', async () => {
      const { dashboard, assessments, frameworks, risks } = (await import('../../services/apiEndpoints')).default;
      
      // Mock comprehensive data for report
      dashboard.getKPIs.mockResolvedValue({
        data: { success: true, data: generateMockKPIs() }
      });
      
      assessments.getAll.mockResolvedValue({
        data: { success: true, data: [generateMockAssessment()] }
      });
      
      frameworks.getAll.mockResolvedValue({
        data: { success: true, data: [generateMockFramework()] }
      });
      
      risks.getAll.mockResolvedValue({
        data: { success: true, data: [generateMockRisk()] }
      });

      const user = userEvent.setup();

      // Step 1: Navigate to reports section
      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<EnhancedDashboard />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Step 2: Generate compliance report
      const generateReportButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateReportButton);

      // Select report type
      const reportTypeSelect = screen.getByLabelText(/report type/i);
      await user.selectOptions(reportTypeSelect, 'compliance-summary');

      // Select date range
      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-01-01');

      const endDateInput = screen.getByLabelText(/end date/i);
      await user.type(endDateInput, '2024-12-31');

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      // Step 3: Verify report contains all required data
      await waitFor(() => {
        expect(screen.getByText('Compliance Summary Report')).toBeInTheDocument();
      });

      // Check report sections
      expect(screen.getByText('Assessment Summary')).toBeInTheDocument();
      expect(screen.getByText('Framework Compliance')).toBeInTheDocument();
      expect(screen.getByText('Risk Overview')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();

      // Step 4: Export report
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Select export format
      const formatSelect = screen.getByLabelText(/export format/i);
      await user.selectOptions(formatSelect, 'pdf');

      const downloadButton = screen.getByRole('button', { name: /download/i });
      await user.click(downloadButton);

      // Verify report generation completed
      expect(screen.getByText('Report Generated Successfully')).toBeInTheDocument();
    });
  });
});