"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCachedWordPressClients, getWordPressClients, isWordPressConfiguredForPages } from "../data/wordpressPages";

type MarqueeClient = {
    id?: string | number;
    initials: string;
    name: string;
    tagline: string;
    color: string;
    logo?: string;
};

type ClientMarqueeTheme = "light" | "dark";

type ClientMarqueeProps = {
    theme?: ClientMarqueeTheme;
    clients?: MarqueeClient[];
};

function duplicateForMarquee(items: MarqueeClient[]) {
    if (items.length === 0) return [];
    return [...items, ...items];
}

function ClientLogoSkeleton() {
    return (
        <article className="home-partnership-card" aria-hidden="true">
            <div className="home-partnership-logo-wrap home-partnership-logo-wrap--placeholder" />
            <div className="home-partnership-copy-block">
                <h3 style={{ width: "78%", height: "12px", background: "rgba(16,43,68,0.12)", borderRadius: "999px", marginBottom: "6px" }} />
                <p style={{ width: "52%", height: "10px", background: "rgba(16,43,68,0.1)", borderRadius: "999px" }} />
            </div>
        </article>
    );
}

function ClientMarqueeCard({ client }: { client: MarqueeClient }) {
    const displayName = client.name;
    const displayTagline = client.tagline || "Partner";
    const [logoError, setLogoError] = useState(false);
    const shouldShowLogo = Boolean(client.logo) && !logoError;

    return (
        <article className="home-partnership-card home-partnership-marquee-item">
            <div className="home-partnership-logo-wrap">
                {shouldShowLogo ? (
                    <img
                        src={client.logo}
                        alt={`Logo ${displayName}`}
                        className="home-partnership-logo"
                        loading="lazy"
                        decoding="async"
                        style={{ imageRendering: "auto" }}
                        onError={() => setLogoError(true)}
                    />
                ) : (
                    <div className="home-partnership-logo home-partnership-logo--placeholder">
                        {client.initials || displayName.slice(0, 2).toUpperCase()}
                    </div>
                )}
            </div>

            <div className="home-partnership-copy-block">
                <h3>{displayName}</h3>
                <p>{displayTagline}</p>
            </div>
        </article>
    );
}

export default function ClientMarquee({ theme = "light", clients: initialClients }: ClientMarqueeProps) {
    const cachedClients = getCachedWordPressClients();
    const [clients, setClients] = useState<MarqueeClient[]>(() => {
        if (initialClients?.length) return initialClients;
        if (cachedClients?.length) return cachedClients as MarqueeClient[];
        return [];
    });
    const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(() => {
        if (initialClients?.length) return "ready";
        if (cachedClients?.length) return "ready";
        return "loading";
    });
    const clientRefreshInProgressRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        async function loadWordPressClients({ forceFresh = false } = {}) {
            if (!isWordPressConfiguredForPages()) {
                if (!cancelled) {
                    setStatus(initialClients?.length ? "ready" : "empty");
                }
                return;
            }

            if (clientRefreshInProgressRef.current) return;
            clientRefreshInProgressRef.current = true;

            try {
                const wpClients = await getWordPressClients({ perPage: 100, skipCache: forceFresh });

                if (cancelled) return;

                if (Array.isArray(wpClients) && wpClients.length > 0) {
                    setClients(wpClients as MarqueeClient[]);
                    setStatus("ready");
                    return;
                }

                loadWordPressClients({ forceFresh: false });
                setStatus("empty");
            } catch {
                if (!cancelled) {
                    setClients(initialClients?.length ? initialClients : []);
                    setStatus(initialClients?.length ? "ready" : "error");
                }
            } finally {
                clientRefreshInProgressRef.current = false;
            }
        }

        loadWordPressClients({ forceFresh: false });

        const onFocus = () => loadWordPressClients({ forceFresh: true });
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadWordPressClients({ forceFresh: true });
            }
        };

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                loadWordPressClients({ forceFresh: true });
            }
        }, 20000);

        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [initialClients]);

    const displayClients = useMemo(() => clients.slice(0, 12), [clients]);
    const midpoint = useMemo(() => Math.max(1, Math.ceil(displayClients.length / 2)), [displayClients.length]);
    const rowOneClients = useMemo(() => duplicateForMarquee(displayClients.slice(0, midpoint)), [displayClients, midpoint]);
    const rowTwoBaseClients = useMemo(() => {
        const remainder = displayClients.slice(midpoint);
        const source = remainder.length > 0 ? remainder : displayClients;
        return [...source].reverse();
    }, [displayClients, midpoint]);
    const rowTwoClients = useMemo(() => duplicateForMarquee(rowTwoBaseClients), [rowTwoBaseClients]);

    if (status === "loading" && displayClients.length === 0) {
        return (
            <div className="home-partnership-marquee-viewport" aria-label="Memuat daftar partner">
                <div className="home-partnership-marquee-row home-partnership-marquee-row--left">
                    <div className="home-partnership-marquee-track">
                        {Array.from({ length: 6 }, (_, index) => (
                            <div key={`client-skeleton-top-${index}`} className="home-partnership-marquee-item">
                                <ClientLogoSkeleton />
                            </div>
                        ))}
                        {Array.from({ length: 6 }, (_, index) => (
                            <div key={`client-skeleton-top-repeat-${index}`} className="home-partnership-marquee-item">
                                <ClientLogoSkeleton />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="home-partnership-marquee-row home-partnership-marquee-row--right">
                    <div className="home-partnership-marquee-track">
                        {Array.from({ length: 6 }, (_, index) => (
                            <div key={`client-skeleton-bottom-${index}`} className="home-partnership-marquee-item">
                                <ClientLogoSkeleton />
                            </div>
                        ))}
                        {Array.from({ length: 6 }, (_, index) => (
                            <div key={`client-skeleton-bottom-repeat-${index}`} className="home-partnership-marquee-item">
                                <ClientLogoSkeleton />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if ((status === "empty" || status === "error") && displayClients.length === 0) {
        return (
            <div className="home-partnership-grid" aria-label="Daftar partner belum tersedia">
                <article className="home-partnership-card" style={{ gridColumn: "1 / -1", minHeight: "unset" }}>
                    <div className="home-partnership-copy-block">
                        <h3>{status === "error" ? "Partner belum bisa dimuat" : "Belum ada partner yang tampil"}</h3>
                        <p>
                            {status === "error"
                                ? "Coba muat ulang halaman setelah data WordPress tersedia."
                                : "Silakan isi post type client di WordPress agar logo partner tampil di sini."}
                        </p>
                    </div>
                </article>
            </div>
        );
    }

    return (
        <div className="home-partnership-marquee-viewport" aria-label="Daftar partner layanan Trimitra">
            <div className="home-partnership-marquee-row home-partnership-marquee-row--left">
                <div className="home-partnership-marquee-track">
                    {rowOneClients.map((client, index) => (
                        <div key={`row-one-${client.id || client.name}-${index}`} className="home-partnership-marquee-item">
                            <ClientMarqueeCard client={client} isLight={theme === "light"} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="home-partnership-marquee-row home-partnership-marquee-row--right">
                <div className="home-partnership-marquee-track">
                    {rowTwoClients.map((client, index) => (
                        <div key={`row-two-${client.id || client.name}-${index}`} className="home-partnership-marquee-item">
                            <ClientMarqueeCard client={client} isLight={theme === "light"} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
