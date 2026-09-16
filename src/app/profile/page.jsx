"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jwtRequired from "@/axios/jwtRequired";
import Link from "next/link";
import ProfileClient from "@/components/Profile_Page_Components/ProfileClient";

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

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!backendEnabled) {
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }

    const tokenFromQuery = new URLSearchParams(window.location.search).get(
      "token",
    );

    if (tokenFromQuery) {
      localStorage.setItem("jwt", tokenFromQuery);
      window.history.replaceState({}, "", "/profile");
    }

    const token = localStorage.getItem("jwt");

    if (!token) {
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await jwtRequired.get("/api/users");

        const userRaw = res.data;

        const formattedUser = {
          ...userRaw,
          id: userRaw.id,
          name: userRaw.name,
          tat_id: userRaw.referral,
          phone_number: userRaw.phone,
          college: userRaw.college,
          district: userRaw.district,
          picture: userRaw.picture ?? "/pfp_dev/userFile.webp",
          referredById: userRaw.referredById,
          referredByName: userRaw.referredByName,
          events: userRaw.events ?? [],
          is_ca: Boolean(
            userRaw.is_ca ??
            userRaw.isCa ??
            userRaw.isCA ??
            userRaw.ca ??
            (userRaw.role === "ca" || userRaw.role === "CA")
          ),
        };

        setUser(formattedUser);
      } catch (err) {
        console.error("Error fetching user:", err.message);
        setUser(MOCK_USER);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-white/10 rounded-full"></div>
          <div className="w-16 h-16 border-2 border-white rounded-full border-t-transparent absolute top-0 left-0 animate-spin"></div>
        </div>
      </div>
    );
  }

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

  return (
    <PageContainer>
      <ProfileClient user={user || MOCK_USER} />
    </PageContainer>
  );
}
