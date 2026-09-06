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

export default function MinimalSections() {
  const containerRef = useRef(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 1 across the full scroll range

  // Calculate which section is active and the transition progress
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;
    if (totalScrollable <= 0) return;

    const scrolled = -rect.top;
    const rawProgress = Math.min(1, Math.max(0, scrolled / totalScrollable));
    setProgress(rawProgress);

    // Map progress to section index (3 sections)
    const sectionProgress = rawProgress * (sections.length - 1);
    const currentSection = Math.min(
      sections.length - 1,
      Math.floor(sectionProgress)
    );
    setActive(currentSection);
  }, []);

  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [handleScroll]);

  // Per-section progress: 0 = just entering, 1 = about to leave
  const sectionProgress = progress * (sections.length - 1) - active;
  // Clamp between 0 and 1
  const localProgress = Math.min(1, Math.max(0, sectionProgress));

  const scrollToSection = (index) => {
    const container = containerRef.current;
    if (!container) return;
    const totalScrollable = container.offsetHeight - window.innerHeight;
    const targetScroll =
      container.offsetTop + (index / (sections.length - 1)) * totalScrollable;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    // Outer container: tall enough to give scroll room for all 3 sections
    // 300vh = 100vh per section of scroll travel
    <section
      ref={containerRef}
      className="relative bg-black"
      style={{ height: `${sections.length * 100}vh` }}
    >
      {/* Sticky viewport — this stays pinned while the user scrolls through the tall container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="flex w-full max-w-6xl flex-col items-center gap-8 px-5 sm:px-8 md:flex-row md:gap-16">
          {/* Image area — crossfade between section images */}
          <div className="relative flex-1 w-full overflow-hidden h-64 sm:h-80 md:h-[600px]">
            {sections.map((section, index) => {
              // Calculate opacity for smooth crossfade
              let opacity = 0;
              if (index === active) {
                // Current section: fade out as we scroll away
                opacity = 1 - localProgress;
              } else if (index === active + 1) {
                // Next section: fade in
                opacity = localProgress;
              }
              // If it's the last section and fully active, keep it visible
              if (index === active && active === sections.length - 1) {
                opacity = 1;
              }

              return (
                <img
                  key={index}
                  src={section.image}
                  alt={section.title}
                  className="absolute inset-0 h-full w-full object-cover transition-none"
                  style={{
                    opacity,
                    transform: `scale(${1 + (1 - opacity) * 0.05})`,
                    willChange: "opacity, transform",
                  }}
                />
              );
            })}
          </div>

          {/* Text area — crossfade between section text */}
          <div className="relative flex-1 w-full" style={{ minHeight: "200px" }}>
            {sections.map((section, index) => {
              const route = `/${section.title.toLowerCase()}`;

              let opacity = 0;
              let translateY = 24;
              if (index === active) {
                opacity = 1 - localProgress;
                translateY = -localProgress * 24;
              } else if (index === active + 1) {
                opacity = localProgress;
                translateY = (1 - localProgress) * 24;
              }
              if (index === active && active === sections.length - 1) {
                opacity = 1;
                translateY = 0;
              }

              return (
                <div
                  key={index}
                  className="absolute inset-0"
                  style={{
                    opacity,
                    transform: `translateY(${translateY}px)`,
                    willChange: "opacity, transform",
                    pointerEvents: index === active ? "auto" : "none",
                  }}
                >
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
              );
            })}
          </div>
        </div>
      </div>

      {/* Side dot navigation */}
      <div
        className="fixed right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 transition-opacity duration-300 sm:right-8"
      >
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className="transition-all duration-300"
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