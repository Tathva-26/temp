"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const token = params?.id;

    if (token) {
      const existingToken = localStorage.getItem("jwt");
      if (!existingToken) {
        localStorage.setItem("jwt", token);
      }

      router.replace("/");
    }
  }, [params, router]);

  return <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-black rounded-full border-t-transparent absolute top-0 left-0 animate-spin"></div>
      </div>
    </div>;
}
