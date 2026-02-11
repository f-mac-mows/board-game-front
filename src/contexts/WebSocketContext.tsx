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

    /**
     * 🚩 최적화된 Subscribe
     * 의존성 배열을 비움([])으로써 컴포넌트 생명주기 동안 단 한 번만 생성됩니다.
     * 내부에서는 Ref를 통해 최신 소켓 상태를 안전하게 참조합니다.
     */
    const subscribe = useCallback((topic: string, callback: (payload: any) => void) => {
        if (!clientRef.current || !isConnectedRef.current) {
            console.warn("⚠️ 소켓이 아직 연결되지 않아 구독을 유보합니다:", topic);
            return () => {};
        }

        const subscription = clientRef.current.subscribe(topic, (message) => {
            try {
                const data = JSON.parse(message.body);
                callback(data);
            } catch (e) {
                console.error("❌ 소켓 메시지 파싱 에러:", e);
            }
        });

        return () => {
            // 이 로그가 찍힌다면 실제로 해당 컴포넌트가 언마운트되었거나, 
            // 의도적으로 구독을 해제한 경우입니다.
            console.log(`🚫 구독 해제 완료: ${topic}`);
            subscription.unsubscribe();
        };
    }, []); // 의존성 없음 -> 절대 변하지 않는 함수 참조 보장

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