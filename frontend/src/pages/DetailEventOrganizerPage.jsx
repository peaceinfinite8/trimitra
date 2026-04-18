import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { eventData } from '../data/layananData'
import { useCountUp } from '../hooks/useCountUp'
import { getWordPressGalleryMedia, isWordPressConfiguredForPages } from '../data/wordpressPages'

const WHATSAPP_URL = `https://wa.me/6281234567890?text=${encodeURIComponent(eventData.cta.whatsapp)}`
const MARQUEE_TEXT = 'EVENT ORGANIZER ● VENUE MANAGEMENT ● KONSEP KREATIF ● ON-SITE EXECUTION ● DOKUMENTASI PROFESIONAL ● TRIMITRA EVENTS ●'
const EVENT_STATS = [
    { value: '250+', label: 'Event Sukses' },
    { value: '96%', label: 'Tingkat Kepuasan Klien' },
    { value: '17+', label: 'Kota' },
    { value: '8+', label: 'Tahun' },
]

function CountValue({ value }) {
    const { ref, count } = useCountUp(value)
    return <span ref={ref}>{count}</span>
}

function WordHeading({ text, className }) {
    const headingLines = [
        { key: 'line-0', delay: 0.3, content: 'Event yang ' },
        { key: 'line-1', delay: 0.42, content: (<span style={{ fontWeight: 800 }}>Dikenang,</span>) },
        { key: 'line-2', delay: 0.54, content: 'Bukan Sekadar Dihadiri' },
    ]

    return (
        <h2 className={className}>
            {headingLines.map((line) => (
                <motion.span
                    key={line.key}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: line.delay, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                    {line.content}
                </motion.span>
            ))}
        </h2>
    )
}

function DetailEventOrganizerPage() {
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
        const matched = galleryItems.find((item) => item?.category === 'Event' && item?.src)
        return matched?.src || eventData.hero.image
    }, [galleryItems])

    return (
        <main className="meo-panel">
            <style>{`
        .meo-panel{width:100%;min-height:100vh;background:#060d1a;position:relative;font-family:'Inter',system-ui,-apple-system,sans-serif;}
        .meo-close{position:fixed;top:24px;right:24px;z-index:999;width:44px;height:44px;border-radius:100px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.4);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);color:#fff;display:grid;place-items:center;cursor:pointer;transition:transform .2s ease,background .2s ease}
        .meo-close:hover{transform:scale(1.1);background:rgba(0,0,0,.6)}
        
        .meo-hero{position:relative;min-height:90vh;padding:120px 8% 80px;background:linear-gradient(135deg, #0a6e82 0%, #071320 100%);display:grid;align-items:center;overflow:hidden;}
        .meo-hero::before{content:"";position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");opacity:0.04;pointer-events:none;z-index:1;}
        .meo-grid{position:relative;z-index:2;display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center;}
        .meo-pill{margin:0;width:fit-content;padding:8px 16px;border-radius:100px;border:0.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#fff;font:600 12px/1 'Inter',sans-serif;letter-spacing:.08em}
        .meo-heading{margin:24px 0 16px;color:#fff;font:800 clamp(38px,4.8vw,68px)/1.2 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.02em}
        .meo-heading span{display:inline-block}
        .meo-sub{margin:0;color:#94a3b8;font:500 clamp(15px,1.5vw,20px)/1.5 'Inter',sans-serif;max-width:580px;}
        .meo-desc{margin:12px 0 0;color:#94a3b8;font:400 16px/1.7 'Inter',sans-serif;max-width:580px;}
        .meo-stats{display:grid;grid-template-columns:repeat(4,1fr);margin-top:40px;margin-bottom:40px;}
        .meo-stat{padding:0 24px;border-right:0.5px solid rgba(255,255,255,.1);}
        .meo-stat:first-child{padding-left:0;}
        .meo-stat:last-child{border-right:none;}
        .meo-stat h4{margin:0;color:#fff;font:800 32px/1 'Plus Jakarta Sans',sans-serif}
        .meo-stat p{margin:8px 0 0;color:#64748b;font:500 13px/1.4 'Inter',sans-serif}
        .meo-actions{display:flex;gap:12px;flex-wrap:wrap}
        .meo-btn{display:inline-flex;align-items:center;justify-content:center;padding:14px 28px;border-radius:100px;text-decoration:none;font:600 13px/1 'Inter',sans-serif;letter-spacing:.04em;transition:all 0.2s ease;}
        .meo-btn.sky{background:#38bdf8;color:#0a1628;border:none;}
        .meo-btn.sky:hover{background:#0ea5e9;transform:scale(1.02);}
        .meo-btn.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.2)}
        .meo-btn.ghost:hover{background:rgba(255,255,255,.05);transform:scale(1.02)}
        .meo-media{position:relative;border-radius:20px;overflow:hidden;aspect-ratio:16/10;min-height:0;max-height:460px;transition:transform 0.3s ease;}
        .meo-media:hover{transform:scale(1.02);}
        .meo-media img{width:100%;height:100%;object-fit:cover;display:block}
        .meo-float{position:absolute;top:20px;right:20px;padding:10px 16px;border-radius:100px;background:rgba(10,22,40,.6);border:0.5px solid rgba(255,255,255,.15);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;font:600 12px/1 'Inter',sans-serif;letter-spacing:.04em;}
        
        .meo-marquee{height:52px;background:linear-gradient(90deg, #3b4fd8 0%, #7c3aed 100%);border-top:0.5px solid rgba(255,255,255,.12);border-bottom:0.5px solid rgba(255,255,255,.12);overflow:hidden;display:flex;align-items:center}
        .meo-marquee-track{white-space:nowrap;display:flex;animation:meoMarquee 30s linear infinite;color:#fff;font:500 13px/1 'Inter',sans-serif;letter-spacing:.05em}
        .meo-marquee-track span{padding-right:60px;color:rgba(255,255,255,.4);}
        
        .meo-dark{background:linear-gradient(180deg, #071320 0%, #0a1a2e 100%);padding:120px 8%;}
        .meo-kicker{margin:0;color:rgba(56,189,248,.6);font:600 11px/1 'Inter',sans-serif;letter-spacing:.12em;text-transform:uppercase}
        .meo-title{margin:12px 0 0;color:#fff;font:800 clamp(32px,4.5vw,56px)/1.1 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.02em}
        .meo-grid3{margin-top:40px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
        .meo-card{background:rgba(255,255,255,.04);border:0.5px solid rgba(56,189,248,.1);border-radius:16px;padding:28px;transition:all .2s ease}
        .meo-card:hover{background:rgba(56,189,248,.06);border-color:rgba(56,189,248,.3);transform:scale(1.01);}
        .meo-card span{color:rgba(56,189,248,.5);font:500 12px/1 'ui-monospace',SFMono-Regular,Menlo,Monaco,Consolas,monospace}
        .meo-card h4{margin:16px 0 12px;color:#fff;font:700 16px/1.4 'Plus Jakarta Sans',sans-serif;}
        .meo-card p{margin:0;color:#7a9bb5;font:400 14px/1.7 'Inter',sans-serif}
        
        .meo-light{background:linear-gradient(180deg, #e8f4f8 0%, #f0f7fc 100%);padding:120px 8%}
        .meo-light .meo-kicker{color:#0a7a8f;}
        .meo-light .meo-title{color:#0a1628;}
        .meo-connector{width:100%;height:56px;margin-top:48px;}
        .meo-steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}
        .meo-step{text-align:center;padding:12px}
        .meo-dot{width:44px;height:44px;border-radius:100px;margin:0 auto 16px;background:linear-gradient(135deg, #e0f2fe, #ede9fe);border:0.5px solid #bae6fd;color:#0a7a8f;display:grid;place-items:center;font:700 14px/1 'ui-monospace',SFMono-Regular,Menlo,monospace;}
        .meo-step h5{margin:0 0 10px;color:#0f172a;font:700 14px/1.4 'Plus Jakarta Sans',sans-serif;}
        .meo-step p{margin:0;color:#64748b;font:400 13px/1.6 'Inter',sans-serif}
        
        .meo-achieve{background:linear-gradient(180deg, #071320 0%, #0f1f38 100%);padding:120px 8%;position:relative;overflow:hidden;}
        .meo-achieve::before{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60vw;height:60vw;background:radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 60%);pointer-events:none;}
        .meo-achieve-inner{position:relative;z-index:2;}
        .meo-achieve-grid{margin-top:48px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));}
        .meo-achieve-card{text-align:center;border-right:0.5px solid rgba(56,189,248,.15);padding:16px 0;}
        .meo-achieve-card:last-child{border-right:none;}
        .meo-achieve-card h4{margin:0;color:#fff;font:800 clamp(52px,6vw,72px)/1 'Plus Jakarta Sans',sans-serif}
        .meo-achieve-card p{margin:12px 0 0;color:#7a9bb5;font:500 13px/1.35 'Inter',sans-serif;text-transform:uppercase;letter-spacing:0.04em}
        
        .meo-cta{background:linear-gradient(180deg, #0a1628 0%, #071022 100%);padding:120px 8%;position:relative;overflow:hidden;}
        .meo-cta::before{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60vw;height:60vw;background:radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 60%);pointer-events:none;}
        .meo-cta-inner{position:relative;z-index:1;max-width:640px;margin:0 auto;text-align:center;display:grid;gap:16px;}
        .meo-cta h3{margin:0;color:#fff;font:800 clamp(32px,4.4vw,44px)/1.2 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.02em;}
        .meo-cta p{margin:0 auto;color:#7a9bb5;font:400 16px/1.7 'Inter',sans-serif;max-width:480px;}
        .meo-cta-actions{display:flex;gap:12px;justify-content:center;margin-top:16px;flex-wrap:wrap;}
        
        @keyframes meoMarquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @media (max-width:1023px){
            .meo-hero,.meo-dark,.meo-light,.meo-achieve,.meo-cta{padding:80px 6%}
            .meo-media{max-height:380px}
            .meo-achieve-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important;}
            .meo-achieve-card{border-right:none !important;border-bottom:0.5px solid rgba(56,189,248,.15) !important;}
            .meo-achieve-card:nth-child(3),.meo-achieve-card:nth-child(4){border-bottom:none !important;}
            .meo-stats{grid-template-columns:repeat(2,1fr) !important;row-gap:24px;}
            .meo-stat{border-right:none !important;padding:0 !important;}
        }
        @media (max-width:768px){
          .meo-close{top:16px;right:16px;width:40px;height:40px;}
          .meo-hero{padding:100px 24px 60px;}
          .meo-grid{grid-template-columns:1fr;gap:40px;}
          .meo-media{order:-1;aspect-ratio:16/10;min-height:0;max-height:260px;}
          .meo-media img{height:100%;}
          .meo-dark,.meo-light,.meo-achieve,.meo-cta{padding:64px 24px;}
          .meo-grid3{grid-template-columns:1fr;}
          .meo-connector{display:none;}
          .meo-steps{grid-template-columns:1fr;gap:32px;}
        }
      `}</style>

            <Link to="/layanan" className="meo-close" aria-label="Kembali ke Layanan">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z" /></svg>
            </Link>

            <section className="meo-hero">
                <div className="meo-grid">
                    <div>
                        <motion.p className="meo-pill" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>EVENT ORGANIZER</motion.p>
                        <WordHeading text={eventData.hero.heading} className="meo-heading" />
                        <motion.p className="meo-sub" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>{eventData.hero.subheading}</motion.p>
                        <motion.p className="meo-desc" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>{eventData.hero.description}</motion.p>

                        <div className="meo-stats">
                            {eventData.hero.stats.map((stat, index) => (
                                <motion.article key={stat.label} className="meo-stat" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.65 + index * 0.08 }}>
                                    <h4>{stat.value}</h4>
                                    <p>{stat.label}</p>
                                </motion.article>
                            ))}
                        </div>

                        <motion.div className="meo-actions" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.85 }}>
                            <Link to="/kontak-kami" className="meo-btn sky">KONSULTASI EVENT</Link>
                            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="meo-btn ghost">HUBUNGI WHATSAPP</a>
                        </motion.div>
                    </div>

                    <motion.div className="meo-media" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <img src={heroImage} alt={eventData.hero.heading} loading="lazy" />
                        <span className="meo-float">250+ EVENT SUKSES</span>
                    </motion.div>
                </div>
            </section>

            <section className="meo-marquee" aria-label="Marquee event">
                <div className="meo-marquee-track">
                    <span>{MARQUEE_TEXT}</span>
                    <span>{MARQUEE_TEXT}</span>
                </div>
            </section>

            <section className="meo-dark">
                <motion.p className="meo-kicker" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>KENAPA TRIMITRA EVENT</motion.p>
                <motion.h3 className="meo-title" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>Setiap Detail Dipikirkan, Setiap Momen Dirancang</motion.h3>
                <div className="meo-grid3">
                    {eventData.keunggulan.map((item, index) => (
                        <motion.article key={item.nomor} className="meo-card" initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08 }}>
                            <span>{item.nomor}</span>
                            <h4>{item.judul}</h4>
                            <p>{item.deskripsi}</p>
                        </motion.article>
                    ))}
                </div>
            </section>

            <section className="meo-light">
                <motion.p className="meo-kicker" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>CARA KERJA</motion.p>
                <motion.h3 className="meo-title" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>Lima Fase Menuju Event yang Sempurna</motion.h3>
                <motion.svg className="meo-connector" viewBox="0 0 1000 56" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="meo-grad-line" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(10,122,143,0.15)" />
                            <stop offset="100%" stopColor="rgba(79,70,229,0.2)" />
                        </linearGradient>
                    </defs>
                    <motion.path d="M40 28 H960" stroke="url(#meo-grad-line)" strokeWidth="2" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
                </motion.svg>
                <div className="meo-steps">
                    {eventData.alurKerja.map((step, index) => (
                        <motion.article key={step.step} className="meo-step" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08 }}>
                            <div className="meo-dot">{step.step}</div>
                            <h5>{step.judul}</h5>
                            <p>{step.deskripsi}</p>
                        </motion.article>
                    ))}
                </div>
            </section>

            <section className="meo-achieve">
                <div className="meo-achieve-inner">
                    <motion.p className="meo-kicker" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>PENCAPAIAN</motion.p>
                    <motion.h3 className="meo-title" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>Angka yang Membuktikan Standar Kami</motion.h3>
                    <div className="meo-achieve-grid">
                        {EVENT_STATS.map((stat) => (
                            <motion.article key={stat.label} className="meo-achieve-card" whileInView={{ opacity: [0, 1], y: [24, 0] }} viewport={{ once: true, amount: 0.2 }}>
                                <h4><CountValue value={stat.value} /></h4>
                                <p>{stat.label}</p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="meo-cta">
                <motion.div className="meo-cta-inner" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>
                    <motion.h3 variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>{eventData.cta.heading}</motion.h3>
                    <motion.p variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>{eventData.cta.subtext}</motion.p>
                    <motion.div className="meo-cta-actions" variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                        <Link to="/kontak-kami" className="meo-btn sky">DISKUSIKAN EVENT ANDA</Link>
                        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="meo-btn ghost">CHAT WHATSAPP</a>
                    </motion.div>
                </motion.div>
            </section>
        </main >
    )
}

export default DetailEventOrganizerPage

