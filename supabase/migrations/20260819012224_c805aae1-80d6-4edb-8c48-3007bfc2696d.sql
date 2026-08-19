DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.can_read_cleaning(uuid)',
    'public.is_admin()',
    'public.is_assistant_of_prospect(uuid)',
    'public.is_my_cleaning(uuid)',
    'public.is_my_tenancy_property(uuid)',
    'public.is_my_tenant_row(uuid)',
    'public.is_my_visit(uuid)',
    'public.owns_property(uuid)',
    'public.owns_tenant_property(uuid)',
    'public.owns_visit_property(uuid)',
    'public.has_role(uuid, public.app_role)'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f);
  END LOOP;
END $$;