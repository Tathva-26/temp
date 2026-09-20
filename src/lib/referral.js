/**
 * Campus-ambassador referral codes.
 *
 * A CA shares a link carrying `?referral_code=AB12CD`. The code has to survive
 * the walk from that landing page to whichever event the visitor eventually
 * books, and through a Google sign-in round trip in between — so it is kept in
 * localStorage rather than passed along in the URL.
 *
 * TIQR issues and validates these codes, not us: an invalid one comes back
 * from `POST /api/booking/create` as a 400 "Booking rejected".
 */

const STORAGE_KEY = "tathva:referralCode";

/**
 * `referral_code` is the documented parameter. `ref` is accepted as well
 * because the CA site generated links with it for a while, and those are
 * already out in the world.
 */
const QUERY_PARAMS = ["referral_code", "ref"];

/**
 * Reads the code out of the current URL and remembers it. Safe to call on
 * every page; it only writes when the param is actually present, so an
 * ordinary internal navigation does not clear a code captured earlier.
 */
export function captureReferralCode() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const code = QUERY_PARAMS.map((key) => params.get(key)).find(Boolean);
  if (!code) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, code.trim());
  } catch {
    // Storage blocked (private mode, or the user turned it off). The booking
    // simply goes through unattributed — not worth interrupting anyone over.
  }
}

/** The remembered code, or null. */
export function getReferralCode() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

/** Called once TIQR has rejected a code, so a bad one is not retried forever. */
export function clearReferralCode() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
