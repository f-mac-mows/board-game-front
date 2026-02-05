import api from '@/lib/axios';
import * as r from '@/types/rummikub';

export const rummikubApi = {
    // 턴 제출
    submit: (roomId: number, data: r.RummikubSubmitRequest) =>
        api.post(`/rummikub/${roomId}/submit`, data),

    // 타일 한 장 뽑기
    draw: (roomId: number) =>
        api.post(`/rummikub/${roomId}/draw`),

    // 게임 상태 동기화 (필요 시)
    sync: (roomId: number) =>
        api.get(`/rummikub/${roomId}/sync`),
};