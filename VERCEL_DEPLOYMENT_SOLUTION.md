# BFF Deployment Solution for shahin-ai-app

## Problem

The Vercel project "shahin-ai-app" is configured for React app with:

- Root Directory: `apps/web/dist`
- Framework: Create React App
- Build Command: `npm run build`

## Solution: Deploy BFF as Serverless Function

### Step 1: Create Serverless Function Structure

Instead of replacing the entire project, we'll deploy the BFF as a serverless function that handles API routes.

### Step 2: Update Project Structure

```text
apps/
├── web/                    # Existing React app (keep as backup)
└── bff/
    ├── api/
    │   └── index.js        # Serverless function entry point
    ├── package.json
    └── vercel.json
```

### Step 3: Create Serverless Function Entry Point

Create `apps/bff/api/index.js` as the main serverless function.

### Step 4: Update vercel.json for Function Routing

Configure routing to handle API requests through the BFF function.

## Immediate Action Required

Since the project settings need to be updated in the Vercel dashboard, here are your options:

### Option A: Manual Settings Update (Recommended)

1. Go to: <https://vercel.com/donganksa/shahin-ai-app/settings>
2. Change settings:
   - Root Directory: `apps/bff`
   - Framework Preset: None
   - Build Command: `npm install && npm run build`
   - Output Directory: `.`
3. Deploy: `vercel --prod`

### Option B: Deploy as New Project

Create a new Vercel project specifically for the BFF backend.

### Option C: Hybrid Approach (Best)

Keep React app for frontend and deploy BFF as serverless functions within the same project.

## Current Status

✅ BFF code ready with all features
✅ Environment variables configured
✅ Error handling and mock data implemented
✅ Linked to shahin-ai-app project

## Next Steps

Choose your deployment approach and execute the deployment!
