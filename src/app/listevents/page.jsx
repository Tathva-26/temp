"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Tag } from 'lucide-react';

export default function EventsListing() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingEventId, setAddingEventId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.tathva.org/api/tiqr-events');
      const data = await response.json();
      setEvents(data.events.results);
      setError(null);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  

  console.log(events)
  const handleAddEvent = async (event) => {
    try {
      setAddingEventId(event.id);
      const body = {
        id: event.id,
        ticketId : event.ticket_prices[0].id,
        type: event.genre || "general",
        heading: event.name,
        datetime: event.start_date,
        price: event.minimum_ticket_price || 0,
        venueId: event.address?.id || null,
        description: event.short_description || "",
        catchyPara: event.catchy_para || "",
        picture: event.cover?.image || "",
      };

      const response = await axios.post(
        "https://api.tathva.org/api/events/create",
        body,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`, // if using JWT auth
            "Content-Type": "application/json",
          },
        }
      );

      alert(`✅ Event "${event.name}" added successfully!`);
      console.log("Created event:", response.data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add event. Please check console or credentials.");
    } finally {
      setAddingEventId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-500 relative">
              {event.cover ? (
                <img src={event.cover.image} alt={event.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Calendar className="w-20 h-20 text-white opacity-50" />
                </div>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h2>
              <div className="flex items-center gap-2 text-purple-600 mb-3">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">{event.genre}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.short_description}</p>

              <div className="text-gray-700 text-sm mb-4">
                <Calendar className="w-4 h-4 inline mr-1" />
                {formatDate(event.start_date)} – {formatTime(event.start_date)}
              </div>

              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 mb-2">
                View Details
              </button>

              <button
                onClick={() => handleAddEvent(event)}
                disabled={addingEventId === event.id}
                className={`w-full border border-purple-600 text-purple-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
                  addingEventId === event.id ? "opacity-60" : "hover:bg-purple-50"
                }`}
              >
                {addingEventId === event.id ? "Adding..." : "Add to Tathva DB"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
