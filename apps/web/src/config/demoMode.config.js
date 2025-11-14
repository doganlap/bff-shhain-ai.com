/**
 * Demo Mode Configuration
 * High-integrity offline demo mode with security measures
 */

export const DEMO_MODE_CONFIG = {
  // Security settings
  security: {
    maxDemoDuration: 24 * 60 * 60 * 1000, // 24 hours max
    requireConfirmation: true,
    showWarningBanner: true,
    blockSensitiveOperations: true,
    watermarkEnabled: true,
  },
  
  // Data integrity
  integrity: {
    validateChecksums: true,
    preventDataExport: true,
    sandboxMode: true,
    readOnlyEntities: ['users', 'permissions', 'audit-logs'],
  },
  
  // Demo user restrictions
  restrictions: {
    maxRecordsPerEntity: 100,
    disableRealAPIs: true,
    simulateDelays: true,
    mockExternalServices: true,
  },
  
  // Visual indicators
  branding: {
    showDemoBadge: true,
    demoTheme: 'demo',
    watermarkText: 'DEMO MODE - NOT FOR PRODUCTION',
    bannerColor: 'orange',
  }
};

// Demo data checksums for integrity validation
export const DEMO_DATA_CHECKSUMS = {
  regulators: 'sha256:demo-regulators-checksum',
  frameworks: 'sha256:demo-frameworks-checksum', 
  organizations: 'sha256:demo-organizations-checksum',
  stats: 'sha256:demo-stats-checksum',
};

// Secure demo mode activation key
export const DEMO_MODE_ACTIVATION = {
  key: 'demo-mode-secure-activation-' + Date.now(),
  validation: (attempt) => {
    // Simple validation - in production, use proper cryptographic validation
    return attempt && attempt.includes('demo-mode-secure');
  }
};

// Demo mode session manager
export class DemoSessionManager {
  constructor() {
    this.sessionStart = null;
    this.sessionId = null;
    this.isValid = false;
  }
  
  startSession() {
    this.sessionStart = Date.now();
    this.sessionId = 'demo-' + this.sessionStart + '-' + Math.random().toString(36).substr(2, 9);
    this.isValid = true;
    
    // Store session info securely
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('demoSession', JSON.stringify({
        id: this.sessionId,
        start: this.sessionStart,
        expires: this.sessionStart + DEMO_MODE_CONFIG.security.maxDemoDuration
      }));
    }
    
    return this.sessionId;
  }
  
  validateSession() {
    if (!this.isValid || !this.sessionStart) return false;
    
    const now = Date.now();
    const sessionDuration = now - this.sessionStart;
    
    // Check if session expired
    if (sessionDuration > DEMO_MODE_CONFIG.security.maxDemoDuration) {
      this.endSession();
      return false;
    }
    
    return true;
  }
  
  endSession() {
    this.isValid = false;
    this.sessionStart = null;
    this.sessionId = null;
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('demoSession');
    }
  }
  
  getTimeRemaining() {
    if (!this.sessionStart) return 0;
    const now = Date.now();
    const timeRemaining = (this.sessionStart + DEMO_MODE_CONFIG.security.maxDemoDuration) - now;
    return Math.max(0, timeRemaining);
  }
}

// Demo mode validator
export const validateDemoMode = (state) => {
  const errors = [];
  
  // Validate required demo data
  const requiredEntities = ['regulators', 'frameworks', 'organizations', 'stats'];
  for (const entity of requiredEntities) {
    if (!state[entity] || !Array.isArray(state[entity]) || state[entity].length === 0) {
      if (entity === 'stats' && typeof state[entity] !== 'object') {
        errors.push(`Missing required demo entity: ${entity}`);
      } else if (entity !== 'stats') {
        errors.push(`Missing required demo entity: ${entity}`);
      }
    }
  }
  
  // Validate demo user
  if (!state.user || state.user.id !== 'demo-user') {
    errors.push('Invalid demo user configuration');
  }
  
  // Validate authentication state
  if (!state.isAuthenticated) {
    errors.push('Demo mode requires authenticated state');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    timestamp: Date.now()
  };
};

// Demo mode security utils
export const demoSecurityUtils = {
  // Prevent sensitive operations in demo mode
  blockSensitiveOperations: () => {
    const sensitiveOperations = [
      'DELETE',
      'PUT /api/users',
      'POST /api/auth/change-password',
      'POST /api/admin',
      'DELETE /api/organizations'
    ];
    
    return (operation) => {
      return sensitiveOperations.some(op => 
        operation.includes(op) || operation.method === op
      );
    };
  },
  
  // Add demo watermark to data
  addDemoWatermark: (data) => {
    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        _demoMode: true,
        _demoTimestamp: Date.now()
      }));
    } else if (typeof data === 'object' && data !== null) {
      return {
        ...data,
        _demoMode: true,
        _demoTimestamp: Date.now()
      };
    }
    return data;
  },
  
  // Validate demo data integrity
  validateDataIntegrity: (data, expectedChecksum) => {
    // Simple checksum validation - in production, use proper cryptographic validation
    const dataString = JSON.stringify(data);
    const hash = btoa(dataString).substr(0, 32);
    return hash === expectedChecksum;
  }
};