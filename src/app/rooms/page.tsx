"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { roomApi } from "@/api/rooms";
import { GameRoomResponse, GAME_TYPE_CONFIG, GameTypeCode } from "@/types/rooms";
import { useUserStore } from "@/store/useUserStore";
import { Stomp, CompatClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function RoomsPage() {
    const router = useRouter();
    const { user } = useUserStore();
    const stompClient = useRef<CompatClient | null>(null);
    
    // 상태 관리
    const [rooms, setRooms] = useState<GameRoomResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 방 생성 폼 상태
    const [createData, setCreateData] = useState({
        title: "",
        gameType: "YACHT" as GameTypeCode
    });

    // --- 웹소켓 연결 및 실시간 구독 ---
    useEffect(() => {
        // 게임 페이지와 동일한 엔드포인트 사용
        const socket = new SockJS(`https://api.walrung.com/ws-game`);
        const client = Stomp.over(socket);
        client.debug = () => {}; // 콘솔 로그가 너무 많으면 비활성화
        stompClient.current = client;

        client.connect({}, () => {
            // 실시간 방 목록 구독 (백엔드 broadcastRoomList()와 매칭)
            client.subscribe("/topic/rooms", (message) => {
                const updatedRooms = JSON.parse(message.body);
                setRooms(updatedRooms);
            });
            // 초기 데이터 로드
            fetchRooms();
        });

        return () => {
            if (stompClient.current) stompClient.current.deactivate();
        };
    }, []);

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

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTitle = createData.title.trim();
        if (trimmedTitle.length < 2 || trimmedTitle.length > 8) {
            alert("제목은 2~8자 사이여야 합니다.");
            return;
        }

        try {
            const res = await roomApi.create({
                title: trimmedTitle,
                gameType: createData.gameType
            });
            
            if (res.data && res.data.id) {
                setIsModalOpen(false);
                router.push(`/rooms/${res.data.id}`);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "방 생성에 실패했습니다.");
        }
    };

    const handleJoinRoom = async (roomId: number) => {
        try {
            const targetRoom = rooms.find(r => r.id === roomId);
            if (targetRoom && targetRoom.hostNickname === user?.nickname) {
                router.push(`/rooms/${roomId}`);
                return;
            }

            await roomApi.join(roomId);
            router.push(`/rooms/${roomId}`);
        } catch (err: any) {
            const msg = err.response?.data?.message || "";
            if (msg.includes("이미 참여")) {
                router.push(`/rooms/${roomId}`);
            } else {
                alert(msg || "입장에 실패했습니다.");
            }
        }
    };

    const returnToHome = () => {
        router.push('/');
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                    <div className="flex items-center gap-4">
                        {/* 홈으로 돌아가기 버튼 */}
                        <button 
                            onClick={returnToHome}
                            className="group p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>

                        <div>
                            <h1 
                                onClick={returnToHome}
                                className="text-4xl font-black text-blue-500 tracking-tighter italic cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                GAME LOBBY
                            </h1>
                            <p className="text-slate-400 mt-1 text-sm">
                                환영합니다, <span className="text-blue-400 font-bold">{user?.nickname}</span>님!
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                            onClick={fetchRooms} 
                            className="px-4 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
                        >
                            🔄
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                        >
                            + 방 만들기
                        </button>
                    </div>
                </header>

                {/* 방 목록 렌더링 영역 (동일) */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => <div key={n} className="h-48 bg-slate-900/50 animate-pulse rounded-2xl border border-slate-800" />)}
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-32 border-2 border-dashed border-slate-900 rounded-3xl">
                        <p className="text-slate-500">대기 중인 방이 없습니다. 첫 번째 방을 만들어보세요!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div key={room.id} className="group p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.1)]">
                                {/* ... 기존 방 카드 내부 로직 동일 ... */}
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded uppercase">
                                        {GAME_TYPE_CONFIG[room.gameType]?.description}
                                    </span>
                                    <span className="text-[10px] font-bold text-green-500">{room.statusMessage}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4 group-hover:text-blue-400 transition-colors">{room.title}</h3>
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

            {/* 생성 모달 (동일) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black mb-6 text-blue-500 italic uppercase tracking-tighter">Create New Room</h2>
                        <form onSubmit={handleCreateRoom} className="space-y-6">
                            {/* ... 입력 폼 생략 ... */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Room Title</label>
                                <input 
                                    type="text" required maxLength={8} autoFocus
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                    value={createData.title} onChange={(e) => setCreateData({...createData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Game</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(GAME_TYPE_CONFIG) as GameTypeCode[]).map((type) => (
                                        <button
                                            key={type} type="button" onClick={() => setCreateData({...createData, gameType: type})}
                                            className={`py-3 rounded-xl text-xs font-bold border transition-all ${createData.gameType === type ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                        >
                                            {GAME_TYPE_CONFIG[type].description}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 transition-colors">CANCEL</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors">CREATE</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}