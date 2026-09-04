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
        className={`${mi.className} bg-[#3E3E3B] cursor-pointer rounded-xs text-[0.5rem] sm:text-[0.4rem] md:text-[0.5rem] lg:text-[0.65rem] hover:bg-black w-12 h-3 sm:w-16 sm:h-4 md:w-18 md:h-4 lg:w-23 lg:h-5 text-white`}
      >
        {isLoggedIn ? "BOOK" : "LOGIN TO REGISTER"}
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
