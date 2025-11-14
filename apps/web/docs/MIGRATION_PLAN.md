# 📦 **MIGRATION PLAN: ShahinAI → Assessment-GRC**

## 🎯 **MIGRATION OVERVIEW**

**Source:** `D:\Projects\GRC-Master\ShahinAI`  
**Destination:** `D:\Projects\GRC-Master\Assessmant-GRC`  
**Structure:** Follow Assessment-GRC folder structure (ABI-compliant)

---

## 📋 **FILE MAPPING**

### **1. Backend Application → `apps/services/grc-api/`**

**Source:** `ShahinAI/backend/`  
**Destination:** `Assessmant-GRC/apps/services/grc-api/`

**Files to move:**
- `server.js` → `apps/services/grc-api/server.js`
- `package.json` → `apps/services/grc-api/package.json`
- `package-lock.json` → `apps/services/grc-api/package-lock.json`
- `config/` → `apps/services/grc-api/config/`
- `middleware/` → `apps/services/grc-api/middleware/`
- `routes/` → `apps/services/grc-api/routes/`
- `services/` → `apps/services/grc-api/services/`
- `utils/` → `apps/services/grc-api/utils/`
- `constants/` → `apps/services/grc-api/constants/`
- `src/` → `apps/services/grc-api/src/`
- `__tests__/` → `apps/services/grc-api/__tests__/`
- `__mocks__/` → `apps/services/grc-api/__mocks__/`
- `jest.config.js` → `apps/services/grc-api/jest.config.js`
- `jest.setup.js` → `apps/services/grc-api/jest.setup.js`
- `babel.config.js` → `apps/services/grc-api/babel.config.js`
- `check-tables.js` → `apps/services/grc-api/check-tables.js`
- `setup-database-simple.js` → `apps/services/grc-api/setup-database-simple.js`
- `Dockerfile.dev` → `apps/services/grc-api/Dockerfile.dev`

**Directories to move:**
- `core/` → `apps/services/grc-api/core/`
- `models/` → `apps/services/grc-api/models/`
- `jobs/` → `apps/services/grc-api/jobs/`
- `quarantine/` → `apps/services/grc-api/quarantine/`
- `secure-storage/` → `apps/services/grc-api/secure-storage/`
- `uploads/` → `apps/services/grc-api/uploads/`
- `logs/` → `apps/services/grc-api/logs/` (or exclude if in .gitignore)

---

### **2. Frontend Application → `apps/web/`**

**Source:** `ShahinAI/frontend/`  
**Destination:** `Assessmant-GRC/apps/web/`

**Files to move:**
- All files from `ShahinAI/frontend/` → `Assessmant-GRC/apps/web/`
- `package.json` → `apps/web/package.json`
- `package-lock.json` → `apps/web/package-lock.json`
- `vite.config.js` → `apps/web/vite.config.js`
- `tailwind.config.js` → `apps/web/tailwind.config.js`
- `postcss.config.js` → `apps/web/postcss.config.js`
- `index.html` → `apps/web/index.html`
- `Dockerfile.dev` → `apps/web/Dockerfile.dev`
- `src/` → `apps/web/src/`
- `public/` → `apps/web/public/`
- `master-ui-kit/` → `apps/web/master-ui-kit/` (UI Kit)

**Exclude:**
- `node_modules/` (will be regenerated)
- `build/` (build artifacts)
- `dist/` (build artifacts)

---

### **3. Database Migrations → `infra/db/migrations/`**

**Source:** `ShahinAI/backend/migrations/`  
**Destination:** `Assessmant-GRC/infra/db/migrations/`

**Files to move:**
- All `.sql` files from `ShahinAI/backend/migrations/` → `Assessmant-GRC/infra/db/migrations/`
- Keep migration numbering intact

---

### **4. Database Schemas → `infra/db/schema/`**

**Source:** `ShahinAI/database-schema/`  
**Destination:** `Assessmant-GRC/infra/db/schema/`

**Files to move:**
- All `.sql` files from `ShahinAI/database-schema/` → `Assessmant-GRC/infra/db/schema/`
- `ShahinAI/backend/database/` → `Assessmant-GRC/infra/db/schema/` (merge)

---

### **5. Docker Files → `infra/docker/`**

**Source:** `ShahinAI/` (root level Docker files)  
**Destination:** `Assessmant-GRC/infra/docker/`

**Files to move:**
- `docker-compose.yml` → `infra/docker/docker-compose.yml` (merge with existing or rename)
- `docker-compose.dev.yml` → `infra/docker/docker-compose.dev.yml`
- `docker-compose.production.yml` → `infra/docker/docker-compose.production.yml`
- `docker-compose.monitoring.yml` → `infra/docker/docker-compose.monitoring.yml`
- `docker-compose.simple.yml` → `infra/docker/docker-compose.simple.yml`
- `Dockerfile` → `infra/docker/Dockerfile`
- `Dockerfile.simple` → `infra/docker/Dockerfile.simple`
- `Dockerfile.haproxy` → `infra/docker/Dockerfile.haproxy`
- `nginx.Dockerfile` → `infra/docker/nginx.Dockerfile`
- `varnish.Dockerfile` → `infra/docker/varnish.Dockerfile`
- `nginx.conf` → `infra/docker/nginx.conf`
- `nginx-ssl.conf` → `infra/docker/nginx-ssl.conf`

**Directories:**
- `nginx-production.conf/` → `infra/docker/nginx-production.conf/`

---

### **6. Scripts → `scripts/`**

**Source:** `ShahinAI/scripts/` and root level scripts  
**Destination:** `Assessmant-GRC/scripts/` (merge with existing)

**Files to move:**
- `ShahinAI/scripts/*.sh` → `Assessmant-GRC/scripts/`
- `ShahinAI/backend/scripts/` → `Assessmant-GRC/scripts/db/` (database scripts)
- Root level scripts:
  - `analyze-database-structure.js` → `scripts/db/analyze-database-structure.js`
  - `analyze-schema.js` → `scripts/db/analyze-schema.js`
  - `check-db-stats.js` → `scripts/db/check-db-stats.js`
  - `database-summary.js` → `scripts/db/database-summary.js`
  - `direct-database-import.js` → `scripts/data/direct-database-import.js`
  - `import-comprehensive-data.js` → `scripts/data/import-comprehensive-data.js`
  - `import_to_trackers.py` → `scripts/data/import_to_trackers.py`
  - `create-owner.js` → `scripts/db/create-owner.js`
  - `list-db-assets.js` → `scripts/db/list-db-assets.js`
  - `implement-unified-flow.js` → `scripts/data/implement-unified-flow.js`
  - `start-advanced-ui.js` → `scripts/dev/start-advanced-ui.js`
  - `docker-build.sh` → `scripts/infra/docker-build.sh`
  - `docker-build.bat` → `scripts/infra/docker-build.bat`

---

### **7. Documentation → `docs/`**

**Source:** `ShahinAI/` (documentation files)  
**Destination:** `Assessmant-GRC/docs/` (organize by type)

**Files to move:**

**Runbooks:**
- `DOCKER_SETUP.md` → `docs/runbooks/Docker-Setup.md`
- `QUICK_DOCKER_START.md` → `docs/runbooks/Quick-Docker-Start.md`
- `PRODUCTION_DEPLOYMENT_GUIDE.md` → `docs/runbooks/Production-Deployment.md`

**Architecture/ADR:**
- `UNIFIED_FLOW_STRUCTURE.md` → `docs/adr/0001-unified-flow-structure.md`
- `BACKEND_ANALYSIS.md` → `docs/adr/0002-backend-architecture.md`
- `SYSTEM_COMPLETION_SUMMARY.md` → `docs/adr/0003-system-completion.md`

**Technical Documentation:**
- `COMPLETE_DATABASE_STRUCTURE.md` → `docs/technical/database-structure.md`
- `COMPLETE_DIRECTORY_STRUCTURE.md` → `docs/technical/directory-structure.md`
- `DATABASE_SCHEMA_FIXED.md` → `docs/technical/database-schema-fixes.md`
- `DATABASE_MISMATCHES_ANALYSIS.md` → `docs/technical/database-mismatches.md`
- `PAGES_COMPONENTS_SERVICES_MAPPING.md` → `docs/technical/ui-architecture.md`
- `COMPONENTS_INTEGRATION_SUMMARY.md` → `docs/technical/components-integration.md`
- `SOURCE_CODE_INVENTORY.md` → `docs/technical/source-code-inventory.md`

**Feature Documentation:**
- `FEATURES.md` → `docs/features/features.md`
- `ADVANCED_UI_README.md` → `docs/features/advanced-ui.md`
- `AA_INI_IMPLEMENTATION_STATUS.md` → `docs/features/aa-ini-implementation.md`

**Reports:**
- `COMPREHENSIVE_TEST_REPORT.md` → `docs/reports/test-report.md`
- `UI_DATABASE_INTEGRATION_TEST_REPORT.md` → `docs/reports/ui-database-integration.md`
- `PRODUCTION_REPORT.md` → `docs/reports/production-report.md`
- `PRODUCTION_SUMMARY.md` → `docs/reports/production-summary.md`
- `BACKEND_FIXES_SUMMARY.md` → `docs/reports/backend-fixes.md`
- `PROBLEMS_FIXED.md` → `docs/reports/problems-fixed.md`
- `MANDATORY_REPORTS_CHECKLIST.md` → `docs/reports/mandatory-checklist.md`

**Guides:**
- `START_HERE.md` → `docs/guides/start-here.md`
- `QUICK_START.txt` → `docs/guides/quick-start.txt`
- `README_IMPORT.md` → `docs/guides/data-import.md`
- `SECURITY.md` → `docs/guides/security.md`
- `UI_INSTRUCTIONS_ACTION_PLAN.md` → `docs/guides/ui-instructions.md`
- `UIagentinistrucions.md` → `docs/guides/ui-agent-instructions.md`

**Templates/Summaries:**
- `TEMPLATE_SUMMARY.md` → `docs/templates/template-summary.md`
- `TEMPLATE_CONTENTS.md` → `docs/templates/template-contents.md`
- `INDEX.md` → `docs/index.md`

**Other:**
- `ShahinAI/documentation/` → `Assessmant-GRC/docs/` (merge)

---

### **8. Test Files → Keep with Services**

**Source:** `ShahinAI/` (root level test files)  
**Destination:** `Assessmant-GRC/apps/services/grc-api/__tests__/` or appropriate location

**Files to move:**
- `test-api-routes.js` → `apps/services/grc-api/__tests__/integration/api-routes.test.js`
- `test-assessment-templates.js` → `apps/services/grc-api/__tests__/integration/assessment-templates.test.js`
- `test-auth.js` → `apps/services/grc-api/__tests__/integration/auth.test.js`
- `test-database-integration.js` → `apps/services/grc-api/__tests__/integration/database.test.js`
- `test-document-pipeline.js` → `apps/services/grc-api/__tests__/integration/document-pipeline.test.js`
- `test-microsoft-auth.js` → `apps/services/grc-api/__tests__/integration/microsoft-auth.test.js`
- `test-security.js` → `apps/services/grc-api/__tests__/security/security.test.js`
- `test-security-simple.js` → `apps/services/grc-api/__tests__/security/security-simple.test.js`
- `test-templates-simple.js` → `apps/services/grc-api/__tests__/unit/templates-simple.test.js`
- `test-table-to-ui-mapping.js` → `apps/services/grc-api/__tests__/integration/table-to-ui-mapping.test.js`
- `ShahinAI/tests/` → `apps/services/grc-api/__tests__/` (merge)
- `ShahinAI/test-results/` → `apps/services/grc-api/test-results/` (or exclude)

---

### **9. Data Files → Root Level**

**Source:** `ShahinAI/` (root level data files)  
**Destination:** `Assessmant-GRC/` (root level, handle duplicates)

**Files to move:**
- `filtered_data_grc_ksa_plus.xlsx` → Keep (already exists, compare and merge if different)
- `grc_execution_tasks.csv` → Keep (already exists, compare)
- `grc_execution_tasks_pro.csv` → Keep (already exists, compare)
- `grc_execution_tasks_smart.csv` → `Assessmant-GRC/grc_execution_tasks_smart.csv`
- `filtered_data_ksa_mapped_bilingual.csv` → `Assessmant-GRC/filtered_data_ksa_mapped_bilingual.csv`
- `azdo_bulk_import.csv` → `Assessmant-GRC/azdo_bulk_import.csv`
- `jira_bulk_payload.json` → `Assessmant-GRC/jira_bulk_payload.json`
- `teams_template.csv` → `Assessmant-GRC/teams_template.csv`
- `tenants_template.csv` → `Assessmant-GRC/tenants_template.csv`
- `assignee_mapping.csv` → Keep (already exists, compare)
- `coding_agent_task_import_config.json` → Keep (already exists, compare)
- `routing_rules.yaml` → `Assessmant-GRC/routing_rules.yaml`
- `tracker_import.env` → `Assessmant-GRC/tracker_import.env` (or `infra/env/`)
- `aa.ini` → `Assessmant-GRC/aa.ini` (or `apps/services/grc-api/config/aa.ini`)

**Directories:**
- `ShahinAI/data/` → `Assessmant-GRC/data/`
- `ShahinAI/data-import/` → `Assessmant-GRC/data-import/`

---

### **10. Configuration Files → Appropriate Locations**

**Source:** `ShahinAI/` (root level config files)  
**Destination:** Various locations

**Files to move:**
- `package.json` → Review and merge with root `package.json` if needed
- `package-lock.json` → Review and merge
- `.gitignore` → Merge with existing `.gitignore`
- `ShahinAI.code-workspace` → `Assessmant-GRC/Assessmant-GRC.code-workspace` (or keep as reference)
- `GRCassessm.code-workspace` → Keep as reference or remove

---

### **11. Monitoring & Performance → `infra/monitoring/`**

**Source:** `ShahinAI/monitoring/` and `ShahinAI/performance/`  
**Destination:** `Assessmant-GRC/infra/monitoring/`

**Files to move:**
- `ShahinAI/monitoring/` → `Assessmant-GRC/infra/monitoring/`
- `ShahinAI/performance/` → `Assessmant-GRC/infra/monitoring/performance/`

---

### **12. Security → `infra/security/`**

**Source:** `ShahinAI/security/`  
**Destination:** `Assessmant-GRC/infra/security/`

**Files to move:**
- `ShahinAI/security/` → `Assessmant-GRC/infra/security/`
- `ShahinAI/ssl/` → `Assessmant-GRC/infra/security/ssl/`

---

### **13. Deployment → `infra/deployment/`**

**Source:** `ShahinAI/deployment/`  
**Destination:** `Assessmant-GRC/infra/deployment/`

**Files to move:**
- `ShahinAI/deployment/` → `Assessmant-GRC/infra/deployment/`

---

### **14. Reports → `docs/reports/` or `reports/`**

**Source:** `ShahinAI/reports/`  
**Destination:** `Assessmant-GRC/reports/` (or merge into `docs/reports/`)

**Files to move:**
- `ShahinAI/reports/` → `Assessmant-GRC/reports/`

---

### **15. API Contracts → `contracts/api/`**

**Source:** Create from `ShahinAI/backend/routes/`  
**Destination:** `Assessmant-GRC/contracts/api/`

**Action:** Generate OpenAPI specs from existing routes
- Create `contracts/api/grc-api.openapi.yaml` based on routes
- Document all endpoints per ABI requirements

---

## ⚠️ **IMPORTANT NOTES**

1. **Backup First:** Create backup of both directories before migration
2. **Merge Carefully:** Some files already exist in Assessment-GRC (compare before overwriting)
3. **Update Paths:** Update all relative paths in moved files
4. **Update Docker Compose:** Update paths in docker-compose files
5. **Update Package.json:** Update scripts and paths in package.json files
6. **Git History:** Consider preserving git history if needed
7. **Node Modules:** Exclude `node_modules/` from migration (regenerate)
8. **Build Artifacts:** Exclude `build/`, `dist/` directories
9. **Environment Files:** Handle `.env` files carefully (don't commit secrets)

---

## 📝 **POST-MIGRATION TASKS**

1. Update all import paths in moved files
2. Update Docker Compose file paths
3. Update package.json scripts
4. Generate OpenAPI contracts from routes
5. Update README.md with new structure
6. Test that everything still works
7. Update CI/CD workflows if needed
8. Update documentation references

---

## 🚀 **EXECUTION ORDER**

1. Create necessary directories in Assessment-GRC
2. Move backend code
3. Move frontend code
4. Move database files
5. Move Docker files
6. Move scripts
7. Move documentation
8. Move data files
9. Move configuration files
10. Generate API contracts
11. Update all paths and references
12. Test and verify

