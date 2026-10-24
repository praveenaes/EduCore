import { ReviewHomeworkExtensionDTO } from '@/application/dto/homework/homeworkDtos';

export interface IReviewHomeworkExtensionUseCase {
  execute(dto: ReviewHomeworkExtensionDTO): Promise<void>;
}
