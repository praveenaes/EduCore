import {
  SubjectAssignmentQueryDTO,
  SubjectAssignmentListResultDTO,
} from '../../../dto/subject-assignments/subjectAssignmentDtos';

export interface IGetSubjectAssignmentsUseCase {
  execute(query: SubjectAssignmentQueryDTO): Promise<SubjectAssignmentListResultDTO>;
}
