"use client";
import { useRef, forwardRef, useLayoutEffect, useState, useEffect } from "react";

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
];

const GAP = 16;
const SETS = 3;

const Gallery = forwardRef((props, ref) => {
  const scrollerRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(360);

  const pitch = cardWidth - GAP;
  const segmentWidth = GalleryImages.length * pitch;

  const items = [];
  for (let set = 0; set < SETS; set++) {
    GalleryImages.forEach((img) => {
      items.push({ ...img, key: `${set}-${img.id}` });
    });
  }

  useEffect(() => {
    const update = () => {
      setCardWidth(Math.min(Math.max(280, Math.floor(window.innerWidth * 0.4)), 520));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    el.scrollLeft = segmentWidth;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [segmentWidth]);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;

    let pos = el.scrollLeft;

    if (pos < segmentWidth) el.scrollLeft = pos + segmentWidth;
    if (pos > segmentWidth * 2) el.scrollLeft = pos - segmentWidth;

    const rect = el.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const maxDist = rect.width * 0.5;

    el.querySelectorAll("[data-gallery-item]").forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - center);
      const factor = 1 - Math.min(1, distance / maxDist);

      const scale = 0.6 + factor * 0.4;
      const opacity = 0.35 + factor * 0.65;

      card.style.transform = `scale(${scale})`;
      card.style.zIndex = String(Math.round(scale * 10));
      card.style.opacity = opacity.toFixed(2);
    });
  };

  return (
    <div
      ref={ref}
      id="galleryx"
      className="my-auto mb-14 bg-black"
    >
      <div className="flex justify-center items-center px-4 sm:px-8 lg:px-16 sm:py-12">
        <p className="text-center max-w-3xl text-gray-300 plus-jakarta leading-relaxed tracking-wide font-light ">
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
        className="relative overflow-x-scroll snap-x snap-mandatory py-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex items-center">
          {items.map((img) => (
            <div
              key={img.key}
              data-gallery-item
              className="shrink-0 snap-center transition-transform duration-100"
              style={{ width: cardWidth, marginRight: -GAP, willChange: "transform" }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-52 sm:h-72 object-cover rounded-lg shadow-2xl shadow-black/60 border border-white/10"
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