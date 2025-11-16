# Monitoring Guide

## 🎯 Overview

This guide explains how to monitor the Shahin GRC application, including API key status, system health, and real-time monitoring.

## 📊 Monitoring Endpoints

### 1. Public Monitoring Endpoint (Local Development)

**GET /api/monitoring/status**

Get system status and API key health (no authentication required for local development).

```bash
curl http://localhost:3001/api/monitoring/status
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "server": {
    "uptime": 3600,
    "memory": {
      "total": "8192 MB",
      "used": "2048 MB",
      "free": "6144 MB",
      "usagePercent": 25
    },
    "cpu": 8,
    "platform": "win32",
    "nodeVersion": "v18.17.0"
  },
  "apiKeys": {
    "openai": {
      "configured": true,
      "keyPreview": "sk-...",
      "valid": true,
      "lastChecked": "2025-01-XX..."
    },
    "googleGemini": {
      "configured": false,
      "keyPreview": "Not configured",
      "valid": false,
      "lastChecked": null
    },
    "azureOpenAI": {
      "configured": false,
      "endpoint": "Not configured",
      "valid": false,
      "lastChecked": null
    },
    "anthropic": {
      "configured": false,
      "keyPreview": "Not configured",
      "valid": false,
      "lastChecked": null
    },
    "localLLM": {
      "configured": true,
      "endpoint": "http://localhost:1234/v1",
      "valid": true,
      "lastChecked": "2025-01-XX..."
    }
  },
  "environment": {
    "nodeEnv": "development",
    "port": 3001
  }
}
```

### 2. Health Check Endpoint

**GET /api/monitoring/health**

Simple health check endpoint.

```bash
curl http://localhost:3001/api/monitoring/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "uptime": 3600
}
```

### 3. Admin Health Endpoint (Requires Authentication)

**GET /api/admin/health**

Complete system health check with API key validation (requires admin authentication).

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" http://localhost:3001/api/admin/health
```

## 🔧 Admin Dashboard

### Access Dashboard

1. **Open Admin Dashboard:**
   - Development: http://localhost:3001/admin
   - Production: https://api.shahin-ai.com/admin

2. **Authenticate:**
   - Enter admin secret (set in `ADMIN_SECRET` environment variable)
   - Click "Login"

### Dashboard Features

#### 1. System Health
- Database connection status
- Memory usage
- Server uptime
- Node.js version

#### 2. API Keys Status
- OpenAI API key status
- Google Gemini API key status
- Azure OpenAI status
- Anthropic Claude status
- AWS Bedrock status
- Local LLM status

#### 3. Real-time Monitoring
- Click "Start Monitoring" to enable automatic checks every 30 seconds
- Click "Stop Monitoring" to disable
- Status updates automatically

#### 4. Statistics
- Active sandbox sessions
- Pending requests
- Unread messages
- Average ratings

#### 5. File Management
- Upload files
- List uploaded files
- Delete files

#### 6. AI Configuration
- Click "Open AI Config" to configure AI services
- Configure API keys for all providers
- Test API key connections

## 📱 Local Development Monitoring

### Automatic Monitoring

The monitoring endpoint automatically checks:
- API key validity
- Service availability
- System resources
- Database connectivity

### Manual Monitoring

```bash
# Check status
curl http://localhost:3001/api/monitoring/status | jq

# Check health
curl http://localhost:3001/api/monitoring/health

# Check API keys in admin dashboard
# Open http://localhost:3001/admin
```

## 🔍 API Key Status

### Status Indicators

- **✅ Valid**: API key is configured and working
- **⚠️ Invalid/Error**: API key is configured but not working
- **❌ Not Configured**: API key is not set

### Checking API Keys

1. **Via Dashboard:**
   - Open admin dashboard
   - Click "Check API Keys"
   - View status for each service

2. **Via API:**
   ```bash
   curl http://localhost:3001/api/monitoring/status | jq '.apiKeys'
   ```

3. **Via Configuration UI:**
   - Open http://localhost:3001/ai-config
   - Click "🧪 Test" for each service
   - View test results

## 🚨 Troubleshooting

### API Key Not Working

1. **Check Configuration:**
   ```bash
   # Check if API key is set
   echo $OPENAI_API_KEY
   ```

2. **Test Manually:**
   ```bash
   # Test OpenAI
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

3. **Check Dashboard:**
   - Open admin dashboard
   - Check API key status
   - View error messages

### Service Not Responding

1. **Check Service Status:**
   ```bash
   curl http://localhost:3001/api/monitoring/status
   ```

2. **Check Logs:**
   - Review server logs
   - Check for error messages
   - Verify service endpoints

3. **Check Network:**
   - Verify internet connection
   - Check firewall settings
   - Verify service endpoints are accessible

## 📊 Monitoring Best Practices

### 1. Regular Checks
- Set up monitoring to check every 30 seconds
- Monitor API key status regularly
- Check system resources

### 2. Alerts
- Set up alerts for API key failures
- Monitor memory usage
- Check database connectivity

### 3. Logging
- Log API key status changes
- Track service availability
- Monitor error rates

### 4. Dashboard
- Use admin dashboard for real-time monitoring
- Check API key status regularly
- Monitor system health

## 🔒 Security

### API Key Security

1. **Never expose API keys:**
   - Don't commit API keys to Git
   - Use environment variables
   - Rotate keys regularly

2. **Monitor API Key Usage:**
   - Check API key usage in provider dashboards
   - Set up usage alerts
   - Monitor for unusual activity

3. **Access Control:**
   - Use admin secret for dashboard access
   - Restrict monitoring endpoint access in production
   - Use authentication for sensitive endpoints

## 📚 Additional Resources

- [Admin Dashboard Guide](./ADMIN_DASHBOARD_GUIDE.md)
- [AI Configuration Guide](./AI_CONFIGURATION_GUIDE.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES.md)

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0

