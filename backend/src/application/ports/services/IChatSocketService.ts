export interface IChatSocketService {
  sendMessageToGroup(groupId: string, event: string, payload: any): void;
  sendToUser(userId: string, event: string, payload: any): void;
}