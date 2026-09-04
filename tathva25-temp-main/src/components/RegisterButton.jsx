"use client";
import { useState } from "react";
import { regHandler } from "@/functions/regHandler";

export default function RegisterButton({ id, ticketId }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);

setTimeout(() => {
  setIsLoading(false);
}, 2500);

    regHandler(id, ticketId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="p-4 w-[180px] bg-gray-900 text-white rounded-xl text-sm sm:text-base uppercase tracking-wider font-medium border border-gray-900 hover:bg-white hover:text-gray-900 transition duration-200 shadow-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <>Proceed</>
      )}
    </button>
  );
}
