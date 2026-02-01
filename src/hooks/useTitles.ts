import { useUserStore } from '@/store/useUserStore';
import api from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UserTitleInfo {
    code: string;
    name: string;
    colorCode: string;
    description: string;
    equipped: boolean;
    acquiredAt: string;
}

export function useTitles() {
    const queryClient = useQueryClient();
    const updateActiveTitle = useUserStore((state) => state.updateActiveTitle);

    // 보유 칭호 목록 조회
    const { data: titles = [], isLoading } = useQuery<UserTitleInfo[]>({
        queryKey: ['user-titles'],
        queryFn: async () => {
            const res = await api.get('/v1/titles');
            return res.data;
        }
    });

    // 칭호 장착 변이(Mutation)
    const equipMutation = useMutation({
        mutationFn: async (titleCode: string) => {
            // PATCH에서 POST로 변경, 응답이 Void이므로 데이터 처리 방식 변경
            await api.post(`/v1/titles/${titleCode}/equip`);
            return titleCode; // 성공한 코드 반환
        },
        onSuccess: (titleCode) => {
            // 1. 현재 불러온 titles 목록에서 장착한 칭호 정보를 찾음
            const equippedTitle = titles.find(t => t.code === titleCode);
            
            if (equippedTitle) {
                // 2. Zustand 스토어 업데이트 (메인 UI 즉시 반영)
                updateActiveTitle(equippedTitle.name, equippedTitle.colorCode);
            }

            // 3. 리액트 쿼리 캐시 갱신 (목록의 체크표시 등을 업데이트)
            queryClient.invalidateQueries({ queryKey: ['user-titles'] });
        }
    });

    return {
        titles,
        isLoading,
        equipTitle: equipMutation.mutate,
        isEquipping: equipMutation.isPending
    };
}