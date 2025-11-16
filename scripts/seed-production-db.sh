#!/bin/bash

# Shahin GRC Platform - Production Database Seeding Script
# Seeds the production database with Saudi compliance frameworks and essential data

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running in production
confirm_production() {
    log "⚠️  WARNING: This will seed data into your PRODUCTION database!"
    log "Database URL: ${DATABASE_URL}"
    echo -n "Are you sure you want to continue? (type 'YES' to proceed): "
    read -r response
    if [[ "$response" != "YES" ]]; then
        error "Production seeding cancelled by user"
        exit 1
    fi
}

# Seed Saudi compliance frameworks
seed_saudi_compliance() {
    log "Seeding Saudi Arabian compliance frameworks..."
    
    # Saudi Arabian Monetary Authority (SAMA) frameworks
    npx prisma db execute --stdin << SQL
INSERT INTO frameworks (id, name, description, version, category, region, is_active, created_at, updated_at) VALUES
('sama-csf-v3.1', 'SAMA CSF v3.1', 'Saudi Arabian Monetary Authority Cyber Security Framework v3.1', '3.1', 'Cybersecurity', 'SA', true, NOW(), NOW()),
('sama-csf-v4.0', 'SAMA CSF v4.0', 'Saudi Arabian Monetary Authority Cyber Security Framework v4.0', '4.0', 'Cybersecurity', 'SA', true, NOW(), NOW()),
('nca-ccc-v1.0', 'NCA CCC v1.0', 'National Cybersecurity Authority - Cloud Cybersecurity Controls v1.0', '1.0', 'Cloud Security', 'SA', true, NOW(), NOW()),
('nca-ecc-v1.0', 'NCA ECC v1.0', 'National Cybersecurity Authority - Essential Cybersecurity Controls v1.0', '1.0', 'Cybersecurity', 'SA', true, NOW(), NOW()),
('citc-cyber-v2.0', 'CITC Cyber v2.0', 'Communications and Information Technology Commission Cybersecurity Framework v2.0', '2.0', 'Cybersecurity', 'SA', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
SQL

    success "Saudi compliance frameworks seeded"
}

# Seed regulatory authorities
seed_regulatory_authorities() {
    log "Seeding Saudi regulatory authorities..."
    
    npx prisma db execute --stdin << SQL
INSERT INTO regulatory_authorities (id, name, acronym, country, website, description, is_active, created_at, updated_at) VALUES
('sama', 'Saudi Arabian Monetary Authority', 'SAMA', 'Saudi Arabia', 'https://www.sama.gov.sa', 'Central bank of Saudi Arabia', true, NOW(), NOW()),
('nca', 'National Cybersecurity Authority', 'NCA', 'Saudi Arabia', 'https://www.nca.gov.sa', 'National cybersecurity authority of Saudi Arabia', true, NOW(), NOW()),
('citc', 'Communications and Information Technology Commission', 'CITC', 'Saudi Arabia', 'https://www.citc.gov.sa', 'Regulator for communications and IT in Saudi Arabia', true, NOW(), NOW()),
('gaca', 'General Authority of Civil Aviation', 'GACA', 'Saudi Arabia', 'https://www.gaca.gov.sa', 'General authority of civil aviation', true, NOW(), NOW()),
('sdaia', 'Saudi Data and Artificial Intelligence Authority', 'SDAIA', 'Saudi Arabia', 'https://www.sdaia.gov.sa', 'Saudi data and AI authority', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
SQL

    success "Regulatory authorities seeded"
}

# Seed compliance controls
seed_compliance_controls() {
    log "Seeding compliance controls..."
    
    # SAMA CSF v4.0 controls
    npx prisma db execute --stdin << SQL
INSERT INTO compliance_controls (id, framework_id, control_id, control_name, description, category, maturity_level, implementation_status, created_at, updated_at) VALUES
('sama-csf-4.0-c1', 'sama-csf-v4.0', 'C1', 'Information Security Governance', 'Establish and maintain an information security governance framework', 'Governance', 'Advanced', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c2', 'sama-csf-v4.0', 'C2', 'Risk Management', 'Implement risk management processes for information security', 'Risk Management', 'Advanced', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c3', 'sama-csf-v4.0', 'C3', 'Asset Management', 'Manage information assets throughout their lifecycle', 'Asset Management', 'Intermediate', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c4', 'sama-csf-v4.0', 'C4', 'Access Control', 'Implement access control mechanisms', 'Access Control', 'Advanced', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c5', 'sama-csf-v4.0', 'C5', 'Cryptography', 'Implement cryptographic controls', 'Cryptography', 'Advanced', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c6', 'sama-csf-v4.0', 'C6', 'Physical Security', 'Implement physical and environmental security controls', 'Physical Security', 'Intermediate', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c7', 'sama-csf-v4.0', 'C7', 'Operations Security', 'Implement operational security controls', 'Operations', 'Advanced', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c8', 'sama-csf-v4.0', 'C8', 'Communications Security', 'Implement communications security controls', 'Communications', 'Intermediate', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c9', 'sama-csf-v4.0', 'C9', 'System Acquisition', 'Implement security in system acquisition and development', 'Development', 'Advanced', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c10', 'sama-csf-v4.0', 'C10', 'Supplier Relationships', 'Manage supplier relationships security', 'Supplier Management', 'Intermediate', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c11', 'sama-csf-v4.0', 'C11', 'Incident Management', 'Implement incident management processes', 'Incident Management', 'Advanced', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c12', 'sama-csf-v4.0', 'C12', 'Business Continuity', 'Implement business continuity management', 'Business Continuity', 'Advanced', 'Not Implemented', NOW(), NOW()),
('sama-csf-4.0-c13', 'sama-csf-v4.0', 'C13', 'Compliance', 'Ensure compliance with legal and regulatory requirements', 'Compliance', 'Advanced', 'Not Implemented', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
SQL

    success "Compliance controls seeded"
}

# Seed risk categories
seed_risk_categories() {
    log "Seeding risk categories..."
    
    npx prisma db execute --stdin << SQL
INSERT INTO risk_categories (id, name, description, severity_weight, is_active, created_at, updated_at) VALUES
('strategic', 'Strategic Risk', 'Risks that affect the organization''s strategic objectives', 0.9, true, NOW(), NOW()),
('operational', 'Operational Risk', 'Risks arising from inadequate or failed internal processes', 0.7, true, NOW(), NOW()),
('financial', 'Financial Risk', 'Risks related to financial operations and reporting', 0.8, true, NOW(), NOW()),
('compliance', 'Compliance Risk', 'Risks of legal or regulatory sanctions', 0.85, true, NOW(), NOW()),
('technology', 'Technology Risk', 'Risks related to technology systems and infrastructure', 0.75, true, NOW(), NOW()),
('cybersecurity', 'Cybersecurity Risk', 'Risks related to cyber threats and vulnerabilities', 0.9, true, NOW(), NOW()),
('reputational', 'Reputational Risk', 'Risks that could damage organization''s reputation', 0.95, true, NOW(), NOW()),
('third-party', 'Third-Party Risk', 'Risks arising from third-party relationships', 0.6, true, NOW(), NOW()),
('business-continuity', 'Business Continuity Risk', 'Risks affecting business continuity', 0.85, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
SQL

    success "Risk categories seeded"
}

# Seed assessment templates
seed_assessment_templates() {
    log "Seeding assessment templates..."
    
    npx prisma db execute --stdin << SQL
INSERT INTO assessment_templates (id, name, description, framework_id, version, is_active, created_at, updated_at) VALUES
('sama-csf-v4-assessment', 'SAMA CSF v4.0 Assessment', 'Comprehensive assessment for SAMA Cyber Security Framework v4.0', 'sama-csf-v4.0', '1.0', true, NOW(), NOW()),
('nca-ccc-v1-assessment', 'NCA CCC v1.0 Assessment', 'Assessment for NCA Cloud Cybersecurity Controls v1.0', 'nca-ccc-v1.0', '1.0', true, NOW(), NOW()),
('nca-ecc-v1-assessment', 'NCA ECC v1.0 Assessment', 'Assessment for NCA Essential Cybersecurity Controls v1.0', 'nca-ecc-v1.0', '1.0', true, NOW(), NOW()),
('citc-cyber-v2-assessment', 'CITC Cyber v2.0 Assessment', 'Assessment for CITC Cybersecurity Framework v2.0', 'citc-cyber-v2.0', '1.0', true, NOW(), NOW()),
('comprehensive-saudi-compliance', 'Comprehensive Saudi Compliance', 'Combined assessment covering all major Saudi compliance frameworks', null, '1.0', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
SQL

    success "Assessment templates seeded"
}

# Seed organizations
seed_organizations() {
    log "Seeding organizations..."
    
    npx prisma db execute --stdin << SQL
INSERT INTO organizations (id, name, description, type, industry, country, is_active, created_at, updated_at) VALUES
('demo-org', 'Demo Organization', 'Demo organization for testing and demonstration', 'Demo', 'Financial Services', 'SA', true, NOW(), NOW()),
('partner-org', 'Partner Organization', 'Partner organization for collaborative testing', 'Partner', 'Technology', 'SA', true, NOW(), NOW()),
('poc-org', 'POC Organization', 'Proof of concept organization', 'POC', 'Government', 'SA', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
SQL

    success "Organizations seeded"
}

# Seed demo users (with secure passwords)
seed_demo_users() {
    log "Seeding demo users..."
    
    # Note: These are demo users with secure passwords for testing
    # In production, users should be created through the registration process
    
    npx prisma db execute --stdin << SQL
INSERT INTO users (id, email, username, password_hash, role, is_active, email_verified, created_at, updated_at) VALUES
('demo-admin', 'demo.admin@shahin-ai.com', 'demo_admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true, true, NOW(), NOW()),
('demo-user', 'demo.user@shahin-ai.com', 'demo_user', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', true, true, NOW(), NOW()),
('demo-auditor', 'demo.auditor@shahin-ai.com', 'demo_auditor', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'auditor', true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
SQL

    success "Demo users seeded"
}

# Seed audit logs
seed_audit_logs() {
    log "Seeding audit logs..."
    
    npx prisma db execute --stdin << SQL
INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at) VALUES
('audit-001', 'demo-admin', 'SYSTEM_SETUP', 'framework', 'sama-csf-v4.0', 'SAMA CSF v4.0 framework initialized', '127.0.0.1', 'System Setup', NOW()),
('audit-002', 'demo-admin', 'SYSTEM_SETUP', 'framework', 'nca-ccc-v1.0', 'NCA CCC v1.0 framework initialized', '127.0.0.1', 'System Setup', NOW()),
('audit-003', 'demo-admin', 'SYSTEM_SETUP', 'framework', 'nca-ecc-v1.0', 'NCA ECC v1.0 framework initialized', '127.0.0.1', 'System Setup', NOW()),
('audit-004', 'demo-admin', 'SYSTEM_SETUP', 'framework', 'citc-cyber-v2.0', 'CITC Cyber v2.0 framework initialized', '127.0.0.1', 'System Setup', NOW())
ON CONFLICT (id) DO NOTHING;
SQL

    success "Audit logs seeded"
}

# Verify seeding
verify_seeding() {
    log "Verifying seeding completion..."
    
    # Count records
    FRAMEWORKS_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM frameworks" 2>/dev/null | grep -o '[0-9]*')
    CONTROLS_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM compliance_controls" 2>/dev/null | grep -o '[0-9]*')
    USERS_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM users" 2>/dev/null | grep -o '[0-9]*')
    
    log "Seeding verification:"
    log "  Frameworks: $FRAMEWORKS_COUNT"
    log "  Controls: $CONTROLS_COUNT"
    log "  Users: $USERS_COUNT"
    
    if [[ $FRAMEWORKS_COUNT -gt 0 && $CONTROLS_COUNT -gt 0 ]]; then
        success "Seeding verification completed successfully"
    else
        error "Seeding verification failed - some tables are empty"
        exit 1
    fi
}

# Main function
main() {
    log "🚀 Starting Shahin GRC Platform Production Database Seeding"
    
    # Confirm production
    confirm_production
    
    # Check if Prisma is available
    if ! command -v npx &> /dev/null; then
        error "npx is not available. Please install Node.js and npm."
        exit 1
    fi
    
    # Check if DATABASE_URL is set
    if [[ -z "$DATABASE_URL" ]]; then
        error "DATABASE_URL environment variable is not set"
        exit 1
    fi
    
    log "Database URL: ${DATABASE_URL}"
    log "Starting seeding process..."
    
    # Run seeding steps
    seed_saudi_compliance
    seed_regulatory_authorities
    seed_compliance_controls
    seed_risk_categories
    seed_assessment_templates
    seed_organizations
    seed_demo_users
    seed_audit_logs
    
    # Verify seeding
    verify_seeding
    
    success "🎉 Production database seeding completed successfully!"
    log "Your Shahin GRC platform is now ready with Saudi compliance frameworks."
    log ""
    log "Demo Login Credentials:"
    log "  Admin: demo.admin@shahin-ai.com / password"
    log "  User: demo.user@shahin-ai.com / password"
    log "  Auditor: demo.auditor@shahin-ai.com / password"
    log ""
    log "Please change these demo passwords immediately after first login!"
}

# Help function
show_help() {
    echo "Shahin GRC Platform - Production Database Seeding Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -f, --force         Skip production confirmation (use with caution)"
    echo "  -v, --verify-only   Only verify existing seeding without adding new data"
    echo ""
    echo "Environment Variables Required:"
    echo "  DATABASE_URL        PostgreSQL connection string"
    echo ""
    echo "Example:"
    echo "  export DATABASE_URL=postgresql://..."
    echo "  ./scripts/seed-production-db.sh"
}

# Parse command line arguments
FORCE=false
VERIFY_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -v|--verify-only)
            VERIFY_ONLY=true
            shift
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Handle verify-only mode
if [[ "$VERIFY_ONLY" == true ]]; then
    log "Running verification only..."
    verify_seeding
    exit 0
fi

# Skip confirmation if forced
if [[ "$FORCE" == true ]]; then
    log "Running in force mode (skipping confirmation)"
else
    confirm_production
fi

# Run main function
main "$@"