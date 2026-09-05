"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function MinimalSections() {
  const exploreRef = useRef(null);
  const sectionRefs = useRef([]);
  const previousScrollY = useRef(0);
  const [active, setActive] = useState(0);
  const [isExploreVisible, setIsExploreVisible] = useState(true);
  const [isNavVisible, setIsNavVisible] = useState(false);

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

  // Track active section for the side-dot nav (same idea as before, using scroll position instead of IntersectionObserver
  // since sections are now pinned/sticky rather than simple full-height blocks)
  useEffect(() => {
    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDirection =
          currentScrollY >= previousScrollY.current ? "down" : "up";
        previousScrollY.current = currentScrollY;
        let closestIndex = 0;
        let closestDist = Infinity;

        sectionRefs.current.forEach((el, i) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          // Consider a section "active" while its pinned range covers the viewport center
          if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
            closestIndex = i;
            closestDist = 0;
          } else {
            const dist = Math.min(Math.abs(rect.top), Math.abs(rect.bottom - window.innerHeight));
            if (dist < closestDist) {
              closestDist = dist;
              closestIndex = i;
            }
          }
        });

        setActive(closestIndex);
        const firstSection = sectionRefs.current[0];
        const firstRect = firstSection?.getBoundingClientRect();
        const firstProgress = firstRect
          ? Math.min(
              1,
              Math.max(
                0,
                -firstRect.top / (firstRect.height - window.innerHeight),
              ),
            )
          : 0;
        const lastSection = sectionRefs.current[2];
        const lastRect = lastSection?.getBoundingClientRect();
        const lastProgress = lastRect
          ? Math.min(
              1,
              Math.max(
                0,
                -lastRect.top / (lastRect.height - window.innerHeight),
              ),
            )
          : 1;

        setIsNavVisible(
          closestIndex === 1 ||
            (closestIndex === 0 && firstProgress >= 0.75) ||
            (closestIndex === 2 &&
              scrollDirection === "up" &&
              lastProgress <= 0.25),
        );
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const explore = exploreRef.current;
    if (!explore) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsExploreVisible(entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(explore);
    return () => observer.disconnect();
  }, []);

  const scrollTo = (index) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section ref={exploreRef} className="relative bg-black">
      {sections.map((section, index) => {
        const route = `/${section.title.toLowerCase()}`;

        return (
          <PinnedSection
            key={index}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            section={section}
            route={route}
          />
        );
      })}

      <div
        className={`fixed right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 transition-opacity duration-300 sm:right-8 ${
          isExploreVisible && isNavVisible
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isExploreVisible || !isNavVisible}
      >
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
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

// Separate component per section so each has its own scroll-progress tracking
import { forwardRef } from "react";

const PinnedSection = forwardRef(({ section, route }, ref) => {
  const wrapperRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const rafRef = useRef(null);

  const updateProgress = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.min(1, Math.max(0, scrolled / totalScrollable));

    // Image: scales up slightly and loses a bit of blur as you scroll into the section
    if (imageRef.current) {
      const scale = 1.05 - progress * 0.05; // 1.05 -> 1.0
      imageRef.current.style.transform = `scale(${scale})`;
    }

    // Text: fades and slides up during the first half of the pin, then holds
    if (textRef.current) {
      const textProgress = Math.min(1, progress / 0.5); // reach full reveal by halfway through
      textRef.current.style.opacity = textProgress;
      textRef.current.style.transform = `translateY(${(1 - textProgress) * 24}px)`;
    }
  };

  const handleScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      updateProgress();
      rafRef.current = null;
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    updateProgress();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={(el) => {
        wrapperRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      style={{ height: "200vh", position: "relative" }}
    >
      <div
        className="sticky top-0 flex min-h-[100svh] items-center justify-center overflow-hidden py-20"
      >
        <div className="flex w-full max-w-6xl flex-col items-center gap-8 px-5 sm:px-8 md:flex-row md:gap-16 md:py-0">
          <div className="overflow-hidden flex-1 w-full">
            <img
              ref={imageRef}
              src={section.image}
              alt={section.title}
              style={{ willChange: "transform" }}
              className="h-64 w-full object-cover sm:h-80 md:h-[600px]"
            />
          </div>

          <div ref={textRef} className="flex-1 w-full" style={{ willChange: "transform, opacity" }}>
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
    </div>
  );
});

PinnedSection.displayName = "PinnedSection";