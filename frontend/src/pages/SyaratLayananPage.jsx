const TERMS_SECTIONS = [
  {
    title: '1. Ketentuan Umum',
    paragraphs: [
      'Halaman ini memuat syarat dan ketentuan penggunaan layanan PT Trimitra Multi Kreasi ("Trimitra"). Dengan mengakses website atau menggunakan layanan kami, Anda dianggap telah memahami dan menyetujui ketentuan ini.',
      'Informasi pada website bersifat umum. Detail ruang lingkup, jadwal, harga, dan spesifikasi pelaksanaan akan dituangkan lebih lanjut dalam proposal, quotation, purchase order, atau perjanjian kerja sama resmi.',
    ],
  },
  {
    title: '2. Ruang Lingkup Layanan',
    paragraphs: [
      'Trimitra menyediakan layanan yang mencakup, namun tidak terbatas pada, booth pameran, event organizer, media outdoor, dan pekerjaan kreatif pendukung yang disepakati bersama klien.',
      'Setiap pekerjaan dapat melibatkan tahap konsultasi, desain, produksi, instalasi, operasional acara, hingga pembongkaran sesuai kebutuhan proyek.',
    ],
  },
  {
    title: '3. Proses Pemesanan dan Persetujuan',
    paragraphs: [
      'Permintaan layanan dapat disampaikan melalui kanal resmi Trimitra. Konfirmasi pekerjaan dianggap sah setelah adanya persetujuan tertulis dari para pihak terhadap proposal dan/atau dokumen komersial terkait.',
      'Setiap perubahan ruang lingkup setelah persetujuan awal dapat memengaruhi biaya, waktu, dan ketersediaan sumber daya.',
    ],
  },
  {
    title: '4. Kewajiban Klien',
    paragraphs: [
      'Klien wajib memberikan data, materi, dan persetujuan yang diperlukan secara tepat waktu agar jadwal proyek dapat berjalan sesuai rencana.',
      'Klien bertanggung jawab atas legalitas materi konten, merek dagang, perizinan lokasi (jika menjadi kewenangan klien), serta informasi yang diberikan kepada Trimitra.',
    ],
  },
  {
    title: '5. Biaya dan Pembayaran',
    paragraphs: [
      'Nilai layanan, termin pembayaran, dan ketentuan pajak akan mengacu pada dokumen penawaran atau kontrak yang disepakati.',
      'Keterlambatan pembayaran dapat berdampak pada penyesuaian jadwal pekerjaan, penangguhan layanan, atau biaya tambahan sesuai ketentuan dalam perjanjian.',
    ],
  },
  {
    title: '6. Perubahan, Penundaan, dan Pembatalan',
    paragraphs: [
      'Perubahan desain, material, atau jadwal setelah tahap persetujuan final dapat dikenakan biaya tambahan dan/atau penyesuaian timeline.',
      'Dalam hal pembatalan proyek oleh salah satu pihak, penyelesaian biaya atas pekerjaan yang sudah berjalan akan mengikuti ketentuan dalam dokumen kerja sama.',
    ],
  },
  {
    title: '7. Hak Kekayaan Intelektual',
    paragraphs: [
      'Hak cipta atas materi desain, konsep, dan dokumen kerja akan mengikuti ketentuan lisensi atau pengalihan hak yang tertuang dalam kontrak proyek.',
      'Penggunaan aset visual, logo, dan materi milik klien oleh Trimitra hanya untuk kebutuhan pelaksanaan proyek dan/atau portofolio apabila telah memperoleh persetujuan.',
    ],
  },
  {
    title: '8. Kerahasiaan',
    paragraphs: [
      'Trimitra dan klien sepakat menjaga kerahasiaan informasi bisnis, data proyek, serta dokumen internal yang bersifat non-publik, kecuali diwajibkan oleh hukum.',
    ],
  },
  {
    title: '9. Batasan Tanggung Jawab',
    paragraphs: [
      'Trimitra bertanggung jawab atas kualitas pelaksanaan sesuai ruang lingkup yang disepakati. Trimitra tidak bertanggung jawab atas kerugian tidak langsung yang timbul di luar kendali wajar perusahaan.',
      'Kondisi force majeure seperti bencana alam, gangguan kebijakan otoritas, atau keadaan darurat lain dapat memengaruhi jadwal dan pelaksanaan proyek.',
    ],
  },
  {
    title: '10. Hukum yang Berlaku',
    paragraphs: [
      'Syarat Layanan ini tunduk pada hukum Republik Indonesia. Perselisihan akan diupayakan diselesaikan terlebih dahulu secara musyawarah untuk mufakat.',
    ],
  },
]

function SyaratLayananPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <p className="kicker">Legal</p>
        <h1 style={{ fontSize: 'clamp(42px, 6vw, 56px)' }}>Syarat Layanan</h1>
        <p className="muted" style={{ marginTop: 14, maxWidth: 780 }}>
          Ketentuan ini menjadi acuan penggunaan layanan PT Trimitra Multi
          Kreasi pada setiap komunikasi, penawaran, dan pelaksanaan proyek.
        </p>
        <p className="muted" style={{ marginTop: 10 }}>
          Berlaku sejak: 17 April 2026
        </p>

        <div style={{ marginTop: 34, display: 'grid', gap: 24 }}>
          {TERMS_SECTIONS.map((section) => (
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
          <h2 style={{ margin: 0, fontSize: 'clamp(22px, 2.2vw, 30px)' }}>11. Kontak Resmi</h2>
          <p className="muted" style={{ margin: 0, lineHeight: 1.75 }}>
            Pertanyaan mengenai syarat layanan dapat disampaikan ke PT Trimitra
            Multi Kreasi melalui email <a href="mailto:dhr@trimitramulti.co.id">dhr@trimitramulti.co.id</a>
            {' '}atau telepon <a href="tel:+62811109842">0811109842</a>.
          </p>
        </article>
      </div>
    </section>
  )
}

export default SyaratLayananPage
