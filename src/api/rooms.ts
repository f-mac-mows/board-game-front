import api from '@/lib/axios';
import * as r from '@/types/rooms';

export const roomApi = {
    getRooms: () => api.get<r.GameRoomResponse[]>('/rooms'),
    create: (data: r.CreateRoomRequest) => api.post<{roomId: number}>('/rooms/create', data),
    join: (roomId: number) => api.post(`/rooms/join/${roomId}`),
    leave: (roomId: number) => api.post(`/rooms/${roomId}/leave`),
};