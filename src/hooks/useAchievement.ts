import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { achievementApi } from '@/api/achievement';
import { useAchievementStore } from '@/store/useAchievementStore';

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
    onSuccess: (_, code) => {
      // 스토어 상태 변경 (UI 즉시 반영)
      markAsRewarded(code);
      
      // 유저의 골드나 레벨이 변했을 것이므로 프로필 정보 무효화(새로고침)
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      
      alert('보상이 성공적으로 지급되었습니다! 🎉');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || '보상 수령에 실패했습니다.');
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