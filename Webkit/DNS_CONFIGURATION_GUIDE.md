# 🌐 DNS Configuration for shahin-ai.com on Azure App Service

## 📋 Required DNS Records

You need to add these DNS records to your domain registrar (where you bought shahin-ai.com):

### ✅ Step 1: Add TXT Record for Verification (REQUIRED)

```
Type: TXT
Name: asuid
Value: 8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC
TTL: 3600 (or Auto)
```

### ✅ Step 2: Add A Record for Domain (REQUIRED)

```
Type: A
Name: @ (or leave blank for root domain)
Value: 20.74.192.6
TTL: 3600 (or Auto)
```

### ✅ Step 3: Add CNAME for www (OPTIONAL but recommended)

```
Type: CNAME
Name: www
Value: shahin-ai.azurewebsites.net
TTL: 3600 (or Auto)
```

### ✅ Step 4: Add CNAME for asuid (OPTIONAL - alternative to TXT)

```
Type: CNAME
Name: asuid
Value: shahin-ai.azurewebsites.net
TTL: 3600 (or Auto)
```

---

## 🎯 Where to Add These Records

### If your domain is with:

#### **Namecheap**
1. Log in to Namecheap
2. Go to Dashboard → Domain List
3. Click "Manage" next to shahin-ai.com
4. Go to "Advanced DNS" tab
5. Click "Add New Record"
6. Add each record listed above

#### **GoDaddy**
1. Log in to GoDaddy
2. Go to My Products → Domains
3. Click DNS next to shahin-ai.com
4. Click "Add" to add new records
5. Add each record listed above

#### **Cloudflare**
1. Log in to Cloudflare
2. Select shahin-ai.com domain
3. Go to DNS tab
4. Click "Add record"
5. Add each record listed above

#### **Google Domains**
1. Log in to Google Domains
2. Select shahin-ai.com
3. Go to DNS settings
4. Add each record in the "Custom records" section

---

## ⏱️ DNS Propagation Time

After adding the records:
- **Minimum wait time**: 15-30 minutes
- **Maximum wait time**: 48 hours (usually 4-6 hours)
- **Check propagation**: Use the verification links provided by Azure

---

## 🔍 Verify DNS Configuration

### Check A Record:
```bash
nslookup shahin-ai.com
```
Should return: `20.74.192.6`

### Check TXT Record:
```bash
nslookup -type=TXT asuid.shahin-ai.com
```
Should return: `8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC`

### Online DNS Checker:
- https://dnschecker.org
- https://www.whatsmydns.net

---

## 📝 Summary Table

| Record Type | Name | Value | Purpose |
|------------|------|-------|---------|
| TXT | asuid | 8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC | Domain verification |
| A | @ | 20.74.192.6 | Point domain to Azure |
| CNAME | www | shahin-ai.azurewebsites.net | Redirect www to Azure |
| CNAME | asuid | shahin-ai.azurewebsites.net | Alternative verification |

---

## 🚨 Common Issues

### Issue 1: "DNS not configured"
**Solution**: Wait 15-30 minutes after adding records, then try again

### Issue 2: "Ownership verification failed"
**Solution**: Ensure TXT record is added correctly with exact value

### Issue 3: "A record not found"
**Solution**: Make sure A record points to `20.74.192.6` exactly

---

## ✅ After DNS is Configured

Once DNS records are added and propagated:

1. Go back to Azure Portal
2. Navigate to your App Service
3. Go to "Custom domains"
4. Click "Add custom domain"
5. Enter `shahin-ai.com`
6. Click "Validate"
7. If validation passes, click "Add"

---

## 🔐 Enable SSL Certificate

After domain is added:

1. In "Custom domains" section
2. Click on your domain `shahin-ai.com`
3. Click "Add binding"
4. Select "App Service Managed Certificate"
5. Click "Add"

Your site will be available at:
- https://shahin-ai.com
- https://www.shahin-ai.com (if CNAME added)
