import api from '@/lib/axios';
import * as g from '@/types/game';

export const yachtApi = {
    roll: (gameId: number, keepIndices: number[]) =>
        api.post(`/game/yacht/${gameId}/roll`, keepIndices),
    record: (gameId: number, category: g.ScoreCategory) =>
        api.post(`/game/yacht/${gameId}/record`, category),
    sync: (gameId: number) => api.get<g.ScoreCard[]>(`/game/yacht/${gameId}/sync`),
    result: (gameId: number) => api.get<g.GameResult>(`/game/yacht/${gameId}/result`),
};