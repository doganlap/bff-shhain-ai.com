# 🌐 Vercel DNS Setup Guide for www.shahin-ai.com

## ✅ Records Added - Next Steps

Great! You've added the DNS records to Vercel. Here's what happens next:

## ⏰ **Current Status**
- ✅ DNS records added to Vercel
- 🔄 Waiting for DNS propagation (5-30 minutes)
- ⏳ Azure setup will complete automatically once DNS is ready

## 📋 **Vercel DNS Records (Confirm These Are Added)**

### In your Vercel Dashboard → Domains → shahin-ai.com → DNS:

#### Record 1: Verification (TXT)
```
Type: TXT
Name: asuid.www
Value: 8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC
```

#### Record 2: Domain Pointer (CNAME)
```
Type: CNAME
Name: www
Value: grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io
```

## 🔍 **How to Verify in Vercel**

1. **Login to Vercel**: https://vercel.com/dashboard
2. **Go to Domains**: Click "Domains" in sidebar
3. **Select Domain**: Click "shahin-ai.com"
4. **Check DNS**: Look for both records listed above

## ⏰ **Propagation Timeline**

| Time | Status |
|------|--------|
| **0-5 min** | Records added to Vercel |
| **5-15 min** | DNS propagating globally |
| **15-30 min** | Usually fully propagated |
| **30+ min** | Complete (rare delays) |

## 🔧 **Automated Monitoring**

I've created `vercel-dns-setup.bat` which will:
- ✅ Check DNS records every 2 minutes
- ✅ Automatically complete Azure setup when ready
- ✅ Notify you when www.shahin-ai.com is live

**Run it now**: Double-click `vercel-dns-setup.bat`

## 🌐 **Expected Final Result**

Once complete, you'll have:
- ✅ **https://www.shahin-ai.com** (your custom domain)
- ✅ **Automatic SSL certificate**
- ✅ **Professional branding**
- ✅ **Same content as Azure URL**

## ❓ **Troubleshooting**

### If DNS doesn't propagate in 30 minutes:

1. **Check Vercel Records**: Ensure both records are exactly as shown above
2. **Check TTL**: Set TTL to 300 seconds (5 minutes) if possible
3. **Flush Local DNS**: Run `ipconfig /flushdns` on Windows

### Common Vercel Issues:
- **Wrong Name**: Use `asuid.www` not `asuid.www.shahin-ai.com`
- **Wrong Value**: Copy-paste exact values above
- **Case Sensitivity**: Values are case-sensitive

## 🆘 **Need Help?**

**Current URLs that work now:**
- ✅ **Azure**: https://grc-landing-page-prod.mangofield-b9b64fbb.eastus.azurecontainerapps.io
- ✅ **Local**: http://localhost:4000

**Status Updates:**
- Run `vercel-dns-setup.bat` for real-time monitoring
- DNS propagation is normal and expected - no action needed from you!
