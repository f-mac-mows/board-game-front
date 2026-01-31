import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
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

        // 리프레시 요청이거나 이미 재시도 중이면 바로 종료 (중복 실행 방지)
        if (originalRequest.url?.includes('/auth/refresh') || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            originalRequest._retry = true;

            try {
                await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
                return api(originalRequest);
            } catch (refreshError) {
                // 리프레시 실패 시에는 조용히 에러만 던집니다.
                // 그러면 AuthProvider의 catch 문이 잡아서 처리합니다.
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;