import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ModalWrapper from "@/components/modelWrapper";
import BrochureButton from "@/components/BrochureButton";
import BackendStatus from "@/components/BackendStatus";

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== "false";

// DATA FETCHING FUNCTION
async function getEvent(id) {
  const url = `${process.env.NEXT_PUBLIC_API}/api/events/details/${id}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.log("Failed to fetch event:", res);
  }
  const data = await res.json();

  if (!data.event || data.event.length === 0) return null;
  return data.event;
}

async function getBrochure(id) {
  const url = `https://api.tiqr.events/participant/event/${id}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.log("Failed to fetch brochure:", res);
  }
  const data = await res.json();
  console.log(data);

  return data.gallery;
}

// MAIN PAGE COMPONENT
export default async function EventPage({ params }) {
  const { id } = await params;

  if (!backendEnabled) {
    return (
      <BackendStatus
        title="Lecture details coming soon"
        message="Lecture registration will be available soon."
      />
    );
  }

  const event = await getEvent(id);
  console.log(event);

  const brochures = await getBrochure(id);

  if (!event) {
    notFound();
  }

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        })
      : "TBA";

  const formatTime = (timeString) => {
    if (!timeString) return "TBA";
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // Format date range based on startTime and endTime
  const getDateDisplay = () => {
    if (!event.startTime && !event.endTime) {
      // Single day event - show only the date from datetime
      return formatDate(event.datetime);
    } else {
      // Multi-day event - show range
      const startDate = event.startTime
        ? formatDate(event.startTime)
        : formatDate(event.datetime);
      const endDate = event.endTime
        ? formatDate(event.endTime)
        : formatDate(event.datetime);
      console.log(startDate, endDate);
      return `${startDate} - ${endDate}`;
    }
  };

  // Prepare event data
  const eventData = {
    id: event.id,
    name: event.heading,
    date: getDateDisplay(),
    time: formatTime(event.datetime),
    ticketId: event.ticketId,
    venue: event.venue || null,
    price: event.price ? `${event.price / 100}` : "N/A",
    description: event.description || "No description available",
    catchyPara: event.catchyPara || null,
    image: event.picture,
    committee: event.committee || null,
    isTeamEvent: event.isTeamEvent,
    teamSize: event.teamSize,
  };

  // Create the list of details to display
  const infoItems = [["Date", eventData.date]];

  // Add venue only if it exists
  if (eventData.venue) {
    infoItems.push(["Venue", eventData.venue.name || eventData.venue]);
  }

  infoItems.push(["Price", eventData.price]);

  // Add team information if it's a team event
  if (eventData.isTeamEvent) {
    const teamInfo = eventData.teamSize
      ? `Team Event (${eventData.teamSize} members)`
      : "Team Event";
    infoItems.push(["Event Type", teamInfo]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header Section */}
        <div className="flex flex-row sm:flex-row justify-between items-center sm:items-center border-b border-gray-300 pb-6 mb-10">
          <div>
            <Link
              href="/competitions"
              className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
              ← Back to competitions
            </Link>
            <h1 className="text-4xl pp-fragment sm:text-4xl font-medium tracking-tight mt-3 text-gray-900">
              {eventData.name}
            </h1>
          </div>
          <div className="mt-7 sm:mt-0">
            <Image
              src="/images/tathva25.svg"
              alt="Tathva '25 Logo"
              width={95}
              height={95}
              className="opacity-80 hover:opacity-100 transition"
            />
          </div>
        </div>
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left — Image Section */}
          <div className="lg:col-span-4">
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:scale-[1.02] transition-transform duration-300">
              <Image
                src={eventData.image}
                alt={eventData.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
            </div>
          </div>

          {/* Right — Info Section */}
          <div className="lg:col-span-8 bg-white/90 pp-fragment backdrop-blur-lg border border-gray-100 shadow-md rounded-2xl p-6 sm:p-8 transition-transform hover:-translate-y-1 hover:shadow-lg">
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {infoItems.map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs uppercase text-gray-500 tracking-widest">
                    {label}
                  </p>
                  <p className="font-medium text-gray-900">
                    {label === "Price" ? `₹${value}` : value}
                  </p>
                </div>
              ))}
            </div>

            {/* Short Description with View Details Button */}
            <div className="border-t border-gray-100 pt-4 sm:pt-6">
              <p className="text-base  leading-relaxed text-gray-800 whitespace-pre-line break-words">
                {eventData.description}
              </p>
              {eventData.catchyPara && (
                <a
                  href="#full-description"
                  className="inline-block mt-3 text-sm font-medium text-gray-700 hover:text-black transition-colors underline"
                >
                  View Full Description ↓
                </a>
              )}

              {/* Button Container - New Implementation */}
              <div className="flex items-center space-x-4 mt-4 mb-5">
                {/* Modal Wrapper (Register Button) */}
                <ModalWrapper workshopData={eventData} />

                {/* Display Brochure Button */}
                {brochures.length !== 0 && (
                  <BrochureButton brochureUrl={brochures[0].gallery} />
                )}
              </div>

              <p className="mt-1 inter text-sm text-gray-600">
                Ticket details are automatically taken from your profile. You
                can update them on the{" "}
                <Link
                  href="/profile"
                  className="font-medium text-gray-900 hover:underline"
                >
                  profile page
                </Link>
                .
              </p>
              <p className="mt-2 inter text-sm text-gray-600">
                Refund Policy - All tickets are non-refundable and
                non-transferable except in the case of event cancellation or
                technical issues.
              </p>
            </div>
          </div>
        </div>

        {/* Full Description Section (Catchy Para) */}
        {eventData.catchyPara && (
          <div
            id="full-description"
            className="mt-8 bg-white/90 backdrop-blur-lg border border-gray-100 shadow-md rounded-2xl p-6 sm:p-8 scroll-mt-20"
          >
            <h2 className="text-2xl font-medium pp-fragment text-gray-900 mb-4 pb-3 border-b border-gray-200">
              About This Event
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-base pp-fragment leading-relaxed text-gray-800 whitespace-pre-line break-words">
                {eventData.catchyPara}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 sm:mt-16 text-gray-500 text-sm">
          <p>Part of Tathva 25 | National Institute of Technology Calicut</p>
        </div>
      </div>
    </div>
  );
}
