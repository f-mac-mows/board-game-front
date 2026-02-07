import { GameTypeCode } from "./rooms";

export interface EmailRequest {
    email: string
}

export interface EmailVerifyRequest {
    email: string;
    code: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    nickname: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AccountStat {
    level: number;
    currentExp: number;
    requiredExp: number;
    totalGamesPlayed: number;
}

export interface AssetInfo {
    gold: number;
    point: number;
}

export interface StatInfo {
    gameType: GameTypeCode;
    level: number;
    exp: number;
    requiredExp: number;
    mmr: number;
    wins: number;
    draws: number;
    losses: number;
}

export interface UserProfileResponse {
    email: string;
    nickname: string;
    profileCompleted: boolean;
    createdAt: string; // ISO 8601 string
    activeTitle: string | null;
    titleColor: string | null;
    astat: AccountStat;
    asset: AssetInfo;
    stats: StatInfo[];
    activeRoomId: number | null;
}

export interface UserSetting {
    muted: boolean;
    volume: number;
}