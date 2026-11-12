# Snapjoy — Rancangan Produk dan Blueprint Pengembangan End-to-End

> **Dokumen rancangan produk, arsitektur teknis, UX, keamanan, operasional, dan roadmap implementasi**  
> Versi: 1.0  
> Status: Blueprint awal — dapat menjadi acuan pengembangan bertahap  
> Nama produk: **Snapjoy**

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Visi, Misi, dan Positioning Produk](#2-visi-misi-dan-positioning-produk)
3. [Masalah Pengguna dan Solusi](#3-masalah-pengguna-dan-solusi)
4. [Target Pengguna dan Hak Akses](#4-target-pengguna-dan-hak-akses)
5. [Ruang Lingkup Produk](#5-ruang-lingkup-produk)
6. [User Journey dan Alur Sistem](#6-user-journey-dan-alur-sistem)
7. [Arsitektur Teknologi](#7-arsitektur-teknologi)
8. [Arsitektur Aplikasi](#8-arsitektur-aplikasi)
9. [Rancangan Database](#9-rancangan-database)
10. [Arsitektur Penyimpanan Foto](#10-arsitektur-penyimpanan-foto)
11. [Camera Engine dan Pengolahan Foto](#11-camera-engine-dan-pengolahan-foto)
12. [Desain UI/UX](#12-desain-uiux)
13. [QR Code dan Sistem Akses Acara](#13-qr-code-dan-sistem-akses-acara)
14. [Realtime Shared Gallery](#14-realtime-shared-gallery)
15. [Dashboard dan Event Management](#15-dashboard-dan-event-management)
16. [Keamanan, Privasi, dan Moderasi](#16-keamanan-privasi-dan-moderasi)
17. [PWA dan Kompatibilitas Perangkat](#17-pwa-dan-kompatibilitas-perangkat)
18. [Deployment dan Infrastruktur](#18-deployment-dan-infrastruktur)
19. [Pengujian dan Quality Assurance](#19-pengujian-dan-quality-assurance)
20. [Roadmap Pengembangan](#20-roadmap-pengembangan)
21. [Prioritas MVP dan Kriteria Selesai](#21-prioritas-mvp-dan-kriteria-selesai)
22. [Model Bisnis dan Monetisasi](#22-model-bisnis-dan-monetisasi)
23. [Risiko dan Mitigasi](#23-risiko-dan-mitigasi)
24. [Metrik Produk](#24-metrik-produk)
25. [Struktur Repository yang Disarankan](#25-struktur-repository-yang-disarankan)
26. [Strategi Implementasi Teknis](#26-strategi-implementasi-teknis)
27. [Keputusan Produk yang Harus Ditetapkan](#27-keputusan-produk-yang-harus-ditetapkan)
28. [Checklist Peluncuran](#28-checklist-peluncuran)
29. [Kesimpulan](#29-kesimpulan)

---

## 1. Ringkasan Eksekutif

**Snapjoy** adalah platform SaaS untuk pengalaman photo booth berbasis web. Tamu acara memindai QR Code, membuka halaman acara melalui browser ponsel, mengambil foto, memilih filter dan frame, lalu mengunggah hasilnya ke galeri bersama.

Snapjoy bukan aplikasi kamera biasa dan bukan sekadar halaman galeri. Produk ini menggabungkan tiga pengalaman utama:

1. **Capture experience** — kamera berbasis browser dengan filter, frame, preview, dan pengambilan foto.
2. **Shared experience** — foto yang diunggah dapat ditampilkan dalam galeri bersama dan diperbarui secara realtime.
3. **Event management** — pemilik acara dapat mengatur identitas visual, akses, kuota, foto, dan moderasi melalui dashboard.

Platform harus mendukung banyak acara dan banyak pelanggan secara terisolasi. Satu pelanggan dapat mengelola beberapa acara, sedangkan setiap acara memiliki halaman publik, konfigurasi kamera, QR Code, dan galeri sendiri.

### Prinsip rancangan

- **Mobile-first:** pengalaman utama berlangsung di browser ponsel.
- **No guest account:** tamu tidak wajib mendaftar atau memasang aplikasi.
- **Event isolation:** data dan foto satu acara tidak boleh tercampur dengan acara lain.
- **Client-side processing:** filter dan frame diterapkan sebelum foto diunggah.
- **Secure by default:** akses publik, upload, dan penyimpanan harus dibatasi.
- **Progressive delivery:** bangun camera prototype terlebih dahulu, kemudian gallery, event management, dan SaaS.
- **Operationally measurable:** biaya storage, bandwidth, jumlah upload, dan performa harus dapat dipantau.

### Definisi produk versi pertama

Pengunjung memindai QR Code acara → membuka kamera → mengambil foto → memilih atau menerapkan frame/filter → melihat preview → mengunggah → foto masuk ke galeri acara → pengunjung lain dapat melihat dan mengunduh foto sesuai kebijakan acara.

---

## 2. Visi, Misi, dan Positioning Produk

### Visi

Menjadi platform dokumentasi acara yang memungkinkan setiap tamu ikut menciptakan dan membagikan kenangan acara secara mudah, cepat, dan personal.

### Misi

- Menghilangkan kebutuhan instalasi aplikasi bagi tamu.
- Menyediakan pengalaman kamera yang terasa seperti disposable camera atau photo booth.
- Menyatukan foto dari banyak tamu dalam satu galeri acara.
- Memberikan kontrol branding dan pengelolaan kepada penyelenggara.
- Menyediakan layanan yang dapat digunakan untuk berbagai jenis acara.

### Positioning

**Snapjoy — Capture the moment, share the joy.**

Snapjoy diposisikan sebagai *event photo-sharing platform* dengan pengalaman kamera dan galeri bersama yang dapat dikustomisasi. Referensi POV Camera digunakan sebagai inspirasi pengalaman, bukan untuk menyalin identitas visual, aset, kode, atau implementasi milik pihak lain.

### Nilai pembeda

- Custom frame dengan nama, tanggal, logo, dan identitas acara.
- Filter kamera yang dapat ditentukan per acara.
- Satu galeri bersama untuk seluruh tamu.
- QR Code unik untuk setiap acara.
- Dashboard pengelolaan foto dan moderasi.
- Sistem multi-event untuk pelanggan individu, WO, dan EO.

---

## 3. Masalah Pengguna dan Solusi

| Masalah | Solusi Snapjoy |
|---|---|
| Foto acara tersebar di ponsel dan grup chat | Satu shared gallery per acara |
| Tamu harus memasang aplikasi | Akses melalui browser menggunakan QR |
| Hasil foto tidak memiliki identitas acara | Custom frame dan timestamp |
| Dokumentasi hanya berasal dari fotografer resmi | Tamu dapat berkontribusi langsung |
| Penyelenggara sulit mengumpulkan foto | Dashboard dan galeri terpusat |
| Foto publik berisiko berisi konten tidak pantas | Moderasi, pelaporan, dan kontrol publikasi |
| Setiap acara memerlukan website terpisah | Satu platform multi-tenant |

---

## 4. Target Pengguna dan Hak Akses

### 4.1 Persona

| Persona | Kebutuhan utama |
|---|---|
| Pasangan pengantin | Galeri foto tamu dengan tampilan personal |
| Wedding Organizer | Mengelola beberapa acara klien |
| Event Organizer | Mengatur banyak acara dengan kebutuhan berbeda |
| Perusahaan | Dokumentasi acara internal atau publik |
| Keluarga/komunitas | Cara sederhana mengumpulkan foto bersama |
| Tamu | Mengambil, mengunggah, melihat, dan mengunduh foto |

### 4.2 Jenis akun dan peran

**Platform administrator**
- Mengelola pelanggan, paket, penggunaan, dan status platform.
- Menangani laporan penyalahgunaan dan operasional.
- Memiliki akses administratif yang tercatat dalam audit log.

**Organization owner**
- Mengelola profil organisasi dan anggota.
- Membuat serta mengelola seluruh acara milik organisasi.
- Melihat penggunaan kuota dan paket.

**Organization member / event manager**
- Mengelola acara sesuai izin yang diberikan.
- Mengatur desain, foto, dan moderasi jika diizinkan.

**Moderator**
- Meninjau foto yang menunggu persetujuan.
- Menyetujui, menolak, atau menghapus foto sesuai kewenangan.

**Guest**
- Tidak wajib memiliki akun.
- Mengakses acara melalui token/slug publik.
- Mengambil foto dan melakukan upload sesuai aturan acara.
- Melihat foto yang memang dipublikasikan.

### 4.3 Prinsip otorisasi

Gunakan role-based access control (RBAC) yang dikombinasikan dengan kepemilikan organisasi dan acara. Jangan hanya mengandalkan penyembunyian tombol pada frontend. Setiap operasi penting harus divalidasi di backend/database melalui Supabase Row Level Security (RLS) atau endpoint server yang terotorisasi.

---

## 5. Ruang Lingkup Produk

### 5.1 Fitur tamu

| Fitur | Keterangan | Prioritas |
|---|---|---|
| QR access | Membuka acara dari QR Code | P0 |
| Camera permission | Meminta izin kamera browser | P0 |
| Front/back camera | Memilih kamera depan atau belakang | P0 |
| Live preview | Menampilkan tampilan kamera | P0 |
| Shutter | Mengambil foto | P0 |
| Filter | Warm, vintage, B&W, retro | P0 |
| Custom frame | Menggabungkan foto dengan frame acara | P0 |
| Preview result | Meninjau hasil akhir sebelum upload | P0 |
| Retake | Mengambil ulang foto | P0 |
| Upload | Mengunggah hasil akhir | P1 |
| Shared gallery | Menampilkan foto publik acara | P1 |
| Download | Mengunduh foto | P1 |
| Realtime | Memunculkan foto baru otomatis | P1 |
| Report photo | Melaporkan foto | P2 |
| PWA install | Menambahkan Snapjoy ke home screen | P2 |

### 5.2 Fitur pemilik acara

| Fitur | Keterangan | Prioritas |
|---|---|---|
| Create event | Membuat acara | P1 |
| Event profile | Nama, tanggal, lokasi, deskripsi | P1 |
| QR generator | QR unik per acara | P1 |
| Theme/frame editor | Memilih atau mengatur frame | P1 |
| Filter configuration | Mengaktifkan filter tertentu | P1 |
| Gallery management | Melihat dan mengelola foto | P1 |
| Moderation | Approve/reject/hide foto | P1 |
| Upload limits | Batas foto per tamu/per acara | P1 |
| Event analytics | Statistik scan, upload, dan penggunaan | P2 |
| Member management | Mengundang staf/anggota | P2 |

### 5.3 Fitur SaaS

- Organization dan multi-user.
- Multi-event.
- Paket berlangganan.
- Batas jumlah foto, storage, dan masa aktif.
- Riwayat pembayaran dan invoice.
- Usage dashboard.
- Suspend/activate organization atau event.
- Audit log dan dukungan pelanggan.

Fitur SaaS penuh tidak perlu dibuat sebelum alur capture dan gallery terbukti stabil.

---

## 6. User Journey dan Alur Sistem

### 6.1 Guest journey

1. Tamu melihat QR Code pada meja, backdrop, undangan, atau signage acara.
2. Tamu memindai QR menggunakan kamera ponsel.
3. Browser membuka URL acara, misalnya `https://snapjoy.example/e/nama-acara`.
4. Halaman memuat nama acara, identitas visual, dan tombol **Mulai Foto**.
5. Tamu menekan tombol tersebut.
6. Browser meminta izin kamera.
7. Kamera aktif dan menampilkan live preview.
8. Tamu memilih kamera depan/belakang dan filter.
9. Tamu mengambil foto.
10. Sistem menggabungkan hasil foto dengan frame yang aktif.
11. Tamu melihat preview final.
12. Tamu memilih **Ulangi** atau **Gunakan Foto**.
13. Sistem memvalidasi ukuran, format, kuota, dan status acara.
14. Foto diunggah.
15. Sistem menampilkan status berhasil/gagal.
16. Jika berhasil dan foto dipublikasikan, foto muncul di shared gallery.
17. Tamu dapat membuka dan mengunduh foto.

### 6.2 Owner journey

1. Pemilik mendaftar dan login.
2. Pemilik membuat organization atau workspace.
3. Pemilik membuat acara.
4. Pemilik mengisi nama, tanggal, deskripsi, dan pengaturan acara.
5. Pemilik memilih template frame dan filter.
6. Pemilik mengatur aturan upload dan moderasi.
7. Sistem membuat URL publik dan QR Code.
8. Pemilik mengunduh QR untuk dicetak.
9. Selama acara, pemilik memantau foto dan moderasi.
10. Setelah acara, pemilik mengunduh foto atau menonaktifkan akses sesuai kebijakan.

### 6.3 Alur status foto

Gunakan status eksplisit agar alur moderasi mudah dikelola:

- `uploading` — status UI lokal ketika file sedang dikirim.
- `pending` — file tersimpan dan menunggu moderasi.
- `published` — boleh muncul di galeri publik.
- `rejected` — ditolak moderator.
- `hidden` — disembunyikan dari galeri, tetapi record dapat dipertahankan untuk audit.
- `deleted` — dihapus sesuai kebijakan retensi.

Jangan menyimpan `uploading` sebagai status database jika proses tersebut hanya berlangsung di browser. Status server dimulai setelah upload terverifikasi.

---

## 7. Arsitektur Teknologi

### 7.1 Stack yang direkomendasikan

| Lapisan | Teknologi | Tanggung jawab |
|---|---|---|
| Frontend | Next.js + React + TypeScript | Halaman publik, kamera, dashboard |
| Styling | Tailwind CSS | Sistem desain dan responsivitas |
| UI primitives | Komponen internal / library aksesibel | Dialog, menu, tombol, form |
| Camera | MediaDevices API (`getUserMedia`) | Akses kamera |
| Image processing | HTML Canvas API | Filter, crop, frame compositing |
| Backend platform | Supabase | Database, Auth, Storage, Realtime |
| Database | PostgreSQL (Supabase) | Data organisasi, acara, foto |
| Authentication | Supabase Auth | Login pemilik dan staf |
| File storage | Supabase Storage | Foto final dan aset frame |
| Realtime | Supabase Realtime | Notifikasi foto baru |
| Hosting frontend | Vercel | Build dan deployment Next.js |
| QR Code | Library QR Code di frontend/server | QR unik setiap acara |
| Validation | Zod atau validator setara | Validasi input dan konfigurasi |
| Monitoring | Error monitoring + analytics | Error, performa, dan penggunaan |

### 7.2 Mengapa stack ini

**Next.js**
- Mendukung routing, rendering halaman publik, dan dashboard.
- Cocok untuk aplikasi React dengan TypeScript.
- Dapat menggunakan server-side route/handler untuk operasi yang memerlukan secret.
- Memiliki ekosistem deployment yang matang.

**Supabase**
- Menyediakan PostgreSQL, Auth, Storage, dan Realtime dalam satu platform.
- RLS dapat digunakan untuk membatasi akses berdasarkan organization/event.
- Mengurangi kebutuhan membangun backend infrastruktur dari awal.

**Vercel**
- Memudahkan deployment Next.js dan preview untuk setiap perubahan.
- Mendukung environment variables dan domain.
- Cocok untuk memulai, tetapi biaya dan batas penggunaan harus dipantau saat volume foto meningkat.

### 7.3 Catatan penting

- Gunakan HTTPS pada production. Browser modern mensyaratkan secure context untuk akses kamera, kecuali pengecualian localhost saat development.
- Jangan pernah menaruh `SUPABASE_SERVICE_ROLE_KEY` di frontend.
- Public Supabase anon/publishable key boleh digunakan di frontend hanya dengan RLS yang benar.
- Jangan menganggap Realtime sebagai pengganti query database; gunakan event realtime sebagai sinyal untuk mengambil data terbaru.
- Buat abstraksi storage agar penyedia penyimpanan dapat diganti jika biaya bertumbuh.

---

## 8. Arsitektur Aplikasi

### 8.1 Gambaran komponen

```text
Guest Mobile Browser
    |
    | Scan QR / open event URL
    v
Next.js Public Event App
    |
    +--> Event configuration
    |
    +--> Camera Engine (MediaDevices API)
    |       |
    |       +--> Live preview
    |       +--> Filter rendering
    |       +--> Capture
    |       +--> Canvas frame composition
    |
    +--> Upload service
            |
            +--> Validate event and upload policy
            +--> Upload image to private storage
            +--> Create photo metadata
            +--> Publish/queue moderation status
                    |
                    v
              Supabase
              +-- PostgreSQL
              +-- Storage
              +-- Realtime
                    |
                    v
              Shared Gallery

Owner Browser
    |
    v
Next.js Dashboard
    |
    +--> Supabase Auth
    +--> Organization / Event management
    +--> Frame and filter configuration
    +--> Photo moderation
    +--> Usage and analytics
```

### 8.2 Pemisahan area aplikasi

Pisahkan setidaknya tiga area:

- **Public event:** `/e/[eventSlug]`
- **Public gallery:** `/e/[eventSlug]/gallery`
- **Dashboard:** `/dashboard/...`

Contoh struktur URL:

```text
/e/andi-sinta-2027
/e/andi-sinta-2027/gallery
/dashboard
/dashboard/events
/dashboard/events/[eventId]
/dashboard/events/[eventId]/design
/dashboard/events/[eventId]/photos
/dashboard/settings
```

Slug publik bukan pengganti otorisasi. Untuk acara privat, tambahkan access token atau mekanisme password/PIN sesuai kebutuhan.

### 8.3 Prinsip pemisahan domain

- Komponen kamera tidak boleh bergantung langsung pada struktur database.
- Pengolahan foto harus dapat diuji secara terpisah.
- Upload service bertanggung jawab atas validasi dan pengiriman file.
- Gallery hanya mengambil foto dengan status yang boleh ditampilkan.
- Dashboard menggunakan operasi terotorisasi.
- Konfigurasi frame disimpan sebagai data dan referensi aset, bukan kode HTML/JavaScript bebas dari pengguna.

---

## 9. Rancangan Database

Gunakan PostgreSQL melalui Supabase. Skema berikut adalah rancangan awal; tipe kolom, constraint, index, dan kebijakan RLS perlu dibuat melalui migration.

### 9.1 Relasi utama

```text
auth.users
    |
    +--- organization_members --- organizations
                                      |
                                      +--- events
                                             |
                                             +--- event_settings
                                             +--- event_frames
                                             +--- event_filters
                                             +--- photos
                                             +--- event_access_tokens
                                             +--- event_usage

photos
    |
    +--- photo_reports
    +--- photo_moderation_logs

organizations
    |
    +--- subscriptions
    +--- usage_records
```

### 9.2 Tabel `organizations`

Mewakili pelanggan atau workspace.

| Kolom | Tipe konseptual | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| name | text | Nama organisasi |
| slug | text | Identitas URL internal/unik |
| owner_user_id | uuid | Pemilik |
| created_at | timestamptz | Waktu dibuat |
| updated_at | timestamptz | Waktu diperbarui |

### 9.3 Tabel `organization_members`

Menghubungkan user dengan organization.

| Kolom | Tipe konseptual | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| organization_id | uuid | Relasi organization |
| user_id | uuid | Relasi auth.users |
| role | text/enum | owner, admin, editor, moderator |
| created_at | timestamptz | Waktu bergabung |

Constraint unik: `(organization_id, user_id)`.

### 9.4 Tabel `events`

| Kolom | Tipe konseptual | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| organization_id | uuid | Pemilik acara |
| name | text | Nama acara |
| slug | text | URL publik unik |
| description | text | Deskripsi |
| venue_name | text nullable | Nama lokasi |
| starts_at | timestamptz nullable | Waktu mulai |
| ends_at | timestamptz nullable | Waktu selesai |
| timezone | text | Zona waktu acara |
| status | text/enum | draft, scheduled, active, completed, archived |
| visibility | text/enum | public, unlisted, private |
| created_at | timestamptz | Waktu dibuat |
| updated_at | timestamptz | Waktu diperbarui |

Constraint: slug harus unik pada cakupan yang dipilih. Untuk URL sederhana, gunakan unique global; jika slug berada di bawah organization, gunakan unique `(organization_id, slug)` dan sertakan identitas organization dalam URL.

### 9.5 Tabel `event_settings`

Simpan pengaturan acara yang tidak cocok menjadi kolom inti `events`.

| Kolom | Tipe konseptual | Keterangan |
|---|---|---|
| event_id | uuid | Primary key dan FK |
| allow_upload | boolean | Upload aktif |
| allow_gallery | boolean | Galeri publik aktif |
| moderation_mode | text | auto_publish, manual_approval |
| max_photos_per_session | integer | Batas per sesi/perangkat |
| max_uploads_per_event | integer nullable | Batas total |
| max_file_size_mb | integer | Batas ukuran |
| allowed_mime_types | jsonb | Format yang diizinkan |
| photo_retention_days | integer nullable | Masa retensi |
| download_enabled | boolean | Download publik |
| updated_at | timestamptz | Waktu perubahan |

`max_photos_per_session` tidak dapat menjamin satu orang hanya mengunggah sebanyak itu karena tamu tidak login. Terapkan sebagai pembatasan berbasis session token, cookie, IP/rate limit, dan mekanisme anti-abuse; jelaskan bahwa pembatasan perangkat bukan identitas manusia yang sempurna.

### 9.6 Tabel `event_frames`

| Kolom | Tipe konseptual | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| event_id | uuid | Acara |
| name | text | Nama frame |
| asset_path | text | Lokasi PNG/SVG raster yang tervalidasi |
| preview_path | text nullable | Preview |
| config | jsonb | Posisi, ukuran, teks, warna |
| is_active | boolean | Frame aktif |
| sort_order | integer | Urutan |
| created_at | timestamptz | Waktu dibuat |

Untuk MVP, frame dapat berupa PNG transparan dengan dimensi dan rasio yang telah ditetapkan. Editor frame kompleks dapat menyusul.

### 9.7 Tabel `event_filters`

| Kolom | Tipe konseptual | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| event_id | uuid | Acara |
| name | text | Nama filter |
| filter_key | text | Kunci preset internal |
| config | jsonb | Parameter filter tervalidasi |
| is_active | boolean | Aktif/tidak |
| sort_order | integer | Urutan |

Jangan menerima CSS filter arbitrer atau JavaScript dari pengguna. Gunakan preset dan parameter dalam rentang yang telah ditentukan.

### 9.8 Tabel `photos`

| Kolom | Tipe konseptual | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| event_id | uuid | Acara |
| storage_path | text | Lokasi file final |
| thumbnail_path | text nullable | Thumbnail |
| mime_type | text | Tipe file |
| file_size_bytes | bigint | Ukuran file |
| width | integer | Lebar |
| height | integer | Tinggi |
| status | text/enum | pending, published, rejected, hidden, deleted |
| guest_session_id | uuid/text nullable | Identitas sesi pseudonim |
| filter_key | text nullable | Filter yang digunakan |
| frame_id | uuid nullable | Frame yang digunakan |
| captured_at | timestamptz nullable | Waktu capture dari client |
| uploaded_at | timestamptz | Waktu upload |
| published_at | timestamptz nullable | Waktu publikasi |
| created_at | timestamptz | Waktu dibuat |

Catatan:
- Waktu dari client dapat dimanipulasi; `uploaded_at` server adalah waktu yang lebih dapat dipercaya.
- Jangan menyimpan nama atau email tamu jika tidak dibutuhkan.
- Simpan metadata teknis seperlunya dan hindari menyimpan lokasi GPS dari EXIF.
- Pertimbangkan menghapus metadata EXIF saat proses finalisasi.

### 9.9 Tabel pendukung

**`event_access_tokens`**
- `id`, `event_id`, `token_hash`, `purpose`, `expires_at`, `revoked_at`, `created_at`.
- Simpan hash token, bukan token mentah.
- Gunakan untuk akses privat atau sesi upload bila diperlukan.

**`photo_reports`**
- `id`, `photo_id`, `reason`, `reporter_session_id`, `status`, `created_at`.

**`photo_moderation_logs`**
- `id`, `photo_id`, `moderator_user_id`, `action`, `reason`, `created_at`.

**`event_usage`**
- `id`, `event_id`, `metric`, `quantity`, `period_start`, `period_end`, `created_at`.

**`subscriptions`**
- `id`, `organization_id`, `plan_id`, `status`, `billing_provider`, `provider_subscription_id`, `current_period_start`, `current_period_end`.

**`plans`**
- `id`, `name`, `price`, `currency`, `limits` (jsonb), `is_active`.

**`audit_logs`**
- `id`, `actor_user_id`, `organization_id`, `event_id`, `action`, `metadata`, `created_at`.

### 9.10 Index dan constraint awal

Pertimbangkan index berikut:

- `events(slug)` atau unique index sesuai pola URL.
- `events(organization_id, status)`.
- `photos(event_id, status, uploaded_at DESC)`.
- `photos(event_id, created_at DESC)`.
- `organization_members(user_id, organization_id)`.
- `photo_reports(status, created_at)`.
- Foreign key untuk seluruh relasi.
- Check constraint untuk ukuran file, dimensi, status, dan nilai batas.

Jangan membuat index berlebihan. Ukur query aktual dan tambahkan index berdasarkan pola akses.

---

## 10. Arsitektur Penyimpanan Foto

Foto adalah komponen dengan potensi biaya terbesar. Storage dan bandwidth harus dirancang sejak awal.

### 10.1 Struktur object storage

Contoh path:

```text
events/{event_id}/photos/{photo_id}/original.webp
events/{event_id}/photos/{photo_id}/thumbnail.webp
events/{event_id}/frames/{frame_id}.png
events/{event_id}/exports/{export_id}.zip
```

Untuk MVP, hasil final yang telah mengandung filter dan frame dapat menjadi file utama. Simpan original tanpa frame hanya jika ada kebutuhan produk yang jelas, karena akan meningkatkan biaya storage.

### 10.2 Public vs private bucket

Rekomendasi awal: **private bucket** untuk foto.

Alasan:
- Foto acara dapat mengandung wajah dan informasi pribadi.
- Pemilik acara perlu mengatur akses dan moderasi.
- Foto `pending`, `rejected`, dan `hidden` tidak boleh dapat diakses publik.

Pola akses:
1. Guest meminta daftar foto yang dipublikasikan.
2. Backend hanya mengembalikan metadata `published`.
3. Untuk menampilkan file, gunakan signed URL dengan masa berlaku terbatas atau endpoint delivery yang memeriksa status.
4. Dashboard menggunakan akses terotorisasi.
5. Jangan mengandalkan URL yang sulit ditebak sebagai kontrol keamanan.

Jika memakai public bucket demi kemudahan dan performa, pahami bahwa siapa pun yang memperoleh URL file dapat mengaksesnya. Public bucket tidak cocok untuk foto yang belum disetujui.

### 10.3 Optimasi gambar

- Batasi dimensi hasil akhir, misalnya sisi panjang sekitar 1600–2400 px sesuai kebutuhan cetak/layar.
- Gunakan WebP atau JPEG untuk foto final.
- Gunakan PNG untuk frame transparan.
- Buat thumbnail terpisah untuk gallery.
- Validasi ukuran file dan MIME type di server.
- Jangan percaya ekstensi file dari browser.
- Pertimbangkan pipeline image processing server-side jika perlu normalisasi format dan pembuatan thumbnail yang konsisten.

### 10.4 Estimasi kapasitas

Gunakan formula:

```text
Total storage (GB) =
jumlah foto × rata-rata ukuran file (MB) / 1024

Bandwidth (GB) =
jumlah view foto × rata-rata ukuran file yang dikirim (GB)
```

Contoh simulasi, bukan proyeksi pasti:

- 500 foto × 0,8 MB ≈ 400 MB per acara.
- 2.000 foto × 0,8 MB ≈ 1,6 GB per acara.
- Jika satu foto dilihat berkali-kali, bandwidth dapat melampaui ukuran storage.

Sebelum menetapkan harga paket, ukur ukuran foto aktual dan pola download. Terapkan kuota dan retensi agar biaya tidak tumbuh tanpa kendali.

---

## 11. Camera Engine dan Pengolahan Foto

Bagian ini menjadi prioritas pertama karena merupakan pengalaman inti Snapjoy.

### 11.1 Akses kamera browser

Gunakan `navigator.mediaDevices.getUserMedia()`.

Konsep konfigurasi:

```ts
const constraints: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
};

const stream = await navigator.mediaDevices.getUserMedia(constraints);
videoElement.srcObject = stream;
await videoElement.play();
```

Untuk kamera depan, gunakan `facingMode: "user"`. Untuk kamera belakang, gunakan `facingMode: "environment"`.

Perilaku browser dan perangkat berbeda-beda. `ideal` lebih toleran dibanding `exact`; siapkan fallback jika constraint tidak didukung.

### 11.2 Siklus hidup kamera

Implementasi wajib:
- Meminta izin hanya setelah tindakan pengguna.
- Menampilkan instruksi jika izin ditolak.
- Menangani kamera tidak tersedia atau sedang digunakan aplikasi lain.
- Menghentikan semua track saat meninggalkan halaman atau kamera tidak diperlukan.
- Menangani pergantian kamera dengan menghentikan stream sebelumnya.
- Menghindari kamera tetap aktif ketika tab disembunyikan jika tidak diperlukan.
- Menampilkan status loading dan error yang jelas.

Contoh cleanup:

```ts
function stopCamera(stream?: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
```

### 11.3 Capture

- Gunakan elemen `<video>` sebagai sumber.
- Gambar frame video ke `<canvas>`.
- Sesuaikan rasio foto dan frame.
- Perhatikan orientasi, mirror preview kamera depan, dan orientasi hasil akhir.
- Ekspor canvas menjadi `Blob` melalui `canvas.toBlob()`.
- Gunakan hasil `Blob` untuk preview dan upload.

### 11.4 Filter

Untuk MVP, gunakan preset yang parameter tampilannya dikendalikan aplikasi:

| Filter | Karakter |
|---|---|
| Original | Warna asli |
| Warm | Temperatur warna lebih hangat |
| Vintage | Saturasi rendah, kontras lembut |
| B&W | Grayscale |
| Retro | Saturasi/kontras dan tint khas film |

Implementasi dapat dimulai dengan CSS filter untuk live preview, lalu gunakan parameter ekuivalen ketika merender hasil akhir di Canvas. Pastikan tampilan preview dan file final konsisten. CSS filter tidak otomatis ikut masuk ke file hasil capture jika hanya diterapkan pada elemen video.

Untuk hasil yang lebih presisi, buat pipeline pixel processing atau gunakan WebGL setelah kebutuhan performa terbukti.

### 11.5 Custom frame

Rekomendasi MVP:
- Frame berupa PNG transparan.
- Rasio dan ukuran frame ditetapkan.
- Area foto dan area dekorasi sudah dirancang dalam template.
- Teks nama acara, tanggal, atau logo dapat dirender ke canvas.
- Preview dan hasil export menggunakan komposisi yang sama.

Komposisi:

```text
Canvas final
    1. Draw background/base
    2. Draw captured photo into photo viewport
    3. Apply image treatment/filter
    4. Draw frame overlay
    5. Draw event title/date/logo if configured
    6. Export Blob
```

Jika menggunakan SVG untuk frame, sanitasi dan batasi sumber SVG. Untuk MVP, PNG lebih sederhana dan mengurangi risiko konten aktif.

### 11.6 Preview dan retake

Simpan hasil capture sementara di memori browser. Tampilkan:
- Foto final dengan frame.
- Tombol **Ulangi**.
- Tombol **Gunakan Foto**.
- Indikator ukuran/unggah bila dibutuhkan.

Jangan upload sebelum tamu menekan tombol konfirmasi, kecuali kelak produk memang menyediakan mode otomatis.

### 11.7 Batasan kamera yang harus diketahui

- Kamera browser memerlukan HTTPS pada production.
- iOS Safari dan Android Chrome memiliki perilaku berbeda.
- Browser tidak menjamin resolusi yang diminta akan selalu tersedia.
- Tidak semua perangkat mendukung perpindahan kamera dengan mulus.
- Pengalaman PWA tidak menghilangkan izin kamera browser.
- Uji pada perangkat fisik; emulator desktop tidak cukup.

---

## 12. Desain UI/UX

### 12.1 Arah visual

Snapjoy menggabungkan tiga karakter:

1. **Vintage/disposable camera:** grain ringan, timestamp, warna film.
2. **Modern minimalis:** layout bersih, kontrol sederhana, fokus ke foto.
3. **Elegant event:** tipografi, frame, dan warna yang mengikuti identitas acara.

Jangan memaksakan semua gaya pada satu layar. Gunakan sistem desain inti yang konsisten, sementara setiap acara dapat memiliki tema.

### 12.2 Prinsip UX

- Satu tindakan utama yang jelas pada setiap layar.
- Kamera mengambil porsi layar terbesar.
- Tombol shutter mudah dijangkau ibu jari.
- Kontras teks dan kontrol harus cukup.
- Hindari form panjang untuk tamu.
- Status upload harus jelas.
- Jika upload gagal, foto sementara tidak langsung hilang; sediakan retry.
- Jangan meminta login kepada tamu untuk alur dasar.

### 12.3 Layar utama tamu

**A. Event landing**
- Logo/nama acara.
- Tanggal acara.
- Deskripsi singkat.
- Tombol Mulai Foto.
- Link Lihat Galeri.

**B. Camera**
- Live preview.
- Toggle kamera depan/belakang.
- Pilihan filter.
- Pilihan frame jika lebih dari satu.
- Tombol shutter.
- Tombol kembali.

**C. Preview**
- Hasil foto final.
- Ulangi.
- Gunakan Foto.

**D. Upload progress**
- Progress indicator.
- Pesan jika gagal.
- Retry jika gagal.

**E. Success**
- Foto berhasil dikirim.
- Tombol Lihat Galeri.
- Tombol Ambil Foto Lagi jika kuota memungkinkan.

**F. Gallery**
- Grid foto responsif.
- Filter/sort sederhana jika diperlukan.
- Detail foto/lightbox.
- Download.
- Report photo jika diaktifkan.

### 12.4 Dashboard

Navigasi:
- Overview
- Events
- Gallery / Photos
- Design / Frames
- Settings
- Usage / Billing (fase SaaS)

Dashboard desktop dapat menggunakan sidebar. Pada ponsel, gunakan navigasi yang lebih ringkas.

### 12.5 Aksesibilitas

- Tombol memiliki label yang dapat dibaca screen reader.
- Jangan hanya menggunakan warna untuk menyampaikan status.
- Kontrol dapat dioperasikan dengan keyboard.
- Modal memiliki focus management.
- Hormati `prefers-reduced-motion`.
- Sediakan teks alternatif untuk aset bermakna.

---

## 13. QR Code dan Sistem Akses Acara

### 13.1 Format URL

Contoh:

```text
https://snapjoy.example/e/andi-sinta-2027
```

QR Code berisi URL acara, bukan data pribadi tamu.

### 13.2 Kebutuhan QR

- QR dibuat saat acara dipublikasikan.
- Pemilik dapat mengunduh PNG/SVG.
- Sediakan versi resolusi tinggi untuk cetak.
- Tambahkan instruksi singkat seperti “Scan untuk mengambil foto”.
- Uji hasil cetak dari jarak dan ukuran yang realistis.
- QR dapat diperbarui jika slug atau token akses berubah.

### 13.3 Public, unlisted, private

- **Public:** acara dapat ditemukan/diakses melalui URL publik sesuai pengaturan.
- **Unlisted:** tidak ditampilkan dalam discovery, tetapi siapa pun yang memiliki URL dapat mengakses.
- **Private:** memerlukan token, PIN, atau metode akses lain.

Perlu dibedakan antara “tidak terdaftar” dan “aman”. URL unlisted tetap dapat dibagikan ulang.

### 13.4 QR rotasi dan pencabutan

Untuk acara privat, gunakan token akses yang dapat dicabut. QR lama harus dapat dinonaktifkan bila tersebar. Jangan menganggap QR sebagai autentikasi kuat karena QR dapat difoto dan dibagikan.

---

## 14. Realtime Shared Gallery

### 14.1 Alur

1. Guest mengunggah file.
2. Backend memvalidasi event, kuota, tipe file, dan ukuran.
3. File masuk ke storage.
4. Metadata foto dibuat dengan status `pending` atau `published`.
5. Jika status `published`, perubahan dapat memicu update Realtime.
6. Browser gallery menerima notifikasi.
7. Gallery mengambil metadata terbaru dan menampilkan foto.

### 14.2 Moderasi

Mode yang direkomendasikan:

- **Auto-publish:** foto langsung terlihat setelah validasi teknis.
- **Manual approval:** foto hanya terlihat setelah moderator menyetujui.

Untuk acara publik dan penggunaan komersial, manual approval sebaiknya tersedia sejak versi awal. Auto-publish dapat diaktifkan oleh pemilik dengan pemahaman risiko yang jelas.

### 14.3 Performa gallery

- Gunakan thumbnail, bukan file resolusi penuh, pada grid.
- Terapkan pagination atau infinite scroll.
- Lazy-load gambar.
- Gunakan ukuran gambar responsif.
- Hindari mengambil seluruh foto sekaligus.
- Terapkan batas jumlah item per query.
- Gunakan realtime sebagai sinyal untuk refresh data, bukan mengirim file foto melalui channel realtime.

### 14.4 Konsistensi data

Jika upload file berhasil tetapi insert metadata gagal, file dapat menjadi orphan. Buat proses cleanup berkala untuk file tanpa record. Jika metadata dibuat lebih dulu, tandai status sementara dan pastikan kegagalan upload dapat dibersihkan. Pilih alur yang memiliki kompensasi/retry jelas.

---

## 15. Dashboard dan Event Management

### 15.1 Event lifecycle

```text
Draft -> Scheduled -> Active -> Completed -> Archived
```

Contoh perilaku:
- `Draft`: belum dapat diakses tamu.
- `Scheduled`: halaman dapat menampilkan informasi, tetapi upload belum dibuka.
- `Active`: kamera dan upload aktif.
- `Completed`: upload ditutup atau hanya dibuka sesuai kebijakan.
- `Archived`: acara disimpan sebagai arsip dan akses publik dapat dihentikan.

Status tidak boleh menjadi satu-satunya kontrol. Periksa `starts_at`, `ends_at`, `allow_upload`, dan kebijakan event di server.

### 15.2 Event settings

Pemilik dapat mengatur:
- Nama dan deskripsi acara.
- Tanggal dan zona waktu.
- Logo.
- Warna/tema.
- Frame aktif.
- Filter aktif.
- Jumlah upload.
- Ukuran maksimum file.
- Galeri aktif/nonaktif.
- Moderasi.
- Download.
- Masa retensi foto.
- Status acara.

### 15.3 Photo moderation

Moderator dapat:
- Melihat foto pending.
- Approve.
- Reject dengan alasan.
- Hide foto yang sudah dipublikasikan.
- Melihat riwayat tindakan.
- Menangani laporan foto.

Setiap tindakan moderasi harus memiliki actor, waktu, dan alasan bila relevan.

---

## 16. Keamanan, Privasi, dan Moderasi

Foto acara dapat memuat wajah dan informasi personal. Keamanan bukan fitur tambahan; ini bagian dari rancangan inti.

### 16.1 Database security

- Aktifkan RLS pada seluruh tabel yang dapat diakses client.
- Guest hanya dapat membaca konfigurasi acara yang memang publik.
- Guest tidak boleh membaca data organisasi atau dashboard.
- Guest tidak boleh mengubah status foto.
- Pemilik hanya dapat mengakses organization yang diikuti.
- Moderator hanya dapat memoderasi acara yang ditugaskan.
- Uji kebijakan RLS dengan user dan event berbeda.
- Hindari policy terlalu luas seperti `using (true)` untuk data privat.

### 16.2 Upload security

- Validasi MIME type dan magic bytes di server.
- Batasi ukuran file dan dimensi.
- Batasi frekuensi upload.
- Gunakan nama file acak/UUID.
- Jangan menerima path storage dari client sebagai otoritas.
- Cegah upload ke event yang tidak aktif.
- Cegah file executable atau format yang tidak diperlukan.
- Pertimbangkan pemeriksaan malware dan moderasi otomatis jika skala/risiko menuntut.
- Jangan menyimpan file upload sebagai HTML yang dapat dieksekusi dari domain aplikasi.

### 16.3 Abuse prevention

- Rate limit berdasarkan kombinasi event, session, IP, dan sinyal lain.
- Gunakan guest session token yang ditandatangani atau dikelola server.
- Batasi jumlah upload per rentang waktu.
- Terapkan CAPTCHA hanya ketika terdeteksi aktivitas mencurigakan agar UX tetap ringan.
- Sediakan tombol report.
- Sediakan kemampuan pemilik untuk menutup upload segera.

IP address adalah data personal di banyak konteks hukum. Jika digunakan untuk rate limiting, minimalkan penyimpanan, batasi retensi, dan dokumentasikan tujuan penggunaannya.

### 16.4 Privasi dan kebijakan

Sebelum launch, siapkan:
- Privacy Policy.
- Terms of Service.
- Kebijakan penggunaan foto.
- Kebijakan penghapusan foto.
- Masa retensi.
- Kontak pengaduan.
- Prosedur permintaan penghapusan.
- Penjelasan apakah foto dapat diunduh oleh pengunjung lain.
- Penjelasan tentang moderasi dan publikasi.

Untuk pasar Indonesia, lakukan peninjauan kepatuhan terhadap ketentuan perlindungan data pribadi yang berlaku, termasuk UU Pelindungan Data Pribadi, dan konsultasikan aspek hukum yang relevan sebelum komersialisasi. Dokumen ini bukan nasihat hukum.

### 16.5 Kebijakan retensi

Pemilik perlu memilih masa penyimpanan sesuai paket. Contoh pilihan produk:
- Selama acara berlangsung + 30 hari.
- 90 hari.
- 1 tahun.
- Penyimpanan lebih lama pada paket tertentu.

Jadwalkan penghapusan file dan metadata secara konsisten. Berikan pemberitahuan sebelum penghapusan jika sesuai kebijakan layanan.

### 16.6 Secret management

- Secret hanya berada di environment server.
- Pisahkan development, preview, dan production.
- Rotasi key jika terpapar.
- Jangan mencetak token atau signed URL ke log.
- Terapkan least privilege untuk akses operasional.

---

## 17. PWA dan Kompatibilitas Perangkat

### 17.1 Tujuan PWA

PWA memberikan pengalaman yang dapat dipasang seperti aplikasi, tetapi Snapjoy tetap harus bekerja baik tanpa instalasi. Guest journey utama tidak boleh bergantung pada PWA.

### 17.2 Komponen PWA

- Web App Manifest.
- Icon berbagai ukuran.
- Theme color.
- Service worker.
- Offline fallback.
- Caching aset statis yang aman.
- Update strategy.

Jangan cache halaman privat, foto privat, signed URL, atau respons yang berisi data sensitif secara sembarangan.

### 17.3 Offline behavior

Pengambilan foto dan upload membutuhkan kamera serta jaringan yang sesuai. Untuk versi awal:
- Tampilkan pesan ketika offline.
- Pertahankan preview sementara selama halaman masih hidup.
- Berikan retry setelah jaringan kembali.
- Jangan menjanjikan upload background yang andal di semua browser.

Background Sync dan perilaku service worker berbeda antar browser; jadikan peningkatan lanjutan, bukan ketergantungan MVP.

### 17.4 Matriks perangkat uji

Minimal uji:
- Android Chrome pada beberapa ukuran layar.
- Android browser bawaan populer jika relevan.
- iPhone Safari.
- PWA terpasang di Android.
- PWA terpasang di iOS.
- Kamera depan dan belakang.
- Orientasi portrait dan landscape.
- Jaringan lambat dan koneksi terputus.

---

## 18. Deployment dan Infrastruktur

### 18.1 Environment

Siapkan tiga lingkungan:

| Environment | Tujuan |
|---|---|
| Local | Pengembangan |
| Preview/Staging | QA dan validasi sebelum rilis |
| Production | Pengguna sebenarnya |

Setiap environment memiliki project/database/storage sendiri. Jangan gunakan database production untuk eksperimen.

### 18.2 Environment variables

Contoh nama variabel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

Catatan:
- Gunakan publishable/anon key yang sesuai konfigurasi Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` hanya di server.
- Jangan commit `.env`.
- Pastikan variabel `NEXT_PUBLIC_` tidak berisi secret.

### 18.3 Pipeline deployment

1. Developer membuat branch.
2. Perubahan diuji lokal.
3. Pull request dibuat.
4. CI menjalankan lint, typecheck, dan test.
5. Preview deployment dibuat.
6. QA melakukan smoke test.
7. Migration database direview dan diterapkan sesuai prosedur.
8. Merge ke branch production.
9. Production deployment.
10. Verifikasi health, error, upload, dan gallery.

### 18.4 Database migration

- Semua perubahan schema melalui migration yang tersimpan di repository.
- Jangan mengandalkan perubahan manual dashboard sebagai satu-satunya catatan.
- Uji migration pada staging.
- Siapkan prosedur backup/restore.
- Perubahan yang merusak data harus memiliki rencana migrasi.

### 18.5 Monitoring

Pantau:
- Error frontend dan server.
- Waktu respons API.
- Kegagalan upload.
- Realtime disconnect.
- Storage usage.
- Bandwidth/egress.
- Jumlah foto per acara.
- Biaya per event.
- Latensi gallery.

---

## 19. Pengujian dan Quality Assurance

### 19.1 Unit test

Uji:
- Transformasi filter.
- Perhitungan crop dan aspect ratio.
- Komposisi frame.
- Validasi konfigurasi acara.
- Perhitungan kuota.
- Helper status foto.
- Permission/role helper.

### 19.2 Integration test

Uji:
- Membuat event.
- Membaca event publik.
- Upload file dan metadata.
- Signed URL.
- RLS.
- Moderation workflow.
- Realtime notification.
- Download foto.

### 19.3 End-to-end test

Skenario utama:
1. Tamu membuka QR URL.
2. Tamu memberi izin kamera.
3. Tamu mengganti kamera.
4. Tamu memilih filter.
5. Tamu mengambil foto.
6. Frame diterapkan.
7. Tamu retake.
8. Tamu mengunggah.
9. Foto muncul sesuai mode moderasi.
10. Tamu lain melihat foto.
11. Tamu mengunduh foto.
12. Pemilik menyembunyikan foto.

### 19.4 Security test

- Guest mencoba membaca foto pending.
- Guest mencoba mengubah status foto.
- User organization A mencoba membaca event organization B.
- Moderator mencoba mengakses event yang tidak ditugaskan.
- Upload file dengan MIME palsu.
- Upload file terlalu besar.
- Mengulang request upload secara cepat.
- Mengakses signed URL setelah kedaluwarsa.
- Mencoba mengakses event yang telah ditutup.

### 19.5 Acceptance criteria kamera

Fitur kamera dianggap siap jika:
- Kamera dapat diakses melalui HTTPS di perangkat target.
- Permission denied memiliki instruksi yang dapat dipahami.
- Kamera depan dan belakang dapat dipilih pada perangkat yang mendukung.
- Stream dihentikan ketika kamera ditutup.
- Filter terlihat di preview dan hasil akhir.
- Frame menempel pada file hasil.
- Hasil foto memiliki orientasi dan rasio yang benar.
- Retake tidak menyebabkan stream atau object URL bocor.
- Error kamera tidak membuat halaman macet.

---

## 20. Roadmap Pengembangan

Urutan berikut mempertahankan prioritas camera prototype, tetapi menambahkan fondasi teknis minimum agar tidak perlu membongkar aplikasi ketika masuk ke multi-event.

### Tahap 0 — Product foundation

**Tujuan:** menetapkan struktur proyek dan standar teknis.

Pekerjaan:
- Buat repository Next.js + TypeScript.
- Setup Tailwind.
- Setup Supabase development.
- Setup lint, formatter, typecheck, dan testing.
- Buat design tokens.
- Buat routing dasar.
- Buat dokumentasi environment.

**Output:** aplikasi kosong yang dapat dijalankan dan dideploy ke preview.

### Tahap 1 — Camera prototype

<Badge>Prioritas pertama</Badge>

**Tujuan:** membuktikan pengalaman kamera dan pengolahan foto.

Pekerjaan:
- Halaman camera mobile-first.
- Permission handling.
- Live preview.
- Front/back camera.
- Shutter.
- Filter preset.
- Frame overlay.
- Canvas composition.
- Preview hasil.
- Retake.
- Export Blob.
- Uji Android dan iOS.

**Belum perlu:** login, subscription, multi-organization, billing, dan dashboard kompleks.

**Output:** satu halaman demo yang dapat mengambil foto, menerapkan filter/frame, dan menghasilkan file final secara lokal.

### Tahap 2 — Shared gallery

**Tujuan:** menghubungkan capture dengan penyimpanan dan galeri.

Pekerjaan:
- Tabel events dan photos minimum.
- Storage bucket.
- Upload endpoint/service.
- Validasi ukuran dan format.
- Status foto.
- Gallery grid.
- Thumbnail.
- Download.
- Realtime update.
- Moderasi minimum.
- Error handling dan retry.

**Output:** satu event demo dapat menerima foto dari beberapa ponsel dan menampilkan foto yang diizinkan.

### Tahap 3 — Event management

**Tujuan:** menjadikan sistem dapat digunakan untuk banyak acara.

Pekerjaan:
- Supabase Auth untuk owner.
- Organizations dan members.
- Create/edit event.
- Event slug.
- Event settings.
- Frame/filter configuration.
- QR generator.
- Event lifecycle.
- Photo moderation dashboard.
- RLS dan test isolasi data.

**Output:** pemilik dapat membuat dan mengelola beberapa acara sendiri.

### Tahap 4 — SaaS dashboard

**Tujuan:** menyiapkan produk komersial.

Pekerjaan:
- Plan dan subscription.
- Usage metering.
- Limit storage/upload.
- Billing provider.
- Invoice/payment status.
- Organization member management.
- Admin dashboard.
- Audit log.
- Customer support workflow.
- Analytics.

**Output:** pelanggan dapat menggunakan layanan berdasarkan paket yang dipilih.

### Tahap 5 — PWA dan launch hardening

**Tujuan:** meningkatkan pengalaman dan kesiapan operasional.

Pekerjaan:
- Manifest dan service worker.
- Install experience.
- Offline fallback.
- Optimasi gambar dan bandwidth.
- Security review.
- Load test.
- Backup/restore drill.
- Legal pages.
- Monitoring dan alert.
- Domain production.
- Dokumentasi operasional.

**Output:** Snapjoy siap dipakai pada acara nyata dengan prosedur support dan pemulihan.

---

## 21. Prioritas MVP dan Kriteria Selesai

### 21.1 MVP yang disarankan

MVP tidak harus langsung menjadi SaaS berbayar. MVP pertama sebaiknya membuktikan bahwa tamu dapat mengambil foto dengan pengalaman yang baik dan foto dapat dikumpulkan secara andal.

**MVP-1 — Camera demo**
- Satu tema.
- Satu atau beberapa filter preset.
- Satu atau beberapa frame statis.
- Capture, preview, retake.
- Export foto final.

**MVP-2 — Event gallery**
- Satu event demo.
- QR/URL event.
- Upload.
- Gallery.
- Download.
- Moderasi sederhana.

**MVP-3 — Multi-event**
- Login owner.
- Create event.
- Konfigurasi event.
- Isolasi foto dan data.
- QR unik per event.

### 21.2 Definition of Done untuk Camera Prototype

- [ ] Kamera dapat dimulai dari tindakan pengguna.
- [ ] Kamera depan/belakang berfungsi pada perangkat yang mendukung.
- [ ] Permission denial ditangani.
- [ ] Stream berhenti dengan benar.
- [ ] Filter live preview berfungsi.
- [ ] Hasil capture memiliki filter yang sama.
- [ ] Frame tergabung ke hasil akhir.
- [ ] Preview sesuai file yang akan diunggah.
- [ ] Retake berfungsi.
- [ ] File dapat diekspor menjadi Blob.
- [ ] Layout nyaman pada layar ponsel.
- [ ] Tes dilakukan pada Android dan iPhone fisik.

### 21.3 Definition of Done untuk Shared Gallery

- [ ] Upload hanya diterima untuk event yang aktif.
- [ ] Tipe dan ukuran file divalidasi.
- [ ] Foto memiliki status publikasi.
- [ ] Foto pending tidak muncul di gallery publik.
- [ ] Gallery hanya menampilkan foto published.
- [ ] Foto baru muncul tanpa refresh penuh.
- [ ] Thumbnail digunakan pada grid.
- [ ] Download mengikuti pengaturan event.
- [ ] Retry tersedia ketika upload gagal.
- [ ] Data event A tidak terlihat di event B.

---

## 22. Model Bisnis dan Monetisasi

### 22.1 Model

SaaS dengan paket per event, paket bulanan untuk WO/EO, atau kombinasi keduanya.

### 22.2 Dimensi paket

Jangan hanya membatasi jumlah event. Biaya utama juga dipengaruhi oleh storage, bandwidth, dan penggunaan.

| Dimensi | Contoh batas |
|---|---|
| Active events | Jumlah acara aktif |
| Photo uploads | Jumlah foto |
| Storage | Total GB |
| Retention | Lama penyimpanan |
| Frames | Jumlah template |
| Branding | Snapjoy branding atau white-label |
| Moderators | Jumlah anggota moderator |
| Gallery access | Durasi akses |
| Analytics | Statistik dasar/lanjutan |
| Support | Tingkat dukungan |

### 22.3 Contoh struktur paket

Nama dan harga berikut hanya konsep, bukan rekomendasi harga final.

**Personal Event**
- Untuk satu acara keluarga atau pernikahan.
- Kuota foto dan storage terbatas.
- Template dasar.
- Masa akses tertentu.

**Professional**
- Untuk WO/EO dengan beberapa acara.
- Multi-event.
- Custom frame.
- Moderasi.
- Kuota lebih besar.

**Business**
- Untuk perusahaan atau penyelenggara skala besar.
- Multi-user.
- Branding lanjutan.
- Retensi lebih panjang.
- Laporan penggunaan.
- Dukungan prioritas.

### 22.4 Penentuan harga

Hitung terlebih dahulu:
- Biaya hosting.
- Database.
- Storage.
- Bandwidth/egress.
- Image processing.
- Payment gateway.
- Support.
- Pajak dan biaya operasional.
- Margin.

Rumus dasar:

```text
Harga minimum paket =
biaya variabel rata-rata
+ alokasi biaya tetap
+ biaya operasional/support
+ margin target
```

Lakukan pilot pada beberapa acara dengan volume berbeda sebelum menetapkan kuota dan harga final.

---

## 23. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kamera tidak kompatibel | Tamu tidak dapat mengambil foto | Uji perangkat nyata, fallback, instruksi |
| Izin kamera ditolak | Capture gagal | Jelaskan cara mengaktifkan izin |
| Upload lambat | Pengalaman buruk | Kompresi, retry, progress, batas ukuran |
| Storage membengkak | Biaya tinggi | Kuota, retensi, thumbnail, monitoring |
| Bandwidth tinggi | Biaya delivery tinggi | CDN, optimasi, signed URL, pagination |
| Foto tidak pantas | Reputasi dan privasi | Moderasi, report, takedown |
| Data antar-event bocor | Insiden serius | RLS, authorization test, private storage |
| QR dibagikan ulang | Akses tidak diinginkan | Unlisted/private, token revoke, PIN |
| Realtime tidak stabil | Gallery tidak update | Reconnect dan refetch fallback |
| File orphan | Storage terbuang | Cleanup job dan audit |
| Pemilik salah konfigurasi | Upload/galeri tidak sesuai | Default aman dan preview konfigurasi |
| Lonjakan trafik acara | Layanan lambat | Load test, limit, observability |

---

## 24. Metrik Produk

### 24.1 Funnel guest

- QR visits.
- Camera start rate.
- Camera permission success rate.
- Capture completion rate.
- Preview-to-upload conversion.
- Upload success rate.
- Average upload duration.
- Gallery view rate.
- Download rate.

### 24.2 Metrik owner

- Organization created.
- Event created.
- Event activated.
- QR downloaded.
- Photos moderated.
- Event completed.
- Repeat event creation.

### 24.3 Metrik operasional

- Storage per event.
- Bandwidth per event.
- Cost per uploaded photo.
- Upload failure rate.
- Realtime reconnect rate.
- API latency.
- Error rate.
- Moderation response time.

### 24.4 Metrik bisnis

- Trial-to-paid conversion.
- Revenue per organization.
- Repeat purchase rate.
- Churn.
- Gross margin per event.
- Support tickets per event.

---

## 25. Struktur Repository yang Disarankan

Contoh struktur untuk Next.js App Router:

```text
snapjoy/
├── public/
│   ├── icons/
│   ├── images/
│   └── manifest.webmanifest
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   └── e/
│   │   │       └── [eventSlug]/
│   │   │           ├── page.tsx
│   │   │           ├── camera/
│   │   │           │   └── page.tsx
│   │   │           └── gallery/
│   │   │               └── page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── page.tsx
│   │   │       ├── events/
│   │   │       └── settings/
│   │   ├── api/
│   │   │   ├── uploads/
│   │   │   └── events/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── camera/
│   │   ├── gallery/
│   │   ├── event/
│   │   ├── dashboard/
│   │   └── ui/
│   ├── features/
│   │   ├── camera/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── types.ts
│   │   ├── photos/
│   │   ├── events/
│   │   ├── organizations/
│   │   └── moderation/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── validation/
│   │   ├── security/
│   │   └── utils/
│   ├── styles/
│   └── types/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

Struktur ini adalah titik awal, bukan aturan mutlak. Hindari membuat terlalu banyak abstraksi sebelum kebutuhan nyata muncul.

---

## 26. Strategi Implementasi Teknis

### Sprint 0 — Setup

- [ ] Buat repository `snapjoy`.
- [ ] Inisialisasi Next.js dengan TypeScript.
- [ ] Setup Tailwind.
- [ ] Setup Supabase local/development.
- [ ] Setup lint dan typecheck.
- [ ] Buat layout mobile-first.
- [ ] Deploy preview pertama.

### Sprint 1 — Camera lifecycle

- [ ] Buat halaman camera.
- [ ] Implementasi `getUserMedia`.
- [ ] Implementasi permission state.
- [ ] Implementasi front/back camera.
- [ ] Implementasi stop stream dan cleanup.
- [ ] Uji pada perangkat fisik.

### Sprint 2 — Capture dan visual processing

- [ ] Capture video ke canvas.
- [ ] Implementasi aspect ratio.
- [ ] Implementasi filter preset.
- [ ] Implementasi frame overlay.
- [ ] Implementasi preview.
- [ ] Implementasi retake.
- [ ] Export Blob.
- [ ] Bandingkan hasil preview dengan file final.

### Sprint 3 — Upload dan gallery

- [ ] Buat schema events/photos minimum.
- [ ] Buat storage bucket private.
- [ ] Implementasi upload.
- [ ] Validasi server-side.
- [ ] Buat gallery grid.
- [ ] Buat thumbnail flow.
- [ ] Implementasi download.
- [ ] Implementasi realtime.
- [ ] Implementasi retry dan orphan cleanup.

### Sprint 4 — Owner dan event management

- [ ] Implementasi Auth.
- [ ] Buat organizations.
- [ ] Buat organization_members.
- [ ] Buat CRUD events.
- [ ] Buat event settings.
- [ ] Buat QR generator.
- [ ] Buat frame/filter configuration.
- [ ] Buat moderation dashboard.
- [ ] Implementasi RLS dan tes isolasi.

### Sprint 5 — SaaS foundation

- [ ] Buat plans dan subscriptions.
- [ ] Buat usage metering.
- [ ] Terapkan quota enforcement.
- [ ] Integrasikan payment provider.
- [ ] Buat billing history.
- [ ] Buat platform admin.
- [ ] Tambahkan audit log.

### Sprint 6 — Launch readiness

- [ ] PWA.
- [ ] Security review.
- [ ] Load test.
- [ ] Monitoring dan alert.
- [ ] Backup/restore test.
- [ ] Privacy policy dan terms.
- [ ] Uji acara pilot.
- [ ] Dokumentasi support.
- [ ] Production launch.

---

## 27. Keputusan Produk yang Harus Ditetapkan

Beberapa hal belum ditentukan dalam brief awal. Tetapkan sebelum implementasi fitur terkait.

| Keputusan | Opsi awal | Rekomendasi untuk MVP |
|---|---|---|
| Moderasi default | Auto / manual | Manual approval untuk pilot publik |
| Gallery visibility | Public / unlisted / private | Unlisted dengan pengaturan eksplisit |
| Storage | Public / private | Private |
| Foto asli | Simpan / tidak | Simpan hanya jika ada kebutuhan |
| Batas upload | Per sesi / per event | Keduanya |
| Identitas guest | Anonymous / login | Anonymous session |
| Frame editor | Bebas / template | Template PNG + konfigurasi teks |
| Filter | Bebas / preset | Preset tervalidasi |
| Download | Publik / owner only | Sesuai setting acara |
| Retensi | Tidak terbatas / terbatas | Paket dengan masa retensi |
| PWA | Sejak MVP / setelah stabil | Setelah capture dan gallery stabil |
| Billing | Per event / bulanan | Uji per event lebih dahulu |

### Rekomendasi keputusan awal

Untuk menjaga scope tetap realistis:
- Guest tetap anonymous.
- Owner wajib login.
- Satu event memiliki satu URL dan QR unik.
- Foto final sudah mengandung filter dan frame.
- Foto disimpan di private bucket.
- Galeri hanya menampilkan status `published`.
- Moderasi manual tersedia dan menjadi default awal.
- Frame dimulai dari template PNG.
- Filter dimulai dari preset.
- Paket dan pembayaran dibuat setelah pilot membuktikan biaya per acara.

---

## 28. Checklist Peluncuran

### Produk
- [ ] Nama dan branding Snapjoy final.
- [ ] User journey guest selesai.
- [ ] User journey owner selesai.
- [ ] Event lifecycle jelas.
- [ ] Kebijakan foto dan moderasi jelas.

### Kamera
- [ ] HTTPS.
- [ ] Android test.
- [ ] iOS test.
- [ ] Front/back camera.
- [ ] Permission denial.
- [ ] Filter dan frame.
- [ ] Retake.
- [ ] Orientasi foto.

### Gallery dan upload
- [ ] Upload validation.
- [ ] Quota.
- [ ] Retry.
- [ ] Thumbnail.
- [ ] Realtime.
- [ ] Download.
- [ ] Moderation.
- [ ] Orphan cleanup.

### Keamanan
- [ ] RLS seluruh tabel relevan.
- [ ] Private storage.
- [ ] Signed URL policy.
- [ ] Rate limit.
- [ ] Role authorization.
- [ ] Secret management.
- [ ] Security test antar-event.

### Operasional
- [ ] Monitoring.
- [ ] Alert.
- [ ] Backup.
- [ ] Restore drill.
- [ ] Usage tracking.
- [ ] Support contact.
- [ ] Incident procedure.

### Legal dan privasi
- [ ] Privacy Policy.
- [ ] Terms of Service.
- [ ] Retention policy.
- [ ] Takedown process.
- [ ] Data deletion process.
- [ ] Peninjauan kepatuhan hukum.

### Bisnis
- [ ] Pilot event.
- [ ] Estimasi biaya per event.
- [ ] Kuota paket.
- [ ] Harga paket.
- [ ] Payment flow.
- [ ] Customer onboarding.

---

## 29. Kesimpulan

Snapjoy sebaiknya dibangun sebagai platform **event photo capture and sharing**, bukan langsung sebagai SaaS besar dengan seluruh fitur billing dan dashboard sejak hari pertama.

Urutan yang paling aman dan efisien:

1. **Buktikan camera experience.** Kamera, filter, frame, capture, preview, dan retake harus terasa baik pada ponsel nyata.
2. **Buktikan alur foto end-to-end.** Upload, storage, gallery, download, dan realtime harus andal.
3. **Bangun multi-event.** Tambahkan organization, owner authentication, QR unik, pengaturan acara, dan isolasi data.
4. **Siapkan SaaS.** Tambahkan paket, kuota, pembayaran, analytics, dan administrasi.
5. **Hardening dan launch.** Selesaikan PWA, keamanan, performa, privasi, monitoring, serta prosedur operasional.

**Prioritas pengembangan pertama adalah Tahap 1 — Camera Prototype.** Jangan mulai dari subscription, payment gateway, atau dashboard yang kompleks sebelum kamera dan hasil foto final terbukti bekerja dengan baik.

Dengan pendekatan tersebut, Snapjoy dapat berkembang dari prototipe kamera menjadi produk multi-event yang dapat dijual kepada pasangan pengantin, WO, EO, perusahaan, dan penyelenggara acara lainnya.
