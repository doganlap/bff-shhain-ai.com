# Shahin GRC API Documentation

## Base URL

**Production:** `https://api.shahin-ai.com/api`  
**Development:** `http://localhost:3001/api`

---

## Authentication

Most endpoints are public. Admin endpoints require JWT authentication.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## AI Endpoints

### Health Check
```
GET /api/ai/health
```

**Response:**
```json
{
  "status": "active",
  "service": "Shahin GRC Multi-Modal AI Assistant",
  "version": "2.0.0",
  "capabilities": ["chat_fallback", "image_fallback", "document_analysis", "voice_processing"],
  "services": {
    "azureOpenAI": "configured",
    "openAIPublic": "configured_quota_check_needed"
  },
  "intelligentRouting": true,
  "autoFallback": true,
  "timestamp": "2025-01-XXT00:00:00.000Z"
}
```

### Initialize AI
```
GET /api/ai/initialize
```

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

### Chat
```
POST /api/ai/chat
```

**Request:**
```json
{
  "message": "مرحباً، كيف يمكنني المساعدة؟",
  "context": {
    "mode": "chat"
  }
}
```

**Response:**
```json
{
  "type": "text",
  "message": "أهلاً وسهلاً! أنا هنا لمساعدتك...",
  "source": "Azure OpenAI",
  "context": {
    "agent": "ARIA",
    "timestamp": "2025-01-XXT00:00:00.000Z",
    "mode": "chat",
    "aiService": "Azure OpenAI"
  }
}
```

### Analyze Image
```
POST /api/ai/analyze-image
```

**Request:**
```json
{
  "image": "data:image/png;base64,...",
  "context": {}
}
```

**Response:**
```json
{
  "analysis": "تحليل الصورة...",
  "confidence": 0.9,
  "source": "Azure Cognitive Services",
  "detected_elements": ["text", "document"],
  "language_detected": ["ar", "en"],
  "timestamp": "2025-01-XXT00:00:00.000Z"
}
```

### Analyze Document
```
POST /api/ai/analyze-document
```

**Request:**
```json
{
  "file": {
    "name": "document.pdf",
    "type": "application/pdf",
    "size": 1024000
  },
  "context": {}
}
```

**Response:**
```json
{
  "analysis": "تم تحليل المستند...",
  "document_type": "application/pdf",
  "file_size": 1024000,
  "processing_time": 2500,
  "extracted_data": {
    "pages": 10,
    "words": 5000,
    "tables": 5,
    "images": 3
  }
}
```

### Process Voice
```
POST /api/ai/process-voice
Content-Type: multipart/form-data
```

**Request:**
- `audio`: File (audio file)
- `language`: String (optional, default: "ar-SA")

**Response:**
```json
{
  "transcription": "مرحباً، أريد معرفة المزيد عن خدماتكم",
  "response": "أهلاً وسهلاً! يسعدني أن أخبرك...",
  "confidence": 0.88,
  "duration": 5.5
}
```

---

## Sandbox Endpoints

### Create Sandbox Session
```
POST /api/sandbox/create
```

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "source": "landing_page",
  "sessionType": "quick_access",
  "expiresIn": 86400,
  "features": ["assessments", "frameworks"],
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "sandbox_123",
    "userId": 1,
    "username": "sandbox_1234567890_abc123",
    "email": "user@example.com",
    "expiresAt": "2025-01-XXT00:00:00.000Z",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "frontendUrl": "https://www.shahin-ai.com",
    "features": ["assessments", "frameworks"]
  }
}
```

### Guided Demo
```
POST /api/sandbox/guided-demo
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+966501234567",
  "company": "Example Corp",
  "preferredDate": "2025-01-15",
  "preferredTime": "10:00",
  "message": "Interested in learning more"
}
```

**Response:**
```json
{
  "success": true,
  "requestId": 1,
  "session": {
    "id": "sandbox_123",
    "userId": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "frontendUrl": "https://www.shahin-ai.com"
  }
}
```

### Submit Feedback
```
POST /api/sandbox/:id/feedback
```

**Request:**
```json
{
  "rating": 5,
  "experience": "excellent",
  "wouldRecommend": true,
  "interestedInPurchase": true,
  "suggestions": "Great platform!",
  "contactPreference": "email"
}
```

**Response:**
```json
{
  "success": true,
  "feedbackId": 1,
  "message": "Thank you for your feedback!"
}
```

### List Sandbox Sessions (Admin)
```
GET /api/sandbox/sessions
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "sandbox_123",
      "userId": 1,
      "email": "user@example.com",
      "createdAt": "2025-01-XXT00:00:00.000Z",
      "expiresAt": "2025-01-XXT00:00:00.000Z",
      "isActive": true
    }
  ]
}
```

---

## Landing Page Endpoints

### Get Landing Content
```
GET /api/landing/content
```

**Response:**
```json
{
  "heroTitle": "شاهين للحوكمة — جاهزية سعودية من اليوم",
  "heroSubtitle": "أتمتة امتثال PDPL وNCA ECC وNDMO...",
  "updatedAt": "2025-01-XXT00:00:00.000Z"
}
```

### Submit Demo Booking
```
POST /api/landing/requests
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+966501234567",
  "company": "Example Corp",
  "requestType": "demo",
  "preferredDate": "2025-01-15",
  "preferredTime": "10:00",
  "message": "Interested in demo"
}
```

**Response:**
```json
{
  "success": true,
  "requestId": 1,
  "message": "Booking request submitted successfully"
}
```

### Check Availability
```
GET /api/landing/availability?date=2025-01-15
```

**Response:**
```json
{
  "success": true,
  "date": "2025-01-15",
  "availableSlots": [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00"
  ]
}
```

### Get Available Dates
```
GET /api/landing/available-dates?month=2025-01
```

**Response:**
```json
{
  "success": true,
  "month": "2025-01",
  "availableDates": [
    "2025-01-15",
    "2025-01-16",
    "2025-01-17"
  ]
}
```

### Submit Contact Form
```
POST /api/contact
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "subject": "Inquiry",
  "message": "I have a question...",
  "type": "general"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": 1,
  "message": "Thank you for your message!"
}
```

---

## General Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XXT00:00:00.000Z",
  "service": "Shahin GRC Backend API"
}
```

---

## Rate Limiting

- **General API:** 100 requests per 15 minutes per IP
- **Sensitive Endpoints:** 10 requests per 15 minutes per IP
  - `/api/sandbox/create`
  - `/api/sandbox/guided-demo`
  - `/api/landing/requests`

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Endpoint not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "message": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Security

### CORS
- Allowed origins: `www.shahin-ai.com`, `shahin-ai.com`, `*.shahin-ai.com`
- Credentials: Enabled
- Methods: GET, POST, PUT, DELETE, OPTIONS

### Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Input Sanitization
- All POST/PUT requests are sanitized for XSS
- File uploads are limited to 10MB
- Rate limiting on all endpoints

---

## Testing

### Test Health Endpoint
```bash
curl https://api.shahin-ai.com/health
```

### Test AI Chat
```bash
curl -X POST https://api.shahin-ai.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "مرحباً"}'
```

### Test Sandbox Creation
```bash
curl -X POST https://api.shahin-ai.com/api/sandbox/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'
```

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0  
**API Version:** 2.0.0

