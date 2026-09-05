"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BackendStatus from "@/components/BackendStatus";

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== "false";

// const specificAnnouncements = [
//   {
//     id: 2,
//     title: "Important Update Regarding Overbooked Workshops",
//     description:
//       "We have identified an issue where a few workshops were overbooked due to exceptionally high demand. Some students who completed payment may not have received their tickets yet. Please be assured our team is resolving this with top priority. We will be sending the confirmed tickets to every affected student via the registered email and phone number shortly. We sincerely apologize for this inconvenience and thank you for your patience.",
//     date: "October 08, 2025",
//   },
//   {
//     id: 1,
//     title: "Clarification on Gold and Regular Workshop Tickets",
//     description:
//       "Hey everyone! We noticed a few questions about the Gold and Regular workshop tickets. Just to clarify — both ticket types offer the exact same benefits and access. The distinction exists only as an internal label. No participant will miss out on anything based on ticket type. Thank you for your understanding and for being part of Tathva ’25!",
//     date: "October 08, 2025",
//   },
//   {
//     id: 3,
//     title: "Official Registration Notice: Please Use Tathva.org Only",
//     description:
//       "It has come to our attention that Google Forms are being circulated for workshop registrations. Only Pre Tathva events may be registered through Google Forms shared by our POCs, whereas the ONLY official channel to register for any Tathva '25 workshops, lectures and competitions will be through this website (tathva.org). Registrations made via any other platforms are invalid.",
//     date: "October 07, 2025",
//   },
// ];

export default function AnnouncementsPage() {
  if (!backendEnabled) {
    return (
      <BackendStatus
        title="Announcements coming soon"
        message="There are no announcements to show yet."
      />
    );
  }

  const [specificAnnouncements, setSpecificAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        })
      : "TBA";

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/announcements`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch announcements");
        }

        const data = await response.json();
        setSpecificAnnouncements(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching announcements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();

    // On visiting announcements page → mark all as read
    const allIds = specificAnnouncements.map((a) => a.id);
    localStorage.setItem("readAnnouncements", JSON.stringify(allIds));
  }, []);

  if (loading) {
    return <div>Loading announcements...</div>;
  }

  if (error) {
    return <div>Error loading announcements: {error}</div>;
  }

  return (
    <div className="bg-white min-h-screen py-8 px-4 sm:px-8">
      {/* Heading */}
      <Link
        href="/"
        className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
      >
        ← Home
      </Link>

      <div className="mb-12 mt-5">
        <h1 className="text-4xl sm:text-5xl md:text-6xl border-b pb-3 text-center border-gray-300 md:text-left tracking-wide pp-fragment text-gray-900 uppercase">
          ANNOUNCEMENTS
        </h1>
      </div>

      {/* Announcements List */}
      <div className="mx-auto max-w-4xl">
        {specificAnnouncements.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No announcements at the moment. Please check back later.
          </p>
        ) : (
          <div className="space-y-8">
            {specificAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="border-l-4 border-gray-800 pl-6 lg:pr-8 py-4 bg-gray-50 rounded-r-lg shadow-sm"
              >
                <div className="flex justify-between items-baseline mb-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-gray-900 pp-fragment">
                    {announcement.title}
                  </h2>
                  <p className="text-sm text-gray-500 sm:ml-4 mt-2 whitespace-nowrap">
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {announcement.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
