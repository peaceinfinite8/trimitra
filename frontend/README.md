# Frontend PT Trimitra (React + Vite)

Frontend ini berjalan sebagai headless client yang mengambil data dari WordPress REST API.

## 1) Environment

Salin `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Isi URL WordPress live:

```env
VITE_WP_SITE_URL=https://trimitramulti.co.id
```

## 2) Development

```bash
npm install
npm run dev
```

## 3) Build Production

```bash
npm run build
```

Hasil build ada di folder `dist/`.

## 4) Deploy ke Rumahweb (Shared Hosting)

Ada 2 skenario umum.

### Skenario A (paling aman): Frontend di Subdomain

Contoh: `app.trimitramulti.co.id` untuk React, sedangkan WordPress tetap di `trimitramulti.co.id`.

Langkah:
1. Buat subdomain di cPanel Rumahweb (mis. `app`).
2. Build frontend: `npm run build`.
3. Upload isi folder `dist/` ke document root subdomain.
4. Pastikan file `.htaccess` ikut ter-upload (sudah disiapkan di `public/.htaccess`).
5. Set `VITE_WP_SITE_URL=https://trimitramulti.co.id` lalu rebuild jika perlu.

### Skenario B: Frontend di Root Domain

Gunakan ini hanya jika memang ingin root domain menampilkan React SPA.

Langkah:
1. Backup penuh `public_html` (file + database WP).
2. Build frontend: `npm run build`.
3. Upload isi `dist/` ke `public_html`.
4. Pastikan `.htaccess` SPA aktif.
5. Verifikasi URL langsung seperti `/berita` dan `/berita/slug` tidak 404.

## 5) Catatan Penting

1. Frontend ini butuh endpoint WordPress REST aktif (`/wp-json/`).
2. Jika domain frontend dan WordPress beda origin, pastikan CORS WordPress diizinkan.
3. Cache browser/server/CDN bisa menunda update. Setelah deploy, lakukan hard refresh.
4. Untuk rollback cepat, simpan zip build sebelumnya sebelum upload build baru.
