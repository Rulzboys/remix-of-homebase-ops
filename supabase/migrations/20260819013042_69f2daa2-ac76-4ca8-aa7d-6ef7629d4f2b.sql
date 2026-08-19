INSERT INTO public.profiles (id, full_name, email, phone)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'full_name', initcap(split_part(u.email,'@',1))),
       u.email,
       u.raw_user_meta_data->>'phone'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());