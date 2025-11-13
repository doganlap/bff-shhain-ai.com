import React, { useState, useEffect } from 'react';
import { BarChart3, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiServices } from '../../services/api';

const Dashboard = () => {
  const { state } = useApp();
  const language = state?.language ?? 'en';
  const isRTL = state?.isRTL ?? false;
  const [metrics, setMetrics] = useState({
    totalControls: 0,
    activeRisks: 0,
    complianceScore: 0,
    evidenceItems: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiServices.dashboard.getStats()
      .then(({ data }) => {
        const next = {
          totalControls: data?.controls?.total ?? data?.controls_total ?? 0,
          activeRisks: data?.risks?.active ?? data?.active_risks ?? 0,
          complianceScore: data?.compliance?.score ?? data?.compliance_score ?? 0,
          evidenceItems: data?.evidence?.total ?? data?.evidence_total ?? 0
        };
        if (mounted) setMetrics(next);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const title = language === 'ar' ? '???? ??????' : 'Dashboard';
  const subtitle = language === 'ar' ? '???? ???? ??? ??????? ???????? ?????????' : 'Governance, Risk & Compliance Overview';

  return (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h1 className={`text-3xl font-bold text-white mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{title}</h1>
        <p className={`text-gray-200 ${isRTL ? 'text-right' : 'text-left'}`}>{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Total Controls</p>
              <p className="text-2xl font-bold text-white">{loading ? '—' : metrics.totalControls}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="glass rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Active Risks</p>
              <p className="text-2xl font-bold text-white">{loading ? '—' : metrics.activeRisks}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="glass rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Compliance Score</p>
              <p className="text-2xl font-bold text-white">{loading ? '—' : `${metrics.complianceScore}%`}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="glass rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Evidence Items</p>
              <p className="text-2xl font-bold text-white">{loading ? '—' : metrics.evidenceItems}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
