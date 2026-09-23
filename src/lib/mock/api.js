import {
  MOCK_ANNOUNCEMENTS,
  MOCK_BOOKINGS,
  MOCK_EVENTS,
  MOCK_REFERRALS,
  MOCK_TIQR_EVENTS,
  MOCK_USER,
} from "./data";

const LATENCY_MS = 250;
const wait = (ms = LATENCY_MS) => new Promise((r) => setTimeout(r, ms));

// Edits made through PUT /api/user/ live for the page session only.
let user = { ...MOCK_USER };
let bookings = [...MOCK_BOOKINGS];

const SESSION_KEY = "mockSignedIn";

export function isMockSignedIn() {
  try {
    return localStorage.getItem(SESSION_KEY) !== "false";
  } catch {
    return true;
  }
}

export function setMockSignedIn(value) {
  try {
    localStorage.setItem(SESSION_KEY, String(value));
  } catch {
    // Storage blocked; the session just resets on reload.
  }
}

const publicEvents = () => MOCK_EVENTS.filter((e) => e.published);

/** Same lookup the real `GET /api/events/all?type=` does. */
export function mockEventsByType(type) {
  const list = MOCK_EVENTS;
  return type ? list.filter((e) => e.type === type) : list;
}

export function mockEventById(id) {
  return MOCK_EVENTS.find((e) => String(e.id) === String(id)) ?? null;
}

/** JSON the real endpoint would answer with, or null for "no such route". */
function route(method, url, body) {
  const path = url.split("?")[0].replace(/\/$/, "");
  const query = new URLSearchParams(url.split("?")[1] ?? "");

  if (method === "get" && path === "/api/user") {
    return isMockSignedIn() ? { status: 200, data: user } : { status: 401, data: { error: "Unauthorized" } };
  }
  if (method === "put" && path === "/api/user") {
    // Multipart bodies arrive as FormData.
    const patch = body instanceof FormData ? Object.fromEntries(body.entries()) : (body ?? {});
    for (const [k, v] of Object.entries(patch)) {
      if (typeof v === "string" || typeof v === "number") user = { ...user, [k]: v };
    }
    return { status: 200, data: user };
  }
  if (method === "get" && path === "/api/events/all") {
    const type = query.get("type");
    return { status: 200, data: { events: mockEventsByType(type) } };
  }
  if (method === "get" && path.startsWith("/api/events/details/")) {
    const event = mockEventById(path.split("/").pop());
    return event
      ? { status: 200, data: { event } }
      : { status: 404, data: { error: "Event not found" } };
  }
  if (method === "get" && path === "/api/booking/my") {
    return { status: 200, data: { bookings } };
  }
  if (method === "post" && path === "/api/booking/create") {
    const event = mockEventById(body?.eventId);
    if (!event) return { status: 400, data: { error: "Booking rejected" } };
    if (!event.ticketId) return { status: 409, data: { error: "Not open for booking" } };
    bookings = [
      {
        id: Date.now(),
        status: "CONFIRMED",
        quantity: body.quantity ?? 1,
        created_at: new Date().toISOString(),
        ticket: { id: event.ticketId, event: event.tiqrEventId, type: event.heading },
      },
      ...bookings,
    ];
    // Stand-in for TIQR's payment page: land on the post-payment route.
    return { status: 201, data: { redir_url: `/events/${event.id}?status=CHARGED` } };
  }
  if (method === "get" && path === "/api/referrals") {
    return { status: 200, data: MOCK_REFERRALS };
  }
  if (method === "post" && path === "/api/contact/create") {
    return { status: 201, data: { message: "Received" } };
  }
  if (method === "get" && path === "/api/announcements") {
    return { status: 200, data: MOCK_ANNOUNCEMENTS };
  }
  if (method === "get" && path === "/api/tiqr-events") {
    return { status: 200, data: { events: { results: MOCK_TIQR_EVENTS } } };
  }
  return null;
}

/**
 * Axios adapter that answers from the fixtures above. Anything unrecognised
 * 404s loudly in the console so a missing fixture is obvious.
 */
export async function mockAdapter(config) {
  await wait();
  const method = (config.method || "get").toLowerCase();
  let body = config.data;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      // Leave it as a string.
    }
  }

  const hit = route(method, config.url || "", body) ?? {
    status: 404,
    data: { error: `No mock for ${method.toUpperCase()} ${config.url}` },
  };
  if (hit.status === 404) console.warn("[mock api]", hit.data.error);

  const response = {
    data: hit.data,
    status: hit.status,
    statusText: String(hit.status),
    headers: {},
    config,
    request: {},
  };

  if (hit.status >= 200 && hit.status < 300) return response;

  const error = new Error(`Request failed with status code ${hit.status}`);
  error.config = config;
  error.response = response;
  error.isAxiosError = true;
  throw error;
}

/** `fetch`-shaped answer for the few callers that do not use axios. */
export async function mockFetch(url, init = {}) {
  const { status, data } = route((init.method || "get").toLowerCase(), url.replace(/^https?:\/\/[^/]+/, "")) ?? {
    status: 404,
    data: {},
  };
  await wait();
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export { publicEvents };
