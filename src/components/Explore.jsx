"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

export default function MinimalSections() {
  const containerRef = useRef(null);
  const [active, setActive] = useState(0);

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
        "Over 65 events including coding competitions, gaming, and cultural showcases. From technical battles of skill to fun informal events, Tathva’s events are designed to inspire innovation, teamwork, and creativity.",
    },
    {
      image: "/images/lecture.jpg",
      title: "Lectures",
      description:
        "Industry experts and academicians share insights on emerging technologies. The lecture series bridges the gap between academia and industry, inspiring students to think beyond classrooms and pursue cutting-edge innovations.",
    },
  ];

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const index = Math.round(el.scrollTop / el.clientHeight);
    setActive(Math.min(index, sections.length - 1));
  };

  const scrollTo = (index) => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollTo({
      top: index * el.clientHeight,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={containerRef}
      onScroll={handleScroll}
      className="relative h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {sections.map((section, index) => {
        const route = `/${section.title.toLowerCase()}`;

        return (
          <div
            key={index}
            className="relative h-screen snap-start flex items-center justify-center overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-6xl w-full px-4 sm:px-8 pt-16 md:pt-0">
              <div className="overflow-hidden flex-1 w-full">
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-64 sm:h-80 md:h-[600px] object-cover scale-105"
                />
              </div>

              <div className="flex-1 w-full">
                <div className="w-16 h-1 bg-white/30 mb-4"></div>

                <Link href={route} className="group flex items-center gap-4">
                  <h3 className="text-4xl sm:text-6xl font-medium text-white pp-fragment uppercase">
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
          </div>
        );
      })}

      <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className="transition-all duration-300"
            style={{
              width: index === active ? "28px" : "10px",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor: index === active ? "#ffffff" : "rgba(255,255,255,0.3)",
            }}
            aria-label={`Scroll to ${section.title}`}
          />
        ))}
      </div>
    </section>
  );
}