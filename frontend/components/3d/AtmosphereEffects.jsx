'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function AtmosphereEffects() {
  const petalsGroupRef = useRef();
  const dustRef = useRef();
  const smokeRef = useRef();
  const birdsGroupRef = useRef();
  const cloudsGroupRef = useRef();

  // 1. Soft Moving Clouds (Scene 1 & 2 - Sky)
  const clouds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      arr.push({
        position: [
          (Math.random() - 0.5) * 40,
          8 + Math.random() * 6,
          10 - Math.random() * 40,
        ],
        scale: [6 + Math.random() * 8, 3 + Math.random() * 4, 1],
        speed: 0.05 + Math.random() * 0.08,
        opacity: 0.15 + Math.random() * 0.2,
      });
    }
    return arr;
  }, []);

  // 2. Flying Birds (Scene 1 - Morning Sky)
  const birds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 9; i++) {
      arr.push({
        position: [
          -15 + i * 2.2 + (Math.random() - 0.5) * 2,
          9 + Math.sin(i) * 1.2,
          12 - i * 1.5,
        ],
        speed: 0.08 + Math.random() * 0.03,
        wingPhase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  // 3. Falling Marigold Petals
  const petalCount = 70;
  const petalGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.14, 8, 8, 0, Math.PI, 0, Math.PI / 2);
  }, []);

  const petals = useMemo(() => {
    const arr = [];
    for (let i = 0; i < petalCount; i++) {
      arr.push({
        position: [
          (Math.random() - 0.5) * 18,
          Math.random() * 22 - 4,
          (Math.random() - 0.5) * 65 - 10,
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: 0.06 + Math.random() * 0.08,
        speedY: 0.006 + Math.random() * 0.012,
        swaySpeed: 1 + Math.random() * 2,
        color: Math.random() > 0.35 ? '#e63900' : '#ffb700',
      });
    }
    return arr;
  }, []);

  // Materials for Petals
  const petalMaterialRed = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d92600'),
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
  }, []);

  const petalMaterialGold = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffaa00'),
      roughness: 0.5,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
  }, []);

  // 4. Golden Dust Sparkles
  const dustCount = 350;
  const dustPositions = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = Math.random() * 16 - 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 75 - 12;
    }
    return pos;
  }, []);

  // 5. Rising Incense Smoke Particles
  const smokeCount = 120;
  const smokePositions = useMemo(() => {
    const pos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = -3 - Math.random() * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Animate Soft Clouds
    if (cloudsGroupRef.current) {
      cloudsGroupRef.current.children.forEach((cloud, i) => {
        const c = clouds[i];
        if (cloud && c) {
          cloud.position.x += c.speed * 0.04;
          if (cloud.position.x > 25) {
            cloud.position.x = -25;
          }
        }
      });
    }

    // Animate Flying Birds (wing flapping & gliding forward)
    if (birdsGroupRef.current) {
      birdsGroupRef.current.children.forEach((bird, i) => {
        const b = birds[i];
        if (bird && b) {
          bird.position.x += b.speed * 0.12;
          bird.position.y += Math.sin(time * 2 + b.wingPhase) * 0.005;
          // Wing flap motion (left and right wing scaling/rotation)
          const wingAngle = Math.sin(time * 8 + b.wingPhase) * 0.35;
          if (bird.children[0]) bird.children[0].rotation.z = wingAngle;
          if (bird.children[1]) bird.children[1].rotation.z = -wingAngle;

          if (bird.position.x > 22) {
            bird.position.x = -22;
          }
        }
      });
    }

    // Animate Flower Petals
    if (petalsGroupRef.current) {
      petalsGroupRef.current.children.forEach((child, i) => {
        const p = petals[i];
        if (child && p) {
          child.position.y -= p.speedY;
          child.position.x += Math.sin(time * p.swaySpeed + i) * 0.003;
          child.rotation.x += 0.01;
          child.rotation.y += 0.015;

          if (child.position.y < -4) {
            child.position.y = 14;
            child.position.x = (Math.random() - 0.5) * 18;
          }
        }
      });
    }

    // Animate Dust Particles
    if (dustRef.current) {
      dustRef.current.rotation.y = time * 0.015;
    }

    // Animate Incense Smoke Rising
    if (smokeRef.current) {
      const positions = smokeRef.current.geometry.attributes.position.array;
      for (let i = 0; i < smokeCount; i++) {
        positions[i * 3 + 1] += 0.015; // move Y up
        positions[i * 3] += Math.sin(time * 1.5 + i) * 0.002; // drift X
        if (positions[i * 3 + 1] > 9) {
          positions[i * 3 + 1] = 0;
          positions[i * 3] = (Math.random() - 0.5) * 3;
        }
      }
      smokeRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Soft Moving Morning Clouds (Scene 1 & 2) */}
      <group ref={cloudsGroupRef}>
        {clouds.map((c, i) => (
          <mesh key={i} position={c.position} scale={c.scale}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              color="#d6be9c"
              transparent
              opacity={c.opacity}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Flying Birds in Morning Sky */}
      <group ref={birdsGroupRef}>
        {birds.map((b, i) => (
          <group key={i} position={b.position}>
            {/* Left Wing */}
            <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.3, 0.02, 0.08]} />
              <meshBasicMaterial color="#221810" />
            </mesh>
            {/* Right Wing */}
            <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.2]}>
              <boxGeometry args={[0.3, 0.02, 0.08]} />
              <meshBasicMaterial color="#221810" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Falling Marigold Flower Petals */}
      <group ref={petalsGroupRef}>
        {petals.map((p, i) => (
          <mesh
            key={i}
            geometry={petalGeometry}
            position={p.position}
            rotation={p.rotation}
            scale={p.scale}
            material={p.color === '#e63900' ? petalMaterialRed : petalMaterialGold}
          />
        ))}
      </group>

      {/* Floating Golden Dust Sparkles */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dustCount}
            array={dustPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          color="#ffe57f"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Rising Incense Smoke Column */}
      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={smokeCount}
            array={smokePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          color="#cfbca4"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Atmospheric Warm Volumetric Spotlights & Lights */}
      <pointLight position={[0, 5, -3.5]} intensity={3.0} color="#ffa500" distance={16} />
      <pointLight position={[-4, 3.5, -15]} intensity={2.0} color="#ffb700" distance={14} />
      <pointLight position={[4, 3.5, -35]} intensity={2.0} color="#ff9900" distance={14} />
    </>
  );
}
