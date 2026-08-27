'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';
import gsap from 'gsap';
import { getApiUrl } from '@/lib/api';

function Instagram() {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'reels', 'photos', 'embed'
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState(null); // 'live', 'unconfigured', 'error', 'network_error'
  const [selectedPost, setSelectedPost] = useState(null);
  const [showConfigHelper, setShowConfigHelper] = useState(false);

  const sectionRef = useRef(null);
  const profileRef = useRef(null);
  const gridRef = useRef(null);

  const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/suratchagaurinandan';
  const INSTAGRAM_HANDLE = '@suratchagaurinandan';
  const INSTAGRAM_NAME = 'Surat Cha Gaurinandan';

  // Fetch live Instagram feed from backend API
  const fetchFeed = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Build API endpoint URL with query params
      const endpoint = getApiUrl(`/instagram/feed/?limit=16${forceRefresh ? '&refresh=true' : ''}`);
      const res = await fetch(endpoint, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Instagram API error (HTTP ${res.status})`);
      }

      const data = await res.json();
      const posts = Array.isArray(data.data) ? data.data : [];
      setFeedData(posts);
      setApiStatus(data.status || (data.configured ? 'live' : 'unconfigured'));
    } catch (err) {
      console.warn('[Instagram Component] Could not fetch live feed from backend:', err);
      // If backend fails, fallback gracefully to internal sample set
      setApiStatus('fallback');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchFeed();

    // Inject Instagram official embed.js script for live embeds
    if (!document.getElementById('instagram-embed-script')) {
      const script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else if (typeof window !== 'undefined' && window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, []);

  // Process Instagram embeds when switching to embed tab
  useEffect(() => {
    if (activeTab === 'embed' && typeof window !== 'undefined' && window.instgrm) {
      setTimeout(() => {
        try {
          window.instgrm.Embeds.process();
        } catch (e) {
          // ignore embed processing error
        }
      }, 100);
    }
  }, [activeTab]);

  // GSAP Entrance Animations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (profileRef.current) {
        gsap.fromTo(
          profileRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
      }
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [activeTab]);

  // Filter items based on active tab
  const filteredItems = useMemo(() => {
    if (!feedData || feedData.length === 0) return [];
    if (activeTab === 'reels') {
      return feedData.filter((item) => item.is_reel || item.media_type === 'VIDEO');
    }
    if (activeTab === 'photos') {
      return feedData.filter((item) => !item.is_reel && item.media_type !== 'VIDEO');
    }
    return feedData;
  }, [feedData, activeTab]);

  return (
    <section id="social" ref={sectionRef} className="relative py-20 lg:py-28 overflow-hidden bg-black/95 text-white">
      {/* Background Luxury Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.08)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-gold/5 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/40 bg-gradient-to-r from-amber-950/40 via-gold/10 to-amber-950/40 text-goldLight tracking-[0.2em] text-xs font-semibold uppercase backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <span className="text-gold animate-pulse">📸</span>
            <span>LIVE INSTAGRAM FEED</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-goldLight via-gold to-amber-200 uppercase mb-4">
            Digital Sanctuary
          </h2>
          <div className="w-28 h-[2px] mx-auto bg-gradient-to-r from-transparent via-gold to-transparent my-4" />
          <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed">
            Real-time live feeds, daily sacred Darshan, and viral reels directly from our official Instagram handle.
          </p>
        </div>

        {/* PROFILE HEADER BAR */}
        <div
          ref={profileRef}
          className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-neutral-900/90 via-black/95 to-neutral-950/90 border border-gold/30 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] mb-10 overflow-hidden"
        >
          <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Avatar & Profile Metadata */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-500 via-gold to-yellow-300 shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                <div className="w-20 h-20 rounded-full bg-black p-0.5 overflow-hidden flex items-center justify-center">
                  <span className="text-3xl">🪔</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-goldLight via-gold to-amber-200">
                    {INSTAGRAM_NAME}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/20 text-gold border border-gold/40">
                    ✓ Official Handle
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

            {/* Action Buttons: Refresh & Follow */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => fetchFeed(true)}
                disabled={refreshing || loading}
                title="Sync latest live feed from Instagram"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-neutral-800/80 hover:bg-neutral-700/80 text-amber-200 border border-gold/30 hover:border-gold transition-all duration-200 disabled:opacity-50"
              >
                <svg
                  className={`w-4 h-4 text-gold ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{refreshing ? 'Syncing...' : 'Sync Live'}</span>
              </button>

              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary shimmer-btn inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-medium text-xs tracking-widest uppercase bg-gradient-to-r from-goldDark via-gold to-goldLight text-black shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Follow {INSTAGRAM_HANDLE}</span>
              </a>
            </div>

          </div>

          {/* Sync Status Sub-bar */}
          <div className="mt-4 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${apiStatus === 'live' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-amber-400'}`} />
              <span>
                {apiStatus === 'live' ? (
                  <span className="text-green-400 font-medium">Connected to Meta Graph API</span>
                ) : (
                  <span className="text-amber-300 font-medium">Curated Temple Feed Active</span>
                )}
              </span>
            </div>

            {apiStatus !== 'live' && (
              <button
                type="button"
                onClick={() => setShowConfigHelper(!showConfigHelper)}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer text-[10px]"
              >
                {showConfigHelper ? 'Hide Setup Help' : '⚙️ Environment Setup Guide'}
              </button>
            )}
          </div>

          {/* Developer / Admin .env Setup Helper Accordion */}
          {showConfigHelper && (
            <div className="mt-4 p-4 rounded-2xl bg-neutral-950 border border-gold/40 text-xs space-y-2 text-gray-300">
              <div className="flex items-center justify-between text-gold font-bold">
                <span>🔧 How to activate live Meta Instagram Graph API</span>
                <button
                  type="button"
                  onClick={() => setShowConfigHelper(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px]">
                Add your Meta Developer Long-Lived Token and App Secret to <code className="text-amber-300 bg-neutral-900 px-1 py-0.5 rounded">backend/.env</code>:
              </p>
              <pre className="bg-black/90 p-2.5 rounded-lg text-[10px] font-mono text-amber-200 overflow-x-auto border border-neutral-800">
{`INSTAGRAM_ACCESS_TOKEN=your_long_lived_instagram_token
INSTAGRAM_APP_SECRET=your_meta_app_secret
INSTAGRAM_APP_ID=your_meta_app_id
INSTAGRAM_USER_ID=me
INSTAGRAM_CACHE_TIMEOUT=300`}
              </pre>
              <p className="text-[10px] text-gray-400">
                After updating the values, click the <strong>Sync Live</strong> button above to instantly fetch your real-time Instagram posts!
              </p>
            </div>
          )}
        </div>

        {/* FEED TAB SWITCHER */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-5 sm:px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#8F7430] via-[#B89A4A] to-[#D8BD72] text-[#3F3528] border-[#8F7430] shadow-[0_4px_20px_rgba(184,154,74,0.3)]'
                : 'bg-neutral-900/80 text-gray-300 border-gold/30 hover:border-gold/60 hover:text-white'
            }`}
          >
            🌟 All Media
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reels')}
            className={`px-5 sm:px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${
              activeTab === 'reels'
                ? 'bg-gradient-to-r from-[#8F7430] via-[#B89A4A] to-[#D8BD72] text-[#3F3528] border-[#8F7430] shadow-[0_4px_20px_rgba(184,154,74,0.3)]'
                : 'bg-neutral-900/80 text-gray-300 border-gold/30 hover:border-gold/60 hover:text-white'
            }`}
          >
            🎬 Viral Reels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`px-5 sm:px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${
              activeTab === 'photos'
                ? 'bg-gradient-to-r from-[#8F7430] via-[#B89A4A] to-[#D8BD72] text-[#3F3528] border-[#8F7430] shadow-[0_4px_20px_rgba(184,154,74,0.3)]'
                : 'bg-neutral-900/80 text-gray-300 border-gold/30 hover:border-gold/60 hover:text-white'
            }`}
          >
            📸 Sacred Photos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('embed')}
            className={`px-5 sm:px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${
              activeTab === 'embed'
                ? 'bg-gradient-to-r from-[#8F7430] via-[#B89A4A] to-[#D8BD72] text-[#3F3528] border-[#8F7430] shadow-[0_4px_20px_rgba(184,154,74,0.3)]'
                : 'bg-neutral-900/80 text-gray-300 border-gold/30 hover:border-gold/60 hover:text-white'
            }`}
          >
            ⚡ Live Profile Embed
          </button>
        </div>

        {/* FEED GRID: Desktop: 4 cols, Tablet: 3 cols, Mobile: 2 cols */}
        <div ref={gridRef}>
          {activeTab !== 'embed' && (
            <div>
              {loading ? (
                /* Skeleton Loading Skeletons */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl bg-neutral-900/80 border border-gold/20 aspect-square p-4 flex flex-col justify-between animate-pulse"
                    >
                      <div className="w-full h-3/4 bg-neutral-800 rounded-xl mb-3" />
                      <div className="space-y-2">
                        <div className="h-3 bg-neutral-800 rounded w-3/4" />
                        <div className="h-2 bg-neutral-800/60 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredItems.map((item, idx) => {
                    const isVideoOrReel = item.is_reel || item.media_type === 'VIDEO';
                    const displayImage = item.thumbnail_url || item.media_url;

                    return (
                      <div
                        key={item.id || idx}
                        className="group relative rounded-2xl overflow-hidden bg-neutral-950 border border-gold/30 shadow-lg hover:border-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer"
                        onClick={() => setSelectedPost(item)}
                      >
                        {/* Media Container */}
                        <div className="aspect-square relative w-full bg-black flex items-center justify-center overflow-hidden">
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={item.caption || 'Instagram Post'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                                {isVideoOrReel ? '🎬' : '📸'}
                              </span>
                              <span className="text-xs text-amber-200/80 font-mono">
                                {INSTAGRAM_HANDLE}
                              </span>
                            </div>
                          )}

                          {/* Media Type Badges */}
                          <div className="absolute top-2.5 right-2.5 z-10">
                            {isVideoOrReel ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 backdrop-blur-md text-amber-300 border border-gold/40 shadow-sm">
                                <span>▶</span> Reel
                              </span>
                            ) : item.media_type === 'CAROUSEL_ALBUM' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 backdrop-blur-md text-goldLight border border-gold/40 shadow-sm">
                                <span>📑</span> Album
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 backdrop-blur-md text-gray-200 border border-white/20 shadow-sm">
                                <span>📷</span>
                              </span>
                            )}
                          </div>

                          {/* Hover Overlay with Action Icon */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-4 transition-opacity duration-300 text-center">
                            <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                              <span className="text-lg text-gold">
                                {isVideoOrReel ? '▶' : '🔍'}
                              </span>
                            </div>
                            <span className="text-xs text-amber-200 font-medium">
                              {isVideoOrReel ? 'Watch Reel' : 'View Post'}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-1">
                              {item.formatted_date}
                            </span>
                          </div>
                        </div>

                        {/* Caption & Metadata Footer */}
                        <div className="p-3.5 bg-neutral-900/90 flex-1 flex flex-col justify-between">
                          <p className="text-[11px] text-gray-300 font-light line-clamp-2 leading-relaxed">
                            {item.caption || `${INSTAGRAM_NAME} update`}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800 text-[10px] text-amber-200/70 font-mono">
                            <span>{item.formatted_date || 'Live'}</span>
                            <span className="text-gold group-hover:translate-x-0.5 transition-transform">
                              Open →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400 bg-neutral-900/60 rounded-3xl border border-gold/20">
                  <span className="text-4xl block mb-3">📭</span>
                  <p className="text-sm font-medium text-amber-200">No media items found in this category.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className="mt-3 px-4 py-1.5 rounded-full text-xs bg-gold/20 text-gold border border-gold/40 hover:bg-gold hover:text-black transition-colors"
                  >
                    View All Posts
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: EMBED VIEW */}
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

      {/* POST DETAILS & LIGHTBOX MODAL */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative bg-neutral-950 border border-gold/50 rounded-3xl max-w-2xl w-full overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/80 border border-gold/40 text-gold hover:bg-gold hover:text-black flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Media Preview */}
              <div className="relative aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-neutral-800">
                <img
                  src={selectedPost.thumbnail_url || selectedPost.media_url}
                  alt={selectedPost.caption || 'Instagram Post'}
                  className="w-full h-full object-contain"
                />
                {(selectedPost.is_reel || selectedPost.media_type === 'VIDEO') && (
                  <a
                    href={selectedPost.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                      <span className="text-2xl ml-1">▶</span>
                    </div>
                  </a>
                )}
              </div>

              {/* Post Metadata Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold flex items-center justify-center text-lg">
                    🪔
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-300 font-heading">{INSTAGRAM_NAME}</h4>
                    <p className="text-[11px] text-gray-400 font-mono">{INSTAGRAM_HANDLE}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-400 block">{selectedPost.formatted_date}</span>
                  <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">
                    {selectedPost.is_reel ? 'Reel' : selectedPost.media_type}
                  </span>
                </div>
              </div>

              {/* Post Caption */}
              <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed whitespace-pre-line">
                {selectedPost.caption || 'Ganesh Mahotsav divine darshan and live highlights.'}
              </p>

              {/* Open in Instagram Action Button */}
              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="px-5 py-2.5 rounded-xl text-xs text-gray-400 hover:text-white bg-neutral-900 border border-neutral-800"
                >
                  Close
                </button>
                <a
                  href={selectedPost.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-goldDark via-gold to-goldLight text-black hover:scale-105 transition-transform inline-flex items-center gap-2"
                >
                  <span>Open on Instagram</span>
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(Instagram);
