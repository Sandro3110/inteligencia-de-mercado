-- Correção dos índices que falharam

-- AUDIT_LOGS (campos corretos: action, endpoint, created_at)
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_endpoint ON audit_logs(endpoint);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_endpoint_created_at ON audit_logs(endpoint, created_at);

-- DATA_AUDIT_LOGS (campos corretos: operacao, created_at)
CREATE INDEX idx_data_audit_logs_operacao ON data_audit_logs(operacao);
CREATE INDEX idx_data_audit_logs_created_at ON data_audit_logs(created_at);
