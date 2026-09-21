import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ISubjectAssignmentRepository } from '../../../domain/repositories/ISubjectAssignmentRepository';
import { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import { ITeacherRepository } from '../../../domain/repositories/ITeacherRepository';
import { IUpdateSubjectAssignmentUseCase } from '../../ports/use-cases/subject-assignments/IUpdateSubjectAssignmentUseCase';
import {
  UpdateSubjectAssignmentDTO,
  SubjectAssignmentResponseDTO,
} from '../../dto/subject-assignments/subjectAssignmentDtos';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class UpdateSubjectAssignment implements IUpdateSubjectAssignmentUseCase {
  constructor(
    @inject(TYPES.SubjectAssignmentRepository)
    private _assignmentRepo: ISubjectAssignmentRepository,
    @inject(TYPES.CourseRepository)
    private _courseRepo: ICourseRepository,
    @inject(TYPES.TeacherRepository)
    private _teacherRepo: ITeacherRepository
  ) {}

  async execute(
    id: string,
    dto: UpdateSubjectAssignmentDTO
  ): Promise<SubjectAssignmentResponseDTO> {
    const assignment = await this._assignmentRepo.findById(id);
    if (!assignment || assignment.isDeleted) {
      throw new NotFoundError(`Subject assignment with id "${id}" not found`);
    }

    const courseId = dto.courseId ?? assignment.courseId;
    const levelNumber =
      dto.levelNumber !== undefined ? Number(dto.levelNumber) : assignment.levelNumber;
    const subjectId = dto.subjectId ?? assignment.subjectId;
    let levelName = assignment.levelName;

    const isCourseOrLevelChanged =
      (dto.courseId !== undefined && dto.courseId !== assignment.courseId) ||
      (dto.levelNumber !== undefined && Number(dto.levelNumber) !== assignment.levelNumber);

    if (isCourseOrLevelChanged) {
      const course = await this._courseRepo.findById(courseId);
      if (!course || course.isDeleted) {
        throw new NotFoundError('Associated course not found');
      }

      const level = course.levels.find((l) => l.levelNumber === levelNumber);
      if (!level) {
        throw new ValidationError(
          `Level ${levelNumber} does not exist in course "${course.name}"`
        );
      }
      levelName = level.name;
    }

    const isScopeChanged =
      isCourseOrLevelChanged ||
      (dto.subjectId !== undefined && dto.subjectId !== assignment.subjectId);

    if (isScopeChanged) {
      const existing = await this._assignmentRepo.findByCourseLevelAndSubject(
        courseId,
        levelNumber,
        subjectId
      );
      if (existing && existing.id !== id) {
        throw new ConflictError(
          `This subject is already assigned to this course level`
        );
      }
    }

    if (dto.teacherId) {
      const teacher = await this._teacherRepo.findById(dto.teacherId);
      if (!teacher || teacher.isDeleted) {
        throw new NotFoundError('Selected teacher does not exist or has been deleted');
      }
    }

    assignment.updateDetails({
      courseId: dto.courseId,
      levelNumber: dto.levelNumber !== undefined ? Number(dto.levelNumber) : undefined,
      levelName,
      subjectId: dto.subjectId,
      ...('teacherId' in dto && { teacherId: dto.teacherId }),
    });

    await this._assignmentRepo.update(id, assignment);

    const updated = await this._assignmentRepo.findById(id);
    if (!updated) {
      throw new NotFoundError('Failed to update subject assignment');
    }

    return {
      id: updated.id!,
      courseId: updated.courseId,
      courseName: updated.courseName,
      courseCode: updated.courseCode,
      levelNumber: updated.levelNumber,
      levelName: updated.levelName,
      subjectId: updated.subjectId,
      subjectName: updated.subjectName,
      subjectCode: updated.subjectCode,
      teacherId: updated.teacherId,
      teacherName: updated.teacherName,
      teacherEmployeeId: updated.teacherEmployeeId,
      isDeleted: updated.isDeleted,
      createdAt: updated.createdAt?.toISOString(),
      updatedAt: updated.updatedAt?.toISOString(),
    };
  }
}
