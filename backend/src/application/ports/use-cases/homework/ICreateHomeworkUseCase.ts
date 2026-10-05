import {
  CreateHomeworkDTO,
  TeacherHomeworkItemDTO,
} from '@/application/dto/homework/homeworkDtos';

export interface ICreateHomeworkUseCase {
  execute(dto: CreateHomeworkDTO): Promise<TeacherHomeworkItemDTO>;
}
