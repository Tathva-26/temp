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
import api from "@/lib/api";
import { signIn, signOut, useSession } from "@/lib/auth-client";

const UserContext = createContext(null);

const useCaAuthProxy = !!process.env.NEXT_PUBLIC_AUTH_PROXY_URL;

function getGoogleCallbackURL() {
  if (typeof window === "undefined") return "/auth/google/callback";
  const { origin, hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "/auth/google/callback";
  }
  return `${origin}/auth/google/callback`;
}

export function normalizeSessionUser(sessionUser) {
  if (!sessionUser?.id && !sessionUser?.email) return null;
  return {
    id: sessionUser.id,
    name: sessionUser.name || "",
    email: sessionUser.email || "",
    picture: sessionUser.image || "/pfp_dev/userFile.webp",
  };
}

export function normalizeProfile(data) {
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
  const [profileLoading, setProfileLoading] = useState(useCaAuthProxy);

  const sessionUser = sessionData?.user || null;

  const refreshProfile = useCallback(async () => {
    if (!useCaAuthProxy) {
      return normalizeSessionUser(sessionUser);
    }
    try {
      const { data } = await api.get("/api/user/");
      const normalized = normalizeProfile(data);
      setProfile(normalized);
      if (normalized && process.env.NODE_ENV === "development") {
        console.info("[auth test] profile from API:", normalized);
      }
      return normalized;
    } catch (err) {
      console.error("[auth test] profile fetch failed:", err);
      setProfile(null);
      return null;
    }
  }, [sessionUser]);

  useEffect(() => {
    if (!useCaAuthProxy) return;
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

  const sessionOnlyUser = useMemo(
    () => normalizeSessionUser(sessionUser),
    [sessionUser],
  );

  const user = useCaAuthProxy && profile ? { ...sessionOnlyUser, ...profile } : sessionOnlyUser;
  const isLoggedIn = useCaAuthProxy
    ? !!sessionUser && !!profile
    : !!sessionUser;
  const authLoading = sessionPending || (useCaAuthProxy && profileLoading);

  const loginWithGoogle = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_API && !process.env.NEXT_PUBLIC_AUTH_PROXY_URL) {
      toast.error("Set NEXT_PUBLIC_API or NEXT_PUBLIC_AUTH_PROXY_URL in .env.local");
      return;
    }

    try {
      const payload = {
        provider: "google",
        callbackURL: getGoogleCallbackURL(),
      };
      const role = process.env.NEXT_PUBLIC_OAUTH_ROLE;
      if (role) {
        payload.additionalData = { role };
      }

      const { error } = await signIn.social(payload);
      if (error) {
        throw new Error(
          error.message ||
            (typeof error === "object" && "code" in error
              ? String(error.code)
              : "Google sign-in failed"),
        );
      }
    } catch (err) {
      console.error("Failed to start Google sign-in:", err);
      toast.error(
        err?.message ||
          "Could not start Google sign-in. Check env and that ca-frontend proxy is deployed.",
      );
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
