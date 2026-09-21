"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy route. It used to take a JWT out of the URL path and stash it in
// localStorage. Auth is now an httpOnly cookie set by the backend, so there is
// nothing to capture here — this only redirects, and the file should be
// deleted once no old links point at it.
export default function LegacyProfileTokenRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return null;
}
