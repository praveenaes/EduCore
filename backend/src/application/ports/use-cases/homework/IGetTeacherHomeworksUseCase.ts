import {
  GetTeacherHomeworksDTO,
  TeacherHomeworkListResponseDTO,
} from '@/application/dto/homework/homeworkDtos';

export interface IGetTeacherHomeworksUseCase {
  execute(dto: GetTeacherHomeworksDTO): Promise<TeacherHomeworkListResponseDTO>;
}
