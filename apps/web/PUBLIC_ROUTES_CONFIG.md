# 🌐 PUBLIC ROUTES CONFIGURATION
## Complete List of Public Paths for External Web Application Integration

---

## 🎯 **OVERVIEW**

This document lists all public routes that can be accessed without authentication and linked to from another web application. These routes provide various integration points, API access, and public-facing functionality.

---

## 🔓 **PUBLIC AUTHENTICATION ROUTES**

### **Login & Registration:**
- `/login` - Main login page
- `/glassmorphism-login` - Alternative glassmorphism-styled login
- `/register` - User registration page
- `/story-registration` - Story-driven registration experience
- `/demo` - Components demonstration page

---

## 🏖️ **POC DEMO ENVIRONMENT**

### **POC Access Points:**
- `/poc` - Redirects to POC demo login
- `/poc/demo-login` - Special POC login with demo credentials
- `/poc/dashboard` - POC dashboard with sample data
- `/poc/licenses` - POC license management demo
- `/poc/tenants` - POC tenant management demo

### **Demo Credentials:**
- **Admin:** `demo@shahin-ai.com / Demo123!`
- **Manager:** `manager@shahin-ai.com / Manager123!`
- **Viewer:** `viewer@shahin-ai.com / Viewer123!`

---

## 📚 **PUBLIC API DOCUMENTATION**

### **API Access:**
- `/api` - Public API documentation and explorer
- `/api/docs` - Detailed API documentation
- `/api/status` - API health and status monitoring

### **Integration Endpoints:**
- `/integrations` - Integration hub and partner information
- `/integrations/webhook` - Webhook configuration and testing
- `/integrations/sso` - Single Sign-On integration setup

---

## 🏛️ **PUBLIC REGULATORY INTELLIGENCE**

### **Regulatory Information:**
- `/regulatory` - Public regulatory intelligence dashboard
- `/regulatory/ksa` - KSA-specific regulatory information
- `/regulatory/sectors` - Sector-specific intelligence and updates

---

## 📊 **PUBLIC REPORTS & ANALYTICS**

### **Public Reports:**
- `/reports` - Public reports and analytics dashboard
- `/reports/compliance` - Public compliance tracking information
- `/reports/risk` - Public risk management insights

---

## 🌉 **CLI BRIDGE SYSTEM**

### **Bridge Endpoints:**
- `/bridge` - CLI bridge system interface
- `/bridge/status` - Transfer status monitoring
- `/bridge/approval` - Admin approval interface

---

## 🔗 **EXTERNAL WEB APP INTEGRATION**

### **External Integration Points:**
- `/external` - Redirects to external dashboard
- `/external/dashboard` - External app dashboard integration
- `/external/assessments` - External assessments module
- `/external/compliance` - External compliance tracking
- `/external/frameworks` - External frameworks management
- `/external/controls` - External controls management
- `/external/risks` - External risk management
- `/external/reports` - External reports integration
- `/external/organizations` - External organization management

---

## 🔧 **MICROSERVICES PUBLIC ENDPOINTS**

### **Service Access Points:**
- `/services` - Microservices overview and status
- `/services/license` - License service public interface
- `/services/tenant` - Tenant service public interface
- `/services/analytics` - Analytics service public interface
- `/services/notification` - Notification service public interface
- `/services/billing` - Billing service public interface
- `/services/auth` - Authentication service public interface
- `/services/reporting` - Reporting service public interface
- `/services/workflow` - Workflow service public interface

---

## 📈 **PUBLIC HEALTH & MONITORING**

### **System Status:**
- `/health` - System health dashboard (public view)
- `/status` - Simple system status check
- `/metrics` - Public metrics and performance data

---

## 🔧 **IMPLEMENTATION EXAMPLE**

### **Linking from Another Web Application:**

```html
<!-- External Web App Integration -->
<a href="https://grc.shahin-ai.com/external/dashboard" target="_blank">
  Open GRC Dashboard
</a>

<!-- POC Demo Access -->
<a href="https://grc.shahin-ai.com/poc/demo-login" target="_blank">
  Try GRC Demo
</a>

<!-- API Documentation -->
<a href="https://grc.shahin-ai.com/api/docs" target="_blank">
  View API Documentation
</a>

<!-- Public Reports -->
<a href="https://grc.shahin-ai.com/reports" target="_blank">
  View Public Reports
</a>
```

### **JavaScript Integration:**

```javascript
// Open GRC module in new window
function openGRCModule(module) {
  const baseUrl = 'https://grc.shahin-ai.com';
  const moduleUrls = {
    dashboard: '/external/dashboard',
    assessments: '/external/assessments',
    compliance: '/external/compliance',
    reports: '/external/reports',
    poc: '/poc/demo-login'
  };
  
  window.open(`${baseUrl}${moduleUrls[module]}`, '_blank');
}

// Check GRC system status
async function checkGRCStatus() {
  try {
    const response = await fetch('https://grc.shahin-ai.com/status');
    const status = await response.json();
    return status.healthy;
  } catch (error) {
    console.error('GRC system unavailable:', error);
    return false;
  }
}
```

### **React Component Integration:**

```jsx
import React from 'react';

const GRCIntegration = () => {
  const openGRCDashboard = () => {
    window.open('https://grc.shahin-ai.com/external/dashboard', '_blank');
  };

  const openPOCDemo = () => {
    window.open('https://grc.shahin-ai.com/poc/demo-login', '_blank');
  };

  return (
    <div className="grc-integration">
      <h3>GRC Platform Access</h3>
      <div className="integration-buttons">
        <button onClick={openGRCDashboard}>
          Open GRC Dashboard
        </button>
        <button onClick={openPOCDemo}>
          Try POC Demo
        </button>
        <a href="https://grc.shahin-ai.com/api/docs" target="_blank">
          API Documentation
        </a>
      </div>
    </div>
  );
};
```

---

## 🔒 **SECURITY CONSIDERATIONS**

### **Public Route Security:**
- **Rate Limiting** - All public routes have rate limiting enabled
- **CORS Configuration** - Proper CORS headers for external integration
- **Input Validation** - All public inputs are validated and sanitized
- **Audit Logging** - Public route access is logged for security monitoring

### **POC Environment Security:**
- **Isolated Database** - POC uses separate database schema
- **Demo Data Only** - No production data in POC environment
- **Auto-Reset** - Daily data refresh prevents data accumulation
- **Limited Functionality** - Core features only, no admin functions

---

## 📊 **USAGE ANALYTICS**

### **Public Route Monitoring:**
- **Access Logs** - All public route access is logged
- **Performance Metrics** - Response times and success rates tracked
- **Usage Statistics** - Popular routes and integration patterns
- **Error Tracking** - Failed requests and error patterns

---

## 🚀 **DEPLOYMENT CONFIGURATION**

### **Environment Variables:**
```bash
# Public routes configuration
PUBLIC_ROUTES_ENABLED=true
POC_ENVIRONMENT_ENABLED=true
API_DOCS_PUBLIC=true
EXTERNAL_INTEGRATION_ENABLED=true

# Security settings
RATE_LIMIT_PUBLIC=1000  # requests per hour
CORS_ORIGINS=https://partner-app.com,https://client-portal.com
PUBLIC_CACHE_TTL=300    # 5 minutes
```

### **Nginx Configuration:**
```nginx
# Public routes proxy configuration
location /external/ {
    proxy_pass http://grc-app:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Public-Route true;
}

location /poc/ {
    proxy_pass http://grc-app:3000;
    proxy_set_header X-POC-Mode true;
    add_header X-Frame-Options SAMEORIGIN;
}

location /api/ {
    proxy_pass http://grc-app:3000;
    proxy_set_header X-API-Public true;
    add_header Access-Control-Allow-Origin *;
}
```

---

## 📋 **INTEGRATION CHECKLIST**

### **Before Integration:**
- [ ] Verify target routes are accessible
- [ ] Test authentication flows (if needed)
- [ ] Configure CORS for your domain
- [ ] Set up error handling for failed requests
- [ ] Implement loading states for external calls

### **During Integration:**
- [ ] Monitor performance impact
- [ ] Track user engagement with GRC features
- [ ] Log integration errors and issues
- [ ] Validate data consistency across systems

### **After Integration:**
- [ ] Monitor usage analytics
- [ ] Gather user feedback
- [ ] Optimize performance bottlenecks
- [ ] Plan for future feature integration

---

## 🎯 **BENEFITS OF PUBLIC ROUTES**

### **✅ Business Benefits:**
- **Seamless Integration** - Easy embedding in external applications
- **Improved User Experience** - Single sign-on and unified workflows
- **Increased Adoption** - Lower barrier to entry with POC demos
- **Better Analytics** - Comprehensive usage tracking across platforms

### **✅ Technical Benefits:**
- **Microservices Architecture** - Independent service scaling
- **API-First Design** - Consistent integration patterns
- **Security by Design** - Built-in rate limiting and validation
- **Monitoring & Observability** - Complete request tracking

**All public routes are production-ready and provide secure, scalable access points for external web application integration!** 🚀
