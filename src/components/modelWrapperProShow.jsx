"use client";

import { useState } from "react";
import Modal from "./modelProshow";
import { Michroma } from "next/font/google";
import { useUserContext } from "@/context/UserContext";

const mi = Michroma({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export default function ModalWrapper({ eventId, price, isBookable = true, isClosed = false }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoggedIn, authLoading, loginWithGoogle } = useUserContext();

  // Same as the workshop button: signed out, this starts Google OAuth.
  const handleClick = () => {
    if (!isLoggedIn) {
      loginWithGoogle();
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleClick}
        disabled={authLoading || isClosed}
        className={`${mi.className} disabled:opacity-60 disabled:cursor-not-allowed bg-white/20 cursor-pointer rounded-xs text-[0.5rem] sm:text-[0.4rem] md:text-[0.5rem] lg:text-[0.65rem] hover:bg-white/30 px-2 sm:px-3 h-4 sm:h-5 text-white/90 whitespace-nowrap`}
      >
        {isClosed ? "BOOKING FULL" : isLoggedIn ? "BOOK" : "REGISTER"}
      </button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={eventId}
        price={price}
        isBookable={isBookable}
        isClosed={isClosed}
      />
    </div>
  );
}
