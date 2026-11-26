export interface IMarkAllNotificationsAsReadUseCase {
  execute(userId: string): Promise<number>;
}
