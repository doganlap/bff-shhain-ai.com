import { Vercel } from '@vercel/sdk';
import { config } from 'dotenv';

config();

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

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
        console.warn(`⚠️ Could not fetch deployment status: ${statusError.message}`);
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
}

// Example usage
async function main() {
  const deploymentUrl = process.argv[2] || 'project-name-uniqueid.vercel.app';

  try {
    await getLogsAndStatus(deploymentUrl);
  } catch (error) {
    console.error('Failed to get logs and status:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getLogsAndStatus };
