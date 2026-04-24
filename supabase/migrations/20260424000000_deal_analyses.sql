-- Deal Analyzer: store acquisition analyses
CREATE TABLE deal_analyses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES orgs(id),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Property info
  property_name   TEXT NOT NULL,
  property_address TEXT NOT NULL,
  property_type   TEXT NOT NULL CHECK (property_type IN ('sfh','townhouse','condo','duplex','multifamily')),
  year_built      INTEGER,
  beds            NUMERIC(3,1),
  baths           NUMERIC(3,1),
  sqft            INTEGER,
  county          TEXT,
  mls_number      TEXT,

  -- Deal economics
  list_price      INTEGER NOT NULL,
  all_in_cost     INTEGER NOT NULL,
  monthly_rent    INTEGER NOT NULL,
  hoa_monthly     INTEGER NOT NULL DEFAULT 0,
  annual_taxes    INTEGER,
  annual_insurance INTEGER,
  management_pct  NUMERIC(5,4) NOT NULL DEFAULT 0.08,
  annual_repairs  INTEGER,
  vacancy_pct     NUMERIC(5,4) NOT NULL DEFAULT 0.05,

  -- Computed results (stored at analysis time)
  computed_noi          INTEGER,
  computed_cash_on_cash NUMERIC(8,6),
  computed_gross_yield  NUMERIC(8,6),
  verdict               TEXT CHECK (verdict IN ('strong_recommend','recommend','negotiate','negotiate_marginal','pass','hard_pass')),
  verdict_reason        TEXT,
  target_offer_price    INTEGER,

  -- User annotations
  user_notes      TEXT,
  outcome         TEXT CHECK (outcome IN ('purchased','passed','negotiated_success','negotiated_failed','pending')),
  outcome_notes   TEXT
);

-- Indexes
CREATE INDEX idx_deal_analyses_org_id ON deal_analyses(org_id);
CREATE INDEX idx_deal_analyses_user_id ON deal_analyses(user_id);
CREATE INDEX idx_deal_analyses_created_at ON deal_analyses(created_at DESC);
CREATE INDEX idx_deal_analyses_verdict ON deal_analyses(verdict);

-- RLS
ALTER TABLE deal_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org deal analyses"
  ON deal_analyses FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM user_org_roles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can insert deal analyses"
  ON deal_analyses FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM user_org_roles
    WHERE user_id = auth.uid()
    AND role IN ('family_office_admin', 'org_admin')
  ));

CREATE POLICY "Admins can update deal analyses"
  ON deal_analyses FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM user_org_roles
    WHERE user_id = auth.uid()
    AND role IN ('family_office_admin', 'org_admin')
  ));

CREATE POLICY "Admins can delete deal analyses"
  ON deal_analyses FOR DELETE
  USING (org_id IN (
    SELECT org_id FROM user_org_roles
    WHERE user_id = auth.uid()
    AND role IN ('family_office_admin', 'org_admin')
  ));
