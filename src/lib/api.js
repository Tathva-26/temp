import axios from "axios";

// One backend origin for the whole app. The session is an httpOnly cookie the
// browser attaches itself (`withCredentials`) — there is no bearer token, and
// omitting credentials turns every authenticated call into a 401.
//
// This origin must also be in the backend's ALLOWED_ORIGINS: that list fails
// closed, and a write from an unlisted origin comes back as a plain
// 403 {"error":"Forbidden"} rather than a CORS error.
export function getBackendURL() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API ||
    "http://localhost:8000"
  ).replace(/\/$/, "");
}

const api = axios.create({
  baseURL: getBackendURL(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * The one place that knows how this backend reports failures.
 *
 * Error bodies are not uniform: older routes use `message`, newer ones `error`,
 * and a Zod validation failure puts an **array** of issues in `error` rather
 * than a string (API.md §3).
 */
export function apiErrorMessage(err, fallback = "Something went wrong.") {
  const body = err?.response?.data;
  if (!body) return err?.message || fallback;

  if (Array.isArray(body.error)) {
    return body.error[0]?.message || fallback;
  }

  return body.error || body.message || fallback;
}

export default api;
