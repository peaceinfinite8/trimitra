"use client";
import Marquee from "react-fast-marquee";

const clients = [
  { initials: "PK", name: "PT Kota Advertise", tagline: "Billboard & media outdoor", color: "#1877F2" },
  { initials: "NE", name: "Nexus Event Indonesia", tagline: "Event organizer & aktivasi brand", color: "#E4405F" },
  { initials: "PB", name: "Prestige Booth Design", tagline: "Booth exhibition & pameran", color: "#0A66C2" },
  { initials: "MA", name: "Metro Activation", tagline: "Campaign activation lintas kota", color: "#FF6B35" },
];

export default function ClientMarquee() {
  return (
    <div
      style={{
        maskImage: "linear-gradient(to right, transparent, black 100px, black calc(100% - 100px), transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 100px, black calc(100% - 100px), transparent)",
        overflow: "hidden",
      }}
    >
      <Marquee speed={40} pauseOnHover={true} gradient={false} autoFill={true}>
        {clients.map((client, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "14px",
              padding: "12px 20px",
              marginRight: "16px",
              minWidth: "220px",
              maxWidth: "220px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: client.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "13px",
                color: "white",
                flexShrink: 0,
              }}
            >
              {client.initials}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontWeight: "600", fontSize: "13px", color: "white", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {client.name}
              </p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {client.tagline}
              </p>
            </div>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
