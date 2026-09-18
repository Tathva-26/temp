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

// MAIN PAGE COMPONENT
export default function EventPage() {
  const params = useParams();
  const id = params?.id;

  const event = MOCK_LECTURES[id] || MOCK_LECTURES[1]; // fallback to first lecture

  // Only trigger warp if user explicitly navigated by clicking a lecture card
  const [shouldWarp] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem("lecture_warp_nav") === String(id);
    } catch (_) {
      return false;
    }
  });

  const [warpDone, setWarpDone] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return sessionStorage.getItem("lecture_warp_nav") !== String(id);
    } catch (_) {
      return true;
    }
  });
  const warpCanvasRef = useRef(null);
  const contentRef = useRef(null);

  // ── Cinematic, 60fps Time-warp entrance animation ──
  useEffect(() => {
    if (!shouldWarp) {
      setWarpDone(true);
      return;
    }

    // Immediately consume the navigation flag so subsequent refreshes won't warp
    try {
      sessionStorage.removeItem("lecture_warp_nav");
    } catch (_) { }

    const canvas = warpCanvasRef.current;
    const content = contentRef.current;
    if (!canvas || !content) {
      setWarpDone(true);
      return;
    }

    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let cx = w / 2;
    let cy = h / 2;
    let maxR = Math.hypot(w, h) / 2;

    // Palette for realistic sci-fi hyperspace streaks
    const COLORS = [
      "255, 255, 255", // brilliant white
      "125, 211, 252", // ice cyan
      "147, 197, 253", // bright blue
      "199, 210, 254", // pale violet
    ];

    const NUM_STARS = 70;
    const stars = Array.from({ length: NUM_STARS }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.02 + Math.random() * 0.95,
      speed: 0.005 + Math.random() * 0.009,
      length: 0.8 + Math.random() * 0.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      width: 1.2 + Math.random() * 1.8,
    }));

    const TOTAL_DURATION = 380; // ms (fast, snappy deceleration before reaching details)
    let startTime = null;
    let animId = null;
    let aborted = false;

    // Keep canvas fully transparent so the website's dynamic background stays visible
    ctx.clearRect(0, 0, w, h);

    const draw = (timestamp) => {
      if (aborted) return;
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const totalProgress = Math.min(elapsed / TOTAL_DURATION, 1);

      // Clear transparently on every frame to preserve the underlying background
      ctx.clearRect(0, 0, w, h);

      // ── Hyper-speed deceleration curve ──
      // Starts fast and rapidly brakes down to a gentle drift
      const decel = Math.pow(1 - totalProgress, 3);
      const speedMultiplier = 0.5 + decel * 45;

      // Group stars by color for batched draw calls (huge performance boost)
      const groups = {};
      for (const col of COLORS) groups[col] = [];

      for (let i = 0; i < NUM_STARS; i++) {
        const star = stars[i];
        star.dist += star.speed * speedMultiplier;

        if (star.dist > 1.05) {
          star.dist = 0.02;
          star.angle = Math.random() * Math.PI * 2;
        }

        // Streak tail visibly shrinks from long beams into pinpoint stars as it decelerates
        const tailLen = (0.006 + decel * 0.35) * star.length;
        const tailDist = Math.max(0.005, star.dist - tailLen);

        const cos = Math.cos(star.angle);
        const sin = Math.sin(star.angle);

        const x1 = cx + cos * tailDist * maxR;
        const y1 = cy + sin * tailDist * maxR;
        const x2 = cx + cos * star.dist * maxR;
        const y2 = cy + sin * star.dist * maxR;

        groups[star.color].push({
          x1,
          y1,
          x2,
          y2,
          width: star.width * (0.8 + decel * 0.9),
          alpha: Math.min(1, 0.2 + decel * 0.8),
        });
      }

      // Draw batched streaks
      for (const col of COLORS) {
        const batch = groups[col];
        if (batch.length === 0) continue;
        ctx.lineCap = "round";
        for (let j = 0; j < batch.length; j++) {
          const b = batch[j];
          ctx.beginPath();
          ctx.moveTo(b.x1, b.y1);
          ctx.lineTo(b.x2, b.y2);
          ctx.strokeStyle = `rgba(${col}, ${b.alpha})`;
          ctx.lineWidth = b.width;
          ctx.stroke();
        }
      }

      // Central singularity core (hyperspace glow shrinking and fading as speed drops)
      if (decel > 0.02) {
        const coreRadius = 16 + decel * 140;
        const coreAlpha = decel * 0.5;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
        grad.addColorStop(0, `rgba(224, 242, 254, ${coreAlpha})`);
        grad.addColorStop(0.35, `rgba(96, 165, 250, ${coreAlpha * 0.5})`);
        grad.addColorStop(1, "rgba(96, 165, 250, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shockwave ring pulsing outward as the ship brakes out of warp
      if (totalProgress < 0.35) {
        const ringT = totalProgress / 0.35;
        const ringR = ringT * maxR * 0.85;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(186, 230, 253, ${(1 - ringT) * 0.35})`;
        ctx.lineWidth = 2 * (1 - ringT);
        ctx.stroke();
      }

      // ── Content Reveal & Fade: reaches the details as warp slows down ──
      if (totalProgress < 0.35) {
        // Warp is rapidly decelerating in full view before reaching the details
        content.style.opacity = "0";
        content.style.transform = "scale(0.97)";
        canvas.style.opacity = "1";
      } else {
        // As warping slows down to near-halt, details of the lecture emerge smoothly
        const revealProgress = Math.min(1, (totalProgress - 0.35) / 0.65);
        const easedReveal = 1 - Math.pow(1 - revealProgress, 2.5);
        content.style.opacity = String(easedReveal);
        content.style.transform = `scale(${0.97 + easedReveal * 0.03})`;

        // Canvas fades out gently towards the end of the deceleration
        if (totalProgress > 0.6) {
          canvas.style.opacity = String(Math.max(0, 1 - (totalProgress - 0.6) / 0.4));
        } else {
          canvas.style.opacity = "1";
        }
      }

      if (totalProgress < 1) {
        animId = requestAnimationFrame(draw);
      } else {
        // Warp deceleration complete: reveal details fully and trigger scramble decode
        content.style.opacity = "1";
        content.style.transform = "scale(1)";
        content.style.filter = "none";
        canvas.style.display = "none";
        setWarpDone(true);
      }
    };

    animId = requestAnimationFrame(draw);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
      maxR = Math.hypot(w, h) / 2;
      ctx.clearRect(0, 0, w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      aborted = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (content) {
        content.style.opacity = "1";
        content.style.transform = "scale(1)";
        content.style.filter = "none";
      }
    };
  }, [shouldWarp]);

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

  const formatDate = (timeString) => {
    if (!timeString) return "TBA";
    const date = new Date(timeString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  // Prepare event data
  const eventData = {
    id: event.id,
    name: event.heading,
    date: formatDate(event.datetime),
    time: formatTime(event.datetime),
    venue: event.venue || "TBA",
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
      {/* Time-warp canvas overlay */}
      <canvas
        ref={warpCanvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          pointerEvents: "none",
          width: "100vw",
          height: "100vh",
          display: shouldWarp ? "block" : "none",
        }}
      />

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

      <div
        ref={contentRef}
        className="max-w-6xl mx-auto"
        style={
          shouldWarp && !warpDone
            ? {
              opacity: 0,
              transform: "scale(0.96)",
              willChange: "opacity, transform",
            }
            : undefined
        }
      >
        {/* Header Section */}
        <div className="mb-12">
          <Link href="/lectures" className="back-link">
            <span>←</span>
            <span>Back to Lectures</span>
          </Link>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl pp-fragment font-medium tracking-wide mt-4 text-white uppercase"
          >
            {eventData.name}
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
                <p className="info-value">{eventData.date}</p>
              </div>
              <div>
                <p className="info-label">Time</p>
                <p className="info-value">{eventData.time}</p>
              </div>
              <div>
                <p className="info-label">Venue</p>
                <p className="info-value">{eventData.venue}</p>
              </div>
              <div>
                <p className="info-label">Price</p>
                <p className="info-value">{eventData.price}</p>
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
                      {eventData.speaker}
                    </p>
                    {eventData.speakerTitle && (
                      <p
                        className="text-xs text-gray-400"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {eventData.speakerTitle}
                      </p>
                    )}
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
              >
                {eventData.description}
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
              }}
            >
              ABOUT THIS EVENT
            </h2>
            <div className="prose prose-invert max-w-none">
              <p
                className="text-base leading-relaxed text-gray-300 whitespace-pre-line break-words"
                style={{ fontFamily: "PP Fragment, sans-serif" }}
              >
                {eventData.catchyPara}
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
