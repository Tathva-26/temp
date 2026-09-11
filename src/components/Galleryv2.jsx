"use client";

import { forwardRef } from "react";
import InfiniteSpiral from "./InfiniteSpiral";
import MobileGallery from "./MobileGallery";

const baseGalleryImages = [
  { src: "/Hero_images/Hero.jpg", alt: "A musician playing a bass guitar on a brightly lit stage." },
  { src: "/images/events.jpg", alt: "A silhouette of a person in a crowd at a concert." },
  { src: "/images/lecture.jpg", alt: "A large, artistic sculpture of a blue and orange octopus." },
  { src: "/images/workshops.jpg", alt: "Students participating in a workshop event." },
  { src: "/images/proshow1.jpeg", alt: "Event activities and performances." },
];

const Gallery = forwardRef((props, ref) => {
  return (
    <div ref={ref} id="galleryx" className="my-auto mb-14 bg-transparent relative z-10">
      <div className="flex justify-center items-center px-4 sm:px-8 lg:px-16 sm:py-12">
        <p className="text-center max-w-3xl text-gray-300 plus-jakarta leading-relaxed tracking-wide font-light">
          <span className="bg-gradient-to-r pp-fragment from-white via-gray-300 to-white bg-clip-text text-transparent text-4xl tracking-wide sm:text-5xl block mb-6 sm:mb-10 uppercase">
            Tathva Gallery
          </span>
          <span className="inline-block text-gray-400 font-light mb-5">
            Scroll through the moments that define Tathva — step into the
            vibrant spirit of{" "}
            <span className="font-medium text-gray-100">creativity</span> and{" "}
            <span className="font-medium text-gray-100">unforgettable</span>{" "}
            memories.
          </span>
        </p>
      </div>

      <div className="relative h-auto sm:h-[800px] w-full sm:overflow-hidden">
        {/* Desktop: Infinite Spiral */}
        <div className="hidden sm:block h-full w-full">
          <InfiniteSpiral 
            items={baseGalleryImages} 
            animationMode="all"
            speed={0.5}
            cardWidth={350}
            cardHeight={450}
            radius={350}
            cardsPerTurn={3.5}
            verticalSpacing={200}
          />
        </div>

        {/* Mobile: Original Snap Gallery */}
        <div className="block sm:hidden h-full w-full">
          <MobileGallery />
        </div>
      </div>
    </div>
  );
});

export default Gallery;