# Security Fixes Required Before Production

## ⚠️ CRITICAL - Must Fix Before Going Live

### 1. Remove Hardcoded Credentials from Login Page

**File**: `apps/web/src/pages/auth/SimpleLoginPage.jsx`

**Current (Lines 9-12)**:
```javascript
const [formData, setFormData] = useState({
  email: 'demo@shahin-ai.com',      // ❌ REMOVE
  password: 'Shahin@2025'            // ❌ REMOVE
});
```

**Fix To**:
```javascript
const [formData, setFormData] = useState({
  email: '',
  password: ''
});
```

---

### 2. Disable Auto-Login on API Failure

**File**: `apps/web/src/context/AppContext.jsx`

**Current (Lines 239-252)**: Auto-logs in as admin when API fails

**Fix**: Add environment check
```javascript
} catch (error) {
  clearTimeout(timeoutId);
  console.error('🔌 API connection failed:', error);

  // Only auto-login in development mode
  if (import.meta.env.DEV) {
    console.log('🎯 Development mode: Auto-login enabled');
    setDemoData();
    const demoUser = { /* ... */ };
    dispatch({ type: actionTypes.SET_USER, payload: demoUser });
    dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
  } else {
    // Production: Show error, don't auto-login
    dispatch({ type: actionTypes.SET_ERROR, payload: 'Unable to connect to server' });
    dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: false });
  }
}
```

---

### 3. Implement Real Token Validation

**File**: `apps/web/src/components/auth/ProtectedRoute.jsx`

**Current (Lines 34-46)**: Only checks if token exists

**Fix**: Validate with backend
```javascript
// Current - Mock validation
const user = localStorage.getItem('user');
if (token && user) {
  setIsAuthenticated(true);
}

// Better - Real API validation
try {
  const response = await apiService.auth.verifyToken(token);
  if (response.data.valid) {
    setIsAuthenticated(true);
  } else {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
} catch (error) {
  setIsAuthenticated(false);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
```

---

### 4. Disable Demo Mode in Production

**File**: `apps/web/src/context/AppContext.jsx`

**Current (Lines 553-572)**: Accepts demo credentials in all environments

**Fix**: Check environment
```javascript
login: async (credentials) => {
  // Only allow demo mode in development
  if (state.isDemoMode && import.meta.env.DEV) {
    // Demo login logic
  } else if (state.isDemoMode && !import.meta.env.DEV) {
    // Block demo mode in production
    return {
      success: false,
      error: 'Demo mode is not available in production'
    };
  }

  // Normal login flow
  try {
    const response = await apiServices.auth.login(credentials);
    // ...
  }
}
```

---

## 🔐 Additional Security Recommendations

### 5. Add HTTPS Redirect
```javascript
// In main.jsx or App.jsx
if (import.meta.env.PROD && window.location.protocol === 'http:') {
  window.location.href = window.location.href.replace('http:', 'https:');
}
```

### 6. Add HTTP-Only Cookies for Tokens
**Backend Change Required**: Store JWT in HTTP-only cookies instead of localStorage

Benefits:
- ✅ Prevents XSS attacks from stealing tokens
- ✅ Automatic CSRF protection
- ✅ More secure than localStorage

### 7. Add Rate Limiting on Login
**Backend Change Required**: Limit login attempts
- Max 5 attempts per 15 minutes per IP
- Lock account after 10 failed attempts

### 8. Add Session Timeout
```javascript
// In AppContext.jsx
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

useEffect(() => {
  let timeoutId;

  const resetTimeout = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      actions.logout();
      alert('Session expired. Please login again.');
    }, SESSION_TIMEOUT);
  };

  // Reset on user activity
  window.addEventListener('click', resetTimeout);
  window.addEventListener('keypress', resetTimeout);

  resetTimeout();

  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('click', resetTimeout);
    window.removeEventListener('keypress', resetTimeout);
  };
}, [state.isAuthenticated]);
```

### 9. Add Content Security Policy
**In index.html**:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.yourdomain.com">
```

### 10. Add Security Headers (Nginx)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

---

## ✅ Quick Pre-Production Checklist

**Immediate (Before Deploy)**:
- [ ] Remove hardcoded credentials from login form
- [ ] Disable auto-login on API failure in production
- [ ] Add environment check for demo mode
- [ ] Test login with real backend API

**High Priority (Week 1)**:
- [ ] Implement real token validation
- [ ] Add session timeout
- [ ] Add HTTPS redirect
- [ ] Configure security headers

**Important (Week 2)**:
- [ ] Move tokens to HTTP-only cookies
- [ ] Add rate limiting on backend
- [ ] Add account lockout mechanism
- [ ] Add audit logging for login attempts

**Nice to Have (Month 1)**:
- [ ] Add 2FA/MFA support
- [ ] Add password complexity requirements
- [ ] Add "Remember Me" functionality
- [ ] Add social login (OAuth)

---

## 🚀 How to Test After Fixes

### Test Login Flow:
1. **With Backend API**:
   ```bash
   # Start backend
   cd apps/bff && npm start

   # Start frontend
   cd apps/web && npm run dev

   # Test login at http://localhost:5173/login
   ```

2. **Without Backend API** (Production mode):
   ```bash
   # Build frontend
   cd apps/web && npm run build && npm run preview

   # Should show error, NOT auto-login
   ```

### Test Protected Routes:
1. Try accessing `/app` without login → Should redirect to `/login`
2. Login with valid credentials → Should access `/app`
3. Logout → Should redirect to `/login`
4. Close browser and reopen → Should require login again

---

## 🎯 Current Risk Level

**Without Fixes**: 🔴 HIGH RISK
- Auto-login bypasses all security
- Hardcoded credentials in source
- No real token validation

**With Critical Fixes (1-4)**: 🟡 MEDIUM RISK
- Basic authentication works
- Demo mode disabled in production
- Still needs backend token validation

**With All Fixes (1-10)**: 🟢 LOW RISK
- Production-ready security
- Industry best practices
- Protected against common attacks

---

## 📝 Summary

**Can you deploy now?**
- **Development/Staging**: YES (current setup is fine)
- **Production**: NO - Fix items 1-4 first (30 minutes of work)

**Timeline**:
- Critical fixes (1-4): 30 minutes
- High priority (5-8): 2 hours
- All fixes (1-10): 1 day

**Recommendation**: Fix items 1-4, then deploy. Add others post-launch.
