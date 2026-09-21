"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SectionCard from "@/components/SectionCard";
import { formatPrice } from "@/lib/events";

export default function CompetitionTabs({ tathvaEvents, preTathvaEvents }) {
  const [activeTab, setActiveTab] = useState("tathva");
  const [animKey, setAnimKey] = useState(0);

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setAnimKey((prev) => prev + 1); // triggers re-mount for cross-fade
  };

  return (
    <div className="mx-auto">
      {/* Tab Navigation — Capsule Pill Slider */}
      <div className="relative w-full max-w-md mx-auto mb-8">
        <div className="relative flex bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1">
          {/* Sliding capsule indicator */}
          <div
            className="absolute top-1 bottom-1 rounded-full bg-white/10 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              width: "calc(50% - 4px)",
              left: activeTab === "tathva" ? "4px" : "calc(50% + 0px)",
            }}
          />

          <button
            onClick={() => handleTabSwitch("tathva")}
            className={`relative z-10 w-1/2 py-3 text-center pp-fragment font-medium tracking-widest uppercase text-sm transition-colors duration-300 focus:outline-none rounded-full ${
              activeTab === "tathva" ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Tathva &apos;25
          </button>

          <button
            onClick={() => handleTabSwitch("pretathva")}
            className={`relative z-10 w-1/2 py-3 text-center pp-fragment font-medium tracking-widest uppercase text-sm transition-colors duration-300 focus:outline-none rounded-full ${
              activeTab === "pretathva" ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Pre-Tathva
          </button>
        </div>
      </div>

      {/* Tab Content with cross-fade */}
      <div key={animKey} className="tab-enter">
        {activeTab === "tathva" && (
          <div id="tathva-content">
            {tathvaEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
                {tathvaEvents.map((event) => (
                  <Link href={`competitions/${event.id}`} key={event.id} className="comp-card">
                    <SectionCard
                      image={event.picture || "/images/events.jpg"}
                      title={event.heading || "Untitled Event"}
                      description={event.description || "No description available."}
                      price={event.price}
                      date={event.date}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">
                No Tathva &apos;25 competitions match your search.
              </p>
            )}
          </div>
        )}

        {activeTab === "pretathva" && (
          <div id="pretathva-content">
            {preTathvaEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
                {preTathvaEvents.map((event) => (
                  <Link href={`competitions/${event.id}`} key={event.id} className="comp-card">
                    <SectionCard
                      image={event.picture || "/images/events.jpg"}
                      title={event.heading || "Untitled Event"}
                      description={event.description || "No description available."}
                      price={event.price}
                      date={event.date}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">
                No Pre-Tathva competitions match your search.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}