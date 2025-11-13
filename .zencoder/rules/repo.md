---
description: Repository Information Overview
alwaysApply: true
---

# GRC Assessment Ecosystem Information

## Repository Summary
A comprehensive Governance, Risk, and Compliance (GRC) assessment platform built as a microservices ecosystem. Features Arabic-English bilingual support, AI-powered analytics, and enterprise-grade security with multi-tenant architecture.

## Repository Structure
**Main Components**:
- **apps/**: Application layer containing frontend, BFF, and microservices
- **infra/**: Infrastructure configurations (Docker, Kubernetes, monitoring)
- **database-GRC/**: Database schemas, migrations, and data files
- **docs/**: Comprehensive documentation and guides
- **contracts/**: API contracts and event schemas
- **ABI/**: Architecture and Business Intelligence documentation

### Main Repository Components
- **Frontend (React/Vite)**: Modern glass-morphic UI with RTL support
- **BFF (Backend for Frontend)**: API gateway and request routing
- **Microservices**: 10+ specialized services for different domains
- **Infrastructure**: Docker, Kubernetes, and monitoring configurations
- **Database**: PostgreSQL with comprehensive GRC data models

## Projects

### Frontend Application (React/Vite)
**Configuration File**: apps/web/package.json

#### Language & Runtime
**Language**: JavaScript/TypeScript  
**Version**: React 18.3.1  
**Build System**: Vite 5.0.0  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- react@^18.3.1, react-dom@^18.3.1, react-router-dom@^6.30.1
- @tanstack/react-query@^5.90.7, axios@^1.13.2
- @headlessui/react@^2.2.9, @heroicons/react@^2.2.0
- tailwindcss@^3.4.18, framer-motion@^12.23.24
- i18next@^23.7.6, react-i18next@^13.5.0

**Development Dependencies**:
- vite@^7.2.2, @vitejs/plugin-react@^5.1.0
- vitest@^4.0.8, @testing-library/react@^16.3.0

#### Build & Installation
```bash
cd apps/web && npm install
npm run dev
npm run build
```

### BFF (Backend for Frontend)
**Configuration File**: apps/bff/package.json

#### Language & Runtime
**Language**: Node.js  
**Version**: >=18.0.0  
**Build System**: Express.js  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express@^4.21.2, cors@^2.8.5, helmet@^8.1.0
- http-proxy-middleware@^3.0.5, jsonwebtoken@^9.0.2
- ioredis@^5.3.2, pg@^8.16.3

#### Build & Installation
```bash
cd apps/bff && npm install
npm run dev
npm start
```

### GRC API Service
**Configuration File**: apps/services/grc-api/package.json

#### Language & Runtime
**Language**: Node.js  
**Version**: >=18.0.0  
**Build System**: Express.js  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express@^4.21.2, pg@^8.16.3, joi@^18.0.1
- @azure/ai-form-recognizer@^5.1.0, @azure/openai@^2.0.0
- @qdrant/js-client-rest@^1.15.1, pdf-parse@^2.4.5
- bcryptjs@^2.4.3, jsonwebtoken@^9.0.2

#### Build & Installation
```bash
cd apps/services/grc-api && npm install
npm run dev
npm run db:setup
```

#### Testing
**Framework**: Jest  
**Test Location**: __tests__/  
**Configuration**: jest.config.js  
**Run Command**:
```bash
npm test
```

### Authentication Service
**Configuration File**: apps/services/auth-service/package.json

#### Language & Runtime
**Language**: Node.js  
**Version**: >=18.0.0  
**Build System**: Express.js  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express@^4.21.2, jsonwebtoken@^9.0.2, bcryptjs@^2.4.3
- @azure/msal-node@^3.8.1, passport-azure-ad@^4.3.5
- pg@^8.16.3, joi@^18.0.1

#### Build & Installation
```bash
cd apps/services/auth-service && npm install
npm run dev
```

#### Docker
**Dockerfile**: apps/services/auth-service/Dockerfile  
**Development**: apps/services/auth-service/Dockerfile.dev

#### Testing
**Framework**: Jest  
**Run Command**:
```bash
npm test
```

### ML Analytics Service
**Configuration File**: apps/services/ml-analytics/package.json

#### Language & Runtime
**Language**: Node.js  
**Version**: >=16.0.0  
**Build System**: Express.js with TensorFlow.js  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- @tensorflow/tfjs-node@^4.14.0, brain.js@^2.0.0-beta.23
- natural@^6.5.0, compromise@^14.10.0, sentiment@^5.0.2
- bull@^4.12.2, redis@^4.6.10, winston@^3.11.0

#### Build & Installation
```bash
cd apps/services/ml-analytics && npm install
npm run train:models
npm run dev
```

### FastAPI Service (Python)
**Configuration File**: apps/services/example-api-fastapi/pyproject.toml

#### Language & Runtime
**Language**: Python  
**Version**: 3.8+  
**Build System**: FastAPI with uvicorn  
**Package Manager**: pip

#### Dependencies
**Main Dependencies**:
- fastapi, uvicorn[standard], pydantic-settings

#### Build & Installation
```bash
cd apps/services/example-api-fastapi
pip install -e .
uvicorn app.main:app --reload
```

## Docker Configuration
**Main Compose File**: infra/docker/docker-compose.yml  
**Production**: infra/deployment/docker-compose.production.yml  
**Development**: infra/docker/docker-compose.dev.yml

**Key Images**:
- postgres:15-alpine (Database)
- node:18-alpine (Services)
- nginx:alpine (Reverse proxy)

**Services**: 10+ containerized microservices with health checks

#### Build & Deployment
```bash
docker-compose -f infra/docker/docker-compose.ecosystem.yml up -d
npm run docker:production:build
npm run docker:production:up
```

## Testing Framework
**Primary Framework**: Jest (Node.js services)  
**Frontend Testing**: Vitest with Testing Library  
**Test Locations**: __tests__/ directories in each service  
**Configuration Files**: jest.config.js per service

**Run All Tests**:
```bash
npm test
```

## Key Features
- **Microservices Architecture**: 10+ specialized services
- **Bilingual Support**: Arabic-English with RTL layout
- **AI Integration**: Multiple AI providers (OpenAI, Azure, Google)
- **Enterprise Security**: JWT, RBAC, multi-tenant architecture
- **Modern Frontend**: React 18 with Vite and Tailwind CSS
- **Comprehensive Testing**: Jest and Vitest across all components
- **Production Ready**: Docker, Kubernetes, monitoring configurations