"use client";

/*
 * Where TIQR sends the buyer after payment.
 *
 * The backend hands TIQR `${FRONTEND_URL}/events/${event.id}` as the callback
 * (bookingController.js), so this route has to exist under OUR event id — not
 * the TIQR one, and not under /workshops or /competitions. Without it a
 * successful payment lands on a 404 and the buyer cannot tell whether they
 * were charged.
 *
 * The query string TIQR appends (`status`, `signature`, …) is signed with a
 * secret this page does not have, so it is treated as a hint only. The truth
 * is GET /api/booking/my, which reads live from TIQR.
 */

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import api, { apiErrorMessage } from "@/lib/api";
import { useUserContext } from "@/context/UserContext";

// The webhook that confirms a booking can land after the buyer is redirected,
// so a missing booking right now is not the same as a failed one.
const POLL_DELAYS_MS = [0, 1500, 3000, 5000];

const rupees = (paise) => `₹${Math.round((paise ?? 0) / 100)}`;

function EventReturn() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { isLoggedIn, authLoading } = useUserContext();

  // TIQR's own word on the payment. "CHARGED" is the success value.
  const reported = (searchParams.get("status") || "").toUpperCase();
  const paymentFailed = Boolean(reported) && reported !== "CHARGED";

  const [event, setEvent] = useState(null);
  const [booking, setBooking] = useState(null);
  const [state, setState] = useState("loading"); // loading | confirmed | pending | failed | error
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/events/details/${id}`);
      const found = data?.event ?? data ?? null;
      setEvent(found);

      if (paymentFailed) {
        setState("failed");
        return;
      }

      // Match on the TIQR event id, which is what a booking carries.
      const tiqrEventId = found?.tiqrEventId ?? null;

      for (const delay of POLL_DELAYS_MS) {
        if (delay) await new Promise((r) => setTimeout(r, delay));

        const res = await api.get("/api/booking/my");
        const rows = res.data?.bookings ?? [];
        const mine = rows
          .filter((b) => !tiqrEventId || b?.ticket?.event === tiqrEventId)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (mine.length) {
          setBooking(mine[0]);
          setState(
            String(mine[0].status).toLowerCase() === "confirmed"
              ? "confirmed"
              : "pending",
          );
          return;
        }
      }

      // Charged, but nothing has reached TIQR's booking list yet.
      setState("pending");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not check your booking."));
      setState("error");
    }
  }, [id, paymentFailed]);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setState("signed-out");
      return;
    }
    load();
  }, [authLoading, isLoggedIn, load]);

  const heading = event?.heading || "your event";

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
        {state === "loading" && (
          <>
            <h1 className="text-2xl font-semibold">Confirming your booking…</h1>
            <p className="mt-3 text-white/60">
              This only takes a moment. Please don&apos;t close this page.
            </p>
          </>
        )}

        {state === "signed-out" && (
          <>
            <h1 className="text-2xl font-semibold">You&apos;re signed out</h1>
            <p className="mt-3 text-white/60">
              Sign in with the account you booked with to see this booking.
            </p>
          </>
        )}

        {state === "confirmed" && (
          <>
            <p className="text-sm uppercase tracking-widest text-emerald-400">
              Booking confirmed
            </p>
            <h1 className="mt-2 text-2xl font-semibold">You&apos;re in — {heading}</h1>

            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-white/50">Booking ID</dt>
                <dd className="font-mono">{booking?.booking_id}</dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-white/50">Tickets</dt>
                <dd>{booking?.quantity ?? 1}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Paid</dt>
                <dd>{rupees(booking?.ticket?.amount)}</dd>
              </div>
            </dl>

            {booking?.ticket_file?.file && (
              <a
                href={booking.ticket_file.file}
                target="_blank"
                rel="noreferrer"
                className="mt-6 block rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center font-medium transition hover:bg-white/20"
              >
                View your ticket
              </a>
            )}
          </>
        )}

        {state === "pending" && (
          <>
            <p className="text-sm uppercase tracking-widest text-amber-400">
              Payment received
            </p>
            <h1 className="mt-2 text-2xl font-semibold">
              We&apos;re still confirming your ticket
            </h1>
            <p className="mt-3 text-white/60">
              Your payment for {heading} went through. The ticket can take a
              minute to appear — it will show up under your profile, and you
              will get it by email. You have not been charged twice, so please
              don&apos;t pay again.
            </p>
          </>
        )}

        {state === "failed" && (
          <>
            <p className="text-sm uppercase tracking-widest text-red-400">
              Payment not completed
            </p>
            <h1 className="mt-2 text-2xl font-semibold">
              Nothing was booked for {heading}
            </h1>
            <p className="mt-3 text-white/60">
              The payment came back as &ldquo;{reported.toLowerCase()}&rdquo;.
              If money did leave your account it will be returned by your bank —
              contact us if it isn&apos;t.
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="text-2xl font-semibold">
              We couldn&apos;t check your booking
            </h1>
            <p className="mt-3 text-white/60">{error}</p>
            <p className="mt-3 text-white/60">
              This does not mean the payment failed. Check your profile before
              paying again.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/profile"
            className="rounded-xl bg-white px-4 py-2 font-medium text-black transition hover:bg-white/80"
          >
            My bookings
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-white/20 px-4 py-2 font-medium transition hover:bg-white/10"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

// useSearchParams needs a Suspense boundary in the App Router.
export default function EventReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black px-6 py-32 text-white">
          <p className="mx-auto max-w-xl text-white/60">Loading…</p>
        </main>
      }
    >
      <EventReturn />
    </Suspense>
  );
}
