# Project Consolidation - Fix Duplicate Projects

## Current Situation

You have **two frontend projects**:

### 1. `app-shahin-ai` ✅ CORRECT PROJECT
- **URL**: https://app-shahin-ai-donganksa.vercel.app
- **Settings**: ✅ Correct
  - Root Directory: `.` (project root)
  - Build Command: `cd apps/web && pnpm install && pnpm build`
  - Output Directory: `apps/web/dist`
  - Node.js: 22.x
- **Created**: 18h ago
- **Status**: ✅ Properly configured

### 2. `shahin-ai-app` ❌ WRONG PROJECT (Accidentally Created)
- **URL**: https://shahin-ai-app.vercel.app
- **Settings**: ❌ Wrong
  - Root Directory: `.`
  - Build Command: `npm run vercel-build` (wrong)
  - Output Directory: `public` (wrong)
  - Node.js: 20.x
- **Created**: 16h ago
- **Status**: ❌ Incorrectly configured

## Solution

### Option 1: Use `app-shahin-ai` (Recommended)

This is the correct project with proper settings. Link to it:

```bash
cd D:\Projects\Shahin-ai-App
vercel link --project=app-shahin-ai --scope donganksa
```

Then deploy:
```bash
vercel --prod --scope donganksa
```

### Option 2: Delete `shahin-ai-app` and Keep `app-shahin-ai`

1. Delete the wrong project (optional):
   ```bash
   vercel project remove shahin-ai-app --scope donganksa
   ```

2. Use `app-shahin-ai` for all deployments

## Action Required

**Link to the correct project:**

```bash
cd D:\Projects\Shahin-ai-App
vercel link --project=app-shahin-ai --scope donganksa
```

This will update `.vercel/project.json` to point to the correct project.

## Updated Environment Variables

Make sure `VITE_BFF_URL` points to the correct BFF:

**For `app-shahin-ai` project:**
- `VITE_BFF_URL` = `https://bff-shahin-ai.vercel.app`

## Summary

- ✅ **Use**: `app-shahin-ai` (correct settings)
- ❌ **Ignore/Delete**: `shahin-ai-app` (wrong settings)
- 🔗 **Action**: Link local project to `app-shahin-ai`

