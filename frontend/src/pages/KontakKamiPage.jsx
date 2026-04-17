import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  SectionReveal,
  StaggerGroup,
  StaggerItem,
} from "../components/animation/Reveal";
import {
  extractContactInfoFromHtml,
  getWordPressPageBySlugs,
  isWordPressConfiguredForPages,
} from "../data/wordpressPages";
import { pickTextField } from "../data/wpUiFields";

const CONTACT_DRAFT_KEY = "trimitra-contact-draft-v1";
const WHATSAPP_NUMBER = "62811109842";
const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps?q=Jl.+Kemang+Raya+No.+10A,+Mampang+Prapatan,+Jakarta+Selatan,+12730&z=16&output=embed";
const EMPTY_FORM_DATA = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  brief: "",
};

const SERVICE_OPTIONS = [
  "Booth Exhibition",
  "Event Organizer",
  "Advertising (Billboard)",
  "Interior Komersial",
  "Lainnya",
];

const CONTACT_HIGHLIGHTS = [
  { value: "< 2 Jam", label: "Respon WhatsApp", icon: "clock" },
  { value: "Gratis", label: "Konsultasi Awal", icon: "chat" },
  { value: "24/7", label: "Siap Melayani", icon: "support" },
];

function getInitialDraftFormData() {
  if (typeof window === "undefined") return EMPTY_FORM_DATA;

  const raw = window.localStorage.getItem(CONTACT_DRAFT_KEY);
  if (!raw) return EMPTY_FORM_DATA;

  try {
    const parsed = JSON.parse(raw);
    return { ...EMPTY_FORM_DATA, ...parsed };
  } catch {
    window.localStorage.removeItem(CONTACT_DRAFT_KEY);
    return EMPTY_FORM_DATA;
  }
}

function buildWhatsAppMessage(formData) {
  const lines = [
    `Halo Tim Trimitra, saya ingin konsultasi.`,
    ``,
    `*Nama:* ${formData.name}`,
    `*Email:* ${formData.email}`,
  ];
  if (formData.phone) lines.push(`*No. HP:* ${formData.phone}`);
  if (formData.company) lines.push(`*Perusahaan:* ${formData.company}`);
  if (formData.service) lines.push(`*Layanan:* ${formData.service}`);
  if (formData.brief) {
    lines.push(``);
    lines.push(`*Detail Kebutuhan:*`);
    lines.push(formData.brief);
  }
  return lines.join("\n");
}

function ContactHighlightIcon({ type }) {
  if (type === "clock") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="presentation"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    );
  }
  if (type === "chat") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="presentation"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="presentation"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      role="presentation"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function KontakKamiPage() {
  const prefersReducedMotion = useReducedMotion();
  const [wpPage, setWpPage] = useState(null);
  const [formData, setFormData] = useState(() => getInitialDraftFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = useMemo(() => {
    return extractContactInfoFromHtml(wpPage?.contentHtml || "");
  }, [wpPage]);

  const uiFields = useMemo(
    () => ({ ...(wpPage?.meta || {}), ...(wpPage?.acf || {}) }),
    [wpPage],
  );

  const pageTitle = pickTextField(
    uiFields,
    ["contact_title"],
    "Mulai Konsultasi.",
  );
  const pageTitleHighlight = pickTextField(
    uiFields,
    ["contact_title_highlight"],
    "Konsultasi.",
  );
  const pageSubtitle = pickTextField(
    uiFields,
    ["contact_subtitle"],
    "Sampaikan kebutuhan booth pameran, event organizer, atau media outdoor Anda. Tim Trimitra siap membantu dari tahap perencanaan hingga eksekusi.",
  );
  const submitLabel = pickTextField(
    uiFields,
    ["contact_submit_label"],
    "Kirim Permintaan Konsultasi",
  );

  const addressText =
    contactInfo.address ||
    "Jl. Kemang Raya No. 10A, Mampang Prapatan, Jakarta Selatan, 12730";
  const contactEmails = useMemo(() => {
    const seen = new Set();
    const deduped = [];

    for (const email of contactInfo.emails || []) {
      const normalized = email.trim().toLowerCase();
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      deduped.push(email.trim());
    }

    return deduped.length > 0 ? deduped : ["dhr@trimitramulti.co.id"];
  }, [contactInfo.emails]);

  const contactPhones = useMemo(() => {
    const seen = new Set();
    const deduped = [];

    for (const phone of contactInfo.phones || []) {
      const normalized = phone.replace(/\s+/g, "").trim();
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      deduped.push(phone.trim());
    }

    return deduped.length > 0 ? deduped : ["+62811-1098-42"];
  }, [contactInfo.phones]);

  const primaryPhone = contactPhones[0] || "+62811-1098-42";
  const whatsappChatDirectUrl = `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(
    "Halo Tim Trimitra, saya ingin obrolan langsung terkait layanan Anda.",
  )}`;

  useEffect(() => {
    document.body.classList.add("route-contact");
    return () => {
      document.body.classList.remove("route-contact");
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPageFromWordPress() {
      if (!isWordPressConfiguredForPages()) return;
      try {
        const page = await getWordPressPageBySlugs([
          "kontak-kami",
          "contact",
          "contact-us",
        ]);
        if (!cancelled && page) {
          setWpPage(page);
        }
      } catch {
        // Keep fallback static copy.
      }
    }

    loadPageFromWordPress();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const hasValue = Object.values(formData).some(
      (value) => value.trim() !== "",
    );
    if (!hasValue) {
      window.localStorage.removeItem(CONTACT_DRAFT_KEY);
      return;
    }

    window.localStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const message = buildWhatsAppMessage(formData);
    const waUrl = `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;

    // Clear form and local storage
    setFormData(EMPTY_FORM_DATA);
    window.localStorage.removeItem(CONTACT_DRAFT_KEY);

    // Small delay for visual feedback, then open WhatsApp
    setTimeout(() => {
      window.open(waUrl, "_blank", "noopener,noreferrer");
      setIsSubmitting(false);
    }, 400);
  };

  const titleBase = pageTitle.replace(pageTitleHighlight, "").trim();

  return (
    <div className="contact-page-lumen">
      {/* ─── Hero Section ─── */}
      <SectionReveal className="contact-hero-premium" data-nav-hero>
        <div className="contact-hero-ambient" aria-hidden="true">
          <span className="contact-hero-orb orb-a" />
          <span className="contact-hero-orb orb-b" />
          <span className="contact-hero-orb orb-c" />
        </div>

        <div className="container contact-hero-grid">
          <div className="contact-hero-copy">
            <motion.p
              className="kicker"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              Kontak Kami
            </motion.p>
            <motion.h1
              className="contact-hero-title"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
              animate={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
              }
              transition={{
                duration: 0.52,
                delay: 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {titleBase}{" "}
              <em className="contact-hero-highlight">{pageTitleHighlight}</em>
            </motion.h1>
            <motion.p
              className="muted contact-hero-subtitle"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
              }
              transition={{
                duration: 0.46,
                delay: 0.14,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {pageSubtitle}
            </motion.p>

            <motion.div
              className="contact-hero-actions"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
              }
              transition={{
                duration: 0.42,
                delay: 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <a
                className="btn contact-wa-hero-btn"
                href={whatsappChatDirectUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-wa-hero-icon">
                  <WhatsAppIcon />
                </span>
                Chat WhatsApp Langsung
              </a>
              <Link className="btn outline" to="/layanan">
                Lihat Layanan
              </Link>
            </motion.div>
          </div>

          <StaggerGroup className="contact-hero-highlights" once amount={0.35}>
            {CONTACT_HIGHLIGHTS.map((item) => (
              <StaggerItem key={item.label}>
                <article className="contact-highlight-card">
                  <span className="contact-highlight-icon">
                    <ContactHighlightIcon type={item.icon} />
                  </span>
                  <h3>{item.value}</h3>
                  <p>{item.label}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </SectionReveal>

      {/* ─── WP Content (optional) ─── */}
      {wpPage?.contentHtml && (
        <SectionReveal className="section cms-page-shell">
          <div className="container">
            <article
              className="blog-detail-content cms-page-content contact-cms-content"
              dangerouslySetInnerHTML={{ __html: wpPage.contentHtml }}
            />
          </div>
        </SectionReveal>
      )}

      {/* ─── Form + Info ─── */}
      <SectionReveal className="section contact-main-section">
        <div className="container">
          <div className="contact-main-head">
            <p className="kicker">Formulir Konsultasi</p>
            <h2 className="contact-main-title">
              Ceritakan Kebutuhan Proyek Anda
            </h2>
            <p className="muted contact-main-subtitle">
              Isi formulir di bawah dan pesan akan dikirim langsung ke WhatsApp
              tim Trimitra untuk respon yang lebih cepat.
            </p>
          </div>

          <StaggerGroup className="contact-shell contact-shell-premium">
            <form
              className="contact-form card"
              onSubmit={handleSubmit}
              id="contact-form"
            >
              <div className="contact-form-badge">
                <span className="contact-form-badge-icon">
                  <WhatsAppIcon />
                </span>
                <span>Dikirim via WhatsApp</span>
              </div>

              <div className="form-grid">
                <StaggerItem>
                  <label>
                    <p className="kicker">Nama Lengkap *</p>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </StaggerItem>

                <StaggerItem>
                  <label>
                    <p className="kicker">Alamat Email *</p>
                    <input
                      type="email"
                      placeholder="email@perusahaan.com"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </StaggerItem>

                <StaggerItem>
                  <label>
                    <p className="kicker">No. Telepon</p>
                    <input
                      type="tel"
                      placeholder="+62 812-3456-7890"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </label>
                </StaggerItem>

                <StaggerItem>
                  <label>
                    <p className="kicker">Perusahaan / Organisasi</p>
                    <input
                      type="text"
                      placeholder="Nama perusahaan Anda"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </label>
                </StaggerItem>

                <StaggerItem className="full">
                  <label className="full">
                    <p className="kicker">Jenis Layanan</p>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="contact-select"
                    >
                      <option value="">Pilih layanan yang dibutuhkan</option>
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                </StaggerItem>

                <StaggerItem className="full">
                  <label className="full">
                    <p className="kicker">Ringkasan Proyek *</p>
                    <textarea
                      rows="5"
                      placeholder="Ceritakan detail kebutuhan Anda: lokasi, jadwal, budget range, atau hal spesifik lainnya..."
                      name="brief"
                      value={formData.brief}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </StaggerItem>
              </div>

              <button
                className={`btn contact-submit-btn ${isSubmitting ? "is-submitting" : ""}`}
                type="submit"
                disabled={isSubmitting}
                id="contact-submit"
              >
                <span className="contact-submit-icon">
                  <WhatsAppIcon />
                </span>
                {isSubmitting ? "Mengirim..." : submitLabel}
              </button>
              <p className="contact-form-note">
                * Data Anda akan dikirim langsung ke WhatsApp +62811-1098-42 dan
                tidak disimpan di server.
              </p>
            </form>

            <div className="contact-info">
              <article className="contact-box">
                <span className="contact-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div>
                  <h3>Kantor Pusat Jakarta</h3>
                  <p className="muted">{addressText}</p>
                </div>
              </article>

              <article className="contact-box">
                <span className="contact-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="4.8" y="7" width="14.4" height="10" rx="2" />
                    <path d="M6 8.3 12 12.5l6-4.2" />
                  </svg>
                </span>
                <div>
                  <h3>Email Bisnis</h3>
                  {contactEmails.map((email) => (
                    <p className="muted" key={email}>
                      <a href={`mailto:${email}`}>{email}</a>
                    </p>
                  ))}
                </div>
              </article>

              <article className="contact-box">
                <span className="contact-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <div>
                  <h3>Hubungi Langsung</h3>
                  <p className="muted">
                    <a href={`tel:${primaryPhone.replace(/\s+/g, "")}`}>
                      {primaryPhone}
                    </a>
                  </p>
                  <p className="kicker">
                    <a
                      href={whatsappChatDirectUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Chat WhatsApp →
                    </a>
                  </p>
                </div>
              </article>

              <article className="contact-map card contact-map-premium">
                <div className="contact-map-glow" aria-hidden="true" />
                <iframe
                  title="Peta lokasi Trimitra"
                  className="contact-map-frame"
                  src={GOOGLE_MAPS_EMBED_URL}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <div className="contact-map-note">
                  <p className="kicker">Temukan Kami</p>
                  <p className="muted">
                    Kantor Trimitra berada di kawasan Kemang, Jakarta Selatan,
                    dengan akses cepat ke area bisnis dan venue event utama.
                  </p>
                  <a
                    className="contact-map-link"
                    href="https://maps.google.com/?q=Jl.+Kemang+Raya+No.+10A,+Mampang+Prapatan,+Jakarta+Selatan,+12730"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buka di Google Maps
                  </a>
                </div>
              </article>

              <article className="contact-whatsapp-banner">
                <div className="contact-wa-banner-head">
                  <span className="contact-wa-banner-icon">
                    <WhatsAppIcon />
                  </span>
                  <div>
                    <p className="kicker">Fast Response</p>
                    <h3>Butuh Respon Cepat via WhatsApp?</h3>
                  </div>
                </div>
                <p className="muted">
                  Tim kami siap merespon dalam waktu kurang dari 2 jam pada jam
                  kerja.
                </p>
                <a
                  className="btn contact-wa-banner-btn"
                  href={`${WHATSAPP_BASE_URL}?text=${encodeURIComponent("Halo Tim Trimitra, saya butuh respon cepat untuk kebutuhan booth/event saya.")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="contact-wa-hero-icon">
                    <WhatsAppIcon />
                  </span>
                  Chat WhatsApp Sekarang
                </a>
              </article>
            </div>
          </StaggerGroup>
        </div>
      </SectionReveal>

      {/* ─── CTA Section ─── */}
      <SectionReveal className="dark-cta contact-cta-section">
        <div className="container contact-cta-shell">
          <div>
            <h2 className="contact-cta-title">Siap Memulai Proyek Anda?</h2>
            <p className="muted contact-cta-copy">
              Konsultasikan kebutuhan booth, event, dan media outdoor Anda
              bersama tim Trimitra untuk eksekusi yang lebih presisi dan tepat
              waktu.
            </p>
          </div>
          <div className="contact-cta-actions">
            <Link className="btn" to="/layanan">
              Lihat Layanan
            </Link>
            <Link className="btn outline home-cta-secondary" to="/galeri">
              Lihat Portofolio
            </Link>
          </div>
        </div>
      </SectionReveal>
    </div>
  );
}

export default KontakKamiPage;
