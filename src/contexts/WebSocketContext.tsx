"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface WebSocketContextType {
    isConnected: boolean;
    subscribe: (topic: string, callback: (payload: any) => void) => () => void;
    publish: (destination: string, body: any) => void;
    sendMessage: (destination: string, body: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const clientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // 🚩 핵심: isConnected의 최신 상태를 Ref로 관리하여 
    // subscribe 함수가 리렌더링(생성/소멸)되는 것을 방지합니다.
    const isConnectedRef = useRef(false);
    
    useEffect(() => {
        isConnectedRef.current = isConnected;
    }, [isConnected]);

    const shouldConnect = pathname.startsWith("/rooms") || pathname.startsWith("/game");

    useEffect(() => {
        if (!shouldConnect) {
            if (clientRef.current) {
                console.log("🔌 소켓 연결 종료 (경로 이탈)");
                clientRef.current.deactivate();
                clientRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // 이미 클라이언트가 존재하면 중복 생성 방지
        if (clientRef.current) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`https://api.walrung.com/ws-game`),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            // 필요 시 디버깅용 (개발 단계에서만 사용)
            // debug: (str) => console.log(str),
        });

        client.onConnect = () => {
            console.log("✅ 소켓 연결 성공");
            setIsConnected(true);
        };

        client.onDisconnect = () => {
            console.log("❌ 소켓 연결 끊김");
            setIsConnected(false);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [shouldConnect]);

    // WebSocketProvider.tsx 수정
    const subscribe = useCallback((topic: string, callback: (payload: any) => void) => {
        // 🚩 핵심: 연결되지 않았을 때 호출되면, 나중에 연결되었을 때 다시 실행되도록 유도해야 함
        // 하지만 가장 단순하고 확실한 방법은 호출부(컴포넌트)에서 isConnected일 때만 subscribe하게 만드는 것입니다.
        
        if (!clientRef.current || !isConnectedRef.current) {
            return () => {}; // 연결 전에는 아무것도 안 함
        }

        const subscription = clientRef.current.subscribe(topic, (message) => {
            try {
                const data = JSON.parse(message.body);
                callback(data);
            } catch (e) {
                console.error("❌ 파싱 에러:", e);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const publish = useCallback((destination: string, body: any) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination,
                body: JSON.stringify(body),
            });
        }
    }, []);

    const sendMessage = useCallback((destination: string, body: any) => {
        publish(destination, body);
    }, [publish]);

    return (
        <WebSocketContext.Provider value={{ isConnected, subscribe, publish, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) throw new Error("useWebSocket must be used within a WebSocketProvider");
    return context;
};