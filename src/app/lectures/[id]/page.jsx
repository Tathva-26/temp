"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
// import { notFound } from "next/navigation";
// import ModalWrapper from "@/components/modelWrapper";
// import BrochureButton from "@/components/BrochureButton";
// import BackendStatus from "@/components/BackendStatus";

// const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== "false";

// DATA FETCHING FUNCTION (commented out — API calls disabled)
// async function getEvent(id) {
//   const url = `${process.env.NEXT_PUBLIC_API}/api/events/details/${id}`;
//   const res = await fetch(url);
//
//   if (!res.ok) {
//     console.log("Failed to fetch event:", res);
//   }
//   const data = await res.json();
//
//   if (!data.event || data.event.length === 0) return null;
//   return data.event;
// }

// async function getBrochure(id) {
//   const url = `https://api.tiqr.events/participant/event/${id}`;
//   const res = await fetch(url);
//
//   if (!res.ok) {
//     console.log("Failed to fetch brochure:", res);
//   }
//   const data = await res.json();
//   console.log(data);
//
//   return data.gallery;
// }

// ── Placeholder mock lectures (matches listing page) ──
const MOCK_LECTURES = {
  1: {
    id: 1,
    heading: "Genetic Algorithms & Evolutionary Computing",
    description:
      "Explore search heuristics and optimization inspired by natural selection and genetics. This lecture covers fundamental principles of evolutionary computation, including selection, crossover, mutation operators, and fitness landscapes. Learn how nature's algorithms solve complex optimization problems that traditional methods struggle with.",
    catchyPara:
      "From Darwin's theory to modern computing — discover how the principles of natural selection power today's most innovative optimization algorithms. This hands-on session will walk you through designing your own genetic algorithm from scratch, applying it to real-world engineering challenges, and understanding the mathematical foundations that make evolution a powerful computational paradigm.",
    picture: "/images/lecture.jpg",
    price: 0,
    datetime: "2026-10-24T10:00:00.000Z",
    venue: "Auditorium",
    isTeamEvent: false,
    teamSize: null,
    speaker: "Dr. Sarah Mitchell",
    speakerTitle: "Professor of Computer Science, MIT",
  },
  2: {
    id: 2,
    heading: "Artificial Neural Networks & Deep Learning",
    description:
      "Deep dive into multi-layer architectures, backpropagation, and state-of-the-art vision models. Understand the building blocks of modern AI systems that power everything from self-driving cars to medical diagnosis.",
    catchyPara:
      "The neural revolution is here. From perceptrons to transformers, this lecture traces the evolution of artificial neural networks and demonstrates how deep learning architectures achieve superhuman performance on tasks once thought impossible for machines.",
    picture: "/images/lecture.jpg",
    price: 0,
    datetime: "2026-10-24T14:00:00.000Z",
    venue: "NLHC",
    isTeamEvent: false,
    teamSize: null,
    speaker: "Prof. James Chen",
    speakerTitle: "AI Research Lead, DeepMind",
  },
  3: {
    id: 3,
    heading: "Generative Adversarial Networks",
    description:
      "Understanding generator-discriminator dynamics, latent spaces, and synthesizing high-fidelity imagery. Explore the fascinating world of AI creativity and learn how machines can generate photorealistic content.",
    catchyPara:
      "Two neural networks locked in an adversarial game — one creates, the other critiques. This elegant framework has revolutionized content generation, from deepfakes to drug discovery. Join us to understand the mathematics, the magic, and the future of generative AI.",
    picture: "/images/lecture.jpg",
    price: 0,
    datetime: "2026-10-25T11:00:00.000Z",
    venue: "Auditorium",
    isTeamEvent: false,
    teamSize: null,
    speaker: "Dr. Elena Rodriguez",
    speakerTitle: "Senior Researcher, OpenAI",
  },
  4: {
    id: 4,
    heading: "Graph Mining & Network Topology",
    description:
      "Analyzing large-scale interconnected data structures, node embeddings, and topological dynamics. Discover how graph theory powers social networks, recommendation engines, and biological network analysis.",
    catchyPara:
      "Everything is connected. From social media influence to protein interactions, graph mining reveals hidden patterns in our interconnected world. This lecture introduces cutting-edge techniques in network analysis, community detection, and graph neural networks.",
    picture: "/images/Graph_Mining.png",
    price: 0,
    datetime: "2026-10-25T15:00:00.000Z",
    venue: "NLHC",
    isTeamEvent: false,
    teamSize: null,
    speaker: "Dr. Arun Krishnan",
    speakerTitle: "Data Science Lead, Google Research",
  },
  5: {
    id: 5,
    heading: "Quantum Computing & Quantum Information Theory",
    description:
      "From qubits and superposition to quantum entanglement and modern computational speedups. Enter the quantum realm where bits exist in multiple states simultaneously and computation transcends classical limits.",
    catchyPara:
      "Welcome to the quantum frontier. This lecture demystifies quantum computing by building intuition from first principles — superposition, entanglement, and interference. Learn about quantum algorithms that promise exponential speedups and the engineering challenges of building fault-tolerant quantum processors.",
    picture: "/images/Quantum_Computing.jpg",
    price: 0,
    datetime: "2026-10-26T10:30:00.000Z",
    venue: "Auditorium",
    isTeamEvent: false,
    teamSize: null,
    speaker: "Prof. Maria Santos",
    speakerTitle: "Quantum Physics Lab, CERN",
  },
  6: {
    id: 6,
    heading: "Autonomous Robotics & Embodied AI",
    description:
      "Real-time sensor fusion, SLAM, and reinforcement learning in embodied robotic systems. Explore the intersection of perception, planning, and action in intelligent machines.",
    catchyPara:
      "Robots that see, think, and act. This lecture covers the full autonomy stack — from LiDAR and camera fusion to simultaneous localization and mapping (SLAM), and from motion planning to reinforcement learning in the physical world.",
    picture: "/images/lecture.jpg",
    price: 0,
    datetime: "2026-10-26T14:30:00.000Z",
    venue: "NLHC",
    isTeamEvent: false,
    teamSize: null,
    speaker: "Dr. Takeshi Yamamoto",
    speakerTitle: "Robotics Division, Boston Dynamics",
  },
};

// ── Scramble / decode effect constants ──
const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*_-+=<>/\\|[]{}";
const DECODE_SPEED = 35; // ms per tick
const STAGGER_PER_CHAR = 0.6; // higher = more sequential resolve

// MAIN PAGE COMPONENT
export default function EventPage() {
  const params = useParams();
  const id = params?.id;

  const event = MOCK_LECTURES[id] || MOCK_LECTURES[1]; // fallback to first lecture

  // ── Refs for decode-animated text elements ──
  const titleRef = useRef(null);
  const dateRef = useRef(null);
  const venueRef = useRef(null);
  const priceRef = useRef(null);
  const descRef = useRef(null);
  const catchyRef = useRef(null);
  const speakerRef = useRef(null);
  const speakerTitleRef = useRef(null);
  const aboutHeadingRef = useRef(null);

  const [decodeComplete, setDecodeComplete] = useState(false);

  // ── Scramble decode engine ──
  // Uses requestAnimationFrame for smooth animation and tracks all timers
  // for proper cleanup (critical for React strict mode double-mount in dev).

  const randomChar = () =>
    SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];

  const decodeElement = (el, finalText, delay, abortSignal) => {
    if (!el || !finalText) return;
    const len = finalText.length;

    // Build per-character resolve thresholds (staggered left→right with jitter)
    const thresholds = Array.from({ length: len }, (_, i) => {
      const base = len > 1 ? i / (len - 1) : 0;
      return Math.min(
        base * STAGGER_PER_CHAR + Math.random() * (1 - STAGGER_PER_CHAR),
        1
      );
    });

    const totalDuration = 1200; // fixed ms — all elements finish together
    let startTime = null;

    // Immediately show scrambled text
    el.textContent = Array.from({ length: len }, (_, i) =>
      finalText[i] === " " ? " " : randomChar()
    ).join("");

    const animate = (timestamp) => {
      if (abortSignal.aborted) return;

      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      let out = "";
      for (let i = 0; i < len; i++) {
        const ch = finalText[i];
        if (ch === " ") {
          out += ch;
        } else if (progress >= thresholds[i]) {
          out += ch;
        } else {
          // Cycle through random chars (re-scramble each frame for the "cycling" look)
          out += randomChar();
        }
      }
      el.textContent = out;

      if (progress >= 1) {
        el.textContent = finalText;
      } else {
        requestAnimationFrame(animate);
      }
    };

    // Delay before starting the animation
    const timer = setTimeout(() => {
      if (!abortSignal.aborted) {
        requestAnimationFrame(animate);
      }
    }, delay);

    // Return a cleanup that cancels the delay timer
    // (rAF is cancelled via the abortSignal check)
    return () => clearTimeout(timer);
  };

  // ── Run scramble text decode on mount ──
  useEffect(() => {
    // AbortController lets us cancel all in-flight rAF loops on cleanup
    const controller = new AbortController();
    const timers = [];

    // Title
    timers.push(
      decodeElement(
        titleRef.current,
        event.heading.toUpperCase(),
        100,
        controller.signal
      )
    );

    // Info items
    const formattedDate = new Date(event.datetime).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    timers.push(
      decodeElement(dateRef.current, formattedDate, 100, controller.signal)
    );
    timers.push(
      decodeElement(
        venueRef.current,
        event.venue || "TBA",
        100,
        controller.signal
      )
    );
    const priceText = event.price === 0 ? "Free" : `₹${event.price / 100}`;
    timers.push(
      decodeElement(priceRef.current, priceText, 100, controller.signal)
    );

    // Speaker
    timers.push(
      decodeElement(
        speakerRef.current,
        event.speaker || "TBA",
        100,
        controller.signal
      )
    );
    timers.push(
      decodeElement(
        speakerTitleRef.current,
        event.speakerTitle || "",
        100,
        controller.signal
      )
    );

    // Description
    timers.push(
      decodeElement(
        descRef.current,
        event.description,
        100,
        controller.signal
      )
    );

    // About heading + catchy para
    if (event.catchyPara) {
      timers.push(
        decodeElement(
          aboutHeadingRef.current,
          "ABOUT THIS EVENT",
          100,
          controller.signal
        )
      );
      timers.push(
        decodeElement(
          catchyRef.current,
          event.catchyPara,
          100,
          controller.signal
        )
      );
    }

    // Mark decode complete
    const doneTimer = setTimeout(() => setDecodeComplete(true), 3500);

    return () => {
      // Abort all rAF loops + clear all delay timers
      controller.abort();
      timers.forEach((fn) => fn && fn());
      clearTimeout(doneTimer);
    };
  }, [event]);

  const formatTime = (timeString) => {
    if (!timeString) return "TBA";
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // Prepare event data
  const eventData = {
    id: event.id,
    name: event.heading,
    time: formatTime(event.datetime),
    venue: event.venue || null,
    price: event.price === 0 ? "Free" : `₹${event.price / 100}`,
    description: event.description || "No description available",
    catchyPara: event.catchyPara || null,
    image: event.picture,
    isTeamEvent: event.isTeamEvent,
    teamSize: event.teamSize,
    speaker: event.speaker || null,
    speakerTitle: event.speakerTitle || null,
  };

  return (
    <div className="bg-transparent min-h-screen py-4 sm:py-10 px-4 sm:px-8 text-white" style={{ position: "relative", overflow: "hidden" }}>
      <style jsx>{`
        .scramble-text {
          font-family: "PP Fragment", monospace;
          display: inline-block;
          min-height: 1em;
        }

        .register-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 36px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 12px;
          color: #fff;
          font-family: "PP Fragment", "Inter", sans-serif;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          backdrop-filter: blur(12px);
        }

        .register-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.12),
            rgba(255, 255, 255, 0.02)
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          border-radius: inherit;
        }

        .register-btn:hover {
          border-color: rgba(255, 255, 255, 0.35);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.08) inset;
          transform: translateY(-2px);
        }

        .register-btn:hover::before {
          opacity: 1;
        }

        .register-btn:active {
          transform: translateY(0);
          transition-duration: 0.1s;
        }

        .register-btn .btn-arrow {
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .register-btn:hover .btn-arrow {
          transform: translateX(4px);
        }

        .register-btn .btn-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          transform: translate(-50%, -50%);
          animation: btn-pulse-ring 2.5s ease-out infinite;
        }

        @keyframes btn-pulse-ring {
          0% {
            width: 0;
            height: 0;
            opacity: 0.5;
          }
          100% {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }

        .info-label {
          font-size: 11px;
          text-transform: uppercase;
          color: rgba(156, 163, 175, 0.8);
          letter-spacing: 3px;
          margin-bottom: 6px;
          font-family: "Inter", sans-serif;
        }

        .info-value {
          font-family: "PP Fragment", monospace;
          font-weight: 500;
          color: #fff;
          min-height: 1.4em;
        }

        .detail-card {
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            box-shadow 0.5s ease,
            border-color 0.5s ease;
        }

        .detail-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 255, 255, 0.18);
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 500px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            box-shadow 0.5s ease;
        }

        .image-container:hover {
          transform: scale(1.02);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
        }

        .image-container::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            transparent 60%,
            rgba(0, 0, 0, 0.6)
          );
          pointer-events: none;
        }

        .divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.15) 20%,
            rgba(255, 255, 255, 0.15) 80%,
            transparent
          );
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(156, 163, 175, 0.7);
          text-decoration: none;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: color 0.3s ease, gap 0.3s ease;
        }

        .back-link:hover {
          color: #fff;
          gap: 12px;
        }

        .speaker-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          margin-top: 4px;
        }

        .speaker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          animation: speaker-pulse 2s ease-in-out infinite;
        }

        @keyframes speaker-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <Link href="/lectures" className="back-link">
            <span>←</span>
            <span>Back to Lectures</span>
          </Link>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl pp-fragment font-medium tracking-wide mt-4 text-white uppercase"
            style={{ minHeight: "1.2em" }}
          >
            <span ref={titleRef} className="scramble-text">
              &nbsp;
            </span>
          </h1>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left — Image Section */}
          <div className="lg:col-span-4">
            <div className="image-container">
              <Image
                src={eventData.image}
                alt={eventData.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right — Info Section */}
          <div className="lg:col-span-8 detail-card p-6 sm:p-8">
            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="info-label">Date</p>
                <p className="info-value">
                  <span ref={dateRef}>&nbsp;</span>
                </p>
              </div>
              <div>
                <p className="info-label">Time</p>
                <p className="info-value">{eventData.time}</p>
              </div>
              <div>
                <p className="info-label">Venue</p>
                <p className="info-value">
                  <span ref={venueRef}>&nbsp;</span>
                </p>
              </div>
              <div>
                <p className="info-label">Price</p>
                <p className="info-value">
                  <span ref={priceRef}>&nbsp;</span>
                </p>
              </div>
            </div>

            {/* Speaker */}
            {eventData.speaker && (
              <div className="mb-6">
                <p className="info-label">Speaker</p>
                <div className="speaker-badge">
                  <span className="speaker-dot" />
                  <div>
                    <p className="info-value text-sm" style={{ minHeight: "auto" }}>
                      <span ref={speakerRef}>&nbsp;</span>
                    </p>
                    <p
                      className="text-xs text-gray-400"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <span ref={speakerTitleRef}>&nbsp;</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="divider mb-6" />

            {/* Description */}
            <div>
              <p
                className="text-base leading-relaxed text-gray-300 whitespace-pre-line break-words"
                style={{ minHeight: "3em" }}
              >
                <span ref={descRef}>&nbsp;</span>
              </p>

              {eventData.catchyPara && (
                <a
                  href="#full-description"
                  className="inline-block mt-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  style={{ letterSpacing: "1px", textTransform: "uppercase" }}
                >
                  Read more ↓
                </a>
              )}

              {/* Registration Button */}
              <div className="flex items-center gap-4 mt-6 mb-5">
                <button className="register-btn">
                  <span className="btn-pulse" />
                  <span style={{ position: "relative", zIndex: 1 }}>
                    Register Now
                  </span>
                  <span
                    className="btn-arrow"
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    →
                  </span>
                </button>
              </div>

              <p
                className="mt-1 text-sm text-gray-500"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Ticket details are automatically taken from your profile. You
                can update them on the{" "}
                <Link
                  href="/profile"
                  className="font-medium text-white/70 hover:text-white hover:underline transition-colors"
                >
                  profile page
                </Link>
                .
              </p>
              <p
                className="mt-2 text-xs text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Refund Policy — All tickets are non-refundable and
                non-transferable except in the case of event cancellation or
                technical issues.
              </p>
            </div>
          </div>
        </div>

        {/* Full Description Section (Catchy Para) */}
        {eventData.catchyPara && (
          <div
            id="full-description"
            className="detail-card mt-8 p-6 sm:p-8 scroll-mt-20"
          >
            <h2
              className="text-2xl font-medium pp-fragment text-white mb-4 pb-3"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                minHeight: "1.2em",
              }}
            >
              <span ref={aboutHeadingRef}>&nbsp;</span>
            </h2>
            <div className="prose prose-invert max-w-none">
              <p
                className="text-base leading-relaxed text-gray-300 whitespace-pre-line break-words"
                style={{ fontFamily: "PP Fragment, sans-serif", minHeight: "3em" }}
              >
                <span ref={catchyRef}>&nbsp;</span>
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 sm:mt-16 text-gray-600 text-sm">
          <p>Part of Tathva 25 | National Institute of Technology Calicut</p>
        </div>
      </div>
    </div>
  );
}
