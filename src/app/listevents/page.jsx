"use client";
import { useState, useEffect } from "react";
import { Calendar, Tag } from "lucide-react";
import BackendStatus from "@/components/BackendStatus";
import { getBackendURL } from "@/lib/api";

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== "false";

/**
 * Read-only view of what TIQR holds for our host account.
 *
 * The direction of this used to be backwards. It listed TIQR's events and
 * offered to copy them into our database — but we are now the source of truth:
 * an admin creates the event here and publishing it pushes it to TIQR. There
 * is no `/api/events/create` for a visitor to call (creation is admin-only,
 * under `/api/admin/events`), so the "Add to Tathva DB" button could only ever
 * 404. This is kept as a reconciliation aid, nothing more.
 */
export default function EventsListing() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!backendEnabled) {
    return (
      <BackendStatus
        title="Event management coming soon"
        message="TIQR event listings will be available when the backend is ready."
      />
    );
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getBackendURL()}/api/tiqr-events/`);
      if (!response.ok) throw new Error(`Request failed (${response.status})`);

      const data = await response.json();
      // TIQR paginates, so the list is under `results`.
      setEvents(data.events?.results ?? data.events ?? []);
      setError(null);
    } catch (err) {
      console.error("Failed to load TIQR events:", err);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-500 relative">
              {event.cover ? (
                <img
                  src={event.cover.image}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Calendar className="w-20 h-20 text-white opacity-50" />
                </div>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {event.name}
              </h2>
              <div className="flex items-center gap-2 text-purple-600 mb-3">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">{event.genre}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {event.short_description}
              </p>

              <div className="text-gray-700 text-sm mb-4">
                <Calendar className="w-4 h-4 inline mr-1" />
                {formatDate(event.start_date)} – {formatTime(event.start_date)}
              </div>

              <p className="text-xs text-gray-500">
                TIQR event #{event.id}. Events are created and published from
                the admin panel; publishing is what pushes them here.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
