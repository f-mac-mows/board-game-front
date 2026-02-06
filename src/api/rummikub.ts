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

    // 🚩 실시간 타일 이동 기록 추가
    move: (roomId: number, data: { tileId: number; toX: number; toY: number }) =>
        api.post(`/rummikub/${roomId}/move`, data),
};