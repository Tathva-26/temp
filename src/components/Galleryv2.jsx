"use client";

import { useRef, useEffect, forwardRef } from "react";

const baseGalleryImages = [
  { src: "/Hero_images/Hero.jpg", alt: "A musician playing a bass guitar on a brightly lit stage." },
  { src: "/images/events.jpg", alt: "A silhouette of a person in a crowd at a concert." },
  { src: "/images/lecture.jpg", alt: "A large, artistic sculpture of a blue and orange octopus." },
  { src: "/images/workshops.jpg", alt: "Students participating in a workshop event." },
  { src: "/images/proshow1.jpeg", alt: "Event activities and performances." },
];

const COPIES = 3;
const baseLength = baseGalleryImages.length;

const GalleryImages = Array.from({ length: baseLength * COPIES }, (_, i) => ({
  ...baseGalleryImages[i % baseLength],
  id: i,
}));

const Gallery = forwardRef((props, ref) => {
  const scrollerRef = useRef(null);
  const singleSetWidthRef = useRef(0);
  const rafRef = useRef(null);
  const isWrappingRef = useRef(false);

  const measureSingleSetWidth = () => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const cards = el.querySelectorAll("[data-gallery-item]");
    if (cards.length < baseLength * 2) return 0;
    return cards[baseLength].offsetLeft - cards[0].offsetLeft;
  };

  const updateVisuals = () => {
    const el = scrollerRef.current;
    if (!el) return;

    const singleSetWidth = singleSetWidthRef.current;

    // --- Handle wrap FIRST, before any reads, to avoid layout thrash ---
    if (!isWrappingRef.current && singleSetWidth > 0) {
      if (el.scrollLeft < singleSetWidth * 0.5) {
        isWrappingRef.current = true;
        el.style.scrollSnapType = "none"; // temporarily disable snap so the jump is instant
        el.scrollLeft += singleSetWidth;
        requestAnimationFrame(() => {
          el.style.scrollSnapType = "";
          isWrappingRef.current = false;
        });
      } else if (el.scrollLeft >= singleSetWidth * 1.5) {
        isWrappingRef.current = true;
        el.style.scrollSnapType = "none";
        el.scrollLeft -= singleSetWidth;
        requestAnimationFrame(() => {
          el.style.scrollSnapType = "";
          isWrappingRef.current = false;
        });
      }
    }

    // --- Batch all reads first, then all writes (avoids forced reflow per card) ---
    const center = el.scrollLeft + el.clientWidth / 2;
    const maxDist = el.clientWidth / 2;

    const cards = el.querySelectorAll("[data-gallery-item]");
    const updates = [];

    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - center);
      const factor = 1 - Math.min(1, distance / maxDist);
      updates.push({
        card,
        scale: 0.5 + factor * 0.5,
        opacity: 0.3 + factor * 0.7,
      });
    });

    updates.forEach(({ card, scale, opacity }) => {
      card.style.transform = `scale(${scale})`; // write
      card.style.opacity = opacity;
    });
  };

  const handleScroll = () => {
    // Throttle to animation frames instead of running on every native scroll tick
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      updateVisuals();
      rafRef.current = null;
    });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const setup = () => {
      singleSetWidthRef.current = measureSingleSetWidth();
      el.scrollLeft = singleSetWidthRef.current;
      updateVisuals();
    };

    setup();
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("resize", setup);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={ref} id="galleryx" className="my-auto mb-14 bg-black">
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
        style={{ scrollBehavior: "auto" }}
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