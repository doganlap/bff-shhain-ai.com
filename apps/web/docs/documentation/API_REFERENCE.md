# 📚 API Reference - Complete Endpoint Documentation

## 🌐 **BASE URL**

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

---

## 🏢 **ORGANIZATIONS API**

### **GET /api/organizations**
List all organizations with pagination

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 50)
- `search` (string) - Search by name
- `country` (string) - Filter by country
- `sector` (string) - Filter by sector

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "City General Hospital",
      "sector": "healthcare",
      "employee_count": 1000,
      "estimated_control_count": 364,
      "applicable_regulators": ["NCA", "MOH", "SDAIA"],
      "applicable_frameworks": ["NCA-ECC", "HIS", "PDPL"],
      "onboarding_status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15
  }
}
```

### **POST /api/organizations**
Create new organization

**Request Body:**
```json
{
  "name": "City General Hospital",
  "name_ar": "مستشفى المدينة العام",
  "sector": "healthcare",
  "employee_count": 1000,
  "processes_personal_data": true,
  "country": "Saudi Arabia",
  "city": "Riyadh",
  "primary_email": "contact@hospital.sa",
  "ciso_name": "Dr. Ahmed Al-Saud",
  "ciso_email": "ahmed@hospital.sa"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "City General Hospital",
    "applicable_regulators": ["NCA", "MOH", "SDAIA"],
    "applicable_frameworks": ["NCA-ECC", "HIS", "PDPL"],
    "estimated_control_count": 364
  }
}
```

---

## 🎯 **SECTOR CONTROLS API** ⭐

### **GET /api/sector-controls/:sectorCode**
Get all controls for specific sector (Auto-filtering!)

**Example:**
```bash
GET /api/sector-controls/healthcare
```

**Response:**
```json
{
  "success": true,
  "sector": "healthcare",
  "regulators": [
    {"code": "NCA", "name": "National Cybersecurity Authority"},
    {"code": "MOH", "name": "Ministry of Health"},
    {"code": "SDAIA", "name": "Saudi Data & AI Authority"}
  ],
  "frameworks": [
    {"framework_code": "NCA-ECC", "control_count": 114, "mandatory": true},
    {"framework_code": "HIS", "control_count": 200, "mandatory": true},
    {"framework_code": "PDPL", "control_count": 50, "mandatory": true}
  ],
  "controls": [...364 controls...],
  "statistics": {
    "total_controls": 364,
    "mandatory_controls": 300,
    "optional_controls": 64
  }
}
```

### **GET /api/sector-controls/organization/:orgId/applicable**
Get controls for specific organization

**Response:**
```json
{
  "success": true,
  "organization": {
    "id": "uuid",
    "name": "City General Hospital",
    "sector": "healthcare",
    "size_category": "enterprise",
    "employee_count": 1000
  },
  "controls": [...filtered controls...],
  "statistics": {
    "total": 364,
    "mandatory": 300,
    "recommended": 64
  }
}
```

---

## 📋 **ASSESSMENTS API**

### **GET /api/assessments**
List all assessments

**Query Parameters:**
- `page`, `limit` - Pagination
- `framework_id` - Filter by framework
- `organization_id` - Filter by organization
- `status` - Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Q1 2025 NCA ECC Assessment",
      "organization_name": "City Hospital",
      "framework_name": "NCA ECC",
      "status": "in_progress",
      "due_date": "2025-03-31"
    }
  ]
}
```

### **POST /api/assessments**
Create new assessment

**Request:**
```json
{
  "name": "Q1 2025 Assessment",
  "organization_id": "uuid",
  "framework_id": "uuid",
  "assessment_type": "compliance",
  "status": "draft",
  "due_date": "2025-03-31"
}
```

---

## 📚 **TEMPLATES API**

### **GET /api/assessment-templates**
List all assessment templates

**Query Parameters:**
- `framework_id` - Filter by framework

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "NCA ECC Annual Assessment",
      "framework_name": "NCA Essential Cybersecurity Controls",
      "section_count": 10,
      "is_default": true
    }
  ]
}
```

---

## 📝 **RESPONSES API**

### **GET /api/assessment-responses**
List assessment responses

**Query Parameters:**
- `assessment_id` - Filter by assessment
- `control_id` - Filter by control

**POST /api/assessment-responses/bulk**
Bulk create responses

**Request:**
```json
{
  "responses": [
    {
      "assessment_id": "uuid",
      "control_id": "uuid",
      "response_value": "Implemented",
      "compliance_status": "compliant",
      "notes": "Fully implemented with evidence"
    }
  ]
}
```

---

## 📎 **EVIDENCE API**

### **GET /api/assessment-evidence**
List evidence files

**Query Parameters:**
- `assessment_id` - Filter by assessment
- `control_id` - Filter by control

### **GET /api/assessment-evidence/by-assessment/:id/summary**
Get evidence summary for assessment

**Response:**
```json
{
  "success": true,
  "data": {
    "total_evidence": 45,
    "controls_with_evidence": 38,
    "images": 12,
    "pdfs": 25,
    "documents": 8,
    "total_size": 52428800
  }
}
```

---

## 🎯 **FRAMEWORKS API**

### **GET /api/grc-frameworks**
List all frameworks

### **GET /api/grc-frameworks/:id/controls**
Get all controls for a framework

---

## 🛡️ **CONTROLS API**

### **GET /api/grc-controls**
List all controls

**Query Parameters:**
- `framework_id` - Filter by framework
- `search` - Search in title/description

---

## 🏛️ **REGULATORS API**

### **GET /api/regulators**
List all regulatory authorities

### **GET /api/regulators/stats**
Get regulator statistics

---

## 📊 **RESPONSE FORMAT**

### **Success Response:**
```json
{
  "success": true,
  "data": {...},
  "pagination": {...}  // if applicable
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🔐 **ERROR CODES**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

---

## 💡 **USAGE EXAMPLES**

### **JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:5000/api/organizations');
const data = await response.json();
```

### **Using apiService:**
```javascript
import apiService from './services/apiService';

// Get all organizations
const orgs = await apiService.organizations.getAll();

// Get healthcare controls
const controls = await apiService.sectorControls.getBySector('healthcare');

// Create assessment
const assessment = await apiService.assessments.create({
  name: "Q1 Assessment",
  organization_id: "uuid",
  framework_id: "uuid"
});
```

---

**All endpoints include:**
- ✅ Error handling
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ Consistent response format
- ✅ Pagination support

**Ready to use in production!** 🚀

