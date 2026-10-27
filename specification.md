# Readmeo — Product & Technical Specification

**Document type:** Product Requirements + Technical Specification  
**Status:** Draft v1.0  
**Target:** MVP  
**Frontend:** Next.js + TypeScript  
**Backend:** Supabase Free Tier  
**Deployment target:** Vercel + Supabase

---

## 1. Project Overview

### 1.1 Product Vision

Readmeo adalah aplikasi web untuk mengubah file Markdown menjadi dokumen visual yang rapi, mudah dibaca melalui browser, dan dapat dibagikan menggunakan public URL.

Pengguna tidak perlu meminta teman atau audiens untuk menginstal editor Markdown. Mereka cukup membuka tautan yang dibagikan untuk membaca dokumen, melihat diagram, atau mengikuti presentasi.

### 1.2 Problem Statement

File Markdown biasanya memerlukan editor khusus untuk menampilkan formatnya dengan nyaman. Ketika file dikirim melalui chat atau email, penerima sering kali harus mengunduh file dan membukanya menggunakan aplikasi tambahan.

Hal ini kurang praktis untuk kebutuhan dokumentasi teknis, catatan meeting, laporan, proposal, materi pembelajaran, dan presentasi.

### 1.3 Proposed Solution

Readmeo menyediakan alur sederhana:

1. Pengguna membuka aplikasi.
2. Pengguna mengunggah file `.md` atau `.markdown`.
3. Aplikasi memproses dan merender konten menjadi dokumen HTML yang terformat.
4. Pengguna melihat preview sebelum menerbitkan dokumen.
5. Pengguna menerbitkan dokumen dan mendapatkan public URL.
6. Pengguna membagikan URL kepada orang lain.
7. Penerima membuka URL tanpa harus login.
8. Pengguna dapat mengaktifkan mode presentasi untuk menampilkan dokumen di layar penuh.

### 1.4 Product Principles

- **Zero-install viewing:** pembaca hanya membutuhkan browser.
- **Markdown-first:** file Markdown menjadi sumber konten utama.
- **Public by explicit action:** dokumen tidak menjadi publik sebelum pengguna menerbitkannya.
- **Fast and lightweight:** tidak memerlukan server khusus atau background worker pada MVP.
- **Secure by default:** konten Markdown dianggap sebagai input yang tidak tepercaya.
- **Free-tier compatible:** arsitektur dirancang untuk berjalan menggunakan layanan gratis selama pemakaian masih sesuai kuota penyedia.

---

## 2. Goals and Non-Goals

### 2.1 Goals

MVP harus mendukung:

- Upload file Markdown dari perangkat pengguna.
- Rendering Markdown menjadi tampilan dokumen yang nyaman dibaca.
- Dukungan heading, paragraph, emphasis, list, blockquote, code block, table, link, dan image.
- Syntax highlighting untuk kode.
- Preview sebelum publikasi.
- Pembuatan public URL unik untuk setiap dokumen yang diterbitkan.
- Pembacaan dokumen tanpa autentikasi.
- Mode presentasi layar penuh.
- Dashboard untuk melihat dan mengelola dokumen milik pengguna.
- Edit metadata, unpublish, dan delete dokumen.
- Responsive layout untuk desktop, tablet, dan mobile.

### 2.2 Non-Goals for MVP

Fitur berikut tidak termasuk ruang lingkup versi pertama:

- Full WYSIWYG editor seperti Typora.
- Real-time collaborative editing.
- Komentar dan anotasi oleh pembaca.
- Version history dan document diff.
- Tim, organisasi, dan permission management kompleks.
- Custom domain untuk setiap dokumen.
- Monetisasi atau sistem pembayaran.
- PDF export tingkat lanjut.
- Private document sharing dengan password atau expiry date.
- AI-generated summaries atau AI presentation generation.

**Catatan produk:** Readmeo pada MVP adalah Markdown publisher dan viewer, bukan pengganti penuh Typora. Pengguna mengedit file menggunakan editor pilihan mereka, kemudian mengunggah versi terbaru ketika diperlukan.

---

## 3. User Roles

### 3.1 Visitor

Pengguna yang belum login.

Permissions:
- Membuka public document.
- Membaca dan menavigasi dokumen.
- Menggunakan mode presentasi.
- Menyalin URL dokumen.

Restrictions:
- Tidak dapat mengunggah dokumen.
- Tidak dapat mengelola dokumen.
- Tidak dapat membaca draft atau dokumen yang belum diterbitkan.

### 3.2 Authenticated User

Pengguna yang sudah login.

Permissions:
- Mengunggah file Markdown.
- Melihat preview sebelum publikasi.
- Membuat, menerbitkan, dan memperbarui dokumen.
- Melihat dashboard dokumen sendiri.
- Mengubah judul, deskripsi, dan slug.
- Menyalin public URL.
- Membatalkan publikasi.
- Menghapus dokumen sendiri.

### 3.3 System

Tanggung jawab sistem:
- Memvalidasi file dan konten.
- Merender Markdown secara aman.
- Menyediakan URL publik yang stabil.
- Menegakkan kepemilikan dokumen melalui database policies.
- Menangani error dan batas penggunaan.

---

## 4. Functional Requirements

### FR-01 — Authentication

Aplikasi menggunakan Supabase Auth.

Minimum:
- Sign up menggunakan email dan password.
- Login dan logout.
- Session persistence.
- Proteksi dashboard dan fitur pengelolaan dokumen.
- Penanganan email verification sesuai konfigurasi Supabase.

Public document viewer tidak boleh mewajibkan login.

### FR-02 — Upload Markdown

Pengguna dapat memilih file melalui file picker atau drag-and-drop.

Supported extensions:
- `.md`
- `.markdown`

Initial validation rules:
- Maksimum ukuran file: 2 MB.
- Maksimum satu file per upload.
- File kosong ditolak.
- File yang tidak memiliki ekstensi yang didukung ditolak.
- Konten harus dapat dibaca sebagai UTF-8.
- Nama file digunakan sebagai saran judul awal.

File harus dibaca sebagai teks, bukan dirender langsung sebagai HTML.

### FR-03 — Document Preview

Setelah upload, aplikasi menampilkan preview sebelum publikasi.

Preview harus mendukung:
- Heading H1–H6.
- Paragraph dan line breaks.
- Bold, italic, strikethrough.
- Ordered dan unordered lists.
- Nested lists.
- Blockquote.
- Inline code dan fenced code block.
- Syntax highlighting.
- Diagram Mermaid pada fenced code block `mermaid`.
- Tables.
- Horizontal rules.
- Links.
- Images dengan alt text.
- Task lists.
- GitHub Flavored Markdown (GFM).

Jika terdapat elemen yang tidak didukung, aplikasi tetap menampilkan konten yang aman dan tidak crash.

### FR-04 — Document Publishing

Pengguna dapat menerbitkan dokumen setelah preview.

Saat publikasi:
- Sistem membuat slug unik.
- Sistem menyimpan judul, konten Markdown, metadata, dan pemilik.
- Status dokumen berubah menjadi `published`.
- Aplikasi menghasilkan URL berbentuk `/p/{slug}`.
- Aplikasi menyediakan tombol untuk menyalin URL.
- Pengguna memperoleh feedback ketika publikasi berhasil atau gagal.

Dokumen berstatus draft tidak boleh diakses oleh pengguna anonim.

### FR-05 — Public Document Viewer

Public viewer harus:
- Dapat dibuka tanpa login.
- Menampilkan judul, konten, dan metadata yang relevan.
- Menggunakan layout membaca yang fokus pada konten.
- Memiliki lebar konten yang nyaman untuk membaca dokumen panjang.
- Mendukung anchor link untuk heading.
- Mendukung navigasi internal dan eksternal.
- Menampilkan error page yang sesuai ketika dokumen tidak ditemukan atau tidak dipublikasikan.
- Menyediakan tombol Share, Copy Link, dan Present.

Public URL tidak boleh mengekspos user ID internal atau informasi pribadi pemilik.

### FR-06 — Presentation Mode

Pengguna dapat mengaktifkan presentation mode dari public viewer.

Perilaku:
- Menggunakan layar penuh jika browser mengizinkan.
- Memiliki tombol navigasi Previous dan Next.
- Mendukung navigasi keyboard menggunakan Arrow Left, Arrow Right, dan Escape.
- Menampilkan progress indikator.
- Menyediakan tombol keluar dari mode presentasi.

Untuk MVP, sistem membagi dokumen menjadi beberapa bagian berdasarkan heading H1 dan H2. Jika heading tidak tersedia, konten dibagi menjadi section berdasarkan aturan fallback yang konsisten.

Konten asli tidak boleh diubah saat memasuki mode presentasi. Presentation mode hanya mengubah cara konten ditampilkan.

### FR-07 — Dashboard

Dashboard menampilkan dokumen milik pengguna.

Informasi minimum:
- Judul dokumen.
- Slug atau public URL.
- Status publikasi.
- Waktu terakhir diperbarui.
- Aksi View, Edit, Copy Link, Unpublish, dan Delete.

Dashboard juga menyediakan:
- Tombol Upload Markdown.
- Empty state untuk pengguna baru.
- Loading state.
- Error state.
- Konfirmasi sebelum menghapus dokumen.

### FR-08 — Update Document

Pengguna dapat memperbarui dokumen yang sudah ada dengan mengunggah ulang file atau mengganti kontennya melalui form yang tersedia.

Sistem mempertahankan document ID dan slug saat pembaruan biasa agar public URL tidak berubah.

`updated_at` diperbarui setiap kali konten atau metadata berubah.

### FR-09 — Unpublish and Delete

**Unpublish**
- Mengubah status menjadi `draft`.
- Membuat public viewer tidak lagi menampilkan dokumen tersebut.
- Mempertahankan konten dan metadata agar dapat diterbitkan kembali.

**Delete**
- Memerlukan konfirmasi pengguna.
- Hanya pemilik dokumen yang boleh menghapusnya.
- Menghapus record dari database.
- Membuat public URL tidak lagi dapat digunakan.

### FR-10 — Sharing and Metadata

Setiap dokumen publik harus memiliki:
- Canonical URL.
- Page title.
- Meta description jika tersedia.
- Open Graph title.
- Open Graph description.
- Open Graph image fallback.

Tujuannya agar link yang dibagikan melalui chat atau media sosial memiliki preview yang informatif.

Untuk MVP, gunakan metadata dinamis berdasarkan judul dan deskripsi dokumen. Pembuatan gambar preview khusus setiap dokumen dapat ditambahkan kemudian.

---

## 5. User Flows

### 5.1 First-time Publishing

1. Pengguna membuka landing page.
2. Pengguna memilih Sign Up.
3. Pengguna menyelesaikan registrasi dan login.
4. Pengguna memilih Upload Markdown.
5. Pengguna memilih file `.md`.
6. Sistem memvalidasi dan membaca file.
7. Pengguna melihat preview.
8. Pengguna mengisi atau mengonfirmasi judul dan deskripsi.
9. Pengguna memilih Publish.
10. Sistem menyimpan dokumen dan membuat slug.
11. Aplikasi menampilkan public URL.
12. Pengguna menyalin URL dan membagikannya.

### 5.2 Visitor Reading

1. Pembaca membuka `/p/{slug}`.
2. Sistem memeriksa apakah dokumen tersedia dan berstatus published.
3. Sistem merender konten Markdown.
4. Pembaca membaca, mengikuti anchor link, atau mengaktifkan presentation mode.

Tidak ada login wall pada alur ini.

### 5.3 Updating a Document

1. Pemilik login.
2. Pemilik membuka dashboard.
3. Pemilik memilih dokumen.
4. Pemilik mengunggah versi Markdown terbaru.
5. Sistem menampilkan preview perubahan.
6. Pemilik menyimpan perubahan.
7. Public URL tetap sama dan menampilkan versi terbaru.

### 5.4 Unpublishing a Document

1. Pemilik membuka dashboard.
2. Pemilik memilih Unpublish.
3. Sistem meminta konfirmasi.
4. Status berubah menjadi draft.
5. URL publik tidak lagi menampilkan konten dokumen.

---

## 6. UX and UI Requirements

### 6.1 Main Pages

**Landing page — `/`**

Tujuan: menjelaskan produk dan mengarahkan pengguna untuk mengunggah dokumen.

Komponen:
- Hero section.
- CTA Upload Markdown.
- Penjelasan singkat cara kerja.
- Preview contoh dokumen.
- Fitur utama.
- CTA sign up.

**Authentication — `/login`, `/signup`**

Form autentikasi sederhana dengan validasi dan error messages yang jelas.

**Dashboard — `/dashboard`**

Menampilkan daftar dokumen dan aksi pengelolaan.

**Upload — `/dashboard/new`**

Memuat:
- Dropzone.
- File picker.
- Informasi batas ukuran file.
- Validasi file.
- Tombol untuk melanjutkan ke preview.

**Preview — `/dashboard/new/preview` atau route ekuivalen**

Memuat:
- Judul dan deskripsi.
- Preview hasil rendering.
- Tombol Publish.
- Tombol kembali untuk mengganti file.

**Public viewer — `/p/[slug]`**

Memuat:
- Document header.
- Judul dan deskripsi.
- Konten Markdown.
- Copy Link.
- Share.
- Present.
- Footer minimal.

**Not Found / Unpublished**

Pesan yang jelas tanpa membocorkan informasi tentang draft atau pemilik dokumen.

### 6.2 Visual Direction

Gunakan desain minimalis, profesional, dan berorientasi pada konten.

Prinsip:
- Typography menjadi elemen visual utama.
- Background netral dan kontras teks yang memadai.
- Lebar konten dibatasi agar nyaman dibaca.
- Spacing konsisten.
- Code block memiliki background berbeda dan horizontal scrolling.
- Tabel dapat di-scroll pada layar kecil.
- Navigasi tidak mengganggu konten.
- Responsive-first.
- Keyboard accessibility dan visible focus states.

Jangan membuat public viewer terlihat seperti dashboard admin. Pengalaman membaca harus terasa seperti membuka artikel atau dokumentasi profesional.

### 6.3 Responsive Behavior

Desktop:
- Konten terpusat.
- Presentation mode mendukung layar penuh.
- Sidebar daftar isi dapat ditambahkan bila bermanfaat.

Tablet:
- Layout disederhanakan.
- Navigasi dan toolbar tetap mudah digunakan.

Mobile:
- Satu kolom.
- Code block dan tabel dapat di-scroll horizontal.
- Tombol utama mudah dijangkau.
- Presentation mode menggunakan area layar yang tersedia tanpa mengandalkan hover.

---

## 7. Technical Stack

### 7.1 Frontend

- Next.js menggunakan versi stabil terbaru yang kompatibel.
- TypeScript dengan strict mode.
- App Router.
- React Server Components sebagai default.
- Tailwind CSS.
- shadcn/ui untuk komponen UI dasar.
- pnpm sebagai package manager.
- ESLint dan Prettier.

### 7.2 Markdown Rendering

Gunakan ekosistem unified/remark/rehype.

Komponen utama:
- `remark-parse` untuk parsing Markdown.
- `remark-gfm` untuk GitHub Flavored Markdown.
- `remark-rehype` untuk transformasi Markdown AST menjadi HTML AST.
- `rehype-sanitize` untuk sanitasi HTML.
- `rehype-highlight` atau solusi syntax highlighting yang kompatibel.
- Transform Mermaid sendiri (`rehype-mermaid`) untuk mengubah fenced code block `mermaid` menjadi elemen diagram.

Implementasi final harus memverifikasi kompatibilitas versi dan urutan plugin.

**Security requirement:** raw HTML dalam Markdown harus dinonaktifkan atau diproses melalui sanitasi yang ketat. Jangan memasukkan HTML mentah dari dokumen menggunakan `dangerouslySetInnerHTML` tanpa pipeline sanitasi yang teruji.

**Exception Mermaid:** diagram digambar di browser oleh library Mermaid, sehingga SVG hasil render perlu disisipkan ke DOM. Exception ini aman karena sumber diagram disimpan sebagai plain text (tidak pernah HTML), directive `%%{ ... }%%` dibuang sebelum render, dan Mermaid dijalankan dengan `securityLevel: "strict"` yang mem-sanitasi SVG dengan DOMPurify serta menonaktifkan script, click handler, dan HTML label.

### 7.3 Backend and Database

Gunakan Supabase:
- Supabase Auth.
- Supabase PostgreSQL.
- Row Level Security (RLS).
- Supabase JavaScript client.

Supabase Storage tidak wajib untuk MVP karena konten Markdown dapat disimpan sebagai teks di PostgreSQL. Ini mengurangi kompleksitas bucket, upload storage, dan kebijakan akses.

### 7.4 Deployment

- Next.js: Vercel Free/Hobby, sesuai ketentuan penggunaan yang berlaku.
- Database dan Auth: Supabase Free.
- Source control: GitHub.
- CI: GitHub Actions atau pipeline bawaan platform deployment.

Konfigurasi environment variables wajib dipisahkan antara development dan production.

---

## 8. System Architecture

### 8.1 Architecture Overview

Gunakan modular monolith dalam satu repository Next.js.

```text
Browser
  |
  |-- Upload .md
  |     |
  |     v
  |   Client-side file validation
  |     |
  |     v
  |   Markdown preview renderer
  |     |
  |     v
  |   Publish request
  |
  v
Next.js Application
  |
  |-- Authentication
  |-- Document service
  |-- Slug generation
  |-- Server-side validation
  |-- Metadata generation
  |
  v
Supabase
  |-- Auth
  |-- PostgreSQL
  |-- RLS policies
  |
  v
Public Viewer: /p/{slug}
```

### 8.2 Upload Processing

1. File dibaca menggunakan browser File API.
2. Ukuran dan ekstensi divalidasi.
3. Konten UTF-8 dibaca sebagai string.
4. Konten dipreview menggunakan renderer Markdown yang sama dengan public viewer.
5. Pengguna mengonfirmasi publikasi.
6. Server memvalidasi input kembali.
7. Server menyimpan record melalui Supabase.
8. Server mengembalikan public URL.

Validasi di browser bertujuan memperbaiki UX. Validasi di server tetap wajib karena validasi client dapat dilewati.

### 8.3 Rendering Strategy

Untuk MVP, rendering dilakukan ketika halaman publik diminta, menggunakan Markdown yang tersimpan di database.

Keuntungan:
- Tidak perlu menyimpan duplikat HTML hasil rendering.
- Markdown tetap menjadi source of truth.
- Perubahan konten langsung tercermin setelah pembaruan.
- Pipeline rendering dapat diperbaiki tanpa migrasi konten.

Rendering harus memiliki batas ukuran input dan timeout yang wajar untuk menghindari dokumen yang terlalu berat.

### 8.4 Access Strategy

- Dashboard menggunakan authenticated server-side access.
- Pemilik hanya dapat mengelola dokumennya sendiri.
- Public viewer hanya dapat membaca dokumen berstatus published.
- Semua operasi mutasi diverifikasi di server.
- Jangan mengekspos Supabase service-role key ke browser.

Jika diperlukan, gunakan server-side Supabase client dan `auth.uid()` melalui RLS untuk mengidentifikasi pemilik record.

---

## 9. Database Design

### 9.1 Table: `documents`

| Column | Type | Rules |
|---|---|---|
| `id` | `uuid` | Primary key, default UUID |
| `owner_id` | `uuid` | FK ke `auth.users.id`, wajib |
| `title` | `text` | Wajib, panjang terbatas |
| `slug` | `text` | Wajib, unique |
| `description` | `text` | Opsional, panjang terbatas |
| `content` | `text` | Konten Markdown, wajib |
| `status` | `text` | `draft` atau `published` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()`, diperbarui saat update |
| `published_at` | `timestamptz` | Nullable |

### 9.2 Database Constraints

- Primary key pada `id`.
- Foreign key `owner_id` menuju `auth.users(id)`.
- Unique constraint pada `slug`.
- Check constraint untuk status `draft` atau `published`.
- Validasi panjang judul dan deskripsi.
- Validasi panjang konten pada layer server.
- Index untuk `owner_id`, `slug`, dan kolom status jika diperlukan query yang relevan.

Slug harus unik dan aman untuk URL. Gunakan random suffix atau mekanisme lain untuk menghindari collision. Jangan bergantung pada judul saja.

### 9.3 RLS Policies

RLS wajib aktif.

**SELECT**
- Pemilik dapat membaca seluruh dokumennya sendiri, termasuk draft.
- Pengguna anonim hanya dapat membaca dokumen dengan status `published`.
- Pengguna terautentikasi tidak memperoleh akses ke draft pengguna lain.

**INSERT**
- Hanya pengguna terautentikasi.
- `owner_id` harus sama dengan `auth.uid()`.

**UPDATE**
- Hanya pemilik dokumen.
- Perubahan `owner_id` tidak diperbolehkan.
- Status dan konten divalidasi server-side.

**DELETE**
- Hanya pemilik dokumen.

Implementasi harus menguji semua operasi menggunakan sesi anonim dan dua akun berbeda. Jangan hanya mengandalkan proteksi halaman Next.js.

### 9.4 Storage Decision

Untuk MVP, jangan menyimpan file asli di Supabase Storage kecuali ada kebutuhan download file yang eksplisit.

Simpan teks Markdown langsung di kolom `content`. Ukuran file dibatasi pada aplikasi, misalnya 2 MB, dan harus diuji terhadap batas payload, kapasitas database, serta performa rendering.

---

## 10. Application Structure

```text
src/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── new/
│   ├── p/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── api/
│   │   └── documents/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── markdown/
│   │   ├── markdown-renderer.tsx
│   │   ├── markdown-preview.tsx
│   │   └── code-block.tsx
│   ├── documents/
│   │   ├── upload-dropzone.tsx
│   │   ├── document-card.tsx
│   │   └── document-actions.tsx
│   └── presentation/
├── lib/
│   ├── supabase/
│   ├── markdown/
│   ├── validation/
│   ├── slug/
│   └── utils/
├── types/
└── config/
```

Struktur dapat berkembang, tetapi domain logic, rendering, validasi, dan UI harus tetap dipisahkan.

---

## 11. API and Server Actions

Gunakan Server Actions atau Route Handlers sesuai kebutuhan. Jangan membuat REST API terpisah jika tidak dibutuhkan.

Operasi minimum:

| Operation | Method / mechanism | Access |
|---|---|---|
| Create document | Server Action / POST | Authenticated |
| Get own documents | Server query / GET | Owner |
| Get public document | Server query / GET | Anonymous, published only |
| Update document | Server Action / PATCH | Owner |
| Publish document | Server Action / POST | Owner |
| Unpublish document | Server Action / POST | Owner |
| Delete document | Server Action / DELETE | Owner |

Semua mutasi wajib memvalidasi session, ownership, input, ukuran konten, dan status yang diperbolehkan.

Contoh logical contract:

**Create document**
- Input: `title`, `description`, `content`.
- Output: `id`, `slug`, `publicUrl`.
- Errors: unauthorized, validation error, slug conflict, database error.

**Update document**
- Input: `documentId`, field yang akan diubah.
- Output: updated document metadata.
- Errors: unauthorized, forbidden, not found, validation error.

**Get public document**
- Input: `slug`.
- Output: metadata publik dan konten Markdown jika status published.
- Errors: not found.

Hindari mengembalikan `owner_id`, data akun, atau field internal yang tidak diperlukan oleh public viewer.

---

## 12. Security Requirements

### SEC-01 — Markdown XSS

- Perlakukan semua konten Markdown sebagai untrusted input.
- Sanitasi output HTML.
- Blokir event handler HTML seperti `onerror` dan `onclick`.
- Jangan izinkan `javascript:` URL.
- Terapkan allowlist untuk protokol link yang diizinkan.
- Uji payload XSS sebelum rilis.

### SEC-02 — Authorization

- RLS aktif untuk tabel yang berisi dokumen.
- Public viewer hanya membaca dokumen published.
- Semua operasi perubahan memerlukan autentikasi dan ownership validation.
- Service-role key hanya boleh berada di environment server yang tepercaya.

### SEC-03 — Input Validation

- Validasi ekstensi dan ukuran file.
- Validasi tipe data dan panjang semua field.
- Tolak konten kosong atau melebihi batas.
- Jangan mempercayai MIME type yang diberikan browser.
- Escape atau sanitasi data sesuai konteks rendering.

### SEC-04 — Abuse Prevention

- Terapkan rate limiting pada operasi publikasi jika diperlukan.
- Batasi jumlah dokumen yang dapat dibuat per pengguna.
- Batasi ukuran konten.
- Gunakan proteksi autentikasi Supabase.
- Hindari query yang dapat mengembalikan seluruh dokumen ke pengguna anonim.

### SEC-05 — External Images and Links

Markdown dapat memuat gambar atau tautan dari situs eksternal.

- Jangan fetch URL eksternal di server secara otomatis.
- Hindari server-side URL fetching yang membuka risiko SSRF.
- Berikan alt text untuk gambar jika tersedia.
- External link dapat dibuka di tab baru dengan atribut keamanan yang sesuai.
- Jelaskan bahwa gambar eksternal dapat gagal dimuat atau berubah sewaktu-waktu.

---

## 13. Performance and SEO

### Performance

- Gunakan Server Components untuk halaman yang tidak memerlukan interaksi client.
- Gunakan Client Components hanya untuk upload, interaksi presentasi, dan kontrol UI.
- Hindari mengirim JavaScript besar yang tidak diperlukan pada public viewer.
- Batasi ukuran dokumen.
- Gunakan pagination pada dashboard jika jumlah dokumen meningkat.
- Hindari query berulang yang tidak diperlukan.
- Gunakan caching hanya jika kebijakan publikasi dan invalidasinya aman.

Dokumen yang diperbarui atau di-unpublish harus tercermin pada public URL tanpa menyisakan versi cache yang tidak sesuai.

### SEO and Sharing

- Gunakan metadata dinamis.
- Tetapkan canonical URL.
- Gunakan title dan description yang relevan.
- Sediakan Open Graph metadata.
- Pastikan public document dapat dirender oleh crawler yang menjalankan JavaScript secara terbatas.
- Jangan mengindeks draft atau halaman dashboard.

---

## 14. Error Handling and Observability

Aplikasi harus menangani:
- File terlalu besar.
- File tidak valid.
- Konten tidak bisa dibaca.
- Markdown yang tidak valid.
- Session kedaluwarsa.
- Slug collision.
- Gagal menyimpan dokumen.
- Dokumen tidak ditemukan.
- Dokumen tidak dipublikasikan.
- Kegagalan jaringan.
- Batas kuota Supabase tercapai.

UI menampilkan pesan yang mudah dipahami, bukan raw stack trace.

Logging server tidak boleh mencatat password, access token, session cookie, atau konten dokumen secara penuh tanpa kebutuhan yang sah.

---

## 15. Testing Strategy

### Unit Tests

- File validation.
- Slug generation.
- Markdown rendering.
- Sanitization.
- Metadata generation.
- Status transition.
- Input validation.

### Integration Tests

- Membuat dokumen dengan akun terautentikasi.
- Mengambil dokumen publik sebagai anonymous user.
- Menolak akses anonim ke draft.
- Menolak pengguna A mengubah dokumen pengguna B.
- Mempertahankan slug saat konten diperbarui.
- Memastikan unpublish menghilangkan akses publik.
- Memastikan delete membuat URL tidak tersedia.

### End-to-End Tests

Gunakan Playwright untuk menguji:
1. Sign up dan login.
2. Upload file.
3. Preview Markdown.
4. Publish dokumen.
5. Copy public link.
6. Membuka link di browser tanpa login.
7. Presentation mode dan keyboard navigation.
8. Update dokumen.
9. Unpublish dan delete.

### Security Tests

Gunakan sample Markdown yang berisi:
- Script tags.
- Event handler attributes.
- `javascript:` links.
- HTML yang tidak diizinkan.
- Image URL eksternal.
- Dokumen sangat panjang.
- Heading dan nested lists yang kompleks.

---

## 16. Acceptance Criteria

MVP dianggap selesai ketika seluruh kondisi berikut terpenuhi.

- [ ] Pengguna dapat registrasi dan login.
- [ ] Pengguna dapat mengunggah file `.md` dan `.markdown`.
- [ ] File yang melebihi batas ditolak dengan pesan yang jelas.
- [ ] Preview mendukung elemen Markdown yang telah ditentukan.
- [ ] Konten Markdown dirender dengan aman.
- [ ] Pengguna dapat menerbitkan dokumen.
- [ ] Setiap dokumen publik memiliki slug unik.
- [ ] Public URL dapat dibuka tanpa login.
- [ ] Dokumen draft tidak dapat dibaca secara anonim.
- [ ] Pembaca dapat menggunakan presentation mode.
- [ ] Pengguna dapat memperbarui konten tanpa mengubah public URL.
- [ ] Pengguna dapat unpublish dan delete dokumen.
- [ ] Pengguna tidak dapat mengelola dokumen milik pengguna lain.
- [ ] RLS policies telah diuji.
- [ ] UI berfungsi pada desktop dan mobile.
- [ ] Error states ditangani.
- [ ] Deployment menggunakan environment variables yang benar.
- [ ] Tidak ada service-role key di bundle client.
- [ ] E2E test untuk alur publikasi dan pembacaan lulus.

---

## 17. Implementation Phases

### Phase 1 — Foundation

- Inisialisasi Next.js, TypeScript, Tailwind CSS, dan shadcn/ui.
- Konfigurasi Supabase.
- Buat schema dan RLS.
- Implementasi authentication.
- Siapkan layout dasar.

### Phase 2 — Markdown Core

- Upload file.
- Validasi konten.
- Markdown renderer.
- Syntax highlighting.
- Preview.
- Security tests untuk sanitasi.

### Phase 3 — Publishing and Public Viewer

- Document persistence.
- Slug generation.
- Publish dan unpublish.
- Public viewer.
- Metadata dan copy link.
- Testing akses anonymous.

### Phase 4 — Dashboard and Presentation

- Dashboard.
- Update dokumen.
- Delete dokumen.
- Presentation mode.
- Keyboard navigation.
- Responsive polish.

### Phase 5 — Hardening and Deployment

- RLS integration tests.
- Playwright E2E.
- Error handling.
- Performance checks.
- Environment configuration.
- Production deployment.
- Dokumentasi setup dan operasional.

---

## 18. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| XSS dari raw HTML Markdown | Sanitasi ketat dan security tests |
| Dokumen terlalu besar | Batas upload dan validasi server |
| Public URL membuka draft | RLS dan server-side authorization |
| Slug collision | Unique constraint dan retry |
| Penyalahgunaan layanan gratis | Quota monitoring dan rate limiting |
| Syntax highlighting memperbesar bundle | Lazy loading atau strategi rendering ringan |
| Cache menampilkan dokumen lama | Cache invalidation atau dynamic rendering |
| Presentasi tidak terbagi sesuai harapan | Aturan heading-based sections dan fallback |
| Kuota Supabase terlampaui | Batas ukuran, monitoring, dan dokumentasi kapasitas |

---

## 19. Future Enhancements

Setelah MVP stabil, fitur berikut dapat dipertimbangkan:
- Markdown editor langsung di browser.
- Table of contents otomatis.
- Download source Markdown.
- Export ke PDF.
- Custom theme dan dark mode.
- Password-protected documents.
- Expiring links.
- Version history.
- Public document analytics.
- Custom cover dan Open Graph image.
- Workspace atau team collaboration.

Fitur future enhancement tidak boleh menghambat penyelesaian MVP.

---

## 20. Definition of Done

Sebuah fitur dianggap selesai ketika:
1. Acceptance criteria fitur terpenuhi.
2. Validasi dan error handling tersedia.
3. Tidak ada pelanggaran authorization atau RLS.
4. UI responsive dan accessible.
5. Test yang relevan lulus.
6. Dokumentasi konfigurasi diperbarui.
7. Perubahan telah diuji di environment staging atau preview deployment.

**Final product outcome:** pengguna dapat mengunggah dokumen Markdown, melihat hasil rendering yang rapi, menerbitkannya menjadi tautan publik, membagikannya tanpa login kepada penerima, dan menggunakan dokumen tersebut sebagai media presentasi berbasis browser.
