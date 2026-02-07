// hooks/useGameSound.tsx
import useSound from 'use-sound';

export const useGameSound = (gameType: string) => {
  // 1. 효과음: Dice (주사위) - 즉시 재생용
  const [playDice] = useSound('/sounds/dice.ogg', { volume: 0.5 });

  // 2. 배경음악: 게임 타입에 따라 경로 설정
  // 예: yacht면 yacht-bgm.ogg, 기본은 main-bgm.ogg
  const bgmPath = gameType === 'yacht' ? '/sounds/yacht-bgm.ogg' : '/sounds/main-bgm.ogg';
  
  const [playBgm, { stop, pause }] = useSound(bgmPath, {
    volume: 0.3,
    loop: true,       // BGM은 무한 반복
    interrupt: true,  // 새로운 소리가 들어오면 이전 소리 중단
  });

  return { playDice, playBgm, stopBgm: stop, pauseBgm: pause };
};