'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.8,
    });

    if (typeof window !== 'undefined') {
      window.__lenis = lenis;
      window.lenis = lenis;
    }

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      if (typeof window !== 'undefined') {
        if (window.__lenis === lenis) window.__lenis = null;
        if (window.lenis === lenis) window.lenis = null;
      }
      lenis.destroy();
    };
  }, []);
}
