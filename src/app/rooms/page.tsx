"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { roomApi } from "@/api/rooms";
import { GameRoomResponse, GAME_TYPE_CONFIG, GameTypeCode } from "@/types/rooms";
import { useUserStore } from "@/store/useUserStore";

export default function RoomsPage() {
    const router = useRouter();
    const { user } = useUserStore();
    
    // 상태 관리
    const [rooms, setRooms] = useState<GameRoomResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 방 생성 폼 상태
    const [createData, setCreateData] = useState({
        title: "",
        gameType: "YACHT" as GameTypeCode
    });

    // 1. 방 목록 가져오기
    const fetchRooms = async () => {
        setIsLoading(true);
        try {
            const res = await roomApi.getRooms();
            setRooms(res.data);
        } catch (err) {
            console.error("방 목록 로드 실패:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // 2. 방 생성 핸들러 (400 에러 및 id 참조 수정)
    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedTitle = createData.title.trim();
        if (trimmedTitle.length < 2 || trimmedTitle.length > 8) {
            alert("제목은 2~8자 사이여야 합니다.");
            return;
        }

        try {
            // 백엔드 CreateRoomRequest DTO 구조에 맞게 전송
            const res = await roomApi.create({
                title: trimmedTitle,
                gameType: createData.gameType
            });

            console.log("서버 응답 데이터:", res.data);

                // 서버 DTO(GameRoomResponse)가 'id' 필드를 가지고 있는지 확인
                const newRoomId = res.data.id;

            // 백엔드 GameRoomResponse의 필드명인 'id'를 참조
            if (res.data && res.data.id) {
                setIsModalOpen(false);
                router.push(`/rooms/${res.data.id}`);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "방 생성에 실패했습니다.";
            alert(errorMsg);
            console.error("Create Room Error:", err.response?.data);
        }
    };

    // 3. 방 참가 핸들러
    const handleJoinRoom = async (roomId: number) => {
        try {
            const targetRoom = rooms.find(r => r.id === roomId);
            // 내가 방장이면 바로 입장
            if (targetRoom && targetRoom.hostNickname === user?.nickname) {
                router.push(`/rooms/${roomId}`);
                return;
            }

            await roomApi.join(roomId);
            router.push(`/rooms/${roomId}`);
        } catch (err: any) {
            const msg = err.response?.data?.message || "";
            // 이미 참여 중인 경우에도 입장 허용
            if (msg.includes("이미 참여") || msg.includes("Already joined")) {
                router.push(`/rooms/${roomId}`);
            } else {
                alert(msg || "입장에 실패했습니다.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-blue-500 tracking-tighter italic">GAME LOBBY</h1>
                        <p className="text-slate-400 mt-1">{user?.nickname}님, 환영합니다!</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={fetchRooms} className="px-4 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors">🔄</button>
                        <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg shadow-blue-900/20">+ 방 만들기</button>
                    </div>
                </header>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => <div key={n} className="h-48 bg-slate-900/50 animate-pulse rounded-2xl border border-slate-800" />)}
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-32 border-2 border-dashed border-slate-900 rounded-3xl">
                        <p className="text-slate-500">대기 중인 방이 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div key={room.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded uppercase">
                                        {GAME_TYPE_CONFIG[room.gameType]?.description}
                                    </span>
                                    <span className="text-[10px] font-bold text-green-500">{room.statusMessage}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4">{room.title}</h3>
                                <div className="flex justify-between items-center mb-6 text-sm text-slate-400">
                                    <span>Host: <b className="text-slate-200">{room.hostNickname}</b></span>
                                    <span>👤 {room.currentPlayers} / {room.maxPlayers}</span>
                                </div>
                                <button 
                                    onClick={() => handleJoinRoom(room.id)}
                                    disabled={!room.canJoin}
                                    className={`w-full py-3 rounded-xl font-black transition-all ${room.canJoin ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                >
                                    JOIN GAME
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 생성 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md">
                        <h2 className="text-2xl font-black mb-6 text-blue-500 italic">CREATE ROOM</h2>
                        <form onSubmit={handleCreateRoom} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">방 제목 (2~8자)</label>
                                <input 
                                    type="text" required maxLength={8} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                                    value={createData.title} onChange={(e) => setCreateData({...createData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">게임 선택</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(GAME_TYPE_CONFIG) as GameTypeCode[]).map((type) => (
                                        <button
                                            key={type} type="button" onClick={() => setCreateData({...createData, gameType: type})}
                                            className={`py-3 rounded-xl text-xs font-bold border ${createData.gameType === type ? 'bg-blue-600 border-blue-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                        >
                                            {GAME_TYPE_CONFIG[type].description}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-800 rounded-xl font-bold">취소</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 rounded-xl font-bold">생성</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}