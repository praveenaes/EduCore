import { CreateNotificationDTO, NotificationResponseDTO } from '@/application/dto/notifications/notificationDtos';

export interface ICreateNotificationUseCase {
  execute(dto: CreateNotificationDTO): Promise<NotificationResponseDTO>;
}
