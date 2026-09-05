"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import SectionCard from "@/components/SectionCard";
import Link from "next/link";
import BackendStatus from "@/components/BackendStatus";

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== "false";

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  if (!backendEnabled) {
    return (
      <BackendStatus
        title="Workshops coming soon"
        message="Workshop details will be available soon."
      />
    );
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

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const url = `${process.env.NEXT_PUBLIC_API}/api/events/all?type=workshops`;
        const response = await axios.get(url);
        setWorkshops(response.data.events);
        setError(null);
      } catch (err) {
        console.error("Error fetching workshops:", err);
        setError(err.message || "Failed to load workshops");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const searchedWorkshops = workshops.filter((workshop) =>
    workshop.heading.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-16 px-4 sm:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading workshops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen py-16 px-4 sm:px-8 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error loading workshops</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const bookingsFull = [
    1497, 1493, 1475, 1499, 1496, 1491, 1513, 1520, 1534, 1527, 1526, 1525,
    1476, 1498, 1522, 1521,
  ];

  const filteredWorkshops = searchedWorkshops.filter((w) => !w.isFull);

  // Sort: real images first, dummy ones (ending with "-DUMMY.jpg") last
  const sortedWorkshops = [
    ...filteredWorkshops.filter(
      (w) => !w.picture?.trim().endsWith("-DUMMY.jpg"),
    ),
    ...filteredWorkshops.filter((w) =>
      w.picture?.trim().endsWith("-DUMMY.jpg"),
    ),
  ];

  return (
    <div className="bg-white min-h-screen py-4 sm:py-10 px-4 sm:px-8">
      {/* Heading and home */}
      <div className="mb-12">
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
        >
          ← Home
        </Link>

        <div className="mb-12 border-b border-gray-300 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title */}
            <h1 className="pp-fragment text-4xl sm:text-5xl md:text-6xl text-center md:text-left tracking-wide text-gray-900 uppercase md:mt-3">
              WORKSHOPS
            </h1>

            {/* Search Bar */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search For Workshops"
              className="w-full md:max-w-lg p-4 border border-gray-300 rounded-full shadow-sm focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto">
        {sortedWorkshops.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No workshops found matching your search.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {sortedWorkshops.map((workshop) => {
              const {
                id,
                heading,
                description,
                price,
                datetime,
                time,
                venue,
                picture,
              } = workshop;

              return (
                <Link href={`/workshops/${id}`} key={id}>
                  <SectionCard
                    title={heading ?? "Untitled"}
                    description={description ?? "No description available"}
                    price={price / 100 ?? "N/A"}
                    image={picture}
                    date={formatDate(datetime)}
                    extraInfo={`${datetime ?? ""} ${time ?? ""} @ ${
                      venue ?? ""
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
