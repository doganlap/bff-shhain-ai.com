import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdvancedAppShell from '../../components/layout/AdvancedAppShell';

// Import main pages
import EnhancedDashboard from '../dashboard/EnhancedDashboard';
import AdvancedAssessmentManager from '../../components/AdvancedAssessmentManager';
import AdvancedFrameworkManager from '../../components/AdvancedFrameworkManager';
import RiskManagementPage from '../grc-modules/RiskManagementPage';
import EvidencePage from '../grc-modules/Evidence';

/**
 * Demo App Layout - Protected demo environment
 * Route: /demo/app/*
 * Validates demo session and provides full app access
 */
const DemoAppLayout = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    validateDemoSession();
  }, []);

  const validateDemoSession = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        navigate('/demo/register');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Invalid session');
      }

      const data = await response.json();

      // Validate it's a demo tenant
      if (data.tenant?.type !== 'demo') {
        toast.error('هذا الحساب ليس حساب تجربة');
        navigate('/login');
        return;
      }

      setSessionInfo(data);
      setIsValidating(false);

    } catch (error) {
      console.error('Demo session validation error:', error);
      toast.error('جلسة التجربة غير صالحة');
      localStorage.removeItem('accessToken');
      navigate('/demo/register');
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ التحقق من جلسة التجربة...</p>
        </div>
      </div>
    );
  }

  return (
    <AdvancedAppShell
      demoMode={true}
      sessionInfo={sessionInfo}
    >
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EnhancedDashboard demoMode={true} />} />
        <Route path="assessments/*" element={<AdvancedAssessmentManager />} />
        <Route path="frameworks/*" element={<AdvancedFrameworkManager />} />
        <Route path="risks/*" element={<RiskManagementPage />} />
        <Route path="evidence/*" element={<EvidencePage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdvancedAppShell>
  );
};

export default DemoAppLayout;
