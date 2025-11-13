# 🎯 API ROLES & UI CONNECTIONS - COMPLETE GUIDE

## 📊 **6 RUNNING APIs - ROLES & UI INTEGRATION**

---

## 1️⃣ **GRC API (Port 3006) - MAIN API GATEWAY**

### **🎯 Role & Purpose:**
- **Primary Function**: Central API Gateway for all GRC operations
- **Why Needed**: Single entry point for frontend, coordinates all compliance operations
- **Core Responsibility**: Multi-database operations, cross-system integration

### **🗄️ Database Connections:**
- **AUTH DB**: User management, roles, permissions
- **FINANCE DB**: Tenants, licenses, subscriptions
- **COMPLIANCE DB**: Assessments, frameworks, controls

### **🌐 UI Components Connected:**
```
📊 Dashboard Components:
├── Main Dashboard → GET /api/dashboard/activity-simple
├── Statistics Cards → GET /api/dashboard/stats
├── Recent Activity → GET /api/dashboard/activity-simple
└── System Health → GET /api/health

👥 User Management:
├── User List → GET /api/users-simple
├── User Profile → GET /api/users/{id}
└── User Permissions → GET /api/users/{id}/permissions

🏢 Tenant Management:
├── Tenant Dashboard → GET /api/tenants-simple
├── Tenant Settings → GET /api/tenants/{id}
└── Tenant Analytics → GET /api/tenants/{id}/analytics

📋 Compliance Management:
├── Assessment List → GET /api/assessments
├── Framework Viewer → GET /api/frameworks-simple
├── Control Library → GET /api/controls
└── Compliance Reports → GET /api/compliance-reports
```

### **🔗 Frontend Integration Example:**
```javascript
// Dashboard data fetching
const fetchDashboardData = async () => {
  const response = await axios.get('http://localhost:3006/api/dashboard/activity-simple');
  return response.data; // Used in Dashboard.jsx
};
```

---

## 2️⃣ **AUTH SERVICE (Port 3001) - AUTHENTICATION & AUTHORIZATION**

### **🎯 Role & Purpose:**
- **Primary Function**: User authentication, JWT token management, RBAC
- **Why Needed**: Secure access control, user session management
- **Core Responsibility**: Login/logout, token validation, role-based access

### **🗄️ Database Connection:**
- **AUTH DB**: Users, roles, permissions, sessions, audit logs

### **🌐 UI Components Connected:**
```
🔐 Authentication Components:
├── Login Form → POST /api/auth/login
├── Register Form → POST /api/auth/register
├── Password Reset → POST /api/auth/forgot-password
└── Logout → POST /api/auth/logout

👤 User Profile:
├── Profile Settings → GET /api/auth/profile
├── Change Password → PUT /api/auth/change-password
└── User Preferences → GET /api/auth/preferences

🛡️ Security Components:
├── Role Management → GET /api/auth/roles
├── Permission Check → GET /api/auth/permissions
└── Session Status → GET /api/auth/verify-token
```

### **🔗 Frontend Integration Example:**
```javascript
// Login component
const handleLogin = async (credentials) => {
  const response = await axios.post('http://localhost:3001/api/auth/login', credentials);
  localStorage.setItem('token', response.data.token); // Used in Login.jsx
  setUser(response.data.user); // Update AuthContext
};
```

---

## 3️⃣ **DOCUMENT SERVICE (Port 3002) - DOCUMENT MANAGEMENT**

### **🎯 Role & Purpose:**
- **Primary Function**: File upload, storage, retrieval, document lifecycle
- **Why Needed**: Evidence management, compliance documentation
- **Core Responsibility**: File operations, document metadata, version control

### **🗄️ Database Connection:**
- **COMPLIANCE DB**: Document metadata, file references, evidence links

### **🌐 UI Components Connected:**
```
📄 Document Components:
├── File Upload → POST /api/documents/upload
├── Document Library → GET /api/documents
├── File Viewer → GET /api/documents/{id}/view
└── Download Manager → GET /api/documents/{id}/download

📁 Evidence Management:
├── Evidence Upload → POST /api/evidence/upload
├── Evidence Library → GET /api/evidence
└── Evidence Linking → POST /api/evidence/link-assessment

🔍 Document Search:
├── Search Interface → GET /api/documents/search
├── Filter Options → GET /api/documents/filters
└── Document Categories → GET /api/documents/categories
```

### **🔗 Frontend Integration Example:**
```javascript
// File upload component
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('http://localhost:3002/api/documents/upload', formData);
  return response.data; // Used in FileUpload.jsx
};
```

---

## 4️⃣ **NOTIFICATION SERVICE (Port 3003) - NOTIFICATIONS & ALERTS**

### **🎯 Role & Purpose:**
- **Primary Function**: Email notifications, system alerts, communication
- **Why Needed**: User engagement, compliance reminders, system notifications
- **Core Responsibility**: Email delivery, notification templates, alert management

### **🗄️ Database Connection:**
- **FINANCE DB**: User preferences, notification settings, delivery logs

### **🌐 UI Components Connected:**
```
🔔 Notification Components:
├── Notification Bell → GET /api/notifications/unread
├── Notification List → GET /api/notifications
├── Notification Settings → GET /api/notifications/preferences
└── Mark as Read → PUT /api/notifications/{id}/read

📧 Email Management:
├── Email Templates → GET /api/notifications/templates
├── Send Notification → POST /api/notifications/send
└── Email History → GET /api/notifications/history

⚠️ Alert System:
├── System Alerts → GET /api/notifications/alerts
├── Compliance Reminders → GET /api/notifications/reminders
└── Deadline Warnings → GET /api/notifications/deadlines
```

### **🔗 Frontend Integration Example:**
```javascript
// Notification bell component
const fetchNotifications = async () => {
  const response = await axios.get('http://localhost:3003/api/notifications/unread');
  setNotificationCount(response.data.count); // Used in NotificationBell.jsx
};
```

---

## 5️⃣ **RAG SERVICE (Port 3004) - AI DOCUMENT ANALYSIS**

### **🎯 Role & Purpose:**
- **Primary Function**: AI-powered document analysis, semantic search, Q&A
- **Why Needed**: Intelligent compliance assistance, document insights
- **Core Responsibility**: Vector embeddings, similarity search, AI responses

### **🗄️ Database Connection:**
- **COMPLIANCE DB**: Document content, analysis results, AI insights

### **🌐 UI Components Connected:**
```
🤖 AI Components:
├── AI Chat Interface → POST /api/rag/query
├── Document Analysis → POST /api/rag/analyze
├── Smart Search → POST /api/search
└── AI Recommendations → GET /api/rag/recommendations

🔍 Search Components:
├── Semantic Search → POST /api/search/semantic
├── Document Q&A → POST /api/rag/question
└── Content Suggestions → GET /api/rag/suggestions

📊 Analytics Components:
├── AI Insights → GET /api/analytics
├── Document Metrics → GET /api/analytics/documents
└── Usage Statistics → GET /api/analytics/usage
```

### **🔗 Frontend Integration Example:**
```javascript
// AI chat component
const askAI = async (question) => {
  const response = await axios.post('http://localhost:3004/api/rag/query', { query: question });
  return response.data.response; // Used in AIChatbot.jsx
};
```

---

## 6️⃣ **WEBSOCKET SERVICE (Port 3005) - REAL-TIME COMMUNICATION**

### **🎯 Role & Purpose:**
- **Primary Function**: Real-time updates, live collaboration, instant notifications
- **Why Needed**: Live collaboration, instant alerts, real-time data sync
- **Core Responsibility**: WebSocket connections, event broadcasting, live updates

### **🗄️ Database Connection:**
- **No Direct DB**: Uses other services' data for real-time broadcasting

### **🌐 UI Components Connected:**
```
⚡ Real-time Components:
├── Live Dashboard → socket.on('dashboard-update')
├── Real-time Notifications → socket.on('notification')
├── Live Chat → socket.emit('chat-message')
└── Collaboration Tools → socket.on('document-edit')

👥 Collaboration Features:
├── Live Assessment Editing → socket.on('assessment-update')
├── Multi-user Sessions → socket.on('user-joined')
├── Real-time Comments → socket.on('comment-added')
└── Live Status Updates → socket.on('status-change')

🔄 Data Synchronization:
├── Auto-refresh Data → socket.on('data-update')
├── Live Form Updates → socket.on('form-change')
└── Instant Validation → socket.on('validation-result')
```

### **🔗 Frontend Integration Example:**
```javascript
// Real-time connection
import io from 'socket.io-client';
const socket = io('http://localhost:3005');

socket.on('notification', (data) => {
  showToast(data.message); // Used in RealTimeNotifications.jsx
  updateNotificationCount(); // Update UI instantly
});
```

---

## 🌐 **COMPLETE UI ARCHITECTURE MAP**

```
FRONTEND APPLICATION (React/Vite)
├── 🏠 Dashboard Page
│   ├── Stats Cards → GRC API (3006)
│   ├── Activity Feed → GRC API (3006)
│   ├── Real-time Updates → WebSocket (3005)
│   └── Notifications → Notification Service (3003)
│
├── 🔐 Authentication Pages
│   ├── Login Form → Auth Service (3001)
│   ├── Register Form → Auth Service (3001)
│   └── Profile Settings → Auth Service (3001)
│
├── 📋 Compliance Management
│   ├── Assessment Forms → GRC API (3006)
│   ├── Framework Library → GRC API (3006)
│   ├── Control Management → GRC API (3006)
│   └── Live Collaboration → WebSocket (3005)
│
├── 📄 Document Management
│   ├── File Upload → Document Service (3002)
│   ├── Document Library → Document Service (3002)
│   ├── AI Analysis → RAG Service (3004)
│   └── Smart Search → RAG Service (3004)
│
├── 🤖 AI Features
│   ├── AI Chatbot → RAG Service (3004)
│   ├── Document Q&A → RAG Service (3004)
│   └── Smart Recommendations → RAG Service (3004)
│
├── 🔔 Notification System
│   ├── Notification Bell → Notification Service (3003)
│   ├── Email Settings → Notification Service (3003)
│   └── Real-time Alerts → WebSocket (3005)
│
└── 👥 User Management
    ├── User Directory → GRC API (3006)
    ├── Role Management → Auth Service (3001)
    └── Tenant Settings → GRC API (3006)
```

---

## 🎯 **SUMMARY: WHY EACH API IS ESSENTIAL**

| API | Why Essential | UI Impact | User Experience |
|-----|---------------|-----------|-----------------|
| **GRC API** | Central data hub | All main features | Complete platform functionality |
| **Auth Service** | Security & access | Login/permissions | Secure user experience |
| **Document Service** | File management | Upload/download | Document handling |
| **Notification Service** | Communication | Alerts/emails | User engagement |
| **RAG Service** | AI intelligence | Smart features | Enhanced productivity |
| **WebSocket Service** | Real-time sync | Live updates | Collaborative experience |

**Each API serves a specific role that directly enhances the user interface and overall user experience in your GRC platform!** 🚀
