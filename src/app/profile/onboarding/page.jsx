"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";

// There is no separate onboarding flow any more: /profile edits the same
// fields through the same PUT /api/user/, and shows a prompt when the phone
// number booking requires is still missing. This only redirects so old links
// do not 404.
export default function OnboardingPage() {
  const router = useRouter();
  const { isLoggedIn, authLoading } = useUserContext();

  useEffect(() => {
    if (authLoading) return;
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
