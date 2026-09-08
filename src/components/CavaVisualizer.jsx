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

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        // CAVA terminal aesthetic: vibrant cyan
        ctx.fillStyle = `rgb(0, ${Math.floor(barHeight + 100)}, 255)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
    };
    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, lowPowerMode]);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-4 rounded-full bg-zinc-900/80 p-2 pr-6 backdrop-blur-md border border-zinc-800 shadow-xl">
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
  );
}
