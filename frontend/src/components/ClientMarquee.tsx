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
    { initials: "PK", name: "PT Kota Advertise", tagline: "Billboard & media outdoor", color: "#1877F2" },
    { initials: "NE", name: "Nexus Event Indonesia", tagline: "Event organizer & aktivasi brand", color: "#E4405F" },
    { initials: "PB", name: "Prestige Booth Design", tagline: "Booth exhibition & pameran", color: "#0A66C2" },
    { initials: "MA", name: "Metro Activation", tagline: "Campaign activation lintas kota", color: "#FF6B35" },
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
                                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
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
                                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
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
