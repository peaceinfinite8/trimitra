import { useState, useEffect, useRef } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import gsap from 'gsap';

export default function MaintenancePage() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 24,
        minutes: 0,
        seconds: 0,
    });

    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const timerRef = useRef(null);
    const floatingShapesRef = useRef([]);

    // Timer countdown 24 jam
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                let { hours, minutes, seconds } = prev;

                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                }

                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // GSAP Animations
    useEffect(() => {
        if (!containerRef.current) return;

        // Timeline master animation
        const tl = gsap.timeline();

        // Animate title
        tl.from(titleRef.current, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'back.out',
        }, 0);

        // Animate subtitle
        tl.from(subtitleRef.current, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out',
        }, 0.3);

        // Animate timer
        tl.from(timerRef.current, {
            opacity: 0,
            scale: 0.5,
            duration: 0.8,
            ease: 'back.out',
        }, 0.5);

        // Floating animation for decorative shapes
        floatingShapesRef.current.forEach((el, index) => {
            if (el) {
                gsap.to(el, {
                    y: -30,
                    duration: 3 + index * 0.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    delay: index * 0.2,
                });

                gsap.to(el, {
                    rotation: 360,
                    duration: 15 + index * 2,
                    repeat: -1,
                    ease: 'none',
                });
            }
        });

        // Pulse animation for contact icons
        const contactIcons = containerRef.current.querySelectorAll('[data-contact-icon]');
        contactIcons.forEach((icon, index) => {
            gsap.to(icon, {
                scale: 1.1,
                duration: 0.6,
                repeat: -1,
                yoyo: true,
                ease: 'power2.inOut',
                delay: index * 0.3,
            });
        });
    }, []);

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center px-4 overflow-hidden relative"
        >
            {/* Animated floating shapes background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Floating circle 1 */}
                <div
                    ref={(el) => (floatingShapesRef.current[0] = el)}
                    className="absolute top-20 left-10 w-96 h-96 bg-yellow-300 rounded-full opacity-20 blur-3xl"
                />

                {/* Floating circle 2 */}
                <div
                    ref={(el) => (floatingShapesRef.current[1] = el)}
                    className="absolute top-40 right-10 w-80 h-80 bg-blue-400 rounded-full opacity-20 blur-3xl"
                />

                {/* Floating circle 3 */}
                <div
                    ref={(el) => (floatingShapesRef.current[2] = el)}
                    className="absolute -bottom-20 left-1/3 w-96 h-96 bg-green-300 rounded-full opacity-20 blur-3xl"
                />

                {/* Floating square */}
                <div
                    ref={(el) => (floatingShapesRef.current[3] = el)}
                    className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-300 rounded-3xl opacity-10 blur-3xl"
                />
            </div>

            {/* Decorative emoji/icons background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none text-6xl opacity-10">
                <div className="absolute top-10 left-20">🚀</div>
                <div className="absolute top-1/3 right-20">⚡</div>
                <div className="absolute bottom-20 left-1/4">🔧</div>
                <div className="absolute bottom-1/3 right-1/4">💡</div>
                <div className="absolute top-1/2 right-10">✨</div>
            </div>

            {/* Main content */}
            <div className="relative z-20 max-w-3xl mx-auto text-center">
                {/* Animated main icon */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full p-6 w-24 h-24 flex items-center justify-center shadow-2xl">
                            <span className="text-5xl animate-bounce">🔨</span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1
                    ref={titleRef}
                    className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl"
                >
                    🏗️ Bagian Ini Sedang <br /> Dalam Pengembangan
                </h1>

                {/* Animated subtitle */}
                <p
                    ref={subtitleRef}
                    className="text-2xl md:text-3xl text-white font-bold mb-12 drop-shadow-lg"
                >
                    Kami sedang membangun sesuatu yang <span className="text-yellow-300 animate-pulse">luar biasa</span> untuk Anda! ✨
                </p>

                {/* Timer section with GSAP animation */}
                <div
                    ref={timerRef}
                    className="bg-white bg-opacity-15 backdrop-blur-xl rounded-3xl p-8 mb-12 border-2 border-white border-opacity-40 shadow-2xl"
                >
                    <h2 className="text-xl text-white font-bold mb-6 flex items-center justify-center gap-3">
                        ⏱️ Waktu Tersisa
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        {/* Hours */}
                        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 transform hover:scale-110 transition-transform shadow-xl">
                            <div className="text-5xl font-black text-white">
                                {String(timeLeft.hours).padStart(2, '0')}
                            </div>
                            <div className="text-sm text-blue-100 mt-2 font-bold">JAM</div>
                        </div>

                        {/* Minutes */}
                        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 transform hover:scale-110 transition-transform shadow-xl">
                            <div className="text-5xl font-black text-white">
                                {String(timeLeft.minutes).padStart(2, '0')}
                            </div>
                            <div className="text-sm text-purple-100 mt-2 font-bold">MENIT</div>
                        </div>

                        {/* Seconds */}
                        <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl p-6 transform hover:scale-110 transition-transform shadow-xl">
                            <div className="text-5xl font-black text-white">
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </div>
                            <div className="text-sm text-pink-100 mt-2 font-bold">DETIK</div>
                        </div>
                    </div>
                </div>

                {/* Development features */}
                <div className="bg-white bg-opacity-15 backdrop-blur-xl rounded-3xl p-8 mb-12 border-2 border-white border-opacity-40 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-6">🎯 Fitur yang Sedang Dikerjakan</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl p-4 transform hover:scale-105 transition-transform">
                            <p className="text-3xl mb-2">⚙️</p>
                            <p className="text-white font-bold">Optimalisasi Performa</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl p-4 transform hover:scale-105 transition-transform">
                            <p className="text-3xl mb-2">🎨</p>
                            <p className="text-white font-bold">Desain UI Baru</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl p-4 transform hover:scale-105 transition-transform">
                            <p className="text-3xl mb-2">📊</p>
                            <p className="text-white font-bold">Fitur Analytics</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-xl p-4 transform hover:scale-105 transition-transform">
                            <p className="text-3xl mb-2">🚀</p>
                            <p className="text-white font-bold">Peningkatan Kecepatan</p>
                        </div>
                    </div>
                </div>

                {/* Contact section with icons */}
                <div className="bg-white bg-opacity-15 backdrop-blur-xl rounded-3xl p-8 border-2 border-white border-opacity-40 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-8">📞 Hubungi Kami</h3>
                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        {/* Email */}
                        <a
                            href="mailto:haikallatief0@gmail.com"
                            data-contact-icon
                            className="flex-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
                        >
                            <Mail size={48} className="text-white mx-auto mb-3" />
                            <p className="text-white font-bold text-lg mb-1">Email</p>
                            <p className="text-blue-100 font-semibold">haikallatief0@gmail.com</p>
                        </a>

                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/6285185318501?text=Halo,%20saya%20ingin%20bertanya%20tentang%20pengembangan%20website"
                            target="_blank"
                            rel="noopener noreferrer"
                            data-contact-icon
                            className="flex-1 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
                        >
                            <MessageCircle size={48} className="text-white mx-auto mb-3" />
                            <p className="text-white font-bold text-lg mb-1">WhatsApp</p>
                            <p className="text-green-100 font-semibold">+62 851 8531 8501</p>
                        </a>
                    </div>
                </div>

                {/* Footer message */}
                <div className="mt-12">
                    <p className="text-white text-lg font-semibold drop-shadow-lg mb-2">
                        ✨ Terima kasih atas kesabaran Anda! ✨
                    </p>
                    <p className="text-blue-100 text-sm drop-shadow-lg">
                        Kami bekerja keras untuk menghadirkan pengalaman terbaik. Kembali dalam waktu singkat! 🎉
                    </p>
                </div>
            </div>

            {/* Animated CSS styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                }

                @keyframes shimmer {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }

                .animate-shimmer {
                    animation: shimmer 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
