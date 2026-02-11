import axios from 'axios';
import { useUserStore } from '@/store/useUserStore';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

// 토큰 갱신 중일 때 들어오는 요청들을 대기시키기 위한 큐
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const { user, clearUser } = useUserStore.getState();

        // 401 에러이고, 재시도한 적이 없을 때만 실행
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            if (isRefreshing) {
                // 이미 갱신 중이라면 큐에 담고 대기
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest))
                  .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 토큰 갱신 요청
                await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
                
                isRefreshing = false;
                processQueue(null); // 대기 중인 요청들 진행
                
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);
                clearUser?.();
                // 게임 중이라면 방 밖으로 튕겨나가는 등의 처리가 필요할 수 있음
                return Promise.reject(refreshError);
            }
        }

        /**
         * 🚩 게임 전용 에러 로깅 보완
         * RummikubErrorCode (3001, 3002 등)가 넘어올 때 
         * 인터셉터에서 공통으로 처리하기보다 catch 문으로 넘겨주는 게 좋습니다.
         */
        return Promise.reject(error);
    }
);

export default api;