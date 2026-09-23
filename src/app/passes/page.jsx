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
import BackendStatus from "@/components/BackendStatus";
import { fetchEvents } from "@/lib/events";

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== "false";

/*
 * Passes are ordinary events in our backend, so they carry our `Event.id` —
 * which is what POST /api/booking/create takes. This page used to hold TIQR's
 * ids (1624, 1617, 1620, 1621) hard-coded from Tathva '25, and every booking
 * made from here 404'd as "Event not found".
 *
 * `type` is free text on the backend, so the value an admin puts on a pass
 * event is configurable rather than guessed here.
 */
const PASS_EVENT_TYPE = process.env.NEXT_PUBLIC_PASS_EVENT_TYPE || "pass";

/*
 * The four carousel slots. Only the `day` label is presentation; `date`,
 * `price`, the event id and bookability all come from the API.
 *
 * `match` finds a slot's event by heading. Any slot left unmatched is filled
 * from whatever events remain, earliest first — so the page still works if the
 * headings do not follow the "Day N" convention.
 */
const PASS_SLOTS = [
  { day: "ALL", fallbackDate: "ALL", match: /all/i },
  { day: 1, fallbackDate: 9, match: /day\s*1/i },
  { day: 2, fallbackDate: 10, match: /day\s*2/i },
  { day: 3, fallbackDate: 11, match: /day\s*3/i },
];

/** Assigns fetched pass events to the slots above, in slot order. */
function toPassCards(events) {
  const remaining = [...events].sort(
    (a, b) => new Date(a.datetime) - new Date(b.datetime),
  );

  const taken = new Map();
  for (const slot of PASS_SLOTS) {
    const i = remaining.findIndex((e) => slot.match.test(e.heading ?? ""));
    if (i !== -1) taken.set(slot, remaining.splice(i, 1)[0]);
  }
  // Slots no heading matched fall back to date order.
  for (const slot of PASS_SLOTS) {
    if (!taken.has(slot) && remaining.length) taken.set(slot, remaining.shift());
  }

  return PASS_SLOTS.filter((slot) => taken.has(slot)).map((slot) => {
    const event = taken.get(slot);
    const parsed = new Date(event.datetime);
    return {
      day: slot.day,
      date: Number.isNaN(parsed.getTime())
        ? slot.fallbackDate
        : parsed.getDate(),
      price: event.price,
      eventId: event.id,
      // A pass whose TIQR sync failed has no ticket and would 409 on booking.
      isBookable: event.isBookable,
      isClosed: event.isClosed,
    };
  });
}

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
  const [passes, setPasses] = useState([]);
  const [loadingPasses, setLoadingPasses] = useState(true);
  const cards = passes.map((_, i) => i);
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

  useEffect(() => {
    if (!backendEnabled) {
      setLoadingPasses(false);
      return;
    }

    let cancelled = false;

    fetchEvents(PASS_EVENT_TYPE)
      .then((events) => {
        if (cancelled) return;
        if (events.length === 0) {
          console.warn(
            `No published events of type "${PASS_EVENT_TYPE}". Set ` +
              "NEXT_PUBLIC_PASS_EVENT_TYPE to the type an admin gives pass events.",
          );
        }
        setPasses(toPassCards(events));
      })
      .catch((err) => {
        // An empty carousel beats cards that cannot be booked.
        console.error("Failed to load passes:", err);
        if (!cancelled) setPasses([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPasses(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Slot geometry: left, center, right, hidden. Index 1 must always be the
   * center — `moveToCenter` rotates the clicked card into that slot — so a
   * short list drops the trailing slots, never the leading ones.
   */
  const getPositions = (isMobile, count = 4) => {
    const [left, center, right, hidden] = getAllPositions(isMobile);
    if (count <= 1) return [center];
    if (count === 2) return [left, center];
    if (count === 3) return [left, center, right];
    return [left, center, right, ...Array(count - 3).fill(hidden)];
  };

  const getAllPositions = (isMobile) => [
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
    if (cards.length === 0) return;

    gsap.set(
      cards.map((i) => `.card-${i}`),
      { clearProps: "all" },
    );

    const positions = getPositions(isMobile, cards.length);

    // ---
    // FIX: Set initial state with card-0 in the center (positions[1]).
    // Initial order [3, 0, 1, 2]
    // card-3 -> positions[0] (left)
    // card-0 -> positions[1] (center)
    // card-1 -> positions[2] (right)
    // card-2 -> positions[3] (hidden)
    // ---
    // Card 0 starts centered, the rest fan out around it.
    const order = [...cards];
    while (order[order.length > 1 ? 1 : 0] !== 0) order.push(order.shift());

    order.forEach((cardIndex, i) => {
      if (positions[i]) gsap.set(`.card-${cardIndex}`, positions[i]);
    });

    setCenterCard(0); // Set state to match
  }, [isMobile, cards.length]);

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
    if (clicked === centerCard || cards.length < 2) return;

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

    const positions = getPositions(isMobile, cards.length);

    let order = [...cards];
    // Set clicked card to be at index 1 (center)
    while (order[1] !== clicked) {
      order.push(order.shift());
    }

    order.forEach((cardIndex, i) => {
      if (!positions[i]) return;
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
    if (Math.abs(deltaX) < 30 || cards.length < 2) return;

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

  // Every hook above runs unconditionally; the guards start here.
  if (!backendEnabled) {
    return (
      <BackendStatus
        title="PASSES COMING SOON"
        message="Pass details and pricing will be available soon."
      />
    );
  }

  if (loadingPasses) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </div>
    );
  }

  if (passes.length === 0) {
    return (
      <BackendStatus
        title="PASSES COMING SOON"
        message="Passes are not on sale yet. Check back soon."
      />
    );
  }

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
      {passes.map((ticket, i) => (
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
              isBookable={ticket.isBookable}
              isClosed={ticket.isClosed}
            />
          ) : (
            <Ticket
              day={ticket.day}
              date={ticket.date}
              price={ticket.price}
              eventId={ticket.eventId}
              isBookable={ticket.isBookable}
              isClosed={ticket.isClosed}
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
          {/* `day` is "ALL" for the all-access pass, a number otherwise. */}
          {passes[centerCard]?.day === "ALL"
            ? "ALL"
            : String(passes[centerCard]?.day ?? "").padStart(2, "0")}
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

