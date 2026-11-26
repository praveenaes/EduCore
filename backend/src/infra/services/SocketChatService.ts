import { injectable } from 'inversify';
import { Server as SocketIOServer } from 'socket.io';
import { IChatSocketService } from '@/application/ports/services/IChatSocketService';
import { logger } from '@/infra/logger/logger';

@injectable()
export class SocketChatService implements IChatSocketService {
  private static _io: SocketIOServer | null = null;

  static setServer(io: SocketIOServer): void {
    SocketChatService._io = io;
  }

  sendMessageToGroup(groupId: string, event: string, payload: any): void {
    if (!SocketChatService._io) {
      logger.warn(`Socket.io server not initialized; cannot emit ${event} to group ${groupId}`);
      return;
    }
    SocketChatService._io.to(`chat:group:${groupId}`).emit(event, payload);
  }

  sendToUser(userId: string, event: string, payload: any): void {
    if (!SocketChatService._io) {
      logger.warn(`Socket.io server not initialized; cannot emit ${event} to user:${userId}`);
      return;
    }
    SocketChatService._io.to(`user:${userId}`).emit(event, payload);
  }
}