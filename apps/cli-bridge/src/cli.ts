#!/usr/bin/env node

/**
 * GRC Bridge CLI - Secure POC to Production Data Transfer
 * Requires admin approval and implements double prevention security
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { BridgeOrchestrator } from './orchestrator';
import { AdminApprovalService } from './services/approval';
import { SecurityValidator } from './services/security';
import { AuditLogger } from './services/audit';
import { ConfigManager } from './config/manager';

const program = new Command();

// Initialize services
const orchestrator = new BridgeOrchestrator();
const approvalService = new AdminApprovalService();
const securityValidator = new SecurityValidator();
const auditLogger = new AuditLogger();
const config = new ConfigManager();

program
  .name('grc-bridge')
  .description('🌉 Secure CLI bridge between POC and Main GRC application')
  .version('1.0.0')
  .configureHelp({
    sortSubcommands: true,
    subcommandTerm: (cmd) => cmd.name() + ' ' + cmd.usage()
  });

// Initialize command
program
  .command('init')
  .description('Initialize CLI bridge configuration')
  .option('--poc-env <url>', 'POC environment URL')
  .option('--main-env <url>', 'Main application URL')
  .option('--admin-email <email>', 'Admin email for approvals')
  .action(async (options) => {
    const spinner = ora('Initializing CLI bridge...').start();
    
    try {
      // Interactive configuration if options not provided
      if (!options.pocEnv || !options.mainEnv) {
        spinner.stop();
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'pocEnv',
            message: 'POC Environment URL:',
            default: 'https://poc.shahin-grc.com',
            when: () => !options.pocEnv
          },
          {
            type: 'input',
            name: 'mainEnv',
            message: 'Main Application URL:',
            default: 'https://app.shahin-grc.com',
            when: () => !options.mainEnv
          },
          {
            type: 'input',
            name: 'adminEmail',
            message: 'Admin Email for Approvals:',
            default: 'admin@shahin-ai.com',
            when: () => !options.adminEmail
          }
        ]);
        
        Object.assign(options, answers);
        spinner.start();
      }
      
      // Initialize configuration
      await config.initialize({
        pocEnvironment: options.pocEnv,
        mainEnvironment: options.mainEnv,
        adminEmail: options.adminEmail,
        securityLevel: 'enterprise',
        auditEnabled: true
      });
      
      // Test connections
      await orchestrator.testConnections();
      
      spinner.succeed(chalk.green('✅ CLI bridge initialized successfully'));
      
      console.log(chalk.blue('\n📋 Configuration Summary:'));
      console.log(`   POC Environment: ${chalk.cyan(options.pocEnv)}`);
      console.log(`   Main Environment: ${chalk.cyan(options.mainEnv)}`);
      console.log(`   Admin Email: ${chalk.cyan(options.adminEmail)}`);
      console.log(`   Security Level: ${chalk.yellow('Enterprise')}`);
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Initialization failed'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Extract command
program
  .command('extract')
  .description('Extract data from POC environment')
  .option('-t, --type <type>', 'Data type (tenants|licenses|users|configurations)', 'tenants')
  .option('-f, --filter <filter>', 'Filter criteria (e.g., "status=active")')
  .option('-o, --output <path>', 'Output staging path', './staging')
  .option('--dry-run', 'Preview extraction without executing')
  .action(async (options) => {
    const spinner = ora('Extracting data from POC...').start();
    
    try {
      // Validate extraction request
      const validation = await securityValidator.validateExtractionRequest({
        type: options.type,
        filter: options.filter,
        dryRun: options.dryRun
      });
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Execute extraction
      const result = await orchestrator.extractData({
        type: options.type,
        filter: options.filter,
        outputPath: options.output,
        dryRun: options.dryRun
      });
      
      spinner.succeed(chalk.green('✅ Data extraction completed'));
      
      console.log(chalk.blue('\n📊 Extraction Results:'));
      console.log(`   Extraction ID: ${chalk.cyan(result.id)}`);
      console.log(`   Records Found: ${chalk.yellow(result.recordCount)}`);
      console.log(`   Data Type: ${chalk.cyan(result.dataType)}`);
      console.log(`   Size: ${chalk.yellow(result.sizeFormatted)}`);
      
      if (!options.dryRun) {
        console.log(chalk.green('\n🔄 Next Steps:'));
        console.log(`   1. Review extracted data in: ${chalk.cyan(options.output)}`);
        console.log(`   2. Request approval: ${chalk.cyan(`grc-bridge request-approval --data-id=${result.id}`)}`);
      }
      
      // Log extraction
      await auditLogger.logExtraction(result);
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Extraction failed'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Request approval command
program
  .command('request-approval')
  .description('Request admin approval for data transfer')
  .option('-d, --data-id <id>', 'Data extraction ID')
  .option('-r, --reason <reason>', 'Business justification for transfer')
  .option('-p, --priority <level>', 'Priority level (low|medium|high)', 'medium')
  .action(async (options) => {
    const spinner = ora('Submitting approval request...').start();
    
    try {
      // Interactive input if missing
      if (!options.dataId || !options.reason) {
        spinner.stop();
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'dataId',
            message: 'Data Extraction ID:',
            when: () => !options.dataId,
            validate: (input) => input.length > 0 || 'Data ID is required'
          },
          {
            type: 'editor',
            name: 'reason',
            message: 'Business Justification:',
            when: () => !options.reason,
            validate: (input) => input.length > 10 || 'Please provide detailed justification (min 10 characters)'
          }
        ]);
        
        Object.assign(options, answers);
        spinner.start();
      }
      
      // Submit approval request
      const request = await approvalService.requestApproval({
        dataId: options.dataId,
        reason: options.reason,
        priority: options.priority,
        requestedBy: await config.getCurrentUser()
      });
      
      spinner.succeed(chalk.green('✅ Approval request submitted'));
      
      console.log(chalk.blue('\n📋 Request Details:'));
      console.log(`   Request ID: ${chalk.cyan(request.id)}`);
      console.log(`   Priority: ${chalk.yellow(request.priority)}`);
      console.log(`   Status: ${chalk.yellow(request.status)}`);
      console.log(`   Estimated Review Time: ${chalk.cyan(request.estimatedReviewTime)}`);
      
      console.log(chalk.green('\n📧 Notifications:'));
      console.log(`   Admin notified: ${chalk.cyan(request.adminEmail)}`);
      console.log(`   Status updates will be sent to: ${chalk.cyan(request.requestorEmail)}`);
      
      console.log(chalk.blue('\n🔍 Track Status:'));
      console.log(`   ${chalk.cyan(`grc-bridge status --request-id=${request.id}`)}`);
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Approval request failed'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check approval and transfer status')
  .option('-r, --request-id <id>', 'Approval request ID')
  .option('-t, --transfer-id <id>', 'Transfer ID')
  .option('--all', 'Show all pending requests')
  .action(async (options) => {
    const spinner = ora('Checking status...').start();
    
    try {
      if (options.all) {
        const requests = await approvalService.getAllRequests();
        spinner.succeed(chalk.green('✅ Status retrieved'));
        
        console.log(chalk.blue('\n📋 All Requests:'));
        requests.forEach(req => {
          const statusColor = req.status === 'approved' ? 'green' : 
                            req.status === 'rejected' ? 'red' : 'yellow';
          console.log(`   ${req.id}: ${chalk[statusColor](req.status)} - ${req.dataType} (${req.recordCount} records)`);
        });
        
      } else if (options.requestId) {
        const request = await approvalService.getRequestStatus(options.requestId);
        spinner.succeed(chalk.green('✅ Request status retrieved'));
        
        console.log(chalk.blue('\n📋 Request Status:'));
        console.log(`   ID: ${chalk.cyan(request.id)}`);
        console.log(`   Status: ${chalk.yellow(request.status)}`);
        console.log(`   Data Type: ${chalk.cyan(request.dataType)}`);
        console.log(`   Records: ${chalk.yellow(request.recordCount)}`);
        console.log(`   Requested: ${chalk.gray(request.requestedAt)}`);
        
        if (request.status === 'approved') {
          console.log(chalk.green('\n✅ Approved! Ready for transfer:'));
          console.log(`   ${chalk.cyan(`grc-bridge transfer --approval-id=${request.approvalId}`)}`);
        } else if (request.status === 'rejected') {
          console.log(chalk.red('\n❌ Request Rejected:'));
          console.log(`   Reason: ${chalk.red(request.rejectionReason)}`);
        }
        
      } else if (options.transferId) {
        const transfer = await orchestrator.getTransferStatus(options.transferId);
        spinner.succeed(chalk.green('✅ Transfer status retrieved'));
        
        console.log(chalk.blue('\n🔄 Transfer Status:'));
        console.log(`   ID: ${chalk.cyan(transfer.id)}`);
        console.log(`   Status: ${chalk.yellow(transfer.status)}`);
        console.log(`   Progress: ${chalk.yellow(transfer.progress)}%`);
        console.log(`   Records Transferred: ${chalk.yellow(transfer.recordsTransferred)}`);
        
        if (transfer.status === 'failed') {
          console.log(chalk.red('\n❌ Transfer Failed:'));
          console.log(`   Error: ${chalk.red(transfer.error)}`);
          console.log(`   Rollback Available: ${transfer.canRollback ? '✅' : '❌'}`);
        }
      }
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Status check failed'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Transfer command
program
  .command('transfer')
  .description('Execute approved data transfer')
  .option('-a, --approval-id <id>', 'Approval ID')
  .option('-t, --target <env>', 'Target environment (production|staging)', 'production')
  .option('--batch-size <size>', 'Batch size for large transfers', '1000')
  .option('--dry-run', 'Simulate transfer without executing')
  .action(async (options) => {
    const spinner = ora('Executing data transfer...').start();
    
    try {
      // Validate approval
      const approval = await approvalService.validateApproval(options.approvalId);
      if (!approval.isValid) {
        throw new Error(`Invalid approval: ${approval.reason}`);
      }
      
      // Confirm transfer with user
      if (!options.dryRun) {
        spinner.stop();
        const confirm = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: `⚠️  Execute transfer of ${approval.recordCount} records to ${options.target}?`,
            default: false
          }
        ]);
        
        if (!confirm.proceed) {
          console.log(chalk.yellow('Transfer cancelled by user'));
          return;
        }
        spinner.start();
      }
      
      // Execute transfer with progress monitoring
      const transfer = await orchestrator.executeTransfer({
        approvalId: options.approvalId,
        target: options.target,
        batchSize: parseInt(options.batchSize),
        dryRun: options.dryRun,
        onProgress: (progress) => {
          spinner.text = `Transferring data... ${progress.percentage}% (${progress.recordsProcessed}/${progress.totalRecords})`;
        }
      });
      
      spinner.succeed(chalk.green('✅ Data transfer completed successfully'));
      
      console.log(chalk.blue('\n📊 Transfer Results:'));
      console.log(`   Transfer ID: ${chalk.cyan(transfer.id)}`);
      console.log(`   Records Transferred: ${chalk.yellow(transfer.recordsTransferred)}`);
      console.log(`   Duration: ${chalk.yellow(transfer.duration)}`);
      console.log(`   Target: ${chalk.cyan(transfer.target)}`);
      
      if (transfer.warnings?.length > 0) {
        console.log(chalk.yellow('\n⚠️  Warnings:'));
        transfer.warnings.forEach(warning => {
          console.log(`   - ${chalk.yellow(warning)}`);
        });
      }
      
      console.log(chalk.green('\n🔄 Post-Transfer:'));
      console.log(`   Verification: ${transfer.verified ? '✅' : '❌'}`);
      console.log(`   Rollback Available: ${transfer.canRollback ? '✅' : '❌'}`);
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Transfer failed'));
      console.error(chalk.red(error.message));
      
      // Offer rollback if transfer was partially completed
      if (error.transferId) {
        const rollback = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'rollback',
            message: 'Attempt automatic rollback?',
            default: true
          }
        ]);
        
        if (rollback.rollback) {
          await orchestrator.rollbackTransfer(error.transferId);
          console.log(chalk.green('✅ Rollback completed'));
        }
      }
      
      process.exit(1);
    }
  });

// Rollback command
program
  .command('rollback')
  .description('Rollback a completed transfer')
  .option('-t, --transfer-id <id>', 'Transfer ID to rollback')
  .option('-r, --reason <reason>', 'Rollback reason')
  .option('--force', 'Force rollback without confirmation')
  .action(async (options) => {
    const spinner = ora('Preparing rollback...').start();
    
    try {
      // Get transfer details
      const transfer = await orchestrator.getTransferStatus(options.transferId);
      
      if (!transfer.canRollback) {
        throw new Error('Transfer cannot be rolled back (too old or already rolled back)');
      }
      
      spinner.stop();
      
      // Confirm rollback
      if (!options.force) {
        console.log(chalk.yellow('\n⚠️  Rollback Details:'));
        console.log(`   Transfer ID: ${chalk.cyan(transfer.id)}`);
        console.log(`   Records: ${chalk.yellow(transfer.recordsTransferred)}`);
        console.log(`   Target: ${chalk.cyan(transfer.target)}`);
        console.log(`   Completed: ${chalk.gray(transfer.completedAt)}`);
        
        const confirm = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Are you sure you want to rollback this transfer?',
            default: false
          }
        ]);
        
        if (!confirm.proceed) {
          console.log(chalk.yellow('Rollback cancelled'));
          return;
        }
      }
      
      spinner.start('Executing rollback...');
      
      // Execute rollback
      const rollback = await orchestrator.rollbackTransfer(options.transferId, {
        reason: options.reason || 'Manual rollback via CLI',
        executedBy: await config.getCurrentUser()
      });
      
      spinner.succeed(chalk.green('✅ Rollback completed successfully'));
      
      console.log(chalk.blue('\n📊 Rollback Results:'));
      console.log(`   Rollback ID: ${chalk.cyan(rollback.id)}`);
      console.log(`   Records Removed: ${chalk.yellow(rollback.recordsRemoved)}`);
      console.log(`   Duration: ${chalk.yellow(rollback.duration)}`);
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Rollback failed'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Emergency commands
const emergency = program
  .command('emergency')
  .description('Emergency operations (admin only)');

emergency
  .command('stop-all')
  .description('Stop all active transfers')
  .option('--auth-code <code>', 'Emergency authorization code')
  .action(async (options) => {
    const spinner = ora('Stopping all transfers...').start();
    
    try {
      // Validate emergency authorization
      await securityValidator.validateEmergencyAuth(options.authCode);
      
      // Stop all transfers
      const result = await orchestrator.emergencyStopAll();
      
      spinner.succeed(chalk.green('✅ All transfers stopped'));
      
      console.log(chalk.red('\n🚨 Emergency Stop Results:'));
      console.log(`   Transfers Stopped: ${chalk.yellow(result.transfersStopped)}`);
      console.log(`   Partial Transfers: ${chalk.yellow(result.partialTransfers)}`);
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Emergency stop failed'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

emergency
  .command('audit')
  .description('Generate emergency audit report')
  .option('--since <date>', 'Start date (YYYY-MM-DD)', '2024-01-01')
  .option('--output <file>', 'Output file', 'emergency-audit.json')
  .action(async (options) => {
    const spinner = ora('Generating audit report...').start();
    
    try {
      const report = await auditLogger.generateEmergencyAudit({
        since: new Date(options.since),
        includeSecurityEvents: true,
        includeFailures: true
      });
      
      await auditLogger.saveReport(report, options.output);
      
      spinner.succeed(chalk.green('✅ Audit report generated'));
      
      console.log(chalk.blue('\n📋 Audit Summary:'));
      console.log(`   Total Events: ${chalk.yellow(report.totalEvents)}`);
      console.log(`   Security Incidents: ${chalk.red(report.securityIncidents)}`);
      console.log(`   Failed Transfers: ${chalk.red(report.failedTransfers)}`);
      console.log(`   Report Saved: ${chalk.cyan(options.output)}`);
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Audit generation failed'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Global error handler
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('\n💥 Unhandled error:'), error);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
