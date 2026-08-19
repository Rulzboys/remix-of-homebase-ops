DELETE FROM public.user_roles ur
USING auth.users u
WHERE ur.user_id = u.id AND u.email LIKE '%@vintera.test';

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, split_part(u.email,'@',1)::public.app_role
FROM auth.users u
WHERE u.email LIKE '%@vintera.test'
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.properties SET owner_id = (SELECT id FROM auth.users WHERE email = 'owner@vintera.test');
UPDATE public.visits SET assistant_id = (SELECT id FROM auth.users WHERE email = 'assistant@vintera.test');
UPDATE public.cleaning_schedules SET helper_id = (SELECT id FROM auth.users WHERE email = 'helper@vintera.test');

UPDATE public.tenants t
SET user_id = (SELECT id FROM auth.users WHERE email = 'tenant@vintera.test'),
    email = 'tenant@vintera.test'
WHERE t.id = (SELECT id FROM public.tenants ORDER BY check_in_date LIMIT 1);