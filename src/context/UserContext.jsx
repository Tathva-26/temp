"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import { createAuthClient } from "better-auth/react";
import api, { getBackendURL } from "@/lib/api";

const UserContext = createContext(null);

// The backend (better-auth) owns the session in an httpOnly cookie.
// This client only talks to it: `useSession` probes the session,
// `signIn.social` starts Google OAuth, `signOut` clears it. No token is ever
// visible here — not in state, storage, or URLs.
const { signIn, signOut, useSession } = createAuthClient({
  baseURL: getBackendURL(),
});

function normalizeProfile(data) {
  if (!data || (!data.id && !data.email)) return null;
  return {
    isComplete: !!(data.phone && data.college && data.district),
    id: data.id,
    name: data.name,
    email: data.email || "",
    tat_id: data.referral || data.referralCode || "",
    phone_number: data.phone || "",
    college: data.college || "",
    district: data.district || "",
    picture: data.picture ?? data.image ?? "/pfp_dev/userFile.webp",
    referredById: data.referredById || "",
    referredByName: data.referredByName || "",
    events: data.events ?? [],
    role: data.role,
  };
}


export default function UserContextWrapper({ children }) {
  const { data: sessionData, isPending: sessionPending } = useSession();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const sessionUser = sessionData?.user || null;

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/api/user/");
      const normalized = normalizeProfile(data);
      setProfile(normalized);
      return normalized;
    } catch {
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (sessionPending) return;
    let cancelled = false;
    setProfileLoading(true);
    if (!sessionUser) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    refreshProfile().finally(() => {
      if (!cancelled) setProfileLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionPending, sessionUser?.id, refreshProfile]);

  const user = useMemo(() => {
    if (!profile) return null;
    return {
      ...profile,
      picture:
        profile.picture ||
        sessionUser?.image ||
        "/pfp_dev/userFile.webp",
    };
  }, [profile, sessionUser?.image]);

  const isLoggedIn = !!sessionUser && !!profile;
  const authLoading = sessionPending || profileLoading;

  const loginWithGoogle = useCallback(async () => {
    if (!getBackendURL()) {
      toast.error("Set NEXT_PUBLIC_BACKEND_URL in .env.local");
      return;
    }

    try {
      const payload = {
        provider: "google",
        callbackURL: `${window.location.origin}/auth/google/callback`,
      };
      const role = process.env.NEXT_PUBLIC_OAUTH_ROLE;
      if (role) {
        payload.additionalData = { role };
      }

      const { error } = await signIn.social(payload);
      if (error) {
        throw new Error(error.message || error.statusText || "Google sign-in failed");
      }
    } catch (err) {
      console.error("Failed to start Google sign-in:", err);
      toast.error("Could not start Google sign-in. Please try again.");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign-out failed:", err);
    } finally {
      setProfile(null);
      toast.success("Signed out successfully");
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn,
      authLoading,
      loginWithGoogle,
      logout,
      refreshProfile,
    }),
    [user, isLoggedIn, authLoading, loginWithGoogle, logout, refreshProfile],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  return useContext(UserContext);
}
