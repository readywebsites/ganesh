'use client';

import { useState, useEffect, useRef, memo } from 'react';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const scrolledRef = useRef(false);
  const activeSectionRef = useRef('home');

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 50;
          if (isScrolled !== scrolledRef.current) {
            scrolledRef.current = isScrolled;
            setScrolled(isScrolled);
          }

          // ScrollSpy
          const sections = ['home', 'about', 'gallery', 'darshan', 'aarti', 'donation', 'membership', 'contact'];
          let current = 'home';
          for (const section of sections) {
            const el = document.getElementById(section);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= 200 && rect.bottom >= 200) {
                current = section;
                break;
              }
            }
          }
          if (current !== activeSectionRef.current) {
            activeSectionRef.current = current;
            setActiveSection(current);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    if (id === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }
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
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} backdrop-blur-xl border-b border-amber-500/10 transition-all duration-500`} id="main-nav">
      <div className="navbar-container">
        <a
          href="#home"
          className="nav-logo-link"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('home');
          }}
        >
          <img
            src="/logo/official_logo.webp"
            alt="Surat Cha Gaurinandan Official Logo"
            className="nav-logo-img"
            width="180"
            height="60"
            loading="eager"
            fetchPriority="high"
          />
        </a>

        <ul className={`nav-menu ${mobileOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <a
              href="#home"
              className={`relative transition-all duration-300 py-1 ${activeSection === 'home' ? 'active text-amber-400 font-semibold' : 'text-zinc-300 hover:text-amber-300'}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('home');
              }}
            >
              Home
              {activeSection === 'home' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-pulse" />
              )}
            </a>
          </li>

          <li className="nav-item">
            <a
              href="#about"
              className={`relative transition-all duration-300 py-1 ${activeSection === 'about' ? 'active text-amber-400 font-semibold' : 'text-zinc-300 hover:text-amber-300'}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('about');
              }}
            >
              About
              {activeSection === 'about' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-pulse" />
              )}
            </a>
          </li>

          <li className="nav-item">
            <a
              href="#gallery"
              className={`relative transition-all duration-300 py-1 ${activeSection === 'gallery' ? 'active text-amber-400 font-semibold' : 'text-zinc-300 hover:text-amber-300'}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('gallery');
              }}
            >
              Gallery
              {activeSection === 'gallery' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-pulse" />
              )}
            </a>
          </li>

          <li className="nav-item">
            <a
              href="#darshan"
              className={`relative transition-all duration-300 py-1 ${activeSection === 'darshan' ? 'active text-amber-400 font-semibold' : 'text-zinc-300 hover:text-amber-300'}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('darshan');
              }}
            >
              Darshan
              {activeSection === 'darshan' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-pulse" />
              )}
            </a>
          </li>

          <li className="nav-item">
            <a
              href="#aarti"
              className={`relative transition-all duration-300 py-1 flex items-center gap-1.5 ${activeSection === 'aarti' ? 'active text-amber-400 font-bold' : 'text-zinc-200 hover:text-amber-300'}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('aarti');
              }}
            >
              <span>Aarti Booking</span>
              {activeSection === 'aarti' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 rounded-full animate-pulse" />
              )}
            </a>
          </li>

          <li className="nav-item">
            <a
              href="#donation"
              className={`relative transition-all duration-300 py-1 ${activeSection === 'donation' ? 'active text-amber-400 font-semibold' : 'text-zinc-300 hover:text-amber-300'}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('donation');
              }}
            >
              Donation
              {activeSection === 'donation' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-pulse" />
              )}
            </a>
          </li>

          <li className="nav-item">
            <a
              href="#membership"
              className={`relative transition-all duration-300 py-1 ${activeSection === 'membership' ? 'active text-amber-400 font-semibold' : 'text-zinc-300 hover:text-amber-300'}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('membership');
              }}
            >
              Membership
              {activeSection === 'membership' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-pulse" />
              )}
            </a>
          </li>

          <li className="nav-item">
            <a
              href="#contact"
              className={`relative transition-all duration-300 py-1 ${activeSection === 'contact' ? 'active text-amber-400 font-semibold' : 'text-zinc-300 hover:text-amber-300'}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('contact');
              }}
            >
              Contact
              {activeSection === 'contact' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-pulse" />
              )}
            </a>
          </li>       
        </ul>

        <div className="flex items-center gap-4">
          <div
            className={`mobile-toggle ${mobileOpen ? 'active' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default memo(Navbar);
