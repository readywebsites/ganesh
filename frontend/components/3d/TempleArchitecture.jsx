'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function TempleArchitecture() {
  const leftDoorRef = useRef();
  const rightDoorRef = useRef();
  const bellsGroupRef = useRef();
  const mapPinRef = useRef();
  const qrRef = useRef();
  const lotusGroupRef = useRef();

  // Textures for 3D Virtual Gallery Mounts
  const texture1 = useLoader(THREE.TextureLoader, '/images/ganesh_idol_front.jpg');
  const texture2 = useLoader(THREE.TextureLoader, '/images/ganesh_idol_angle.jpg');
  const texture3 = useLoader(THREE.TextureLoader, '/images/ganesh_closeup.jpg');
  const texture4 = useLoader(THREE.TextureLoader, '/images/temple_door_poster.jpg');
  const texture5 = useLoader(THREE.TextureLoader, '/images/instagram_story.jpg');

  // Shared Materials
  const marbleMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#140d07'),
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
    });
  }, []);

  const goldPillarMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#d4af37'),
      metalness: 0.95,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });
  }, []);

  const doorWoodMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#241208'),
      roughness: 0.38,
      metalness: 0.25,
      clearcoat: 0.35,
    });
  }, []);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      transmission: 0.88,
      opacity: 1,
      transparent: true,
      roughness: 0.08,
      metalness: 0.1,
      ior: 1.52,
      thickness: 0.5,
      clearcoat: 1.0,
    });
  }, []);

  const waterMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#092230'),
      emissive: new THREE.Color('#02111c'),
      roughness: 0.04,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.98,
    });
  }, []);

  const pillarZPositions = useMemo(() => [6, 0, -6, -12, -18, -24, -30, -36, -42, -48, -54], []);
  const diyaPositions = useMemo(() => [
    [-3.8, -0.8, 4], [3.8, -0.8, 4],
    [-3.8, -0.8, -2], [3.8, -0.8, -2],
    [-3.8, -0.8, -8], [3.8, -0.8, -8],
    [-3.8, -0.8, -14], [3.8, -0.8, -14],
  ], []);
  const bellPositions = useMemo(() => [
    [-2.2, 5.2, 5], [2.2, 5.2, 5],
    [-2.2, 5.2, -1], [2.2, 5.2, -1],
    [-2.2, 5.2, -7], [2.2, 5.2, -7],
  ], []);

  const lotusPositions = useMemo(() => [
    [-3, 0, -2], [2, 0, 1], [-1, 0, 3], [4, 0, -3], [0, 0, -4],
  ], []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const maxScroll = typeof window !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1;
    const scrollProgress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;

    // Scene 3: Doors open dynamically based on scroll progress (0.04 to 0.18)
    const doorProgress = Math.min(1, Math.max(0, (scrollProgress - 0.04) / 0.14));
    const doorOpenAmount = doorProgress * Math.PI * 0.48;

    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = -doorOpenAmount;
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = doorOpenAmount;
    }

    // Hanging Temple Bells gentle sway
    if (bellsGroupRef.current) {
      bellsGroupRef.current.children.forEach((bell, idx) => {
        bell.rotation.z = Math.sin(time * 1.8 + idx) * 0.05;
      });
    }

    // Scene 8: 3D QR emblem float
    if (qrRef.current) {
      qrRef.current.rotation.y = time * 0.5;
      qrRef.current.position.y = 1.2 + Math.sin(time * 2) * 0.05;
    }

    // Scene 10: 3D Location pin float
    if (mapPinRef.current) {
      mapPinRef.current.position.y = 1.6 + Math.sin(time * 2.5) * 0.08;
      mapPinRef.current.rotation.y = time * 0.8;
    }

    // Scene 11: Floating Water Lotuses sway
    if (lotusGroupRef.current) {
      lotusGroupRef.current.children.forEach((lotus, idx) => {
        lotus.position.y = -0.15 + Math.sin(time * 1.5 + idx) * 0.03;
        lotus.rotation.y = Math.sin(time * 0.5 + idx) * 0.1;
      });
    }
  });

  return (
    <group>
      {/* 1. CONTINUOUS POLISHED MARBLE FLOOR */}
      <mesh
        material={marbleMaterial}
        position={[0, -1.0, -25]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[32, 100]} />
      </mesh>

      {/* TEMPLE ORNATE CEILING */}
      <mesh material={marbleMaterial} position={[0, 6.4, -25]} receiveShadow>
        <boxGeometry args={[14, 0.4, 100]} />
      </mesh>

      {/* TEMPLE WALLS (LEFT & RIGHT ENCLOSURE) */}
      <mesh material={doorWoodMaterial} position={[-6.8, 2.7, -25]}>
        <boxGeometry args={[0.5, 7.8, 100]} />
      </mesh>
      <mesh material={doorWoodMaterial} position={[6.8, 2.7, -25]}>
        <boxGeometry args={[0.5, 7.8, 100]} />
      </mesh>

      {/* 2. GRAND TEMPLE ENTRANCE & DOORS (Scene 1, 2 & 3: z ~ 8) */}
      <group position={[0, 0, 8]}>
        {/* Grand Temple Entrance Arch */}
        <mesh material={goldPillarMaterial} position={[0, 2.7, 0]}>
          <boxGeometry args={[6.4, 7.8, 0.5]} />
        </mesh>
        <mesh material={marbleMaterial} position={[0, 2.4, -0.06]}>
          <boxGeometry args={[4.6, 6.4, 0.55]} />
        </mesh>

        {/* Left Carved Wooden Door with Brass Ring */}
        <group ref={leftDoorRef} position={[-2.2, 2.4, 0]}>
          <mesh material={doorWoodMaterial} position={[1.1, 0, 0]} castShadow>
            <boxGeometry args={[2.2, 6.2, 0.2]} />
          </mesh>
          <mesh material={goldPillarMaterial} position={[1.1, 0, 0]}>
            <boxGeometry args={[1.9, 5.6, 0.24]} />
          </mesh>
          <mesh material={goldPillarMaterial} position={[1.7, 0, 0.15]}>
            <torusGeometry args={[0.24, 0.04, 12, 24]} />
          </mesh>
        </group>

        {/* Right Carved Wooden Door with Brass Ring */}
        <group ref={rightDoorRef} position={[2.2, 2.4, 0]}>
          <mesh material={doorWoodMaterial} position={[-1.1, 0, 0]} castShadow>
            <boxGeometry args={[2.2, 6.2, 0.2]} />
          </mesh>
          <mesh material={goldPillarMaterial} position={[-1.1, 0, 0]}>
            <boxGeometry args={[1.9, 5.6, 0.24]} />
          </mesh>
          <mesh material={goldPillarMaterial} position={[-1.7, 0, 0.15]}>
            <torusGeometry args={[0.24, 0.04, 12, 24]} />
          </mesh>
        </group>
      </group>

      {/* 3. GOLDEN CORRIDOR PILLARS & SANCTUM */}
      {pillarZPositions.map((zPos, idx) => (
        <group key={idx}>
          {/* Left Golden Pillar */}
          <group position={[-4.8, 2.7, zPos]}>
            <mesh material={goldPillarMaterial} castShadow>
              <cylinderGeometry args={[0.42, 0.52, 7.8, 24]} />
            </mesh>
            <mesh material={goldPillarMaterial} position={[0, 3.9, 0]}>
              <boxGeometry args={[1.3, 0.45, 1.3]} />
            </mesh>
            <mesh material={goldPillarMaterial} position={[0, -3.9, 0]}>
              <boxGeometry args={[1.4, 0.45, 1.4]} />
            </mesh>
          </group>

          {/* Right Golden Pillar */}
          <group position={[4.8, 2.7, zPos]}>
            <mesh material={goldPillarMaterial} castShadow>
              <cylinderGeometry args={[0.42, 0.52, 7.8, 24]} />
            </mesh>
            <mesh material={goldPillarMaterial} position={[0, 3.9, 0]}>
              <boxGeometry args={[1.3, 0.45, 1.3]} />
            </mesh>
            <mesh material={goldPillarMaterial} position={[0, -3.9, 0]}>
              <boxGeometry args={[1.4, 0.45, 1.4]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* 4. HANGING TEMPLE BELLS (Scene 4) */}
      <group ref={bellsGroupRef}>
        {bellPositions.map((pos, idx) => (
          <group key={idx} position={pos}>
            {/* Hanging Chain */}
            <mesh material={goldPillarMaterial} position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
            </mesh>
            {/* Bell Dome */}
            <mesh material={goldPillarMaterial} position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.15, 0.32, 0.4, 16]} />
            </mesh>
            {/* Clapper */}
            <mesh material={goldPillarMaterial} position={[0, -0.45, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. OIL LAMPS (DIYAS) WITH FLICKERING FLAMES (Scene 4) */}
      {diyaPositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh material={goldPillarMaterial}>
            <cylinderGeometry args={[0.22, 0.12, 0.18, 16]} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color="#ff7700" />
          </mesh>
          <pointLight position={[0, 0.25, 0]} intensity={2.2} color="#ff8800" distance={3.5} />
        </group>
      ))}

      {/* 6. GARBH GRUH SANCTUM ARCH & GOD RAYS (Scene 5 & 6) */}
      <group position={[0, 0, -3.5]}>
        {/* Sanctum Golden Archway */}
        <mesh material={goldPillarMaterial} position={[0, 2.2, -0.5]}>
          <torusGeometry args={[2.5, 0.12, 16, 64, Math.PI]} />
        </mesh>
        {/* Soft Golden Volumetric Backlight */}
        <pointLight position={[0, 1.5, -1.2]} intensity={5.0} color="#ffbb00" distance={8} />
      </group>

      {/* 7. VIRTUAL 3D MUSEUM GALLERY FRAMES */}
      <group position={[0, 1.8, -18]}>
        {/* Frame 1 */}
        <group position={[-5.2, 0.5, 2]} rotation={[0, 0.5, 0]}>
          <mesh material={goldPillarMaterial}>
            <boxGeometry args={[2.4, 3.2, 0.1]} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[2.1, 2.9]} />
            <meshStandardMaterial map={texture1} roughness={0.2} metalness={0.1} />
          </mesh>
        </group>
        {/* Frame 2 */}
        <group position={[-2.2, 0.8, -1]} rotation={[0, 0.2, 0]}>
          <mesh material={goldPillarMaterial}>
            <boxGeometry args={[2.8, 3.6, 0.1]} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[2.5, 3.3]} />
            <meshStandardMaterial map={texture2} roughness={0.2} metalness={0.1} />
          </mesh>
        </group>
        {/* Frame 3 */}
        <group position={[2.2, 0.8, -1]} rotation={[0, -0.2, 0]}>
          <mesh material={goldPillarMaterial}>
            <boxGeometry args={[2.8, 3.6, 0.1]} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[2.5, 3.3]} />
            <meshStandardMaterial map={texture3} roughness={0.2} metalness={0.1} />
          </mesh>
        </group>
        {/* Frame 4 */}
        <group position={[5.2, 0.5, 2]} rotation={[0, -0.5, 0]}>
          <mesh material={goldPillarMaterial}>
            <boxGeometry args={[2.4, 3.2, 0.1]} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[2.1, 2.9]} />
            <meshStandardMaterial map={texture4} roughness={0.2} metalness={0.1} />
          </mesh>
        </group>
      </group>

      {/* 8. FLOATING CINEMA SCREENS */}
      <group position={[0, 1.8, -26]}>
        <mesh material={goldPillarMaterial}>
          <boxGeometry args={[6.5, 3.8, 0.15]} />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[6.2, 3.5]} />
          <meshStandardMaterial map={texture5} roughness={0.2} emissive={new THREE.Color('#331d00')} emissiveIntensity={0.4} />
        </mesh>
        <pointLight position={[0, 0, 1.5]} intensity={2.0} color="#ffaa00" distance={6} />
      </group>

      {/* 9. MEMBERSHIP GLASS SANCTUM & 3D QR */}
      <group position={[-3.0, 1.2, -34]}>
        <mesh material={glassMaterial}>
          <boxGeometry args={[4.2, 2.8, 0.1]} />
        </mesh>
        <mesh material={goldPillarMaterial} position={[0, 0, 0.06]}>
          <torusGeometry args={[2.3, 0.04, 16, 64]} />
        </mesh>

        <group ref={qrRef} position={[1.4, 0, 0.3]}>
          <mesh material={goldPillarMaterial}>
            <boxGeometry args={[0.7, 0.7, 0.08]} />
          </mesh>
          <mesh material={goldPillarMaterial}>
            <torusGeometry args={[0.55, 0.02, 12, 32]} />
          </mesh>
        </group>
      </group>

      {/* 10. DONATION OFFERING ALTAR & DIYAS */}
      <group position={[3.0, 0, -42]}>
        <mesh material={goldPillarMaterial} position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.8, 1.2, 1.2, 24]} />
        </mesh>
        <mesh material={goldPillarMaterial} position={[0, 1.1, 0]} scale={[1, 0.6, 1]}>
          <sphereGeometry args={[0.9, 24, 24]} />
        </mesh>
      </group>

      {/* 11. MAP PAVILION & 3D PIN */}
      <group position={[0, 0, -50]}>
        <mesh material={marbleMaterial} position={[0, -0.8, 0]}>
          <cylinderGeometry args={[2.5, 2.8, 0.4, 32]} />
        </mesh>
        <mesh material={goldPillarMaterial} position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.6, 0.06, 16, 64]} />
        </mesh>

        <group ref={mapPinRef} position={[0, 1.6, 0]}>
          <mesh material={goldPillarMaterial} scale={[1, 1.4, 1]}>
            <sphereGeometry args={[0.5, 24, 24]} />
            <mesh material={goldPillarMaterial} position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.5, 1.2, 24]} />
            </mesh>
          </mesh>
          <mesh position={[0, 0.05, 0.4]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <pointLight position={[0, 0, 0.6]} intensity={2.0} color="#ffd700" distance={4} />
        </group>
      </group>

      {/* 12. COURTYARD WATER LOTUS POND */}
      <group position={[0, -0.9, -60]}>
        <mesh material={waterMaterial} position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[18, 0.3, 14]} />
        </mesh>
        <mesh material={goldPillarMaterial} position={[0, -0.1, 0]}>
          <boxGeometry args={[19, 0.4, 15]} />
        </mesh>

        <group ref={lotusGroupRef}>
          {lotusPositions.map((pos, idx) => (
            <group key={idx} position={pos}>
              {Array.from({ length: 8 }).map((_, pIdx) => {
                const angle = (pIdx / 8) * Math.PI * 2;
                return (
                  <mesh
                    key={pIdx}
                    position={[Math.sin(angle) * 0.3, 0.05, Math.cos(angle) * 0.3]}
                    rotation={[0.3, angle, 0]}
                    scale={[1, 0.2, 1.6]}
                  >
                    <sphereGeometry args={[0.14, 12, 12]} />
                    <meshStandardMaterial color={idx % 2 === 0 ? '#ff6699' : '#ffcc00'} roughness={0.4} />
                  </mesh>
                );
              })}
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}
