"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy route — kept only as a redirect so old links don't 404.
export default function LegacyOnboardingTokenRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return null;
}
