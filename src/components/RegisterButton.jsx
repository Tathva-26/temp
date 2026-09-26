"use client";
import { useState } from "react";
import { regHandler } from "@/functions/regHandler";

export default function RegisterButton({
  id,
  quantity = 1,
  referralCode,
  passcode,
  disabled = false,
  closed = false,
}) {
  const [isLoading, setIsLoading] = useState(false);

  /*
   * Stays in the loading state on success: `regHandler` navigates to TIQR, and
   * re-enabling the button in the meantime invites a second booking. It only
   * resets when the booking was refused and the page is still ours. (This used
   * to be a fixed 2.5s timeout, which reset the button mid-redirect.)
   */
  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const redirecting = await regHandler(id, quantity, referralCode, passcode);
    if (!redirecting) setIsLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || disabled || closed}
      className="p-4 w-[180px] bg-gray-900 text-white rounded-xl text-sm sm:text-base uppercase tracking-wider font-medium border border-gray-900 hover:bg-white hover:text-gray-900 transition duration-200 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
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
      ) : closed ? (
        <>Booking full</>
      ) : (
        <>Proceed</>
      )}
    </button>
  );
}
