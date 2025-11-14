# 🌐 Localhost Connection Troubleshooting Guide

## ✅ Current Configuration (Already Optimized!)

Your GRC Master application is **already configured correctly**:

```javascript
// vite.config.js
server: {
  port: 5173,
  host: '0.0.0.0',  // ✅ Binds to all network interfaces
  cors: true         // ✅ CORS enabled
}
```

**What this means:**
- ✅ Server listens on ALL network interfaces (0.0.0.0)
- ✅ Accessible via localhost, 127.0.0.1, and network IPs
- ✅ No additional configuration needed

---

## 🚀 Quick Access URLs

### Primary Access
```
http://localhost:5173
http://127.0.0.1:5173
```

### Network Access (from other devices)
```
http://100.120.201.39:5173
http://192.168.1.74:5173
http://172.28.16.1:5173
http://172.30.48.1:5173
```

---

## 🔧 If You Encounter "Connection Refused"

### Option 1: Run the Fix Script (Easiest)
```powershell
# Run as Administrator
cd d:\Projects\GRC-Master\Assessmant-GRC
.\fix-localhost.ps1
```

**What it does:**
- ✅ Checks port usage
- ✅ Kills conflicting processes
- ✅ Configures Windows Firewall
- ✅ Sets proxy bypass
- ✅ Verifies hosts file
- ✅ Starts dev server
- ✅ Tests connectivity

---

### Option 2: Manual Troubleshooting

#### Step 1: Check What's Using Port 5173
```powershell
Get-NetTCPConnection -LocalPort 5173 -State Listen | 
  Select-Object LocalAddress,LocalPort,OwningProcess | 
  Format-Table -AutoSize
```

**Expected output:**
```
LocalAddress LocalPort OwningProcess
------------ --------- -------------
0.0.0.0           5173          9584
```

#### Step 2: Kill Conflicting Process (if needed)
```powershell
$pid = (Get-NetTCPConnection -LocalPort 5173 -State Listen).OwningProcess
taskkill /PID $pid /F
```

#### Step 3: Configure Firewall (Run as Admin)
```powershell
New-NetFirewallRule -DisplayName "GRC-Dev-5173" `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 5173
```

#### Step 4: Set Proxy Bypass
```powershell
setx NO_PROXY "localhost,127.0.0.1,::1"
```

#### Step 5: Restart Dev Server
```powershell
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\web
npm run dev
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "localhost" doesn't work but "127.0.0.1" does

**Cause:** IPv6 vs IPv4 resolution issue

**Solution:**
```powershell
# Force IPv4 by using 127.0.0.1 directly
http://127.0.0.1:5173
```

**Permanent fix (check hosts file):**
```powershell
notepad C:\Windows\System32\drivers\etc\hosts
```

Ensure these lines exist:
```
127.0.0.1 localhost
::1       localhost
```

---

### Issue 2: Works locally but not from another device

**Cause:** Windows Firewall blocking inbound connections

**Solution:**
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "GRC-Dev-5173" `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 5173
```

---

### Issue 3: Port already in use

**Cause:** Another process is using port 5173

**Solution:**
```powershell
# Find the process
Get-NetTCPConnection -LocalPort 5173 -State Listen

# Kill it
$pid = (Get-NetTCPConnection -LocalPort 5173 -State Listen).OwningProcess
taskkill /PID $pid /F

# Start fresh
npm run dev
```

---

### Issue 4: VPN or Corporate Proxy Interference

**Cause:** VPN or proxy intercepting localhost traffic

**Solution:**
```powershell
# Bypass proxy for localhost
setx NO_PROXY "localhost,127.0.0.1,::1"

# Restart terminal and try again
```

---

### Issue 5: Windows Defender / Antivirus Blocking

**Cause:** Security software blocking Node.js

**Solution:**
1. Add exception for Node.js in Windows Defender
2. Add exception for project folder
3. Temporarily disable antivirus to test

---

## 🧪 Test Server Connectivity

### Method 1: Browser
```
http://127.0.0.1:5173
```

### Method 2: PowerShell
```powershell
Invoke-WebRequest -Uri http://127.0.0.1:5173 -UseBasicParsing
```

### Method 3: Curl
```bash
curl http://127.0.0.1:5173 -v
```

### Method 4: Simple Test Server
```powershell
# Create a simple test server to verify OS/network is fine
node -e "require('http').createServer((req,res)=>res.end('ok')).listen(5173,'0.0.0.0',()=>console.log('Test server up on 5173'))"
```

If test server works but your app doesn't → Check your app configuration.
If test server doesn't work → Firewall/proxy/network issue.

---

## 📋 Diagnostic Checklist

Run through this checklist if nothing works:

### Network & Ports
- [ ] Port 5173 is not used by another process
- [ ] Windows Firewall allows port 5173
- [ ] No corporate firewall blocking localhost
- [ ] VPN is not intercepting localhost traffic

### Configuration
- [ ] vite.config.js has `host: '0.0.0.0'`
- [ ] package.json dev script is correct
- [ ] NO_PROXY environment variable is set

### System
- [ ] hosts file has correct localhost entries
- [ ] No IPv6/IPv4 resolution issues
- [ ] Windows Defender not blocking Node.js
- [ ] Latest Node.js version installed

### Application
- [ ] All dependencies installed (`npm install`)
- [ ] No build errors in console
- [ ] Server starts without errors
- [ ] Hot Module Replacement (HMR) working

---

## 🔍 Debug Commands

### Check Server Status
```powershell
# Is server running?
Get-NetTCPConnection -LocalPort 5173 -State Listen

# What process owns it?
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173 -State Listen).OwningProcess
```

### Check Network Configuration
```powershell
# IPv4 address
ipconfig | Select-String "IPv4"

# All network adapters
Get-NetAdapter | Where-Object {$_.Status -eq 'Up'}
```

### Check Firewall Rules
```powershell
Get-NetFirewallRule -DisplayName "*5173*"
```

### Check Environment Variables
```powershell
Get-ChildItem Env: | Where-Object {$_.Name -like "*PROXY*"}
```

---

## 💡 Pro Tips

### Tip 1: Always Use IPv4 Explicitly
Instead of `localhost`, use `127.0.0.1` to avoid IPv6 issues.

### Tip 2: Bind to All Interfaces
Always set `host: '0.0.0.0'` in your dev server config for maximum compatibility.

### Tip 3: Use Standard Ports
Stick to 3000, 5173, or 8080 as these are commonly whitelisted.

### Tip 4: Check Logs
Always check the terminal output for errors when the server starts.

### Tip 5: Test Multiple URLs
Try localhost, 127.0.0.1, and your network IP to narrow down issues.

---

## 🚨 Emergency Reset

If nothing works, nuclear option:

```powershell
# 1. Kill everything
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Clear npm cache
npm cache clean --force

# 3. Remove node_modules and reinstall
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\web
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install

# 4. Restart Windows (yes, really)
Restart-Computer
```

---

## 📞 Still Not Working?

If you've tried everything and it still doesn't work:

1. **Check Node.js Version**
   ```powershell
   node -v
   npm -v
   ```
   Recommended: Node.js 18.x or 20.x

2. **Try a Different Port**
   ```powershell
   # Edit vite.config.js and change port to 3000 or 8080
   ```

3. **Check System Logs**
   ```powershell
   Get-EventLog -LogName Application -Newest 50 | Where-Object {$_.Source -like "*Node*"}
   ```

4. **Reinstall Node.js**
   - Uninstall Node.js completely
   - Delete `C:\Users\<YourUser>\AppData\Roaming\npm`
   - Reinstall from nodejs.org

---

## ✅ Verification Checklist

After fixing, verify everything works:

- [ ] `npm run dev` starts without errors
- [ ] http://localhost:5173 loads in browser
- [ ] http://127.0.0.1:5173 loads in browser
- [ ] HMR (Hot Module Replacement) works
- [ ] No console errors in browser
- [ ] Network URLs accessible from other devices (if needed)

---

## 📚 Additional Resources

- **Vite Documentation:** https://vitejs.dev/config/server-options.html
- **Windows Firewall:** https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-firewall/
- **Node.js Networking:** https://nodejs.org/api/net.html

---

**Last Updated:** November 12, 2025  
**Current Status:** ✅ Server configured correctly and running

---

## 🎯 Quick Commands Reference

```powershell
# Check if server is running
Get-NetTCPConnection -LocalPort 5173 -State Listen

# Start server
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\web
npm run dev

# Run fix script
cd d:\Projects\GRC-Master\Assessmant-GRC
.\fix-localhost.ps1

# Kill process on port 5173
taskkill /PID (Get-NetTCPConnection -LocalPort 5173 -State Listen).OwningProcess /F

# Test connectivity
Invoke-WebRequest -Uri http://127.0.0.1:5173 -UseBasicParsing
```

Save this guide for future reference! 📖
