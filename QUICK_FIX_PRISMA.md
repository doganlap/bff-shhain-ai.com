# Quick Fix: Prisma Checksum Error

## Error Message
```
Error: Failed to fetch sha256 checksum at https://binaries.prisma.sh/...
If you need to ignore this error, set the PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING environment variable
```

## Quick Fix (2 minutes)

1. **Go to Vercel Dashboard**:
   https://vercel.com/donganksa/bff-shahin-ai/settings/environment-variables

2. **Click "Add New"**

3. **Enter**:
   - **Key**: `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING`
   - **Value**: `1`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - **Encrypted**: ❌ No

4. **Click "Save"**

5. **Redeploy BFF**:
   ```bash
   cd D:\Projects\Shahin-ai-App\apps\bff
   vercel --prod --scope donganksa
   ```

## What This Does

This environment variable tells Prisma to skip checksum verification when the Prisma binary servers are temporarily unavailable. This is safe because:
- Prisma will still download and use the correct binaries
- It just skips the checksum verification step
- This is an official Prisma workaround for network issues

## After Adding

The next BFF deployment should succeed without the checksum error.

