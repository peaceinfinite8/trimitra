# SOP Deploy Frontend ke cPanel (trimitramulti.co.id)

Dokumen ini dibuat supaya proses deploy berikutnya cepat, konsisten, dan minim salah langkah.

## Tujuan
- Update website frontend React ke hosting cPanel.
- Menjaga route SPA tetap normal saat refresh (tanpa 404).
- Memudahkan briefing ke Copilot untuk deploy berikutnya.

## Prasyarat
- Domain utama sudah mengarah ke hosting cPanel.
- Document Root domain: public_html.
- Project lokal tersedia di folder frontend.
- Node.js dan npm sudah terpasang.

## Alur Cepat (5-10 menit)
1. Build versi terbaru di lokal.
2. Buat ZIP dari isi folder dist.
3. Upload ZIP ke public_html via File Manager cPanel.
4. Extract ZIP ke public_html.
5. Verifikasi file inti (index.html, assets, .htaccess).
6. Tes halaman utama dan halaman detail.

## Step-by-step Detail

### 0) Sinkronkan ENV untuk data Client (WAJIB)
Data client di homepage harus mengambil dari post type `client` di WordPress admin, bukan dari fallback statis.

Set nilai berikut di environment frontend sebelum build:

```env
VITE_WP_SITE_URL=https://cms.trimitramulti.co.id
VITE_WP_CLIENTS_ENDPOINT=https://cms.trimitramulti.co.id/wp-json/trimitra/v1/clients
```

Catatan penting:
- Perubahan ini hanya untuk section Client/Partner.
- Endpoint Berita/Artikel tetap menggunakan alur WordPress yang sudah live.

### 1) Build di lokal
Jalankan dari root repository:

```powershell
npm --prefix frontend run build
```

Hasil build akan muncul di folder frontend/dist.

### 2) Buat ZIP deploy
Buat arsip ZIP dari isi folder dist (bukan folder project penuh).

```powershell
Push-Location .\frontend\dist
Compress-Archive -Path * -DestinationPath ..\trimitramulti-public_html.zip -Force
Pop-Location
```

Output ZIP:
- frontend/trimitramulti-public_html.zip

### 3) Upload ke cPanel
1. Masuk cPanel > File Manager.
2. Buka folder public_html.
3. Klik Upload.
4. Pilih file trimitramulti-public_html.zip.
5. Tunggu hingga 100% selesai.

### 4) Extract di public_html
1. Kembali ke File Manager.
2. Pilih trimitramulti-public_html.zip.
3. Klik Extract.
4. Path extract harus: /public_html
5. Klik Extract File(s).

### 5) Verifikasi hasil extract
Pastikan di dalam public_html (level langsung) ada:
- index.html
- folder assets
- file .htaccess

Jika file ternyata masuk ke subfolder dist:
- Masuk ke folder dist.
- Pindahkan semua isi dist ke public_html.

### 6) Bersihkan file ZIP
- Hapus trimitramulti-public_html.zip setelah extract berhasil.

### 7) Tes website
Tes minimal 3 URL berikut:
- https://trimitramulti.co.id
- https://trimitramulti.co.id/layanan/detail-billboard
- https://trimitramulti.co.id/kontak-kami

Jika masih tampil versi lama:
- Hard refresh browser: Ctrl+F5.
- Cek DNS masih ada yang mengarah ke Vercel atau tidak.

## Template .htaccess (React SPA)
Jika file .htaccess hilang/tertindih, isi dengan ini:

```apache
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
</IfModule>
```

## Cek DNS (setelah migrasi dari Vercel)
- A record @ harus ke IP hosting cPanel.
- CNAME www ke @ atau ke domain utama.
- Hapus record yang mengarah ke Vercel.

## Rollback Cepat (jika ada masalah)
1. Upload ZIP versi stabil sebelumnya.
2. Extract ulang ke public_html.
3. Hard refresh browser.
4. Cek ulang 3 URL utama.

## Prompt Siap Pakai untuk Minta Bantuan Copilot
Gunakan salah satu prompt ini agar proses lebih cepat.

### Prompt A - Deploy rutin
"Tolong deploy update frontend ke cPanel. Tolong lakukan build, buat ZIP deploy dari dist, lalu pandu saya sampai upload-extract di public_html dan verifikasi route SPA."

### Prompt B - Verifikasi pasca deploy
"Tolong bantu saya checklist verifikasi deploy cPanel: struktur file di public_html, .htaccess SPA, tes URL utama dan detail page, serta langkah perbaikan kalau masih cache lama."

### Prompt C - Hotfix cepat
"Ada bug di production cPanel. Tolong perbaiki di kode, build ulang, generate ZIP deploy baru, lalu kasih langkah upload-extract paling ringkas."

## Checklist Centang Deploy
- [ ] Build berhasil tanpa error.
- [ ] ZIP deploy terbaru sudah dibuat.
- [ ] ZIP ter-upload ke public_html.
- [ ] ZIP berhasil di-extract ke /public_html.
- [ ] index.html, assets, dan .htaccess ada di level public_html.
- [ ] File ZIP di public_html sudah dihapus.
- [ ] URL utama dan URL detail sudah lolos tes.
- [ ] Tidak ada DNS yang masih mengarah ke Vercel.

## Catatan
Simpan file ini di repository agar bisa dipakai berulang untuk semua update berikutnya.