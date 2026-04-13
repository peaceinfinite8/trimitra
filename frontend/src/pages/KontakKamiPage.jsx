import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../components/ui/useToast'
import { SectionReveal, StaggerGroup, StaggerItem } from '../components/animation/Reveal'
import {
  extractContactInfoFromHtml,
  getWordPressPageBySlugs,
  isWordPressConfiguredForPages,
} from '../data/wordpressPages'
import { pickTextField } from '../data/wpUiFields'

const CONTACT_DRAFT_KEY = 'trimitra-contact-draft-v1'
const EMPTY_FORM_DATA = {
  name: '',
  email: '',
  company: '',
  brief: '',
}

function getInitialDraftFormData() {
  if (typeof window === 'undefined') return EMPTY_FORM_DATA

  const raw = window.localStorage.getItem(CONTACT_DRAFT_KEY)
  if (!raw) return EMPTY_FORM_DATA

  try {
    const parsed = JSON.parse(raw)
    return { ...EMPTY_FORM_DATA, ...parsed }
  } catch {
    window.localStorage.removeItem(CONTACT_DRAFT_KEY)
    return EMPTY_FORM_DATA
  }
}

function KontakKamiPage() {
  const { showToast } = useToast()
  const [wpPage, setWpPage] = useState(null)
  const [formData, setFormData] = useState(() => getInitialDraftFormData())

  const contactInfo = useMemo(() => {
    return extractContactInfoFromHtml(wpPage?.contentHtml || '')
  }, [wpPage])

  const uiFields = useMemo(
    () => ({ ...(wpPage?.meta || {}), ...(wpPage?.acf || {}) }),
    [wpPage],
  )

  const pageTitle = pickTextField(uiFields, ['contact_title'], 'Mulai Konsultasi.')
  const pageTitleHighlight = pickTextField(uiFields, ['contact_title_highlight'], 'Konsultasi.')
  const pageSubtitle = pickTextField(uiFields, ['contact_subtitle'], 'Sampaikan kebutuhan booth pameran, event organizer, atau media outdoor Anda. Tim Trimitra siap membantu dari tahap perencanaan hingga eksekusi.')
  const submitLabel = pickTextField(uiFields, ['contact_submit_label'], 'Kirim Permintaan Konsultasi')

  const addressText = contactInfo.address || 'Jl. Kemang Raya No. 10A, Mampang Prapatan, Jakarta Selatan, 12730'
  const primaryEmail = contactInfo.emails[0] || 'inquire@trimitra.id'
  const secondaryEmail = contactInfo.emails[1] || 'press@trimitra.id'
  const primaryPhone = contactInfo.phones[0] || '+62 21 555 0192'
  const whatsappUrl = contactInfo.whatsapp || 'https://wa.me/62215550192'

  useEffect(() => {
    let cancelled = false

    async function loadPageFromWordPress() {
      if (!isWordPressConfiguredForPages()) return
      try {
        const page = await getWordPressPageBySlugs(['kontak-kami', 'contact', 'contact-us'])
        if (!cancelled && page) {
          setWpPage(page)
        }
      } catch {
        // Keep fallback static copy.
      }
    }

    loadPageFromWordPress()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const hasValue = Object.values(formData).some((value) => value.trim() !== '')
    if (!hasValue) {
      window.localStorage.removeItem(CONTACT_DRAFT_KEY)
      return
    }

    window.localStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(formData))
  }, [formData])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    showToast('Pesan berhasil dikirim. Tim kami akan menghubungi Anda segera.', 'success')
    setFormData(EMPTY_FORM_DATA)
    window.localStorage.removeItem(CONTACT_DRAFT_KEY)
  }

  return (
    <>
      <SectionReveal className="gallery-hero kontak-hero" data-nav-hero>
        <div className="container">
          <p className="kicker" style={{ color: '#ccb278' }}>
            Beranda &nbsp;›&nbsp; Kontak Kami
          </p>
          <h1 className="section-title" style={{ marginBottom: 14 }}>
            {pageTitle.replace(pageTitleHighlight, '').trim()} <em style={{ color: 'var(--gold)' }}>{pageTitleHighlight}</em>
          </h1>
          <p className="muted" style={{ maxWidth: 760 }}>
            {pageSubtitle}
          </p>
        </div>
      </SectionReveal>

      <SectionReveal className="section">
        <div className="container">
          {wpPage?.contentHtml && (
            <article
              className="blog-detail-content cms-page-content"
              style={{ marginBottom: 28, maxWidth: 860 }}
              dangerouslySetInnerHTML={{ __html: wpPage.contentHtml }}
            />
          )}

          <StaggerGroup className="contact-shell contact-shell-premium">
            <form className="contact-form card" onSubmit={handleSubmit}>
              <div className="form-grid">
                <StaggerItem>
                  <label>
                    <p className="kicker">Nama Lengkap</p>
                    <input
                      type="text"
                      placeholder="Johnathan Doe"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </StaggerItem>

                <StaggerItem>
                  <label>
                    <p className="kicker">Alamat Email</p>
                    <input
                      type="email"
                      placeholder="j.doe@company.com"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </StaggerItem>

                <StaggerItem className="full">
                  <label className="full">
                    <p className="kicker">Perusahaan / Organisasi</p>
                    <input
                      type="text"
                      placeholder="Architectural Ventures Ltd."
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </label>
                </StaggerItem>

                <StaggerItem className="full">
                  <label className="full">
                    <p className="kicker">Ringkasan Proyek</p>
                    <textarea
                      rows="6"
                      placeholder="Ceritakan visi Anda, lokasi proyek, dan jadwal waktu..."
                      name="brief"
                      value={formData.brief}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </StaggerItem>
              </div>

              <button className="btn contact-submit-btn" type="submit" style={{ marginTop: 16 }}>
                {submitLabel}
              </button>
            </form>

            <div className="contact-info">
              <article className="contact-box">
                <span className="contact-icon">HQ</span>
                <div>
                  <h3>Kantor Pusat Jakarta</h3>
                  <p className="muted">{addressText}</p>
                </div>
              </article>

              <article className="contact-box">
                <span className="contact-icon">EM</span>
                <div>
                  <h3>Atelier Digital</h3>
                  <p className="muted"><a href={`mailto:${primaryEmail}`}>{primaryEmail}</a></p>
                  <p className="muted"><a href={`mailto:${secondaryEmail}`}>{secondaryEmail}</a></p>
                </div>
              </article>

              <article className="contact-box">
                <span className="contact-icon">PH</span>
                <div>
                  <h3>Hubungi Langsung</h3>
                  <p className="muted"><a href={`tel:${primaryPhone.replace(/\s+/g, '')}`}>{primaryPhone}</a></p>
                  <p className="kicker"><a href={whatsappUrl} target="_blank" rel="noreferrer">Obrolan WhatsApp</a></p>
                </div>
              </article>

              <article className="contact-map card">
                <iframe
                  title="Peta lokasi Trimitra"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=106.8046%2C-6.2688%2C106.8202%2C-6.2544&layer=mapnik&marker=-6.2616%2C106.8124"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="map-note">
                  <p className="kicker">Temukan Kami</p>
                  <p className="muted">Atelier kami terletak di jantung distrik kreatif Jakarta, Kemang.</p>
                </div>
              </article>

              <article className="contact-whatsapp-banner">
                <p className="kicker">Fast Response</p>
                <h3>Butuh Respon Cepat via WhatsApp?</h3>
                <span className="contact-wa-icon" aria-hidden="true">WA</span>
                <a className="btn" href={whatsappUrl} target="_blank" rel="noreferrer">Chat WhatsApp</a>
              </article>
            </div>
          </StaggerGroup>
        </div>
      </SectionReveal>
    </>
  )
}

export default KontakKamiPage
