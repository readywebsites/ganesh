'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { getApiUrl } from '@/lib/api';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const initialGallery = [
  {
    src: '/images/ganesh_idol_front.webp',
    title: 'Lord of Auspiciousness',
    category: 'Idol Front View',
    alt: 'Surat Cha Gaurinandan Ganesh Idol Front View',
  },
  {
    src: '/images/ganesh_idol_angle.webp',
    title: 'Vedic Sanctuary Splendor',
    category: 'Idol Angle View',
    alt: 'Surat Cha Gaurinandan Ganesh Idol Angle View',
  },
  {
    src: '/images/ganesh_closeup.webp',
    title: 'Divine Close-up Darshan',
    category: 'Close-up Photo',
    alt: 'Surat Cha Gaurinandan Ganesh Close-up Portrait',
  },
  {
    src: '/images/temple_door_poster.webp',
    title: 'Sanctuary Entrance Arch',
    category: 'Temple Door Poster',
    alt: 'Ancient Temple Entrance Arch Poster',
  },
  {
    src: '/images/instagram_story.webp',
    title: 'Mahotsav Story Art',
    category: 'Instagram Artwork',
    alt: 'Surat Cha Gaurinandan Mahotsav Story Artwork',
  },
];

function Gallery() {
  const [items, setItems] = useState(initialGallery);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const gridRef = useRef(null);

  useEffect(() => {
    fetch(getApiUrl('/gallery'))
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          const apiItems = data.data.map((item) => ({
            src: item.imageUrl,
            title: item.title || 'Mahotsav Photo',
            category: item.category || 'Darshan',
            alt: item.title || 'Surat Cha Gaurinandan Mahotsav',
          }));
          setItems(apiItems);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!gridRef.current || typeof window === 'undefined') return;

    const cards = gridRef.current.querySelectorAll('.gallery-card');
    if (!cards || cards.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 35,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [items]);

  const openLightbox = useCallback((index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  const prevImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    },
    [items.length]
  );

  const nextImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    },
    [items.length]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, prevImage, nextImage]);

  const currentItem = items[currentIndex] || items[0];

  return (
    <section id="gallery">
      <div className="gallery-wrapper">
        <div className="section-header">
          <span className="section-tag">Visual Splendor</span>
          <h2 className="heading-md section-title">TEMPLE PORTRAITS</h2>
          <div className="section-divider"></div>
        </div>

        <div className="gallery-grid" ref={gridRef}>
          {items.map((item, idx) => {
            const isFirstRow = idx < 4;
            return (
              <div
                key={idx}
                className="gallery-card group"
                onClick={() => openLightbox(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(idx);
                  }
                }}
              >
                <div className="gallery-card-aspect">
                  <Image
                    src={item.src}
                    alt={item.alt || item.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw"
                    quality={90}
                    priority={isFirstRow}
                    loading={isFirstRow ? undefined : 'lazy'}
                    className="gallery-card-img object-cover w-full h-full"
                  />
                  <div className="gallery-card-overlay">
                    <span className="gallery-card-tag">{item.category}</span>
                    <h3 className="gallery-card-title">{item.title}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Glass Modal */}
      {lightboxOpen && currentItem && (
        <div
          className={`lightbox ${lightboxOpen ? 'active' : ''}`}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox"
        >
          <div
            className="lightbox-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <span className="lightbox-counter-badge">
                {String(currentIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
              <button
                className="lightbox-close-btn"
                onClick={closeLightbox}
                aria-label="Close Lightbox"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="lightbox-media-container">
              <button
                className="lightbox-arrow-btn lightbox-arrow-prev"
                onClick={prevImage}
                aria-label="Previous Image"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={currentItem.src}
                  alt={currentItem.title}
                  fill
                  sizes="100vw"
                  quality={95}
                  priority
                  className="lightbox-img-element"
                />
              </div>

              <button
                className="lightbox-arrow-btn lightbox-arrow-next"
                onClick={nextImage}
                aria-label="Next Image"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <div className="lightbox-footer">
              <h3 className="lightbox-title">{currentItem.title}</h3>
              <p className="lightbox-category">{currentItem.category}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(Gallery);
