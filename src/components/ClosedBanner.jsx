// /**
//  * Diagonal "Booking full" ribbon laid over an event's picture.
//  *
//  * An event shows this when an admin has not published it (`event.isClosed`).
//  * The parent must be `relative` and clip its overflow; this fills it and lets
//  * clicks through so the card underneath still links to the detail page.
//  */
// export default function ClosedBanner() {
//   return (
//     <div
//       aria-label="Booking full"
//       className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
//     >
//       <span className="-rotate-12 whitespace-nowrap border-y-2 border-red-500/80 bg-black/80 px-10 py-2 text-center text-lg font-bold uppercase tracking-[0.3em] text-red-400 shadow-lg sm:text-xl">
//         Booking full
//       </span>
//     </div>
//   );
// }

export default function ClosedBanner() {
  return (
    <div
      aria-label="Booking full"
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
    >
      <div className="absolute h-20 w-[150%] -rotate-12 bg-black/30 backdrop-blur-sm" />

      <div
        className="
          relative
          -rotate-12
          overflow-hidden
          border-y border-red-400/40
          bg-black/75
          px-16 py-3
          shadow-[0_0_35px_rgba(239,68,68,0.18)]
          backdrop-blur-md
        "
      >
        <div className="absolute inset-y-0 left-0 w-1 bg-red-500" />
        <div className="absolute inset-y-0 right-0 w-1 bg-red-500" />

        <span
          className="
            relative
            text-sm font-bold uppercase
            tracking-[0.4em]
            text-red-400
            sm:text-base
          "
        >
          Booking Full
        </span>
      </div>
    </div>
  );
}