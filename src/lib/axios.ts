import axios from 'axios';

const api = axios.create({
    // UTM 환경
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    withCredentials: true,
});

// 요청 인터셉터: 로컬 스토리지에서 토큰을 읽어 헤더에 삽입
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;