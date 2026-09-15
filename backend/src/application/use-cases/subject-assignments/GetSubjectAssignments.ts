import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ISubjectAssignmentRepository } from '../../../domain/repositories/ISubjectAssignmentRepository';
import { IGetSubjectAssignmentsUseCase } from '../../ports/use-cases/subject-assignments/IGetSubjectAssignmentsUseCase';
import {
  SubjectAssignmentQueryDTO,
  SubjectAssignmentListResultDTO,
  SubjectAssignmentResponseDTO,
} from '../../dto/subject-assignments/subjectAssignmentDtos';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class GetSubjectAssignments implements IGetSubjectAssignmentsUseCase {
  constructor(
    @inject(TYPES.SubjectAssignmentRepository)
    private _assignmentRepo: ISubjectAssignmentRepository
  ) {}

  async execute(query: SubjectAssignmentQueryDTO): Promise<SubjectAssignmentListResultDTO> {
    const page = query.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query.limit && query.limit > 0 ? Number(query.limit) : 10;

    const result = await this._assignmentRepo.findAll(
      {
        search: query.search?.trim(),
        courseId: query.courseId,
        levelNumber: query.levelNumber !== undefined ? Number(query.levelNumber) : undefined,
        subjectId: query.subjectId,
        teacherId: query.teacherId,
      },
      {
        page,
        limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
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

  async getById(id: string): Promise<SubjectAssignmentResponseDTO> {
    const assignment = await this._assignmentRepo.findById(id);
    if (!assignment || assignment.isDeleted) {
      throw new NotFoundError(`Subject assignment with id "${id}" not found`);
    }

    return {
      id: assignment.id!,
      courseId: assignment.courseId,
      courseName: assignment.courseName,
      courseCode: assignment.courseCode,
      levelNumber: assignment.levelNumber,
      levelName: assignment.levelName,
      subjectId: assignment.subjectId,
      subjectName: assignment.subjectName,
      subjectCode: assignment.subjectCode,
      teacherId: assignment.teacherId,
      teacherName: assignment.teacherName,
      teacherEmployeeId: assignment.teacherEmployeeId,
      isDeleted: assignment.isDeleted,
      createdAt: assignment.createdAt?.toISOString(),
      updatedAt: assignment.updatedAt?.toISOString(),
    };
  }
}
