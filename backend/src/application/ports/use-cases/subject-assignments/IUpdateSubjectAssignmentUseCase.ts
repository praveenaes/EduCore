import { UpdateSubjectAssignmentDTO, SubjectAssignmentResponseDTO } from '../../../dto/subject-assignments/subjectAssignmentDtos';

export interface IUpdateSubjectAssignmentUseCase {
  execute(id: string, dto: UpdateSubjectAssignmentDTO): Promise<SubjectAssignmentResponseDTO>;
}
