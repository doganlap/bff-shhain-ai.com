# GRC Vercel Integration

This directory contains scripts for managing your GRC application on Vercel using the Vercel SDK.

## Prerequisites

1. Install Vercel SDK:
```bash
pnpm add @vercel/sdk
```

2. Set up environment variables in `.env`:
```env
VERCEL_TOKEN=your_vercel_token_here
VERCEL_TEAM_ID=your_team_id_here
DATABASE_URL=your_database_url_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app
```

## Available Scripts

### CLI Tool
Use the main CLI tool to manage all aspects of your Vercel deployment:

```bash
# Run full setup (recommended for first time)
node scripts/vercel-cli.js full-setup

# Individual commands
node scripts/vercel-cli.js deploy
node scripts/vercel-cli.js setup-projects
node scripts/vercel-cli.js setup-env
node scripts/vercel-cli.js setup-domains grc-web-app
node scripts/vercel-cli.js monitor
node scripts/vercel-cli.js team
node scripts/vercel-cli.js integrations
```

### Individual Scripts

#### 1. Deployment Automation (`vercel-deployment.js`)
- Automated project deployment
- Build status monitoring
- Deployment health checks

#### 2. Project Management (`vercel-projects.js`)
- Create/update projects
- Configure build settings
- Manage project settings

#### 3. Environment Variables (`vercel-env.js`)
- Set up environment variables for all environments
- Manage encrypted secrets
- Environment-specific configurations

#### 4. Domain Management (`vercel-domains.js`)
- Add custom domains
- Verify domain configuration
- SSL certificate management

#### 5. Team Management (`vercel-teams.js`)
- Manage team members
- Control access permissions
- Team project overview

#### 6. Monitoring & Logs (`vercel-monitoring.js`)
- Deployment health monitoring
- Log analysis
- Performance metrics
- Success rate tracking

#### 7. Integrations (`vercel-integrations.js`)
- GitHub integration setup
- Slack notifications
- Database connections
- Monitoring tools

## Quick Start

1. **First-time setup:**
```bash
# Install dependencies
pnpm add @vercel/sdk dotenv

# Set up environment variables
cp .env.example .env
# Edit .env with your Vercel token and other credentials

# Run complete setup
node scripts/vercel-cli.js full-setup
```

2. **Deploy your application:**
```bash
node scripts/vercel-cli.js deploy
```

3. **Monitor your deployments:**
```bash
node scripts/vercel-cli.js monitor
```

## Project Structure

The scripts are configured for a GRC application with three main components:
- `grc-web-app` - Frontend React application
- `grc-backend` - Backend/BFF service
- `grc-api` - API service

## Environment Configuration

The scripts automatically configure these environment variables:

### Development
- `NODE_ENV=development`
- `DEBUG=true`
- `API_BASE_URL` (development endpoints)

### Preview
- `NODE_ENV=production`
- `API_BASE_URL` (preview endpoints)
- Encrypted secrets (DATABASE_URL, AUTH_SECRET)

### Production
- `NODE_ENV=production`
- All production endpoints
- All encrypted secrets

## Security Best Practices

1. **Always encrypt sensitive variables:**
   - Database URLs
   - API keys
   - Authentication secrets

2. **Use environment-specific values:**
   - Different database URLs for preview/production
   - Different API endpoints

3. **Limit team access:**
   - Use appropriate member roles
   - Regular access reviews

## Troubleshooting

### Common Issues

1. **Authentication Error:**
   - Verify VERCEL_TOKEN is correct
   - Check token permissions

2. **Project Not Found:**
   - Ensure project names match Vercel dashboard
   - Check team ID if using team account

3. **Domain Verification Failed:**
   - Check DNS records
   - Wait for DNS propagation (up to 24 hours)

### Getting Help

- Check deployment logs: `node scripts/vercel-cli.js monitor`
- Verify environment variables in Vercel dashboard
- Review domain DNS settings

## Integration with CI/CD

These scripts can be integrated into your GitHub Actions workflow:

```yaml
- name: Deploy to Vercel
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  run: node scripts/vercel-cli.js deploy
```
