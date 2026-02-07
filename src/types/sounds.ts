// src/constants/sound.ts
import { GameTypeCode } from "@/types/rooms";

export const GAME_BGM_MAP: Record<GameTypeCode, string> = {
  // TODO 게임별 ogg 생성시 변경
  YACHT: "/sounds/main-bgm.ogg",
  GOMOKU: "/sounds/main-bgm.ogg",
  ONECARD: "/sounds/main-bgm.ogg",
  BLACKJACK: "/sounds/main-bgm.ogg",
  COCKROACH_POKER: "/sounds/main-bgm.ogg",
  NO_THANKS: "/sounds/main-bgm.ogg",
  LEXIO: "/sounds/main-bgm.ogg",
  RUMMIKUB: "/sounds/main-bgm.ogg",
  DALMUTI: "/sounds/main-bgm.ogg",
};