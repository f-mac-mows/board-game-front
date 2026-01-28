export enum MessageType {
    ENTER = 'ENTER',
    TALK = 'TALK',
    LEAVE = 'LEAVE',
    START = 'START',
}

export interface GameMessage {
    type: MessageType;
    roomId: number;
    sender: string;
    message: string;
    currentPlayers: number;
}