"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileClient from "@/components/Profile_Page_Components/ProfileClient";
import { useUserContext } from "@/context/UserContext";

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== "false";

const MOCK_USER = {
  id: "dev-user-001",
  name: "Dev User",
  tat_id: "TAT-2024-9999",
  phone_number: "9876543210",
  college: "National Institute of Technology Calicut",
  district: "Kozhikode",
  picture: "/pfp_dev/userFile.webp",
  referredById: null,
  referredByName: "",
  events: [],
  is_ca: false,
};

const PageContainer = ({ children }) => (
  <div className="">
    <Link
      href="/"
      className="absolute top-5 left-6 sm:left-10 z-20 group"
      style={{
        textDecoration: "none",
        color: "inherit",
        marginBottom: "1.5rem",
        display: "inline-block",
      }}
    >
      <span className="font-bold text-base sm:text-lg text-white/60 group-hover:text-white transition-colors duration-300 flex items-center gap-2">
        <span className="group-hover:-translate-x-1 transition-transform duration-300">&larr;</span>
        Home
      </span>
    </Link>

    {children}
  </div>
);

export default function ProfilePage() {
  const { user, isLoggedIn, authLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!backendEnabled) return;
    if (authLoading) return;
    if (!isLoggedIn) router.replace("/");
  }, [authLoading, isLoggedIn, router]);

  // Local UI development without a backend: skip auth and render mock data.
  if (!backendEnabled) {
    return (
      <PageContainer>
        <ProfileClient user={MOCK_USER} />
      </PageContainer>
    );
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-white/10 rounded-full"></div>
          <div className="w-16 h-16 border-2 border-white rounded-full border-t-transparent absolute top-0 left-0 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <PageContainer>
      <ProfileClient user={user} />
    </PageContainer>
  );
}
