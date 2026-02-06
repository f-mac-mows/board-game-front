// utils/sfx.ts
class SFXManager {
  private sounds: Record<string, HTMLAudioElement> = {};

  constructor() {
    // 클라이언트 사이드에서만 동작하도록 체크
    if (typeof window !== "undefined") {
      this.sounds = {
        button: new Audio("/sounds/button-click.mp3"),
        roll: new Audio("/sounds/dice-roll.mp3"),
        keep: new Audio("/sounds/keep-on.mp3"),
        unkeep: new Audio("/sounds/keep-off.mp3"),
        move: new Audio("/sounds/room-move.mp3"),
        win: new Audio("/sounds/game-win.mp3"),
      };

      // 주사위 굴리는 소리는 반복 재생이 필요할 수 있으므로 볼륨 조절
      this.sounds.roll.volume = 0.5;
    }
  }

  play(key: keyof typeof this.sounds) {
    const sound = this.sounds[key];
    if (sound) {
      sound.currentTime = 0; // 재생 위치 초기화 (연타 대비)
      sound.play().catch(() => {}); // 유저 인터랙션 전 재생 에러 방지
    }
  }
}

export const sfx = new SFXManager();