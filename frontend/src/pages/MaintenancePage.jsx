import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

// SVG Icon Components
const BuildingIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '80px', height: '80px' }}>
        <defs>
            <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="100%" stopColor="#FF8E72" />
            </linearGradient>
        </defs>
        <rect x="20" y="30" width="60" height="60" fill="url(#buildingGrad)" rx="4" />
        <rect x="30" y="40" width="10" height="10" fill="#fff" opacity="0.8" rx="2" />
        <rect x="50" y="40" width="10" height="10" fill="#fff" opacity="0.8" rx="2" />
        <rect x="70" y="40" width="10" height="10" fill="#fff" opacity="0.8" rx="2" />
        <rect x="30" y="55" width="10" height="10" fill="#fff" opacity="0.8" rx="2" />
        <rect x="50" y="55" width="10" height="10" fill="#fff" opacity="0.8" rx="2" />
        <rect x="70" y="55" width="10" height="10" fill="#fff" opacity="0.8" rx="2" />
        <polygon points="25,30 50,15 75,30" fill="url(#buildingGrad)" opacity="0.9" />
    </svg>
);

const TimerIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '50px', height: '50px' }}>
        <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#timerGrad)" strokeWidth="3" opacity="0.3" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#timerGrad)" strokeWidth="3" strokeDasharray="251" strokeDashoffset="50" strokeLinecap="round" />
        <circle cx="50" cy="12" r="4" fill="url(#timerGrad)" />
    </svg>
);

const EmailIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '40px', height: '40px' }}>
        <defs>
            <linearGradient id="emailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
        </defs>
        <rect x="15" y="25" width="70" height="50" fill="none" stroke="url(#emailGrad)" strokeWidth="2" rx="3" />
        <path d="M 15 25 L 50 50 L 85 25" stroke="url(#emailGrad)" strokeWidth="2" fill="none" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '40px', height: '40px' }}>
        <defs>
            <linearGradient id="waGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
            </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="35" fill="url(#waGrad)" opacity="0.2" />
        <path d="M 50 25 C 36.2 25 25 36.2 25 50 C 25 55 26.5 59.7 29.2 63.5 L 25 75 L 37 71 C 40.5 73.4 44.8 75 50 75 C 63.8 75 75 63.8 75 50 C 75 36.2 63.8 25 50 25 Z" fill="none" stroke="url(#waGrad)" strokeWidth="2" />
    </svg>
);

export default function MaintenancePage() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef(null);
    const titleRef = useRef(null);
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
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '12px' : '24px', gap: '6px' }}>
                        <TimerIcon />
                        <h2 style={{ color: '#E2E8F0', fontSize: isMobile ? '0.95rem' : '1.5rem', fontWeight: 'bold', margin: 0 }}>
                            Waktu Tersisa
                        </h2>
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
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: isMobile ? '12px' : '20px',
                    padding: isMobile ? '12px' : '40px 32px',
                    marginBottom: isMobile ? '16px' : '48px',
                }}>
                    <h3 style={{ color: '#E2E8F0', fontSize: isMobile ? '1rem' : '1.5rem', fontWeight: 'bold', margin: '0 0 12px 0' }}>
                        🎯 Fitur yang Dikerjakan
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '8px' : '16px' }}>
                        {[
                            { icon: '⚙️', label: 'Performa', color: '#059669' },
                            { icon: '🎨', label: 'Desain', color: '#0369a1' },
                            { icon: '📊', label: 'Analytics', color: '#6d28d9' },
                            { icon: '🚀', label: 'Kecepatan', color: '#dc2626' },
                        ].map((f, i) => (
                            <div key={i} style={{
                                background: `linear-gradient(135deg, ${f.color}dd, ${f.color})`,
                                borderRadius: '8px',
                                padding: isMobile ? '10px' : '16px',
                                transition: 'transform 0.3s ease',
                            }}>
                                <div style={{ fontSize: isMobile ? '1.3rem' : '2rem', marginBottom: '4px' }}>{f.icon}</div>
                                <p style={{ color: '#fff', fontWeight: 'bold', margin: 0, fontSize: isMobile ? '0.75rem' : '0.95rem' }}>{f.label}</p>
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
                        <a href="https://wa.me/6285185318501" target="_blank" rel="noopener noreferrer" style={{
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
                            <p style={{ color: '#94A3B8', fontSize: isMobile ? '0.7rem' : '0.875rem', margin: 0 }}>+62 851 8531 8501</p>
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
