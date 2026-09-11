"use client";
import { useEffect, useRef, useState } from "react";
import { usePerformance } from "@/context/PerformanceContext";
import { Play, Square } from "lucide-react";
import { playHoverSound } from "@/lib/soundEngine";

export default function CavaVisualizer() {
  const { lowPowerMode } = usePerformance();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyzerRef = useRef(null);
  const rafRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      analyzerRef.current = audioCtxRef.current.createAnalyser();
      analyzerRef.current.fftSize = 64;
      const source = audioCtxRef.current.createMediaElementSource(audioRef.current);
      source.connect(analyzerRef.current);
      analyzerRef.current.connect(audioCtxRef.current.destination);
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Catch the error if the source file is missing or blocked
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio playback failed. Make sure 'bgm.mp3' exists in the public/ folder.", err);
        setIsPlaying(false);
      });
    }
  };

  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    if (isPlaying) {
      setShowTooltip(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleInteraction = () => {
      setShowTooltip(false);
    };

    if (showTooltip) {
      document.addEventListener("click", handleInteraction);
      document.addEventListener("touchstart", handleInteraction);
    }

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [showTooltip]);

  useEffect(() => {
    if (lowPowerMode || !isPlaying || !analyzerRef.current) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);
      window.globalAudioData = dataArray;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        // CAVA terminal aesthetic: vibrant cyan
        ctx.fillStyle = `rgba(0, 255, 255, ${0.3 + (barHeight / canvas.height)})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
    };
    draw();

    return () => {
      window.globalAudioData = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, lowPowerMode]);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4">
      {/* Tooltip Friction */}
      {showTooltip && (
        <div className="ml-2 animate-bounce flex flex-col gap-1.5 rounded-xl bg-zinc-900/95 p-4 text-sm text-zinc-400 backdrop-blur-md border border-zinc-700 shadow-2xl relative">
          <button onClick={() => setShowTooltip(false)} className="absolute top-2 right-2 text-zinc-500 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <p className="font-medium text-white pr-6">🎵 Need some atmosphere?</p>
          <p>Hit the play button below.</p>
          <p className="mt-1 hidden sm:block">
            Navigate instantly: Press <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-white font-mono text-xs border border-zinc-600">Ctrl+K</kbd>
          </p>
          {/* Tooltip Triangle */}
          <div className="absolute -bottom-2 left-6 w-4 h-4 bg-zinc-900/95 border-b border-r border-zinc-700 rotate-45"></div>
        </div>
      )}

      {/* Music Player */}
      <div className="flex items-center gap-4 rounded-full bg-zinc-900/80 p-2 pr-6 backdrop-blur-md border border-zinc-800 shadow-xl">
        <button
          onClick={togglePlay}
          onMouseEnter={playHoverSound}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-white transition-all hover:bg-cyan-500 hover:text-black"
        >
          {isPlaying ? <Square size={16} /> : <Play className="ml-1" size={16} />}
        </button>
        <canvas ref={canvasRef} width={100} height={30} className="opacity-80" />
        <audio ref={audioRef} src="/bgm.mp3" loop />
      </div>
    </div>
  );
}
