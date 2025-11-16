# 🔧 Backend Setup Guide - Fix AI Agent Connection

## ⚠️ Problem

**Error**: "Agent not connected to AI service. Please check service configuration."

This means:
1. Backend server is not running, OR
2. Backend is not accessible at `api.shahin-ai.com`, OR
3. No AI service API keys are configured

## ✅ Solution

### Step 1: Set Up Backend Server

#### Option A: Run Backend Locally with Cloudflare Tunnel (Recommended)

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables:**
   - Create `backend/.env` file
   - Add at least one AI service API key (see Step 2)

3. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:3001`

4. **Set Up Cloudflare Tunnel:**
   ```bash
   # Install cloudflared
   winget install --id Cloudflare.cloudflared

   # Login
   cloudflared tunnel login

   # Create tunnel
   cloudflared tunnel create shahin-api

   # Run tunnel
   cloudflared tunnel run shahin-api
   ```

5. **Configure Tunnel in Cloudflare Dashboard:**
   - Go to: https://one.dash.cloudflare.com
   - Zero Trust → Networks → Tunnels
   - Select: `shahin-api`
   - Add public hostname: `api.shahin-ai.com`
   - Service: `http://localhost:3001`

#### Option B: Deploy Backend to Cloud Server

Deploy backend to:
- Azure Container Apps
- AWS EC2
- DigitalOcean
- Any cloud provider

Point `api.shahin-ai.com` to your backend server.

---

### Step 2: Configure AI Service API Keys

The backend needs **at least one** AI service configured. Choose one:

#### Option 1: OpenAI (Easiest)

1. **Get OpenAI API Key:**
   - Go to: https://platform.openai.com/api-keys
   - Create new API key
   - Copy the key

2. **Add to `backend/.env`:**
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   OPENAI_MODEL=gpt-4
   ```

3. **Restart backend server**

#### Option 2: Google Gemini (Free Tier Available)

1. **Get Google Gemini API Key:**
   - Go to: https://makersuite.google.com/app/apikey
   - Create new API key
   - Copy the key

2. **Add to `backend/.env`:**
   ```env
   GOOGLE_GEMINI_API_KEY=your-gemini-api-key-here
   GOOGLE_GEMINI_MODEL=gemini-pro
   ```

3. **Restart backend server**

#### Option 3: Azure OpenAI

1. **Get Azure OpenAI Credentials:**
   - Azure Portal → Azure OpenAI
   - Get endpoint and API key

2. **Add to `backend/.env`:**
   ```env
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
   AZURE_OPENAI_KEY=your-azure-openai-key
   AZURE_OPENAI_DEPLOYMENT=gpt-4
   AZURE_OPENAI_MODEL=gpt-4
   ```

3. **Restart backend server**

#### Option 4: Anthropic Claude

1. **Get Anthropic API Key:**
   - Go to: https://console.anthropic.com
   - Create API key
   - Copy the key

2. **Add to `backend/.env`:**
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
   ANTHROPIC_MODEL=claude-3-sonnet-20240229
   ```

3. **Restart backend server**

#### Option 5: Local LLM (Ollama/LM Studio)

1. **Install Ollama or LM Studio:**
   - Ollama: https://ollama.ai
   - LM Studio: https://lmstudio.ai

2. **Start Local LLM Server:**
   - Ollama: `ollama serve` (runs on port 11434)
   - LM Studio: Start local server (default port 1234)

3. **Add to `backend/.env`:**
   ```env
   LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
   LOCAL_LLM_MODEL=llama-3.2-3b-instruct
   LOCAL_LLM_TYPE=ollama
   ```

4. **Restart backend server**

---

### Step 3: Verify Backend is Running

1. **Check Backend Health:**
   ```bash
   curl http://localhost:3001/api/ai/health
   ```

2. **Check Agent Status:**
   ```bash
   curl http://localhost:3001/api/agent/status
   ```

3. **Test AI Service:**
   ```bash
   curl http://localhost:3001/api/agent/test
   ```

---

### Step 4: Verify Frontend Can Connect

1. **Check Frontend Environment Variables:**
   - Cloudflare Dashboard → Pages → Settings → Environment Variables
   - Verify: `VITE_API_URL` = `https://api.shahin-ai.com/api`

2. **Test Frontend Connection:**
   - Open: https://shahin-grc-landing.pages.dev
   - Open browser console (F12)
   - Check for API errors
   - Try to use AI agent

---

## 📋 Complete Backend .env File

Create `backend/.env` with at least one AI service:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=https://www.shahin-ai.com

# Database (Optional)
DATABASE_URL=postgresql://user:password@localhost:5432/shahin_grc

# JWT Secret
JWT_SECRET=your-jwt-secret-key-change-in-production

# Admin Secret
ADMIN_SECRET=your-admin-secret-change-in-production

# AI Services - Add at least ONE:

# Option 1: OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4

# Option 2: Google Gemini
# GOOGLE_GEMINI_API_KEY=your-gemini-api-key-here
# GOOGLE_GEMINI_MODEL=gemini-pro

# Option 3: Azure OpenAI
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
# AZURE_OPENAI_KEY=your-azure-openai-key
# AZURE_OPENAI_DEPLOYMENT=gpt-4
# AZURE_OPENAI_MODEL=gpt-4

# Option 4: Anthropic Claude
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
# ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Option 5: Local LLM
# LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
# LOCAL_LLM_MODEL=llama-3.2-3b-instruct
# LOCAL_LLM_TYPE=ollama
```

---

## 🚀 Quick Start Script

Run this to set up backend quickly:

```bash
# Windows
SETUP_BACKEND.bat

# Or manually:
cd backend
npm install
# Add API key to .env file
npm run dev
```

---

## 🔍 Troubleshooting

### Backend Not Accessible

1. **Check if backend is running:**
   ```bash
   curl http://localhost:3001/api/ai/health
   ```

2. **Check Cloudflare Tunnel:**
   ```bash
   cloudflared tunnel list
   cloudflared tunnel info shahin-api
   ```

3. **Check DNS:**
   - Verify `api.shahin-ai.com` points to Cloudflare
   - Check DNS records in Cloudflare Dashboard

### No AI Services Available

1. **Check API Keys:**
   ```bash
   # In backend directory
   node -e "require('dotenv').config(); console.log('OpenAI:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set')"
   ```

2. **Test AI Service:**
   ```bash
   curl http://localhost:3001/api/agent/test
   ```

3. **Check Backend Logs:**
   ```bash
   # Check backend console for errors
   ```

### Frontend Can't Connect

1. **Check Environment Variables:**
   - Cloudflare Dashboard → Pages → Settings → Environment Variables
   - Verify: `VITE_API_URL` = `https://api.shahin-ai.com/api`

2. **Check CORS:**
   - Backend must allow requests from frontend domain
   - Check `backend/server.js` CORS configuration

3. **Check Browser Console:**
   - Open browser console (F12)
   - Look for CORS or connection errors

---

## 📚 Related Documentation

- `ENVIRONMENT_VARIABLES.md` - Complete environment variables reference
- `LOCAL_LLM_SETUP.md` - Local LLM setup guide
- `AI_CONFIGURATION_GUIDE.md` - AI service configuration guide
- `SETUP_CLOUDFLARE_TUNNEL.bat` - Cloudflare Tunnel setup script

---

## ✅ Checklist

- [ ] Backend server running
- [ ] At least one AI service API key configured
- [ ] Backend accessible at `api.shahin-ai.com`
- [ ] Frontend environment variables set
- [ ] Agent status check passes
- [ ] AI service test passes
- [ ] Frontend can connect to backend

---

**After completing these steps, the AI agent should work!** 🎉

