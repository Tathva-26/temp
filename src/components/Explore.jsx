"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function MinimalSections() {
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActive(Number(visible.target.dataset.index));
        }
      },
      { threshold: [0.4, 0.7] }
    );

    sectionRefs.current.forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (index) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={containerRef}
      className="relative bg-black"
    >
      {sections.map((section, index) => {
        const route = `/${section.title.toLowerCase()}`;

        return (
          <div
            key={index}
            ref={(section) => {
              sectionRefs.current[index] = section;
            }}
            data-index={index}
            className="relative flex min-h-[100svh] items-center justify-center overflow-hidden scroll-mt-0 py-20"
          >
            <div className="flex w-full max-w-6xl flex-col items-center gap-8 px-5 sm:px-8 md:flex-row md:gap-16 md:py-0">
              <div className="overflow-hidden flex-1 w-full">
                <img
                  src={section.image}
                  alt={section.title}
                  className="h-64 w-full scale-105 object-cover sm:h-80 md:h-[600px]"
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
          </div>
        );
      })}

      <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 sm:right-8">
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