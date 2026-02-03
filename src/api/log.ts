import api from "@/lib/axios";
import { AnyGameLog } from "@/types/log";
import { GameTypeCode } from "@/types/rooms";

export const logApi = {
  getLogs: async (
    gameType: GameTypeCode, 
    gameId: number, 
    lastId?: string // 인피니티 스크롤용 커서 추가
  ): Promise<AnyGameLog[]> => {
    try {
      // lastId가 있으면 쿼리 파라미터로 붙임 (예: /v1/logs/YACHT/123?lastId=65b...)
      const response = await api.get<AnyGameLog[]>(`/v1/logs/${gameType}/${gameId}`, {
        params: { lastId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch game logs:', error);
      throw error;
    }
  },
};