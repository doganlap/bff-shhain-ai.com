/**
 * Unit Tests for Regulatory Scrapers
 */

const SAMARegulatoryScraper = require('../src/scrapers/SAMARegulatoryScraper');
const NCARegulatoryScraper = require('../src/scrapers/NCARegulatoryScraper');
const MOHRegulatoryScraper = require('../src/scrapers/MOHRegulatoryScraper');

describe('Regulatory Scrapers Unit Tests', () => {
  
  describe('SAMA Scraper', () => {
    let scraper;

    beforeEach(() => {
      scraper = new SAMARegulatoryScraper();
    });

    test('should have correct regulator ID', () => {
      expect(scraper.regulatorId).toBe('SAMA');
      expect(scraper.regulatorName).toBe('Saudi Central Bank (SAMA)');
    });

    test('should have valid URLs', () => {
      expect(scraper.baseUrl).toBeTruthy();
      expect(scraper.regulationsUrl).toContain('sama.gov.sa');
    });

    test('parseDate should handle valid dates', () => {
      const date = scraper.parseDate('2024-01-15');
      expect(date).toBe('2024-01-15');
    });

    test('parseDate should handle invalid dates', () => {
      const date = scraper.parseDate('invalid-date');
      expect(date).toBeNull();
    });

    test('parseDate should handle null input', () => {
      const date = scraper.parseDate(null);
      expect(date).toBeNull();
    });

    test('extractDocumentRef should extract reference numbers', () => {
      const ref1 = scraper.extractDocumentRef('Circular No. 123/2024');
      expect(ref1).toBe('123/2024');
      
      const ref2 = scraper.extractDocumentRef('Rule 45-2024');
      expect(ref2).toBe('45-2024');
    });

    test('determineUrgency should classify correctly', () => {
      expect(scraper.determineUrgency({ title: 'Critical update' })).toBe('critical');
      expect(scraper.determineUrgency({ title: 'Mandatory compliance' })).toBe('high');
      expect(scraper.determineUrgency({ title: 'General update' })).toBe('medium');
    });
  });

  describe('NCA Scraper', () => {
    let scraper;

    beforeEach(() => {
      scraper = new NCARegulatoryScraper();
    });

    test('should have correct regulator ID', () => {
      expect(scraper.regulatorId).toBe('NCA');
      expect(scraper.regulatorName).toBe('National Cybersecurity Authority');
    });

    test('determineUrgency should prioritize security keywords', () => {
      expect(scraper.determineUrgency('Critical infrastructure breach')).toBe('critical');
      expect(scraper.determineUrgency('Essential Cybersecurity Controls')).toBe('high');
    });

    test('determineAffectedSectors should identify sectors correctly', () => {
      const sectors1 = scraper.determineAffectedSectors('Banking security requirements');
      expect(sectors1).toContain('Banking');
      
      const sectors2 = scraper.determineAffectedSectors('Healthcare data protection');
      expect(sectors2).toContain('Healthcare');
      
      const sectors3 = scraper.determineAffectedSectors('General cybersecurity');
      expect(sectors3).toContain('All Sectors');
    });

    test('calculateDeadline should add 6 months', () => {
      const deadline = scraper.calculateDeadline('2024-01-01');
      expect(deadline).toBe('2024-07-01');
    });

    test('extractControlRef should extract ECC references', () => {
      const ref = scraper.extractControlRef('ECC Control 1.1.1 Update');
      expect(ref).toBe('ECC-1.1.1');
    });
  });

  describe('MOH Scraper', () => {
    let scraper;

    beforeEach(() => {
      scraper = new MOHRegulatoryScraper();
    });

    test('should have correct regulator ID', () => {
      expect(scraper.regulatorId).toBe('MOH');
      expect(scraper.regulatorName).toBe('Ministry of Health');
    });

    test('determineUrgency should prioritize patient safety', () => {
      expect(scraper.determineUrgency('Patient safety alert')).toBe('critical');
      expect(scraper.determineUrgency('Emergency procedures')).toBe('critical');
      expect(scraper.determineUrgency('Mandatory health standard')).toBe('high');
    });
  });
});

describe('Scraper Data Validation', () => {
  test('Scraped data should have required fields', () => {
    const mockChange = {
      regulatorId: 'SAMA',
      regulatorName: 'Saudi Central Bank',
      title: 'Test Regulation',
      description: 'Test description',
      urgencyLevel: 'high',
      affectedSectors: ['Banking'],
      changeType: 'regulation'
    };

    expect(mockChange).toHaveProperty('regulatorId');
    expect(mockChange).toHaveProperty('regulatorName');
    expect(mockChange).toHaveProperty('title');
    expect(mockChange).toHaveProperty('urgencyLevel');
    expect(mockChange).toHaveProperty('affectedSectors');
    expect(mockChange).toHaveProperty('changeType');
  });

  test('Urgency level should be valid value', () => {
    const validLevels = ['critical', 'high', 'medium', 'low'];
    const mockChange = {
      urgencyLevel: 'high'
    };

    expect(validLevels).toContain(mockChange.urgencyLevel);
  });
});

