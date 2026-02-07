import axios from 'axios';
import { useUserStore } from '@/store/useUserStore';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
    return config;
});

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // ✨ 핵심 가드: 현재 Zustand 스토어에 유저가 있는지 확인
        const { user } = useUserStore.getState();

        // 1. 리프레시 요청 자체의 에러이거나 이미 재시도 중이면 중단
        if (originalRequest.url?.includes('/auth/refresh') || originalRequest._retry) {
            return Promise.reject(error);
        }

        // 2. 401 에러가 발생했을 때
        if (error.response?.status === 401) {
            // ✨ 핵심 가드: 로그아웃 상태(user가 null)라면 리프레시를 시도하지 않고 즉시 거절
            if (!user) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                // 재발급 시도
                await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
                return api(originalRequest);
            } catch (refreshError) {
                // 리프레시 실패 시 (예: 리프레시 토큰 만료)
                // 필요하다면 여기서 clearUser()를 강제로 호출하여 완전 로그아웃 처리 가능
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;