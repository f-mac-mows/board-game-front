import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rummikubApi } from '@/api/rummikub';
import { toast } from 'react-hot-toast';
import { RummikubSubmitRequest } from '@/types/rummikub';

export function useRummikubActions(roomId: number) {
    const queryClient = useQueryClient();

    // 1. 턴 제출 Mutation
    const submitMutation = useMutation({
        mutationFn: (data: RummikubSubmitRequest) => rummikubApi.submit(roomId, data),
        onSuccess: () => {
            toast.success('턴을 성공적으로 마쳤습니다!', { icon: '✅' });
            // 게임 상태 데이터 갱신
            queryClient.invalidateQueries({ queryKey: ['rummikub-game', roomId] });
        },
        onError: (error: any) => {
            const errorCode = error.response?.data?.code;
            const msg = error.response?.data?.message || "제출에 실패했습니다.";

            // 에러 코드별 커스텀 토스트 처리
            switch (errorCode) {
                case 'RUMMIKUB_3001': // INSUFFICIENT_SCORE
                    toast.error(msg, { icon: '🔢' });
                    break;
                case 'RUMMIKUB_3003': // INVALID_COMBINATION
                    toast.error('유효하지 않은 조합이 포함되어 있습니다.', { icon: '⚠️' });
                    break;
                default:
                    toast.error(msg);
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

    return {
        submitTurn: submitMutation.mutate,
        isSubmitting: submitMutation.isPending,
        drawTile: drawMutation.mutate,
        isDrawing: drawMutation.isPending
    };
}