import { createAuthClient } from "better-auth/react";

// 1) NEXT_PUBLIC_AUTH_PROXY_URL (e.g. https://ca.tathva.org) — use CA site as auth
//    gateway (deploy ca-frontend /api/auth proxy first). Same DB, API CORS already OK for CA.
// 2) NEXT_PUBLIC_AUTH_VIA_PROXY=false — direct calls to NEXT_PUBLIC_API (needs CORS whitelist).
// 3) Default — same-origin /api/auth via next.config rewrites on this app.
function getAuthBaseURL() {
  if (typeof window !== "undefined") {
    const caProxy = process.env.NEXT_PUBLIC_AUTH_PROXY_URL?.replace(/\/$/, "");
    if (caProxy) return caProxy;
    if (process.env.NEXT_PUBLIC_AUTH_VIA_PROXY === "false") {
      return process.env.NEXT_PUBLIC_API;
    }
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API;
}

export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: getAuthBaseURL(),
  fetchOptions: {
    credentials: "include",
  },
});
