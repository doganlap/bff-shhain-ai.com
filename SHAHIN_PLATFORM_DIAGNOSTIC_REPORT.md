# Shahin Platform – Deployment & Architecture Diagnostic (READ-ONLY)

## Executive Summary

This diagnostic report provides a comprehensive analysis of the Shahin GRC platform codebase, identifying the current deployment state, architecture components, and critical gaps that need to be addressed to bring the full platform online.

**Current Status**: Only the landing page (www.shahin-ai.com) is deployed. The main dashboard and backend services exist but are not operational in production.

## 1. Repo Overview

The Shahin GRC platform is a monorepo containing a comprehensive governance, risk management, and compliance (GRC) ecosystem with multiple applications and services.

**Repository Structure:**
```
Assessmant-GRC/
├── apps/
│   ├── web/                    # Main React dashboard application
│   ├── bff/                    # Backend-for-Frontend API gateway
│   ├── cli-bridge/             # Command-line interface
│   ├── infra/                  # Infrastructure and deployment configs
│   └── ABI/                    # Architecture and integration docs
├── Documentation files         # Extensive documentation and guides
└── Configuration files         # Deployment and environment configs
```

**Main Applications & Services:**
- **Web App**: React+Vite dashboard with comprehensive GRC features
- **BFF Service**: Express.js API gateway with microservices architecture
- **Landing Page**: Dedicated marketing site (currently deployed)
- **CLI Bridge**: Command-line tools for system management
- **Infrastructure**: Docker, Kubernetes, and deployment configurations

## 2. Frontend Apps

### Main Web Application (`apps/web`)
- **Framework**: React 18 + Vite + TypeScript + TailwindCSS
- **Port**: 5173 (development), 4173 (preview)
- **Build**: `pnpm run build`
- **Dev Server**: `pnpm run dev`
- **Testing**: Vitest + Playwright for E2E testing
- **Key Features**:
  - Multi-tenant GRC dashboard
  - AI-powered assessments and recommendations
  - Regulatory compliance tracking
  - Risk management and frameworks
  - Document and evidence management
  - User management with RBAC

**Environment Variables Required:**
```env
VITE_BFF_URL=https://assessmant-grc.vercel.app/api
VITE_API_URL=https://assessmant-grc.vercel.app
VITE_WS_URL=wss://assessmant-grc.vercel.app
VITE_AZURE_OPENAI_KEY=your_azure_openai_key
VITE_OPENAI_API_KEY=your_openai_key
VITE_HUGGINGFACE_API_KEY=your_huggingface_key
VITE_AZURE_OPENAI_ENDPOINT=https://shahin-openai.openai.azure.com
```

**Deployment Target**: Vercel (configured in `apps/web/vercel.json`)

### Landing Page (`apps/web/www.shahin.com/landing-page`)
- **Framework**: React + Vite
- **Status**: ✅ Currently deployed at www.shahin-ai.com
- **Purpose**: Marketing and lead generation
- **Features**: Multi-language support, contact forms, pricing
- **Deployment**: Separate Vercel project

## 3. Backend / BFF / APIs

### BFF Service (`apps/bff`)
- **Framework**: Express.js + Node.js 20
- **Port**: 3005 (default)
- **Database**: PostgreSQL 15 with Prisma ORM
- **Architecture**: API Gateway with service registry pattern

**Core Capabilities:**
- Multi-tenant isolation and RBAC
- JWT-based authentication with refresh tokens
- Rate limiting and security middleware
- Audit logging and compliance tracking
- Service proxying to microservices
- AI service orchestration
- File upload and document processing

**Service Registry (Internal Microservices):**
```javascript
{
  'grc-api': 'http://grc-api:3000',           // Core GRC functionality
  'auth-service': 'http://auth-service:3001', // Authentication
  'partner-service': 'http://partner-service:3003', // Partner management
  'notification-service': 'http://notification-service:3004', // Notifications
  'ai-scheduler-service': 'http://ai-scheduler-service:3005', // AI tasks
  'rag-service': 'http://rag-service:3006',   // Document RAG
  'regulatory-intelligence-ksa': 'http://regulatory-intelligence-ksa:3008'
}
```

**Environment Variables Required:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/grc_db
JWT_SECRET=your_jwt_secret_key
SERVICE_TOKEN=internal_service_token
OPENAI_API_KEY=your_openai_key
AZURE_OPENAI_ENDPOINT=https://shahin-openai.openai.azure.com
FRONTEND_ORIGINS=https://app-shahin-ai-com.vercel.app,http://localhost:5173
```

**Health Endpoint**: `/health` - Returns service status and connectivity

**Deployment**: Vercel serverless functions with Node.js 20 runtime

## 4. Database & Storage

### Database Configuration
- **Type**: PostgreSQL 15
- **ORM**: Prisma with multiple schema variants
- **Connection**: Environment-based configuration
- **Multi-tenancy**: Row-level security (RLS) implemented

**Schema Files:**
- `schema.prisma`: Main production schema
- `schema_main.prisma`: Core business entities
- `schema_extended.prisma`: Advanced features
- `schema_vector.prisma`: Vector/RAG capabilities
- `schema_poc.prisma`: Proof of concept tables

**Key Entities:**
- Users, Organizations, Tenants
- Frameworks, Controls, Risks
- Assessments, Evidence, Documents
- Audit Logs, Notifications, Workflows
- AI Agents, RAG Documents

### Storage Systems
- **File Uploads**: Multer with memory storage
- **Document Management**: Evidence and compliance documents
- **Backup System**: Automated PostgreSQL backups
- **Export/Import**: CSV and JSON data exchange

## 5. AI & External Integrations

### AI Service Providers

#### 1. Azure OpenAI (Primary)
- **Endpoint**: `https://shahin-openai.openai.azure.com`
- **Models**: GPT-4, GPT-4 Vision Preview
- **Use Cases**: Chat, document analysis, assessments
- **Files**: `apps/web/src/components/landing/FloatingAIAgent.jsx`

#### 2. OpenAI API (Fallback)
- **Endpoint**: `https://api.openai.com/v1/`
- **Models**: GPT-4, GPT-4 Vision
- **Use Cases**: General AI capabilities
- **Environment**: `VITE_OPENAI_API_KEY`

#### 3. Azure Cognitive Services
- **Vision**: Computer Vision API for image analysis
- **Speech**: Speech-to-text services
- **Endpoint**: `https://shahin-vision.cognitiveservices.azure.com`
- **Use Cases**: Document OCR, image analysis

#### 4. HuggingFace Inference
- **Models**: DialoGPT-large, BLIP image captioning
- **Use Cases**: Alternative AI capabilities
- **Environment**: `VITE_HUGGINGFACE_API_KEY`

#### 5. Local LLM (Ollama)
- **Endpoint**: `http://localhost:11434`
- **Use Cases**: Development and local AI processing
- **Status**: Fallback for offline development

### Integration Architecture
- **RAG Service**: Document embedding and retrieval
- **AI Scheduler**: Automated task processing
- **Multi-provider Fallback**: Automatic service switching
- **Health Monitoring**: Service availability checks

## 6. Vercel / Azure / Docker Deployment Notes

### Vercel Deployments

#### Main Application
- **URL**: `https://assessmant-grc.vercel.app` (not currently deployed)
- **Build**: React+Vite with serverless functions
- **Functions**: BFF API endpoints
- **Regions**: US East (iad1)

#### Landing Page
- **URL**: `https://www.shahin-ai.com` ✅ ACTIVE
- **Build**: Static React build
- **Status**: Fully operational

### Docker Infrastructure
- **Multi-stage builds** for production optimization
- **PostgreSQL** container with health checks
- **Nginx** reverse proxy with SSL termination
- **Development** and **production** configurations

### Azure Integration
- **Container Apps**: Microservices deployment ready
- **Cognitive Services**: AI capabilities configured
- **Storage**: Blob storage for documents
- **Key Vault**: Secret management (recommended)

### Infrastructure Components
- **Load Balancing**: Nginx and HAProxy configurations
- **SSL/TLS**: Let's Encrypt certificates
- **Monitoring**: Sentry integration configured
- **Caching**: Varnish cache layer

## 7. Risks & Gaps (NO FIXES, JUST NOTES)

### 🚨 Critical Deployment Issues

#### Application Deployment
- **Main Dashboard**: Not deployed - only landing page is live
- **BFF Service**: Configuration exists but deployment status unclear
- **Database**: Production database connection not verified
- **Microservices**: Service registry references may be pointing to localhost

#### Configuration & Environment
- **Missing API Keys**: AI service keys appear to use defaults
- **Service URLs**: Hard-coded localhost references in configs
- **CORS Issues**: Complex cross-origin configuration may fail
- **Environment Variables**: Many required variables not set in production

#### Security Concerns
- **JWT Secrets**: Using fallback default values
- **Service Tokens**: Default tokens in configuration files
- **Database Access**: Shadow database URL may be exposed
- **SSL Termination**: Some services may lack proper HTTPS

#### Architecture Risks
- **Service Discovery**: No clear service discovery mechanism
- **Health Monitoring**: Limited health check endpoints
- **Load Balancing**: Unclear load distribution strategy
- **Failover**: No documented failover procedures

#### Data Management
- **Migration State**: Multiple schema files suggest complex migration history
- **Backup Strategy**: Automated backups exist but restoration untested
- **Data Consistency**: Multi-tenant data isolation needs verification
- **Export/Import**: Data migration tools present but usage unclear

#### AI Integration Issues
- **Service Availability**: AI endpoints may not be accessible
- **API Rate Limits**: No rate limiting for external AI services
- **Fallback Logic**: Multi-provider fallback may not work properly
- **Cost Management**: No monitoring of AI service usage/costs

#### Performance & Scalability
- **Caching Strategy**: Varnish configured but may not be optimized
- **Database Indexes**: No performance indexing strategy documented
- **CDN**: No content delivery network configuration
- **Resource Limits**: No defined resource constraints

### 🔍 Investigation Required

1. **Verify current Vercel deployments** and their actual status
2. **Check environment variable configuration** in production
3. **Test database connectivity** and migration status
4. **Validate AI service integrations** and API key setup
5. **Review service health endpoints** and monitoring
6. **Assess security configurations** and SSL certificates
7. **Document backup and recovery procedures**
8. **Test multi-tenant isolation** and data security

### 📋 Next Steps for Platform Restoration

1. **Deploy Main Application**: Bring the dashboard online
2. **Configure Production Environment**: Set all required variables
3. **Verify Database**: Ensure proper connection and migrations
4. **Test AI Integrations**: Validate all AI service connections
5. **Implement Monitoring**: Set up comprehensive health checks
6. **Security Audit**: Review and secure all configurations
7. **Performance Testing**: Validate system under load
8. **Documentation**: Create operational runbooks

---

**Report Generated**: 2025-11-16  
**Status**: Diagnostic Complete - No Modifications Made  
**Next Action**: Platform restoration planning required