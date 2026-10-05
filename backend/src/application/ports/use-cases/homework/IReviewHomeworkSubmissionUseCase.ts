import { ReviewSubmissionDTO } from '@/application/dto/homework/homeworkDtos';

export interface IReviewHomeworkSubmissionUseCase {
  execute(dto: ReviewSubmissionDTO): Promise<void>;
}
