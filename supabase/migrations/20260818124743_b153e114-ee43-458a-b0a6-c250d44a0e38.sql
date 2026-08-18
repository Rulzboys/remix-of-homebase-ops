-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','owner','assistant','helper','tenant');
CREATE TYPE public.property_status AS ENUM ('active','inactive');
CREATE TYPE public.room_status AS ENUM ('available','occupied','maintenance');
CREATE TYPE public.prospect_status AS ENUM ('new_lead','contacted','visit_scheduled','visited','follow_up','deal','not_deal');
CREATE TYPE public.visit_status AS ENUM ('scheduled','completed','cancelled');
CREATE TYPE public.cleaning_status AS ENUM ('scheduled','in_progress','completed','cancelled');
CREATE TYPE public.invoice_status AS ENUM ('unpaid','paid','overdue');
CREATE TYPE public.payment_state AS ENUM ('unpaid','paid');
CREATE TYPE public.tenant_status AS ENUM ('active','inactive');
CREATE TYPE public.social_platform AS ENUM ('instagram','tiktok','facebook');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

-- ============ PROPERTIES ============
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  city TEXT,
  description TEXT,
  image_url TEXT,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  whatsapp_number TEXT,
  status public.property_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT SELECT ON public.properties TO anon;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_property(_property_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.properties p WHERE p.id = _property_id AND p.owner_id = auth.uid());
$$;

CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  status public.room_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT SELECT ON public.rooms TO anon;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- ============ TENANTS ============
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  institution TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  check_in_date DATE,
  monthly_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.tenant_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_my_tenancy_property(_property_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenants t WHERE t.user_id = auth.uid() AND t.property_id = _property_id);
$$;

CREATE OR REPLACE FUNCTION public.is_my_tenant_row(_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = _tenant_id AND t.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.owns_tenant_property(_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenants t JOIN public.properties p ON p.id = t.property_id
    WHERE t.id = _tenant_id AND p.owner_id = auth.uid());
$$;

-- ============ PROSPECTS / VISITS ============
CREATE TABLE public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  status public.prospect_status NOT NULL DEFAULT 'new_lead',
  notes TEXT,
  first_contact_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospects TO authenticated;
GRANT ALL ON public.prospects TO service_role;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  assistant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL DEFAULT '10:00',
  status public.visit_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visits TO authenticated;
GRANT ALL ON public.visits TO service_role;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_my_visit(_visit_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.visits v WHERE v.id = _visit_id AND v.assistant_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.owns_visit_property(_visit_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.visits v JOIN public.properties p ON p.id = v.property_id
    WHERE v.id = _visit_id AND p.owner_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_assistant_of_prospect(_prospect_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.visits v WHERE v.prospect_id = _prospect_id AND v.assistant_id = auth.uid());
$$;

CREATE TABLE public.visit_documentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visit_documentations TO authenticated;
GRANT ALL ON public.visit_documentations TO service_role;
ALTER TABLE public.visit_documentations ENABLE ROW LEVEL SECURITY;

-- ============ DEALS ============
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  monthly_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  dp_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  dp_status public.payment_state NOT NULL DEFAULT 'unpaid',
  dp_paid_at DATE,
  dp_method TEXT,
  settlement_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  settlement_status public.payment_state NOT NULL DEFAULT 'unpaid',
  settlement_paid_at DATE,
  settlement_method TEXT,
  check_in_date DATE,
  check_in_time TIME,
  assistant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  check_in_done BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT ALL ON public.deals TO service_role;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- ============ CLEANING ============
CREATE TABLE public.cleaning_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  helper_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cleaning_date DATE NOT NULL,
  cleaning_time TIME NOT NULL DEFAULT '09:00',
  status public.cleaning_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cleaning_schedules TO authenticated;
GRANT ALL ON public.cleaning_schedules TO service_role;
ALTER TABLE public.cleaning_schedules ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_read_cleaning(_cleaning_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cleaning_schedules c
    WHERE c.id = _cleaning_id AND (
      c.helper_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.properties p WHERE p.id = c.property_id AND p.owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.tenants t WHERE t.property_id = c.property_id AND t.user_id = auth.uid())
    ));
$$;

CREATE OR REPLACE FUNCTION public.is_my_cleaning(_cleaning_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.cleaning_schedules c WHERE c.id = _cleaning_id AND c.helper_id = auth.uid());
$$;

CREATE TABLE public.cleaning_documentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaning_id UUID NOT NULL REFERENCES public.cleaning_schedules(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cleaning_documentations TO authenticated;
GRANT ALL ON public.cleaning_documentations TO service_role;
ALTER TABLE public.cleaning_documentations ENABLE ROW LEVEL SECURITY;

-- ============ BILLING ============
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  billing_month DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'unpaid',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, billing_month)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  paid_at DATE NOT NULL DEFAULT CURRENT_DATE,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'info',
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============ CONTENT / REPORTS ============
CREATE TABLE public.contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  platform public.social_platform NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  viewer_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  posted_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contents TO authenticated;
GRANT ALL ON public.contents TO service_role;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  maintenance_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, month, year)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_reports TO authenticated;
GRANT ALL ON public.monthly_reports TO service_role;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin() OR public.has_role(auth.uid(),'owner'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "properties_public_read" ON public.properties FOR SELECT TO anon, authenticated
  USING (status = 'active');
CREATE POLICY "properties_owner_read" ON public.properties FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "properties_admin_all" ON public.properties FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "rooms_public_read" ON public.rooms FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.status = 'active'));
CREATE POLICY "rooms_owner_read" ON public.rooms FOR SELECT TO authenticated
  USING (public.owns_property(property_id) OR public.is_admin());
CREATE POLICY "rooms_admin_all" ON public.rooms FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "prospects_admin_all" ON public.prospects FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "prospects_assistant_read" ON public.prospects FOR SELECT TO authenticated
  USING (public.is_assistant_of_prospect(id));

CREATE POLICY "visits_admin_all" ON public.visits FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "visits_assistant_read" ON public.visits FOR SELECT TO authenticated
  USING (assistant_id = auth.uid() OR public.owns_property(property_id));
CREATE POLICY "visits_assistant_update" ON public.visits FOR UPDATE TO authenticated
  USING (assistant_id = auth.uid()) WITH CHECK (assistant_id = auth.uid());

CREATE POLICY "visitdocs_admin_all" ON public.visit_documentations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "visitdocs_read" ON public.visit_documentations FOR SELECT TO authenticated
  USING (public.is_my_visit(visit_id) OR public.owns_visit_property(visit_id));
CREATE POLICY "visitdocs_assistant_insert" ON public.visit_documentations FOR INSERT TO authenticated
  WITH CHECK (public.is_my_visit(visit_id) AND uploaded_by = auth.uid());

CREATE POLICY "deals_admin_all" ON public.deals FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "deals_read" ON public.deals FOR SELECT TO authenticated
  USING (assistant_id = auth.uid() OR public.owns_property(property_id));

CREATE POLICY "tenants_admin_all" ON public.tenants FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "tenants_read" ON public.tenants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.owns_property(property_id));

CREATE POLICY "cleaning_admin_all" ON public.cleaning_schedules FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "cleaning_read" ON public.cleaning_schedules FOR SELECT TO authenticated
  USING (helper_id = auth.uid() OR public.owns_property(property_id) OR public.is_my_tenancy_property(property_id));
CREATE POLICY "cleaning_helper_update" ON public.cleaning_schedules FOR UPDATE TO authenticated
  USING (helper_id = auth.uid()) WITH CHECK (helper_id = auth.uid());

CREATE POLICY "cleandocs_admin_all" ON public.cleaning_documentations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "cleandocs_read" ON public.cleaning_documentations FOR SELECT TO authenticated
  USING (public.can_read_cleaning(cleaning_id));
CREATE POLICY "cleandocs_helper_insert" ON public.cleaning_documentations FOR INSERT TO authenticated
  WITH CHECK (public.is_my_cleaning(cleaning_id) AND uploaded_by = auth.uid());

CREATE POLICY "invoices_admin_all" ON public.invoices FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "invoices_read" ON public.invoices FOR SELECT TO authenticated
  USING (public.is_my_tenant_row(tenant_id) OR public.owns_property(property_id));

CREATE POLICY "payments_admin_all" ON public.payments FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "payments_read" ON public.payments FOR SELECT TO authenticated
  USING (public.is_my_tenant_row(tenant_id) OR public.owns_tenant_property(tenant_id));

CREATE POLICY "notifications_own" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_own_delete" ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "contents_admin_all" ON public.contents FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "contents_owner_read" ON public.contents FOR SELECT TO authenticated
  USING (public.owns_property(property_id));

CREATE POLICY "reports_admin_all" ON public.monthly_reports FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "reports_owner_read" ON public.monthly_reports FOR SELECT TO authenticated
  USING (public.owns_property(property_id));
CREATE POLICY "reports_owner_write" ON public.monthly_reports FOR INSERT TO authenticated
  WITH CHECK (public.owns_property(property_id));
CREATE POLICY "reports_owner_update" ON public.monthly_reports FOR UPDATE TO authenticated
  USING (public.owns_property(property_id)) WITH CHECK (public.owns_property(property_id));

-- ============ AUTH TRIGGER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  desired public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
          NEW.email,
          NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    desired := 'admin';
  ELSE
    BEGIN
      desired := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'tenant');
    EXCEPTION WHEN others THEN
      desired := 'tenant';
    END;
    IF desired = 'admin' THEN desired := 'tenant'; END IF;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, desired)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ NOTIFICATION HELPERS ============
CREATE OR REPLACE FUNCTION public.notify_user(_user_id UUID, _title TEXT, _message TEXT, _type TEXT, _ref UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _user_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.notifications (user_id, title, message, type, reference_id)
  VALUES (_user_id, _title, _message, _type, _ref);
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_admins(_title TEXT, _message TEXT, _type TEXT, _ref UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, reference_id)
  SELECT ur.user_id, _title, _message, _type, _ref FROM public.user_roles ur WHERE ur.role = 'admin';
END;
$$;

-- visits
CREATE OR REPLACE FUNCTION public.trg_visit_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pname TEXT; nm TEXT;
BEGIN
  SELECT name INTO pname FROM public.properties WHERE id = NEW.property_id;
  SELECT full_name INTO nm FROM public.prospects WHERE id = NEW.prospect_id;
  PERFORM public.notify_user(NEW.assistant_id, 'Jadwal visit baru',
    COALESCE(nm,'Calon tenant') || ' - ' || COALESCE(pname,'Kost') || ' pada ' || NEW.visit_date || ' ' || NEW.visit_time,
    'visit', NEW.id);
  UPDATE public.prospects SET status = 'visit_scheduled'
    WHERE id = NEW.prospect_id AND status IN ('new_lead','contacted');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_visit_created AFTER INSERT ON public.visits FOR EACH ROW EXECUTE FUNCTION public.trg_visit_created();

CREATE OR REPLACE FUNCTION public.trg_visit_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE oid UUID; pname TEXT;
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    SELECT owner_id, name INTO oid, pname FROM public.properties WHERE id = NEW.property_id;
    PERFORM public.notify_admins('Visit selesai', 'Visit di ' || COALESCE(pname,'kost') || ' telah diselesaikan.', 'visit', NEW.id);
    PERFORM public.notify_user(oid, 'Visit selesai', 'Visit di ' || COALESCE(pname,'kost') || ' telah diselesaikan.', 'visit', NEW.id);
    UPDATE public.prospects SET status = 'visited' WHERE id = NEW.prospect_id AND status IN ('visit_scheduled','contacted','new_lead');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_visit_completed AFTER UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION public.trg_visit_completed();

CREATE OR REPLACE FUNCTION public.trg_visit_doc()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE oid UUID;
BEGIN
  SELECT p.owner_id INTO oid FROM public.visits v JOIN public.properties p ON p.id = v.property_id WHERE v.id = NEW.visit_id;
  PERFORM public.notify_admins('Dokumentasi visit diupload', 'Foto dokumentasi visit baru telah diunggah.', 'visit_doc', NEW.visit_id);
  PERFORM public.notify_user(oid, 'Dokumentasi visit diupload', 'Foto dokumentasi visit baru telah diunggah.', 'visit_doc', NEW.visit_id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_visit_doc AFTER INSERT ON public.visit_documentations FOR EACH ROW EXECUTE FUNCTION public.trg_visit_doc();

-- cleaning
CREATE OR REPLACE FUNCTION public.trg_cleaning_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE oid UUID; pname TEXT; msg TEXT;
BEGIN
  SELECT owner_id, name INTO oid, pname FROM public.properties WHERE id = NEW.property_id;
  msg := 'Cleaning ' || COALESCE(pname,'kost') || ' dijadwalkan pada ' || NEW.cleaning_date || ' ' || NEW.cleaning_time;
  PERFORM public.notify_user(NEW.helper_id, 'Jadwal cleaning baru', msg, 'cleaning', NEW.id);
  PERFORM public.notify_user(oid, 'Jadwal cleaning baru', msg, 'cleaning', NEW.id);
  INSERT INTO public.notifications (user_id, title, message, type, reference_id)
  SELECT t.user_id, 'Jadwal cleaning baru', msg, 'cleaning', NEW.id
  FROM public.tenants t WHERE t.property_id = NEW.property_id AND t.user_id IS NOT NULL AND t.status = 'active';
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_cleaning_created AFTER INSERT ON public.cleaning_schedules FOR EACH ROW EXECUTE FUNCTION public.trg_cleaning_created();

CREATE OR REPLACE FUNCTION public.trg_cleaning_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE oid UUID; pname TEXT; msg TEXT;
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    SELECT owner_id, name INTO oid, pname FROM public.properties WHERE id = NEW.property_id;
    msg := 'Cleaning ' || COALESCE(pname,'kost') || ' telah selesai beserta dokumentasi.';
    PERFORM public.notify_admins('Cleaning selesai', msg, 'cleaning', NEW.id);
    PERFORM public.notify_user(oid, 'Cleaning selesai', msg, 'cleaning', NEW.id);
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    SELECT t.user_id, 'Cleaning selesai', msg, 'cleaning', NEW.id
    FROM public.tenants t WHERE t.property_id = NEW.property_id AND t.user_id IS NOT NULL AND t.status = 'active';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_cleaning_completed AFTER UPDATE ON public.cleaning_schedules FOR EACH ROW EXECUTE FUNCTION public.trg_cleaning_completed();

-- tenants
CREATE OR REPLACE FUNCTION public.trg_tenant_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE oid UUID; pname TEXT;
BEGIN
  IF NEW.room_id IS NOT NULL THEN
    UPDATE public.rooms SET status = 'occupied' WHERE id = NEW.room_id;
  END IF;
  SELECT owner_id, name INTO oid, pname FROM public.properties WHERE id = NEW.property_id;
  PERFORM public.notify_admins('Tenant baru check-in', NEW.full_name || ' resmi menjadi tenant di ' || COALESCE(pname,'kost') || '.', 'tenant', NEW.id);
  PERFORM public.notify_user(oid, 'Tenant baru check-in', NEW.full_name || ' resmi menjadi tenant di ' || COALESCE(pname,'kost') || '.', 'tenant', NEW.id);
  PERFORM public.notify_user(NEW.user_id, 'Selamat datang', 'Akun tenant Anda telah aktif.', 'tenant', NEW.id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_tenant_created AFTER INSERT ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.trg_tenant_created();

-- invoices
CREATE OR REPLACE FUNCTION public.trg_invoice_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid UUID;
BEGIN
  SELECT user_id INTO uid FROM public.tenants WHERE id = NEW.tenant_id;
  PERFORM public.notify_user(uid, 'Tagihan baru',
    'Tagihan ' || NEW.invoice_number || ' sebesar Rp' || to_char(NEW.amount,'FM999,999,999') || ' jatuh tempo ' || NEW.due_date, 'invoice', NEW.id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_invoice_created AFTER INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.trg_invoice_created();

CREATE OR REPLACE FUNCTION public.trg_payment_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid UUID; oid UUID; inv TEXT;
BEGIN
  UPDATE public.invoices SET status = 'paid', paid_at = now() WHERE id = NEW.invoice_id;
  SELECT t.user_id, p.owner_id INTO uid, oid FROM public.tenants t LEFT JOIN public.properties p ON p.id = t.property_id WHERE t.id = NEW.tenant_id;
  SELECT invoice_number INTO inv FROM public.invoices WHERE id = NEW.invoice_id;
  PERFORM public.notify_user(uid, 'Pembayaran dikonfirmasi', 'Pembayaran untuk ' || COALESCE(inv,'tagihan') || ' telah dikonfirmasi admin.', 'payment', NEW.invoice_id);
  PERFORM public.notify_user(oid, 'Pembayaran diterima', 'Pembayaran ' || COALESCE(inv,'tagihan') || ' sebesar Rp' || to_char(NEW.amount,'FM999,999,999') || ' telah diterima.', 'payment', NEW.invoice_id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_payment_created AFTER INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION public.trg_payment_created();

-- ============ INVOICE GENERATOR ============
CREATE OR REPLACE FUNCTION public.generate_monthly_invoices(_month DATE)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  bm DATE := date_trunc('month', _month)::date;
  created INTEGER := 0;
  t RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admin can generate invoices';
  END IF;
  FOR t IN SELECT * FROM public.tenants WHERE status = 'active' LOOP
    IF NOT EXISTS (SELECT 1 FROM public.invoices i WHERE i.tenant_id = t.id AND i.billing_month = bm) THEN
      INSERT INTO public.invoices (invoice_number, tenant_id, property_id, room_id, billing_month, amount, due_date, status)
      VALUES ('INV-' || to_char(bm,'YYYYMM') || '-' || upper(substr(replace(t.id::text,'-',''),1,6)),
              t.id, t.property_id, t.room_id, bm, t.monthly_price, bm, 'unpaid');
      created := created + 1;
    END IF;
  END LOOP;
  UPDATE public.invoices SET status = 'overdue' WHERE status = 'unpaid' AND due_date < CURRENT_DATE;
  RETURN created;
END;
$$;

-- ============ SEED PROPERTIES ============
INSERT INTO public.properties (id, name, address, city, description, image_url, facilities, whatsapp_number, status) VALUES
('11111111-1111-4111-8111-111111111111','Kost Vintera Antapani','Jl. Purwakarta No. 12, Antapani, Bandung','Bandung','Kost eksklusif dengan lokasi strategis di kawasan Antapani, dekat pusat perbelanjaan dan akses tol.','/images/kost-antapani.jpg','{"WiFi","AC","Kamar Mandi Dalam","Parkir","Dapur Bersama"}','628123456789','active'),
('22222222-2222-4222-8222-222222222222','Kost Vintera Buahbatu','Jl. Buahbatu No. 45, Bandung','Bandung','Hunian nyaman untuk mahasiswa dan pekerja, lingkungan tenang dengan keamanan 24 jam.','/images/kost-buahbatu.jpg','{"WiFi","AC","Parkir","Laundry","CCTV"}','628123456789','active'),
('33333333-3333-4333-8333-333333333333','Kost Vintera Dago','Jl. Ir. H. Juanda No. 210, Dago, Bandung','Bandung','Kost premium di kawasan Dago dengan pemandangan kota dan akses mudah ke kampus.','/images/kost-dago.jpg','{"WiFi","AC","Kamar Mandi Dalam","Parkir","Water Heater"}','628123456789','active');

INSERT INTO public.rooms (property_id, room_number, price, description, facilities, status) VALUES
('11111111-1111-4111-8111-111111111111','A-01',1500000,'Kamar standar lantai 1','{"AC","Kasur","Lemari","Meja"}','available'),
('11111111-1111-4111-8111-111111111111','A-02',1500000,'Kamar standar lantai 1','{"AC","Kasur","Lemari","Meja"}','available'),
('11111111-1111-4111-8111-111111111111','A-03',1750000,'Kamar luas dengan balkon','{"AC","Kasur","Lemari","Meja","Balkon"}','available'),
('11111111-1111-4111-8111-111111111111','A-04',1750000,'Kamar luas lantai 2','{"AC","Kasur","Lemari","Meja"}','maintenance'),
('22222222-2222-4222-8222-222222222222','B-01',1250000,'Kamar standar','{"AC","Kasur","Lemari"}','available'),
('22222222-2222-4222-8222-222222222222','B-02',1250000,'Kamar standar','{"AC","Kasur","Lemari"}','available'),
('22222222-2222-4222-8222-222222222222','B-03',1400000,'Kamar sudut lebih luas','{"AC","Kasur","Lemari","Meja"}','available'),
('33333333-3333-4333-8333-333333333333','C-01',2000000,'Kamar premium view kota','{"AC","Kasur","Lemari","Meja","Water Heater"}','available'),
('33333333-3333-4333-8333-333333333333','C-02',2000000,'Kamar premium','{"AC","Kasur","Lemari","Meja","Water Heater"}','available'),
('33333333-3333-4333-8333-333333333333','C-03',2200000,'Kamar premium luas','{"AC","Kasur","Lemari","Meja","Water Heater","Balkon"}','available');