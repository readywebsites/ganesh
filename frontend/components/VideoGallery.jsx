'use client';

import { useState, useRef, memo } from 'react';

const videoList = [
  {
    src: '/videos/darshan_live.mp4',
    title: 'Live Divine Aarti Stream',
    desc: 'Sacred evening lamp offering and traditional Vedic chants',
    tag: 'LIVE AARTI',
  },
  {
    src: '/videos/aarti_ritual.mp4',
    title: 'Maha Aarti Ceremony',
    desc: 'Dhol tasha rhythm, brass bells & lamp invocation',
    tag: 'RITUALS',
  },
  {
    src: '/videos/ganesh_video_3.mp4',
    title: 'Deepotsav Illumination',
    desc: 'Glowing oil lamps across temple courtyard grounds',
    tag: 'FESTIVITIES',
  },
  {
    src: '/videos/ganesh_video_4.mp4',
    title: 'Visarjan Send-off',
    desc: 'Emotional send-off procession under saffron colors',
    tag: 'PROCESSION',
  },
  {
    src: '/videos/ganesh_video_5.mp4',
    title: 'Inner Sanctum Sanctuary',
    desc: 'Divine close-up atmosphere of Vinayaka idol',
    tag: 'DARSHAN',
  },
  {
    src: '/videos/ganesh_video_6.mp4',
    title: 'Puspa Seva Flower Offerings',
    desc: 'Fresh marigold shower & sacred chanting',
    tag: 'OFFERINGS',
  },
];

function VideoGallery() {
  const [activeVideo, setActiveVideo] = useState(null);

  const openCinemaMode = (video) => {
    setActiveVideo(video);
  };

  const closeCinemaMode = () => {
    setActiveVideo(null);
  };

  return (
    <section id="videos">
      <div className="section-wrapper">
        <div className="section-header">
          <span className="section-tag">Sacred Video Reels</span>
          <h2 className="heading-md section-title">DIVINE VIDEO GALLERY</h2>
          <div className="section-divider"></div>
        </div>

        <div className="video-grid">
          {videoList.map((item, idx) => (
            <VideoCard key={idx} item={item} onSelect={openCinemaMode} />
          ))}
        </div>
      </div>

      {/* Cinema Mode Lightbox Modal */}
      {activeVideo && (
        <div
          className="cinema-modal active"
          onClick={closeCinemaMode}
        >
          <button
            className="cinema-close"
            onClick={closeCinemaMode}
            aria-label="Exit Cinema Mode"
          >
            &times;
          </button>
          <div
            className="cinema-content"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              className="cinema-video"
              src={activeVideo.src}
              controls
              autoPlay
              playsInline
            />
            <h3 className="cinema-title">{activeVideo.title}</h3>
          </div>
        </div>
      )}
    </section>
  );
}

const VideoCard = memo(function VideoCard({ item, onSelect }) {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="video-card glass-card gold-pulse-border"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(item)}
    >
      <div className="video-preview-wrapper">
        <video
          ref={videoRef}
          className="video-preview"
          loop
          muted
          playsInline
          preload="none"
        >
          <source src={item.src} type="video/mp4" />
        </video>
        <div className="video-card-overlay">
          <div className="play-icon-circle">
            <svg viewBox="0 0 24 24">
              <path d="M8 5V19L19 12L8 5Z" />
            </svg>
          </div>
          <span className="video-tag">{item.tag}</span>
        </div>
      </div>
      <div className="video-card-info">
        <h4>{item.title}</h4>
        <p>{item.desc}</p>
      </div>
    </div>
  );
});

export default memo(VideoGallery);

