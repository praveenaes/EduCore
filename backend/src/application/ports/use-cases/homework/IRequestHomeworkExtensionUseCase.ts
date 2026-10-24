import { RequestHomeworkExtensionDTO } from '@/application/dto/homework/homeworkDtos';

export interface IRequestHomeworkExtensionUseCase {
  execute(dto: RequestHomeworkExtensionDTO): Promise<void>;
}
