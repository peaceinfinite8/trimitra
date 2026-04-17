const PRIVACY_SECTIONS = [
  {
    title: '1. Ruang Lingkup',
    paragraphs: [
      'Kebijakan Privasi ini berlaku untuk seluruh pengunjung situs dan calon klien PT Trimitra Multi Kreasi ("Trimitra") saat mengakses website, mengisi formulir, atau melakukan komunikasi melalui kanal resmi perusahaan.',
      'Kami berkomitmen menjaga kerahasiaan dan keamanan data pribadi sesuai kebutuhan operasional bisnis serta ketentuan hukum yang berlaku di Indonesia.',
    ],
  },
  {
    title: '2. Data yang Kami Kumpulkan',
    paragraphs: [
      'Kami dapat mengumpulkan data identitas dan kontak seperti nama, nama perusahaan, alamat email, nomor telepon, serta informasi proyek yang Anda kirimkan melalui formulir konsultasi atau korespondensi.',
      'Kami juga dapat memproses data teknis terbatas seperti alamat IP, jenis perangkat, browser, halaman yang diakses, dan waktu akses untuk tujuan keamanan sistem serta analisis performa layanan digital.',
    ],
  },
  {
    title: '3. Tujuan Penggunaan Data',
    paragraphs: [
      'Data digunakan untuk menindaklanjuti permintaan konsultasi, menyiapkan penawaran layanan, menjalankan komunikasi proyek, meningkatkan kualitas layanan, serta memenuhi kewajiban administratif dan hukum.',
      'Kami tidak menjual data pribadi Anda kepada pihak mana pun.',
    ],
  },
  {
    title: '4. Dasar Pemrosesan',
    paragraphs: [
      'Pemrosesan data dilakukan berdasarkan persetujuan yang Anda berikan, kebutuhan pra-kontrak atau kontrak layanan, kepentingan bisnis yang sah, dan/atau kewajiban hukum yang melekat pada operasional perusahaan.',
    ],
  },
  {
    title: '5. Penyimpanan dan Perlindungan Data',
    paragraphs: [
      'Kami menerapkan langkah teknis dan administratif yang wajar untuk melindungi data dari akses tidak sah, perubahan, pengungkapan, atau penghapusan tanpa izin.',
      'Data disimpan selama masih diperlukan untuk tujuan layanan, pencatatan bisnis, penyelesaian sengketa, audit, atau kewajiban hukum.',
    ],
  },
  {
    title: '6. Pembagian Data kepada Pihak Ketiga',
    paragraphs: [
      'Dalam batas yang diperlukan, data dapat diakses oleh penyedia layanan pendukung (misalnya hosting, komunikasi, atau administrasi proyek) yang terikat kewajiban kerahasiaan.',
      'Pengungkapan data juga dapat dilakukan apabila diwajibkan oleh peraturan perundang-undangan atau permintaan resmi dari otoritas berwenang.',
    ],
  },
  {
    title: '7. Hak Anda atas Data Pribadi',
    paragraphs: [
      'Anda dapat mengajukan permintaan untuk mengakses, memperbarui, memperbaiki, atau menghapus data pribadi yang tersimpan pada kami, sepanjang tidak bertentangan dengan kewajiban hukum atau kebutuhan administrasi proyek yang sedang berjalan.',
      'Permintaan dapat disampaikan melalui kontak resmi yang tercantum pada bagian akhir kebijakan ini.',
    ],
  },
  {
    title: '8. Cookies dan Teknologi Serupa',
    paragraphs: [
      'Website dapat menggunakan cookies atau teknologi serupa untuk mendukung fungsi situs, analitik dasar, dan peningkatan pengalaman pengguna. Anda dapat mengelola preferensi cookies melalui pengaturan browser.',
    ],
  },
  {
    title: '9. Perubahan Kebijakan',
    paragraphs: [
      'Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu. Versi terbaru akan dipublikasikan pada halaman ini dan berlaku sejak tanggal pembaruan.',
    ],
  },
]

function KebijakanPrivasiPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <p className="kicker">Legal</p>
        <h1 style={{ fontSize: 'clamp(42px, 6vw, 56px)' }}>Kebijakan Privasi</h1>
        <p className="muted" style={{ marginTop: 14, maxWidth: 780 }}>
          Kebijakan ini menjelaskan cara PT Trimitra Multi Kreasi mengumpulkan,
          menggunakan, menyimpan, dan melindungi informasi pengguna untuk
          mendukung layanan booth pameran, event organizer, dan media outdoor.
        </p>
        <p className="muted" style={{ marginTop: 10 }}>
          Berlaku sejak: 17 April 2026
        </p>

        <div style={{ marginTop: 34, display: 'grid', gap: 24 }}>
          {PRIVACY_SECTIONS.map((section) => (
            <article key={section.title} style={{ display: 'grid', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(22px, 2.2vw, 30px)' }}>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="muted" style={{ margin: 0, lineHeight: 1.75 }}>
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </div>

        <article style={{ marginTop: 30, display: 'grid', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(22px, 2.2vw, 30px)' }}>10. Kontak Resmi</h2>
          <p className="muted" style={{ margin: 0, lineHeight: 1.75 }}>
            Untuk pertanyaan terkait privasi data, silakan hubungi PT Trimitra
            Multi Kreasi melalui email <a href="mailto:dhr@trimitramulti.co.id">dhr@trimitramulti.co.id</a>
            {' '}atau telepon <a href="tel:+62217894561">+62 21 789 4561</a>.
          </p>
          <p className="muted" style={{ margin: 0, lineHeight: 1.75 }}>
            Alamat korespondensi: HRGJ+P8F, Tirtajaya, Kec. Sukmajaya, Kota Depok, Jawa Barat 16413.
          </p>
        </article>
      </div>
    </section>
  )
}

export default KebijakanPrivasiPage
