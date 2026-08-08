# CHANGELOG

## [2.0.0] - 2026-08-03

### Added
- **7-Scene Cinematic Storytelling Architecture**:
  - **Scene 1 (Morning Sky)**: Volumetric clouds, morning fog, and flying bird particle animations.
  - **Scene 2 (Approach Temple)**: Sunlight illumination hitting massive temple entrance.
  - **Scene 3 (Temple Entrance)**: Dynamic carved wooden double doors opening seamlessly on scroll.
  - **Scene 4 (Corridor Walkthrough)**: Walkthrough of golden pillars, reflective dark marble floors, oil lamps (diyas), incense smoke, and temple bells.
  - **Scene 5 (Garbh Gruh Reveal)**: Sanctum sanctorum entrance focusing on Lord Ganesha.
  - **Scene 6 (Golden Aura & God Rays)**: Volumetric spotlights, golden halo, and sun rays surrounding the idol.
  - **Scene 7 (Divine Blessing Close-Up)**: Abhaya Mudra blessing hand pulse animation and Apple-style story captions.
- **CinematicStoryOverlay Component**: Seamless Apple-style typography overlays synchronized to scroll progress.
- **Enhanced 3D Models**:
  - `GaneshModel.jsx`: Photorealistic 3D Ganesha Idol with rotating sun-ray halo, Mukut crown with ruby & emerald jewels, lotus pedestal, and blessing pose.
  - `TempleArchitecture.jsx`: Extended 7-scene temple entrance, carved doors, golden pillars, marble floor, oil lamps, museum gallery frames, cinema screen, glass sanctum, and lotus pond.
  - `AtmosphereEffects.jsx`: Volumetric moving clouds, flying birds, falling marigold flower petals, incense smoke column, floating golden dust particles, and warm spotlights.
  - `CameraRig.jsx`: 15-waypoint Bezier path camera controller with lerp dampening, breathing motion, and mouse parallax.

### Fixed & Improved
- Fixed missing ESLint configuration by creating `.eslintrc.json` and adding `eslint` and `eslint-config-next` to `devDependencies`.
- Fixed React Hook rules in `GaneshModel.jsx` by isolating `useGLTF` inside a dedicated `GLTFModel` component.
- Fixed unescaped JSX quotes in `app/admin/contacts/page.jsx`.
- Refined `next.config.js` header matching rules for clean Next.js static asset caching.
- Verified build pipeline with 0 errors on `npm run lint` and `npm run build`.
