import { Vercel } from '@vercel/sdk';
import { config } from 'dotenv';

config();

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

async function getDeploymentLogs(deploymentId) {
  try {
    console.log('📊 Fetching deployment logs...');

    const logs = await vercel.deployments.getDeploymentEvents({
      idOrUrl: deploymentId
    });

    console.log(`📋 Logs for deployment ${deploymentId}:\n`);

    logs.forEach((log, index) => {
      const timestamp = new Date(log.created).toLocaleTimeString();
      console.log(`[${timestamp}] ${log.text || log.payload?.text || 'No message'}`);
    });

  } catch (error) {
    console.error('💥 Failed to fetch logs:', error.message);
  }
}

async function getLogsAndStatus(deploymentUrl) {
  try {
    console.log(`📊 Fetching logs and status for: ${deploymentUrl}`);

    // Get deployment logs
    const logsResponse = await vercel.deployments.getDeploymentEvents({
      idOrUrl: deploymentUrl,
    });

    if (Array.isArray(logsResponse) && logsResponse.length > 0) {
      // Check if we can extract deployment ID from logs
      let deploymentId = null;

      // Try to find deployment ID from the first log entry
      if ('deploymentId' in logsResponse[0] && logsResponse[0].deploymentId) {
        deploymentId = logsResponse[0].deploymentId;
      } else {
        // If no deployment ID in logs, try to extract from URL or use URL directly
        deploymentId = deploymentUrl;
      }

      // Get deployment status
      try {
        const deploymentStatus = await vercel.deployments.getDeployment({
          idOrUrl: deploymentId,
        });

        const statusEmoji = deploymentStatus.readyState === 'READY' ? '✅' :
                           deploymentStatus.readyState === 'ERROR' ? '❌' :
                           deploymentStatus.readyState === 'BUILDING' ? '🔄' : '⏳';

        console.log(
          `${statusEmoji} Deployment ${deploymentId} status: ${deploymentStatus.readyState}`,
        );
        console.log(`🌐 URL: ${deploymentStatus.url}`);
        console.log(`⏰ Created: ${new Date(deploymentStatus.createdAt).toLocaleString()}`);

        if (deploymentStatus.readyState === 'READY') {
          console.log(`🎉 Build completed in: ${deploymentStatus.buildingAt ?
            Math.round((new Date(deploymentStatus.ready || deploymentStatus.createdAt) - new Date(deploymentStatus.buildingAt)) / 1000) + 's' :
            'Unknown'}`);
        }
      } catch (statusError) {
        console.warn(`⚠️  Could not fetch deployment status: ${statusError.message}`);
      }

      // Display logs with improved formatting
      console.log('\n📋 Deployment logs:');
      console.log('─'.repeat(50));

      for (const item of logsResponse) {
        if ('text' in item && item.text) {
          const logType = item.type || 'info';
          const timestamp = new Date(item.created).toLocaleTimeString();
          const typeEmoji = logType === 'error' ? '❌' :
                           logType === 'warning' ? '⚠️' :
                           logType === 'command' ? '⚡' : '📝';

          console.log(
            `${typeEmoji} [${timestamp}] ${logType.toUpperCase()}: ${item.text}`,
          );
        } else if ('payload' in item && item.payload?.text) {
          const timestamp = new Date(item.created).toLocaleTimeString();
          console.log(`📦 [${timestamp}] PAYLOAD: ${item.payload.text}`);
        }
      }
      console.log('─'.repeat(50));

    } else {
      console.log('📭 No logs found for this deployment');
    }

    return {
      hasLogs: Array.isArray(logsResponse) && logsResponse.length > 0,
      logCount: Array.isArray(logsResponse) ? logsResponse.length : 0,
      deploymentUrl
    };

  } catch (error) {
    console.error(
      error instanceof Error ? `💥 Error: ${error.message}` : String(error),
    );
    throw error;
  }
}async function monitorProjectHealth(projectName) {
  try {
    console.log(`🏥 Health monitoring for ${projectName}...`);

    // Get recent deployments
    const deployments = await vercel.deployments.getDeployments({
      projectId: projectName,
      limit: 10
    });

    console.log('\n📈 Recent deployments:');
    deployments.deployments.slice(0, 5).forEach(deployment => {
      const status = deployment.readyState;
      const emoji = status === 'READY' ? '✅' : status === 'ERROR' ? '❌' : '🔄';
      const time = new Date(deployment.createdAt).toLocaleString();

      console.log(`  ${emoji} ${deployment.url} - ${status} (${time})`);
    });

    // Calculate success rate
    const totalDeployments = deployments.deployments.length;
    const successfulDeployments = deployments.deployments.filter(d => d.readyState === 'READY').length;
    const successRate = ((successfulDeployments / totalDeployments) * 100).toFixed(1);

    console.log(`\n📊 Success Rate: ${successRate}% (${successfulDeployments}/${totalDeployments})`);

    // Check for failed deployments
    const failedDeployments = deployments.deployments.filter(d => d.readyState === 'ERROR');
    if (failedDeployments.length > 0) {
      console.log('\n❌ Failed deployments requiring attention:');
      failedDeployments.forEach(deployment => {
        console.log(`  • ${deployment.url} - ${new Date(deployment.createdAt).toLocaleString()}`);
      });
    }

    return {
      totalDeployments,
      successfulDeployments,
      successRate: parseFloat(successRate),
      failedDeployments: failedDeployments.length
    };

  } catch (error) {
    console.error('💥 Health monitoring error:', error.message);
    throw error;
  }
}

async function getProjectAnalytics(projectName) {
  try {
    console.log(`📊 Analytics for ${projectName}...`);

    // Get project details
    const project = await vercel.projects.getProject({
      idOrName: projectName
    });

    console.log(`\n📦 Project: ${project.name}`);
    console.log(`🏗️  Framework: ${project.framework || 'Not specified'}`);
    console.log(`📅 Created: ${new Date(project.createdAt).toLocaleDateString()}`);
    console.log(`🔄 Last updated: ${new Date(project.updatedAt).toLocaleDateString()}`);

    // Get recent deployments for analytics
    const deployments = await vercel.deployments.getDeployments({
      projectId: project.id,
      limit: 50
    });

    // Deployment frequency analysis
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentDeployments = deployments.deployments.filter(
      d => new Date(d.createdAt) >= lastWeek
    );

    console.log(`\n📈 Last 7 days: ${recentDeployments.length} deployments`);
    console.log(`⏱️  Average: ${(recentDeployments.length / 7).toFixed(1)} deployments/day`);

    return {
      project: {
        name: project.name,
        framework: project.framework,
        created: project.createdAt,
        updated: project.updatedAt
      },
      analytics: {
        totalDeployments: deployments.deployments.length,
        recentDeployments: recentDeployments.length,
        averagePerDay: recentDeployments.length / 7
      }
    };

  } catch (error) {
    console.error('💥 Analytics error:', error.message);
    throw error;
  }
}

async function setupAlerts(projectName) {
  console.log(`🚨 Setting up monitoring alerts for ${projectName}...`);

  // This is a conceptual implementation - Vercel alerts are typically configured via dashboard
  console.log('💡 Alert types to configure in Vercel dashboard:');
  console.log('  • Deployment failures');
  console.log('  • Performance degradation');
  console.log('  • Error rate spikes');
  console.log('  • Build time increases');
  console.log('\n🔗 Configure at: https://vercel.com/dashboard/alerts');
}

export {
  getDeploymentLogs,
  getLogsAndStatus,
  monitorProjectHealth,
  getProjectAnalytics,
  setupAlerts
};
