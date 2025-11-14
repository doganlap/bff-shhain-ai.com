-- ============================================================================
-- REGULATOR COMPLIANCE TABLES
-- For tracking compliance with KSA regulators per assessment
-- ============================================================================

-- Create regulator_compliance table
CREATE TABLE IF NOT EXISTS regulator_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  regulator_code VARCHAR(20) NOT NULL,
  regulator_name VARCHAR(200) NOT NULL,
  compliance_status VARCHAR(50) DEFAULT 'pending',
  priority_level VARCHAR(20) DEFAULT 'medium',
  compliance_score DECIMAL(5,2) DEFAULT 0.00,
  last_assessment_date TIMESTAMP,
  next_review_date TIMESTAMP,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_regulator_compliance_assessment ON regulator_compliance(assessment_id);
CREATE INDEX IF NOT EXISTS idx_regulator_compliance_tenant ON regulator_compliance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_regulator_compliance_regulator ON regulator_compliance(regulator_code);
CREATE INDEX IF NOT EXISTS idx_regulator_compliance_status ON regulator_compliance(compliance_status);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_regulator_compliance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_regulator_compliance_updated_at
  BEFORE UPDATE ON regulator_compliance
  FOR EACH ROW
  EXECUTE FUNCTION update_regulator_compliance_updated_at();

-- Add comments
COMMENT ON TABLE regulator_compliance IS 'Tracks compliance status with specific KSA regulators per assessment';
COMMENT ON COLUMN regulator_compliance.regulator_code IS 'Short code like SAMA, NCA, CITC, etc.';
COMMENT ON COLUMN regulator_compliance.compliance_status IS 'pending, in_progress, compliant, non_compliant, under_review';
COMMENT ON COLUMN regulator_compliance.priority_level IS 'low, medium, high, critical';

-- ============================================================================
-- SAMPLE DATA - KSA REGULATORS
-- ============================================================================

-- Insert sample regulator data (if not exists)
INSERT INTO regulator_compliance (
  assessment_id, tenant_id, regulator_code, regulator_name, 
  compliance_status, priority_level
) 
SELECT 
  a.id as assessment_id,
  a.tenant_id,
  'SAMA' as regulator_code,
  'Saudi Arabian Monetary Authority' as regulator_name,
  'pending' as compliance_status,
  'high' as priority_level
FROM assessments a
WHERE NOT EXISTS (
  SELECT 1 FROM regulator_compliance rc 
  WHERE rc.assessment_id = a.id AND rc.regulator_code = 'SAMA'
)
LIMIT 5; -- Only add to first 5 assessments for testing

COMMIT;
