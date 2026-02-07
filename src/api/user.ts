import api from '@/lib/axios'
import * as u from '@/types/auth'

export const userApi = {
    getMyInfo: () => api.get<u.UserProfileResponse>("/user/me"),
    updateNickname: (nickname: string) => 
        api.patch("/user/nickname", { nickname }),
    updateSettings: (settings: u.UserSetting) =>
        api.patch<u.UserSetting>("/user/settings/update", settings),
    getUserSetting: () => api.get<u.UserSetting>("/user/settings")
}