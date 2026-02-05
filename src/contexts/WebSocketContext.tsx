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
        // 연결이 필요 없는 경로거나 이미 연결된 경우 방지
        if (!shouldConnect) {
            if (stompClient.current) {
                console.log("🔌 소켓 연결이 필요 없는 경로입니다. 연결을 해제합니다.");
                stompClient.current.deactivate();
                stompClient.current = null;
                setIsConnected(false);
            }
            return;
        }

        if (stompClient.current?.connected) return;

        const socket = new SockJS(`https://api.walrung.com/ws-game`);
        const client = Stomp.over(socket);
        client.debug = () => {}; 
        
        client.connect({}, () => {
            console.log("🌐 게임 소켓 연결 성공:", pathname);
            setIsConnected(true);
            stompClient.current = client;
        });

        return () => {
            // 경로가 바뀌어서 shouldConnect가 false가 될 때 clean-up
            if (stompClient.current) {
                stompClient.current.deactivate();
                setIsConnected(false);
            }
        };
    }, [shouldConnect, pathname]); // 경로가 바뀔 때마다 체크

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