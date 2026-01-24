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

    // 2. 방 생성 핸들러
    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (createData.title.length < 2 || createData.title.length > 8) {
            alert("제목은 2~8자 사이여야 합니다.");
            return;
        }

        try {
            const res = await roomApi.create(createData);
            // 성공 시 생성된 방으로 이동 (roomId는 id 필드로 응답)
            router.push(`/rooms/${res.data.roomId}`);
        } catch (err: any) {
            alert(err.response?.data?.message || "방 생성 실패");
        }
    };

    // 3. 방 참가 핸들러
    const handleJoinRoom = async (roomId: number) => {
        try {
            await roomApi.join(roomId);
            router.push(`/rooms/${roomId}`);
        } catch (err: any) {
            alert(err.response?.data?.message || "입장할 수 없습니다.");
            fetchRooms(); // 목록 새로고침
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-12">
            <div className="max-w-6xl mx-auto">
                {/* 헤더 섹션 */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-blue-500 tracking-tighter">GAME LOBBY</h1>
                        <p className="text-slate-400 mt-1">
                            {user?.nickname}님, 즐거운 게임 되세요!
                        </p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                            onClick={fetchRooms}
                            className="flex-1 sm:flex-none px-4 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            🔄 새로고침
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                        >
                            + 방 만들기
                        </button>
                    </div>
                </header>

                {/* 방 목록 그리드 */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-48 bg-slate-900/50 animate-pulse rounded-2xl border border-slate-800" />
                        ))}
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-32 border-2 border-dashed border-slate-900 rounded-3xl">
                        <p className="text-slate-500 text-lg font-medium">현재 활성화된 방이 없습니다.</p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 text-blue-400 hover:underline"
                        >
                            첫 번째 방을 만들어보세요
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div 
                                key={room.id}
                                className={`group p-6 bg-slate-900 border rounded-2xl transition-all ${
                                    room.canJoin 
                                    ? 'border-slate-800 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/5' 
                                    : 'border-slate-800 opacity-75'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded uppercase">
                                            {GAME_TYPE_CONFIG[room.gameType].description}
                                        </span>
                                        <h3 className="text-xl font-bold mt-1 group-hover:text-blue-400 transition-colors">
                                            {room.title}
                                        </h3>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                        room.status === "WAITING" ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                        {room.statusMessage}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mb-6 text-sm text-slate-400">
                                    <span>Host: <b className="text-slate-200">{room.hostNickname}</b></span>
                                    <span className={`font-bold ${room.isFull ? 'text-red-400' : 'text-slate-200'}`}>
                                        👤 {room.currentPlayers} / {room.maxPlayers}
                                    </span>
                                </div>

                                <button 
                                    onClick={() => handleJoinRoom(room.id)}
                                    disabled={!room.canJoin}
                                    className={`w-full py-3.5 rounded-xl font-black transition-all ${
                                        room.canJoin 
                                        ? 'bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500' 
                                        : 'bg-slate-950 text-slate-600 cursor-not-allowed border border-slate-900'
                                    }`}
                                >
                                    {room.canJoin ? "JOIN GAME" : "UNAVAILABLE"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 방 생성 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black mb-6 text-blue-500">CREATE ROOM</h2>
                        <form onSubmit={handleCreateRoom} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">방 제목 (2~8자)</label>
                                <input 
                                    type="text"
                                    required
                                    maxLength={8}
                                    placeholder="방 이름을 입력하세요"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={createData.title}
                                    onChange={(e) => setCreateData({...createData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">게임 종류 선택</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(GAME_TYPE_CONFIG) as GameTypeCode[]).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setCreateData({...createData, gameType: type})}
                                            className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                                                createData.gameType === type 
                                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40' 
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'
                                            }`}
                                        >
                                            {GAME_TYPE_CONFIG[type].description}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors"
                                >
                                    취소
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all"
                                >
                                    생성 및 입장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}