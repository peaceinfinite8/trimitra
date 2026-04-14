import Marquee from 'react-fast-marquee'

const CLIENT_PARTNERS = [
  {
    name: 'PT Kota Advertise',
    tagline: 'Billboard advertising dan media outdoor',
    initials: 'PK',
    avatarColor: '#2f9ed5',
  },
  {
    name: 'Nexus Event Indonesia',
    tagline: 'Event organizer dan aktivasi brand',
    initials: 'NE',
    avatarColor: '#2f74dd',
  },
  {
    name: 'Prestige Booth Design',
    tagline: 'Booth exhibition dan pameran',
    initials: 'PB',
    avatarColor: '#5078e2',
  },
  {
    name: 'Metro Activation',
    tagline: 'Campaign activation lintas kota',
    initials: 'MA',
    avatarColor: '#248ebf',
  },
]

const MARQUEE_PARTNERS = [...CLIENT_PARTNERS, ...CLIENT_PARTNERS]

function ClientMarquee() {
  return (
    <div className="services-redesign-trust-marquee" aria-label="Daftar partner layanan Trimitra">
      <Marquee
        speed={40}
        gradient
        gradientColor={[15, 42, 74]}
        gradientWidth={80}
        pauseOnHover
      >
        {MARQUEE_PARTNERS.map((partner, index) => (
          <article
            key={`${partner.name}-${index}`}
            className="services-redesign-trust-marquee-card"
          >
            <div
              className="services-redesign-trust-marquee-avatar"
              style={{ background: `linear-gradient(145deg, ${partner.avatarColor}, #0f2a4a)` }}
              aria-hidden="true"
            >
              {partner.initials}
            </div>
            <div>
              <h3>{partner.name}</h3>
              <p>{partner.tagline}</p>
            </div>
          </article>
        ))}
      </Marquee>
    </div>
  )
}

export default ClientMarquee
