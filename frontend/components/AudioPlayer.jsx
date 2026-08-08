'use client';

import { useState, useRef, memo } from 'react';

function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay policy fallback
      });
    }
  };

  return (
    <div className="audio-player-wrapper">
      <audio
        ref={audioRef}
        loop
        preload="none"
        src="/audio/temple_ambient.mp3"
      />
      <button
        className={`audio-toggle-btn ${isPlaying ? 'playing' : ''}`}
        onClick={toggleAudio}
        aria-label={isPlaying ? 'Mute Spiritual Ambient Sound' : 'Play Spiritual Ambient Sound'}
        title={isPlaying ? 'Mute Temple Chants' : 'Play Temple Ambient Chants'}
      >
        <div className="equalizer-icon">
          <span className="bar bar-1"></span>
          <span className="bar bar-2"></span>
          <span className="bar bar-3"></span>
          <span className="bar bar-4"></span>
        </div>
        <span className="audio-label">{isPlaying ? 'Divine Audio ON' : 'Audio OFF'}</span>
      </button>
    </div>
  );
}

export default memo(AudioPlayer);

