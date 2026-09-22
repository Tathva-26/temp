"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUserContext } from "@/context/UserContext";

// OAuth landing page. Google returns to the backend callback, which sets the
// httpOnly session cookie and redirects here with no token in the URL.
// better-auth restores the session — this page waits for that and routes to
// /profile or back home if sign-in failed.
//
// Failures land here too, through `errorCallbackURL`, carrying better-auth's
// reason in `?error=`. Left unset, that reason goes to the backend's own error
// page instead, which answers with a *relative* redirect to `/?error=…`: the
// browser resolves it against the API origin and the visitor ends up reading
// "Welcome to the Tathva API" with no way back to the site.
const ERROR_MESSAGES = {
  access_denied: "Google sign-in was cancelled.",
  state_not_found: "Sign-in expired before it finished. Please try again.",
  state_mismatch: "Sign-in expired before it finished. Please try again.",
  email_not_found: "Google did not share an email address for that account.",
  unable_to_get_user_info:
    "Could not read your Google profile. Please try again.",
};

export default function GoogleCallbackPage() {
  const { isLoggedIn, authLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    // Read straight off the URL: useSearchParams() would push this whole page
    // behind a Suspense boundary at build time for the sake of one query.
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error) {
      toast.error(
        ERROR_MESSAGES[error] ||
          params.get("error_description") ||
          "Google sign-in failed. Please try again.",
        // Stable id, so a remount cannot stack a second copy of the same toast.
        { id: "oauth-error" },
      );
      router.replace("/");
      return;
    }

    if (authLoading) return;
    // Client-side navigation, so the session this page just waited for is not
    // thrown away and re-fetched by a full reload.
    router.replace(isLoggedIn ? "/profile" : "/");
  }, [authLoading, isLoggedIn, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-white/20" />
        <div className="absolute left-0 top-0 h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    </div>
  );
}
