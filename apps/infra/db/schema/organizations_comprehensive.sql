-- ==========================================
-- 🏢 COMPREHENSIVE ORGANIZATIONS ENHANCEMENT
-- ==========================================
-- Migration: 002_enhance_organizations_comprehensive.sql
-- Purpose: Add missing comprehensive legal, management, banking, and authorization details

-- First, create sectors lookup table for dropdown support
CREATE TABLE IF NOT EXISTS sectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    name_ar VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert common Saudi Arabia sectors
INSERT INTO sectors (name, name_ar, description) VALUES
('Banking and Financial Services', 'الخدمات المصرفية والمالية', 'Banking, insurance, investment services'),
('Oil and Gas', 'النفط والغاز', 'Petroleum, natural gas, petrochemicals'),
('Construction and Real Estate', 'البناء والعقارات', 'Construction, real estate development'),
('Healthcare', 'الرعاية الصحية', 'Hospitals, clinics, pharmaceutical'),
('Education', 'التعليم', 'Schools, universities, training institutes'),
('Telecommunications', 'الاتصالات', 'Telecom services, internet providers'),
('Manufacturing', 'التصنيع', 'Industrial manufacturing, production'),
('Retail and Trade', 'التجارة والبيع بالتجزئة', 'Retail stores, wholesale trade'),
('Transportation and Logistics', 'النقل واللوجستيات', 'Shipping, logistics, transportation'),
('Technology and IT', 'التكنولوجيا وتقنية المعلومات', 'Software, IT services, technology'),
('Government and Public Sector', 'الحكومة والقطاع العام', 'Government agencies, public institutions'),
('Agriculture', 'الزراعة', 'Farming, agricultural services'),
('Tourism and Hospitality', 'السياحة والضيافة', 'Hotels, restaurants, tourism services'),
('Mining and Minerals', 'التعدين والمعادن', 'Mining operations, mineral extraction'),
('Utilities', 'المرافق العامة', 'Water, electricity, waste management'),
('Media and Entertainment', 'الإعلام والترفيه', 'Broadcasting, publishing, entertainment'),
('Legal and Professional Services', 'الخدمات القانونية والمهنية', 'Law firms, consulting, professional services'),
('Non-Profit Organizations', 'المنظمات غير الربحية', 'Charities, NGOs, foundations'),
('Other', 'أخرى', 'Other sectors not listed above')
ON CONFLICT (name) DO NOTHING;

-- Add missing comprehensive fields to organizations table
ALTER TABLE organizations 
-- Legal Information (add only if not exists)
ADD COLUMN IF NOT EXISTS legal_name VARCHAR(500),
ADD COLUMN IF NOT EXISTS legal_name_ar VARCHAR(500),
ADD COLUMN IF NOT EXISTS commercial_registration_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS vat_registration_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS tax_identification_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS license_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS license_expiry_date DATE,
ADD COLUMN IF NOT EXISTS establishment_date DATE,
ADD COLUMN IF NOT EXISTS legal_form VARCHAR(100), -- LLC, Corporation, Partnership, etc.

-- Address Information
ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(500),
ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(500),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS province VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS po_box VARCHAR(50),
ADD COLUMN IF NOT EXISTS address_ar TEXT,

-- Contact Information
ADD COLUMN IF NOT EXISTS primary_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS fax VARCHAR(50),
ADD COLUMN IF NOT EXISTS primary_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),

-- Management Information
ADD COLUMN IF NOT EXISTS ceo_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS ceo_name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS ceo_nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS ceo_id_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS chairman_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS chairman_name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS general_manager_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS general_manager_name_ar VARCHAR(255),

-- Banking Information
ADD COLUMN IF NOT EXISTS primary_bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS primary_bank_account_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS primary_bank_iban VARCHAR(100),
ADD COLUMN IF NOT EXISTS secondary_bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS secondary_bank_account_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS secondary_bank_iban VARCHAR(100),

-- Authorized Signatures
ADD COLUMN IF NOT EXISTS authorized_signatory1_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS authorized_signatory1_name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS authorized_signatory1_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS authorized_signatory1_id_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS authorized_signatory1_signature_limit DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS authorized_signatory2_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS authorized_signatory2_name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS authorized_signatory2_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS authorized_signatory2_id_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS authorized_signatory2_signature_limit DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS authorized_signatory3_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS authorized_signatory3_name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS authorized_signatory3_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS authorized_signatory3_id_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS authorized_signatory3_signature_limit DECIMAL(15,2),

-- Business Information (some may already exist)
ADD COLUMN IF NOT EXISTS sub_sector VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_activities TEXT,
ADD COLUMN IF NOT EXISTS business_activities_ar TEXT,
ADD COLUMN IF NOT EXISTS capital_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'SAR',

-- Compliance and Regulatory
ADD COLUMN IF NOT EXISTS regulatory_authority VARCHAR(255),
ADD COLUMN IF NOT EXISTS compliance_officer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS compliance_officer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS compliance_officer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS risk_rating VARCHAR(50), -- Low, Medium, High, Critical
ADD COLUMN IF NOT EXISTS last_audit_date DATE,
ADD COLUMN IF NOT EXISTS next_audit_due_date DATE,

-- Additional Information
ADD COLUMN IF NOT EXISTS parent_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS subsidiaries TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS notes_ar TEXT,
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,

-- Document Management
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Update sector_id to be UUID to match sectors table
ALTER TABLE organizations ALTER COLUMN sector_id TYPE UUID USING sector_id::text::uuid;

-- Add foreign key constraint for sector_id
ALTER TABLE organizations 
ADD CONSTRAINT fk_organizations_sector_id 
FOREIGN KEY (sector_id) REFERENCES sectors(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_commercial_registration ON organizations(commercial_registration_no);
CREATE INDEX IF NOT EXISTS idx_organizations_vat_registration ON organizations(vat_registration_no);
CREATE INDEX IF NOT EXISTS idx_organizations_approval_status ON organizations(approval_status);
CREATE INDEX IF NOT EXISTS idx_organizations_city ON organizations(city);
CREATE INDEX IF NOT EXISTS idx_organizations_province ON organizations(province);
CREATE INDEX IF NOT EXISTS idx_organizations_risk_rating ON organizations(risk_rating);

-- Add constraints
ALTER TABLE organizations 
ADD CONSTRAINT chk_organizations_approval_status 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE organizations 
ADD CONSTRAINT chk_organizations_risk_rating 
CHECK (risk_rating IN ('Low', 'Medium', 'High', 'Critical'));

-- Create a view for easy organization summary
CREATE OR REPLACE VIEW organization_summary AS
SELECT 
    o.id,
    o.name,
    o.name_ar,
    o.legal_name,
    o.commercial_registration_no,
    o.vat_registration_no,
    o.city,
    o.province,
    o.country,
    s.name as sector_name,
    s.name_ar as sector_name_ar,
    o.employee_count,
    o.status,
    o.approval_status,
    o.risk_rating,
    o.primary_email,
    o.primary_phone,
    o.created_at,
    o.updated_at
FROM organizations o
LEFT JOIN sectors s ON o.sector_id = s.id;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON sectors TO postgres;
GRANT SELECT ON organization_summary TO postgres;

-- Add comments for documentation
COMMENT ON TABLE organizations IS 'Comprehensive organization registry with legal, management, banking, and authorization details';
COMMENT ON TABLE sectors IS 'Industry sectors lookup table for organization classification';
COMMENT ON VIEW organization_summary IS 'Simplified view of organization key information';

-- Migration completed successfully
SELECT 'Organizations table enhanced with comprehensive legal, management, banking, and authorization details' as migration_status;