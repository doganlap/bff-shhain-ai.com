# 🏖️ POC SANDBOX IMPLEMENTATION
## Complete Isolated Demo Environment with CLI Bridge Integration

---

## 🎯 **POC SANDBOX OVERVIEW**

### **🔒 Completely Isolated Environment:**
- **Separate Domain:** `poc.shahin-grc.com`
- **Isolated Database:** POC-specific schema with demo data
- **Demo Authentication:** Special login path `/poc/demo-login`
- **Limited Features:** Core GRC functionality only
- **Auto-Reset:** Daily data refresh for consistent demos
- **CLI Bridge Ready:** Secure transfer to production when approved

### **🌉 CLI Bridge Integration:**
- **Admin Approval Required** - All data transfers need explicit authorization
- **Double Prevention System** - Multiple validation layers before production
- **Audit Trail** - Complete transfer logging and monitoring
- **Rollback Capability** - Undo transfers if issues occur
- **Security Scanning** - Automated security validation

---

## 🏗️ **POC ARCHITECTURE**

### **Frontend POC Application:**
```
poc-frontend/
├── public/
│   ├── index.html
│   ├── demo-data/           # Pre-loaded demo datasets
│   └── assets/
├── src/
│   ├── components/
│   │   ├── DemoLogin/       # Special POC login component
│   │   ├── Dashboard/       # Simplified dashboard
│   │   ├── LicenseViewer/   # License management demo
│   │   ├── TenantManager/   # Tenant operations demo
│   │   ├── GuidedTour/      # Interactive feature tour
│   │   └── POCWatermark/    # "Demo" branding overlay
│   ├── pages/
│   │   ├── DemoLoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LicensesPage.jsx
│   │   ├── TenantsPage.jsx
│   │   └── ReportsPage.jsx
│   ├── services/
│   │   ├── pocApi.js        # POC-specific API calls
│   │   ├── demoAuth.js      # Demo authentication
│   │   └── bridgeApi.js     # CLI bridge integration
│   ├── stores/
│   │   ├── demoStore.js     # Demo state management
│   │   └── tourStore.js     # Guided tour state
│   └── utils/
│       ├── pocConfig.js     # POC configuration
│       └── demoData.js      # Sample data generators
└── package.json
```

### **Backend POC Services:**
```
poc-backend/
├── gateway/                 # API Gateway for POC
├── services/
│   ├── auth-poc/           # Demo authentication service
│   ├── license-poc/        # License management (limited)
│   ├── tenant-poc/         # Tenant management (demo)
│   ├── analytics-poc/      # Usage analytics (sample data)
│   └── bridge-api/         # CLI bridge integration
├── database/
│   ├── poc-schema.sql      # POC database schema
│   ├── demo-data.sql       # Sample data for demos
│   └── reset-script.sql    # Daily reset automation
└── docker-compose.poc.yml  # POC environment setup
```

---

## 🔐 **DEMO AUTHENTICATION SYSTEM**

### **Special POC Login Path:**
```typescript
// src/components/DemoLogin/DemoLoginPage.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const DEMO_CREDENTIALS = [
  { 
    email: 'demo@shahin-ai.com', 
    password: 'Demo123!', 
    role: 'admin',
    description: 'Full Admin Access - All Features'
  },
  { 
    email: 'viewer@shahin-ai.com', 
    password: 'Viewer123!', 
    role: 'viewer',
    description: 'Read-Only Access - View Reports & Dashboards'
  },
  { 
    email: 'manager@shahin-ai.com', 
    password: 'Manager123!', 
    role: 'manager',
    description: 'Manager Access - License & Tenant Management'
  }
];

export const DemoLoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = (demoUser: typeof DEMO_CREDENTIALS[0]) => {
    setCredentials({ email: demoUser.email, password: demoUser.password });
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // POC authentication - accepts any valid demo credentials
      const response = await fetch('/api/v1/auth/poc-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...credentials,
          isPOC: true,
          loginPath: '/poc/demo-login'
        })
      });

      if (response.ok) {
        const { token, user } = await response.json();
        localStorage.setItem('poc-token', token);
        localStorage.setItem('poc-user', JSON.stringify(user));
        
        // Redirect to POC dashboard
        window.location.href = '/poc/dashboard';
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      alert('Login failed. Please use demo credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* POC Watermark */}
      <div className="fixed top-4 right-4 z-50">
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          🧪 POC DEMO - Not Production Data
        </Badge>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Shahin AI GRC - POC Demo
          </h1>
          <p className="text-gray-600">
            Experience our GRC platform with live demo data
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Quick Login Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Quick Demo Login:</h3>
            {DEMO_CREDENTIALS.map((demo, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleQuickLogin(demo)}
              >
                <div>
                  <div className="font-medium">{demo.email}</div>
                  <div className="text-xs text-gray-500">{demo.description}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Manual Login Form */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Or Login Manually:</h3>
            
            <Input
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
            
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Logging in...' : 'Login to POC Demo'}
            </Button>
          </div>

          {/* POC Information */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <h4 className="font-medium text-blue-900">POC Demo Features:</h4>
            <ul className="text-blue-700 mt-1 space-y-1">
              <li>• License Management Dashboard</li>
              <li>• Tenant Onboarding Simulation</li>
              <li>• Usage Analytics & Reports</li>
              <li>• Compliance Monitoring</li>
              <li>• Automated Workflows Demo</li>
            </ul>
          </div>

          {/* CLI Bridge Integration Info */}
          <div className="bg-green-50 p-3 rounded-lg text-sm">
            <h4 className="font-medium text-green-900">🌉 Production Ready:</h4>
            <p className="text-green-700 mt-1">
              All POC data can be securely transferred to production with admin approval via our CLI Bridge system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## 📊 **POC DASHBOARD IMPLEMENTATION**

### **Simplified Dashboard with Demo Data:**
```typescript
// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GuidedTour } from '@/components/GuidedTour';
import { POCWatermark } from '@/components/POCWatermark';

interface DashboardMetrics {
  totalLicenses: number;
  activeTenants: number;
  expiringLicenses: number;
  complianceScore: number;
  monthlyRevenue: number;
  usageGrowth: number;
}

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    loadDemoMetrics();
  }, []);

  const loadDemoMetrics = async () => {
    // Simulate API call with demo data
    setTimeout(() => {
      setMetrics({
        totalLicenses: 156,
        activeTenants: 89,
        expiringLicenses: 12,
        complianceScore: 94,
        monthlyRevenue: 245000,
        usageGrowth: 23
      });
    }, 1000);
  };

  const handleTransferToProd = () => {
    // Integrate with CLI Bridge
    alert('CLI Bridge integration: This would initiate a secure transfer request requiring admin approval.');
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <POCWatermark />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GRC Dashboard - POC Demo</h1>
          <p className="text-gray-600">Live demonstration with sample data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTour(true)}>
            🎯 Take Tour
          </Button>
          <Button onClick={handleTransferToProd} className="bg-green-600 hover:bg-green-700">
            🌉 Transfer to Production
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="tour-licenses">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Licenses</h3>
            <Badge variant="secondary">{metrics.totalLicenses}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLicenses}</div>
            <p className="text-xs text-muted-foreground">
              Active license agreements
            </p>
          </CardContent>
        </Card>

        <Card className="tour-tenants">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Active Tenants</h3>
            <Badge variant="secondary">{metrics.activeTenants}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeTenants}</div>
            <p className="text-xs text-muted-foreground">
              Organizations using the platform
            </p>
          </CardContent>
        </Card>

        <Card className="tour-compliance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Compliance Score</h3>
            <Badge variant={metrics.complianceScore >= 90 ? "default" : "destructive"}>
              {metrics.complianceScore}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              Overall compliance rating
            </p>
          </CardContent>
        </Card>

        <Card className="tour-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Monthly Revenue</h3>
            <Badge variant="outline">${metrics.monthlyRevenue.toLocaleString()}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current month recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card className="tour-expiring">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Expiring Licenses</h3>
            <Badge variant="destructive">{metrics.expiringLicenses}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.expiringLicenses}</div>
            <p className="text-xs text-muted-foreground">
              Licenses expiring in 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="tour-growth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Usage Growth</h3>
            <Badge variant="default">+{metrics.usageGrowth}%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics.usageGrowth}%</div>
            <p className="text-xs text-muted-foreground">
              Month-over-month growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CLI Bridge Integration Panel */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <h3 className="text-lg font-semibold text-green-900">
            🌉 Ready for Production Transfer
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">
            This POC environment contains {metrics.activeTenants} tenants and {metrics.totalLicenses} licenses 
            ready for secure transfer to production with admin approval.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleTransferToProd} className="bg-green-600 hover:bg-green-700">
              Initiate Production Transfer
            </Button>
            <Button variant="outline">
              View Transfer Requirements
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guided Tour */}
      {showTour && (
        <GuidedTour onComplete={() => setShowTour(false)} />
      )}
    </div>
  );
};
```

---

## 🎯 **GUIDED TOUR IMPLEMENTATION**

### **Interactive Feature Walkthrough:**
```typescript
// src/components/GuidedTour/GuidedTour.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '.tour-licenses',
    title: 'License Management',
    content: 'Monitor all your software licenses in one place. Track expiration dates, usage, and compliance status.',
    position: 'bottom'
  },
  {
    target: '.tour-tenants',
    title: 'Multi-Tenant Management',
    content: 'Manage multiple organizations (tenants) with isolated data and customized configurations.',
    position: 'bottom'
  },
  {
    target: '.tour-compliance',
    title: 'Compliance Monitoring',
    content: 'Real-time compliance scoring based on license usage, security policies, and regulatory requirements.',
    position: 'bottom'
  },
  {
    target: '.tour-revenue',
    title: 'Revenue Tracking',
    content: 'Track recurring revenue, billing cycles, and financial metrics across all tenants.',
    position: 'top'
  },
  {
    target: '.tour-expiring',
    title: 'Proactive Alerts',
    content: 'Get notified about expiring licenses, compliance violations, and renewal opportunities.',
    position: 'top'
  },
  {
    target: '.tour-growth',
    title: 'Growth Analytics',
    content: 'Monitor platform usage growth, user adoption, and performance metrics over time.',
    position: 'top'
  }
];

interface GuidedTourProps {
  onComplete: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tourPosition, setTourPosition] = useState({ x: 0, y: 0 });

  const currentTourStep = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (currentTourStep) {
      const targetElement = document.querySelector(currentTourStep.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const position = calculatePosition(rect, currentTourStep.position);
        setTourPosition(position);
        
        // Highlight target element
        targetElement.classList.add('tour-highlight');
        
        return () => {
          targetElement.classList.remove('tour-highlight');
        };
      }
    }
  }, [currentStep]);

  const calculatePosition = (rect: DOMRect, position: string) => {
    switch (position) {
      case 'bottom':
        return { x: rect.left + rect.width / 2, y: rect.bottom + 10 };
      case 'top':
        return { x: rect.left + rect.width / 2, y: rect.top - 10 };
      case 'left':
        return { x: rect.left - 10, y: rect.top + rect.height / 2 };
      case 'right':
        return { x: rect.right + 10, y: rect.top + rect.height / 2 };
      default:
        return { x: rect.left, y: rect.bottom };
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <>
      {/* Tour Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleSkip} />
      
      {/* Tour Card */}
      <Card 
        className="fixed z-50 w-80 transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          left: tourPosition.x, 
          top: tourPosition.y 
        }}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg">{currentTourStep?.title}</h3>
            <span className="text-sm text-gray-500">
              {currentStep + 1} / {TOUR_STEPS.length}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4">{currentTourStep?.content}</p>
          
          <div className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSkip}>
                Skip Tour
              </Button>
            </div>
            
            <Button size="sm" onClick={handleNext}>
              {currentStep < TOUR_STEPS.length - 1 ? 'Next' : 'Finish'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tour Styles */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 41;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 8px;
        }
      `}</style>
    </>
  );
};
```

---

## 🔄 **CLI BRIDGE INTEGRATION**

### **POC to Production Transfer Service:**
```typescript
// src/services/bridgeApi.ts
export class BridgeApiService {
  private baseUrl = '/api/v1/bridge';

  async initiateTransfer(transferRequest: {
    dataTypes: string[];
    tenantIds?: string[];
    reason: string;
    priority: 'low' | 'medium' | 'high';
  }) {
    const response = await fetch(`${this.baseUrl}/initiate-transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('poc-token')}`
      },
      body: JSON.stringify({
        ...transferRequest,
        source: 'poc',
        target: 'production',
        requestedBy: this.getCurrentUser()
      })
    });

    if (!response.ok) {
      throw new Error('Transfer initiation failed');
    }

    return response.json();
  }

  async getTransferStatus(requestId: string) {
    const response = await fetch(`${this.baseUrl}/status/${requestId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('poc-token')}`
      }
    });

    return response.json();
  }

  async getTransferRequirements() {
    const response = await fetch(`${this.baseUrl}/requirements`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('poc-token')}`
      }
    });

    return response.json();
  }

  private getCurrentUser() {
    const user = localStorage.getItem('poc-user');
    return user ? JSON.parse(user) : null;
  }
}
```

---

## 🐳 **POC DEPLOYMENT CONFIGURATION**

### **Docker Compose for POC Environment:**
```yaml
# docker-compose.poc.yml
version: '3.8'

services:
  # POC Frontend
  poc-frontend:
    build: 
      context: ./poc-frontend
      dockerfile: Dockerfile.poc
    ports:
      - "3100:3100"
    environment:
      - REACT_APP_API_URL=http://localhost:3200
      - REACT_APP_POC_MODE=true
      - REACT_APP_BRIDGE_API_URL=http://localhost:3300
    depends_on:
      - poc-gateway

  # POC API Gateway
  poc-gateway:
    build: ./poc-backend/gateway
    ports:
      - "3200:3200"
    environment:
      - NODE_ENV=poc
      - POC_MODE=true
      - BRIDGE_API_URL=http://cli-bridge:3300
    depends_on:
      - poc-auth
      - poc-license
      - poc-tenant

  # POC Authentication Service
  poc-auth:
    build: ./poc-backend/services/auth-poc
    environment:
      - DB_HOST=poc-postgres
      - DB_NAME=poc_grc
      - JWT_SECRET=poc-demo-secret-key
      - POC_MODE=true

  # POC License Service
  poc-license:
    build: ./poc-backend/services/license-poc
    environment:
      - DB_HOST=poc-postgres
      - DB_NAME=poc_grc
      - DEMO_DATA=true

  # POC Tenant Service
  poc-tenant:
    build: ./poc-backend/services/tenant-poc
    environment:
      - DB_HOST=poc-postgres
      - DB_NAME=poc_grc
      - DEMO_DATA=true

  # CLI Bridge Service
  cli-bridge:
    build: ./cli-bridge
    ports:
      - "3300:3300"
    environment:
      - POC_DB_HOST=poc-postgres
      - MAIN_DB_HOST=main-postgres
      - ADMIN_EMAIL=admin@shahin-ai.com
      - SECURITY_LEVEL=enterprise
    depends_on:
      - poc-postgres
      - redis

  # POC Database
  poc-postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: poc_grc
      POSTGRES_USER: poc_user
      POSTGRES_PASSWORD: poc_demo_pass
    volumes:
      - poc_db_data:/var/lib/postgresql/data
      - ./poc-backend/database/poc-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./poc-backend/database/demo-data.sql:/docker-entrypoint-initdb.d/02-demo-data.sql
    ports:
      - "5433:5432"

  # Redis for CLI Bridge
  redis:
    image: redis:7-alpine
    ports:
      - "6380:6379"

  # Daily Reset Cron Job
  poc-reset:
    image: postgres:15
    environment:
      PGHOST: poc-postgres
      PGDATABASE: poc_grc
      PGUSER: poc_user
      PGPASSWORD: poc_demo_pass
    volumes:
      - ./poc-backend/database/reset-script.sql:/reset.sql
    command: >
      sh -c "
        echo '0 0 * * * psql -f /reset.sql' | crontab -
        && crond -f
      "
    depends_on:
      - poc-postgres

volumes:
  poc_db_data:

networks:
  default:
    name: poc-network
```

---

## 🎯 **POC BENEFITS & CLI BRIDGE INTEGRATION**

### **✅ POC Environment Benefits:**
- **Risk-Free Demonstration** - Completely isolated from production
- **Consistent Demo Experience** - Daily data reset ensures reliability
- **Sales Enablement** - Live platform demonstration capability
- **Feature Validation** - Real user feedback on core functionality
- **Performance Testing** - Load testing without production impact

### **✅ CLI Bridge Security Benefits:**
- **Admin Approval Required** - No unauthorized production transfers
- **Double Prevention System** - Multiple validation layers
- **Complete Audit Trail** - Full transfer logging and monitoring
- **Rollback Capability** - Quick recovery from transfer issues
- **Security Scanning** - Automated vulnerability detection

### **✅ Business Impact:**
- **Faster Sales Cycles** - Live demos accelerate decision-making
- **Reduced Risk** - Secure POC-to-production migration path
- **Customer Confidence** - Professional demonstration environment
- **Operational Efficiency** - Automated transfer processes
- **Compliance Ready** - Full audit trails for regulatory requirements

**The POC Sandbox with CLI Bridge integration provides a complete solution for safe demonstrations and secure production migrations with enterprise-grade security controls!** 🚀
