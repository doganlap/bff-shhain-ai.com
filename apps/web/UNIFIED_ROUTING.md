# 🎯 **UNIFIED ROUTING SYSTEM**

**Single Router | Single Entry Point | Centralized Route Selection**

---

## 📋 **ARCHITECTURE**

### **1. Entry Point** (`src/index.jsx`)
- **ONE Router**: `BrowserRouter` wraps the entire application
- **ONE Entry**: `App` component is the single entry point
- **Providers**: MSAL, AppContext, Router all configured here

### **2. App Component** (`src/App.jsx`)
- **Route Selection**: Dynamically renders routes from configuration
- **Query Client**: React Query provider
- **Clean Structure**: No hardcoded routes, all from config

### **3. Route Configuration** (`src/config/routes.js`)
- **Single Source of Truth**: All routes defined in one place
- **Organized by Type**: Public, Advanced, App, Fallback
- **Permission-Based**: Routes include permission requirements
- **Helper Functions**: Utilities for route management

---

## 🗂️ **ROUTE STRUCTURE**

```javascript
routeConfig = {
  public: [...],      // Public routes (/, /login)
  advanced: [...],    // Advanced shell routes (/advanced)
  app: [...],         // Standard app routes (/app)
  fallback: [...]     // 404 and redirects
}
```

---

## 📍 **ROUTE TYPES**

### **Public Routes**
- `/` - Landing Page
- `/login` - Standard Login
- `/login-glass` - Glassmorphism Login

### **Advanced Shell Routes**
- `/advanced` - Advanced Dashboard Shell
  - `/advanced` - Dashboard
  - `/advanced/assessments` - Assessments
  - `/advanced/frameworks` - Frameworks

### **Standard App Routes**
- `/app` - Main Application Layout
  - `/app` - Dashboard
  - `/app/assessments` - Assessments
  - `/app/frameworks` - Frameworks
  - `/app/organizations` - Organizations List
  - `/app/organizations/:id` - Organization Details
  - `/app/organizations/new` - New Organization
  - `/app/organizations/:id/edit` - Edit Organization
  - `/app/sector-intelligence` - Sector Intelligence
  - `/app/regulators` - Regulators
  - `/app/reports` - Reports
  - `/app/database` - Database (Admin)
  - `/app/settings` - Settings
  - `/app/components-demo` - Components Demo
  - `/app/ksa-grc` - KSA GRC

### **Fallback Routes**
- `/404` - Not Found Page
- `*` - Redirect to Home

---

## 🔧 **USAGE**

### **Adding a New Route**

1. **Edit `src/config/routes.js`**:
```javascript
{
  path: 'new-route',
  element: <NewComponent />,
  title: 'New Route',
  permission: 'read' // optional
}
```

2. **Route is automatically available** - No need to edit App.jsx!

### **Route Helpers**

```javascript
import { 
  getRouteByPath, 
  isRouteProtected, 
  getRoutePermission 
} from './config/routes';

// Get route info
const route = getRouteByPath('/app/organizations');

// Check if protected
const isProtected = isRouteProtected('/app/organizations');

// Get required permission
const permission = getRoutePermission('/app/organizations');
```

---

## ✅ **BENEFITS**

1. **Single Router**: One BrowserRouter in index.jsx
2. **Single Entry Point**: App.jsx handles all routing
3. **Centralized Config**: All routes in one file
4. **Easy Maintenance**: Add/remove routes in one place
5. **Type Safety**: Route structure is consistent
6. **Permission-Based**: Built-in permission checking
7. **Scalable**: Easy to add new route types

---

## 🎯 **ROUTE SELECTION FLOW**

```
index.jsx (Router)
    ↓
App.jsx (Route Selection)
    ↓
routes.js (Route Configuration)
    ↓
Components (Pages)
```

---

## 📝 **EXAMPLE: Adding a New Page**

```javascript
// 1. Create component: src/pages/NewPage.jsx
// 2. Add to routes.js:

app: [
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      // ... existing routes
      {
        path: 'new-page',
        element: <NewPage />,
        title: 'New Page',
        permission: 'read'
      }
    ]
  }
]
```

**That's it!** The route is automatically available at `/app/new-page`

---

**Status:** ✅ **Unified Routing System Active**

