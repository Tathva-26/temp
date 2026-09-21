"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useUserContext } from "@/context/UserContext";

// Top-right profile icon. Signed out it starts Google OAuth directly —
// there is no separate /login page, the icon *is* the entry point.
// Signed in it links through to the profile, showing the Google avatar.
const ICON_CLASS =
  "flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/40 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-cyan-400/60 hover:text-cyan-400";

export default function AuthButton({ onNavigate }) {
  const { isLoggedIn, authLoading, user, loginWithGoogle } = useUserContext();

  if (authLoading) {
    return (
      <div
        className="h-11 w-11 animate-pulse rounded-full border border-white/10 bg-white/15"
        aria-label="Checking sign-in status"
      />
    );
  }

  if (isLoggedIn) {
    return (
      <Link
        href="/profile"
        onClick={onNavigate}
        title={user?.name || "Profile"}
        aria-label="Profile"
        className={ICON_CLASS}
      >
        {user?.picture ? (
          // Remote avatar hosts aren't in next.config images.domains, so a
          // plain <img> avoids the Next image loader rejecting them.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <User size={20} />
        )}
      </Link>
    );
  }

  return (
    <button
      type="button"
      title="Sign in"
      aria-label="Sign in"
      onClick={() => {
        onNavigate?.();
        loginWithGoogle();
      }}
      className={ICON_CLASS}
    >
      <User size={20} />
    </button>
  );
}
