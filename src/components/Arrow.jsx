import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import gsap from "gsap";

export const Arrow = forwardRef(({ direction }, ref) => {
  const pathRef = useRef(null);

  useImperativeHandle(ref, () => ({
    animate: () => {
      if (pathRef.current) {
        const tl = gsap.timeline();

        // Fill animation
        tl.to(pathRef.current, {
          fill: "black",
          duration: 0.3,
          ease: "power2.out",
        })
          // Unfill animation
          .to(pathRef.current, {
            fill: "transparent",
            duration: 0.3,
            ease: "power2.in",
          });
      }
    },
  }));

  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 154 162"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={direction === "right" ? "rotate-180" : ""}
    >
      <path
        ref={pathRef}
        d="M147.5 1.5H85L3 81.5L81.5 160.5H149.5L66.5 81.5L147.5 1.5Z"
        fill="transparent"
        stroke="black"
        strokeWidth="3"
      />
    </svg>
  );
});
