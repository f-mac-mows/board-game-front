"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Stomp, CompatClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface WebSocketContextType {
    isConnected: boolean;
    subscribe: (topic: string, callback: (payload: any) => void) => () => void;
    publish: (destination: string, body: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const stompClient = useRef<CompatClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // 소켓 연결이 필요한 경로인지 확인
    const shouldConnect = pathname.startsWith("/rooms") || pathname.startsWith("/game");

    useEffect(() => {
        // 1. 소켓이 필요 없는 경로로 나갈 때만 해제
        if (!shouldConnect) {
            if (stompClient.current) {
                stompClient.current.deactivate();
                stompClient.current = null;
                setIsConnected(false);
            }
            return;
        }

        // 2. 이미 연결 중이라면 아무것도 하지 않음 (중요: pathname이 바뀌어도 유지)
        if (stompClient.current?.connected || stompClient.current?.active) {
            return;
        }

        // 3. 소켓 생성 및 연결
        const socket = new SockJS(`https://api.walrung.com/ws-game`);
        const client = Stomp.over(socket);
        client.debug = () => {}; 
        
        client.connect({}, () => {
            console.log("🌐 소켓 연결 성공");
            setIsConnected(true);
        });
        
        stompClient.current = client;

        // cleanup: 컴포넌트 언마운트 시에만 해제 (의존성에서 pathname 제거)
    }, [shouldConnect]); // pathname을 빼고 shouldConnect만 남깁니다.

    const subscribe = (topic: string, callback: (payload: any) => void) => {
        if (!stompClient.current || !isConnected) return () => {};
        const subscription = stompClient.current.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });
        return () => subscription.unsubscribe();
    };

    const publish = (destination: string, body: any) => {
        if (stompClient.current?.connected) {
            stompClient.current.publish({ destination, body: JSON.stringify(body) });
        }
    };

    return (
        <WebSocketContext.Provider value={{ isConnected, subscribe, publish }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) throw new Error("useWebSocket must be used within a WebSocketProvider");
    return context;
};