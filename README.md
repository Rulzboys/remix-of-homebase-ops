# HomeBase Ops

🏠 Website Manajemen Kost — MVP

Buat sebuah website Manajemen Kost berbasis multi-role yang digunakan untuk mengelola operasional kost mulai dari calon tenant, jadwal visit, check-in, data tenant, kamar, cleaning, pembayaran bulanan, dokumentasi, notifikasi, hingga laporan pemilik kost.

Website ini adalah MVP (Minimum Viable Product).

Artinya:

Jangan membuat fitur yang terlalu kompleks di tahap awal.

Fokus pada fitur inti yang benar-benar berfungsi.

Semua fitur utama harus terhubung ke backend dan database.

Jangan hanya membuat dummy frontend.

Gunakan data nyata dari Supabase.

Semua CRUD utama harus berfungsi.

Authentication dan Role Based Access harus berfungsi.

Upload dokumentasi harus menggunakan storage.

Dashboard setiap role harus mengambil data dari database.

Siapkan struktur aplikasi agar nantinya mudah dikembangkan ke versi berikutnya.

🛠️ Tech Stack

Gunakan:

Frontend:
React + TypeScript
Tailwind CSS
shadcn/ui

Backend:
Supabase

Database:
Supabase PostgreSQL

Authentication:
Supabase Auth

Storage:
Supabase Storage

Realtime:
Supabase Realtime jika diperlukan

Deployment:
Lovable


Gunakan Supabase sebagai backend utama.

Jangan menggunakan localStorage sebagai penyimpanan data utama.

🎯 Tujuan MVP

Website harus dapat menjalankan workflow utama berikut:

Calon Tenant
↓
Melihat Kost
↓
Menghubungi Admin
↓
Admin mencatat calon tenant
↓
Menentukan jadwal visit
↓
Assistant mendampingi visit
↓
Upload dokumentasi visit
↓
Admin follow-up
↓
Tenant Deal
↓
DP 50%
↓
Pelunasan
↓
Menentukan Check-in
↓
Assistant mendampingi Check-in
↓
Tenant Aktif
↓
Tagihan Bulanan
↓
Pembayaran
↓
Cleaning Berkala
↓
Dokumentasi
↓
Laporan Owner


👥 1. USER ROLES

Buat sistem Role Based Access Control.

Role MVP:

Admin
BHO Owner / Owner Kost
Assistant BHO
Helper
Tenant


Untuk tampilan UI gunakan nama yang lebih natural:

Admin
Owner
Assistant
Helper
Tenant


Setiap user hanya boleh mengakses halaman yang sesuai dengan role mereka.

🔐 2. AUTHENTICATION

Buat halaman:

/login


Fitur:

Email

Password

Login

Logout

Forgot Password

Session persistence

Setelah login, arahkan user berdasarkan role.

Admin
→ /admin/dashboard

Owner
→ /owner/dashboard

Assistant
→ /assistant/dashboard

Helper
→ /helper/dashboard

Tenant
→ /tenant/dashboard


Admin dapat membuat akun untuk:

Owner

Assistant

Helper

Tenant

🌐 3. PUBLIC WEBSITE

Sebelum login, website juga memiliki halaman publik sederhana untuk calon tenant.

Navigation:

Home
Daftar Kost
Tentang Kami
Hubungi Kami
Login


🏠 4. HOME PUBLIC

Tujuan:

Memperkenalkan layanan kost kepada calon tenant.

Tampilkan:

Hero

Temukan Kost yang Nyaman untuk Anda

Cari kost yang sesuai dengan kebutuhan Anda.


Button:

Lihat Kost
Hubungi Admin


🏢 5. DAFTAR KOST

Route:

/kost


Tampilkan card properti.

Contoh:

Kost Vintera Antapani

Mulai dari
Rp1.500.000 / bulan

3 kamar tersedia

[Fasilitas]

WiFi
AC
Kamar Mandi Dalam
Parkir

[Lihat Detail]


Filter sederhana:

Lokasi
Harga
Status kamar


🏡 6. DETAIL KOST

Route:

/kost/:id


Tampilkan:

Nama Kost
Alamat
Foto
Deskripsi
Fasilitas
Daftar Kamar
Harga
Status Ketersediaan


Status kamar:

Tersedia
Terisi
Maintenance


Button:

Hubungi Admin via WhatsApp


Button membuka WhatsApp Admin dengan prefilled message:

Halo Admin, saya tertarik dengan [Nama Kost]. Saya ingin mengetahui informasi lebih lanjut.


Untuk MVP tidak perlu WhatsApp API otomatis.

Gunakan WhatsApp deep link.

👨‍💼 7. ADMIN DASHBOARD

Route:

/admin/dashboard


Dashboard adalah pusat operasional sistem.

Tampilkan statistik:

Total Kost

Total Kamar

Kamar Terisi

Kamar Tersedia

Tenant Aktif

Calon Tenant

Visit Hari Ini

Tagihan Belum Dibayar

Cleaning Hari Ini


Tambahkan bagian:

Aktivitas Terbaru

Contoh:

Tenant baru ditambahkan

Dokumentasi visit diupload

Pembayaran diterima

Cleaning selesai


🏢 8. MANAJEMEN KOST

Admin dapat melakukan CRUD:

Tambah Kost
Edit Kost
Lihat Detail
Nonaktifkan Kost


Data Kost:

Nama Kost

Alamat

Deskripsi

Foto

Fasilitas

Owner

Status


Status:

Aktif
Nonaktif


🚪 9. MANAJEMEN KAMAR

Setiap kost memiliki banyak kamar.

Admin dapat:

Tambah Kamar

Edit Kamar

Lihat Kamar

Update Status


Data kamar:

Nomor Kamar

Nama Kost

Harga Bulanan

Deskripsi

Fasilitas

Foto

Status


Status:

Tersedia

Terisi

Maintenance


👤 10. CALON TENANT

Route:

/admin/prospects


Admin dapat mencatat calon tenant yang menghubungi melalui WhatsApp.

Data:

Nama

Nomor WhatsApp

Instansi

Kost yang diminati

Kamar yang diminati

Tanggal pertama menghubungi

Catatan


Status calon tenant:

New Lead

Contacted

Visit Scheduled

Visited

Follow Up

Deal

Not Deal


Gunakan badge berbeda untuk setiap status.

📅 11. JADWAL VISIT

Admin dapat membuat jadwal visit.

Data:

Calon Tenant

Kost

Kamar

Tanggal

Jam

Assistant

Catatan


Status:

Scheduled

Completed

Cancelled


Flow:

Admin membuat jadwal visit
↓
Jadwal tersimpan
↓
Assistant dapat melihat jadwal
↓
Assistant menghubungi calon tenant
↓
Visit dilakukan


🧑‍💼 12. ASSISTANT DASHBOARD

Route:

/assistant/dashboard


Tampilkan:

Visit Hari Ini

Visit Mendatang

Visit Selesai

Check-in Mendatang


Bagian:

Jadwal Visit Hari Ini


Card contoh:

Syahrur Ramadhani

Kost Vintera Antapani

10:00 WIB

[Lihat Detail]


📸 13. DOKUMENTASI VISIT

Setelah visit dilakukan, Assistant dapat membuka detail visit.

Button:

Selesaikan Visit


Assistant harus dapat upload beberapa foto.

Gunakan:

Supabase Storage


Data dokumentasi:

Visit ID

Assistant

Foto

Tanggal Upload

Catatan


Setelah dokumentasi diupload:

Visit → Completed


Admin dan Owner dapat melihat dokumentasi tersebut.

🔔 14. IN-APP NOTIFICATION

Untuk MVP gunakan notification di dalam aplikasi terlebih dahulu.

Contoh:

Visit baru dijadwalkan

Visit telah selesai

Dokumentasi baru diupload

Cleaning baru dijadwalkan

Cleaning selesai

Pembayaran diterima

Tenant baru check-in


Notification harus disimpan di database.

Data:

User ID

Title

Message

Type

Reference ID

Is Read

Created At


Tambahkan ikon notification pada header.

🤝 15. FOLLOW-UP DAN DEAL

Setelah visit selesai, Admin dapat melakukan follow-up.

Pada detail calon tenant tambahkan:

Follow Up


Admin dapat mengubah status:

Follow Up

Deal

Not Deal


Jika:

Deal


tampilkan button:

Proses Menjadi Tenant


💰 16. DP 50%

Ketika calon tenant deal, buat data transaksi awal.

Data:

Harga Sewa

DP

Tanggal DP

Status DP


Default:

DP = 50% dari harga sewa


Status:

Belum Dibayar

Sudah Dibayar


Untuk MVP Admin mengupdate pembayaran secara manual.

Tidak perlu Payment Gateway.

💳 17. PELUNASAN

Setelah DP:

Admin dapat mencatat:

Pelunasan


Data:

Nominal

Tanggal

Metode Pembayaran

Catatan


Status transaksi:

DP

Lunas


📆 18. CHECK-IN TENANT

Setelah pembayaran lunas:

Admin menentukan:

Tanggal Check-in

Jam Check-in

Assistant


Assistant dapat melihat jadwal tersebut.

Flow:

Pelunasan
↓
Admin menentukan check-in
↓
Assistant melihat jadwal
↓
Assistant mendampingi tenant
↓
Check-in selesai


Setelah selesai:

Calon Tenant
↓
Menjadi Tenant Aktif


Kamar otomatis:

Tersedia
↓
Terisi


👥 19. TENANT MANAGEMENT

Route:

/admin/tenants


Admin dapat melihat semua tenant.

Data:

Nama

Email

WhatsApp

Instansi

Kost

Kamar

Tanggal Check-in

Harga Sewa

Status


Status:

Aktif

Nonaktif


🧑‍💻 20. TENANT DASHBOARD

Route:

/tenant/dashboard


Tampilkan:

Informasi Kost

Nama Kost

Nomor Kamar

Tanggal Check-in


Tagihan

Tagihan Bulan Ini

Rp1.500.000

Jatuh Tempo
1 September 2026

Status
Belum Dibayar


Cleaning Selanjutnya

30 Agustus 2026
09:00 WIB


Aktivitas

Cleaning selesai

Tagihan dibuat

Pembayaran dikonfirmasi


🧹 21. CLEANING MANAGEMENT

Admin dapat membuat jadwal cleaning.

Route:

/admin/cleaning


Data:

Kost

Tanggal

Jam

Helper

Catatan


Status:

Scheduled

In Progress

Completed

Cancelled


Flow:

Admin membuat jadwal
↓
Helper mendapatkan jadwal
↓
Owner dapat melihat jadwal
↓
Tenant dapat melihat jadwal
↓
Helper melakukan cleaning
↓
Helper upload dokumentasi
↓
Cleaning selesai


🧹 22. HELPER DASHBOARD

Route:

/helper/dashboard


Tampilkan:

Cleaning Hari Ini

Cleaning Mendatang

Cleaning Selesai


Card:

Kost Vintera Antapani

30 Agustus 2026

09:00 WIB

[Mulai Cleaning]


📸 23. DOKUMENTASI CLEANING

Ketika cleaning selesai:

Helper dapat upload:

Foto Setelah Cleaning


Boleh upload beberapa foto.

Tambahkan:

Catatan Cleaning


Button:

Selesaikan Cleaning


Setelah selesai:

Status → Completed


Admin, Owner dan Tenant dapat melihat:

Tanggal Cleaning

Helper

Dokumentasi Foto

Catatan


💵 24. PAYMENT MANAGEMENT

Route:

/admin/payments


Sistem harus mendukung tagihan bulanan tenant.

Default:

Jatuh Tempo:
Tanggal 1 setiap bulan


Tagihan dibuat:

H-3 sebelum jatuh tempo


Contoh:

Jatuh Tempo
1 September

Tagihan Dibuat
29 Agustus


Untuk MVP gunakan scheduled logic sederhana jika tersedia.

Jika automated scheduled job belum diterapkan pada tahap awal, tetap buat struktur database dan fungsi:

Generate Monthly Invoice


agar Admin dapat menjalankannya secara manual.

🧾 25. DATA TAGIHAN

Data:

Invoice Number

Tenant

Kost

Kamar

Billing Month

Amount

Due Date

Status

Paid At


Status:

Unpaid

Paid

Overdue


📲 26. REMINDER WHATSAPP MVP

Tidak perlu WhatsApp Business API terlebih dahulu.

Pada tagihan tambahkan button:

Tagih via WhatsApp


Ketika diklik buka WhatsApp Tenant.

Prefilled message:

Halo [Nama Tenant],

Kami mengingatkan bahwa tagihan Kost [Nama Kost] untuk periode [Bulan] sebesar [Nominal] akan jatuh tempo pada [Tanggal].

Silakan melakukan pembayaran ke rekening yang telah ditentukan.

Terima kasih.


💸 27. KONFIRMASI PEMBAYARAN

Untuk MVP pembayaran dilakukan di luar aplikasi.

Tenant melakukan transfer secara manual.

Tenant dapat mengirim bukti pembayaran melalui WhatsApp Admin.

Admin kemudian membuka invoice dan memilih:

Tandai Sudah Dibayar


Form:

Tanggal Pembayaran

Nominal

Metode Pembayaran

Catatan


Setelah Admin mengkonfirmasi:

Invoice → Paid


Owner mendapatkan notification.

Tenant mendapatkan notification.

👔 28. OWNER DASHBOARD

Route:

/owner/dashboard


Owner hanya dapat melihat Kost yang menjadi miliknya.

Tampilkan statistik:

Total Kost

Total Kamar

Kamar Terisi

Kamar Kosong

Occupancy Rate

Tenant Aktif

Income Bulan Ini

Outstanding Payment


Tambahkan:

Aktivitas Terbaru


Contoh:

Tenant baru check-in

Payment diterima

Cleaning selesai

Visit selesai


📊 29. MONTHLY REPORT

Buat halaman:

/owner/reports


Monthly Report ditujukan kepada Owner.

Periode:

Bulanan


Tampilkan:

Occupancy

Total Kamar

Kamar Terisi

Kamar Kosong

Occupancy Rate


Cleaning

Jumlah Cleaning

Cleaning Completed

Dokumentasi


Income

Total Tagihan

Total Pembayaran

Outstanding


Tenant

Tenant Baru

Tenant Aktif


🔧 30. MAINTENANCE REPORT

Flow hanya menyebut Maintenance sebagai salah satu bagian Monthly Report tetapi tidak menjelaskan workflow Maintenance secara detail.

Karena itu untuk MVP:

Jangan membuat Maintenance Management yang kompleks.

Cukup sediakan field manual pada Monthly Report:

Maintenance Notes


Admin dapat mengisi catatan maintenance untuk bulan tersebut.

📱 31. CONTENT & SOCIAL MEDIA — MVP

Flow bisnis juga memiliki proses Content Creator.

Namun untuk menjaga scope MVP tetap kecil, jangan membuat dashboard Content Creator khusus.

Admin cukup memiliki halaman:

/admin/content


Admin dapat mencatat:

Judul Content

Platform

Tanggal Posting

URL Content

Viewer

Likes


Platform:

Instagram

TikTok

Facebook


Viewer dan Likes diinput manual.

Jangan implementasikan Instagram API, TikTok API atau Facebook API untuk MVP.

Siapkan struktur agar API dapat ditambahkan pada versi berikutnya.

📊 32. SOCIAL MEDIA REPORT

Data content tersebut masuk ke Monthly Report Owner.

Tampilkan:

Total Content

Instagram Content

TikTok Content

Facebook Content

Total Viewer

Total Likes


🧭 33. ADMIN SIDEBAR

Gunakan sidebar:

Dashboard

Properti Kost

Kamar

Calon Tenant

Visit

Tenant

Cleaning

Payment

Content

Reports

Users

Notifications

Settings


🧭 34. OWNER SIDEBAR

Dashboard

Properti Saya

Tenant

Cleaning

Payment

Reports

Notifications


Owner bersifat mostly read-only.

Owner tidak boleh mengubah data operasional Admin.

🧭 35. ASSISTANT SIDEBAR

Dashboard

Jadwal Visit

Dokumentasi Visit

Check-in

Notifications


🧭 36. HELPER SIDEBAR

Dashboard

Jadwal Cleaning

Riwayat Cleaning

Notifications


🧭 37. TENANT SIDEBAR

Dashboard

Kost Saya

Tagihan

Cleaning

Notifications

Profile


🗄️ 38. DATABASE STRUCTURE

Buat tabel minimal:

profiles

properties

rooms

prospects

visits

visit_documentations

tenants

tenant_rooms

cleaning_schedules

cleaning_documentations

invoices

payments

notifications

contents

monthly_reports


👤 profiles

id UUID

full_name

email

phone

role

avatar_url

created_at


Role:

admin

owner

assistant

helper

tenant


🏢 properties

id

owner_id

name

address

description

status

created_at


🚪 rooms

id

property_id

room_number

price

description

status

created_at


Status:

available

occupied

maintenance


👥 prospects

id

full_name

phone

institution

property_id

room_id

status

notes

created_at


📅 visits

id

prospect_id

property_id

room_id

assistant_id

visit_date

visit_time

status

notes

created_at


📸 visit_documentations

id

visit_id

uploaded_by

image_url

notes

created_at


🧑 tenants

id

user_id

property_id

room_id

check_in_date

monthly_price

status

created_at


🧹 cleaning_schedules

id

property_id

helper_id

cleaning_date

cleaning_time

status

notes

created_at


📸 cleaning_documentations

id

cleaning_id

uploaded_by

image_url

notes

created_at


🧾 invoices

id

invoice_number

tenant_id

billing_month

amount

due_date

status

created_at


💰 payments

id

invoice_id

tenant_id

amount

payment_method

paid_at

verified_by

notes

created_at


🔔 notifications

id

user_id

title

message

type

reference_id

is_read

created_at


📱 contents

id

property_id

platform

title

url

viewer_count

like_count

posted_at

created_at


📊 monthly_reports

id

property_id

month

year

occupancy_rate

cleaning_summary

maintenance_notes

income

social_media_summary

created_at


🔒 39. ROW LEVEL SECURITY

Gunakan Supabase Row Level Security.

Aturan:

Admin

Full Access


Owner

Hanya dapat melihat data yang berhubungan dengan property miliknya.

Assistant

Hanya dapat melihat visit dan check-in yang diberikan kepadanya.

Helper

Hanya dapat melihat cleaning schedule yang ditugaskan kepadanya.

Tenant

Hanya dapat melihat:

Profile sendiri

Kost sendiri

Kamar sendiri

Invoice sendiri

Payment sendiri

Cleaning yang terkait dengan Kost-nya

Notification sendiri


🔄 40. CORE AUTOMATION

Buat business logic berikut.

Deal to Tenant

Prospect
↓
Deal
↓
DP
↓
Paid
↓
Pelunasan
↓
Check-in
↓
Tenant Created
↓
Room → Occupied


Cleaning

Admin Creates Schedule
↓
Helper Assigned
↓
Helper Completes Cleaning
↓
Documentation Uploaded
↓
Admin Notification
↓
Owner Notification
↓
Tenant Notification


Payment

Monthly Invoice
↓
Unpaid
↓
Payment
↓
Admin Verification
↓
Paid
↓
Owner Notification
↓
Tenant Notification


🎨 41. UI / UX — HUMAN DESIGNED, NOT AI-GENERATED

Desain website harus terlihat seperti produk yang dirancang secara manual oleh UI/UX Designer dan Frontend Developer, bukan seperti template generik hasil AI.

Tampilan harus terasa realistis sebagai aplikasi operasional perusahaan yang benar-benar digunakan setiap hari.

Gunakan pendekatan:

Clean
Professional
Simple
Structured
Functional
Natural
Human Designed
Property Management System


Prioritaskan:

Usability
Clarity
Consistency
Information Hierarchy
Readable Data
Efficient Workflow


dibandingkan dekorasi visual.

Design Direction

Website harus memiliki karakter visual seperti:

Property Management Dashboard
Hotel Management System
ERP Dashboard
Internal Company Dashboard
Professional Admin Panel


Jangan membuat tampilannya seperti:

AI SaaS Landing Page
Crypto Dashboard
Futuristic Dashboard
Gaming Dashboard
Web3 Dashboard
Startup AI Template


Hindari Tampilan yang Terlalu AI

Jangan gunakan secara berlebihan:

Gradient Background

Gradient Button

Glassmorphism

Blurred Floating Cards

Huge Border Radius

Neon Color

Glow Effect

Floating Abstract Shapes

Oversized Heading

Decorative Illustration

Animated Gradient

Colorful Dashboard Cards Everywhere

Excessive Shadow

Too Many Icons

Too Many Cards


Jangan membuat semua informasi berada di dalam card.

Jangan memberikan background berbeda pada setiap section tanpa alasan.

Jangan membuat dashboard menyerupai landing page startup.

Color System

Gunakan warna yang sederhana dan konsisten.

Contoh arah warna:

Main Background:
White / Very Light Gray

Primary:
Dark Navy / Muted Blue

Text Primary:
Near Black / Dark Gray

Text Secondary:
Medium Gray

Border:
Light Gray

Success:
Muted Green

Warning:
Soft Amber

Danger:
Soft Red

Info:
Soft Blue


Gunakan satu primary color utama secara konsisten.

Jangan menggunakan banyak warna hanya untuk dekorasi.

Warna status hanya digunakan ketika mempunyai fungsi.

Contoh:

Paid
→ Green

Unpaid
→ Amber

Overdue
→ Red

Available
→ Green

Occupied
→ Blue

Maintenance
→ Gray / Amber

Scheduled
→ Blue

Completed
→ Green


Main Layout

Gunakan layout dashboard bisnis yang konvensional.

Desktop:

Sidebar Kiri

Top Header

Page Header

Content Area


Struktur umum:

┌──────────────┬───────────────────────────────────────────┐
│              │ Dashboard                       Profile  │
│              ├───────────────────────────────────────────┤
│   SIDEBAR    │                                           │
│              │ Dashboard                                 │
│ Dashboard    │ Ringkasan operasional hari ini            │
│ Properti     │                                           │
│ Kamar        │ [Stat] [Stat] [Stat] [Stat]              │
│ Tenant       │                                           │
│ Visit        │ Visit Hari Ini                            │
│ Cleaning     │ ─────────────────────────────────────     │
│ Payment      │                                           │
│ Reports      │ Aktivitas Terbaru                         │
│              │ ─────────────────────────────────────     │
│              │                                           │
└──────────────┴───────────────────────────────────────────┘


Gunakan alignment yang rapi.

Gunakan whitespace yang cukup.

Jangan membuat banyak floating container.

Sidebar Design

Sidebar harus sederhana dan mudah digunakan.

Gunakan:

Icon kecil
+
Label menu


Contoh:

Dashboard

Properti

Kamar

Calon Tenant

Visit

Tenant

Cleaning

Payment

Laporan


Menu aktif cukup menggunakan:

Light primary background

Primary text color

Medium font weight


Tidak perlu:

Gradient

Glow

Large pill

Animated background


Tambahkan divider jika diperlukan untuk membagi grup menu.

Contoh:

OPERASIONAL

Dashboard
Properti
Kamar
Tenant

AKTIVITAS

Visit
Cleaning
Payment

LAINNYA

Reports
Users
Settings


Tetap jaga sidebar agar tidak terlalu ramai.

Dashboard Design

Dashboard harus fokus pada informasi yang perlu diketahui user.

Jangan menampilkan semua data dalam bentuk statistic card.

Gunakan maksimal sekitar:

4–6 summary cards


pada viewport utama.

Contoh Admin:

Total Kamar       48

Terisi            37

Tersedia          11

Tenant Aktif      37


Summary card menggunakan:

White background

Thin border

Medium border radius

Minimal shadow atau tanpa shadow

Compact padding

Clear typography


Jangan menggunakan gradient card.

Jangan menggunakan icon besar.

Jika menggunakan icon, gunakan kecil sebagai secondary visual.

Setelah summary tampilkan informasi operasional:

Visit Hari Ini

Cleaning Hari Ini

Tagihan Jatuh Tempo

Aktivitas Terbaru


Informasi tersebut lebih penting dibandingkan memperbanyak statistik.

Data Table

Untuk halaman operasional gunakan tabel sebagai komponen utama.

Contoh:

Tenant

┌────────────────────┬─────────────┬──────────────┬─────────┐
│ Nama               │ Kamar       │ Check-in     │ Status  │
├────────────────────┼─────────────┼──────────────┼─────────┤
│ Ahmad Rizky        │ A-03        │ 12 Aug 2026  │ Aktif   │
│ Dinda Putri        │ A-07        │ 15 Aug 2026  │ Aktif   │
└────────────────────┴─────────────┴──────────────┴─────────┘


Gunakan:

Simple table header

Thin separator

Consistent row height

Subtle row hover

Small status badge

Compact action area


Action dapat menggunakan:

View

Edit

Three-dot menu


Jangan mengubah setiap row menjadi card.

Page Header

Setiap halaman dashboard gunakan pola konsisten.

Contoh:

Tenant

Kelola tenant aktif pada seluruh properti.

                            [+ Tambah Tenant]


Di bawah header:

Search

Filter

Table / Content


Contoh:

[ Cari nama tenant... ] [Status ▼] [Kost ▼]

------------------------------------------------------------
Tenant Table


Form Design

Form harus terasa seperti aplikasi bisnis profesional.

Contoh:

Tambah Tenant

Nama Lengkap
[_______________________________]

Nomor WhatsApp
[_______________________________]

Instansi
[_______________________________]

Kost
[ Pilih Kost                  ▼ ]

Kamar
[ Pilih Kamar                 ▼ ]


                         [Batal] [Simpan]


Gunakan:

Label di atas field

Consistent input height

Clear validation

Simple helper text

Logical form grouping


Jangan menggunakan field terlalu besar.

Jangan memberikan icon pada setiap input kecuali memang membantu.

Untuk form panjang, kelompokkan menggunakan section:

Informasi Pribadi

Informasi Kost

Informasi Pembayaran


Gunakan divider atau whitespace untuk memisahkan section.

Detail Page

Gunakan halaman detail untuk informasi yang cukup kompleks.

Contoh detail Tenant:

← Kembali ke Tenant

Ahmad Rizky                         Aktif

Kost Vintera Antapani
Kamar A-03


Gunakan tab sederhana jika diperlukan:

Overview

Payment

Cleaning

Activity


Jangan menampilkan seluruh informasi dalam banyak card kecil.

Modal & Drawer

Gunakan modal hanya untuk aksi sederhana seperti:

Konfirmasi

Delete

Update Status

Tambah data sederhana


Untuk form yang lebih kompleks gunakan:

Dedicated Page
atau
Side Drawer


Jangan menggunakan modal besar untuk semua proses.

Status Badge

Gunakan badge kecil.

Contoh:

● Aktif

● Terisi

● Belum Dibayar

● Selesai


Badge menggunakan warna muted.

Hindari badge dengan:

Gradient

Glow

Large padding


Button Style

Gunakan hierarchy button yang jelas.

Primary:

Tambah Tenant

Simpan

Buat Jadwal

Konfirmasi Pembayaran


Secondary:

Batal

Kembali

Preview


Danger:

Hapus


Gunakan ukuran button normal dan konsisten.

Hindari:

Gradient button

Oversized button

Large pill button

Glow button


Typography

Gunakan satu jenis font utama.

Prefer salah satu:

Inter

DM Sans

Manrope

Plus Jakarta Sans


Jangan menggunakan beberapa font sekaligus.

Typography hierarchy:

Page Title:
24–28px

Section Title:
18–20px

Body:
14–16px

Table:
14px

Caption:
12–13px


Gunakan font weight secara terkontrol:

Regular

Medium

Semibold


Hindari terlalu banyak Bold.

Icon

Gunakan:

Lucide Icons


Gunakan icon hanya jika membantu pengguna mengenali fungsi.

Cocok digunakan untuk:

Sidebar

Action tertentu

Notification

Search

Filter

Empty State


Jangan menambahkan icon pada setiap text atau card.

Empty State

Jika belum ada data, tampilkan empty state sederhana.

Contoh:

Belum ada jadwal visit

Jadwal visit calon tenant akan muncul di sini.

[+ Buat Jadwal]


Gunakan icon sederhana jika diperlukan.

Tidak perlu ilustrasi besar.

Loading State

Gunakan:

Skeleton loading


yang menyerupai struktur halaman sebenarnya.

Hindari spinner besar di tengah layar sebagai default untuk semua halaman.

Feedback

Gunakan toast sederhana untuk:

Data berhasil disimpan.

Data berhasil diperbarui.

Dokumentasi berhasil diupload.

Pembayaran berhasil dikonfirmasi.


Toast harus singkat dan tidak mengganggu user.

Mobile UI

Jangan hanya mengecilkan layout desktop.

Untuk mobile:

Top App Bar

Drawer Navigation

Responsive Content

Summary Card 2 Columns

List menggantikan tabel jika tabel terlalu lebar


Contoh mobile dashboard:

Dashboard

Halo, Admin

[Kamar Terisi] [Kamar Kosong]

[Visit Hari Ini]
[Cleaning Hari Ini]

Aktivitas Terbaru


Untuk tabel kompleks di mobile:

Gunakan card/list row khusus mobile yang tetap compact.

Contoh:

Ahmad Rizky
Kamar A-03

Check-in: 12 Agustus 2026

● Aktif

                 Detail →


Spacing

Gunakan spacing system yang konsisten.

Jangan memberikan jarak sangat besar antara section.

Dashboard harus compact namun tetap nyaman dibaca.

Gunakan whitespace untuk membentuk hierarchy, bukan dekorasi.

Border Radius

Gunakan border radius moderate.

Contoh:

Input:
6–8px

Button:
6–8px

Card:
8–12px

Modal:
10–12px


Jangan membuat hampir semua elemen menggunakan:

20px
24px
32px


karena akan membuat UI terasa seperti template AI.

Shadow

Gunakan shadow sangat sedikit.

Prefer:

Border


dibandingkan shadow berat.

Jika menggunakan shadow:

Very subtle shadow


hanya pada:

Dropdown

Modal

Floating menu


Micro Interaction

Gunakan animasi hanya untuk interaction.

Contoh:

Sidebar open / close

Dropdown

Modal

Hover

Toast


Durasi:

150–250ms


Jangan menggunakan decorative animation.

Public Website UI

Untuk halaman publik:

Home

Daftar Kost

Detail Kost


buat desain lebih visual dibanding dashboard, tetapi tetap natural.

Hero jangan terlalu besar.

Gunakan struktur:

Navbar

Hero

Featured Property

Benefits

Available Rooms

CTA

Footer


Hindari hero dengan:

Full-screen gradient

Floating shapes

AI-generated abstract decoration


Gunakan foto kost/properti sebagai visual utama.

Image Treatment

Foto properti harus menjadi elemen visual utama di halaman publik.

Gunakan:

Natural aspect ratio

Simple rounded corner

Consistent object-cover

Clean gallery


Jangan memberikan:

Gradient overlay berlebihan

Glow

Unnecessary image effects


Overall Design Requirement

Hasil akhir harus terasa seperti:

Website manajemen kost yang dibuat oleh tim product designer dan frontend developer untuk digunakan dalam operasional perusahaan secara nyata.

Bukan seperti:

Template website otomatis yang dibuat oleh AI.

Jika ada pilihan antara desain yang lebih dekoratif dengan desain yang lebih usable, pilih desain yang lebih usable.

Utamakan:

Clarity

Consistency

Usability

Information Hierarchy

Professional Tables

Compact Dashboard

Simple Forms

Realistic Workflow

Human Designed Appearance


💻 42. RESPONSIVE DESIGN

Website harus responsive untuk:

Desktop

Tablet

Mobile


Desktop:

Sidebar tetap di kiri


Mobile:

Sidebar menjadi drawer


Table harus dapat digunakan di layar kecil.

Jika tabel terlalu kompleks untuk mobile, tampilkan versi list/card yang lebih sesuai.

🔍 43. SEARCH & FILTER

Tambahkan search dan filter pada halaman:

Kost

Kamar

Prospect

Tenant

Visit

Cleaning

Payment


Contoh filter:

Status

Property

Date

Payment Status


Filter harus mudah digunakan dan tidak memenuhi layar.

🏷️ 44. STATUS BADGES

Gunakan status badge yang konsisten.

Contoh:

Available

Occupied

Scheduled

Completed

Unpaid

Paid

Overdue

Deal

Follow Up


Gunakan warna status secara konsisten pada seluruh website.

⚡ 45. EMPTY STATE

Jangan tampilkan table kosong begitu saja.

Contoh:

Belum ada jadwal visit.

Buat jadwal visit pertama untuk calon tenant.


Button:

+ Buat Jadwal


Empty state harus sederhana dan tidak menggunakan ilustrasi berlebihan.

⚠️ 46. LOADING & ERROR STATE

Semua halaman database harus memiliki:

Loading State

Empty State

Error State

Success Feedback


Gunakan toast notification untuk:

Data berhasil disimpan

Data berhasil diperbarui

Dokumentasi berhasil diupload

Pembayaran berhasil dikonfirmasi


🚫 47. FITUR YANG BELUM PERLU UNTUK MVP

Jangan implementasikan terlebih dahulu:

Payment Gateway

WhatsApp Business API automation

Instagram API

TikTok API

Facebook API

AI

Chat internal

Mobile App

Advanced Analytics

Complex Accounting

Automatic Bank Reconciliation

Complex Maintenance Management

Advanced CRM

Multi-language

Subscription / SaaS Billing


Namun struktur kode dan database harus mudah dikembangkan untuk menambahkan fitur tersebut di masa depan.

✅ 48. MVP ACCEPTANCE FLOW

MVP dianggap berhasil apabila workflow berikut benar-benar dapat dilakukan.

FLOW 1 — Tenant Acquisition

Public melihat Kost
↓
Hubungi Admin
↓
Admin membuat Prospect
↓
Admin membuat Visit
↓
Assistant melihat Visit
↓
Assistant upload Dokumentasi
↓
Admin melakukan Follow Up
↓
Prospect → Deal
↓
Admin mencatat DP
↓
Pelunasan
↓
Schedule Check-in
↓
Tenant Aktif
↓
Room → Occupied


FLOW 2 — Cleaning

Admin membuat Cleaning Schedule
↓
Helper melihat jadwal
↓
Tenant melihat jadwal
↓
Owner melihat jadwal
↓
Helper melakukan Cleaning
↓
Upload Dokumentasi
↓
Cleaning Completed
↓
Admin + Owner + Tenant dapat melihat hasil


FLOW 3 — Payment

Invoice Bulanan Dibuat
↓
Tenant melihat Tagihan
↓
Admin melakukan Reminder via WhatsApp
↓
Tenant Membayar
↓
Admin Verifikasi
↓
Invoice → Paid
↓
Owner + Tenant mendapatkan Notification


FLOW 4 — Owner Reporting

Tenant
+
Occupancy
+
Cleaning
+
Payment
+
Content
↓
Monthly Report
↓
Owner Dashboard


🎯 FINAL REQUIREMENT

Prioritaskan functional MVP, bukan jumlah fitur.

Lebih baik memiliki:

15 fitur yang benar-benar berfungsi


daripada:

50 fitur yang hanya berupa tampilan


Pastikan:

Authentication bekerja

Role bekerja

Database bekerja

CRUD bekerja

Upload Storage bekerja

Data antar dashboard terintegrasi

Status workflow berubah dengan benar

Notification tersimpan

Payment tracking bekerja

Cleaning workflow bekerja

Visit workflow bekerja

Owner dapat monitoring

Tenant dapat melihat data miliknya


Jangan gunakan dummy data setelah Supabase sudah terkoneksi.

Gunakan struktur komponen yang reusable dan clean architecture agar aplikasi mudah dikembangkan pada Phase 2.

Untuk UI, pastikan keseluruhan aplikasi terasa natural, profesional, realistis, dan human-designed, bukan seperti template generik AI.

Untuk flow nya sama dengan file pdf yang saya sertakan.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/632b473d-c10e-4df8-9b61-4805f3712cdf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
