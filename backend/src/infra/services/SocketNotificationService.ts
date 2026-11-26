import { injectable } from 'inversify';
import { Server as SocketIOServer } from 'socket.io';
import { INotificationSocketService } from '@/application/ports/services/INotificationSocketService';
import { logger } from '@/infra/logger/logger';

//SocketNotificationService implementation
@injectable()
export class SocketNotificationService implements INotificationSocketService {
  private static _io: SocketIOServer | null = null;

  static setServer(io: SocketIOServer): void {
    SocketNotificationService._io = io;
  }

  sendToUser(userId: string, event: string, payload: any): void {
    if (!SocketNotificationService._io) {
      logger.warn(`Socket.io server not initialized; cannot emit ${event} to user:${userId}`);
      return;
    }
    SocketNotificationService._io.to(`user:${userId}`).emit(event, payload);//actual notification is sent.
  }

  sendToUsers(userIds: string[], event: string, payload: any): void {
    if (!SocketNotificationService._io || !userIds.length) return;
    userIds.forEach((uid) => {
      SocketNotificationService._io!.to(`user:${uid}`).emit(event, payload);
    });
  }
}


//making the socket server instance accessible inside SocketNotificationService.
//Instead of passing io every time you want to send a notification, you store it in a static property
//Now every method in this class can access the same Socket.IO server instance.
//Because when the class is initially loaded, the Socket.IO server might not have been created yet.

//So you initialize it with null and assign the actual server later.

//Create Socket.IO instance->Call setServer()->Store the instance->Socket server initialized