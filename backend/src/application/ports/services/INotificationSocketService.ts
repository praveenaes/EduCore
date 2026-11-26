export interface INotificationSocketService {
  sendToUser(userId: string, event: string, payload: any): void;
  sendToUsers(userIds: string[], event: string, payload: any): void;
}
