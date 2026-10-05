import { SubmitHomeworkDTO } from '@/application/dto/homework/homeworkDtos';

export interface ISubmitHomeworkUseCase {
  execute(dto: SubmitHomeworkDTO): Promise<void>;
}
