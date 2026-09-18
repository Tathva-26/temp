// "use client";
// import BackendStatus from "@/components/BackendStatus";
// import Link from "next/link";
// import { ArrowLeft } from "lucide-react";

// export default function PassesComingSoon() {
//   return (
//     <BackendStatus
//       title="PASSES COMING SOON"
//       message="Pass details and pricing will be available soon."
//     >
//       <Link 
//         href="/" 
//         className="group flex items-center justify-center gap-3 px-8 py-4 border border-white/20 rounded-sm bg-transparent text-white/80 hover:bg-white hover:text-black transition-all duration-300 tracking-widest text-sm uppercase poppins"
//       >
//         <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform duration-300" />
//         Return to Home
//       </Link>
//     </BackendStatus>
//   );
// }
"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import Ticket from "@/components/Ticket";
import TicketMobile from "@/components/TicketMobile";
import { Michroma } from "next/font/google";
import localFont from "next/font/local";
import { Arrow } from "@/components/Arrow";

const mi = Michroma({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const fontspring = localFont({
  src: "../../../public/fonts/fontspring.otf",
});

const neoform = localFont({
  src: "../../../public/fonts/neoform.otf",
});

function Page() {
  const [isMobile, setIsMobile] = useState(false);
  // ---
  // FIX: Set initial card to 0
  // ---
  const [centerCard, setCenterCard] = useState(0);
  const cards = [0, 1, 2, 3];
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---
  // FIX: Re-ordered ticketData to put "ALL DAY" first (index 0)
  // ---
  const ticketData = [
    {
      day: "ALL",
      date: "ALL",
      price: 1999,
      eventId: 1624,
      ticketId: 2320,
    },
    {
      day: 1,
      date: 9,
      price: 399,
      eventId: 1617,
      ticketId: 2315,
    },
    {
      day: 2,
      date: 10,
      price: 799,
      eventId: 1620,
      ticketId: 2316,
    },
    {
      day: 3,
      date: 11,
      price: 1399,
      eventId: 1621,
      ticketId: 2317,
    },
  ];

  const getPositions = (isMobile) => [
    {
      // 0: left
      x: `${isMobile ? "-170%" : "-35%"}`,
      y: isMobile ? "-12vh" : "0",
      scale: 0.8,
      opacity: 0.6,
      zIndex: 5,
    },
    {
      // 1: center
      x: "0%",
      y: isMobile ? "-12vh" : "0",
      scale: 1,
      opacity: 1,
      zIndex: 10,
    },
    {
      // 2: right
      x: `${isMobile ? "170%" : "35%"}`,
      y: isMobile ? "-12vh" : "0",
      scale: 0.8,
      opacity: 0.6,
      zIndex: 5,
    },
    {
      // 3: hidden/behind
      x: "0%",
      y: isMobile ? "-12vh" : "0",
      scale: 0.5,
      opacity: 0,
      zIndex: 2,
    },
  ];

  // initial gsap setup
  useEffect(() => {
    gsap.set([".card-0", ".card-1", ".card-2", ".card-3"], {
      clearProps: "all",
    });

    const positions = getPositions(isMobile);

    // ---
    // FIX: Set initial state with card-0 in the center (positions[1]).
    // Initial order [3, 0, 1, 2]
    // card-3 -> positions[0] (left)
    // card-0 -> positions[1] (center)
    // card-1 -> positions[2] (right)
    // card-2 -> positions[3] (hidden)
    // ---
    gsap.set(".card-3", positions[0]);
    gsap.set(".card-0", positions[1]);
    gsap.set(".card-1", positions[2]);
    gsap.set(".card-2", positions[3]);

    setCenterCard(0); // Set state to match
  }, [isMobile]);

  const leftArrowRefs = useRef([]);
  const rightArrowRefs = useRef([]);

  const triggerArrowWave = (direction) => {
    const refs =
      direction === "left" ? leftArrowRefs.current : rightArrowRefs.current;

    const orderedRefs = direction === "left" ? [...refs].reverse() : refs;

    orderedRefs.forEach((ref, index) => {
      if (ref && typeof ref.animate === "function") {
        setTimeout(() => {
          ref.animate();
        }, index * 150);
      }
    });
  };

  const moveToCenter = (clicked) => {
    if (clicked === centerCard) return;

    let direction;
    const numCards = cards.length;
    const rightDist = (clicked - centerCard + numCards) % numCards;
    const leftDist = (centerCard - clicked + numCards) % numCards;

    if (rightDist <= leftDist && rightDist !== 0) {
      direction = "right";
    } else {
      direction = "left";
    }

    triggerArrowWave(direction);

    const positions = getPositions(isMobile);

    let order = [...cards];
    // Set clicked card to be at index 1 (center)
    while (order[1] !== clicked) {
      order.push(order.shift());
    }

    order.forEach((cardIndex, i) => {
      gsap.to(`.card-${cardIndex}`, {
        x: positions[i].x,
        y: positions[i].y,
        scale: positions[i].scale,
        opacity: positions[i].opacity,
        zIndex: positions[i].zIndex,
        duration: 0.6,
        ease: "power2.inOut",
      });
    });

    setCenterCard(clicked);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    if (Math.abs(deltaX) < 30) return;

    if (deltaX > 0) {
      // Swiped right
      const prev = (centerCard + cards.length - 1) % cards.length;
      moveToCenter(prev);
    } else {
      // Swiped left
      const next = (centerCard + 1) % cards.length;
      moveToCenter(next);
    }
  };

  return (
    <section className="relative w-full pt-28 h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
      {/* Heading */}
      <div className="relative -top-[20vh] md:top-0 w-full">
        <h1
          className={`${neoform.className} text-4xl md:text-8xl text-center px-3 z-20 relative lg:bottom-10 text-gray-400`}
        >
          TATHVA PASS
        </h1>

        <h1
          className={`${mi.className} z-20 relative text-center text-xs md:text-base mt-3 md:mt-5 px-4 lg:bottom-10 ${isMobile ? "mb-52" : "mb-32"} text-gray-400`}
        >
          One pass. Every moment of Tathva.
        </h1>
      </div>
      {ticketData.map((ticket, i) => (
        <div
          key={i}
          className={`card card-${i} absolute cursor-pointer`}
          onClick={() => moveToCenter(i)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isMobile ? (
            <TicketMobile
              day={ticket.day}
              date={ticket.date}
              price={ticket.price}
              eventId={ticket.eventId}
              ticketId={ticket.ticketId}
            />
          ) : (
            <Ticket
              day={ticket.day}
              date={ticket.date}
              price={ticket.price}
              eventId={ticket.eventId}
              ticketId={ticket.ticketId}
            />
          )}
        </div>
      ))}

      <div className="relative z-0 top-16 ">
        <div
          className={`${mi.className} flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-4 text-xs sm:text-sm tracking-wider text-white`}
        >
          {/* ---
            FIX: Re-mapped content to match new card order
            --- */}

          {/* Was card 3, now card 0 (ALL DAY) */}
          {centerCard === 0 && (
            <>
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>INFORMALS</span>
              </span> */}
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>ARIVU</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>MITHOON</span>
              </span> */}
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>WHEELS</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>MUSIC CLUB</span>
              </span> */}
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>SA & MHR</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>SAVAARI THE BAND</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>DJ VIOLA</span>
              </span> */}
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>ROBOWARS</span>
              </span> */}
            </>
          )}

          {/* Was card 0, now card 1 (Day 1) */}
          {centerCard === 1 && (
            <>
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>WHEELS</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>ROBOWARS</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>TECH CONCLAVE</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>INFORMALS</span>
              </span> */}
            </>
          )}

          {/* Was card 1, now card 2 (Day 2) */}
          {centerCard === 2 && (
            <>
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>MUSIC CLUB</span>
              </span> */}
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>SA & MHR</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>SAVAARI THE BAND</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>DJ VIOLA</span>
              </span> */}
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>ROBOWARS</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>INFORMALS</span>
              </span> */}
            </>
          )}

          {/* Was card 2, now card 3 (Day 3) */}
          {centerCard === 3 && (
            <>
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>INFORMALS</span>
              </span> */}
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>ARIVU</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>MITHOON</span>
              </span> */}
              {/* <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>DJ PERFORMANCE</span>
              </span>

              <span className="flex items-center gap-2">
                <span className="text-white/60">•</span>
                <span>OTHER EVENTS</span>
              </span> */}
            </>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="w-screen mb-20 h-[80px] sm:h-[110px] md:h-[130px] lg:h-[160px] top-20 relative flex items-center justify-between px-4 sm:px-8 md:px-12 lg:px-16">
        {/* LEFT */}
        <div className="flex items-center ">
          <div
            onClick={() => {
              const prev = (centerCard + cards.length - 1) % cards.length;
              moveToCenter(prev);
            }}
            className="flex gap-0 cursor-pointer size-30 sm:size-40 md:size-50 lg:size-60 xl:size-80 2xl:size-90 items-center origin-left"
          >
            <Arrow
              direction="left"
              ref={(el) => (leftArrowRefs.current[0] = el)}
            />
            <Arrow
              direction="left"
              ref={(el) => (leftArrowRefs.current[1] = el)}
            />
            <Arrow
              direction="left"
              ref={(el) => (leftArrowRefs.current[2] = el)}
            />
          </div>

          {!isMobile && (
            <span
              className={`${mi.className} cursor-pointer hover:scale-110 transition text-base md:text-lg lg:text-xl whitespace-nowrap text-white`}
              onClick={() => {
                const prev = (centerCard + cards.length - 1) % cards.length;
                moveToCenter(prev);
              }}
            >
              PREV
            </span>
          )}
        </div>

        {/* CENTERBER */}
        <span
          className={`${neoform.className} text-base sm:text-3xl md:text-4xl lg:text-5xl absolute left-1/2 -translate-x-1/2 text-white`}
        >
          {/* This logic works fine as `day` is "ALL" for card 0 */}
          {ticketData[centerCard].day === "ALL"
            ? "ALL"
            : String(ticketData[centerCard].day).padStart(2, "0")}
        </span>

        {/* RIGHT */}
        <div className="flex items-center">
          {!isMobile && (
            <span
              className={`${mi.className} cursor-pointer hover:scale-110 transition text-base md:text-lg lg:text-xl whitespace-nowrap text-white`}
              onClick={() => {
                const next = (centerCard + 1) % cards.length;
                moveToCenter(next);
              }}
            >
              NEXT
            </span>
          )}

          <div
            onClick={() => {
              const next = (centerCard + 1) % cards.length;
              moveToCenter(next);
            }}
            className="flex gap-0 cursor-pointer size-30 sm:size-40 md:size-50 lg:size-60 xl:size-80 2xl:size-90 items-center justify-end"
          >
            <Arrow
              direction="right"
              ref={(el) => (rightArrowRefs.current[0] = el)}
            />
            <Arrow
              direction="right"
              ref={(el) => (rightArrowRefs.current[1] = el)}
            />
            <Arrow
              direction="right"
              ref={(el) => (rightArrowRefs.current[2] = el)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Page;

