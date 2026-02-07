"use client";

import { useSoundManager } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingPage() {
  const { isMuted, setIsMuted, volume, setVolume } = useSoundManager();
  
  // UI의 즉각적인 반응을 위한 로컬 상태
  const [localVolume, setLocalVolume] = useState(volume);

  // 외부(Context)에서 볼륨이 변경될 경우(서버 로드 등) 동기화
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setLocalVolume(v);
    
    // 슬라이더를 움직이는 동안 BGM 볼륨을 실시간으로 변경합니다.
    // SoundProvider의 디바운스 로직 덕분에 서버 부하 없이 소리만 즉시 변합니다.
    setVolume(v);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8 border-b border-slate-800 pb-4">
        Settings
      </h1>

      <div className="space-y-10 bg-slate-900/40 p-8 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        
        {/* 1. 마스터 음소거 설정 */}
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

        {/* 2. 볼륨 조절 섹션 */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              {isMuted || localVolume === 0 ? (
                <VolumeX className="text-slate-500" size={20} />
              ) : (
                <Volume2 className="text-blue-400" size={20} />
              )}
              <h2 className="text-lg font-bold">볼륨 설정</h2>
            </div>
            <span className={`font-mono text-sm ${isMuted ? "text-slate-600" : "text-blue-400"}`}>
              {Math.round(localVolume * 100)}%
            </span>
          </div>

          <div className="relative flex items-center h-6 group">
            {/* 실제 입력을 받는 투명 슬라이더 */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              disabled={isMuted}
              value={localVolume}
              onChange={handleVolumeChange}
              className="absolute w-full z-10 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            
            {/* 디자인용 커스텀 트랙 배경 */}
            <div className="relative w-full h-2 bg-slate-800 rounded-lg overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-75"
                style={{ 
                    width: `${localVolume * 100}%`, 
                    opacity: isMuted ? 0.3 : 1 
                }}
              />
            </div>
            
            {/* 디자인용 커스텀 핸들(Thumb) */}
            <div 
              className="absolute w-5 h-5 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none transition-all duration-75"
              style={{ 
                left: `calc(${localVolume * 100}% - 10px)`, 
                opacity: isMuted ? 0.5 : 1,
                transform: isMuted ? 'scale(0.9)' : 'scale(1)'
              }}
            />
          </div>
          
          <p className="text-xs text-slate-500 italic text-center">
            슬라이더를 움직이면 현재 배경음악 볼륨이 즉시 변경됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}