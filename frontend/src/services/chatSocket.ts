import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../types/chat';

let socket: Socket | null = null;
let currentSocketToken: string | null = null;

export const connectChatSocket = (
  token: string,
  callbacks?: {
    onMessage?: (message: ChatMessage) => void;
    onTyping?: (data: { groupId: string; userId: string; isTyping: boolean }) => void;
    onGroupUpdated?: (data: any) => void;
    onMessagesCleared?: (data: { groupId: string }) => void;
  }
): Socket => {
  if (socket && socket.connected && currentSocketToken === token) {
    return socket;  // Reuses existing connection if already connected with this token
  }

  if (socket) {
    socket.disconnect(); // Disconnects any old stale socket
    socket = null;
  }

  currentSocketToken = token;

  const serverUrl =
    import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'));

  socket = io(serverUrl, {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  if (callbacks?.onMessage) {
    socket.on('chat:new_message', callbacks.onMessage);
  }

  if (callbacks?.onTyping) {
    socket.on('chat:typing', callbacks.onTyping);
  }

  if (callbacks?.onGroupUpdated) {
    socket.on('chat:group_updated', callbacks.onGroupUpdated);
    socket.on('chat:group_added', callbacks.onGroupUpdated);
    socket.on('chat:member_added', callbacks.onGroupUpdated);
    socket.on('chat:member_removed', callbacks.onGroupUpdated);
    socket.on('chat:group_removed', callbacks.onGroupUpdated);
  }

  if (callbacks?.onMessagesCleared) {
    socket.on('chat:messages_cleared', callbacks.onMessagesCleared);
  }

  return socket;
};
//The client sends the following event to the server:
export const joinChatGroup = (groupId: string): void => {
  if (socket && socket.connected) {
    socket.emit('chat:join', groupId);
  }
};
//
export const leaveChatGroup = (groupId: string): void => {
  if (socket && socket.connected) {
    socket.emit('chat:leave', groupId);
  }
};
//
export const sendChatTyping = (groupId: string, isTyping: boolean): void => {
  if (socket && socket.connected) {
    socket.emit('chat:typing', { groupId, isTyping });
  }
};

export const disconnectChatSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentSocketToken = null;
  }
};

export const getChatSocket = (): Socket | null => socket;