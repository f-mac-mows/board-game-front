"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { GameMessage } from '@/types/chat';
import { PlayerInfoResponse } from '@/types/rooms';
import { roomApi } from '@/api/rooms';
import { useWebSocket } from '@/contexts/WebSocketContext';
import toast from 'react-hot-toast';

export default function GameRoomPage() {
    const { id } = useParams();
    const roomId = Number(id);
    const router = useRouter();
    const { user, setCurrentRoomId } = useUserStore();
    
    // ✨ 공통 웹소켓 훅
    const { subscribe, publish, isConnected } = useWebSocket();

    const [messages, setMessages] = useState<GameMessage[]>([]);
    const [input, setInput] = useState("");
    const [players, setPlayers] = useState<PlayerInfoResponse[]>([]);
    const [roomTitle, setRoomTitle] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // 권한 및 상태 체크
    const myStatus = players.find(p => p.nickname === user?.nickname);
    const isPlayer = !!myStatus;
    const isHost = myStatus?.host;
    const canStart = players.length >= 2 && players.every(p => p.ready);

    // 1. 방 정보 초기화 (기존 로직 유지)
    const initRoom = useCallback(async () => {
        try {
            const res = await roomApi.getRoomDetail(roomId);
            if (res.data.status === "IN_PROGRESS" && res.data.currentGameId) {
                router.replace(`/game/yacht/${res.data.currentGameId}`);
                return;
            }
            setPlayers(res.data.players);
            setRoomTitle(res.data.title);
        } catch (err) {
            toast.error("방 정보를 불러올 수 없습니다.");
            router.replace("/rooms");
        }
    }, [roomId, router]);

    // 2. 실시간 동기화 설정
    useEffect(() => {
        if (!isConnected || !user) return;

        initRoom();

        // ✨ 방 토픽 구독
        const unsubscribe = subscribe(`/topic/room/${roomId}`, (data) => {
            if (data.players) setPlayers(data.players);
            if (data.type) setMessages((prev) => [...prev, data]);
            
            // 게임 시작 이벤트 처리
            if (data.type === 'START') {
                toast.success("게임이 곧 시작됩니다!", { icon: '🎮' });
                const gamePath = data.gameType.toLowerCase(); 
                setTimeout(() => router.push(`/game/${gamePath}/${data.message}`), 1000);
            }
        });

        // 입장 통보 (단발성 메시지 전송)
        if (isPlayer) {
            publish('/app/chat/message', {
                type: 'ENTER', roomId, sender: user.nickname,
                message: `${user.nickname}님이 입장하셨습니다.`
            });
        }

        return () => unsubscribe();
    }, [roomId, user, isConnected, isPlayer, subscribe, publish, initRoom]);

    // 3. 채팅 전송
    const sendMessage = () => {
        if (!input.trim() || !isConnected) return;
        
        publish('/app/chat/message', {
            type: 'TALK', roomId, sender: user?.nickname, message: input
        });
        setInput("");
    };

    // 4. 자동 스크롤 (기존 동일)
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // --- 핸들러 영역 (기존 동일하되 toast 적용) ---
    const handleLeave = async () => {
        try {
            if (isPlayer) {
                await roomApi.leave(roomId);
                setCurrentRoomId(null);
            }
            router.push('/rooms');
        } catch (err) {
            toast.error("퇴장에 실패했습니다.");
        }
    };

    const handleReady = async () => {
        if (!isPlayer) return;
        try {
            await roomApi.toggleReady(roomId);
            // 수동 갱신은 소켓에서 p.ready가 오기 전까지의 보조 수단
            const res = await roomApi.getRoomDetail(roomId);
            setPlayers(res.data.players); 
        } catch (err) {
            toast.error("준비 처리에 실패했습니다.");
        }
    };

    const handleStart = async () => {
        if (!isHost) return;
        try {
            await roomApi.startGame(roomId);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "시작 실패");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col gap-6">
            <header className="max-w-6xl mx-auto w-full flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-blue-500 uppercase tracking-widest">{roomTitle || 'Lobby'}</h1>
                    {!isPlayer && <span className="text-[10px] text-yellow-500 font-bold italic">SPECTATING MODE</span>}
                </div>
                <button onClick={handleLeave} className="px-4 py-2 bg-slate-800 hover:text-red-400 rounded-lg text-xs font-bold">
                    {isPlayer ? "나가기" : "관전 종료"}
                </button>
            </header>

            <main className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        {[0, 1, 2, 3].map((idx) => {
                            const p = players[idx];
                            const isMe = p?.nickname === user?.nickname;
                            return (
                                <div key={idx} className={`h-44 rounded-3xl border-2 flex flex-col items-center justify-center ${p ? (isMe ? 'bg-slate-900 border-blue-500' : 'bg-slate-900 border-blue-500/30') : 'bg-slate-900/20 border-slate-800 border-dashed'}`}>
                                    {p ? (
                                        <>
                                            <div className="w-16 h-16 bg-slate-800 rounded-full mb-3 flex items-center justify-center text-2xl shadow-lg">👤</div>
                                            <div className="font-bold text-xs text-slate-500">MMR {p.mmr}</div>
                                            <span className="font-bold">{p.nickname} {(p.host) && "👑"}</span>
                                            <div className={`mt-2 px-4 py-1 rounded-full text-[10px] font-black ${ (p.ready) ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                                                {(p.ready) ? 'READY' : 'WAITING'}
                                            </div>
                                        </>
                                    ) : <span className="text-slate-800 font-black italic">EMPTY</span>}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* 하단 컨트롤 영역: 플레이어일 때만 버튼 노출 */}
                    <div className="flex gap-4">
                        {isPlayer ? (
                            <>
                                <button onClick={handleReady} className="flex-1 py-5 bg-green-600 rounded-2xl font-black text-xl hover:bg-green-500 transition-colors shadow-lg">
                                    {myStatus?.ready || myStatus?.ready ? "CANCEL READY" : "READY"}
                                </button>
                                {isHost && (
                                    <button 
                                        onClick={handleStart} 
                                        disabled={!canStart}
                                        className={`flex-1 py-5 rounded-2xl font-black text-xl transition-all ${
                                            canStart 
                                                ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40' 
                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                                        }`}
                                    >
                                        {canStart ? 'START GAME' : 'WAITING FOR READY'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-center font-bold text-slate-500">
                                관전 중에는 조작할 수 없습니다.
                            </div>
                        )}
                    </div>
                </div>

                {/* 채팅 영역 */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-125 overflow-hidden">
                    <div className="flex-1 p-5 overflow-y-auto space-y-4 scroll-smooth" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.type === 'TALK' ? (m.sender === user?.nickname ? 'items-end' : 'items-start') : 'items-center'}`}>
                                {m.type === 'TALK' && m.sender !== user?.nickname && <span className="text-[10px] text-slate-500 mb-1 ml-1">{m.sender}</span>}
                                <div className={`px-4 py-2 rounded-2xl text-sm ${m.type === 'TALK' ? (m.sender === user?.nickname ? 'bg-blue-600' : 'bg-slate-800') : 'text-slate-500 text-xs italic'}`}>
                                    {m.message}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-950/50 flex gap-2">
                        <input 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && sendMessage()} 
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all" 
                            placeholder="메시지를 입력하세요..."
                        />
                        <button onClick={sendMessage} className="px-5 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors">전송</button>
                    </div>
                </div>
            </main>
        </div>
    );
}