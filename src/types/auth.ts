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

export interface AssetInfo {
    gold: number;
    point: number;
}

export interface StatInfo {
    level: number;
    exp: number;
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
    asset: AssetInfo;
    stat: StatInfo;
    activeRoomId: number;
}