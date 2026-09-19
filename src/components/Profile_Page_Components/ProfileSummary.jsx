"use client";

import { LogOut, Mail, User } from "lucide-react";
import { useUserContext } from "@/context/UserContext";

export default function ProfileSummary({ user }) {
  const { logout } = useUserContext();

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-8 flex flex-col items-center text-center">
          {user?.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture}
              alt=""
              className="mb-4 h-24 w-24 rounded-full border-2 border-white/20 object-cover"
            />
          ) : (
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/20 bg-white/10">
              <User size={40} className="text-white/70" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">
            {user?.name || "Your profile"}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Signed in with Google
          </p>
        </div>

        <div className="space-y-3">
          {user?.name && (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <User size={18} className="shrink-0 text-cyan-400" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Name
                </p>
                <p className="truncate text-sm font-medium text-white">
                  {user.name}
                </p>
              </div>
            </div>
          )}

          {user?.email && (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <Mail size={18} className="shrink-0 text-cyan-400" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Email
                </p>
                <p className="truncate text-sm font-medium text-white">
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}
