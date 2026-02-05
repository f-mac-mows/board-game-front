import { 
    Dice3, 
    Frame, 
    Heart, 
    CreditCard, 
    Bug,          // 바퀴벌레 포커
    Ban,          // 노땡스
    Layers,       // 렉시오 (패를 쌓는 느낌)
    Grid2X2,      // 루미큐브 (타일 배치)
    Crown,        // 달무티 (왕과 농노)
    LucideIcon 
} from 'lucide-react';

export type GameTypeCode = 
    | "YACHT" 
    | "GOMOKU" 
    | "ONECARD" 
    | "BLACKJACK"
    | "COCKROACH_POKER" 
    | "NO_THANKS" 
    | "LEXIO" 
    | "RUMMIKUB" 
    | "DALMUTI";

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
    BLACKJACK: { description: "블랙잭", minPlayers: 1, maxPlayers: 4, icon: CreditCard, color: "purple"},
    
    COCKROACH_POKER: { description: "바퀴벌레 포커", minPlayers: 2, maxPlayers: 6, icon: Bug, color: "orange"},
    NO_THANKS: { description: "노땡스!", minPlayers: 3, maxPlayers: 7, icon: Ban, color: "rose"},
    LEXIO: { description: "렉시오", minPlayers: 3, maxPlayers: 5, icon: Layers, color: "cyan"},
    RUMMIKUB: { description: "루미큐브", minPlayers: 2, maxPlayers: 4, icon: Grid2X2, color: "amber"},
    DALMUTI: { description: "달무티", minPlayers: 4, maxPlayers: 8, icon: Crown, color: "yellow"},
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