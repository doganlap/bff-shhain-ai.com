# Update Existing Environment Variables

## Problem
You're getting: "A variable with the name `NODE_ENV` already exists"

This means the variable is already set for some environments. You need to **update** it, not create a new one.

## Solution

### Option 1: Update Existing Variable (Recommended)

1. Go to the Environment Variables page
2. Find `NODE_ENV` in the list
3. Click on it (or click the edit/pencil icon)
4. **Add Production environment** if it's missing
5. Make sure the value is `production`
6. Click "Save"

### Option 2: Delete and Recreate (If Update Doesn't Work)

1. Find `NODE_ENV` in the list
2. Click the delete/trash icon
3. Confirm deletion
4. Click "Add New"
5. Add it again with all environments selected

## Step-by-Step for Each Variable

### For NODE_ENV (Already Exists)

**If it exists but missing Production:**
1. Click on `NODE_ENV`
2. Check the "Production" checkbox
3. Update value to `production` if needed
4. Save

**If it exists with wrong value:**
1. Click on `NODE_ENV`
2. Update value to `production`
3. Make sure all environments are selected
4. Save

### For Other Variables

**If variable doesn't exist:**
- Click "Add New"
- Add it normally

**If variable exists:**
- Click on it to edit
- Update value/environments as needed
- Save

## Quick Checklist

### Frontend (`app-shahin-ai`):

- [ ] `NODE_ENV` - **Update existing** (add Production if missing)
- [ ] `VITE_BFF_URL` - **Add new** (if doesn't exist)

### BFF (`bff-shahin-ai`):

- [ ] `NODE_ENV` - **Update existing** (add Production if missing)
- [ ] `DATABASE_URL` - **Add new** (if doesn't exist)
- [ ] `JWT_SECRET` - **Add new** (if doesn't exist)
- [ ] `SESSION_SECRET` - **Add new** (if doesn't exist)
- [ ] `FRONTEND_ORIGINS` - **Add new** (if doesn't exist)
- [ ] `SERVICE_TOKEN` - **Add new** (optional, if doesn't exist)

## What to Do Now

1. **For NODE_ENV**: Click on it → Add Production environment → Save
2. **For other variables**: Add them as new if they don't exist
3. **After all set**: Redeploy both projects

## Visual Guide

In Vercel Dashboard:
```
Environment Variables List:
┌─────────────────────────────────────┐
│ NODE_ENV                    [Edit]  │ ← Click Edit
│ Value: production                   │
│ Environments: Dev, Preview          │ ← Add Production here
└─────────────────────────────────────┘
```

After clicking Edit:
```
┌─────────────────────────────────────┐
│ Key: NODE_ENV                       │
│ Value: production                   │
│ Environments:                        │
│ ☑ Development                       │
│ ☑ Preview                           │
│ ☐ Production  ← Check this box!    │
│                                     │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘
```

## Summary

- ✅ **NODE_ENV exists** → Just update it (add Production environment)
- ✅ **Other vars** → Add as new if they don't exist
- ✅ **After updating** → Redeploy projects

