"use client";

import { useRef, useEffect, forwardRef } from "react";

const baseGalleryImages = [
  { src: "/Hero_images/Hero.jpg", alt: "A musician playing a bass guitar on a brightly lit stage." },
  { src: "/images/events.jpg", alt: "A silhouette of a person in a crowd at a concert." },
  { src: "/images/lecture.jpg", alt: "A large, artistic sculpture of a blue and orange octopus." },
  { src: "/images/workshops.jpg", alt: "Students participating in a workshop event." },
  { src: "/images/proshow1.jpeg", alt: "Event activities and performances." },
];

const COPIES = 7;
const baseLength = baseGalleryImages.length;

const GalleryImages = Array.from({ length: baseLength * COPIES }, (_, i) => ({
  ...baseGalleryImages[i % baseLength],
  id: i,
}));

const AUTOPLAY_DELAY = 1000;
const AUTOPLAY_STEP_DURATION = 400;

const MobileGallery = forwardRef((props, ref) => {
  const scrollerRef = useRef(null);
  const singleSetWidthRef = useRef(0);
  const rafRef = useRef(null);
  const isWrappingRef = useRef(false);

  const autoplayTimeoutRef = useRef(null);
  const autoScrollRafRef = useRef(null);
  const isAutoScrollingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const idleWrapTimerRef = useRef(null);

  const measureSingleSetWidth = () => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const cards = el.querySelectorAll("[data-gallery-item]");
    if (cards.length < baseLength * 2) return 0;
    return cards[baseLength].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
  };

  const getCardStep = () => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const cards = el.querySelectorAll("[data-gallery-item]");
    if (cards.length < 2) return 0;
    return cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
  };

  const wrapIfNeeded = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const singleSetWidth = singleSetWidthRef.current;

    if (!isWrappingRef.current && singleSetWidth > 0) {
      if (el.scrollLeft < singleSetWidth * 2.0) {
        isWrappingRef.current = true;
        el.style.scrollSnapType = "none";
        el.scrollLeft += singleSetWidth;
        el.offsetHeight; 
        requestAnimationFrame(() => {
          el.style.scrollSnapType = "";
          isWrappingRef.current = false;
        });
      } else if (el.scrollLeft >= singleSetWidth * 4.0) {
        isWrappingRef.current = true;
        el.style.scrollSnapType = "none";
        el.scrollLeft -= singleSetWidth;
        el.offsetHeight; 
        requestAnimationFrame(() => {
          el.style.scrollSnapType = "";
          isWrappingRef.current = false;
        });
      }
    }
  };

  const updateVisuals = () => {
    const el = scrollerRef.current;
    if (!el) return;

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
      card.style.transform = `scale(${scale})`; 
      card.style.opacity = opacity;
    });
  };

  const clearAutoplayTimer = () => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  };

  const scheduleAutoplay = () => {
    clearAutoplayTimer();
    autoplayTimeoutRef.current = setTimeout(() => {
      autoAdvance();
    }, AUTOPLAY_DELAY);
  };

  const animateScrollBy = (delta, duration) => {
    const el = scrollerRef.current;
    if (!el) return;

    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }

    el.style.scrollSnapType = "none";

    const startTime = performance.now();
    let lastEase = 0;
    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const currentEase = easeInOutQuad(t);
      const frameDelta = delta * (currentEase - lastEase);

      el.scrollLeft += frameDelta;
      lastEase = currentEase;

      updateVisuals();

      if (t < 1) {
        autoScrollRafRef.current = requestAnimationFrame(step);
      } else {
        autoScrollRafRef.current = null;
        isAutoScrollingRef.current = false;
        el.style.scrollSnapType = ""; 
        wrapIfNeeded(); 
        scheduleAutoplay();
      }
    };

    autoScrollRafRef.current = requestAnimationFrame(step);
  };

  const autoAdvance = () => {
    if (isHoveredRef.current) return;

    const step = getCardStep();
    if (!step) {
      scheduleAutoplay();
      return;
    }
    isAutoScrollingRef.current = true;
    animateScrollBy(step, AUTOPLAY_STEP_DURATION);
  };

  const handleScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      updateVisuals();
      rafRef.current = null;
    });

    if (!isAutoScrollingRef.current) {
      if (idleWrapTimerRef.current) clearTimeout(idleWrapTimerRef.current);
      idleWrapTimerRef.current = setTimeout(() => {
        wrapIfNeeded();
        if (!isHoveredRef.current) scheduleAutoplay();
      }, 150); 
    }
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    clearAutoplayTimer();

    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
      isAutoScrollingRef.current = false;
      scrollerRef.current.style.scrollSnapType = "";
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    scheduleAutoplay();
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const setup = () => {
      singleSetWidthRef.current = measureSingleSetWidth();
      el.scrollLeft = singleSetWidthRef.current * 3.0; 
      updateVisuals();
      scheduleAutoplay();
    };

    // Timeout slightly ensures styles and layout are ready on mount
    setTimeout(setup, 100);
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("resize", setup);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current);
      if (idleWrapTimerRef.current) clearTimeout(idleWrapTimerRef.current);
      clearAutoplayTimer();
    };
  }, []);

  return (
    <div
      ref={scrollerRef}
      onScroll={handleScroll}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      style={{ scrollBehavior: "auto" }}
      className="relative overflow-x-scroll snap-x py-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full flex items-center"
    >
      <div className="flex items-center gap-4 px-[15vw]">
        {GalleryImages.map((img) => (
          <div
            key={img.id}
            data-gallery-item
            className="shrink-0 snap-center"
            style={{
              width: "70vw",
              maxWidth: "420px",
              willChange: "transform",
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-80 sm:h-100 object-cover rounded-lg shadow-2xl shadow-black/60 border border-white/10"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

export default MobileGallery;
