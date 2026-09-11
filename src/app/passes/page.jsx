"use client";
import BackendStatus from "@/components/BackendStatus";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PassesComingSoon() {
  return (
    <BackendStatus
      title="PASSES COMING SOON"
      message="Pass details and pricing will be available soon."
    >
      <Link 
        href="/" 
        className="group flex items-center justify-center gap-3 px-8 py-4 border border-white/20 rounded-sm bg-transparent text-white/80 hover:bg-white hover:text-black transition-all duration-300 tracking-widest text-sm uppercase poppins"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform duration-300" />
        Return to Home
      </Link>
    </BackendStatus>
  );
}
