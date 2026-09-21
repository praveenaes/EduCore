import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ISubjectAssignmentRepository } from '../../../domain/repositories/ISubjectAssignmentRepository';
import { IGetSubjectAssignmentsUseCase } from '../../ports/use-cases/subject-assignments/IGetSubjectAssignmentsUseCase';
import {
  SubjectAssignmentQueryDTO,
  SubjectAssignmentListResultDTO,
  SubjectAssignmentResponseDTO,
} from '../../dto/subject-assignments/subjectAssignmentDtos';

@injectable()
export class GetSubjectAssignments implements IGetSubjectAssignmentsUseCase {
  constructor(
    @inject(TYPES.SubjectAssignmentRepository)
    private _assignmentRepo: ISubjectAssignmentRepository
  ) {}

  async execute(query: SubjectAssignmentQueryDTO): Promise<SubjectAssignmentListResultDTO> {
    const {
      page = 1,
      limit = 10,
      search,
      courseId,
      levelNumber,
      subjectId,
      teacherId,
      sortBy,
      sortOrder,
    } = query;

    const result = await this._assignmentRepo.findAll(
      {
        search: search?.trim(),
        courseId,
        levelNumber,
        subjectId,
        teacherId,
      },
      {
        page,
        limit,
        sortBy,
        sortOrder,
      }
    );

    const assignments: SubjectAssignmentResponseDTO[] = result.assignments.map((a) => ({
      id: a.id!,
      courseId: a.courseId,
      courseName: a.courseName,
      courseCode: a.courseCode,
      levelNumber: a.levelNumber,
      levelName: a.levelName,
      subjectId: a.subjectId,
      subjectName: a.subjectName,
      subjectCode: a.subjectCode,
      teacherId: a.teacherId,
      teacherName: a.teacherName,
      teacherEmployeeId: a.teacherEmployeeId,
      isDeleted: a.isDeleted,
      createdAt: a.createdAt?.toISOString(),
      updatedAt: a.updatedAt?.toISOString(),
    }));

    return {
      assignments,
      total: result.total,
    };
  }
}
