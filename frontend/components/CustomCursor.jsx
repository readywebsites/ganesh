'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let cursorPos = { x: -100, y: -100 };
    let followerPos = { x: -100, y: -100 };

    const onMouseMove = (e) => {
      cursorPos.x = e.clientX;
      cursorPos.y = e.clientY;
      cursor.style.transform = `translate3d(${cursorPos.x - 4}px, ${cursorPos.y - 4}px, 0)`;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let animId;
    const render = () => {
      followerPos.x += (cursorPos.x - followerPos.x) * 0.15;
      followerPos.y += (cursorPos.y - followerPos.y) * 0.15;
      follower.style.transform = `translate3d(${followerPos.x - 20}px, ${followerPos.y - 20}px, 0)`;
      animId = requestAnimationFrame(render);
    };
    render();

    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, .gallery-item, .about-card, .timeline-card, .video-card');
      if (target) {
        cursor.classList.add('hovered');
        follower.classList.add('hovered');
      } else {
        cursor.classList.remove('hovered');
        follower.classList.remove('hovered');
      }
    };

    document.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div className="custom-cursor" ref={cursorRef} style={{ top: 0, left: 0 }} />
      <div className="custom-cursor-follower" ref={followerRef} style={{ top: 0, left: 0 }} />
    </>
  );
}

