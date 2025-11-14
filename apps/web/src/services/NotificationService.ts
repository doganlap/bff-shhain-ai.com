/**
 * Notification Service
 * Multi-channel notification system (email, in-app, webhooks, Slack)
 */

export interface NotificationConfig {
  channels: {
    email: boolean;
    inApp: boolean;
    webhook: boolean;
    slack: boolean;
  };
  webhookUrl?: string;
  slackWebhookUrl?: string;
}

export interface NotificationData {
  tenantId?: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  metadata?: any;
}

export interface SystemNotificationData {
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  metadata?: any;
}

/**
 * Multi-Channel Notification Service
 */
export class NotificationService {
  private static instance: NotificationService;
  private config: NotificationConfig;

  constructor(config?: Partial<NotificationConfig>) {
    this.config = {
      channels: {
        email: true,
        inApp: true,
        webhook: false,
        slack: false
      },
      ...config
    };
  }

  static getInstance(config?: Partial<NotificationConfig>): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(config);
    }
    return NotificationService.instance;
  }

  /**
   * Create a notification
   */
  async create(data: NotificationData): Promise<void> {
    try {
      console.log(`📢 Creating notification: ${data.title} for tenant ${data.tenantId}`);
      
      // Store in database for in-app notifications
      if (this.config.channels.inApp) {
        await this.createInAppNotification(data);
      }
      
      // Send webhook if configured
      if (this.config.channels.webhook && this.config.webhookUrl) {
        await this.sendWebhook(data);
      }
      
      // Send Slack notification if configured
      if (this.config.channels.slack && this.config.slackWebhookUrl) {
        await this.sendSlackNotification(data);
      }
      
    } catch (error) {
      console.error('❌ Failed to create notification:', error);
    }
  }

  /**
   * Create system notification
   */
  async createSystemNotification(data: SystemNotificationData): Promise<void> {
    try {
      console.log(`🔔 System notification: ${data.title}`);
      
      // Store system notification
      await this.storeSystemNotification(data);
      
      // Send to monitoring channels if critical
      if (data.priority === 'critical') {
        await this.sendCriticalAlert(data);
      }
      
    } catch (error) {
      console.error('❌ Failed to create system notification:', error);
    }
  }

  /**
   * Store in-app notification
   */
  private async createInAppNotification(data: NotificationData): Promise<void> {
    // This would typically store in database
    console.log(`💾 Storing in-app notification: ${data.title}`);
  }

  /**
   * Store system notification
   */
  private async storeSystemNotification(data: SystemNotificationData): Promise<void> {
    // This would typically store in database
    console.log(`💾 Storing system notification: ${data.title}`);
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(data: NotificationData): Promise<void> {
    try {
      const response = await fetch(this.config.webhookUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'notification',
          data: data,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }
      
      console.log(`🔗 Webhook notification sent: ${data.title}`);
    } catch (error) {
      console.error('❌ Webhook notification failed:', error);
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(data: NotificationData): Promise<void> {
    try {
      const slackPayload = {
        text: data.title,
        attachments: [{
          color: this.getSlackColor(data.urgency),
          fields: [
            {
              title: 'Message',
              value: data.message,
              short: false
            },
            {
              title: 'Urgency',
              value: data.urgency.toUpperCase(),
              short: true
            },
            {
              title: 'Tenant',
              value: data.tenantId || 'System',
              short: true
            }
          ],
          ts: Math.floor(Date.now() / 1000)
        }]
      };
      
      const response = await fetch(this.config.slackWebhookUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackPayload)
      });
      
      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
      }
      
      console.log(`💬 Slack notification sent: ${data.title}`);
    } catch (error) {
      console.error('❌ Slack notification failed:', error);
    }
  }

  /**
   * Send critical alert
   */
  private async sendCriticalAlert(data: SystemNotificationData): Promise<void> {
    console.log(`🚨 CRITICAL ALERT: ${data.title} - ${data.message}`);
    
    // Send to all configured channels for critical alerts
    if (this.config.slackWebhookUrl) {
      await this.sendSlackNotification({
        type: data.type,
        title: `🚨 CRITICAL: ${data.title}`,
        message: data.message,
        urgency: 'critical'
      });
    }
  }

  /**
   * Get Slack color based on urgency
   */
  private getSlackColor(urgency: string): string {
    const colors = {
      low: '#36A64F',      // Green
      medium: '#FF9500',   // Orange
      high: '#FF6B35',     // Red-Orange
      critical: '#FF0000'  // Red
    };
    
    return colors[urgency as keyof typeof colors] || colors.medium;
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<any> {
    // This would typically query database for stats
    return {
      totalNotifications: 0,
      byUrgency: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      byChannel: {
        email: 0,
        inApp: 0,
        webhook: 0,
        slack: 0
      }
    };
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      channels: this.config.channels,
      webhookConfigured: !!this.config.webhookUrl,
      slackConfigured: !!this.config.slackWebhookUrl
    };
  }
}

export default NotificationService;
