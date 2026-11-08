import { inject, injectable } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IAcademicYearRepository } from '@/domain/repositories/IAcademicYearRepository';
import { ICourseRepository } from '@/domain/repositories/ICourseRepository';
import { ISubjectAssignmentRepository } from '@/domain/repositories/ISubjectAssignmentRepository';
import { IUpdateAssessmentUseCase } from '@/application/ports/use-cases/assessments/IUpdateAssessmentUseCase';
import { UpdateAssessmentDTO, AssessmentResponseDTO } from '@/application/dto/assessments/assessmentDtos';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class UpdateAssessment implements IUpdateAssessmentUseCase {
  constructor(
    @inject(TYPES.AssessmentRepository) private _assessmentRepo: IAssessmentRepository,
    @inject(TYPES.AcademicYearRepository) private _academicYearRepo: IAcademicYearRepository,
    @inject(TYPES.AssessmentScheduleRepository) private _scheduleRepo: IAssessmentScheduleRepository,
    @inject(TYPES.CourseRepository) private _courseRepo: ICourseRepository,
    @inject(TYPES.SubjectAssignmentRepository) private _subjectAssignmentRepo: ISubjectAssignmentRepository
  ) {}

  async execute(id: string, dto: UpdateAssessmentDTO): Promise<AssessmentResponseDTO> {
    const assessment = await this._assessmentRepo.findById(id);
    if (!assessment || assessment.isDeleted) {
      throw new NotFoundError(`Assessment with id "${id}" not found`);
    }

    const academicYear = await this._academicYearRepo.findById(dto.academicYearId);
    if (!academicYear || academicYear.isDeleted) {
      throw new NotFoundError('Selected academic year not found');
    }

    const course = await this._courseRepo.findById(dto.courseId);
    if (!course || course.isDeleted) {
      throw new NotFoundError('Selected course not found');
    }

    const selectedLevel = course.levels.find((l) => l.levelNumber === dto.levelNumber);
    if (!selectedLevel) {
      throw new ValidationError(`Level ${dto.levelNumber} is invalid for course "${course.name}"`);
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid start or end date');
    }

    if (startDate > endDate) {
      throw new ValidationError('End date must be on or after start date');
    }

    const trimmedName = dto.name.trim();
    const existing = await this._assessmentRepo.findByName(
      trimmedName,
      dto.academicYearId,
      dto.courseId,
      dto.levelNumber
    );
    if (existing && existing.id !== id) {
      throw new ConflictError(
        `Assessment "${trimmedName}" already exists for course "${course.name}" (${selectedLevel.name}) in this academic year`
      );
    }

    assessment.updateDetails({
      name: trimmedName,
      academicYearId: dto.academicYearId,
      courseId: dto.courseId,
      levelNumber: dto.levelNumber,
      startDate,
      endDate,
    });

    if (dto.status === 'COMPLETED') {
      const assigned = await this._subjectAssignmentRepo.findAll(
        { courseId: dto.courseId, levelNumber: dto.levelNumber },
        { page: 1, limit: 100 }
      );

      if (assigned.assignments.length === 0) {
        throw new ValidationError(
          'Cannot mark assessment as Completed: No subjects are assigned to this course and level.'
        );
      }

      const linkedSchedules = await this._scheduleRepo.findByAssessmentId(id);
      const activeSchedules = linkedSchedules.filter((s) => !s.isDeleted);

      if (activeSchedules.length === 0) {
        throw new ValidationError(
          'Not Even Scheduled: Cannot mark assessment as Completed because no subjects have been scheduled yet.'
        );
      }

      const scheduledSubjectIds = new Set(activeSchedules.map((s) => s.subjectId));
      const unscheduledSubjects = assigned.assignments.filter(
        (sub) => !scheduledSubjectIds.has(sub.subjectId)
      );

      if (unscheduledSubjects.length > 0) {
        const names = unscheduledSubjects.map((s) => s.subjectName).join(', ');
        throw new ValidationError(
          `Cannot mark assessment as Completed: Every single subject must be scheduled first. Unscheduled subject(s): ${names}.`
        );
      }

      for (const s of activeSchedules) {
        if (!s.isCompleted) {
          s.markAsCompleted();
          await this._scheduleRepo.update(s.id!, s);
        }
      }
    }

    if (dto.status !== undefined) {
      assessment.updateStatus(dto.status);
    }

    await this._assessmentRepo.update(id, assessment);

    const updated = await this._assessmentRepo.findById(id);

    return {
      id: updated!.id!,
      name: updated!.name,
      academicYearId: updated!.academicYearId,
      academicYearName: updated!.academicYearName,
      academicYearCode: updated!.academicYearCode,
      courseId: updated!.courseId,
      courseName: updated!.courseName,
      courseCode: updated!.courseCode,
      levelNumber: updated!.levelNumber,
      levelName: updated!.levelName,
      startDate: updated!.startDate,
      endDate: updated!.endDate,
      status: updated!.status,
      isDeleted: updated!.isDeleted,
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
    };
  }
}
