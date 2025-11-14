# 🎨 Component Guide - UI Components Reference

## 📦 **AVAILABLE COMPONENTS**

---

## 🖼️ **LAYOUT COMPONENTS**

### **MasterLayout.jsx**
Main application wrapper with header, sidebar, and footer

**Usage:**
```javascript
import MasterLayout from './components/MasterLayout';

<MasterLayout>
  {/* Your page content */}
</MasterLayout>
```

**Features:**
- Auto-hide collapsible sidebar
- Enterprise header
- Professional footer
- Responsive design
- Theme support

---

### **EnterpriseHeader.jsx**
Professional header with navigation and user menu

**Props:**
- `systemHealth` (string) - 'healthy', 'warning', 'critical'

**Features:**
- Logo and branding
- Navigation links
- Search bar
- User menu
- Notifications
- Theme toggle

---

### **CollapsibleSidebar.jsx**
Multi-level navigation sidebar

**Features:**
- Auto-collapse on small screens
- Multi-section navigation
- Icon support
- Active state highlighting
- Smooth animations

**Navigation Sections:**
- Main Navigation
- Assessment Management
- Assessment Process
- Reporting & Analytics
- Team Collaboration
- Database & Data
- AI & Agents
- Admin Tools

---

### **EnterpriseFooter.jsx**
Rich footer with links and information

**Props:**
- `language` (string) - 'en' or 'ar'

**Features:**
- Multiple link sections
- Bilingual support
- Newsletter signup
- Social media links
- Copyright info

---

## 📝 **FORM COMPONENTS**

### **EnhancedOrganizationForm.jsx** ⭐
3-step organization onboarding wizard

**Props:**
- `organization` (object) - For editing existing org
- `onClose` (function) - Close callback
- `onSave` (function) - Save callback

**Features:**
- Step 1: Basic information
- Step 2: Sector selection with auto-filtering
- Step 3: Auto-configuration preview
- Real-time regulator/framework detection
- Control count calculation
- Sector dropdown (12 sectors)
- Employee count with size categorization
- Data processing checkboxes

**Usage:**
```javascript
import EnhancedOrganizationForm from './components/EnhancedOrganizationForm';

<EnhancedOrganizationForm
  organization={null}  // or existing org for edit
  onClose={() => setShowModal(false)}
  onSave={(data) => handleSave(data)}
/>
```

---

### **AssessmentWizard.jsx**
5-step assessment creation wizard

**Props:**
- `onComplete` (function) - Completion callback
- `onCancel` (function) - Cancel callback

**Features:**
- Step 1: Basic information
- Step 2: Framework & controls
- Step 3: Team assignment
- Step 4: Evidence upload
- Step 5: Review & submit
- Auto-save every 30 seconds
- Progress tracking
- Back/Next navigation
- Database integration

**Usage:**
```javascript
import AssessmentWizard from './components/AssessmentWizard';

<AssessmentWizard
  onComplete={(data) => console.log('Created:', data)}
  onCancel={() => setView('list')}
/>
```

---

### **SmartTemplateSelector.jsx**
Template browser and selector

**Props:**
- `onSelect` (function) - Template selection callback
- `onCancel` (function) - Cancel callback

**Features:**
- Loads templates from database
- Search functionality
- Filter by category
- Template popularity display
- Recommended badges
- Fallback to hardcoded if DB empty

---

## 📊 **DATA DISPLAY COMPONENTS**

### **UniversalTableViewer.jsx** ⭐
Universal table viewer that works with ANY database table

**Props:**
- `tableName` (string) - Name of database table

**Features:**
- Auto-detects schema
- Auto-generates columns
- Search across all fields
- Sort by any column
- Pagination (50 per page)
- Export to CSV
- Loading/error/empty states
- Responsive design

**Usage:**
```javascript
import UniversalTableViewer from './components/UniversalTableViewer';

// View any table!
<UniversalTableViewer tableName="grc_controls" />
<UniversalTableViewer tableName="regulators" />
<UniversalTableViewer tableName="assessments" />
```

**Works with ALL 206+ tables automatically!**

---

## 📄 **PAGE COMPONENTS**

### **OrganizationsPage.jsx**
Complete organizations management page

**Features:**
- List all organizations
- Search and filter
- Add new organization (enhanced form)
- Edit existing organization
- Delete organization
- Displays: Sector, Employees, Controls, Status
- Real-time data from database
- Error handling with retry

**Usage:**
```javascript
import OrganizationsPage from './components/OrganizationsPage';

<Route path="/organizations" element={<OrganizationsPage />} />
```

---

### **EnhancedAssessmentPage.jsx**
Feature-rich assessment management

**Features:**
- 4 workflow modes:
  - List view with bulk selection
  - Wizard for creation
  - Template selector
  - Progress dashboard
- Real database integration
- Refresh functionality
- Status badges
- Loading/empty states

---

### **RealDataDashboard.jsx**
Analytics dashboard with real data

**Features:**
- Real-time metrics
- Chart visualizations
- Recent assessments table
- Compliance scores
- Risk indicators
- Refresh capability

---

## 🎨 **STYLING**

### **CSS Variables:**

All components use CSS variables for theming:

```css
:root {
  --accent: #3B82F6;
  --bg: #FFFFFF;
  --surface: #F9FAFB;
  --fg: #111827;
  --border: #E5E7EB;
  --shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

**To customize:**
Just change the CSS variables!

---

## 🔧 **COMPONENT PATTERNS**

### **Standard Form Pattern:**
```javascript
const [formData, setFormData] = useState({});
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await apiService.organizations.create(formData);
    alert('Success!');
  } catch (error) {
    alert('Error: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

### **Data Loading Pattern:**
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const result = await apiService.organizations.getAll();
    setData(result.data || result || []);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 **BEST PRACTICES**

### **1. Always Handle Loading States:**
```javascript
{loading ? (
  <div>Loading...</div>
) : (
  <YourContent />
)}
```

### **2. Always Handle Errors:**
```javascript
{error ? (
  <div>
    {error}
    <button onClick={retry}>Retry</button>
  </div>
) : (
  <YourContent />
)}
```

### **3. Always Handle Empty States:**
```javascript
{data.length === 0 ? (
  <div>No data found</div>
) : (
  <YourList data={data} />
)}
```

### **4. Use API Service Layer:**
```javascript
// ✅ Good
await apiService.organizations.getAll();

// ❌ Bad
await fetch('http://localhost:5000/api/organizations');
```

---

## 🌐 **BILINGUAL SUPPORT**

Components support bilingual content:

```javascript
// English
title_en: "Security Policy"

// Arabic
title_ar: "سياسة الأمن"

// Display
{item.title_en} ({item.title_ar})
```

---

## 📱 **RESPONSIVE DESIGN**

All components are responsive:

```css
gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
```

Works on:
- Desktop (1920px+)
- Laptop (1024px)
- Tablet (768px)
- Mobile (375px)

---

## ✅ **COMPONENT CHECKLIST**

When using template components:

- [ ] Import component correctly
- [ ] Pass required props
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Handle empty state
- [ ] Test responsive design
- [ ] Verify data integration
- [ ] Check accessibility

---

**All components are production-ready!** 🚀

