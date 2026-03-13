-- Support multiple QBO company connections per org.
-- Change unique constraint from (org_id) to (org_id, realm_id).
ALTER TABLE qbo_connections DROP CONSTRAINT IF EXISTS qbo_connections_org_id_key;
ALTER TABLE qbo_connections ADD CONSTRAINT qbo_connections_org_realm_key UNIQUE (org_id, realm_id);

-- Add company_name column for display purposes
ALTER TABLE qbo_connections ADD COLUMN IF NOT EXISTS company_name text;
