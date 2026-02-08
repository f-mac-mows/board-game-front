import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rummikubApi } from '@/api/rummikub';
import { toast } from 'react-hot-toast';
import { RummikubSubmitRequest, TileMoveRequest } from '@/types/rummikub';

export function useRummikubActions(roomId: number) {
    const queryClient = useQueryClient();

    // 1. 턴 제출 Mutation
    const submitMutation = useMutation({
        mutationFn: (data: RummikubSubmitRequest) => rummikubApi.submit(roomId, data),
        onSuccess: () => {
            toast.success('턴을 성공적으로 마쳤습니다!', { icon: '✅' });
            queryClient.invalidateQueries({ queryKey: ['rummikub-game', roomId] });
        },
        onError: (error: any) => {
            const errorCode = error.response?.data?.code;
            const msg = error.response?.data?.message || "제출에 실패했습니다.";

            switch (errorCode) {
                case 'RUMMIKUB_3001': toast.error(msg, { icon: '🔢' }); break;
                case 'RUMMIKUB_3003': toast.error('유효하지 않은 조합입니다.', { icon: '⚠️' }); break;
                case 'RUMMIKUB_3004': toast.error('무결성 오류가 발생했습니다.', { icon: '🚨' }); break;
                default: toast.error(msg);
            }
        }
    });

    // 2. 타일 드로우 Mutation
    const drawMutation = useMutation({
        mutationFn: () => rummikubApi.draw(roomId),
        onSuccess: () => {
            toast('타일을 한 장 가져왔습니다.', { icon: '🃏' });
            queryClient.invalidateQueries({ queryKey: ['rummikub-game', roomId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "타일을 가져올 수 없습니다.");
        }
    });

    // 🚩 3. 단일 타일 이동 Mutation (실시간 DB 동기화)
    const moveMutation = useMutation({
        mutationFn: (data: TileMoveRequest) => rummikubApi.move(roomId, data),
        onError: (error: any) => {
            console.error("단일 이동 동기화 실패:", error);
        }
    });

    // 🚩 4. 배치 타일 이동 Mutation (그룹 드래그 종료 시)
    const moveBatchMutation = useMutation({
        mutationFn: (updates: TileMoveRequest[]) => rummikubApi.moveBatch(roomId, updates),
        onError: (error: any) => {
            console.error("배치 이동 동기화 실패:", error);
            toast.error("일부 타일 위치 저장에 실패했습니다.");
        }
    });

    return {
        // 기존 액션
        submitTurn: submitMutation.mutate,
        isSubmitting: submitMutation.isPending,
        drawTile: drawMutation.mutate,
        isDrawing: drawMutation.isPending,
        
        // 🚀 신규 이동 액션
        moveTileApi: moveMutation.mutate,
        moveBatchApi: moveBatchMutation.mutate
    };
}