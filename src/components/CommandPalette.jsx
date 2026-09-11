"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePerformance } from "@/context/PerformanceContext";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { lowPowerMode, setLowPowerMode } = usePerformance();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const commands = [
    { name: "Home", action: () => router.push("/") },
    { name: "Competitions", action: () => router.push("/competitions") },
    { name: "Workshops", action: () => router.push("/workshops") },
    { name: "Lectures", action: () => router.push("/lectures") },
    { name: "Passes", action: () => router.push("/passes") },
    { name: "Accomodation", action: () => router.push("/accomodation") },
    { name: "Announcements", action: () => router.push("/announcements") },
    { name: "Profile", action: () => router.push("/profile") },
    { name: "Toggle Low Power Mode", action: () => setLowPowerMode(!lowPowerMode) },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (listRef.current && filteredCommands.length > 0) {
      const activeElement = listRef.current.children[selectedIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, filteredCommands.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredCommands.length > 0) {
      filteredCommands[selectedIndex].action();
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-[15vh]">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <input
          ref={inputRef}
          type="text"
          className="bg-transparent text-white text-2xl p-6 outline-none w-full placeholder-zinc-500 border-b border-zinc-800"
          placeholder="Search commands..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="max-h-96 overflow-y-auto p-4 flex flex-col gap-2" ref={listRef}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, i) => (
              <button
                key={i}
                className={`w-full text-left p-4 text-white rounded-lg transition-colors duration-200 ${
                  i === selectedIndex ? "bg-zinc-800" : "hover:bg-zinc-800"
                }`}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => {
                  cmd.action();
                  setIsOpen(false);
                }}
              >
                {cmd.name}
              </button>
            ))
          ) : (
            <p className="text-zinc-500 p-4 text-center">No commands found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
