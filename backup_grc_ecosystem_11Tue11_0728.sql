--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-11-11 19:28:19

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
-- TOC entry 3 (class 3079 OID 80387)
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- TOC entry 2 (class 3079 OID 80350)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 4 (class 3079 OID 80489)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 80633)
-- Name: activities; Type: TABLE; Schema: public; Owner: grc_user
--

CREATE TABLE public.activities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    title character varying(255) NOT NULL,
    description text,
    activity_type character varying(50),
    entity_type character varying(50),
    entity_id uuid,
    user_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.activities OWNER TO grc_user;

--
-- TOC entry 223 (class 1259 OID 80563)
-- Name: assessments; Type: TABLE; Schema: public; Owner: grc_user
--

CREATE TABLE public.assessments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    organization_id uuid,
    title character varying(255) NOT NULL,
    title_ar character varying(255),
    description text,
    description_ar text,
    framework_id uuid,
    assessment_type character varying(50),
    status character varying(50) DEFAULT 'draft'::character varying,
    due_date date,
    completion_date date,
    score numeric(5,2),
    total_questions integer DEFAULT 0,
    answered_questions integer DEFAULT 0,
    compliance_level character varying(50),
    risk_level character varying(50),
    findings jsonb DEFAULT '[]'::jsonb,
    recommendations jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    is_active boolean DEFAULT true
);


ALTER TABLE public.assessments OWNER TO grc_user;

--
-- TOC entry 225 (class 1259 OID 80607)
-- Name: grc_controls; Type: TABLE; Schema: public; Owner: grc_user
--

CREATE TABLE public.grc_controls (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    framework_id uuid,
    control_code character varying(50) NOT NULL,
    title character varying(500) NOT NULL,
    title_ar character varying(500),
    description text,
    description_ar text,
    control_type character varying(50),
    category character varying(100),
    subcategory character varying(100),
    implementation_guidance text,
    implementation_guidance_ar text,
    compliance_requirements text,
    compliance_requirements_ar text,
    risk_level character varying(50),
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    is_active boolean DEFAULT true
);


ALTER TABLE public.grc_controls OWNER TO grc_user;

--
-- TOC entry 224 (class 1259 OID 80589)
-- Name: grc_frameworks; Type: TABLE; Schema: public; Owner: grc_user
--

CREATE TABLE public.grc_frameworks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    framework_code character varying(100) NOT NULL,
    name character varying(500) NOT NULL,
    name_ar character varying(500),
    description text,
    description_ar text,
    version character varying(50),
    status character varying(50) DEFAULT 'active'::character varying,
    framework_type character varying(100),
    category character varying(100),
    issuing_authority character varying(200),
    publication_date date,
    effective_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    is_active boolean DEFAULT true
);


ALTER TABLE public.grc_frameworks OWNER TO grc_user;

--
-- TOC entry 221 (class 1259 OID 80513)
-- Name: organizations; Type: TABLE; Schema: public; Owner: grc_user
--

CREATE TABLE public.organizations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    name character varying(255) NOT NULL,
    name_ar character varying(255),
    code character varying(50),
    type character varying(50),
    sector character varying(100),
    size character varying(50),
    country character varying(100) DEFAULT 'Saudi Arabia'::character varying,
    city character varying(100),
    address text,
    phone character varying(50),
    email character varying(255),
    website character varying(255),
    logo_url text,
    status character varying(50) DEFAULT 'active'::character varying,
    settings jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    is_active boolean DEFAULT true,
    description text,
    industry character varying(100)
);


ALTER TABLE public.organizations OWNER TO grc_user;

--
-- TOC entry 220 (class 1259 OID 80500)
-- Name: tenants; Type: TABLE; Schema: public; Owner: grc_user
--

CREATE TABLE public.tenants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    name_ar character varying(255),
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.tenants OWNER TO grc_user;

--
-- TOC entry 222 (class 1259 OID 80532)
-- Name: users; Type: TABLE; Schema: public; Owner: grc_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    organization_id uuid,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    first_name character varying(100),
    last_name character varying(100),
    full_name_ar character varying(200),
    phone character varying(50),
    role character varying(50) DEFAULT 'user'::character varying,
    permissions jsonb DEFAULT '[]'::jsonb,
    status character varying(50) DEFAULT 'active'::character varying,
    last_login timestamp with time zone,
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    preferences jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    is_active boolean DEFAULT true,
    avatar_url text,
    department character varying(100),
    job_title character varying(100)
);


ALTER TABLE public.users OWNER TO grc_user;

--
-- TOC entry 5091 (class 0 OID 80633)
-- Dependencies: 226
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: grc_user
--

COPY public.activities (id, tenant_id, title, description, activity_type, entity_type, entity_id, user_id, metadata, created_at, updated_at, created_by, updated_by) FROM stdin;
18ea4d52-a8ea-45b6-b130-ec83e0da0087	42c676e2-8d5e-4b1d-ae80-3986b82dd5c5	System Initialized	GRC system has been initialized	system	system	\N	\N	{}	2025-11-11 19:11:21.392977+03	2025-11-11 19:11:21.392977+03	\N	\N
44ca421f-fa47-42d2-bc1a-f5402037abc1	42c676e2-8d5e-4b1d-ae80-3986b82dd5c5	Database Migration Completed	Database schema migration completed successfully	migration	system	\N	\N	{}	2025-11-11 19:11:21.392977+03	2025-11-11 19:11:21.392977+03	\N	\N
9bec5ac6-46f0-472f-a6ca-c175a1bef4bb	42c676e2-8d5e-4b1d-ae80-3986b82dd5c5	Tenant Setup	Default tenant has been configured	setup	tenant	\N	\N	{}	2025-11-11 19:11:21.392977+03	2025-11-11 19:11:21.392977+03	\N	\N
d75544fd-0fec-43ae-ade5-994b3b51864d	42c676e2-8d5e-4b1d-ae80-3986b82dd5c5	Database Schema Updated	Database schema has been updated for API compatibility	system	\N	\N	\N	{}	2025-11-11 19:19:03.084967+03	2025-11-11 19:19:03.084967+03	\N	\N
\.


--
-- TOC entry 5088 (class 0 OID 80563)
-- Dependencies: 223
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: grc_user
--

COPY public.assessments (id, tenant_id, organization_id, title, title_ar, description, description_ar, framework_id, assessment_type, status, due_date, completion_date, score, total_questions, answered_questions, compliance_level, risk_level, findings, recommendations, metadata, created_at, updated_at, created_by, updated_by, is_active) FROM stdin;
\.


--
-- TOC entry 5090 (class 0 OID 80607)
-- Dependencies: 225
-- Data for Name: grc_controls; Type: TABLE DATA; Schema: public; Owner: grc_user
--

COPY public.grc_controls (id, tenant_id, framework_id, control_code, title, title_ar, description, description_ar, control_type, category, subcategory, implementation_guidance, implementation_guidance_ar, compliance_requirements, compliance_requirements_ar, risk_level, status, created_at, updated_at, created_by, updated_by, is_active) FROM stdin;
\.


--
-- TOC entry 5089 (class 0 OID 80589)
-- Dependencies: 224
-- Data for Name: grc_frameworks; Type: TABLE DATA; Schema: public; Owner: grc_user
--

COPY public.grc_frameworks (id, tenant_id, framework_code, name, name_ar, description, description_ar, version, status, framework_type, category, issuing_authority, publication_date, effective_date, created_at, updated_at, created_by, updated_by, is_active) FROM stdin;
\.


--
-- TOC entry 5086 (class 0 OID 80513)
-- Dependencies: 221
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: grc_user
--

COPY public.organizations (id, tenant_id, name, name_ar, code, type, sector, size, country, city, address, phone, email, website, logo_url, status, settings, metadata, created_at, updated_at, created_by, updated_by, is_active, description, industry) FROM stdin;
be0db09c-e242-4990-bc95-b20347ad1810	42c676e2-8d5e-4b1d-ae80-3986b82dd5c5	Sample Organization	منظمة نموذجية	SAMPLE-001	Private	Technology	\N	Saudi Arabia	Riyadh	\N	\N	\N	\N	\N	active	{}	{}	2025-11-11 19:18:53.158257+03	2025-11-11 19:18:53.158257+03	\N	\N	t	Sample organization for testing	Technology
\.


--
-- TOC entry 5085 (class 0 OID 80500)
-- Dependencies: 220
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: grc_user
--

COPY public.tenants (id, tenant_code, name, name_ar, status, created_at, updated_at, created_by, updated_by) FROM stdin;
42c676e2-8d5e-4b1d-ae80-3986b82dd5c5	DEFAULT	Default Tenant	المستأجر الافتراضي	active	2025-11-11 19:05:26.720781+03	2025-11-11 19:05:26.720781+03	\N	\N
\.


--
-- TOC entry 5087 (class 0 OID 80532)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: grc_user
--

COPY public.users (id, tenant_id, organization_id, username, email, password_hash, first_name, last_name, full_name_ar, phone, role, permissions, status, last_login, email_verified, phone_verified, preferences, metadata, created_at, updated_at, created_by, updated_by, is_active, avatar_url, department, job_title) FROM stdin;
\.


--
-- TOC entry 4929 (class 2606 OID 80643)
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 80578)
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 80617)
-- Name: grc_controls grc_controls_pkey; Type: CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.grc_controls
    ADD CONSTRAINT grc_controls_pkey PRIMARY KEY (id);


--
-- TOC entry 4923 (class 2606 OID 80601)
-- Name: grc_frameworks grc_frameworks_framework_code_key; Type: CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.grc_frameworks
    ADD CONSTRAINT grc_frameworks_framework_code_key UNIQUE (framework_code);


--
-- TOC entry 4925 (class 2606 OID 80599)
-- Name: grc_frameworks grc_frameworks_pkey; Type: CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.grc_frameworks
    ADD CONSTRAINT grc_frameworks_pkey PRIMARY KEY (id);


--
-- TOC entry 4913 (class 2606 OID 80526)
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4909 (class 2606 OID 80510)
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- TOC entry 4911 (class 2606 OID 80512)
-- Name: tenants tenants_tenant_code_key; Type: CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_tenant_code_key UNIQUE (tenant_code);


--
-- TOC entry 4915 (class 2606 OID 80552)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4917 (class 2606 OID 80548)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 80550)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4938 (class 2606 OID 80644)
-- Name: activities activities_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 4939 (class 2606 OID 80649)
-- Name: activities activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4933 (class 2606 OID 80584)
-- Name: assessments assessments_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 4934 (class 2606 OID 80579)
-- Name: assessments assessments_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 4936 (class 2606 OID 80623)
-- Name: grc_controls grc_controls_framework_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.grc_controls
    ADD CONSTRAINT grc_controls_framework_id_fkey FOREIGN KEY (framework_id) REFERENCES public.grc_frameworks(id);


--
-- TOC entry 4937 (class 2606 OID 80618)
-- Name: grc_controls grc_controls_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.grc_controls
    ADD CONSTRAINT grc_controls_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 4935 (class 2606 OID 80602)
-- Name: grc_frameworks grc_frameworks_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.grc_frameworks
    ADD CONSTRAINT grc_frameworks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 4930 (class 2606 OID 80527)
-- Name: organizations organizations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 4931 (class 2606 OID 80558)
-- Name: users users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 4932 (class 2606 OID 80553)
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grc_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


-- Completed on 2025-11-11 19:28:19

--
-- PostgreSQL database dump complete
--

