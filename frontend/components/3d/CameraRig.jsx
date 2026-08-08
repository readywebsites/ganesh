'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Waypoints mapping 7 Cinematic Story Scenes + Interactive Portal
const WAYPOINTS = [
  // Scene 1: Morning Sky & Distant Temple
  { pos: [0, 3.2, 19.0], target: [0, 2.2, 0.0] },
  // Scene 2: Approaching Massive Temple Facade
  { pos: [0, 1.8, 12.5], target: [0, 2.0, 0.0] },
  // Scene 3: Temple Entrance & Doors Opening
  { pos: [0, 1.4, 8.5], target: [0, 1.5, -2.0] },
  // Scene 4: Walking through Golden Corridor & Incense Smoke
  { pos: [0, 1.2, 4.0], target: [0, 1.2, -3.5] },
  // Scene 5: Garbh Gruh Appears (Sole Focus on Ganesha)
  { pos: [0, 1.0, 0.8], target: [0, 0.8, -3.5] },
  // Scene 6: Golden Aura & Volumetric Bloom Approach
  { pos: [0, 0.75, -1.2], target: [0, 0.7, -3.5] },
  // Scene 7: Extreme Close-Up & Divine Blessing
  { pos: [0, 0.85, -2.2], target: [0, 1.35, -3.5] },
  // Scene 8: About Section
  { pos: [-2.5, 1.2, -1.5], target: [0.5, 0.8, -5.0] },
  // Scene 9: Timeline Section
  { pos: [2.5, 1.3, -8.5], target: [-0.5, 1.0, -12.0] },
  // Scene 10: 3D Museum Gallery
  { pos: [-1.2, 1.6, -16.0], target: [0, 1.5, -18.5] },
  // Scene 11: Video Reels & Cinema
  { pos: [1.2, 1.6, -24.0], target: [0, 1.6, -26.5] },
  // Scene 12: Membership Glass Sanctum
  { pos: [-1.5, 1.3, -32.0], target: [-3.0, 1.2, -34.5] },
  // Scene 13: Sewa & Offering Altar
  { pos: [1.5, 1.2, -39.5], target: [3.0, 0.8, -42.5] },
  // Scene 14: Map & Location Pavilion
  { pos: [0, 1.6, -47.0], target: [0, 1.2, -50.5] },
  // Scene 15: Courtyard Lotus Pond & Contact
  { pos: [0, 2.0, -54.0], target: [0, 0.8, -62.0] },
];

export function CameraRig() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const currentPos = useRef(new THREE.Vector3(0, 3.2, 19.0));
  const currentTarget = useRef(new THREE.Vector3(0, 2.2, 0.0));

  useFrame((state, delta) => {
    const maxScroll = typeof window !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1;
    const scrollProgress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;

    // Fractional index across 15 smooth waypoints
    const totalSegments = WAYPOINTS.length - 1;
    const progress = Math.max(0, Math.min(1, scrollProgress));
    const rawIndex = progress * totalSegments;
    const index = Math.floor(rawIndex);
    const fraction = rawIndex - index;

    // Bezier ease-in-out curve for cinematic feel
    const easedFraction = fraction < 0.5
      ? 2 * fraction * fraction
      : 1 - Math.pow(-2 * fraction + 2, 2) / 2;

    const currentWaypoint = WAYPOINTS[index] || WAYPOINTS[0];
    const nextWaypoint = WAYPOINTS[Math.min(totalSegments, index + 1)] || currentWaypoint;

    // Interpolate camera position
    const targetX = THREE.MathUtils.lerp(currentWaypoint.pos[0], nextWaypoint.pos[0], easedFraction);
    const targetY = THREE.MathUtils.lerp(currentWaypoint.pos[1], nextWaypoint.pos[1], easedFraction);
    const targetZ = THREE.MathUtils.lerp(currentWaypoint.pos[2], nextWaypoint.pos[2], easedFraction);

    // Interpolate camera target
    const lookX = THREE.MathUtils.lerp(currentWaypoint.target[0], nextWaypoint.target[0], easedFraction);
    const lookY = THREE.MathUtils.lerp(currentWaypoint.target[1], nextWaypoint.target[1], easedFraction);
    const lookZ = THREE.MathUtils.lerp(currentWaypoint.target[2], nextWaypoint.target[2], easedFraction);

    // Subtle mouse parallax depth offset
    const parallaxX = mouseRef.current.x * 0.18;
    const parallaxY = -mouseRef.current.y * 0.12;

    // Smooth lerp dampening
    const dampSpeed = 2.4;
    currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, targetX + parallaxX, dampSpeed, delta);
    currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, targetY + parallaxY, dampSpeed, delta);
    currentPos.current.z = THREE.MathUtils.damp(currentPos.current.z, targetZ, dampSpeed, delta);

    currentTarget.current.x = THREE.MathUtils.damp(currentTarget.current.x, lookX + parallaxX * 0.4, dampSpeed, delta);
    currentTarget.current.y = THREE.MathUtils.damp(currentTarget.current.y, lookY + parallaxY * 0.4, dampSpeed, delta);
    currentTarget.current.z = THREE.MathUtils.damp(currentTarget.current.z, lookZ, dampSpeed, delta);

    // Subtle breathing motion
    const time = state.clock.getElapsedTime();
    currentPos.current.y += Math.sin(time * 0.5) * 0.012;

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
}
