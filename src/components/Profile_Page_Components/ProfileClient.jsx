"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaEdit, FaShare, FaCheck, FaUser, FaUsers, FaBed } from "react-icons/fa";
import {
  MdEvent,
  MdDateRange,
  MdAccessTime,
  MdDownload,
  MdHistory,
  MdPending,
  MdCheckCircle,
} from "react-icons/md";
import EditModal from "./EditModal";
import EventsModal from "./EventsModal";
import { useRouter } from "next/navigation";
import axios from "axios";
import jwtRequired from "@/axios/jwtRequired";

export default function ProfileClient({ user }) {
  // ...existing code...
  const [modalOpen, setModalOpen] = useState(false);
  const [eventsModalOpen, setEventsModalOpen] = useState(false);
  const [editField, setEditField] = useState("name");
  const [currentUser, setCurrentUser] = useState(user);
  const [copied, setCopied] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [accommodationBookings, setAccommodationBookings] = useState([]);

  // --- MODIFICATION START ---
  // State for tab management in BOTH desktop and mobile modal
  const [activeTab, setActiveTab] = useState("bookings"); // 'bookings' or 'history' or 'confirmedReferrals' or 'pendingReferrals'
  // Referral states
  const [referrals, setReferrals] = useState([]);
  const [confirmReferrals, setConfirmReferrals] = useState(0);
  const [pendingReferrals, setPendingReferrals] = useState([]);
  const [confirmedReferralsList, setConfirmedReferralsList] = useState([]);
  // --- MODIFICATION END ---

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Animation ref
  const profileCardRef = useRef(null);

  useEffect(() => {
    const fetchBookingsAndReferrals = async () => {
      setIsLoading(true);
      setError(null);

      const applyMockData = () => {
        console.warn("Backend unreachable or disabled: using mock data for UI development.");
        setAllBookings([]);
        setConfirmedBookings([]);
        setAccommodationBookings([]);
        setReferrals([]);
        setPendingReferrals([]);
        setConfirmedReferralsList([]);
        setConfirmReferrals(0);
      };

      if (process.env.NEXT_PUBLIC_BACKEND_ENABLED === 'false') {
        applyMockData();
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("Authentication token not found.");

        // fetch bookings
        const bookingsResp = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/api/booking/getbooking`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = bookingsResp.data;
        const fetchedBookings = data.bookings || [];

        setAllBookings(
          fetchedBookings.filter((booking) => booking.status !== "TIMEOUT")
        );
        setConfirmedBookings(
          fetchedBookings.filter((booking) => booking.status === "CONFIRMED")
        );

        // fetch referrals
        try {
          const refResp = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/api/referrals/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const refData = refResp.data || {};
          const allReferrals = refData.referrals || [];

          // Separate referrals by status - COMPLETED is considered confirmed
          const pending = allReferrals.filter(
            (ref) => ref.status === "PENDING"
          );
          const confirmed = allReferrals.filter(
            (ref) => ref.status === "CONFIRMED" || ref.status === "COMPLETED"
          );

          setReferrals(allReferrals);
          setPendingReferrals(pending);
          setConfirmedReferralsList(confirmed);
          setConfirmReferrals(
            typeof refData.confirmReferrals === "number"
              ? refData.confirmReferrals
              : confirmed.length
          );

          try {
            const accomResp = await jwtRequired.get(`${process.env.NEXT_PUBLIC_API}/api/accomodation/`);
            console.log(accomResp);
            const confirmedBookings = (accomResp.data.roomBookings || []).filter(
              (booking) => booking.status === "CONFIRMED"
            );
            setAccommodationBookings(confirmedBookings);
          } catch (accomErr) {
            // Non-fatal: log error but don't block the UI
            console.error("Failed to fetch accommodation:", accomErr);
          }

        } catch (refErr) {
          // Non-fatal: keep bookings but surface referral fetch error in console
          console.error("Failed to fetch referrals:", refErr);
        }
      } catch (err) {
        applyMockData();
        const message =
          err?.response?.data?.message || err.message || "Failed to fetch";
        // Do not set error state so the UI gracefully falls back instead of breaking
        console.error("Fetch failed:", message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookingsAndReferrals();
  }, []);

  const router = useRouter();

  // --- MODIFICATION: New handler to open modal with a specific view ---
  const handleOpenModal = (tab) => {
    setActiveTab(tab);
    setEventsModalOpen(true);
  };

  // The rest of your handlers (handleEdit, handleSaveEdit, etc.) remain unchanged...
  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue || "");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handleSaveEdit = async () => {
    if (!tempValue.trim()) {
      alert("Field cannot be empty");
      return;
    }

    let value = tempValue.trim();

    if (editingField === "phone_number") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length !== 10) {
        alert("Phone number must be exactly 10 digits.");
        return;
      }
      value = digitsOnly;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const fieldMapping = {
        phone_number: "phone",
        college: "college",
        district: "district",
        referredByName: "referredById",
      };

      const apiFieldKey = fieldMapping[editingField] || editingField;

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API}/api/users/`,
        { [apiFieldKey]: value },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // axios throws on non-2xx; response.data contains returned payload
      const data = response.data;
      setCurrentUser({ ...currentUser, [editingField]: value });
      setEditingField(null);
      setTempValue("");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadTicket = (ticketUrl) => {
    if (ticketUrl) {
      window.open(ticketUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Ticket URL not available.");
    }
  };

  const getRefferalDetails = () => {
    // return cached referrals fetched from API
    return referrals;
  };

  // --- MODIFICATION: Updated getStatusBadge to handle context ---
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
        if (context === "booking") {
          // PENDING bookings are shown as FAILED
          return (
            <span className={`${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`}>
              FAILED
            </span>
          );
        }
        // PENDING referrals are shown as PENDING
        return (
          <span className={`${baseClasses} bg-amber-500/20 text-amber-400 border border-amber-500/30`}>
            PENDING
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

  const handleCopyReferral = async () => {
    const referralLink = currentUser.tat_id;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Copy failed. Please copy manually.");
    }
  };

  const fields = [
    { key: "name", label: "Name", editable: true },
    { key: "tat_id", label: "Tathva Id", editable: false },
    { key: "phone_number", label: "Phone Number", editable: true },
    { key: "college", label: "College", editable: true },
    { key: "district", label: "District", editable: true },
  ];

  const renderBookingList = (bookingsToRender) => {
    if (bookingsToRender.length > 0) {
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
                key={booking.bookingUid}
                className="group bg-white/[0.04] backdrop-blur-sm rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.07] transition-all duration-500"
                style={{
                  animation: `profileSlideUp 0.4s ease-out ${index * 80}ms backwards`,
                }}
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="relative w-full lg:w-56 xl:w-64 h-44 lg:h-auto flex-shrink-0 overflow-hidden">
                    <Image
                      src={booking.event?.picture || "/placeholder.jpg"}
                      alt={booking.event?.heading}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                        {booking.event?.heading} {booking.event?.type}
                      </h3>
                      {getStatusBadge(booking?.status, "booking")}
                    </div>
                    <p className="text-white/50 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {booking.event?.description}
                    </p>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5 mb-4">
                      <div className="flex items-center bg-white/[0.05] rounded-lg p-3 border border-white/[0.06] group/item hover:border-white/15 transition-all">
                        <div className="bg-white/10 rounded-lg p-2 mr-3 group-hover/item:bg-white/15 transition-colors">
                          <MdDateRange className="text-white/70" size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                            Date
                          </p>
                          <p className="text-sm font-semibold text-white/90">
                            {displayDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center bg-white/[0.05] rounded-lg p-3 border border-white/[0.06] group/item hover:border-white/15 transition-all">
                        <div className="bg-white/10 rounded-lg p-2 mr-3 group-hover/item:bg-white/15 transition-colors">
                          <MdAccessTime className="text-white/70" size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                            Time
                          </p>
                          <p className="text-sm font-semibold text-white/90">
                            {displayTime}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadTicket(booking.picture)}
                      disabled={booking.status !== "CONFIRMED"}
                      className="w-full bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
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
      <div className="text-center py-16">
        <div className="bg-white/[0.05] rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-5 border border-white/[0.08]">
          <MdDateRange className="text-white/30" size={36} />
        </div>
        <p className="text-white/70 text-lg font-bold mb-2">
          {activeTab === "bookings"
            ? "No confirmed events yet"
            : "No booking history"}
        </p>
        <p className="text-white/40 text-sm">
          Start exploring and register for exciting events!
        </p>
      </div>
    );
  };

  // NEW: Render referral lists
  const renderReferralsList = (referralsToRender, type) => {
    if (referralsToRender.length > 0) {
      return (
        <div className="space-y-4">
          {referralsToRender.map((referral, index) => {
            return (
              <div
                key={index}
                className="group bg-white/[0.04] backdrop-blur-sm rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.07] transition-all duration-500"
                style={{
                  animation: `profileSlideUp 0.4s ease-out ${index * 80}ms backwards`,
                }}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                      <div className="bg-white/10 rounded-lg p-2">
                        <FaUser className="text-white/70" size={14} />
                      </div>
                      {referral.referredUser.name}
                      {getStatusBadge(referral.status, "referral")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="flex items-center bg-white/[0.05] rounded-lg p-3 border border-white/[0.06] hover:border-white/15 transition-all">
                      <div>
                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                          Email
                        </p>
                        <p className="text-sm font-medium text-white/80 truncate">
                          {referral.referredUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center bg-white/[0.05] rounded-lg p-3 border border-white/[0.06] hover:border-white/15 transition-all">
                      <div>
                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                          Tathva ID
                        </p>
                        <p className="text-sm font-medium text-white/80">
                          {referral.referredUser.referral}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Empty state for referrals
    return (
      <div className="text-center py-16">
        <div className="bg-white/[0.05] rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-5 border border-white/[0.08]">
          <FaUsers className="text-white/30" size={36} />
        </div>
        <p className="text-white/70 text-lg font-bold mb-2">
          {type === "confirmed"
            ? "No confirmed referrals yet"
            : "No pending referrals"}
        </p>
        <p className="text-white/40 text-sm">
          Share your referral code with friends to earn rewards!
        </p>
      </div>
    );
  };

  const renderAccommodationList = (bookingsToRender) => {
    if (bookingsToRender.length > 0) {
      return (
        <div className="space-y-4">
          {bookingsToRender.map((booking, index) => {
            // --- Helper to format dates ---
            const formatDate = (dateString) => {
              return new Date(dateString).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
            };

            // --- Logic to summarize food choices ---
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

            return (
              <div
                key={booking.bookingUid}
                className="group bg-white/[0.04] backdrop-blur-sm rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.07] transition-all duration-500"
                style={{
                  animation: `profileSlideUp 0.4s ease-out ${index * 80}ms backwards`,
                }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Accommodation at {booking.room === "DORMG" ? "Dormitory (Girls)" : (booking.room === "DORMB" ? "Dormitory (Boys) " : (booking.room === "ROOM3" ? "3 Shared Room (Girls)" : "4 Shared Room (Boys)"))}
                    </h3>
                    {getStatusBadge(booking.status, "booking")}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
                    {/* Check-in Date */}
                    <div className="flex items-center bg-white/[0.05] rounded-lg p-3 border border-white/[0.06] hover:border-white/15 transition-all">
                      <div className="bg-white/10 rounded-lg p-2 mr-3">
                        <MdDateRange className="text-white/70" size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                          Check-in
                        </p>
                        <p className="text-sm font-medium text-white/80">
                          {formatDate(booking.startDate)}
                        </p>
                      </div>
                    </div>
                    {/* Check-out Date */}
                    <div className="flex items-center bg-white/[0.05] rounded-lg p-3 border border-white/[0.06] hover:border-white/15 transition-all">
                      <div className="bg-white/10 rounded-lg p-2 mr-3">
                        <MdDateRange className="text-white/70" size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                          Check-out
                        </p>
                        <p className="text-sm font-medium text-white/80">
                          {formatDate(booking.endDate)}
                        </p>
                      </div>
                    </div>
                    {/* Gender */}
                    <div className="flex items-center bg-white/[0.05] rounded-lg p-3 border border-white/[0.06] hover:border-white/15 transition-all">
                      <div className="bg-white/10 rounded-lg p-2 mr-3">
                        <FaUser className="text-white/70" size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                          Gender
                        </p>
                        <p className="text-sm font-medium text-white/80 capitalize">
                          {booking.gender.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    {/* Food Summary */}
                    <div className="flex items-center bg-white/[0.05] rounded-lg p-3 border border-white/[0.06] hover:border-white/15 transition-all">
                      <div className="bg-white/10 rounded-lg p-2 mr-3">
                        <MdEvent className="text-white/70" size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                          Food Choices
                        </p>
                        <p className="text-sm font-medium text-white/80">
                          {foodSummary}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadTicket(booking.picture)}
                    disabled={booking.status !== "CONFIRMED"}
                    className="w-full bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <MdDownload size={18} />
                    {booking.status === "CONFIRMED"
                      ? "Download Food & Accommodation Ticket"
                      : "Failed"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Empty state for accommodation
    return (
      <div className="text-center py-16">
        <div className="bg-white/[0.05] rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-5 border border-white/[0.08]">
          <FaBed className="text-white/30" size={36} />
        </div>
        <p className="text-white/70 text-lg font-bold mb-2">
          No accommodation booked
        </p>
        <p className="text-white/40 text-sm">
          You can book your stay through the accommodation page.
        </p>
      </div>
    );
  };

  // Determine which content to show based on active tab
  const renderActiveContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-10 h-10 border-2 border-white/10 rounded-full"></div>
            <div className="w-10 h-10 border-2 border-white rounded-full border-t-transparent absolute top-0 left-0 animate-spin"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20 text-red-400/80">Error: {error}</div>
      );
    }

    switch (activeTab) {
      case "bookings":
        return renderBookingList(confirmedBookings);
      case "history":
        return renderBookingList(allBookings);
      case "pendingReferrals":
        return renderReferralsList(pendingReferrals, "pending");
      case "confirmedReferrals":
        return renderReferralsList(confirmedReferralsList, "confirmed");
      case "accommodation":
        return renderAccommodationList(accommodationBookings);
      default:
        return renderBookingList(confirmedBookings);
    }
  };

  const tabItems = [
    { key: "bookings", label: "Bookings", icon: <MdEvent size={16} /> },
    { key: "history", label: "History", icon: <MdHistory size={16} /> },
    { key: "confirmedReferrals", label: "Confirmed Refs", icon: <MdCheckCircle size={16} /> },
    { key: "pendingReferrals", label: "Pending Refs", icon: <MdPending size={16} /> },
    { key: "accommodation", label: "Accommodation", icon: <FaBed size={16} /> },
  ];


  return (
    <>
      <div className="min-h-screen bg-transparent py-4 sm:py-8 px-3 sm:px-6 lg:px-10 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-white/[0.04] to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-zinc-800/20 to-transparent rounded-full blur-[120px]"></div>

        <div className="mt-16 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 relative z-10">

          {/* ═══════════════════════════════════════════ */}
          {/* LEFT COLUMN - Profile Card */}
          {/* ═══════════════════════════════════════════ */}
          <div className="w-full lg:w-[42%] xl:w-[38%]" ref={profileCardRef}>
            <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50">

              {/* ── Profile Header with Avatar ── */}
              <div className="relative p-6 sm:p-8 pb-0">
                {/* Subtle gradient overlay at top */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.04] to-transparent rounded-t-2xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                  {/* Profile Picture with Glow Ring */}
                  <div className="relative mb-5 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/5 to-white/20 rounded-full blur-sm group-hover:blur-md group-hover:from-white/30 group-hover:to-white/30 transition-all duration-700 animate-pulse"></div>
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                      <Image
                        src={currentUser.picture}
                        alt="user_pfp"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Online indicator */}
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  </div>

                  {/* Name & ID */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight text-center">
                    {currentUser.name}
                  </h1>
                  <p className="text-white/40 text-xs font-mono mb-5 tracking-wider">
                    {currentUser.tat_id}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-6 w-full max-w-xs">
                    <button
                      onClick={handleCopyReferral}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 border ${copied
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white border-white/[0.08] hover:border-white/20"
                        }`}
                    >
                      {copied ? (
                        <>
                          <FaCheck size={12} /> Copied!
                        </>
                      ) : (
                        <>
                          <FaShare size={12} /> Refer
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("jwt");
                        router.push("/");
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/[0.06] hover:bg-red-500/20 text-white/80 hover:text-red-400 border border-white/[0.08] hover:border-red-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="mx-6 sm:mx-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

              {/* ── Personal Information ── */}
              <div className="p-5 sm:p-6 lg:p-7">
                {/* ── QR Code Section ── */}
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-white/60 mb-4 flex items-center gap-2 tracking-widest uppercase">
                    <span className="w-1 h-5 bg-white/30 rounded-full"></span>
                    QR Code
                  </h2>
                  <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 flex flex-col items-center justify-center transition-all duration-300">
                    <div className="relative p-3 bg-white rounded-xl shadow-xl shadow-black/50 transition-transform duration-300 hover:scale-[1.02]">
                      <Image
                        src={currentUser?.qrCode || currentUser?.qr || "/qr.png"}
                        alt="QR Code"
                        width={150}
                        height={150}
                        className="object-contain w-32 h-32 sm:w-36 sm:h-36 rounded-lg"
                        priority
                      />
                    </div>
                    <p className="text-[11px] text-white/40 mt-3 font-mono tracking-wider text-center">
                      {currentUser?.tat_id || "Scan to verify"}
                    </p>
                  </div>
                </div>

                <div className="mb-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <h2 className="text-sm font-bold text-white/60 mb-4 flex items-center gap-2 tracking-widest uppercase">
                  <span className="w-1 h-5 bg-white/30 rounded-full"></span>
                  Personal Information
                </h2>
                <div className="space-y-2.5">
                  {fields.map((field, index) => (
                    <div
                      key={field.key}
                      className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/[0.10] rounded-xl p-3.5 transition-all duration-300"
                      style={{
                        animation: `profileSlideUp 0.3s ease-out ${index * 50}ms backwards`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-white/35 font-semibold mb-0.5 uppercase tracking-wider">
                            {field.label}
                          </p>
                          {editingField === field.key ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="text"
                                inputMode={
                                  field.key === "phone_number"
                                    ? "numeric"
                                    : "text"
                                }
                                pattern={
                                  field.key === "phone_number"
                                    ? "[0-9]*"
                                    : undefined
                                }
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="flex-1 text-sm font-semibold text-white bg-white/[0.06] border border-white/[0.15] rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/30 transition-colors"
                                autoFocus
                                disabled={isSaving}
                              />
                              <button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                              >
                                <FaCheck size={11} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="p-2 rounded-lg bg-white/[0.06] text-white/50 border border-white/[0.08] hover:bg-white/[0.1] transition-all disabled:opacity-50"
                              >
                                <span className="text-xs">✕</span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm font-semibold text-white/85 truncate">
                              {currentUser[field.key]}
                            </p>
                          )}
                        </div>
                        {field.editable && editingField !== field.key && (
                          <button
                            onClick={() =>
                              handleEdit(field.key, currentUser[field.key])
                            }
                            className="ml-3 p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/30 hover:text-white/70 border border-transparent hover:border-white/[0.1] transition-all opacity-0 group-hover:opacity-100"
                          >
                            <FaEdit size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile buttons for all sections */}
                <div className="w-full lg:hidden mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleOpenModal("bookings")}
                    className="bg-white/[0.06] hover:bg-white/[0.1] text-white/80 py-3 rounded-xl font-semibold text-xs transition-all border border-white/[0.08] hover:border-white/20 flex items-center justify-center gap-2"
                  >
                    <MdEvent size={18} />
                    My Bookings
                  </button>
                  <button
                    onClick={() => handleOpenModal("history")}
                    className="bg-white/[0.06] hover:bg-white/[0.1] text-white/80 py-3 rounded-xl font-semibold text-xs transition-all border border-white/[0.08] hover:border-white/20 flex items-center justify-center gap-2"
                  >
                    <MdHistory size={18} />
                    History
                  </button>
                </div>

                {/* New mobile buttons for referrals */}
                <div className="w-full lg:hidden mt-2.5 grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleOpenModal("confirmedReferrals")}
                    className="bg-white/[0.06] hover:bg-white/[0.1] text-white/80 py-3 rounded-xl font-semibold text-xs transition-all border border-white/[0.08] hover:border-white/20 flex items-center justify-center gap-2"
                  >
                    <MdCheckCircle size={18} />
                    Confirmed Refs
                  </button>
                  <button
                    onClick={() => handleOpenModal("pendingReferrals")}
                    className="bg-white/[0.06] hover:bg-white/[0.1] text-white/80 py-3 rounded-xl font-semibold text-xs transition-all border border-white/[0.08] hover:border-white/20 flex items-center justify-center gap-2"
                  >
                    <MdPending size={18} />
                    Pending Refs
                  </button>
                </div>

                <div className="w-full lg:hidden mt-2.5">
                  <button
                    onClick={() => handleOpenModal("accommodation")}
                    className="bg-white/[0.06] hover:bg-white/[0.1] text-white/80 w-full py-3 rounded-xl font-semibold text-xs transition-all border border-white/[0.08] hover:border-white/20 flex items-center justify-center gap-2"
                  >
                    <FaBed size={18} />
                    Accommodation
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* RIGHT COLUMN - Events & Referrals (Desktop) */}
          {/* ═══════════════════════════════════════════ */}
          <div className="hidden lg:flex w-full lg:w-[58%] xl:w-[62%] relative">
            <div className="w-full bg-white/[0.02] backdrop-blur-md rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50">

              {/* ── Header ── */}
              <div className="p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-white/[0.03] to-transparent"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {activeTab === "bookings"
                      ? "My Bookings"
                      : activeTab === "history"
                        ? "Booking History"
                        : activeTab === "pendingReferrals"
                          ? "Pending Referrals"
                          : activeTab === "accommodation"
                            ? "My Accommodation"
                            : "Confirmed Referrals"}
                  </h2>
                  <p className="text-white/40 text-xs mt-1.5 font-mono tracking-wider">
                    {activeTab === "bookings"
                      ? confirmedBookings.length
                      : activeTab === "history"
                        ? allBookings.length
                        : activeTab === "pendingReferrals"
                          ? pendingReferrals.length
                          : activeTab === "accommodation"
                            ? accommodationBookings.length
                            : confirmedReferralsList.length}{" "}
                    {activeTab === "pendingReferrals" ||
                      activeTab === "confirmedReferrals"
                      ? "referral"
                      : activeTab === "accommodation"
                        ? "booking"
                        : "event"}
                    {(activeTab === "bookings" && confirmedBookings.length !== 1) ||
                      (activeTab === "history" && allBookings.length !== 1) ||
                      (activeTab === "pendingReferrals" &&
                        pendingReferrals.length !== 1) ||
                      (activeTab === "confirmedReferrals" &&
                        confirmedReferralsList.length !== 1) ||
                      (activeTab === "accommodation" &&
                        accommodationBookings.length !== 1)
                      ? "s"
                      : ""}{" "}
                    Total
                  </p>
                </div>
              </div>

              {/* ── Tabs ── */}
              <div className="flex border-b border-white/[0.06] px-6 overflow-x-auto scrollbar-hide">
                {tabItems.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-3 px-4 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 relative ${activeTab === tab.key
                      ? "text-white"
                      : "text-white/35 hover:text-white/60"
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Content ── */}
              <div className="overflow-y-auto max-h-[70vh] p-6">
                {renderActiveContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        field={editField}
        currentValue={currentUser[editField]}
        userId={currentUser.id}
        onSuccess={() => window.location.reload()}
      />
      {/* --- MODIFICATION: Pass new props to EventsModal --- */}
      <EventsModal
        isOpen={eventsModalOpen}
        onClose={() => setEventsModalOpen(false)}
        activeView={activeTab}
        setActiveView={setActiveTab}
        confirmedBookings={confirmedBookings}
        allBookings={allBookings}
        referrals={referrals}
        pendingReferrals={pendingReferrals}
        confirmedReferralsList={confirmedReferralsList}
        confirmReferrals={confirmReferrals}
        accommodationBookings={accommodationBookings} // Add this prop
      />
      <style jsx>{`
        @keyframes profileSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}