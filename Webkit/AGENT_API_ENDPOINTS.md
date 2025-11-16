# 🤖 AI Agent API Endpoints - Complete Reference

## 📋 Overview

This document lists all API endpoints available for the AI Agent (ARIA).

## 🔌 Agent Control Endpoints

### 1. Get Agent Status
**GET** `/api/agent/status`

Get current agent connection status and available services.

**Response:**
```json
{
  "success": true,
  "agent": {
    "connected": true,
    "active": true,
    "activeService": "openai",
    "availableServices": [
      {
        "id": "openai",
        "name": "OpenAI (GPT-4)",
        "status": "available"
      }
    ],
    "lastCheck": "2025-01-XX..."
  }
}
```

### 2. Connect Agent
**POST** `/api/agent/connect`

Connect agent to an AI service.

**Request Body:**
```json
{
  "serviceId": "openai"
}
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "connected": true,
    "activeService": "openai",
    "service": {
      "id": "openai",
      "name": "OpenAI (GPT-4)"
    }
  }
}
```

### 3. Disconnect Agent
**POST** `/api/agent/disconnect`

Disconnect agent from AI service.

**Response:**
```json
{
  "success": true,
  "agent": {
    "connected": false,
    "active": false
  }
}
```

### 4. Switch Service
**POST** `/api/agent/switch-service`

Switch to a different AI service.

**Request Body:**
```json
{
  "serviceId": "google-gemini"
}
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "activeService": "google-gemini",
    "service": {
      "id": "google-gemini",
      "name": "Google Gemini"
    }
  }
}
```

### 5. Test Agent
**GET** `/api/agent/test`

Test agent connection and functionality.

**Response:**
```json
{
  "success": true,
  "test": {
    "status": "passed",
    "services": ["openai", "local-llm"],
    "timestamp": "2025-01-XX..."
  }
}
```

### 6. Agent Health
**GET** `/api/agent/health`

Get agent health status.

**Response:**
```json
{
  "healthy": true,
  "agent": {
    "connected": true,
    "active": true,
    "activeService": "openai",
    "availableServices": 2
  },
  "timestamp": "2025-01-XX..."
}
```

## 🤖 AI Service Endpoints

### 1. Chat
**POST** `/api/ai/chat`

Send a chat message to the AI agent.

**Request Body:**
```json
{
  "message": "ما هي متطلبات الامتثال لـ NCA؟",
  "context": {
    "mode": "chat",
    "personality": "expert",
    "language": "ar"
  }
}
```

**Response:**
```json
{
  "type": "text",
  "message": "متطلبات الامتثال لـ NCA تشمل...",
  "source": "OpenAI (GPT-4)",
  "context": {
    "agent": "ARIA",
    "timestamp": "2025-01-XX...",
    "mode": "chat",
    "aiService": "OpenAI (GPT-4)",
    "connected": true
  }
}
```

### 2. Analyze Image
**POST** `/api/ai/analyze-image`

Analyze an image using AI vision.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "context": {
    "language": "ar",
    "analysisType": "full"
  }
}
```

**Response:**
```json
{
  "analysis": "تم تحليل الصورة. تحتوي على...",
  "confidence": 0.95,
  "source": "Azure OpenAI",
  "detected_elements": ["text", "document", "table"],
  "language_detected": ["ar", "en"],
  "timestamp": "2025-01-XX..."
}
```

### 3. Process Voice
**POST** `/api/ai/process-voice`

Process voice input (speech-to-text).

**Request:** Multipart form data with audio file

**Response:**
```json
{
  "transcription": "مرحباً، أريد معرفة معلومات حول الامتثال",
  "language": "ar",
  "confidence": 0.92,
  "timestamp": "2025-01-XX..."
}
```

### 4. Analyze Document
**POST** `/api/ai/analyze-document`

Analyze a document (PDF, DOCX, image).

**Request Body:**
```json
{
  "file": {
    "name": "policy.pdf",
    "type": "application/pdf",
    "size": 1024000
  },
  "context": {
    "analysisType": "compliance"
  }
}
```

**Response:**
```json
{
  "analysis": "تم تحليل المستند بنجاح...",
  "document_type": "application/pdf",
  "file_size": 1024000,
  "processing_time": 2500,
  "extracted_data": {
    "pages": 5,
    "words": 2500,
    "tables": 3,
    "images": 2
  }
}
```

### 5. AI Health
**GET** `/api/ai/health`

Get AI service health status.

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "localLLM": "connected",
    "openai": "configured",
    "azureOpenAI": "configured"
  },
  "capabilities": [
    "chat",
    "image",
    "voice",
    "document"
  ],
  "timestamp": "2025-01-XX..."
}
```

### 6. Initialize AI
**GET** `/api/ai/initialize`

Initialize AI system.

**Response:**
```json
{
  "status": "initialized",
  "agent": "ARIA",
  "language": "ar-SA",
  "features": {
    "chat": true,
    "voice_recognition": true,
    "text_to_speech": true,
    "image_analysis": true,
    "document_processing": true
  }
}
```

## 🖥️ Local LLM Endpoints

### 1. List Models
**GET** `/api/local-llm/models`

List available local LLM models.

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "id": "llama-3.2-3b-instruct",
      "name": "Llama 3.2 3B Instruct",
      "size": "3B"
    }
  ]
}
```

### 2. Chat with Local LLM
**POST** `/api/local-llm/chat`

Chat with local LLM.

**Request Body:**
```json
{
  "message": "مرحباً",
  "model": "llama-3.2-3b-instruct"
}
```

**Response:**
```json
{
  "success": true,
  "text": "مرحباً! كيف يمكنني مساعدتك؟",
  "model": "llama-3.2-3b-instruct",
  "source": "Local LLM",
  "timestamp": "2025-01-XX..."
}
```

### 3. Local LLM Health
**GET** `/api/local-llm/health`

Get local LLM health status.

**Response:**
```json
{
  "healthy": true,
  "endpoint": "http://localhost:1234/v1",
  "model": "llama-3.2-3b-instruct",
  "type": "ollama",
  "timestamp": "2025-01-XX..."
}
```

## 📊 Monitoring Endpoints

### 1. Monitoring Status
**GET** `/api/monitoring/status`

Get system and API status (public endpoint).

**Response:**
```json
{
  "status": "ok",
  "server": {
    "uptime": 3600,
    "memory": {
      "usagePercent": 25
    }
  },
  "apiKeys": {
    "openai": {
      "configured": true,
      "valid": true,
      "lastChecked": "2025-01-XX..."
    }
  }
}
```

### 2. Monitoring Health
**GET** `/api/monitoring/health`

Simple health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "uptime": 3600
}
```

## 🔒 Admin Endpoints

### 1. Admin Health
**GET** `/api/admin/health`

Get system health with API key status (requires authentication).

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_SECRET
```

**Response:**
```json
{
  "status": "healthy",
  "database": {
    "status": "connected"
  },
  "apiKeys": {
    "openai": {
      "configured": true,
      "valid": true,
      "lastChecked": "2025-01-XX..."
    }
  },
  "server": {
    "uptime": 3600,
    "memory": {
      "usagePercent": 25
    }
  }
}
```

### 2. Admin Config
**GET** `/api/admin/config`

Get AI service configuration.

**Response:**
```json
{
  "localLLM": {
    "endpoint": "http://localhost:1234/v1",
    "model": "llama-3.2-3b-instruct",
    "enabled": true
  },
  "openai": {
    "key": "***configured***",
    "model": "gpt-4",
    "enabled": true
  }
}
```

### 3. Update Config
**POST** `/api/admin/config`

Update AI service configuration.

**Request Body:**
```json
{
  "service": "openai",
  "config": {
    "key": "sk-...",
    "model": "gpt-4"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "openai configuration updated successfully",
  "service": "openai",
  "timestamp": "2025-01-XX..."
}
```

### 4. Test Service
**POST** `/api/admin/test-service`

Test AI service connection.

**Request Body:**
```json
{
  "service": "openai"
}
```

**Response:**
```json
{
  "success": true,
  "error": ""
}
```

## 🚀 Usage Examples

### Chat Example
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ما هي متطلبات الامتثال لـ NCA؟",
    "context": {
      "mode": "chat",
      "language": "ar"
    }
  }'
```

### Image Analysis Example
```bash
curl -X POST http://localhost:3001/api/ai/analyze-image \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,...",
    "context": {
      "language": "ar"
    }
  }'
```

### Agent Status Example
```bash
curl http://localhost:3001/api/agent/status
```

### Connect Agent Example
```bash
curl -X POST http://localhost:3001/api/agent/connect \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "openai"
  }'
```

## 📊 Error Responses

### Agent Not Connected
```json
{
  "error": "Agent not connected",
  "message": "The AI agent requires connection to an external LLM or Cloud AI service.",
  "details": "Agent connection failed - No external LLM/Cloud AI available.",
  "context": {
    "agent": "ARIA",
    "connected": false,
    "requiresExternalAI": true
  }
}
```

### Service Unavailable
```json
{
  "error": "Service unavailable",
  "message": "The requested AI service is not available.",
  "details": "OpenAI API failed: 503"
}
```

### Invalid Request
```json
{
  "error": "Message is required",
  "status": 400
}
```

## ✅ Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `500` - Internal Server Error
- `503` - Service Unavailable

## 🔒 Authentication

### Public Endpoints
- `/api/ai/chat`
- `/api/ai/analyze-image`
- `/api/ai/process-voice`
- `/api/ai/analyze-document`
- `/api/agent/status`
- `/api/monitoring/status`

### Admin Endpoints (Require Authentication)
- `/api/admin/*` - Requires `Authorization: Bearer ADMIN_SECRET`

## 📚 Related Documentation

- [Agent Features](./AGENT_FEATURES.md)
- [AI Configuration Guide](./AI_CONFIGURATION_GUIDE.md)
- [Monitoring Guide](./MONITORING_GUIDE.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES.md)

---

**Last Updated:** 2025-01-XX  
**Version:** 2.1.0

