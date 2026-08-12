'use client';

import { useEffect, useRef, memo, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

// Background Particles Component for Premium Temple Atmosphere
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create 45 golden stardust particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.6,
      speedY: Math.random() * 0.35 + 0.1,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      pulseAngle: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += Math.sin(p.pulseAngle) * 0.3 + p.speedX;
        p.pulseAngle += p.pulseSpeed;

        // Reset when moving off screen top
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentOpacity = Math.max(0.1, p.opacity + Math.sin(p.pulseAngle) * 0.3);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${currentOpacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-70"
      aria-hidden="true"
    />
  );
}

function Footer() {
  const footerRef = useRef(null);
  const brandRef = useRef(null);
  const linksRef = useRef(null);
  const contactRef = useRef(null);
  const bottomRef = useRef(null);

  // GSAP Animations on scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      const elements = [brandRef.current, linksRef.current, contactRef.current, bottomRef.current].filter(Boolean);
      gsap.fromTo(
        elements,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.18,
          ease: 'power3.out',
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollTo = useCallback((id) => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  const quickLinks = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Events', id: 'events' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Live Darshan', id: 'darshan' },
    { label: 'Aarti Booking', id: 'aarti' },
    { label: 'Donation', id: 'donation' },
    { label: 'Contact', id: 'contact' },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/suratchagaurinandan',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      url: 'https://facebook.com',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
  ];

  return (
    <footer
      ref={footerRef}
      className="relative w-full pt-[100px] pb-[60px] px-6 sm:px-10 lg:px-[60px] bg-[#F7F3EA] text-[#3F3528] overflow-hidden border-t border-[#B89A4A]/25 backdrop-blur-2xl"
    >
      {/* 1. Animated Particle Canvas */}
      <ParticleCanvas />

      {/* 2. Top Luxury Shimmering Golden Border Accent */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#B89A4A] to-transparent opacity-90 shadow-[0_0_15px_rgba(184,154,74,0.2)]" />
      
      {/* 3. Golden Ambient Glow Orbs */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[350px] bg-gradient-to-b from-[#B89A4A]/08 via-[#D8BD72]/05 to-transparent blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#8F7430]/05 to-[#B89A4A]/05 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#C99B45]/05 to-[#D8BD72]/05 blur-[140px]" />

      {/* 4. Subtle Temple Mandala Geometry Motif Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03] bg-center bg-no-repeat bg-contain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='200' cy='200' r='180' fill='none' stroke='%23b89a4a' stroke-width='1.5'/%3E%3Ccircle cx='200' cy='200' r='140' fill='none' stroke='%23b89a4a' stroke-width='1' stroke-dasharray='4,4'/%3E%3Cpath d='M200,20 L200,380 M20,200 L380,200 M72.7,72.7 L327.3,327.3 M72.7,327.3 L327.3,72.7' stroke='%23b89a4a' stroke-width='0.75' opacity='0.6'/%3E%3Cpolygon points='200,60 235,160 340,160 255,220 285,320 200,260 115,320 145,220 60,160 165,160' fill='none' stroke='%23b89a4a' stroke-width='1'/%3E%3C/svg%3E")`
        }}
      />

      {/* 5. Main 100% Full Width Wrapper */}
      <div className="relative w-full z-10">

        {/* TOP SECTION: 3 COLUMNS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 xl:gap-20 items-start text-center md:text-left">
          
          {/* COLUMN 1: TEMPLE BRANDING & LOGO */}
          <div ref={brandRef} className="flex flex-col items-center md:items-start space-y-6">
            {/* Logo with Soft Golden Glow & Hover Scale Animation */}
            <div 
              className="relative group cursor-pointer" 
              onClick={() => scrollTo('home')}
            >
              {/* Soft Golden Glow Backdrop */}
              <div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-r from-[#B89A4A]/20 via-[#D8BD72]/20 to-[#B89A4A]/20 blur-2xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
              
              {/* Logo Image: 220px desktop, 160px mobile */}
              <div className="relative z-10 p-2 rounded-2xl bg-[#FFFDF7] border border-[#B89A4A]/25 backdrop-blur-md transition-all duration-500 group-hover:border-[#B89A4A]/50 group-hover:shadow-[0_4px_20px_rgba(184,154,74,0.15)]">
                <Image
                  src="/logo/official_logo.webp"
                  alt="Surat Cha Gaurinandan Official Temple Logo"
                  width={220}
                  height={70}
                  className="w-[160px] sm:w-[180px] lg:w-[220px] h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Brand Titles */}
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#3F3528] tracking-wide">
                🙏 Surat Cha Gaurinandan
              </h3>
              <p className="text-xs uppercase tracking-[0.3em] text-[#8F7430] font-subheading font-semibold">
                Ganesh Mahotsav 2026
              </p>
            </div>

            {/* Brand Description */}
            <p className="text-xs sm:text-sm text-[#776B5B] font-light leading-relaxed max-w-sm">
              Connecting devotees worldwide through faith, seva, devotion, and divine blessings of Lord Ganesha.
            </p>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div ref={linksRef} className="flex flex-col items-center md:items-start space-y-6">
            <div className="relative">
              <h4 className="text-xs sm:text-sm font-heading tracking-[0.25em] uppercase text-[#3F3528] font-bold border-b border-[#B89A4A]/25 pb-2.5 px-1 inline-block">
                Quick Links
              </h4>
              <span className="absolute bottom-0 left-0 md:left-0 w-8 h-[2px] bg-[#B89A4A]" />
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3.5 pt-1 w-full max-w-xs md:max-w-none">
              {quickLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.id);
                  }}
                  className="group relative flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-[#776B5B] font-medium hover:text-[#B89A4A] transition-colors duration-300 py-1"
                >
                  {/* Subtle golden diamond dot on hover */}
                  <span className="text-[10px] text-[#B89A4A] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:inline-block">
                    ◆
                  </span>

                  <span className="relative">
                    {link.label}
                    {/* Golden Underline Animation */}
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#B89A4A] via-[#D8BD72] to-[#B89A4A] group-hover:w-full transition-all duration-300 ease-out" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* COLUMN 3: CONTACT & SOCIAL MEDIA */}
          <div ref={contactRef} className="flex flex-col items-center md:items-start space-y-6 md:col-span-2 lg:col-span-1">
            <div className="relative">
              <h4 className="text-xs sm:text-sm font-heading tracking-[0.25em] uppercase text-[#3F3528] font-bold border-b border-[#B89A4A]/25 pb-2.5 px-1 inline-block">
                Contact &amp; Connect
              </h4>
              <span className="absolute bottom-0 left-0 md:left-0 w-8 h-[2px] bg-[#B89A4A]" />
            </div>

            {/* Contact Details List */}
            <ul className="space-y-3 text-xs sm:text-sm text-[#776B5B] font-light w-full">
              <li className="flex items-center justify-center md:justify-start gap-3 group">
                <div className="w-8 h-8 rounded-full bg-[#FAF7EF] border border-[#B89A4A]/25 flex items-center justify-center text-[#8F7430] group-hover:border-[#B89A4A]/50 group-hover:bg-[#EEE7D8] transition-all duration-300 shrink-0 shadow-sm">
                  <span className="text-sm">📍</span>
                </div>
                <span className="group-hover:text-[#3F3528] transition-colors">Surat, Gujarat, India</span>
              </li>

              <li className="flex items-center justify-center md:justify-start gap-3 group">
                <div className="w-8 h-8 rounded-full bg-[#FAF7EF] border border-[#B89A4A]/25 flex items-center justify-center text-[#8F7430] group-hover:border-[#B89A4A]/50 group-hover:bg-[#EEE7D8] transition-all duration-300 shrink-0 shadow-sm">
                  <span className="text-sm">📞</span>
                </div>
                <a href="tel:+919876543210" className="group-hover:text-[#B89A4A] transition-colors">
                  +91 98765 43210
                </a>
              </li>

              <li className="flex items-center justify-center md:justify-start gap-3 group">
                <div className="w-8 h-8 rounded-full bg-[#FAF7EF] border border-[#B89A4A]/25 flex items-center justify-center text-[#8F7430] group-hover:border-[#B89A4A]/50 group-hover:bg-[#EEE7D8] transition-all duration-300 shrink-0 shadow-sm">
                  <span className="text-sm">📧</span>
                </div>
                <a href="mailto:info@suratchagaurinandan.com" className="group-hover:text-[#B89A4A] transition-colors">
                  info@suratchagaurinandan.com
                </a>
              </li>

              <li className="flex items-center justify-center md:justify-start gap-3 group">
                <div className="w-8 h-8 rounded-full bg-[#FAF7EF] border border-[#B89A4A]/25 flex items-center justify-center text-[#8F7430] group-hover:border-[#B89A4A]/50 group-hover:bg-[#EEE7D8] transition-all duration-300 shrink-0 shadow-sm">
                  <span className="text-sm">🌐</span>
                </div>
                <a 
                  href="https://www.suratchagaurinandan.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group-hover:text-[#B89A4A] transition-colors font-mono text-xs tracking-tight"
                >
                  www.suratchagaurinandan.com
                </a>
              </li>
            </ul>

            {/* Social Media Section with Large Glass Circular Icons */}
            <div className="pt-2 w-full flex flex-col items-center md:items-start">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#3F3528] font-bold mb-3.5">
                Follow Us On Social Media
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${social.name}`}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFFDF7] border border-[#B89A4A]/30 backdrop-blur-xl flex items-center justify-center text-[#8F7430] shadow-[0_4px_15px_rgba(63,53,40,0.05)] hover:text-[#3F3528] hover:bg-gradient-to-tr hover:from-[#D8BD72] hover:to-[#B89A4A] hover:border-[#B89A4A] hover:shadow-[0_4px_20px_rgba(184,154,74,0.25)] hover:scale-110 hover:-translate-y-1.5 transition-all duration-300 ease-out"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: FULL WIDTH DIVIDER & COPYRIGHT */}
        <div ref={bottomRef} className="mt-16 pt-8 relative">
          {/* Full Width Thin Luxury Golden Line Divider */}
          <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-[#B89A4A]/25 to-transparent mb-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFFDF7] border border-[#B89A4A]/30 flex items-center justify-center text-[10px] text-[#8F7430] shadow-[0_2px_8px_rgba(63,53,40,0.05)]">
              🕉️
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center text-xs text-[#776B5B] font-light tracking-wide">
            <div>
              &copy; 2026 Surat Cha Gaurinandan Ganesh Mahotsav. All Rights Reserved.
            </div>

            <div className="text-[#776B5B]">
              Designed &amp; Developed by{' '}
              <a
                href="https://suratchagaurinandan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#B89A4A] hover:text-[#3F3528] underline underline-offset-4 decoration-[#B89A4A]/30 hover:decoration-[#3F3528] transition-colors"
              >
                Surat Cha Gaurinandan Mahotsav Trust
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default memo(Footer);
