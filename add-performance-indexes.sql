CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);  
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);  
CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON tasks(tenant_id);  
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_status ON tasks(tenant_id, status);  
