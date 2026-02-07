"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface WebSocketContextType {
    isConnected: boolean;
    subscribe: (topic: string, callback: (payload: any) => void) => () => void;
    publish: (destination: string, body: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const clientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // 소켓 연결이 필요한 경로인지 확인
    const shouldConnect = pathname.startsWith("/rooms") || pathname.startsWith("/game");

    useEffect(() => {
        // 1. 소켓이 필요 없는 경로라면 연결 해제
        if (!shouldConnect) {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // 2. 이미 클라이언트가 생성되어 있다면 새로 만들지 않음
        if (clientRef.current) return;

        // 3. Client 인스턴스 설정
        const client = new Client({
            // SockJS를 사용할 경우 webSocketFactory를 통해 전달
            webSocketFactory: () => new SockJS(`https://api.walrung.com/ws-game`),
            reconnectDelay: 5000, // 자동 재연결 딜레이 (5초)
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            setIsConnected(true);
        };

        client.onStompError = (frame) => {
            console.error("❌ Broker reported error: " + frame.headers["message"]);
            console.error("Additional details: " + frame.body);
        };

        client.onDisconnect = () => {
            setIsConnected(false);
        };

        client.activate();
        clientRef.current = client;

        // ✨ Cleanup 함수 추가
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };

    }, [shouldConnect]);

    const subscribe = (topic: string, callback: (payload: any) => void) => {
        if (!clientRef.current || !isConnected) return () => {};

        const subscription = clientRef.current.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });

        return () => subscription.unsubscribe();
    };

    const publish = (destination: string, body: any) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination,
                body: JSON.stringify(body),
            });
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