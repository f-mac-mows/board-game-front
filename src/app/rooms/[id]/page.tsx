"use client";

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { useUserStore } from '@/store/useUserStore';
import { GameMessage } from '@/types/chat';
import { RoomDetailResponse, PlayerInfoResponse } from '@/types/rooms';
import { roomApi } from '@/api/rooms';

export default function GameRoomPage() {
    const params = useParams();
    const roomIdStr = params?.id as string;
    const roomId = Number(roomIdStr);
    const router = useRouter();
    const { user } = useUserStore();

    const [messages, setMessages] = useState<GameMessage[]>([]);
    const [input, setInput] = useState("");
    const [players, setPlayers] = useState<PlayerInfoResponse[]>([]);
    const [roomTitle, setRoomTitle] = useState("");
    
    const [isConnected, setIsConnected] = useState(false);
    const stompClient = useRef<Client | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const canStart = players.length >= 2 && players.every(p => p.host || p.ready);

    // 1. 방 정보 초기화 (재시도 로직 추가)
    useEffect(() => {
        if (!roomId || isNaN(roomId)) return;

        let retryCount = 0;
        const maxRetries = 3;

        const initRoom = async () => {
            try {
                const res = await roomApi.getRoomDetail(roomId);
                setPlayers(res.data.players);
                setRoomTitle(res.data.title);
            } catch (err) {
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`방 정보 로드 재시도 중... (${retryCount}/${maxRetries})`);
                    setTimeout(initRoom, 500); // 0.5초 후 다시 시도
                } else {
                    console.error("방 정보 로드 최종 실패:", err);
                    alert("방 정보를 불러올 수 없습니다.");
                    router.replace("/rooms");
                }
            }
        };

        initRoom();
    }, [roomId, router]);

    // 2. 소켓 연결
    useEffect(() => {
        if (!roomId || isNaN(roomId) || !user) return;

        const socket = new SockJS(`http://walrung.ddns.net:8080/ws-game`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000, // 연결 끊길 시 5초 후 재연결 시도
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log("WebSocket Connected!");
                setIsConnected(true); // 연결 완료 상태 기록

                client.subscribe(`/topic/room/${roomId}`, (message: IMessage) => {
                    const data = JSON.parse(message.body);
                    if (data.players) setPlayers(data.players);
                    if (data.type) setMessages((prev) => [...prev, data]);

                    if (data.type === 'START') {
                            setTimeout(() => {
                            router.push(`/game/yacht/${roomId}`); 
                        }, 1500);
                    }
                });

                // 입장 통보
                client.publish({
                    destination: '/app/chat/message',
                    body: JSON.stringify({
                        type: 'ENTER', roomId: roomId, sender: user.nickname,
                        message: `${user.nickname}님이 입장하셨습니다.`
                    })
                });
            },
            onDisconnect: () => {
                console.log("WebSocket Disconnected");
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('STOMP Error:', frame.headers['message']);
            }
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
                setIsConnected(false);
            }
        };
    }, [roomId, user]);

    const handleLeave = async () => {
        try {
            await roomApi.leave(roomId);
            router.push('/rooms');
        } catch (err: any) {
            alert("나가기 실패");
        }
    }

    const handleReady = async () => {
        try {
            await roomApi.toggleReady(roomId);
            const res = await roomApi.getRoomDetail(roomId);
            
            // 새로운 배열로 복사해서 상태 업데이트 (불변성 유지)
            setPlayers([...res.data.players]); 
        } catch (err: any) {
            alert("준비 실패");
        }
    };

    const handleStart = async () => {
        try { await roomApi.startGame(roomId); } 
        catch (err: any) { alert(err.response?.data?.message || "시작 실패"); }
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

    const isHost = players.find(p => p.nickname === user?.nickname)?.host;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col gap-6">
            <header className="max-w-6xl mx-auto w-full flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h1 className="text-2xl font-black text-blue-500 uppercase tracking-widest">{roomTitle || 'Lobby'}</h1>
                <button onClick={handleLeave} className="px-4 py-2 bg-slate-800 hover:text-red-400 rounded-lg text-xs font-bold">나가기</button>
            </header>

            <main className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        {[0, 1, 2, 3].map((idx) => {
                            const p = players[idx];
                            return (
                                <div key={idx} className={`h-44 rounded-3xl border-2 flex flex-col items-center justify-center ${p ? 'bg-slate-900 border-blue-500/30' : 'bg-slate-900/20 border-slate-800 border-dashed'}`}>
                                    {p ? (
                                        <>
                                            <div className="w-16 h-16 bg-slate-800 rounded-full mb-3 flex items-center justify-center text-2xl">👤</div>
                                            <div className="font-bold">MMR {p.mmr}</div>
                                            <span className="font-bold">{p.nickname} {p.host && "👑"}</span>
                                            <div className={`mt-2 px-4 py-1 rounded-full text-[10px] font-black ${p.ready ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                                                {(p.host || p.ready) ? 'READY' : 'WAITING'}
                                            </div>
                                        </>
                                    ) : <span className="text-slate-800 font-black italic">EMPTY</span>}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleReady} className="flex-1 py-5 bg-green-600 rounded-2xl font-black text-xl hover:bg-green-500">READY</button>
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
                                {canStart ? 'START GAME' : 'WAITING FOR PLAYERS'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[500px] overflow-hidden">
                    <div className="flex-1 p-5 overflow-y-auto space-y-4" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.type === 'TALK' ? (m.sender === user?.nickname ? 'items-end' : 'items-start') : 'items-center'}`}>
                                <div className={`px-4 py-2 rounded-2xl text-sm ${m.type === 'TALK' ? (m.sender === user?.nickname ? 'bg-blue-600' : 'bg-slate-800') : 'text-slate-500 text-xs'}`}>{m.message}</div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-950/50 flex gap-2">
                        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500" placeholder="채팅 입력..."/>
                        <button onClick={sendMessage} className="px-5 bg-blue-600 rounded-xl font-bold">전송</button>
                    </div>
                </div>
            </main>
        </div>
    );
}