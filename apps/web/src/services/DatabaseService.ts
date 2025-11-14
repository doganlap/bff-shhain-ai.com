/**
 * Database Service
 * Comprehensive database operations with logging and event tracking
 */

import { Pool, PoolClient, QueryResult } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export interface LogEventData {
  type: string;
  tenantId?: string;
  licenseId?: string;
  userId?: string;
  details?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface JobExecutionLog {
  jobName: string;
  executionId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
}

/**
 * Enterprise Database Service with Connection Pooling and Monitoring
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool;
  private config: DatabaseConfig;
  private isConnected: boolean = false;

  constructor(config?: Partial<DatabaseConfig>) {
    this.config = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'grc_master',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
      ssl: process.env.NODE_ENV === 'production',
      max: 20, // Maximum number of connections
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 2000, // 2 seconds
      ...config
    };

    this.initializePool();
  }

  static getInstance(config?: Partial<DatabaseConfig>): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService(config);
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize connection pool
   */
  private initializePool(): void {
    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      ssl: this.config.ssl,
      max: this.config.max,
      idleTimeoutMillis: this.config.idleTimeoutMillis,
      connectionTimeoutMillis: this.config.connectionTimeoutMillis
    });

    // Handle pool events
    this.pool.on('connect', (client) => {
      console.log('📊 Database client connected');
      this.isConnected = true;
    });

    this.pool.on('error', (err) => {
      console.error('❌ Database pool error:', err);
      this.isConnected = false;
    });

    this.pool.on('remove', () => {
      console.log('📊 Database client removed');
    });
  }

  /**
   * Execute a query with automatic connection management
   */
  async query(text: string, params?: any[]): Promise<QueryResult> {
    const start = Date.now();
    
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log slow queries (> 1 second)
      if (duration > 1000) {
        console.warn(`🐌 Slow query detected (${duration}ms):`, text.substring(0, 100));
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`❌ Query failed (${duration}ms):`, error.message);
      console.error('Query:', text);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Log system events for audit trail
   */
  async logEvent(eventData: LogEventData): Promise<void> {
    try {
      await this.query(`
        INSERT INTO system_events (
          event_type, tenant_id, license_id, user_id,
          details, severity, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        eventData.type,
        eventData.tenantId || null,
        eventData.licenseId || null,
        eventData.userId || null,
        JSON.stringify(eventData.details || {}),
        eventData.severity || 'medium'
      ]);
    } catch (error) {
      console.error('❌ Failed to log event:', error);
      // Don't throw - logging failures shouldn't break the main flow
    }
  }

  /**
   * Log job execution for monitoring
   */
  async logJobExecution(logData: JobExecutionLog): Promise<void> {
    try {
      if (logData.status === 'running') {
        await this.query(`
          INSERT INTO job_executions (
            job_name, execution_id, status, started_at
          ) VALUES ($1, $2, $3, $4)
        `, [
          logData.jobName,
          logData.executionId,
          logData.status,
          logData.startedAt || new Date()
        ]);
      } else {
        await this.query(`
          UPDATE job_executions SET
            status = $3,
            completed_at = $4,
            duration = $5,
            error = $6
          WHERE execution_id = $2
        `, [
          logData.jobName,
          logData.executionId,
          logData.status,
          logData.completedAt || new Date(),
          logData.duration || null,
          logData.error || null
        ]);
      }
    } catch (error) {
      console.error('❌ Failed to log job execution:', error);
    }
  }

  /**
   * Get database health metrics
   */
  async getHealthMetrics(): Promise<any> {
    try {
      const [connectionStats, tableStats, performanceStats] = await Promise.all([
        this.query(`
          SELECT 
            count(*) as total_connections,
            count(*) FILTER (WHERE state = 'active') as active_connections,
            count(*) FILTER (WHERE state = 'idle') as idle_connections
          FROM pg_stat_activity 
          WHERE datname = $1
        `, [this.config.database]),
        
        this.query(`
          SELECT 
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes,
            n_live_tup as live_tuples,
            n_dead_tup as dead_tuples
          FROM pg_stat_user_tables
          ORDER BY n_live_tup DESC
          LIMIT 10
        `),
        
        this.query(`
          SELECT 
            query,
            calls,
            total_time,
            mean_time,
            rows
          FROM pg_stat_statements
          ORDER BY total_time DESC
          LIMIT 5
        `)
      ]);

      return {
        connections: connectionStats.rows[0],
        tables: tableStats.rows,
        performance: performanceStats.rows,
        poolStatus: {
          totalCount: this.pool.totalCount,
          idleCount: this.pool.idleCount,
          waitingCount: this.pool.waitingCount
        }
      };
    } catch (error) {
      console.error('❌ Failed to get health metrics:', error);
      return {
        error: error.message,
        poolStatus: {
          totalCount: this.pool.totalCount,
          idleCount: this.pool.idleCount,
          waitingCount: this.pool.waitingCount
        }
      };
    }
  }

  /**
   * Execute database maintenance tasks
   */
  async performMaintenance(): Promise<void> {
    try {
      console.log('🔧 Starting database maintenance...');
      
      // Analyze tables for query optimization
      await this.query('ANALYZE');
      
      // Clean up old job execution logs (keep last 30 days)
      const cleanupResult = await this.query(`
        DELETE FROM job_executions 
        WHERE created_at < NOW() - INTERVAL '30 days'
      `);
      
      console.log(`🧹 Cleaned up ${cleanupResult.rowCount} old job execution records`);
      
      // Clean up old system events (keep last 90 days)
      const eventCleanup = await this.query(`
        DELETE FROM system_events 
        WHERE created_at < NOW() - INTERVAL '90 days'
      `);
      
      console.log(`🧹 Cleaned up ${eventCleanup.rowCount} old system events`);
      
      // Update table statistics
      await this.query('VACUUM ANALYZE');
      
      console.log('✅ Database maintenance completed');
      
    } catch (error) {
      console.error('❌ Database maintenance failed:', error);
      throw error;
    }
  }

  /**
   * Backup database (simplified version)
   */
  async createBackup(backupName?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = backupName || `backup_${timestamp}`;
    
    try {
      // This would typically use pg_dump or similar
      console.log(`💾 Creating database backup: ${name}`);
      
      // Log backup creation
      await this.logEvent({
        type: 'database_backup',
        details: { backupName: name, timestamp },
        severity: 'medium'
      });
      
      return name;
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): any {
    return {
      isConnected: this.isConnected,
      poolStatus: {
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount
      },
      config: {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user
      }
    };
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      console.log('📊 Database connections closed');
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get tenant usage data
   */
  async getTenantUsage(tenantId: string, days: number = 30): Promise<any> {
    try {
      const result = await this.query(`
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
        ORDER BY usage_date DESC
      `, [tenantId]);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get tenant usage:', error);
      throw error;
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<any> {
    try {
      const stats = await this.query(`
        SELECT 
          (SELECT COUNT(*) FROM tenants WHERE status = 'active') as active_tenants,
          (SELECT COUNT(*) FROM tenant_licenses WHERE status = 'active') as active_licenses,
          (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
          (SELECT COUNT(*) FROM assessments WHERE created_at >= CURRENT_DATE) as assessments_today,
          (SELECT COUNT(*) FROM job_executions WHERE status = 'failed' AND started_at >= CURRENT_DATE) as failed_jobs_today
      `);
      
      return stats.rows[0];
    } catch (error) {
      console.error('❌ Failed to get system stats:', error);
      throw error;
    }
  }
}

export default DatabaseService;
