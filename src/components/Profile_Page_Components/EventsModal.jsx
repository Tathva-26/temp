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
} from "react-icons/md";
import { FaUser, FaBed } from "react-icons/fa";

export default function EventsModal({
  isOpen,
  onClose,
  activeView,
  setActiveView,
  confirmedBookings = [],
  allBookings = [],
  accommodationBookings = [],
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

  const getStatusBadge = (status, context = "default") => {
    const baseClasses = "text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider";
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
        return (
          <span className={`${baseClasses} bg-emerald-500/20 text-emerald-400 border border-emerald-500/30`}>
            CONFIRMED
          </span>
        );
      case "PENDING":
        return (
          <span className={`${baseClasses} bg-amber-500/20 text-amber-400 border border-amber-500/30`}>
            {context === "booking" ? "FAILED" : "PENDING"}
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-white/10 text-white/60 border border-white/20`}>
            {status}
          </span>
        );
    }
  };

  const renderBookingList = (bookingsToRender) => {
    if (bookingsToRender && bookingsToRender.length > 0) {
      return (
        <div className="space-y-4">
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
                key={booking.bookingUid || index}
                className="group bg-white/[0.04] backdrop-blur-sm rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 h-36 sm:h-auto flex-shrink-0 overflow-hidden">
                    <Image
                      src={booking.event?.picture || "/placeholder.jpg"}
                      alt={booking.event?.heading || "Event"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  </div>
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                        {booking.event?.heading} {booking.event?.type}
                      </h3>
                      {getStatusBadge(booking?.status, "booking")}
                    </div>
                    <p className="text-white/50 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                      {booking.event?.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center bg-white/[0.05] rounded-lg p-2.5 border border-white/[0.06]">
                        <MdDateRange className="text-white/70 mr-2" size={16} />
                        <div>
                          <p className="text-[10px] text-white/40 font-semibold uppercase">Date</p>
                          <p className="text-xs font-semibold text-white/90">{displayDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-white/[0.05] rounded-lg p-2.5 border border-white/[0.06]">
                        <MdAccessTime className="text-white/70 mr-2" size={16} />
                        <div>
                          <p className="text-[10px] text-white/40 font-semibold uppercase">Time</p>
                          <p className="text-xs font-semibold text-white/90">{displayTime}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadTicket(booking.picture)}
                      disabled={booking.status !== "CONFIRMED"}
                      className="w-full bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <MdDownload size={16} />
                      {booking.status === "CONFIRMED" ? "Download Ticket" : "Failed"}
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
      <div className="text-center py-12 sm:py-16">
        <div className="bg-white/[0.05] rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 border border-white/[0.08]">
          <MdDateRange className="text-white/30" size={32} />
        </div>
        <p className="text-white/80 text-base font-bold mb-1">
          {activeView === "bookings" ? "No confirmed events yet" : "No booking history"}
        </p>
        <p className="text-white/40 text-xs sm:text-sm">
          Start exploring and register for exciting events!
        </p>
      </div>
    );
  };

  const renderAccommodationList = (bookingsToRender) => {
    if (bookingsToRender && bookingsToRender.length > 0) {
      return (
        <div className="space-y-4">
          {bookingsToRender.map((booking, index) => {
            const formatDate = (dateString) => {
              return new Date(dateString).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
            };

            const foodChoices = [];
            if (booking.foodDay24Veg > 0) foodChoices.push(`24th (Veg: ${booking.foodDay24Veg})`);
            if (booking.foodDay24NonVeg > 0) foodChoices.push(`24th (Non-Veg: ${booking.foodDay24NonVeg})`);
            if (booking.foodDay25Veg > 0) foodChoices.push(`25th (Veg: ${booking.foodDay25Veg})`);
            if (booking.foodDay25NonVeg > 0) foodChoices.push(`25th (Non-Veg: ${booking.foodDay25NonVeg})`);
            if (booking.foodDay26Veg > 0) foodChoices.push(`26th (Veg: ${booking.foodDay26Veg})`);
            if (booking.foodDay26NonVeg > 0) foodChoices.push(`26th (Non-Veg: ${booking.foodDay26NonVeg})`);
            const foodSummary = foodChoices.length > 0 ? foodChoices.join(", ") : "No food selected";

            return (
              <div
                key={booking.bookingUid || index}
                className="group bg-white/[0.04] backdrop-blur-sm rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 p-4 sm:p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Accommodation at {booking.room === "DORMG" ? "Dormitory (Girls)" : (booking.room === "DORMB" ? "Dormitory (Boys)" : (booking.room === "ROOM3" ? "3 Shared Room (Girls)" : "4 Shared Room (Boys)"))}
                  </h3>
                  {getStatusBadge(booking.status, "booking")}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  <div className="flex items-center bg-white/[0.05] rounded-lg p-2.5 border border-white/[0.06]">
                    <MdDateRange className="text-white/70 mr-2.5" size={16} />
                    <div>
                      <p className="text-[10px] text-white/40 font-semibold uppercase">Check-in</p>
                      <p className="text-xs font-semibold text-white/90">{formatDate(booking.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-white/[0.05] rounded-lg p-2.5 border border-white/[0.06]">
                    <MdDateRange className="text-white/70 mr-2.5" size={16} />
                    <div>
                      <p className="text-[10px] text-white/40 font-semibold uppercase">Check-out</p>
                      <p className="text-xs font-semibold text-white/90">{formatDate(booking.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-white/[0.05] rounded-lg p-2.5 border border-white/[0.06]">
                    <FaUser className="text-white/70 mr-2.5" size={14} />
                    <div>
                      <p className="text-[10px] text-white/40 font-semibold uppercase">Gender</p>
                      <p className="text-xs font-semibold text-white/90 capitalize">{booking.gender?.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-white/[0.05] rounded-lg p-2.5 border border-white/[0.06]">
                    <MdEvent className="text-white/70 mr-2.5" size={16} />
                    <div>
                      <p className="text-[10px] text-white/40 font-semibold uppercase">Food Choices</p>
                      <p className="text-xs font-semibold text-white/90">{foodSummary}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadTicket(booking.picture)}
                  disabled={booking.status !== "CONFIRMED"}
                  className="w-full bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <MdDownload size={16} />
                  {booking.status === "CONFIRMED" ? "Download Food & Accommodation Ticket" : "Failed"}
                </button>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="text-center py-12 sm:py-16">
        <div className="bg-white/[0.05] rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 border border-white/[0.08]">
          <FaBed className="text-white/30" size={32} />
        </div>
        <p className="text-white/80 text-base font-bold mb-1">
          No accommodation booked
        </p>
        <p className="text-white/40 text-xs sm:text-sm">
          You can book your stay through the accommodation page.
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
      case "accommodation":
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
      case "accommodation":
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
      case "accommodation":
        return accommodationBookings.length;
      default:
        return 0;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6">
      <div className="bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0 bg-white/[0.02]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {getTitle()}
            </h2>
            <p className="text-white/40 text-xs mt-1 font-mono tracking-wider">
              {getCount()} {activeView === "accommodation" ? "booking" : "event"}
              {getCount() !== 1 ? "s" : ""} Total
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-all border border-white/10"
            aria-label="Close modal"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/[0.06] px-4 sm:px-6 bg-white/[0.01] overflow-x-auto flex-shrink-0 scrollbar-hide">
          <button
            onClick={() => setActiveView("bookings")}
            className={`py-3 px-4 text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 relative ${
              activeView === "bookings"
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <MdEvent size={16} />
            Bookings
            {activeView === "bookings" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveView("history")}
            className={`py-3 px-4 text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 relative ${
              activeView === "history"
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <MdHistory size={16} />
            History
            {activeView === "history" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveView("accommodation")}
            className={`py-3 px-4 text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 relative ${
              activeView === "accommodation"
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <FaBed size={16} />
            Accommodation
            {activeView === "accommodation" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-transparent">
          {renderActiveContent()}
        </div>
      </div>
    </div>
  );
}