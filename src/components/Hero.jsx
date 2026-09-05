"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BellDot } from "lucide-react";
import LetterGlitch from "@/components/LetterGlitch";

export default function Hero({ refs }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const router = useRouter();

  const handleScroll = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const jwt = localStorage.getItem("jwt") || localStorage.getItem("token");
    setIsLoggedIn(!!jwt);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = new Date("2025-10-18T18:00:00").getTime();
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGoogleSignIn = () => {
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "783776933631-jdor6jdgf8qvmmbbj4hrtt9con1no8ue.apps.googleusercontent.com";
    const redirectUri =
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_API || "http://localhost:5000"}/api/auth/callback`;
    const url = `https://accounts.google.com/o/oauth2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20email%20profile&prompt=consent`;
    window.location.href = url;
  };

  const handleVisitDashboard = () => {
    router.push("/profile");
  };

  const CountdownBox = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div>
        <p className="text-2xl sm:text-3xl md:text-6xl font-bold text-white monocraft">
          {String(value).padStart(2, "0")}
        </p>
      </div>
      <p className="text-xs sm:text-sm md:text-base font-semibold mt-1 text-white">
        {label}
      </p>
    </div>
  );

  return (
    <header
      className="relative w-screen min-h-screen flex items-center justify-center text-white flex-col overflow-hidden"
      style={{ fontFamily: "PPFragment, sans-serif" }}
    >
      <div className="absolute inset-0 z-0">
        <LetterGlitch centerVignette  />
      </div>
      <Image
        src="/images/TATHVA25_LOGO_BLACK.png"
        alt="Tathva Logo"
        width={150}
        height={150}
        className="absolute top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-10 invert"
      />
      <div className="absolute top-20 right-10 max-[639px]:top-4 max-[639px]:right-3 z-50 group">
        <Link className="p-3" href="/announcements">
          <BellDot size={24} className="text-white" />
        </Link>
      </div>
      
      {/* Countdown Timer */}
      <div className="flex flex-col items-center z-10 pt-20 md:pt-8">
        <p className="text-xs md:text-base font-bold mb-3 md:mb-4 text-white uppercase tracking-wide">
          Website Launching IN
        </p>
        <div className="flex gap-1 md:gap-6 justify-center items-center px-2">
          <CountdownBox value={countdown.days}  />
          <div className="flex items-center text-lg md:text-5xl font-bold text-white">
            :
          </div>
          <CountdownBox value={countdown.hours} />
          <div className="flex items-center text-lg md:text-5xl font-bold text-white">
            :
          </div>
          <CountdownBox value={countdown.minutes} />
          <div className="flex items-center text-lg md:text-5xl font-bold text-white">
            :
          </div>
          <CountdownBox value={countdown.seconds} />
        </div>
      </div>

      <div className="flex z-10 flex-col items-center mt-8 md:mt-16 px-4">
        <p className="self-center text-lg md:text-2xl xl:text-3xl">2025</p>
        <h1 className="relative text-5xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[12rem] tracking-widest monocraft text-center">
          TATHVA
        </h1>
        <p className="text-lg md:text-2xl xl:text-3xl mt-2">OCT 24, 25, 26</p>
      </div>

      <div className="flex items-center flex-col gap-6 mt-8 md:mt-12 w-full px-4">
        <div className="flex lg:flex-row flex-col w-full justify-center items-center z-[10] gap-4 lg:gap-8 2xl:gap-12 text-base md:text-xl xl:text-2xl">
          <Link
            href="/workshops"
            className="px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110"
          >
            WORKSHOPS
          </Link>
          <Link
            href="/competitions"
            className="px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110"
          >
            COMPETITIONS
          </Link>

                   <Link
            href="/passes"
            className="px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110"
          >
            PASSES
          </Link>

      <Link
            href="/lectures"
            className="px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110"
          >
            LECTURES
               </Link>
    
          {/* <button
            onClick={() => handleScroll(refs.contact)}
            className="hover:transition-all duration-300 hover:scale-110"
          >
            CONTACT
          </button> */}
<Link
            href="/accomodation"
            className="px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110"
          >
            ACCOMODATION
          </Link>
          <Link
            href="/announcements"
            className="px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110"
          >
            ANNOUNCEMENTS
          </Link>
        </div>

        {isLoggedIn ? (
            <button
    onClick={handleVisitDashboard}
    className="z-10 flex items-center gap-3
      bg-black/[0.08]
      backdrop-blur-xl
      border border-white/40
      text-white
      font-semibold
      py-3 px-6
      rounded-md
      transition-all duration-300
      hover:bg-black/[0.20]
      hover:scale-105
      group
      mt-4 md:mt-6"
  >
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>

    <span className="monocraft">Visit Dashboard</span>
  </button>
        ) : (
          <button
            onClick={handleGoogleSignIn}
            className="font-mono z-10 flex items-center gap-3 bg-white hover:border-gray-700 text-gray-700 font-semibold py-3 px-6 rounded-full transition-all duration-300 border border-gray-300 group mt-4 md:mt-6"
          >
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-plus-jakarta">Sign in with Google</span>
          </button>
        )}
      </div>
    </header>
  );
}