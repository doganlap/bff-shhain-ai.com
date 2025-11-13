# ✅ **API CONFIGURATION FIXED**

**Issue:** Frontend trying to connect to `backend:5001` (Docker service name) which doesn't resolve in browser.

**Solution:** Updated all API configurations to use `localhost:3005` (BFF port).

---

## 🔧 **CHANGES MADE**

### **1. Vite Configuration** (`vite.config.js`)
**Before:**
```javascript
target: process.env.VITE_API_URL || 'http://backend:5001',
```

**After:**
```javascript
target: process.env.VITE_API_URL || 'http://localhost:3005',
```

### **2. API Service** (`src/services/api.js`)
**Before:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
```

**After:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';
```

---

## 📡 **API ENDPOINTS**

- **BFF (API Gateway):** http://localhost:3005
- **API Base URL:** http://localhost:3005/api
- **Health Check:** http://localhost:3005/healthz

---

## ✅ **VERIFICATION**

The frontend should now:
- ✅ Connect to BFF at `localhost:3005`
- ✅ Route all API calls through BFF
- ✅ No more `ERR_NAME_NOT_RESOLVED` errors

---

## 🔄 **SERVICE FLOW**

```
Browser → Frontend (localhost:5174)
    ↓
API Calls → BFF (localhost:3005)
    ↓
BFF → Microservices (internal Docker network)
    ↓
Response → BFF → Frontend → Browser
```

---

**Status:** ✅ **Fixed - Frontend now connects to BFF correctly**

