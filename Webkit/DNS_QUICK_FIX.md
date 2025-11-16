# 🚀 QUICK FIX: Add These DNS Records Now!

## ⚡ Copy-Paste Ready DNS Configuration

### 1️⃣ TXT Record (MOST IMPORTANT - for verification)
```
Type:  TXT
Name:  asuid
Value: 8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC
```

### 2️⃣ A Record (points your domain to Azure)
```
Type:  A
Name:  @
Value: 20.74.192.6
```

### 3️⃣ CNAME Record for www (optional)
```
Type:  CNAME
Name:  www
Value: shahin-ai.azurewebsites.net
```

---

## 🎯 Where to Go

1. **Find your domain registrar** (where you bought shahin-ai.com)
2. **Log in** to that account
3. **Find DNS settings** (usually called "DNS Management", "Advanced DNS", or "DNS Records")
4. **Add the 3 records above**
5. **Save changes**
6. **Wait 15-30 minutes**

---

## ✅ After Adding Records

1. Run: `check-dns-config.bat` to verify
2. Wait for DNS to propagate (15 mins - 4 hours)
3. Go to Azure Portal → Your App Service → Custom domains
4. Click "Add custom domain"
5. Enter: `shahin-ai.com`
6. Click "Validate" (should pass now)
7. Click "Add"
8. Enable SSL certificate

---

## 🆘 Need Help?

**Check DNS propagation online:**
- https://dnschecker.org
- Enter: shahin-ai.com
- Check if A record shows: 20.74.192.6

**Common registrars:**
- Namecheap: Dashboard → Domain List → Manage → Advanced DNS
- GoDaddy: My Products → Domains → DNS
- Cloudflare: Select domain → DNS tab
- Google Domains: Select domain → DNS settings

---

## 📞 Current Azure App Service Info

- **App Service Name**: shahin-ai
- **Default URL**: shahin-ai.azurewebsites.net
- **Target IP**: 20.74.192.6
- **Verification ID**: 8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC
