-- ============================================================================
-- VECTOR DATABASE SETUP FOR SHAHIN-AI
-- PostgreSQL with pgvector extension for AI embeddings
-- ============================================================================

-- Create database with vector support
CREATE DATABASE IF NOT EXISTS shahin_vector_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

\c shahin_vector_db;

-- Enable pgvector extension (requires PostgreSQL 12+)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- VECTOR TABLES FOR AI/ML EMBEDDINGS
-- ============================================================================

-- Document Embeddings Table (OpenAI text-embedding-ada-002 = 1536 dimensions)
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id VARCHAR(255) NOT NULL,
    chunk_id VARCHAR(255),
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 embeddings

    -- Metadata for search and filtering
    document_type VARCHAR(50), -- assessment, policy, evidence, etc.
    category VARCHAR(100),
    tags TEXT[], -- Array of tags
    language VARCHAR(10) DEFAULT 'ar',
    source_system VARCHAR(100),

    -- Processing metadata
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model_version VARCHAR(50) DEFAULT 'text-embedding-ada-002',
    confidence_score DECIMAL(3,2),

    -- Search optimization
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_document_type (document_type),
    INDEX idx_category (category),
    INDEX idx_language (language),
    INDEX idx_tags (tags),
    INDEX idx_embedding_cosine (embedding vector_cosine_ops), -- Cosine similarity
    INDEX idx_embedding_l2 (embedding vector_l2_ops),       -- L2 distance
    INDEX idx_embedding_ip (embedding vector_ip_ops)        -- Inner product
);

-- Conversation Embeddings Table
CREATE TABLE conversation_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR(255) NOT NULL,
    message_id VARCHAR(255) NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT,
    embedding vector(1536),

    -- Context and memory
    intent VARCHAR(100),
    confidence DECIMAL(3,2),
    sentiment VARCHAR(20),
    language VARCHAR(10) DEFAULT 'ar',

    -- Session tracking
    session_id VARCHAR(255),
    user_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_conversation (conversation_id),
    INDEX idx_user (user_id),
    INDEX idx_intent (intent),
    INDEX idx_timestamp (timestamp),
    INDEX idx_embedding_cosine (embedding vector_cosine_ops)
);

-- User Behavior Embeddings (for personalization)
CREATE TABLE user_behavior_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- view, search, assessment, etc.
    action_data JSONB,
    embedding vector(768), -- Smaller for behavior patterns

    -- Context
    session_id VARCHAR(255),
    page_url VARCHAR(500),
    user_agent TEXT,
    ip_address INET,

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_action (user_id, action_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_embedding_cosine (embedding vector_cosine_ops)
);

-- Assessment Pattern Embeddings (for AI recommendations)
CREATE TABLE assessment_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    pattern_vector vector(1536),

    -- Pattern metadata
    framework VARCHAR(100),
    risk_level VARCHAR(20),
    industry VARCHAR(100),
    compliance_area VARCHAR(100),

    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    confidence DECIMAL(3,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_framework (framework),
    INDEX idx_risk_level (risk_level),
    INDEX idx_industry (industry),
    INDEX idx_usage (usage_count),
    INDEX idx_embedding_cosine (pattern_vector vector_cosine_ops)
);

-- Regulatory Intelligence Embeddings
CREATE TABLE regulatory_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),

    -- Regulatory metadata
    source VARCHAR(100), -- SAMA, NCA, MOH, etc.
    category VARCHAR(100), -- banking, insurance, etc.
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    language VARCHAR(10) DEFAULT 'ar',

    -- Regulatory details
    published_at DATE,
    effective_date DATE,
    document_type VARCHAR(50),
    regulatory_authority VARCHAR(100),
    risk_level VARCHAR(20),

    -- Tags for search
    tags TEXT[],
    keywords TEXT[],

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_source (source),
    INDEX idx_category (category),
    INDEX idx_country (country),
    INDEX idx_published (published_at),
    INDEX idx_effective (effective_date),
    INDEX idx_risk_level (risk_level),
    INDEX idx_tags (tags),
    INDEX idx_embedding_cosine (embedding vector_cosine_ops)
);

-- Compliance Control Embeddings
CREATE TABLE compliance_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id VARCHAR(100) NOT NULL,
    framework VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    requirements TEXT,
    embedding vector(1536),

    -- Control metadata
    category VARCHAR(100),
    subcategory VARCHAR(100),
    risk_level VARCHAR(20),
    implementation_complexity VARCHAR(20),

    -- Evidence types
    evidence_types TEXT[],
    testing_procedures TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_control (control_id),
    INDEX idx_framework (framework),
    INDEX idx_category (category),
    INDEX idx_risk_level (risk_level),
    INDEX idx_embedding_cosine (embedding vector_cosine_ops)
);

-- ============================================================================
-- SEARCH FUNCTIONS
-- ============================================================================

-- Function for cosine similarity search
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS float AS $$
    SELECT 1 - (a <=> b);
$$ LANGUAGE sql IMMUTABLE;

-- Function for semantic search
CREATE OR REPLACE FUNCTION semantic_search(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    max_results int DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    similarity float,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        de.id,
        de.content,
        cosine_similarity(de.embedding, query_embedding) as similarity,
        jsonb_build_object(
            'document_type', de.document_type,
            'category', de.category,
            'tags', de.tags,
            'language', de.language,
            'confidence_score', de.confidence_score
        ) as metadata
    FROM document_embeddings de
    WHERE cosine_similarity(de.embedding, query_embedding) > match_threshold
    ORDER BY cosine_similarity(de.embedding, query_embedding) DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function for conversation context search
CREATE OR REPLACE FUNCTION find_similar_conversations(
    query_embedding vector(1536),
    user_id_filter VARCHAR(255) DEFAULT NULL,
    days_back int DEFAULT 30,
    max_results int DEFAULT 5
)
RETURNS TABLE (
    conversation_id VARCHAR(255),
    user_message TEXT,
    ai_response TEXT,
    similarity float,
    timestamp TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ce.conversation_id,
        ce.user_message,
        ce.ai_response,
        cosine_similarity(ce.embedding, query_embedding) as similarity,
        ce.timestamp
    FROM conversation_embeddings ce
    WHERE (user_id_filter IS NULL OR ce.user_id = user_id_filter)
      AND ce.timestamp > NOW() - INTERVAL '1 day' * days_back
    ORDER BY cosine_similarity(ce.embedding, query_embedding) DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VECTOR OPERATIONS
-- ============================================================================

-- Function to normalize vectors
CREATE OR REPLACE FUNCTION normalize_vector(v vector)
RETURNS vector AS $$
    SELECT v / sqrt(v <#> v) as normalized_vector;
$$ LANGUAGE sql IMMUTABLE;

-- Function to get vector statistics
CREATE OR REPLACE FUNCTION get_vector_stats(table_name TEXT)
RETURNS TABLE (
    total_vectors BIGINT,
    avg_similarity FLOAT,
    min_similarity FLOAT,
    max_similarity FLOAT
) AS $$
DECLARE
    sql_query TEXT;
BEGIN
    sql_query := format('
        SELECT
            COUNT(*) as total_vectors,
            AVG(cosine_similarity) as avg_similarity,
            MIN(cosine_similarity) as min_similarity,
            MAX(cosine_similarity) as max_similarity
        FROM (
            SELECT cosine_similarity(embedding, embedding) as cosine_similarity
            FROM %I
            TABLESAMPLE BERNOULLI(10) -- Sample 10% for performance
        ) stats
    ', table_name);

    RETURN QUERY EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATA POPULATION EXAMPLES
-- ============================================================================

-- Insert sample regulatory intelligence
INSERT INTO regulatory_embeddings (
    title, content, embedding, source, category, tags, published_at, risk_level
) VALUES (
    'NCA Cybersecurity Framework Update 2023',
    'الهيئة الوطنية للأمن السيبراني تعلن تحديث إطار الأمن السيبراني للعام 2023...',
    '[0.1, 0.2, 0.3, ...]'::vector, -- Placeholder for actual embedding
    'NCA',
    'cybersecurity',
    ARRAY['cybersecurity', 'framework', 'update', '2023'],
    '2023-01-15',
    'high'
);

-- Insert sample compliance control
INSERT INTO compliance_embeddings (
    control_id, framework, title, description, embedding, category, risk_level
) VALUES (
    'NCA-1-1-1',
    'NCA-ESSENTIAL',
    'Cybersecurity Governance Framework',
    'Establish a comprehensive cybersecurity governance framework...',
    '[0.1, 0.2, 0.3, ...]'::vector, -- Placeholder for actual embedding
    'Governance',
    'critical'
);

-- ============================================================================
-- PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Create partial indexes for better performance
CREATE INDEX idx_regulatory_active ON regulatory_embeddings(published_at) WHERE published_at > '2020-01-01';
CREATE INDEX idx_compliance_framework ON compliance_embeddings(framework, risk_level);

-- Vacuum and analyze for optimization
VACUUM ANALYZE document_embeddings;
VACUUM ANALYZE conversation_embeddings;
VACUUM ANALYZE regulatory_embeddings;
VACUUM ANALYZE compliance_embeddings;

-- ============================================================================
-- MONITORING AND MAINTENANCE
-- ============================================================================

-- Table for vector database statistics
CREATE TABLE vector_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    total_vectors BIGINT,
    avg_similarity DECIMAL(5,4),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_table (table_name),
    INDEX idx_updated (last_updated)
);

-- Function to update statistics
CREATE OR REPLACE FUNCTION update_vector_stats()
RETURNS void AS $$
BEGIN
    -- Clear old stats
    DELETE FROM vector_stats WHERE last_updated < NOW() - INTERVAL '1 day';

    -- Insert new stats for each table
    INSERT INTO vector_stats (table_name, total_vectors, avg_similarity)
    SELECT 'document_embeddings', COUNT(*), AVG(cosine_similarity(embedding, embedding))
    FROM document_embeddings;

    INSERT INTO vector_stats (table_name, total_vectors, avg_similarity)
    SELECT 'conversation_embeddings', COUNT(*), AVG(cosine_similarity(embedding, embedding))
    FROM conversation_embeddings;

    INSERT INTO vector_stats (table_name, total_vectors, avg_similarity)
    SELECT 'regulatory_embeddings', COUNT(*), AVG(cosine_similarity(embedding, embedding))
    FROM regulatory_embeddings;

    INSERT INTO vector_stats (table_name, total_vectors, avg_similarity)
    SELECT 'compliance_embeddings', COUNT(*), AVG(cosine_similarity(embedding, embedding))
    FROM compliance_embeddings;
END;
$$ LANGUAGE plpgsql;

-- Schedule statistics update (would be called by cron job)
-- SELECT update_vector_stats();

COMMIT;

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================

/*
Vector Database Usage:

1. Generate embeddings using OpenAI API:
   POST https://api.openai.com/v1/embeddings
   {
     "input": "your text here",
     "model": "text-embedding-ada-002"
   }

2. Store embeddings:
   INSERT INTO document_embeddings (document_id, content, embedding, document_type)
   VALUES ('doc-123', 'content...', '[0.1, 0.2, ...]'::vector, 'policy');

3. Semantic search:
   SELECT * FROM semantic_search('[0.1, 0.2, ...]'::vector, 0.8, 10);

4. Similar conversations:
   SELECT * FROM find_similar_conversations('[0.1, 0.2, ...]'::vector, 'user-123', 30, 5);

Performance Tips:
- Use appropriate vector dimensions (1536 for ada-002)
- Index on embedding column with vector_cosine_ops
- Use TABLESAMPLE for large datasets
- Regular VACUUM ANALYZE maintenance
*/
