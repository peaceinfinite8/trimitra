import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animate, svg, stagger } from 'animejs';

const WHATSAPP_NUMBER = '62811109842';
const MAINTENANCE_WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Halo Tim Trimitra, saya melihat halaman maintenance dan ingin menghubungi tim untuk kebutuhan saya.')}`;

// Animated SVG Icon Components
const BuildingIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '76px', height: '76px' }}>
        <defs>
            <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9F5A" />
                <stop offset="100%" stopColor="#FF4D6D" />
            </linearGradient>
            <linearGradient id="shellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
        </defs>
        <g style={{ transformOrigin: '50px 50px', animation: 'iconFloat 3.2s ease-in-out infinite' }}>
            <polygon points="50,12 82,30 82,70 50,88 18,70 18,30" fill="none" stroke="url(#shellGrad)" strokeWidth="3" />
            <polygon points="50,24 70,35 70,65 50,76 30,65 30,35" fill="url(#coreGrad)" opacity="0.9" />
            <circle cx="50" cy="50" r="7" fill="#F8FAFC" style={{ animation: 'corePulse 1.8s ease-in-out infinite' }} />
            <circle cx="50" cy="50" r="22" fill="none" stroke="#FCD34D" strokeWidth="2" opacity="0.6" style={{ transformOrigin: '50px 50px', animation: 'ringSpin 6s linear infinite' }} />
        </g>
    </svg>
);

const TimerIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '50px', height: '50px' }}>
        <defs>
            <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="36" fill="none" stroke="url(#radarGrad)" strokeWidth="3" opacity="0.35" />
        <circle cx="50" cy="50" r="24" fill="none" stroke="url(#radarGrad)" strokeWidth="2" opacity="0.4" />
        <circle cx="50" cy="50" r="12" fill="none" stroke="url(#radarGrad)" strokeWidth="2" opacity="0.55" />
        <line x1="50" y1="50" x2="50" y2="14" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" style={{ transformOrigin: '50px 50px', animation: 'radarSweep 2.2s linear infinite' }} />
        <circle cx="50" cy="50" r="4" fill="#E0E7FF" />
    </svg>
);

const EmailIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '42px', height: '42px' }}>
        <defs>
            <linearGradient id="mailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7DD3FC" />
                <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
        </defs>
        <path d="M18 66 L82 50 L18 34 L26 50 Z" fill="url(#mailGrad)" style={{ transformOrigin: '50px 50px', animation: 'planeDrift 2.6s ease-in-out infinite' }} />
        <path d="M28 50 H80" stroke="#BAE6FD" strokeWidth="2.2" strokeDasharray="5 6" style={{ animation: 'dashMove 1.1s linear infinite' }} />
    </svg>
);

const WhatsAppIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '42px', height: '42px' }}>
        <defs>
            <linearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
            </linearGradient>
        </defs>
        <path d="M20 28 C20 21 26 16 34 16 H66 C74 16 80 21 80 28 V52 C80 59 74 64 66 64 H46 L30 78 L33 64 H34 C26 64 20 59 20 52 Z" fill="url(#chatGrad)" opacity="0.95" style={{ animation: 'chatBounce 2.4s ease-in-out infinite' }} />
        <circle cx="40" cy="40" r="4" fill="#ECFDF5" style={{ animation: 'dotBlink 1.4s ease-in-out infinite' }} />
        <circle cx="50" cy="40" r="4" fill="#ECFDF5" style={{ animation: 'dotBlink 1.4s ease-in-out infinite 0.2s' }} />
        <circle cx="60" cy="40" r="4" fill="#ECFDF5" style={{ animation: 'dotBlink 1.4s ease-in-out infinite 0.4s' }} />
    </svg>
);

const PerformanceIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px' }}>
        <defs>
            <linearGradient id="perfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#059669" />
            </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="28" fill="none" stroke="url(#perfGrad)" strokeWidth="4" opacity="0.45" />
        <path d="M30 58 L45 42 L56 50 L70 34" fill="none" stroke="#ECFDF5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="70" cy="34" r="4" fill="#ECFDF5" style={{ animation: 'dotBlink 1.2s ease-in-out infinite' }} />
    </svg>
);

const DesignIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px' }}>
        <defs>
            <linearGradient id="designGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7DD3FC" />
                <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
        </defs>
        <rect x="22" y="22" width="56" height="56" rx="14" fill="url(#designGrad)" opacity="0.25" />
        <path d="M35 66 L52 33 L65 46 L49 69 Z" fill="none" stroke="#DBEAFE" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="52" cy="33" r="4" fill="#DBEAFE" style={{ animation: 'corePulse 1.8s ease-in-out infinite' }} />
    </svg>
);

const AnalyticsIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px' }}>
        <defs>
            <linearGradient id="analyticsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C4B5FD" />
                <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
        </defs>
        <rect x="24" y="56" width="12" height="18" rx="4" fill="url(#analyticsGrad)" />
        <rect x="44" y="44" width="12" height="30" rx="4" fill="url(#analyticsGrad)" style={{ animation: 'barWave 1.8s ease-in-out infinite' }} />
        <rect x="64" y="34" width="12" height="40" rx="4" fill="url(#analyticsGrad)" style={{ animation: 'barWave 1.8s ease-in-out infinite 0.2s' }} />
    </svg>
);

const SpeedIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px' }}>
        <defs>
            <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCA5A5" />
                <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
        </defs>
        <path d="M24 62 L50 24 L46 46 L76 38 L48 76 L52 54 Z" fill="url(#speedGrad)" style={{ animation: 'boltPulse 1.4s ease-in-out infinite' }} />
        <path d="M18 50 H30" stroke="#FEE2E2" strokeWidth="3" strokeLinecap="round" style={{ animation: 'dashMove 0.9s linear infinite' }} />
        <path d="M72 50 H84" stroke="#FEE2E2" strokeWidth="3" strokeLinecap="round" style={{ animation: 'dashMove 0.9s linear infinite' }} />
    </svg>
);

export default function MaintenancePage() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const timerTitleRef = useRef(null);
    const floatingShapesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        setIsMobile(window.innerWidth < 640);

        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Timer Effect
    useEffect(() => {
        const MAINTENANCE_END = new Date(2026, 3, 14, 23, 0, 0).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = MAINTENANCE_END - now;

            if (distance > 0) {
                setTimeLeft({
                    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((distance / (1000 * 60)) % 60),
                    seconds: Math.floor((distance / 1000) % 60),
                });
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, []);

    // GSAP Animations & Parallax Effect
    useEffect(() => {
        if (!containerRef.current || !titleRef.current) return;

        gsap.from(titleRef.current, {
            opacity: 0,
            y: 100,
            duration: 1.2,
            ease: 'cubic.out',
        });

        floatingShapesRef.current.forEach((el, index) => {
            if (el) {
                gsap.to(el, {
                    y: -40 + index * 10,
                    duration: 4 + index * 0.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    delay: index * 0.3,
                });

                gsap.to(el, {
                    rotation: 360,
                    duration: 20 + index * 3,
                    repeat: -1,
                    ease: 'none',
                });
            }
        });

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };

            floatingShapesRef.current.forEach((el, index) => {
                if (el) {
                    const moveX = (mouseRef.current.x - window.innerWidth / 2) * 0.02 * (index + 1);
                    const moveY = (mouseRef.current.y - window.innerHeight / 2) * 0.02 * (index + 1);

                    gsap.to(el, {
                        x: moveX,
                        y: moveY,
                        duration: 0.8,
                        overwrite: 'auto',
                    });
                }
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!timerTitleRef.current) return;

        const animation = animate(svg.createDrawable('.timer-draw-line'), {
            draw: ['0 0', '0 1', '1 1'],
            ease: 'inOutQuad',
            duration: 2000,
            delay: stagger(100),
            loop: true,
        });

        return () => {
            if (animation && typeof animation.pause === 'function') {
                animation.pause();
            }
        };
    }, []);

    return (
        <div ref={containerRef} style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '12px' : '20px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            {/* Animated background shapes */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.18) 0%, rgba(15, 23, 42, 0) 50%)', animation: 'auroraDrift 12s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 70%, rgba(244, 114, 182, 0.14) 0%, rgba(15, 23, 42, 0) 55%)', animation: 'auroraDrift 14s ease-in-out infinite reverse' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)', backgroundSize: '42px 42px', opacity: 0.35, animation: 'gridPan 22s linear infinite' }} />
                {[
                    { size: 350, color: 'rgba(239, 68, 68, 0.15)' },
                    { size: 300, color: 'rgba(79, 70, 229, 0.15)' },
                    { size: 280, color: 'rgba(16, 185, 129, 0.15)' },
                    { size: 250, color: 'rgba(249, 115, 22, 0.15)' },
                ].map((shape, i) => (
                    <div
                        key={i}
                        ref={(el) => floatingShapesRef.current[i] = el}
                        style={{
                            position: 'absolute',
                            width: `${shape.size}px`,
                            height: `${shape.size}px`,
                            background: shape.color,
                            borderRadius: '50%',
                            filter: 'blur(60px)',
                            ...(i === 0 && { top: '10%', left: '5%' }),
                            ...(i === 1 && { top: '50%', right: '5%' }),
                            ...(i === 2 && { bottom: '10%', left: '20%' }),
                            ...(i === 3 && { top: '60%', left: '50%' }),
                        }}
                    />
                ))}
                {Array.from({ length: 18 }).map((_, i) => (
                    <span
                        key={`particle-${i}`}
                        style={{
                            position: 'absolute',
                            left: `${(i * 17) % 100}%`,
                            top: `${(i * 29) % 100}%`,
                            width: i % 3 === 0 ? '4px' : '3px',
                            height: i % 3 === 0 ? '4px' : '3px',
                            borderRadius: '50%',
                            background: i % 2 ? 'rgba(167, 139, 250, 0.55)' : 'rgba(125, 211, 252, 0.55)',
                            boxShadow: '0 0 10px rgba(148, 163, 184, 0.45)',
                            animation: `particleFloat ${7 + (i % 5)}s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 20, maxWidth: isMobile ? '100%' : '1024px', width: '100%', textAlign: 'center' }}>
                {/* Main Icon with Pulse Animation */}
                <div style={{ marginBottom: isMobile ? '16px' : '40px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #FF6B6B, #FF8E72)',
                        borderRadius: '50%',
                        width: isMobile ? '55px' : '100px',
                        height: isMobile ? '55px' : '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 40px rgba(255, 107, 107, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}>
                        <BuildingIcon />
                    </div>
                </div>

                {/* Title */}
                <h1 ref={titleRef} style={{
                    fontSize: isMobile ? '1.4rem' : '3.5rem',
                    fontWeight: '900',
                    background: 'linear-gradient(135deg, #FF6B6B, #FF8E72, #4F46E5, #10B981)',
                    backgroundSize: '300% 300%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0,
                    lineHeight: '1.15',
                    letterSpacing: '-0.02em',
                    animation: 'gradientShift 8s ease infinite',
                }}>
                    Sedang Dalam Pengembangan
                </h1>

                {/* Subtitle */}
                <p style={{
                    fontSize: isMobile ? '0.9rem' : '1.25rem',
                    color: '#CBD5E1',
                    fontWeight: '500',
                    margin: isMobile ? '6px 0 20px 0' : '16px 0 48px 0',
                    lineHeight: '1.5',
                }}>
                    Kami sedang membangun pengalaman untuk Anda
                </p>

                {/* Timer Section */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: isMobile ? '12px' : '20px',
                    padding: isMobile ? '12px' : '40px 32px',
                    marginBottom: isMobile ? '16px' : '48px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}>
                    <div ref={timerTitleRef} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '12px' : '24px', gap: '6px' }}>
                        <TimerIcon />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h2 style={{ color: '#E2E8F0', fontSize: isMobile ? '0.95rem' : '1.5rem', fontWeight: 'bold', margin: 0 }}>
                                Waktu Tersisa
                            </h2>
                            <svg width={isMobile ? '140' : '210'} height="16" viewBox="0 0 210 16" style={{ marginTop: '4px' }}>
                                <path className="timer-draw-line" d="M4 8 H86" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
                                <path className="timer-draw-line" d="M102 8 H208" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? '8px' : '20px' }}>
                        {[
                            { value: timeLeft.hours, label: 'JAM' },
                            { value: timeLeft.minutes, label: 'MENIT' },
                            { value: timeLeft.seconds, label: 'DETIK' },
                        ].map((item, i) => (
                            <div key={i} style={{
                                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                borderRadius: '8px',
                                padding: isMobile ? '10px' : '24px',
                            }}>
                                <div style={{
                                    fontSize: isMobile ? '1.3rem' : '3.5rem',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #FF6B6B, #FF8E72, #4F46E5, #10B981)',
                                    backgroundSize: '300% 300%',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    animation: 'gradientShift 8s ease infinite',
                                    fontVariantNumeric: 'tabular-nums',
                                    lineHeight: '1',
                                }}>
                                    {String(item.value).padStart(2, '0')}
                                </div>
                                <div style={{ fontSize: isMobile ? '0.65rem' : '0.875rem', color: '#94A3B8', marginTop: isMobile ? '4px' : '8px', fontWeight: '600' }}>
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features Section */}
                <div style={{
                    background: 'linear-gradient(140deg, rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.62))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: isMobile ? '14px' : '24px',
                    padding: isMobile ? '14px' : '38px 30px',
                    marginBottom: isMobile ? '16px' : '48px',
                    boxShadow: '0 18px 45px rgba(2, 6, 23, 0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}>
                    <h3 style={{ color: '#E2E8F0', fontSize: isMobile ? '1rem' : '1.5rem', fontWeight: '700', letterSpacing: '0.01em', margin: '0 0 16px 0' }}>
                        Fitur yang Dikerjakan
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '8px' : '16px' }}>
                        {[
                            { icon: PerformanceIcon, label: 'Performa', sub: 'Fast Core', colorA: '#10B981', colorB: '#047857' },
                            { icon: DesignIcon, label: 'Desain', sub: 'Visual 2.0', colorA: '#0EA5E9', colorB: '#1D4ED8' },
                            { icon: AnalyticsIcon, label: 'Analytics', sub: 'Insight Live', colorA: '#8B5CF6', colorB: '#6D28D9' },
                            { icon: SpeedIcon, label: 'Kecepatan', sub: 'Turbo Ops', colorA: '#F43F5E', colorB: '#DC2626' },
                        ].map((f, i) => (
                            <div key={i} style={{
                                position: 'relative',
                                overflow: 'hidden',
                                background: `linear-gradient(140deg, ${f.colorA}, ${f.colorB})`,
                                borderRadius: '12px',
                                padding: isMobile ? '11px' : '18px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                boxShadow: '0 10px 24px rgba(2,6,23,0.35)',
                                transform: 'translateZ(0)',
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-40%',
                                    left: '-25%',
                                    width: '80%',
                                    height: '180%',
                                    background: 'linear-gradient(120deg, rgba(255,255,255,0.35), rgba(255,255,255,0))',
                                    transform: 'rotate(18deg)',
                                    animation: `cardShine 4.2s ease-in-out ${i * 0.25}s infinite`,
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    inset: '0',
                                    borderRadius: '12px',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -12px 24px rgba(2,6,23,0.18)',
                                    pointerEvents: 'none',
                                }} />
                                <div style={{ position: 'relative', zIndex: 2, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}><f.icon /></div>
                                <p style={{ position: 'relative', zIndex: 2, color: '#fff', fontWeight: '700', margin: 0, fontSize: isMobile ? '0.78rem' : '0.98rem' }}>{f.label}</p>
                                <p style={{ position: 'relative', zIndex: 2, color: 'rgba(255,255,255,0.78)', margin: '2px 0 0 0', fontSize: isMobile ? '0.64rem' : '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{f.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: isMobile ? '12px' : '20px',
                    padding: isMobile ? '12px' : '40px 32px',
                }}>
                    <h3 style={{ color: '#E2E8F0', fontSize: isMobile ? '1rem' : '1.5rem', fontWeight: 'bold', margin: '0 0 12px 0' }}>
                        📞 Hubungi Kami
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '10px' : '24px' }}>
                        <a href="mailto:haikallatief0@gmail.com" style={{
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            padding: isMobile ? '12px' : '24px',
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                        }}>
                            <EmailIcon />
                            <p style={{ color: '#E2E8F0', fontWeight: 'bold', margin: 0, fontSize: isMobile ? '0.85rem' : '1rem' }}>Email</p>
                            <p style={{ color: '#94A3B8', fontSize: isMobile ? '0.7rem' : '0.875rem', margin: 0, wordBreak: 'break-word' }}>haikallatief0@gmail.com</p>
                        </a>
                        <a href={MAINTENANCE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            padding: isMobile ? '12px' : '24px',
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                        }}>
                            <WhatsAppIcon />
                            <p style={{ color: '#E2E8F0', fontWeight: 'bold', margin: 0, fontSize: isMobile ? '0.85rem' : '1rem' }}>WhatsApp</p>
                            <p style={{ color: '#94A3B8', fontSize: isMobile ? '0.7rem' : '0.875rem', margin: 0 }}>+62 811 109 842</p>
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: isMobile ? '16px' : '48px' }}>
                    <p style={{ color: '#E2E8F0', fontWeight: '600', margin: '0 0 3px 0', fontSize: isMobile ? '0.8rem' : '1rem' }}>
                        Terima kasih atas kesabaran Anda
                    </p>
                    <p style={{ color: '#94A3B8', fontSize: isMobile ? '0.7rem' : '0.875rem', margin: 0 }}>
                        Kami akan segera menghadirkan sesuatu istimewa
                    </p>
                </div>
            </div>

            {/* Global Styles */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes iconFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                }
                @keyframes auroraDrift {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(12px, -10px, 0) scale(1.06); }
                }
                @keyframes gridPan {
                    from { transform: translate3d(0, 0, 0); }
                    to { transform: translate3d(42px, 42px, 0); }
                }
                @keyframes particleFloat {
                    0%, 100% { transform: translateY(0px) scale(0.9); opacity: 0.4; }
                    50% { transform: translateY(-14px) scale(1.1); opacity: 0.95; }
                }
                @keyframes corePulse {
                    0%, 100% { transform: scale(0.92); opacity: 0.75; }
                    50% { transform: scale(1.08); opacity: 1; }
                }
                @keyframes ringSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes radarSweep {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes planeDrift {
                    0%, 100% { transform: translateX(0px) translateY(0px); }
                    50% { transform: translateX(4px) translateY(-2px); }
                }
                @keyframes dashMove {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -22; }
                }
                @keyframes chatBounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                }
                @keyframes dotBlink {
                    0%, 80%, 100% { opacity: 0.35; transform: scale(0.85); }
                    40% { opacity: 1; transform: scale(1); }
                }
                @keyframes barWave {
                    0%, 100% { transform: scaleY(0.84); transform-origin: bottom; }
                    50% { transform: scaleY(1.08); transform-origin: bottom; }
                }
                @keyframes boltPulse {
                    0%, 100% { transform: scale(0.95); filter: drop-shadow(0 0 0px rgba(254, 226, 226, 0)); }
                    50% { transform: scale(1.06); filter: drop-shadow(0 0 7px rgba(254, 226, 226, 0.9)); }
                }
                @keyframes cardShine {
                    0%, 100% { transform: translateX(-35%) rotate(18deg); opacity: 0.18; }
                    50% { transform: translateX(55%) rotate(18deg); opacity: 0.42; }
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                * { box-sizing: border-box; }
            `}</style>
        </div>
    );
}
