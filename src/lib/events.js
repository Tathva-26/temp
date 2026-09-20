import { getBackendURL } from "@/lib/api";

/**
 * Public event reads, in one place.
 *
 * Two things the backend does not do for us, and that every caller was getting
 * wrong in its own way:
 *
 *  - **`/api/events/all` includes unpublished events.** Only an admin publish
 *    pushes an event to TIQR and gives it a ticket, so an unpublished event is
 *    not bookable — showing it means a booking attempt that 400s. Filtered here.
 *  - **`price` is in rupees**, not paise. Dividing by 100 showed ₹2.50 for a
 *    ₹250 workshop.
 *
 * `venue` arrives as an object (`{ id, name, location }`), not a string, so
 * interpolating it straight into text renders "[object Object]".
 */

/** Shape the cards and detail pages render, derived from the API's Event. */
function toCard(event) {
  return {
    ...event,
    venueName: event.venue?.name ?? null,
    /**
     * Bookable only once TIQR has issued a ticket. A publish whose sync failed
     * leaves `ticketId` at 0, and the booking endpoint 409s on those.
     */
    isBookable: Boolean(event.published && event.ticketId),
  };
}

/**
 * @param {string} [type] Matched exactly against the event's free-text type,
 *   which the backend lowercases on write — so "workshops", not "Workshops".
 */
export async function fetchEvents(type) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const res = await fetch(`${getBackendURL()}/api/events/all${query}`, {
    // Events change when an admin publishes, which is not build time.
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Failed to load events (${res.status})`);

  const data = await res.json();
  return (data.events ?? []).filter((event) => event.published).map(toCard);
}

/**
 * One event by **our** id (the one in `/api/events/all`), not TIQR's.
 * Returns null for 404 — an unknown or archived event — so callers can render
 * a not-found page rather than an error.
 */
export async function fetchEvent(id) {
  const res = await fetch(`${getBackendURL()}/api/events/details/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`Failed to load event (${res.status})`);

  const data = await res.json();
  return data.event ? toCard(data.event) : null;
}

/** `250` → `"₹250"`. The backend's price is a whole number of rupees. */
export function formatPrice(rupees) {
  if (rupees === null || rupees === undefined) return "TBA";
  return rupees === 0 ? "Free" : `₹${rupees}`;
}
