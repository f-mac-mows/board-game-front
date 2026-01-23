import { Message } from "@stomp/stompjs";

export enum MessageType {
    ENTER = 'ENTER',
    TALK = 'TALK',
    LEAVE = 'LEAVE'
}

export interface GameMessage {
    type: Message;
    roomId: number;
    sender: string;
    message: string;
    currentPlayers: number;
}