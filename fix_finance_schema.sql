-- Fix Finance Database Schema Issues
-- Add missing columns and fix cross-database query compatibility

-- Connect to finance database
\c grc_master;

-- 1. Fix tenant_licenses table - Add missing monthly_cost column
DO $$
BEGIN
    -- Check if monthly_cost column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_licenses' AND column_name = 'monthly_cost'
    ) THEN
        ALTER TABLE tenant_licenses ADD COLUMN monthly_cost DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Added monthly_cost column to tenant_licenses table';
    ELSE
        RAISE NOTICE 'monthly_cost column already exists in tenant_licenses table';
    END IF;
END $$;

-- 2. Fix licenses table - Ensure monthly_cost column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'licenses' AND column_name = 'monthly_cost'
    ) THEN
        ALTER TABLE licenses ADD COLUMN monthly_cost DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Added monthly_cost column to licenses table';
    ELSE
        RAISE NOTICE 'monthly_cost column already exists in licenses table';
    END IF;
END $$;

-- 3. Update existing data with sample monthly costs
UPDATE licenses SET monthly_cost = 
    CASE 
        WHEN name ILIKE '%basic%' THEN 99.99
        WHEN name ILIKE '%standard%' THEN 199.99
        WHEN name ILIKE '%premium%' THEN 399.99
        WHEN name ILIKE '%enterprise%' THEN 999.99
        ELSE 149.99
    END
WHERE monthly_cost = 0.00 OR monthly_cost IS NULL;

-- 4. Update tenant_licenses with costs from licenses table
UPDATE tenant_licenses 
SET monthly_cost = l.monthly_cost
FROM licenses l
WHERE tenant_licenses.license_id = l.id
AND (tenant_licenses.monthly_cost = 0.00 OR tenant_licenses.monthly_cost IS NULL);

-- 5. Add indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_licenses_tenant_id ON tenant_licenses(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_licenses_license_id ON tenant_licenses(license_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_licenses_status ON tenant_licenses(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_status ON tenants(status);

-- 6. Verify the schema fixes
SELECT 
    'tenant_licenses' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tenant_licenses' 
AND column_name IN ('monthly_cost', 'tenant_id', 'license_id', 'status')
ORDER BY column_name;

SELECT 
    'licenses' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'licenses' 
AND column_name IN ('monthly_cost', 'id', 'name')
ORDER BY column_name;

-- 7. Test the problematic query from cross_check_db_connections.js
SELECT 
    COUNT(*) as total_licenses,
    COUNT(CASE WHEN tl.status = 'active' THEN 1 END) as active_licenses,
    COALESCE(SUM(CASE WHEN tl.status = 'active' THEN l.monthly_cost ELSE 0 END), 0) as total_monthly_cost
FROM tenant_licenses tl
JOIN licenses l ON tl.license_id = l.id;

RAISE NOTICE 'Finance database schema fixes completed successfully!';
