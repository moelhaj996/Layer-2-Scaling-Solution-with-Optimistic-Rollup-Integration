-- L2 Scaling Solution - Initial Database Schema
-- Flyway Migration V1

-- ==============================================================================
-- L1 Transactions Table
-- ==============================================================================
CREATE TABLE l1_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,
    deposit_id BIGINT,
    block_number BIGINT NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    gas_used BIGINT,
    gas_price NUMERIC(78, 0),
    timestamp TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_l1_tx_hash ON l1_transactions(transaction_hash);
CREATE INDEX idx_l1_from_address ON l1_transactions(from_address);
CREATE INDEX idx_l1_timestamp ON l1_transactions(timestamp);
CREATE INDEX idx_l1_event_type ON l1_transactions(event_type);

COMMENT ON TABLE l1_transactions IS 'Stores all L1 bridge transactions';
COMMENT ON COLUMN l1_transactions.event_type IS 'Type of event: DEPOSIT or WITHDRAWAL';

-- ==============================================================================
-- L2 Transactions Table
-- ==============================================================================
CREATE TABLE l2_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42),
    to_address VARCHAR(42) NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,
    deposit_id BIGINT,
    withdrawal_id BIGINT,
    block_number BIGINT NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    gas_used BIGINT,
    gas_price NUMERIC(78, 0),
    timestamp TIMESTAMP NOT NULL,
    linked_l1_tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_l2_tx_hash ON l2_transactions(transaction_hash);
CREATE INDEX idx_l2_to_address ON l2_transactions(to_address);
CREATE INDEX idx_l2_linked_l1 ON l2_transactions(linked_l1_tx_hash);
CREATE INDEX idx_l2_timestamp ON l2_transactions(timestamp);
CREATE INDEX idx_l2_event_type ON l2_transactions(event_type);

COMMENT ON TABLE l2_transactions IS 'Stores all L2 bridge transactions';
COMMENT ON COLUMN l2_transactions.event_type IS 'Type of event: DEPOSIT_FINALIZED or WITHDRAWAL_INITIATED';
COMMENT ON COLUMN l2_transactions.linked_l1_tx_hash IS 'Links L2 transaction to originating L1 transaction';

-- ==============================================================================
-- Gas Analytics Table
-- ==============================================================================
CREATE TABLE gas_analytics (
    id BIGSERIAL PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL,
    l1_gas_cost_wei VARCHAR(78) NOT NULL,
    l2_gas_cost_wei VARCHAR(78) NOT NULL,
    l1_gas_cost_eth NUMERIC(20, 10) NOT NULL,
    l2_gas_cost_eth NUMERIC(20, 10) NOT NULL,
    savings_percentage NUMERIC(5, 2) NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

CREATE INDEX idx_gas_operation_type ON gas_analytics(operation_type);
CREATE INDEX idx_gas_timestamp ON gas_analytics(timestamp);

COMMENT ON TABLE gas_analytics IS 'Stores gas cost comparisons between L1 and L2';
COMMENT ON COLUMN gas_analytics.operation_type IS 'Type of operation: ERC20_TRANSFER, BRIDGE_DEPOSIT, etc.';
COMMENT ON COLUMN gas_analytics.savings_percentage IS 'Percentage savings on L2 vs L1';

-- ==============================================================================
-- Bridge Events Table (for audit trail)
-- ==============================================================================
CREATE TABLE bridge_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    layer VARCHAR(5) NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    amount NUMERIC(78, 0),
    deposit_id BIGINT,
    withdrawal_id BIGINT,
    event_data JSONB,
    processed BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP NOT NULL
);

CREATE INDEX idx_event_type ON bridge_events(event_type);
CREATE INDEX idx_layer ON bridge_events(layer);
CREATE INDEX idx_processed ON bridge_events(processed);
CREATE INDEX idx_event_timestamp ON bridge_events(timestamp);
CREATE INDEX idx_event_tx_hash ON bridge_events(transaction_hash);

COMMENT ON TABLE bridge_events IS 'Raw event log for all bridge activities';
COMMENT ON COLUMN bridge_events.layer IS 'L1 or L2';
COMMENT ON COLUMN bridge_events.processed IS 'Whether this event has been processed by relayer';
COMMENT ON COLUMN bridge_events.event_data IS 'Raw event data in JSON format for debugging';

-- ==============================================================================
-- System Metadata Table (for tracking sync state)
-- ==============================================================================
CREATE TABLE system_metadata (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_metadata (key, value) VALUES
    ('l1_last_synced_block', '0'),
    ('l2_last_synced_block', '0'),
    ('schema_version', '1');

COMMENT ON TABLE system_metadata IS 'Stores system state and configuration';

-- ==============================================================================
-- Views for Analytics
-- ==============================================================================

-- View: Recent Gas Savings (Last 24 Hours)
CREATE VIEW recent_gas_savings AS
SELECT
    operation_type,
    AVG(savings_percentage) as avg_savings,
    COUNT(*) as sample_count,
    MAX(timestamp) as last_updated
FROM gas_analytics
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY operation_type;

-- View: Daily Transaction Summary
CREATE VIEW daily_transaction_summary AS
SELECT
    DATE(timestamp) as date,
    'L1' as layer,
    event_type,
    COUNT(*) as transaction_count,
    SUM(amount::NUMERIC) as total_volume
FROM l1_transactions
GROUP BY DATE(timestamp), event_type
UNION ALL
SELECT
    DATE(timestamp) as date,
    'L2' as layer,
    event_type,
    COUNT(*) as transaction_count,
    SUM(amount::NUMERIC) as total_volume
FROM l2_transactions
GROUP BY DATE(timestamp), event_type;

-- View: Bridge Health Status
CREATE VIEW bridge_health_status AS
SELECT
    (SELECT COUNT(*) FROM l1_transactions WHERE timestamp >= NOW() - INTERVAL '1 hour') as l1_txns_last_hour,
    (SELECT COUNT(*) FROM l2_transactions WHERE timestamp >= NOW() - INTERVAL '1 hour') as l2_txns_last_hour,
    (SELECT value FROM system_metadata WHERE key = 'l1_last_synced_block') as l1_sync_block,
    (SELECT value FROM system_metadata WHERE key = 'l2_last_synced_block') as l2_sync_block,
    (SELECT AVG(savings_percentage) FROM gas_analytics WHERE timestamp >= NOW() - INTERVAL '24 hours') as avg_24h_savings;

COMMENT ON VIEW bridge_health_status IS 'Quick overview of bridge system health';

-- ==============================================================================
-- Functions
-- ==============================================================================

-- Function to calculate total savings
CREATE OR REPLACE FUNCTION calculate_total_savings()
RETURNS TABLE(
    total_l1_cost NUMERIC,
    total_l2_cost NUMERIC,
    total_savings NUMERIC,
    avg_savings_pct NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        SUM(l1_gas_cost_eth)::NUMERIC as total_l1_cost,
        SUM(l2_gas_cost_eth)::NUMERIC as total_l2_cost,
        (SUM(l1_gas_cost_eth) - SUM(l2_gas_cost_eth))::NUMERIC as total_savings,
        AVG(savings_percentage)::NUMERIC as avg_savings_pct
    FROM gas_analytics;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- Grants (for read-only user, if needed)
-- ==============================================================================
-- Uncomment and modify for production:
-- CREATE USER l2_readonly WITH PASSWORD 'secure_password';
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO l2_readonly;
-- GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO l2_readonly;
