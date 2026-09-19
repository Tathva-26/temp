"use client";

import { useEffect } from "react";
import { useUserContext } from "@/context/UserContext";

// OAuth landing page. Google returns to the backend callback, which sets the
// httpOnly session cookie and redirects here with no token in the URL.
// better-auth restores the session — this page waits for that and routes to
// /profile or back home if sign-in failed.
export default function GoogleCallbackPage() {
  const { isLoggedIn, authLoading } = useUserContext();

  useEffect(() => {
    if (authLoading) return;
    window.location.replace(isLoggedIn ? "/profile" : "/");
  }, [authLoading, isLoggedIn]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-white/20" />
        <div className="absolute left-0 top-0 h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    </div>
  );
}
