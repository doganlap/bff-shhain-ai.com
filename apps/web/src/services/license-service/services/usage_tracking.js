/**
 * Usage Tracking & Enforcement Service
 * Real-time license usage monitoring and feature gating
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Load configuration
const config = yaml.load(
  fs.readFileSync(path.join(__dirname, '../config/license.config.yaml'), 'utf8')
);

class UsageTrackingService {
  constructor() {
    this.enforcementConfig = config.enforcement;
    this.upsellConfig = config.upsell_signals;
  }

  /**
   * Check if tenant has entitlement to a feature
   */
  async checkEntitlement(tenantId, featureCode) {
    try {
      // Query database for license entitlement
      const result = await prisma.$queryRaw`
        SELECT check_license_entitlement(${tenantId}::uuid, ${featureCode}::varchar) as entitlement
      `;
      
      const entitlement = result[0]?.entitlement || {};
      
      if (!entitlement.licensed) {
        // Not licensed - apply enforcement
        return await this.enforceUnlicensed(tenantId, featureCode);
      }
      
      // Check if license is expired
      const endDate = new Date(entitlement.end_date);
      if (endDate < new Date()) {
        return await this.enforceExpired(tenantId, featureCode);
      }
      
      // Check if license is suspended
      if (entitlement.status === 'suspended') {
        return await this.enforceSuspended(tenantId, featureCode);
      }
      
      // Licensed and valid
      return {
        allowed: true,
        licensed: true,
        status: entitlement.status,
        license_name: entitlement.license_name,
        end_date: entitlement.end_date,
      };
    } catch (error) {
      console.error('[Usage Tracking] Error checking entitlement:', error);
      
      // Fail-open (allow access) if enforcement is not strict
      if (this.enforcementConfig.mode !== 'strict') {
        return { allowed: true, error: error.message, fallback: true };
      }
      
      // Fail-closed (deny access) if enforcement is strict
      return { allowed: false, error: error.message };
    }
  }

  /**
   * Track usage for a feature
   */
  async trackUsage(tenantId, featureCode, usageType, value = 1) {
    try {
      // Get active tenant license
      const tenantLicense = await this.getActiveLicense(tenantId);
      if (!tenantLicense) {
        console.warn(`[Usage Tracking] No active license for tenant ${tenantId}`);
        return;
      }
      
      // Get feature
      const feature = await prisma.license_features.findUnique({
        where: { feature_code: featureCode },
      });
      
      if (!feature) {
        console.warn(`[Usage Tracking] Feature not found: ${featureCode}`);
        return;
      }
      
      // Get current period
      const periodStart = this.getP

eriodStart();
      const periodEnd = this.getPeriodEnd();
      
      // Check for existing usage record
      const existing = await prisma.tenant_license_usage.findFirst({
        where: {
          tenant_license_id: tenantLicense.id,
          feature_id: feature.id,
          period_start: periodStart,
        },
      });
      
      if (existing) {
        // Update existing record
        await prisma.tenant_license_usage.update({
          where: { id: existing.id },
          data: {
            used_value: {
              increment: value,
            },
          },
        });
      } else {
        // Create new usage record
        const limitValue = await this.getFeatureLimit(tenantLicense.id, feature.id, usageType);
        
        await prisma.tenant_license_usage.create({
          data: {
            tenant_license_id: tenantLicense.id,
            feature_id: feature.id,
            period_start: periodStart,
            period_end: periodEnd,
            usage_type: usageType,
            used_value: value,
            limit_value: limitValue,
          },
        });
      }
      
      // Check for usage warnings
      await this.checkUsageWarnings(tenantLicense.id, feature.id, usageType);
      
    } catch (error) {
      console.error('[Usage Tracking] Error tracking usage:', error);
    }
  }

  /**
   * Check usage limits
   */
  async checkUsageLimit(tenantId, usageType) {
    try {
      const result = await prisma.$queryRaw`
        SELECT check_usage_limit(${tenantId}::uuid, ${usageType}::varchar) as usage_limit
      `;
      
      const limitInfo = result[0]?.usage_limit || {};
      
      if (limitInfo.is_over_limit) {
        // Over limit - check enforcement
        return await this.enforceOverLimit(tenantId, usageType, limitInfo);
      }
      
      return {
        allowed: true,
        usage_info: limitInfo,
      };
    } catch (error) {
      console.error('[Usage Tracking] Error checking usage limit:', error);
      return { allowed: true, error: error.message, fallback: true };
    }
  }

  /**
   * Enforce unlicensed access
   */
  async enforceUnlicensed(tenantId, featureCode) {
    const featureGate = this.enforcementConfig.feature_gates.find(
      fg => fg.feature_code === featureCode
    );
    
    if (!featureGate) {
      // No specific gate defined - use default
      return {
        allowed: false,
        reason: 'unlicensed',
        message: `Feature ${featureCode} requires an active license`,
        http_status: 402,
      };
    }
    
    const { enforcement_type, unlicensed_behavior, http_status, message } = featureGate;
    
    // Log access attempt
    await this.logAccessAttempt(tenantId, featureCode, 'unlicensed', false);
    
    switch (unlicensed_behavior) {
      case 'block_with_message':
        return {
          allowed: false,
          reason: 'unlicensed',
          message: message,
          http_status: http_status || 402,
          suggest_upgrade: featureGate.suggest_upgrade || false,
        };
        
      case 'redirect_to_upgrade':
        return {
          allowed: false,
          reason: 'unlicensed',
          redirect_to: featureGate.upgrade_page || '/platform/licenses/upgrade',
          http_status: 302,
        };
        
      case 'hide_ui_routes':
        return {
          allowed: false,
          reason: 'unlicensed',
          hide_routes: featureGate.routes || [],
          http_status: 403,
        };
        
      case 'allow_with_watermark':
        return {
          allowed: true,
          reason: 'unlicensed',
          watermark: true,
          limited_features: featureGate.limit_features || [],
        };
        
      default:
        return {
          allowed: enforcement_type === 'soft',
          reason: 'unlicensed',
          enforcement: enforcement_type,
        };
    }
  }

  /**
   * Enforce over-limit usage
   */
  async enforceOverLimit(tenantId, usageType, limitInfo) {
    const featureGate = this.enforcementConfig.feature_gates.find(
      fg => fg.limit_type === usageType
    );
    
    if (!featureGate) {
      return { allowed: true, warning: 'Over limit but no enforcement configured' };
    }
    
    const { enforcement_type, over_limit_behavior } = featureGate;
    
    // Log over-limit access
    await this.logAccessAttempt(tenantId, usageType, 'over_limit', enforcement_type === 'soft');
    
    // Check if we should create upsell opportunity
    if (limitInfo.percentage_used >= 80) {
      await this.createUpsellOpportunity(tenantId, usageType, limitInfo);
    }
    
    switch (over_limit_behavior) {
      case 'prevent_creation':
        return {
          allowed: false,
          reason: 'over_limit',
          message: `${usageType} limit reached (${limitInfo.used_value}/${limitInfo.limit_value})`,
          suggest_upgrade: true,
          usage_info: limitInfo,
        };
        
      case 'allow_with_warning':
        return {
          allowed: true,
          warning: `Approaching ${usageType} limit (${limitInfo.percentage_used}%)`,
          usage_info: limitInfo,
        };
        
      case 'throttle':
        return {
          allowed: true,
          throttle: true,
          throttle_rate: featureGate.throttle_rate,
          usage_info: limitInfo,
        };
        
      default:
        return {
          allowed: enforcement_type === 'soft',
          reason: 'over_limit',
          usage_info: limitInfo,
        };
    }
  }

  /**
   * Enforce expired license
   */
  async enforceExpired(tenantId, featureCode) {
    // Check if grace period is enabled
    if (this.enforcementConfig.grace_period.enabled) {
      const readonly_features = this.enforcementConfig.grace_period.readonly_features || [];
      
      if (readonly_features.includes(featureCode)) {
        return {
          allowed: true,
          readonly: true,
          reason: 'expired_grace_period',
          message: 'License expired - Read-only access',
        };
      }
    }
    
    return {
      allowed: false,
      reason: 'expired',
      message: 'License has expired. Please renew to continue.',
      http_status: 402,
    };
  }

  /**
   * Enforce suspended license
   */
  async enforceSuspended(tenantId, featureCode) {
    return {
      allowed: false,
      reason: 'suspended',
      message: 'License is suspended. Please contact support.',
      http_status: 403,
    };
  }

  /**
   * Check usage warnings and trigger alerts
   */
  async checkUsageWarnings(tenantLicenseId, featureId, usageType) {
    const usage = await prisma.tenant_license_usage.findFirst({
      where: {
        tenant_license_id: tenantLicenseId,
        feature_id: featureId,
        period_start: this.getPeriodStart(),
      },
    });
    
    if (!usage || !usage.limit_value) return;
    
    const percentage = usage.percentage_used;
    const thresholds = this.enforcementConfig.usage_warnings.thresholds;
    
    for (const threshold of thresholds) {
      if (percentage >= threshold.percentage) {
        await this.triggerUsageWarning(
          tenantLicenseId,
          usageType,
          percentage,
          threshold.level,
          threshold
        );
      }
    }
  }

  /**
   * Trigger usage warning
   */
  async triggerUsageWarning(tenantLicenseId, usageType, percentage, level, threshold) {
    console.log(`[Usage Tracking] Usage warning: ${usageType} at ${percentage}% (${level})`);
    
    // Send notifications
    // await notificationService.send({
    //   recipients: threshold.notify,
    //   template: 'usage_warning',
    //   data: { usage_type: usageType, percentage: percentage, level: level },
    // });
    
    // Create upsell opportunity if configured
    if (threshold.create_upsell_opportunity) {
      const tenantLicense = await prisma.tenant_licenses.findUnique({
        where: { id: tenantLicenseId },
      });
      
      await this.createUpsellOpportunity(tenantLicense.tenant_id, usageType, {
        percentage_used: percentage,
        trigger: 'usage_warning',
      });
    }
  }

  /**
   * Create upsell opportunity
   */
  async createUpsellOpportunity(tenantId, usageType, limitInfo) {
    if (!this.upsellConfig.enabled || !this.upsellConfig.auto_create_opportunities) {
      return;
    }
    
    console.log(`[Usage Tracking] Creating upsell opportunity for ${tenantId} (${usageType})`);
    
    // TODO: Create opportunity in opportunities table (Layer 3)
    // await opportunitiesService.create({
    //   tenant_id: tenantId,
    //   type: 'expansion',
    //   reason: `${usageType} usage at ${limitInfo.percentage_used}%`,
    //   suggested_action: 'upgrade_tier',
    // });
  }

  /**
   * Log access attempt (for audit)
   */
  async logAccessAttempt(tenantId, featureCode, reason, allowed) {
    if (!this.enforcementConfig.audit.log_failed_checks_only && allowed) {
      return; // Skip successful checks if not configured to log them
    }
    
    // Log to audit table
    console.log(`[Usage Tracking] Access attempt: ${tenantId} / ${featureCode} / ${reason} / ${allowed ? 'ALLOWED' : 'DENIED'}`);
  }

  /**
   * Get active license for tenant
   */
  async getActiveLicense(tenantId) {
    return await prisma.tenant_licenses.findFirst({
      where: {
        tenant_id: tenantId,
        status: 'active',
        end_date: {
          gte: new Date(),
        },
      },
    });
  }

  /**
   * Get feature limit for tenant
   */
  async getFeatureLimit(tenantLicenseId, featureId, usageType) {
    const map = await prisma.license_feature_map.findFirst({
      where: {
        feature_id: featureId,
      },
      include: {
        license: true,
      },
    });
    
    if (!map || map.limit_type !== usageType) {
      return null;
    }
    
    return map.limit_value;
  }

  /**
   * Get current period start date
   */
  getPeriodStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  /**
   * Get current period end date
   */
  getPeriodEnd() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
}

// Export singleton instance
module.exports = new UsageTrackingService();

// Express middleware for license enforcement
module.exports.enforcementMiddleware = (featureCode) => {
  return async (req, res, next) => {
    const tenantId = req.user?.tenant_id || req.headers['x-tenant-id'];
    
    if (!tenantId) {
      return res.status(401).json({ error: 'Tenant ID required' });
    }
    
    const service = new UsageTrackingService();
    const result = await service.checkEntitlement(tenantId, featureCode);
    
    if (!result.allowed) {
      return res.status(result.http_status || 403).json({
        error: result.reason,
        message: result.message,
        ...result,
      });
    }
    
    // Attach license info to request
    req.license = result;
    next();
  };
};
