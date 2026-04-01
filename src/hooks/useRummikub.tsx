import { useMutation } from '@tanstack/react-query';
import { rummikubApi } from '@/api/rummikub';
import { toast } from 'react-hot-toast';
import { RummikubSubmitRequest, TileMoveRequest } from '@/types/rummikub';
import { useRummikubStore } from '@/store/useRummikubStore';
import { useCallback } from 'react';

export function useRummikubActions(roomId: number) {
    const { updateFromRemote, setIsProcessing } = useRummikubStore();

    const handleSuccessSync = useCallback((res: any) => {
        if (res?.data) {
            updateFromRemote(res.data);
            return res.data;
        }
    }, [updateFromRemote]);

    const submitMutation = useMutation({
        mutationFn: (data: RummikubSubmitRequest) => {
            const sanitizedBoardTiles = data.boardTiles.map(tile => ({
                ...tile,
                setId: String(tile.setId).startsWith('temp') ? 0 : Number(tile.setId)
            }));
            return rummikubApi.submit(roomId, { 
                ...data, 
                boardTiles: sanitizedBoardTiles as any 
            });
        },
        onSuccess: (res) => {
            handleSuccessSync(res);
            toast.success('턴을 마쳤습니다!', { id: 'game-action' });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "유효하지 않은 조합입니다.";
            toast.error(msg, { id: 'game-action' });
        }
        // 🚩 여기서 setIsProcessing을 지웁니다. 호출부에서 직접 제어하는 게 훨씬 안전합니다.
    });

    const drawMutation = useMutation({
        mutationFn: () => rummikubApi.draw(roomId),
        onSuccess: (res) => {
            handleSuccessSync(res);
            toast.success('타일을 가져왔습니다.', { icon: '🃏', id: 'game-action' });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "드로우 실패";
            toast.error(msg, { id: 'game-action' });
        }
    });

    // 🚩 래핑 함수를 통해 처리 상태를 확실히 제어
    const submitTurn = async (data: RummikubSubmitRequest) => {
        try {
            setIsProcessing(true); // 직접 시작
            await submitMutation.mutateAsync(data);
        } finally {
            // 🚩 어떤 에러가 나더라도, 심지어 updateFromRemote에서 에러가 나더라도 무조건 해제
            setIsProcessing(false); 
        }
    };

    const drawTile = async () => {
        try {
            setIsProcessing(true);
            await drawMutation.mutateAsync();
        } finally {
            setIsProcessing(false);
        }
    };

    const syncGame = useCallback(async () => {
        try {
            const res = await rummikubApi.sync(roomId);
            return handleSuccessSync(res);
        } catch (error) {
            console.error("Sync failed:", error);
        }
    }, [roomId, handleSuccessSync]);

    return {
        submitTurn, 
        drawTile,
        syncGame
    };
}