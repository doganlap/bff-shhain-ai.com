/*
  Warnings:

  - The primary key for the `demo_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `partner_invitations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `poc_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `tenants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `metadata` on table `demo_requests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `metadata` on table `partner_invitations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `metadata` on table `poc_requests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `metadata` on table `tenants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `metadata` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "demo_requests" DROP CONSTRAINT "demo_requests_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "demo_requests" DROP CONSTRAINT "demo_requests_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "demo_requests" DROP CONSTRAINT "demo_requests_user_id_fkey";

-- DropForeignKey
ALTER TABLE "partner_invitations" DROP CONSTRAINT "partner_invitations_accepted_user_id_fkey";

-- DropForeignKey
ALTER TABLE "partner_invitations" DROP CONSTRAINT "partner_invitations_invited_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "partner_invitations" DROP CONSTRAINT "partner_invitations_partner_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "poc_requests" DROP CONSTRAINT "poc_requests_owner_internal_user_id_fkey";

-- DropForeignKey
ALTER TABLE "poc_requests" DROP CONSTRAINT "poc_requests_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_tenant_id_fkey";

-- DropIndex
DROP INDEX "idx_demo_requests_tenant";

-- DropIndex
DROP INDEX "idx_partner_inv_token";

-- DropIndex
DROP INDEX "idx_poc_requests_tenant";

-- DropIndex
DROP INDEX "idx_tenants_slug";

-- AlterTable
ALTER TABLE "demo_requests" DROP CONSTRAINT "demo_requests_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tenant_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "reviewed_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "reviewer_id" SET DATA TYPE TEXT,
ALTER COLUMN "metadata" SET NOT NULL,
ADD CONSTRAINT "demo_requests_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "partner_invitations" DROP CONSTRAINT "partner_invitations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "partner_tenant_id" SET DATA TYPE TEXT,
ALTER COLUMN "invited_by_user_id" SET DATA TYPE TEXT,
ALTER COLUMN "accepted_user_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "accepted_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "metadata" SET NOT NULL,
ADD CONSTRAINT "partner_invitations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "poc_requests" DROP CONSTRAINT "poc_requests_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "preferred_start_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "tenant_id" SET DATA TYPE TEXT,
ALTER COLUMN "owner_internal_user_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "approved_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "completed_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "metadata" SET NOT NULL,
ADD CONSTRAINT "poc_requests_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "metadata" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tenant_id" SET DATA TYPE TEXT,
ALTER COLUMN "metadata" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "last_login_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "activity" TEXT NOT NULL,
    "module" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicable_frameworks_matrix" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "framework_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "is_applicable" BOOLEAN NOT NULL DEFAULT false,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "applicability_score" DOUBLE PRECISION,
    "applicability_reason" TEXT,
    "matching_factors" JSONB,
    "rule_ids" JSONB,
    "total_controls" INTEGER NOT NULL DEFAULT 0,
    "applicable_controls" INTEGER NOT NULL DEFAULT 0,
    "mandatory_controls" INTEGER NOT NULL DEFAULT 0,
    "optional_controls" INTEGER NOT NULL DEFAULT 0,
    "priority_level" TEXT,
    "recommended_timeline" TEXT,
    "compliance_deadline" TIMESTAMP(3),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculated_by" TEXT,
    "calculation_version" TEXT,
    "tenant_id_fk" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicable_frameworks_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_controls" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "implementation_status" TEXT,
    "compliance_status" TEXT,
    "score" DOUBLE PRECISION,
    "evidence_submitted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "assigned_to" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_evidence" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "evidence_type" TEXT NOT NULL,
    "evidence_name" TEXT NOT NULL,
    "evidence_description" TEXT,
    "file_path" TEXT,
    "file_url" TEXT,
    "file_size" INTEGER,
    "file_type" TEXT,
    "storage_location" TEXT,
    "collected_date" TIMESTAMP(3),
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "is_expired" BOOLEAN NOT NULL DEFAULT false,
    "validation_status" TEXT NOT NULL DEFAULT 'pending',
    "validation_score" DOUBLE PRECISION,
    "validation_notes" TEXT,
    "validated_by" TEXT,
    "validated_at" TIMESTAMP(3),
    "meets_requirement" BOOLEAN NOT NULL DEFAULT false,
    "confidence_level" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_findings" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "finding_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "root_cause" TEXT,
    "contributing_factors" JSONB,
    "business_impact" TEXT,
    "technical_impact" TEXT,
    "risk_rating" TEXT,
    "likelihood" TEXT,
    "impact" TEXT,
    "risk_score" DOUBLE PRECISION,
    "recommendation" TEXT,
    "recommended_actions" JSONB,
    "estimated_effort" TEXT,
    "estimated_cost" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assigned_to" TEXT,
    "due_date" TIMESTAMP(3),
    "resolved_date" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "framework_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "assessment_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "section_1_score" DOUBLE PRECISION,
    "section_2_score" DOUBLE PRECISION,
    "section_3_score" DOUBLE PRECISION,
    "section_4_score" DOUBLE PRECISION,
    "section_5_score" DOUBLE PRECISION,
    "section_6_score" DOUBLE PRECISION,
    "section_7_score" DOUBLE PRECISION,
    "section_8_score" DOUBLE PRECISION,
    "section_9_score" DOUBLE PRECISION,
    "section_10_score" DOUBLE PRECISION,
    "section_11_score" DOUBLE PRECISION,
    "section_12_score" DOUBLE PRECISION,
    "section_1_status" TEXT NOT NULL DEFAULT 'not_started',
    "section_2_status" TEXT NOT NULL DEFAULT 'not_started',
    "section_3_status" TEXT NOT NULL DEFAULT 'not_started',
    "section_4_status" TEXT NOT NULL DEFAULT 'not_started',
    "section_5_status" TEXT NOT NULL DEFAULT 'not_started',
    "section_6_status" TEXT NOT NULL DEFAULT 'not_started',
    "section_7_status" TEXT NOT NULL DEFAULT 'not_started',
    "section_8_status" TEXT NOT NULL DEFAULT 'not_started',
    "section_9_status" TEXT NOT NULL DEFAULT 'not_started',
    "section_10_status" TEXT NOT NULL DEFAULT 'not_started',
    "section_11_status" TEXT NOT NULL DEFAULT 'not_started',
    "section_12_status" TEXT NOT NULL DEFAULT 'not_started',
    "start_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "assigned_to" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_applicability_logic" (
    "id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "applicable_sectors" JSONB NOT NULL DEFAULT '[]',
    "excluded_sectors" JSONB NOT NULL DEFAULT '[]',
    "min_employee_count" INTEGER,
    "min_revenue_sar" DOUBLE PRECISION,
    "company_size_filter" JSONB NOT NULL DEFAULT '[]',
    "required_activities" JSONB NOT NULL DEFAULT '[]',
    "any_of_activities" JSONB NOT NULL DEFAULT '[]',
    "requires_online" BOOLEAN NOT NULL DEFAULT false,
    "requires_mobile" BOOLEAN NOT NULL DEFAULT false,
    "requires_cloud" BOOLEAN NOT NULL DEFAULT false,
    "requires_payment" BOOLEAN NOT NULL DEFAULT false,
    "requires_pii" BOOLEAN NOT NULL DEFAULT false,
    "min_data_records" INTEGER,
    "data_sensitivity_min" TEXT,
    "custom_logic" JSONB,
    "dependencies" JSONB,
    "weight_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "risk_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_applicability_logic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_evidence_requirements" (
    "id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "evidence_type" TEXT NOT NULL,
    "evidence_name" TEXT NOT NULL,
    "evidence_name_ar" TEXT,
    "description" TEXT,
    "description_ar" TEXT,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "weight_percentage" DOUBLE PRECISION,
    "validation_criteria" JSONB,
    "tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_evidence_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_scores" (
    "id" TEXT NOT NULL,
    "assessment_control_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "evidence_delivered" BOOLEAN NOT NULL DEFAULT false,
    "evidence_count" INTEGER NOT NULL DEFAULT 0,
    "evidence_quality_avg" DOUBLE PRECISION,
    "maturity_level" INTEGER NOT NULL DEFAULT 0,
    "percentage_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "max_achievable_level" INTEGER,
    "pass_status" TEXT NOT NULL DEFAULT 'not_assessed',
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "minimum_required_score" DOUBLE PRECISION,
    "gap_type" TEXT,
    "gap_severity" TEXT,
    "gap_description" TEXT,
    "recommendation" TEXT,
    "remediation_priority" TEXT,
    "estimated_effort" TEXT,
    "estimated_cost_sar" DOUBLE PRECISION,
    "scored_by" TEXT,
    "scored_at" TIMESTAMP(3),
    "scoring_confidence" DOUBLE PRECISION,
    "scoring_rationale" TEXT,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "validated_by" TEXT,
    "validated_at" TIMESTAMP(3),
    "validation_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assessment_controlsId" TEXT,

    CONSTRAINT "control_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_validation" (
    "id" TEXT NOT NULL,
    "evidence_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "criteria_name" TEXT NOT NULL,
    "criteria_description" TEXT,
    "expected_value" TEXT,
    "actual_value" TEXT,
    "is_met" BOOLEAN NOT NULL DEFAULT false,
    "score" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "ai_validated" BOOLEAN NOT NULL DEFAULT false,
    "ai_confidence" DOUBLE PRECISION,
    "ai_reasoning" TEXT,
    "manual_override" BOOLEAN NOT NULL DEFAULT false,
    "override_reason" TEXT,
    "override_by" TEXT,
    "override_at" TIMESTAMP(3),
    "validated_by" TEXT,
    "validated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_validation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_up_schedule" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT,
    "remediation_plan_id" TEXT,
    "remediation_task_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "follow_up_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "completed_date" TIMESTAMP(3),
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_pattern" TEXT,
    "next_occurrence" TIMESTAMP(3),
    "responsible_person" TEXT,
    "participants" JSONB,
    "notify_users" JSONB,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "outcome" TEXT,
    "findings" JSONB,
    "action_items" JSONB,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "reminder_date" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_up_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "framework_controls" (
    "id" TEXT NOT NULL,
    "framework_id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "sequence" INTEGER,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "framework_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gap_analysis" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "framework_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "total_controls" INTEGER NOT NULL DEFAULT 0,
    "compliant_controls" INTEGER NOT NULL DEFAULT 0,
    "partial_controls" INTEGER NOT NULL DEFAULT 0,
    "non_compliant_controls" INTEGER NOT NULL DEFAULT 0,
    "not_applicable_controls" INTEGER NOT NULL DEFAULT 0,
    "overall_compliance_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "target_compliance_score" DOUBLE PRECISION,
    "gap_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "category_scores" JSONB,
    "domain_scores" JSONB,
    "risk_level_scores" JSONB,
    "critical_gaps" INTEGER NOT NULL DEFAULT 0,
    "high_priority_gaps" INTEGER NOT NULL DEFAULT 0,
    "medium_priority_gaps" INTEGER NOT NULL DEFAULT 0,
    "low_priority_gaps" INTEGER NOT NULL DEFAULT 0,
    "improvement_trend" TEXT,
    "previous_score" DOUBLE PRECISION,
    "score_change" DOUBLE PRECISION,
    "estimated_closure_months" INTEGER,
    "estimated_effort_days" INTEGER,
    "estimated_cost_sar" DOUBLE PRECISION,
    "executive_summary" TEXT,
    "key_findings" JSONB,
    "recommendations" JSONB,
    "analyzed_by" TEXT,
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gap_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grc_controls" (
    "id" TEXT NOT NULL,
    "framework_id" TEXT,
    "control_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "description" TEXT,
    "description_ar" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "risk_level" TEXT,
    "control_type" TEXT,
    "implementation_status" TEXT NOT NULL DEFAULT 'not_implemented',
    "maturity_level" INTEGER NOT NULL DEFAULT 0,
    "evidence_required" BOOLEAN NOT NULL DEFAULT false,
    "testing_frequency" TEXT,
    "implementation_guidance" TEXT,
    "implementation_guidance_ar" TEXT,
    "related_regulations" JSONB NOT NULL DEFAULT '[]',
    "tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grc_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grc_frameworks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "description" TEXT,
    "description_ar" TEXT,
    "version" TEXT,
    "effective_date" TIMESTAMP(3),
    "authority" TEXT,
    "authority_ar" TEXT,
    "scope" TEXT,
    "jurisdiction" TEXT,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "industry_sector" TEXT,
    "compliance_level" TEXT,
    "total_controls" INTEGER NOT NULL DEFAULT 0,
    "tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grc_frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "license_key" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "issued_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "features" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "message" TEXT NOT NULL,
    "message_ar" TEXT,
    "user_id" TEXT NOT NULL,
    "user_email" TEXT,
    "user_name" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "channels" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "read_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "organization_id" TEXT,
    "assessment_id" TEXT,
    "task_id" TEXT,
    "control_id" TEXT,
    "action_url" TEXT,
    "action_label" TEXT,
    "action_label_ar" TEXT,
    "requires_action" BOOLEAN NOT NULL DEFAULT false,
    "action_taken" BOOLEAN NOT NULL DEFAULT false,
    "action_taken_at" TIMESTAMP(3),
    "metadata" JSONB,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_profile_factors" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "sub_sector" TEXT,
    "legal_type" TEXT NOT NULL,
    "company_size" TEXT NOT NULL,
    "employee_count" INTEGER,
    "annual_revenue_sar" DOUBLE PRECISION,
    "total_assets_sar" DOUBLE PRECISION,
    "market_cap_sar" DOUBLE PRECISION,
    "business_activities" JSONB NOT NULL DEFAULT '[]',
    "service_types" JSONB NOT NULL DEFAULT '[]',
    "product_categories" JSONB NOT NULL DEFAULT '[]',
    "operates_regions" JSONB NOT NULL DEFAULT '[]',
    "has_international" BOOLEAN NOT NULL DEFAULT false,
    "target_markets" JSONB NOT NULL DEFAULT '[]',
    "data_sensitivity_level" TEXT,
    "customer_data_records" INTEGER,
    "stores_pii" BOOLEAN NOT NULL DEFAULT false,
    "processes_payments" BOOLEAN NOT NULL DEFAULT false,
    "has_online_platform" BOOLEAN NOT NULL DEFAULT false,
    "has_mobile_app" BOOLEAN NOT NULL DEFAULT false,
    "uses_cloud_services" BOOLEAN NOT NULL DEFAULT false,
    "existing_certifications" JSONB NOT NULL DEFAULT '[]',
    "previous_audits" JSONB NOT NULL DEFAULT '[]',
    "compliance_maturity" TEXT,
    "risk_appetite" TEXT,
    "critical_infrastructure" BOOLEAN NOT NULL DEFAULT false,
    "handles_govt_data" BOOLEAN NOT NULL DEFAULT false,
    "applicable_frameworks" JSONB,
    "last_calculated" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_profile_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_profiles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_count" INTEGER,
    "annual_revenue_sar" DOUBLE PRECISION,
    "market_cap_sar" DOUBLE PRECISION,
    "organizational_structure" TEXT,
    "number_of_branches" INTEGER,
    "international_presence" BOOLEAN NOT NULL DEFAULT false,
    "countries_operating_in" JSONB,
    "primary_business_activities" JSONB,
    "secondary_activities" JSONB,
    "business_model" TEXT,
    "customer_segments" JSONB,
    "legal_entity_type" TEXT,
    "commercial_registration" TEXT,
    "license_type" TEXT,
    "licensing_authority" TEXT,
    "regulated_activities" JSONB,
    "data_classification_level" TEXT,
    "processes_pii" BOOLEAN NOT NULL DEFAULT false,
    "pii_volume" TEXT,
    "processes_financial_data" BOOLEAN NOT NULL DEFAULT false,
    "processes_health_data" BOOLEAN NOT NULL DEFAULT false,
    "data_residency_requirements" JSONB,
    "cross_border_data_transfer" BOOLEAN NOT NULL DEFAULT false,
    "has_online_services" BOOLEAN NOT NULL DEFAULT false,
    "has_mobile_app" BOOLEAN NOT NULL DEFAULT false,
    "has_api_integrations" BOOLEAN NOT NULL DEFAULT false,
    "cloud_usage" TEXT,
    "cloud_providers" JSONB,
    "hosts_critical_infrastructure" BOOLEAN NOT NULL DEFAULT false,
    "processes_payments" BOOLEAN NOT NULL DEFAULT false,
    "payment_volume_daily" INTEGER,
    "payment_methods" JSONB,
    "accepts_international_payments" BOOLEAN NOT NULL DEFAULT false,
    "currency_operations" JSONB,
    "current_security_maturity" TEXT,
    "existing_certifications" JSONB,
    "security_team_size" INTEGER,
    "dedicated_compliance_officer" BOOLEAN NOT NULL DEFAULT false,
    "incident_response_plan" BOOLEAN NOT NULL DEFAULT false,
    "last_security_audit_date" TIMESTAMP(3),
    "risk_appetite" TEXT,
    "cyber_insurance" BOOLEAN NOT NULL DEFAULT false,
    "previous_incidents" INTEGER NOT NULL DEFAULT 0,
    "high_risk_activities" JSONB,
    "number_of_vendors" INTEGER,
    "critical_vendors" INTEGER,
    "outsourced_services" JSONB,
    "third_party_risk_mgmt" BOOLEAN NOT NULL DEFAULT false,
    "total_customers" INTEGER,
    "active_users_monthly" INTEGER,
    "customer_types" JSONB,
    "high_net_worth_clients" BOOLEAN NOT NULL DEFAULT false,
    "government_contracts" BOOLEAN NOT NULL DEFAULT false,
    "mandatory_frameworks" JSONB,
    "recommended_frameworks" JSONB,
    "voluntary_frameworks" JSONB,
    "ai_analysis_completed" BOOLEAN NOT NULL DEFAULT false,
    "ai_analysis_date" TIMESTAMP(3),
    "ai_confidence_score" DOUBLE PRECISION,
    "ai_recommendations" JSONB,
    "profile_completeness" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "last_reviewed_date" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organizationsId" TEXT,

    CONSTRAINT "organization_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "registration_number" TEXT,
    "sector" TEXT,
    "country" TEXT,
    "city" TEXT,
    "address" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "license_type" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_applicability_rules" (
    "id" TEXT NOT NULL,
    "framework_id" TEXT NOT NULL,
    "regulator_code" TEXT NOT NULL,
    "mandatory_sectors" JSONB NOT NULL DEFAULT '[]',
    "optional_sectors" JSONB NOT NULL DEFAULT '[]',
    "excluded_sectors" JSONB NOT NULL DEFAULT '[]',
    "company_size_min" INTEGER,
    "company_size_max" INTEGER,
    "revenue_threshold_min" DOUBLE PRECISION,
    "revenue_threshold_max" DOUBLE PRECISION,
    "legal_types" JSONB NOT NULL DEFAULT '[]',
    "business_activities" JSONB NOT NULL DEFAULT '[]',
    "geographic_scope" TEXT,
    "data_sensitivity" TEXT,
    "customer_data_volume" TEXT,
    "has_online_services" BOOLEAN NOT NULL DEFAULT false,
    "processes_payments" BOOLEAN NOT NULL DEFAULT false,
    "stores_pii" BOOLEAN NOT NULL DEFAULT false,
    "critical_infrastructure" BOOLEAN NOT NULL DEFAULT false,
    "rule_logic" JSONB,
    "effective_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulatory_applicability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remediation_plans" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "gap_analysis_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "plan_description" TEXT,
    "plan_type" TEXT,
    "target_frameworks" JSONB,
    "target_controls" JSONB,
    "addresses_findings" JSONB,
    "start_date" TIMESTAMP(3),
    "target_completion" TIMESTAMP(3),
    "actual_completion" TIMESTAMP(3),
    "estimated_budget_sar" DOUBLE PRECISION,
    "actual_budget_sar" DOUBLE PRECISION,
    "estimated_effort_days" INTEGER,
    "actual_effort_days" INTEGER,
    "required_resources" JSONB,
    "priority_level" TEXT NOT NULL DEFAULT 'medium',
    "phase" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "progress_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_tasks" INTEGER NOT NULL DEFAULT 0,
    "completed_tasks" INTEGER NOT NULL DEFAULT 0,
    "overdue_tasks" INTEGER NOT NULL DEFAULT 0,
    "plan_owner" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "expected_risk_reduction" DOUBLE PRECISION,
    "expected_compliance_improvement" DOUBLE PRECISION,
    "business_benefits" JSONB,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remediation_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remediation_tasks" (
    "id" TEXT NOT NULL,
    "remediation_plan_id" TEXT NOT NULL,
    "finding_id" TEXT,
    "control_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "task_title" TEXT NOT NULL,
    "task_description" TEXT,
    "task_type" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "sequence_number" INTEGER,
    "depends_on_tasks" JSONB,
    "planned_start" TIMESTAMP(3),
    "planned_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "estimated_hours" DOUBLE PRECISION,
    "actual_hours" DOUBLE PRECISION,
    "estimated_cost" DOUBLE PRECISION,
    "actual_cost" DOUBLE PRECISION,
    "assigned_to" TEXT,
    "assigned_team" TEXT,
    "collaborators" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocker_reason" TEXT,
    "is_overdue" BOOLEAN NOT NULL DEFAULT false,
    "completion_evidence" TEXT,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "updates" JSONB,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remediation_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sector_controls" (
    "id" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "applicability" TEXT,
    "risk_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sector_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "billing_cycle" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "payment_method" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "task_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "description" TEXT,
    "description_ar" TEXT,
    "organization_id" TEXT,
    "assessment_id" TEXT,
    "control_id" TEXT,
    "finding_id" TEXT,
    "remediation_plan_id" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "assigned_to" TEXT,
    "assigned_to_email" TEXT,
    "assigned_to_name" TEXT,
    "assigned_team" TEXT,
    "collaborators" JSONB,
    "due_date" TIMESTAMP(3),
    "start_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "estimated_hours" DOUBLE PRECISION,
    "actual_hours" DOUBLE PRECISION,
    "depends_on_tasks" JSONB,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocker_reason" TEXT,
    "notify_on_due" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_complete" BOOLEAN NOT NULL DEFAULT true,
    "last_reminder_sent" TIMESTAMP(3),
    "completion_notes" TEXT,
    "completion_evidence" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_requests" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "preferred_date" DATE,
    "preferred_time" VARCHAR(20),
    "access_type" VARCHAR(20) NOT NULL,
    "package" VARCHAR(100),
    "features" JSONB,
    "message" TEXT,
    "lead_score" INTEGER DEFAULT 0,
    "status" VARCHAR(20) DEFAULT 'pending',
    "approval_token" TEXT,
    "approved_at" TIMESTAMP(6),
    "rejected_at" TIMESTAMP(6),
    "rejection_reason" TEXT,
    "confirmed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_module_idx" ON "activity_logs"("module");

-- CreateIndex
CREATE INDEX "activity_logs_tenant_id_idx" ON "activity_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "applicable_frameworks_matrix_framework_id_idx" ON "applicable_frameworks_matrix"("framework_id");

-- CreateIndex
CREATE INDEX "applicable_frameworks_matrix_is_applicable_idx" ON "applicable_frameworks_matrix"("is_applicable");

-- CreateIndex
CREATE INDEX "applicable_frameworks_matrix_is_mandatory_idx" ON "applicable_frameworks_matrix"("is_mandatory");

-- CreateIndex
CREATE INDEX "applicable_frameworks_matrix_organization_id_idx" ON "applicable_frameworks_matrix"("organization_id");

-- CreateIndex
CREATE INDEX "applicable_frameworks_matrix_tenant_id_idx" ON "applicable_frameworks_matrix"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "applicable_frameworks_matrix_organization_id_framework_id_key" ON "applicable_frameworks_matrix"("organization_id", "framework_id");

-- CreateIndex
CREATE INDEX "assessment_controls_assessment_id_idx" ON "assessment_controls"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_controls_control_id_idx" ON "assessment_controls"("control_id");

-- CreateIndex
CREATE INDEX "assessment_controls_tenant_id_idx" ON "assessment_controls"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_controls_assessment_id_control_id_key" ON "assessment_controls"("assessment_id", "control_id");

-- CreateIndex
CREATE INDEX "assessment_evidence_assessment_id_idx" ON "assessment_evidence"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_evidence_control_id_idx" ON "assessment_evidence"("control_id");

-- CreateIndex
CREATE INDEX "assessment_evidence_tenant_id_idx" ON "assessment_evidence"("tenant_id");

-- CreateIndex
CREATE INDEX "assessment_evidence_validation_status_idx" ON "assessment_evidence"("validation_status");

-- CreateIndex
CREATE INDEX "assessment_findings_assessment_id_idx" ON "assessment_findings"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_findings_control_id_idx" ON "assessment_findings"("control_id");

-- CreateIndex
CREATE INDEX "assessment_findings_finding_type_idx" ON "assessment_findings"("finding_type");

-- CreateIndex
CREATE INDEX "assessment_findings_severity_idx" ON "assessment_findings"("severity");

-- CreateIndex
CREATE INDEX "assessment_findings_status_idx" ON "assessment_findings"("status");

-- CreateIndex
CREATE INDEX "assessment_findings_tenant_id_idx" ON "assessment_findings"("tenant_id");

-- CreateIndex
CREATE INDEX "assessments_framework_id_idx" ON "assessments"("framework_id");

-- CreateIndex
CREATE INDEX "assessments_organization_id_idx" ON "assessments"("organization_id");

-- CreateIndex
CREATE INDEX "assessments_status_idx" ON "assessments"("status");

-- CreateIndex
CREATE INDEX "assessments_tenant_id_idx" ON "assessments"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "control_applicability_logic_control_id_idx" ON "control_applicability_logic"("control_id");

-- CreateIndex
CREATE INDEX "control_applicability_logic_tenant_id_idx" ON "control_applicability_logic"("tenant_id");

-- CreateIndex
CREATE INDEX "control_evidence_requirements_control_id_idx" ON "control_evidence_requirements"("control_id");

-- CreateIndex
CREATE INDEX "control_evidence_requirements_tenant_id_idx" ON "control_evidence_requirements"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_scores_assessment_control_id_key" ON "control_scores"("assessment_control_id");

-- CreateIndex
CREATE INDEX "control_scores_assessment_id_idx" ON "control_scores"("assessment_id");

-- CreateIndex
CREATE INDEX "control_scores_control_id_idx" ON "control_scores"("control_id");

-- CreateIndex
CREATE INDEX "control_scores_evidence_delivered_idx" ON "control_scores"("evidence_delivered");

-- CreateIndex
CREATE INDEX "control_scores_maturity_level_idx" ON "control_scores"("maturity_level");

-- CreateIndex
CREATE INDEX "control_scores_pass_status_idx" ON "control_scores"("pass_status");

-- CreateIndex
CREATE INDEX "control_scores_tenant_id_idx" ON "control_scores"("tenant_id");

-- CreateIndex
CREATE INDEX "evidence_validation_evidence_id_idx" ON "evidence_validation"("evidence_id");

-- CreateIndex
CREATE INDEX "evidence_validation_tenant_id_idx" ON "evidence_validation"("tenant_id");

-- CreateIndex
CREATE INDEX "follow_up_schedule_assessment_id_idx" ON "follow_up_schedule"("assessment_id");

-- CreateIndex
CREATE INDEX "follow_up_schedule_remediation_plan_id_idx" ON "follow_up_schedule"("remediation_plan_id");

-- CreateIndex
CREATE INDEX "follow_up_schedule_remediation_task_id_idx" ON "follow_up_schedule"("remediation_task_id");

-- CreateIndex
CREATE INDEX "follow_up_schedule_scheduled_date_idx" ON "follow_up_schedule"("scheduled_date");

-- CreateIndex
CREATE INDEX "follow_up_schedule_status_idx" ON "follow_up_schedule"("status");

-- CreateIndex
CREATE INDEX "follow_up_schedule_tenant_id_idx" ON "follow_up_schedule"("tenant_id");

-- CreateIndex
CREATE INDEX "framework_controls_framework_id_idx" ON "framework_controls"("framework_id");

-- CreateIndex
CREATE INDEX "framework_controls_tenant_id_idx" ON "framework_controls"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "framework_controls_framework_id_control_id_key" ON "framework_controls"("framework_id", "control_id");

-- CreateIndex
CREATE INDEX "gap_analysis_assessment_id_idx" ON "gap_analysis"("assessment_id");

-- CreateIndex
CREATE INDEX "gap_analysis_framework_id_idx" ON "gap_analysis"("framework_id");

-- CreateIndex
CREATE INDEX "gap_analysis_tenant_id_idx" ON "gap_analysis"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gap_analysis_assessment_id_framework_id_key" ON "gap_analysis"("assessment_id", "framework_id");

-- CreateIndex
CREATE INDEX "grc_controls_category_idx" ON "grc_controls"("category");

-- CreateIndex
CREATE INDEX "grc_controls_control_id_idx" ON "grc_controls"("control_id");

-- CreateIndex
CREATE INDEX "grc_controls_framework_id_idx" ON "grc_controls"("framework_id");

-- CreateIndex
CREATE INDEX "grc_controls_risk_level_idx" ON "grc_controls"("risk_level");

-- CreateIndex
CREATE INDEX "grc_controls_tenant_id_idx" ON "grc_controls"("tenant_id");

-- CreateIndex
CREATE INDEX "grc_frameworks_jurisdiction_idx" ON "grc_frameworks"("jurisdiction");

-- CreateIndex
CREATE INDEX "grc_frameworks_tenant_id_idx" ON "grc_frameworks"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_license_key_key" ON "licenses"("license_key");

-- CreateIndex
CREATE INDEX "licenses_status_idx" ON "licenses"("status");

-- CreateIndex
CREATE INDEX "licenses_tenant_id_idx" ON "licenses"("tenant_id");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notifications_notification_type_idx" ON "notifications"("notification_type");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_read_at_idx" ON "notifications"("read_at");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_idx" ON "notifications"("tenant_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_profile_factors_organization_id_key" ON "organization_profile_factors"("organization_id");

-- CreateIndex
CREATE INDEX "organization_profile_factors_company_size_idx" ON "organization_profile_factors"("company_size");

-- CreateIndex
CREATE INDEX "organization_profile_factors_organization_id_idx" ON "organization_profile_factors"("organization_id");

-- CreateIndex
CREATE INDEX "organization_profile_factors_sector_idx" ON "organization_profile_factors"("sector");

-- CreateIndex
CREATE INDEX "organization_profile_factors_tenant_id_idx" ON "organization_profile_factors"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_profiles_organization_id_key" ON "organization_profiles"("organization_id");

-- CreateIndex
CREATE INDEX "organization_profiles_data_classification_level_idx" ON "organization_profiles"("data_classification_level");

-- CreateIndex
CREATE INDEX "organization_profiles_employee_count_idx" ON "organization_profiles"("employee_count");

-- CreateIndex
CREATE INDEX "organization_profiles_organization_id_idx" ON "organization_profiles"("organization_id");

-- CreateIndex
CREATE INDEX "organization_profiles_tenant_id_idx" ON "organization_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "organizations_sector_idx" ON "organizations"("sector");

-- CreateIndex
CREATE INDEX "organizations_tenant_id_idx" ON "organizations"("tenant_id");

-- CreateIndex
CREATE INDEX "regulatory_applicability_rules_framework_id_idx" ON "regulatory_applicability_rules"("framework_id");

-- CreateIndex
CREATE INDEX "regulatory_applicability_rules_regulator_code_idx" ON "regulatory_applicability_rules"("regulator_code");

-- CreateIndex
CREATE INDEX "regulatory_applicability_rules_tenant_id_idx" ON "regulatory_applicability_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "remediation_plans_assessment_id_idx" ON "remediation_plans"("assessment_id");

-- CreateIndex
CREATE INDEX "remediation_plans_gap_analysis_id_idx" ON "remediation_plans"("gap_analysis_id");

-- CreateIndex
CREATE INDEX "remediation_plans_status_idx" ON "remediation_plans"("status");

-- CreateIndex
CREATE INDEX "remediation_plans_tenant_id_idx" ON "remediation_plans"("tenant_id");

-- CreateIndex
CREATE INDEX "remediation_tasks_assigned_to_idx" ON "remediation_tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "remediation_tasks_control_id_idx" ON "remediation_tasks"("control_id");

-- CreateIndex
CREATE INDEX "remediation_tasks_finding_id_idx" ON "remediation_tasks"("finding_id");

-- CreateIndex
CREATE INDEX "remediation_tasks_remediation_plan_id_idx" ON "remediation_tasks"("remediation_plan_id");

-- CreateIndex
CREATE INDEX "remediation_tasks_status_idx" ON "remediation_tasks"("status");

-- CreateIndex
CREATE INDEX "remediation_tasks_tenant_id_idx" ON "remediation_tasks"("tenant_id");

-- CreateIndex
CREATE INDEX "sector_controls_sector_idx" ON "sector_controls"("sector");

-- CreateIndex
CREATE INDEX "sector_controls_tenant_id_idx" ON "sector_controls"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "sector_controls_sector_control_id_key" ON "sector_controls"("sector", "control_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_tenant_id_idx" ON "subscriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "tasks_assessment_id_idx" ON "tasks"("assessment_id");

-- CreateIndex
CREATE INDEX "tasks_assigned_to_idx" ON "tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");

-- CreateIndex
CREATE INDEX "tasks_organization_id_idx" ON "tasks"("organization_id");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_task_type_idx" ON "tasks"("task_type");

-- CreateIndex
CREATE INDEX "tasks_tenant_id_idx" ON "tasks"("tenant_id");

-- AddForeignKey
ALTER TABLE "control_scores" ADD CONSTRAINT "control_scores_assessment_controlsId_fkey" FOREIGN KEY ("assessment_controlsId") REFERENCES "assessment_controls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_requests" ADD CONSTRAINT "demo_requests_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_requests" ADD CONSTRAINT "demo_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grc_controls" ADD CONSTRAINT "grc_controls_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "grc_frameworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_profiles" ADD CONSTRAINT "organization_profiles_organizationsId_fkey" FOREIGN KEY ("organizationsId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_invitations" ADD CONSTRAINT "partner_invitations_accepted_user_id_fkey" FOREIGN KEY ("accepted_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_invitations" ADD CONSTRAINT "partner_invitations_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_invitations" ADD CONSTRAINT "partner_invitations_partner_tenant_id_fkey" FOREIGN KEY ("partner_tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poc_requests" ADD CONSTRAINT "poc_requests_owner_internal_user_id_fkey" FOREIGN KEY ("owner_internal_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poc_requests" ADD CONSTRAINT "poc_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_demo_requests_created_at" RENAME TO "demo_requests_created_at_idx";

-- RenameIndex
ALTER INDEX "idx_demo_requests_email" RENAME TO "demo_requests_email_idx";

-- RenameIndex
ALTER INDEX "idx_demo_requests_status" RENAME TO "demo_requests_status_idx";

-- RenameIndex
ALTER INDEX "idx_partner_inv_email" RENAME TO "partner_invitations_email_idx";

-- RenameIndex
ALTER INDEX "idx_partner_inv_partner" RENAME TO "partner_invitations_partner_tenant_id_idx";

-- RenameIndex
ALTER INDEX "idx_partner_inv_status" RENAME TO "partner_invitations_status_idx";

-- RenameIndex
ALTER INDEX "idx_poc_requests_company" RENAME TO "poc_requests_company_name_idx";

-- RenameIndex
ALTER INDEX "idx_poc_requests_created_at" RENAME TO "poc_requests_created_at_idx";

-- RenameIndex
ALTER INDEX "idx_poc_requests_status" RENAME TO "poc_requests_status_idx";

-- RenameIndex
ALTER INDEX "idx_tenants_status" RENAME TO "tenants_status_idx";

-- RenameIndex
ALTER INDEX "idx_tenants_type" RENAME TO "tenants_type_idx";

-- RenameIndex
ALTER INDEX "idx_users_email_global" RENAME TO "users_email_idx";

-- RenameIndex
ALTER INDEX "idx_users_tenant" RENAME TO "users_tenant_id_idx";

-- RenameIndex
ALTER INDEX "ux_users_tenant_email" RENAME TO "users_tenant_id_email_key";
