# 🔐 GRC Master - Super Admin Credentials

## Super Admin Account Details

### Default Super Admin Credentials
```
Email:    admin@grc-master.com
Username: superadmin
Password: Admin@2024!GRC
Role:     super_admin
Tenant:   Global Admin
```

### Alternative Admin Accounts
```
Email:    admin@shahin.ai
Username: admin
Password: Shahin@2024!Admin
Role:     admin
Tenant:   Shahin AI KSA
```

### Demo Organization Admin
```
Email:    demo@acme.com
Username: demoadmin
Password: Demo@2024!ACME
Role:     org_admin
Organization: ACME Corporation
Tenant ID: 42c676e2-8d5e-4b1d-ae80-3986b82dd5c5
```

---

## 🚀 Quick Access URLs

- **Login Page**: http://localhost:5173/login
- **Glass Login**: http://localhost:5173/login-glass
- **Registration**: http://localhost:5173/register
- **Story Registration**: http://localhost:5173/story-registration

---

## 📋 Super Admin Capabilities

### Full System Access
- ✅ Manage all tenants and organizations
- ✅ Create/edit/delete users across all tenants
- ✅ Configure global system settings
- ✅ Access all regulatory frameworks and controls
- ✅ View/manage all assessments and audits
- ✅ Generate system-wide reports
- ✅ Monitor API and system health
- ✅ Manage permissions and roles

### Security Features
- Multi-factor authentication (MFA) capable
- Session management and monitoring
- Audit trail access for all actions
- IP whitelisting configuration
- Security policy enforcement

---

## 🔒 Security Best Practices

### Important Notes:
1. **CHANGE DEFAULT PASSWORD** immediately after first login
2. Enable **Two-Factor Authentication (2FA)** for admin accounts
3. Use **strong, unique passwords** (minimum 12 characters)
4. Regularly **rotate passwords** (every 90 days)
5. **Never share** admin credentials
6. Use **dedicated admin emails** (not personal emails)
7. **Review audit logs** regularly for suspicious activity

### Password Requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)
- No common passwords or dictionary words

---

## 🗄️ Database Setup (For Backend Team)

### SQL to Create Super Admin User
```sql
-- Insert super admin user
INSERT INTO users (
    id,
    email,
    username,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@grc-master.com',
    'superadmin',
    -- Password: Admin@2024!GRC (hash this with bcrypt)
    '$2b$10$YourBcryptHashHere',
    'Super',
    'Admin',
    'super_admin',
    'active',
    true,
    NOW(),
    NOW()
);

-- Create global admin tenant
INSERT INTO tenants (
    id,
    name,
    slug,
    status,
    settings,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Global Admin',
    'global-admin',
    'active',
    '{"is_global": true, "max_users": 999999}'::jsonb,
    NOW(),
    NOW()
);

-- Link super admin to global tenant
INSERT INTO user_tenants (
    user_id,
    tenant_id,
    role,
    created_at
) VALUES (
    (SELECT id FROM users WHERE email = 'admin@grc-master.com'),
    (SELECT id FROM tenants WHERE slug = 'global-admin'),
    'owner',
    NOW()
);
```

---

## 🔧 API Endpoints for Authentication

### Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@grc-master.com",
  "password": "Admin@2024!GRC"
}
```

### Get Current User
```bash
GET http://localhost:3000/api/auth/me
Authorization: Bearer <your_token>
```

### Refresh Token
```bash
POST http://localhost:3000/api/auth/refresh
Authorization: Bearer <your_refresh_token>
```

---

## 📝 Environment Variables

Add these to your `.env` file:

```env
# Admin Configuration
ADMIN_EMAIL=admin@grc-master.com
ADMIN_PASSWORD=Admin@2024!GRC
ADMIN_TENANT_ID=<global-tenant-uuid>

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Session
SESSION_SECRET=your-session-secret-change-this
SESSION_TIMEOUT=3600

# MFA
MFA_ENABLED=true
MFA_ISSUER=GRC-Master

# Password Policy
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=true
PASSWORD_MAX_AGE_DAYS=90
```

---

## 🧪 Testing Credentials

For development/testing purposes only:

```
Email:    test@test.com
Password: Test@2024
Role:     user
```

---

## 📞 Support

If you encounter login issues:
1. Check database connection
2. Verify API is running on http://localhost:3000
3. Check browser console for errors
4. Clear browser cache and cookies
5. Try incognito/private browsing mode

---

## 🔄 Password Reset

If you forget the super admin password:

### Via Backend API:
```bash
# Generate reset token
POST http://localhost:3000/api/auth/forgot-password
{
  "email": "admin@grc-master.com"
}

# Reset password with token
POST http://localhost:3000/api/auth/reset-password
{
  "token": "<reset_token>",
  "password": "NewPassword@2024!"
}
```

### Via Database (Emergency):
```sql
-- Update password directly (use bcrypt hash)
UPDATE users 
SET password_hash = '$2b$10$NewBcryptHashHere',
    updated_at = NOW()
WHERE email = 'admin@grc-master.com';
```

---

## ⚠️ IMPORTANT SECURITY NOTICE

**DO NOT commit this file to version control!**

Add to `.gitignore`:
```
SUPER_ADMIN_CREDENTIALS.md
*CREDENTIALS*
*.env
.env.*
```

**Keep this file secure and share only through encrypted channels!**

---

Last Updated: November 12, 2025
Generated By: GRC Master Setup System
