-- Seed demo data
WITH p AS (
  INSERT INTO public.properties (name, address, city, description, image_url, facilities, whatsapp_number, status) VALUES
  ('Kost Vintera Dago','Jl. Ir. H. Juanda No. 112, Dago','Bandung','Kost eksklusif dekat kampus ITB dengan suasana tenang dan akses mudah ke pusat kota.','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',ARRAY['WiFi','Dapur Bersama','Laundry','Parkir Motor','CCTV'],'6281234567890','active'),
  ('Kost Vintera Buah Batu','Jl. Buah Batu No. 45','Bandung','Hunian nyaman dekat Telkom University dengan kamar ber-AC dan area parkir luas.','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',ARRAY['WiFi','AC','Parkir Mobil','Security 24 Jam'],'6281234567891','active'),
  ('Kost Vintera Setiabudi','Jl. Dr. Setiabudi No. 210','Bandung','Kost putri dengan pemandangan kota, cocok untuk mahasiswa dan pekerja.','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',ARRAY['WiFi','Dapur Bersama','Rooftop','Laundry'],'6281234567892','active')
  RETURNING id, name
), r AS (
  INSERT INTO public.rooms (property_id, room_number, price, description, facilities, status)
  SELECT p.id, v.num, v.price, v.descr, v.fac, v.st::room_status
  FROM p JOIN (VALUES
    ('Kost Vintera Dago','A1',1800000,'Kamar depan dengan jendela besar',ARRAY['Kasur','Lemari','Meja Belajar','Kamar Mandi Dalam'],'occupied'),
    ('Kost Vintera Dago','A2',1800000,'Kamar tengah, tenang',ARRAY['Kasur','Lemari','Meja Belajar','Kamar Mandi Dalam'],'occupied'),
    ('Kost Vintera Dago','A3',1500000,'Kamar mandi luar',ARRAY['Kasur','Lemari','Meja Belajar'],'available'),
    ('Kost Vintera Dago','A4',1500000,'Kamar belakang',ARRAY['Kasur','Lemari'],'available'),
    ('Kost Vintera Buah Batu','B1',2200000,'Kamar AC lantai 1',ARRAY['AC','Kasur','Lemari','Kamar Mandi Dalam'],'occupied'),
    ('Kost Vintera Buah Batu','B2',2200000,'Kamar AC lantai 1',ARRAY['AC','Kasur','Lemari','Kamar Mandi Dalam'],'occupied'),
    ('Kost Vintera Buah Batu','B3',2500000,'Kamar sudut, lebih luas',ARRAY['AC','Kasur','Lemari','Sofa','Kamar Mandi Dalam'],'available'),
    ('Kost Vintera Buah Batu','B4',2200000,'Sedang perbaikan kamar mandi',ARRAY['AC','Kasur','Lemari'],'maintenance'),
    ('Kost Vintera Setiabudi','C1',1650000,'Kamar putri lantai 2',ARRAY['Kasur','Lemari','Meja Belajar'],'occupied'),
    ('Kost Vintera Setiabudi','C2',1650000,'Kamar putri lantai 2',ARRAY['Kasur','Lemari','Meja Belajar'],'occupied'),
    ('Kost Vintera Setiabudi','C3',1900000,'View kota, dekat rooftop',ARRAY['Kasur','Lemari','Kamar Mandi Dalam'],'available'),
    ('Kost Vintera Setiabudi','C4',1900000,'Kamar pojok',ARRAY['Kasur','Lemari','Kamar Mandi Dalam'],'available')
  ) AS v(pname,num,price,descr,fac,st) ON v.pname = p.name
  RETURNING id, property_id, room_number
), t AS (
  INSERT INTO public.tenants (full_name, phone, email, institution, property_id, room_id, check_in_date, monthly_price, status)
  SELECT v.nm, v.ph, v.em, v.inst, r.property_id, r.id, v.cid::date, v.price, 'active'::tenant_status
  FROM r JOIN (VALUES
    ('A1','Rizky Ramadhan','081298765001','rizky@example.com','Institut Teknologi Bandung','2026-01-05',1800000),
    ('A2','Dewi Lestari','081298765002','dewi@example.com','Universitas Padjadjaran','2026-02-10',1800000),
    ('B1','Fajar Nugroho','081298765003','fajar@example.com','Telkom University','2025-12-01',2200000),
    ('B2','Siti Aisyah','081298765004','siti@example.com','Telkom University','2026-03-15',2200000),
    ('C1','Nabila Putri','081298765005','nabila@example.com','Universitas Pendidikan Indonesia','2026-04-01',1650000),
    ('C2','Anisa Rahma','081298765006','anisa@example.com','Politeknik Negeri Bandung','2026-05-20',1650000)
  ) AS v(room,nm,ph,em,inst,cid,price) ON v.room = r.room_number
  RETURNING id, property_id, room_id, full_name, monthly_price
), inv AS (
  INSERT INTO public.invoices (invoice_number, tenant_id, property_id, room_id, billing_month, amount, due_date, status, paid_at)
  SELECT 'INV-' || to_char(m.bm,'YYYYMM') || '-' || upper(substr(replace(t.id::text,'-',''),1,6)),
         t.id, t.property_id, t.room_id, m.bm, t.monthly_price, m.bm,
         m.st::invoice_status, CASE WHEN m.st = 'paid' THEN m.bm::timestamptz + interval '3 day' END
  FROM t CROSS JOIN (VALUES
    ((date_trunc('month', CURRENT_DATE) - interval '1 month')::date, 'paid'),
    (date_trunc('month', CURRENT_DATE)::date, 'unpaid')
  ) AS m(bm, st)
  RETURNING id, tenant_id, amount, billing_month, status
)
INSERT INTO public.payments (invoice_id, tenant_id, amount, payment_method, paid_at, notes)
SELECT inv.id, inv.tenant_id, inv.amount, 'Transfer BCA', inv.billing_month + 3, 'Pembayaran demo terverifikasi'
FROM inv WHERE inv.status = 'paid';

-- Prospects, visits, cleaning, contents, reports
WITH pr AS (
  INSERT INTO public.prospects (full_name, phone, institution, property_id, room_id, status, notes, first_contact_date)
  SELECT v.nm, v.ph, v.inst, p.id, rm.id, v.st::prospect_status, v.note, CURRENT_DATE - v.days
  FROM (VALUES
    ('Bagus Pratama','081377700001','Institut Teknologi Bandung','Kost Vintera Dago','A3','new_lead','Menanyakan harga dan fasilitas via WhatsApp',2),
    ('Intan Permata','081377700002','Universitas Padjadjaran','Kost Vintera Setiabudi','C3','contacted','Sudah dihubungi, tertarik kamar view kota',5),
    ('Yoga Saputra','081377700003','Telkom University','Kost Vintera Buah Batu','B3','visit_scheduled','Minta jadwal survei akhir pekan',7),
    ('Mega Wulandari','081377700004','Politeknik Negeri Bandung','Kost Vintera Setiabudi','C4','follow_up','Menunggu konfirmasi orang tua',12),
    ('Rendi Alfarizi','081377700005','Universitas Kristen Maranatha','Kost Vintera Dago','A4','not_deal','Memilih kost lain yang lebih dekat kampus',20)
  ) AS v(nm,ph,inst,pname,room,st,note,days)
  JOIN public.properties p ON p.name = v.pname
  JOIN public.rooms rm ON rm.property_id = p.id AND rm.room_number = v.room
  RETURNING id, property_id, room_id, full_name
)
INSERT INTO public.visits (prospect_id, property_id, room_id, visit_date, visit_time, status, notes)
SELECT pr.id, pr.property_id, pr.room_id, v.vd, v.vt::time, v.st::visit_status, v.note
FROM pr JOIN (VALUES
  ('Yoga Saputra', CURRENT_DATE + 2, '10:00', 'scheduled', 'Survei kamar B3 bersama orang tua'),
  ('Intan Permata', CURRENT_DATE - 3, '14:00', 'completed', 'Sudah melihat kamar, minta waktu berpikir'),
  ('Mega Wulandari', CURRENT_DATE - 8, '09:30', 'completed', 'Tertarik, menunggu keputusan keluarga')
) AS v(nm,vd,vt,st,note) ON v.nm = pr.full_name;

INSERT INTO public.cleaning_schedules (property_id, cleaning_date, cleaning_time, status, notes)
SELECT p.id, v.cd, v.ct::time, v.st::cleaning_status, v.note
FROM (VALUES
  ('Kost Vintera Dago', CURRENT_DATE + 1, '08:00', 'scheduled', 'Pembersihan area dapur dan koridor'),
  ('Kost Vintera Buah Batu', CURRENT_DATE, '09:00', 'in_progress', 'Fokus kamar mandi bersama'),
  ('Kost Vintera Setiabudi', CURRENT_DATE - 4, '08:30', 'completed', 'Rooftop dan tangga sudah dibersihkan'),
  ('Kost Vintera Dago', CURRENT_DATE - 11, '08:00', 'completed', 'Rutin mingguan')
) AS v(pname,cd,ct,st,note)
JOIN public.properties p ON p.name = v.pname;

INSERT INTO public.contents (property_id, platform, title, url, viewer_count, like_count, posted_at)
SELECT p.id, v.plat::social_platform, v.title, v.url, v.vc, v.lc, CURRENT_DATE - v.days
FROM (VALUES
  ('Kost Vintera Dago','instagram','Room tour kamar A3 Dago','https://instagram.com/p/demo1',12400,845,4),
  ('Kost Vintera Buah Batu','tiktok','Kost AC dekat Telkom University','https://tiktok.com/@vintera/video/demo2',48200,3210,9),
  ('Kost Vintera Setiabudi','instagram','Rooftop sunset di Setiabudi','https://instagram.com/p/demo3',8900,620,15),
  ('Kost Vintera Buah Batu','facebook','Promo sewa tahunan Buah Batu','https://facebook.com/vintera/posts/demo4',3100,180,22)
) AS v(pname,plat,title,url,vc,lc,days)
JOIN public.properties p ON p.name = v.pname;

INSERT INTO public.monthly_reports (property_id, month, year, maintenance_notes)
SELECT p.id, v.m, v.y, v.note
FROM (VALUES
  ('Kost Vintera Dago', EXTRACT(MONTH FROM CURRENT_DATE - interval '1 month')::int, EXTRACT(YEAR FROM CURRENT_DATE - interval '1 month')::int, 'Perbaikan pompa air dan penggantian lampu koridor.'),
  ('Kost Vintera Buah Batu', EXTRACT(MONTH FROM CURRENT_DATE - interval '1 month')::int, EXTRACT(YEAR FROM CURRENT_DATE - interval '1 month')::int, 'Kamar B4 dalam perbaikan kamar mandi.'),
  ('Kost Vintera Setiabudi', EXTRACT(MONTH FROM CURRENT_DATE - interval '1 month')::int, EXTRACT(YEAR FROM CURRENT_DATE - interval '1 month')::int, 'Pengecatan ulang rooftop selesai.')
) AS v(pname,m,y,note)
JOIN public.properties p ON p.name = v.pname;