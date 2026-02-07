"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import useSound from 'use-sound';
import { GameTypeCode } from "@/types/rooms";
import { GAME_BGM_MAP } from "@/types/sounds";
import { useUserStore } from '@/store/useUserStore';
import { userApi } from '@/api/user';
import { useDebounce } from '@/hooks/useDebounce';

interface SoundContextType {
  playBGM: (gameType: GameTypeCode) => void;
  stopBGM: () => void;
  playDice: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();
  const isFirstRender = useRef(true);

  // 1. 상태 정의 (순서: 상태 -> 사운드 정의 -> 효과(Effect))
  const [muted, setMutedState] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [currentBGM, setCurrentBGM] = useState<string>("/sounds/main-bgm.ogg");

  // 2. use-sound 정의 (여기서 stop을 미리 선언해야 아래 Effect에서 사용 가능)
  const [playDice] = useSound('/sounds/dice.ogg', { 
    volume: volume * 0.8,
    soundEnabled: !muted 
  });

  const [play, { stop }] = useSound(currentBGM, {
    volume: volume * 0.4,
    loop: true,
    soundEnabled: !muted,
    interrupt: true,
  });

  // 3. 로그아웃 감지 및 상태 초기화 (stop이 정의된 후에 위치해야 함)
  useEffect(() => {
    if (!user) {
      stop(); // BGM 중단
      setMutedState(false);
      setVolumeState(0.5);
      setCurrentBGM("/sounds/main-bgm.ogg");
      
      localStorage.removeItem('sound_muted');
      localStorage.removeItem('sound_volume');
      console.log("Logout: Sounds stopped.");
    }
  }, [user, stop]);

  // 4. 초기 데이터 로드 (DB -> LocalStorage)
  useEffect(() => {
    if (user) {
      userApi.getUserSetting()
        .then(({ data }) => {
          setMutedState(data.muted);
          setVolumeState(data.volume);
        })
        .catch(() => {
          const savedVol = localStorage.getItem('sound_volume');
          const savedMute = localStorage.getItem('sound_muted');
          if (savedVol) setVolumeState(parseFloat(savedVol));
          if (savedMute) setMutedState(savedMute === 'true');
        });
    }
  }, [user]);

  // 5. 서버 저장 로직 (Debounce)
  const debouncedSettings = useDebounce({ muted, volume }, 1000);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (user) {
      userApi.updateSettings(debouncedSettings)
        .catch((err) => console.error("❌ Sync failed", err));
    }
  }, [debouncedSettings, user]);

  // 6. 핸들러 함수들
  const setIsMuted = (value: boolean) => {
    setMutedState(value);
    localStorage.setItem('sound_muted', String(value));
  };

  const setVolume = (value: number) => {
    setVolumeState(value);
    localStorage.setItem('sound_volume', String(value));
  };

  const playBGM = (gameType: GameTypeCode) => {
    const path = GAME_BGM_MAP[gameType] || "/sounds/main-bgm.ogg";
    if (currentBGM !== path) {
      stop();
      setCurrentBGM(path);
    }
    play();
  };

  return (
    <SoundContext.Provider value={{ 
      playBGM, 
      stopBGM: stop, 
      playDice, 
      isMuted: muted,
      setIsMuted,
      volume,
      setVolume
    }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSoundManager = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error("SoundProvider 내에서 사용하세요!");
  return context;
};