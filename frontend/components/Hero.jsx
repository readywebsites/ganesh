'use client';

import { memo } from 'react';

function Hero() {
  const scrollToAbout = (e) => {
    if (e) e.preventDefault();
    const el = document.getElementById('about');
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="home"
      className="relative h-screen min-h-screen w-full flex items-center justify-center overflow-hidden p-0 m-0 select-none"
      style={{ minHeight: '100vh', maxHeight: '100vh', padding: 0, margin: 0 }}
    >
      <div className="hero-overlay pointer-events-none" />

      <div className="hero-content text-center flex flex-col justify-between items-center h-full w-full max-w-7xl px-6 pt-28 pb-10 box-border z-10">
        {/* Top Tagline Badge */}
        <div className="hero-top">
          <div className="hero-tagline inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold/40 bg-black/60 text-goldLight tracking-[0.25em] text-[11px] md:text-xs uppercase backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <span className="inline-block w-2 h-2 rounded-full bg-gold animate-ping" />
            <span>✨ AN ETERNAL CELEBRATION OF THE DIVINE</span>
          </div>
        </div>

        {/* Main Title & CTA Center Block */}
        <div className="hero-middle my-auto py-6">
          <div className="hero-title-container">
            <h1 className="hero-title-gujarati">
              <span className="title-line-1">સુરત ચા</span>
              <span className="title-line-2">ગૌરીનંદન</span>
            </h1>
            <p className="hero-subtitle text-lg md:text-2xl text-goldLight/90 tracking-[0.3em] uppercase font-heading mt-4 font-light">
              Ganesh Mahotsav 2026
            </p>
          </div>

          <div className="hero-cta-wrapper mt-8 md:mt-10">
            <a
              href="#about"
              onClick={scrollToAbout}
              className="btn-primary shimmer-btn relative inline-flex items-center gap-3 px-8 py-4 text-sm tracking-[0.2em] font-bold uppercase rounded-lg bg-gradient-to-r from-goldDark via-gold to-goldLight text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.8)] hover:scale-105 transition-all duration-300"
            >
              <span>Enter Sacred Temple</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Details & Apple Scroll Indicator */}
        <div className="hero-bottom mt-4 flex flex-col items-center">
          <div className="hero-details text-[11px] md:text-xs tracking-[0.2em] text-gold/80 mb-4 uppercase">
            CELEBRATING <strong className="text-goldLight font-bold">GANESH CHATURTHI 2026</strong> | BHADRAPADA SHUDDHA CHATURTHI
          </div>
          
          <div
            className="scroll-indicator flex flex-col items-center cursor-pointer group"
            onClick={scrollToAbout}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && scrollToAbout(e)}
          >
            <span className="scroll-text text-[10px] tracking-[0.25em] text-goldLight/70 uppercase mb-2 group-hover:text-goldLight transition-colors">
              Scroll down to explore
            </span>
            <div className="scroll-line w-[2px] h-10 bg-gradient-to-b from-gold via-goldLight to-transparent animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Hero);
