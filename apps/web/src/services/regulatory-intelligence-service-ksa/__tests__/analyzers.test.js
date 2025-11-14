/**
 * Unit Tests for Analyzers
 */

const { classifyUrgency, getUrgencyColor } = require('../src/analyzers/UrgencyClassifier');
const { mapToSectors, shouldNotifyOrganization } = require('../src/analyzers/SectorMappingEngine');

describe('Urgency Classifier Tests', () => {
  test('should classify critical urgency correctly', () => {
    const change1 = { title: 'Critical security breach', description: '' };
    expect(classifyUrgency(change1)).toBe('critical');

    const change2 = { title: 'Urgent compliance deadline', description: 'immediate action required' };
    expect(classifyUrgency(change2)).toBe('critical');
  });

  test('should classify high urgency correctly', () => {
    const change1 = { title: 'Mandatory compliance requirement', description: '' };
    expect(classifyUrgency(change1)).toBe('high');

    const change2 = { title: 'Required update', description: 'must implement by deadline' };
    expect(classifyUrgency(change2)).toBe('high');
  });

  test('should classify medium urgency correctly', () => {
    const change1 = { title: 'Recommended guideline', description: '' };
    expect(classifyUrgency(change1)).toBe('medium');

    const change2 = { title: 'General update', description: 'please review' };
    expect(classifyUrgency(change2)).toBe('medium');
  });

  test('should classify low urgency correctly', () => {
    const change1 = { title: 'Optional advisory', description: '' };
    expect(classifyUrgency(change1)).toBe('low');

    const change2 = { title: 'Voluntary compliance', description: 'informational notice' };
    expect(classifyUrgency(change2)).toBe('low');
  });

  test('should return correct urgency colors', () => {
    expect(getUrgencyColor('critical')).toBe('#DC2626');
    expect(getUrgencyColor('high')).toBe('#EA580C');
    expect(getUrgencyColor('medium')).toBe('#CA8A04');
    expect(getUrgencyColor('low')).toBe('#16A34A');
  });

  test('should return default color for unknown urgency', () => {
    expect(getUrgencyColor('unknown')).toBe('#CA8A04'); // medium
  });
});

describe('Sector Mapping Engine Tests', () => {
  test('should map banking keywords to Banking sector', () => {
    const change = {
      title: 'New banking regulation',
      description: 'Requirements for financial institutions'
    };
    const sectors = mapToSectors(change);
    expect(sectors).toContain('Banking');
    expect(sectors).toContain('Financial Services');
  });

  test('should map healthcare keywords to Healthcare sector', () => {
    const change = {
      title: 'Hospital compliance requirements',
      description: 'Patient data protection measures'
    };
    const sectors = mapToSectors(change);
    expect(sectors).toContain('Healthcare');
  });

  test('should map technology keywords to Technology sector', () => {
    const change = {
      title: 'Data protection and AI regulations',
      description: 'Cloud computing compliance'
    };
    const sectors = mapToSectors(change);
    expect(sectors).toContain('Technology');
  });

  test('should default to All Sectors if no specific match', () => {
    const change = {
      title: 'General compliance update',
      description: 'Applies to all organizations'
    };
    const sectors = mapToSectors(change);
    expect(sectors).toContain('All Sectors');
  });

  test('should identify multiple sectors', () => {
    const change = {
      title: 'Banking and insurance compliance',
      description: 'Requirements for financial services and insurance'
    };
    const sectors = mapToSectors(change);
    expect(sectors.length).toBeGreaterThanOrEqual(2);
    expect(sectors).toContain('Banking');
    expect(sectors).toContain('Insurance');
  });

  test('shouldNotifyOrganization with matching sector', () => {
    const change = { affected_sectors: ['Banking', 'Insurance'] };
    expect(shouldNotifyOrganization(change, 'Banking')).toBe(true);
    expect(shouldNotifyOrganization(change, 'Insurance')).toBe(true);
  });

  test('shouldNotifyOrganization with non-matching sector', () => {
    const change = { affected_sectors: ['Banking'] };
    expect(shouldNotifyOrganization(change, 'Healthcare')).toBe(false);
  });

  test('shouldNotifyOrganization with All Sectors', () => {
    const change = { affected_sectors: ['All Sectors'] };
    expect(shouldNotifyOrganization(change, 'Banking')).toBe(true);
    expect(shouldNotifyOrganization(change, 'Healthcare')).toBe(true);
    expect(shouldNotifyOrganization(change, 'Any Sector')).toBe(true);
  });
});

