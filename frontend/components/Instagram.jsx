'use client';

import { useState, useEffect, useRef, memo } from 'react';
import gsap from 'gsap';

function Instagram() {
  const [activeTab, setActiveTab] = useState('posts');
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const sectionRef = useRef(null);
  const profileRef = useRef(null);
  const gridRef = useRef(null);

  const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/suratchagaurinandan';
  const INSTAGRAM_HANDLE = '@suratchagaurinandan';
  const INSTAGRAM_NAME = 'Surat Cha Gaurinandan';

  // Load Instagram Embed Script & Dynamic Feed
  useEffect(() => {
    // Inject Instagram embed.js script for live embeds
    if (!document.getElementById('instagram-embed-script')) {
      const script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.instgrm) {
      window.instgrm.Embeds.process();
    }

    // Fetch dynamic live feed from public RSS endpoint
    const fetchLiveFeed = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
            'https://rsshub.app/instagram/user/suratchagaurinandan'
          )}`
        );
        const data = await res.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
          const fetchedPosts = data.items.map((item, idx) => {
            const imgMatch = item.content?.match(/src="([^"]+)"/);
            const imageUrl = imgMatch ? imgMatch[1] : item.thumbnail || null;
            const isReel = item.link?.includes('/reel/') || item.title?.toLowerCase().includes('reel');

            return {
              id: item.guid || `post-${idx}`,
              link: item.link || INSTAGRAM_PROFILE_URL,
              imageUrl,
              title: item.title || 'Surat Cha Gaurinandan Instagram Update',
              pubDate: new Date(item.pubDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              }),
              isReel,
            };
          });

          setFeedItems(fetchedPosts);
        } else {
          setFeedItems([]);
        }
      } catch (err) {
        setFeedItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveFeed();
  }, []);

  // Process Instagram Embeds when tab switches
  useEffect(() => {
    if (typeof window !== 'undefined' && window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [activeTab, feedItems]);

  // GSAP Animations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (profileRef.current) {
        gsap.fromTo(
          profileRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );
      }
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.15 }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [activeTab]);

  return (
    <section id="social" ref={sectionRef} className="relative py-20 lg:py-28 overflow-hidden bg-black/95 text-white">
      {/* Background Luxury Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.06)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[140px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/40 bg-gradient-to-r from-amber-950/40 via-gold/10 to-amber-950/40 text-goldLight tracking-[0.2em] text-xs font-semibold uppercase backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <span className="text-gold">📸</span>
            <span>LIVE INSTAGRAM EXPERIENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-goldLight via-gold to-amber-200 uppercase mb-4">
            Digital Sanctuary
          </h2>
          <div className="w-28 h-[2px] mx-auto bg-gradient-to-r from-transparent via-gold to-transparent my-4" />
          <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed">
            Real-time updates, daily Darshan, and viral reels directly from our official Instagram profile.
          </p>
        </div>

        {/* PROFILE SECTION BAR */}
        <div
          ref={profileRef}
          className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-neutral-900/90 via-black/95 to-neutral-950/90 border border-gold/30 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] mb-12 overflow-hidden"
        >
          {/* Top Golden Accent Line */}
          <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Avatar & Profile Metadata */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Instagram Avatar Ring */}
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-500 via-gold to-yellow-300 shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                <div className="w-20 h-20 rounded-full bg-black p-0.5 overflow-hidden flex items-center justify-center">
                  <span className="text-3xl">🪔</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="text-xl sm:text-2xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-goldLight via-gold to-amber-200">
                    {INSTAGRAM_NAME}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/20 text-gold border border-gold/40">
                    ✓ Official
                  </span>
                </div>
                <p className="text-sm font-mono text-amber-200/80 mb-2">
                  {INSTAGRAM_HANDLE}
                </p>
                <p className="text-xs text-gray-300 font-light max-w-md">
                  Official Handle of Surat Cha Gaurinandan Ganesh Mahotsav. Daily Live Aarti, Darshan &amp; Utsav Highlights.
                </p>
              </div>
            </div>

            {/* Follow Button */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary shimmer-btn inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 rounded-xl font-medium text-xs tracking-widest uppercase bg-gradient-to-r from-goldDark via-gold to-goldLight text-black shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Follow {INSTAGRAM_HANDLE}</span>
              </a>
            </div>

          </div>
        </div>

        {/* FEED TAB SWITCHER */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-goldDark via-gold to-goldLight text-black border-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'bg-black/60 text-gray-300 border-gold/30 hover:border-gold/60 hover:text-white'
            }`}
          >
            📸 Latest Posts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reels')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${
              activeTab === 'reels'
                ? 'bg-gradient-to-r from-goldDark via-gold to-goldLight text-black border-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'bg-black/60 text-gray-300 border-gold/30 hover:border-gold/60 hover:text-white'
            }`}
          >
            🎬 Viral Reels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('embed')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${
              activeTab === 'embed'
                ? 'bg-gradient-to-r from-goldDark via-gold to-goldLight text-black border-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'bg-black/60 text-gray-300 border-gold/30 hover:border-gold/60 hover:text-white'
            }`}
          >
            ⚡ Live Profile Embed
          </button>
        </div>

        {/* FEED GRID: Desktop: 4 cols, Tablet: 3 cols, Mobile: 2 cols */}
        <div ref={gridRef}>
          {activeTab === 'posts' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {feedItems.length > 0
                ? feedItems.map((item, idx) => (
                    <a
                      key={item.id || idx}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-gold/30 shadow-lg hover:border-gold hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-square relative w-full bg-black flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📸</span>
                            <span className="text-xs text-amber-200/80 font-mono">
                              {INSTAGRAM_HANDLE}
                            </span>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-4 transition-opacity duration-300 text-center">
                          <svg className="w-8 h-8 fill-gold mb-2" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          <span className="text-xs text-white font-medium">View Post on Instagram</span>
                        </div>
                      </div>
                      <div className="p-3 bg-black/90 flex-1">
                        <p className="text-[11px] text-amber-200/90 font-medium truncate">
                          {INSTAGRAM_HANDLE}
                        </p>
                        <p className="text-[10px] text-gray-400 font-light line-clamp-2 mt-0.5">
                          {item.title}
                        </p>
                      </div>
                    </a>
                  ))
                : Array.from({ length: 8 }).map((_, idx) => (
                    <a
                      key={idx}
                      href={INSTAGRAM_PROFILE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-gold/30 p-6 flex flex-col items-center justify-center text-center aspect-square hover:border-gold hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all duration-300"
                    >
                      <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</span>
                      <span className="text-xs font-semibold text-gold mb-1">Live Instagram Post</span>
                      <span className="text-[10px] text-amber-200/70 font-mono mb-2">{INSTAGRAM_HANDLE}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/30">
                        View Live Feed →
                      </span>
                    </a>
                  ))}
            </div>
          )}

          {activeTab === 'reels' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <a
                  key={idx}
                  href={`${INSTAGRAM_PROFILE_URL}/reels`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-neutral-900 via-black to-neutral-950 border border-gold/30 aspect-[9/16] flex flex-col items-center justify-center p-4 text-center hover:border-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Glowing Ambient Background */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-gold/10" />

                  {/* Play Button Overlay */}
                  <div className="w-14 h-14 rounded-full bg-gold/20 border border-gold flex items-center justify-center mb-4 group-hover:bg-gold group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                    <span className="text-xl text-gold group-hover:text-black transition-colors ml-1">▶</span>
                  </div>

                  <span className="text-xs font-heading text-transparent bg-clip-text bg-gradient-to-r from-goldLight via-gold to-amber-200 font-medium mb-1">
                    Surat Cha Gaurinandan Reel #{idx + 1}
                  </span>
                  <span className="text-[10px] text-amber-200/70 font-mono mb-3">
                    {INSTAGRAM_HANDLE}
                  </span>

                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] bg-black/80 text-amber-200 border border-gold/30 group-hover:border-gold transition-colors">
                    Watch Reel on Instagram 🎬
                  </span>
                </a>
              ))}
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="w-full flex justify-center">
              <div className="w-full max-w-2xl rounded-3xl overflow-hidden border border-gold/40 p-4 sm:p-8 bg-neutral-950 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center">
                <blockquote
                  className="instagram-media w-full"
                  data-instgrm-permalink={INSTAGRAM_PROFILE_URL}
                  data-instgrm-version="14"
                  style={{
                    background: '#050505',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '16px',
                    margin: '0 auto',
                    maxWidth: '540px',
                    minWidth: '326px',
                    padding: '0',
                    width: '99.375%',
                  }}
                >
                  <div style={{ padding: '16px' }}>
                    <a
                      href={INSTAGRAM_PROFILE_URL}
                      style={{
                        background: '#000',
                        lineHeight: '0',
                        padding: '0 0',
                        textAlign: 'center',
                        textDecoration: 'none',
                        width: '100%',
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="py-8 space-y-3">
                        <span className="text-4xl block">📸</span>
                        <span className="text-base text-gold font-heading block">Surat Cha Gaurinandan Official Profile</span>
                        <p className="text-xs text-gray-400 font-mono">{INSTAGRAM_HANDLE}</p>
                        <p className="text-xs text-amber-200/70 font-light pt-2">Click to view live stream &amp; updates on Instagram →</p>
                      </div>
                    </a>
                  </div>
                </blockquote>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CTA BANNER */}
        <div className="mt-16 text-center">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-neutral-900 via-black to-neutral-900 border border-gold/40 text-goldLight hover:border-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 text-xs font-semibold uppercase tracking-widest"
          >
            <span>Follow {INSTAGRAM_HANDLE} on Instagram</span>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}

export default memo(Instagram);


