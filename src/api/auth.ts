import api from '@/lib/axios';
import * as a from '@/types/auth';

export const authApi = {
    emailRequest: (data: a.EmailRequest) => api.post('/auth/email-request', data),
    emailVerify: (data: a.EmailVerifyRequest) => api.post('/auth/email-verify', data),
    signup: (data: a.SignupRequest) => api.post('/auth/signup', data),
    
    login: (data: a.LoginRequest) => api.post<a.UserProfileResponse>('/auth/login', data),
    
    logout: () => api.post('/auth/logout'),

    checkNickname: (email: string) => api.get<boolean>(`/auth/check-nickname?email=${email}`),

    getMe: (email: string) => api.get<a.UserProfileResponse>(`/auth/check-nickname?email=${email}`), 
};