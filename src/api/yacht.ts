import api from "@/lib/axios";

export const yachtApi = {
    rollDice: (gameId: number, keepIndices: number[]) =>
        api.post(`/game/yacht/${gameId}/roll`, { keepIndices }),
    recordScore: (gameId: number, category: string) => 
        api.post(`/game/yacht/${gameId}/record`, { category }),
    syncGame: (gameId: number) => 
        api.get(`/game/yacht/${gameId}/sync`),
    getResult: (gameId: number) =>
        api.get(`/game/yacht/${gameId}/result`),
};