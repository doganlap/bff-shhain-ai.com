# 🌐 Custom Domain Setup - www.shahin-ai.com

## 📋 DNS Records Configuration

### Step 1: Add These DNS Records to Your Domain Provider

**⚠️ IMPORTANT: Add BOTH records below to your DNS provider (GoDaddy, Namecheap, Cloudflare, etc.)**

#### 1. Verification Record (TXT)
```
Type: TXT
Name: asuid.www.shahin-ai.com
Value: 8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC
TTL: 3600 (1 hour)
```

#### 2. Domain Pointer (CNAME)
```
Type: CNAME
Name: www.shahin-ai.com
Value: grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io
TTL: 3600 (1 hour)
```

### Step 2: How to Add Records (Common Providers)

#### GoDaddy:
1. Login to GoDaddy
2. Go to "My Products" > "DNS"
3. Click "Add" button
4. Add both records above

#### Namecheap:
1. Login to Namecheap
2. Go to "Domain List" > "Manage"
3. Click "Advanced DNS"
4. Add both records above

#### Cloudflare:
1. Login to Cloudflare
2. Select your domain
3. Go to "DNS" > "Records"
4. Add both records above

### Step 3: Verify DNS Propagation

Wait 15-60 minutes, then test:
```bash
# Check TXT record
nslookup -type=TXT asuid.www.shahin-ai.com

# Check CNAME record
nslookup www.shahin-ai.com
```

### Step 4: Complete Azure Setup

Once DNS records are active, run:
```bash
az containerapp hostname add --hostname www.shahin-ai.com --name grc-landing-page-prod --resource-group rg-grc-assessment-prod
```

## 🎯 Expected Result

After setup completion:
- ✅ https://www.shahin-ai.com (your custom domain)
- ✅ Automatic SSL certificate
- ✅ Redirects to your Azure app

## ⏰ Timeline

- DNS propagation: 15-60 minutes
- SSL certificate: 5-15 minutes after domain verification
- Total time: 1-2 hours maximum

## 🆘 Need Help?

Contact your domain provider's support if you need help adding DNS records.
