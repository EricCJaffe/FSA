-- ============================================================
-- BusinessOS FSA — Initial Schema
-- Phase 1: Property Intelligence Platform
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'family_office_admin',  -- Tier 1: God mode
  'org_admin',            -- Tier 2: Full access within org
  'org_viewer',           -- Tier 3: Read-only within org
  'advisor'               -- Tier 4: Analytical access, no equity data
);

CREATE TYPE property_type AS ENUM ('ltr', 'str');

CREATE TYPE sync_status AS ENUM ('pending', 'running', 'success', 'failed');

CREATE TYPE insight_type AS ENUM (
  'property_health',
  'portfolio_observation',
  'anomaly_flag',
  'benchmark_comparison',
  'hold_sell_recommendation',
  'monthly_narrative'
);

CREATE TYPE anomaly_type AS ENUM ('point', 'contextual', 'structural');

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

CREATE TABLE orgs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER → ORG ROLES (RBAC)
-- ============================================================

CREATE TABLE user_org_roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id     UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  role       user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- ============================================================
-- PROPERTIES
-- ============================================================

CREATE TABLE properties (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  address               TEXT,
  city                  TEXT,
  state                 TEXT,
  zip                   TEXT,
  property_type         property_type NOT NULL,
  purchase_price        NUMERIC(14, 2),
  purchase_date         DATE,
  current_market_value  NUMERIC(14, 2),
  ownership_pct         NUMERIC(5, 4),             -- e.g. 1.0000 = 100%
  mortgage_balance      NUMERIC(14, 2),
  mortgage_rate         NUMERIC(6, 4),
  mortgage_payment      NUMERIC(10, 2),
  qbo_class_id          TEXT,                       -- QuickBooks class mapping
  qbo_class_name        TEXT,
  notes                 TEXT,
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QUICKBOOKS ONLINE CONNECTIONS
-- ============================================================

CREATE TABLE qbo_connections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
  realm_id        TEXT NOT NULL,                    -- QBO company ID
  access_token    TEXT,                             -- encrypted in Vault ideally
  refresh_token   TEXT,
  token_expires_at TIMESTAMPTZ,
  connected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  connected_by    UUID REFERENCES auth.users(id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QBO SYNC RECORDS
-- ============================================================

CREATE TABLE qbo_sync_records (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id       UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  triggered_by UUID REFERENCES auth.users(id),
  status       sync_status NOT NULL DEFAULT 'pending',
  sync_type    TEXT NOT NULL,                       -- 'manual' | 'scheduled'
  period_start DATE,
  period_end   DATE,
  records_synced INTEGER,
  error_message  TEXT,
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FINANCIAL DATA (synced from QBO)
-- ============================================================

CREATE TABLE financial_line_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id       UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  property_id  UUID REFERENCES properties(id) ON DELETE SET NULL,
  sync_id      UUID REFERENCES qbo_sync_records(id) ON DELETE SET NULL,
  period_date  DATE NOT NULL,                       -- month of record
  account_name TEXT NOT NULL,
  account_type TEXT,                                -- income | expense | asset | liability
  amount       NUMERIC(14, 2) NOT NULL,
  qbo_account_id TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MONTHLY REPORTS
-- ============================================================

CREATE TABLE monthly_reports (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  property_id   UUID REFERENCES properties(id) ON DELETE SET NULL,  -- NULL = portfolio-level
  period_year   SMALLINT NOT NULL,
  period_month  SMALLINT NOT NULL,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by  UUID REFERENCES auth.users(id),
  summary_json  JSONB,                              -- computed metrics snapshot
  published     BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(org_id, property_id, period_year, period_month)
);

-- ============================================================
-- AI INSIGHTS
-- ============================================================

CREATE TABLE ai_insights (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  property_id   UUID REFERENCES properties(id) ON DELETE SET NULL,
  report_id     UUID REFERENCES monthly_reports(id) ON DELETE SET NULL,
  insight_type  insight_type NOT NULL,
  anomaly_type  anomaly_type,
  model_used    TEXT NOT NULL,
  prompt_hash   TEXT,                               -- for dedup / caching
  content       TEXT NOT NULL,
  severity      SMALLINT,                           -- 1–5 for anomaly flags
  context_json  JSONB,                              -- input data snapshot
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  org_id      UUID REFERENCES orgs(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_user_org_roles_user_id ON user_org_roles(user_id);
CREATE INDEX idx_user_org_roles_org_id  ON user_org_roles(org_id);
CREATE INDEX idx_properties_org_id      ON properties(org_id);
CREATE INDEX idx_financial_line_items_org_property_period
  ON financial_line_items(org_id, property_id, period_date);
CREATE INDEX idx_monthly_reports_org_period
  ON monthly_reports(org_id, period_year, period_month);
CREATE INDEX idx_ai_insights_org_property
  ON ai_insights(org_id, property_id);
CREATE INDEX idx_audit_log_user_org
  ON audit_log(user_id, org_id, created_at);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_orgs
  BEFORE UPDATE ON orgs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_properties
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_qbo_connections
  BEFORE UPDATE ON qbo_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE orgs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_org_roles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties            ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbo_connections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbo_sync_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_line_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log             ENABLE ROW LEVEL SECURITY;

-- Helper: check if the current user has a role in an org
CREATE OR REPLACE FUNCTION user_has_org_role(p_org_id UUID, p_roles user_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_org_roles
    WHERE user_id = auth.uid()
      AND org_id  = p_org_id
      AND role    = ANY(p_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is family_office_admin in any org
CREATE OR REPLACE FUNCTION is_family_office_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_org_roles
    WHERE user_id = auth.uid()
      AND role    = 'family_office_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ORGS: visible to members + family_office_admin
CREATE POLICY "orgs_select" ON orgs FOR SELECT
  USING (
    is_family_office_admin()
    OR EXISTS (
      SELECT 1 FROM user_org_roles
      WHERE user_id = auth.uid() AND org_id = orgs.id
    )
  );

-- USER_ORG_ROLES: users see their own rows; admins see all in their org
CREATE POLICY "user_org_roles_select" ON user_org_roles FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_family_office_admin()
    OR user_has_org_role(org_id, ARRAY['org_admin']::user_role[])
  );

-- PROPERTIES: visible to any org member
CREATE POLICY "properties_select" ON properties FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','org_viewer','advisor']::user_role[]));

CREATE POLICY "properties_insert_update" ON properties FOR ALL
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin']::user_role[]));

-- FINANCIAL_LINE_ITEMS: readable by all org members
CREATE POLICY "financials_select" ON financial_line_items FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','org_viewer','advisor']::user_role[]));

-- MONTHLY_REPORTS: readable by all org members
CREATE POLICY "reports_select" ON monthly_reports FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','org_viewer','advisor']::user_role[]));

-- AI_INSIGHTS: readable by all org members
CREATE POLICY "insights_select" ON ai_insights FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','org_viewer','advisor']::user_role[]));

-- AUDIT_LOG: family_office_admin and org_admin only
CREATE POLICY "audit_select" ON audit_log FOR SELECT
  USING (
    is_family_office_admin()
    OR (org_id IS NOT NULL AND user_has_org_role(org_id, ARRAY['org_admin']::user_role[]))
  );

-- ============================================================
-- SEED: default "Property Portfolio" org
-- ============================================================

INSERT INTO orgs (id, name, slug, description)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Property Portfolio',
  'property-portfolio',
  'Jacksonville real estate portfolio — 4 LTR + 1 STR'
);
