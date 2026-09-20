"use client";

import Link from "next/link";
import { LogIn, User } from "lucide-react";
import { useUserContext } from "@/context/UserContext";

// Top-right sign-in control. Signed out it starts Google OAuth directly —
// there is no separate /login page, the button *is* the entry point.
// Signed in it becomes a link through to the profile.
export default function AuthButton({ onNavigate }) {
  const { isLoggedIn, authLoading, user, loginWithGoogle } = useUserContext();

  if (authLoading) {
    return (
      <div
        className="h-8 w-8 animate-pulse rounded-full bg-white/15"
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
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-white transition-colors hover:text-cyan-400"
      >
        {user?.picture ? (
          // Remote avatar hosts aren't in next.config images.domains, so a
          // plain <img> avoids the Next image loader rejecting them.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt=""
            className="h-7 w-7 rounded-full border border-white/20 object-cover"
          />
        ) : (
          <User size={20} />
        )}
        <span className="max-w-[7rem] truncate text-xs font-semibold uppercase tracking-wider">
          {user?.name?.split(" ")[0] || "Profile"}
        </span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        onNavigate?.();
        loginWithGoogle();
      }}
      className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:text-cyan-400"
    >
      <LogIn size={16} />
      Sign in
    </button>
  );
}
