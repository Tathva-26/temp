"use client";

import React from "react";
import gsap from "gsap";

export const triggerRift = (href, router) => {
  // Phase 1: Slam Shut
  gsap.to([".rift-top", ".rift-bottom"], { 
    y: "0%", 
    duration: 0.5, 
    ease: "power4.inOut", 
    onComplete: () => { 
      document.body.style.overflow = '';
      router.push(href); 
      
      // Phase 2: Reveal
      gsap.to(".rift-top", { 
        y: "-100%", 
        duration: 0.5, 
        delay: 0.2, 
        ease: "power4.inOut" 
      }); 
      gsap.to(".rift-bottom", { 
        y: "100%", 
        duration: 0.5, 
        delay: 0.2, 
        ease: "power4.inOut" 
      });
    } 
  });
};

export default function RiftTransition() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col">
      <div className="rift-top w-full h-1/2 bg-black border-b-2 border-cyan-500 shadow-[0_5px_30px_rgba(0,255,255,0.5)] translate-y-[-100%]" />
      <div className="rift-bottom w-full h-1/2 bg-black border-t-2 border-cyan-500 shadow-[0_-5px_30px_rgba(0,255,255,0.5)] translate-y-[100%]" />
    </div>
  );
}
