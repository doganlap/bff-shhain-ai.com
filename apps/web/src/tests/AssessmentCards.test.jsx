/**
 * REACT TESTING LIBRARY - ASSESSMENT CARD COMPONENTS
 * ==================================================
 *
 * Tests for 7 Card Components:
 * 1. MaturityBadge - Maturity levels 0-5 with bilingual labels
 * 2. StatsCard - KPI metrics with trends
 * 3. FrameworkCard - Framework information with progress
 * 4. ControlCard - Individual control with maturity & evidence
 * 5. GapCard - Gap analysis with severity classification
 * 6. ScoreCard - Circular progress with maturity visualization
 * 7. AssessmentSummaryCard - Gradient card with multiple metrics
 *
 * Run: npm test -- AssessmentCards.test.jsx
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  MaturityBadge,
  StatsCard,
  FrameworkCard,
  ControlCard,
  GapCard,
  ScoreCard,
  AssessmentSummaryCard
} from '../components/AssessmentCards';

// ============================================
// TEST 1: MaturityBadge Component
// ============================================

describe('MaturityBadge Component', () => {
  test('renders Level 0 (Non-Existent) badge correctly', () => {
    render(<MaturityBadge level={0} size="md" />);

    // Check for English label
    expect(screen.getByText('L0: Non-Existent')).toBeInTheDocument();

    // Check for Arabic label
    expect(screen.getByText('المستوى 0: غير موجود')).toBeInTheDocument();

    // Check for score (0%)
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('renders Level 3 (Defined) badge correctly', () => {
    render(<MaturityBadge level={3} size="md" />);

    expect(screen.getByText('L3: Defined')).toBeInTheDocument();
    expect(screen.getByText('المستوى 3: محدد')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  test('renders Level 5 (Optimizing) badge correctly', () => {
    render(<MaturityBadge level={5} size="md" />);

    expect(screen.getByText('L5: Optimizing')).toBeInTheDocument();
    expect(screen.getByText('المستوى 5: محسّن')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('validates maturity level scores', () => {
    const levels = [
      { level: 0, expectedScore: '0%' },
      { level: 1, expectedScore: '20%' },
      { level: 2, expectedScore: '40%' },
      { level: 3, expectedScore: '60%' },
      { level: 4, expectedScore: '80%' },
      { level: 5, expectedScore: '100%' }
    ];

    levels.forEach(({ level, expectedScore }) => {
      const { unmount } = render(<MaturityBadge level={level} size="md" />);
      expect(screen.getByText(expectedScore)).toBeInTheDocument();
      unmount();
    });
  });

  test('renders different sizes correctly', () => {
    const { container: smallContainer } = render(<MaturityBadge level={3} size="sm" />);
    const { container: mediumContainer } = render(<MaturityBadge level={3} size="md" />);
    const { container: largeContainer } = render(<MaturityBadge level={3} size="lg" />);

    expect(smallContainer.firstChild).toHaveClass('text-xs');
    expect(mediumContainer.firstChild).toHaveClass('text-sm');
    expect(largeContainer.firstChild).toHaveClass('text-base');
  });
});

// ============================================
// TEST 2: StatsCard Component
// ============================================

describe('StatsCard Component', () => {
  const mockStatsData = {
    title: 'Total Controls',
    titleAr: 'إجمالي الضوابط',
    value: 125,
    subtitle: '+12 from last month',
    icon: 'Shield',
    trend: { value: 12, isPositive: true },
    color: 'blue'
  };

  test('renders title and value correctly', () => {
    render(<StatsCard {...mockStatsData} />);

    expect(screen.getByText('Total Controls')).toBeInTheDocument();
    expect(screen.getByText('إجمالي الضوابط')).toBeInTheDocument();
    expect(screen.getByText('125')).toBeInTheDocument();
  });

  test('renders subtitle correctly', () => {
    render(<StatsCard {...mockStatsData} />);

    expect(screen.getByText('+12 from last month')).toBeInTheDocument();
  });

  test('displays positive trend correctly', () => {
    render(<StatsCard {...mockStatsData} />);

    const trendElement = screen.getByText(/12/);
    expect(trendElement).toHaveClass('text-green-600');
  });

  test('displays negative trend correctly', () => {
    const negativeData = { ...mockStatsData, trend: { value: -5, isPositive: false } };
    render(<StatsCard {...negativeData} />);

    const trendElement = screen.getByText(/-5/);
    expect(trendElement).toHaveClass('text-red-600');
  });

  test('renders without trend', () => {
    const noTrendData = { ...mockStatsData, trend: null };
    render(<StatsCard {...noTrendData} />);

    expect(screen.getByText('Total Controls')).toBeInTheDocument();
    expect(screen.queryByText(/12/)).not.toBeInTheDocument();
  });
});

// ============================================
// TEST 3: FrameworkCard Component
// ============================================

describe('FrameworkCard Component', () => {
  const mockFrameworkData = {
    frameworkId: 'NCA-ECC-2.0',
    name: 'NCA Essential Cybersecurity Controls v2.0',
    nameAr: 'ضوابط الأمن السيبراني الأساسية للهيئة الوطنية',
    totalControls: 114,
    completedControls: 45,
    progress: 39.5,
    status: 'in_progress',
    dueDate: '2025-12-31',
    overallScore: 65.2,
    isMandatory: true,
    color: 'blue'
  };

  test('renders framework name and ID correctly', () => {
    render(<FrameworkCard {...mockFrameworkData} />);

    expect(screen.getByText('NCA Essential Cybersecurity Controls v2.0')).toBeInTheDocument();
    expect(screen.getByText('ضوابط الأمن السيبراني الأساسية للهيئة الوطنية')).toBeInTheDocument();
    expect(screen.getByText('NCA-ECC-2.0')).toBeInTheDocument();
  });

  test('displays control counts correctly', () => {
    render(<FrameworkCard {...mockFrameworkData} />);

    expect(screen.getByText(/45/)).toBeInTheDocument();
    expect(screen.getByText(/114/)).toBeInTheDocument();
  });

  test('displays progress percentage correctly', () => {
    render(<FrameworkCard {...mockFrameworkData} />);

    expect(screen.getByText('39.5%')).toBeInTheDocument();
  });

  test('displays overall score correctly', () => {
    render(<FrameworkCard {...mockFrameworkData} />);

    expect(screen.getByText('65.2')).toBeInTheDocument();
  });

  test('displays due date correctly', () => {
    render(<FrameworkCard {...mockFrameworkData} />);

    expect(screen.getByText(/2025-12-31/)).toBeInTheDocument();
  });

  test('shows mandatory badge for mandatory frameworks', () => {
    render(<FrameworkCard {...mockFrameworkData} />);

    expect(screen.getByText('Mandatory')).toBeInTheDocument();
  });

  test('does not show mandatory badge for optional frameworks', () => {
    const optionalData = { ...mockFrameworkData, isMandatory: false };
    render(<FrameworkCard {...optionalData} />);

    expect(screen.queryByText('Mandatory')).not.toBeInTheDocument();
  });

  test('displays correct status', () => {
    render(<FrameworkCard {...mockFrameworkData} />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });
});

// ============================================
// TEST 4: ControlCard Component
// ============================================

describe('ControlCard Component', () => {
  const mockControlData = {
    controlId: 'NCA-1-1-1',
    title: 'Information Security Policy',
    titleAr: 'سياسة أمن المعلومات',
    maturityLevel: 3,
    evidenceCount: 5,
    requiredEvidenceCount: 3,
    score: 60,
    isMandatory: true,
    status: 'pass',
    lastUpdated: '2025-11-10'
  };

  test('renders control ID and title correctly', () => {
    render(<ControlCard {...mockControlData} />);

    expect(screen.getByText('NCA-1-1-1')).toBeInTheDocument();
    expect(screen.getByText('Information Security Policy')).toBeInTheDocument();
    expect(screen.getByText('سياسة أمن المعلومات')).toBeInTheDocument();
  });

  test('displays maturity level correctly', () => {
    render(<ControlCard {...mockControlData} />);

    // MaturityBadge is rendered inside
    expect(screen.getByText('L3: Defined')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  test('displays evidence count correctly', () => {
    render(<ControlCard {...mockControlData} />);

    expect(screen.getByText(/5/)).toBeInTheDocument(); // Evidence count
    expect(screen.getByText(/3/)).toBeInTheDocument(); // Required count
  });

  test('displays score correctly', () => {
    render(<ControlCard {...mockControlData} />);

    expect(screen.getByText('60')).toBeInTheDocument();
  });

  test('shows pass status correctly', () => {
    render(<ControlCard {...mockControlData} />);

    const passElement = screen.getByText('Pass');
    expect(passElement).toHaveClass('text-green-600');
  });

  test('shows fail status correctly', () => {
    const failData = { ...mockControlData, status: 'fail' };
    render(<ControlCard {...failData} />);

    const failElement = screen.getByText('Fail');
    expect(failElement).toHaveClass('text-red-600');
  });

  test('shows mandatory badge', () => {
    render(<ControlCard {...mockControlData} />);

    expect(screen.getByText('Mandatory')).toBeInTheDocument();
  });

  test('displays last updated date', () => {
    render(<ControlCard {...mockControlData} />);

    expect(screen.getByText(/2025-11-10/)).toBeInTheDocument();
  });
});

// ============================================
// TEST 5: GapCard Component
// ============================================

describe('GapCard Component', () => {
  const mockGapData = {
    controlId: 'NCA-2-3-1',
    title: 'Network Security Controls',
    gapType: 'no_evidence',
    severity: 'critical',
    description: 'No evidence provided for network security controls implementation',
    estimatedCost: 50000,
    estimatedEffort: 160,
    recommendation: 'Implement network segmentation and firewall rules',
    affectedSystems: ['Production Network', 'DMZ']
  };

  test('renders control ID and title correctly', () => {
    render(<GapCard {...mockGapData} />);

    expect(screen.getByText('NCA-2-3-1')).toBeInTheDocument();
    expect(screen.getByText('Network Security Controls')).toBeInTheDocument();
  });

  test('displays gap type correctly', () => {
    render(<GapCard {...mockGapData} />);

    expect(screen.getByText('No Evidence')).toBeInTheDocument();
  });

  test('displays severity correctly', () => {
    render(<GapCard {...mockGapData} />);

    const severityElement = screen.getByText('Critical');
    expect(severityElement).toHaveClass('text-red-600');
  });

  test('displays description correctly', () => {
    render(<GapCard {...mockGapData} />);

    expect(screen.getByText('No evidence provided for network security controls implementation')).toBeInTheDocument();
  });

  test('displays estimated cost correctly', () => {
    render(<GapCard {...mockGapData} />);

    expect(screen.getByText(/50,000/)).toBeInTheDocument();
  });

  test('displays estimated effort correctly', () => {
    render(<GapCard {...mockGapData} />);

    expect(screen.getByText(/160/)).toBeInTheDocument();
  });

  test('displays recommendation correctly', () => {
    render(<GapCard {...mockGapData} />);

    expect(screen.getByText('Implement network segmentation and firewall rules')).toBeInTheDocument();
  });

  test('displays affected systems correctly', () => {
    render(<GapCard {...mockGapData} />);

    expect(screen.getByText('Production Network')).toBeInTheDocument();
    expect(screen.getByText('DMZ')).toBeInTheDocument();
  });

  test('shows correct severity colors', () => {
    const severities = [
      { severity: 'critical', class: 'text-red-600' },
      { severity: 'high', class: 'text-orange-600' },
      { severity: 'medium', class: 'text-yellow-600' },
      { severity: 'low', class: 'text-blue-600' }
    ];

    severities.forEach(({ severity, class: className }) => {
      const { unmount } = render(<GapCard {...mockGapData} severity={severity} />);
      const severityElement = screen.getByText(severity.charAt(0).toUpperCase() + severity.slice(1));
      expect(severityElement).toHaveClass(className);
      unmount();
    });
  });
});

// ============================================
// TEST 6: ScoreCard Component
// ============================================

describe('ScoreCard Component', () => {
  const mockScoreData = {
    label: 'Overall Compliance',
    labelAr: 'الامتثال الشامل',
    score: 72.5,
    maxScore: 100,
    color: 'green',
    size: 120,
    maturityLevel: 4
  };

  test('renders label correctly', () => {
    render(<ScoreCard {...mockScoreData} />);

    expect(screen.getByText('Overall Compliance')).toBeInTheDocument();
    expect(screen.getByText('الامتثال الشامل')).toBeInTheDocument();
  });

  test('displays score correctly', () => {
    render(<ScoreCard {...mockScoreData} />);

    expect(screen.getByText('72.5')).toBeInTheDocument();
  });

  test('displays maturity level correctly', () => {
    render(<ScoreCard {...mockScoreData} />);

    expect(screen.getByText('L4: Managed')).toBeInTheDocument();
  });

  test('renders with different colors', () => {
    const colors = ['green', 'blue', 'yellow', 'red'];

    colors.forEach((color) => {
      const { container, unmount } = render(<ScoreCard {...mockScoreData} color={color} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      unmount();
    });
  });

  test('calculates percentage correctly', () => {
    render(<ScoreCard {...mockScoreData} />);

    // 72.5 / 100 = 72.5%
    expect(screen.getByText(/72.5/)).toBeInTheDocument();
  });
});

// ============================================
// TEST 7: AssessmentSummaryCard Component
// ============================================

describe('AssessmentSummaryCard Component', () => {
  const mockSummaryData = {
    title: 'NCA ECC Assessment',
    titleAr: 'تقييم ضوابط الأمن السيبراني',
    totalControls: 114,
    completedControls: 45,
    passedControls: 38,
    failedControls: 7,
    overallScore: 65.2,
    progress: 39.5,
    status: 'in_progress',
    dueDate: '2025-12-31'
  };

  test('renders title correctly', () => {
    render(<AssessmentSummaryCard {...mockSummaryData} />);

    expect(screen.getByText('NCA ECC Assessment')).toBeInTheDocument();
    expect(screen.getByText('تقييم ضوابط الأمن السيبراني')).toBeInTheDocument();
  });

  test('displays control counts correctly', () => {
    render(<AssessmentSummaryCard {...mockSummaryData} />);

    expect(screen.getByText(/45/)).toBeInTheDocument(); // Completed
    expect(screen.getByText(/114/)).toBeInTheDocument(); // Total
    expect(screen.getByText(/38/)).toBeInTheDocument(); // Passed
    expect(screen.getByText(/7/)).toBeInTheDocument(); // Failed
  });

  test('displays overall score correctly', () => {
    render(<AssessmentSummaryCard {...mockSummaryData} />);

    expect(screen.getByText('65.2')).toBeInTheDocument();
  });

  test('displays progress correctly', () => {
    render(<AssessmentSummaryCard {...mockSummaryData} />);

    expect(screen.getByText('39.5%')).toBeInTheDocument();
  });

  test('displays status correctly', () => {
    render(<AssessmentSummaryCard {...mockSummaryData} />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  test('displays due date correctly', () => {
    render(<AssessmentSummaryCard {...mockSummaryData} />);

    expect(screen.getByText(/2025-12-31/)).toBeInTheDocument();
  });

  test('shows correct status colors', () => {
    const statuses = [
      { status: 'completed', class: 'text-green-600' },
      { status: 'in_progress', class: 'text-blue-600' },
      { status: 'not_started', class: 'text-gray-600' }
    ];

    statuses.forEach(({ status, class: className }) => {
      const { unmount } = render(<AssessmentSummaryCard {...mockSummaryData} status={status} />);
      const statusText = status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const statusElement = screen.getByText(statusText);
      expect(statusElement).toHaveClass(className);
      unmount();
    });
  });
});

// ============================================
// TEST 8: Integration Tests
// ============================================

describe('Card Components Integration', () => {
  test('all card components render together without conflicts', () => {
    const { container } = render(
      <div>
        <MaturityBadge level={3} size="md" />
        <StatsCard
          title="Total Controls"
          titleAr="إجمالي الضوابط"
          value={125}
          icon="Shield"
          color="blue"
        />
        <FrameworkCard
          frameworkId="NCA-ECC-2.0"
          name="NCA Essential Cybersecurity Controls"
          nameAr="ضوابط الأمن السيبراني الأساسية"
          totalControls={114}
          completedControls={45}
          progress={39.5}
          status="in_progress"
        />
        <ControlCard
          controlId="NCA-1-1-1"
          title="Information Security Policy"
          titleAr="سياسة أمن المعلومات"
          maturityLevel={3}
          evidenceCount={5}
          score={60}
          status="pass"
        />
        <GapCard
          controlId="NCA-2-3-1"
          title="Network Security Controls"
          gapType="no_evidence"
          severity="critical"
          estimatedCost={50000}
          estimatedEffort={160}
        />
        <ScoreCard
          label="Overall Compliance"
          labelAr="الامتثال الشامل"
          score={72.5}
          maxScore={100}
          color="green"
        />
        <AssessmentSummaryCard
          title="NCA ECC Assessment"
          titleAr="تقييم ضوابط الأمن السيبراني"
          totalControls={114}
          completedControls={45}
          overallScore={65.2}
          progress={39.5}
          status="in_progress"
        />
      </div>
    );

    expect(container).toMatchSnapshot();
  });
});
