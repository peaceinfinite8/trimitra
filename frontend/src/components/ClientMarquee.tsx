"use client";

const clients = [
    { initials: "PK", name: "PT Kota Advertise", tagline: "Billboard & media outdoor", color: "#1877F2" },
    { initials: "NE", name: "Nexus Event Indonesia", tagline: "Event organizer & aktivasi brand", color: "#E4405F" },
    { initials: "PB", name: "Prestige Booth Design", tagline: "Booth exhibition & pameran", color: "#0A66C2" },
    { initials: "MA", name: "Metro Activation", tagline: "Campaign activation lintas kota", color: "#FF6B35" },
];

const topRowClients = [...clients, ...clients, ...clients];
const bottomRowClients = [...clients].reverse();
const allBottomRowClients = [...bottomRowClients, ...bottomRowClients, ...bottomRowClients];

export default function ClientMarquee() {
    return (
        <>
            <style>{`
        @keyframes marquee-scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marquee-scroll-right {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        .marquee-root {
          display: grid;
          gap: 12px;
          overflow: hidden;
        }
        .marquee-row {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, black 100px, black calc(100% - 100px), transparent);
          mask-image: linear-gradient(to right, transparent, black 100px, black calc(100% - 100px), transparent);
        }
        .marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
        }
        .marquee-track-left {
          animation: marquee-scroll-left 20s linear infinite;
        }
        .marquee-track-right {
          animation: marquee-scroll-right 20s linear infinite;
        }
        .marquee-root:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>

            <div className="marquee-root" aria-label="Daftar partner layanan Trimitra dua baris">
                <div className="marquee-row">
                    <div className="marquee-track marquee-track-left">
                        {topRowClients.map((client, i) => (
                            <div
                                key={`top-${i}`}
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
                                    flexShrink: 0,
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
                    </div>
                </div>

                <div className="marquee-row">
                    <div className="marquee-track marquee-track-right">
                        {allBottomRowClients.map((client, i) => (
                            <div
                                key={`bottom-${i}`}
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
                                    flexShrink: 0,
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
                    </div>
                </div>
            </div>
        </>
    );
}
