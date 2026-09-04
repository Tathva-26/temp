"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  MdClose,
  MdDateRange,
  MdAccessTime,
  MdDownload,
  MdHistory,
  MdEvent,
  MdCheckCircle,
  MdPending,
} from "react-icons/md";
import { FaUser, FaUsers, FaBed } from "react-icons/fa";

export default function EventsModal({
  isOpen,
  onClose,
  activeView,
  setActiveView,
  confirmedBookings,
  allBookings,
  referrals,
  pendingReferrals,
  confirmedReferralsList,
  confirmReferrals,
  accommodationBookings,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadTicket = (ticketUrl) => {
    if (ticketUrl) {
      window.open(ticketUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Ticket URL not available.");
    }
  };

  // --- MODIFICATION: Updated getStatusBadge to handle context ---
  const getStatusBadge = (status, context = "default") => {
    const baseClasses = "text-xs font-bold uppercase px-2 py-1 rounded-full";
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
        return (
          <span className={`${baseClasses} bg-green-200 text-green-800`}>
            CONFIRMED
          </span>
        );
      case "PENDING":
        if (context === "booking") {
          // PENDING bookings are shown as FAILED
          return (
            <span className={`${baseClasses} bg-gray-200 text-gray-800`}>
              FAILED
            </span>
          );
        }
        // PENDING referrals are shown as PENDING
        return (
          <span className={`${baseClasses} bg-yellow-200 text-yellow-800`}>
            PENDING
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-200 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  const renderBookingList = (bookingsToRender) => {
    if (bookingsToRender && bookingsToRender.length > 0) {
      return (
        <div className="space-y-4 sm:space-y-5">
          {bookingsToRender.map((booking, index) => {
            const eventDateTime = new Date(booking.event?.datetime);
            const displayDate = eventDateTime.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const displayTime = eventDateTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            return (
              <div
                key={booking.bookingUid}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
                style={{
                  animation: `slideUp 0.3s ease-out ${
                    index * 100
                  }ms backwards`,
                }}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0 group overflow-hidden">
                    <Image
                      src={booking.event?.picture || "/placeholder.jpg"}
                      alt={booking.event?.heading}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-tight">
                        {booking.event?.heading}
                      </h3>
                      {/* --- MODIFICATION: Pass context to getStatusBadge --- */}
                      {getStatusBadge(booking?.status, "booking")}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {booking.event?.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MdDateRange className="text-gray-500" size={16} />
                        <span className="font-semibold text-gray-800">
                          {displayDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdAccessTime className="text-gray-500" size={16} />
                        <span className="font-semibold text-gray-800">
                          {displayTime}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadTicket(booking.picture)}
                      disabled={booking.status !== "CONFIRMED"}
                      className="w-full bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <MdDownload size={18} />
                      {booking.status === "CONFIRMED"
                        ? "Download Ticket"
                        : "Failed"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="text-center py-16 sm:py-20">
        <div className="bg-gray-100 rounded-full w-20 h-20 sm:w-28 sm:h-28 mx-auto flex items-center justify-center mb-5 border-2 border-gray-200">
          <MdDateRange className="text-gray-700" size={40} />
        </div>
        <p className="text-gray-900 text-lg sm:text-xl font-bold mb-2">
          {activeView === "bookings"
            ? "No confirmed events yet"
            : "No booking history"}
        </p>
        <p className="text-gray-500 text-sm sm:text-base">
          Your bookings will appear here!
        </p>
      </div>
    );
  };

  // Add renderReferralsList function
  const renderReferralsList = (referralsToRender, type) => {
    if (referralsToRender.length > 0) {
      return (
        <div className="space-y-5">
          {referralsToRender.map((referral, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 hover:border-gray-300"
              style={{
                animation: `slideUp 0.3s ease-out ${index * 100}ms backwards`,
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <FaUser className="text-gray-700" />
                    {referral.referredUser.name}
                    {/* --- MODIFICATION: Pass context to getStatusBadge --- */}
                    {getStatusBadge(referral.status, "referral")}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-200 transition-all duration-200">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                        Email
                      </p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {referral.referredUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-200 transition-all duration-200">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                        Tathva ID
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {referral.referredUser.referral}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-20">
        <div className="bg-gray-100 rounded-full w-28 h-28 mx-auto flex items-center justify-center mb-5 border-2 border-gray-200">
          <FaUsers className="text-gray-700" size={40} />
        </div>
        <p className="text-gray-900 text-xl font-bold mb-2">
          {type === "confirmed"
            ? "No confirmed referrals yet"
            : "No pending referrals"}
        </p>
        <p className="text-gray-500 text-base">
          Share your referral code with friends to earn rewards!
        </p>
      </div>
    );
  };

  const renderActiveContent = () => {
    switch (activeView) {
      case "bookings":
        return renderBookingList(confirmedBookings);
      case "history":
        return renderBookingList(allBookings);
      case "pendingReferrals":
        return renderReferralsList(pendingReferrals, "pending");
      case "confirmedReferrals":
        return renderReferralsList(confirmedReferralsList, "confirmed");
      case "accommodation": // Add this case
        return renderAccommodationList(accommodationBookings);
      default:
        return renderBookingList(confirmedBookings);
    }
  };

  const getTitle = () => {
    switch (activeView) {
      case "bookings":
        return "My Bookings";
      case "history":
        return "Booking History";
      case "pendingReferrals":
        return "Pending Referrals";
      case "confirmedReferrals":
        return "Confirmed Referrals";
      case "accommodation": // Add this case
        return "My Accommodation";
      default:
        return "My Bookings";
    }
  };

  const getCount = () => {
    switch (activeView) {
      case "bookings":
        return confirmedBookings.length;
      case "history":
        return allBookings.length;
      case "pendingReferrals":
        return pendingReferrals.length;
      case "confirmedReferrals":
        return confirmedReferralsList.length;
      case "accommodation": // Add this case
        return accommodationBookings.length;
      default:
        return 0;
    }
  };

  const renderAccommodationList = (bookingsToRender) => {
    if (bookingsToRender && bookingsToRender.length > 0) {
      return (
          <div className="space-y-5">
            {bookingsToRender.map((booking, index) => {
              const formatDate = (dateString) => {
                return new Date(dateString).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
              };

              // --- ADD: Food summary logic ---
              const foodChoices = [];
              if (booking.foodDay24Veg > 0)
                foodChoices.push(`24th (Veg: ${booking.foodDay24Veg})`);
              if (booking.foodDay24NonVeg > 0)
                foodChoices.push(`24th (Non-Veg: ${booking.foodDay24NonVeg})`);
              if (booking.foodDay25Veg > 0)
                foodChoices.push(`25th (Veg: ${booking.foodDay25Veg})`);
              if (booking.foodDay25NonVeg > 0)
                foodChoices.push(`25th (Non-Veg: ${booking.foodDay25NonVeg})`);
              if (booking.foodDay26Veg > 0)
                foodChoices.push(`26th (Veg: ${booking.foodDay26Veg})`);
              if (booking.foodDay26NonVeg > 0)
                foodChoices.push(`26th (Non-Veg: ${booking.foodDay26NonVeg})`);
              const foodSummary =
                  foodChoices.length > 0
                      ? foodChoices.join(", ")
                      : "No food selected";
              // --- END ADD ---

              return (
                  <div
                      key={booking.bookingUid}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
                      style={{
                        animation: `slideUp 0.3s ease-out ${index * 100}ms backwards`,
                      }}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                          Accommodation
                        </h3>
                        {getStatusBadge(booking.status, "booking")}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                        {/* Check-in */}
                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                          <MdDateRange className="text-gray-500" size={18} />
                          <div>
                            <p className="text-xs text-gray-500">Check-in</p>
                            <p className="font-semibold text-gray-800">
                              {formatDate(booking.startDate)}
                            </p>
                          </div>
                        </div>
                        {/* Check-out */}
                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                          <MdDateRange className="text-gray-500" size={18} />
                          <div>
                            <p className="text-xs text-gray-500">Check-out</p>
                            <p className="font-semibold text-gray-800">
                              {formatDate(booking.endDate)}
                            </p>
                          </div>
                        </div>
                        {/* --- ADD: Food Details UI Block --- */}
                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg col-span-1 sm:col-span-2">
                          <MdEvent className="text-gray-500" size={18} />
                          <div>
                            <p className="text-xs text-gray-500">Food Choices</p>
                            <p className="font-semibold text-gray-800">
                              {foodSummary}
                            </p>
                          </div>
                        </div>
                        {/* --- END ADD --- */}
                      </div>

                      <button
                          onClick={() => handleDownloadTicket(booking.picture)}
                          disabled={booking.status !== "CONFIRMED"}
                          className="w-full bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400"
                      >
                        <MdDownload size={18} />
                        Download Ticket
                      </button>
                    </div>
                  </div>
              );
            })}
          </div>
      );
    };

    return (
        <div className="text-center py-20">
          <div className="bg-gray-100 rounded-full w-28 h-28 mx-auto flex items-center justify-center mb-5 border-2 border-gray-200">
            <FaBed className="text-gray-700" size={40} />
          </div>
          <p className="text-gray-900 text-xl font-bold mb-2">
            No accommodation booked
          </p>
          <p className="text-gray-500 text-base">
            Book your stay to see details here.
          </p>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="bg-gradient-to-br from-black via-zinc-900 to-black p-6 relative overflow-hidden flex-shrink-0">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {getTitle()}
              </h2>
              <p className="text-gray-300 text-sm mt-1 font-mono">
                {getCount()}{" "}
                {activeView === "pendingReferrals" ||
                activeView === "confirmedReferrals"
                  ? "referral"
                  : "event"}
                {getCount() !== 1 ? "s" : ""} Total
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all text-black"
            >
              <MdClose size={24} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6 pt-4 bg-gray-50 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveView("bookings")}
            className={`py-3 px-4 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeView === "bookings"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            <MdEvent size={18} />
            My Bookings
          </button>
          <button
            onClick={() => setActiveView("history")}
            className={`py-3 px-4 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeView === "history"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            <MdHistory size={18} />
            History
          </button>
          <button
            onClick={() => setActiveView("confirmedReferrals")}
            className={`py-3 px-4 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeView === "confirmedReferrals"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            <MdCheckCircle size={18} />
            Confirmed
          </button>
          <button
            onClick={() => setActiveView("pendingReferrals")}
            className={`py-3 px-4 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeView === "pendingReferrals"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            <MdPending size={18} />
            Pending
          </button>
          <button
              onClick={() => setActiveView("accommodation")}
              className={`py-3 px-4 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeView === "accommodation"
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-black"
              }`}
          >
            <FaBed size={18} />
            Accommodation
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 bg-gradient-to-br from-gray-50 to-white">
          {renderActiveContent()}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}