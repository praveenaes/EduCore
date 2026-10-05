import { HomeworkSubmissionsResponseDTO } from '@/application/dto/homework/homeworkDtos';

export interface IGetHomeworkSubmissionsUseCase {
  execute(homeworkId: string, userId: string): Promise<HomeworkSubmissionsResponseDTO>;
}
