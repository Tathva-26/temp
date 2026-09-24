import { getBackendURL } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/mock/data";
import { mockEventById, mockEventsByType } from "@/lib/mock/api";

/**
 * Public event reads, in one place.
 *
 * Two things the backend does not do for us, and that every caller was getting
 * wrong in its own way:
 *
 *  - **`/api/events/all` includes unpublished events.** Only an admin publish
 *    pushes an event to TIQR and gives it a ticket, so an unpublished event is
 *    not bookable. These are kept in the list and flagged `isClosed`, so cards
 *    render a "Booking full" state instead of the event vanishing.
 *  - **`price` is in paise**, not rupees: a ₹250 workshop arrives as `25000`.
 *    Render it with `formatPrice`; use `toRupees` when you need a number to
 *    compute on, as the checkout modals do for the platform fee.
 *
 * `venue` arrives as an object (`{ id, name, location }`), not a string, so
 * interpolating it straight into text renders "[object Object]".
 */

/** Shape the cards and detail pages render, derived from the API's Event. */
function toCard(event) {
  return {
    ...event,
    venueName: event.venue?.name ?? null,
    /** Not published by an admin: shown, but greyed out and not bookable. */
    isClosed: !event.published,
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
  if (USE_MOCK_DATA) {
    return mockEventsByType(type)
      .map(toCard)
      .sort((a, b) => Number(a.isClosed) - Number(b.isClosed));
  }

  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const res = await fetch(`${getBackendURL()}/api/events/all${query}`, {
    // Events change when an admin publishes, which is not build time.
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Failed to load events (${res.status})`);

  const data = await res.json();
  // Bookable (published) events first; closed ones sink to the end. The sort
  // is stable, so each group keeps the order the backend sent.
  return (data.events ?? [])
    .map(toCard)
    .sort((a, b) => Number(a.isClosed) - Number(b.isClosed));
}

/**
 * One event by **our** id (the one in `/api/events/all`), not TIQR's.
 * Returns null for 404 — an unknown or archived event — so callers can render
 * a not-found page rather than an error.
 */
export async function fetchEvent(id) {
  if (USE_MOCK_DATA) {
    const event = mockEventById(id);
    return event ? toCard(event) : null;
  }

  const res = await fetch(`${getBackendURL()}/api/events/details/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`Failed to load event (${res.status})`);

  const data = await res.json();
  return data.event ? toCard(data.event) : null;
}

/**
 * `25000` → `250`. The backend's price is in paise; anything unusable (a null
 * price, a non-numeric one) comes back as null so callers can say "TBA".
 */
export function toRupees(paisa) {
  if (paisa === null || paisa === undefined) return null;

  const rupees = Number(paisa) / 100;
  return Number.isFinite(rupees) ? rupees : null;
}

/** `25000` → `"₹250"`. */
export function formatPrice(paisa) {
  const rupees = toRupees(paisa);
  if (rupees === null) return "TBA";

  if (rupees === 0) return "Free";
  return Number.isInteger(rupees) ? `₹${rupees}` : `₹${rupees.toFixed(2)}`;
}