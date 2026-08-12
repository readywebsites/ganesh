'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const TOTAL_FRAMES = 240;
const FRAME_PATH = (index) => `/frames/frame_${String(index + 1).padStart(3, '0')}.webp`;

export default function TempleWorldCanvas() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas) return;

    // Hardware-accelerated 2D context (alpha: false for 2x performance)
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });
    if (!ctx) return;

    let animationFrameId = null;
    let scrollTriggerInstance = null;

    // Internal Ref State (0 React re-renders during scroll)
    const seqState = {
      targetFrame: 0,
      currentFrame: 0,
      lastDrawnFrame: -1,
    };

    // Initialize Image Objects
    imagesRef.current = new Array(TOTAL_FRAMES);

    // Preload critical initial frames first, then stream remaining frames
    let loadedInitialCount = 0;
    const initialBatchSize = 30;

    const loadFrame = (index) => {
      if (imagesRef.current[index]) return imagesRef.current[index];
      const img = new Image();
      img.src = FRAME_PATH(index);
      imagesRef.current[index] = img;
      return img;
    };

    // Preload first 30 frames for instant display
    for (let i = 0; i < initialBatchSize; i++) {
      const img = loadFrame(i);
      img.onload = () => {
        loadedInitialCount++;
        if (loadedInitialCount >= 5 && container) {
          container.style.opacity = '1';
        }
        if (i === 0) drawCanvasFrame();
      };
    }

    // Preload remaining frames lazily in chunks
    const preloadRemaining = () => {
      let idx = initialBatchSize;
      const step = () => {
        const end = Math.min(TOTAL_FRAMES, idx + 10);
        for (; idx < end; idx++) {
          loadFrame(idx);
        }
        if (idx < TOTAL_FRAMES) {
          if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(step);
          } else {
            setTimeout(step, 40);
          }
        }
      };
      step();
    };

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(preloadRemaining);
    } else {
      setTimeout(preloadRemaining, 100);
    }

    // High-DPI Canvas Resize & Cover Math
    const resizeCanvas = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      drawCanvasFrame();
    };

    // Fast Canvas Render function with Object-fit: cover math
    const drawCanvasFrame = () => {
      if (!ctx || !canvas) return;
      const frameIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(seqState.currentFrame)));
      const img = imagesRef.current[frameIdx] || imagesRef.current[0];

      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const vw = img.naturalWidth || 1280;
      const vh = img.naturalHeight || 720;

      const ratio = Math.max(cw / vw, ch / vh);
      const nw = vw * ratio;
      const nh = vh * ratio;
      const offsetX = (cw - nw) / 2;
      const offsetY = (ch - nh) / 2;

      ctx.drawImage(img, offsetX, offsetY, nw, nh);
      seqState.lastDrawnFrame = frameIdx;
    };

    // 60 FPS Animation & Lerp Loop
    const tick = () => {
      // Apple Signature Smooth Lerp Inertia
      seqState.currentFrame += (seqState.targetFrame - seqState.currentFrame) * 0.16;

      const currentRounded = Math.round(seqState.currentFrame);
      if (currentRounded !== seqState.lastDrawnFrame) {
        // Ensure image at current frame is loaded
        loadFrame(currentRounded);
        drawCanvasFrame();
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Start 60 FPS loop
    animationFrameId = requestAnimationFrame(tick);

    // GSAP ScrollTrigger Frame Controller
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: false, // Lerp is handled by internal RAF tick for 100% fluid response
      onUpdate: (self) => {
        const storyProgress = Math.min(1, Math.max(0, self.progress / 0.75));
        seqState.targetFrame = storyProgress * (TOTAL_FRAMES - 1);
      },
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (scrollTriggerInstance) scrollTriggerInstance.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F7F3EA] transition-opacity duration-700 ease-out opacity-0"
      style={{ willChange: 'opacity' }}
      aria-hidden="true"
    >
      {/* Fullscreen Hardware-Accelerated 60 FPS Image Sequence Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ willChange: 'transform', transform: 'translate3d(0,0,0)' }}
      />

      {/* Warm Cream Vignette & Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7EF]/60 via-[#FAF7EF]/10 to-[#F7F3EA]/80 pointer-events-none z-1" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_20%,rgba(247,243,234,0.65)_100%)] pointer-events-none z-1" />

      {/* Dynamic Golden Bloom Overlay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(184,154,74,0.18)_0%,transparent_70%)] pointer-events-none z-1 mix-blend-multiply blur-3xl animate-pulse" />
    </div>
  );
}
