# Local LLM Setup Guide - Direct Connection to D:\LLM

## Overview

The Shahin GRC backend now supports **direct connection to local LLM** services running in `D:\LLM` directory. This allows you to use local AI models without relying on cloud services.

## Supported Local LLM Services

1. **Ollama** - Recommended for local LLM
2. **LM Studio** - Easy-to-use GUI for local LLM
3. **RFP Agent API** - Custom API in D:\LLM\AGent\backend
4. **Custom LLM Server** - Any OpenAI-compatible API

## Quick Setup

### Option 1: Ollama (Recommended)

#### 1. Install Ollama
```bash
# Download from https://ollama.ai/
# Or use winget on Windows
winget install Ollama.Ollama
```

#### 2. Start Ollama Service
```bash
# Ollama runs as a service on Windows
# Check if running:
ollama serve

# Or start in background:
ollama serve &
```

#### 3. Download Model
```bash
# Download a model (Arabic support recommended)
ollama pull llama3.2:3b
# Or
ollama pull qwen2.5:3b
```

#### 4. Configure Backend
```env
# In backend/.env
LOCAL_LLM_ENDPOINT=http://localhost:11434/v1
LOCAL_LLM_MODEL=llama3.2:3b
LOCAL_LLM_TYPE=ollama
```

#### 5. Test Connection
```bash
# Test from backend
curl http://localhost:11434/v1/models

# Test from Node.js backend
curl http://localhost:3001/api/local-llm/health
```

### Option 2: LM Studio

#### 1. Install LM Studio
- Download from https://lmstudio.ai/
- Install and launch

#### 2. Download Model
- Open LM Studio
- Go to "Search" tab
- Search for "llama-3.2-3b-instruct" or "qwen2.5-3b"
- Download Q4_K_M quantized version (~2-3GB)

#### 3. Start Local Server
- Go to "Local Server" tab in LM Studio
- Click "Start Server"
- Server runs on `http://localhost:1234`

#### 4. Configure Backend
```env
# In backend/.env
LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
LOCAL_LLM_MODEL=llama-3.2-3b-instruct
LOCAL_LLM_TYPE=lmstudio
```

#### 5. Test Connection
```bash
curl http://localhost:1234/v1/models
curl http://localhost:3001/api/local-llm/health
```

### Option 3: RFP Agent API (D:\LLM\AGent\backend)

#### 1. Start RFP Agent Backend
```bash
cd D:\LLM\AGent\backend

# Activate virtual environment
.\venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --port 8001
```

#### 2. Configure Backend
```env
# In backend/.env
RFP_AGENT_API_ENDPOINT=http://localhost:8001/api/v1
```

#### 3. Test Connection
```bash
curl http://localhost:8001/api/v1/health/live
```

## Configuration

### Environment Variables

Add to `backend/.env`:

```env
# Local LLM Configuration
LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
LOCAL_LLM_MODEL=llama-3.2-3b-instruct
LOCAL_LLM_TYPE=ollama

# RFP Agent API (optional)
RFP_AGENT_API_ENDPOINT=http://localhost:8001/api/v1
```

### Default Configuration

If not configured, backend will use:
- **Endpoint:** `http://localhost:1234/v1` (LM Studio default)
- **Model:** `llama-3.2-3b-instruct`
- **Type:** `ollama`

## API Endpoints

### Health Check
```bash
GET /api/local-llm/health
```

**Response:**
```json
{
  "status": "healthy",
  "endpoint": "http://localhost:1234/v1",
  "model": "llama-3.2-3b-instruct",
  "available": true
}
```

### List Models
```bash
GET /api/local-llm/models
```

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "id": "llama-3.2-3b-instruct",
      "name": "llama-3.2-3b-instruct"
    }
  ],
  "endpoint": "http://localhost:1234/v1"
}
```

### Chat with Local LLM
```bash
POST /api/local-llm/chat
Content-Type: application/json

{
  "message": "مرحباً، كيف يمكنني المساعدة؟",
  "model": "llama-3.2-3b-instruct",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "أهلاً وسهلاً! أنا هنا لمساعدتك...",
  "model": "llama-3.2-3b-instruct",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  },
  "source": "Local LLM"
}
```

### Generate Text
```bash
POST /api/local-llm/generate
Content-Type: application/json

{
  "prompt": "اكتب فقرة عن الحوكمة",
  "model": "llama-3.2-3b-instruct",
  "temperature": 0.7,
  "max_tokens": 500
}
```

## Integration with AI Agent

The local LLM is automatically integrated into the AI routing system:

1. **Priority 1:** Local LLM (direct connection)
2. **Priority 2:** RFP Agent API (if running)
3. **Priority 3:** Azure OpenAI (cloud fallback)
4. **Priority 4:** OpenAI Public API (cloud fallback)
5. **Priority 5:** Local fallback (simple responses)

### Automatic Fallback

If local LLM is not available, the system automatically falls back to cloud services or local fallback responses.

## Testing

### Test Local LLM Connection
```bash
# From backend directory
node -e "
const fetch = require('node-fetch');
fetch('http://localhost:3001/api/local-llm/health')
  .then(r => r.json())
  .then(console.log);
"
```

### Test Chat Endpoint
```bash
curl -X POST http://localhost:3001/api/local-llm/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "مرحباً",
    "model": "llama-3.2-3b-instruct"
  }'
```

### Test AI Agent Integration
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "مرحباً، كيف يمكنني المساعدة؟"
  }'
```

## Troubleshooting

### Local LLM Not Available

**Error:** `Local LLM server not available`

**Solutions:**
1. Check if Ollama/LM Studio is running
2. Verify endpoint URL is correct
3. Check if model is downloaded
4. Verify port is not blocked by firewall

```bash
# Check Ollama
ollama list

# Check LM Studio
# Open LM Studio and check "Local Server" tab

# Test endpoint directly
curl http://localhost:1234/v1/models
```

### Connection Timeout

**Error:** `Connection timeout`

**Solutions:**
1. Increase timeout in code (default: 30 seconds)
2. Check if LLM server is responding
3. Verify network connectivity
4. Check if model is loaded in memory

### Model Not Found

**Error:** `Model not found`

**Solutions:**
1. Download the model first
2. Verify model name is correct
3. Check if model is available in LLM server

```bash
# List available models
ollama list

# Or in LM Studio, check "Models" tab
```

### Slow Response

**Solutions:**
1. Use smaller quantized models (Q4_K_M instead of Q8_0)
2. Reduce max_tokens
3. Use GPU acceleration if available
4. Close other applications using GPU

## Performance Optimization

### Recommended Models

- **Fast & Small:** llama-3.2-1b-instruct (1B parameters, ~700MB)
- **Balanced:** llama-3.2-3b-instruct (3B parameters, ~2GB)
- **Better Quality:** qwen2.5-7b-instruct (7B parameters, ~4GB)

### Quantization

Use quantized models for better performance:
- **Q4_K_M:** Good balance (recommended)
- **Q3_K_S:** Faster, lower quality
- **Q8_0:** Slower, better quality

### GPU Acceleration

For faster inference:
1. Use NVIDIA GPU with CUDA
2. Install CUDA drivers
3. Use GPU-accelerated LLM server (vLLM, TensorRT-LLM)

## Security

### Local LLM Benefits

- **Privacy:** Data never leaves your machine
- **Cost:** No API costs
- **Speed:** No network latency
- **Control:** Full control over models and data

### Security Considerations

- Local LLM runs on your machine (secure)
- No data sent to external servers
- Can use offline models
- Full control over data processing

## Monitoring

### Check Local LLM Status

```bash
# Health check
curl http://localhost:3001/api/local-llm/health

# List models
curl http://localhost:3001/api/local-llm/models

# AI Agent health (includes local LLM status)
curl http://localhost:3001/api/ai/health
```

### Admin Dashboard

Access admin dashboard to monitor local LLM:
- URL: `http://localhost:3001/admin`
- Check "System Health" section
- View "Local LLM" status

## Next Steps

1. **Install Ollama or LM Studio**
2. **Download a model**
3. **Configure backend environment variables**
4. **Test connection**
5. **Start using local LLM in AI Agent**

## Support

For issues:
1. Check troubleshooting section
2. Verify LLM server is running
3. Check backend logs
4. Test endpoint directly
5. Review environment variables

---

**Status:** ✅ Local LLM integration complete  
**Last Updated:** 2025-01-XX  
**Version:** 2.1.0

