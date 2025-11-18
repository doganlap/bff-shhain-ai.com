# Setup Environment Variables - Step by Step Guide

## ✅ Projects After Cleanup

- **Frontend**: `app-shahin-ai` ✅
- **BFF**: `bff-shahin-ai` ✅

---

## Step 1: Set Frontend Environment Variables

### Go to Frontend Project Settings:
**URL**: https://vercel.com/donganksa/app-shahin-ai/settings/environment-variables

### Add These Variables:

#### 1. NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- **Encrypted**: No

#### 2. VITE_BFF_URL
- **Key**: `VITE_BFF_URL`
- **Value**: `https://bff-shahin-ai.vercel.app`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- **Encrypted**: No

**Click "Save" after each variable**

---

## Step 2: Set BFF Environment Variables

### Go to BFF Project Settings:
**URL**: https://vercel.com/donganksa/bff-shahin-ai/settings/environment-variables

### Add These Variables:

#### 1. NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- **Encrypted**: No

#### 2. DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: `postgres://38452a313303a24baeddfbfe8046678d396610943c9b34e65432968f33793f7f:sk_ziZoE_g62VBpHvM3Nv6C7@db.prisma.io:5432/postgres?sslmode=require`
- **Environment**: ✅ Production only
- **Encrypted**: ✅ **YES** (Important!)

#### 3. JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: `208d15bb78bd8a7a17402c09b3a40f44d35df6f352e05fd9f5c0328b513dfa7a`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- **Encrypted**: ✅ **YES** (Important!)

#### 4. SESSION_SECRET
- **Key**: `SESSION_SECRET`
- **Value**: `201a910fda3dcb149ec9a29cf4545c162000a96fbc3dc7ac5d344213d0e4f65f`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- **Encrypted**: ✅ **YES** (Important!)

#### 5. FRONTEND_ORIGINS
- **Key**: `FRONTEND_ORIGINS`
- **Value**: `https://app-shahin-ai.vercel.app,https://app.shahin-ai.com,https://www.shahin-ai.com,https://shahin-ai.com`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- **Encrypted**: No

#### 6. SERVICE_TOKEN (Optional)
- **Key**: `SERVICE_TOKEN`
- **Value**: `eae1e5b539d37adcf4dbe41947e8ed280504199e92150fa6ae377794734736d1`
- **Environment**: ✅ Production
- **Encrypted**: ✅ **YES** (Important!)

**Click "Save" after each variable**

---

## Step 3: Verify Variables Are Set

### Check Frontend:
1. Go to: https://vercel.com/donganksa/app-shahin-ai/settings/environment-variables
2. Verify you see:
   - ✅ NODE_ENV
   - ✅ VITE_BFF_URL

### Check BFF:
1. Go to: https://vercel.com/donganksa/bff-shahin-ai/settings/environment-variables
2. Verify you see:
   - ✅ NODE_ENV
   - ✅ DATABASE_URL (encrypted)
   - ✅ JWT_SECRET (encrypted)
   - ✅ SESSION_SECRET (encrypted)
   - ✅ FRONTEND_ORIGINS
   - ✅ SERVICE_TOKEN (encrypted, optional)

---

## Step 4: Redeploy Both Projects

After setting environment variables, redeploy:

### Redeploy Frontend:
```bash
cd D:\Projects\Shahin-ai-App
vercel --prod --scope donganksa
```

### Redeploy BFF:
```bash
cd D:\Projects\Shahin-ai-App\apps\bff
vercel --prod --scope donganksa
```

---

## Quick Reference - Copy Paste Values

### Frontend (`app-shahin-ai`):
```
NODE_ENV = production
VITE_BFF_URL = https://bff-shahin-ai.vercel.app
```

### BFF (`bff-shahin-ai`):
```
NODE_ENV = production
DATABASE_URL = postgres://38452a313303a24baeddfbfe8046678d396610943c9b34e65432968f33793f7f:sk_ziZoE_g62VBpHvM3Nv6C7@db.prisma.io:5432/postgres?sslmode=require
JWT_SECRET = 208d15bb78bd8a7a17402c09b3a40f44d35df6f352e05fd9f5c0328b513dfa7a
SESSION_SECRET = 201a910fda3dcb149ec9a29cf4545c162000a96fbc3dc7ac5d344213d0e4f65f
FRONTEND_ORIGINS = https://app-shahin-ai.vercel.app,https://app.shahin-ai.com,https://www.shahin-ai.com,https://shahin-ai.com
SERVICE_TOKEN = eae1e5b539d37adcf4dbe41947e8ed280504199e92150fa6ae377794734736d1
```

---

## Important Notes

1. **Encrypted Variables**: Make sure to check "Encrypted" for:
   - DATABASE_URL
   - JWT_SECRET
   - SESSION_SECRET
   - SERVICE_TOKEN

2. **Environment Selection**: 
   - For Production-only vars (like DATABASE_URL): Select only "Production"
   - For all environments: Select Production, Preview, and Development

3. **After Adding Variables**: 
   - Must redeploy for changes to take effect
   - Variables are available at build time and runtime

---

## Verification Checklist

- [ ] Frontend: NODE_ENV set
- [ ] Frontend: VITE_BFF_URL set
- [ ] BFF: NODE_ENV set
- [ ] BFF: DATABASE_URL set (encrypted)
- [ ] BFF: JWT_SECRET set (encrypted)
- [ ] BFF: SESSION_SECRET set (encrypted)
- [ ] BFF: FRONTEND_ORIGINS set
- [ ] BFF: SERVICE_TOKEN set (encrypted, optional)
- [ ] Both projects redeployed
- [ ] Test login works
- [ ] No 405 errors
- [ ] No Redis connection errors

---

## Done! 🎉

After completing these steps, your deployments should work correctly!

