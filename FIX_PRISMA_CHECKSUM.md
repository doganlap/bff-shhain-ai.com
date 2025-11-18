# Fix Prisma Checksum Error

## Problem
```
Error: Failed to fetch sha256 checksum at https://binaries.prisma.sh/...
If you need to ignore this error, set the PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING environment variable
```

## Solution
Add `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` to BFF environment variables in Vercel.

## Steps

1. Go to: https://vercel.com/donganksa/bff-shahin-ai/settings/environment-variables
2. Click "Add New"
3. Set:
   - **Key**: `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING`
   - **Value**: `1`
   - **Environments**: Production, Preview, Development
   - **Encrypted**: No
4. Click "Save"
5. Redeploy BFF

This will allow Prisma to skip checksum verification when the Prisma servers are unavailable.

