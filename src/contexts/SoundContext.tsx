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
  setIsMuted: (isMuted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();
  const isFirstRender = useRef(true);
  
  // ✨ 무한 루프 방지: 마지막으로 서버 동기화에 성공한 값을 저장
  const lastSyncedSettings = useRef({ isMuted: false, volume: 0.5 });
  // ✨ 업데이트 중복 방지 락
  const isUpdating = useRef(false);

  // 1. 상태 정의 (초기값 로드)
  const [isMuted, setMutedState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sound_isMuted') === 'true';
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
  const [_playDice] = useSound('/sounds/dice.ogg', { 
    volume: volume * 0.8,
    soundEnabled: !isMuted 
  });

  const playDice = () => {
    if (isMuted) {
      return;
    }
    _playDice();
  };

  const [play, { stop, sound }] = useSound(currentBGM, {
    volume: volume * 0.4,
    loop: true,
    soundEnabled: !isMuted,
    interrupt: true,
    onload: () => {
      // 로드 완료 시 유저가 있고 재생 중이 아니면 실행
      if (user && !isMuted && sound && !sound.playing()) {
        play();
      }
    }
  });

  // 3. [최초 로드] 유저 로그인 시 서버 설정 불러오기
  useEffect(() => {
    if (user?.email) { // 객체 전체 대신 id를 감시하여 불필요한 트리거 방지
      userApi.getUserSetting()
        .then(({ data }) => {
          setMutedState(data.isMuted);
          setVolumeState(data.volume);
          lastSyncedSettings.current = { isMuted: data.isMuted, volume: data.volume };
          
          localStorage.setItem('sound_isMuted', String(data.isMuted));
          localStorage.setItem('sound_volume', String(data.volume));
        })
        .catch((err) => console.error("설정 로드 실패:", err));
    }
  }, [user?.email]);

  // 4. [재생 보장] BGM 객체나 유저 상태 변경 시 재생 시도
  useEffect(() => {
    if (user && sound && !isMuted && !sound.playing()) {
      play();
    }
  }, [user, sound, isMuted, play]);

  // 5. [브라우저 정책 대응] 첫 상호작용 시 잠금 해제
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

  // 6. ✨ 서버 저장 로직 (디바운스 + 비교 가드)
  const debouncedSettings = useDebounce({ isMuted, volume }, 1500);

  useEffect(() => {
    // 첫 렌더링 무시
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 유저가 없거나 이미 요청 중이면 중단
    if (!user || isUpdating.current) return;

    // ✨ 핵심: 실제 값이 변했는지 참조가 아닌 '값'으로 비교
    if (
      lastSyncedSettings.current.isMuted === debouncedSettings.isMuted &&
      lastSyncedSettings.current.volume === debouncedSettings.volume
    ) {
      return;
    }

    const syncSettings = async () => {
      isUpdating.current = true;
      try {
        await userApi.updateSettings(debouncedSettings);
        // 성공 시에만 동기화 기준점 업데이트
        lastSyncedSettings.current = { ...debouncedSettings };
      } catch (err) {
        // 502 에러 등이 발생해도 루프에 빠지지 않도록 로그만 출력
        console.error("❌ 서버 동기화 실패 (무한 루프 방지를 위해 요청 중단):", err);
      } finally {
        isUpdating.current = false;
      }
    };

    syncSettings();
  }, [debouncedSettings, user?.email]);

  // 7. 로그아웃 처리
  useEffect(() => {
    if (!user) {
      stop();
      setMutedState(false);
      setVolumeState(0.5);
      setCurrentBGM("/sounds/main-bgm.ogg");
      localStorage.removeItem('sound_isMuted');
      localStorage.removeItem('sound_volume');
      lastSyncedSettings.current = { isMuted: false, volume: 0.5 };
    }
  }, [user, stop]);

  // 8. 핸들러 함수들
  const setIsMuted = (value: boolean) => {
    setMutedState(value);
    localStorage.setItem('sound_isMuted', String(value));
    if (!value) play();
    else stop();
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
      isMuted,
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