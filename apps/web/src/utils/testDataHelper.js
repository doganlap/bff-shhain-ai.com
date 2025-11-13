/**
 * Test Data Helper for Enterprise APIs
 * Functions to create sample data for testing our new enterprise APIs
 */

import { apiServices } from '../services/api';

// Test data for Partners
export const createSamplePartners = async () => {
  const samplePartners = [
    {
      organization_id: 'org_1',
      name: 'TechSecure Middle East',
      type: 'technology_provider',
      contact_email: 'contact@techsecure-me.com',
      contact_phone: '+966123456789',
      website: 'https://techsecure-me.com',
      description: 'Leading cybersecurity solutions provider in the Middle East',
      tags: ['cybersecurity', 'technology', 'compliance'],
      metadata: {
        industry: 'Technology',
        size: 'medium',
        specializations: ['network_security', 'compliance_automation']
      },
      address: {
        street: 'King Fahd Road, Business District',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        postal_code: '12345'
      },
      contacts: [
        {
          name: 'Omar Hassan',
          role: 'Business Development Director',
          email: 'omar@techsecure-me.com',
          phone: '+966987654321'
        }
      ]
    },
    {
      organization_id: 'org_1',
      name: 'Gulf Compliance Consultants',
      type: 'consulting_firm',
      contact_email: 'info@gulfcompliance.com',
      contact_phone: '+966555123456',
      website: 'https://gulfcompliance.com',
      description: 'Specialized GRC consulting for financial services in the Gulf region',
      tags: ['consulting', 'compliance', 'finance'],
      metadata: {
        industry: 'Consulting',
        size: 'large',
        specializations: ['banking_compliance', 'risk_management']
      },
      address: {
        street: 'Financial District Tower',
        city: 'Dubai',
        country: 'UAE',
        postal_code: '54321'
      },
      contacts: [
        {
          name: 'Fatima Al-Zahra',
          role: 'Senior Partner',
          email: 'fatima@gulfcompliance.com',
          phone: '+971501234567'
        }
      ]
    }
  ];

  try {
    const results = [];
    for (const partner of samplePartners) {
      const response = await apiServices.partners.create(partner);
      results.push(response);
    }
    console.log('Created sample partners:', results);
    return results;
  } catch (error) {
    console.error('Error creating sample partners:', error);
    return [];
  }
};

// Test data for Notifications
export const createSampleNotifications = async () => {
  const sampleNotifications = [
    {
      recipient_id: 'user_1',
      recipient_type: 'user',
      title: 'Compliance Assessment Due',
      message: 'Your quarterly compliance assessment is due in 3 days',
      type: 'reminder',
      priority: 'high',
      channel: 'email',
      metadata: {
        assessment_id: 'assess_123',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'compliance'
      }
    },
    {
      recipient_id: 'org_1',
      recipient_type: 'organization',
      title: 'New Regulatory Update Available',
      message: 'SAMA has published new banking compliance guidelines',
      type: 'regulatory_update',
      priority: 'medium',
      channel: 'in_app',
      metadata: {
        regulator: 'SAMA',
        regulation_id: 'reg_456',
        category: 'banking'
      }
    },
    {
      recipient_id: 'user_2',
      recipient_type: 'user',
      title: 'Partner Invitation Received',
      message: 'TechSecure Middle East has invited you to collaborate on a security assessment',
      type: 'collaboration',
      priority: 'medium',
      channel: 'email',
      metadata: {
        partner_id: 'partner_123',
        collaboration_type: 'assessment',
        category: 'partnership'
      }
    }
  ];

  try {
    const results = [];
    for (const notification of sampleNotifications) {
      const response = await apiServices.notifications.create(notification);
      results.push(response);
    }
    console.log('Created sample notifications:', results);
    return results;
  } catch (error) {
    console.error('Error creating sample notifications:', error);
    return [];
  }
};

// Test data for AI Scheduler
export const createSampleSchedulerTasks = async () => {
  const sampleTasks = [
    {
      name: 'Monthly Compliance Report Generation',
      type: 'report_generation',
      description: 'Automatically generate monthly compliance reports for all active frameworks',
      schedule: {
        type: 'cron',
        expression: '0 9 1 * *', // First day of every month at 9 AM
        timezone: 'Asia/Riyadh'
      },
      task_config: {
        report_type: 'compliance_summary',
        frameworks: ['iso27001', 'sama_cybersecurity'],
        recipients: ['compliance@company.com'],
        format: 'pdf'
      },
      dependencies: [],
      priority: 'medium',
      is_ai_optimized: true,
      retry_config: {
        max_retries: 3,
        retry_delay: 300
      }
    },
    {
      name: 'Regulatory Changes Monitoring',
      type: 'data_sync',
      description: 'Monitor and sync regulatory changes from SAMA and CMA',
      schedule: {
        type: 'interval',
        interval: 'daily',
        time: '08:00'
      },
      task_config: {
        regulators: ['SAMA', 'CMA', 'CITC'],
        sync_type: 'incremental',
        notification_threshold: 'high_impact'
      },
      dependencies: [],
      priority: 'high',
      is_ai_optimized: true,
      retry_config: {
        max_retries: 5,
        retry_delay: 600
      }
    },
    {
      name: 'Partner Assessment Reminders',
      type: 'notification',
      description: 'Send assessment reminders to partners based on collaboration schedules',
      schedule: {
        type: 'trigger',
        trigger_event: 'assessment_due_soon'
      },
      task_config: {
        reminder_days: [7, 3, 1],
        template: 'partner_assessment_reminder',
        channels: ['email', 'in_app']
      },
      dependencies: ['assessment_schedule_sync'],
      priority: 'medium',
      is_ai_optimized: true
    }
  ];

  try {
    const results = [];
    for (const task of sampleTasks) {
      const response = await apiServices.aiScheduler.createTask(task);
      results.push(response);
    }
    console.log('Created sample scheduler tasks:', results);
    return results;
  } catch (error) {
    console.error('Error creating sample scheduler tasks:', error);
    return [];
  }
};

// Test data for Subscriptions
export const createSampleSubscription = async () => {
  const sampleSubscription = {
    organization_id: 'org_1',
    plan_name: 'professional',
    billing_cycle: 'monthly',
    max_users: 25,
    max_organizations: 3,
    max_assessments: 100,
    max_storage_gb: 25,
    features: [
      'advanced_assessments',
      'custom_frameworks',
      'advanced_reports',
      'workflow_automation',
      'api_access',
      'priority_support'
    ],
    price: 299.00,
    currency: 'SAR',
    starts_at: new Date().toISOString(),
    billing_contact: {
      email: 'billing@company.com',
      name: 'Finance Department',
      company: 'Sample Organization'
    }
  };

  try {
    const response = await apiServices.subscriptions.create(sampleSubscription);
    console.log('Created sample subscription:', response);

    // Record some usage data
    const usageData = [
      { metric_name: 'active_users', value: 12 },
      { metric_name: 'storage_used', value: 8.5 },
      { metric_name: 'assessments_created', value: 23 },
      { metric_name: 'api_calls', value: 1250 }
    ];

    for (const usage of usageData) {
      await apiServices.subscriptions.recordUsage(response.data.id, usage);
    }

    return response;
  } catch (error) {
    console.error('Error creating sample subscription:', error);
    return null;
  }
};

// Create all sample data
export const initializeAllTestData = async () => {
  console.log('🚀 Initializing test data for enterprise APIs...');

  try {
    const results = await Promise.allSettled([
      createSamplePartners(),
      createSampleNotifications(),
      createSampleSchedulerTasks(),
      createSampleSubscription()
    ]);

    console.log('✅ Test data initialization results:', results);
    return results;
  } catch (error) {
    console.error('❌ Error initializing test data:', error);
    return [];
  }
};

// Helper to check API connectivity
export const checkApiConnectivity = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connectivity check passed:', data);
      return true;
    }
  } catch (error) {
    console.error('❌ API connectivity check failed:', error);
    return false;
  }
  return false;
};

export default {
  createSamplePartners,
  createSampleNotifications,
  createSampleSchedulerTasks,
  createSampleSubscription,
  initializeAllTestData,
  checkApiConnectivity
};
