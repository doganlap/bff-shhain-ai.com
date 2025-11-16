# AI Service Configuration Guide

## 🎯 Overview

This guide explains how to configure all AI services (Top 5 Cloud Providers + Local LLM) for the Shahin GRC application.

## 📋 Available AI Services

### Priority Order:
1. **Local LLM** (Ollama/LM Studio) - Priority 1
2. **OpenAI** (GPT-4, GPT-3.5) - Priority 2
3. **Google Gemini** - Priority 3
4. **Azure OpenAI** (Microsoft) - Priority 4
5. **AWS Bedrock** (Amazon) - Priority 5
6. **Anthropic Claude** - Priority 6

## 🚀 Quick Setup

### Option 1: Using Configuration UI (Recommended)

1. **Access Configuration Page:**
   - Development: http://localhost:3002/ai-config
   - Production: https://www.shahin-ai.com/ai-config

2. **Configure Services:**
   - Fill in API keys and settings for each service
   - Click "💾 Save" for each service
   - Click "🧪 Test" to verify connection
   - Click "💾 Save All Configurations" to save everything

3. **Restart Backend:**
   ```bash
   cd backend
   npm start
   ```

### Option 2: Manual Configuration (Environment Variables)

Edit `backend/.env` file:

```env
# Local LLM (Priority 1)
LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
LOCAL_LLM_MODEL=llama-3.2-3b-instruct
LOCAL_LLM_TYPE=ollama

# OpenAI (Priority 2)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Google Gemini (Priority 3)
GOOGLE_GEMINI_API_KEY=AIza...
GOOGLE_GEMINI_MODEL=gemini-pro

# Azure OpenAI (Priority 4)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_MODEL=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# AWS Bedrock (Priority 5)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_MODEL=anthropic.claude-3-sonnet-20240229-v1:0

# Anthropic Claude (Priority 6)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

## 🔑 Getting API Keys

### 1. OpenAI
- **Website:** https://platform.openai.com/api-keys
- **Steps:**
  1. Sign up/login to OpenAI
  2. Go to API Keys section
  3. Create new secret key
  4. Copy the key (starts with `sk-`)
  5. Paste in configuration

### 2. Google Gemini
- **Website:** https://makersuite.google.com/app/apikey
- **Steps:**
  1. Sign in with Google account
  2. Click "Get API Key"
  3. Create API key in new project
  4. Copy the key (starts with `AIza`)
  5. Paste in configuration

### 3. Azure OpenAI
- **Website:** https://azure.microsoft.com/services/cognitive-services/openai-service/
- **Steps:**
  1. Create Azure account
  2. Create OpenAI resource
  3. Get endpoint URL and API key
  4. Create deployment (e.g., gpt-4)
  5. Paste endpoint and key in configuration

### 4. AWS Bedrock
- **Website:** https://aws.amazon.com/bedrock/
- **Steps:**
  1. Create AWS account
  2. Enable Bedrock service
  3. Create IAM user with Bedrock access
  4. Get Access Key ID and Secret Access Key
  5. Select region (e.g., us-east-1)
  6. Paste credentials in configuration

### 5. Anthropic Claude
- **Website:** https://console.anthropic.com/
- **Steps:**
  1. Sign up/login to Anthropic
  2. Go to API Keys section
  3. Create new API key
  4. Copy the key (starts with `sk-ant-`)
  5. Paste in configuration

## 🧪 Testing Services

### Using Configuration UI:
1. Click "🧪 Test" button for each service
2. Check status message for results

### Using API:
```bash
# Test OpenAI
curl -X POST http://localhost:3001/api/admin/test-service \
  -H "Content-Type: application/json" \
  -d '{"service": "openai"}'

# Test Google Gemini
curl -X POST http://localhost:3001/api/admin/test-service \
  -H "Content-Type: application/json" \
  -d '{"service": "googleGemini"}'

# Test Local LLM
curl -X POST http://localhost:3001/api/admin/test-service \
  -H "Content-Type: application/json" \
  -d '{"service": "localLLM"}'
```

## 🔄 Service Routing

The application automatically routes requests to available services in priority order:

1. **Local LLM** (if available)
2. **OpenAI** (if configured)
3. **Google Gemini** (if configured)
4. **Azure OpenAI** (if configured)
5. **AWS Bedrock** (if configured)
6. **Anthropic Claude** (if configured)

If a service fails, the system automatically tries the next available service.

## 📊 Monitoring

### Check Service Status:
```bash
# Get all service statuses
curl http://localhost:3001/api/ai/health

# Get agent status
curl http://localhost:3001/api/agent/status

# Get configuration
curl http://localhost:3001/api/admin/config
```

## 🔒 Security Best Practices

1. **Never commit API keys to Git:**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Rotate API keys regularly:**
   - Update keys every 90 days
   - Revoke old keys immediately

3. **Use separate keys for development/production:**
   - Different keys for different environments
   - Monitor usage per environment

4. **Set usage limits:**
   - Configure spending limits in provider dashboards
   - Monitor API usage regularly

5. **Restrict API key permissions:**
   - Use least privilege principle
   - Restrict to required services only

## 🐛 Troubleshooting

### Service Not Connecting:
1. **Check API key:** Verify key is correct and not expired
2. **Check endpoint:** Verify endpoint URL is correct
3. **Check network:** Ensure server can reach API endpoints
4. **Check logs:** Review server logs for error messages
5. **Test manually:** Use curl or Postman to test API directly

### Service Failing:
1. **Check quota:** Verify API quota not exceeded
2. **Check billing:** Ensure billing is set up correctly
3. **Check region:** Verify region is correct (for AWS/Azure)
4. **Check model:** Verify model name is correct
5. **Check permissions:** Verify API key has required permissions

### Configuration Not Saving:
1. **Check file permissions:** Ensure .env file is writable
2. **Check file path:** Verify .env file is in backend/ directory
3. **Restart server:** Restart backend server after configuration changes
4. **Check logs:** Review server logs for error messages

## 📝 Example Configuration

### Minimum Configuration (OpenAI only):
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4
```

### Full Configuration (All services):
```env
# Local LLM
LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
LOCAL_LLM_MODEL=llama-3.2-3b-instruct
LOCAL_LLM_TYPE=ollama

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Google Gemini
GOOGLE_GEMINI_API_KEY=AIza...
GOOGLE_GEMINI_MODEL=gemini-pro

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_MODEL=gpt-4

# AWS Bedrock
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_MODEL=anthropic.claude-3-sonnet-20240229-v1:0

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

## 🎯 Next Steps

1. **Configure at least one service** (recommended: OpenAI)
2. **Test the service** using the test button
3. **Restart backend server**
4. **Test chat functionality** in the application
5. **Monitor usage** and adjust as needed

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Azure OpenAI Documentation](https://learn.microsoft.com/azure/ai-services/openai/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Anthropic Claude Documentation](https://docs.anthropic.com/)

---

**Last Updated:** 2025-01-XX  
**Version:** 2.0.0

