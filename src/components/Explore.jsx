"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

export default function Explore() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    let rafId = null;
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const totalTravel = rect.height - window.innerHeight;

      // Calculate how far we have scrolled into the section
      const travel = -rect.top;

      if (travel < 0 || totalTravel <= 0) {
        // Before the section reaches the top
        if (travel < 0 && active !== 0) setActive(0);
        return;
      }

      // Progress from 0.0 to 1.0
      const progress = Math.max(0, Math.min(1, travel / totalTravel));

      // Perfectly uniform mapping: divide the 1.0 progress by number of sections
      // Use Math.min to ensure it doesn't exceed the last index if progress exactly hits 1.0
      const activeIndex = Math.min(
        sections.length - 1,
        Math.floor(progress * sections.length)
      );

      setActive(activeIndex);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [active]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-transparent w-full text-white"
      // Height is 100vh for the sticky viewport + 60vh of travel per section
      style={{ height: `${(sections.length + 1) * 60}vh` }}
    >

      {/* Sticky Viewport */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col md:flex-row justify-center md:justify-start max-w-6xl mx-auto px-5 sm:px-8 z-10 gap-8 md:gap-0">

        {/* Left Side: Image Container */}
        <div className="md:w-1/2 h-auto md:h-full flex items-end md:items-center justify-center pt-20 md:pt-0 pointer-events-auto">
          <div className="relative w-full h-[40vh] sm:h-80 md:h-[600px] rounded-xl overflow-hidden bg-white/5 shadow-2xl">
            {/* Sliding track for images */}
            <div
              className="absolute top-0 left-0 w-full h-full transition-transform duration-[1000ms]"
              style={{
                transform: `translateY(-${active * 100}%)`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {sections.map((section, index) => (
                <div key={index} className="w-full h-full relative overflow-hidden">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms]"
                    style={{
                      transform: active === index ? "scale(1)" : "scale(1.15)",
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                  {/* Subtle darkening overlay for unselected state */}
                  <div
                    className={`absolute inset-0 bg-black transition-opacity duration-[1000ms] ${active === index ? 'opacity-0' : 'opacity-50'
                      }`}
                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Text Blocks */}
        <div className="md:w-1/2 h-auto md:h-full relative flex flex-col justify-start md:justify-center md:pl-16 pointer-events-auto">
          {/* Container matching image height roughly, to contain text animation */}
          <div className="relative w-full h-[40vh] sm:h-80 md:h-[600px] flex items-start md:items-center">
            {sections.map((section, index) => {
              const route = `/${section.title.toLowerCase()}`;
              const isActive = active === index;
              const isPast = active > index;

              return (
                <div
                  key={index}
                  className={`absolute left-0 right-0 md:right-8 lg:right-16 transition-all duration-[800ms] flex flex-col justify-center ${isActive
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : isPast
                        ? 'opacity-0 -translate-y-16 pointer-events-none'
                        : 'opacity-0 translate-y-16 pointer-events-none'
                    }`}
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  {/* Creative "Dark Nebula" Fade - No UI borders, just atmospheric darkness */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.85)_0%,_rgba(0,0,0,0.5)_40%,_transparent_70%)] pointer-events-none -z-10" />
                  <div
                    className={`w-16 h-1 mb-6 transition-all duration-[800ms] delay-100 ${isActive ? 'bg-cyan-400 scale-x-100 origin-left' : 'bg-white/20 scale-x-50 origin-left'
                      }`}
                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  />

                  <Link href={route} className="group flex items-center gap-3 sm:gap-4 w-fit whitespace-nowrap">
                    <h3 className="pp-fragment text-4xl sm:text-5xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-medium uppercase text-white tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                      {section.title}
                    </h3>
                    <ArrowRight
                      className="shrink-0 w-8 h-8 md:w-6 md:h-6 lg:w-8 lg:h-8 -rotate-45 transition-all duration-300 group-hover:rotate-0 group-hover:translate-x-1 opacity-100 text-cyan-400"
                    />
                  </Link>

                  <p
                    className={`mt-6 text-white/80 text-sm sm:text-base font-light max-w-lg leading-relaxed transition-all duration-[800ms] delay-150 drop-shadow-md ${isActive ? 'opacity-100 translate-y-0' : isPast ? 'opacity-0 -translate-y-4' : 'opacity-0 translate-y-4'
                      }`}
                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  >
                    {section.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}