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

  // 1. 상태 정의 (초기값은 로컬 스토리지에서 먼저 읽어옴)
  const [isMuted, setMutedState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sound_muted') === 'true';
    }
    return false;
  });
  
  const [volume, setVolumeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sound_volume');
      return saved ? parseFloat(saved) : 0.5;
    }
    return 0.5;
  });

  const [currentBGM, setCurrentBGM] = useState<string>("/sounds/main-bgm.ogg");

  // 2. 사운드 정의
  const [playDice] = useSound('/sounds/dice.ogg', { 
    volume: volume * 0.8,
    soundEnabled: !isMuted 
  });

  const [play, { stop, sound }] = useSound(currentBGM, {
    volume: volume * 0.4,
    loop: true,
    soundEnabled: !isMuted,
    interrupt: true,
  });

  // 3. [자동 동기화 및 재생] 유저 로그인 시 서버 설정 불러오기
  useEffect(() => {
    if (user) {
      userApi.getUserSetting()
        .then(({ data }) => {
          setMutedState(data.isMuted);
          setVolumeState(data.volume);
          // 서버에서 온 값을 로컬 스토리지에도 즉시 저장 (새로고침 시 유지용)
          localStorage.setItem('sound_isMuted', String(data.isMuted));
          localStorage.setItem('sound_volume', String(data.volume));
        })
        .catch((err) => console.error("설정 로드 실패:", err));
    }
  }, [user]);

  // 4. [자동 재생] BGM 로드 완료 시 재생 시도
  useEffect(() => {
    if (user && sound && !isMuted && !sound.playing()) {
      play();
    }
  }, [user, sound, isMuted, play]);

  // 5. [브라우저 잠금 해제] 첫 상호작용 시 오디오 잠금 해제
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (user && sound && !sound.playing() && !isMuted) {
        play();
      }
      window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, [user, sound, isMuted, play]);

  // 6. 서버 저장 로직 (디바운스 활용)
  const debouncedSettings = useDebounce({ isMuted, volume }, 1000);

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

  // 7. 로그아웃 처리
  useEffect(() => {
    if (!user) {
      stop();
      setMutedState(false);
      setVolumeState(0.5);
      setCurrentBGM("/sounds/main-bgm.ogg");
      localStorage.removeItem('sound_muted');
      localStorage.removeItem('sound_volume');
    }
  }, [user, stop]);

  // 8. 핸들러 함수들
  const setIsMuted = (value: boolean) => {
    setMutedState(value);
    localStorage.setItem('sound_muted', String(value));
    if (!value) play(); // 음소거 해제 시 재생
    else stop();        // 음소거 시 즉시 정지
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
  };

  return (
    <SoundContext.Provider value={{ 
      playBGM, 
      stopBGM: stop, 
      playDice, 
      isMuted: isMuted,
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