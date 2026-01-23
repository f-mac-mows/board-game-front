import api from '@/lib/axios';
import * as g from '@/types/game';

export const yachtApi = {
    roll: (gameId: string, keepIndices: number[]) =>
        api.post(`/game/yacht/${gameId}/roll`, keepIndices),
    record: (gameId: string, category: g.ScoreCategory) =>
        api.post(`/game/yacht/${gameId}/record`, category),
    sync: (gameId: string) => api.get<g.ScoreCard[]>(`/game/yacht/${gameId}/sync`),
    result: (gameId: string) => api.get<g.GameResult>(`/game/yacht/${gameId}/result`),
};