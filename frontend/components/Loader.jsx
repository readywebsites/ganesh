'use client';

import { useState, useEffect } from 'react';

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 20) + 15;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setHidden(true);
        }, 200);
      } else {
        setProgress(current);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  if (hidden) return null;

  return (
    <div
      className="preloader"
      style={{
        opacity: progress === 100 ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      <div className="loader-logo">
        <img
          src="/logo/official_logo.webp"
          alt="Surat Cha Gaurinandan Official Logo"
          className="loader-logo-img"
          width="120"
          height="120"
        />
      </div>
      <div className="loader-spinner"></div>
      <div className="loader-progress">
        Loading Divine Experience: <span>{progress}%</span>
      </div>
    </div>
  );
}

