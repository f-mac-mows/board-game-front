import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questApi } from '@/api/quest';
import { toast } from 'react-hot-toast';
import { useUserStore } from '@/store/useUserStore'; // 유저 스토어 임포트

export function useQuests() {
    const queryClient = useQueryClient();
    const user = useUserStore((state) => state.user); // 유저 정보 가져오기

    // 1. 퀘스트 목록 조회
    const { data: quests = [], isLoading } = useQuery({
        queryKey: ['daily-quests'],
        queryFn: questApi.getDailyQuests,
        // ✨ 핵심: 유저 정보가 존재할 때만 쿼리를 실행합니다.
        enabled: !!user, 
        // 추가 팁: 로그아웃 후 데이터가 남아있지 않게 하려면 캐시 타임을 조절할 수 있습니다.
        staleTime: 1000 * 60 * 5, // 5분
    });

    // 2. 보상 수령 Mutation
    const claimMutation = useMutation({
        mutationFn: (questId: string) => questApi.claimReward(questId),
        onSuccess: (reward) => {
            toast.success(
                <span>
                    <b>{reward.label}</b> 보상을 획득했습니다! ✨
                </span>,
                { icon: '🎁' }
            );

            queryClient.invalidateQueries({ queryKey: ['daily-quests'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "보상 수령에 실패했습니다.";
            toast.error(msg);
        }
    });

    return {
        // 유저가 없으면 빈 배열을 반환하여 렌더링 에러 방지
        quests: user ? quests : [], 
        isLoading: user ? isLoading : false,
        claimReward: claimMutation.mutate,
        isClaiming: claimMutation.isPending
    };
}