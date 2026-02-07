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

  const [muted, setMutedState] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [currentBGM, setCurrentBGM] = useState<string>("/sounds/main-bgm.ogg");

  // 1. use-sound 정의 (sound 객체를 꺼내서 상태 확인용으로 사용)
  const [playDice] = useSound('/sounds/dice.ogg', { 
    volume: volume * 0.8,
    soundEnabled: !muted 
  });

  const [play, { stop, sound }] = useSound(currentBGM, {
    volume: volume * 0.4,
    loop: true,
    soundEnabled: !muted,
    interrupt: true,
  });

  // 2. [자동 재생 로직] 로그인된 상태에서 소리가 안 나고 있다면 재생 시도
  useEffect(() => {
    if (user && sound && !muted && !sound.playing()) {
      play();
    }
  }, [user, sound, muted, play]);

  // 3. [브라우저 잠금 해제] 로그인 후 첫 클릭 시 오디오 차단 해제
  useEffect(() => {
    const handleFirstClick = () => {
      if (user && sound && !sound.playing() && !muted) {
        play();
      }
      window.removeEventListener('click', handleFirstClick);
    };

    if (user) {
      window.addEventListener('click', handleFirstClick);
    }
    return () => window.removeEventListener('click', handleFirstClick);
  }, [user, sound, muted, play]);

  // 4. 로그아웃 처리
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

  // 5. 초기 데이터 로드 (DB -> LocalStorage)
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

  // 6. 서버 저장 로직 (Debounce)
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

  // 7. 핸들러 함수들
  const setIsMuted = (value: boolean) => {
    setMutedState(value);
    localStorage.setItem('sound_muted', String(value));
    if (!value) play(); // 음소거 해제 시 즉시 재생 시도
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
      // path 변경 후 play()는 위쪽 useEffect가 sound 로드를 감지하고 처리함
    }
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