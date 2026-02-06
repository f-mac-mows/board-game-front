import { useQuery } from '@tanstack/react-query';
import { historyApi } from '@/api/history';
import { GameHistory } from '@/types/history';

export function useHistories() {
    // 최근 전적 목록 조회
    const { 
        data: histories = [], 
        isLoading, 
        isError, 
        refetch 
    } = useQuery<GameHistory[]>({
        queryKey: ['game-histories'],
        queryFn: historyApi.getRecentHistories,
        // 데이터가 자주 변하지 않는 로그성 데이터이므로 캐시를 어느 정도 유지합니다.
        staleTime: 1000 * 60 * 5, // 5분
    });

    /**
     * 통계 요약 기능 (필요 시 확장)
     * 가져온 10개의 전적 중 승률을 계산합니다.
     */
    const summary = {
        winCount: histories.filter(h => h.result === 'WIN').length,
        loseCount: histories.filter(h => h.result === 'LOSE').length,
        drawCount: histories.filter(h => h.result === 'DRAW').length,
        winRate: histories.length > 0 
            ? ((histories.filter(h => h.result === 'WIN').length / histories.length) * 100).toFixed(1)
            : '0'
    };

    return {
        histories,   // 전적 리스트
        isLoading,   // 로딩 상태
        isError,     // 에러 발생 여부
        summary,     // 간단한 승률 요약
        refresh: refetch // 수동 새로고침 함수
    };
}