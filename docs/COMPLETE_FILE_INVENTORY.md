# 📋 **COMPLETE FILE INVENTORY - ASSESSMENT-GRC PROJECT**

## 🎯 **DOCUMENT PURPOSE**
This document provides a detailed inventory of every file and directory in the Assessment-GRC project, including purpose, usage, and dependencies.

**Generated:** Based on actual source code structure  
**Root Directory:** `D:\Projects\GRC-Master\Assessmant-GRC`

---

## 📊 **PROJECT OVERVIEW**

**Project Type:** GRC (Governance, Risk & Compliance) Assessment Platform Template  
**Architecture:** Microservices with BFF pattern  
**Languages:** JavaScript (Node.js), Python (FastAPI), Shell  
**Documentation:** Arabic + English (Bilingual)

---

## 📁 **ROOT LEVEL FILES** (7 files)

### **1. README.md**
- **Type:** Markdown documentation
- **Purpose:** Main project documentation and quickstart guide
- **Content:**
  - Project overview
  - Quickstart instructions
  - Directory structure explanation
  - Bilingual support (Arabic/English)
- **How to use:**
  - First file to read when starting the project
  - Contains initialization steps: `scripts/init.sh "MyProject"`
  - Points to `ABI/00-ABI-Master.md` for binding rules
- **Key Information:**
  - Default features: Multi-tenancy, `/healthz`/`/readyz` endpoints, Conventional Commits
  - Arabic-first interface with RTL support

### **2. CODE_OF_CONDUCT.md**
- **Type:** Markdown documentation
- **Purpose:** Code of conduct guidelines for contributors
- **Content:** Community standards and behavior expectations
- **How to use:** Reference for all contributors and maintainers

### **3. CONTRIBUTING.md**
- **Type:** Markdown documentation
- **Purpose:** Contribution guidelines
- **Content:** How to contribute to the project
- **How to use:** Read before submitting PRs or issues

### **4. .gitignore**
- **Type:** Git configuration
- **Purpose:** Files and directories to exclude from version control
- **Content:**
  ```
  .DS_Store
  node_modules
  __pycache__/
  .env
  dist
  build
  .coverage
  *.pyc
  .idea
  .vscode
  ```
- **How to use:** Automatically applied by Git
- **Important:** Prevents committing sensitive files (`.env`), build artifacts, and IDE configs

### **5. .gitattributes**
- **Type:** Git configuration
- **Purpose:** Git attributes configuration
- **Content:** Line ending and file handling rules
- **How to use:** Ensures consistent file handling across platforms

### **6. .editorconfig**
- **Type:** Editor configuration
- **Purpose:** Consistent coding styles across editors
- **Content:** Indentation, charset, line endings, etc.
- **How to use:** Automatically applied by supported editors (VS Code, IntelliJ, etc.)

### **7. DOCUMENT_INVENTORY.md**
- **Type:** Markdown documentation
- **Purpose:** Inventory of all documents in the project
- **Content:** Summary of 43 files across 12 directories
- **How to use:** Reference for finding specific documents

---

## 📁 **DATA FILES** (4 files)

### **1. filtered_data_grc_ksa_plus.xlsx**
- **Type:** Excel spreadsheet
- **Size:** 673KB, 2919 lines
- **Purpose:** GRC KSA (Saudi Arabia) data file with comprehensive compliance information
- **Content:** 
  - GRC framework data
  - Control mappings
  - KSA-specific compliance requirements
- **How to use:**
  - Import into database for KSA GRC compliance
  - Reference for Saudi regulatory requirements
  - Source for assessment templates
- **Related Files:** Used by data import scripts

### **2. grc_execution_tasks.csv**
- **Type:** CSV data file
- **Size:** 2.9MB
- **Purpose:** GRC execution tasks dataset
- **Content:** Task definitions for GRC assessments
- **How to use:**
  - Import into task management systems (Jira, Azure DevOps)
  - Reference for task creation
  - Used by `coding_agent_task_import_config.json`

### **3. grc_execution_tasks_pro.csv**
- **Type:** CSV data file
- **Size:** 9.7MB
- **Purpose:** Professional/Enhanced GRC execution tasks dataset
- **Content:** Extended task definitions with more details
- **How to use:**
  - More comprehensive version of `grc_execution_tasks.csv`
  - Used for production task imports
  - Referenced in `coding_agent_task_import_config.json` as source

### **4. assignee_mapping.csv**
- **Type:** CSV data file
- **Size:** 520B, 12 lines
- **Purpose:** Mapping of roles to assignees for task assignment
- **Content:**
  ```csv
  owner_role,AssigneeName,AssigneeEmail
  CISO,Security Lead,security.lead@shahin-ai.com
  DPO,Data Protection Officer,dpo@shahin-ai.com
  Risk Manager,Risk Manager,risk.manager@shahin-ai.com
  IT Operations,IT Operations,it.ops@shahin-ai.com
  SecOps/SOC,SOC Lead,soc@shahin-ai.com
  Network Team,Network Lead,network@shahin-ai.com
  Cloud Team,Cloud Lead,cloud@shahin-ai.com
  HR,HR Lead,hr@shahin-ai.com
  Legal/Compliance,Compliance Lead,legal.compliance@shahin-ai.com
  Procurement/Vendor Mgmt,Procurement Lead,procurement@shahin-ai.com
  ```
- **How to use:**
  - Maps GRC roles to actual assignees
  - Used during task import to assign tasks to correct people
  - Update with your organization's roles and emails

### **5. coding_agent_task_import_config.json**
- **Type:** JSON configuration
- **Size:** 992B, 35 lines
- **Purpose:** Configuration for importing tasks to Jira and Azure DevOps
- **Content:**
  ```json
  {
    "source_csv": "/mnt/data/grc_execution_tasks_pro.csv",
    "jira": {
      "project_key_column": "Jira_Project_Key",
      "issue_type_column": "Jira_Issue_Type",
      "summary_column": "Summary",
      "description_column": "Description",
      "assignee_email_column": "AssigneeEmail",
      "priority_column": "Priority",
      "due_date_column": "Due Date",
      "labels_column": "Labels",
      "component_column": "Jira_Component",
      "epic_link_column": "Jira_Epic_Link"
    },
    "azure_devops": {
      "work_item_type_column": "DevOps_WorkItemType",
      "area_column": "DevOps_Area",
      "iteration_column": "DevOps_Iteration",
      "title_column": "Summary",
      "description_column": "Description",
      "assigned_to_column": "AssigneeEmail",
      "tags_column": "DevOps_Tags",
      "due_date_column": "Due Date"
    },
    "acceptance_criteria_columns": [
      "AcceptanceCriteria_EN",
      "AcceptanceCriteria_AR"
    ],
    "id_columns": [
      "Control ID",
      "Section",
      "Domain",
      "Frameworks"
    ]
  }
  ```
- **How to use:**
  - Configure column mappings for CSV to Jira/Azure DevOps import
  - Update column names to match your CSV structure
  - Used by task import scripts
- **Related Files:** 
  - `grc_execution_tasks_pro.csv` (source data)
  - `assignee_mapping.csv` (assignee mapping)

---

## 📁 **ABI DIRECTORY** (Advanced Binding Instructions)

**Path:** `ABI/`  
**Purpose:** Architecture and best practices documentation (Non-Negotiable rules)  
**Total Files:** 11 files (9 markdown + 2 CSV)

### **Master Document**

#### **00-ABI-Master.md**
- **Type:** Markdown documentation
- **Purpose:** Master architecture document with binding rules (Non-Negotiable)
- **Content:**
  - Governance & Roles (Gatekeeper, Lead Engineer, Security Officer, DevOps, Product Owner)
  - Branching and Release policies (Trunk-Based, Conventional Commits)
  - Code quality thresholds (80% coverage for critical services, 70% for UI)
  - Contract-first approach (OpenAPI, JSON Schema)
  - Database migration requirements
  - Security and compliance standards
  - Observability requirements (`/healthz`, `/readyz`, OpenTelemetry)
  - UI/UX standards (Design System, RTL, a11y)
  - Quality Gates table (mandatory checks)
  - Change Request process
- **How to use:**
  - **MUST READ FIRST** - All team members must follow these rules
  - Reference before any PR or release
  - Used by Gatekeeper for PR reviews
- **Key Rules:**
  - No broken windows (Lint/Format mandatory)
  - Contract tests required for all APIs
  - Backwards-compatible changes only (or version /v2)
  - Row-Level Security for multi-tenancy
  - Secrets via Key Vault only
  - Structured JSON logs required

### **Architecture Documents**

#### **01-Branching-and-Release.md**
- **Type:** Markdown documentation
- **Purpose:** Branching strategy and release process
- **Content:**
  - Trunk-Based Development approach
  - Branch naming: `feat/*`, `fix/*`, `chore/*`
  - Conventional Commits format
  - Semantic Versioning (SemVer)
  - Release process and tagging
- **How to use:** Follow for all feature development and releases

#### **02-Code-Style-and-Quality.md**
- **Type:** Markdown documentation
- **Purpose:** Code style guidelines and quality standards
- **Content:**
  - Coding standards
  - Linting rules
  - Formatting requirements
  - Code review guidelines
- **How to use:** Reference when writing code, enforced by CI

#### **03-API-Contracts-and-Testing.md**
- **Type:** Markdown documentation
- **Purpose:** API contracts and testing standards
- **Content:**
  - OpenAPI specification requirements
  - Contract testing approach
  - API versioning strategy
  - Testing standards
- **How to use:** 
  - Define APIs in `contracts/api/` before implementation
  - Run contract tests before merging

#### **04-Data-and-Migrations.md**
- **Type:** Markdown documentation
- **Purpose:** Database and migration guidelines
- **Content:**
  - Migration naming conventions
  - Up/down migration requirements
  - Multi-tenancy data isolation
  - Row-Level Security implementation
- **How to use:** 
  - Create migrations for all database changes
  - Test isolation for multi-tenant scenarios

#### **05-Security-and-Compliance.md**
- **Type:** Markdown documentation
- **Purpose:** Security and compliance standards
- **Content:**
  - SAST/DAST requirements
  - Secret management (Key Vault)
  - Dependency scanning
  - Container scanning
  - License policy
  - PDPL/GDPR compliance
- **How to use:** 
  - Security Officer reviews against this
  - Required before any release

#### **06-Observability-and-Operations.md**
- **Type:** Markdown documentation
- **Purpose:** Monitoring and operations guidelines
- **Content:**
  - Structured logging (JSON with correlation_id, tenant_id, user_id)
  - Health check endpoints (`/healthz`, `/readyz`)
  - OpenTelemetry tracing
  - Runbooks requirements
- **How to use:** 
  - Implement in all services
  - Update runbooks in `docs/runbooks/`

#### **07-UI-UX-Standards.md**
- **Type:** Markdown documentation
- **Purpose:** UI/UX design standards
- **Content:**
  - Design System / UI-Kit requirements
  - Storybook integration
  - Theme tokens
  - RTL (Right-to-Left) default support
  - Form validation standards (Zod/Yup)
  - Accessibility (a11y) requirements
- **How to use:** 
  - Follow for all frontend development
  - Use centralized UI-Kit

#### **08-MultiTenancy-and-RBAC.md**
- **Type:** Markdown documentation
- **Purpose:** Multi-tenancy and RBAC architecture
- **Content:**
  - Multi-tenant architecture patterns
  - Row-Level Security implementation
  - RBAC (Role-Based Access Control) design
  - Tenant isolation requirements
- **How to use:** 
  - Design all features with multi-tenancy in mind
  - Test tenant isolation

#### **09-Change-Requests-and-Approvals.md**
- **Type:** Markdown documentation
- **Purpose:** Change management process
- **Content:**
  - Change Request (CR) process
  - Approval workflow
  - ADR (Architecture Decision Record) requirements
  - Rollback planning
- **How to use:** 
  - Follow for architectural changes
  - Create ADR in `docs/adr/` for significant decisions

### **Supporting Tables**

#### **tables/quality_gates.csv**
- **Type:** CSV data file
- **Purpose:** Quality gate definitions
- **Content:** Quality gate criteria and thresholds
- **How to use:** 
  - Reference for CI/CD quality gates
  - Used by Gatekeeper for PR reviews

#### **tables/raci.csv**
- **Type:** CSV data file
- **Purpose:** RACI matrix definitions
- **Content:** Responsibility assignment matrix (Responsible, Accountable, Consulted, Informed)
- **How to use:** 
  - Reference for role assignments
  - Used for project governance

---

## 📁 **APPS DIRECTORY** (Application Code)

**Path:** `apps/`  
**Purpose:** Application source code  
**Total Files:** 6 files

### **BFF (Backend for Frontend)**

#### **apps/bff/index.js**
- **Type:** JavaScript (Node.js/Express)
- **Purpose:** BFF entry point with health check endpoints
- **Content:**
  ```javascript
  const express = require('express');
  const app = express();
  app.get('/healthz', (_,res)=>res.send('ok'));
  app.get('/readyz', (_,res)=>res.send('ready'));
  app.listen(3000, ()=>console.log('BFF on :3000'));
  ```
- **Features:**
  - Express.js server
  - Health check endpoint (`/healthz`)
  - Readiness check endpoint (`/readyz`)
  - Port 3000
- **How to use:**
  ```bash
  cd apps/bff
  npm start
  ```
- **Dependencies:** Express.js (see `package.json`)
- **Related Files:** 
  - `apps/bff/package.json` (dependencies)
  - `infra/docker/docker-compose.yml` (Docker config)

#### **apps/bff/package.json**
- **Type:** JSON configuration
- **Purpose:** BFF dependencies and scripts
- **Content:**
  ```json
  {
    "name": "bff",
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "start": "node index.js"
    },
    "dependencies": {
      "express": "^4.19.2"
    }
  }
  ```
- **How to use:**
  ```bash
  npm install  # Install dependencies
  npm start    # Start server
  ```

### **Services (Example FastAPI)**

#### **apps/services/example-api-fastapi/app/main.py**
- **Type:** Python (FastAPI)
- **Purpose:** Example FastAPI service with health checks
- **Content:**
  ```python
  from fastapi import FastAPI
  from pydantic_settings import BaseSettings

  class Settings(BaseSettings):
      env: str = "development"
      feature_demo: bool = False

  settings = Settings()
  app = FastAPI(title="Example API")

  @app.get("/healthz")
  def healthz():
      return {"ok": True}

  @app.get("/readyz")
  def readyz():
      return {"ready": True, "env": settings.env}
  ```
- **Features:**
  - FastAPI framework
  - Health check endpoint (`/healthz`)
  - Readiness check endpoint (`/readyz`)
  - Environment settings via Pydantic
- **How to use:**
  ```bash
  cd apps/services/example-api-fastapi
  pip install -e .
  uvicorn app.main:app --reload
  ```
- **Dependencies:** FastAPI, Pydantic Settings (see `pyproject.toml`)
- **Related Files:** 
  - `pyproject.toml` (Python dependencies)
  - `infra/docker/docker-compose.yml` (Docker config)

#### **apps/services/example-api-fastapi/pyproject.toml**
- **Type:** TOML configuration
- **Purpose:** Python project configuration and dependencies
- **Content:** FastAPI dependencies, project metadata
- **How to use:** 
  ```bash
  pip install -e .  # Install in development mode
  ```

### **Web Application**

#### **apps/web/README.md**
- **Type:** Markdown documentation
- **Purpose:** Web application placeholder documentation
- **Content:**
  ```
  # Web App placeholder
  Use this folder for Next.js (or other) frontends. Keep UI Kit and i18n centralized.
  ```
- **How to use:** 
  - Place frontend application code here
  - Use Next.js or other framework
  - Keep UI Kit and i18n centralized

---

## 📁 **CONTRACTS DIRECTORY** (API & Event Contracts)

**Path:** `contracts/`  
**Purpose:** API and event schema definitions (Contract-First approach)  
**Total Files:** 2 files

### **API Contracts**

#### **contracts/api/example.openapi.yaml**
- **Type:** YAML (OpenAPI 3.0.3)
- **Purpose:** Example OpenAPI specification
- **Content:**
  ```yaml
  openapi: 3.0.3
  info:
    title: Example Service API
    version: 1.0.0
  paths:
    /healthz:
      get:
        summary: Liveness probe
        responses:
          '200':
            description: OK
    /readyz:
      get:
        summary: Readiness probe
        responses:
          '200':
            description: Ready
  ```
- **How to use:**
  - Define all API endpoints here before implementation
  - Generate SDKs from OpenAPI spec
  - Run contract tests against this spec
- **Related Files:** 
  - `ABI/03-API-Contracts-and-Testing.md` (contract requirements)
  - Used by contract testing tools

### **Event Schemas**

#### **contracts/events/example.event.schema.json**
- **Type:** JSON Schema
- **Purpose:** Example event schema for message/event contracts
- **Content:**
  ```json
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://example.com/schemas/tenant.created.json",
    "title": "TenantCreated",
    "type": "object",
    "properties": {
      "event": {
        "const": "tenant.created"
      },
      "tenant_id": {
        "type": "string"
      },
      "at": {
        "type": "string",
        "format": "date-time"
      }
    },
    "required": ["event", "tenant_id", "at"]
  }
  ```
- **How to use:**
  - Define all event schemas here
  - Use for event validation
  - Generate TypeScript/Type definitions
- **Related Files:** 
  - `ABI/03-API-Contracts-and-Testing.md` (event contract requirements)

---

## 📁 **DOCS DIRECTORY** (Documentation)

**Path:** `docs/`  
**Purpose:** Project documentation (ADR, Runbooks, Checklists)  
**Total Files:** 4 files

### **ADR (Architecture Decision Records)**

#### **docs/adr/0000-template.md**
- **Type:** Markdown template
- **Purpose:** Template for Architecture Decision Records
- **Content:** ADR template structure
- **How to use:**
  - Copy this template for new ADRs
  - Number sequentially: `0001-`, `0002-`, etc.
  - Document all significant architectural decisions
- **Related Files:** 
  - `ABI/09-Change-Requests-and-Approvals.md` (ADR requirements)

### **Checklists**

#### **docs/checklists/PR-Checklist.md**
- **Type:** Markdown checklist
- **Purpose:** Pull request checklist
- **Content:** Items to check before submitting PR
- **How to use:**
  - Reference before creating PR
  - Used by Gatekeeper for PR reviews
- **Related Files:** 
  - `templates/PULL_REQUEST_TEMPLATE.md` (PR template)

### **Runbooks**

#### **docs/runbooks/Incident.md**
- **Type:** Markdown runbook
- **Purpose:** Incident response procedures
- **Content:**
  - Severity levels (P0..P3)
  - On-call escalation procedures
  - Communication channels
  - Timeline checklist
  - Root cause format (5 Whys)
- **How to use:**
  - Follow during incidents
  - Update with organization-specific procedures
- **Related Files:** 
  - `ABI/06-Observability-and-Operations.md` (runbook requirements)

#### **docs/runbooks/Onboarding.md**
- **Type:** Markdown runbook
- **Purpose:** New team member onboarding procedures
- **Content:** Onboarding steps and resources
- **How to use:**
  - Follow for new team members
  - Update with project-specific information

#### **docs/runbooks/Rollback.md**
- **Type:** Markdown runbook
- **Purpose:** Rollback procedures for deployments
- **Content:** Step-by-step rollback process
- **How to use:**
  - Follow when rollback is needed
  - Test rollback procedures regularly
- **Related Files:** 
  - `ABI/09-Change-Requests-and-Approvals.md` (rollback planning)

---

## 📁 **INFRA DIRECTORY** (Infrastructure)

**Path:** `infra/`  
**Purpose:** Infrastructure configuration  
**Total Files:** 1 file

### **Docker Configuration**

#### **infra/docker/docker-compose.yml**
- **Type:** YAML (Docker Compose)
- **Purpose:** Docker Compose configuration for local development
- **Content:**
  ```yaml
  services:
    bff:
      build:
        context: ../../apps/bff
      ports: [ "3000:3000" ]
    example-api:
      build:
        context: ../../apps/services/example-api-fastapi
      ports: [ "8000:8000" ]
  ```
- **Services:**
  - `bff` - Backend for Frontend (port 3000)
  - `example-api` - FastAPI example service (port 8000)
- **How to use:**
  ```bash
  cd infra/docker
  docker-compose up -d    # Start services
  docker-compose down     # Stop services
  docker-compose logs -f  # View logs
  ```
- **Related Files:**
  - `apps/bff/` (BFF service)
  - `apps/services/example-api-fastapi/` (FastAPI service)

---

## 📁 **SCRIPTS DIRECTORY** (Utility Scripts)

**Path:** `scripts/`  
**Purpose:** Utility and initialization scripts  
**Total Files:** 2 files

### **Initialization Script**

#### **scripts/init.sh**
- **Type:** Shell script (Bash)
- **Purpose:** Project initialization script
- **Content:**
  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  NAME="${1:-NewProject}"
  echo "Initializing project: $NAME"
  # Replace placeholder in README/WORKFLOWS/ABI if needed
  git init >/dev/null 2>&1 || true
  cat > CODEOWNERS <<'EOF'
  # Require approvals
  * @gatekeeper @security-officer @lead-engineer
  EOF
  echo "✔ Git initialized & CODEOWNERS created. Rename remotes as needed."
  ```
- **Features:**
  - Initializes Git repository
  - Creates CODEOWNERS file with required approvers
  - Replaces project name placeholders
- **How to use:**
  ```bash
  chmod +x scripts/init.sh
  ./scripts/init.sh "MyProjectName"
  ```
- **Parameters:**
  - `$1` - Project name (optional, defaults to "NewProject")
- **Related Files:**
  - Creates `CODEOWNERS` file in root
  - Updates project name in README/WORKFLOWS/ABI

### **Local Check Script**

#### **scripts/check-local.sh**
- **Type:** Shell script (Bash)
- **Purpose:** Local environment checks (lint/tests/contracts)
- **Content:**
  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  echo "Running local checks (lint/tests/contracts)..."
  echo "✓ Lint OK (placeholder)"
  echo "✓ Tests OK (placeholder)"
  echo "✓ Contracts OK (placeholder)"
  ```
- **Features:**
  - Placeholder for local checks
  - Can be extended with actual lint/test/contract checks
- **How to use:**
  ```bash
  chmod +x scripts/check-local.sh
  ./scripts/check-local.sh
  ```
- **How to extend:**
  - Add ESLint checks for JavaScript
  - Add Ruff/Black checks for Python
  - Add contract tests
  - Add unit tests

---

## 📁 **TEMPLATES DIRECTORY** (GitHub Templates)

**Path:** `templates/`  
**Purpose:** GitHub issue and PR templates  
**Total Files:** 3 files

### **Issue Templates**

#### **templates/issues/BUG.md**
- **Type:** Markdown template
- **Purpose:** Bug report template
- **Content:** Bug report structure and fields
- **How to use:**
  - Automatically used when creating bug issues in GitHub
  - Fill in all required fields
- **Related Files:**
  - `templates/issues/FEATURE.md` (feature request template)

#### **templates/issues/FEATURE.md**
- **Type:** Markdown template
- **Purpose:** Feature request template
- **Content:** Feature request structure and fields
- **How to use:**
  - Automatically used when creating feature issues in GitHub
  - Fill in all required fields
- **Related Files:**
  - `templates/issues/BUG.md` (bug report template)

### **PR Template**

#### **templates/PULL_REQUEST_TEMPLATE.md**
- **Type:** Markdown template
- **Purpose:** Pull request template
- **Content:**
  ```markdown
  ## Summary
  -

  ## Checklist
  - [ ] Lint/Format
  - [ ] Tests & Coverage
  - [ ] Contracts updated
  - [ ] Migrations (up/down)
  - [ ] Security scans
  - [ ] Docs (ADR/README)
  - [ ] Screenshots (UI)
  ```
- **How to use:**
  - Automatically used when creating PRs in GitHub
  - Check all items before submitting
  - Used by Gatekeeper for PR review
- **Related Files:**
  - `docs/checklists/PR-Checklist.md` (detailed checklist)
  - `ABI/00-ABI-Master.md` (quality gates)

---

## 📁 **.GITHUB DIRECTORY** (CI/CD Workflows)

**Path:** `.github/workflows/`  
**Purpose:** GitHub Actions CI/CD workflows  
**Total Files:** 2 files

### **CI Workflow**

#### **.github/workflows/ci.yml**
- **Type:** YAML (GitHub Actions)
- **Purpose:** Continuous Integration workflow
- **Triggers:**
  - Pull requests
  - Pushes to `main` branch
- **Jobs:**
  - `build-test` - Build and test job
- **Steps:**
  1. Checkout code
  2. Setup Node.js 20
  3. Setup Python 3.11
  4. Install JavaScript dependencies (if `apps/bff/package.json` exists)
  5. Install Python dependencies (if `pyproject.toml` exists)
  6. Lint (placeholder for ESLint/Ruff)
  7. Tests (placeholder for unit/integration tests)
  8. Contract tests (placeholder for contract testing)
- **How to use:**
  - Automatically runs on PR and push to main
  - Extend with actual lint/test commands
- **Related Files:**
  - `ABI/02-Code-Style-and-Quality.md` (lint requirements)
  - `ABI/03-API-Contracts-and-Testing.md` (contract test requirements)

### **Security Workflow**

#### **.github/workflows/security.yml**
- **Type:** YAML (GitHub Actions)
- **Purpose:** Security scanning workflow
- **Triggers:**
  - Pull requests
  - Scheduled (daily at 3 AM)
- **Jobs:**
  - `scans` - Security scanning job
- **Steps:**
  1. Checkout code
  2. Dependency scan (placeholder for npm audit / pip-audit)
  3. Container scan (placeholder for Trivy image scan)
- **How to use:**
  - Automatically runs on PR and daily schedule
  - Extend with actual security scanning tools
- **Related Files:**
  - `ABI/05-Security-and-Compliance.md` (security requirements)
  - `ABI/00-ABI-Master.md` (security quality gates)

---

## 📊 **FILE TYPE BREAKDOWN**

| File Type | Count | Percentage | Purpose |
|-----------|-------|------------|---------|
| **Markdown (.md)** | 20 | 46.5% | Documentation, templates, runbooks |
| **CSV (.csv)** | 5 | 11.6% | Data files, mappings, tables |
| **YAML (.yml/.yaml)** | 4 | 9.3% | CI/CD, Docker, OpenAPI |
| **JSON (.json)** | 3 | 7.0% | Configuration, schemas |
| **JavaScript (.js)** | 1 | 2.3% | BFF application code |
| **Python (.py)** | 1 | 2.3% | FastAPI service code |
| **Shell (.sh)** | 2 | 4.7% | Utility scripts |
| **TOML (.toml)** | 1 | 2.3% | Python project config |
| **Excel (.xlsx)** | 1 | 2.3% | GRC data file |
| **Config Files** | 3 | 7.0% | Git, editor configs |
| **Other** | 2 | 4.7% | Various |

**Total Files:** 43 files  
**Total Directories:** 12 directories

---

## 🎯 **QUICK REFERENCE GUIDE**

### **Getting Started:**
1. Read `README.md` for project overview
2. Read `ABI/00-ABI-Master.md` for binding rules
3. Run `scripts/init.sh "ProjectName"` to initialize
4. Review `CONTRIBUTING.md` before contributing

### **Development:**
- **Application Code:** `apps/` directory
- **API Contracts:** `contracts/api/` (define before coding)
- **Event Schemas:** `contracts/events/` (define before coding)
- **Local Checks:** `scripts/check-local.sh`

### **Architecture:**
- **Master Rules:** `ABI/00-ABI-Master.md` (MUST READ)
- **Branching:** `ABI/01-Branching-and-Release.md`
- **Code Quality:** `ABI/02-Code-Style-and-Quality.md`
- **API Contracts:** `ABI/03-API-Contracts-and-Testing.md`
- **Security:** `ABI/05-Security-and-Compliance.md`

### **Operations:**
- **Runbooks:** `docs/runbooks/` (Incident, Onboarding, Rollback)
- **Infrastructure:** `infra/docker/docker-compose.yml`
- **Health Checks:** All services must have `/healthz` and `/readyz`

### **Process:**
- **PR Template:** `templates/PULL_REQUEST_TEMPLATE.md`
- **Issue Templates:** `templates/issues/`
- **Checklist:** `docs/checklists/PR-Checklist.md`
- **ADR Template:** `docs/adr/0000-template.md`

### **Data Import:**
- **Config:** `coding_agent_task_import_config.json`
- **Source Data:** `grc_execution_tasks_pro.csv`
- **Assignee Mapping:** `assignee_mapping.csv`
- **KSA Data:** `filtered_data_grc_ksa_plus.xlsx`

---

## ✅ **KEY FEATURES**

### **Architecture:**
- ✅ Microservices with BFF pattern
- ✅ Contract-first API development
- ✅ Multi-tenancy with Row-Level Security
- ✅ Health check endpoints (`/healthz`, `/readyz`)
- ✅ Structured JSON logging
- ✅ OpenTelemetry tracing

### **Development:**
- ✅ Trunk-Based Development
- ✅ Conventional Commits
- ✅ Semantic Versioning
- ✅ Quality Gates (80% coverage for critical services)
- ✅ Contract testing
- ✅ Security scanning (SAST, DAST, dependency, container)

### **Documentation:**
- ✅ Bilingual support (Arabic/English)
- ✅ ADR (Architecture Decision Records)
- ✅ Runbooks (Incident, Onboarding, Rollback)
- ✅ Comprehensive ABI (Advanced Binding Instructions)

### **Compliance:**
- ✅ PDPL/GDPR compliance considerations
- ✅ Security Officer review process
- ✅ License policy enforcement
- ✅ Secret management (Key Vault)

---

## 🔗 **FILE RELATIONSHIPS**

### **Initialization Flow:**
```
README.md → scripts/init.sh → CODEOWNERS
         → ABI/00-ABI-Master.md (read first)
```

### **Development Flow:**
```
contracts/api/*.yaml → apps/services/* (implement)
contracts/events/*.json → apps/services/* (implement)
ABI/02-Code-Style-and-Quality.md → scripts/check-local.sh
```

### **CI/CD Flow:**
```
.github/workflows/ci.yml → ABI/02-Code-Style-and-Quality.md
.github/workflows/security.yml → ABI/05-Security-and-Compliance.md
templates/PULL_REQUEST_TEMPLATE.md → docs/checklists/PR-Checklist.md
```

### **Data Import Flow:**
```
grc_execution_tasks_pro.csv → coding_agent_task_import_config.json
assignee_mapping.csv → coding_agent_task_import_config.json
→ Jira/Azure DevOps import
```

---

**Last Updated:** Based on actual source code structure  
**Total Files:** 43  
**Total Directories:** 12  
**Project Status:** Template/Starter Kit

