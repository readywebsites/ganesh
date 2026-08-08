'use client';

import { useState, useEffect, useRef, memo } from 'react';
import gsap from 'gsap';

const SCENES = [
  {
    id: 1,
    tag: 'SCENE 01 • MORNING SKY',
    title: 'The Sacred Temple Emerges',
    description: 'Soft moving clouds and morning fog drift as the ancient temple appears in the distance.',
  },
  {
    id: 2,
    tag: 'SCENE 02 • SANCTUARY APPROACH',
    title: 'Where Eternity Resides',
    description: 'Golden morning light hits the towering temple architecture in serene grandeur.',
  },
  {
    id: 3,
    tag: 'SCENE 03 • TEMPLE ENTRANCE',
    title: 'Unlocking the Sacred Doors',
    description: 'Carved wooden doors slowly open to welcome true seekers into holy tranquility.',
  },
  {
    id: 4,
    tag: 'SCENE 04 • SACRED CORRIDOR',
    title: 'Walk Through Golden Pillars',
    description: 'Incense smoke and floating dust particles dance around flickering oil lamps and temple bells.',
  },
  {
    id: 5,
    tag: 'SCENE 05 • GARBH GRUH',
    title: 'The Divine Presence',
    description: 'The sanctum sanctorum appears with a single focus — Lord Ganesha.',
  },
  {
    id: 6,
    tag: 'SCENE 06 • DIVINE AURA',
    title: 'Golden Light & Wisdom',
    description: 'Volumetric god rays and a glowing halo encompass the divine idol.',
  },
  {
    id: 7,
    tag: 'SCENE 07 • DIVINE BLESSING',
    title: 'Receive Eternal Grace',
    description: 'Abhaya Mudra — "Fear Not, For Wisdom & Peace Are Bestowed Upon You."',
  },
];

function CinematicStoryOverlay() {
  const overlayRef = useRef(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const heroEl = document.getElementById('home');
          const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;
          const scrollY = window.scrollY;

          // Show overlay ONLY while Hero section is visible (within Hero section bounds)
          const inHero = scrollY < heroHeight * 0.85;

          if (inHero) {
            if (!isVisibleRef.current) {
              isVisibleRef.current = true;
              setIsHeroVisible(true);
            }

            // Calculate scene index based on scroll progress inside the Hero section
            const progress = Math.min(1, Math.max(0, scrollY / Math.max(1, heroHeight * 0.75)));
            const index = Math.min(SCENES.length - 1, Math.floor(progress * SCENES.length));
            setCurrentSceneIndex(index);
          } else {
            if (isVisibleRef.current) {
              isVisibleRef.current = false;
              setIsHeroVisible(false);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP soft opacity fade transition
  useEffect(() => {
    if (!overlayRef.current) return;

    if (isHeroVisible) {
      gsap.killTweensOf(overlayRef.current);
      overlayRef.current.style.visibility = 'visible';
      gsap.to(overlayRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
      });
    } else {
      gsap.killTweensOf(overlayRef.current);
      gsap.to(overlayRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.95,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          if (overlayRef.current && !isVisibleRef.current) {
            overlayRef.current.style.visibility = 'hidden';
          }
        },
      });
    }
  }, [isHeroVisible]);

  const activeScene = SCENES[currentSceneIndex];

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed bottom-10 left-0 right-0 z-20 flex justify-center px-4 md:px-6 will-change-transform"
    >
      <div className="relative max-w-2xl w-full text-center p-6 md:p-8 rounded-2xl border border-gold/30 bg-black/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top Metallic Sheen Bar */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-goldLight/60 to-transparent" />

        {/* Scene Tagline & Step Counter */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-mono text-goldLight/90 font-semibold">
            {activeScene.tag}
          </span>
          <span className="text-[10px] font-mono tracking-widest text-gold/70 bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/20">
            0{currentSceneIndex + 1} / 0{SCENES.length}
          </span>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-white via-goldLight to-amber-200 tracking-wide mb-2 font-bold">
          {activeScene.title}
        </h2>
        <p className="text-xs md:text-sm text-gray-300 font-body leading-relaxed opacity-90 max-w-xl mx-auto">
          {activeScene.description}
        </p>

        {/* Apple Style Scene Progress Dots */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {SCENES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                i === currentSceneIndex
                  ? 'w-8 bg-gradient-to-r from-gold to-goldLight shadow-[0_0_12px_rgba(212,175,55,0.8)]'
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(CinematicStoryOverlay);

