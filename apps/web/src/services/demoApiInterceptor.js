/**
 * Demo Mode API Interceptor
 * Bypasses all backend API calls and returns mock data when in demo mode
 */

// Demo data responses
const DEMO_RESPONSES = {
  '/auth/me': {
    success: true,
    data: {
      user: {
        id: 'demo-user',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@shahin-ai.com',
        role: 'admin',
        organization: 'Shahin-AI Demo',
        _demoMode: true
      }
    }
  },
  
  '/auth/login': {
    success: true,
    data: {
      user: {
        id: 'demo-user',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@shahin-ai.com',
        role: 'admin',
        organization: 'Shahin-AI Demo',
        _demoMode: true
      },
      token: 'demo-jwt-token'
    }
  },
  
  '/auth/register': {
    success: true,
    data: {
      user: {
        id: 'demo-user',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@shahin-ai.com',
        role: 'admin',
        organization: 'Shahin-AI Demo',
        _demoMode: true
      }
    }
  },
  
  '/regulators': {
    success: true,
    data: [
      { id: 1, name: 'SAMA', nameAr: 'البنك المركزي السعودي', type: 'Banking', _demoMode: true },
      { id: 2, name: 'CMA', nameAr: 'هيئة السوق المالية', type: 'Capital Markets', _demoMode: true },
      { id: 3, name: 'CITC', nameAr: 'هيئة الاتصالات وتقنية المعلومات', type: 'Telecommunications', _demoMode: true }
    ]
  },
  
  '/frameworks': {
    success: true,
    data: [
      { id: 1, name: 'ISO 27001', description: 'Information Security Management', _demoMode: true },
      { id: 2, name: 'NIST Framework', description: 'Cybersecurity Framework', _demoMode: true },
      { id: 3, name: 'SAMA Cyber Security', description: 'SAMA Cybersecurity Framework', _demoMode: true }
    ]
  },
  
  '/organizations': {
    success: true,
    data: [
      { id: 1, name: 'Demo Bank', type: 'Financial Institution', status: 'Active', _demoMode: true },
      { id: 2, name: 'Tech Corp', type: 'Technology', status: 'Active', _demoMode: true }
    ]
  },
  
  '/templates': {
    success: true,
    data: [
      { id: 1, name: 'Risk Assessment Template', type: 'Risk', _demoMode: true },
      { id: 2, name: 'Compliance Checklist', type: 'Compliance', _demoMode: true }
    ]
  },
  
  '/dashboard/stats': {
    success: true,
    data: {
      regulators: 3,
      frameworks: 3,
      controls: 156,
      assessments: 12,
      organizations: 2,
      compliance_score: 94.2,
      _demoMode: true
    }
  }
};

// Create demo mode axios instance
let demoApi = null;

export const createDemoApi = () => {
  if (demoApi) return demoApi;
  
  demoApi = {
    get: (url) => {
      console.log(`🔧 Demo API GET: ${url}`);