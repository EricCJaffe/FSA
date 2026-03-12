-- ============================================================
-- Admin bootstrap trigger
-- When ejaffejax@gmail.com signs up, auto-assign family_office_admin
-- across all orgs in the tenant.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Bootstrap: ejaffejax@gmail.com is always family_office_admin
  IF NEW.email = 'ejaffejax@gmail.com' THEN
    INSERT INTO user_org_roles (user_id, org_id, role)
    SELECT NEW.id, id, 'family_office_admin'
    FROM orgs
    ON CONFLICT (user_id, org_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
