import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdvancedAppShell from '../../components/layout/AdvancedAppShell';

// Import main pages
import EnhancedDashboard from '../dashboard/EnhancedDashboard';
import AdvancedAssessmentManager from '../../components/AdvancedAssessmentManager';
import AdvancedFrameworkManager from '../../components/AdvancedFrameworkManager';
import RiskManagementPage from '../grc-modules/RiskManagementPage';
import EvidencePage from '../grc-modules/Evidence';
import ComplianceTrackingModuleEnhanced from '../grc-modules/ComplianceTrackingModuleEnhanced';
import Organizations from '../organizations/Organizations';
import ReportsPage from '../reports/ReportsPage';

/**
 * POC App Layout - Protected POC environment
 * Route: /poc/app/*
 * Validates POC session and provides full app access
 */
const PocAppLayout = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);

  const validatePocSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        navigate('/poc/request');
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

      // Validate it's a POC tenant
      if (data.tenant?.type !== 'poc') {
        toast.error('هذا الحساب ليس حساب POC');
        navigate('/login');
        return;
      }

      setSessionInfo(data);
      setIsValidating(false);

    } catch (error) {
      console.error('POC session validation error:', error);
      toast.error('جلسة POC غير صالحة');
      localStorage.removeItem('accessToken');
      navigate('/poc/request');
    }
  }, [navigate]);

  useEffect(() => {
    validatePocSession();
  }, [validatePocSession]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ التحقق من جلسة POC...</p>
        </div>
      </div>
    );
  }

  return (
    <AdvancedAppShell
      pocMode={true}
      sessionInfo={sessionInfo}
    >
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EnhancedDashboard pocMode={true} />} />
        <Route path="assessments/*" element={<AdvancedAssessmentManager />} />
        <Route path="frameworks/*" element={<AdvancedFrameworkManager />} />
        <Route path="risks/*" element={<RiskManagementPage />} />
        <Route path="evidence/*" element={<EvidencePage />} />
        <Route path="compliance/*" element={<ComplianceTrackingModuleEnhanced pocMode={true} />} />
        <Route path="organizations" element={<Organizations pocMode={true} />} />
        <Route path="reports/*" element={<ReportsPage pocMode={true} />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdvancedAppShell>
  );
};

export default PocAppLayout;
