'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function TempleDoorScene({ scrollProgress = 0 }) {
  const leftDoorRef = useRef();
  const rightDoorRef = useRef();
  const idolGroupRef = useRef();
  const petalsRef = useRef([]);

  // Load Ganesh Idol Texture safely
  const texture = useLoader(THREE.TextureLoader, '/images/ganesh_idol_front.jpg');

  // Materials
  const goldMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffd700'),
      metalness: 1.0,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
    });
  }, []);

  const doorMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#241408'),
      metalness: 0.3,
      roughness: 0.4,
      clearcoat: 0.3,
      reflectivity: 0.5,
    });
  }, []);

  // Flower Petals
  const petals = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 8,
        y: Math.random() * 8 - 2,
        z: (Math.random() - 0.5) * 6,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        speedY: 0.008 + Math.random() * 0.008,
        scale: 0.08 + Math.random() * 0.06,
      });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Doors opening animation based on intro time / scroll
    const doorAngle = Math.min(Math.PI * 0.45, time * 0.35);
    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = -doorAngle;
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = doorAngle;
    }

    // Floating Idol Motion
    if (idolGroupRef.current) {
      idolGroupRef.current.rotation.y = time * 0.08;
      idolGroupRef.current.position.y = -0.4 + Math.sin(time * 1.4) * 0.05;
    }

    // Animate Petals
    petalsRef.current.forEach((petal, i) => {
      if (petal) {
        petal.position.y -= petals[i].speedY;
        petal.rotation.x += 0.01;
        petal.rotation.y += 0.01;
        if (petal.position.y < -3) {
          petal.position.y = 5;
        }
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#2b1a07" />
      <spotLight
        position={[3, 7, 5]}
        intensity={2.5}
        color="#fff4e0"
        angle={Math.PI / 4}
        penumbra={0.4}
        castShadow
      />
      <spotLight
        position={[-4, 4, 4]}
        intensity={2.0}
        color="#ffaa00"
        angle={Math.PI / 3}
        penumbra={0.5}
      />
      <pointLight position={[0, 2.5, -3.5]} intensity={2.0} color="#ffe57f" />
      <spotLight
        position={[0, -3.5, 2]}
        intensity={2.5}
        color="#e65c00"
        angle={Math.PI / 3}
        penumbra={0.5}
      />

      {/* Ancient Temple Doors Group */}
      <group position={[0, 0.2, 3.8]}>
        {/* Frame */}
        <mesh geometry={new THREE.BoxGeometry(4.4, 5.2, 0.3)} material={goldMaterial} position={[0, 0, 0]} />

        {/* Left Door */}
        <group ref={leftDoorRef} position={[-1.0, 0, 0]}>
          <mesh geometry={new THREE.BoxGeometry(2.0, 4.8, 0.15)} material={doorMaterial} position={[1.0, 0, 0]} castShadow />
          <mesh geometry={new THREE.BoxGeometry(1.7, 4.2, 0.18)} material={goldMaterial} position={[1.0, 0, 0]} />
          <mesh geometry={new THREE.TorusGeometry(0.18, 0.03, 12, 24)} material={goldMaterial} position={[1.5, 0, 0.12]} />
        </group>

        {/* Right Door */}
        <group ref={rightDoorRef} position={[1.0, 0, 0]}>
          <mesh geometry={new THREE.BoxGeometry(2.0, 4.8, 0.15)} material={doorMaterial} position={[-1.0, 0, 0]} castShadow />
          <mesh geometry={new THREE.BoxGeometry(1.7, 4.2, 0.18)} material={goldMaterial} position={[-1.0, 0, 0]} />
          <mesh geometry={new THREE.TorusGeometry(0.18, 0.03, 12, 24)} material={goldMaterial} position={[-1.5, 0, 0.12]} />
        </group>
      </group>

      {/* Pillars */}
      <group position={[-3.2, 0, -1.8]}>
        <mesh geometry={new THREE.CylinderGeometry(0.35, 0.4, 7, 16)} material={goldMaterial} castShadow />
        <mesh geometry={new THREE.BoxGeometry(1.0, 0.25, 1.0)} material={goldMaterial} position={[0, 3.5, 0]} />
        <mesh geometry={new THREE.BoxGeometry(1.0, 0.25, 1.0)} material={goldMaterial} position={[0, -3.5, 0]} />
      </group>

      <group position={[3.2, 0, -1.8]}>
        <mesh geometry={new THREE.CylinderGeometry(0.35, 0.4, 7, 16)} material={goldMaterial} castShadow />
        <mesh geometry={new THREE.BoxGeometry(1.0, 0.25, 1.0)} material={goldMaterial} position={[0, 3.5, 0]} />
        <mesh geometry={new THREE.BoxGeometry(1.0, 0.25, 1.0)} material={goldMaterial} position={[0, -3.5, 0]} />
      </group>

      {/* Ganesh Shrine & Idol */}
      <group ref={idolGroupRef} position={[0, -0.4, -0.5]}>
        {/* Halo & Base */}
        <mesh geometry={new THREE.TorusGeometry(1.6, 0.06, 12, 64)} material={goldMaterial} position={[0, 0.4, -0.2]} />
        <mesh geometry={new THREE.CylinderGeometry(1.5, 1.7, 0.2, 32)} material={goldMaterial} position={[0, -1.2, 0]} />

        {/* Idol Billboard Plane with User Texture */}
        <mesh position={[0, 0.2, 0.05]} castShadow>
          <planeGeometry args={[2.0, 2.4]} />
          <meshPhysicalMaterial
            map={texture}
            transparent
            side={THREE.DoubleSide}
            roughness={0.2}
            metalness={0.1}
            clearcoat={0.5}
          />
        </mesh>
      </group>

      {/* Falling Flower Petals */}
      {petals.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => (petalsRef.current[i] = el)}
          position={[p.x, p.y, p.z]}
          scale={p.scale}
        >
          <sphereGeometry args={[0.12, 8, 8, 0, Math.PI, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#c22300" roughness={0.5} metalness={0.1} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

export default function TempleDoors() {
  return (
    <div className="webgl-container">
      <Canvas
        camera={{ position: [0, 0.6, 6.2], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <TempleDoorScene />
      </Canvas>
    </div>
  );
}
