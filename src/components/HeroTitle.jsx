"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroTitle() {
  const textRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate mouse position relative to the center of the screen (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      // 3D Parallax Tilt using GSAP
      gsap.to(textRef.current, {
        rotationY: x * 15,
        rotationX: -y * 15,
        duration: 0.5,
        ease: "power2.out",
        transformPerspective: 1000,
      });
    };

    const handleMouseLeave = () => {
      // Smoothly return rotation to 0
      gsap.to(textRef.current, {
        rotationY: 0,
        rotationX: 0,
        duration: 1.5,
        ease: "power3.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center pointer-events-none select-none z-20">
      <h1 
        ref={textRef}
        className="tathva-heading text-center text-[clamp(4rem,15vw,12rem)] font-bold uppercase tracking-tighter text-white drop-shadow-2xl"
      >
        TATHVA '26
      </h1>
    </div>
  );
}
