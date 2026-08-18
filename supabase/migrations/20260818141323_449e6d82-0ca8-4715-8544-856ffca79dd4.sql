insert into public.profiles (id, full_name, email, phone, avatar_url)
values
  ('a89e39a6-4445-4f20-b536-c56b7b29b698', 'Admin Vintera', 'admin@vintera.test', null, null),
  ('4d625099-0b4a-4b11-b2a2-f561cb4d8b5d', 'Owner Kost', 'owner@vintera.test', null, null),
  ('d8f6c5d3-5772-48ee-870e-84020021b084', 'Assistant Vintera', 'assistant@vintera.test', null, null),
  ('23d39567-e228-4d29-97df-8d1de82cf14a', 'Helper Cleaning', 'helper@vintera.test', null, null),
  ('06b199a8-8c60-4c9d-b48c-352c516e353f', 'Tenant Satu', 'tenant@vintera.test', null, null);

insert into public.user_roles (user_id, role)
values
  ('a89e39a6-4445-4f20-b536-c56b7b29b698', 'admin'),
  ('4d625099-0b4a-4b11-b2a2-f561cb4d8b5d', 'owner'),
  ('d8f6c5d3-5772-48ee-870e-84020021b084', 'assistant'),
  ('23d39567-e228-4d29-97df-8d1de82cf14a', 'helper'),
  ('06b199a8-8c60-4c9d-b48c-352c516e353f', 'tenant');