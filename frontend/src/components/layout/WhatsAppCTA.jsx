const WHATSAPP_LINK =
  'https://wa.me/62215550192?text=Halo%20Tim%20Trimitra,%20saya%20ingin%20konsultasi%20gratis%20terkait%20proyek%20saya.'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" role="presentation" aria-hidden="true">
      <path
        d="M12 4.2a7.7 7.7 0 0 0-6.7 11.5L4 20l4.5-1.2A7.7 7.7 0 1 0 12 4.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9.7c.2-.4.3-.4.6-.4h.5c.2 0 .4 0 .5.4l.4 1c.1.2.1.4 0 .5l-.3.4c-.1.2 0 .3.1.5.3.5.8 1 1.4 1.3.2.1.3.1.5 0l.4-.3c.1-.1.3-.1.5 0l1 .4c.4.1.4.3.4.5v.5c0 .3-.1.4-.4.6-.5.3-1.3.3-2.4-.2a6.7 6.7 0 0 1-3.2-3.2c-.5-1.1-.5-1.9-.2-2.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

function WhatsAppCTA() {
  return (
    <a
      className="wa-float-cta"
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noreferrer"
      aria-label="Konsultasi via WhatsApp"
    >
      <span className="wa-float-pulse" aria-hidden="true" />
      <span className="wa-float-icon" aria-hidden="true">
        <WhatsAppIcon />
      </span>
      <span className="wa-float-label">Hubungi via WhatsApp</span>
    </a>
  )
}

export default WhatsAppCTA