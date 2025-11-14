# 🗄️ Database Guide - Schema & Setup

## 📊 **DATABASE OVERVIEW**

**Database System:** PostgreSQL 13+  
**Total Tables:** 206+  
**Architecture:** Relational with foreign keys  
**Features:** Indexes, constraints, views, triggers

---

## 🏗️ **CORE TABLES**

### **1. organizations**
Main organization registry with sector intelligence

**Key Fields:**
```sql
id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
sector VARCHAR(100) ⭐ -- Triggers auto-filtering
employee_count INTEGER ⭐ -- Determines scaling
processes_personal_data BOOLEAN ⭐ -- Adds PDPL
applicable_regulators TEXT[] -- Auto-calculated
applicable_frameworks TEXT[] -- Auto-calculated
estimated_control_count INTEGER -- Auto-calculated
onboarding_status VARCHAR(50) -- Workflow tracking
```

**Total Fields:** 70+

---

### **2. regulators**
Regulatory authorities

**Key Fields:**
```sql
id UUID PRIMARY KEY
code VARCHAR(50) UNIQUE -- NCA, SAMA, MOH, etc.
name VARCHAR(255)
sector VARCHAR(100) ⭐ -- Which sector they regulate
jurisdiction VARCHAR(100)
```

**Examples:**
- NCA - National Cybersecurity Authority (sector: all)
- MOH - Ministry of Health (sector: healthcare)
- SAMA - Monetary Authority (sector: finance)

---

### **3. grc_frameworks**
Compliance frameworks

**Key Fields:**
```sql
id UUID PRIMARY KEY
framework_code VARCHAR(50) -- NCA-ECC, PDPL, etc.
name_en VARCHAR(255)
regulator_id UUID ⭐ -- Links to regulator
is_active BOOLEAN
```

---

### **4. grc_controls**
Controls/requirements

**Key Fields:**
```sql
id UUID PRIMARY KEY
control_identifier VARCHAR(50)
framework_id UUID ⭐ -- Links to framework
title_en TEXT
applicable_sectors TEXT[] ⭐ -- Sector filtering
is_mandatory BOOLEAN
criticality_level VARCHAR(20)
```

---

### **5. assessments**
Assessment records

**Key Fields:**
```sql
id UUID PRIMARY KEY
name VARCHAR(255)
organization_id UUID ⭐
framework_id UUID ⭐
status VARCHAR(50)
due_date DATE
completion_percentage INTEGER
```

---

### **6. assessment_templates**
Pre-built assessment templates

---

### **7. assessment_responses**
Responses to assessment controls

---

### **8. assessment_evidence**
Evidence files linked to assessments

---

## 🔗 **TABLE RELATIONSHIPS**

```
organizations
    ↓ has sector
regulators
    ↓ govern
grc_frameworks
    ↓ contain
grc_controls
    ↓ assessed by
assessments
    ↓ have
assessment_responses
    ↓ require
assessment_evidence
```

---

## 🚀 **SETUP INSTRUCTIONS**

### **Method 1: Fresh Install**

```bash
# 1. Create database
createdb your_app_name

# 2. Run schema files in order
psql -U postgres -d your_app_name -f base_schema.sql
psql -U postgres -d your_app_name -f organizations_comprehensive.sql
psql -U postgres -d your_app_name -f sector_intelligence_fields.sql

# 3. Verify
psql -U postgres -d your_app_name -c "\dt"
```

### **Method 2: Add to Existing DB**

```bash
# Run only sector intelligence migration
psql -U postgres -d existing_db -f sector_intelligence_fields.sql
```

---

## 📋 **MIGRATION FILES**

### **1. base_schema.sql**
Creates core tables:
- organizations
- users
- regulators
- grc_frameworks
- grc_controls
- assessments
- And 200+ more

### **2. organizations_comprehensive.sql**
Adds comprehensive organization fields:
- Legal information
- Banking details
- Management info
- Authorized signatories
- 50+ additional fields

### **3. sector_intelligence_fields.sql**
Adds sector-based intelligence:
- Sector classification
- Auto-calculated regulators
- Auto-calculated frameworks
- Control count estimation
- Assessment configuration
- 35+ smart fields

---

## 🔍 **USEFUL QUERIES**

### **Check Organizations with Sector Info:**
```sql
SELECT 
  name,
  sector,
  employee_count,
  estimated_control_count,
  applicable_regulators,
  onboarding_status
FROM organizations;
```

### **Get Healthcare Controls:**
```sql
SELECT c.*
FROM grc_controls c
JOIN grc_frameworks f ON c.framework_id = f.id
JOIN regulators r ON f.regulator_id = r.id
WHERE r.sector = 'healthcare' OR r.sector = 'all';
```

### **Organization Summary:**
```sql
SELECT * FROM organization_intelligence_summary;
```

---

## 📊 **INDEXES**

**Performance indexes created:**
- `idx_organizations_sector` - Fast sector queries
- `idx_organizations_employee_count` - Size filtering
- `idx_organizations_applicable_regulators` - GIN index for array
- `idx_organizations_applicable_frameworks` - GIN index for array
- Plus 20+ more indexes

---

## 🔐 **CONSTRAINTS**

**Data integrity constraints:**
```sql
CHECK (onboarding_status IN ('pending', 'configured', 'approved', 'active'))
CHECK (data_sensitivity_level IN ('public', 'internal', 'confidential', 'critical'))
CHECK (assessment_frequency IN ('monthly', 'quarterly', 'semi_annual', 'annual'))
```

---

## 🎯 **VIEWS**

### **organization_intelligence_summary**
Simplified view with calculated fields:
```sql
SELECT * FROM organization_intelligence_summary;
```

Shows:
- Organization details
- Sector information
- Size category (auto-calculated)
- Control counts
- Assessment configuration

---

## 💾 **BACKUP & RESTORE**

### **Backup:**
```bash
pg_dump -U postgres your_app_name > backup.sql
```

### **Restore:**
```bash
psql -U postgres your_app_name < backup.sql
```

---

## 🔧 **MAINTENANCE**

### **Check Table Sizes:**
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

### **Vacuum Database:**
```sql
VACUUM ANALYZE;
```

### **Reindex:**
```sql
REINDEX DATABASE your_app_name;
```

---

## ✅ **DATABASE IS PRODUCTION-READY!**

Includes:
- ✅ Proper indexes
- ✅ Foreign key constraints
- ✅ Check constraints
- ✅ Default values
- ✅ Timestamps
- ✅ Soft deletes (is_active flags)
- ✅ Audit trails
- ✅ Performance optimizations

**Ready for production use!** 🚀

