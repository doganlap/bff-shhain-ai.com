# 📋 **COMPLETE SOURCE CODE INVENTORY - SHAHINAI GRC PLATFORM**

## 🎯 **DOCUMENT PURPOSE**
This document provides a complete breakdown of all source code files, their purposes, and usage instructions. Based on actual code structure, not documentation files.

---

## 🏗️ **ARCHITECTURE OVERVIEW**

```
ShahinAI/
├── backend/          # Node.js/Express API Server
├── frontend/         # React/Vite Application
├── database-schema/  # PostgreSQL Schema Files
├── scripts/          # Utility Scripts
└── data-import/      # Data Import Scripts
```

---

## 📁 **LAYER 1: BACKEND SERVER (Node.js/Express)**

### **📍 Entry Point**
**File:** `backend/server.js`
- **Purpose:** Main Express server application entry point
- **What it does:**
  - Initializes Express app with security middleware (Helmet, CORS, Rate Limiting)
  - Registers all API routes
  - Handles error responses
  - Serves static files and React build
  - Database connection testing
  - Graceful shutdown handling
- **How to use:**
  ```bash
  npm start          # Production mode
  npm run dev        # Development with nodemon
  ```
- **Key Features:**
  - Security headers (CSP, HSTS, XSS protection)
  - Rate limiting (general, auth, uploads)
  - CORS configuration
  - Global error handling
  - Health check endpoint (`/api/health`)

---

### **📁 CONFIGURATION LAYER** (`backend/config/`)

#### **1. Database Configuration**
**File:** `backend/config/database.js`
- **Purpose:** PostgreSQL connection pool management
- **What it does:**
  - Creates connection pool with configurable settings
  - Supports Azure Key Vault for production secrets
  - Provides `query()` and `transaction()` helpers
  - Connection testing and health checks
- **How to use:**
  ```javascript
  const { query, transaction } = require('./config/database');
  
  // Simple query
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  
  // Transaction
  await transaction(async (client) => {
    await client.query('INSERT INTO ...');
    await client.query('UPDATE ...');
  });
  ```
- **Environment Variables:**
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - `DB_POOL_MIN`, `DB_POOL_MAX`
  - `KEY_VAULT_NAME` (for Azure Key Vault)

#### **2. Security Configuration**
**File:** `backend/config/security.js`
- **Purpose:** Security middleware stack configuration
- **What it does:**
  - Exports security middleware functions
  - Configures security headers
  - Request validation
- **How to use:** Imported automatically by `server.js`

---

### **📁 MIDDLEWARE LAYER** (`backend/middleware/`)

#### **1. Authentication Middleware**
**File:** `backend/middleware/auth.js`
- **Purpose:** JWT token authentication
- **What it does:**
  - Validates JWT tokens from Authorization header
  - Populates `req.user` with user data
  - Checks user status (active/inactive)
  - Includes tenant information
- **How to use:**
  ```javascript
  const { authenticateToken, optionalAuth } = require('./middleware/auth');
  
  // Required authentication
  router.get('/protected', authenticateToken, handler);
  
  // Optional authentication (populates req.user if token exists)
  router.get('/public', optionalAuth, handler);
  ```
- **Exports:**
  - `authenticateToken` - Required auth middleware
  - `optionalAuth` - Optional auth middleware
  - `refreshToken` - Token refresh handler

#### **2. RBAC Middleware**
**File:** `backend/middleware/rbac.js`
- **Purpose:** Role-Based Access Control
- **What it does:**
  - Checks user permissions
  - Validates role assignments
  - Tenant-scoped permission checks
- **How to use:**
  ```javascript
  const { requirePermission, requireRole } = require('./middleware/rbac');
  
  router.get('/admin', authenticateToken, requirePermission('admin'), handler);
  router.post('/write', authenticateToken, requireRole('manager'), handler);
  ```
- **Functions:**
  - `hasPermission(userId, permission)` - Check permission
  - `getUserPermissions(userId)` - Get all user permissions
  - `getUserRoles(userId, tenantId)` - Get user roles
  - `requirePermission(permission)` - Middleware factory
  - `requireRole(role)` - Middleware factory

#### **3. Security Middleware**
**File:** `backend/middleware/security.js`
- **Purpose:** Additional security measures
- **What it does:**
  - Request sanitization
  - Input validation
  - Security headers
- **How to use:** Automatically applied in `server.js`

#### **4. Validation Middleware**
**File:** `backend/middleware/validation.js`
- **Purpose:** Request validation using Joi
- **What it does:**
  - Validates request body, query, params
  - Returns standardized error responses
- **How to use:**
  ```javascript
  const { validate } = require('./middleware/validation');
  const schema = Joi.object({ name: Joi.string().required() });
  
  router.post('/create', validate(schema), handler);
  ```

#### **5. Upload Middleware**
**File:** `backend/middleware/upload.js`
- **Purpose:** File upload handling with Multer
- **What it does:**
  - Configures Multer for file uploads
  - File size limits
  - File type validation
  - Storage configuration
- **How to use:**
  ```javascript
  const { upload } = require('./middleware/upload');
  
  router.post('/upload', authenticateToken, upload.single('file'), handler);
  ```

---

### **📁 ROUTES LAYER** (`backend/routes/`)

#### **1. Authentication Routes**
**File:** `backend/routes/auth.js`
- **Purpose:** User authentication endpoints
- **Endpoints:**
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/logout` - User logout
  - `POST /api/auth/refresh` - Refresh JWT token
  - `POST /api/auth/forgot-password` - Password reset request
  - `POST /api/auth/reset-password` - Password reset
- **Database Tables:** `users`, `user_sessions`, `password_reset_tokens`
- **How to use:**
  ```javascript
  // Login
  POST /api/auth/login
  Body: { email, password }
  Response: { token, user, tenant }
  
  // Register
  POST /api/auth/register
  Body: { email, password, firstName, lastName, tenantId }
  ```

#### **2. Microsoft Authentication**
**File:** `backend/routes/microsoft-auth.js`
- **Purpose:** Microsoft SSO integration
- **Endpoints:**
  - `GET /api/microsoft-auth/login` - Initiate SSO
  - `GET /api/microsoft-auth/callback` - SSO callback
  - `POST /api/microsoft-auth/token` - Exchange token
- **How to use:** Integrated with Azure AD/Entra ID

#### **3. Users Routes**
**File:** `backend/routes/users.js`
- **Purpose:** User management CRUD
- **Endpoints:**
  - `GET /api/users` - List users (paginated)
  - `GET /api/users/:id` - Get user details
  - `POST /api/users` - Create user
  - `PUT /api/users/:id` - Update user
  - `DELETE /api/users/:id` - Delete user
  - `PUT /api/users/profile` - Update own profile
  - `PUT /api/users/change-password` - Change password
- **Database Tables:** `users`, `user_roles`, `tenants`
- **Authentication:** Required (authenticateToken)
- **Permissions:** Admin for user management, self for profile

#### **4. Tenants Routes**
**File:** `backend/routes/tenants.js`
- **Purpose:** Multi-tenant management
- **Endpoints:**
  - `GET /api/tenants` - List tenants
  - `GET /api/tenants/:id` - Get tenant details
  - `POST /api/tenants` - Create tenant
  - `PUT /api/tenants/:id` - Update tenant
  - `DELETE /api/tenants/:id` - Delete tenant
  - `GET /api/tenants/:id/settings` - Get tenant settings
  - `PUT /api/tenants/:id/settings` - Update settings
- **Database Tables:** `tenants`, `tenant_settings`
- **Authentication:** Required
- **Permissions:** Admin only

#### **5. Organizations Routes**
**File:** `backend/routes/organizations.js`
- **Purpose:** Organization CRUD operations
- **Endpoints:**
  - `GET /api/organizations` - List organizations (with filters)
  - `GET /api/organizations/:id` - Get organization details
  - `POST /api/organizations` - Create organization
  - `PUT /api/organizations/:id` - Update organization
  - `DELETE /api/organizations/:id` - Delete organization
  - `GET /api/organizations/:id/assessments` - Get org assessments
  - `GET /api/organizations/:id/compliance` - Get compliance status
  - `GET /api/organizations/:id/metrics` - Get metrics
- **Query Parameters:**
  - `page`, `limit` - Pagination
  - `sector`, `country` - Filtering
  - `search` - Text search
  - `is_active` - Active status filter
- **Database Tables:** `organizations`, `assessments`, `sectors`
- **Authentication:** Required
- **Permissions:** Read (all), Write (manager+)

#### **6. Regulators Routes**
**File:** `backend/routes/regulators.js`
- **Purpose:** Regulatory authority management
- **Endpoints:**
  - `GET /api/regulators` - List regulators
  - `GET /api/regulators/:id` - Get regulator details
  - `POST /api/regulators` - Create regulator
  - `PUT /api/regulators/:id` - Update regulator
  - `DELETE /api/regulators/:id` - Delete regulator
  - `GET /api/regulators/:id/frameworks` - Get regulator frameworks
  - `GET /api/regulators/:id/statistics` - Get statistics
- **Database Tables:** `regulators`, `grc_frameworks`, `regulator_frameworks`
- **Authentication:** Required for write operations

#### **7. Frameworks Routes**
**File:** `backend/routes/frameworks.js`
- **Purpose:** GRC framework management
- **Endpoints:**
  - `GET /api/grc-frameworks` - List frameworks
  - `GET /api/grc-frameworks/:id` - Get framework details
  - `POST /api/grc-frameworks` - Create framework
  - `PUT /api/grc-frameworks/:id` - Update framework
  - `DELETE /api/grc-frameworks/:id` - Delete framework
  - `GET /api/grc-frameworks/:id/controls` - Get framework controls
  - `GET /api/grc-frameworks/:id/assessments` - Get assessments
  - `POST /api/grc-frameworks/import` - Import framework
  - `GET /api/grc-frameworks/:id/export` - Export framework
- **Database Tables:** `grc_frameworks`, `grc_controls`, `framework_controls`
- **Authentication:** Required

#### **8. Controls Routes**
**File:** `backend/routes/controls.js`
- **Purpose:** GRC control library management
- **Endpoints:**
  - `GET /api/grc-controls` - List controls (with filters)
  - `GET /api/grc-controls/:id` - Get control details
  - `POST /api/grc-controls` - Create control
  - `PUT /api/grc-controls/:id` - Update control
  - `DELETE /api/grc-controls/:id` - Delete control
  - `PUT /api/grc-controls/bulk` - Bulk update
  - `GET /api/grc-controls/:id/responses` - Get control responses
  - `GET /api/grc-controls/search` - Advanced search
- **Query Parameters:**
  - `framework_id`, `sector`, `criticality`, `status`
  - `search`, `page`, `limit`
- **Database Tables:** `grc_controls`, `control_families`, `sector_controls`
- **Authentication:** Required

#### **9. Sector Controls Routes**
**File:** `backend/routes/sector-controls.js`
- **Purpose:** Sector-based control filtering (intelligence)
- **Endpoints:**
  - `GET /api/sector-controls` - Get controls by sector
  - `GET /api/sector-controls/:sector` - Get sector-specific controls
  - `GET /api/sector-controls/:sector/frameworks` - Get frameworks for sector
  - `GET /api/sector-controls/:sector/regulators` - Get regulators for sector
- **What it does:**
  - Automatically filters controls based on organization sector
  - Returns only relevant controls for Healthcare, Financial, etc.
  - Includes regulator and framework mappings
- **Database Tables:** `grc_controls`, `sectors`, `sector_controls`, `regulators`
- **How to use:**
  ```javascript
  // Get controls for Healthcare sector
  GET /api/sector-controls?sector=Healthcare
  
  // Response includes:
  // - Controls applicable to Healthcare
  // - Relevant regulators (NCA, MOH, SDAIA)
  // - Applicable frameworks
  ```

#### **10. Assessments Routes**
**File:** `backend/routes/assessments.js`
- **Purpose:** Assessment lifecycle management
- **Endpoints:**
  - `GET /api/assessments` - List assessments
  - `GET /api/assessments/:id` - Get assessment details
  - `POST /api/assessments` - Create assessment
  - `PUT /api/assessments/:id` - Update assessment
  - `DELETE /api/assessments/:id` - Delete assessment
  - `GET /api/assessments/:id/responses` - Get assessment responses
  - `GET /api/assessments/:id/evidence` - Get assessment evidence
  - `POST /api/assessments/:id/complete` - Complete assessment
- **Query Parameters:**
  - `organization_id`, `status`, `template_id`
- **Database Tables:** `assessments`, `assessment_responses`, `assessment_evidence`, `organizations`
- **Authentication:** Required

#### **11. Assessment Templates Routes**
**File:** `backend/routes/assessment-templates.js`
- **Purpose:** Assessment template management
- **Endpoints:**
  - `GET /api/assessment-templates` - List templates
  - `GET /api/assessment-templates/:id` - Get template details
  - `POST /api/assessment-templates` - Create template
  - `PUT /api/assessment-templates/:id` - Update template
  - `DELETE /api/assessment-templates/:id` - Delete template
  - `POST /api/assessment-templates/:id/clone` - Clone template
- **Database Tables:** `assessment_templates`, `assessment_template_sections`
- **Authentication:** Required

#### **12. Assessment Responses Routes**
**File:** `backend/routes/assessment-responses.js`
- **Purpose:** Control response management
- **Endpoints:**
  - `GET /api/assessment-responses` - List responses
  - `GET /api/assessment-responses/:id` - Get response details
  - `POST /api/assessment-responses` - Create response
  - `PUT /api/assessment-responses/:id` - Update response
  - `DELETE /api/assessment-responses/:id` - Delete response
  - `POST /api/assessment-responses/bulk` - Bulk create/update
- **Database Tables:** `assessment_responses`, `assessments`, `grc_controls`
- **Authentication:** Required

#### **13. Assessment Evidence Routes**
**File:** `backend/routes/assessment-evidence.js`
- **Purpose:** Evidence file management
- **Endpoints:**
  - `GET /api/assessment-evidence` - List evidence
  - `GET /api/assessment-evidence/:id` - Get evidence details
  - `POST /api/assessment-evidence` - Upload evidence
  - `PUT /api/assessment-evidence/:id` - Update evidence
  - `DELETE /api/assessment-evidence/:id` - Delete evidence
  - `GET /api/assessment-evidence/:id/download` - Download file
- **Database Tables:** `assessment_evidence`, `assessments`
- **Authentication:** Required
- **File Upload:** Uses Multer middleware

#### **14. Documents Routes**
**File:** `backend/routes/documents.js`
- **Purpose:** Document processing and management (aa.ini implementation)
- **Endpoints:**
  - `POST /api/documents/upload` - Upload document
  - `GET /api/documents` - List documents
  - `GET /api/documents/:id` - Get document details
  - `POST /api/documents/:id/process` - Process document
  - `GET /api/documents/:id/search` - Search document content
  - `POST /api/documents/rag` - RAG query
- **Database Tables:** `documents`, `document_chunks`, `processing_jobs`, `rag_responses`
- **Features:**
  - PDF/DOCX parsing
  - Text chunking for RAG
  - Vector embeddings
  - Semantic search
- **Authentication:** Required

#### **15. Evidence Library Routes**
**File:** `backend/routes/evidence-library.js`
- **Purpose:** Centralized evidence repository
- **Endpoints:**
  - `GET /api/evidence-library` - List evidence items
  - `GET /api/evidence-library/:id` - Get evidence details
  - `POST /api/evidence-library` - Add evidence
  - `PUT /api/evidence-library/:id` - Update evidence
  - `DELETE /api/evidence-library/:id` - Delete evidence
  - `GET /api/evidence-library/search` - Search evidence
- **Database Tables:** `evidence_library`, `assessment_evidence`
- **Authentication:** Required

#### **16. Compliance Reports Routes**
**File:** `backend/routes/compliance-reports.js`
- **Purpose:** Report generation and management
- **Endpoints:**
  - `GET /api/compliance-reports` - List reports
  - `GET /api/compliance-reports/:id` - Get report details
  - `POST /api/compliance-reports/generate` - Generate report
  - `GET /api/compliance-reports/:id/download` - Download report
  - `DELETE /api/compliance-reports/:id` - Delete report
- **Database Tables:** `compliance_reports`, `report_templates`
- **Authentication:** Required
- **Permissions:** `reports.export` required for generation

#### **17. Workflow Routes**
**File:** `backend/routes/workflow.js`
- **Purpose:** Assessment workflow automation
- **Endpoints:**
  - `GET /api/assessment-workflow` - List workflows
  - `GET /api/assessment-workflow/:id` - Get workflow details
  - `POST /api/assessment-workflow` - Create workflow
  - `PUT /api/assessment-workflow/:id` - Update workflow
  - `POST /api/assessment-workflow/:id/execute` - Execute workflow
- **Database Tables:** `assessment_workflow`, `approval_workflows`, `approval_steps`
- **Authentication:** Required

#### **18. Tables Routes**
**File:** `backend/routes/tables.js`
- **Purpose:** Universal table access (for Database page)
- **Endpoints:**
  - `GET /api/tables` - List all tables
  - `GET /api/tables/:name` - Get table data
  - `GET /api/tables/:name/schema` - Get table schema
  - `GET /api/tables/:name/count` - Get row count
- **What it does:**
  - Provides dynamic access to any database table
  - Supports pagination, filtering, sorting
  - Returns table metadata and structure
- **Database Tables:** All tables (dynamic)
- **Authentication:** Required
- **Permissions:** Admin only (sensitive)

#### **19. KSA GRC Routes**
**File:** `backend/routes/ksa-grc.js`
- **Purpose:** Saudi Arabia-specific GRC endpoints
- **Endpoints:**
  - `GET /api/ksa-grc/frameworks` - KSA frameworks
  - `GET /api/ksa-grc/regulators` - KSA regulators
  - `GET /api/ksa-grc/compliance-status` - Compliance status
- **Database Tables:** `regulators`, `grc_frameworks` (filtered for KSA)

---

### **📁 SERVICES LAYER** (`backend/services/`)

#### **1. Document Processor Service**
**File:** `backend/services/documentProcessor.js`
- **Purpose:** Document processing logic (aa.ini implementation)
- **What it does:**
  - PDF parsing (pdf-parse)
  - DOCX parsing (mammoth)
  - Text extraction and cleaning
  - Chunking for RAG
  - Integration with embedding service
- **How to use:**
  ```javascript
  const { processDocument, extractText, chunkText } = require('./services/documentProcessor');
  
  const text = await extractText(filePath, fileType);
  const chunks = await chunkText(text, chunkSize);
  ```

#### **2. Microsoft Auth Service**
**File:** `backend/services/microsoftAuth.js`
- **Purpose:** Microsoft SSO authentication logic
- **What it does:**
  - Token exchange
  - User profile retrieval
  - Azure AD integration
- **How to use:** Used by `microsoft-auth.js` route

#### **3. User Service**
**File:** `backend/services/userService.js`
- **Purpose:** User management business logic
- **What it does:**
  - User creation with validation
  - Password hashing
  - Role assignment
  - Profile updates
- **How to use:** Used by `users.js` route

#### **4. Secure Storage Service**
**File:** `backend/services/secureStorage.js`
- **Purpose:** Secure file storage management
- **What it does:**
  - File encryption
  - Secure file paths
  - Access control
- **How to use:** Used for evidence and document storage

#### **5. AV Scanner Service**
**File:** `backend/services/avScanner.js`
- **Purpose:** Antivirus scanning for uploads
- **What it does:**
  - File scanning before storage
  - Virus detection
  - Quarantine handling
- **How to use:** Integrated with upload middleware

---

### **📁 DATABASE MIGRATIONS** (`backend/migrations/`)

**Purpose:** Database schema evolution and version control

#### **Migration Files:**
1. `001_add_tenants_table.sql` - Multi-tenant architecture
2. `002_update_users_table.sql` - User enhancements
3. `003_create_rbac_system.sql` - Role-based access control
4. `004_create_test_users.sql` - Test data
5. `005_add_microsoft_auth.sql` - Microsoft SSO
6. `006_add_document_processing.sql` - Document processing tables
7. `007_create_assessment_templates.sql` - Assessment templates
8. `007_update_assessment_templates.sql` - Template updates
9. `008_fix_schema_columns.sql` - Schema fixes
10. `008_fix_schema_simple.sql` - Simplified fixes
11. `009_add_is_active_to_organizations.sql` - Organization status
12. `010_create_assessments.sql` - Assessment tables
13. `011_add_failed_login_attempts_to_users.sql` - Security enhancement
14. `012_fix_schema_columns.sql` - Additional fixes

**How to use:**
```bash
# Run migration
node scripts/run-migration.js 001_add_tenants_table.sql

# Or use psql directly
psql -U postgres -d grc_template -f migrations/001_add_tenants_table.sql
```

---

### **📁 SCRIPTS** (`backend/scripts/`)

#### **1. Setup Database Script**
**File:** `backend/scripts/setup-database.js`
- **Purpose:** Initialize database schema
- **How to use:**
  ```bash
  npm run db:setup
  ```

#### **2. Run Migration Script**
**File:** `backend/scripts/run-migration.js`
- **Purpose:** Execute migration files
- **How to use:**
  ```bash
  node scripts/run-migration.js <migration-file>
  ```

#### **3. Make Super Admin Script**
**File:** `backend/scripts/make-super-admin.js`
- **Purpose:** Create super admin user
- **How to use:**
  ```bash
  node scripts/make-super-admin.js <email> <password>
  ```

---

## 📁 **LAYER 2: FRONTEND APPLICATION (React/Vite)**

### **📍 Entry Point**
**File:** `frontend/src/index.jsx`
- **Purpose:** React application entry point
- **What it does:**
  - Renders root App component
  - Sets up React Router
  - Initializes MSAL (Microsoft Auth)
- **How to use:** Automatically called by Vite

**File:** `frontend/src/App.jsx`
- **Purpose:** Main application component with routing
- **What it does:**
  - Defines all routes
  - Sets up React Query
  - Handles authentication state
  - Wraps routes with ProtectedRoute
- **Routes:**
  - `/` - Landing page
  - `/login` - Login page
  - `/app` - Main application (protected)
  - `/app/organizations` - Organizations page
  - `/app/assessments` - Assessments page
  - `/app/controls` - Controls page
  - etc.

---

### **📁 PAGES LAYER** (`frontend/src/pages/`)

#### **1. Landing Page**
**File:** `frontend/src/pages/LandingPage.jsx`
- **Purpose:** Public marketing/landing page
- **Components Used:**
  - Landing page components (Hero, Features, etc.)
- **Route:** `/`
- **Authentication:** Not required

#### **2. Login Pages**
**Files:**
- `frontend/src/pages/LoginPage.jsx` - Standard login
- `frontend/src/pages/GlassmorphismLoginPage.jsx` - Glassmorphism design login
- **Purpose:** User authentication UI
- **Routes:** `/login`, `/login-glass`
- **Features:**
  - Email/password login
  - Microsoft SSO option
  - Form validation
  - Error handling
- **API Calls:** `POST /api/auth/login`

#### **3. Dashboard Page**
**File:** `frontend/src/pages/Dashboard.js` (legacy)
**Component:** `frontend/src/components/AdvancedGRCDashboard.jsx` (used)
- **Purpose:** Main dashboard with statistics
- **Route:** `/app` (index)
- **Components Used:**
  - StatCard - KPI metrics
  - DataTable - Recent activities
  - NetworkChart - Relationships
- **API Calls:**
  - `GET /api/dashboard/stats`
  - `GET /api/regulators`
  - `GET /api/assessments`

#### **4. Organizations Page**
**File:** `frontend/src/pages/OrganizationsPage.jsx`
- **Purpose:** Organization management UI
- **Route:** `/app/organizations`
- **Components Used:**
  - DataTable - Organization listing
  - Badge - Status indicators
  - StatCard - Metrics
- **API Calls:**
  - `GET /api/organizations`
  - `POST /api/organizations`
  - `PUT /api/organizations/:id`
  - `DELETE /api/organizations/:id`
- **Features:**
  - CRUD operations
  - Search and filtering
  - Pagination
  - Sector-based filtering

#### **5. Regulators Page**
**File:** `frontend/src/pages/RegulatorsPage.jsx`
- **Purpose:** Regulatory authority management
- **Route:** `/app/regulators`
- **Components Used:**
  - DataTable - Regulator listing
  - NetworkChart - Relationships
- **API Calls:**
  - `GET /api/regulators`
  - `GET /api/regulators/:id/frameworks`

#### **6. Controls Page**
**File:** `frontend/src/pages/ControlsPage.jsx`
- **Purpose:** GRC control library browser
- **Route:** `/app/controls`
- **Components Used:**
  - DataTable - Control listing
  - Badge - Criticality/status
  - AIMindMap - Control relationships
- **API Calls:**
  - `GET /api/grc-controls`
  - `GET /api/sector-controls`
  - `GET /api/grc-controls/search`
- **Features:**
  - Advanced filtering
  - Sector-based filtering
  - Framework filtering
  - Search functionality

#### **7. Reports Page**
**File:** `frontend/src/pages/ReportsPage.jsx`
- **Purpose:** Compliance report management
- **Route:** `/app/reports`
- **Components Used:**
  - DataTable - Report listing
  - StatCard - Report metrics
- **API Calls:**
  - `GET /api/compliance-reports`
  - `POST /api/compliance-reports/generate`
  - `GET /api/compliance-reports/:id/download`

#### **8. Database Page**
**File:** `frontend/src/pages/DatabasePage.jsx`
- **Purpose:** Universal table viewer (admin tool)
- **Route:** `/app/database`
- **Components Used:**
  - DataTable - Table data display
  - StatCard - Database statistics
- **API Calls:**
  - `GET /api/tables`
  - `GET /api/tables/:name`
  - `GET /api/tables/:name/schema`
- **Features:**
  - Browse all database tables
  - View table schemas
  - Search table data
  - Export functionality
- **Permissions:** Admin only

#### **9. Settings Page**
**File:** `frontend/src/pages/SettingsPage.jsx`
- **Purpose:** User and system settings
- **Route:** `/app/settings`
- **API Calls:**
  - `GET /api/users/profile`
  - `PUT /api/users/profile`
  - `GET /api/tenants/settings`

#### **10. Components Demo Page**
**File:** `frontend/src/pages/ComponentsDemo.jsx`
- **Purpose:** Showcase all UI components
- **Route:** `/app/components-demo`
- **Components Used:**
  - All advanced components
  - StatCard, Badge, DataTable, AIMindMap, NetworkChart
- **Purpose:** Development/testing tool

#### **11. KSA GRC Page**
**File:** `frontend/src/pages/KSAGRCPage.jsx`
- **Purpose:** Saudi Arabia-specific GRC view
- **Route:** `/app/ksa-grc`
- **API Calls:**
  - `GET /api/ksa-grc/frameworks`
  - `GET /api/ksa-grc/regulators`

#### **12. Not Found Page**
**File:** `frontend/src/pages/NotFoundPage.jsx`
- **Purpose:** 404 error page
- **Route:** `*` (catch-all)

---

### **📁 COMPONENTS LAYER** (`frontend/src/components/`)

#### **📊 Advanced Components** (`frontend/src/components/advanced/`)

##### **1. StatCard Component**
**File:** `frontend/src/components/advanced/StatCard.jsx`
- **Purpose:** Display KPI metrics with trends
- **Props:**
  - `title` - Card title
  - `value` - Main value
  - `trend` - Trend direction (up/down)
  - `icon` - Heroicon component
  - `subtitle` - Additional info
- **Usage:**
  ```jsx
  <StatCard
    title="Total Organizations"
    value={150}
    trend="up"
    icon={BuildingOfficeIcon}
  />
  ```

##### **2. Badge Component**
**File:** `frontend/src/components/advanced/Badge.jsx`
- **Purpose:** Status and category indicators
- **Props:**
  - `children` - Badge text
  - `tone` - success, info, warning, danger, neutral
  - `size` - xs, sm, md, lg
- **Usage:**
  ```jsx
  <Badge tone="success" size="md">Active</Badge>
  ```

##### **3. DataTable Component**
**File:** `frontend/src/components/advanced/DataTable.jsx`
- **Purpose:** Advanced data tables with full functionality
- **Props:**
  - `data` - Array of objects
  - `columns` - Column definitions
  - `searchable` - Enable search
  - `sortable` - Enable sorting
  - `pagination` - Enable pagination
- **Features:**
  - Search with Arabic support
  - Column sorting
  - Pagination
  - Custom cell rendering
  - Empty states
  - RTL support
- **Usage:**
  ```jsx
  <DataTable
    data={organizations}
    columns={orgColumns}
    searchable
    sortable
    pagination
  />
  ```

##### **4. AIMindMap Component**
**File:** `frontend/src/components/advanced/AIMindMap.jsx`
- **Purpose:** Interactive mind mapping visualization
- **Props:**
  - `data` - Hierarchical data structure
  - `onNodeClick` - Node click handler
- **Features:**
  - SVG-based rendering
  - Interactive nodes
  - Framer Motion animations
  - Arabic labels
- **Usage:**
  ```jsx
  <AIMindMap data={frameworkHierarchy} />
  ```

##### **5. NetworkChart Component**
**File:** `frontend/src/components/advanced/NetworkChart.jsx`
- **Purpose:** Network and relationship visualization
- **Props:**
  - `nodes` - Array of node objects
  - `edges` - Array of edge objects
- **Features:**
  - Interactive node selection
  - Connection visualization
  - Node details panel
  - Circular layout
- **Usage:**
  ```jsx
  <NetworkChart nodes={regulators} edges={relationships} />
  ```

#### **🏗️ Layout Components** (`frontend/src/components/layout/`)

##### **1. AdvancedAppShell Component**
**File:** `frontend/src/components/layout/AdvancedAppShell.jsx`
- **Purpose:** Main application shell with navigation
- **Features:**
  - Dual sidebar (main + agent dock)
  - RBAC-based navigation
  - Arabic-first interface
  - Responsive design
- **Usage:** Wraps all protected routes

##### **2. AppLayout Component**
**File:** `frontend/src/components/layout/AppLayout.jsx`
- **Purpose:** Standard application layout
- **Features:**
  - Header
  - Sidebar
  - Main content area
  - Footer
- **Usage:** Alternative to AdvancedAppShell

##### **3. Header Component**
**File:** `frontend/src/components/layout/Header.jsx`
- **Purpose:** Application header
- **Features:**
  - User profile menu
  - Notifications
  - Search
  - Theme toggle
- **Usage:** Used by AppLayout

##### **4. Sidebar Component**
**File:** `frontend/src/components/layout/Sidebar.jsx`
- **Purpose:** Main navigation sidebar
- **Features:**
  - Multi-level navigation
  - Active state highlighting
  - Collapsible sections
  - RBAC filtering
- **Usage:** Used by AppLayout

#### **🔐 Auth Components** (`frontend/src/components/auth/`)

##### **ProtectedRoute Component**
**File:** `frontend/src/components/auth/ProtectedRoute.jsx`
- **Purpose:** Route-level access control
- **Props:**
  - `children` - Protected component
  - `requiredPermission` - Required permission
  - `requiredRole` - Required role
- **Features:**
  - Permission-based routing
  - Role validation
  - Redirect handling
- **Usage:**
  ```jsx
  <ProtectedRoute requiredPermission="write">
    <OrganizationsPage />
  </ProtectedRoute>
  ```

#### **🎯 Business Logic Components**

##### **1. AdvancedGRCDashboard Component**
**File:** `frontend/src/components/AdvancedGRCDashboard.jsx`
- **Purpose:** Main dashboard with real-time data
- **Features:**
  - Live statistics
  - Recent activity feed
  - Compliance score visualization
  - Quick actions
- **API Integration:** Multiple endpoints for statistics

##### **2. AdvancedAssessmentManager Component**
**File:** `frontend/src/components/AdvancedAssessmentManager.jsx`
- **Purpose:** Assessment lifecycle management
- **Features:**
  - Assessment creation wizard
  - Progress tracking
  - Control response management
  - Evidence linking
- **API Calls:**
  - `GET /api/assessments`
  - `POST /api/assessments`
  - `GET /api/assessment-responses`

##### **3. AdvancedFrameworkManager Component**
**File:** `frontend/src/components/AdvancedFrameworkManager.jsx`
- **Purpose:** Framework and control management
- **Features:**
  - Framework hierarchy display
  - Control filtering
  - Bulk operations
  - Framework mapping
- **API Calls:**
  - `GET /api/grc-frameworks`
  - `GET /api/grc-controls`

#### **🛠️ Common Components** (`frontend/src/components/common/`)

##### **1. ErrorBoundary Component**
**File:** `frontend/src/components/common/ErrorBoundary.jsx`
- **Purpose:** React error boundary wrapper
- **Usage:** Wrap components to catch errors

##### **2. ErrorFallback Component**
**File:** `frontend/src/components/common/ErrorFallback.jsx`
- **Purpose:** Error display component
- **Usage:** Used by ErrorBoundary

##### **3. LoadingSpinner Component**
**File:** `frontend/src/components/common/LoadingSpinner.jsx`
- **Purpose:** Loading state indicator
- **Usage:** Show during API calls

#### **🎨 Landing Page Components** (`frontend/src/components/landing/`)

**Purpose:** Marketing/landing page components

**Files:**
- `Hero.jsx` - Hero section
- `KeyFeatures.jsx` - Features showcase
- `Pricing.jsx` - Pricing section
- `Testimonials.jsx` - Testimonials
- `FAQ.jsx` - FAQ section
- `Contact.jsx` - Contact form
- `Footer.jsx` - Footer
- `Header.jsx` - Landing header
- And 20+ more landing components

**Usage:** Used by `LandingPage.jsx`

---

### **📁 SERVICES LAYER** (`frontend/src/services/`)

#### **1. API Service**
**File:** `frontend/src/services/api.js`
- **Purpose:** Axios-based API client
- **What it does:**
  - Configures base URL
  - Adds JWT token to requests
  - Handles 401 errors (logout)
  - Provides service methods for all endpoints
- **Exports:**
  - `apiServices.auth` - Authentication methods
  - `apiServices.users` - User methods
  - `apiServices.organizations` - Organization methods
  - `apiServices.assessments` - Assessment methods
  - `apiServices.frameworks` - Framework methods
  - `apiServices.controls` - Control methods
  - And more...
- **Usage:**
  ```javascript
  import apiServices from './services/api';
  
  const response = await apiServices.organizations.getAll({ page: 1, limit: 10 });
  ```

#### **2. MSAL Service**
**File:** `frontend/src/services/msal.js`
- **Purpose:** Microsoft Authentication Library configuration
- **What it does:**
  - Configures MSAL for Azure AD
  - Provides auth methods
- **Usage:** Used by Microsoft SSO login

#### **3. Config Service**
**File:** `frontend/src/services/config.js`
- **Purpose:** Application configuration
- **What it does:**
  - Environment variables
  - API URLs
  - Feature flags
- **Usage:** Imported where needed

#### **4. Booking Service**
**File:** `frontend/src/services/bookingService.js`
- **Purpose:** Demo booking functionality
- **Usage:** Used by landing page

#### **5. Sandbox Service**
**File:** `frontend/src/services/sandboxService.js`
- **Purpose:** Sandbox/demo environment management
- **Usage:** Development/testing

---

### **📁 HOOKS** (`frontend/src/hooks/`)

#### **1. useApiData Hook**
**File:** `frontend/src/hooks/useApiData.js`
- **Purpose:** React Query hook for API data fetching
- **Usage:**
  ```jsx
  const { data, isLoading, error } = useApiData('/api/organizations');
  ```

#### **2. useScrollSpy Hook**
**File:** `frontend/src/hooks/useScrollSpy.js`
- **Purpose:** Scroll spy for navigation highlighting
- **Usage:** Used by landing page navigation

---

### **📁 CONTEXT** (`frontend/src/context/`)

#### **AppContext**
**File:** `frontend/src/context/AppContext.jsx`
- **Purpose:** Global application state management
- **What it provides:**
  - User state
  - Tenant state
  - Theme state
  - Navigation state
- **Usage:**
  ```jsx
  const { user, tenant, theme } = useContext(AppContext);
  ```

---

## 📁 **LAYER 3: DATABASE SCHEMA** (`database-schema/`)

### **Schema Files:**

#### **1. Base Schema**
**File:** `database-schema/base_schema.sql`
- **Purpose:** Core database tables (30+ tables)
- **Tables Included:**
  - `users`, `tenants`, `organizations`
  - `regulators`, `grc_frameworks`, `grc_controls`
  - `assessments`, `assessment_responses`, `assessment_evidence`
  - `audit_logs`, `system_settings`
  - And more...
- **How to use:**
  ```bash
  psql -U postgres -d grc_template -f database-schema/base_schema.sql
  ```

#### **2. Organizations Comprehensive**
**File:** `database-schema/organizations_comprehensive.sql`
- **Purpose:** Enhanced organizations table with 50+ fields
- **What it adds:**
  - Sector intelligence fields
  - Compliance fields
  - Metadata fields
- **How to use:** Run after base_schema.sql

#### **3. Sector Intelligence Fields**
**File:** `database-schema/sector_intelligence_fields.sql`
- **Purpose:** Sector-based intelligence fields
- **What it adds:**
  - Sector mappings
  - Regulator associations
  - Framework associations
  - Control filtering logic
- **How to use:** Run after organizations_comprehensive.sql

#### **4. Additional Tables**
**File:** `database-schema/additional_tables.sql`
- **Purpose:** Additional utility tables
- **How to use:** Run as needed

#### **5. Functions and Views**
**File:** `database-schema/functions_and_views.sql`
- **Purpose:** Database functions and views
- **What it includes:**
  - Helper functions
  - Materialized views
  - Stored procedures
- **How to use:** Run after base schema

#### **6. Enterprise Tenant Schema**
**File:** `database-schema/enterprise_tenant_schema.sql`
- **Purpose:** Enterprise multi-tenant enhancements
- **How to use:** For enterprise deployments

#### **7. KSA GRC Schema**
**File:** `database-schema/ksa_grc_schema.sql`
- **Purpose:** Saudi Arabia-specific GRC data
- **What it includes:**
  - KSA regulators (NCA, SAMA, CITC, etc.)
  - KSA frameworks
  - KSA-specific controls
- **How to use:** For KSA-focused deployments

---

## 📁 **LAYER 4: UTILITY SCRIPTS** (Root level)

### **Database Analysis Scripts:**

#### **1. Database Summary**
**File:** `database-summary.js`
- **Purpose:** Generate database structure summary
- **How to use:**
  ```bash
  node database-summary.js
  ```

#### **2. Analyze Database Structure**
**File:** `analyze-database-structure.js`
- **Purpose:** Analyze database schema
- **How to use:**
  ```bash
  node analyze-database-structure.js
  ```

#### **3. Check DB Stats**
**File:** `check-db-stats.js`
- **Purpose:** Check database statistics
- **How to use:**
  ```bash
  node check-db-stats.js
  ```

### **Testing Scripts:**

#### **1. Test API Routes**
**File:** `test-api-routes.js`
- **Purpose:** Test all API endpoints
- **How to use:**
  ```bash
  node test-api-routes.js
  ```

#### **2. Test Security**
**File:** `test-security.js`
- **Purpose:** Security testing
- **How to use:**
  ```bash
  node test-security.js
  ```

#### **3. Test Database Integration**
**File:** `test-database-integration.js`
- **Purpose:** Test database integration
- **How to use:**
  ```bash
  node test-database-integration.js
  ```

#### **4. Test Assessment Templates**
**File:** `test-assessment-templates.js`
- **Purpose:** Test assessment template functionality
- **How to use:**
  ```bash
  node test-assessment-templates.js
  ```

### **Data Import Scripts:**

#### **1. Direct Database Import**
**File:** `direct-database-import.js`
- **Purpose:** Import data directly to database
- **How to use:**
  ```bash
  node direct-database-import.js
  ```

#### **2. Import Comprehensive Data**
**File:** `import-comprehensive-data.js`
- **Purpose:** Comprehensive data import
- **How to use:**
  ```bash
  node import-comprehensive-data.js
  ```

#### **3. Import to Trackers**
**File:** `import_to_trackers.py`
- **Purpose:** Import tasks to Jira/Azure DevOps
- **How to use:**
  ```bash
  python import_to_trackers.py --jira --azdo
  ```

---

## 📁 **LAYER 5: CONFIGURATION FILES**

### **Backend Configuration:**

#### **1. Package.json**
**File:** `backend/package.json`
- **Purpose:** Backend dependencies and scripts
- **Key Dependencies:**
  - `express` - Web framework
  - `pg` - PostgreSQL client
  - `jsonwebtoken` - JWT authentication
  - `bcryptjs` - Password hashing
  - `multer` - File uploads
  - `helmet` - Security headers
  - `cors` - CORS middleware
  - Azure SDKs (MSAL, Key Vault, Form Recognizer)
- **Scripts:**
  - `npm start` - Start server
  - `npm run dev` - Development mode
  - `npm test` - Run tests
  - `npm run db:setup` - Setup database

#### **2. Environment Variables**
**File:** `.env` (create from template)
- **Required Variables:**
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - `JWT_SECRET` - JWT signing secret
  - `PORT` - Server port (default: 5000)
  - `NODE_ENV` - Environment (development/production)
  - `CORS_ORIGIN` - Allowed origins
  - Azure credentials (if using Azure services)

### **Frontend Configuration:**

#### **1. Package.json**
**File:** `frontend/package.json`
- **Purpose:** Frontend dependencies and scripts
- **Key Dependencies:**
  - `react`, `react-dom` - React framework
  - `react-router-dom` - Routing
  - `@tanstack/react-query` - Data fetching
  - `axios` - HTTP client
  - `@azure/msal-react` - Microsoft auth
  - `framer-motion` - Animations
  - `tailwindcss` - Styling
- **Scripts:**
  - `npm run dev` - Development server
  - `npm run build` - Production build
  - `npm test` - Run tests

#### **2. Vite Config**
**File:** `frontend/vite.config.js`
- **Purpose:** Vite build configuration
- **What it configures:**
  - Build options
  - Proxy settings
  - Plugin configuration

#### **3. Tailwind Config**
**File:** `frontend/tailwind.config.js`
- **Purpose:** Tailwind CSS configuration
- **What it configures:**
  - Theme colors
  - Fonts
  - Custom utilities

---

## 📁 **LAYER 6: DOCKER DEPLOYMENT**

### **Docker Files:**

#### **1. Dockerfile**
**File:** `Dockerfile`
- **Purpose:** Production Docker image
- **How to use:**
  ```bash
  docker build -t grc-app .
  ```

#### **2. Docker Compose**
**Files:**
- `docker-compose.yml` - Development setup
- `docker-compose.dev.yml` - Development environment
- `docker-compose.production.yml` - Production setup
- `docker-compose.monitoring.yml` - Monitoring stack
- `docker-compose.simple.yml` - Simplified setup

**How to use:**
```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.production.yml up -d
```

---

## 🎯 **USAGE PATTERNS**

### **Backend API Usage Pattern:**
```javascript
// 1. Import route
const router = require('express').Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

// 2. Define route
router.get('/endpoint', authenticateToken, requirePermission('read'), async (req, res) => {
  try {
    const result = await query('SELECT * FROM table');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Export router
module.exports = router;
```

### **Frontend Component Usage Pattern:**
```jsx
// 1. Import dependencies
import { useApiData } from '../hooks/useApiData';
import DataTable from '../components/advanced/DataTable';
import StatCard from '../components/advanced/StatCard';

// 2. Create component
const MyPage = () => {
  const { data, isLoading } = useApiData('/api/organizations');
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <StatCard title="Total" value={data?.length} />
      <DataTable data={data} columns={columns} />
    </div>
  );
};

// 3. Export component
export default MyPage;
```

---

## 📊 **FILE COUNT SUMMARY**

### **Backend:**
- **Routes:** 19 files
- **Services:** 5 files
- **Middleware:** 5 files
- **Migrations:** 14 files
- **Scripts:** 3 files
- **Config:** 2 files
- **Total:** ~50 source files

### **Frontend:**
- **Pages:** 12 files
- **Components:** 49 files
- **Services:** 5 files
- **Hooks:** 2 files
- **Context:** 1 file
- **Total:** ~70 source files

### **Database:**
- **Schema Files:** 7 files
- **Migration Files:** 14 files
- **Total:** 21 files

### **Total Source Files:** ~140 files

---

## ✅ **QUICK REFERENCE**

### **Start Development:**
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Docker
docker-compose up -d
```

### **Create New API Endpoint:**
1. Create route file in `backend/routes/`
2. Add route handlers
3. Register in `server.js`
4. Add to API service in `frontend/src/services/api.js`

### **Create New Page:**
1. Create page file in `frontend/src/pages/`
2. Add route in `App.jsx`
3. Use components from `components/` directory
4. Use `useApiData` hook for data fetching

### **Add Database Table:**
1. Create migration file in `backend/migrations/`
2. Run migration: `node scripts/run-migration.js <file>`
3. Update API routes if needed
4. Update frontend components if needed

---

**This inventory is based on actual source code structure and will remain accurate even if documentation files are deleted.**

