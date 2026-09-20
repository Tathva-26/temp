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
import { captureReferralCode } from "@/lib/referral";

const UserContext = createContext(null);

// The backend (better-auth) owns the session in an httpOnly cookie.
// This client only talks to it: `useSession` probes the session,
// `signIn.social` starts Google OAuth, `signOut` clears it. No token is ever
// visible here — not in state, storage, or URLs.
const { signIn, signOut, useSession } = createAuthClient({
  baseURL: getBackendURL(),
});

/**
 * `GET /api/user/` answers with the user object at the top level — no wrapper
 * — carrying exactly: id, email, name, phone, referralCode, college, district,
 * state, role, branch, semester, year, picture. `picture` is null until the
 * user uploads one, so the avatar falls back to the Google image on the session.
 */
function normalizeProfile(data) {
  if (!data || (!data.id && !data.email)) return null;
  return {
    /*
     * A phone number is what the booking endpoint actually requires, so it is
     * tracked on its own: without one, POST /api/booking/create 400s before
     * TIQR is ever called.
     */
    hasPhone: !!data.phone,
    // The same completeness gate the backend applies before a CA gets a code.
    isComplete: !!(
      data.phone &&
      data.college &&
      data.district &&
      data.state &&
      data.branch &&
      data.semester &&
      data.year
    ),
    id: data.id,
    name: data.name,
    email: data.email || "",
    phone: data.phone || "",
    college: data.college || "",
    district: data.district || "",
    state: data.state || "",
    branch: data.branch || "",
    semester: data.semester ?? "",
    year: data.year ?? "",
    role: data.role,
    // CA only, and only once TIQR has issued it. Null for everyone else.
    referralCode: data.referralCode || "",
    picture: data.picture ?? data.image ?? null,
  };
}


export default function UserContextWrapper({ children }) {
  const { data: sessionData, isPending: sessionPending } = useSession();

  // A CA's link lands on any page with ?referral_code=…; grab it before the
  // visitor navigates away, so it is still around at checkout.
  useEffect(() => {
    captureReferralCode();
  }, []);

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
        profile.picture || sessionUser?.image || "/pfp_dev/userFile.webp",
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
