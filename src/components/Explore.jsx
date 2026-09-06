"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

const sections = [
  {
    image: "/images/workshops.jpg",
    title: "Workshops",
    description:
      "Hands-on sessions covering topics like robotics, AI, and sustainable tech. These workshops provide students with the opportunity to gain practical knowledge, work on real-world problems, and interact with industry professionals.",
  },
  {
    image: "/images/events.jpg",
    title: "Competitions",
    description:
      "Over 65 events including coding competitions, gaming, and cultural showcases. From technical battles of skill to fun informal events, Tathva's events are designed to inspire innovation, teamwork, and creativity.",
  },
  {
    image: "/images/lecture.jpg",
    title: "Lectures",
    description:
      "Industry experts and academicians share insights on emerging technologies. The lecture series bridges the gap between academia and industry, inspiring students to think beyond classrooms and pursue cutting-edge innovations.",
  },
];

const SECTION_COUNT = sections.length;
// 500vh → 400vh scrollable → ~200vh per section
const CONTAINER_HEIGHT_VH = 5;

export default function MinimalSections() {
  const containerRef = useRef(null);
  const sectionElsRef = useRef([]);
  const imgElsRef = useRef([]);
  const rafRef = useRef(null);
  const [active, setActive] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const activeRef = useRef(0);

  const updateVisuals = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;
    if (totalScrollable <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.min(1, Math.max(0, scrolled / totalScrollable));

    const rawIndex = progress * (SECTION_COUNT - 1);
    const lowerIndex = Math.min(Math.floor(rawIndex), SECTION_COUNT - 1);
    const upperIndex = Math.min(lowerIndex + 1, SECTION_COUNT - 1);
    const blend = rawIndex - lowerIndex;

    sections.forEach((_, index) => {
      let opacity, translateY, scale;

      if (lowerIndex === upperIndex) {
        opacity = index === lowerIndex ? 1 : 0;
        translateY = index === lowerIndex ? 0 : 40;
        scale = index === lowerIndex ? 1.0 : 0.97;
      } else if (index === lowerIndex) {
        // OUTGOING: visible 0–35%, quick fade 35–50%
        if (blend <= 0.35) {
          opacity = 1;
          translateY = 0;
          scale = 1.0;
        } else if (blend <= 0.50) {
          const t = (blend - 0.35) / 0.15;
          opacity = 1 - t;
          translateY = -t * 30;
          scale = 1.0 - t * 0.03;
        } else {
          opacity = 0;
          translateY = -30;
          scale = 0.97;
        }
      } else if (index === upperIndex) {
        // INCOMING: quick fade in 50–65%, visible 65–100%
        if (blend <= 0.50) {
          opacity = 0;
          translateY = 30;
          scale = 0.97;
        } else if (blend <= 0.65) {
          const t = (blend - 0.50) / 0.15;
          opacity = t;
          translateY = 30 * (1 - t);
          scale = 0.97 + t * 0.03;
        } else {
          opacity = 1;
          translateY = 0;
          scale = 1.0;
        }
      } else {
        opacity = 0;
        translateY = index < lowerIndex ? -30 : 30;
        scale = 0.97;
      }

      const el = sectionElsRef.current[index];
      const imgEl = imgElsRef.current[index];

      if (el) {
        el.style.opacity = opacity;
        el.style.transform = `translateY(${translateY}px)`;
        el.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
      }
      if (imgEl) {
        imgEl.style.transform = `scale(${scale})`;
      }
    });

    const newActive = blend < 0.5 ? lowerIndex : upperIndex;
    if (newActive !== activeRef.current) {
      activeRef.current = newActive;
      setActive(newActive);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      updateVisuals();
      rafRef.current = null;
    });
  }, [updateVisuals]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    updateVisuals();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll, updateVisuals]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const scrollTo = (index) => {
    const container = containerRef.current;
    if (!container) return;

    const totalScrollable =
      container.getBoundingClientRect().height - window.innerHeight;
    const targetProgress = SECTION_COUNT > 1 ? index / (SECTION_COUNT - 1) : 0;
    const targetScroll = container.offsetTop + targetProgress * totalScrollable;

    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="relative bg-black"
      style={{ height: `${CONTAINER_HEIGHT_VH * 100}vh` }}
    >
      <div className="sticky top-0 flex min-h-[100svh] items-center justify-center overflow-hidden">
        <div
          className="relative w-full max-w-6xl px-5 sm:px-8"
          style={{ minHeight: "600px" }}
        >
          {sections.map((section, index) => {
            const route = `/${section.title.toLowerCase()}`;

            return (
              <div
                key={index}
                ref={(el) => {
                  sectionElsRef.current[index] = el;
                }}
                className="absolute inset-0 flex flex-col items-center gap-8 py-20 md:flex-row md:gap-16 md:py-0"
                style={{
                  opacity: index === 0 ? 1 : 0,
                  transform:
                    index === 0 ? "translateY(0px)" : "translateY(30px)",
                  willChange: "transform, opacity",
                  pointerEvents: index === 0 ? "auto" : "none",
                }}
              >
                <div className="overflow-hidden flex-1 w-full rounded-sm">
                  <img
                    ref={(el) => {
                      imgElsRef.current[index] = el;
                    }}
                    src={section.image}
                    alt={section.title}
                    style={{
                      transform: "scale(1)",
                      willChange: "transform",
                    }}
                    className="h-64 w-full object-cover sm:h-80 md:h-[600px]"
                  />
                </div>

                <div className="flex-1 w-full">
                  <div className="w-16 h-1 bg-white/30 mb-4"></div>

                  <Link href={route} className="group flex items-center gap-4">
                    <h3 className="pp-fragment text-4xl font-medium uppercase text-white sm:text-6xl">
                      {section.title}
                    </h3>
                    <ArrowRight
                      size={28}
                      color="white"
                      className="-rotate-45 transition-transform duration-300 group-hover:rotate-0"
                    />
                  </Link>

                  <p className="mt-5 text-gray-300 text-sm sm:text-base font-light max-w-lg">
                    {section.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`fixed right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 transition-opacity duration-500 sm:right-8 ${
          isVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isVisible}
      >
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className="transition-all duration-500 ease-in-out"
            style={{
              width: index === active ? "28px" : "10px",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor:
                index === active ? "#ffffff" : "rgba(255,255,255,0.3)",
            }}
            aria-label={`Scroll to ${section.title}`}
          />
        ))}
      </div>
    </section>
  );
}