import api from '@/lib/axios';
import * as r from '@/types/rummikub';

export const rummikubApi = {
    /**
     * 1. 턴 제출 (배치 완료 후)
     * 응답으로 내 최신 손패와 바닥 상태를 즉시 받습니다.
     */
    submit: (roomId: number, data: r.RummikubSubmitRequest) =>
        api.post<r.RummikubSyncResponse>(`/game/rummikub/${roomId}/submit`, data),

    /**
     * 2. 타일 한 장 뽑기 (턴 넘기기)
     * 타일을 뽑은 후 갱신된 내 손패 데이터를 포함합니다.
     */
    draw: (roomId: number) =>
        api.post<r.RummikubSyncResponse>(`/game/rummikub/${roomId}/draw`),

    /**
     * 3. 게임 상태 동기화 (새로고침/입장/소켓 신호 수신 시)
     */
    sync: (roomId: number) =>
        api.get<r.RummikubSyncResponse>(`/game/rummikub/${roomId}/sync`),


    /**
     * 4. 복기용 로그 조회
     */
    getReplay: (gameId: number) =>
        api.get<r.RummikubGameLogResponse[]>(`/v1/logs/rummikub/${gameId}/replay`),
};