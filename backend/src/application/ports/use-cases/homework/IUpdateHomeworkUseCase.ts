import {
  UpdateHomeworkDTO,
  TeacherHomeworkItemDTO,
} from '@/application/dto/homework/homeworkDtos';

export interface IUpdateHomeworkUseCase {
  execute(dto: UpdateHomeworkDTO): Promise<TeacherHomeworkItemDTO>;
}
