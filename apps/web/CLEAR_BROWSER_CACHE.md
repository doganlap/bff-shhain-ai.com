# 🔄 **CLEAR BROWSER CACHE - Fix API Connection**

**Issue:** Browser is using cached JavaScript with old API URL `backend:5001`

**Solution:** Clear browser cache and do hard refresh

---

## 🚀 **QUICK FIX**

### **Option 1: Hard Refresh (Recommended)**
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select **"Empty Cache and Hard Reload"**

**OR**

- **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

### **Option 2: Clear Cache Manually**

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Time range: "Everything"
4. Click "Clear Now"

---

## 🔍 **VERIFY FIX**

After clearing cache, check browser console:
- ✅ Should see: `http://localhost:3005/api/...`
- ❌ Should NOT see: `http://backend:5001/api/...`

---

## 📝 **IF STILL NOT WORKING**

1. **Check Service Worker:**
   - DevTools → Application → Service Workers
   - Click "Unregister" if any are registered

2. **Disable Cache in DevTools:**
   - DevTools → Network tab
   - Check "Disable cache"
   - Keep DevTools open while testing

3. **Incognito/Private Window:**
   - Open in incognito mode
   - This bypasses cache completely

---

## ✅ **CONFIGURATION VERIFIED**

- ✅ `.env` file: `VITE_API_URL=http://localhost:3005`
- ✅ `api.js`: Uses `import.meta.env.VITE_API_URL`
- ✅ `vite.config.js`: Proxy set to `localhost:3005`
- ✅ Docker environment: `VITE_API_URL=http://localhost:3005`

**The issue is browser cache, not code configuration!**

---

**Status:** ✅ **Code is correct - Clear browser cache to fix**

