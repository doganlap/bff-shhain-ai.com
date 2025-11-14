/**
 * Usage Service
 * Analytics, compliance checking, and usage reporting
 */

import { DatabaseService } from './DatabaseService';

export interface UsageMetrics {
  usersActive: number;
  assessmentsCreated: number;
  reportsGenerated: number;
  storageUsedMb: number;
  apiCallsMade: number;
  featuresUsed: string[];
}

export interface UsageLimits {
  maxUsers: number;
  maxStorage: number;
  maxApiCalls: number;
  maxAssessments: number;
}

export interface WeeklyReport {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: UsageMetrics;
  trends: {
    usersGrowth: number;
    assessmentsGrowth: number;
    storageGrowth: number;
  };
  recommendations: string[];
}

/**
 * Usage Analytics and Compliance Service
 */
export class UsageService {
  private static instance: UsageService;
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): UsageService {
    if (!UsageService.instance) {
      UsageService.instance = new UsageService();
    }
    return UsageService.instance;
  }

  /**
   * Aggregate daily usage for a tenant
   */
  async aggregateDailyUsage(params: {
    tenantId: string;
    licenseId: string;
    date: Date;
  }): Promise<UsageMetrics> {
    try {
      const { tenantId, licenseId, date } = params;
      const dateStr = date.toISOString().split('T')[0];

      // Get active users for the day
      const usersResult = await this.db.query(`
        SELECT COUNT(DISTINCT user_id) as active_users
        FROM user_sessions
        WHERE tenant_id = $1
          AND DATE(created_at) = $2
      `, [tenantId, dateStr]);

      // Get assessments created
      const assessmentsResult = await this.db.query(`
        SELECT COUNT(*) as assessments_created
        FROM assessments
        WHERE organization_id = $1
          AND DATE(created_at) = $2
      `, [tenantId, dateStr]);

      // Get reports generated
      const reportsResult = await this.db.query(`
        SELECT COUNT(*) as reports_generated
        FROM reports
        WHERE tenant_id = $1
          AND DATE(created_at) = $2
      `, [tenantId, dateStr]);

      // Calculate storage usage
      const storageResult = await this.db.query(`
        SELECT COALESCE(SUM(file_size_mb), 0) as storage_used
        FROM tenant_files
        WHERE tenant_id = $1
          AND created_at <= $2
      `, [tenantId, date]);

      // Get API calls made
      const apiResult = await this.db.query(`
        SELECT COUNT(*) as api_calls
        FROM api_usage_logs
        WHERE tenant_id = $1
          AND DATE(created_at) = $2
      `, [tenantId, dateStr]);

      // Get features used
      const featuresResult = await this.db.query(`
        SELECT DISTINCT feature_name
        FROM feature_usage_logs
        WHERE tenant_id = $1
          AND DATE(created_at) = $2
      `, [tenantId, dateStr]);

      return {
        usersActive: parseInt(usersResult.rows[0]?.active_users || '0'),
        assessmentsCreated: parseInt(assessmentsResult.rows[0]?.assessments_created || '0'),
        reportsGenerated: parseInt(reportsResult.rows[0]?.reports_generated || '0'),
        storageUsedMb: parseFloat(storageResult.rows[0]?.storage_used || '0'),
        apiCallsMade: parseInt(apiResult.rows[0]?.api_calls || '0'),
        featuresUsed: featuresResult.rows.map(row => row.feature_name)
      };

    } catch (error) {
      console.error('❌ Failed to aggregate daily usage:', error);
      throw error;
    }
  }

  /**
   * Check usage limits and send warnings
   */
  async checkUsageLimits(tenantId: string, licenseId: string): Promise<void> {
    try {
      // Get license limits
      const limitsResult = await this.db.query(`
        SELECT 
          tl.max_users,
          l.max_storage_mb,
          l.max_api_calls_monthly,
          l.max_assessments_monthly
        FROM tenant_licenses tl
        JOIN licenses l ON tl.license_id = l.id
        WHERE tl.tenant_id = $1 AND tl.license_id = $2
          AND tl.status = 'active'
      `, [tenantId, licenseId]);

      if (limitsResult.rows.length === 0) {
        return; // No active license found
      }

      const limits = limitsResult.rows[0];

      // Get current usage
      const currentUsage = await this.getCurrentUsage(tenantId);

      // Check each limit
      await this.checkUserLimit(tenantId, currentUsage.usersActive, limits.max_users);
      await this.checkStorageLimit(tenantId, currentUsage.storageUsedMb, limits.max_storage_mb);
      await this.checkApiLimit(tenantId, currentUsage.apiCallsMade, limits.max_api_calls_monthly);
      await this.checkAssessmentLimit(tenantId, currentUsage.assessmentsCreated, limits.max_assessments_monthly);

    } catch (error) {
      console.error('❌ Failed to check usage limits:', error);
    }
  }

  /**
   * Generate weekly usage report
   */
  async generateWeeklyReport(tenantId: string): Promise<WeeklyReport> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get current week metrics
      const currentMetrics = await this.getWeeklyMetrics(tenantId, startDate, endDate);

      // Get previous week metrics for trends
      const prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const prevMetrics = await this.getWeeklyMetrics(tenantId, prevStartDate, startDate);

      // Calculate trends
      const trends = {
        usersGrowth: this.calculateGrowth(prevMetrics.usersActive, currentMetrics.usersActive),
        assessmentsGrowth: this.calculateGrowth(prevMetrics.assessmentsCreated, currentMetrics.assessmentsCreated),
        storageGrowth: this.calculateGrowth(prevMetrics.storageUsedMb, currentMetrics.storageUsedMb)
      };

      // Generate recommendations
      const recommendations = await this.generateRecommendations(tenantId, currentMetrics, trends);

      return {
        tenantId,
        period: { start: startDate, end: endDate },
        metrics: currentMetrics,
        trends,
        recommendations
      };

    } catch (error) {
      console.error('❌ Failed to generate weekly report:', error);
      throw error;
    }
  }

  /**
   * Get current usage for a tenant
   */
  private async getCurrentUsage(tenantId: string): Promise<UsageMetrics> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return await this.aggregateDailyUsage({
      tenantId,
      licenseId: '', // We'll get this from the query
      date: today
    });
  }

  /**
   * Get weekly metrics
   */
  private async getWeeklyMetrics(tenantId: string, startDate: Date, endDate: Date): Promise<UsageMetrics> {
    try {
      const result = await this.db.query(`
        SELECT 
          AVG(users_active) as avg_users,
          SUM(assessments_created) as total_assessments,
          SUM(reports_generated) as total_reports,
          MAX(storage_used_mb) as max_storage,
          SUM(api_calls_made) as total_api_calls
        FROM tenant_license_usage
        WHERE tenant_id = $1
          AND usage_date BETWEEN $2 AND $3
      `, [tenantId, startDate, endDate]);

      const row = result.rows[0] || {};

      return {
        usersActive: Math.round(parseFloat(row.avg_users || '0')),
        assessmentsCreated: parseInt(row.total_assessments || '0'),
        reportsGenerated: parseInt(row.total_reports || '0'),
        storageUsedMb: parseFloat(row.max_storage || '0'),
        apiCallsMade: parseInt(row.total_api_calls || '0'),
        featuresUsed: [] // Would need separate query
      };

    } catch (error) {
      console.error('❌ Failed to get weekly metrics:', error);
      return {
        usersActive: 0,
        assessmentsCreated: 0,
        reportsGenerated: 0,
        storageUsedMb: 0,
        apiCallsMade: 0,
        featuresUsed: []
      };
    }
  }

  /**
   * Calculate growth percentage
   */
  private calculateGrowth(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Generate usage recommendations
   */
  private async generateRecommendations(
    tenantId: string, 
    metrics: UsageMetrics, 
    trends: any
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // User growth recommendations
    if (trends.usersGrowth > 50) {
      recommendations.push('Consider upgrading your user limit to accommodate rapid growth');
    } else if (trends.usersGrowth < -20) {
      recommendations.push('User activity has decreased - consider user engagement initiatives');
    }

    // Storage recommendations
    if (metrics.storageUsedMb > 1000) { // 1GB threshold
      recommendations.push('Storage usage is high - consider archiving old files');
    }

    // Assessment recommendations
    if (metrics.assessmentsCreated === 0) {
      recommendations.push('No assessments created this week - explore our assessment templates');
    } else if (trends.assessmentsGrowth > 100) {
      recommendations.push('High assessment activity - consider workflow automation features');
    }

    // API usage recommendations
    if (metrics.apiCallsMade > 10000) {
      recommendations.push('High API usage detected - monitor for optimization opportunities');
    }

    return recommendations;
  }

  /**
   * Check individual usage limits
   */
  private async checkUserLimit(tenantId: string, current: number, limit: number): Promise<void> {
    const percentage = (current / limit) * 100;
    
    if (percentage >= 90) {
      await this.db.logEvent({
        type: 'usage_limit_warning',
        tenantId,
        details: { type: 'users', current, limit, percentage },
        severity: 'high'
      });
    }
  }

  private async checkStorageLimit(tenantId: string, current: number, limit: number): Promise<void> {
    const percentage = (current / limit) * 100;
    
    if (percentage >= 85) {
      await this.db.logEvent({
        type: 'usage_limit_warning',
        tenantId,
        details: { type: 'storage', current, limit, percentage },
        severity: percentage >= 95 ? 'critical' : 'high'
      });
    }
  }

  private async checkApiLimit(tenantId: string, current: number, limit: number): Promise<void> {
    const percentage = (current / limit) * 100;
    
    if (percentage >= 80) {
      await this.db.logEvent({
        type: 'usage_limit_warning',
        tenantId,
        details: { type: 'api_calls', current, limit, percentage },
        severity: percentage >= 95 ? 'critical' : 'medium'
      });
    }
  }

  private async checkAssessmentLimit(tenantId: string, current: number, limit: number): Promise<void> {
    const percentage = (current / limit) * 100;
    
    if (percentage >= 90) {
      await this.db.logEvent({
        type: 'usage_limit_warning',
        tenantId,
        details: { type: 'assessments', current, limit, percentage },
        severity: 'medium'
      });
    }
  }

  /**
   * Get usage analytics for dashboard
   */
  async getUsageAnalytics(tenantId: string, days: number = 30): Promise<any> {
    try {
      const result = await this.db.query(`
        SELECT 
          usage_date,
          users_active,
          assessments_created,
          reports_generated,
          storage_used_mb,
          api_calls_made
        FROM tenant_license_usage
        WHERE tenant_id = $1
          AND usage_date >= NOW() - INTERVAL '${days} days'
        ORDER BY usage_date ASC
      `, [tenantId]);

      return {
        daily: result.rows,
        summary: {
          totalUsers: Math.max(...result.rows.map(r => r.users_active || 0)),
          totalAssessments: result.rows.reduce((sum, r) => sum + (r.assessments_created || 0), 0),
          totalReports: result.rows.reduce((sum, r) => sum + (r.reports_generated || 0), 0),
          currentStorage: Math.max(...result.rows.map(r => r.storage_used_mb || 0)),
          totalApiCalls: result.rows.reduce((sum, r) => sum + (r.api_calls_made || 0), 0)
        }
      };

    } catch (error) {
      console.error('❌ Failed to get usage analytics:', error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      service: 'UsageService',
      initialized: true,
      dbConnected: this.db.getConnectionStatus().isConnected
    };
  }
}

export default UsageService;
