import toast from "react-hot-toast";

import api, { apiErrorMessage } from "@/lib/api";
import { clearReferralCode, getReferralCode } from "@/lib/referral";

/**
 * Books a ticket and hands the browser to TIQR's payment page.
 *
 * That redirect is the whole flow from our side. Nothing about the booking is
 * stored here and there is no webhook, so once the user leaves we learn
 * nothing more — the only way to see whether it went through is to ask
 * `GET /api/booking/my`, which reads live from TIQR and lags a little behind a
 * fresh payment. Do not poll this backend for a status; it does not have one.
 *
 * @param {number} eventId **Our** event id, from `/api/events/all` — not
 *   TIQR's `tiqrEventId`.
 * @param {number} [quantity]
 * @returns {Promise<boolean>} false when the booking was refused. On success
 *   the browser is already navigating away.
 */
export async function regHandler(eventId, quantity = 1) {
  const referralCode = getReferralCode();

  try {
    const { data } = await api.post("/api/booking/create", {
      eventId,
      quantity,
      // Omit rather than send null: the schema accepts the key or its absence,
      // and an empty value is not a code.
      ...(referralCode ? { referralCode } : {}),
    });

    if (!data?.redir_url) {
      // A 201 with no URL means TIQR accepted the booking but gave us nowhere
      // to send the payer, which we cannot recover from on this side.
      console.error("Booking created without a redirect URL:", data);
      toast.error("Could not open the payment page. Please try again.");
      return false;
    }

    window.location.href = data.redir_url;
    return true;
  } catch (error) {
    const status = error?.response?.status;
    const message = error?.response?.data?.error;

    // Each of these means something different to the person clicking, so they
    // are worth separating rather than collapsing into "booking failed".
    if (status === 401) {
      toast.error("Please sign in again to book.");
      return false;
    }

    if (status === 400 && message?.includes("phone number")) {
      toast.error("Add a phone number to your profile before booking.");
      // The profile page is where that gets fixed.
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1200);
      return false;
    }

    if (status === 400 && message === "Booking rejected") {
      // TIQR validates the referral code, and a bad one lands here. Drop it so
      // the next attempt is not refused for the same reason.
      clearReferralCode();
      toast.error(
        "That booking was rejected. If you followed a referral link, try again without it.",
      );
      return false;
    }

    if (status === 409) {
      // Published here, but the push to TIQR failed, so no ticket exists. Not
      // the user's fault and not something they can retry into working.
      toast.error("This event is not open for booking yet. Check back soon.");
      return false;
    }

    if (status === 502) {
      toast.error("The payment provider is unavailable. Please try again.");
      return false;
    }

    toast.error(apiErrorMessage(error, "Booking failed. Please try again."));
    return false;
  }
}

export default regHandler;
