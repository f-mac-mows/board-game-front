import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questApi } from '@/api/quest';
import { toast } from 'react-hot-toast';

export function useQuests() {
    const queryClient = useQueryClient();

    // 1. 퀘스트 목록 조회
    const { data: quests = [], isLoading } = useQuery({
        queryKey: ['daily-quests'],
        queryFn: questApi.getDailyQuests,
    });

    // 2. 보상 수령 Mutation
    const claimMutation = useMutation({
        mutationFn: (questId: string) => questApi.claimReward(questId),
        onSuccess: (reward) => {
            // 보상 획득 성공 토스트
            toast.success(
                <span>
                    <b>{reward.label}</b> 보상을 획득했습니다! ✨
                </span>,
                { icon: '🎁' }
            );

            // 퀘스트 상태 갱신
            queryClient.invalidateQueries({ queryKey: ['daily-quests'] });
            // 골드/경험치가 변했으므로 유저 정보도 갱신
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "보상 수령에 실패했습니다.";
            toast.error(msg);
        }
    });

    return {
        quests,
        isLoading,
        claimReward: claimMutation.mutate,
        isClaiming: claimMutation.isPending
    };
}