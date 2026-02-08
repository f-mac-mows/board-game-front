import api from '@/lib/axios';
import * as r from '@/types/rummikub';

export const rummikubApi = {
    /**
     * 1. 턴 제출 (배치 완료 후)
     */
    submit: (roomId: number, data: r.RummikubSubmitRequest) =>
        api.post(`/game/rummikub/${roomId}/submit`, data),

    /**
     * 2. 타일 한 장 뽑기 (턴 넘기기)
     */
    draw: (roomId: number) =>
        api.post(`/game/rummikub/${roomId}/draw`),

    /**
     * 3. 게임 상태 동기화 (새로고침/입장 시)
     */
    sync: (roomId: number) =>
        api.get(`/game/rummikub/${roomId}/sync`),

    /**
     * 4. 단일 타일 이동 기록 (개별 드래그 종료 시)
     * setId를 포함하여 그룹 이탈/합체 정보를 서버 DB에 반영합니다.
     */
    move: (roomId: number, data: r.TileMoveRequest) =>
        api.post(`/game/rummikub/${roomId}/move`, data),

    /**
     * 5. 배치 타일 이동 기록 (그룹 드래그 종료 시)
     * 뭉치 전체의 좌표를 한 번의 요청으로 업데이트합니다.
     */
    moveBatch: (roomId: number, updates: r.TileMoveRequest[]) =>
        api.post(`/game/rummikub/${roomId}/move-batch`, { updates }),

    /**
     * 6. 복기용 로그 조회
     */
    getReplay: (gameId: number) =>
        api.get<r.RummikubGameLogResponse[]>(`/v1/logs/rummikub/${gameId}/replay`),
};