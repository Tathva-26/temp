"use client";
import ContactPage from "@/components/Contact";
import Hero from "@/components/Hero";
import Gallery from "@/components/Galleryv2";
import MinimalSections from "@/components/Explore";
import Footer from "@/components/Footer";
import { useRef } from "react";

export default function Home() {
  // ✅ Create refs for each section you want to scroll to
  const galleryRef = useRef(null);
  const contactRef = useRef (null);

  return (
    <div className="">
      {/* ✅ Pass the refs to the Hero component */}
      <Hero refs={{ gallery: galleryRef, contact: contactRef }} />

      {/* ✅ Pass the specific ref to each target component lol */}
      <MinimalSections />
      <Gallery ref={galleryRef} />
      <ContactPage ref={contactRef} />
      
      {/* Footer can also receive refs if needed */}
      <Footer refs={{ gallery: galleryRef, contact: contactRef }} />
    </div>
  );
}