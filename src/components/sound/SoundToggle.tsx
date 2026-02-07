"use client";

import { useSoundManager } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";

export default function SoundToggle() {
  const { isMuted, setIsMuted, volume } = useSoundManager();

  return (
    <button
      onClick={() => setIsMuted(!isMuted)}
      className="p-2 rounded-lg hover:bg-slate-800 transition-colors group relative"
      aria-label={isMuted ? "음소거 해제" : "음소거"}
    >
      {isMuted || volume === 0 ? (
        <VolumeX className="text-slate-400 group-hover:text-white" size={22} />
      ) : (
        <Volume2 className="text-blue-400 group-hover:text-blue-300" size={22} />
      )}
      
      {/* 툴팁 (옵션) */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-800 pointer-events-none">
        {isMuted ? "Sound Off" : `Volume ${Math.round(volume * 100)}%`}
      </span>
    </button>
  );
}