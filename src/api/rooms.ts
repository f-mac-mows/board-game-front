import api from '@/lib/axios';
import * as r from '@/types/rooms';

export const roomApi = {
    getRooms: () => api.get<r.GameRoomResponse[]>('/rooms'),
    create: (data: r.CreateRoomRequest) => api.post<r.GameRoomResponse>('/rooms/create', data),
    join: (roomId: number) => api.post(`/rooms/join/${roomId}`),
    toggleReady: (roomId: number) => api.post(`/rooms/${roomId}/ready`),
    startGame: (roomId: number) => api.post(`/rooms/${roomId}/start`),
    leave: (roomId: number) => api.post(`/rooms/${roomId}/leave`),  
    getRoomDetail: (roomId: number) => api.get<r.RoomDetailResponse>(`/rooms/${roomId}`),
};