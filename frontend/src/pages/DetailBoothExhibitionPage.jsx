import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { boothData } from '../data/layananData'
import { useCountUp } from '../hooks/useCountUp'
import { getWordPressGalleryMedia, isWordPressConfiguredForPages } from '../data/wordpressPages'

const WHATSAPP_URL = `https://wa.me/6281234567890?text=${encodeURIComponent(boothData.cta.whatsapp)}`
const MARQUEE_TEXT = 'BOOTH EXHIBITION ● SPATIAL DESIGN ● MATERIAL PREMIUM ● INSTALASI PRESISI ● PAMERAN NASIONAL ● TRIMITRA BOOTH ●'
const BOOTH_STATS = [
    { value: '350+', label: 'Booth Diproduksi' },
    { value: '87%', label: 'Client Repeat' },
    { value: '24', label: 'Kota Aktif' },
    { value: '98%', label: 'On-Time' },
]

function CountValue({ value }) {
    const { ref, count } = useCountUp(value)
    return <span ref={ref}>{count}</span>
}

function WordHeading({ text, className }) {
    const headingLines = [
        { key: 'line-0', delay: 0.3, content: 'Booth yang ' },
        { key: 'line-1', delay: 0.42, content: (<span style={{ color: '#0ea5e9' }}>Magnet</span>) },
        { key: 'line-2', delay: 0.54, content: ' di Tengah Keramaian' },
    ]

    return (
        <h2 className={className}>
            {headingLines.map((line) => (
                <motion.span
                    key={line.key}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: line.delay, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    style={line.key === 'line-1' ? { fontWeight: 800 } : {}}
                >
                    {line.content}
                </motion.span>
            ))}
        </h2>
    )
}

function DetailBoothExhibitionPage() {
    const [galleryItems, setGalleryItems] = useState([])

    useEffect(() => {
        let cancelled = false

        async function loadGalleryImages() {
            if (!isWordPressConfiguredForPages()) return

            try {
                const wpGallery = await getWordPressGalleryMedia({ perPage: 100, allPages: true })
                if (!cancelled) {
                    setGalleryItems(wpGallery)
                }
            } catch {
                if (!cancelled) {
                    setGalleryItems([])
                }
            }
        }

        loadGalleryImages()

        return () => {
            cancelled = true
        }
    }, [])

    const heroImage = useMemo(() => {
        const matched = galleryItems.find((item) => item?.category === 'Booth Pameran' && item?.src)
        return matched?.src || boothData.hero.image
    }, [galleryItems])

    return (
        <main className="mbe-panel">
            <style>{`
        .mbe-panel{width:100%;min-height:100vh;background:#020617;position:relative;font-family:'Inter',system-ui,-apple-system,sans-serif;}
        .mbe-close{position:fixed;top:24px;right:24px;z-index:999;width:44px;height:44px;border-radius:100px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.4);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);color:#fff;display:grid;place-items:center;cursor:pointer;transition:transform .2s ease,background .2s ease}
        .mbe-close:hover{transform:scale(1.1);background:rgba(0,0,0,.6)}
        
        .mbe-hero{position:relative;min-height:90vh;padding:120px 8% 80px;background:linear-gradient(135deg, #0c4a6e 0%, #020617 100%);display:grid;align-items:center;overflow:hidden;}
        .mbe-hero::before{content:"";position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");opacity:0.04;pointer-events:none;z-index:1;}
        .mbe-grid{position:relative;z-index:2;display:grid;grid-template-columns:1.18fr .82fr;gap:48px;align-items:start;}
        .mbe-pill{margin:0;width:fit-content;padding:8px 16px;border-radius:100px;border:0.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#fff;font:600 12px/1 'Inter',sans-serif;letter-spacing:.08em}
        .mbe-heading{margin:24px 0 16px;color:#fff;font:800 clamp(38px,4.8vw,68px)/1.2 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.02em}
        .mbe-heading span{display:inline-block}
        .mbe-sub{margin:0;color:#e0f2fe;font:500 clamp(15px,1.5vw,20px)/1.5 'Inter',sans-serif;max-width:580px;}
        .mbe-desc{margin:12px 0 0;color:#bae6fd;font:400 16px/1.7 'Inter',sans-serif;max-width:580px;}
        
        .mbe-features{display:flex;gap:12px;flex-wrap:wrap;margin:32px 0}
        .mbe-feature{display:inline-flex;align-items:center;padding:8px 16px;background:rgba(14,165,233,.12);border:0.5px solid rgba(14,165,233,.25);color:#7dd3fc;border-radius:100px;font:500 13px/1 'Inter',sans-serif;backdrop-filter:blur(8px)}
        
        .mbe-actions{display:flex;gap:12px;flex-wrap:wrap}
        .mbe-btn{display:inline-flex;align-items:center;justify-content:center;padding:14px 28px;border-radius:100px;text-decoration:none;font:600 13px/1 'Inter',sans-serif;letter-spacing:.04em;transition:all 0.2s ease;}
        .mbe-btn.sky{background:#0ea5e9;color:#020617;border:none;}
        .mbe-btn.sky:hover{background:#38bdf8;transform:scale(1.02);}
        .mbe-btn.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.2)}
        .mbe-btn.ghost:hover{background:rgba(255,255,255,.05);transform:scale(1.02)}
        
        .mbe-media{position:relative;justify-self:end;width:min(100%,430px);border-radius:20px;overflow:hidden;aspect-ratio:4/3;min-height:0;max-height:380px;transition:transform 0.3s ease;box-shadow:0 24px 64px rgba(0,0,0,.4)}
        .mbe-media:hover{transform:scale(1.02);}
        .mbe-media img{width:100%;height:100%;object-fit:cover;display:block}
        .mbe-float{position:absolute;top:20px;right:20px;padding:10px 16px;border-radius:100px;background:rgba(2,6,23,.65);border:0.5px solid rgba(255,255,255,.15);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#fff;font:600 12px/1 'Inter',sans-serif;letter-spacing:.04em;}
        
        .mbe-marquee{height:52px;background:linear-gradient(90deg, #0284c7 0%, #6366f1 100%);border-top:0.5px solid rgba(255,255,255,.12);border-bottom:0.5px solid rgba(255,255,255,.12);overflow:hidden;display:flex;align-items:center}
        .mbe-marquee-track{white-space:nowrap;display:flex;animation:mbeMarquee 30s linear infinite;color:#fff;font:500 13px/1 'Inter',sans-serif;letter-spacing:.05em}
        .mbe-marquee-track span{padding-right:60px;color:rgba(255,255,255,.8);}
        
        .mbe-light{background:linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%);padding:120px 8%;}
        .mbe-kicker{margin:0;color:#0ea5e9;font:600 11px/1 'Inter',sans-serif;letter-spacing:.12em;text-transform:uppercase}
        .mbe-title{margin:12px 0 0;color:#0f172a;font:800 clamp(32px,4.5vw,56px)/1.1 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.02em}
        .mbe-grid3{margin-top:48px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
        .mbe-card{background:#ffffff;border:0.5px solid rgba(14,165,233,.12);border-radius:20px;padding:32px;transition:all .2s ease;box-shadow:0 12px 32px rgba(14,165,233,.04)}
        .mbe-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(14,165,233,.08);border-color:rgba(14,165,233,.3)}
        .mbe-card span{color:#0ea5e9;font:500 12px/1 'ui-monospace',SFMono-Regular,Menlo,Monaco,Consolas,monospace;background:rgba(14,165,233,.08);padding:6px 12px;border-radius:100px;display:inline-block;}
        .mbe-card h4{margin:20px 0 12px;color:#0f172a;font:700 18px/1.4 'Plus Jakarta Sans',sans-serif;}
        .mbe-card p{margin:0;color:#64748b;font:400 15px/1.65 'Inter',sans-serif}
        
        .mbe-process{background:linear-gradient(180deg, #020617 0%, #0f172a 100%);padding:120px 8%;position:relative}
        .mbe-process .mbe-kicker{color:rgba(14,165,233,.6);}
        .mbe-process .mbe-title{color:#fff;}
        .mbe-timeline{position:relative;margin-top:56px;display:grid;gap:32px}
        .mbe-line{position:absolute;left:50%;top:0;transform:translateX(-50%);width:2px;height:100%;background:linear-gradient(180deg, rgba(14,165,233,.4) 0%, rgba(99,102,241,.4) 100%);}
        .mbe-item{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
        .mbe-item:nth-child(even) .mbe-content{grid-column:2}
        .mbe-item:nth-child(even) .mbe-number{grid-column:1}
        .mbe-content{background:rgba(255,255,255,.02);border:0.5px solid rgba(255,255,255,.06);border-radius:16px;padding:28px;position:relative;backdrop-filter:blur(12px)}
        .mbe-content h5{margin:0 0 10px;color:#fff;font:700 18px/1.4 'Plus Jakarta Sans',sans-serif}
        .mbe-content p{margin:0;color:#94a3b8;font:400 15px/1.6 'Inter',sans-serif}
        .mbe-number{display:grid;place-items:center;position:relative}
        .mbe-number span{font:900 clamp(64px,7vw,96px)/1 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,.03)}
        .mbe-dot{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg, #0ea5e9, #3b82f6);border:3px solid #0f172a;box-shadow:0 0 0 4px rgba(14,165,233,.15)}
        
        .mbe-stats{background:linear-gradient(180deg, #0f172a 0%, #020617 100%);padding:120px 8%;position:relative;overflow:hidden;}
        .mbe-stats::before{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:70vw;height:70vw;background:radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 60%);pointer-events:none;}
        .mbe-stats-inner{position:relative;z-index:2;}
        .mbe-stats .mbe-kicker{color:rgba(14,165,233,.6);}
        .mbe-stats .mbe-title{color:#fff;}
        .mbe-stats-grid{margin-top:56px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
        .mbe-stat{text-align:center;border-right:0.5px solid rgba(255,255,255,.08);padding:16px 0;}
        .mbe-stat:last-child{border-right:none;}
        .mbe-stat h4{margin:0;color:#fff;font:800 clamp(48px,5.5vw,72px)/1 'Plus Jakarta Sans',sans-serif}
        .mbe-stat p{margin:12px 0 0;color:#94a3b8;font:500 14px/1.4 'Inter',sans-serif;text-transform:uppercase;letter-spacing:0.04em}
        
        .mbe-cta{background:linear-gradient(180deg, #020617 0%, #09090b 100%);padding:120px 8%;position:relative;overflow:hidden;}
        .mbe-cta::before{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60vw;height:60vw;background:radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 60%);pointer-events:none;}
        .mbe-cta-inner{max-width:640px;margin:0 auto;text-align:center;display:grid;gap:16px;position:relative;z-index:2;}
        .mbe-cta h3{margin:0;color:#fff;font:800 clamp(32px,4.4vw,48px)/1.2 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.02em}
        .mbe-cta p{margin:0 auto;color:#94a3b8;font:400 16px/1.7 'Inter',sans-serif;max-width:480px;}
        .mbe-cta-actions{display:flex;gap:12px;justify-content:center;margin-top:16px;flex-wrap:wrap;}
        
        @keyframes mbeMarquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        
        @media (max-width:1023px){
            .mbe-hero,.mbe-light,.mbe-process,.mbe-stats,.mbe-cta{padding:80px 6%}
            .mbe-media{width:min(100%,380px);max-height:320px}
            .mbe-stats-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important;}
            .mbe-stat{border-right:none !important;border-bottom:0.5px solid rgba(255,255,255,.08) !important;padding:32px 0;}
            .mbe-stat:nth-child(3),.mbe-stat:nth-child(4){border-bottom:none !important;}
        }
        @media (max-width:768px){
          .mbe-close{top:16px;right:16px;width:40px;height:40px}
          .mbe-hero{padding:100px 24px 60px}
          .mbe-grid{grid-template-columns:1fr;gap:40px;}
          .mbe-media{order:-1;justify-self:stretch;width:100%;aspect-ratio:4/3;min-height:0;max-height:260px;box-shadow:0 16px 32px rgba(0,0,0,.4)}
          .mbe-media img{height:100%}
          .mbe-features{flex-direction:row;gap:8px;}
          .mbe-light,.mbe-process,.mbe-stats,.mbe-cta{padding:64px 24px}
          .mbe-grid3{grid-template-columns:1fr}
          .mbe-line{left:24px;transform:none;height:calc(100% - 64px);top:32px;}
          .mbe-item{grid-template-columns:1fr;gap:16px;}
          .mbe-item .mbe-content,.mbe-item:nth-child(even) .mbe-content{grid-column:1; margin-left:48px}
          .mbe-item .mbe-number,.mbe-item:nth-child(even) .mbe-number{position:absolute;left:16px;top:28px;}
          .mbe-number span{display:none;}
          .mbe-dot{width:16px;height:16px;transform:translate(-50%,-50%);}
        }
      `}</style>

            <Link to="/layanan" className="mbe-close" aria-label="Kembali ke Layanan">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z" /></svg>
            </Link>

            <section className="mbe-hero">
                <div className="mbe-grid">
                    <div>
                        <motion.p className="mbe-pill" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>BOOTH EXHIBITION</motion.p>
                        <WordHeading text={boothData.hero.heading} className="mbe-heading" />
                        <motion.p className="mbe-sub" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>{boothData.hero.subheading}</motion.p>
                        <motion.p className="mbe-desc" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>{boothData.hero.description}</motion.p>

                        <motion.div className="mbe-features" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.68 }}>
                            <span className="mbe-feature">✓ Spatial Storytelling</span>
                            <span className="mbe-feature">✓ Interactive Display</span>
                            <span className="mbe-feature">✓ High-Intent Flow</span>
                        </motion.div>

                        <motion.div className="mbe-actions" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.85 }}>
                            <Link to="/kontak-kami" className="mbe-btn sky">RANCANG BOOTH SAYA</Link>
                            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mbe-btn ghost">HUBUNGI WHATSAPP</a>
                        </motion.div>
                    </div>

                    <motion.div className="mbe-media" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <img src={heroImage} alt={boothData.hero.heading} loading="lazy" />
                        <span className="mbe-float">350+ BOOTH SELESAI</span>
                    </motion.div>
                </div>
            </section>

            <section className="mbe-marquee" aria-label="Marquee booth">
                <div className="mbe-marquee-track">
                    <span>{MARQUEE_TEXT}</span>
                    <span>{MARQUEE_TEXT}</span>
                </div>
            </section>

            <section className="mbe-light">
                <motion.p className="mbe-kicker" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>KEUNGGULAN BOOTH</motion.p>
                <motion.h3 className="mbe-title" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>Booth Bukan Sekadar Struktur - Ini Pengalaman</motion.h3>
                <div className="mbe-grid3">
                    {boothData.keunggulan.map((item, index) => (
                        <motion.article key={item.nomor} className="mbe-card" initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08 }}>
                            <span>{item.nomor}</span>
                            <h4>{item.judul}</h4>
                            <p>{item.deskripsi}</p>
                        </motion.article>
                    ))}
                </div>
            </section>

            <section className="mbe-process">
                <motion.p className="mbe-kicker" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>PROSES PRODUKSI</motion.p>
                <motion.h3 className="mbe-title" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>Dari Sketsa hingga Berdiri di Venue</motion.h3>
                <div className="mbe-timeline">
                    <motion.div className="mbe-line" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: 'top center' }} />
                    {boothData.alurKerja.map((step, index) => (
                        <motion.article key={step.step} className="mbe-item" initial={{ y: 24, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08 }}>
                            <div className="mbe-content">
                                <h5>{step.judul}</h5>
                                <p>{step.deskripsi}</p>
                            </div>
                            <div className="mbe-number">
                                <span>{step.step}</span>
                                <i className="mbe-dot" aria-hidden="true" />
                            </div>
                        </motion.article>
                    ))}
                </div>
            </section>

            <section className="mbe-stats">
                <div className="mbe-stats-inner">
                    <motion.p className="mbe-kicker" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>KEUNGGULAN ANGKA</motion.p>
                    <motion.h3 className="mbe-title" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>Kepercayaan Klien yang Terukur</motion.h3>
                    <div className="mbe-stats-grid">
                        {BOOTH_STATS.map((stat) => (
                            <motion.article key={stat.label} className="mbe-stat" whileInView={{ opacity: [0, 1], y: [24, 0] }} viewport={{ once: true, amount: 0.2 }}>
                                <h4><CountValue value={stat.value} /></h4>
                                <p>{stat.label}</p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mbe-cta">
                <motion.div className="mbe-cta-inner" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>
                    <motion.h3 variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>{boothData.cta.heading}</motion.h3>
                    <motion.p variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>{boothData.cta.subtext}</motion.p>
                    <motion.div className="mbe-cta-actions" variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                        <Link to="/kontak-kami" className="mbe-btn sky">KONSULTASI DESAIN GRATIS</Link>
                        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mbe-btn ghost">CHAT WHATSAPP</a>
                    </motion.div>
                </motion.div>
            </section>
        </main >
    )
}

export default DetailBoothExhibitionPage
