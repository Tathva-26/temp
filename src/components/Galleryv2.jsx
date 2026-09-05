
"use client";

import { useRef, forwardRef } from "react";

const GalleryImages = [
  {
    id: 1,
    src: "/Hero_images/Hero.jpg",
    alt: "A musician playing a bass guitar on a brightly lit stage.",
  },
  {
    id: 2,
    src: "/images/events.jpg",
    alt: "A silhouette of a person in a crowd at a concert.",
  },
  {
    id: 3,
    src: "/images/lecture.jpg",
    alt: "A large, artistic sculpture of a blue and orange octopus.",
  },
  {
    id: 4,
    src: "/images/workshops.jpg",
    alt: "Students participating in a workshop event.",
  },
  {
    id: 5,
    src: "/images/proshow1.jpeg",
    alt: "Event activities and performances.",
  },
  {
    id: 6,
    src: "/Hero_images/Hero.jpg",
    alt: "A musician playing a bass guitar on a brightly lit stage.",
  },
  {
    id: 7,
    src: "/images/events.jpg",
    alt: "A silhouette of a person in a crowd at a concert.",
  },
  {
    id: 8,
    src: "/images/lecture.jpg",
    alt: "A large, artistic sculpture of a blue and orange octopus.",
  },
  {
    id: 9,
    src: "/images/workshops.jpg",
    alt: "Students participating in a workshop event.",
  },
  {
    id: 10,
    src: "/images/proshow1.jpeg",
    alt: "Event activities and performances.",
  },
];

const Gallery = forwardRef((props, ref) => {
  const scrollerRef = useRef(null);

  const handleScroll = () => {
    const el = scrollerRef.current;

    if (!el) return;

    const rect = el.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const maxDist = rect.width / 2;

    el.querySelectorAll("[data-gallery-item]").forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;

      const distance = Math.abs(cardCenter - center);
      const factor = 1 - Math.min(1, distance / maxDist);

      const scale = 0.5 + factor * 0.5;
      const opacity = 0.3 + factor * 0.7;

      card.style.transform = `scale(${scale})`;
      card.style.opacity = opacity;
    });
  };

  return (
    <div
      ref={ref}
      id="galleryx"
      className="my-auto mb-14 bg-black"
    >
      <div className="flex justify-center items-center px-4 sm:px-8 lg:px-16 sm:py-12">
        <p className="text-center max-w-3xl text-gray-300 plus-jakarta leading-relaxed tracking-wide font-light">
          <span className="bg-gradient-to-r pp-fragment from-white via-gray-300 to-white bg-clip-text text-transparent text-3xl sm:text-5xl block mb-6 sm:mb-10">
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

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="relative overflow-x-scroll snap-x py-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex items-center gap-4 px-[20vw]">
          {GalleryImages.map((img) => (
            <div
              key={img.id}
              data-gallery-item
              className="shrink-0 snap-center"
              style={{
                width: "40vw",
                maxWidth: "520px",
                minWidth: "280px",
                willChange: "transform",
              }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-70 sm:h-100 object-cover rounded-lg shadow-2xl shadow-black/60 border border-white/10"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Gallery;

