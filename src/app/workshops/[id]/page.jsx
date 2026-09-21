import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ModalWrapper from "@/components/modelWrapper";
import BackendStatus from "@/components/BackendStatus";
import { fetchEvent, formatPrice } from "@/lib/events";

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== "false";

export default async function WorkshopPage({ params }) {
  const { id } = await params;

  if (!backendEnabled) {
    return (
      <BackendStatus
        title="Workshop details coming soon"
        message="Workshop registration will be available soon."
      />
    );
  }

  const workshop = await fetchEvent(id);
  if (!workshop) notFound();

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

  const workshopData = {
    id: workshop.id,
    isBookable: workshop.isBookable,
    name: workshop.heading,
    date: formatDate(workshop.datetime),
    time: formatTime(workshop.datetime),
    venue: workshop.venueName || "TBA",
    // Convert paisa to rupees: ensure it's a number, then divide by 100
    price: workshop.price !== null && workshop.price !== undefined 
      ? Number(workshop.price) / 100 
      : null,
    priceLabel: formatPrice(workshop.price),
    description: workshop.description,
    image: workshop.picture,
  };

  return (
    <div className="bg-transparent min-h-screen pt-24 sm:pt-28 pb-4 sm:pb-10 px-4 sm:px-8 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <Link
            href="/workshops"
            className="text-sm font-medium text-gray-500 hover:text-white transition-colors"
          >
            ← Back to Workshops
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl pp-fragment font-medium tracking-wide mt-3 text-white uppercase">
            {workshopData.name}
          </h1>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left — Image Section */}
          <div className="lg:col-span-4 flex items-center">
            <div className="relative w-full h-[450px] rounded-2xl overflow-hidden shadow-lg border border-white/20 hover:scale-[1.02] transition-transform duration-300">
              {/* `picture` is nullable on the API, and next/image throws on a
                  null src rather than rendering nothing. */}
              {workshopData.image ? (
                <Image
                  src={workshopData.image}
                  alt={workshopData.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/5 px-4 text-center text-sm uppercase tracking-widest text-white/40">
                  {workshopData.name}
                </div>
              )}
            </div>
          </div>

          {/* Right — Combined Info & Description Section */}
          <div className="lg:col-span-8 bg-black/30 backdrop-blur-lg border border-white/20 shadow-md rounded-2xl p-6 sm:p-8 transition-transform hover:-translate-y-1 hover:shadow-lg">
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {[
                ["Date", workshopData.date],
                ["Time", workshopData.time],
                ["Venue", workshopData.venue + ", NIT"],
                ["Price", workshopData.priceLabel],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs uppercase text-gray-400 tracking-widest">
                    {label}
                  </p>
                  <p className="font-medium text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="border-t border-white/20 pt-4 sm:pt-6">
              <p className="text-base sm:text-lg leading-relaxed text-gray-300 whitespace-pre-line break-words">
                {workshopData.description}
              </p>
              <div className="mt-10 sm:mt-8 flex">
                <ModalWrapper workshopData={workshopData} />
              </div>
              <p className="mt-9 text-gray-400">
                Note - Ticket details are automatically taken from your profile.
                You can update them on the{" "}
                <Link
                  href="/profile"
                  className="font-medium text-white hover:underline"
                >
                  profile page
                </Link>
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Refund Policy - All tickets are non-refundable and
                non-transferable except in the case of event cancellation or
                technical issues.
              </p>
            </div>
          </div>
        </div>
        {/* End of Grid */}
        {/* Footer */}
        <div className="text-center mt-12 sm:mt-16 text-gray-500 text-sm">
          <p>Part of Tathva 25 | National Institute of Technology Calicut</p>
        </div>
      </div>
    </div>
  );
}
