# 🔐 **AUTHENTICATION & LOGIN LOCATIONS**

Complete guide to all authentication-related files and components.

---

## 📁 **FRONTEND (React/Web)**

### **Login Pages**
- **Standard Login:**
  - `apps/web/src/pages/LoginPage.jsx`
  - Route: `/login`
  - Features: Email/password login, Microsoft SSO button

- **Glassmorphism Login:**
  - `apps/web/src/pages/GlassmorphismLoginPage.jsx`
  - Route: `/login-glass`
  - Features: Modern glassmorphism design

- **Login Modal (Landing Page):**
  - `apps/web/src/components/landing/LoginModal.jsx`
  - Used in: Landing page

---

### **Authentication Components**
- **Protected Route:**
  - `apps/web/src/components/auth/ProtectedRoute.jsx`
  - Purpose: Route-level access control with RBAC
  - Usage: Wraps protected routes in `App.jsx`

---

### **Authentication Services**
- **MSAL (Microsoft Authentication Library):**
  - `apps/web/src/services/msal.js`
  - Purpose: Microsoft SSO configuration
  - Used by: `index.jsx` (MsalProvider)

- **API Service (Auth endpoints):**
  - `apps/web/src/services/api.js`
  - Section: `apiServices.auth.*`
  - Methods:
    - `login(credentials)`
    - `register(userData)`
    - `logout()`
    - `refreshToken()`
    - `forgotPassword(email)`
    - `resetPassword(token, password)`

- **App Context (Auth state):**
  - `apps/web/src/context/AppContext.jsx`
  - Purpose: Global auth state management
  - Actions: `login()`, `logout()`, `setUser()`, etc.

---

### **Configuration**
- **MSAL Config:**
  - `apps/web/src/services/config.js`
  - Contains: Graph API endpoints

- **Environment Variables:**
  - `apps/web/.env`
  - Variables:
    - `VITE_APP_CLIENT_ID` - Microsoft App ID
    - `VITE_APP_AUTHORITY` - Microsoft Authority URL
    - `VITE_APP_REDIRECT_URI` - Redirect after login

---

## 🔧 **BACKEND SERVICES**

### **Auth Service (Microservice)**
**Location:** `apps/services/auth-service/`

#### **Routes:**
- `routes/auth.js` - Standard authentication routes
  - POST `/api/auth/login`
  - POST `/api/auth/register`
  - POST `/api/auth/logout`
  - POST `/api/auth/refresh`
  - POST `/api/auth/forgot-password`
  - POST `/api/auth/reset-password`

- `routes/microsoft-auth.js` - Microsoft SSO routes
  - GET `/api/microsoft-auth/login`
  - GET `/api/microsoft-auth/callback`
  - POST `/api/microsoft-auth/token`

- `routes/users.js` - User management routes
  - GET `/api/users`
  - GET `/api/users/:id`
  - POST `/api/users`
  - PUT `/api/users/:id`
  - DELETE `/api/users/:id`

#### **Services:**
- `services/userService.js` - User CRUD operations
- `services/microsoftAuth.js` - Microsoft SSO logic

#### **Middleware:**
- `middleware/auth.js` - JWT authentication
- `middleware/rbac.js` - Role-based access control
- `middleware/validation.js` - Request validation

#### **Configuration:**
- `config/database.js` - Database connection
- `config/jwt.js` - JWT configuration
- `utils/jwt.js` - JWT utilities
- `constants/access.js` - Permission constants

#### **Server:**
- `server.js` - Auth service entry point
- Port: `3001`

---

### **GRC API (Legacy Auth Routes)**
**Location:** `apps/services/grc-api/`

- `routes/auth.js` - Legacy auth routes (may redirect to auth-service)
- `routes/microsoft-auth.js` - Legacy Microsoft auth
- `services/microsoftAuth.js` - Legacy Microsoft auth service

**Note:** These may be deprecated in favor of the dedicated auth-service.

---

## 🌐 **ROUTING**

### **Public Routes (No Auth Required)**
- `/` - Landing page
- `/login` - Standard login
- `/login-glass` - Glassmorphism login

### **Protected Routes (Auth Required)**
- `/app/*` - Main application (requires login)
- `/advanced/*` - Advanced shell (requires login)

**Route Configuration:**
- `apps/web/src/config/routes.js` - Centralized route config
- `apps/web/src/App.jsx` - Route selection

---

## 🔑 **AUTHENTICATION FLOW**

### **Standard Login:**
```
User → LoginPage.jsx
  ↓
actions.login() → AppContext.jsx
  ↓
apiServices.auth.login() → api.js
  ↓
POST /api/auth/login → BFF (localhost:3005)
  ↓
BFF → Auth Service (localhost:3001)
  ↓
Auth Service → Database (PostgreSQL)
  ↓
Response → Frontend
  ↓
Store token → localStorage
  ↓
Navigate to /app
```

### **Microsoft SSO:**
```
User → LoginPage.jsx (Microsoft button)
  ↓
MSAL → Microsoft Login
  ↓
Callback → /api/microsoft-auth/callback
  ↓
Auth Service → Exchange token
  ↓
Store token → localStorage
  ↓
Navigate to /app
```

---

## 📍 **QUICK REFERENCE**

| Component | Location | Route/Port |
|-----------|----------|------------|
| **Login Page** | `apps/web/src/pages/LoginPage.jsx` | `/login` |
| **Glassmorphism Login** | `apps/web/src/pages/GlassmorphismLoginPage.jsx` | `/login-glass` |
| **Protected Route** | `apps/web/src/components/auth/ProtectedRoute.jsx` | N/A |
| **MSAL Config** | `apps/web/src/services/msal.js` | N/A |
| **Auth API** | `apps/web/src/services/api.js` | N/A |
| **Auth Service** | `apps/services/auth-service/` | Port 3001 |
| **Auth Routes** | `apps/services/auth-service/routes/auth.js` | `/api/auth/*` |
| **Microsoft Auth** | `apps/services/auth-service/routes/microsoft-auth.js` | `/api/microsoft-auth/*` |
| **BFF (Gateway)** | `apps/bff/index.js` | Port 3005 |

---

## 🚀 **ACCESS POINTS**

### **Frontend:**
- Login: http://localhost:5174/login
- Glassmorphism Login: http://localhost:5174/login-glass

### **Backend:**
- Auth Service: http://localhost:3001
- BFF (API Gateway): http://localhost:3005
- Auth via BFF: http://localhost:3005/api/auth/*

---

## ✅ **STATUS**

- ✅ Login pages created and mounted
- ✅ Authentication service running
- ✅ Microsoft SSO configured
- ✅ Protected routes working
- ✅ JWT authentication implemented
- ✅ RBAC middleware active

---

**Last Updated:** 2025-01-10

