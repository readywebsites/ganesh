# PROJECT STRUCTURE

```text
ganesh-website/
├── .eslintrc.json              # ESLint Configuration
├── next.config.js              # Next.js Configuration (transpilation & headers)
├── package.json                # Dependencies & Build scripts
├── postcss.config.js           # PostCSS Configuration
├── tailwind.config.js          # Tailwind CSS Configuration
├── jsconfig.json               # Path alias mapping (@/*)
│
├── app/                        # Next.js App Router Pages & API Routes
│   ├── layout.jsx              # Global Root Layout & Fonts (Cinzel, Montserrat, Playfair, Noto Gujarati)
│   ├── page.jsx                # Main 3D Cinematic Storytelling Portal
│   ├── admin/                  # Devotee Management Admin Dashboard
│   └── api/                    # RESTful Backend API Endpoints (Mongoose / MongoDB)
│
├── components/                 # React & R3F Components
│   ├── 3d/                     # WebGL 3D World Components
│   │   ├── TempleWorldCanvas.jsx # Main R3F Canvas & Post-Processing Stack
│   │   ├── CameraRig.jsx       # 15-Waypoint Cinematic Bezier Camera System
│   │   ├── TempleArchitecture.jsx # 7-Scene Ancient Temple Architectural Geometry
│   │   ├── GaneshModel.jsx     # Photorealistic 3D Golden Ganesha Idol & GLTF Loader
│   │   └── AtmosphereEffects.jsx # Clouds, Flying Birds, Incense Smoke, Petals, Dust & Spotlights
│   │
│   ├── CinematicStoryOverlay.jsx # Apple-style 7-Scene Narrative Overlay
│   ├── Hero.jsx                # Cinematic Hero Section
│   ├── About.jsx               # Temple Legacy & Heritage Cards
│   ├── Timeline.jsx            # Event Schedule & Ritual Milestones
│   ├── Gallery.jsx             # Virtual Museum Photo Gallery
│   ├── Darshan.jsx             # Live Aarti & Ritual Stream Overlay
│   ├── VideoGallery.jsx        # Cinematic Video Reels
│   ├── Donation.jsx            # Sewa & Offering Portal
│   ├── Membership.jsx          # Bhakta Membership Registration & 3D Pass
│   ├── Instagram.jsx           # Social Feed
│   ├── Contact.jsx             # Contact Form & Location Map
│   ├── Navbar.jsx              # Floating Navigation Header
│   ├── AudioPlayer.jsx         # Spiritual Temple Chants Audio Player
│   ├── CustomCursor.jsx        # Gold Ring Interactive Cursor
│   └── Loader.jsx              # Preloader Screen
│
├── hooks/                      # Custom React Hooks
│   └── useLenis.js             # Lenis Smooth Scroll Hook
│
├── models/                     # Mongoose Database Schemas
│   ├── Admin.js
│   ├── Contact.js
│   ├── Donation.js
│   └── Member.js
│
├── public/                     # Static Production Assets
│   ├── audio/                  # Temple Ambient Audio Track
│   ├── images/                 # High Resolution Textures & Media
│   ├── models/                 # GLTF/GLB 3D Models (temple.glb, ganpati.glb)
│   └── logo/                   # Official Mahotsav Logos
│
└── styles/                     # Styling Tokens & Stylesheets
    └── globals.css             # Luxury Design System Tokens & Global Styles
```
