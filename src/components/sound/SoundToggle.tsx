"use client";

import { useSoundManager } from "@/contexts/SoundContext";
import { GameTypeCode } from "@/types/rooms";
import { Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";

export default function SoundToggle() {
  const { isMuted, setIsMuted, volume, playBGM } = useSoundManager();
  const pathname = usePathname();

  const handleToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    // 음소거 해제 시점에 소리가 안 나고 있다면 재생 명령
    if (!newMuted) {
      // 현재 페이지 경로를 보고 적절한 BGM 재생 (게임 페이지라면 해당 게임 BGM)
      // 간단하게는 playBGM 호출 시 내부 로직이 처리하도록 합니다.
      const gameType = pathname.split('/')[2] as GameTypeCode;
      playBGM(gameType); 
    }
  };

  return (
    <button
      onClick={handleToggle}
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