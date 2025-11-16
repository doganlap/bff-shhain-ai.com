# Environment Variables Reference

## Frontend (Landing Page)

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_URL` | Backend API base URL | `https://api.shahin-ai.com/api` | `https://api.shahin-ai.com/api` |
| `VITE_FRONTEND_URL` | Frontend application URL | `https://www.shahin-ai.com` | `https://www.shahin-ai.com` |

### Local Development
```env
VITE_API_URL=http://localhost:3001
VITE_FRONTEND_URL=http://localhost:3002
```

### Production (Cloudflare)
```env
VITE_API_URL=https://api.shahin-ai.com/api
VITE_FRONTEND_URL=https://www.shahin-ai.com
```

### Setting in Cloudflare Pages
1. Go to Cloudflare Dashboard → Pages → Your Project
2. Go to Settings → Environment Variables
3. Add variables for Production, Preview, and Development
4. Redeploy after adding variables

---

## Backend (API Server)

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key-change-in-production` | Random 32+ character string |
| `PORT` | Server port | `3001` | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://www.shahin-ai.com` | `https://www.shahin-ai.com` |
| `NODE_ENV` | Environment mode | `development` | `production` |
| `ADMIN_SECRET` | Admin dashboard secret key | `admin-secret-change-in-production` | Strong random string |
| `LOCAL_LLM_ENDPOINT` | Local LLM server endpoint | `http://localhost:1234/v1` | `http://localhost:1234/v1` (Ollama/LM Studio) |
| `LOCAL_LLM_MODEL` | Local LLM model name | `llama-3.2-3b-instruct` | Model name in your LLM server |
| `LOCAL_LLM_TYPE` | Local LLM type | `ollama` | `ollama`, `lmstudio`, `custom` |
| `RFP_AGENT_API_ENDPOINT` | RFP Agent API endpoint | `http://localhost:8001/api/v1` | RFP Agent API URL |

### Optional Variables (AI Services - Top 5 Cloud Providers)

#### 1. OpenAI (GPT-4, GPT-3.5)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key | No | `sk-...` |
| `OPENAI_MODEL` | OpenAI model to use | No | `gpt-4`, `gpt-3.5-turbo`, `gpt-4-turbo`, `gpt-4o` |

#### 2. Google Gemini
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key | No | `AIza...` |
| `GOOGLE_GEMINI_MODEL` | Gemini model to use | No | `gemini-pro`, `gemini-pro-vision`, `gemini-1.5-pro` |

#### 3. Azure OpenAI (Microsoft)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | No | `https://your-resource.openai.azure.com` |
| `AZURE_OPENAI_KEY` | Azure OpenAI API key | No | `your-api-key` |
| `AZURE_OPENAI_DEPLOYMENT` | Azure deployment name | No | `gpt-4` |
| `AZURE_OPENAI_MODEL` | Azure model to use | No | `gpt-4`, `gpt-3.5-turbo` |
| `AZURE_OPENAI_API_VERSION` | Azure API version | No | `2024-02-15-preview` |

#### 4. AWS Bedrock (Amazon)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `AWS_ACCESS_KEY_ID` | AWS access key ID | No | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | No | `your-secret-key` |
| `AWS_BEDROCK_REGION` | AWS region | No | `us-east-1`, `us-west-2`, `eu-west-1` |
| `AWS_BEDROCK_MODEL` | Bedrock model to use | No | `anthropic.claude-3-sonnet-20240229-v1:0` |

#### 5. Anthropic Claude
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key | No | `sk-ant-...` |
| `ANTHROPIC_MODEL` | Claude model to use | No | `claude-3-sonnet-20240229`, `claude-3-opus-20240229`, `claude-3-haiku-20240307` |

#### Additional Services
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `AZURE_COMPUTER_VISION_ENDPOINT` | Azure Computer Vision endpoint | No | `https://your-resource.cognitiveservices.azure.com` |
| `AZURE_SPEECH_ENDPOINT` | Azure Speech endpoint | No | `https://your-resource.cognitiveservices.azure.com` |
| `AZURE_COGNITIVE_KEY` | Azure Cognitive Services key | No | `your-api-key` |
| `HUGGINGFACE_API_KEY` | Hugging Face API key | No | `hf_...` |

### Optional Variables (Email)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SMTP_HOST` | SMTP server host | No | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | No | `587` |
| `SMTP_USER` | SMTP username | No | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password | No | `your-password` |
| `SMTP_FROM` | Default from address | No | `noreply@shahin-ai.com` |

### Local Development
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shahin_ksa_compliance
JWT_SECRET=your-local-secret-key
PORT=3001
FRONTEND_URL=http://localhost:3002
NODE_ENV=development
```

### Production
```env
DATABASE_URL=postgresql://user:pass@host:port/database
JWT_SECRET=your-super-secret-production-key-min-32-chars
PORT=3001
FRONTEND_URL=https://www.shahin-ai.com
NODE_ENV=production

# AI Services (optional)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your-api-key
OPENAI_API_KEY=sk-...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_FROM=noreply@shahin-ai.com
```

---

## Security Notes

### JWT_SECRET
- **Must be at least 32 characters long**
- Use a strong random string in production
- Never commit to version control
- Generate using: `openssl rand -base64 32`

### DATABASE_URL
- Use connection pooling in production
- Never commit to version control
- Use SSL/TLS in production
- Format: `postgresql://user:password@host:port/database?sslmode=require`

### API Keys
- Never commit to version control
- Rotate regularly
- Use environment-specific keys
- Monitor usage and set limits

---

## Setting Environment Variables

### Frontend (Cloudflare Pages)
1. Go to Cloudflare Dashboard → Pages → Your Project
2. Go to Settings → Environment Variables
3. Add variables for each environment (Production, Preview, Development)
4. Variables are automatically available as `import.meta.env.VITE_*`

### Backend (Server)
1. Create `.env` file in `backend/` directory
2. Add variables in format: `KEY=value`
3. Load with `dotenv` package (already configured)
4. Never commit `.env` file to Git

### Backend (Docker)
```dockerfile
ENV DATABASE_URL=postgresql://...
ENV JWT_SECRET=...
```

### Backend (Cloudflare Workers)
1. Go to Cloudflare Dashboard → Workers → Your Worker
2. Go to Settings → Variables
3. Add environment variables
4. Access via `env.VARIABLE_NAME`

---

## Validation

### Frontend
- Variables must start with `VITE_` to be exposed to client
- Check in browser console: `console.log(import.meta.env)`
- Verify API calls use correct URL

### Backend
- Check on startup: Server logs show configuration
- Verify database connection on startup
- Test health endpoint: `GET /health`

---

## Troubleshooting

### Frontend: Variables not loading
- Ensure variables start with `VITE_`
- Rebuild after adding variables: `npm run build`
- Check browser console for errors
- Verify Cloudflare Pages environment variables are set

### Backend: Variables not loading
- Check `.env` file exists in `backend/` directory
- Verify `.env` file is not in `.gitignore` (should be ignored)
- Restart server after changing variables
- Check server logs for configuration errors

### CORS Errors
- Verify `FRONTEND_URL` matches actual frontend URL
- Check CORS configuration in `backend/server.js`
- Verify Cloudflare Pages URL is in allowed origins

---

## Example `.env` Files

### Frontend `.env.local` (for local development)
```env
VITE_API_URL=http://localhost:3001
VITE_FRONTEND_URL=http://localhost:3002
```

### Backend `.env` (for local development)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shahin_ksa_compliance
JWT_SECRET=local-development-secret-key-change-in-production
PORT=3001
FRONTEND_URL=http://localhost:3002
NODE_ENV=development
```

### Backend `.env.production` (for production)
```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=your-super-secret-production-key-min-32-characters-long
PORT=3001
FRONTEND_URL=https://www.shahin-ai.com
NODE_ENV=production

AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your-api-key
OPENAI_API_KEY=sk-...

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_FROM=noreply@shahin-ai.com
```

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0

