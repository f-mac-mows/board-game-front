"use client";

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { useUserStore } from '@/store/useUserStore';
import { GameMessage } from '@/types/chat';
import { PlayerInfoResponse } from '@/types/rooms';
import { roomApi } from '@/api/rooms';

export default function GameRoomPage() {
    const params = useParams();
    const roomIdStr = params?.id as string;
    const roomId = Number(roomIdStr);
    const router = useRouter();
    const { user, setCurrentRoomId } = useUserStore();

    const [messages, setMessages] = useState<GameMessage[]>([]);
    const [input, setInput] = useState("");
    const [players, setPlayers] = useState<PlayerInfoResponse[]>([]);
    const [roomTitle, setRoomTitle] = useState("");
    
    const [isConnected, setIsConnected] = useState(false);
    const stompClient = useRef<Client | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 유저 상태 및 권한 체크
    const myStatus = players.find(p => p.nickname === user?.nickname);
    const isPlayer = !!myStatus;
    const isHost = myStatus?.host || myStatus?.host; // 서버 필드명에 맞춰 호환
    
    // 방장 포함 전원 준비 완료 시 시작 가능
    const canStart = players.length >= 2 && players.every(p => p.ready || p.ready);

    // 1. 방 정보 초기화 및 게임 진행 상태 체크
    useEffect(() => {
        if (!roomId || isNaN(roomId)) return;

        const initRoom = async () => {
            try {
                const res = await roomApi.getRoomDetail(roomId);
                setPlayers(res.data.players);
                setRoomTitle(res.data.title);

            } catch (err) {
                console.error("방 정보 로드 실패:", err);
                alert("방 정보를 불러올 수 없습니다.");
                router.replace("/rooms");
            }
        };

        initRoom();
    }, [roomId, router]);

    // 2. 소켓 연결 및 실시간 동기화
    useEffect(() => {
        if (!roomId || isNaN(roomId) || !user) return;

        const socket = new SockJS(`http://walrung.ddns.net:8080/ws-game`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnected(true);

                client.subscribe(`/topic/room/${roomId}`, (message: IMessage) => {
                    const data = JSON.parse(message.body);
                    if (data.players) setPlayers(data.players);
                    if (data.type) setMessages((prev) => [...prev, data]);

                    if (data.type === 'START') {
                        const newGameId = data.message;
                        setTimeout(() => router.push(`/game/yacht/${newGameId}`), 1000);
                    }
                });

                // 플레이어인 경우에만 입장 통보
                if (isPlayer) {
                    client.publish({
                        destination: '/app/chat/message',
                        body: JSON.stringify({
                            type: 'ENTER', roomId: roomId, sender: user.nickname,
                            message: `${user.nickname}님이 입장하셨습니다.`
                        })
                    });
                }
            },
            onDisconnect: () => setIsConnected(false),
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current) stompClient.current.deactivate();
        };
    }, [roomId, user, isPlayer]);

    // 3. 채팅 자동 스크롤
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // --- 핸들러 영역 ---
    const handleLeave = async () => {
        try {
            if (isPlayer) {
                await roomApi.leave(roomId);
                setCurrentRoomId(null); // AuthProvider 가드 해제
            }
            router.push('/rooms');
        } catch (err: any) {
            alert("나가기 실패");
        }
    };

    const handleReady = async () => {
        if (!isPlayer) return;
        try {
            await roomApi.toggleReady(roomId);
            const res = await roomApi.getRoomDetail(roomId);
            setPlayers([...res.data.players]); 
        } catch (err: any) {
            alert("준비 처리 실패");
        }
    };

    const handleStart = async () => {
        if (!isHost) return;
        try {
            await roomApi.startGame(roomId);
        } catch (err: any) {
            alert(err.response?.data?.message || "시작 실패");
        }
    };

    const sendMessage = () => {
        if (!input.trim() || !stompClient.current) return;
        stompClient.current.publish({
            destination: '/app/chat/message',
            body: JSON.stringify({
                type: 'TALK', roomId: roomId, sender: user?.nickname, message: input
            })
        });
        setInput("");
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
                <div className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[500px] overflow-hidden">
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