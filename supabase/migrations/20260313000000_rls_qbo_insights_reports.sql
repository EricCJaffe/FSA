-- RLS policies for qbo_connections, qbo_sync_records, ai_insights, monthly_reports
-- These tables had RLS enabled but missing policies, blocking all operations.

-- qbo_connections: admins can read, insert, update their org's connection
CREATE POLICY "qbo_connections_select" ON qbo_connections FOR SELECT
  USING (org_id IN (SELECT org_id FROM user_org_roles WHERE user_id = auth.uid()));

CREATE POLICY "qbo_connections_insert" ON qbo_connections FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM user_org_roles
    WHERE user_id = auth.uid() AND role IN ('family_office_admin', 'org_admin')
  ));

CREATE POLICY "qbo_connections_update" ON qbo_connections FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM user_org_roles
    WHERE user_id = auth.uid() AND role IN ('family_office_admin', 'org_admin')
  ));

-- qbo_sync_records: admins can read and insert for their org
CREATE POLICY "qbo_sync_select" ON qbo_sync_records FOR SELECT
  USING (org_id IN (SELECT org_id FROM user_org_roles WHERE user_id = auth.uid()));

CREATE POLICY "qbo_sync_insert" ON qbo_sync_records FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM user_org_roles
    WHERE user_id = auth.uid() AND role IN ('family_office_admin', 'org_admin')
  ));

CREATE POLICY "qbo_sync_update" ON qbo_sync_records FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM user_org_roles
    WHERE user_id = auth.uid() AND role IN ('family_office_admin', 'org_admin')
  ));

-- ai_insights: add INSERT for admins (SELECT already exists)
CREATE POLICY "insights_insert" ON ai_insights FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM user_org_roles
    WHERE user_id = auth.uid() AND role IN ('family_office_admin', 'org_admin')
  ));

-- monthly_reports: add INSERT and UPDATE for admins (SELECT already exists)
CREATE POLICY "reports_insert" ON monthly_reports FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM user_org_roles
    WHERE user_id = auth.uid() AND role IN ('family_office_admin', 'org_admin')
  ));

CREATE POLICY "reports_update" ON monthly_reports FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM user_org_roles
    WHERE user_id = auth.uid() AND role IN ('family_office_admin', 'org_admin')
  ));
