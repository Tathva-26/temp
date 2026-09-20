"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileSummary from "@/components/Profile_Page_Components/ProfileSummary";
import { useUserContext } from "@/context/UserContext";

export default function ProfilePage() {
  const { user, isLoggedIn, authLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) router.replace("/");
  }, [authLoading, isLoggedIn, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-white/20" />
          <div className="absolute left-0 top-0 h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div>
      <ProfileSummary user={user} />
    </div>
  );
}
