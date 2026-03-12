-- ============================================================
-- BusinessOS FSA — Migration 0002
-- Tenants, org type/ownership, and PM module schema
-- ============================================================

-- ============================================================
-- TENANTS
-- ============================================================

CREATE TABLE tenants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_tenants
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_select" ON tenants FOR SELECT
  USING (is_family_office_admin());

-- ============================================================
-- ORG TYPE + OWNERSHIP
-- ============================================================

CREATE TYPE org_type AS ENUM (
  'property_management',
  'field_services',
  'consulting',
  'client_saas',
  'client_tech',
  'client_ministry',
  'client_engagement',
  'family_office',
  'custom'
);

ALTER TABLE orgs
  ADD COLUMN tenant_id     UUID REFERENCES tenants(id) ON DELETE SET NULL,
  ADD COLUMN org_type      org_type NOT NULL DEFAULT 'custom',
  ADD COLUMN ownership_pct NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
  ADD COLUMN parent_org_id UUID REFERENCES orgs(id) ON DELETE SET NULL;

CREATE INDEX idx_orgs_tenant_id ON orgs(tenant_id);

-- ============================================================
-- SEED: Foundation Stone Advisors (tenant)
-- ============================================================

INSERT INTO tenants (id, name, slug, description)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Foundation Stone Advisors',
  'foundation-stone-advisors',
  'Family office — hub entity for all business units and client engagements'
);

-- ============================================================
-- UPDATE: Rename + type the Property Portfolio org
-- ============================================================

UPDATE orgs SET
  name        = 'Yarash Eretz Property Management',
  slug        = 'yarash-eretz',
  description = 'Jacksonville real estate portfolio — 4 LTR + 1 STR',
  tenant_id   = '00000000-0000-0000-0000-000000000010',
  org_type    = 'property_management',
  ownership_pct = 1.0000
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================================
-- SEED: Client orgs
-- ============================================================

INSERT INTO orgs (id, name, slug, description, tenant_id, org_type, ownership_pct)
VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    'Honey Lake Digital',
    'honey-lake-digital',
    'SaaS product rollout — PM client (0% ownership)',
    '00000000-0000-0000-0000-000000000010',
    'client_saas',
    0.0000
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'VakPak',
    'vakpak',
    'Tech stack modernization — PM client (0% ownership)',
    '00000000-0000-0000-0000-000000000010',
    'client_tech',
    0.0000
  );

-- ============================================================
-- PM MODULE SCHEMA
-- ============================================================

-- Project templates (DB-seeded, no code change needed for new types)
CREATE TABLE pm_project_templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  template_json JSONB NOT NULL DEFAULT '{}',  -- phase/task scaffold structure
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE pm_projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  template_slug TEXT REFERENCES pm_project_templates(slug) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  description   TEXT,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date    DATE,
  target_date   DATE,
  budget        NUMERIC(14, 2),
  status        TEXT NOT NULL DEFAULT 'active',  -- active | complete | paused | archived | on-hold
  raw_md        TEXT,          -- full PROJECT.md content
  storage_path  TEXT,          -- path in Supabase Storage
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, slug)
);

-- Phases
CREATE TABLE pm_phases (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id   UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  slug         TEXT NOT NULL,
  name         TEXT NOT NULL,
  phase_order  SMALLINT NOT NULL,
  phase_group  TEXT,           -- e.g. BUILD | GO-TO-MARKET | GROW | FOUNDATION (Template A)
  status       TEXT NOT NULL DEFAULT 'not-started',
  progress_pct SMALLINT NOT NULL DEFAULT 0,
  raw_md       TEXT,
  storage_path TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, slug)
);

-- Tasks
CREATE TABLE pm_tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  phase_id      UUID REFERENCES pm_phases(id) ON DELETE SET NULL,
  org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL,
  name          TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'not-started',
  due_date      DATE,
  depends_on    UUID[],        -- array of pm_tasks.id
  risk_ids      UUID[],        -- array of pm_risks.id
  notes         TEXT,
  raw_md        TEXT,
  storage_path  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, slug)
);

-- Risks
CREATE TABLE pm_risks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  level           TEXT NOT NULL DEFAULT 'MED',  -- HIGH | MED | LOW
  mitigation      TEXT,
  linked_task_ids UUID[],
  raw_md          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, slug)
);

-- Daily logs
CREATE TABLE pm_daily_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id   UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  org_id       UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  log_date     DATE NOT NULL,
  content      TEXT,
  raw_md       TEXT,
  storage_path TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, log_date)
);

-- Vault file index (all .md files in Storage, indexed for sync tracking)
CREATE TABLE pm_files (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID REFERENCES pm_projects(id) ON DELETE CASCADE,
  org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  file_type     TEXT NOT NULL,  -- project | phase | task | risk | daily | ai_report | resource | people
  file_path     TEXT NOT NULL,  -- Supabase Storage path
  file_name     TEXT NOT NULL,
  content_hash  TEXT,           -- SHA for change detection; drives sync decisions
  last_synced_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, file_path)
);

-- ============================================================
-- PM INDEXES
-- ============================================================

CREATE INDEX idx_pm_projects_org_id    ON pm_projects(org_id);
CREATE INDEX idx_pm_phases_project_id  ON pm_phases(project_id);
CREATE INDEX idx_pm_tasks_project_id   ON pm_tasks(project_id);
CREATE INDEX idx_pm_tasks_phase_id     ON pm_tasks(phase_id);
CREATE INDEX idx_pm_tasks_status       ON pm_tasks(status);
CREATE INDEX idx_pm_risks_project_id   ON pm_risks(project_id);
CREATE INDEX idx_pm_files_org_id       ON pm_files(org_id);
CREATE INDEX idx_pm_files_project_id   ON pm_files(project_id);

-- ============================================================
-- PM UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER set_updated_at_pm_projects
  BEFORE UPDATE ON pm_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_pm_phases
  BEFORE UPDATE ON pm_phases FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_pm_tasks
  BEFORE UPDATE ON pm_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_pm_risks
  BEFORE UPDATE ON pm_risks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_pm_files
  BEFORE UPDATE ON pm_files FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PM ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE pm_project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_projects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_phases             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_risks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_daily_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_files              ENABLE ROW LEVEL SECURITY;

-- Templates: readable by anyone authenticated
CREATE POLICY "pm_templates_select" ON pm_project_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Projects: readable by org members
CREATE POLICY "pm_projects_select" ON pm_projects FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','org_viewer','advisor']::user_role[]));

CREATE POLICY "pm_projects_write" ON pm_projects FOR ALL
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','advisor']::user_role[]));

CREATE POLICY "pm_phases_select" ON pm_phases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM pm_projects p
    WHERE p.id = pm_phases.project_id
      AND user_has_org_role(p.org_id, ARRAY['family_office_admin','org_admin','org_viewer','advisor']::user_role[])
  ));

CREATE POLICY "pm_phases_write" ON pm_phases FOR ALL
  USING (EXISTS (
    SELECT 1 FROM pm_projects p
    WHERE p.id = pm_phases.project_id
      AND user_has_org_role(p.org_id, ARRAY['family_office_admin','org_admin','advisor']::user_role[])
  ));

CREATE POLICY "pm_tasks_select" ON pm_tasks FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','org_viewer','advisor']::user_role[]));

CREATE POLICY "pm_tasks_write" ON pm_tasks FOR ALL
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','advisor']::user_role[]));

CREATE POLICY "pm_risks_select" ON pm_risks FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','org_viewer','advisor']::user_role[]));

CREATE POLICY "pm_risks_write" ON pm_risks FOR ALL
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','advisor']::user_role[]));

CREATE POLICY "pm_daily_logs_select" ON pm_daily_logs FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','org_viewer','advisor']::user_role[]));

CREATE POLICY "pm_files_select" ON pm_files FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['family_office_admin','org_admin','org_viewer','advisor']::user_role[]));

-- ============================================================
-- SEED: Project templates
-- ============================================================

INSERT INTO pm_project_templates (slug, name, description, template_json)
VALUES
  (
    'saas-rollout',
    'SaaS App Rollout',
    '26-phase template covering Build → Go-to-Market → Grow → Foundation. Based on Honey Lake Digital engagement.',
    '{
      "groups": ["BUILD","GO-TO-MARKET","GROW","FOUNDATION"],
      "phases": [
        {"order":1,"slug":"p01-idea","name":"Idea","group":"BUILD"},
        {"order":2,"slug":"p02-validation","name":"Validation","group":"BUILD"},
        {"order":3,"slug":"p03-planning","name":"Planning","group":"BUILD"},
        {"order":4,"slug":"p04-design","name":"Design","group":"BUILD"},
        {"order":5,"slug":"p05-development","name":"Development","group":"BUILD"},
        {"order":6,"slug":"p06-infrastructure","name":"Infrastructure","group":"BUILD"},
        {"order":7,"slug":"p07-testing","name":"Testing","group":"BUILD"},
        {"order":8,"slug":"p08-launch","name":"Launch","group":"GO-TO-MARKET"},
        {"order":9,"slug":"p09-acquisition","name":"Acquisition","group":"GO-TO-MARKET"},
        {"order":10,"slug":"p10-distribution","name":"Distribution","group":"GO-TO-MARKET"},
        {"order":11,"slug":"p11-conversion","name":"Conversion","group":"GO-TO-MARKET"},
        {"order":12,"slug":"p12-revenue","name":"Revenue","group":"GROW"},
        {"order":13,"slug":"p13-analytics","name":"Analytics","group":"GROW"},
        {"order":14,"slug":"p14-retention","name":"Retention","group":"GROW"},
        {"order":15,"slug":"p15-growth","name":"Growth","group":"GROW"},
        {"order":16,"slug":"p16-scaling","name":"Scaling","group":"GROW"},
        {"order":17,"slug":"p17-legal","name":"Legal","group":"FOUNDATION"},
        {"order":18,"slug":"p18-finance","name":"Finance","group":"FOUNDATION"},
        {"order":19,"slug":"p19-team","name":"Team","group":"FOUNDATION"},
        {"order":20,"slug":"p20-documentation","name":"Documentation","group":"FOUNDATION"},
        {"order":21,"slug":"p21-customer-success","name":"Customer Success","group":"FOUNDATION"},
        {"order":22,"slug":"p22-compliance","name":"Compliance","group":"FOUNDATION"},
        {"order":23,"slug":"p23-branding","name":"Branding","group":"FOUNDATION"},
        {"order":24,"slug":"p24-content-engine","name":"Content Engine","group":"FOUNDATION"},
        {"order":25,"slug":"p25-ai-automation","name":"AI & Automation","group":"FOUNDATION"},
        {"order":26,"slug":"p26-vendor-staffing","name":"Vendor & Staffing","group":"FOUNDATION"}
      ]
    }'
  ),
  (
    'ministry-discovery',
    'Ministry / Org Discovery & Transformation',
    '7-phase discovery template for churches, nonprofits, and faith-based organizations.',
    '{
      "phases": [
        {"order":0,"slug":"p00-prayer-commitment","name":"Prayer & Commitment"},
        {"order":1,"slug":"p01-org-understanding","name":"Organizational Understanding"},
        {"order":2,"slug":"p02-current-state","name":"Current State Assessment"},
        {"order":3,"slug":"p03-department-discovery","name":"Department Discovery"},
        {"order":4,"slug":"p04-quick-wins","name":"Quick Wins & Prioritization"},
        {"order":5,"slug":"p05-roadmap","name":"Roadmap & Implementation"},
        {"order":6,"slug":"p06-equip-empower","name":"Equip, Empower & Release"}
      ],
      "department_layers": [
        "Mission & Vision Alignment",
        "Objectives & Success Metrics",
        "People & Org Structure",
        "Communication Rhythms",
        "Processes & Workflows",
        "Pain Points & Issues",
        "Automation Opportunities"
      ],
      "components": ["Vision","People","Data","Process","Meetings","Issues"]
    }'
  ),
  (
    'tech-stack-modernization',
    'Tech Stack Modernization (PMBOK)',
    '12 PMBOK management sections + configurable parallel workstreams. Based on VakPak engagement.',
    '{
      "pmbok_sections": [
        {"order":1,"slug":"s01-program-charter","name":"Program Charter"},
        {"order":2,"slug":"s02-scope-management","name":"Scope Management"},
        {"order":3,"slug":"s03-schedule-management","name":"Schedule Management"},
        {"order":4,"slug":"s04-cost-management","name":"Cost Management"},
        {"order":5,"slug":"s05-quality-management","name":"Quality Management"},
        {"order":6,"slug":"s06-resource-management","name":"Resource Management"},
        {"order":7,"slug":"s07-communications","name":"Communications"},
        {"order":8,"slug":"s08-risk-management","name":"Risk Management"},
        {"order":9,"slug":"s09-procurement","name":"Procurement"},
        {"order":10,"slug":"s10-stakeholder-management","name":"Stakeholder Management"},
        {"order":11,"slug":"s11-action-items","name":"Action Items"},
        {"order":12,"slug":"s12-governance-decisions","name":"Governance & Decisions"}
      ],
      "workstreams_configurable": true,
      "note": "Workstream names set at project seed time"
    }'
  ),
  (
    'custom',
    'Custom Project',
    'Blank slate. Define phases and tasks through AI chat or manual entry.',
    '{"phases": []}'
  );
