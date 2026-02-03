import { logApi } from "@/api/log";
import { AnyGameLog } from "@/types/log";
import { GameTypeCode } from "@/types/rooms";
import { useInfiniteQuery } from "@tanstack/react-query";

// useLogs.ts
export function useLogs(gameId: number | null, gameType: GameTypeCode | null, isEnabled: boolean = false) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery<AnyGameLog[]>({
        queryKey: ['game-logs', gameType, gameId],
        queryFn: ({ pageParam }) => 
            logApi.getLogs(gameType!, gameId!, pageParam as string | undefined),
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.length < 20) return undefined;
            // 리스트의 마지막(가장 최근) ID를 커서로 사용
            return lastPage[lastPage.length - 1].id; 
        },
        enabled: isEnabled && !!gameId && !!gameType,
    });

    return {
        logs: data?.pages.flat() || [],
        fetchMore: fetchNextPage,
        hasNextPage,
        isFetchingMore: isFetchingNextPage,
        isLoading, isError
    };
}