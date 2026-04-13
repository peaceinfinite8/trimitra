# Content SOP - Tim Admin WordPress (Trimitra)

Dokumen ini menjadi standar isi konten agar frontend headless menampilkan data dengan konsisten.

## Prinsip Umum

1. Status page/post harus `Published`.
2. Slug harus sesuai mapping (jangan diubah tanpa update frontend).
3. Isi `Featured Image` untuk setiap page utama.
4. Isi `Excerpt` untuk ringkasan singkat (dipakai di beberapa area hero/summary).
5. Isi `Content` dengan blok Gutenberg standar (`Paragraph`, `Heading`, `Image`, `Gallery`, `List`, `Button`).

## Mapping Slug Wajib

1. Home: `home`
2. Tentang Kami: `tentang-kami`
3. Produk & Jasa: `produk-jasa`
4. Kontak Kami: `kontak-kami`
5. Galeri: `galeri`
6. Berita list/detail: gunakan `Posts`, bukan `Pages`

## SOP Per Halaman

### 1) Home (`home`)

Field wajib:
1. `Title`: judul utama home.
2. `Excerpt`: ringkasan hero (1-2 kalimat).
3. `Featured Image`: gambar hero.
4. `Content`: isi narasi/section yang ingin ditampilkan di badan halaman.

### 2) Tentang Kami (`tentang-kami`)

Field wajib:
1. `Title`
2. `Featured Image`
3. `Content` (isi profil perusahaan, visi, misi, sejarah)

### 3) Produk & Jasa (`produk-jasa`)

Field wajib:
1. `Title`
2. `Featured Image`
3. `Content` (daftar layanan, deskripsi, poin keunggulan)

### 4) Kontak Kami (`kontak-kami`)

Field wajib:
1. `Title`
2. `Content`

Format konten yang disarankan agar blok kontak kanan terbaca otomatis:
1. Alamat: tulis dalam paragraf yang mengandung kata alamat/lokasi/jalan.
2. Email: gunakan link `mailto:`.
3. Telepon: gunakan link `tel:`.
4. WhatsApp: gunakan link `https://wa.me/...` atau `https://api.whatsapp.com/...`.

Contoh singkat:

```html
<p>Jl. Tiritajaya, Kec. Sukmajaya, Kota Depok, Jawa Barat 16413</p>
<p><a href="mailto:dhr@trimitramulti.co.id">dhr@trimitramulti.co.id</a></p>
<p><a href="tel:+622129416195">+62 21-29416195</a></p>
<p><a href="https://wa.me/62811109842">WhatsApp Admin</a></p>
```

### 5) Galeri (`galeri`)

Field wajib:
1. `Title`
2. `Content`

Cara input gambar (boleh salah satu):
1. Tambahkan blok `Gallery` / `Image` di content.
2. Atau tambahkan link langsung ke file gambar (`.webp`, `.jpg`, `.png`) di content.

## SOP Berita (Posts)

Gunakan menu `Posts` untuk konten berita/artikel.

Field wajib:
1. `Title`
2. `Content`
3. `Featured Image`
4. `Category`
5. `Excerpt` (disarankan)

Catatan kategori:
1. Kategori yang mengandung `blog/article/artikel` akan dipetakan ke tab `Artikel`.
2. Kategori lain akan dipetakan ke tab `Berita`.

## Checklist Setelah Update Konten

1. Klik `Update` di WordPress.
2. Buka halaman frontend terkait.
3. Hard refresh browser (Ctrl + F5) jika perubahan belum muncul.
4. Cek tautan internal (mailto/tel/wa) berfungsi.

## ACF Template (Untuk Full Dynamic Copy)

Agar judul section, subjudul, dan label CTA bisa dikontrol penuh dari WP Admin:

1. Pasang plugin ACF (Advanced Custom Fields).
2. Buat Field Group untuk page yang dipakai frontend.
3. Gunakan key dari template berikut:

`acf/trimitra-page-ui-fields-template.json`

Key penting yang didukung frontend:
1. `page_kicker`
2. `cta_title`
3. `cta_copy`
4. `cta_primary_label`
5. `cta_primary_link`
6. `cta_secondary_label`
7. `cta_secondary_link`
8. `journal_kicker` (Home)
9. `journal_title` (Home)
10. `journal_button_label` (Home)
11. `portfolio_kicker` (Home)
12. `portfolio_title` (Home)
13. `contact_title` (Kontak)
14. `contact_title_highlight` (Kontak)
15. `contact_subtitle` (Kontak)
16. `contact_submit_label` (Kontak)
