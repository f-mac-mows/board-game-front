"use client";

import { useSoundManager } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react"; // 아이콘 라이브러리 (설치 필요: npm install lucide-react)

export default function SettingPage() {
  const { isMuted, setIsMuted, volume, setVolume } = useSoundManager();

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
            onClick={() => setIsMuted(!isMuted)}
            className={`group relative w-16 h-8 rounded-full transition-all duration-300 ${
              isMuted ? "bg-slate-700" : "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${
                isMuted ? "left-1" : "left-9"
              }`}
            />
          </button>
        </div>

        {/* 볼륨 조절 슬라이더 */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              {isMuted || volume === 0 ? (
                <VolumeX className="text-slate-500" size={20} />
              ) : (
                <Volume2 className="text-blue-400" size={20} />
              )}
              <h2 className="text-lg font-bold">볼륨 설정</h2>
            </div>
            <span className={`font-mono text-sm ${isMuted ? "text-slate-600" : "text-blue-400"}`}>
              {Math.round(volume * 100)}%
            </span>
          </div>

          <div className="relative group">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              disabled={isMuted}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            />
            {/* 슬라이더 배경 바 (커스텀 디자인용 옵션) */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-blue-500 rounded-l-lg pointer-events-none transition-all"
              style={{ width: `${volume * 100}%`, display: isMuted ? 'none' : 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}