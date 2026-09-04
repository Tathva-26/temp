"use client";

import React, { useState } from "react";
import Link from "next/link";
import SectionCard from "@/components/SectionCard";

export default function CompetitionTabs({ tathvaEvents, preTathvaEvents }) {
  const [activeTab, setActiveTab] = useState("tathva");

  // Styles for the tab buttons
  const tabButtonBaseStyle =
    "w-full py-3 text-center font-semibold tracking-wide uppercase text-sm sm:text-base transition-colors duration-300 focus:outline-none";
  const activeTabTextStyle = "text-gray-900";
  const inactiveTabTextStyle = "text-gray-400 hover:text-gray-600";

  return (
    <div className="mx-auto">
      {/* Tab Navigation Container */}
      <div className="relative w-full max-w-md mx-auto mb-12 border-b-2 border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("tathva")}
            className={`${tabButtonBaseStyle} ${
              activeTab === "tathva" ? activeTabTextStyle : inactiveTabTextStyle
            }`}
          >
            Tathva '25
          </button>
          <button
            onClick={() => setActiveTab("pretathva")}
            className={`${tabButtonBaseStyle} ${
              activeTab === "pretathva"
                ? activeTabTextStyle
                : inactiveTabTextStyle
            }`}
          >
            Pre-Tathva
          </button>
        </div>
        <div
          className="absolute bottom-[-2px] h-0.5 bg-gray-900 transition-all duration-300 ease-in-out"
          style={{
            width: "50%",
            transform:
              activeTab === "tathva" ? "translateX(0%)" : "translateX(100%)",
          }}
        />
      </div>

      {/* Conditional Content Display */}
      <div>
        {/* Renders when 'Tathva '25' tab is active */}
        {activeTab === "tathva" && (
          <div id="tathva-content">
            {tathvaEvents.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {tathvaEvents.map((event) => (
                  <Link href={`competitions/${event.id}`} key={event.id}>
                    <SectionCard
                      image={event.picture || "/images/events.jpg"}
                      title={event.heading || "Untitled Event"}
                      description={
                        event.description || "No description available."
                      }
                      price={event.price}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No Tathva '25 competitions match your search.
              </p>
            )}
          </div>
        )}

        {/* Renders when 'Pre-Tathva' tab is active */}
        {activeTab === "pretathva" && (
          <div id="pretathva-content">
            {preTathvaEvents.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {preTathvaEvents.map((event) => (
                  <Link href={`competitions/${event.id}`} key={event.id}>
                    <SectionCard
                      image={event.picture || "/images/events.jpg"}
                      title={event.heading || "Untitled Event"}
                      description={
                        event.description || "No description available."
                      }
                      price={event.price}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No Pre-Tathva competitions match your search.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}