import { Vercel } from '@vercel/sdk';
import { config } from 'dotenv';

config();

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

async function manageDomains(projectName) {
  try {
    console.log('🌐 Managing domains for project:', projectName);

    const domains = [
      'grc-assessment.com',
      'www.grc-assessment.com',
      'grc-demo.vercel.app'
    ];

    for (const domain of domains) {
      try {
        // Add domain to project
        const addedDomain = await vercel.projects.addProjectDomain({
          idOrName: projectName,
          requestBody: {
            name: domain,
            gitBranch: domain.includes('demo') ? 'preview' : 'main'
          }
        });

        console.log(`✅ Added domain: ${domain}`);

        // Verify domain
        const verification = await vercel.projects.verifyProjectDomain({
          idOrName: projectName,
          domain: domain
        });

        console.log(`🔍 Verification status: ${verification.verified ? 'Verified' : 'Pending'}`);

      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Domain ${domain} already configured`);
        } else {
          console.error(`❌ Failed to add ${domain}:`, error.message);
        }
      }
    }

    // List all domains for the project
    const projectDomains = await vercel.projects.getProjectDomains({
      idOrName: projectName
    });

    console.log('\n📋 Current domains:');
    projectDomains.domains.forEach(domain => {
      console.log(`  • ${domain.name} - ${domain.verified ? '✅ Verified' : '⏳ Pending'}`);
    });

  } catch (error) {
    console.error('💥 Domain management error:', error.message);
    throw error;
  }
}

async function removeDomain(projectName, domainName) {
  try {
    await vercel.projects.removeProjectDomain({
      idOrName: projectName,
      domain: domainName
    });
    console.log(`🗑️  Removed domain: ${domainName}`);
  } catch (error) {
    console.error(`❌ Failed to remove domain ${domainName}:`, error.message);
  }
}

async function checkDomainConfiguration(projectName) {
  try {
    const domains = await vercel.projects.getProjectDomains({
      idOrName: projectName
    });

    console.log(`🔍 Domain configuration for ${projectName}:`);

    for (const domain of domains.domains) {
      console.log(`\n📍 ${domain.name}:`);
      console.log(`  Status: ${domain.verified ? '✅ Verified' : '⏳ Pending verification'}`);
      console.log(`  Branch: ${domain.gitBranch || 'main'}`);
      console.log(`  Created: ${new Date(domain.createdAt).toLocaleDateString()}`);

      if (!domain.verified) {
        console.log(`  ⚠️  Verification needed - check DNS records`);
      }
    }

  } catch (error) {
    console.error('💥 Domain check error:', error.message);
  }
}

export { manageDomains, removeDomain, checkDomainConfiguration };
