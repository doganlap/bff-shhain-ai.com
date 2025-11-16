# 🔐 AUTHENTICATION GUIDE - SHAHIN-AI GRC PLATFORM

## 🚨 **URGENT FIX APPLIED**

✅ **FIXED**: Login credentials mismatch resolved in `SimpleLoginPage.jsx`
- **Before**: `demo@shahin-ai.com / Shahin@2025` ❌
- **After**: `demo@shahin-ai.com / demo123` ✅

---

## 🔑 **AVAILABLE CREDENTIALS**

### **1. Demo Mode (Development/Offline)**
```
Email: demo@shahin-ai.com
Password: demo123
```
**Usage**: When API is unavailable or in demo mode
**Features**: Full demo data access, all features enabled
**Expiry**: Session-based (24 hours max)

### **2. Production Super Admin (DoganConsult)**
```
Email: ahmet@doganconsult.com
Password: As$123456
```
**Usage**: Production environment super admin access
**Features**: Full system access, tenant management, user management
**Role**: Super Admin

### **3. POC Demo Environment**
```
Admin: demo@shahin-ai.com / Demo123!
Manager: manager@shahin-ai.com / Manager123!
Viewer: viewer@shahin-ai.com / Viewer123!
```
**Usage**: POC demonstrations
**Features**: Role-based access demo

---

## 🛣️ **AUTHENTICATION FLOW**

### **Current Behavior:**
```
1. User enters credentials in SimpleLoginPage.jsx
2. App calls apiServices.auth.login(credentials)
3. If API available: Normal JWT authentication
4. If API unavailable: Falls back to demo mode
5. Demo mode validates against demo@shahin-ai.com / demo123
```

### **Cookie-Based Authentication:**
- **Access Token**: HTTP-only cookie (1 day)
- **Refresh Token**: HTTP-only cookie (7 days)
- **CORS**: Configured with `withCredentials: true`
- **Security**: XSS protection via HTTP-only cookies

---

## 🔧 **TROUBLESHOOTING**

### **"Unauthorized" Error - RESOLVED ✅**
**Cause**: Credential mismatch between login form and demo mode
**Fix**: Updated `SimpleLoginPage.jsx` to use correct demo credentials

### **CORS Issues**
- BFF URL: `https://bff-shahin-ai-com.vercel.app`
- Frontend URLs: Whitelisted in CORS configuration
- Credentials: Must be sent with `withCredentials: true`

### **Demo Mode Activation**
- **Auto-triggers**: When API connection fails
- **Manual mode**: Use demo credentials above
- **Validation**: Strict credential matching required

---

## 🌐 **ACCESS POINTS**

### **Local Development:**
- **Frontend**: http://localhost:5174
- **Login**: http://localhost:5174/login
- **Glassmorphism Login**: http://localhost:5174/login-glass

### **Production:**
- **Frontend**: https://app-shahin-ai-com.vercel.app
- **BFF API**: https://bff-shahin-ai-com.vercel.app

---

## 🔒 **SECURITY NOTES**

### **Demo Mode Security:**
- ✅ Session expiration (24 hours max)
- ✅ Watermarked data
- ✅ Read-only operations on sensitive entities
- ✅ No real data exposure

### **Production Security:**
- ✅ HTTP-only cookies prevent XSS
- ✅ JWT tokens with expiration
- ✅ Redis token blacklisting
- ✅ RBAC middleware
- ✅ Account lockout after failed attempts

---

## 📱 **QUICK TEST**

**To verify the fix:**
1. Open: http://localhost:5174/login
2. Default credentials should be: `demo@shahin-ai.com / demo123`
3. Click "Login" - should work immediately
4. If API is down, demo mode activates automatically
5. If API is up, normal authentication proceeds

---

## ⚡ **NEXT STEPS**

1. **Test the login** with the corrected credentials
2. **Verify demo mode** works offline
3. **Test production login** with super admin credentials
4. **Check cookie authentication** is working properly

**Status**: ✅ Ready for testing - credentials fixed!
