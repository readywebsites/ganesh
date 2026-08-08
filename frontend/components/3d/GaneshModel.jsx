'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Photorealistic 3D Golden Ganesh Idol
function ProceduralGaneshIdol() {
  const groupRef = useRef();
  const auraRaysRef = useRef();
  const blessingHandRef = useRef();

  // Premium Metallic Gold, Bronze & Jewel Materials
  const goldMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffd700'),
      emissive: new THREE.Color('#442500'),
      emissiveIntensity: 0.25,
      metalness: 0.96,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
    });
  }, []);

  const crownGoldMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffaa00'),
      emissive: new THREE.Color('#662d00'),
      emissiveIntensity: 0.35,
      metalness: 1.0,
      roughness: 0.1,
      clearcoat: 1.0,
    });
  }, []);

  const rubyMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ff0033'),
      emissive: new THREE.Color('#b30018'),
      emissiveIntensity: 0.6,
      metalness: 0.2,
      roughness: 0.08,
      transmission: 0.7,
      ior: 1.8,
    });
  }, []);

  const emeraldMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#00e676'),
      emissive: new THREE.Color('#006633'),
      emissiveIntensity: 0.5,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.6,
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle breathing / levitation motion
      groupRef.current.position.y = Math.sin(time * 1.4) * 0.03;
    }
    if (auraRaysRef.current) {
      // Slow rotation of divine halo rays
      auraRaysRef.current.rotation.z = time * 0.15;
    }
    if (blessingHandRef.current) {
      // Subtle pulse on Abhaya Mudra blessing hand
      blessingHandRef.current.rotation.z = -0.4 + Math.sin(time * 2.0) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Divine Golden Aura Halo & Rays (Behind Head) */}
      <group position={[0, 1.5, -0.25]}>
        <mesh material={crownGoldMat}>
          <torusGeometry args={[1.35, 0.05, 16, 64]} />
        </mesh>
        <mesh material={goldMat} position={[0, 0, -0.02]}>
          <cylinderGeometry args={[1.3, 1.3, 0.02, 32]} />
          <meshBasicMaterial color="#ffe899" transparent opacity={0.3} />
        </mesh>

        {/* Outer Glowing Golden Aura Light Disk */}
        <pointLight position={[0, 0, 0.3]} intensity={4.5} color="#ffbb00" distance={6} />

        {/* Rotating Sun Rays around Halo */}
        <group ref={auraRaysRef}>
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0]}
                rotation={[0, 0, angle - Math.PI / 2]}
                material={crownGoldMat}
              >
                <coneGeometry args={[0.045, 0.45, 4]} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* Ornate Lotus Pedestal Base */}
      <group position={[0, -0.9, 0]}>
        <mesh material={goldMat} castShadow receiveShadow>
          <cylinderGeometry args={[1.35, 1.55, 0.35, 32]} />
        </mesh>
        <mesh material={crownGoldMat} position={[0, -0.2, 0]}>
          <torusGeometry args={[1.5, 0.06, 16, 64]} />
        </mesh>
        {/* Double Tier Lotus Petals */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh
                position={[0, 0.12, 1.4]}
                rotation={[0.35, 0, 0]}
                material={crownGoldMat}
                scale={[1.1, 0.3, 2.0]}
              >
                <sphereGeometry args={[0.3, 16, 16]} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Main Body (Lambodara Torso & Dhoti) */}
      <group position={[0, 0, 0]}>
        {/* Seated Crossed Legs */}
        <mesh material={goldMat} position={[0, -0.45, 0]} castShadow>
          <cylinderGeometry args={[0.9, 1.15, 0.65, 24]} />
        </mesh>

        {/* Sacred Golden Belly (Lambodara) */}
        <mesh material={goldMat} position={[0, 0.25, 0.12]} scale={[1, 0.92, 0.95]} castShadow>
          <sphereGeometry args={[0.8, 24, 24]} />
        </mesh>

        {/* Golden Janva / Sacred Thread across torso */}
        <mesh material={crownGoldMat} position={[0.05, 0.5, 0.25]} rotation={[0.4, 0.2, -0.8]}>
          <torusGeometry args={[0.65, 0.03, 12, 32]} />
        </mesh>

        {/* Broad Devine Chest & Shoulders */}
        <mesh material={goldMat} position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.78, 0.75, 24]} />
        </mesh>

        {/* Elephant Head */}
        <mesh material={goldMat} position={[0, 1.5, 0.08]} castShadow>
          <sphereGeometry args={[0.54, 24, 24]} />
        </mesh>

        {/* Large Royal Elephant Ears */}
        <group position={[-0.65, 1.5, 0]} rotation={[0, -0.28, -0.15]}>
          <mesh material={goldMat} castShadow>
            <boxGeometry args={[0.65, 0.65, 0.06]} />
          </mesh>
          <mesh material={crownGoldMat} position={[0, 0, 0.04]}>
            <boxGeometry args={[0.5, 0.5, 0.02]} />
          </mesh>
        </group>
        <group position={[0.65, 1.5, 0]} rotation={[0, 0.28, 0.15]}>
          <mesh material={goldMat} castShadow>
            <boxGeometry args={[0.65, 0.65, 0.06]} />
          </mesh>
          <mesh material={crownGoldMat} position={[0, 0, 0.04]}>
            <boxGeometry args={[0.5, 0.5, 0.02]} />
          </mesh>
        </group>

        {/* Curved Elephant Trunk (Vakratunda) */}
        <group position={[0, 1.4, 0.45]}>
          <mesh material={goldMat} position={[0, -0.22, 0]} rotation={[0.38, 0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.13, 0.55, 16]} />
          </mesh>
          <mesh material={goldMat} position={[0.1, -0.55, 0.14]} rotation={[0.2, 0.45, 0.55]}>
            <cylinderGeometry args={[0.13, 0.08, 0.45, 16]} />
          </mesh>
          {/* Sacred Golden Modak at trunk tip */}
          <mesh material={crownGoldMat} position={[0.22, -0.72, 0.22]} scale={[1, 1.25, 1]}>
            <sphereGeometry args={[0.12, 16, 16]} />
          </mesh>
        </group>

        {/* Royal Crown (Mukut) */}
        <group position={[0, 2.05, 0.08]}>
          <mesh material={crownGoldMat} castShadow>
            <coneGeometry args={[0.46, 0.9, 24]} />
          </mesh>
          <mesh material={crownGoldMat} position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.48, 0.07, 12, 32]} />
          </mesh>
          {/* Central Ruby Gem */}
          <mesh material={rubyMat} position={[0, -0.12, 0.42]}>
            <octahedronGeometry args={[0.14]} />
          </mesh>
          {/* Side Emerald Gems */}
          <mesh material={emeraldMat} position={[-0.32, -0.2, 0.32]}>
            <sphereGeometry args={[0.07, 12, 12]} />
          </mesh>
          <mesh material={emeraldMat} position={[0.32, -0.2, 0.32]}>
            <sphereGeometry args={[0.07, 12, 12]} />
          </mesh>
        </group>

        {/* Four Sacred Arms */}
        {/* Rear Left Arm (Holding Ankusha / Axe) */}
        <mesh material={goldMat} position={[-0.7, 1.0, -0.12]} rotation={[0.2, 0.2, 0.75]}>
          <cylinderGeometry args={[0.09, 0.09, 0.65, 12]} />
        </mesh>
        {/* Rear Right Arm (Holding Pasha / Rope Loop) */}
        <mesh material={goldMat} position={[0.7, 1.0, -0.12]} rotation={[0.2, -0.2, -0.75]}>
          <cylinderGeometry args={[0.09, 0.09, 0.65, 12]} />
        </mesh>

        {/* Front Left Arm (Holding Modak Vessel) */}
        <mesh material={goldMat} position={[-0.65, 0.55, 0.32]} rotation={[0.6, 0.2, 0.4]}>
          <cylinderGeometry args={[0.09, 0.09, 0.55, 12]} />
        </mesh>

        {/* Front Right Arm (Abhaya Mudra - Blessing Hand) */}
        <group ref={blessingHandRef} position={[0.65, 0.6, 0.32]}>
          <mesh material={goldMat} rotation={[0.5, -0.2, -0.4]}>
            <cylinderGeometry args={[0.09, 0.09, 0.55, 12]} />
          </mesh>
          {/* Palm in Blessing Pose */}
          <mesh material={crownGoldMat} position={[0.18, 0.1, 0.22]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.04, 0.28, 0.22]} />
          </mesh>
          {/* Om Symbol Glow on Palm */}
          <pointLight position={[0.22, 0.1, 0.24]} intensity={2.0} color="#ffaa00" distance={2} />
        </group>
      </group>
    </group>
  );
}

// GLTF Loader Component
function GLTFModel() {
  const { scene } = useGLTF('/models/ganpati.glb');
  return <primitive object={scene} scale={[1.6, 1.6, 1.6]} position={[0, -0.6, 0]} castShadow receiveShadow />;
}

export default function GaneshModel() {
  const [hasModelFile, setHasModelFile] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkModel() {
      try {
        const res = await fetch('/models/ganpati.glb', { method: 'HEAD' });
        if (active && res.ok && res.status === 200) {
          setHasModelFile(true);
        }
      } catch (e) {
        if (active) setHasModelFile(false);
      }
    }
    checkModel();
    return () => {
      active = false;
    };
  }, []);

  return (
    <group position={[0, 0, -3.5]}>
      {hasModelFile ? <GLTFModel /> : <ProceduralGaneshIdol />}
    </group>
  );
}
