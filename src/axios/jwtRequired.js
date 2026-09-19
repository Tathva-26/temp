// DEAD CODE — nothing imports this any more.
//
// Auth moved to better-auth: the session is an httpOnly cookie the browser
// attaches itself, so there is no token for JS to read, decode or expire.
// Use `@/lib/api` (axios with `withCredentials: true`) instead.
//
// This file is kept only so the deletion shows up as a deliberate commit.
throw new Error(
  "jwtRequired has been removed — import `@/lib/api` instead (cookie-based auth).",
);
