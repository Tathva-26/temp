"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";
import CompetitionTabs from "@/components/CompetitionTabs";
import BackendStatus from "@/components/BackendStatus";
import mockCompetitions from "@/data/mockCompetitions";
import { usePerformance } from "@/context/PerformanceContext";

gsap.registerPlugin(ScrollTrigger);

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== "false";

export default function EventsPage() {
  // State for storing competitions, loading status, errors, and the search query
  const [allCompetitions, setAllCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { lowPowerMode } = usePerformance();

  // Refs for animations
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const searchRef = useRef(null);
  const gridRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch data when the component mounts
  useEffect(() => {
    const getCompetitions = async () => {
      // If backend is disabled, use mock data directly
      if (!backendEnabled) {
        setAllCompetitions(mockCompetitions);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const url = `${process.env.NEXT_PUBLIC_API}/api/events/all?type=competitions`;
        const response = await axios.get(url);
        const apiEvents = response.data.events || [];
        // Use API data if available, otherwise fall back to mock data
        setAllCompetitions(apiEvents.length > 0 ? apiEvents : mockCompetitions);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch competitions:", err);
        // Fallback to mock data instead of showing an error
        setAllCompetitions(mockCompetitions);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    getCompetitions();
  }, []); // Empty dependency array ensures this runs only once

  // ── Hero Title Animation (SplitText-style character stagger) ──
  useEffect(() => {
    if (loading || lowPowerMode) return;

    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const searchEl = searchRef.current;
    if (!titleEl) return;

    // Split title into individual character spans
    const text = titleEl.textContent;
    titleEl.innerHTML = text
      .split("")
      .map(
        (char) =>
          `<span class="inline-block" style="opacity:0; transform:translateY(40px)">${char === " " ? "&nbsp;" : char}</span>`
      )
      .join("");

    const chars = titleEl.querySelectorAll("span");

    // Animate characters
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.03,
      ease: "power3.out",
      delay: 0.2,
    });

    // Fade in subtitle after title
    if (subtitleEl) {
      gsap.fromTo(
        subtitleEl,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.6 }
      );
    }

    // Fade in search bar
    if (searchEl) {
      gsap.fromTo(
        searchEl,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.8 }
      );
    }
  }, [loading, lowPowerMode]);

  // ── ScrollTrigger Staggered Card Reveal ──
  useEffect(() => {
    if (loading || lowPowerMode) return;

    // Wait a tick for the grid to render
    const timer = setTimeout(() => {
      const cards = gridRef.current?.querySelectorAll(".comp-card");
      if (!cards || cards.length === 0) return;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [loading, lowPowerMode, searchQuery]);

  // ── Velocity-based Scroll Skew ──
  useEffect(() => {
    if (loading || lowPowerMode) return;

    const container = containerRef.current;
    if (!container) return;

    let skewTarget = 0;
    let currentSkew = 0;
    let rafId;

    const handleScroll = () => {
      // Lenis provides velocity through the scroll event;
      // as a fallback we track delta manually
      skewTarget = 0; // will be updated by Lenis
    };

    // Listen to Lenis scroll events via the global instance
    const lenisEl = document.querySelector("[data-lenis-prevent]")?.closest("[data-lenis]");

    // Simpler approach: track scroll velocity via requestAnimationFrame
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        const velocity = (window.scrollY - lastScrollY) / dt;
        skewTarget = Math.max(-2, Math.min(2, velocity * 15));
        lastScrollY = window.scrollY;
        lastTime = now;
      }

      // Lerp toward target
      currentSkew += (skewTarget - currentSkew) * 0.1;
      if (Math.abs(currentSkew) > 0.01) {
        container.style.transform = `skewY(${currentSkew}deg)`;
      } else {
        container.style.transform = "";
      }

      // Decay target toward 0
      skewTarget *= 0.95;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (container) container.style.transform = "";
    };
  }, [loading, lowPowerMode]);

  // Filter competitions based on the search query in real-time
  const searchedCompetitions = allCompetitions.filter((event) =>
    event.heading.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate the *filtered* list into two categories
  const kgpcEvents = searchedCompetitions.filter(
    (event) => event.committee === "GPC"
  );
  const gpcEvents = kgpcEvents.filter((event) => !event.isFull);
  const kotherCompetitions = searchedCompetitions.filter(
    (event) => event.committee !== "GPC"
  );
  const otherCompetitions = kotherCompetitions.filter(
    (event) => !event.isFull
  );

  // Loading state UI
  if (loading) {
    return (
      <div className="bg-transparent min-h-screen py-16 px-4 sm:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
          <p className="mt-4 text-gray-300">Loading competitions...</p>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="bg-transparent min-h-screen py-16 px-4 sm:px-8 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xl font-semibold">Error loading competitions</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen pt-16 pb-2 sm:pb-4 px-4 sm:px-8 text-white">
      {/* ── Hero Header ── */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 hover:text-white transition-colors"
        >
          ← Home
        </Link>

        <div className="mt-2 mb-4 border-b border-white/15 pb-3">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            {/* Title + subtitle */}
            <div>
              <h1
                ref={titleRef}
                className="pp-fragment text-3xl sm:text-4xl md:text-5xl tracking-wide text-white uppercase leading-none"
              >
                COMPETITIONS
              </h1>
              <p
                ref={subtitleRef}
                className="inter text-sm sm:text-base text-gray-500 mt-3 tracking-wide"
                style={{ opacity: lowPowerMode ? 1 : 0 }}
              >
                Push the boundaries of innovation
              </p>
            </div>

            {/* Search bar — frosted glass */}
            <div
              ref={searchRef}
              className="relative w-full md:max-w-sm"
              style={{ opacity: lowPowerMode ? 1 : 0 }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search competitions..."
                className="search-glow w-full py-3 px-5 pr-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white text-sm placeholder:text-gray-500 focus:outline-none inter"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid Container (for scroll skew + card reveals) ── */}
      <div ref={containerRef}>
        <div ref={gridRef}>
          {/* Conditional rendering for the tabs or a "not found" message */}
          {searchedCompetitions.length === 0 && !loading ? (
            <p className="text-center text-gray-300 text-lg mt-16">
              No competitions found matching your search.
            </p>
          ) : (
            <CompetitionTabs
              tathvaEvents={otherCompetitions}
              preTathvaEvents={gpcEvents}
            />
          )}
        </div>
      </div>
    </div>
  );
}
