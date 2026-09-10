"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const coreRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Instant snap for core
      gsap.to(coreRef.current, {
        duration: 0,
        x: e.clientX,
        y: e.clientY
      });
      // Smooth spring for outer ring
      gsap.to(ringRef.current, {
        duration: 0.15,
        ease: "power2.out",
        x: e.clientX,
        y: e.clientY
      });
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, input')) {
        gsap.to(ringRef.current, {
          scale: 1.5,
          borderColor: "white",
          duration: 0.2
        });
      }
    };

    const handleMouseOut = (e) => {
      if (e.target.closest('a, button, input')) {
        gsap.to(ringRef.current, {
          scale: 1,
          borderColor: "#06b6d4", // Tailwind cyan-500
          duration: 0.2
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `* { cursor: none !important; }` }} />
      <div 
        ref={coreRef} 
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[10000] mix-blend-difference transform -translate-x-1/2 -translate-y-1/2" 
      />
      <div 
        ref={ringRef} 
        className="fixed top-0 left-0 w-10 h-10 border border-cyan-500 rounded-full pointer-events-none z-[10000] mix-blend-difference transform -translate-x-1/2 -translate-y-1/2" 
      />
    </>
  );
}
