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
        mutationFn: async (data: RummikubSubmitRequest) => {
            setIsProcessing(true);
            // 서버 전송 전 setId를 숫자로 정제
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
            throw error; // 컴포넌트에서 catch 할 수 있게 throw
        },
        onSettled: () => setIsProcessing(false)
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
        },
        onSettled: () => setIsProcessing(false)
    });

    const syncGame = useCallback(async () => {
        try {
            const res = await rummikubApi.sync(roomId);
            return handleSuccessSync(res);
        } catch (error) {
            console.error("Sync failed:", error);
        }
    }, [roomId, handleSuccessSync]);

    return {
        submitTurn: submitMutation.mutateAsync, 
        drawTile: drawMutation.mutateAsync,
        moveTileApi: (data: TileMoveRequest) => rummikubApi.move(roomId, data),
        moveBatchApi: (updates: TileMoveRequest[]) => rummikubApi.moveBatch(roomId, updates),
        syncGame
    };
}