import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  StatsCard,
  FrameworkCard,
  ControlCard,
  ScoreCard,
  AssessmentSummaryCard,
  MaturityBadge
} from '../../components/cards/AssessmentCards';
import {
  Shield, CheckCircle2, AlertTriangle, TrendingUp, FileText,
  Clock, Users, Target, Activity, ChevronRight, Download, Share2
} from 'lucide-react';

/**
 * ORGANIZATION DASHBOARD PAGE
 * ==========================
 * Main dashboard for organization showing all assessments, scores,
 * gaps, and compliance status. Uses the complete card component system.
 */

const OrganizationDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [stats, setStats] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [recentControls, setRecentControls] = useState([]);
  const [criticalGaps, setCriticalGaps] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch organization details
      const orgResponse = await fetch(`/api/organizations/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const orgData = await orgResponse.json();
      setOrganization(orgData);

      // Fetch dashboard stats
      const statsResponse = await fetch(`/api/organizations/${id}/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch assessments
      const assessmentsResponse = await fetch(`/api/organizations/${id}/assessments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const assessmentsData = await assessmentsResponse.json();
      setAssessments(assessmentsData);

      // Fetch recent controls
      const controlsResponse = await fetch(`/api/organizations/${id}/controls/recent`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const controlsData = await controlsResponse.json();
      setRecentControls(controlsData);

      // Fetch critical gaps
      const gapsResponse = await fetch(`/api/organizations/${id}/gaps?severity=critical`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const gapsData = await gapsResponse.json();
      setCriticalGaps(gapsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!organization || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Organization not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
            {organization.nameAr && (
              <p className="text-lg text-gray-600 mt-1" dir="rtl">{organization.nameAr}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {organization.sector} • {organization.city}, {organization.country}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/organizations/${id}/reports`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
            <button
              onClick={() => navigate(`/organizations/${id}/settings`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              Manage Team
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Controls"
            titleAr="إجمالي الضوابط"
            value={stats.totalControls}
            subtitle="Across all frameworks"
            icon={Shield}
            color="blue"
          />

          <StatsCard
            title="Completed"
            titleAr="مكتمل"
            value={stats.completedControls}
            subtitle={`${Math.round((stats.completedControls / stats.totalControls) * 100)}% progress`}
            icon={CheckCircle2}
            trend={stats.weeklyProgress}
            color="green"
            onClick={() => navigate(`/organizations/${id}/controls?status=completed`)}
          />

          <StatsCard
            title="Critical Gaps"
            titleAr="فجوات حرجة"
            value={stats.criticalGaps}
            subtitle="Require immediate attention"
            icon={AlertTriangle}
            color="red"
            onClick={() => navigate(`/organizations/${id}/gaps`)}
          />

          <StatsCard
            title="Compliance Score"
            titleAr="درجة الامتثال"
            value={`${stats.overallScore.toFixed(0)}%`}
            subtitle={stats.overallScore >= 60 ? "Above target" : "Below target"}
            icon={TrendingUp}
            trend={stats.scoreImprovement}
            color={stats.overallScore >= 60 ? "green" : "red"}
          />
        </div>

        {/* Assessment Summary Card */}
        {assessments.length > 0 && (
          <AssessmentSummaryCard
            assessment={{
              title: `${organization.name} - Compliance Overview`,
              titleAr: `${organization.nameAr || organization.name} - نظرة عامة على الامتثال`,
              totalControls: stats.totalControls,
              implementedControls: stats.completedControls,
              overallScore: stats.overallScore,
              updatedAt: new Date().toISOString()
            }}
          />
        )}

        {/* Active Assessments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Active Assessments</h2>
            <button
              onClick={() => navigate(`/organizations/${id}/assessments`)}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.slice(0, 6).map(assessment => (
              <FrameworkCard
                key={assessment.id}
                framework={{
                  name: assessment.frameworkName,
                  nameAr: assessment.frameworkNameAr,
                  description: assessment.description,
                  mandatory: assessment.mandatory,
                  totalControls: assessment.totalControls,
                  completedControls: assessment.completedControls,
                  dueDate: assessment.dueDate
                }}
                onClick={() => navigate(`/assessments/${assessment.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Recent Control Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Control Activity</h2>
            <button
              onClick={() => navigate(`/organizations/${id}/controls`)}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentControls.slice(0, 6).map(control => (
              <ControlCard
                key={control.id}
                control={{
                  controlId: control.controlId,
                  title: control.title,
                  titleAr: control.titleAr,
                  maturityLevel: control.maturityLevel,
                  evidenceCount: control.evidenceCount,
                  score: control.score,
                  isMandatory: control.isMandatory
                }}
                onClick={() => navigate(`/controls/${control.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Critical Gaps */}
        {criticalGaps.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-7 h-7 text-red-600" />
                Critical Gaps Requiring Attention
              </h2>
              <button
                onClick={() => navigate(`/organizations/${id}/gaps`)}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View All Gaps
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {criticalGaps.slice(0, 3).map(gap => (
                <div
                  key={gap.id}
                  className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded uppercase">
                          CRITICAL
                        </span>
                        <span className="text-xs text-gray-500">
                          {gap.controlsAffected} controls affected
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">{gap.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{gap.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {gap.estimatedEffort}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Est. Cost: {gap.estimatedCost?.toLocaleString()} SAR
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/remediation/${gap.id}`)}
                      className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Create Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScoreCard
            title="Overall Compliance"
            score={stats.overallScore}
            maturityLevel={Math.round(stats.overallScore / 20)}
            evidenceCount={stats.totalEvidenceSubmitted}
            targetScore={60}
          />

          <ScoreCard
            title="Mandatory Controls"
            score={stats.mandatoryScore}
            maturityLevel={Math.round(stats.mandatoryScore / 20)}
            evidenceCount={stats.mandatoryEvidenceSubmitted}
            targetScore={60}
          />

          <ScoreCard
            title="Recommended Controls"
            score={stats.recommendedScore}
            maturityLevel={Math.round(stats.recommendedScore / 20)}
            evidenceCount={stats.recommendedEvidenceSubmitted}
            targetScore={60}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate(`/organizations/${id}/evidence/upload`)}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Upload Evidence</span>
            </button>

            <button
              onClick={() => navigate(`/organizations/${id}/assessments/new`)}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all"
            >
              <Shield className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-gray-700">New Assessment</span>
            </button>

            <button
              onClick={() => navigate(`/organizations/${id}/reports`)}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all"
            >
              <Download className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Generate Report</span>
            </button>

            <button
              onClick={() => navigate(`/organizations/${id}/team`)}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all"
            >
              <Users className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Manage Team</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
