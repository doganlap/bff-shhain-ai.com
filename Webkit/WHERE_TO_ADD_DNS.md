# 📍 Where to Add DNS Records for www.shahin-ai.com

## 🏢 Common Domain Providers - Exact Steps

### 🟦 **GoDaddy**
1. **Login**: Go to https://godaddy.com → Sign In
2. **Navigate**: "My Products" → "All Products and Services" → "DNS"  
3. **Find Domain**: Click "DNS" next to "shahin-ai.com"
4. **Add Records**: Scroll down → Click "Add" button
5. **Add Record 1 (TXT)**:
   - Type: `TXT`
   - Name: `asuid.www`
   - Value: `8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC`
   - TTL: `1 Hour`
6. **Add Record 2 (CNAME)**:
   - Type: `CNAME`
   - Name: `www`
   - Value: `grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io`
   - TTL: `1 Hour`
7. **Save**: Click "Save"

---

### 🟨 **Namecheap**
1. **Login**: Go to https://namecheap.com → Sign In
2. **Navigate**: "Domain List" → Click "Manage" next to "shahin-ai.com"
3. **DNS Tab**: Click "Advanced DNS" tab
4. **Add Records**: Click "Add New Record"
5. **Add Record 1 (TXT)**:
   - Type: `TXT Record`
   - Host: `asuid.www`
   - Value: `8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC`
   - TTL: `Automatic`
6. **Add Record 2 (CNAME)**:
   - Type: `CNAME Record`
   - Host: `www`
   - Value: `grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io`
   - TTL: `Automatic`
7. **Save**: Click "Save All Changes"

---

### 🟧 **Cloudflare**
1. **Login**: Go to https://cloudflare.com → Sign In
2. **Select Domain**: Click on "shahin-ai.com"
3. **DNS Tab**: Click "DNS" → "Records"
4. **Add Records**: Click "Add record"
5. **Add Record 1 (TXT)**:
   - Type: `TXT`
   - Name: `asuid.www.shahin-ai.com`
   - Content: `8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC`
   - TTL: `Auto`
   - Proxy: `DNS only` (gray cloud)
6. **Add Record 2 (CNAME)**:
   - Type: `CNAME`
   - Name: `www`
   - Target: `grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io`
   - TTL: `Auto`
   - Proxy: `DNS only` (gray cloud)
7. **Save**: Click "Save"

---

### 🟪 **Route 53 (AWS)**
1. **Login**: Go to https://console.aws.amazon.com → Route 53
2. **Navigate**: "Hosted zones" → Click "shahin-ai.com"
3. **Add Records**: Click "Create record"
4. **Add Record 1 (TXT)**:
   - Record name: `asuid.www.shahin-ai.com`
   - Record type: `TXT`
   - Value: `8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC`
   - TTL: `300`
5. **Add Record 2 (CNAME)**:
   - Record name: `www.shahin-ai.com`
   - Record type: `CNAME`
   - Value: `grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io`
   - TTL: `300`
6. **Save**: Click "Create records"

---

### 🟩 **Google Domains**
1. **Login**: Go to https://domains.google.com → Sign In
2. **Select**: Click on "shahin-ai.com"
3. **DNS Tab**: Click "DNS" on the left sidebar
4. **Custom Records**: Scroll to "Custom resource records"
5. **Add Record 1 (TXT)**:
   - Name: `asuid.www`
   - Type: `TXT`
   - TTL: `3600`
   - Data: `8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC`
6. **Add Record 2 (CNAME)**:
   - Name: `www`
   - Type: `CNAME`
   - TTL: `3600`
   - Data: `grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io`
7. **Save**: Click "Add"

---

## ⚠️ **Important Notes:**

1. **Don't include full domain**: Use `www` not `www.shahin-ai.com` for CNAME (except on some providers)
2. **TTL Settings**: Use 3600 seconds (1 hour) or "Auto"
3. **Wait Time**: DNS changes take 15-60 minutes to propagate
4. **Order**: Add TXT record first, then CNAME

## ✅ **Verification:**

After adding, test with:
```bash
nslookup -type=TXT asuid.www.shahin-ai.com
nslookup www.shahin-ai.com
```

## 🆘 **Can't Find Your Provider?**

**Generic Steps for ANY provider:**
1. Login to your domain registrar
2. Look for "DNS Management", "DNS Settings", or "Name Servers"
3. Add the two records above
4. Save changes
