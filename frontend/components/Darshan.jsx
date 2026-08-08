'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { getApiUrl } from '@/lib/api';

function Darshan() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveUrls, setLiveUrls] = useState({
    youtubeLiveUrl: '',
    facebookLiveUrl: '',
    instagramLiveUrl: '',
  });
  const videoRef = useRef(null);

  useEffect(() => {
    fetch(getApiUrl('/darshan'))
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setLiveUrls(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <section id="darshan">
      <div className="section-wrapper">
        <div className="section-header">
          <span className="section-tag">Direct Stream</span>
          <h2 className="heading-md section-title">LIVE RITUAL FEED</h2>
          <div className="section-divider"></div>
        </div>

        <div className="darshan-container">
          <div className={`darshan-frame border-shimmer ${isPlaying ? 'darshan-active' : ''}`}>
            {/* Status tag overlay */}
            <div className="darshan-status">
              <div className="darshan-pulse"></div>
              Live Stream
            </div>

            {/* Intro Play overlay */}
            {!isPlaying && (
              <div className="darshan-overlay">
                <button
                  className="play-darshan-btn"
                  onClick={handlePlay}
                  aria-label="Play Live Darshan"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5V19L19 12L8 5Z" />
                  </svg>
                </button>
                <h3 className="darshan-title">Behold The Divine Aarti</h3>
                {liveUrls.youtubeLiveUrl && (
                  <p className="text-xs text-amber-200/80 mt-1">Live YouTube & Facebook Streaming Active</p>
                )}
              </div>
            )}

            {/* High quality temple loop visual stream or Live Stream Embed */}
            {isPlaying && liveUrls.youtubeLiveUrl && liveUrls.youtubeLiveUrl.includes('embed') ? (
              <iframe
                src={`${liveUrls.youtubeLiveUrl}?autoplay=1`}
                className="w-full h-full min-h-[400px] border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              ></iframe>
            ) : (
              <video
                ref={videoRef}
                className="darshan-video"
                loop
                muted
                playsInline
                preload="metadata"
                controls={isPlaying}
                onPause={handlePause}
              >
                <source src="/videos/darshan_live.mp4" type="video/mp4" />
                Your browser does not support HTML5 video loops.
              </video>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Darshan);
