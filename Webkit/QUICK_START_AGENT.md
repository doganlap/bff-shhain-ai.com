# Quick Start - Agent with External LLM Connection

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Local LLM (Ollama)

```bash
# Download Ollama from https://ollama.ai/
# Or use winget
winget install Ollama.Ollama

# Start Ollama
ollama serve

# Download model
ollama pull llama3.2:3b
```

### Step 2: Configure Backend

Create `backend/.env`:

```env
LOCAL_LLM_ENDPOINT=http://localhost:11434/v1
LOCAL_LLM_MODEL=llama3.2:3b
LOCAL_LLM_TYPE=ollama
PORT=3001
FRONTEND_URL=http://localhost:3002
```

### Step 3: Start Backend

```bash
cd backend
npm install
npm start
```

### Step 4: Test Agent Connection

```bash
# In another terminal
cd backend
npm run test:agent
```

### Step 5: Start Frontend

```bash
cd landing-page
npm install
npm run dev
```

## ✅ Verify Agent is Connected

1. Open browser: `http://localhost:3002`
2. Click on AI Agent icon (bottom right)
3. Check status: Should show "Connected"
4. Send a test message
5. Verify response from LLM

## 🧪 Test Endpoints

```bash
# Agent Status
curl http://localhost:3001/api/agent/status

# Agent Health
curl http://localhost:3001/api/agent/health

# Test Before Deployment
curl http://localhost:3001/api/agent/test

# Chat (requires agent connected)
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "مرحباً"}'
```

## 📝 Notes

- Agent **must** be connected to external LLM/Cloud AI
- No local fallback - requires real AI service
- Frontend controls agent connection
- Auto-reconnect every 30 seconds
- Test before deployment: `npm run test:agent`

## 🔧 Alternative: Use Cloud AI

If you don't want to use Local LLM:

```env
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your-api-key

# OR OpenAI Public API
OPENAI_API_KEY=sk-...
```

## 🐛 Troubleshooting

### Agent Not Connecting
- Check Ollama is running: `ollama list`
- Verify endpoint: `curl http://localhost:11434/v1/models`
- Check backend logs
- Run test: `npm run test:agent`

### Chat Not Working
- Ensure agent is connected
- Check backend logs for errors
- Verify LLM service is responding
- Test endpoint directly

---

**Ready to deploy!** 🎉

