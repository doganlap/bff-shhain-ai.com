# 🌐 Custom Domain Setup for Azure Container Apps - www.shahin-ai.com

## 📋 DNS Records Configuration

### Step 1: Add These DNS Records to Your Domain Provider

**⚠️ IMPORTANT: Add BOTH records below to your DNS provider (GoDaddy, Namecheap, Cloudflare, etc.)**

#### 1. Domain Verification Record (TXT)
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
Value: shahin-landing-page-uae.lemontree-e454b3dd.eastus.azurecontainerapps.io
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
```powershell
# Check TXT record
nslookup -type=TXT asuid.www.shahin-ai.com

# Check CNAME record
nslookup www.shahin-ai.com
```

### Step 4: Complete Azure Setup

Once DNS records are active, run:
```powershell
az containerapp hostname add --hostname www.shahin-ai.com --name shahin-landing-page-uae --resource-group shahin-ai-rg
```

### Step 5: Enable Managed Certificate (SSL)

After domain is added, enable automatic SSL:
```powershell
az containerapp hostname bind --hostname www.shahin-ai.com --name shahin-landing-page-uae --resource-group shahin-ai-rg --environment shahin-env
```

## 🎯 Expected Result

After setup completion:
- ✅ https://www.shahin-ai.com (your custom domain)
- ✅ Automatic SSL certificate from Azure
- ✅ Redirects to your Azure Container App
- ✅ Original URL still works: https://shahin-landing-page-uae.lemontree-e454b3dd.eastus.azurecontainerapps.io

## ⏰ Timeline

- DNS propagation: 15-60 minutes
- Domain verification: 5-10 minutes after DNS propagation
- SSL certificate: 5-15 minutes after domain verification
- Total time: 30 minutes - 2 hours maximum

## 🔍 Troubleshooting

### DNS Not Propagating
```powershell
# Check DNS from different locations
nslookup www.shahin-ai.com 8.8.8.8
nslookup www.shahin-ai.com 1.1.1.1
```

### Domain Verification Failing
```powershell
# Check TXT record specifically
nslookup -type=TXT asuid.www.shahin-ai.com
```

### SSL Certificate Issues
```powershell
# Check domain status
az containerapp hostname list --name shahin-landing-page-uae --resource-group shahin-ai-rg
```

## 📊 Current Configuration

- **Container App**: shahin-landing-page-uae
- **Resource Group**: shahin-ai-rg
- **Environment**: shahin-env
- **Current URL**: https://shahin-landing-page-uae.lemontree-e454b3dd.eastus.azurecontainerapps.io
- **Target Domain**: www.shahin-ai.com

## 🆘 Need Help?

1. Contact your domain provider's support if you need help adding DNS records
2. Use online DNS checker tools to verify propagation
3. Check Azure Container Apps documentation for additional troubleshooting

---

**Last Updated**: November 10, 2025  
**Maintained by**: DoganConsult
