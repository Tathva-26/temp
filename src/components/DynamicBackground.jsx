"use client";
import Image from "next/image";
import { usePerformance } from "@/context/PerformanceContext";
import AsteriaBackground from "./AsteriaBackground";
import Particles from "@/components/Particles";
import { usePathname } from "next/navigation";

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
    detect_on: 'window',
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
  retina_detect: false,
};

export default function DynamicBackground() {
  const { lowPowerMode } = usePerformance();
  const pathname = usePathname();
  
  if (lowPowerMode) {
    return <div className="fixed inset-0 z-0 bg-gradient-to-br from-zinc-950 to-zinc-900" />;
  }
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#0a0510]">
      {/* Hyper-realistic Milky Way Background */}
      <Image 
        src="/images/milky_way_bg.jpg"
        alt="Milky Way Galaxy Background"
        fill
        className="object-cover opacity-60"
        priority
      />
      <AsteriaBackground />
      
      {/* True Fixed Viewport Particles for Home Page */}
      {pathname === "/" && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <Particles options={particlesOptions} />
        </div>
      )}
    </div>
  );
}
