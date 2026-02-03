import { GameTypeCode } from "./rooms";

export interface GameHistory {
    id: string;
    gameId: number;
    gameType: GameTypeCode
    result: 'WIN' | 'LOSE' | 'DRAW';
    detail: Record<string, any>;
    createdAt: string;
    rewarded: boolean;
}