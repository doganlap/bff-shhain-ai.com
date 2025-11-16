# Agent Control Guide - Frontend Controlled AI Agent

## Overview

The AI Agent is now **frontend controlled** and requires **external LLM/Cloud AI connection**. The agent must be actively connected to an external AI service (Local LLM, Azure OpenAI, or OpenAI API) at all times.

## Key Features

1. **Frontend Controlled** - Agent connection is controlled from the frontend
2. **External AI Required** - Agent must connect to external LLM or Cloud AI (no local fallback)
3. **Auto-Connect** - Agent automatically connects on page load
4. **Service Switching** - Frontend can switch between available AI services
5. **Health Monitoring** - Continuous health checks every 30 seconds
6. **Pre-Deployment Testing** - Test agent connection before deployment

## Agent Connection Flow

```
Frontend → Agent Status Check → Connect to Available Service → Monitor Connection
```

## Frontend Control

### Automatic Connection

The agent automatically connects when:
1. Page loads
2. Available AI services are detected
3. Connection is lost and services become available again

### Manual Control

Frontend can control agent through:
- **Connect**: Connect to a specific AI service
- **Disconnect**: Disconnect agent (not recommended in production)
- **Switch Service**: Switch to different AI service
- **Status Check**: Check connection status

## API Endpoints

### Agent Status
```http
GET /api/agent/status
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "connected": true,
    "active": true,
    "availableServices": [
      {
        "id": "local-llm",
        "name": "Local LLM",
        "endpoint": "http://localhost:1234/v1",
        "model": "llama-3.2-3b-instruct",
        "type": "local",
        "status": "available"
      }
    ],
    "serviceStatus": {
      "localLLM": "available",
      "azureOpenAI": "unavailable",
      "openAIPublic": "unavailable"
    },
    "lastCheck": "2025-01-XXT00:00:00.000Z"
  }
}
```

### Connect Agent
```http
POST /api/agent/connect
Content-Type: application/json

{
  "serviceId": "local-llm"
}
```

### Disconnect Agent
```http
POST /api/agent/disconnect
```

### Switch Service
```http
POST /api/agent/switch-service
Content-Type: application/json

{
  "serviceId": "azure-openai"
}
```

### Test Before Deployment
```http
GET /api/agent/test
```

**Response:**
```json
{
  "success": true,
  "testResults": {
    "localLLM": { "available": true, "error": null },
    "azureOpenAI": { "available": false, "error": "Connection timeout" },
    "openAIPublic": { "available": false, "error": "Invalid API key" },
    "overall": {
      "connected": true,
      "message": "Agent ready for deployment - At least one AI service is available"
    }
  },
  "readyForDeployment": true
}
```

### Agent Health
```http
GET /api/agent/health
```

## Configuration

### Required Environment Variables

At least one of the following must be configured:

#### Local LLM (Ollama/LM Studio)
```env
LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
LOCAL_LLM_MODEL=llama-3.2-3b-instruct
LOCAL_LLM_TYPE=ollama
```

#### Azure OpenAI
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your-api-key
```

#### OpenAI Public API
```env
OPENAI_API_KEY=sk-...
```

## Testing Before Deployment

### Automated Test Script

Run the test script before deployment:

```bash
# From backend directory
npm run test:agent

# Or directly
node scripts/test-before-deploy.js
```

### Test Checklist

The test script checks:
1. ✅ Agent status endpoint responding
2. ✅ Agent pre-deployment test passing
3. ✅ Agent health check passing
4. ✅ AI service health check passing
5. ✅ Agent connection successful
6. ✅ Chat endpoint working

### Manual Testing

1. **Test Agent Status**
```bash
curl http://localhost:3001/api/agent/status
```

2. **Test Agent Connection**
```bash
curl -X POST http://localhost:3001/api/agent/connect \
  -H "Content-Type: application/json" \
  -d '{}'
```

3. **Test Chat Endpoint**
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "مرحباً"}'
```

4. **Test Pre-Deployment**
```bash
curl http://localhost:3001/api/agent/test
```

## Frontend Integration

### React Component Example

```jsx
import { useState, useEffect } from 'react';

function AIAgentController() {
  const [agentConnected, setAgentConnected] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    // Check agent status on mount
    checkAgentStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkAgentStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAgentStatus = async () => {
    try {
      const response = await fetch('/api/agent/status');
      const data = await response.json();
      
      if (data.success && data.agent) {
        setAgentConnected(data.agent.connected);
        setAvailableServices(data.agent.availableServices || []);
        setActiveService(data.agent.activeService);
        
        // Auto-connect if not connected
        if (!data.agent.connected && data.agent.availableServices?.length > 0) {
          await connectAgent(data.agent.availableServices[0].id);
        }
      }
    } catch (error) {
      console.error('Agent status check failed:', error);
    }
  };

  const connectAgent = async (serviceId) => {
    try {
      const response = await fetch('/api/agent/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId })
      });
      const data = await response.json();
      
      if (data.success) {
        setAgentConnected(true);
        setActiveService(data.agent.activeService);
      }
    } catch (error) {
      console.error('Agent connection failed:', error);
    }
  };

  return (
    <div>
      <p>Agent Status: {agentConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Active Service: {activeService || 'None'}</p>
      <p>Available Services: {availableServices.length}</p>
    </div>
  );
}
```

## Deployment Checklist

Before deploying to production:

- [ ] At least one AI service configured (Local LLM, Azure OpenAI, or OpenAI API)
- [ ] Agent status endpoint responding
- [ ] Agent test endpoint passing
- [ ] Agent can connect to at least one AI service
- [ ] Chat endpoint working with connected agent
- [ ] Frontend can control agent connection
- [ ] Health checks working
- [ ] Auto-reconnect working
- [ ] Error handling implemented
- [ ] Monitoring configured

## Troubleshooting

### Agent Not Connecting

**Issue:** Agent status shows `connected: false`

**Solutions:**
1. Check if at least one AI service is configured
2. Verify AI service is running and accessible
3. Check network connectivity
4. Review backend logs for errors
5. Test AI service directly (curl endpoint)

### No AI Services Available

**Issue:** `availableServices: []`

**Solutions:**
1. Configure Local LLM (Ollama/LM Studio)
2. Configure Azure OpenAI (endpoint and key)
3. Configure OpenAI Public API (API key)
4. Verify environment variables are set
5. Restart backend server after configuration

### Chat Endpoint Failing

**Issue:** Chat endpoint returns 503 error

**Solutions:**
1. Ensure agent is connected (`/api/agent/connect`)
2. Verify AI service is available
3. Check backend logs for connection errors
4. Test AI service directly
5. Verify environment variables

### Frontend Cannot Control Agent

**Issue:** Frontend API calls failing

**Solutions:**
1. Check CORS configuration
2. Verify API URL is correct
3. Check network connectivity
4. Review browser console for errors
5. Verify backend is running

## Monitoring

### Health Checks

- **Agent Health**: `/api/agent/health` (every 30 seconds)
- **AI Health**: `/api/ai/health` (on demand)
- **Agent Status**: `/api/agent/status` (every 30 seconds)

### Logs

Monitor backend logs for:
- Agent connection attempts
- AI service availability
- Connection errors
- Service switches

### Metrics

Track:
- Agent connection status
- Active AI service
- Available services count
- Connection uptime
- Error rate

## Security

### Frontend Control

- Agent control is frontend-only (no backend admin required)
- Connection status is public (for frontend display)
- Service switching requires valid request
- No authentication required (internal API)

### AI Service Security

- Local LLM: No authentication (local network)
- Azure OpenAI: API key authentication
- OpenAI API: API key authentication
- All keys stored in environment variables

## Best Practices

1. **Always test before deployment** - Run `npm run test:agent`
2. **Monitor connection status** - Check health endpoints regularly
3. **Auto-reconnect on failure** - Implement automatic reconnection
4. **Fallback services** - Configure multiple AI services
5. **Error handling** - Handle connection errors gracefully
6. **User feedback** - Show connection status to users
7. **Logging** - Log all connection attempts and errors

## Support

For issues:
1. Check troubleshooting section
2. Review backend logs
3. Test AI services directly
4. Verify environment variables
5. Run test script: `npm run test:agent`

---

**Status:** ✅ Agent control implemented  
**Last Updated:** 2025-01-XX  
**Version:** 2.1.0

