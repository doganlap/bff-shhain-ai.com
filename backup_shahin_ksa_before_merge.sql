--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: cleanup_expired_sandboxes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_expired_sandboxes() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Deactivate expired sandbox sessions
  UPDATE sandbox_sessions 
  SET is_active = FALSE 
  WHERE expires_at < NOW() AND is_active = TRUE;
  
  -- Deactivate expired sandbox users
  UPDATE users 
  SET is_active = FALSE 
  WHERE is_sandbox = TRUE 
    AND sandbox_expires_at < NOW() 
    AND is_active = TRUE;
    
  -- Note: Actual deletion is done separately to preserve feedback
  -- DELETE FROM users WHERE is_sandbox = TRUE AND sandbox_expires_at < NOW() - INTERVAL '30 days';
END;
$$;


ALTER FUNCTION public.cleanup_expired_sandboxes() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id integer NOT NULL,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: TABLE activity_logs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.activity_logs IS 'Audit trail for all system activities';


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_events (
    id integer NOT NULL,
    event_type character varying(100) NOT NULL,
    event_name character varying(255) NOT NULL,
    user_id integer,
    session_id character varying(255),
    properties jsonb DEFAULT '{}'::jsonb,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.analytics_events OWNER TO postgres;

--
-- Name: TABLE analytics_events; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.analytics_events IS 'Analytics and user behavior tracking';


--
-- Name: analytics_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analytics_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analytics_events_id_seq OWNER TO postgres;

--
-- Name: analytics_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analytics_events_id_seq OWNED BY public.analytics_events.id;


--
-- Name: assessment_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_comments (
    id integer NOT NULL,
    assessment_id integer,
    control_id integer,
    user_id integer,
    comment text NOT NULL,
    comment_type character varying(50) DEFAULT 'general'::character varying,
    is_internal boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT assessment_comments_comment_type_check CHECK (((comment_type)::text = ANY ((ARRAY['general'::character varying, 'issue'::character varying, 'recommendation'::character varying, 'evidence'::character varying, 'remediation'::character varying])::text[])))
);


ALTER TABLE public.assessment_comments OWNER TO postgres;

--
-- Name: assessment_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessment_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessment_comments_id_seq OWNER TO postgres;

--
-- Name: assessment_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessment_comments_id_seq OWNED BY public.assessment_comments.id;


--
-- Name: assessment_controls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_controls (
    id integer NOT NULL,
    assessment_id integer,
    control_id integer,
    status character varying(50) DEFAULT 'not_started'::character varying,
    implementation_status character varying(50) DEFAULT 'not_implemented'::character varying,
    compliance_status character varying(50) DEFAULT 'unknown'::character varying,
    risk_rating character varying(20) DEFAULT 'unknown'::character varying,
    score numeric(5,2),
    assigned_to integer,
    implementation_notes text,
    evidence_provided text,
    evidence_files jsonb DEFAULT '[]'::jsonb,
    remediation_plan text,
    remediation_due_date date,
    last_reviewed_date date,
    reviewed_by integer,
    is_demo boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT assessment_controls_compliance_status_check CHECK (((compliance_status)::text = ANY ((ARRAY['compliant'::character varying, 'non_compliant'::character varying, 'partially_compliant'::character varying, 'unknown'::character varying])::text[]))),
    CONSTRAINT assessment_controls_implementation_status_check CHECK (((implementation_status)::text = ANY ((ARRAY['not_implemented'::character varying, 'partially_implemented'::character varying, 'implemented'::character varying, 'not_applicable'::character varying])::text[]))),
    CONSTRAINT assessment_controls_risk_rating_check CHECK (((risk_rating)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying, 'unknown'::character varying])::text[]))),
    CONSTRAINT assessment_controls_status_check CHECK (((status)::text = ANY ((ARRAY['not_started'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'not_applicable'::character varying, 'deferred'::character varying])::text[])))
);


ALTER TABLE public.assessment_controls OWNER TO postgres;

--
-- Name: assessment_controls_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessment_controls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessment_controls_id_seq OWNER TO postgres;

--
-- Name: assessment_controls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessment_controls_id_seq OWNED BY public.assessment_controls.id;


--
-- Name: assessment_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_history (
    id integer NOT NULL,
    assessment_id integer,
    control_id integer,
    user_id integer,
    action character varying(100) NOT NULL,
    field_name character varying(100),
    old_value text,
    new_value text,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.assessment_history OWNER TO postgres;

--
-- Name: assessment_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessment_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessment_history_id_seq OWNER TO postgres;

--
-- Name: assessment_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessment_history_id_seq OWNED BY public.assessment_history.id;


--
-- Name: assessment_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid,
    control_id uuid,
    compliance_score numeric(5,2),
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assessment_responses OWNER TO postgres;

--
-- Name: assessment_workflow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_workflow (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid,
    workflow_type character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    assigned_to uuid,
    assigned_by uuid,
    delegated_from uuid,
    due_date timestamp without time zone,
    approved_at timestamp without time zone,
    approved_by uuid,
    rejected_at timestamp without time zone,
    rejected_by uuid,
    rejection_reason text,
    comments text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assessment_workflow OWNER TO postgres;

--
-- Name: assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessments (
    id integer NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    framework_id integer,
    organization_id integer,
    created_by integer,
    assigned_to jsonb DEFAULT '[]'::jsonb,
    status character varying(50) DEFAULT 'draft'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    start_date date,
    due_date date,
    completed_date date,
    progress integer DEFAULT 0,
    risk_level character varying(20) DEFAULT 'unknown'::character varying,
    overall_score numeric(5,2),
    compliance_percentage numeric(5,2),
    controls_total integer DEFAULT 0,
    controls_completed integer DEFAULT 0,
    controls_passed integer DEFAULT 0,
    controls_failed integer DEFAULT 0,
    controls_not_applicable integer DEFAULT 0,
    is_demo boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    finance_database character varying(50) DEFAULT 'grc_master'::character varying,
    auth_database character varying(50) DEFAULT 'shahin_access_control'::character varying,
    created_by_user_id uuid,
    assigned_to_user_id uuid,
    tenant_id uuid,
    CONSTRAINT assessments_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT assessments_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT assessments_risk_level_check CHECK (((risk_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying, 'unknown'::character varying])::text[]))),
    CONSTRAINT assessments_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'in_progress'::character varying, 'review'::character varying, 'completed'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.assessments OWNER TO postgres;

--
-- Name: assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessments_id_seq OWNER TO postgres;

--
-- Name: assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessments_id_seq OWNED BY public.assessments.id;


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    company character varying(255),
    subject character varying(500) NOT NULL,
    message text NOT NULL,
    type character varying(50) DEFAULT 'general'::character varying,
    status character varying(50) DEFAULT 'new'::character varying,
    assigned_to integer,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contact_messages OWNER TO postgres;

--
-- Name: TABLE contact_messages; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.contact_messages IS 'Stores general contact form submissions from landing page';


--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_messages_id_seq OWNER TO postgres;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- Name: framework_controls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.framework_controls (
    id integer NOT NULL,
    framework_id integer,
    control_id character varying(50) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    category character varying(100),
    subcategory character varying(100),
    control_type character varying(50) DEFAULT 'requirement'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    implementation_guidance text,
    evidence_requirements jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT framework_controls_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[])))
);


ALTER TABLE public.framework_controls OWNER TO postgres;

--
-- Name: framework_controls_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.framework_controls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.framework_controls_id_seq OWNER TO postgres;

--
-- Name: framework_controls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.framework_controls_id_seq OWNED BY public.framework_controls.id;


--
-- Name: frameworks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frameworks (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    version character varying(50),
    description text,
    category character varying(100),
    authority character varying(255),
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.frameworks OWNER TO postgres;

--
-- Name: frameworks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frameworks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frameworks_id_seq OWNER TO postgres;

--
-- Name: frameworks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frameworks_id_seq OWNED BY public.frameworks.id;


--
-- Name: grc_controls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grc_controls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    framework_id uuid,
    control_id character varying(100) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    control_type character varying(100) DEFAULT 'policy'::character varying,
    priority_level character varying(50) DEFAULT 'medium'::character varying,
    implementation_guidance text,
    testing_procedures text,
    sector_specific_notes text,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.grc_controls OWNER TO postgres;

--
-- Name: grc_frameworks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grc_frameworks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    version character varying(50),
    description text,
    sector_applicability text[],
    complexity_level integer DEFAULT 3,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.grc_frameworks OWNER TO postgres;

--
-- Name: landing_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.landing_content (
    id integer NOT NULL,
    hero_title text NOT NULL,
    hero_subtitle text,
    active boolean DEFAULT true,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.landing_content OWNER TO postgres;

--
-- Name: landing_content_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.landing_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.landing_content_id_seq OWNER TO postgres;

--
-- Name: landing_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.landing_content_id_seq OWNED BY public.landing_content.id;


--
-- Name: landing_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.landing_requests (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    company character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    preferred_date date,
    preferred_time character varying(20),
    access_type character varying(20) NOT NULL,
    package character varying(100),
    features jsonb,
    message text,
    lead_score integer DEFAULT 0,
    status character varying(20) DEFAULT 'pending'::character varying,
    approval_token text,
    approved_at timestamp without time zone,
    rejected_at timestamp without time zone,
    rejection_reason text,
    confirmed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sandbox_user_id integer,
    CONSTRAINT landing_requests_access_type_check CHECK (((access_type)::text = ANY ((ARRAY['demo'::character varying, 'poc'::character varying])::text[]))),
    CONSTRAINT landing_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'confirmed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.landing_requests OWNER TO postgres;

--
-- Name: landing_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.landing_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.landing_requests_id_seq OWNER TO postgres;

--
-- Name: landing_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.landing_requests_id_seq OWNED BY public.landing_requests.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    filename character varying(255) NOT NULL,
    executed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) DEFAULT 'info'::character varying,
    entity_type character varying(50),
    entity_id integer,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['info'::character varying, 'success'::character varying, 'warning'::character varying, 'error'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notifications IS 'User notifications and alerts';


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(100) DEFAULT 'company'::character varying,
    country character varying(100),
    industry character varying(100),
    size character varying(50),
    website character varying(255),
    description text,
    logo_url text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_demo boolean DEFAULT false
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: TABLE organizations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.organizations IS 'Organizations/companies using the platform';


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizations_id_seq OWNER TO postgres;

--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: project_milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_milestones (
    id integer NOT NULL,
    project_id integer,
    name character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'pending'::character varying,
    due_date date,
    completed_date date,
    progress integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT project_milestones_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT project_milestones_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in-progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.project_milestones OWNER TO postgres;

--
-- Name: project_milestones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_milestones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_milestones_id_seq OWNER TO postgres;

--
-- Name: project_milestones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_milestones_id_seq OWNED BY public.project_milestones.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'planning'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    start_date date,
    end_date date,
    actual_end_date date,
    progress integer DEFAULT 0,
    budget numeric(15,2),
    spent numeric(15,2) DEFAULT 0,
    organization_id integer,
    team_id integer,
    project_manager_id integer,
    technologies jsonb DEFAULT '[]'::jsonb,
    tags jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT projects_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT projects_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT projects_status_check CHECK (((status)::text = ANY ((ARRAY['planning'::character varying, 'active'::character varying, 'on-hold'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.projects IS 'Projects managed by teams';


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: sandbox_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sandbox_feedback (
    id integer NOT NULL,
    session_id integer,
    rating integer,
    experience character varying(50),
    features jsonb DEFAULT '[]'::jsonb,
    issues jsonb DEFAULT '[]'::jsonb,
    suggestions text,
    would_recommend boolean DEFAULT false,
    interested_in_purchase boolean DEFAULT false,
    contact_for_followup boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT sandbox_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.sandbox_feedback OWNER TO postgres;

--
-- Name: TABLE sandbox_feedback; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.sandbox_feedback IS 'Collects feedback from sandbox users about their experience';


--
-- Name: sandbox_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sandbox_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sandbox_feedback_id_seq OWNER TO postgres;

--
-- Name: sandbox_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sandbox_feedback_id_seq OWNED BY public.sandbox_feedback.id;


--
-- Name: sandbox_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sandbox_sessions (
    id integer NOT NULL,
    user_id integer,
    session_type character varying(50) NOT NULL,
    source character varying(100) DEFAULT 'landing-page'::character varying,
    features jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    expires_at timestamp without time zone NOT NULL,
    last_accessed_at timestamp without time zone,
    access_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sandbox_sessions OWNER TO postgres;

--
-- Name: TABLE sandbox_sessions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.sandbox_sessions IS 'Tracks temporary sandbox/playground sessions for visitors';


--
-- Name: sandbox_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sandbox_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sandbox_sessions_id_seq OWNER TO postgres;

--
-- Name: sandbox_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sandbox_sessions_id_seq OWNED BY public.sandbox_sessions.id;


--
-- Name: sector_controls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sector_controls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    control_id uuid,
    sector character varying(100) NOT NULL,
    applicability_score integer DEFAULT 50,
    implementation_complexity character varying(50) DEFAULT 'medium'::character varying,
    sector_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sector_controls OWNER TO postgres;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value jsonb NOT NULL,
    description text,
    category character varying(100) DEFAULT 'general'::character varying,
    is_public boolean DEFAULT false,
    updated_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_settings_id_seq OWNER TO postgres;

--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_comments (
    id integer NOT NULL,
    task_id integer,
    user_id integer,
    comment text NOT NULL,
    type character varying(50) DEFAULT 'comment'::character varying,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT task_comments_type_check CHECK (((type)::text = ANY ((ARRAY['comment'::character varying, 'status_change'::character varying, 'assignment'::character varying, 'attachment'::character varying])::text[])))
);


ALTER TABLE public.task_comments OWNER TO postgres;

--
-- Name: task_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_comments_id_seq OWNER TO postgres;

--
-- Name: task_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_comments_id_seq OWNED BY public.task_comments.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'todo'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    project_id integer,
    milestone_id integer,
    assignee_id integer,
    reporter_id integer,
    due_date date,
    completed_date date,
    estimated_hours numeric(5,2),
    actual_hours numeric(5,2),
    tags jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT tasks_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT tasks_status_check CHECK (((status)::text = ANY ((ARRAY['todo'::character varying, 'in-progress'::character varying, 'review'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: TABLE tasks; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tasks IS 'Individual tasks within projects';


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    team_id integer,
    user_id integer,
    role character varying(50) DEFAULT 'member'::character varying,
    joined_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.team_members OWNER TO postgres;

--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_members_id_seq OWNER TO postgres;

--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    organization_id integer,
    team_lead_id integer,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT teams_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: TABLE teams; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.teams IS 'Teams within organizations';


--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    sector character varying(100),
    industry character varying(100),
    contact_email character varying(255) NOT NULL,
    contact_phone character varying(50),
    status character varying(50) DEFAULT 'active'::character varying,
    subscription_tier character varying(50) DEFAULT 'basic'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: user_organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_organizations (
    id integer NOT NULL,
    user_id integer,
    organization_id integer,
    role character varying(50) DEFAULT 'member'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_organizations OWNER TO postgres;

--
-- Name: user_organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_organizations_id_seq OWNER TO postgres;

--
-- Name: user_organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_organizations_id_seq OWNED BY public.user_organizations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying,
    permissions jsonb DEFAULT '["read"]'::jsonb,
    status character varying(20) DEFAULT 'active'::character varying,
    avatar_url text,
    phone character varying(50),
    department character varying(100),
    "position" character varying(100),
    last_login timestamp without time zone,
    login_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    two_factor_enabled boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_sandbox boolean DEFAULT false,
    sandbox_expires_at timestamp without time zone,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'manager'::character varying, 'developer'::character varying, 'user'::character varying, 'viewer'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying, 'pending'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Main user accounts and authentication';


--
-- Name: COLUMN users.is_sandbox; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.is_sandbox IS 'Indicates if this is a temporary sandbox/demo user';


--
-- Name: COLUMN users.sandbox_expires_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.sandbox_expires_at IS 'Expiration timestamp for sandbox users';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workflow_executions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_executions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid,
    assessment_id uuid,
    status character varying(50) DEFAULT 'running'::character varying,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


ALTER TABLE public.workflow_executions OWNER TO postgres;

--
-- Name: workflow_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid,
    action character varying(100) NOT NULL,
    performed_by uuid,
    status_from character varying(50),
    status_to character varying(50),
    comments text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflow_history OWNER TO postgres;

--
-- Name: workflow_steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid,
    step_name character varying(255) NOT NULL,
    step_type character varying(50) NOT NULL,
    step_config jsonb,
    step_order integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflow_steps OWNER TO postgres;

--
-- Name: workflow_trigger_executions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_trigger_executions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trigger_id uuid,
    assessment_id uuid,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    result jsonb,
    execution_time_ms integer
);


ALTER TABLE public.workflow_trigger_executions OWNER TO postgres;

--
-- Name: workflow_triggers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_triggers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    trigger_name character varying(255) NOT NULL,
    trigger_type character varying(50) NOT NULL,
    trigger_event character varying(100) NOT NULL,
    trigger_conditions jsonb,
    target_workflow_type character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflow_triggers OWNER TO postgres;

--
-- Name: workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100),
    trigger_type character varying(50) DEFAULT 'manual'::character varying,
    trigger_config jsonb,
    status character varying(50) DEFAULT 'active'::character varying,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflows OWNER TO postgres;

--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: analytics_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events ALTER COLUMN id SET DEFAULT nextval('public.analytics_events_id_seq'::regclass);


--
-- Name: assessment_comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_comments ALTER COLUMN id SET DEFAULT nextval('public.assessment_comments_id_seq'::regclass);


--
-- Name: assessment_controls id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_controls ALTER COLUMN id SET DEFAULT nextval('public.assessment_controls_id_seq'::regclass);


--
-- Name: assessment_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_history ALTER COLUMN id SET DEFAULT nextval('public.assessment_history_id_seq'::regclass);


--
-- Name: assessments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments ALTER COLUMN id SET DEFAULT nextval('public.assessments_id_seq'::regclass);


--
-- Name: contact_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- Name: framework_controls id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.framework_controls ALTER COLUMN id SET DEFAULT nextval('public.framework_controls_id_seq'::regclass);


--
-- Name: frameworks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frameworks ALTER COLUMN id SET DEFAULT nextval('public.frameworks_id_seq'::regclass);


--
-- Name: landing_content id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_content ALTER COLUMN id SET DEFAULT nextval('public.landing_content_id_seq'::regclass);


--
-- Name: landing_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_requests ALTER COLUMN id SET DEFAULT nextval('public.landing_requests_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: project_milestones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_milestones ALTER COLUMN id SET DEFAULT nextval('public.project_milestones_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: sandbox_feedback id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sandbox_feedback ALTER COLUMN id SET DEFAULT nextval('public.sandbox_feedback_id_seq'::regclass);


--
-- Name: sandbox_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sandbox_sessions ALTER COLUMN id SET DEFAULT nextval('public.sandbox_sessions_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: task_comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments ALTER COLUMN id SET DEFAULT nextval('public.task_comments_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: user_organizations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organizations ALTER COLUMN id SET DEFAULT nextval('public.user_organizations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics_events (id, event_type, event_name, user_id, session_id, properties, "timestamp") FROM stdin;
\.


--
-- Data for Name: assessment_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_comments (id, assessment_id, control_id, user_id, comment, comment_type, is_internal, created_at, updated_at) FROM stdin;
1	1	1	1	Initial review completed. Documentation needs updating.	general	t	2025-11-03 17:58:27.167758	2025-11-03 17:58:27.167758
2	1	1	7	Initial review completed. Documentation needs updating.	general	t	2025-11-03 17:58:27.167758	2025-11-03 17:58:27.167758
3	1	1	15	Initial review completed. Documentation needs updating.	general	t	2025-11-03 17:58:27.167758	2025-11-03 17:58:27.167758
4	1	1	19	Initial review completed. Documentation needs updating.	general	t	2025-11-03 17:58:27.167758	2025-11-03 17:58:27.167758
5	1	1	3	Initial review completed. Documentation needs updating.	general	t	2025-11-03 17:58:27.167758	2025-11-03 17:58:27.167758
\.


--
-- Data for Name: assessment_controls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_controls (id, assessment_id, control_id, status, implementation_status, compliance_status, risk_rating, score, assigned_to, implementation_notes, evidence_provided, evidence_files, remediation_plan, remediation_due_date, last_reviewed_date, reviewed_by, is_demo, metadata, created_at, updated_at) FROM stdin;
1	1	1	in_progress	partially_implemented	partially_compliant	medium	\N	4	\N	\N	[]	\N	\N	\N	\N	f	{}	2025-11-03 17:58:27.153552	2025-11-03 17:58:27.153552
\.


--
-- Data for Name: assessment_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_history (id, assessment_id, control_id, user_id, action, field_name, old_value, new_value, description, created_at) FROM stdin;
1	1	1	1	status_changed	status	not_started	in_progress	Assessment control status updated	2025-11-03 17:58:27.17548
2	1	1	7	status_changed	status	not_started	in_progress	Assessment control status updated	2025-11-03 17:58:27.17548
3	1	1	15	status_changed	status	not_started	in_progress	Assessment control status updated	2025-11-03 17:58:27.17548
\.


--
-- Data for Name: assessment_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_responses (id, assessment_id, control_id, compliance_score, status, created_at) FROM stdin;
\.


--
-- Data for Name: assessment_workflow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_workflow (id, assessment_id, workflow_type, status, priority, assigned_to, assigned_by, delegated_from, due_date, approved_at, approved_by, rejected_at, rejected_by, rejection_reason, comments, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessments (id, title, description, framework_id, organization_id, created_by, assigned_to, status, priority, start_date, due_date, completed_date, progress, risk_level, overall_score, compliance_percentage, controls_total, controls_completed, controls_passed, controls_failed, controls_not_applicable, is_demo, metadata, created_at, updated_at, finance_database, auth_database, created_by_user_id, assigned_to_user_id, tenant_id) FROM stdin;
1	ISO 27001 Annual Assessment	Annual information security management system assessment based on ISO 27001:2022	1	1	1	[]	in_progress	high	2025-10-04	2026-01-02	\N	0	unknown	\N	\N	0	0	0	0	0	f	{}	2025-11-03 17:58:27.124506	2025-11-03 17:58:27.124506	grc_master	shahin_access_control	\N	\N	\N
2	GDPR Compliance Review	Annual review of GDPR compliance requirements	2	1	7	[]	draft	medium	2025-11-03	2026-02-01	\N	0	unknown	\N	\N	0	0	0	0	0	f	{}	2025-11-03 17:58:27.147257	2025-11-03 17:58:27.147257	grc_master	shahin_access_control	\N	\N	\N
3	SOX Compliance Review	Annual SOX compliance assessment for financial controls	4	5	1	[]	review	high	2025-09-04	2025-12-03	\N	0	unknown	\N	\N	0	0	0	0	0	f	{}	2025-11-03 17:58:27.149648	2025-11-03 17:58:27.149648	grc_master	shahin_access_control	\N	\N	\N
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_messages (id, name, email, phone, company, subject, message, type, status, assigned_to, resolved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: framework_controls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.framework_controls (id, framework_id, control_id, title, description, category, subcategory, control_type, priority, implementation_guidance, evidence_requirements, is_active, created_at, updated_at) FROM stdin;
1	1	A.5.1.1	Information security policy	An information security policy shall be defined, approved by management, published and communicated to employees and relevant external parties.	Information Security Policies	\N	requirement	high	\N	[]	t	2025-11-03 17:56:56.038246	2025-11-03 17:56:56.038246
2	1	A.5.1.2	Review of information security policy	The information security policy shall be reviewed at planned intervals or if significant changes occur to ensure its continuing suitability, adequacy and effectiveness.	Information Security Policies	\N	requirement	medium	\N	[]	t	2025-11-03 17:56:56.038246	2025-11-03 17:56:56.038246
3	1	A.6.1.1	Information security roles and responsibilities	All information security responsibilities shall be defined and allocated.	Organization of Information Security	\N	requirement	high	\N	[]	t	2025-11-03 17:56:56.038246	2025-11-03 17:56:56.038246
4	1	A.7.1.1	Screening	Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws, regulations and ethics and shall be proportional to the business requirements, the classification of the information to be accessed and the perceived risks.	Human Resource Security	\N	requirement	medium	\N	[]	t	2025-11-03 17:56:56.038246	2025-11-03 17:56:56.038246
5	1	A.8.1.1	Inventory of assets	Assets associated with information and information processing facilities shall be identified and an inventory of these assets shall be drawn up and maintained.	Asset Management	\N	requirement	high	\N	[]	t	2025-11-03 17:56:56.038246	2025-11-03 17:56:56.038246
\.


--
-- Data for Name: frameworks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.frameworks (id, name, version, description, category, authority, is_active, metadata, created_at, updated_at) FROM stdin;
1	ISO 27001	2022	Information Security Management Systems	security	ISO	t	{}	2025-11-03 17:56:56.038246	2025-11-03 17:56:56.038246
2	GDPR	2018	General Data Protection Regulation	privacy	EU	t	{}	2025-11-03 17:56:56.038246	2025-11-03 17:56:56.038246
3	HIPAA	1996	Health Insurance Portability and Accountability Act	healthcare	HHS	t	{}	2025-11-03 17:56:56.038246	2025-11-03 17:56:56.038246
4	SOX	2002	Sarbanes-Oxley Act	financial	SEC	t	{}	2025-11-03 17:56:56.038246	2025-11-03 17:56:56.038246
5	NIST CSF	1.1	NIST Cybersecurity Framework	security	NIST	t	{}	2025-11-03 17:56:56.038246	2025-11-03 17:56:56.038246
\.


--
-- Data for Name: grc_controls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grc_controls (id, framework_id, control_id, title, description, control_type, priority_level, implementation_guidance, testing_procedures, sector_specific_notes, status, created_at, updated_at) FROM stdin;
b2539746-d129-4b0a-b0e6-776227fac046	713715b8-3ac4-4fa9-96b2-01e2c4194626	A.5.1	Information Security Policies	Policies for information security shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel	policy	high	Develop and document information security policies aligned with business objectives	\N	\N	active	2025-11-13 17:38:57.814705	2025-11-13 17:38:57.814705
cce9eb13-fd40-4075-8ba9-68e983012e3c	713715b8-3ac4-4fa9-96b2-01e2c4194626	A.8.1	User Endpoint Devices	Information stored on, processed by or accessible via user endpoint devices shall be protected	technical	high	Implement endpoint protection solutions and device management policies	\N	\N	active	2025-11-13 17:38:57.829069	2025-11-13 17:38:57.829069
9370d72b-2236-44d5-b103-d5c26d7c011e	88aff602-50b0-4ce5-924c-c12b1d2acec4	CYB-1.1	Cybersecurity Governance	Establish cybersecurity governance framework aligned with SAMA requirements	policy	critical	Implement board-level cybersecurity oversight and governance structure	\N	\N	active	2025-11-13 17:38:57.831025	2025-11-13 17:38:57.831025
\.


--
-- Data for Name: grc_frameworks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grc_frameworks (id, name, version, description, sector_applicability, complexity_level, status, created_at, updated_at) FROM stdin;
713715b8-3ac4-4fa9-96b2-01e2c4194626	ISO 27001	2022	Information Security Management System	{finance,healthcare,technology}	4	active	2025-11-13 17:38:57.804138	2025-11-13 17:38:57.804138
0e422e90-c022-4e13-b20c-182b02cd6322	NIST CSF	1.1	NIST Cybersecurity Framework	{finance,energy,healthcare}	3	active	2025-11-13 17:38:57.804138	2025-11-13 17:38:57.804138
ca388d0d-ad94-48ca-b4c8-c350ff008d08	SOC 2	Type II	Service Organization Control 2	{technology,finance}	3	active	2025-11-13 17:38:57.804138	2025-11-13 17:38:57.804138
88aff602-50b0-4ce5-924c-c12b1d2acec4	SAMA Cybersecurity	1.0	SAMA Cybersecurity Framework for KSA Financial Sector	{finance,banking}	5	active	2025-11-13 17:38:57.804138	2025-11-13 17:38:57.804138
a790f636-9fad-47e2-b141-e04ccb0aa095	PCI-DSS	4.0	Payment Card Industry Data Security Standard	{finance,retail,ecommerce}	4	active	2025-11-13 17:38:57.804138	2025-11-13 17:38:57.804138
6d677043-533d-4444-b259-fd6e9ed3d14a	GDPR	2016/679	General Data Protection Regulation	{all}	3	active	2025-11-13 17:38:57.804138	2025-11-13 17:38:57.804138
f7690af1-c788-47cf-96c1-97126344a67f	Basel III	2023	Basel III Banking Regulations	{finance,banking}	5	active	2025-11-13 17:38:57.804138	2025-11-13 17:38:57.804138
6744f31a-f4a8-4caa-abba-639677141473	MOH Health Data Protection	1.0	MOH Healthcare Data Protection Standards	{healthcare}	4	active	2025-11-13 17:38:57.804138	2025-11-13 17:38:57.804138
03f1271f-204f-4174-a856-2108464e4982	CITC Telecom Regulations	1.0	CITC Telecommunications Regulations	{telecom}	3	active	2025-11-13 17:38:57.804138	2025-11-13 17:38:57.804138
d9a2aa3b-1083-4ccc-be50-c80d27d36e04	ECRA Energy Standards	1.0	ECRA Energy Sector Standards	{energy}	3	active	2025-11-13 17:38:57.804138	2025-11-13 17:38:57.804138
\.


--
-- Data for Name: landing_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.landing_content (id, hero_title, hero_subtitle, active, updated_at, updated_by, created_at) FROM stdin;
1	شاهين للحوكمة — جاهزية سعودية من اليوم	أتمتة امتثال PDPL وNCA ECC وNDMO بمساعد ذكي عربي للقطاع الحكومي — مع تقييمات سريعة وإدارة أدلة ولوحات قياس تنفيذية، داخل بيئة تجريبية آمنة.	t	2025-11-03 16:13:41.811964	\N	2025-11-03 16:13:41.811964
\.


--
-- Data for Name: landing_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.landing_requests (id, name, company, email, phone, preferred_date, preferred_time, access_type, package, features, message, lead_score, status, approval_token, approved_at, rejected_at, rejection_reason, confirmed_at, created_at, updated_at, sandbox_user_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, filename, executed_at) FROM stdin;
1	001_core_system_tables.sql	2025-11-03 16:13:41.664619
2	002_landing_cms.sql	2025-11-03 16:13:41.811964
3	003_sandbox_system.sql	2025-11-03 16:14:38.720238
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, entity_type, entity_id, is_read, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, type, country, industry, size, website, description, logo_url, created_by, created_at, updated_at, is_demo) FROM stdin;
1	Shahin AI	technology	Saudi Arabia	\N	\N	\N	\N	\N	1	2025-11-03 16:13:41.664619	2025-11-03 16:13:41.664619	f
4	TechCorp Solutions	technology	Saudi Arabia	Software Development	small	https://techcorp.sa	Leading software development company specializing in AI solutions	\N	\N	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f
5	Global Finance Ltd	financial	UAE	Financial Services	medium	https://globalfinance.ae	Comprehensive financial services and investment solutions	\N	\N	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f
6	Healthcare Plus	healthcare	Saudi Arabia	Healthcare	large	https://healthcareplus.sa	Advanced healthcare management and medical technology	\N	\N	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f
7	Manufacturing Pro	manufacturing	Qatar	Manufacturing	large	https://manufacturingpro.qa	Industrial manufacturing and supply chain solutions	\N	\N	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f
8	Retail Excellence	retail	Kuwait	Retail	medium	https://retailexcellence.kw	Modern retail solutions and e-commerce platforms	\N	\N	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f
\.


--
-- Data for Name: project_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_milestones (id, project_id, name, description, status, due_date, completed_date, progress, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, name, description, status, priority, start_date, end_date, actual_end_date, progress, budget, spent, organization_id, team_id, project_manager_id, technologies, tags, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sandbox_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sandbox_feedback (id, session_id, rating, experience, features, issues, suggestions, would_recommend, interested_in_purchase, contact_for_followup, created_at) FROM stdin;
\.


--
-- Data for Name: sandbox_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sandbox_sessions (id, user_id, session_type, source, features, metadata, expires_at, last_accessed_at, access_count, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: sector_controls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sector_controls (id, control_id, sector, applicability_score, implementation_complexity, sector_notes, created_at) FROM stdin;
05e71ba2-c591-4dd6-bfa7-dec70dc832b3	9370d72b-2236-44d5-b103-d5c26d7c011e	finance	95	high	Critical for financial institutions under SAMA regulation	2025-11-13 17:38:57.83334
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (id, key, value, description, category, is_public, updated_by, created_at, updated_at) FROM stdin;
1	app_name	"Shahin AI Platform"	Application name	general	t	\N	2025-11-03 16:13:41.664619	2025-11-03 16:13:41.664619
2	app_version	"1.0.0"	Application version	general	t	\N	2025-11-03 16:13:41.664619	2025-11-03 16:13:41.664619
3	maintenance_mode	false	Maintenance mode flag	system	f	\N	2025-11-03 16:13:41.664619	2025-11-03 16:13:41.664619
4	max_file_size	10485760	Maximum file upload size in bytes	uploads	f	\N	2025-11-03 16:13:41.664619	2025-11-03 16:13:41.664619
5	session_timeout	3600	Session timeout in seconds	security	f	\N	2025-11-03 16:13:41.664619	2025-11-03 16:13:41.664619
\.


--
-- Data for Name: task_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_comments (id, task_id, user_id, comment, type, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, status, priority, project_id, milestone_id, assignee_id, reporter_id, due_date, completed_date, estimated_hours, actual_hours, tags, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, team_id, user_id, role, joined_at) FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, description, organization_id, team_lead_id, status, created_at, updated_at) FROM stdin;
1	Development Team	Main development team	1	1	active	2025-11-03 16:13:41.664619	2025-11-03 16:13:41.664619
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, sector, industry, contact_email, contact_phone, status, subscription_tier, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: user_organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_organizations (id, user_id, organization_id, role, created_at) FROM stdin;
1	3	4	manager	2025-11-03 17:35:37.7534
2	4	4	developer	2025-11-03 17:35:37.7534
3	5	4	user	2025-11-03 17:35:37.7534
4	6	4	viewer	2025-11-03 17:35:37.7534
5	7	5	manager	2025-11-03 17:35:37.7534
6	8	5	developer	2025-11-03 17:35:37.7534
7	9	5	user	2025-11-03 17:35:37.7534
8	10	5	viewer	2025-11-03 17:35:37.7534
9	11	6	manager	2025-11-03 17:35:37.7534
10	12	6	developer	2025-11-03 17:35:37.7534
11	13	6	user	2025-11-03 17:35:37.7534
12	14	6	viewer	2025-11-03 17:35:37.7534
13	15	7	manager	2025-11-03 17:35:37.7534
14	16	7	developer	2025-11-03 17:35:37.7534
15	17	7	user	2025-11-03 17:35:37.7534
16	18	7	viewer	2025-11-03 17:35:37.7534
17	19	8	manager	2025-11-03 17:35:37.7534
18	20	8	developer	2025-11-03 17:35:37.7534
19	21	8	user	2025-11-03 17:35:37.7534
20	22	8	viewer	2025-11-03 17:35:37.7534
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, full_name, role, permissions, status, avatar_url, phone, department, "position", last_login, login_count, is_active, email_verified, two_factor_enabled, created_at, updated_at, is_sandbox, sandbox_expires_at) FROM stdin;
1	admin	admin@shahin.com	$2b$10$rQZ9QmjytWIeJH7L8F8F8eKQZ9QmjytWIeJH7L8F8F8eKQZ9QmjytW	System Administrator	admin	["read", "write", "delete", "admin"]	active	\N	\N	\N	\N	\N	0	t	t	f	2025-11-03 16:13:41.664619	2025-11-03 16:13:41.664619	f	\N
4	techcorp_developer	developer@techcorp.com	$2b$10$NEMJnicidRjRzPAliheYROGMiruKBj.L2Iky2jDGJP.VRP7fEHJC2	Sara Al-Zahra	developer	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
5	techcorp_user	user@techcorp.com	$2b$10$kNHlP0IACfaSb7yPN0eRZuHzBIuOlE1nk3478PrQyGNXHez9yFGBe	Omar Al-Mansouri	user	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
6	techcorp_viewer	viewer@techcorp.com	$2b$10$4GjmD2kn6k96sHJ4Hbib/OqSaO6iT9QWHlFqpfPdVQJtORknRGHy6	Fatima Al-Qasimi	viewer	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
7	globalfinance_manager	manager@globalfinance.com	$2b$10$fFqS4iYV0E1hCS/TgIdLietFE59WgugebaQsgvD7gMiKWunbLUEqW	Mohammed Al-Maktoum	manager	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
9	globalfinance_user	user@globalfinance.com	$2b$10$0SXrX8xxuTtD82yDGjDOaeeYjLK.w1BVjqoEUxgZ9HzNArAlnsmuu	Khalid Al-Shamsi	user	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
10	globalfinance_viewer	viewer@globalfinance.com	$2b$10$uDr.GeD7Y7g4VUQWLbTzm./yVkPBLAcaYQcUi9LS9BHrcBRlGdFFG	Mariam Al-Falasi	viewer	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
12	healthcareplus_developer	developer@healthcareplus.com	$2b$10$L5t7lza3jgZEfyEtDXxcAOEhDBCHNtXpgQfuSqq8ybkTzIpWNtzYO	Nora Al-Ghamdi	developer	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
13	healthcareplus_user	user@healthcareplus.com	$2b$10$OtILPH0TzlwtZfxwa4QuEOY9CSE/tOtwQ2CoT1SavXv1FK/udhCyK	Faisal Al-Otaibi	user	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
14	healthcareplus_viewer	viewer@healthcareplus.com	$2b$10$W2KDAXNqEMF.pzjjt0hDEOfvsnRpUv8ef/ymwuWOo6FqMTJitJJEK	Hala Al-Harbi	viewer	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
15	manufacturingpro_manager	manager@manufacturingpro.com	$2b$10$1EIs6VfiZ3LhNISFHLogke.QZ7WcvVInwiekTYaDMQxoJQXyC2//K	Hamad Al-Thani	manager	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
16	manufacturingpro_developer	developer@manufacturingpro.com	$2b$10$sDiQJzdHX.I1UioO9claoOjx.QoWVawTSKMPBO.zKhgs.8lrk/lUe	Layla Al-Kuwari	developer	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
17	manufacturingpro_user	user@manufacturingpro.com	$2b$10$LA2EBLTPHIVlaPFu7z7BMOw3lPLHY.DmzzeJ2Unmyi7YUb90ZfIai	Saeed Al-Marri	user	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
18	manufacturingpro_viewer	viewer@manufacturingpro.com	$2b$10$2h0Nwqz5dyAcrFzPAC25NuZolYY4ZqLNrml0k.kAQkRLD32l8v/ki	Amina Al-Sulaiti	viewer	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
19	retailexcellence_manager	manager@retailexcellence.com	$2b$10$YmyPxlNag1HMks3wOsbyweYtJch152Qhe0ckWWi2/s0WDF/b.qU2m	Yousef Al-Sabah	manager	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
20	retailexcellence_developer	developer@retailexcellence.com	$2b$10$sRHrdCTgVfiBemfLFzUae.MrMNV8.jZX8dDTskCahdfvj88uX5MPe	Reem Al-Rashid	developer	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
21	retailexcellence_user	user@retailexcellence.com	$2b$10$Ef7D.JLeHXQov9AqH8KLfOPyB7JMm6xoSy9A3l3zA1Uoe/6nbz7wK	Bader Al-Mutairi	user	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
22	retailexcellence_viewer	viewer@retailexcellence.com	$2b$10$gCUG9IZk.74fLLbDgzuZJu.pPiTLMak3ayCzS141mzipNsKv/Y4Jm	Dalal Al-Kandari	viewer	["read"]	active	\N	\N	\N	\N	\N	0	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:35:37.7534	f	\N
8	globalfinance_developer	developer@globalfinance.com	$2b$10$2Yf4vEKaOfMrcrvTF7v8GeN/IK/Bv30gUooDiUbX/J3ELD8duNsou	Aisha Al-Nuaimi	developer	["read"]	active	\N	\N	\N	\N	2025-11-03 17:37:52.367352	1	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:37:52.367352	f	\N
11	healthcareplus_manager	manager@healthcareplus.com	$2b$10$KLsMrYCcVBj3xbVsVa4j.urBCydHbZgWKWmBImKxe32k10Y/Z2md2	Abdullah Al-Saud	manager	["read"]	active	\N	\N	\N	\N	2025-11-03 17:38:14.77189	1	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 17:38:14.77189	f	\N
3	techcorp_manager	manager@techcorp.com	$2b$10$J14Smpi3T/beCajO/FtHQOGo7YE/7KPbAhclAHNQYAcwU3rnqoEHG	Ahmed Al-Rashid	manager	["read"]	active	\N	\N	\N	\N	2025-11-03 22:13:24.920992	7	t	f	f	2025-11-03 17:35:37.7534	2025-11-03 22:13:24.920992	f	\N
\.


--
-- Data for Name: workflow_executions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_executions (id, workflow_id, assessment_id, status, started_at, completed_at) FROM stdin;
\.


--
-- Data for Name: workflow_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_history (id, workflow_id, action, performed_by, status_from, status_to, comments, created_at) FROM stdin;
\.


--
-- Data for Name: workflow_steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_steps (id, workflow_id, step_name, step_type, step_config, step_order, created_at) FROM stdin;
\.


--
-- Data for Name: workflow_trigger_executions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_trigger_executions (id, trigger_id, assessment_id, executed_at, result, execution_time_ms) FROM stdin;
\.


--
-- Data for Name: workflow_triggers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_triggers (id, tenant_id, trigger_name, trigger_type, trigger_event, trigger_conditions, target_workflow_type, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflows (id, tenant_id, name, description, category, trigger_type, trigger_config, status, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 1, false);


--
-- Name: analytics_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analytics_events_id_seq', 1, false);


--
-- Name: assessment_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assessment_comments_id_seq', 5, true);


--
-- Name: assessment_controls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assessment_controls_id_seq', 10, true);


--
-- Name: assessment_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assessment_history_id_seq', 3, true);


--
-- Name: assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assessments_id_seq', 3, true);


--
-- Name: contact_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_messages_id_seq', 1, false);


--
-- Name: framework_controls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.framework_controls_id_seq', 5, true);


--
-- Name: frameworks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.frameworks_id_seq', 5, true);


--
-- Name: landing_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.landing_content_id_seq', 1, true);


--
-- Name: landing_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.landing_requests_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 3, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizations_id_seq', 9, true);


--
-- Name: project_milestones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_milestones_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- Name: sandbox_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sandbox_feedback_id_seq', 1, false);


--
-- Name: sandbox_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sandbox_sessions_id_seq', 1, false);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 10, true);


--
-- Name: task_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_comments_id_seq', 1, false);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 1, false);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.team_members_id_seq', 1, false);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 3, true);


--
-- Name: user_organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_organizations_id_seq', 20, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 23, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: assessment_comments assessment_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_comments
    ADD CONSTRAINT assessment_comments_pkey PRIMARY KEY (id);


--
-- Name: assessment_controls assessment_controls_assessment_id_control_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_controls
    ADD CONSTRAINT assessment_controls_assessment_id_control_id_key UNIQUE (assessment_id, control_id);


--
-- Name: assessment_controls assessment_controls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_controls
    ADD CONSTRAINT assessment_controls_pkey PRIMARY KEY (id);


--
-- Name: assessment_history assessment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_history
    ADD CONSTRAINT assessment_history_pkey PRIMARY KEY (id);


--
-- Name: assessment_responses assessment_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_responses
    ADD CONSTRAINT assessment_responses_pkey PRIMARY KEY (id);


--
-- Name: assessment_workflow assessment_workflow_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_workflow
    ADD CONSTRAINT assessment_workflow_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: framework_controls framework_controls_framework_id_control_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.framework_controls
    ADD CONSTRAINT framework_controls_framework_id_control_id_key UNIQUE (framework_id, control_id);


--
-- Name: framework_controls framework_controls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.framework_controls
    ADD CONSTRAINT framework_controls_pkey PRIMARY KEY (id);


--
-- Name: frameworks frameworks_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frameworks
    ADD CONSTRAINT frameworks_name_key UNIQUE (name);


--
-- Name: frameworks frameworks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frameworks
    ADD CONSTRAINT frameworks_pkey PRIMARY KEY (id);


--
-- Name: grc_controls grc_controls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grc_controls
    ADD CONSTRAINT grc_controls_pkey PRIMARY KEY (id);


--
-- Name: grc_frameworks grc_frameworks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grc_frameworks
    ADD CONSTRAINT grc_frameworks_pkey PRIMARY KEY (id);


--
-- Name: landing_content landing_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_content
    ADD CONSTRAINT landing_content_pkey PRIMARY KEY (id);


--
-- Name: landing_requests landing_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_requests
    ADD CONSTRAINT landing_requests_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_filename_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_filename_key UNIQUE (filename);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: project_milestones project_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT project_milestones_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: sandbox_feedback sandbox_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sandbox_feedback
    ADD CONSTRAINT sandbox_feedback_pkey PRIMARY KEY (id);


--
-- Name: sandbox_sessions sandbox_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sandbox_sessions
    ADD CONSTRAINT sandbox_sessions_pkey PRIMARY KEY (id);


--
-- Name: sector_controls sector_controls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sector_controls
    ADD CONSTRAINT sector_controls_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key UNIQUE (key);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_team_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_user_id_key UNIQUE (team_id, user_id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: grc_controls unique_framework_control; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grc_controls
    ADD CONSTRAINT unique_framework_control UNIQUE (framework_id, control_id);


--
-- Name: grc_frameworks unique_framework_name_version; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grc_frameworks
    ADD CONSTRAINT unique_framework_name_version UNIQUE (name, version);


--
-- Name: sector_controls unique_sector_control; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sector_controls
    ADD CONSTRAINT unique_sector_control UNIQUE (control_id, sector);


--
-- Name: tenants unique_tenant_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT unique_tenant_email UNIQUE (contact_email);


--
-- Name: user_organizations user_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organizations
    ADD CONSTRAINT user_organizations_pkey PRIMARY KEY (id);


--
-- Name: user_organizations user_organizations_user_id_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organizations
    ADD CONSTRAINT user_organizations_user_id_organization_id_key UNIQUE (user_id, organization_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: workflow_executions workflow_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_executions
    ADD CONSTRAINT workflow_executions_pkey PRIMARY KEY (id);


--
-- Name: workflow_history workflow_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_history
    ADD CONSTRAINT workflow_history_pkey PRIMARY KEY (id);


--
-- Name: workflow_steps workflow_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_pkey PRIMARY KEY (id);


--
-- Name: workflow_steps workflow_steps_workflow_id_step_order_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_workflow_id_step_order_key UNIQUE (workflow_id, step_order);


--
-- Name: workflow_trigger_executions workflow_trigger_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_trigger_executions
    ADD CONSTRAINT workflow_trigger_executions_pkey PRIMARY KEY (id);


--
-- Name: workflow_triggers workflow_triggers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_triggers
    ADD CONSTRAINT workflow_triggers_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_action ON public.activity_logs USING btree (action);


--
-- Name: idx_activity_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_created ON public.activity_logs USING btree (created_at DESC);


--
-- Name: idx_activity_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_entity ON public.activity_logs USING btree (entity_type, entity_id);


--
-- Name: idx_activity_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_user ON public.activity_logs USING btree (user_id);


--
-- Name: idx_analytics_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_timestamp ON public.analytics_events USING btree ("timestamp" DESC);


--
-- Name: idx_analytics_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_type ON public.analytics_events USING btree (event_type);


--
-- Name: idx_analytics_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_user ON public.analytics_events USING btree (user_id);


--
-- Name: idx_assessment_controls_assessment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessment_controls_assessment ON public.assessment_controls USING btree (assessment_id);


--
-- Name: idx_assessment_controls_assigned; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessment_controls_assigned ON public.assessment_controls USING btree (assigned_to);


--
-- Name: idx_assessment_controls_compliance; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessment_controls_compliance ON public.assessment_controls USING btree (compliance_status);


--
-- Name: idx_assessment_controls_control; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessment_controls_control ON public.assessment_controls USING btree (control_id);


--
-- Name: idx_assessment_controls_demo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessment_controls_demo ON public.assessment_controls USING btree (is_demo);


--
-- Name: idx_assessment_controls_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessment_controls_status ON public.assessment_controls USING btree (status);


--
-- Name: idx_assessments_assignee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_assignee ON public.assessments USING btree (assigned_to_user_id);


--
-- Name: idx_assessments_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_created_by ON public.assessments USING btree (created_by);


--
-- Name: idx_assessments_creator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_creator ON public.assessments USING btree (created_by_user_id);


--
-- Name: idx_assessments_demo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_demo ON public.assessments USING btree (is_demo);


--
-- Name: idx_assessments_due_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_due_date ON public.assessments USING btree (due_date);


--
-- Name: idx_assessments_framework; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_framework ON public.assessments USING btree (framework_id);


--
-- Name: idx_assessments_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_org ON public.assessments USING btree (organization_id);


--
-- Name: idx_assessments_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_priority ON public.assessments USING btree (priority);


--
-- Name: idx_assessments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_status ON public.assessments USING btree (status);


--
-- Name: idx_assessments_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_tenant ON public.assessments USING btree (tenant_id);


--
-- Name: idx_comments_assessment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_assessment ON public.assessment_comments USING btree (assessment_id);


--
-- Name: idx_comments_control; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_control ON public.assessment_comments USING btree (control_id);


--
-- Name: idx_comments_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_type ON public.assessment_comments USING btree (comment_type);


--
-- Name: idx_comments_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_user ON public.assessment_comments USING btree (user_id);


--
-- Name: idx_contact_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_created ON public.contact_messages USING btree (created_at DESC);


--
-- Name: idx_contact_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_email ON public.contact_messages USING btree (email);


--
-- Name: idx_contact_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_status ON public.contact_messages USING btree (status);


--
-- Name: idx_contact_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_type ON public.contact_messages USING btree (type);


--
-- Name: idx_controls_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_controls_category ON public.framework_controls USING btree (category);


--
-- Name: idx_controls_control_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_controls_control_id ON public.framework_controls USING btree (control_id);


--
-- Name: idx_controls_framework; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_controls_framework ON public.framework_controls USING btree (framework_id);


--
-- Name: idx_controls_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_controls_priority ON public.framework_controls USING btree (priority);


--
-- Name: idx_controls_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_controls_type ON public.grc_controls USING btree (control_type);


--
-- Name: idx_feedback_interested; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feedback_interested ON public.sandbox_feedback USING btree (interested_in_purchase);


--
-- Name: idx_feedback_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feedback_rating ON public.sandbox_feedback USING btree (rating);


--
-- Name: idx_feedback_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feedback_session ON public.sandbox_feedback USING btree (session_id);


--
-- Name: idx_framework_controls_control; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_framework_controls_control ON public.framework_controls USING btree (control_id);


--
-- Name: idx_framework_controls_framework; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_framework_controls_framework ON public.framework_controls USING btree (framework_id);


--
-- Name: idx_frameworks_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_frameworks_active ON public.frameworks USING btree (is_active);


--
-- Name: idx_frameworks_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_frameworks_category ON public.frameworks USING btree (category);


--
-- Name: idx_frameworks_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_frameworks_name ON public.frameworks USING btree (name);


--
-- Name: idx_frameworks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_frameworks_status ON public.grc_frameworks USING btree (status);


--
-- Name: idx_history_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_history_action ON public.assessment_history USING btree (action);


--
-- Name: idx_history_assessment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_history_assessment ON public.assessment_history USING btree (assessment_id);


--
-- Name: idx_history_control; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_history_control ON public.assessment_history USING btree (control_id);


--
-- Name: idx_history_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_history_created ON public.assessment_history USING btree (created_at DESC);


--
-- Name: idx_history_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_history_user ON public.assessment_history USING btree (user_id);


--
-- Name: idx_landing_content_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_landing_content_active ON public.landing_content USING btree (active, updated_at DESC);


--
-- Name: idx_landing_requests_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_landing_requests_date ON public.landing_requests USING btree (preferred_date, access_type, status);


--
-- Name: idx_landing_requests_date_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_landing_requests_date_time ON public.landing_requests USING btree (preferred_date, preferred_time, access_type);


--
-- Name: idx_landing_requests_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_landing_requests_email ON public.landing_requests USING btree (email);


--
-- Name: idx_landing_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_landing_requests_status ON public.landing_requests USING btree (status, created_at DESC);


--
-- Name: idx_landing_requests_unique_booking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_landing_requests_unique_booking ON public.landing_requests USING btree (preferred_date, preferred_time, access_type, status) WHERE ((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'confirmed'::character varying])::text[]));


--
-- Name: idx_milestones_due_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_milestones_due_date ON public.project_milestones USING btree (due_date);


--
-- Name: idx_milestones_project; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_milestones_project ON public.project_milestones USING btree (project_id);


--
-- Name: idx_milestones_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_milestones_status ON public.project_milestones USING btree (status);


--
-- Name: idx_notifications_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_orgs_country; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orgs_country ON public.organizations USING btree (country);


--
-- Name: idx_orgs_demo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orgs_demo ON public.organizations USING btree (is_demo) WHERE (is_demo = true);


--
-- Name: idx_orgs_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orgs_name ON public.organizations USING btree (name);


--
-- Name: idx_orgs_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orgs_type ON public.organizations USING btree (type);


--
-- Name: idx_projects_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_dates ON public.projects USING btree (start_date, end_date);


--
-- Name: idx_projects_manager; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_manager ON public.projects USING btree (project_manager_id);


--
-- Name: idx_projects_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_org ON public.projects USING btree (organization_id);


--
-- Name: idx_projects_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_priority ON public.projects USING btree (priority);


--
-- Name: idx_projects_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_status ON public.projects USING btree (status);


--
-- Name: idx_projects_team; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_team ON public.projects USING btree (team_id);


--
-- Name: idx_sandbox_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sandbox_expires ON public.sandbox_sessions USING btree (expires_at);


--
-- Name: idx_sandbox_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sandbox_type ON public.sandbox_sessions USING btree (session_type);


--
-- Name: idx_sandbox_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sandbox_user ON public.sandbox_sessions USING btree (user_id);


--
-- Name: idx_sector_controls_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sector_controls_score ON public.sector_controls USING btree (applicability_score);


--
-- Name: idx_sector_controls_sector; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sector_controls_sector ON public.sector_controls USING btree (sector);


--
-- Name: idx_settings_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_category ON public.system_settings USING btree (category);


--
-- Name: idx_settings_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_key ON public.system_settings USING btree (key);


--
-- Name: idx_task_comments_task; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_task_comments_task ON public.task_comments USING btree (task_id);


--
-- Name: idx_task_comments_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_task_comments_type ON public.task_comments USING btree (type);


--
-- Name: idx_task_comments_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_task_comments_user ON public.task_comments USING btree (user_id);


--
-- Name: idx_tasks_assignee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_assignee ON public.tasks USING btree (assignee_id);


--
-- Name: idx_tasks_due_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_due_date ON public.tasks USING btree (due_date);


--
-- Name: idx_tasks_milestone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_milestone ON public.tasks USING btree (milestone_id);


--
-- Name: idx_tasks_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_priority ON public.tasks USING btree (priority);


--
-- Name: idx_tasks_project; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_project ON public.tasks USING btree (project_id);


--
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- Name: idx_team_members_team; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_members_team ON public.team_members USING btree (team_id);


--
-- Name: idx_team_members_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_members_user ON public.team_members USING btree (user_id);


--
-- Name: idx_teams_lead; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_teams_lead ON public.teams USING btree (team_lead_id);


--
-- Name: idx_teams_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_teams_org ON public.teams USING btree (organization_id);


--
-- Name: idx_teams_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_teams_status ON public.teams USING btree (status);


--
-- Name: idx_tenants_sector; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_sector ON public.tenants USING btree (sector);


--
-- Name: idx_tenants_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_status ON public.tenants USING btree (status);


--
-- Name: idx_user_orgs_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_orgs_org ON public.user_organizations USING btree (organization_id);


--
-- Name: idx_user_orgs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_orgs_user ON public.user_organizations USING btree (user_id);


--
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_active ON public.users USING btree (is_active);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_sandbox_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_sandbox_expires ON public.users USING btree (sandbox_expires_at) WHERE (is_sandbox = true);


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: idx_workflow_triggers_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_triggers_active ON public.workflow_triggers USING btree (is_active);


--
-- Name: idx_workflow_triggers_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_triggers_event ON public.workflow_triggers USING btree (trigger_event);


--
-- Name: idx_workflow_triggers_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_triggers_tenant ON public.workflow_triggers USING btree (tenant_id);


--
-- Name: organizations update_organizations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: project_milestones update_project_milestones_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON public.project_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: system_settings update_system_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tasks update_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: teams update_teams_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: analytics_events analytics_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: assessment_comments assessment_comments_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_comments
    ADD CONSTRAINT assessment_comments_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_comments assessment_comments_control_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_comments
    ADD CONSTRAINT assessment_comments_control_id_fkey FOREIGN KEY (control_id) REFERENCES public.assessment_controls(id);


--
-- Name: assessment_comments assessment_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_comments
    ADD CONSTRAINT assessment_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: assessment_controls assessment_controls_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_controls
    ADD CONSTRAINT assessment_controls_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_controls assessment_controls_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_controls
    ADD CONSTRAINT assessment_controls_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: assessment_controls assessment_controls_control_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_controls
    ADD CONSTRAINT assessment_controls_control_id_fkey FOREIGN KEY (control_id) REFERENCES public.framework_controls(id);


--
-- Name: assessment_controls assessment_controls_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_controls
    ADD CONSTRAINT assessment_controls_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: assessment_history assessment_history_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_history
    ADD CONSTRAINT assessment_history_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_history assessment_history_control_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_history
    ADD CONSTRAINT assessment_history_control_id_fkey FOREIGN KEY (control_id) REFERENCES public.assessment_controls(id);


--
-- Name: assessment_history assessment_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_history
    ADD CONSTRAINT assessment_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: assessments assessments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: assessments assessments_framework_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_framework_id_fkey FOREIGN KEY (framework_id) REFERENCES public.frameworks(id);


--
-- Name: assessments assessments_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: contact_messages contact_messages_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: framework_controls framework_controls_framework_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.framework_controls
    ADD CONSTRAINT framework_controls_framework_id_fkey FOREIGN KEY (framework_id) REFERENCES public.frameworks(id) ON DELETE CASCADE;


--
-- Name: grc_controls grc_controls_framework_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grc_controls
    ADD CONSTRAINT grc_controls_framework_id_fkey FOREIGN KEY (framework_id) REFERENCES public.grc_frameworks(id) ON DELETE CASCADE;


--
-- Name: landing_requests landing_requests_sandbox_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_requests
    ADD CONSTRAINT landing_requests_sandbox_user_id_fkey FOREIGN KEY (sandbox_user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: organizations organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: project_milestones project_milestones_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT project_milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects projects_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: projects projects_project_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_manager_id_fkey FOREIGN KEY (project_manager_id) REFERENCES public.users(id);


--
-- Name: projects projects_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: sandbox_feedback sandbox_feedback_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sandbox_feedback
    ADD CONSTRAINT sandbox_feedback_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sandbox_sessions(id) ON DELETE CASCADE;


--
-- Name: sandbox_sessions sandbox_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sandbox_sessions
    ADD CONSTRAINT sandbox_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sector_controls sector_controls_control_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sector_controls
    ADD CONSTRAINT sector_controls_control_id_fkey FOREIGN KEY (control_id) REFERENCES public.grc_controls(id) ON DELETE CASCADE;


--
-- Name: system_settings system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: task_comments task_comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_comments task_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: tasks tasks_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: tasks tasks_milestone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.project_milestones(id);


--
-- Name: tasks tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teams teams_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: teams teams_team_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_team_lead_id_fkey FOREIGN KEY (team_lead_id) REFERENCES public.users(id);


--
-- Name: user_organizations user_organizations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organizations
    ADD CONSTRAINT user_organizations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: user_organizations user_organizations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organizations
    ADD CONSTRAINT user_organizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workflow_steps workflow_steps_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- Name: workflow_triggers workflow_triggers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_triggers
    ADD CONSTRAINT workflow_triggers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

