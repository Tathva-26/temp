import axios from "axios";

function getApiBaseURL() {
  // When testing through ca.tathva.org proxy, profile routes use the same origin.
  if (typeof window !== "undefined") {
    const caProxy = process.env.NEXT_PUBLIC_AUTH_PROXY_URL?.replace(/\/$/, "");
    if (caProxy) return caProxy;
  }
  return process.env.NEXT_PUBLIC_API;
}

const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
