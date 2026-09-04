
'use client';

import { useEffect,useRef } from 'react';
import OnboardingFlow from '@/components/Profile_Page_Components/Onboarding';
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

export default function ProfilePage() {

  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = NET({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 400.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x000000, // Black network lines
        backgroundColor: 0xffffff, // White background
        points: 12.0,
        maxDistance: 27.0,
        spacing: 15.0,
      });
    }
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);



  return (
        <header
      ref={vantaRef}
      className="relative py-10 sm:p-10 flex items-center justify-center text-black"
    >
      <OnboardingFlow/>
   </header>
  );
}
