import { Dice3, Frame, Heart, CreditCard, LucideIcon } from 'lucide-react';

export type GameTypeCode = "YACHT" | "GOMOKU" | "ONECARD" | "BLACKJACK";

export interface GameTypeDetail {
    description: string;
    minPlayers: number;
    maxPlayers: number;
    icon: LucideIcon;
    color: string;
}

export const GAME_TYPE_CONFIG: Record<GameTypeCode, GameTypeDetail> = {
    YACHT: { description: "야추 다이스", minPlayers: 2, maxPlayers: 2, icon: Dice3, color: "blue"},
    GOMOKU: { description: "오목", minPlayers: 2, maxPlayers: 2, icon: Frame, color: "green"},
    ONECARD: { description: "원카드", minPlayers: 2, maxPlayers: 4, icon: Heart, color: "red"},
    BLACKJACK: { description: "블랙잭", minPlayers: 2, maxPlayers: 4, icon: CreditCard, color: "purple"},
};

export interface CreateRoomRequest {
    title: string; // Size 2~8자
    gameType: GameTypeCode; // NotNull
}

export type GameStatus = "WAITING" | "IN_PROGRESS" | "FINISHED";

export interface GameRoomResponse {
    id: number;
    title: string;
    gameType: GameTypeCode;
    hostNickname: string;
    currentPlayers: number;
    maxPlayers: number;
    full: boolean;
    status: GameStatus;
    canJoin: boolean;
    statusMessage: string;
    createdAt: string;
}

export interface PlayerInfoResponse {
    nickname: string;
    mmr: number | null;
    ready: boolean;
    host: boolean;
}

export interface RoomDetailResponse {
    roomId: number;
    title: string;
    status: GameStatus;
    currentGameId: number;
    players: PlayerInfoResponse[];
}