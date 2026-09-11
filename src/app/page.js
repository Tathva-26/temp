"use client";
import ContactPage from "@/components/Contact";
import Hero from "@/components/Hero";
import Gallery from "@/components/Galleryv2";
import MinimalSections from "@/components/Explore";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import { useRef } from "react";

const particlesOptions = {
  particles: {
    number: {
      value: 60,
      density: { enable: true, value_area: 800 },
      limit: 100,
    },
    color: { value: '#ffffff' },
    shape: { type: 'circle' },
    opacity: {
      value: 0.8,
      random: true,
      anim: { enable: true, speed: 1.5, opacity_min: 0.2, sync: false },
    },
    size: {
      value: 2.5,
      random: true,
      anim: { enable: true, speed: 2, size_min: 0.5, sync: false },
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: '#ffffff',
      opacity: 0.3,
      width: 1,
    },
    move: {
      enable: true,
      speed: 1.5,
      direction: 'none',
      random: true,
      straight: false,
      out_mode: 'out',
      bounce: false,
    },
  },
  interactivity: {
    detect_on: 'window', // Detect globally so we don't block clicks
    events: {
      onhover: { enable: true, mode: 'repulse' },
      onclick: { enable: true, mode: 'push' },
      resize: true,
    },
    modes: {
      repulse: { distance: 100, duration: 0.4 },
      push: { particles_nb: 4 },
    },
  },
  retina_detect: false, // Massive optimization: stops rendering at 4K/8K resolution
}

export default function Home() {
  // ✅ Create refs for each section you want to scroll to
  const galleryRef = useRef(null);
  const contactRef = useRef (null);

  return (
    <div className="relative">
      {/* Global Interactive Constellation Graph */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles options={particlesOptions} />
      </div>

      {/* ✅ Pass the refs to the Hero component */}
      <Hero refs={{ gallery: galleryRef, contact: contactRef }} />

      {/* ✅ Pass the specific ref to each target component lol */}
      <MinimalSections />
      <Gallery ref={galleryRef} />
      <ContactPage ref={contactRef} />
      
      {/* Footer can also receive refs if needed */}
      <Footer refs={{ gallery: galleryRef, contact: contactRef }} />
    </div>
  );
}