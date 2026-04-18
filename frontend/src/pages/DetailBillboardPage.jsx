import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { billboardData } from '../data/layananData'
import { useCountUp } from '../hooks/useCountUp'
import { getWordPressGalleryMedia, isWordPressConfiguredForPages } from '../data/wordpressPages'

const WHATSAPP_URL = `https://wa.me/6281234567890?text=${encodeURIComponent(billboardData.cta.whatsapp)}`
const MARQUEE_TEXT = 'ADVERTISING BILLBOARD | 150+ LOKASI STRATEGIS | 40+ KOTA | PRODUKSI PREMIUM | ON-TIME DELIVERY | TRIMITRA BILLBOARD | '
const REACH_STATS = [
    { value: '150+', label: 'Lokasi Billboard Aktif' },
    { value: '40+', label: 'Kota Terjangkau' },
    { value: '8+', label: 'Tahun Pengalaman' },
    { value: '98%', label: 'On-Time Delivery' },
]

function CountValue({ value }) {
    const { ref, count } = useCountUp(value)
    return <span ref={ref}>{count}</span>
}

function WordHeading({ text, className, baseDelay = 0.3 }) {
    const headingLines = [
        {
            key: 'line-0',
            delay: 0.3,
            content: (
                <>
                    <span style={{ color: '#0071e3' }}>Billboard</span>
                    {' yang'}
                </>
            ),
        },
        {
            key: 'line-1',
            delay: 0.42,
            content: 'Bicara Lebih',
        },
        {
            key: 'line-2',
            delay: 0.54,
            content: 'Keras dari Kata',
        },
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

function DetailBillboardPage() {
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
        const matched = galleryItems.find((item) => item?.category === 'Billboard' && item?.src)
        return matched?.src || billboardData.hero.image
    }, [galleryItems])

    return (
        <main className="mbb-panel">
            <style>{`
        .mbb-panel{width:100%;min-height:100vh;background:linear-gradient(180deg,#f3f8ff 0%,#eef5ff 42%,#f7faff 100%);position:relative;font-family:'Inter',system-ui,-apple-system,sans-serif;color:#0f2746;}
        .mbb-close{position:fixed;top:24px;right:24px;z-index:999;width:44px;height:44px;border-radius:100px;border:1px solid rgba(27,97,171,.2);background:rgba(255,255,255,.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 8px 24px rgba(13,39,74,.12);color:#0e3563;display:grid;place-items:center;cursor:pointer;transition:transform .2s ease,background .2s ease,border-color .2s ease}
        .mbb-close:hover{transform:scale(1.08);background:#fff;border-color:rgba(27,97,171,.38)}
        .mbb-sec{position:relative}
        .mbb-hero{min-height:90vh;padding:120px 8% 80px;background:radial-gradient(1200px 520px at 8% 6%,rgba(97,175,255,.2) 0%,rgba(97,175,255,0) 58%),radial-gradient(880px 460px at 100% 4%,rgba(52,130,226,.22) 0%,rgba(52,130,226,0) 65%),linear-gradient(160deg,#f1f7ff 0%,#dfedff 52%,#f5f9ff 100%);display:grid;align-items:center}
        .mbb-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center}
        .mbb-pill{margin:0;width:fit-content;padding:8px 16px;border-radius:100px;border:1px solid rgba(27,97,171,.22);background:rgba(255,255,255,.64);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#15457c;font:600 12px/1 'Inter',sans-serif;letter-spacing:.08em}
        .mbb-heading{margin:24px 0 16px;color:#0f2746;font:800 clamp(38px,4.8vw,68px)/1.1 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.02em}
        .mbb-heading span{display:inline-block}
        .mbb-sub{margin:0;color:#21558f;font:500 clamp(16px,1.5vw,22px)/1.5 'Inter',sans-serif}
        .mbb-desc{margin:12px 0 0;color:rgba(15,39,70,.76);font:400 16px/1.75 'Inter',sans-serif;max-width:600px}
        .mbb-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:40px;margin-bottom:40px;}
        .mbb-stat{border-radius:16px;padding:20px;background:rgba(255,255,255,.9);border:1px solid rgba(24,93,164,.14);box-shadow:0 10px 24px rgba(20,69,124,.08);transition:all 0.2s ease;}
        .mbb-stat:hover{background:#fff;transform:translateY(-2px);box-shadow:0 14px 30px rgba(20,69,124,.14)}
        .mbb-stat h4{margin:0;color:#0071e3;font:800 36px/1 'Plus Jakarta Sans',sans-serif}
        .mbb-stat p{margin:8px 0 0;color:rgba(15,39,70,.62);font:500 13px/1.4 'Inter',sans-serif}
        .mbb-actions{display:flex;gap:12px;flex-wrap:wrap}
        .mbb-btn{display:inline-flex;align-items:center;justify-content:center;padding:14px 28px;border-radius:100px;text-decoration:none;font:600 13px/1 'Inter',sans-serif;letter-spacing:.04em;border:1px solid transparent;transition:all 0.2s ease;}
        .mbb-btn.sky{background:#0071e3;color:#fff;box-shadow:0 4px 14px rgba(0,113,227,.3)}
        .mbb-btn.sky:hover{background:#0077ec;transform:scale(1.02);box-shadow:0 6px 20px rgba(0,113,227,.4)}
        .mbb-btn.ghost{background:rgba(255,255,255,.74);color:#13457d;border-color:rgba(19,69,125,.2)}
        .mbb-btn.ghost:hover{background:#fff;transform:scale(1.02)}
        .mbb-media{position:relative;border-radius:24px;overflow:hidden;min-height:560px;box-shadow:0 24px 48px rgba(15,39,70,.22)}
        .mbb-media img{width:100%;height:100%;object-fit:cover;display:block}
        .mbb-float{position:absolute;top:20px;right:20px;padding:10px 16px;border-radius:100px;background:rgba(255,255,255,.86);border:1px solid rgba(21,69,125,.18);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);color:#104074;font:600 12px/1 'Inter',sans-serif;letter-spacing:.04em;box-shadow:0 8px 24px rgba(15,39,70,.16)}
        .mbb-marquee{height:52px;background:linear-gradient(90deg,#d9ebff 0%,#cbe2ff 50%,#deeeff 100%);border-top:1px solid rgba(21,69,125,.12);border-bottom:1px solid rgba(21,69,125,.12);overflow:hidden;display:flex;align-items:center}
        .mbb-marquee-track{white-space:nowrap;display:flex;animation:mbbMarquee 30s linear infinite;color:rgba(16,64,116,.62);font:600 12px/1 'Inter',sans-serif;letter-spacing:.08em}
        .mbb-marquee-track span{padding-right:60px}
        .mbb-light{background:#f8fbff;padding:120px 8%}
        .mbb-kicker{margin:0;color:rgba(15,39,70,.52);font:600 11px/1 'Inter',sans-serif;letter-spacing:.14em;text-transform:uppercase}
        .mbb-title{margin:12px 0 0;color:#0f2746;font:800 clamp(32px,4.5vw,56px)/1.1 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.02em}
        .mbb-grid3{margin-top:40px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
        .mbb-card{background:#fff;border:1px solid #d9e8f7;border-radius:16px;padding:32px;transition:all .2s ease;box-shadow:0 8px 24px rgba(15,39,70,.05)}
        .mbb-card:hover{transform:scale(1.01);border-color:#bed7f0;box-shadow:0 14px 30px rgba(15,39,70,.1)}
        .mbb-card span{color:#0071e3;font:500 13px/1 'ui-monospace',SFMono-Regular,Menlo,Monaco,Consolas,monospace}
        .mbb-card h4{margin:16px 0 12px;color:#10325b;font:700 18px/1.4 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.01em}
        .mbb-card p{margin:0;color:rgba(15,39,70,.64);font:400 15px/1.65 'Inter',sans-serif}
        .mbb-flow{background:linear-gradient(180deg,#eef6ff 0%,#f7fbff 100%);padding:120px 8%;position:relative;}
        .mbb-flow .mbb-kicker{color:rgba(15,39,70,.52)}
        .mbb-flow .mbb-title{color:#0f2746}
        .mbb-flow-wrap{margin-top:48px;position:relative}
        .mbb-connector{width:100%;height:56px}
        .mbb-steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}
        .mbb-step{text-align:center;padding:12px}
        .mbb-step-dot{width:48px;height:48px;border-radius:100px;margin:0 auto 16px;background:#fff;box-shadow:0 8px 24px rgba(15,39,70,.08);border:1px solid rgba(16,64,116,.12);color:#0ea5e9;display:grid;place-items:center;font:700 15px/1 'Inter',sans-serif;transition:all .2s ease;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
        .mbb-step:hover .mbb-step-dot{background:#0071e3;border-color:#0071e3;color:#fff;transform:scale(1.05);box-shadow:0 12px 32px rgba(0,113,227,.25)}
        .mbb-step h5{margin:0 0 10px;color:#10325b;font:700 16px/1.4 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.01em}
        .mbb-step p{margin:0;color:rgba(15,39,70,.62);font:400 14px/1.55 'Inter',sans-serif}
        .mbb-reach{background:#ffffff;padding:120px 8%;border-top:1px solid #e7f0fb}
        .mbb-reach-grid{margin-top:40px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
        .mbb-reach-card{text-align:center;border-right:1px solid #e7f0fb;padding:20px 0}
        .mbb-reach-card:last-child{border-right:none}
        .mbb-reach-card h4{margin:0;color:#0f2746;font:800 clamp(48px,5.5vw,72px)/1 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.02em}
        .mbb-reach-card p{margin:12px 0 0;color:rgba(15,39,70,.6);font:500 14px/1.4 'Inter',sans-serif;text-transform:uppercase;letter-spacing:0.04em}
        .mbb-cta{background:linear-gradient(140deg,#1c548f 0%,#2f6eb2 45%,#5f93cc 100%);padding:120px 8%;position:relative;overflow:hidden;display:grid;place-items:center;}
        .mbb-cta::before{content:'';position:absolute;width:42vw;height:42vw;border-radius:50%;background:#9bc8ff;filter:blur(86px);opacity:0.26;pointer-events:none;z-index:0;}
        .mbb-cta-inner{position:relative;z-index:1;max-width:700px;margin:0 auto;text-align:center;display:grid;gap:20px;padding:64px 40px;border-radius:32px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.25);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 24px 64px rgba(8,32,66,.24)}
        .mbb-cta h3{margin:0;color:#fff;font:800 clamp(32px,4.5vw,48px)/1.1 'Plus Jakarta Sans',sans-serif;letter-spacing:-0.02em}
        .mbb-cta p{margin:0;color:rgba(255,255,255,.9);font:400 18px/1.6 'Inter',sans-serif}
        .mbb-cta .mbb-btn.navy{background:#0071e3;color:#fff;box-shadow:0 4px 14px rgba(0,113,227,.3)}
        .mbb-cta .mbb-btn.navy:hover{background:#0077ec;transform:scale(1.02)}
        .mbb-cta .mbb-btn.outline{background:rgba(255,255,255,.14);color:#fff;border-color:rgba(255,255,255,.32)}
        .mbb-cta .mbb-btn.outline:hover{background:rgba(255,255,255,.22);transform:scale(1.02)}
        @keyframes mbbMarquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @media (max-width:1023px){
            .mbb-hero,.mbb-light,.mbb-flow,.mbb-reach,.mbb-cta{padding:80px 6%}
            .mbb-reach-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
            .mbb-reach-card{border-right:none;border-bottom:1px solid #e7f0fb;padding:32px 0}
            .mbb-reach-card:nth-child(3),.mbb-reach-card:nth-child(4){border-bottom:none}
            .mbb-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
        }
        @media (max-width:768px){
          .mbb-close{top:16px;right:16px;width:40px;height:40px}
          .mbb-hero{padding:100px 24px 60px}
          .mbb-hero-grid{grid-template-columns:1fr;gap:40px}
          .mbb-media{order:-1;min-height:300px;border-radius:20px}
          .mbb-media img{height:300px}
          .mbb-light,.mbb-flow,.mbb-reach,.mbb-cta{padding:64px 24px}
          .mbb-grid3{grid-template-columns:1fr;gap:16px}
          .mbb-connector{display:none}
          .mbb-steps{grid-template-columns:1fr;gap:32px}
          .mbb-reach-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:0}
          .mbb-cta-inner{padding:48px 24px;border-radius:24px}
        }
      `}</style>

            <Link to="/layanan" className="mbb-close" aria-label="Kembali ke Layanan">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z" /></svg>
            </Link>

            <section className="mbb-sec mbb-hero">
                <div className="mbb-hero-grid">
                    <div>
                        <motion.p className="mbb-pill" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>ADVERTISING BILLBOARD</motion.p>
                        <WordHeading text={billboardData.hero.heading} className="mbb-heading" baseDelay={0.3} />
                        <motion.p className="mbb-sub" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>{billboardData.hero.subheading}</motion.p>
                        <motion.p className="mbb-desc" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>{billboardData.hero.description}</motion.p>

                        <div className="mbb-stats">
                            {billboardData.hero.stats.map((stat, index) => (
                                <motion.article
                                    key={stat.label}
                                    className="mbb-stat"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.65 + index * 0.08 }}
                                >
                                    <h4>{stat.value}</h4>
                                    <p>{stat.label}</p>
                                </motion.article>
                            ))}
                        </div>

                        <motion.div className="mbb-actions" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.85 }}>
                            <Link to="/kontak-kami" className="mbb-btn sky">KONSULTASI SEKARANG</Link>
                            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mbb-btn ghost">HUBUNGI WHATSAPP</a>
                        </motion.div>
                    </div>

                    <motion.div className="mbb-media" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <img src={heroImage} alt={billboardData.hero.heading} loading="lazy" />
                        <span className="mbb-float">150+ LOKASI AKTIF</span>
                    </motion.div>
                </div>
            </section>

            <section className="mbb-sec mbb-marquee" aria-label="Marquee billboard">
                <div className="mbb-marquee-track">
                    <span>{MARQUEE_TEXT}</span>
                    <span>{MARQUEE_TEXT}</span>
                </div>
            </section>

            <section className="mbb-sec mbb-light">
                <motion.p className="mbb-kicker" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>KENAPA TRIMITRA BILLBOARD</motion.p>
                <motion.h3 className="mbb-title" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>Kami Tidak Sekadar Pasang - Kami Pastikan Hasilnya</motion.h3>
                <div className="mbb-grid3">
                    {billboardData.keunggulan.map((item, index) => (
                        <motion.article
                            key={item.nomor}
                            className="mbb-card"
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <span>{item.nomor}</span>
                            <h4>{item.judul}</h4>
                            <p>{item.deskripsi}</p>
                        </motion.article>
                    ))}
                </div>
            </section>

            <section className="mbb-sec mbb-flow">
                <motion.p className="mbb-kicker" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>CARA KERJA</motion.p>
                <motion.h3 className="mbb-title" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>Dari Brief ke Billboard dalam 5 Langkah</motion.h3>
                <div className="mbb-flow-wrap">
                    <motion.svg className="mbb-connector" viewBox="0 0 1000 56" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="grad-line" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(14,165,233,0.0)" />
                                <stop offset="50%" stopColor="rgba(14,165,233,0.25)" />
                                <stop offset="100%" stopColor="rgba(14,165,233,0.0)" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d="M40 28 H960"
                            stroke="url(#grad-line)"
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </motion.svg>
                    <div className="mbb-steps">
                        {billboardData.alurKerja.map((step, index) => (
                            <motion.article
                                key={step.step}
                                className="mbb-step"
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: index * 0.08 }}
                            >
                                <div className="mbb-step-dot">{step.step}</div>
                                <h5>{step.judul}</h5>
                                <p>{step.deskripsi}</p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mbb-sec mbb-reach">
                <motion.p className="mbb-kicker" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>JANGKAUAN KAMI</motion.p>
                <motion.h3 className="mbb-title" whileInView={{ opacity: [0, 1], y: [20, 0] }} viewport={{ once: true, amount: 0.2 }}>Hadir di 40+ Kota Seluruh Indonesia</motion.h3>
                <div className="mbb-reach-grid">
                    {REACH_STATS.map((stat) => (
                        <motion.article key={stat.label} className="mbb-reach-card" whileInView={{ opacity: [0, 1], y: [24, 0] }} viewport={{ once: true, amount: 0.2 }}>
                            <h4><CountValue value={stat.value} /></h4>
                            <p>{stat.label}</p>
                        </motion.article>
                    ))}
                </div>
            </section>

            <section className="mbb-sec mbb-cta">
                <motion.div className="mbb-cta-inner" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>
                    <motion.h3 variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>{billboardData.cta.heading}</motion.h3>
                    <motion.p variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>{billboardData.cta.subtext}</motion.p>
                    <motion.div className="mbb-actions" variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                        <Link to="/kontak-kami" className="mbb-btn navy">KONSULTASI SEKARANG</Link>
                        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mbb-btn outline">HUBUNGI VIA WHATSAPP</a>
                    </motion.div>
                </motion.div>
            </section>
        </main >
    )
}

export default DetailBillboardPage
