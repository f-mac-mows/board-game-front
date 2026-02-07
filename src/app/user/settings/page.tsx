"use client";

import { useSoundManager } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingPage() {
  const { isMuted, setIsMuted, volume, setVolume, playDice } = useSoundManager();
  const [localVolume, setLocalVolume] = useState(volume);

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setLocalVolume(v); // UI는 즉시 반영
  };

  const handleVolumeCommit = () => {
    setVolume(localVolume); // 마우스를 뗄 때 비로소 Context 상태 업데이트 (서버 저장 트리거)
    if (!isMuted) {
      playDice(); // 볼륨 확인용 효과음
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8 border-b border-slate-800 pb-4">
        Settings
      </h1>

      <div className="space-y-10 bg-slate-900/40 p-8 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        {/* 음소거 설정 */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">마스터 음소거</h2>
            <p className="text-sm text-slate-400">모든 게임 사운드를 일시적으로 끕니다.</p>
          </div>
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (isMuted) playDice(); // 음소거 해제 시 소리 출력
            }}
            className={`group relative w-16 h-8 rounded-full transition-all duration-300 ${
              isMuted ? "bg-slate-700" : "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${isMuted ? "left-1" : "left-9"}`} />
          </button>
        </div>

        {/* 볼륨 설정 */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              {isMuted || localVolume === 0 ? <VolumeX className="text-slate-500" /> : <Volume2 className="text-blue-400" />}
              <h2 className="text-lg font-bold">볼륨 설정</h2>
            </div>
            <span className={`font-mono text-sm ${isMuted ? "text-slate-600" : "text-blue-400"}`}>
              {Math.round(localVolume * 100)}%
            </span>
          </div>

          <div className="relative flex items-center h-6">
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                disabled={isMuted}
                value={localVolume}
                onChange={handleVolumeChange} // 움직일 땐 UI만
                onMouseUp={handleVolumeCommit} // 뗄 때 실제 데이터 저장 및 소리 재생
                className="absolute w-full z-10 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            {/* 커스텀 슬라이더 트랙 */}
            <div className="relative w-full h-2 bg-slate-800 rounded-lg overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-75"
                style={{ width: `${localVolume * 100}%`, opacity: isMuted ? 0.3 : 1 }}
              />
            </div>
            {/* 커스텀 슬라이더 핸들(Thumb) 대용 - 시각적 요소 */}
            <div 
              className="absolute w-5 h-5 bg-white rounded-full shadow-lg pointer-events-none transition-all duration-75"
              style={{ left: `calc(${localVolume * 100}% - 10px)`, opacity: isMuted ? 0.5 : 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}