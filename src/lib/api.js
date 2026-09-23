import axios from "axios";
import { USE_MOCK_DATA } from "@/lib/mock/data";
import { mockAdapter, mockFetch } from "@/lib/mock/api";

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
  // NEXT_PUBLIC_USE_MOCK_DATA=true answers from src/lib/mock instead of the network.
  ...(USE_MOCK_DATA ? { adapter: mockAdapter } : {}),
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

/*
 * A 401 means the session is gone — expired (they last 3 days with no refresh,
 * API.md §2) or never established at all. Recognising it here means every call
 * gets the same treatment instead of only the profile fetch.
 *
 * The reaction lives in UserContext rather than here: a signed-out visitor's
 * first `GET /api/user/` also 401s, and only that component knows whether
 * someone was actually signed in a moment ago.
 */
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
  return () => {
    if (onUnauthorized === handler) onUnauthorized = null;
  };
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) onUnauthorized?.();
    return Promise.reject(error);
  },
);

/** `fetch` for the callers that do not use axios; mocked when the flag is on. */
export const backendFetch = USE_MOCK_DATA ? mockFetch : (...args) => fetch(...args);

export default api;
