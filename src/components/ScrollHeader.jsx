"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BellDot, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import { CDN_BASE_URL } from "@/lib/cdn";

export default function ScrollHeader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only the landing page hides the header at the top — its hero is meant to
    // be seen uninterrupted. Everywhere else the header is part of the page and
    // shows straight away, so there is nothing to listen for.
    if (pathname !== '/') {
      setIsVisible(true);
      return;
    }

    // Past the hero.
    const threshold = 300;

    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsMobileMenuOpen(false); // Close menu if scrolling back to top
      }
    };

    handleScroll(); // Trigger immediately on mount/path change
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    // Content can load in after mount and change the page height
    const timeout = setTimeout(handleScroll, 600);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      clearTimeout(timeout);
    };
  }, [pathname]);

  return (
    <>
      <div 
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="pointer-events-none mx-auto w-full max-w-7xl px-4 py-4 sm:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <div className="pointer-events-auto flex-shrink-0 bg-black/40 p-2 px-4 rounded-full backdrop-blur-md border border-white/10 shadow-lg cursor-pointer transition-transform hover:scale-105" onClick={() => {
              if (window.location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                  router.push('/');
              }
          }}>
            <Image
              src={`${CDN_BASE_URL}/images/TATHVA25_LOGO_BLACK.png`}
              alt="Tathva Logo"
              width={100}
              height={100}
              className="invert"
            />
          </div>

          {/* Desktop Nav */}
          <div className="pointer-events-auto hidden md:flex items-center gap-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 shadow-lg">
            {["Workshops", "Competitions", "Passes", "Lectures", "Accomodation"].map((item) => (
              <Link 
                key={item} 
                href={`/${item.toLowerCase()}`}
                className="text-white/80 hover:text-white text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle / Notification */}
          <div className="pointer-events-auto flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 shadow-lg">
            <Link className="p-2" href="/announcements">
              <BellDot size={20} className="text-white hover:text-cyan-400 transition-colors" />
            </Link>
            <div className="hidden md:flex items-center border-l border-white/10 pl-1">
              <AuthButton />
            </div>
            <button
              className="md:hidden flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg text-white hover:text-cyan-400 transition-colors"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`fixed top-20 left-4 right-4 z-[90] md:hidden transition-all duration-300 ease-in-out ${
          (isVisible && isMobileMenuOpen) ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-2 rounded-xl bg-zinc-900/90 p-4 backdrop-blur-xl border border-zinc-700 shadow-2xl">
          {["Workshops", "Competitions", "Passes", "Lectures", "Accomodation"].map((item) => (
            <Link 
              key={item}
              href={`/${item.toLowerCase()}`} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="w-full text-center py-3 bg-white/5 rounded-md border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
            >
              {item.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
