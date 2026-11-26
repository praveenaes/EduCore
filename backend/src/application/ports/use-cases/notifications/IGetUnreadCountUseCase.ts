import { UnreadCountResponseDTO } from '@/application/dto/notifications/notificationDtos';

export interface IGetUnreadCountUseCase {
  execute(userId: string): Promise<UnreadCountResponseDTO>;
}
