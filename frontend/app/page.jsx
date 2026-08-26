'use client';

import dynamic from 'next/dynamic';
import useLenis from '@/hooks/useLenis';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';

// Dynamic imports for code splitting below-the-fold components
const TempleWorldCanvas = dynamic(() => import('@/components/3d/TempleWorldCanvas'), { ssr: false });
const Timeline = dynamic(() => import('@/components/Timeline'));
const Gallery = dynamic(() => import('@/components/Gallery'));
const Darshan = dynamic(() => import('@/components/Darshan'));
const AartiBooking = dynamic(() => import('@/components/AartiBooking'));
const Donation = dynamic(() => import('@/components/Donation'));
const Membership = dynamic(() => import('@/components/Membership'));
const Instagram = dynamic(() => import('@/components/Instagram'));
const Contact = dynamic(() => import('@/components/Contact'));
const Footer = dynamic(() => import('@/components/Footer'));

export default function Home() {
  useLenis();

  return (
    <main className="relative min-h-screen bg-[#F7F3EA] text-[#3F3528] selection:bg-[#D8BD72] selection:text-[#3F3528]">
      {/* 3D WebGL World Layer */}
      <TempleWorldCanvas />

      {/* HTML Content Overlay Layer */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <About />
        <Timeline />
        <Gallery />
        <Darshan />
        <AartiBooking />
        <Donation />
        <Membership />
        <Instagram />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
