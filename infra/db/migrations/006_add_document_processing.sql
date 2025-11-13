-- Migration 006: Add Document Processing and RAG System
-- Implements the unified data pipeline and knowledge management system

-- Documents table for canonical document storage
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Source information
    source VARCHAR(50) NOT NULL, -- upload, email, sharepoint, api
    original_filename VARCHAR(500),
    mime_type VARCHAR(100),
    file_size BIGINT,
    pages INTEGER,
    
    -- Language detection
    language VARCHAR(10),
    lang_confidence DECIMAL(3,2),
    
    -- Content
    extracted_text TEXT,
    
    -- Metadata (flexible JSON structure)
    metadata JSONB DEFAULT '{}',
    
    -- Processing information
    processing JSONB DEFAULT '{}',
    
    -- PII and security flags
    pii_flags JSONB DEFAULT '{}',
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'uploaded', -- uploaded, processing, processed, failed, indexed
    
    -- Storage paths
    raw_file_path TEXT,
    processed_file_path TEXT,
    
    -- Audit fields
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Document chunks for RAG system
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Chunk information
    chunk_index INTEGER NOT NULL,
    text TEXT NOT NULL,
    text_hash VARCHAR(64) NOT NULL,
    token_count INTEGER,
    
    -- Page information
    page_start INTEGER,
    page_end INTEGER,
    
    -- Embedding information
    embedding_model VARCHAR(100),
    embedding_vector_id VARCHAR(100), -- Reference to vector in external vector DB
    embedding_created_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Processing jobs table for async processing
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Job information
    job_type VARCHAR(50) NOT NULL, -- ocr, parse, chunk, embed, index
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
    priority INTEGER DEFAULT 5,
    
    -- Processing details
    config JSONB DEFAULT '{}',
    result JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Timing
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Worker information
    worker_id VARCHAR(100),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3
);

-- Search queries and results for analytics
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    -- Query information
    query_text TEXT NOT NULL,
    query_type VARCHAR(50) DEFAULT 'semantic', -- semantic, keyword, hybrid
    
    -- Search parameters
    search_params JSONB DEFAULT '{}',
    
    -- Results
    results_count INTEGER,
    results JSONB DEFAULT '[]',
    
    -- Performance metrics
    retrieval_time_ms INTEGER,
    rerank_time_ms INTEGER,
    total_time_ms INTEGER,
    
    -- Model information
    embedding_model VARCHAR(100),
    rerank_model VARCHAR(100),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RAG responses for provenance tracking
CREATE TABLE IF NOT EXISTS rag_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    search_query_id UUID REFERENCES search_queries(id),
    
    -- Request information
    question TEXT NOT NULL,
    prompt_template VARCHAR(100),
    
    -- Response
    answer TEXT,
    confidence_score DECIMAL(3,2),
    
    -- Model information
    model_name VARCHAR(100),
    model_tokens_used INTEGER,
    model_cost DECIMAL(10,4),
    
    -- Used chunks for provenance
    used_chunks JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Embedding models configuration
CREATE TABLE IF NOT EXISTS embedding_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200),
    provider VARCHAR(50), -- openai, google, local, huggingface
    model_id VARCHAR(200),
    dimensions INTEGER,
    max_tokens INTEGER,
    cost_per_1k_tokens DECIMAL(8,6),
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_tenant_id ON document_chunks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_text_hash ON document_chunks(text_hash);

CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_job_type ON processing_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_created_at ON processing_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_search_queries_tenant_id ON search_queries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at);

CREATE INDEX IF NOT EXISTS idx_rag_responses_tenant_id ON rag_responses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_responses_created_at ON rag_responses(created_at);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_chunks_updated_at ON document_chunks;
CREATE TRIGGER update_document_chunks_updated_at 
    BEFORE UPDATE ON document_chunks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default embedding models
INSERT INTO embedding_models (name, display_name, provider, model_id, dimensions, max_tokens, cost_per_1k_tokens) VALUES
('all-mpnet-base-v2', 'All-MiniLM-L6-v2 (Local)', 'local', 'sentence-transformers/all-mpnet-base-v2', 768, 512, 0.0),
('all-minilm-l6-v2', 'All-MiniLM-L6-v2 (Local)', 'local', 'sentence-transformers/all-MiniLM-L6-v2', 384, 512, 0.0),
('text-embedding-3-small', 'OpenAI Text Embedding 3 Small', 'openai', 'text-embedding-3-small', 1536, 8191, 0.00002),
('text-embedding-3-large', 'OpenAI Text Embedding 3 Large', 'openai', 'text-embedding-3-large', 3072, 8191, 0.00013),
('textembedding-gecko', 'Google Text Embedding Gecko', 'google', 'textembedding-gecko@003', 768, 3072, 0.0001)
ON CONFLICT (name) DO NOTHING;

-- Create function to get document processing status
CREATE OR REPLACE FUNCTION get_document_processing_status(p_document_id UUID)
RETURNS TABLE(
    document_id UUID,
    status VARCHAR(50),
    processing_steps JSONB,
    chunks_count INTEGER,
    indexed_chunks INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.status,
        d.processing,
        COUNT(dc.id)::INTEGER as chunks_count,
        COUNT(CASE WHEN dc.embedding_vector_id IS NOT NULL THEN 1 END)::INTEGER as indexed_chunks
    FROM documents d
    LEFT JOIN document_chunks dc ON d.id = dc.document_id
    WHERE d.id = p_document_id
    GROUP BY d.id, d.status, d.processing;
END;
$$ LANGUAGE plpgsql;

-- Create function to search documents by text
CREATE OR REPLACE FUNCTION search_documents_by_text(
    p_tenant_id UUID,
    p_query TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    document_id UUID,
    title TEXT,
    filename VARCHAR(500),
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        COALESCE(d.metadata->>'title', d.original_filename) as title,
        d.original_filename,
        ts_rank(to_tsvector('english', COALESCE(d.extracted_text, '')), plainto_tsquery('english', p_query)) as relevance
    FROM documents d
    WHERE d.tenant_id = p_tenant_id
    AND d.status = 'processed'
    AND to_tsvector('english', COALESCE(d.extracted_text, '')) @@ plainto_tsquery('english', p_query)
    ORDER BY relevance DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
