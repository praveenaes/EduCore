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

    let newLevelName: string | undefined;

    if (dto.levelNumber !== undefined && dto.levelNumber !== assignment.levelNumber) {
      const course = await this._courseRepo.findById(assignment.courseId);
      if (!course || course.isDeleted) {
        throw new NotFoundError('Associated course not found');
      }

      const level = course.levels.find((l) => l.levelNumber === Number(dto.levelNumber));
      if (!level) {
        throw new ValidationError(`Level ${dto.levelNumber} does not exist in course "${course.name}"`);
      }
      newLevelName = level.name;

      const existing = await this._assignmentRepo.findByCourseLevelAndSubject(
        assignment.courseId,
        Number(dto.levelNumber),
        assignment.subjectId
      );
      if (existing && existing.id !== id) {
        throw new ConflictError(
          `This subject is already assigned to ${level.name} of "${course.name}"`
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
      levelNumber: dto.levelNumber !== undefined ? Number(dto.levelNumber) : undefined,
      levelName: newLevelName,
      teacherId: dto.teacherId !== undefined ? dto.teacherId : assignment.teacherId,
    });

    const updated = await this._assignmentRepo.update(id, assignment);
    if (!updated) {
      throw new NotFoundError('Failed to update subject assignment');
    }

    const reloaded = await this._assignmentRepo.findById(id);
    const finalItem = reloaded || updated;

    return {
      id: finalItem.id!,
      courseId: finalItem.courseId,
      courseName: finalItem.courseName,
      courseCode: finalItem.courseCode,
      levelNumber: finalItem.levelNumber,
      levelName: finalItem.levelName,
      subjectId: finalItem.subjectId,
      subjectName: finalItem.subjectName,
      subjectCode: finalItem.subjectCode,
      teacherId: finalItem.teacherId,
      teacherName: finalItem.teacherName,
      teacherEmployeeId: finalItem.teacherEmployeeId,
      isDeleted: finalItem.isDeleted,
      createdAt: finalItem.createdAt?.toISOString(),
      updatedAt: finalItem.updatedAt?.toISOString(),
    };
  }
}
