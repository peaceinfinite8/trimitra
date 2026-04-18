"use client";
import { useEffect, useMemo, useState } from "react";
import { getWordPressClients, isWordPressConfiguredForPages } from "../data/wordpressPages";

type MarqueeClient = {
    id?: string | number;
    initials: string;
    name: string;
    tagline: string;
    color: string;
    logo?: string;
};

const fallbackClients: MarqueeClient[] = [
    { initials: "ME", name: "Melsa", tagline: "Partner", color: "#1877F2", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/1.jpeg" },
    { initials: "BB", name: "Bank BJB", tagline: "Partner", color: "#E4405F", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/2.jpeg" },
    { initials: "TG", name: "Tegar", tagline: "Partner", color: "#0A66C2", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/3.jpeg" },
    { initials: "PD", name: "Paricara Darma", tagline: "Partner", color: "#FF6B35", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/4.jpeg" },
    { initials: "PR", name: "Prima", tagline: "Partner", color: "#16A34A", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/5.jpeg" },
    { initials: "JS", name: "Jskye", tagline: "Partner", color: "#7C3AED", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/6.jpeg" },
    { initials: "OH", name: "Omni Hospitals", tagline: "Partner", color: "#0EA5E9", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/7.jpeg" },
    { initials: "HP", name: "Humpuss", tagline: "Partner", color: "#1D4ED8", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/8.jpeg" },
    { initials: "PI", name: "Perbanas Institute", tagline: "Partner", color: "#DB2777", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/9.jpeg" },
    { initials: "GP", name: "Garda Persada", tagline: "Partner", color: "#EA580C", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/10.jpeg" },
    { initials: "NP", name: "Nipress", tagline: "Partner", color: "#2563EB", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/11.jpeg" },
    { initials: "DK", name: "Dua Kelinci", tagline: "Partner", color: "#DC2626", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/12.jpeg" },
    { initials: "TW", name: "TirtaWening", tagline: "Partner", color: "#0891B2", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/13.jpeg" },
    { initials: "IB", name: "InfoBank", tagline: "Partner", color: "#BE123C", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/14.jpeg" },
    { initials: "NK", name: "PT Nindya Karya", tagline: "Partner", color: "#0284C7", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/15.jpeg" },
    { initials: "AS", name: "Alam Sutra", tagline: "Partner", color: "#14B8A6", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/16.jpeg" },
    { initials: "KG", name: "Kalla Group", tagline: "Partner", color: "#0F766E", logo: "https://cms.trimitramulti.co.id/wp-content/uploads/2020/06/17.jpeg" },
];

type ClientMarqueeTheme = "light" | "dark";

type ClientMarqueeProps = {
    theme?: ClientMarqueeTheme;
};

export default function ClientMarquee({ theme = "dark", clients: initialClients }: ClientMarqueeProps & { clients?: MarqueeClient[] }) {
    const [clients, setClients] = useState<MarqueeClient[]>(initialClients?.length ? initialClients : fallbackClients);

    useEffect(() => {
        let cancelled = false;

        async function loadWordPressClients() {
            if (!isWordPressConfiguredForPages()) return;

            const wpClients = await getWordPressClients({ perPage: 40 });
            if (!cancelled && Array.isArray(wpClients) && wpClients.length > 0 && !initialClients?.length) {
                setClients(wpClients as MarqueeClient[]);
            }
        }

        loadWordPressClients().catch(() => {
            // Keep static fallback clients if WordPress fetch fails.
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const topRowClients = useMemo(() => [...clients, ...clients, ...clients], [clients]);
    const bottomRowClients = useMemo(() => [...clients].reverse(), [clients]);
    const allBottomRowClients = useMemo(
        () => [...bottomRowClients, ...bottomRowClients, ...bottomRowClients],
        [bottomRowClients],
    );

    const isLight = theme === "light";
    const cardBackground = isLight ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.08)";
    const cardBorder = isLight ? "1px solid rgba(133,182,219,0.62)" : "1px solid rgba(255,255,255,0.15)";
    const titleColor = isLight ? "#163855" : "white";
    const taglineColor = isLight ? "rgba(34,74,107,0.75)" : "rgba(255,255,255,0.55)";

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
                    animation: marquee-scroll-left 62s linear infinite;
        }
        .marquee-track-right {
                    animation: marquee-scroll-right 68s linear infinite;
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
                                    background: cardBackground,
                                    backdropFilter: "blur(8px)",
                                    border: cardBorder,
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
                                        overflow: "hidden",
                                    }}
                                >
                                    {client.logo ? (
                                        <img
                                            src={client.logo}
                                            alt={client.name}
                                            style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px", background: "#fff" }}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        client.initials
                                    )}
                                </div>
                                <div style={{ overflow: "hidden" }}>
                                    <p style={{ fontWeight: "600", fontSize: "13px", color: titleColor, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {client.name}
                                    </p>
                                    <p style={{ fontSize: "11px", color: taglineColor, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
                                    background: cardBackground,
                                    backdropFilter: "blur(8px)",
                                    border: cardBorder,
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
                                        overflow: "hidden",
                                    }}
                                >
                                    {client.logo ? (
                                        <img
                                            src={client.logo}
                                            alt={client.name}
                                            style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px", background: "#fff" }}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        client.initials
                                    )}
                                </div>
                                <div style={{ overflow: "hidden" }}>
                                    <p style={{ fontWeight: "600", fontSize: "13px", color: titleColor, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {client.name}
                                    </p>
                                    <p style={{ fontSize: "11px", color: taglineColor, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
