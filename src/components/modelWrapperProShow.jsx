"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "./modelProshow";
import { Michroma } from "next/font/google";

const mi = Michroma({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export default function ModalWrapper({ eventId, ticketId, price }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    setIsLoggedIn(!!token);
  }, []);

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push("/");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleClick}
        className={`${mi.className} bg-white/20 cursor-pointer rounded-xs text-[0.5rem] sm:text-[0.4rem] md:text-[0.5rem] lg:text-[0.65rem] hover:bg-white/30 px-2 sm:px-3 h-4 sm:h-5 text-white/90 whitespace-nowrap`}
      >
        {isLoggedIn ? "BOOK" : "REGISTER"}
      </button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={eventId}
        ticketId={ticketId}
        price={price}
      />
    </div>
  );
}
