'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { getApiUrl } from '@/lib/api';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const gridRef = useRef(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await fetch(getApiUrl('/gallery/'), {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Gallery API failed');
        }

        const data = await response.json();

        const galleryItems = (data.results || [])
          .filter((item) => item.status === 'active')
          .map((item) => ({
            id: item.id,
            src: item.image,
            title: item.title || 'Mahotsav Photo',
            category: item.category || 'Darshan',
            alt: item.title || 'Ganesh Mahotsav',
            caption: item.caption || '',
          }));

        setItems(galleryItems);
      } catch (error) {
        console.error('Gallery loading error:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  useEffect(() => {
    if (!gridRef.current || items.length === 0) return;

    const cards = gridRef.current.querySelectorAll('.gallery-card');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 35 },
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

      setCurrentIndex((prev) =>
        prev === 0 ? items.length - 1 : prev - 1
      );
    },
    [items.length]
  );

  const nextImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();

      setCurrentIndex((prev) =>
        prev === items.length - 1 ? 0 : prev + 1
      );
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

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, closeLightbox, prevImage, nextImage]);

  const currentItem = items[currentIndex];

  return (
    <section id="gallery">
      <div className="gallery-wrapper">

        <div className="section-header">
          <span className="section-tag">
            Visual Splendor
          </span>

          <h2 className="heading-md section-title">
            TEMPLE PORTRAITS
          </h2>

          <div className="section-divider"></div>
        </div>

        {loading && (
          <div className="gallery-empty">
            Loading gallery...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="gallery-empty">
            No gallery images available.
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="gallery-grid" ref={gridRef}>
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
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
                    alt={item.alt}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw"
                    quality={90}
                    className="gallery-card-img object-cover w-full h-full"
                  />

                  <div className="gallery-card-overlay">
                    <span className="gallery-card-tag">
                      {item.category}
                    </span>

                    <h3 className="gallery-card-title">
                      {item.title}
                    </h3>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {lightboxOpen && currentItem && (
        <div
          className="lightbox active"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-dialog"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="lightbox-header">
              <span className="lightbox-counter-badge">
                {String(currentIndex + 1).padStart(2, '0')} /{' '}
                {String(items.length).padStart(2, '0')}
              </span>

              <button
                className="lightbox-close-btn"
                onClick={closeLightbox}
              >
                ✕
              </button>
            </div>

            <div className="lightbox-media-container">

              {items.length > 1 && (
                <button
                  className="lightbox-arrow-btn lightbox-arrow-prev"
                  onClick={prevImage}
                >
                  ‹
                </button>
              )}

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

              {items.length > 1 && (
                <button
                  className="lightbox-arrow-btn lightbox-arrow-next"
                  onClick={nextImage}
                >
                  ›
                </button>
              )}

            </div>

            <div className="lightbox-footer">
              <h3 className="lightbox-title">
                {currentItem.title}
              </h3>

              <p className="lightbox-category">
                {currentItem.category}
              </p>

              {currentItem.caption && (
                <p className="lightbox-category">
                  {currentItem.caption}
                </p>
              )}
            </div>

          </div>
        </div>
      )}
    </section>
  );
}

export default memo(Gallery);
