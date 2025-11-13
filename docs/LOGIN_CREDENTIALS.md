# 🔐 LOGIN CREDENTIALS & ROLES

## 🎯 QUICK ACCESS

### **Demo Login (Any Credentials Work)**
- **Username/Email:** `admin@shahin-ai.com`
- **Password:** `admin123`
- **Role:** Platform Administrator

**Note:** The current login system accepts ANY email and password for demo purposes.

---

## 👥 AVAILABLE ROLES & PERMISSIONS

### **1. 🏢 Platform Administrator (MSP Owner)**
- **Username:** `admin@shahin-ai.com`
- **Password:** `admin123`
- **Access:**
  - ✅ All platform features
  - ✅ License management
  - ✅ Renewals pipeline
  - ✅ Usage analytics
  - ✅ All tenant management
  - ✅ System administration

### **2. 💼 Sales Manager**
- **Username:** `sales@shahin-ai.com`
- **Password:** `sales123`
- **Access:**
  - ✅ Renewals pipeline
  - ✅ Opportunity management
  - ✅ Customer insights
  - ✅ Revenue tracking

### **3. 🛠️ Customer Success Manager**
- **Username:** `success@shahin-ai.com`
- **Password:** `success123`
- **Access:**
  - ✅ Usage monitoring
  - ✅ Customer health scores
  - ✅ Upsell opportunities
  - ✅ Support metrics

### **4. 🏛️ Tenant Administrator**
- **Username:** `tenant-admin@acme.com`
- **Password:** `tenant123`
- **Access:**
  - ✅ Tenant dashboard
  - ✅ Usage monitoring
  - ✅ User management
  - ✅ Billing information
  - ✅ Upgrade options

### **5. 👤 Regular User**
- **Username:** `user@acme.com`
- **Password:** `user123`
- **Access:**
  - ✅ Basic GRC features
  - ✅ Assessments
  - ✅ Reports viewing
  - ✅ Limited administrative functions

---

## 🌐 ACCESS URLS

### **Platform Admin Routes:**
- **License Management:** `/platform/licenses`
- **Renewals Pipeline:** `/platform/renewals`
- **Usage Analytics:** `/platform/usage`
- **Platform Settings:** `/platform/settings`

### **Tenant Routes:**
- **Tenant Dashboard:** `/tenant/550e8400-e29b-41d4-a716-446655440001`
- **Tenant Usage:** `/tenant/550e8400-e29b-41d4-a716-446655440001/usage`
- **Tenant Upgrade:** `/tenant/550e8400-e29b-41d4-a716-446655440001/upgrade`

### **Main Application:**
- **Dashboard:** `/app`
- **Enhanced Dashboard:** `/app/dashboard`
- **Assessments:** `/app/assessments`
- **Frameworks:** `/app/frameworks`

---

## 🚀 QUICK LOGIN STEPS

1. **Open:** http://localhost:5174
2. **Enter ANY email and password** (demo mode)
3. **Recommended:**
   - Email: `admin@shahin-ai.com`
   - Password: `admin123`
4. **Click Login**
5. **Access all features!**

---

## 🔧 FOR PRODUCTION

To set up real authentication:

1. **Update login logic** in `GlassmorphismLoginPage.jsx`
2. **Connect to real auth service**
3. **Configure JWT tokens**
4. **Set up user database**
5. **Implement role-based access control**

**Current Status:** Demo mode - any credentials work! 🎉
