import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { achievementApi } from '@/api/achievement';
import { useAchievementStore } from '@/store/useAchievementStore';
import { toast } from 'react-hot-toast'

export const useAchievements = () => {
  const queryClient = useQueryClient();
  const setAchievements = useAchievementStore((state) => state.setAchievements);
  const markAsRewarded = useAchievementStore((state) => state.markAsRewarded);

  // 1. 업적 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const data = await achievementApi.getMyAchievements();
      setAchievements(data); // Zustand 스토어 업데이트
      return data;
    },
  });

  // 2. 보상 수령 Mutation
  const claimMutation = useMutation({
    mutationFn: (code: string) => achievementApi.claimReward(code),
    onSuccess: (reward, code) => {
      // reward: { type: 'GOLD', value: '5000', label: '5,000 Gold' } 등의 응답 가정
      
      markAsRewarded(code);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      
      if (reward.type === 'TITLE') {
        toast.success(`새로운 칭호 [${reward.value}] 획득!`, {
          icon: '🎖️',
          style: { border: '1px solid #fbbf24', background: '#0f172a' }
        });
      } else if (reward.type === 'GOLD') {
        toast.success(`${reward.value} 골드를 받았습니다!`, {
          icon: '💰',
          style: { border: '1px solid #fde047', background: '#0f172a' }
        });
      }
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || '보상 수령에 실패했습니다.';
      toast.error(errorMsg);
    }
  });

  return {
    achievements: data,
    isLoading,
    error,
    claimReward: claimMutation.mutate,
    isClaiming: claimMutation.isPending
  };
};