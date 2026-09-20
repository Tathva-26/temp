import axios from "axios";

// Same as ca-frontend: one backend origin, session sent via httpOnly cookie.
export function getBackendURL() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API ||
    ""
  ).replace(/\/$/, "");
}

const api = axios.create({
  baseURL: getBackendURL(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
