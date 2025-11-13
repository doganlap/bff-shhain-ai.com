# 🔧 **FIX: Backend URL Error (backend:5001)**

**Issue:** Browser is making requests to `http://backend:5001/api/...` which fails because:
- `backend:5001` is a Docker internal service name
- Browsers cannot resolve Docker service names
- The correct URL should be `http://localhost:3005` (BFF)

---

## ✅ **SOLUTION**

### **Step 1: Create `.env` File**

Create `apps/web/.env` with:
```env
VITE_API_URL=http://localhost:3005
```

### **Step 2: Clear Browser Cache**

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"
5. **OR** Hard refresh: `Ctrl + Shift + R` or `Ctrl + F5`

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Time range: "Everything"
4. Click "Clear Now"
5. **OR** Hard refresh: `Ctrl + Shift + R` or `Ctrl + F5`

### **Step 3: Restart Dev Server**

Stop the current dev server and restart:
```bash
cd apps/web
npm run dev
```

This ensures Vite picks up the new `.env` file.

### **Step 4: Verify**

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Check API requests:
   - ✅ Should see: `http://localhost:3005/api/...`
   - ❌ Should NOT see: `http://backend:5001/api/...`

---

## 🔍 **Why This Happens**

1. **Cached JavaScript:** Browser cached old JavaScript with hardcoded `backend:5001`
2. **Missing .env:** Without `.env`, Vite uses fallback values
3. **Docker Service Names:** `backend:5001` only works inside Docker network, not in browser

---

## 📝 **Current Configuration**

**File:** `apps/web/src/services/api.js`
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';
```

**File:** `apps/web/vite.config.js`
```javascript
proxy: {
  '/api': {
    target: process.env.VITE_API_URL || 'http://localhost:3005',
    changeOrigin: true,
    secure: false,
  }
}
```

Both are correctly configured to use `localhost:3005` as fallback.

---

## 🚀 **Quick Fix Commands**

```bash
# 1. Create .env file
cd apps/web
echo "VITE_API_URL=http://localhost:3005" > .env

# 2. Restart dev server
npm run dev

# 3. Clear browser cache (Ctrl+Shift+R)
```

---

## ✅ **Expected Result**

After fixing:
- ✅ All API calls go to `http://localhost:3005/api/...`
- ✅ BFF routes requests to appropriate microservices
- ✅ No more `backend:5001` errors
- ✅ Application loads correctly

---

**Last Updated:** 2025-01-10


