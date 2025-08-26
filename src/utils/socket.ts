import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

const SOCKET_URL = Constants.expoConfig!.extra!.API_URL as string;

export interface ServerToClientEvents {
  newMessage: (msg: unknown) => void;
  messageDeleted: (payload: { messageId: string }) => void;
  messageEdited: (msg: unknown) => void;
  typingStatus: (payload: { userId: string; isTyping: boolean }) => void;
  presence: (payload: { userId: string; status: 'online' | 'offline' }) => void;
}

export interface ClientToServerEvents {
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  sendMessage: (
    payload: { propertyId: string; content: string },
    ack: (res: unknown) => void
  ) => void;
  deleteMessage: (
    payload: { propertyId: string; messageId: string },
    ack: (res: unknown) => void
  ) => void;
  editMessage: (
    payload: { propertyId: string; messageId: string; newContent: string },
    ack: (res: unknown) => void
  ) => void;
  typing: (payload: { propertyId: string; userId: string; isTyping: boolean }) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export function connectSocket(token: string) {

  if (!token) 
    return;
  socket.auth = { token };
  socket.connect();
}

export function disconnectSocket() {
  try {
    socket.disconnect();
    socket.auth = {};
  } catch (e) {
    // ignore
  }
}

export default socket;
