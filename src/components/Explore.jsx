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
  const textRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Retrieve the index of the intersecting text block
            const index = Number(entry.target.getAttribute("data-index"));
            setActive(index);
          }
        });
      },
      {
        root: null,
        rootMargin: "-40% 0px -40% 0px", // Trigger when the text block is in the middle 20% of the screen
        threshold: 0,
      }
    );

    textRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative bg-black w-full text-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row relative">
        
        {/* Left Side: Sticky Image Container */}
        <div className="md:w-1/2 h-[100svh] sticky top-0 flex items-center justify-center overflow-hidden py-10 md:py-0 z-10">
          <div className="relative w-full h-[40vh] sm:h-80 md:h-[600px] rounded-xl overflow-hidden bg-white/5">
            {/* The inner track that slides vertically based on the active index */}
            <div
              className="absolute top-0 left-0 w-full h-full transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
              style={{
                transform: `translateY(-${active * 100}%)`,
                transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              {sections.map((section, index) => (
                <div key={index} className="w-full h-full relative">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Subtle darkening overlay for unselected state (optional) */}
                  <div 
                    className={`absolute inset-0 bg-black transition-opacity duration-700 ${
                      active === index ? 'opacity-0' : 'opacity-40'
                    }`} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Normal Scrollable Text Blocks */}
        <div className="md:w-1/2 md:pl-16 relative z-0 pb-[10vh]">
          {sections.map((section, index) => {
            const route = `/${section.title.toLowerCase()}`;
            return (
              <div
                key={index}
                data-index={index}
                ref={(el) => (textRefs.current[index] = el)}
                className="min-h-[100svh] flex flex-col justify-center py-20"
              >
                <div 
                  className={`transition-all duration-700 ${
                    active === index ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-8'
                  }`}
                >
                  <div className="w-16 h-1 bg-white/30 mb-6 transition-colors duration-500 hover:bg-white"></div>

                  <Link href={route} className="group flex items-center gap-4 w-fit">
                    <h3 className="pp-fragment text-4xl font-medium uppercase text-white sm:text-6xl tracking-wide">
                      {section.title}
                    </h3>
                    <ArrowRight
                      size={32}
                      color="white"
                      className="-rotate-45 transition-transform duration-300 group-hover:rotate-0"
                    />
                  </Link>

                  <p className="mt-6 text-gray-400 text-sm sm:text-base font-light max-w-lg leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}