"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jwtRequired from "@/axios/jwtRequired";
import Link from "next/link"; // Import Link for navigation
import ProfileClient from "@/components/Profile_Page_Components/ProfileClient";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const tokenFromQuery = new URLSearchParams(window.location.search).get(
      "token"
    );

    if (tokenFromQuery) {
      localStorage.setItem("jwt", tokenFromQuery);
      window.history.replaceState({}, "", "/profile");
    }

    const token = localStorage.getItem("jwt");

    if (!token) {
      console.error("Login to access profile");
      router.push("/");
      setLoading(false);
      return;
    }

     const fetchUser = async () => {
      try {
        const res = await jwtRequired.get("/api/users");

        const userRaw = res.data;

        const formattedUser = {
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
        };

        setUser(formattedUser);
      } catch (err) {
        console.error("Error fetching user:", err.message);
        toast.error(err.message || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };


    fetchUser();
  }, [router]);

  if (loading) {
    return   <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-black rounded-full border-t-transparent absolute top-0 left-0 animate-spin"></div>
      </div>
    </div>;
  }
  
  const PageContainer = ({ children }) => (
    <div className="" >
      <Link href="/" className="absolute top-5 left-10 z-20" style={{ textDecoration: 'none', color: 'inherit', marginBottom: '1.5rem', display: 'inline-block' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          &larr;  Home
        </span>
      </Link>
          
      {children}
    </div>
  );

  if (!user) {
    return (
      <div></div>
    );
  }

  return (
    <PageContainer>
      <ProfileClient user={user} />
    </PageContainer>
  );
}