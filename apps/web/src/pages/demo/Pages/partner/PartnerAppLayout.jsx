import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdvancedAppShell from '../../components/layout/AdvancedAppShell';

// Import main pages
import EnhancedDashboard from '../dashboard/EnhancedDashboard';
import Organizations from '../organizations/Organizations';
import UserManagementPage from '../system/UserManagementPage';
import PartnerManagementPage from '../platform/PartnerManagementPage';

/**
 * Partner App Layout - Protected partner environment
 * Route: /partner/app/*
 */
const PartnerAppLayout = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);

  const validatePartnerSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        navigate('/partner/login');
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

      // Validate it's a partner tenant
      if (data.tenant?.type !== 'partner') {
        toast.error('هذا الحساب ليس حساب شريك');
        navigate('/login');
        return;
      }

      setSessionInfo(data);
      setIsValidating(false);

    } catch (error) {
      console.error('Partner session validation error:', error);
      toast.error('جلسة الشريك غير صالحة');
      localStorage.removeItem('accessToken');
      navigate('/partner/login');
    }
  }, [navigate]);

  useEffect(() => {
    validatePartnerSession();
  }, [validatePartnerSession]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ التحقق من جلسة الشريك...</p>
        </div>
      </div>
    );
  }

  return (
    <AdvancedAppShell
      partnerMode={true}
      sessionInfo={sessionInfo}
    >
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EnhancedDashboard partnerMode={true} />} />
        <Route path="clients" element={<Organizations partnerMode={true} />} />
        <Route path="users" element={<UserManagementPage partnerMode={true} />} />
        <Route path="partners" element={<PartnerManagementPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdvancedAppShell>
  );
};

export default PartnerAppLayout;
