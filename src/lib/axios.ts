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
    (response) => {
        // 정상 응답은 그대로 반환
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 무한 루프 방지용 플래그

            try {
                await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`, 
                    {}, 
                    { withCredentials: true }
                );

                return api(originalRequest);
            } catch (refreshError) {
                console.error("세션이 만료되었습니다. 다시 로그인해주세요.");
 
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login'; 
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;